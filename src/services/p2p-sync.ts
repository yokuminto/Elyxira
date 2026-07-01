/**
 * p2p-sync.ts — 设备间 P2P 同步核心服务
 *
 * 架构：
 * - Yjs CRDT 文档：自动合并冲突，相同 key 用 last-writer-wins（基于 clientID 比较）
 * - y-webrtc 通过自定义信令服务器传输（每对配对一个 PIN，房间名 = PIN）
 * - y-indexeddb 离线持久化（每次配对一个 IndexedDB）
 * - y-webrtc 内置 password 参数从 PIN 派生 → 信令服务器和 P2P 通道内容 AES-GCM 加密
 *
 * 设计原则：
 * - 未配对时所有 mirrorToYjs / subscribe 调用可安全 skip，零侵入业务代码
 * - 远端 update 触发的 callback **必须同步**完成本地写入；异步工作 fire-and-forget
 * - 回环防护：远端 update 期间 _isApplyingRemote=true，mirrorToYjs skip
 * - 配对完成后业务模块（configService / breakStorage）注入初始快照入 doc
 *
 * 业务模块集成方式：
 *   // 业务模块 initStorage 时：
 *   subscribe(MIRROR_KEYS.APP_SETTINGS, (val) => {
 *     // 同步写本地缓存/存储；异步 fire-and-forget
 *     applyAppSettingsFromRemote(val)
 *   })
 *   addSnapshotProvider(() => ({
 *     [MIRROR_KEYS.APP_SETTINGS]: currentAppSettings(),
 *     ...
 *   }))
 *
 *   // 业务模块每次写入本地存储后：
 *   mirrorToYjs(MIRROR_KEYS.APP_SETTINGS, currentAppSettings())
 */

import * as Y from 'yjs'
import { reactive, readonly, type DeepReadonly } from 'vue'

// ─── 常量 ────────────────────────────────────────────────────

/** Yjs 文档中各数据命名空间的 key。业务模块按此约定镜像 */
export const MIRROR_KEYS = {
  APP_SETTINGS: 'app_settings',
  QUIZ_STATS: 'quizStats',
  QUIZ_CONFIG: 'quizConfig',
  BREAK_NOTES: 'breakNotes',
  BREAK_TAGS: 'breakTags',
  BREAK_STATS: 'breakStats',
} as const

export type SyncKeyType = (typeof MIRROR_KEYS)[keyof typeof MIRROR_KEYS]

/** 信令 URL 默认值（部署后用户改写为自有域名） */
const DEFAULT_SIGNALING_URL = 'wss://elyxira-signal.yokuminto-107.workers.dev'

const DEVICE_ID_KEY = 'elyxira_device_id'
const DEVICE_NAME_KEY = 'elyxira_device_name'
const SIGNALING_URL_KEY = 'elyxira_signaling_url'

// ─── 类型 ────────────────────────────────────────────────────

export interface QRPayload {
  v: 1
  /** 房间 PIN（6 位数字字符串）*/
  pin: string
  /** 发送方设备自命名 */
  name: string
}

export interface PairingPeer {
  /** Yjs awareness clientID */
  id: number
  /** 对端设备名 */
  name: string
  /** 最后感知时间戳 */
  lastSeenAt: number
}

export type PairingStatus = 'idle' | 'hosting' | 'joining' | 'paired' | 'error'

type PairingRole = 'host' | 'join'

/** lastEvent：用于 UI 层消费事件并显示 toast，避免 p2p-sync 模块直接调 useToast（Vue 上下文问题） */
export interface SyncEvent {
  type: 'error' | 'warning' | 'info' | 'success'
  message: string
  ts: number
}

export interface SyncState {
  status: PairingStatus
  pin: string | null
  deviceName: string
  deviceId: string
  peers: PairingPeer[]
  lastSync: number
  signalingUrl: string
  error: string | null
  /** 最近一次需要 UI 展示的事件（toast / 通知），UI 层消费后置 null */
  lastEvent: SyncEvent | null
}

export type SnapshotProvider = () => Partial<Record<SyncKeyType, unknown>>
type ChangeCallback = (value: unknown) => void
type ChangeUnsub = () => void

// ─── 模块级状态 ──────────────────────────────────────────────

