<template>
  <div class="page-break" :style="{ '--font-family': uiSettings.fontFamily || 'sans-serif', '--font-size': (uiSettings.fontSize || 14) + 'px' }">
    <!-- 加载中 -->
    <div v-if="loading" class="page-break__loading">
      <div class="page-break__loading-spinner"></div>
      <p>正在初始化绯想击破...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="initError" class="page-break__error">
      <h2>初始化失败</h2>
      <p>{{ initError }}</p>
      <button @click="goToLibrary">返回题库</button>
    </div>

    <!-- 正常游戏界面 -->
    <div v-else class="page-break__container">
      <!-- 页眉 -->
      <header class="page-break__header">
        <button class="page-break__back-button" @click="goToLibrary" title="返回题库">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 class="page-break__title">绯想击破</h1>
        <button class="page-break__back-button" @click="showSettings = true" title="设置">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </header>

      <!-- 状态栏 -->
      <!-- 第一行：战斗信息 + 节点路线 -->
      <div class="break-status">
        <!-- 羽毛（仅普通/精英/Boss 节点） -->
        <span v-if="showBattleInfo && currentNode" class="break-status__feathers">
          <span
            v-for="i in 3" :key="i"
            class="break-feather"
            :class="i <= (currentNode.featherCount) ? 'break-feather--used' : 'break-feather--empty'"
          />
        </span>

        <!-- 击破值（块状，仅普通/精英/Boss 节点） -->
        <span v-if="showBattleInfo && currentNode" class="break-status__toughness">
          <span
            v-for="i in currentNode.toughness" :key="i"
            class="break-toughness-dot"
            :class="i <= currentNode.currentToughness ? 'break-toughness-dot--live' : 'break-toughness-dot--broken'"
            :style="i <= currentNode.currentToughness ? { '--dot-color': nodeTypeColor } : {}"
          />
        </span>

        <!-- 层标识 -->
        <span class="break-status__phase">第{{ gameState.progress.phase }}层</span>

        <!-- 节点路线 -->
        <span class="break-route">
          <template v-for="(node, i) in phaseNodes" :key="node.id">
            <span
              class="break-route__node"
              :class="{
                'break-route__node--current': i === currentPhaseIndex,
                'break-route__node--past': i < currentPhaseIndex,
                'break-route__node--future': i > currentPhaseIndex,
              }"
            >{{ nodeTypeShort(node.type) }}</span>
            <span v-if="i < phaseNodes.length - 1" class="break-route__arrow">→</span>
          </template>
        </span>
      </div>

      <!-- 第二行：全局状态 + 角色卡片 -->
      <div class="break-status-sub">
        <span class="break-status-sub__stats">
          ❤ <span :class="hpClass">{{ gameState.progress.currentHP }}</span>/{{ gameState.progress.maxHP }}
          <span class="break-status-sub__sep">·</span>
          ◆ <span class="break-status-sub__gold">{{ gameState.progress.starJade }}</span>
          <span v-if="gameState.progress.combatResume > 0" class="break-status-sub__sep">·</span>
          <span v-if="gameState.progress.combatResume > 0">🛡{{ gameState.progress.combatResume }}</span>
          <span v-if="gameState.progress.genki > 0" class="break-status-sub__sep">·</span>
          <span v-if="gameState.progress.genki > 0">⚡{{ gameState.progress.genki }}</span>
          <template v-if="gameState.progress.combo > 1">
            <span class="break-status-sub__sep">·</span>
            连击<span class="break-status-sub__combo">+{{ gameState.progress.combo }}</span>
          </template>
        </span>

        <!-- 角色迷你卡片 -->
        <span class="break-status-sub__chars">
          <span
            v-for="(char, i) in visibleChars"
            :key="char.id"
            class="break-char-mini"
            @click="openCharDetail(i)"
          >
            <span class="break-char-mini__initial">{{ char.name[0] }}</span>
            <span class="break-char-mini__stars">{{ '★'.repeat(char.starLevel) }}</span>
          </span>
          <span v-if="overflowCount > 0" class="break-char-mini break-char-mini--more" @click="openCharDetail(3)">+{{ overflowCount }}</span>
        </span>
      </div>

      <!-- 题目面板 -->
      <BreakQuestionPanel
        v-if="gameState.currentQuestion"
        :question="gameState.currentQuestion"
        :selected-answer="gameState.selectedAnswer"
        :is-submitted="gameState.isAnswerSubmitted"
        :is-correct="gameState.isAnswerCorrect"
        :current-node-type="currentNode?.type ?? BreakNodeType.Normal"
        :current-h-p="gameState.progress.currentHP"
        :max-h-p="gameState.progress.maxHP"
        :revealed-options="revealedOptions"
        @select="onSelect"
        @submit="onSubmit"
        @next="onNext"
        @surrender="onSurrender"
      />

      <!-- 无题目时的推进按钮（补给/商店完成后） -->
      <div v-else-if="currentNode?.isComplete" class="break-content__advance">
        <p v-if="currentNode?.type === 'supply'">补给完成！角色已加入队伍。</p>
        <p v-else-if="currentNode?.type === 'shop'">采购完成！</p>
        <p v-else>节点击破！</p>

        <!-- 补给站：一键生成全部 AI 笔记 -->
        <div v-if="currentNode?.type === 'supply'" class="break-content__batch-ai">
          <template v-if="!batchGenerating">
            <p class="break-content__batch-info">
              {{ pendingNoteCount > 0 ? `${pendingNoteCount} 题待生成笔记` : '全部题目已有笔记' }}
            </p>
            <p v-if="batchFailedCount > 0" class="break-content__batch-fail">
              上次生成：{{ batchFailedCount }} 题失败
            </p>
          </template>
          <template v-else>
            <div class="break-content__batch-ring">
              <svg class="break-content__batch-ring-svg" viewBox="0 0 60 60">
                <circle class="break-content__batch-ring-bg" cx="30" cy="30" r="24" />
                <circle
                  class="break-content__batch-ring-fill"
                  cx="30" cy="30" r="24"
                  :style="{ strokeDasharray: `${(batchProgress / batchTotal) * 151} 151` }"
                />
              </svg>
              <span class="break-content__batch-ring-text">{{ batchProgress }}/{{ batchTotal }}</span>
            </div>
          </template>
          <button
            class="break-btn--primary break-btn--ai"
            :disabled="batchGenerating || pendingNoteCount === 0"
            @click="startBatchGenerate"
          >
            {{ batchGenerating ? '生成中...' : (pendingNoteCount > 0 ? '一键生成全部笔记' : '无需生成') }}
          </button>
        </div>

        <button class="break-btn--primary" @click="onNext">继续推进</button>
      </div>

      <!-- 商店弹窗 -->
      <BreakShop
        v-if="gameState.showShop"
        :options="gameState.shopOptions"
        :star-jade="gameState.progress.starJade"
        :free-refresh-count="freeRefreshCount"
        @buy="onBuyShop"
        @close="onCloseShop"
        @refresh="onShopRefresh"
      />

      <!-- 补给站弹窗 -->
      <BreakSupply
        v-if="gameState.showSupply"
        :options="gameState.supplyOptions"
        @select="onSupplySelect"
      />

      <!-- Boss 奖励弹窗 -->
      <BreakBossReward
        v-if="gameState.showBossReward"
        :options="gameState.rewardOptions"
        @select="onBossSelect"
        @skip="onBossSkip"
      />

      <!-- 游戏结束面板 -->
      <BreakGameOver
        v-if="gameState.isGameOver || gameState.progress.isFinished"
        :is-victory="gameState.progress.isFinished"
        :completed-nodes="completedNodeCount"
        :total-nodes="TOTAL_NODES"
        :max-combo="maxCombo"
        :star-jade="gameState.progress.starJade"
        :character-count="gameState.progress.activeCharacters.length"
        @restart="onRestart"
        @back-to-library="onBackToLibrary"
      />
      <!-- 角色详情弹窗 -->
      <CharacterDetailModal
        v-if="showCharDetail"
        :character="selectedChar!"
        :character-index="selectedCharIndex"
        :total-characters="gameState.progress.activeCharacters.length"
        :skill-description="selectedCharSkill"
        :can-activate="selectedCharCanActivate"
        :bond-info="selectedCharBondInfo"
        @close="showCharDetail = false"
        @prev="navigateChar(-1)"
        @next="navigateChar(1)"
        @use-skill="handleUseSkill"
      />
      <!-- 设置弹窗 -->
      <ModalBreakSettings :show="showSettings" @close="showSettings = false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { BreakNodeType, TOTAL_NODES } from './types/break-types'
