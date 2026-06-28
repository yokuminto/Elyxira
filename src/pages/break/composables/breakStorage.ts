/**
 * breakStorage.ts — IndexedDB 存储层
 * 
 * 替换 localStorage（5MB 上限），使用 IndexedDB（浏览器配额 ~50% 磁盘空间）。
 * 首次加载自动迁移旧 localStorage 数据。
 * 内存缓存读取，写入同步更新缓存 + 异步落盘。
 */

const DB_NAME = 'elyxira_break'
const DB_VERSION = 2
const NOTES_KEY = 'notes'
const TAGS_KEY = 'tags'
const STATS_KEY = 'stats'

// ─── 类型 ──────────────────────────────────────────────────────

export interface AnswerRecord {
  time: number     // Date.now()
  duration: number // 做题耗时（秒）
  correct: boolean
}

export interface QuestionStats {
  answerCount: number
  correctCount: number
  /** 最近 5 次作答记录，最新在前 */
  recentAnswers: AnswerRecord[]
}

export type BreakStats = Record<string, QuestionStats>

// ─── 内存缓存 ──────────────────────────────────────────────────

let _notes: Record<string, string> | null = null
let _tags: Record<string, Record<string, string>> | null = null
let _stats: BreakStats | null = null

// ─── IndexedDB（自动升迁）───────────────────────────────────────

/** 运行时版本号；首次缺失 store 时自动 +1 */
let _dbVersion = DB_VERSION
/** 当前打开的数据库实例 */
let _db: IDBDatabase | null = null

function _openDB(version?: number): Promise<IDBDatabase> {
  const ver = version ?? _dbVersion
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, ver)
    req.onupgradeneeded = () => {
      const db = req.result
      for (const store of [NOTES_KEY, TAGS_KEY, STATS_KEY]) {
        if (!db.objectStoreNames.contains(store)) db.createObjectStore(store)
      }
    }
    req.onsuccess = () => {
      _db = req.result
      _dbVersion = ver
      resolve(_db)
    }
    req.onerror = () => reject(req.error)
    req.onblocked = () => {
      // 旧连接未关闭时触发；尝试强制关旧连接后重试
      _db?.close()
      _db = null
    }
  })
}

/** 保活获取数据库实例；遇到缺失 store 时自动升级重连 */
async function _ensureDB(): Promise<IDBDatabase> {
  if (_db) return _db

  const db = await _openDB()

  // 检查所有需要的 store 是否都存在
  const missing = [NOTES_KEY, TAGS_KEY, STATS_KEY].filter(s => !db.objectStoreNames.contains(s))
  if (missing.length === 0) return db

  // 缺失 store → 关闭旧库，版本 +1，重新打开
  db.close()
  _db = null
  _dbVersion += 1
  return _openDB(_dbVersion)
}

function _dbGet(store: string, key: string): Promise<unknown> {
  return _ensureDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly')
    const req = tx.objectStore(store).get(key)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  }))
}

function _dbSet(store: string, key: string, value: unknown): Promise<void> {
  return _ensureDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite')
    tx.objectStore(store).put(value, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  }))
}

// ─── 旧数据迁移 ────────────────────────────────────────────────

async function _migrateFromLocalStorage(): Promise<void> {
  // ── notes ──
  const notesRaw = localStorage.getItem('break_notes')
  const tagsRaw = localStorage.getItem('break_tags')

  // 旧单 key 格式
  if (notesRaw) {
    try { _notes = JSON.parse(notesRaw) } catch (e) { console.warn('[breakStorage] failed to parse notes from localStorage:', e) }
  }
  if (tagsRaw) {
    try { _tags = JSON.parse(tagsRaw) } catch (e) { console.warn('[breakStorage] failed to parse tags from localStorage:', e) }
  }

  // 旧分片格式（break_notes_0, break_notes_1, ...）
  for (let i = 0; ; i++) {
    const nk = `break_notes_${i}`
    const chunk = localStorage.getItem(nk)
    if (chunk === null) break
    try {
      if (!_notes) _notes = {}
      Object.assign(_notes, JSON.parse(chunk))
    } catch (e) { console.warn('[breakStorage] failed to parse notes chunk:', e) }
  }
  for (let i = 0; ; i++) {
    const tk = `break_tags_${i}`
    const chunk = localStorage.getItem(tk)
    if (chunk === null) break
    try {
      if (!_tags) _tags = {}
      Object.assign(_tags, JSON.parse(chunk))
    } catch (e) { console.warn('[breakStorage] failed to parse tags chunk:', e) }
  }

  if (_notes) {
    try { await _dbSet(NOTES_KEY, 'data', _notes) } catch (e) { console.warn('[breakStorage] migration notes write failed:', e) }
  }
  if (_tags) {
    try { await _dbSet(TAGS_KEY, 'data', _tags) } catch (e) { console.warn('[breakStorage] migration tags write failed:', e) }
  }

  // ── stats 迁移（保留 aggregate 数据，recentAnswers 从零开始）──
  const statsRaw = localStorage.getItem('break_stats')
  if (statsRaw) {
    try {
      const oldStats: Record<string, { answerCount: number; correctCount: number; lastAnswerTime?: number }> = JSON.parse(statsRaw)
      _stats = {}
      for (const [qid, old] of Object.entries(oldStats)) {
        _stats[qid] = {
          answerCount: old.answerCount ?? 0,
          correctCount: old.correctCount ?? 0,
          recentAnswers: [],
        }
      }
      await _dbSet(STATS_KEY, 'data', _stats)
    } catch (e) { console.warn('[breakStorage] stats migration failed:', e) }
  }

  // 清理旧数据
  const toRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && (k.startsWith('break_notes') || k.startsWith('break_tags') || k === 'break_stats')) {
      toRemove.push(k)
    }
  }
  toRemove.forEach(k => localStorage.removeItem(k))
}

