/**
 * useBreakAI.ts — 批量 AI 笔记生成（独立于组件状态，支持并发）
 *
 * 与 BreakNotesPanel.vue 的单题生成完全解耦。
 * 流式接收 → think 标签过滤 → 标签提取 → 写入 localStorage + 同步队列。
 */

import configService, { type Question } from '@/services/config-service'
import { useBreakSync } from './useBreakSync'

// ─── <think> 流式过滤器（每个 generateOneNote 有独立缓冲区）──────

class ThinkFilter {
  private buf = ''
  private inThink = false

  /** 喂入一个 chunk，返回过滤后的 { content, reasoning } */
  feed(chunk: string): { content: string; reasoning: string } {
    let outC = ''; let outR = ''; this.buf += chunk
    const SAFE = 8
    while (this.buf.length > 0) {
      if (!this.inThink) {
        const i = this.buf.indexOf('<think>')
        if (i === -1) { const n = Math.max(0, this.buf.length - 6); outC += this.buf.slice(0, n); this.buf = this.buf.slice(n); break }
        outC += this.buf.slice(0, i); this.buf = this.buf.slice(i + 7); this.inThink = true
      } else {
        const i = this.buf.indexOf('</think>')
        if (i === -1) { const n = Math.max(0, this.buf.length - SAFE); outR += this.buf.slice(0, n); this.buf = this.buf.slice(n); break }
        outR += this.buf.slice(0, i); this.buf = this.buf.slice(i + 8); this.inThink = false
      }
    }
    return { content: outC, reasoning: outR }
  }

  /** 流结束时的最终排空 */
  flush(): { content: string; reasoning: string } {
    return this.feed('')
  }

  /**
   * 处理完整的非流式响应（过滤 <think> 块）
   */
  static filterComplete(text: string): string {
    return text.replace(/<think>[\s\S]*?<\/think>/g, '')
  }
}

// ─── 标签提取（同 BreakNotesPanel） ──────────────────────────

