<!-- BreakNotesPanel.vue — 复制自 page-quiz 笔记系统，适配 break 模式 -->
<template>
  <div class="break-notes">
    <div class="break-notes__header">
      <h3 class="break-notes__title">
        笔记
        <span v-if="isGeneratingCurrent" class="break-notes__generating">
          题目({{ activeGenerationIndex !== null ? activeGenerationIndex + 1 : '?' }})生成笔记中...
        </span>
      </h3>
      <div class="break-notes__actions">
        <button class="break-notes__btn sync-status" :class="syncStatusClass"
          :title="syncStatusTitle" @click="triggerSync" :disabled="syncStatus === 'pending'">
          <font-awesome-icon icon="sync" />
        </button>
        <button class="break-notes__btn" @click="toggleNotesEditor"
          :disabled="isGenerating" :title="isEditingNotes ? '取消编辑' : '编辑笔记'">
          <font-awesome-icon :icon="isEditingNotes ? 'times' : 'edit'" />
        </button>
        <button class="break-notes__btn break-notes__ai-btn"
          @click="triggerAINotesGeneration" :disabled="isGenerating"
          :class="{ 'button--loading': isGeneratingCurrent }"
          :title="isGeneratingCurrent ? '正在生成笔记...' : 'AI生成笔记'">
          <span v-if="isGeneratingCurrent" class="loading-spinner" />
          <font-awesome-icon v-else icon="bolt" />
        </button>
        <button class="break-notes__btn" @click="showRepoConfigModal = true" title="GitHub仓库设置">
          <font-awesome-icon :icon="['fab', 'github']" />
        </button>
        <button class="break-notes__btn" @click="showApiConfigModal = true" title="API设置">
          <font-awesome-icon icon="sliders-h" />
        </button>
      </div>
    </div>

    <!-- AI推理区 -->
    <div v-if="isGeneratingCurrent && reasoningContent && !hasContentStartedStreaming"
      class="break-notes__reasoning" ref="reasoningContainerRef">
      <div class="reasoning-content markdown-body" ref="reasoningContentRef" v-html="renderedReasoningHtml" />
    </div>

    <!-- 笔记展示 -->
    <div ref="notesDisplayRef" class="break-notes__display markdown-body"
      :class="{ 'break-notes__display--hidden': isEditingNotes, 'generating': isGeneratingCurrent }"
      v-html="renderedNotesHtml" />

    <!-- 笔记编辑 -->
    <div class="break-notes__editor" :class="{ 'break-notes__editor--hidden': !isEditingNotes }">
      <div class="break-notes__toolbar">
        <button @click="insertMarkdown('**粗体**')">粗体</button>
        <button @click="insertMarkdown('*斜体*')">斜体</button>
        <button @click="insertMarkdown('# 标题')">标题</button>
        <button @click="insertMarkdown('- 列表项')">列表</button>
        <button @click="insertMarkdown('```\n代码块\n```')">代码</button>
      </div>
      <textarea ref="notesTextareaRef" class="break-notes__textarea" placeholder="在此添加笔记..."
        v-model="notesEditText" @input="autoResizeTextarea" />
      <button @click="saveNotes" class="break-notes__save-btn">保存笔记</button>
    </div>

    <!-- 模态框 -->
    <ModalBreakRepo :show="showRepoConfigModal" @close="showRepoConfigModal = false" />
    <ModalApiConfig :show="showApiConfigModal" @close="showApiConfigModal = false"
      :current-config="getCompleteApiConfig()" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted, nextTick, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import configService, { type Question, type ApiConfig } from '@/services/config-service'
import { showToast } from '@/utils/toast'
import ModalApiConfig from '@/modals/modal-api-config.vue'
import ModalBreakRepo from './ModalBreakRepo.vue'
import { useBreakSync } from '../composables/useBreakSync'
import { getNotes, setNote, getTags, setTags } from '../composables/breakStorage'

const props = defineProps<{ question: Question }>()

type StreamCallback = (chunk: string, targetIndex: number) => void
type CompletionCallback = (finalNote: string, targetIndex: number, error?: string) => void

// ─── <think> 标签流式缓冲区（跨 chunk 匹配） ─────────────────
let _thinkBuf = ''
let _inThink = false

