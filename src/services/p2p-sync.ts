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
 *   setSnapshotProvider(() => ({
 *     [MIRROR_KEYS.APP_SETTINGS]: currentAppSettings(),
 *     ...
 *   }))
 *
 *   // 业务模块每次写入本地存储后：
 *   mirrorToYjs(MIRROR_KEYS.APP_SETTINGS, currentAppSettings())
 */

import * as Y from 'yjs'
import { reactive, readonly, type DeepReadonly } from 'vue'
import { showToast } from '@/utils/toast'

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
const DEFAULT_SIGNALING_URL = 'wss://elyxira-signal.yokuminto-107.workers.dev/ws'

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
  joinedAt: number
}

export type PairingStatus = 'idle' | 'hosting' | 'joining' | 'paired' | 'error'

export interface SyncState {
  status: PairingStatus
  pin: string | null
  deviceName: string
  deviceId: string
  peers: PairingPeer[]
  lastSync: number
  signalingUrl: string
  error: string | null
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
        console.warn(`[p2p-sync] callback for ${key} failed:`, e)
      }
    }
  } finally {
    _isApplyingRemote = prev
  }
}

// ─── Yjs 文档操作（被业务模块调用）────────────────────────**

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
  _isApplyingRemote = false
}

async function _bootstrap(pin: string, isHost: boolean): Promise<void> {
  if (_doc) {
    await _teardownProvider()
  }
  _state.status = isHost ? 'hosting' : 'joining'
  _state.pin = pin
  _state.error = null
  _state.peers = []
  _activePin = pin

  const doc = new Y.Doc()
  _doc = doc

  // 1. 先启动 y-indexeddb 持久化，等首次同步完成（加载上次该 PIN 的离线状态）
  const persistence = new (await import('y-indexeddb')).IndexeddbPersistence(pin, doc)
  _persistence = persistence
  try {
    await new Promise<void>((resolve) => {
      const onSynced = () => {
        persistence.off('synced', onSynced)
        resolve()
      }
      persistence.on('synced', onSynced)
      // 兜底：5 秒后强制 resolved，避免 IndexedDB 不响应死等
      setTimeout(() => {
        resolve()
      }, 5000)
    })
  } catch (e) {
    console.warn('[p2p-sync] y-indexeddb init failed, continuing:', e)
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
          console.warn('[p2p-sync] one snapshot provider failed:', e)
        }
      }
      doc.transact(() => {
        for (const [k, v] of Object.entries(snapshot)) {
          if (v === undefined) continue
          const yMap = doc.getMap(k as SyncKeyType)
          if (v && typeof v === 'object') {
            if (Array.isArray(v)) {
              if (yMap.get('__array_length__') !== v.length) {
                // 长度变了或初次，重新铺
                yMap.clear()
                yMap.set('__array_length__', v.length)
                for (let i = 0; i < v.length; i++) {
                  yMap.set(`i${i}`, v[i])
                }
              }
            } else {
              const obj = v as Record<string, unknown>
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
      console.warn('[p2p-sync] snapshot injection failed:', e)
    }
  }

  // 3. 启动 y-webrtc provider，借助信令服务器配对
  // y-webrtc 内置 password 从 PIN 派生密钥，AES-GCM 加密全部信令 + P2P 载荷
  try {
    const WebrtcModule: typeof import('y-webrtc') = await import('y-webrtc')
    const signaling = [_state.signalingUrl]
    _provider = new WebrtcModule.WebrtcProvider(pin, doc, {
      signaling,
      password: pin, // 信令回路加密；与远端共享 PIN
      maxConns: 1, // 仅 2-peer
      filterBcConns: true, // 同浏览器跨标签页用 BroadcastChannel，不走 WebRTC
    })

    provider_bindEvents(_provider)
  } catch (e) {
    const msg = (e as Error).message || String(e)
    _state.status = 'error'
    _state.error = `信令服务器连接失败：${msg}`
    showToast('P2P 连接失败，请检查信令服务器地址', 'error', 5000)
    await _teardownProvider()
    return
  }

  // 4. 注入本设备 awareness（让对端感知设备名）
  try {
    _provider.awareness.setLocalStateField('device', {
      id: _state.deviceId,
      name: _state.deviceName,
    })
  } catch (e) {
    console.warn('[p2p-sync] awareness setLocalStateField failed:', e)
  }

  // 5. 监听文档变化（绑在所有顶层 Y.Map）
  try {
    Object.values(MIRROR_KEYS).forEach((k) => _attachYjsObservers(k))
  } catch (e) {
    console.warn('[p2p-sync] observer attach failed:', e)
  }
}

function provider_bindEvents(p: import('y-webrtc').WebrtcProvider): void {
  const onStatus = (e: unknown) => {
    if (_provider !== p) return
    const peerCount = 'peers' in p ? (p.peers as unknown[]).length : 0
    _state.peers = _readPeers(p)
    if (peerCount > 0) {
      _state.status = 'paired'
      _state.lastSync = Date.now()
    }
  }
  const onPeers = (e: unknown) => {
    if (_provider !== p) return
    _state.peers = _readPeers(p)
    if (_state.peers.length > 0) {
      _state.status = 'paired'
      _state.lastSync = Date.now()
    } else if (_state.status === 'paired') {
      // 对端断开
      _state.status = 'hosting'
      showToast('对端已断开', 'warning', 3000)
    }
  }
  p.on('status', onStatus)
  p.on('peers', onPeers)
  const onUpdateAwareness = () => {
    if (_provider !== p) return
    _state.peers = _readPeers(p)
  }
  try {
    p.awareness.on('change', onUpdateAwareness)
  } catch (e) {
    console.warn('[p2p-sync] awareness.on change failed:', e)
  }
}

function _readPeers(p: import('y-webrtc').WebrtcProvider): PairingPeer[] {
  const peers: PairingPeer[] = []
  try {
    const states = p.awareness.getStates()
    const localClientId = (p as unknown as { room: { doc: { clientID: number } } }).room?.doc?.clientID
    for (const [cid, s] of states.entries()) {
      if (cid === localClientId) continue
      const state = s as { device?: { name?: string; id?: string } }
      const name = state?.device?.name || '未知设备'
      peers.push({ id: cid, name, joinedAt: Date.now() })
    }
  } catch (e) {
    console.warn('[p2p-sync] readPeers failed:', e)
  }
  return peers
}

// ─── 对外的高层操作 ─────────────────────────────────────

export async function startHosting(): Promise<string> {
  if (_doc) {
    await _teardownProvider()
  }
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
  if (_doc) {
    await _teardownProvider()
  }
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
}

// ─── Composable 入口 ─────────────────────────────────────

export function useSync(): {
  state: DeepReadonly<SyncState>
  startHosting: typeof startHosting
  joinPairing: typeof joinPairing
  disconnect: typeof disconnect
  setSignalingUrl: typeof setSignalingUrl
  setDeviceName: typeof setDeviceName
} {
  return {
    state: readonly(_state),
    startHosting,
    joinPairing,
    disconnect,
    setSignalingUrl,
    setDeviceName,
  }
}