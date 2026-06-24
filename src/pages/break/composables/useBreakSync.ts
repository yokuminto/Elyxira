/**
 * useBreakSync.ts — 绯想击破 GitHub 同步 Composable
 *
 * 职责：笔记/标签的 pull / push / 队列管理
 * 存储：localStorage.break_repo（仓库配置）、localStorage.break_push_queue（待推送队列）
 * GitHub 路径约定：break-data/notes/{questionId}.md  /  break-data/tags/{questionId}.json
 */

import { reactive, readonly } from 'vue'
import { showToast } from '@/utils/toast'
import type { GithubConfig } from '@/services/config-service'
import { getNotes, setNotes, getTags, setTags, mergeNotes, mergeTags } from './breakStorage'

// ─── 仓库配置接口 ─────────────────────────────────────────────

export interface BreakRepoConfig {
  mode: 'default' | 'custom'
  owner: string
  repo: string
  branch: string
  token: string
}

const DEFAULT_REPO: BreakRepoConfig = {
  mode: 'default',
  owner: 'elyxira',
  repo: 'elyxira-data',
  branch: 'main',
  token: '',
}

const REPO_KEY = 'break_repo'
const PUSH_QUEUE_KEY = 'break_push_queue'
const BASE_PATH = 'break-data'

// ─── 模块级状态 ───────────────────────────────────────────────

let _isPushing = false

// ─── Composable 入口 ─────────────────────────────────────────