/** Vue 响应式同步状态，UI 订阅 */
const _state = reactive<SyncState>({
  status: 'idle',
  pin: null,
  deviceName: '',
  deviceId: '',
  peers: [],
  lastSync: 0,
  signalingUrl: DEFAULT_SIGNALING_URL,
  error: null,
  lastEvent: null,
})

let _doc: Y.Doc | null = null
let _provider: import('y-webrtc').WebrtcProvider | null = null
let _persistence: import('y-indexeddb').IndexeddbPersistence | null = null

/** 远端 apply 中的 flag：阻断 mirrorToYjs 防止回环 */
let _isApplyingRemote = false

/** 业务模块注册：每个 key 一组 change callback */
const _changeCallbacks: Map<string, Set<ChangeCallback>> = new Map()

/** 业务模块注册：host 启动时一次性塞入本地当前快照 */
const _snapshotProviders: Set<SnapshotProvider> = new Set()

/** 当前 provider 对应的 PIN（断开时 = null） */
let _activePin: string | null = null

/** 当前配对角色（host / join），用于对端断开时正确降级 */
let _activeRole: PairingRole | null = null

/** provider 事件解绑函数（_teardownProvider 调） */
let _providerUnbind: (() => void) | null = null

/** y-indexeddb synced 兜底 timeout ID */
let _indexedDbTimeoutId: ReturnType<typeof setTimeout> | null = null

/** 并发防护：正在进行的 bootstrap promise（同一时间只允许一个配对操作） */
let _pendingPromise: Promise<void> | null = null

// 初始化 reactive 状态的设备身份
_state.deviceId = _getDeviceId()
_state.deviceName = _getDeviceName()
_state.signalingUrl = _getSignalingUrl()

// ─── 设备身份工具 ────────────────────────────────────────────

function _getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    // crypto.randomUUID 安全随机；fallback 兼容旧浏览器
    id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : 'dev-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

function _getDeviceName(): string {
  let name = localStorage.getItem(DEVICE_NAME_KEY)
  if (!name) {
    name = 'Elyxira' + Math.floor(Math.random() * 9000 + 1000).toString()
    localStorage.setItem(DEVICE_NAME_KEY, name)
  }
  return name
}

export function setDeviceName(name: string): void {
  const trimmed = name.trim() || '未命名设备'
  localStorage.setItem(DEVICE_NAME_KEY, trimmed)
  _state.deviceName = trimmed
}

function _getSignalingUrl(): string {
  return localStorage.getItem(SIGNALING_URL_KEY) || DEFAULT_SIGNALING_URL
}

export function setSignalingUrl(url: string): void {
  const trimmed = url.trim() || DEFAULT_SIGNALING_URL
  localStorage.setItem(SIGNALING_URL_KEY, trimmed)
  _state.signalingUrl = trimmed
}

// ─── 内部通知（替代直接调用 showToast，避免 Vue 上下文问题）───

function _notifyEvent(type: SyncEvent['type'], message: string): void {
  _state.lastEvent = { type, message, ts: Date.now() }
}

// ─── PIN 生成 + QR 编解码 ──────────────────────────────────

export function generatePairingPin(): string {
  // 6 位数字，避开易混 0、1（提高扫码认出率）
  // 字符集合 [2-9]，6 位 = 8^6 ≈ 26 万组合
  const DIGITS = '23456789'
  let pin = ''
  const rand = new Uint8Array(6)
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    crypto.getRandomValues(rand)
  } else {
    for (let i = 0; i < 6; i++) rand[i] = Math.floor(Math.random() * 256)
  }
  for (let i = 0; i < 6; i++) {
    pin += DIGITS[rand[i] % DIGITS.length]
  }
  return pin
}

export function encodeQRPayload(p: QRPayload): string {
  return JSON.stringify(p)
}

export function parseQRPayload(raw: string): QRPayload {
  let obj: unknown
  try {
    obj = JSON.parse(raw)
  } catch (e) {
    throw new Error('二维码内容无法解析')
  }
  if (!obj || typeof obj !== 'object') throw new Error('二维码格式错误')
  const o = obj as Record<string, unknown>
  if (o.v !== 1 || typeof o.pin !== 'string' || typeof o.name !== 'string') {
    throw new Error('二维码内容不兼容')
  }
  return { v: 1, pin: o.pin, name: o.name }
}