function extractTags(note: string): Record<string, string> | null {
  if (!note) return null
  const m = note.match(/```tags\s*\n([\s\S]*?)```/)
  if (!m) return null
  const tags: Record<string, string> = {}
  m[1].trim().split('\n').forEach(line => {
    const idx = line.indexOf(':')
    if (idx > 0) tags[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
  })
  return Object.keys(tags).length > 0 ? tags : null
}

// ─── 保存笔记和标签到 localStorage ───────────────────────────

function saveNoteAndTags(questionId: string, note: string): void {
  const notes = JSON.parse(localStorage.getItem('break_notes') || '{}')
  notes[questionId] = note
  localStorage.setItem('break_notes', JSON.stringify(notes))

  const tags = extractTags(note)
  if (tags) {
    const tagStore = JSON.parse(localStorage.getItem('break_tags') || '{}')
    tagStore[questionId] = tags
    localStorage.setItem('break_tags', JSON.stringify(tagStore))
  }

  // 加入同步推送队列
  const { pushNote } = useBreakSync()
  pushNote(questionId)
}

// ═══════════════════════════════════════════════════════════════
// 公开 API
// ═══════════════════════════════════════════════════════════════

/**
 * 为一题生成 AI 笔记（独立，不依赖组件状态）。
 * 返回最终的纯文本笔记内容。
 */
async function generateOneNote(question: Question): Promise<string> {
  const apiConfig = configService.getApiConfig()
  if (!apiConfig.enabled || !apiConfig.apiUrl || !apiConfig.apiKey) {
    throw new Error('API 未配置')
  }

  const requestData = configService.getNotesGenerationRequestParams(question)

  const response = await fetch(apiConfig.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiConfig.apiKey}`,
    },
    body: JSON.stringify(requestData),
  })

  if (!response.ok) {
    const eb = await response.text().catch(() => '')
    throw new Error(`API 请求失败 (${response.status}): ${eb || response.statusText}`)
  }

  // 非流式响应
  if (!requestData.stream || !response.body) {
    const data = await response.json()
    const raw = data.choices?.[0]?.message?.content
      || data.choices?.[0]?.text
      || data.content?.[0]?.text
      || ''
    return ThinkFilter.filterComplete(raw)
  }

  // 流式响应
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  const filter = new ThinkFilter()
  let buffer = ''
  let fullContent = ''
  let lastDataTime = Date.now()

  const heartbeat = setInterval(() => {
    if (Date.now() - lastDataTime > 30000) {
      clearInterval(heartbeat)
      reader.cancel('timeout').catch(() => {})
    }
  }, 10000)

  try {
    while (true) {
      const { done, value } = await reader.read()
      lastDataTime = Date.now()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      let lineEnd: number
      while ((lineEnd = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, lineEnd).trim()
        buffer = buffer.slice(lineEnd + 1)

        if (!line.startsWith('data: ')) continue
        const dataStr = line.substring(6)
        if (dataStr === '[DONE]') continue

        try {
          const parsed = JSON.parse(dataStr)
          let content = ''

          if (parsed.choices?.[0]?.delta?.content) content = parsed.choices[0].delta.content
          else if (parsed.choices?.[0]?.message?.content) content = parsed.choices[0].message.content
          else if (parsed.choices?.[0]?.text) content = parsed.choices[0].text
          else if (parsed.delta?.content) content = parsed.delta.content
          else if (parsed.delta?.text) content = parsed.delta.text
          else if (parsed.text) content = parsed.text

          if (content) {
            const ft = filter.feed(content)
            fullContent += ft.content
          }
        } catch { /* skip malformed JSON */ }
      }
    }

    // 排空缓冲区
    const final = decoder.decode()
    if (final) buffer += final

    // 处理残留行
    let lineEnd: number
    while ((lineEnd = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, lineEnd).trim()
      buffer = buffer.slice(lineEnd + 1)
      if (line.startsWith('data: ') && line.substring(6) !== '[DONE]') {
        try {
          const parsed = JSON.parse(line.substring(6))
          let content = ''
          if (parsed.choices?.[0]?.delta?.content) content = parsed.choices[0].delta.content
          else if (parsed.delta?.content) content = parsed.delta.content
          if (content) {
            const ft = filter.feed(content)
            fullContent += ft.content
          }
        } catch { /* skip */ }
      }
    }

    // 最后的残留
    if (buffer.trim() && buffer.trim().startsWith('data: ') && buffer.trim().substring(6) !== '[DONE]') {
      try {
        const parsed = JSON.parse(buffer.trim().substring(6))
        let content = ''
        if (parsed.choices?.[0]?.delta?.content) content = parsed.choices[0].delta.content
        else if (parsed.delta?.content) content = parsed.delta.content
        if (content) {
          const ft = filter.feed(content)
          fullContent += ft.content
        }
      } catch { /* skip */ }
    }

    // 排空 think filter 缓冲区
    const ft = filter.flush()
    fullContent += ft.content

    return fullContent || ''
  } finally {
    clearInterval(heartbeat)
  }
}

/**
 * 批量生成 AI 笔记。
 * @param questionIds 要生成笔记的题目 ID 列表
 * @param questions 题目池（按 ID 查找题目）
 * @param onProgress 进度回调 (已完成数, 总数)
 * @returns 成功生成的题目数
 */
export async function batchGenerateNotes(
  questionIds: string[],
  questions: Question[],
  onProgress?: (done: number, total: number) => void,
): Promise<number> {
  // 1. 过滤：已有笔记的跳过，找不到题目的跳过
  const notes = JSON.parse(localStorage.getItem('break_notes') || '{}')
  const pending = questionIds.filter(id => {
    if (notes[id]) return false
    return questions.some(q => q.id === id)
  })

  if (pending.length === 0) return 0

  // 2. 构建题目映射
  const qMap = new Map<string, Question>()
  for (const q of questions) {
    if (q.id) qMap.set(q.id, q)
  }

  // 3. 并发生成
  let completed = 0
  const total = pending.length
  onProgress?.(0, total)

  const results = await Promise.allSettled(
    pending.map(async (id) => {
      const q = qMap.get(id)!
      const note = await generateOneNote(q)
      if (note) {
        saveNoteAndTags(id, note)
      }
      completed++
      onProgress?.(completed, total)
    }),
  )

  // 4. 统计成功数
  const succeeded = results.filter(r => r.status === 'fulfilled').length
  return succeeded
}