export function useBreakSync() {
  const state = reactive({
    lastPullTime: 0,
    isPulling: false,
    isPushing: false,
    pushQueue: [] as string[],
    pullError: null as string | null,
    pushError: null as string | null,
  })

  // ═══════════════════════════════════════════════════════════
  // 仓库配置读写
  // ═══════════════════════════════════════════════════════════

  function getRepoConfig(): BreakRepoConfig {
    try {
      const raw = localStorage.getItem(REPO_KEY)
      if (!raw) return { ...DEFAULT_REPO }
      return { ...DEFAULT_REPO, ...JSON.parse(raw) }
    } catch {
      return { ...DEFAULT_REPO }
    }
  }

  function saveRepoConfig(config: Partial<BreakRepoConfig>): void {
    const current = getRepoConfig()
    const merged = { ...current, ...config }
    localStorage.setItem(REPO_KEY, JSON.stringify(merged))
  }

  function hasRepoConfigured(): boolean {
    const cfg = getRepoConfig()
    return !!(cfg.owner && cfg.repo)
  }

  // ═══════════════════════════════════════════════════════════
  // 通用 GitHub API 请求
  // ═══════════════════════════════════════════════════════════

  async function _githubGet(path: string, cfg: BreakRepoConfig): Promise<{ content: string; sha: string } | null> {
    const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}?ref=${cfg.branch}`
    const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' }
    if (cfg.token) headers['Authorization'] = `token ${cfg.token}`
    const res = await fetch(url, { headers })
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`GitHub GET ${path}: ${res.status}`)
    const data = await res.json()
    if (data.type !== 'file') return null
    return { content: atob(data.content), sha: data.sha }
  }

  /**
   * 批量推送：使用 Git Data API 一次性提交所有文件（5 次 API 请求，与文件数无关）：
   * 1. GET 分支最新 commit SHA
   * 2. GET 该 commit 的 tree SHA
   * 3. POST 创建新 tree（base_tree + 全部文件 inline content）
   * 4. POST 创建 commit
   * 5. PATCH 更新分支引用
   */
  async function _githubBatchPush(
    files: Array<{ path: string; content: string }>,
    message: string,
    cfg: BreakRepoConfig,
  ): Promise<void> {
    if (files.length === 0) return

    const apiBase = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}`
    const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' }
    if (cfg.token) headers['Authorization'] = `token ${cfg.token}`

    // 1. 获取分支最新 commit
    const refRes = await fetch(`${apiBase}/git/ref/heads/${cfg.branch}`, { headers })
    if (!refRes.ok) {
      const err = await refRes.json().catch(() => ({}))
      throw new Error(`获取分支引用失败 (${refRes.status}): ${err.message || ''}`)
    }
    const refData = await refRes.json()
    const parentSha: string = refData.object.sha

    // 2. 获取 commit → tree SHA
    const commitRes = await fetch(`${apiBase}/git/commits/${parentSha}`, { headers })
    if (!commitRes.ok) throw new Error(`获取 commit 失败: ${commitRes.status}`)
    const commitData = await commitRes.json()
    const baseTreeSha: string = commitData.tree.sha

    // 3. 创建新 tree（base_tree 保留已有文件，tree entries 覆盖/新增）
    const treeEntries = files.map(f => ({
      path: f.path,
      mode: '100644' as const,
      type: 'blob' as const,
      content: f.content,
    }))

    const treeRes = await fetch(`${apiBase}/git/trees`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ base_tree: baseTreeSha, tree: treeEntries }),
    })
    if (!treeRes.ok) {
      const err = await treeRes.json().catch(() => ({}))
      throw new Error(`创建 tree 失败 (${treeRes.status}): ${err.message || ''}`)
    }
    const newTree = await treeRes.json()

    // 4. 创建 commit
    const newCommitRes = await fetch(`${apiBase}/git/commits`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message,
        tree: newTree.sha,
        parents: [parentSha],
      }),
    })
    if (!newCommitRes.ok) {
      const err = await newCommitRes.json().catch(() => ({}))
      throw new Error(`创建 commit 失败 (${newCommitRes.status}): ${err.message || ''}`)
    }
    const newCommit = await newCommitRes.json()

    // 5. 更新分支引用
    const updateRefRes = await fetch(`${apiBase}/git/refs/heads/${cfg.branch}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ sha: newCommit.sha, force: false }),
    })
    if (!updateRefRes.ok) {
      const err = await updateRefRes.json().catch(() => ({}))
      throw new Error(`更新分支引用失败 (${updateRefRes.status}): ${err.message || ''}`)
    }
  }

  // ═══════════════════════════════════════════════════════════
  // Pull：从 GitHub 拉取笔记和标签
  // ═══════════════════════════════════════════════════════════

  async function _pullNotes(cfg: BreakRepoConfig): Promise<number> {
    const notesDir = `${BASE_PATH}/notes`
    const listUrl = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${notesDir}?ref=${cfg.branch}`
    const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' }
    if (cfg.token) headers['Authorization'] = `token ${cfg.token}`

    const res = await fetch(listUrl, { headers })
    if (res.status === 404) return 0 // 目录不存在
    if (!res.ok) throw new Error(`列出 notes 目录失败: ${res.status}`)

    const files: Array<{ name: string; download_url: string }> = await res.json()
    if (!Array.isArray(files)) return 0

    const mdFiles = files.filter(f => f.name.endsWith('.md'))
    const storage = getNotes()
    let pulled = 0

    for (const f of mdFiles) {
      const qid = f.name.replace('.md', '')
      // 本地已有笔记则跳过（不覆盖本地编辑）
      if (storage[qid]) continue
      try {
        const contentRes = await fetch(f.download_url)
        if (!contentRes.ok) continue
        storage[qid] = await contentRes.text()
        pulled++
      } catch { /* skip individual file errors */ }
    }

    if (pulled > 0) {
      await setNotes(storage)
    }
    return pulled
  }

  async function _pullTags(cfg: BreakRepoConfig): Promise<number> {
    const tagsDir = `${BASE_PATH}/tags`
    const listUrl = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${tagsDir}?ref=${cfg.branch}`
    const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' }
    if (cfg.token) headers['Authorization'] = `token ${cfg.token}`

    const res = await fetch(listUrl, { headers })
    if (res.status === 404) return 0
    if (!res.ok) throw new Error(`列出 tags 目录失败: ${res.status}`)

    const files: Array<{ name: string; download_url: string }> = await res.json()
    if (!Array.isArray(files)) return 0

    const jsonFiles = files.filter(f => f.name.endsWith('.json'))
    const storage = getTags()
    let pulled = 0

    for (const f of jsonFiles) {
      const qid = f.name.replace('.json', '')
      if (storage[qid]) continue
      try {
        const contentRes = await fetch(f.download_url)
        if (!contentRes.ok) continue
        storage[qid] = JSON.parse(await contentRes.text())
        pulled++
      } catch { /* skip */ }
    }

    if (pulled > 0) {
      await setTags(storage)
    }
    return pulled
  }

  /** 启动时拉取远程笔记/标签（仅补充本地缺失的） */
  async function initSync(): Promise<void> {
    const cfg = getRepoConfig()
    if (!cfg.owner || !cfg.repo) return

    state.isPulling = true
    state.pullError = null
    try {
      const [notesCount, tagsCount] = await Promise.all([
        _pullNotes(cfg),
        _pullTags(cfg),
      ])
      state.lastPullTime = Date.now()
      const total = notesCount + tagsCount
      if (total > 0) {
        console.log(`[BreakSync] 已从远程拉取 ${notesCount} 笔记 + ${tagsCount} 标签`)
      }
    } catch (e) {
      state.pullError = (e as Error).message
      console.warn('[BreakSync] initSync 失败:', e)
    } finally {
      state.isPulling = false
    }
  }

  /** 手动拉取（强制刷新） */
  async function manualPull(): Promise<number> {
    const cfg = getRepoConfig()
    if (!cfg.owner || !cfg.repo) {
      showToast('未配置仓库信息', 'error')
      return 0
    }

    state.isPulling = true
    state.pullError = null
    try {
      // 手动拉取：清除本地标记，覆盖已有数据
      const notesStorage = getNotes()
      const tagsStorage = getTags()

      const notesDir = `${BASE_PATH}/notes`
      const listUrl = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${notesDir}?ref=${cfg.branch}`
      const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' }
      if (cfg.token) headers['Authorization'] = `token ${cfg.token}`

      const res = await fetch(listUrl, { headers })
      if (res.status === 404) {
        showToast('远程仓库中无 notes 目录', 'warning')
        return 0
      }
      if (!res.ok) throw new Error(`列出 notes 失败: ${res.status}`)

      const files: Array<{ name: string; download_url: string }> = await res.json()
      if (!Array.isArray(files)) { showToast('远程仓库为空', 'info'); return 0 }

      let pulled = 0
      const mdFiles = files.filter(f => f.name.endsWith('.md'))
      for (const f of mdFiles) {
        const qid = f.name.replace('.md', '')
        try {
          const contentRes = await fetch(f.download_url)
          if (!contentRes.ok) continue
          notesStorage[qid] = await contentRes.text()
          pulled++
        } catch { /* skip */ }
      }

      // Also pull tags
      try {
        const tagsDir = `${BASE_PATH}/tags`
        const tagRes = await fetch(
          `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${tagsDir}?ref=${cfg.branch}`,
          { headers },
        )
        if (tagRes.ok) {
          const tagFiles: Array<{ name: string; download_url: string }> = await tagRes.json()
          if (Array.isArray(tagFiles)) {
            for (const f of tagFiles.filter(f => f.name.endsWith('.json'))) {
              try {
                const tc = await fetch(f.download_url)
                if (tc.ok) { tagsStorage[f.name.replace('.json', '')] = JSON.parse(await tc.text()); pulled++ }
              } catch { /* skip */ }
            }
          }
        }
      } catch { /* tags optional */ }

      await setNotes(notesStorage)
      await setTags(tagsStorage)
      state.lastPullTime = Date.now()
      showToast(`已从远程拉取 ${pulled} 项数据`, 'success')
      return pulled
    } catch (e) {
      state.pullError = (e as Error).message
      showToast(`拉取失败: ${(e as Error).message}`, 'error')
      return 0
    } finally {
      state.isPulling = false
    }
  }

  // ═══════════════════════════════════════════════════════════
  // Push：将笔记/标签推送到 GitHub（仅 custom 模式）
  // ═══════════════════════════════════════════════════════════

  /** 将 questionId 加入推送队列 */
  function pushNote(questionId: string): void {
    const cfg = getRepoConfig()
    if (cfg.mode !== 'custom') return // default 模式只读

    try {
      const raw = localStorage.getItem(PUSH_QUEUE_KEY)
      const queue: string[] = raw ? JSON.parse(raw) : []
      if (!queue.includes(questionId)) {
        queue.push(questionId)
        localStorage.setItem(PUSH_QUEUE_KEY, JSON.stringify(queue))
      }
      state.pushQueue = queue
      processPushQueue()
    } catch { /* ignore */ }
  }

  /** 处理推送队列 */
  async function processPushQueue(): Promise<void> {
    if (_isPushing) return

    const cfg = getRepoConfig()
    if (cfg.mode !== 'custom' || !cfg.token) return

    try {
      const raw = localStorage.getItem(PUSH_QUEUE_KEY)
      if (!raw) return
      const queue: string[] = JSON.parse(raw)
      if (queue.length === 0) return

      _isPushing = true
      state.isPushing = true
      state.pushError = null

      const notesStorage = getNotes()
      const tagsStorage = getTags()

      // 收集所有待推送文件
      const files: Array<{ path: string; content: string }> = []
      for (const qid of queue) {
        const note = notesStorage[qid]
        if (note) files.push({ path: `${BASE_PATH}/notes/${qid}.md`, content: note })
        const tags = tagsStorage[qid]
        if (tags) files.push({ path: `${BASE_PATH}/tags/${qid}.json`, content: JSON.stringify(tags, null, 2) })
      }

      if (files.length > 0) {
        await _githubBatchPush(files, `sync: ${queue.length} items`, cfg)
      }

      // 清空已处理的队列
      localStorage.removeItem(PUSH_QUEUE_KEY)
      state.pushQueue = []
      showToast(`已推送 ${queue.length} 项数据到 GitHub`, 'success')
    } catch (e) {
      state.pushError = (e as Error).message
      // 保留队列以便重试
    } finally {
      _isPushing = false
      state.isPushing = false
    }
  }

  /** 手动推送全部本地数据 */
  async function manualPush(): Promise<number> {
    const cfg = getRepoConfig()
    if (cfg.mode !== 'custom' || !cfg.owner || !cfg.token) {
      showToast('请先配置自定义仓库和 Token', 'error')
      return 0
    }

    state.isPushing = true
    state.pushError = null
    try {
      const notesStorage = getNotes()
      const tagsStorage = getTags()
      const allIds = new Set([...Object.keys(notesStorage), ...Object.keys(tagsStorage)])

      // 收集所有文件
      const files: Array<{ path: string; content: string }> = []
      for (const qid of allIds) {
        const note = notesStorage[qid]
        if (note) files.push({ path: `${BASE_PATH}/notes/${qid}.md`, content: note })
        const tags = tagsStorage[qid]
        if (tags) files.push({ path: `${BASE_PATH}/tags/${qid}.json`, content: JSON.stringify(tags, null, 2) })
      }

      if (files.length > 0) {
        await _githubBatchPush(files, `sync: ${files.length} files`, cfg)
      }

      const pushed = files.length

      showToast(`已推送 ${pushed} 项数据到 GitHub`, 'success')
      return pushed
    } catch (e) {
      state.pushError = (e as Error).message
      showToast(`推送失败: ${(e as Error).message}`, 'error')
      return 0
    } finally {
      state.isPushing = false
    }
  }

  return {
    state: readonly(state),
    getRepoConfig,
    saveRepoConfig,
    hasRepoConfigured,
    initSync,
    manualPull,
    pushNote,
    manualPush,
  }
}