// ─── 业务模块注册接口 ─────────────────────────────────────

/**
 * 业务模块注册：当远端过来对某 key 的更新，同步执行 callback。
 * callback 必须**同步**完成本地写入；异步工作 fire-and-forget。
 * 回调返回的写入动作会触发本模块自己再 mirrorToYjs → 被 _isApplyingRemote 阻断。
 */
export function subscribe(key: SyncKeyType, cb: ChangeCallback): ChangeUnsub {
  let set = _changeCallbacks.get(key)
  if (!set) {
    set = new Set()
    _changeCallbacks.set(key, set)
  }
  set.add(cb)
  return () => {
    const s = _changeCallbacks.get(key)
    if (s) s.delete(cb)
  }
}

/**
 * 业务模块注入"当前本地数据"快照获取器。host/join 启动时会调它，
 * 将本地最新数据写入 Yjs 文档（CRDT 与远端合并）。
 * 多模块可各注册一次；返回 unsubscribe 函数。
 */
export function addSnapshotProvider(fn: SnapshotProvider): () => void {
  _snapshotProviders.add(fn)
  return () => _snapshotProviders.delete(fn)
}

// ─── 触发远端回调（同步执行）──────────────────────────────

function _triggerChangeCallbacks(key: string, value: unknown): void {
  const cbs = _changeCallbacks.get(key)
  if (!cbs || cbs.size === 0) return
  const prev = _isApplyingRemote
  _isApplyingRemote = true
  try {
    for (const cb of cbs) {
      try {
        cb(value)
      } catch (e) {
        console.error(`[p2p-sync] callback for ${key} failed:`, e)
      }
    }
  } finally {
    _isApplyingRemote = prev
  }
}

// ─── Yjs 文档操作（被业务模块调用）────────────────────────

/**
 * 本地写入后调用，把当前值镜像入 Yjs 文档。
 * 配对未启动 OR 远端 apply 进行中时静默 skip。
 */
export function mirrorToYjs(key: SyncKeyType, value: unknown): void {
  if (!_doc || _isApplyingRemote) return
  const yMap = _doc.getMap(key)
  _doc.transact(() => {
    yMap.clear()
    if (value && typeof value === 'object') {
      // 对象/数组按 key 镜像（每个 field 单独 CRDT，更细粒度合并）
      if (Array.isArray(value)) {
        yMap.set('__array_length__', value.length)
        for (let i = 0; i < value.length; i++) {
          yMap.set(`i${i}`, value[i])
        }
      } else {
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
          yMap.set(k, v)
        }
      }
    } else if (value === undefined) {
      yMap.delete('__value__')
    } else {
      // 原始类型，包一个 __value__ 字段
      yMap.set('__value__', value)
    }
  })
}

// ─── 订阅单个 Y.Map 变化 → 触发本地 callbacks ─────────────

function _attachYjsObservers(key: SyncKeyType): void {
  if (!_doc) return
  const yMap = _doc.getMap(key)
  const handler = () => {
    // 把 Y.Map 还原成普通对象
    const obj = _yMapToObject(yMap)
    _triggerChangeCallbacks(key, obj)
  }
  yMap.observe(handler)
}

function _yMapToObject(yMap: Y.Map<unknown>): unknown {
  if (yMap.size === 0) return {}
  // 约定：原始类型用 __value__，对象用顶层键，数组用 i$N + __array_length__
  if (yMap.has('__value__')) {
    return yMap.get('__value__')
  }
  if (yMap.has('__array_length__')) {
    const len = yMap.get('__array_length__') as number
    const arr: unknown[] = []
    for (let i = 0; i < len; i++) {
      arr.push(yMap.get(`i${i}`))
    }
    return arr
  }
  const obj: Record<string, unknown> = {}
  for (const [k, v] of yMap.entries()) {
    obj[k] = v
  }
  return obj
}

// ─── 关闭旧 doc、启动新的 doc ────────────────────────────