function filterThinkStream(chunk: string, flush = false): { content: string, reasoning: string } {
  let outC = ''; let outR = ''; _thinkBuf += chunk
  const SAFE = 8 // 保留最后 8 字符防 </think> 截断
  while (_thinkBuf.length > 0) {
    if (!_inThink) {
      const i = _thinkBuf.indexOf('<think>')
      if (i === -1) { const n = flush ? _thinkBuf.length : Math.max(0, _thinkBuf.length - 6); outC += _thinkBuf.slice(0, n); _thinkBuf = _thinkBuf.slice(n); break }
      outC += _thinkBuf.slice(0, i); _thinkBuf = _thinkBuf.slice(i + 7); _inThink = true
    } else {
      const i = _thinkBuf.indexOf('</think>')
      if (i === -1) { const n = flush ? _thinkBuf.length : Math.max(0, _thinkBuf.length - SAFE); outR += _thinkBuf.slice(0, n); _thinkBuf = _thinkBuf.slice(n); break }
      outR += _thinkBuf.slice(0, i); _thinkBuf = _thinkBuf.slice(i + 8); _inThink = false
    }
  }
  return { content: outC, reasoning: outR }
}

function resetThinkFilter() { _thinkBuf = ''; _inThink = false }

const md = new MarkdownIt({ html: true, linkify: true, typographer: true, breaks: false, xhtmlOut: true })

const isEditingNotes = ref(false)
const isGenerating = ref(false)
const notesEditText = ref('')
const renderedNotesHtml = ref('')
const reasoningContent = ref('')
const renderedReasoningHtml = ref('')
const hasContentStartedStreaming = ref(false)
const activeGenerationIndex = ref<number | null>(null)
const syncStatus = ref<'idle' | 'pending' | 'success' | 'error'>('idle')
const showRepoConfigModal = ref(false)
const showApiConfigModal = ref(false)
  const isGeneratingCurrent = computed(() => isGenerating.value && activeGenerationIndex.value !== null)

  /** 当前题目的 AI 标签（从 localStorage.break_tags 读取） */
  const questionTags = computed<Record<string, string> | null>(() => {
    if (!props.question?.id) return null
    try {
      const tagStorage = getTags()
      return tagStorage[props.question.id] || null
    } catch { return null }
  })

const notesTextareaRef = ref<HTMLTextAreaElement>()
const notesDisplayRef = ref<HTMLDivElement>()
const reasoningContainerRef = ref<HTMLDivElement>()
const reasoningContentRef = ref<HTMLDivElement>()

const syncStatusClass = computed(() => {
  switch (syncStatus.value) {
    case 'pending': return 'sync-pending'
    case 'success': return 'sync-success'
    case 'error': return 'sync-error'
    default: return 'sync-idle'
  }
})
const syncStatusTitle = computed(() => {
  switch (syncStatus.value) {
    case 'pending': return '同步中...'
    case 'success': return '同步成功'
    case 'error': return '同步失败'
    default: return '点击同步笔记'
  }
})

// 初始化渲染
watch(() => props.question, (q) => {
  console.log('[BreakNotes] watcher fired, question.id:', q?.id, 'has notes:', !!q?.notes)
  renderNotes()
}, { immediate: true })
watch(reasoningContent, renderReasoning)

// ─── 标签处理辅助函数（必须在 renderNotes 之前定义）───────────