import type { ShopOption, BreakCharacter } from './types/break-types'
import { useBreakGame } from './composables/useBreakGame'
import { useBreakCharacters } from './composables/useBreakCharacters'
import BreakQuestionPanel from './components/BreakQuestionPanel.vue'
import BreakShop from './components/BreakShop.vue'
import BreakSupply from './components/BreakSupply.vue'
import BreakBossReward from './components/BreakBossReward.vue'
import BreakGameOver from './components/BreakGameOver.vue'
import CharacterDetailModal from './components/CharacterDetailModal.vue'
import ModalBreakSettings from './components/ModalBreakSettings.vue'
import configService from '@/services/config-service'
import { showToast } from '@/utils/toast'
import { useBreakSync } from './composables/useBreakSync'
import { batchGenerateNotes } from './composables/useBreakAI'
import { getNotes, initStorage } from './composables/breakStorage'

const router = useRouter()
const loading = ref(true)
const initError = ref<string | null>(null)
const showSettings = ref(false)
const batchGenerating = ref(false)
const batchProgress = ref(0)
const batchTotal = ref(0)
const batchFailedCount = ref(0)
const batchRound = ref(0)

const { initSync } = useBreakSync()

// ─── 音效系统 ──────────────────────────────────────────────────
const lastSound = reactive({ name: '', time: 0 })