async function _teardownProvider(): Promise<void> {
  // 清除 IndexedDB 兜底 timeout
  if (_indexedDbTimeoutId !== null) {
    clearTimeout(_indexedDbTimeoutId)
    _indexedDbTimeoutId = null
  }
  // 解绑 provider 事件监听器
  if (_providerUnbind) {
    try {
      _providerUnbind()
    } catch (e) {
      console.warn('[p2p-sync] provider event unbind error:', e)
    }
    _providerUnbind = null
  }
  try {
    if (_provider) {
      _provider.destroy()
    }
  } catch (e) {
    console.warn('[p2p-sync] provider.destroy error:', e)
  }
  try {
    if (_persistence) {
      _persistence.destroy()
    }
  } catch (e) {
    console.warn('[p2p-sync] persistence.destroy error:', e)
  }
  if (_doc) {
    _doc.destroy()
  }
  _provider = null
  _persistence = null
  _doc = null
  _activePin = null
  _activeRole = null
  _isApplyingRemote = false
}

/**
 * 判断快照对象是否为空（无实际键，或全为 undefined）。
 * 用于防止未加载完成的模块用空快照清除 y-indexeddb 已有数据。
 */
function _isSnapshotEmpty(v: unknown): boolean {
  if (v === undefined || v === null) return true
  if (typeof v === 'object') {
    if (Array.isArray(v)) return v.length === 0
    return Object.keys(v as Record<string, unknown>).length === 0
  }
  return false
}

async function _bootstrap(pin: string, isHost: boolean): Promise<void> {
  // 并发防护：如果有正在进行的配对操作，先等它完成
  if (_pendingPromise) {
    try {
      await _pendingPromise
    } catch {
      // 前一个操作失败不影响当前
    }
  }
  if (_doc) {
    await _teardownProvider()
  }

  const role: PairingRole = isHost ? 'host' : 'join'
  // 将本次 bootstrap 包装为 _pendingPromise 防并发
  _pendingPromise = _doBootstrap(pin, role)
  try {
    await _pendingPromise
  } finally {
    _pendingPromise = null
  }
}