function _buildTagBadgesHTML(tags: Record<string, string>): string {
  const unit = tags['单元'] || ''
  const system = tags['系统'] || ''
  const topic = tags['细目'] || ''
  const diff = tags['难度'] || ''
  const diffStyle: Record<string, string> = {
    '记忆': 'background:rgba(54,185,145,0.12);color:#059669;border:1px solid rgba(54,185,145,0.25);',
    '理解': 'background:rgba(217,119,6,0.12);color:#b45309;border:1px solid rgba(217,119,6,0.25);',
    '应用': 'background:rgba(229,73,96,0.12);color:#be123c;border:1px solid rgba(229,73,96,0.25);',
  }
  const ds = diffStyle[diff] || 'background:rgba(122,122,133,0.1);color:#6b6b76;border:1px solid rgba(122,122,133,0.18);'
  return [
    '<div style="display:flex;flex-wrap:wrap;gap:0.35rem;margin:0.75rem 0 0.25rem;padding:0.35rem 0;">',
    '  <span style="display:inline-flex;align-items:center;padding:0.15rem 0.55rem;border-radius:5px;font-size:0.7em;font-weight:600;line-height:1.4;background:rgba(68,104,238,0.08);color:#4468ee;border:1px solid rgba(68,104,238,0.18);">' + unit + '</span>',
    '  <span style="display:inline-flex;align-items:center;padding:0.15rem 0.55rem;border-radius:5px;font-size:0.7em;font-weight:600;line-height:1.4;background:rgba(5,150,105,0.08);color:#059669;border:1px solid rgba(5,150,105,0.18);">' + system + '</span>',
    '  <span style="display:inline-flex;align-items:center;padding:0.15rem 0.55rem;border-radius:5px;font-size:0.7em;font-weight:600;line-height:1.4;background:rgba(124,58,237,0.08);color:#7c3aed;border:1px solid rgba(124,58,237,0.18);">' + topic + '</span>',
    '  <span style="display:inline-flex;align-items:center;padding:0.15rem 0.55rem;border-radius:5px;font-size:0.7em;font-weight:700;line-height:1.4;' + ds + '">' + diff + '</span>',
    '</div>',
  ].join('\n')
}

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

function _replaceTagsWithBadges(note: string): string {
  if (!note) return note
  const m = note.match(/```tags\s*\n([\s\S]*?)```/)
  if (!m) return note
  const tags = extractTags(note)
  if (!tags) return note
  return note.replace(m[0], _buildTagBadgesHTML(tags))
}

/** 将 ```html ... ``` 围栏代码块展开为原始 HTML，使其在 markdown-it 中直接渲染 */
function _unwrapHtmlFences(text: string): string {
  if (!text) return text
  return text.replace(/```html\s*\n([\s\S]*?)```/g, (_, content) => content.trimEnd())
}

async function renderNotes() {
  const q = props.question
  console.log('[BreakNotes] renderNotes: q?.id=', q?.id, 'q?.notes length=', q?.notes?.length ?? 0)
  if (!q) return
  let noteContent = q.notes || ''
  // 对象上无笔记时从 localStorage 补（批量生成后未同步的场景）
  if (!noteContent && q.id) {
    try {
      const saved = getNotes()
      if (saved[q.id]) noteContent = saved[q.id]
    } catch { /* ignore */ }
  }
  // 安全网：渲染前剥离残留 <think> 标签
  noteContent = noteContent.replace(/<think>[\s\S]*?<\/think>/g, '')
  // 展开 ```html ... \`\`\` 围栏为原始 HTML，避免被 markdown-it 当作代码块转义
  noteContent = _unwrapHtmlFences(noteContent)
  const isGen = isGenerating.value
  try {
    let html = ''
    if (isGen) html = noteContent ? md.render(noteContent) : '<p class="break-notes__placeholder">思考中...</p>'
    else if (noteContent) {
          // 先将 ```tags 替换为彩色徽章，再预处理（避免 preprocessLineBreaks 在代码块内插入 <br>）
          const withBadges = _replaceTagsWithBadges(noteContent)
          const preprocessed = preprocessLineBreaks(withBadges)
          html = md.render(preprocessed)
    }
    // 括号内容自动蓝色着色（跳过已有背景色的）
    html = html.replace(/（[^）]*）/g, (m) => m.includes('background') ? m : '<span style="color: #2c8aed;">' + m + '</span>')
    renderedNotesHtml.value = html || '<p class="break-notes__placeholder">暂无笔记，可点击编辑或AI生成。</p>'
  } catch (e) {
    console.error('[BreakNotes] render error:', e)
    renderedNotesHtml.value = '<p class="break-notes__error">笔记渲染失败</p>'
  }
}

function toggleNotesEditor() {
  isEditingNotes.value = !isEditingNotes.value
  if (isEditingNotes.value) {
    // 编辑时展示原始笔记（含 ```tags 块）
    notesEditText.value = props.question?.notes || ''
    nextTick(() => { notesTextareaRef.value?.focus(); autoResizeTextarea() })
  }
}