// 预加载音频文件，复用 Audio 实例避免每次 fetch 造成延迟
const audioCache: Record<string, HTMLAudioElement> = {}
const SOUND_NAMES = ['select', 'correct', 'incorrect', 'navigate'] as const
SOUND_NAMES.forEach(name => {
  const a = new Audio(`/audio/${name}.mp3`)
  a.preload = 'auto'
  a.load()
  audioCache[name] = a
})

function playAudio(soundName: 'select' | 'correct' | 'incorrect' | 'navigate') {
  const s = configService.getUiSettings()
  if (!s.soundEffectsEnabled) return
  const now = Date.now()
  if (lastSound.name === soundName && now - lastSound.time < 100) return
  try {
    const audio = audioCache[soundName]
    audio.currentTime = 0
    audio.volume = s.soundVolume
    audio.play().catch(() => {})
    lastSound.name = soundName
    lastSound.time = now
  } catch { /* ignore */ }
}

const uiSettings = computed(() => configService.getUiSettings())

const {
  gameState,
  currentNode,
  phaseNodes,
  currentPhaseIndex,
  completedNodeCount,
  maxCombo,
  initGame,
  selectAnswer,
  submitAnswer,
  nextQuestion,
  surrender,
  closeShop,
  buyShopOption,
  selectSupplyCharacter,
  closeBossReward,
  selectBossRewardCharacter,
  canUseSkill,
  useSkill,
  getSkillDescription,
  refreshShop,
  revealedOptions,
} = useBreakGame()

const { loadData, getBondCounts, bonds } = useBreakCharacters()

const hpPercent = computed(() =>
  gameState.progress.maxHP > 0
    ? gameState.progress.currentHP / gameState.progress.maxHP
    : 0
)

const hpClass = computed(() =>
  hpPercent.value <= 0.25 ? 'page-break__stat-value--danger' : 'page-break__stat-value'
)

/** 阮·梅免费刷新剩余次数（0则付费5星琼） */
const freeRefreshCount = computed(() => {
  const char = gameState.progress.activeCharacters.find(c => {
    const eff = c.starEffects[c.starLevel - 1]
    return eff?.special?.type === 'shop_refresh'
  })
  if (!char) return 0
  const eff = char.starEffects[char.starLevel - 1]
  const remaining = eff?.special ? (eff.special.currentCharges ?? eff.special.charges) : 0
  return remaining === -1 ? 999 : (remaining ?? 0)
})