async function _doBootstrap(pin: string, role: PairingRole): Promise<void> {
  _state.status = role === 'host' ? 'hosting' : 'joining'
  _state.pin = pin
  _state.error = null
  _state.peers = []
  _state.lastSync = 0
  _state.lastEvent = null
  _activePin = pin
  _activeRole = role

  const doc = new Y.Doc()
  _doc = doc

  // 1. 先启动 y-indexeddb 持久化，等首次同步完成（加载上次该 PIN 的离线状态）
  const persistence = new (await import('y-indexeddb')).IndexeddbPersistence(pin, doc)
  _persistence = persistence
  try {
    await new Promise<void>((resolve) => {
      const onSynced = () => {
        persistence.off('synced', onSynced)
        if (_indexedDbTimeoutId !== null) {
          clearTimeout(_indexedDbTimeoutId)
          _indexedDbTimeoutId = null
        }
        resolve()
      }
      persistence.on('synced', onSynced)
      // 兜底：5 秒后强制 resolved，避免 IndexedDB 不响应死等
      _indexedDbTimeoutId = setTimeout(() => {
        _indexedDbTimeoutId = null
        resolve()
      }, 5000)
    })
  } catch (e) {
    console.error('[p2p-sync] y-indexeddb init failed, continuing:', e)
  }

  // 2. 业务模块注入本地最新快照（与离线 doc + 远端将合并）
  if (_snapshotProviders.size > 0) {
    try {
      // 合并多个 provider 的输出
      const snapshot: Record<string, unknown> = {}
      for (const fn of _snapshotProviders) {
        try {
          const partial = fn()
          Object.assign(snapshot, partial)
        } catch (e) {
          console.error('[p2p-sync] one snapshot provider failed:', e)
        }
      }
      doc.transact(() => {
        for (const [k, v] of Object.entries(snapshot)) {
          if (v === undefined) continue
          const yMap = doc.getMap(k as SyncKeyType)
          if (v && typeof v === 'object') {
            if (Array.isArray(v)) {
              if (yMap.get('__array_length__') != null && yMap.get('__array_length__') !== v.length) {
                yMap.clear()
                yMap.set('__array_length__', v.length)
                for (let i = 0; i < v.length; i++) {
                  yMap.set(`i${i}`, v[i])
                }
              } else if (yMap.get('__array_length__') == null) {
                // yMap 中无此 key → 新数据，直接写入
                yMap.set('__array_length__', v.length)
                for (let i = 0; i < v.length; i++) {
                  yMap.set(`i${i}`, v[i])
                }
              }
              // else: 长度相同 → 保持 y-indexeddb 已有数据（CRDT 合并）
            } else {
              // ponytail: 空快照不覆盖 y-indexeddb 已有数据，防未加载完成的模块清除历史
              const obj = v as Record<string, unknown>
              if (_isSnapshotEmpty(obj) && yMap.size > 0) {
                // 快照为空但 yMap 已有数据（来自 y-indexeddb）→ 跳过
                continue
              }
              yMap.clear()
              for (const [kk, vv] of Object.entries(obj)) {
                yMap.set(kk, vv)
              }
            }
          } else if (v === undefined) {
            // skip
          } else {
            yMap.set('__value__', v)
          }
        }
      })
    } catch (e) {
      console.error('[p2p-sync] snapshot injection failed:', e)
    }
  }

  // 3. 监听文档变化（绑在所有顶层 Y.Map）—— 必须在 provider 连接之前，避免漏收远端首批数据
  try {
    Object.values(MIRROR_KEYS).forEach((k) => _attachYjsObservers(k))
  } catch (e) {
    console.error('[p2p-sync] observer attach failed:', e)
  }

  // 4. 启动 y-webrtc provider，借助信令服务器配对
  // y-webrtc 内置 password 从 PIN 派生密钥，AES-GCM 加密全部信令 + P2P 载荷
  try {
    const WebrtcModule: typeof import('y-webrtc') = await import('y-webrtc')
    // y-webrtc v10 不会自动把房间名拼到 URL 上，需手动构造 /ws/{PIN} 路径
    const baseUrl = _state.signalingUrl.replace(/\/$/, '')
    const wsUrl = baseUrl.endsWith('/ws') ? `${baseUrl}/${pin}` : `${baseUrl}/ws/${pin}`
    const signaling = [wsUrl]
    _provider = new WebrtcModule.WebrtcProvider(pin, doc, {
      signaling,
      password: pin, // 信令回路加密；与远端共享 PIN
      maxConns: 1, // 仅 2-peer
      filterBcConns: true, // 同浏览器跨标签页用 BroadcastChannel，不走 WebRTC
    })

    _providerUnbind = provider_bindEvents(_provider)
  } catch (e) {
    const msg = (e as Error).message || String(e)
    _state.status = 'error'
    _state.error = `信令服务器连接失败：${msg}`
    _notifyEvent('error', 'P2P 连接失败，请检查信令服务器地址')
    await _teardownProvider()
    return
  }

  // 5. 注入本设备 awareness（让对端感知设备名）
  try {
    _provider!.awareness.setLocalStateField('device', {
      id: _state.deviceId,
      name: _state.deviceName,
    })
  } catch (e) {
    console.warn('[p2p-sync] awareness setLocalStateField failed:', e)
  }
}

function provider_bindEvents(p: import('y-webrtc').WebrtcProvider): () => void {
  const onStatus = (_e: unknown) => {
    if (_provider !== p) return
    _state.peers = _readPeers(p)
    if (_state.peers.length > 0) {
      _state.status = 'paired'
      _state.lastSync = Date.now()
      _notifyEvent('success', '配对成功')
    }
  }
  const onPeers = (_e: unknown) => {
    if (_provider !== p) return
    // peers 事件触发时 awareness 可能还没传播过来，用事件 payload 判断
    const evt = _e as { added?: unknown[]; removed?: unknown[]; webrtcPeers?: unknown[]; bcPeers?: unknown[] }
    const totalConnected = (evt?.webrtcPeers?.length ?? 0) + (evt?.bcPeers?.length ?? 0)
    _state.peers = _readPeers(p)
    const peerCount = totalConnected > 0 ? totalConnected : _state.peers.length
    if (peerCount > 0) {
      _state.status = 'paired'
      _state.lastSync = Date.now()
      _notifyEvent('success', '配对成功')
    } else if (_state.status === 'paired') {
      // 对端断开：根据本机角色正确降级
      if (_activeRole === 'join') {
        _state.status = 'idle'
      } else {
        _state.status = 'hosting'
      }
      _notifyEvent('warning', '对端已断开')
    }
  }
  p.on('status', onStatus)
  p.on('peers', onPeers)
  const onUpdateAwareness = () => {
    if (_provider !== p) return
    _state.peers = _readPeers(p)
    // awareness 到达后如果发现 peers 但 status 还不是 paired → 补设
    if (_state.peers.length > 0 && _state.status !== 'paired') {
      _state.status = 'paired'
      _state.lastSync = Date.now()
      _notifyEvent('success', '配对成功')
    }
  }
  try {
    p.awareness.on('change', onUpdateAwareness)
  } catch (e) {
    console.warn('[p2p-sync] awareness.on change failed:', e)
  }

  // 返回 cleanup 函数，供 _teardownProvider 调用
  return () => {
    p.off('status', onStatus)
    p.off('peers', onPeers)
    try {
      p.awareness.off('change', onUpdateAwareness)
    } catch {
      // awareness.off 可能不支持，忽略
    }
  }
}