async function saveNotes() {
  if (!props.question?.id) return
  await setNote(props.question.id, notesEditText.value)
  isEditingNotes.value = false
  nextTick(renderNotes)
  showToast('笔记已保存', 'success')
}

function insertMarkdown(markup: string) {
  const ta = notesTextareaRef.value
  if (!ta) return
  const start = ta.selectionStart, end = ta.selectionEnd
  const text = ta.value, selected = text.substring(start, end)
  let inserted = markup
  let offset = 0
  const ph: Record<string,string> = { '**粗体**': '粗体', '*斜体*': '斜体', '# 标题': '标题', '- 列表项': '列表项', '```\n代码块\n```': '代码块' }
  for (const k in ph) {
    if (markup === k && selected) {
      inserted = markup.replace(ph[k], selected)
      if (k.includes('**') || k.includes('*')) offset = k.indexOf(ph[k])
      else if (k.includes('```')) offset = k.indexOf('\n') + 1
      break
    }
  }
  ta.value = text.substring(0, start) + inserted + text.substring(end)
  notesEditText.value = ta.value
  ta.focus()
  nextTick(() => {
    ta.selectionStart = selected && offset > 0 ? start + offset : start + inserted.length
    ta.selectionEnd = selected && offset > 0 ? ta.selectionStart + selected.length : ta.selectionStart
    autoResizeTextarea()
  })
}

function autoResizeTextarea() {
  const ta = notesTextareaRef.value
  if (!ta) return
  ta.style.height = 'auto'
  nextTick(() => { if (ta) ta.style.height = Math.max(ta.scrollHeight, 80) + 'px' })
}

function triggerAINotesGeneration() {
  reasoningContent.value = ''
  renderedReasoningHtml.value = ''
  hasContentStartedStreaming.value = false
  resetThinkFilter()
  requestNoteGeneration()
}

function requestNoteGeneration() {
  if (!props.question || isGenerating.value) return
  const questionRef = props.question
  questionRef.notes = '' // 生成前清空已有笔记，避免追加到旧内容
  isGenerating.value = true
  activeGenerationIndex.value = 0
  generateAINotes(questionRef, 0, (final, idx, err) => {
    if (activeGenerationIndex.value === idx) {
      isGenerating.value = false
      activeGenerationIndex.value = null
      if (err) { showToast(err, 'error') }
      else {
        questionRef.notes = final
        setNote(questionRef.id!, final)
        renderNotes()
      }
    }
  })
}