// ─── 事件包装（挂载音效）──────────────────────────────────────
function onSelect(key: string) { selectAnswer(key); playAudio('select') }
function onSubmit() {
  submitAnswer()
  playAudio(gameState.isAnswerCorrect ? 'correct' : 'incorrect')
}
function onNext() { nextQuestion(); playAudio('navigate') }
function onSurrender() { surrender(); playAudio('incorrect') }

function onShopRefresh() { refreshShop(); playAudio('select') }
function onBuyShop(opt: ShopOption) { buyShopOption(opt); playAudio('select') }
function onCloseShop() { closeShop(); playAudio('navigate') }
function onSupplySelect(char: BreakCharacter) { selectSupplyCharacter(char); playAudio('select') }
function onBossSelect(char: BreakCharacter) { selectBossRewardCharacter(char); playAudio('select') }
function onBossSkip() { closeBossReward(); playAudio('navigate') }
function onRestart() { handleRestart(); playAudio('navigate') }
function onBackToLibrary() { goToLibrary(); playAudio('navigate') }

/** 需要显示击破条和羽毛的节点类型 */
const showBattleInfo = computed(() => {
  const t = currentNode.value?.type
  return t === 'normal' || t === 'elite' || t === 'boss' || t === 'reward'
})

const NODE_SHORT_NAMES: Record<string, string> = {
  supply: '补给',
  normal: '普通',
  elite: '精英',
  boss: 'Boss',
  reward: '奖励',
  shop: '商店',
}

function nodeTypeShort(type: string): string {
  return NODE_SHORT_NAMES[type] ?? type
}

const NODE_COLORS: Record<string, string> = {
  normal: '#42a5f5',
  elite: '#ab47bc',
  boss: '#ef5350',
}

const nodeTypeColor = computed(() => {
  return NODE_COLORS[currentNode.value?.type ?? ''] ?? '#42a5f5'
})

async function loadBreakQuestions() {
  const response = await fetch('/data/break-questions.json')
  if (!response.ok) throw new Error(`题库加载失败 (HTTP ${response.status})`)
  return await response.json() as Array<{
    id: string
    title: string
    options: string[]
    answer: number
    explanation: string
    knowledgePointIds: string[]
  }>
}

async function startGame() {
  try {
    await initStorage()
    const [questions] = await Promise.all([loadBreakQuestions(), loadData()])
    if (!questions || questions.length === 0) {
      initError.value = '绯想击破专属题库为空，无法开始游戏。'
      loading.value = false
      return
    }
    const adaptedQuestions = questions.map(q => ({
      id: q.id,
      title: q.title,
      question: q.title,
      options: q.options,
      // 0-indexed 数字 → 字母 (3→D)
      answer: typeof q.answer === 'number'
        ? String.fromCharCode(65 + q.answer)
        : q.answer,
      explanation: q.explanation,
      notes: undefined as string | undefined,
    }))
    // 合并保存的笔记到题目
    try {
      const saved = getNotes()
      adaptedQuestions.forEach(q => { if (q.id && saved[q.id]) q.notes = saved[q.id] })
    } catch { /* ignore */ }
    if (!initGame(adaptedQuestions)) {
      initError.value = '题库为空，无法开始游戏。'
    }
    // 后台拉取远程笔记/标签（不阻塞游戏启动）
    initSync()
  } catch (e) {
    initError.value = `加载失败: ${e instanceof Error ? e.message : String(e)}`
  } finally {
    loading.value = false
  }
}

onMounted(() => startGame())

async function handleRestart() {
  loading.value = true
  initError.value = null
  await startGame()
}

function goToLibrary() {
  router.push('/library')
}

// ─── 批量 AI 笔记生成 ─────────────────────────────────────────

/** 本次旅行预抽题目中还没笔记的题目数 */
const pendingNoteCount = computed(() => {
  void batchRound.value
  const saved = getNotes()
  const ids = gameState.progress.preDrawnQuestionIds.filter(Boolean)
  return ids.filter(id => !saved[id]).length
})