async function _loadFromDB(): Promise<void> {
  const notes = await _dbGet(NOTES_KEY, 'data') as Record<string, string> | undefined
  _notes = notes || {}
  const tags = await _dbGet(TAGS_KEY, 'data') as Record<string, Record<string, string>> | undefined
  _tags = tags || {}
  const stats = await _dbGet(STATS_KEY, 'data') as BreakStats | undefined
  _stats = stats || {}
}

// ─── 初始化 ────────────────────────────────────────────────────

let _ready: Promise<void> | null = null

export function initStorage(): Promise<void> {
  if (_ready) return _ready
  _ready = (async () => {
    await _migrateFromLocalStorage()
    if (!_notes || !_stats) await _loadFromDB()
  })()
  return _ready
}

// ─── 公开 API — Notes ─────────────────────────────────────────

export function getNotes(): Record<string, string> {
  return _notes ? { ..._notes } : {}
}

export async function setNotes(notes: Record<string, string>): Promise<void> {
  await initStorage()
  _notes = { ...notes }
  await _dbSet(NOTES_KEY, 'data', _notes)
}

export async function setNote(id: string, content: string): Promise<void> {
  await initStorage()
  _notes![id] = content
  await _dbSet(NOTES_KEY, 'data', _notes)
}

export async function mergeNotes(incoming: Record<string, string>): Promise<void> {
  await initStorage()
  Object.assign(_notes!, incoming)
  await _dbSet(NOTES_KEY, 'data', _notes)
}

// ─── 公开 API — Tags ──────────────────────────────────────────

export function getTags(): Record<string, Record<string, string>> {
  if (!_tags) return {}
  return JSON.parse(JSON.stringify(_tags))
}

export async function setTags(tags: Record<string, Record<string, string>>): Promise<void> {
  await initStorage()
  _tags = JSON.parse(JSON.stringify(tags))
  await _dbSet(TAGS_KEY, 'data', _tags)
}

export async function mergeTags(incoming: Record<string, Record<string, string>>): Promise<void> {
  await initStorage()
  if (!_tags) _tags = {}
  Object.assign(_tags, incoming)
  await _dbSet(TAGS_KEY, 'data', _tags)
}

// ─── 公开 API — Stats ─────────────────────────────────────────

/** 获取全部答题统计 */
export function getStats(): BreakStats {
  return _stats ? { ..._stats } : {}
}

/** 记录一次作答（更新缓存 + 异步落盘） */
export async function recordAnswer(questionId: string, correct: boolean, duration: number): Promise<void> {
  await initStorage()
  if (!_stats) _stats = {}

  const entry = _stats[questionId]
  const record: AnswerRecord = { time: Date.now(), duration, correct }

  if (entry) {
    entry.answerCount += 1
    if (correct) entry.correctCount += 1
    entry.recentAnswers.unshift(record)
    if (entry.recentAnswers.length > 5) {
      entry.recentAnswers = entry.recentAnswers.slice(0, 5)
    }
  } else {
    _stats[questionId] = {
      answerCount: 1,
      correctCount: correct ? 1 : 0,
      recentAnswers: [record],
    }
  }

  // 异步落盘，fire-and-forget
  _dbSet(STATS_KEY, 'data', _stats).catch(e => console.warn('[breakStorage] stats persist failed:', e))
}

/** 批量设置统计（导入用），异步落盘 */
export async function setStats(stats: BreakStats): Promise<void> {
  await initStorage()
  _stats = { ...stats }
  await _dbSet(STATS_KEY, 'data', _stats)
}

/** 合并统计（导入用），异步落盘 */
export async function mergeStats(incoming: BreakStats): Promise<void> {
  await initStorage()
  if (!_stats) _stats = {}
  Object.assign(_stats, incoming)
  await _dbSet(STATS_KEY, 'data', _stats)
}
