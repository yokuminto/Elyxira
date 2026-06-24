/**
 * breakStorage.ts — IndexedDB 存储层
 * 
 * 替换 localStorage（5MB 上限），使用 IndexedDB（浏览器配额 ~50% 磁盘空间）。
 * 首次加载自动迁移旧 localStorage 数据。
 * 内存缓存读取，写入同步更新缓存 + 异步落盘。
 */

const DB_NAME = 'elyxira_break'
const DB_VERSION = 1
const NOTES_KEY = 'notes'
const TAGS_KEY = 'tags'

// ─── 内存缓存 ──────────────────────────────────────────────────

let _notes: Record<string, string> | null = null
let _tags: Record<string, Record<string, string>> | null = null

// ─── IndexedDB ────────────────────────────────────────────────

function _openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(NOTES_KEY)) db.createObjectStore(NOTES_KEY)
      if (!db.objectStoreNames.contains(TAGS_KEY)) db.createObjectStore(TAGS_KEY)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function _dbGet(store: string, key: string): Promise<any> {
  return _openDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly')
    const req = tx.objectStore(store).get(key)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  }))
}

function _dbSet(store: string, key: string, value: any): Promise<void> {
  return _openDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite')
    tx.objectStore(store).put(value, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  }))
}

// ─── 旧数据迁移 ────────────────────────────────────────────────

async function _migrateFromLocalStorage(): Promise<void> {
  const notesRaw = localStorage.getItem('break_notes')
  const tagsRaw = localStorage.getItem('break_tags')

  // 旧单 key 格式
  if (notesRaw) {
    try { _notes = JSON.parse(notesRaw) } catch { /* skip */ }
  }
  if (tagsRaw) {
    try { _tags = JSON.parse(tagsRaw) } catch { /* skip */ }
  }

  // 旧分片格式（break_notes_0, break_notes_1, ...）
  for (let i = 0; ; i++) {
    const nk = `break_notes_${i}`
    const chunk = localStorage.getItem(nk)
    if (chunk === null) break
    try {
      if (!_notes) _notes = {}
      Object.assign(_notes, JSON.parse(chunk))
    } catch { /* skip */ }
  }
  for (let i = 0; ; i++) {
    const tk = `break_tags_${i}`
    const chunk = localStorage.getItem(tk)
    if (chunk === null) break
    try {
      if (!_tags) _tags = {}
      Object.assign(_tags, JSON.parse(chunk))
    } catch { /* skip */ }
  }

  if (_notes) {
    await _dbSet(NOTES_KEY, 'data', _notes)
  }
  if (_tags) {
    await _dbSet(TAGS_KEY, 'data', _tags)
  }

  // 清理旧数据
  const toRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && (k.startsWith('break_notes') || k.startsWith('break_tags'))) {
      toRemove.push(k)
    }
  }
  toRemove.forEach(k => localStorage.removeItem(k))
}

async function _loadFromDB(): Promise<void> {
  const notes = await _dbGet(NOTES_KEY, 'data')
  _notes = notes || {}
  const tags = await _dbGet(TAGS_KEY, 'data')
  _tags = tags || {}
}

// ─── 初始化 ────────────────────────────────────────────────────

let _ready: Promise<void> | null = null

export function initStorage(): Promise<void> {
  if (_ready) return _ready
  _ready = (async () => {
    await _migrateFromLocalStorage()
    if (!_notes) await _loadFromDB()
  })()
  return _ready
}

// ─── 公开 API ─────────────────────────────────────────────────

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