async function startBatchGenerate() {
  if (batchGenerating.value) return
  const allIds = gameState.progress.preDrawnQuestionIds.filter(Boolean)
  if (allIds.length === 0) return

  batchGenerating.value = true
  batchProgress.value = 0
  batchTotal.value = 0

  try {
    const result = await batchGenerateNotes(allIds, gameState.allQuestions, (done, total) => {
      batchProgress.value = done
      batchTotal.value = total
    })
    batchFailedCount.value = result.failed
    // 诊断：检查预抽池覆盖情况
    const postNotes = getNotes()
    const covered = allIds.filter(id => postNotes[id]).length
    console.log(`[BatchGen] 预抽池 ${allIds.length} 题，已有笔记: ${covered}, 缺失: ${allIds.length - covered}`)
    if (result.succeeded > 0) showToast(`已生成 ${result.succeeded} 题笔记${result.failed > 0 ? `，${result.failed} 题失败` : ''}`, 'success')
    else showToast('所有题目已有笔记，无需生成', 'info')
  } catch (e) {
    showToast(`批量生成失败: ${e instanceof Error ? e.message : '未知错误'}`, 'error')
  } finally {
    batchGenerating.value = false
    batchRound.value++
  }
}

// ═══════════════════════════════════════════════════════════════
// 角色详情弹窗
// ═══════════════════════════════════════════════════════════════

const showCharDetail = ref(false)
const selectedCharIndex = ref(0)

/** 状态栏可见的前3个角色 + 溢出数 */
const visibleChars = computed(() =>
  gameState.progress.activeCharacters.slice(0, 3)
)
const overflowCount = computed(() =>
  Math.max(0, gameState.progress.activeCharacters.length - 3)
)

/** 当前选中的角色 */
const selectedChar = computed(() =>
  gameState.progress.activeCharacters[selectedCharIndex.value] ?? null
)

/** 选中的角色技能描述 */
const selectedCharSkill = computed(() => {
  const char = selectedChar.value
  if (!char) return '暂无技能'
  const desc = getSkillDescription(char.id)
  return desc || '暂无描述'
})

/** 仅永琳的 potion 可主动激活 */
const ACTIVATABLE_SKILLS = new Set(['potion'])

const selectedCharCanActivate = computed(() => {
  const char = selectedChar.value
  if (!char) return false
  const effect = char.starEffects[char.starLevel - 1]
  if (!effect?.special) return false
  if (!ACTIVATABLE_SKILLS.has(effect.special.type)) return false
  return canUseSkill(char.id)
})

/** 选中角色的羁绊信息 */
const selectedCharBondInfo = computed(() => {
  const char = selectedChar.value
  if (!char) return null
  const counts = getBondCounts(gameState.progress.activeCharacters)
  const bond = bonds.value.find(b => b.id === char.bondGroup)
  if (!bond) return null
  const currentCount = counts.get(char.bondGroup) ?? 0

  // 找下一个阈值
  const nextThreshold = bond.thresholds
    .filter(t => t.count > currentCount)
    .sort((a, b) => a.count - b.count)[0]

  return {
    name: bond.name,
    currentCount,
    nextThreshold: nextThreshold
      ? {
          count: nextThreshold.count,
          desc: nextThreshold.effects.map(e => {
            const labels: Record<string, string> = {
              hp_recovery_per_node: `每节点回复${e.value}HP`,
              genki_on_elite_perfect: `精英节点完美通关时+${e.value}元气`,
              star_jade_per_perfect: `节点完美通关时+${e.value}星琼`,
            }
            return labels[e.type] ?? `${e.type}+${e.value}`
          }).join('，'),
        }
      : undefined,
  }
})

function openCharDetail(index: number) {
  selectedCharIndex.value = index
  showCharDetail.value = true
}

function navigateChar(delta: number) {
  const len = gameState.progress.activeCharacters.length
  selectedCharIndex.value = (selectedCharIndex.value + delta + len) % len
}

function handleUseSkill(characterId: string) {
  useSkill(characterId)
}
</script>

<style>
@import './page-break.css';
</style>