async function generateAINotes(question: Question, generationTargetIndex: number, completionCallback: CompletionCallback) {
  const questionRef = question
  if (!questionRef) { completionCallback('', generationTargetIndex, '无法获取问题信息'); return }
  const currentApiConfig = configService.getApiConfig()
  if (!currentApiConfig.enabled || !currentApiConfig.apiUrl || !currentApiConfig.apiKey) {
    showToast('请先启用并配置AI API设置', 'info'); showApiConfigModal.value = true
    completionCallback(questionRef.notes ?? '', generationTargetIndex, 'API未配置或未启用'); return
  }
  let lastRenderTime = 0
  let autoSaveTimeoutId: number | null = null
  const autoSaveNotes = () => {
    if (autoSaveTimeoutId) clearTimeout(autoSaveTimeoutId)
    autoSaveTimeoutId = window.setTimeout(() => {
      if (activeGenerationIndex.value === generationTargetIndex && questionRef && questionRef.id && questionRef.notes) {
        setNote(questionRef.id, questionRef.notes).catch(() => {})
      }
    }, 2000)
  }
  const handleStreamChunk: StreamCallback = (chunk, streamTargetIndex) => {
    if (streamTargetIndex !== generationTargetIndex || !questionRef) return
    questionRef.notes = (questionRef.notes || '') + chunk
    autoSaveNotes()
    // 直接渲染，不使用节流（避免最后一帧丢失）
    renderNotes()
    lastRenderTime = Date.now()
  }

  const handleCompletion: CompletionCallback = async (finalNote, completedIndex, error) => {
    if (autoSaveTimeoutId) clearTimeout(autoSaveTimeoutId)
    if (activeGenerationIndex.value !== completedIndex) return
    activeGenerationIndex.value = null; isGenerating.value = false
    if (!questionRef) return

    // 保存原始笔记（含 ```tags 块），渲染时再替换为徽章
    questionRef.notes = finalNote
    setNote(questionRef.id!, finalNote).catch(() => {})

    // 提取标签到独立存储
    const tags = extractTags(finalNote)
    if (tags && questionRef.id) {
      const tagStorage = getTags()
      tagStorage[questionRef.id] = tags
      setTags(tagStorage).catch(() => {})
      console.log('[BreakNotes] 标签已捕获:', tags)
    }

    await nextTick(); await renderNotes(); await nextTick()
    // 保险：延迟二次渲染确保流式内容完整落盘
    setTimeout(() => renderNotes(), 300)
    if (error) showToast(`笔记生成失败: ${error}`, 'error')
    else if (finalNote?.trim()) showToast('笔记生成完成', 'success')
    else showToast('笔记生成结束 (无内容)', 'info')
  }
  try {
    const requestData = configService.getNotesGenerationRequestParams(questionRef)
    const response = await fetch(currentApiConfig.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentApiConfig.apiKey}` },
      body: JSON.stringify(requestData)
    })
    if (!response.ok) { const eb = await response.text(); throw new Error(`API请求失败 (${response.status}): ${response.statusText || eb}`) }
    if (requestData.stream && response.body) {
      const reader = response.body.getReader(); const decoder = new TextDecoder()
      let buffer = ''; let lastDataReceived = Date.now()
      const heartbeatInterval = setInterval(() => {
        if (Date.now() - lastDataReceived > 30000) { clearInterval(heartbeatInterval); reader.cancel('Timeout').catch(()=>{}); handleCompletion(questionRef?.notes?.trim() ?? '', generationTargetIndex, '数据流接收超时') }
      }, 10000)
      try {
        while (true) {
          const { done, value } = await reader.read(); lastDataReceived = Date.now()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          let lineEndIndex: number
          while ((lineEndIndex = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, lineEndIndex).trim(); buffer = buffer.slice(lineEndIndex + 1)
            if (line.startsWith('data: ')) {
              const dataStr = line.substring(6)
              if (dataStr === '[DONE]') continue
              try {
                const parsed = JSON.parse(dataStr)
                let content = ''; let reasoningChunk = ''; let finishReason = ''
                if (parsed.choices?.length > 0) {
                  const choice = parsed.choices[0]
                  const delta = choice.delta
                  if (delta) { if (delta.content) content = delta.content; if (delta.reasoning) reasoningChunk = delta.reasoning }
                  else if (choice.message?.content) content = choice.message.content
                  else if (choice.text) content = choice.text
                  if (choice.finish_reason) finishReason = choice.finish_reason
                } else if (parsed.delta?.content) { content = parsed.delta.content; if (parsed.delta.reasoning) reasoningChunk = parsed.delta.reasoning }
                else if (parsed.delta?.text) content = parsed.delta.text
                else if (parsed.text) content = parsed.text
                // 过滤 <think> 标签（流式跨 chunk 匹配）
                if (finishReason) console.log('[BreakNotes] finish_reason:', finishReason)
                if (content) {
                  const ft = filterThinkStream(content)
                  if (ft.content) {
                    if (!hasContentStartedStreaming.value) hasContentStartedStreaming.value = true
                    handleStreamChunk(ft.content, generationTargetIndex)
                  }
                  if (ft.reasoning) reasoningContent.value += ft.reasoning
                }
              } catch { /* parse error */ }
            }
          }
        }
      } finally { clearInterval(heartbeatInterval) }
      // TextDecoder 最终 flush：清空 stream 模式下内部缓冲区残留
      const finalChunk = decoder.decode()
      if (finalChunk) buffer += finalChunk
      // 流结束后 flush 缓冲区残留数据（循环处理所有残留行，避免末段缺失）
      let finalLineEndIndex: number
      while ((finalLineEndIndex = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, finalLineEndIndex).trim(); buffer = buffer.slice(finalLineEndIndex + 1)
        if (line.startsWith('data: ')) {
          const dataStr = line.substring(6)
          if (dataStr === '[DONE]') continue
          try {
            const parsed = JSON.parse(dataStr)
            let content = ''
            if (parsed.choices?.[0]?.delta?.content) content = parsed.choices[0].delta.content
            else if (parsed.delta?.content) content = parsed.delta.content
            if (content) {
              const ft = filterThinkStream(content)
              if (ft.content) {
                if (!hasContentStartedStreaming.value) hasContentStartedStreaming.value = true
                handleStreamChunk(ft.content, generationTargetIndex)
              }
              if (ft.reasoning) reasoningContent.value += ft.reasoning
            }
          } catch { /* ignore */ }
        }
      }
      // 处理最后可能不完整的行
      if (buffer.trim()) {
        const line = buffer.trim()
        if (line.startsWith('data: ')) {
          const dataStr = line.substring(6)
          if (dataStr !== '[DONE]') {
            try {
              const parsed = JSON.parse(dataStr)
              let content = ''
              if (parsed.choices?.[0]?.delta?.content) content = parsed.choices[0].delta.content
              else if (parsed.delta?.content) content = parsed.delta.content
              if (content) {
                const ft = filterThinkStream(content)
                if (ft.content) {
                  if (!hasContentStartedStreaming.value) hasContentStartedStreaming.value = true
                  handleStreamChunk(ft.content, generationTargetIndex)
                }
                if (ft.reasoning) reasoningContent.value += ft.reasoning
              }
            } catch { /* ignore */ }
          }
        }
      }
      // 排空 filterThinkStream 的安全缓冲区（避免流结束时 0-6 字符丢失）
      const ftFinal = filterThinkStream('', true)
      if (ftFinal.content) {
        if (!hasContentStartedStreaming.value) hasContentStartedStreaming.value = true
        handleStreamChunk(ftFinal.content, generationTargetIndex)
      }
      if (ftFinal.reasoning) reasoningContent.value += ftFinal.reasoning
      // 立即渲染最终内容
      await nextTick(); await renderNotes(); await nextTick()
      await handleCompletion(questionRef?.notes?.trim() ?? '', generationTargetIndex)
    } else {
      const data = await response.json()
      const rawNote = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || data.content?.[0]?.text || ''
      // 过滤 <think> 标签
      const thinkBlocks = rawNote.match(/<think>([\s\S]*?)<\/think>/g)
      if (thinkBlocks) reasoningContent.value = thinkBlocks.map((t: string) => t.replace(/<\/?think>/g, '')).join('')
      const note = rawNote.replace(/<think>[\s\S]*?<\/think>/g, '')
      if (questionRef) questionRef.notes = note
      handleCompletion(questionRef?.notes?.trim() ?? '', generationTargetIndex)
    }
  } catch (error) { handleCompletion(questionRef?.notes?.trim() ?? '', generationTargetIndex, `笔记生成失败: ${error instanceof Error ? error.message : '未知错误'}`) }
}

const { manualPull, hasRepoConfigured } = useBreakSync()

async function triggerSync() {
  if (syncStatus.value === 'pending') return
  syncStatus.value = 'pending'
  try {
    const cfg = hasRepoConfigured()
    if (!cfg) { syncStatus.value = 'error'; showToast('请先配置 GitHub 仓库', 'error'); return }
    // 先拉取远程笔记，再推送本地（如果配置了推送）
    await manualPull()
    syncStatus.value = 'success'; showToast('同步完成', 'success')
    setTimeout(() => syncStatus.value = 'idle', 2000)
  } catch { syncStatus.value = 'error'; showToast('同步失败', 'error') }
}

function getCompleteApiConfig(): ApiConfig { return configService.getApiConfig() }

function renderReasoning() {
  if (reasoningContent.value) {
    try {
      const preprocessed = preprocessLineBreaks(reasoningContent.value)
      renderedReasoningHtml.value = md.render(preprocessed)
      nextTick(() => {
        const el = reasoningContentRef.value
        if (el) el.scrollTop = el.scrollHeight
      })
    } catch { /* ignore */ }
  }
}

// ─── 笔记预处理（复制自 page-quiz） ─────────────────────────────

function preprocessLineBreaks(text: string | undefined): string {
  if (!text) return ''
  const linesWithHtmlLists = convertMdListsToHtml(text.split('\n'))
  const linesWithInlineHtml = convertInlineMdToHtml(linesWithHtmlLists)
  const linesWithBreaks = addBrTags(linesWithInlineHtml)
  return linesWithBreaks.join('\n')
}

function convertMdListsToHtml(lines: string[]): string[] {
  const resultLines: string[] = []
  let currentListType: 'ul' | 'ol' | null = null
  let inListItem = false
  const ulMarkerRegex = /^(\s*[-*+]\s+)/
  const olMarkerRegex = /^(\s*\d+\.\s+)/

  const closeListItem = () => { if (inListItem) { resultLines.push('</li>'); inListItem = false } }
  const closeList = () => { closeListItem(); if (currentListType) { resultLines.push('</' + currentListType + '>'); currentListType = null } }
  const getLineContent = (line: string, markerRegex: RegExp): string => { const m = line.match(markerRegex); return m ? line.substring(m[0].length) : line }

  for (const line of lines) {
    const t = line.trim()
    if (t.length === 0) { closeList(); resultLines.push(line); continue }
    const isUl = ulMarkerRegex.test(t); const isOl = olMarkerRegex.test(t)
    if (isUl || isOl) {
      const listType = isUl ? 'ul' : 'ol'; const mr = isUl ? ulMarkerRegex : olMarkerRegex
      if (currentListType && currentListType !== listType) closeList()
      if (!currentListType) { resultLines.push('<' + listType + '>'); currentListType = listType }
      closeListItem(); resultLines.push('<li>' + getLineContent(line, mr)); inListItem = true
    } else { closeList(); resultLines.push(line) }
  }
  closeList()
  return resultLines
}

function convertInlineMdToHtml(lines: string[]): string[] {
  return lines.map(l => l.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/__(.+?)__/g, '<strong>$1</strong>'))
}

function addBrTags(lines: string[]): string[] {
  const resultLines: string[] = []
  const blockStart = /^(?:\s*#{1,6}\s+|\s*<\s*(?:p|h[1-6]|div|ul|ol|li|blockquote|table|tr|td|th|form|address|article|aside|details|dialog|dd|dl|dt|fieldset|figcaption|figure|footer|header|hr|main|nav|pre|section)\b)/i
  const blockEnd = /<\/\s*(?:p|h[1-6]|div|ul|ol|li|blockquote|table|form|address|article|aside|details|dialog|dd|dl|dt|fieldset|figcaption|figure|footer|header|main|nav|pre|section)>\s*$/i
  const tableRx = /^\s*\|.*\|?\s*$/; const onlyTags = /^\s*<[^>]+>\s*$/; const brRx = /<br\s*\/?>$/i

  for (let i = 0; i < lines.length; i++) {
    const cur = lines[i].trimEnd(); const ct = cur.trim(); let line = cur
    if (i + 1 < lines.length) {
      const nt = lines[i + 1].trim()
      const add = ct.length > 0 && nt.length > 0 && !brRx.test(cur) && !blockStart.test(ct) && !blockEnd.test(ct) && !tableRx.test(ct) && !onlyTags.test(ct) && !blockStart.test(nt) && !tableRx.test(nt)
      if (add) line += '<br>'
    }
    resultLines.push(line)
  }
  return resultLines
}
</script>

<style scoped>
.break-notes { display: flex; flex-direction: column; background: var(--card, #fff); border-radius: var(--radius, 12px); margin-top: 1rem; padding: 0.5rem; }

.break-notes__header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 0.5rem; padding-bottom: 0.4rem; }
.break-notes__title { margin: 0; color: var(--c-blue, #4468ee); font-size: 1.05em; font-weight: 600; }
.break-notes__generating { font-size: 0.75em; color: var(--c-yellow, #f5a623); }
.break-notes__actions { display: flex; gap: 4px; }

.break-notes__btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: var(--card, #fff); border: 1px solid var(--border, #e5e7eb); border-radius: var(--radius, 8px); cursor: pointer; color: var(--text-secondary, #5a5a68); transition: all 0.1s; padding: 0; }
.break-notes__btn:hover { background: rgba(68,104,238,0.08); color: var(--c-blue, #4468ee); border-color: var(--c-blue, #4468ee); transform: translateY(-1px); }
.break-notes__btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }
.break-notes__btn.sync-pending { animation: break-spin 1s linear infinite; }

.break-notes__display { font-size: 0.9em; line-height: 1.6; }
.break-notes__display--hidden { display: none; }
.break-notes__placeholder { color: var(--text-secondary, #5a5a68); font-style: italic; }
.break-notes__error { color: var(--c-red, #e54960); }

.break-notes__reasoning { margin-bottom: 0.5rem; padding: 0.5rem; background: var(--color-blue-very-light, #f4f6ff); border-radius: 6px; font-size: 0.82em; color: var(--text-secondary, #5a5a68); }

.break-notes__editor { display: flex; flex-direction: column; gap: 0.5rem; }
.break-notes__editor--hidden { display: none; }
.break-notes__toolbar { display: flex; gap: 4px; flex-wrap: wrap; }
.break-notes__toolbar button { padding: 2px 10px; font-size: 0.8em; background: var(--card, #fff); border: 1px solid var(--border, #e5e7eb); border-radius: 4px; cursor: pointer; color: var(--text-secondary, #5a5a68); }
.break-notes__textarea { width: 100%; min-height: 80px; padding: 0.5rem; font-size: 0.9em; line-height: 1.5; border: 1px solid var(--border, #e5e7eb); border-radius: var(--radius, 8px); resize: vertical; font-family: inherit; }
.break-notes__textarea:focus { outline: none; border-color: var(--c-blue, #4468ee); }
.break-notes__save-btn { align-self: flex-end; padding: 0.4rem 1rem; background: var(--c-blue, #4468ee); color: #fff; border: none; border-radius: var(--radius, 8px); cursor: pointer; font-size: 0.85em; font-weight: 500; }
.break-notes__save-btn:hover { transform: translateY(-1px); }

.loading-spinner { display: inline-block; width: 12px; height: 12px; border: 2px solid var(--border, #e5e7eb); border-top-color: var(--c-blue, #4468ee); border-radius: 50%; animation: break-spin 0.6s linear infinite; }
.button--loading { position: relative; }

@keyframes break-spin { to { transform: rotate(360deg); } }

/* ── 题目标签 ── */
.break-notes__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.5rem;
  padding: 0.35rem 0;
}

.break-notes__tag {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.55rem;
  border-radius: 4px;
  font-size: 0.72em;
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
}

.break-notes__tag--unit {
  background: rgba(68, 104, 238, 0.1);
  color: var(--c-blue, #4468ee);
  border: 1px solid rgba(68, 104, 238, 0.2);
}

.break-notes__tag--system {
  background: rgba(54, 185, 145, 0.1);
  color: var(--c-green, #36b991);
  border: 1px solid rgba(54, 185, 145, 0.2);
}

.break-notes__tag--topic {
  background: rgba(90, 107, 242, 0.08);
  color: var(--c-indigo, #3a42d5);
  border: 1px solid rgba(90, 107, 242, 0.15);
}

.break-notes__tag--difficulty {
  font-weight: 700;
}

.break-notes__tag--diff-记忆 {
  background: rgba(54, 185, 145, 0.08);
  color: var(--c-green, #36b991);
  border: 1px solid rgba(54, 185, 145, 0.18);
}

.break-notes__tag--diff-理解 {
  background: rgba(245, 166, 35, 0.08);
  color: var(--c-yellow, #d97706);
  border: 1px solid rgba(245, 166, 35, 0.2);
}

.break-notes__tag--diff-应用 {
  background: rgba(229, 73, 96, 0.08);
  color: var(--c-red, #e54960);
  border: 1px solid rgba(229, 73, 96, 0.18);
}

/* ── 手机端 (≤480px) ── */
@media (max-width: 480px) {
  .break-notes__header {
    gap: 0.25rem;
  }

  .break-notes__actions {
    gap: 3px;
  }

  .break-notes__btn {
    width: 28px;
    height: 28px;
  }
}
</style>