function _readPeers(p: import('y-webrtc').WebrtcProvider): PairingPeer[] {
  const peers: PairingPeer[] = []
  try {
    const states = p.awareness.getStates()
    // 使用 public API awareness.clientID 替代内部 p.room.doc.clientID
    const localClientId = p.awareness.clientID
    for (const [cid, s] of states.entries()) {
      if (cid === localClientId) continue
      const state = s as { device?: { name?: string; id?: string } }
      const name = state?.device?.name || '未知设备'
      peers.push({ id: cid, name, lastSeenAt: Date.now() })
    }
  } catch (e) {
    console.warn('[p2p-sync] readPeers failed:', e)
  }
  return peers
}

// ─── 对外的高层操作 ─────────────────────────────────────

export async function startHosting(): Promise<string> {
  const pin = generatePairingPin()
  await _bootstrap(pin, true)
  if (_state.status === 'error') {
    throw new Error(_state.error || '配对启动失败')
  }
  // 返回 QR payload（供 UI 渲染二维码）
  const payload: QRPayload = { v: 1, pin, name: _state.deviceName }
  return encodeQRPayload(payload)
}

export async function joinPairing(qrData: string): Promise<void> {
  const payload = parseQRPayload(qrData)
  await _bootstrap(payload.pin, false)
  if (_state.status === 'error') {
    throw new Error(_state.error || '加入配对失败')
  }
}

export async function disconnect(): Promise<void> {
  await _teardownProvider()
  _state.status = 'idle'
  _state.pin = null
  _state.peers = []
  _state.error = null
  _state.lastSync = 0
  _state.lastEvent = null
}

// ─── 从对端导入数据 ─────────────────────────────────────

/**
 * 从 Yjs 文档中读取每个 MIRROR_KEY 的当前值，逐个触发业务模块的 callback。
 * 业务模块的 merge 逻辑负责"对端有就覆盖，本地有就保留"的合并策略。
 *
 * @param onProgress 进度回调 (0-100)
 */
export async function importFromPeer(onProgress?: (percent: number) => void): Promise<void> {
  if (!_doc) {
    _notifyEvent('error', '未配对，无法导入')
    throw new Error('未配对')
  }

  const keys = Object.values(MIRROR_KEYS)
  const total = keys.length

  _notifyEvent('info', '正在从对端导入数据…')

  for (let i = 0; i < total; i++) {
    const key = keys[i] as SyncKeyType
    if (!_doc) break
    const yMap = _doc.getMap(key)
    const val = _yMapToObject(yMap)
    // 把 doc 中的值推回业务模块（触发 subscribe 回调）
    _triggerChangeCallbacks(key, val)
    onProgress?.(Math.round(((i + 1) / total) * 100))
    // 每个 key 之间让出微任务，避免 UI 卡顿
    await new Promise<void>((r) => setTimeout(r, 50))
  }

  _notifyEvent('success', '导入完成')
}

// ─── Composable 入口 ─────────────────────────────────────

export function useSync(): {
  state: DeepReadonly<SyncState>
  startHosting: typeof startHosting
  joinPairing: typeof joinPairing
  disconnect: typeof disconnect
  importFromPeer: typeof importFromPeer
  setSignalingUrl: typeof setSignalingUrl
  setDeviceName: typeof setDeviceName
} {
  return {
    state: readonly(_state),
    startHosting,
    joinPairing,
    disconnect,
    importFromPeer,
    setSignalingUrl,
    setDeviceName,
  }
}
