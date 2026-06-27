// ============================================================
// useBreakGame.ts — 绯想击破核心游戏逻辑 Composable
//
// 契约文件。这是整个游戏模式的状态机。
// 迁移自 elyxira_flutter/lib/features/break/break_viewmodel.dart (846行)
//
// 实现者：严格按此接口实现，不得修改方法签名。
// 消费者：page-break.vue 和各子组件通过此 composable 获取/操作游戏状态。
// ============================================================

import { reactive, ref, computed, type Reactive, type ComputedRef } from 'vue'
import type { Question } from '@/services/config-service'
import type {
  BreakGameState,
  BreakProgress,
  BreakNode,
  BreakCharacter,
  BreakNodeType,
  ShopOption,
} from '../types/break-types'
import { ShopBuffType, NODE_TOUGHNESS, NODE_STAR_JADE_REWARD, NODES_PER_PHASE, TOTAL_NODES, CHARACTER_RECRUIT_COST } from '../types/break-types'
import { getNotes, recordAnswer, getStats } from './breakStorage'
import type { QuestionStats } from './breakStorage'

// ─── 角色池（内联自 assets/data/break-characters.json）────────

const CHARACTER_POOL: BreakCharacter[] = [
  {
    id: 'byakuren', name: '白露', source: 'hsr', starLevel: 1, bondGroup: 'xianzhou',
    starEffects: [
      { star: 1, scoreMultiplier: 1.0, special: { type: 'combat_resume', cooldown: 0, charges: 1 }, extraChances: 0, hpRecovery: 0, optionReveal: 0 },
      { star: 2, scoreMultiplier: 1.0, special: { type: 'combat_resume', cooldown: 0, charges: 2 }, extraChances: 0, hpRecovery: 2, optionReveal: 0 },
      { star: 3, scoreMultiplier: 1.0, special: { type: 'combat_resume', cooldown: 0, charges: 3 }, extraChances: 1, hpRecovery: 3, optionReveal: 0 },
    ],
  },
  {
    id: 'eirin', name: '八意永琳', source: 'touhou', starLevel: 1, bondGroup: 'touhou',
    starEffects: [
      { star: 1, scoreMultiplier: 1.0, special: { type: 'potion', cooldown: 6, charges: -1 }, extraChances: 0, hpRecovery: 3, optionReveal: 0 },
      { star: 2, scoreMultiplier: 1.0, special: { type: 'potion', cooldown: 5, charges: -1 }, extraChances: 0, hpRecovery: 5, optionReveal: 0 },
      { star: 3, scoreMultiplier: 1.0, special: { type: 'potion', cooldown: 4, charges: -1 }, extraChances: 1, hpRecovery: 7, optionReveal: 0 },
    ],
  },
  {
    id: 'ruanmei', name: '阮·梅', source: 'hsr', starLevel: 1, bondGroup: 'genius',
    starEffects: [
      { star: 1, scoreMultiplier: 1.0, special: { type: 'shop_refresh', cooldown: 0, charges: 1 }, extraChances: 0, hpRecovery: 0, optionReveal: 0 },
      { star: 2, scoreMultiplier: 1.0, special: { type: 'shop_refresh', cooldown: 0, charges: 2 }, extraChances: 0, hpRecovery: 0, optionReveal: 0 },
      { star: 3, scoreMultiplier: 1.0, special: { type: 'shop_refresh', cooldown: 0, charges: 3 }, extraChances: 0, hpRecovery: 0, optionReveal: 0 },
    ],
  },
  {
    id: 'fu_hua', name: '符华', source: 'hsr', starLevel: 1, bondGroup: 'xianzhou',
    starEffects: [
      { star: 1, scoreMultiplier: 1.0, special: { type: 'perfect_recovery', cooldown: 0, charges: -1 }, extraChances: 0, hpRecovery: 5, optionReveal: 0 },
      { star: 2, scoreMultiplier: 1.0, special: { type: 'perfect_recovery', cooldown: 0, charges: -1 }, extraChances: 0, hpRecovery: 10, optionReveal: 0 },
      { star: 3, scoreMultiplier: 1.0, special: { type: 'perfect_recovery', cooldown: 0, charges: -1 }, extraChances: 1, hpRecovery: 15, optionReveal: 0 },
    ],
  },
  {
    id: 'stelle', name: '星', source: 'hsr', starLevel: 1, bondGroup: 'genius',
    starEffects: [
      { star: 1, scoreMultiplier: 1.0, special: { type: 'reward_double', cooldown: 0, charges: -1 }, extraChances: 0, hpRecovery: 0, optionReveal: 0 },
      { star: 2, scoreMultiplier: 1.0, special: { type: 'reward_double', cooldown: 0, charges: -1 }, extraChances: 0, hpRecovery: 0, optionReveal: 0 },
      { star: 3, scoreMultiplier: 1.0, special: { type: 'reward_double', cooldown: 0, charges: -1 }, extraChances: 1, hpRecovery: 0, optionReveal: 0 },
    ],
  },
  {
    id: 'reisen', name: '铃仙', source: 'touhou', starLevel: 1, bondGroup: 'touhou',
    starEffects: [
      { star: 1, scoreMultiplier: 1.0, special: { type: 'genki_charge', cooldown: 0, charges: 1 }, extraChances: 0, hpRecovery: 0, optionReveal: 0 },
      { star: 2, scoreMultiplier: 1.0, special: { type: 'genki_charge', cooldown: 0, charges: 2 }, extraChances: 0, hpRecovery: 0, optionReveal: 0 },
      { star: 3, scoreMultiplier: 1.0, special: { type: 'genki_charge', cooldown: 0, charges: 3 }, extraChances: 0, hpRecovery: 0, optionReveal: 0 },
    ],
  },
  {
    id: 'sakuya', name: '咲夜', source: 'touhou', starLevel: 1, bondGroup: 'touhou',
    starEffects: [
      { star: 1, scoreMultiplier: 1.0, special: { type: 'extra_reward_node', cooldown: 0, charges: 5 }, extraChances: 0, hpRecovery: 0, optionReveal: 0 },
      { star: 2, scoreMultiplier: 1.0, special: { type: 'extra_reward_node', cooldown: 0, charges: 10 }, extraChances: 0, hpRecovery: 0, optionReveal: 0 },
      { star: 3, scoreMultiplier: 1.0, special: { type: 'extra_reward_node', cooldown: 0, charges: 15 }, extraChances: 0, hpRecovery: 0, optionReveal: 0 },
    ],
  },
]

// ─── 返回类型 ────────────────────────────────────────────────

export interface UseBreakGameReturn {
  /** 游戏完整状态 */
  gameState: Reactive<BreakGameState>

  // --- 便捷计算属性 ---
  /** 当前节点对象（按 currentNodeIndex） */
  currentNode: ComputedRef<BreakNode | null>
  /** 当前层节点列表（9个） */
  phaseNodes: ComputedRef<BreakNode[]>
  /** 当前层内索引 (0-8) */
  currentPhaseIndex: ComputedRef<number>
  /** HP 百分比 (0-1) */
  hpPercent: ComputedRef<number>
  /** HP 是否处于危险状态 (≤25%) */
  isHpLow: ComputedRef<boolean>
  /** 总完成节点数 */
  completedNodeCount: ComputedRef<number>
  /** 最高连击记录 */
  maxCombo: ComputedRef<number>
  /** 当前节点被揭示的错误选项数 */
  revealedOptions: ComputedRef<number>

  // ─── 生命周期 ──────────────────────────────────────────
  initGame: (questions: Question[]) => boolean
  restartGame: () => void

  // ─── 答题流程 ──────────────────────────────────────────
  selectAnswer: (answerKey: string) => void
  submitAnswer: () => void
  nextQuestion: () => void
  surrender: () => void

  // ─── 商店 ──────────────────────────────────────────────
  closeShop: () => void
  buyShopOption: (option: ShopOption) => boolean
  refreshShop: () => boolean

  // ─── 补给站 ────────────────────────────────────────────
  selectSupplyCharacter: (character: BreakCharacter) => void

  // ─── Boss 奖励 ─────────────────────────────────────────
  closeBossReward: () => void
  selectBossRewardCharacter: (character: BreakCharacter) => void

  // ─── 辅助方法 ──────────────────────────────────────────
  getSkillDescription: (characterId: string) => string
  canUseSkill: (characterId: string) => boolean
  useSkill: (characterId: string) => boolean
  getShopOptions: () => ShopOption[]
  getBossRewardOptions: () => BreakCharacter[]
}

// ─── 内部辅助函数类型 ───────────────────────────────────────

// ─── 技能描述表 ─────────────────────────────────────────────

const SKILL_DESCRIPTIONS: Record<string, string> = {
  byakuren: '每层开始获得1/2/3层战斗续行（随星级提升）。战斗续行可抵消一次答错，不扣HP、不加羽毛，上限3层。',
  eirin: '主动技能：制作药剂，随机获得战斗续行+1 / 回复15HP / 元气+1。冷却6/5/4个节点（星级越高冷却越短）。',
  ruanmei: '到达商店节点时可免费刷新商品，每层1/2/3次（随星级提升）。',
  fu_hua: '完美通过节点时（0次羽毛），额外恢复5/10/15点HP（随星级提升）。',
  stelle: '奖励节点的星琼收益翻倍。',
  reisen: '每次扣除羽毛时获得1层元气，每层最多触发1/2/3次（随星级提升）。元气提供额外击破伤害。',
  sakuya: '通过奖励节点时，额外获得5/10/15星琼（随星级提升）。',
}

// ─── Composable 入口 ─────────────────────────────────────────

export function useBreakGame(): UseBreakGameReturn {
  // ═══════════════════════════════════════════════════════════
  // 响应式游戏状态
  // ═══════════════════════════════════════════════════════════

  const gameState = reactive<BreakGameState>({
    progress: createDefaultProgress(),
    allQuestions: [],
    currentQuestion: null,
    selectedAnswer: null,
    isAnswerSubmitted: false,
    isAnswerCorrect: false,
    showBossReward: false,
    showShop: false,
    showSupply: false,
    rewardOptions: [],
    shopOptions: [],
    supplyOptions: [],
    isGameOver: false,
    gameError: null,
    revealedOptions: 0,
    extraChancesRemaining: 0,
  })

  /** 运行时最高连击追踪（通过 ref 响应式追踪） */
  const _maxComboValue = ref(0)
  let _bossRewardClaimedNode = -1 // 防止 Boss 奖励被反复领取
  let _questionShownAt = 0 // 题目展示时间戳（用于计算做题耗时）

  // ═══════════════════════════════════════════════════════════
  // 计算属性
  // ═══════════════════════════════════════════════════════════

  const currentNode = computed<BreakNode | null>(() => {
    const idx = gameState.progress.currentNodeIndex
    return gameState.progress.nodes[idx] ?? null
  })

  const phaseNodes = computed<BreakNode[]>(() => {
    const start = (gameState.progress.phase - 1) * NODES_PER_PHASE
    return gameState.progress.nodes.slice(start, start + NODES_PER_PHASE)
  })

  const currentPhaseIndex = computed<number>(() => {
    const start = (gameState.progress.phase - 1) * NODES_PER_PHASE
    return gameState.progress.currentNodeIndex - start
  })

  const hpPercent = computed<number>(() => {
    return gameState.progress.maxHP > 0
      ? gameState.progress.currentHP / gameState.progress.maxHP
      : 0
  })

  const isHpLow = computed<boolean>(() => gameState.progress.currentHP <= 25)

  const completedNodeCount = computed<number>(() => {
    return gameState.progress.nodes.filter(n => n.isComplete).length
  })

  const maxCombo = computed<number>(() => _maxComboValue.value)

  const revealedOptions = computed<number>(() => gameState.revealedOptions ?? 0)

  // ═══════════════════════════════════════════════════════════
  // 私有辅助
  // ═══════════════════════════════════════════════════════════

  /** 根据索引获取所属层 (1-3) */
  function _getPhaseForIndex(index: number): number {
    if (index <= NODES_PER_PHASE - 1) return 1
    if (index <= NODES_PER_PHASE * 2 - 1) return 2
    return 3
  }

  /** 根据索引获取节点类型 — 完美复刻 Flutter _getNodeTypeForIndex */
  function _getNodeTypeForIndex(index: number): BreakNodeType {
    const pos = index % 9
    if (pos === 8) return 'boss' as BreakNodeType
    if (pos === 4) return 'shop' as BreakNodeType
    if (pos === 5) return 'elite' as BreakNodeType
    if (pos === 1 || pos === 7) return 'reward' as BreakNodeType
    if (pos === 2 || pos === 3 || pos === 6) return 'normal' as BreakNodeType
    // pos 0: 第一层补给，其余 reward
    if (pos === 0) return index === 0 ? 'supply' as BreakNodeType : 'reward' as BreakNodeType
    return 'normal' as BreakNodeType
  }

  /** 根据节点类型获取击破值 */
  function _getToughnessForType(type: BreakNodeType): number {
    return NODE_TOUGHNESS[type]
  }

  /** 根据层获取难度 */
  function _getDifficultyForPhase(phase: number): number {
    return phase - 1
  }

  /** 节点类型对应星琼奖励 */
  function _getStarJadeForType(type: BreakNodeType): number {
    return NODE_STAR_JADE_REWARD[type] ?? 0
  }

  /** 生成全部 27 个节点 */
  function _generateNodes(): BreakNode[] {
    const nodes: BreakNode[] = []
    for (let i = 0; i < TOTAL_NODES; i++) {
      const phase = _getPhaseForIndex(i)
      const type = _getNodeTypeForIndex(i)
      const toughness = _getToughnessForType(type)
      nodes.push({
        id: `node-${i}`,
        type,
        toughness,
        currentToughness: toughness,
        difficulty: _getDifficultyForPhase(phase),
        knowledgePointIds: [],
        isComplete: type === 'shop',
        featherCount: 0,
      })
    }
    return nodes
  }

  /** 判断题目的正确答案 */
  function _checkAnswer(question: Question, userAnswer: string): boolean {
    const correct = question.answer
    if (typeof correct === 'number') {
      return userAnswer === String.fromCharCode(64 + correct)
    } else if (typeof correct === 'string') {
      return userAnswer === correct
    } else if (Array.isArray(correct)) {
      return correct.some(n => userAnswer === String.fromCharCode(64 + n))
    }
    return false
  }

  /** 记录题目答题统计（IndexedDB，fire-and-forget） */
  function _recordQuestionStats(questionId: string, isCorrect: boolean, duration: number): void {
    recordAnswer(questionId, isCorrect, duration).catch(() => { /* stats persistence is best-effort */ })
  }

  /** 按 ID 从题目池中查找 */
  function _getQuestionById(id: string): Question | null {
    if (!id) return null
    return gameState.allQuestions.find(q => q.id === id) ?? null
  }

  // ─── 题目池管理 ────────────────────────────────────────────

  // ═══════════════════════════════════════════════════════════
  // 8 盒加权抽题系统
  // ═══════════════════════════════════════════════════════════

  /** 阶段阈值 */
  const PHASE_THRESHOLDS = { early: 0.3, late: 0.6 }

  /** 安全阀：单盒权重上限 */
  const MAX_BOX_WEIGHT = 0.4

  /** 三阶段 × 四节点类型的权重表 [阶段][节点类型][盒1..8] */
  const BOX_WEIGHTS: Record<number, Record<string, number[]>> = {
    1: {
      boss:    [15, 10, 0, 0, 0, 0, 30, 45],
      elite:   [10, 5, 0, 0, 0, 5, 35, 45],
      normal:  [5, 0, 0, 0, 5, 10, 35, 45],
      reward:  [0, 0, 0, 40, 5, 10, 20, 25],
    },
    2: {
      boss:    [25, 20, 10, 0, 5, 0, 20, 20],
      elite:   [15, 15, 15, 0, 10, 10, 18, 17],
      normal:  [8, 8, 12, 0, 12, 12, 24, 24],
      reward:  [0, 0, 0, 50, 10, 10, 15, 15],
    },
    3: {
      boss:    [30, 25, 15, 0, 5, 0, 15, 10],
      elite:   [20, 20, 18, 0, 12, 8, 12, 10],
      normal:  [12, 12, 15, 5, 12, 12, 16, 16],
      reward:  [0, 0, 0, 55, 10, 10, 15, 10],
    },
  }

  /** 兜底链 [阶段][盒序号] */
  const FALLBACK_CHAINS: Record<number, number[]> = {
    1: [3, 7, 8, 5, 6, 4],
    2: [3, 7, 4, 5, 6, 8],
    3: [3, 4, 5, 6, 7, 8],
  }

  /** 当前游戏阶段（initGame 时计算，整局不变） */
  let _gamePhase = 1

  /** 8 盒预抽池（initGame 时按预期抽题量 ×1.5 预抽，节点消耗） */
  let _preDrawnBoxes: Record<number, string[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [] }

  /** 本局已抽题目 ID（跨盒去重） */
  let _drawnIds = new Set<string>()

  /** 计算当前阶段（1/2/3） */
  function _computePhase(): number {
    const stats = getStats()
    const doneCount = Object.keys(stats).length
    const total = gameState.allQuestions.length
    if (total === 0) return 1
    const ratio = doneCount / total
    if (ratio < PHASE_THRESHOLDS.early) return 1
    if (ratio < PHASE_THRESHOLDS.late) return 2
    return 3
  }

  /** 将一道题归类到盒子（1-8），s 为该题的统计数据 */
  function _classifyBox(s: QuestionStats | undefined): number {
    if (!s || s.answerCount === 0 || s.recentAnswers.length === 0) return 8

    const count = s.answerCount
    const recent = s.recentAnswers // [0] = 最新
    const avgDuration = recent.length > 0
      ? recent.reduce((sum, r) => sum + (r.duration || 0), 0) / recent.length
      : 0

    // 盒1: 难题 — 次数>3 ∧ 平均耗时>16s ∧ 最近错，或连续错≥3
    if ((count > 3 && avgDuration > 16 && !recent[0].correct)
        || (recent.length >= 3 && recent.slice(0, 3).every(r => !r.correct))) {
      return 1
    }

    // 盒2: 顽固 — 次数>3 ∧ 最近4次错≥2
    if (count > 3 && recent.length >= 4) {
      if (recent.slice(0, 4).filter(r => !r.correct).length >= 2) return 2
    }

    // 盒3: 波动 — 次数>3 ∧ 最近3次错==1
    if (count > 3 && recent.length >= 3) {
      if (recent.slice(0, 3).filter(r => !r.correct).length === 1) return 3
    }

    // 盒4: 奖励 — 次数>5 ∧ 平均耗时≤16s ∧ 最近5次全对
    if (count > 5 && avgDuration <= 16 && recent.length >= 5
        && recent.slice(0, 5).every(r => r.correct)) {
      return 4
    }

    // 盒5: 复杂 — 次数>3 ∧ 平均耗时>16s ∧ 最近3次全对
    if (count > 3 && avgDuration > 16 && recent.length >= 3
        && recent.slice(0, 3).every(r => r.correct)) {
      return 5
    }

    // 盒6: 熟悉 — 次数>3 ∧ 平均耗时≤16s ∧ 最近3次全对
    if (count > 3 && avgDuration <= 16 && recent.length >= 3
        && recent.slice(0, 3).every(r => r.correct)) {
      return 6
    }

    // 盒7: 陌生 — 兜底
    return 7
  }

  /** 构建 8 个盒子的题目 ID 索引（全题库分类） */
  function _buildFullBoxes(): Record<number, string[]> {
    const stats = getStats()
    const boxes: Record<number, string[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [] }
    for (const q of gameState.allQuestions) {
      if (!q.id) continue
      const box = _classifyBox(stats[q.id])
      if (box >= 1 && box <= 8) boxes[box].push(q.id)
    }
    return boxes
  }

  /** 从指定盒抽一题：先预抽（splice 消费）、再全量（过滤已抽） */
  function _drawFromBox(boxNum: number, fullBoxes: Record<number, string[]>): Question | null {
    // 一级：预抽盒（跳过已抽过的 → splice 取走）
    const preDrawn = _preDrawnBoxes[boxNum]
    if (preDrawn && preDrawn.length > 0) {
      for (let i = 0; i < preDrawn.length; i++) {
        if (!_drawnIds.has(preDrawn[i])) {
          const [qid] = preDrawn.splice(i, 1)
          _drawnIds.add(qid)
          const q = _getQuestionById(qid)
          if (q) return _syncNotesToQuestion(q)
        }
      }
    }
    // 二级：同号全量盒（过滤已抽过的）
    const full = fullBoxes[boxNum]
    if (full && full.length > 0) {
      const available = full.filter(id => !_drawnIds.has(id))
      if (available.length > 0) {
        const qid = available[Math.floor(Math.random() * available.length)]
        _drawnIds.add(qid)
        const q = _getQuestionById(qid)
        if (q) return _syncNotesToQuestion(q)
      }
    }
    return null
  }

  /** 加权抽取一题（三级回退，_drawnIds 跨盒去重） */
  function _drawQuestion(nodeType: string): Question | null {
    const fullBoxes = _buildFullBoxes()

    const rawWeights = BOX_WEIGHTS[_gamePhase]?.[nodeType]
    if (!rawWeights) {
      if (gameState.allQuestions.length === 0) return null
      const undrawn = gameState.allQuestions.filter(q => q.id && !_drawnIds.has(q.id))
      const pool = undrawn.length > 0 ? undrawn : gameState.allQuestions
      return _syncNotesToQuestion(pool[Math.floor(Math.random() * pool.length)])
    }

    const weights = [...rawWeights]

    // 安全阀：预抽盒权重 > 40% → 裁到上限
    let overflow = 0
    for (let i = 0; i < 8; i++) {
      if (_preDrawnBoxes[i + 1].length > 0) {
        const maxW = Math.floor(MAX_BOX_WEIGHT * 100)
        if (weights[i] > maxW) {
          overflow += weights[i] - maxW
          weights[i] = maxW
        }
      }
    }

    // 双重空盒权重清零（预抽 + 全量都空才清）
    for (let i = 0; i < 8; i++) {
      if (_preDrawnBoxes[i + 1].length === 0 && fullBoxes[i + 1].length === 0) {
        weights[i] = 0
      }
    }

    // 溢出权重按原始比例重分配给剩余非空盒
    if (overflow > 0) {
      const remaining = weights.reduce((s, w) => s + w, 0)
      if (remaining > 0) {
        for (let i = 0; i < 8; i++) {
          if (weights[i] > 0) {
            weights[i] += Math.floor(overflow * (rawWeights[i] / remaining))
          }
        }
      }
    }

    // 归一化 + 加权随机
    const totalW = weights.reduce((s, w) => s + w, 0)
    if (totalW > 0) {
      let r = Math.random() * totalW
      for (let i = 0; i < 8; i++) {
        r -= weights[i]
        if (r <= 0) {
          const q = _drawFromBox(i + 1, fullBoxes)
          if (q) return q
        }
      }
    }

    // 兜底链（先预抽、再全量，_drawFromBox 内已去重）
    const chain = FALLBACK_CHAINS[_gamePhase] || FALLBACK_CHAINS[1]
    for (const b of chain) {
      const q = _drawFromBox(b, fullBoxes)
      if (q) return q
    }

    // 全题库随机（优先未抽过的）
    if (gameState.allQuestions.length === 0) return null
    const undrawn = gameState.allQuestions.filter(q => q.id && !_drawnIds.has(q.id))
    const pool = undrawn.length > 0 ? undrawn : gameState.allQuestions
    return _syncNotesToQuestion(pool[Math.floor(Math.random() * pool.length)])
  }

  /** 同步 localStorage 最新笔记到题目对象上（返回新对象触发 Vue 响应式） */
  function _syncNotesToQuestion(q: Question): Question {
    if (!q.id) return q
    try {
      const notes = getNotes()
      if (notes[q.id]) {
        return { ...q, notes: notes[q.id] }
      }
    } catch { /* ignore */ }
    return q
  }

  /** 从角色池随机选取 N 个角色（所有角色等概率，不排除已有） */
  function _getRandomCharacters(count: number): BreakCharacter[] {
    const shuffled = [...CHARACTER_POOL].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count).map(c => ({ ...c, starLevel: 1 }))
  }

  /**
   * 将角色加入队伍：已存在则升星（最高3），否则新增
   * @returns true 如果角色是新加入（非升星）
   */
  function _addOrStarUpCharacter(character: BreakCharacter): boolean {
    const existing = gameState.progress.activeCharacters.find(c => c.id === character.id)
    if (existing) {
      if (existing.starLevel < 3) {
        existing.starLevel += 1
      }
      return false
    }
    gameState.progress.activeCharacters = [
      ...gameState.progress.activeCharacters,
      { ...character, starLevel: 1 },
    ]
    // 白露被动：加入队伍时立即触发战斗续行
    _triggerCombatResume(character)
    return true
  }

  /** 白露被动：根据当前星级给战斗续行 */
  function _triggerCombatResume(character: BreakCharacter) {
    const effect = character.starEffects[character.starLevel - 1]
    if (effect?.special?.type === 'combat_resume') {
      const charges = effect.special.charges === -1 ? effect.star : effect.special.charges
      gameState.progress = {
        ...gameState.progress,
        combatResume: Math.min(gameState.progress.combatResume + charges, 3),
      }
    }
  }

  /** 聚合当前队伍所有角色的有效加成 */
  function _getActiveBonuses() {
    let hpRecovery = 0
    let fuHuaRecovery = 0
    let hasRewardDouble = false
    let hasPerfectRecovery = false
    let genkiChargeRemaining = 0
    let totalOptionReveal = 0
    let totalExtraChances = 0
    let scoreMultiplier = 1.0
    for (const char of gameState.progress.activeCharacters) {
      const effect = char.starEffects[char.starLevel - 1]
      if (!effect) continue
      // 符华 hpRecovery 单独追踪 — 仅完美通关时触发
      if (effect.special?.type === 'perfect_recovery') {
        hasPerfectRecovery = true
        fuHuaRecovery += effect.hpRecovery
      } else {
        hpRecovery += effect.hpRecovery
      }
      totalOptionReveal += effect.optionReveal
      totalExtraChances += effect.extraChances
      scoreMultiplier = Math.max(scoreMultiplier, effect.scoreMultiplier)
      if (effect.special?.type === 'reward_double') hasRewardDouble = true
      if (effect.special?.type === 'genki_charge') {
        const remaining = (effect.special.currentCharges ?? effect.special.charges)
        if (remaining !== 0) genkiChargeRemaining += remaining === -1 ? 999 : remaining
      }
    }
    // 击破公式：baseBreak * breakMultiplier + breakBonus + genki + extraBreakCharges
    //       当前默认值 1 × 1 + 0 + genki + extra → 未来技能可改全局变量
    return { hpRecovery, fuHuaRecovery, hasRewardDouble, hasPerfectRecovery, genkiChargeRemaining, optionReveal: totalOptionReveal, extraChances: totalExtraChances, scoreMultiplier }
  }

  /** 生成商店选项（3个随机角色） */
  function _generateShopOptions(): ShopOption[] {
    return _getRandomCharacters(3).map(c => ({
      type: 'character' as const,
      character: c,
      cost: CHARACTER_RECRUIT_COST,
    }))
  }

  /** 生成补给站角色选项 (3个随机角色) */
  function _generateSupplyOptions(): BreakCharacter[] {
    return _getRandomCharacters(3)
  }

  /** 生成 Boss 奖励角色选项 (1-2个随机角色) */
  function _generateBossRewardOptions(): BreakCharacter[] {
    const count = Math.random() < 0.5 ? 1 : 2
    return _getRandomCharacters(count)
  }

  /** 从全题库分类中，按预期抽题量 ×1.5 预抽 8 盒题目 */
  function _preDrawFromFullBoxes(fullBoxes: Record<number, string[]>, nodes: BreakNode[]): Record<number, string[]> {
    const weights = BOX_WEIGHTS[_gamePhase]
    const expectedPerBox = new Array(8).fill(0)

    for (const node of nodes) {
      if (node.type === 'shop' || node.type === 'supply') continue
      const w = weights[node.type]
      if (!w) continue
      // 每节点预期抽题次数 = 击破值（答对最少次数）
      for (let i = 0; i < 8; i++) {
        expectedPerBox[i] += node.toughness * (w[i] / 100)
      }
    }

    const preDrawnBoxes: Record<number, string[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [] }
    const usedIds = new Set<string>()

    for (let i = 0; i < 8; i++) {
      const needed = Math.ceil(expectedPerBox[i] * 1.5)
      const available = fullBoxes[i + 1].filter(id => !usedIds.has(id))
      const shuffled = [...available].sort(() => Math.random() - 0.5)
      const selected = shuffled.slice(0, Math.min(needed, shuffled.length))
      for (const id of selected) usedIds.add(id)
      preDrawnBoxes[i + 1] = selected
    }

    return preDrawnBoxes
  }

  // ═══════════════════════════════════════════════════════════
  // 公开方法
  // ═══════════════════════════════════════════════════════════

  /** 初始化 / 重新开始游戏 */
  function initGame(questions: Question[]): boolean {
    if (!questions || questions.length === 0) return false

    const nodes = _generateNodes()

    // 补给节点 (index 0) 自动触发 showSupply
    const isSupply = nodes[0].type === 'supply'

    Object.assign(gameState, {
      allQuestions: questions,
      currentQuestion: null,
      selectedAnswer: null,
      isAnswerSubmitted: false,
      isAnswerCorrect: false,
      showBossReward: false,
      showShop: false,
      showSupply: isSupply,
      rewardOptions: [],
      shopOptions: [],
      supplyOptions: isSupply ? _generateSupplyOptions() : [],
      isGameOver: false,
      gameError: null,
      revealedOptions: 0,
      extraChancesRemaining: 0,
      progress: {
        ...createDefaultProgress(),
        nodes,
        isStarted: true,
        preDrawnQuestionIds: [], // 稍后填充
      },
    })

    // 计算游戏阶段（跨局累积统计）
    _gamePhase = _computePhase()

    // 全题库分类 → 按预期抽题量 ×1.5 预抽 8 盒题目
    const fullBoxes = _buildFullBoxes()
    _preDrawnBoxes = _preDrawFromFullBoxes(fullBoxes, nodes)

    // 预抽池 ID 扁平列表（供补给站批量 AI 生成用）
    const allDrawnIds = Object.values(_preDrawnBoxes).flat()
    gameState.progress.preDrawnQuestionIds = allDrawnIds

    _drawnIds = new Set()

    // 补给节点无题；其他节点抽首题
    if (!isSupply) {
      const firstQ = _drawQuestion(nodes[0].type)
      if (!firstQ) {
        gameState.gameError = '题库加载失败，请检查题库数据'
        return true
      }
      gameState.currentQuestion = firstQ
      _questionShownAt = Date.now()
    }

    _maxComboValue.value = 0
    _bossRewardClaimedNode = -1
    return true
  }

  /** 重新开始（重置所有状态） */
  function restartGame(): void {
    Object.assign(gameState, {
      progress: createDefaultProgress(),
      allQuestions: [],
      currentQuestion: null,
      selectedAnswer: null,
      isAnswerSubmitted: false,
      isAnswerCorrect: false,
      showBossReward: false,
      showShop: false,
      showSupply: false,
      rewardOptions: [],
      shopOptions: [],
      supplyOptions: [],
      isGameOver: false,
      gameError: null,
      revealedOptions: 0,
      extraChancesRemaining: 0,
    })
    _maxComboValue.value = 0
    _bossRewardClaimedNode = -1
    _questionShownAt = 0
    _gamePhase = 1
    _preDrawnBoxes = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [] }
    _drawnIds = new Set()
  }

  /** 选择答案（仅记录，不判定正误） */
  function selectAnswer(answerKey: string): void {
    if (!gameState.progress.isStarted || gameState.isAnswerSubmitted || gameState.isGameOver || gameState.gameError) return
    gameState.selectedAnswer = answerKey
  }

  /** 提交当前答案：判定正误，更新 HP/击破/羽毛/连击/星琼 */
  function submitAnswer(): void {
    if (!gameState.progress.isStarted || gameState.selectedAnswer === null || gameState.isAnswerSubmitted || gameState.isGameOver || gameState.gameError) return

    const question = gameState.currentQuestion
    if (!question) return

    const isCorrect = _checkAnswer(question, gameState.selectedAnswer)

    // 记录题目答题统计（含耗时）
    const duration = _questionShownAt > 0 ? Math.round((Date.now() - _questionShownAt) / 1000) : 0
    if (question.id) _recordQuestionStats(question.id, isCorrect, duration)

    const p = gameState.progress
    const idx = p.currentNodeIndex
    const currentNode = p.nodes[idx]
    let newProgress = { ...p, nodes: [...p.nodes] }

    if (isCorrect) {
      // 答对：击破公式 = baseBreak * breakMultiplier + breakBonus + genki + extraBreakCharges
      const bonuses = _getActiveBonuses()
      let baseBreak = p.baseBreak * p.breakMultiplier + p.breakBonus + p.genki
      let newToughness = currentNode.currentToughness - baseBreak
      let usedExtraCharges = 0
      if (newToughness > 0 && p.extraBreakCharges > 0) {
        usedExtraCharges = Math.min(p.extraBreakCharges, newToughness)
        newToughness -= usedExtraCharges
      }
      newProgress.extraBreakCharges = Math.max(0, p.extraBreakCharges - usedExtraCharges)

      if (newToughness <= 0) {
        // 节点击破
        newProgress.nodes[idx] = {
          ...currentNode,
          currentToughness: 0,
          isComplete: true,
        }
        // 发放星琼奖励（星·奖励翻倍）
        let reward = _getStarJadeForType(currentNode.type)
        if (bonuses.hasRewardDouble && currentNode.type === 'reward') {
          reward *= 2
        }
        // 咲夜·额外星琼：通过奖励节点时额外获得 5/10/15 星琼
        if (currentNode.type === 'reward') {
          const sakuya = newProgress.activeCharacters.find(c => {
            const eff = c.starEffects[c.starLevel - 1]
            return eff?.special?.type === 'extra_reward_node'
          })
          if (sakuya) {
            const eff = sakuya.starEffects[sakuya.starLevel - 1]
            reward += eff.special!.charges
          }
        }
        // 分数倍率（角色星级效果）
        reward = Math.floor(reward * bonuses.scoreMultiplier)
        // 星琼增幅（商店 Buff，下一层收益翻倍，消耗后失效）
        if (p.starJadeBoostActive) {
          reward *= 2
          newProgress.starJadeBoostActive = false
        }
        newProgress.starJade += reward

        // 通用 HP 恢复（非符华角色，节点击破时始终生效）
        if (bonuses.hpRecovery > 0) {
          newProgress.currentHP = Math.min(p.currentHP + bonuses.hpRecovery, p.maxHP)
        }
        // 符华·完美恢复：仅完美通关时额外回复符华自身 hpRecovery
        if (bonuses.hasPerfectRecovery && p.isNodePerfect && bonuses.fuHuaRecovery > 0) {
          newProgress.currentHP = Math.min(newProgress.currentHP + bonuses.fuHuaRecovery, p.maxHP)
        }
        // 基础完美通关奖励：普通/精英/Boss/奖励节点无失误通过回复5HP
        if (p.isNodePerfect && (currentNode.type === 'normal' || currentNode.type === 'elite' || currentNode.type === 'boss' || currentNode.type === 'reward')) {
          newProgress.currentHP = Math.min(newProgress.currentHP + 5, p.maxHP)
        }
      } else {
        newProgress.nodes[idx] = {
          ...currentNode,
          currentToughness: newToughness,
        }
      }

      // 消耗 1 层元气（已计入本次击破加成）
      if (newProgress.genki > 0) {
        newProgress.genki -= 1
      }

      newProgress.combo += 1
      if (newProgress.combo > _maxComboValue.value) {
        _maxComboValue.value = newProgress.combo
      }
    } else {
      // 答错
      if (p.combatResume > 0) {
        // 战斗续行抵消：仅减续行层数，无 HP/羽毛惩罚
        newProgress.combatResume -= 1
        newProgress.combo = 0
        newProgress.isNodePerfect = false
      } else if (gameState.extraChancesRemaining && gameState.extraChancesRemaining > 0) {
        // 额外答题机会：免罚一次（不扣 HP/羽毛，仅重置连击）
        gameState.extraChancesRemaining -= 1
        newProgress.combo = 0
        newProgress.isNodePerfect = false
      } else {
        // 正常惩罚：扣 HP + 加羽毛
        const newHP = Math.max(p.currentHP - 10, 0)
        newProgress.currentHP = newHP
        newProgress.combo = 0
        newProgress.isNodePerfect = false

        // 增加羽毛计数
        const newFeather = currentNode.featherCount + 1
        newProgress.nodes[idx] = {
          ...currentNode,
          featherCount: newFeather,
        }

        // 铃仙·元气充能：每次扣羽毛时获得元气
        const bonuses = _getActiveBonuses()
        if (bonuses.genkiChargeRemaining > 0) {
          newProgress.genki += 1
          // 消耗充能
          for (const char of p.activeCharacters) {
            const eff = char.starEffects[char.starLevel - 1]
            if (eff?.special?.type === 'genki_charge' && (eff.special.currentCharges ?? eff.special.charges) !== 0) {
              if (eff.special.charges !== -1) {
                eff.special.currentCharges = (eff.special.currentCharges ?? eff.special.charges) - 1
              }
            }
          }
        }

        // 检查羽毛满 3 → 强制击破 + 额外扣 HP
        if (newFeather >= 3) {
          newProgress.nodes[idx] = {
            ...newProgress.nodes[idx],
            currentToughness: 0,
            isComplete: true,
          }
          newProgress.currentHP = Math.max(newHP - 10, 0)
        }

        // 检查游戏结束
        if (newProgress.currentHP <= 0) {
          Object.assign(gameState, {
            progress: { ...newProgress, currentHP: 0 },
            isAnswerSubmitted: true,
            isAnswerCorrect: isCorrect,
            isGameOver: true,
          })
          return
        }
      }
    }

    Object.assign(gameState, {
      progress: newProgress,
      isAnswerSubmitted: true,
      isAnswerCorrect: isCorrect,
    })
  }

  /** 进入下一题或下一节点 */
  function nextQuestion(): void {
    if (!gameState.progress.isStarted || gameState.isGameOver || gameState.gameError) return
    const p = gameState.progress
    const currentNode = p.nodes[p.currentNodeIndex]

    // 当前节点未完成 → 同节点新题（8盒加权抽题）
    if (!currentNode.isComplete) {
      const nextQ = _drawQuestion(currentNode.type)
      if (!nextQ) { gameState.gameError = '题库加载失败'; return }
      gameState.currentQuestion = nextQ
      _questionShownAt = Date.now()
      gameState.selectedAnswer = null
      gameState.isAnswerSubmitted = false
      gameState.isAnswerCorrect = false
      return
    }

    // Boss 节点刚被击破 → 显示 Boss 奖励（每个 Boss 仅一次）
    if (currentNode.type === 'boss' && !gameState.showBossReward
        && _bossRewardClaimedNode !== p.currentNodeIndex) {
      const rewardChars = _generateBossRewardOptions()
      if (rewardChars.length === 0) {
        // 无角色可招募，清理并跳过
        gameState.rewardOptions = []
        _bossRewardClaimedNode = -1
      } else {
        _bossRewardClaimedNode = p.currentNodeIndex
        Object.assign(gameState, {
          currentQuestion: null,
          selectedAnswer: null,
          isAnswerSubmitted: false,
          isAnswerCorrect: false,
          showBossReward: true,
          rewardOptions: rewardChars,
        })
        return
      }
    }

    // 当前节点完成 → 推进到下一节点
    const nextNodeIndex = p.currentNodeIndex + 1

    // 全部完成
    if (nextNodeIndex >= p.nodes.length) {
      gameState.progress = { ...p, isFinished: true }
      return
    }

    const nextNode = p.nodes[nextNodeIndex]
    const newPhase = _getPhaseForIndex(nextNodeIndex)

    // 冷却递减：每推进一个节点，所有角色技能冷却 -1
    for (const char of p.activeCharacters) {
      const eff = char.starEffects[char.starLevel - 1]
      if (eff?.special?.currentCooldown && eff.special.currentCooldown > 0) {
        eff.special.currentCooldown -= 1
      }
    }

    const baseProgress = {
      ...p,
      nodes: [...p.nodes],
      currentNodeIndex: nextNodeIndex,
      phase: newPhase,
      isNodePerfect: true,
      phaseQuestionsAnswered: 0,
    }

    // 白露被动：进入新层级时触发战斗续行
    if (newPhase > p.phase) {
      // 重置每层 buff
      baseProgress.starJadeBoostActive = false
      // 重置 铃仙 genki 充能次数
      for (const char of baseProgress.activeCharacters) {
        const eff = char.starEffects[char.starLevel - 1]
        if (eff?.special?.type === 'genki_charge') {
          eff.special.currentCharges = eff.special.charges
        }
      }
      // 白露战斗续行
      for (const char of baseProgress.activeCharacters) {
        _triggerCombatResume(char)
      }
    }

    // 新节点：刷新 optionReveal 和 extraChances
    gameState.revealedOptions = _getActiveBonuses().optionReveal
    gameState.extraChancesRemaining = _getActiveBonuses().extraChances

    // 商店节点
    if (nextNode.type === 'shop') {
      Object.assign(gameState, {
        progress: baseProgress,
        currentQuestion: null,
        selectedAnswer: null,
        isAnswerSubmitted: false,
        isAnswerCorrect: false,
        showShop: true,
        shopOptions: _generateShopOptions(),
      })
      return
    }

    // Boss 已被击败 → 显示 Boss 奖励
    if (nextNode.type === 'boss' && nextNode.isComplete) {
      Object.assign(gameState, {
        progress: baseProgress,
        currentQuestion: null,
        selectedAnswer: null,
        isAnswerSubmitted: false,
        isAnswerCorrect: false,
        showBossReward: true,
        rewardOptions: _generateBossRewardOptions(),
      })
      return
    }

    // 补给节点
    if (nextNode.type === 'supply') {
      Object.assign(gameState, {
        progress: baseProgress,
        currentQuestion: null,
        selectedAnswer: null,
        isAnswerSubmitted: false,
        isAnswerCorrect: false,
        showSupply: true,
        supplyOptions: _generateSupplyOptions(),
      })
      return
    }

    // 普通/精英/Boss(未击败)/奖励节点 → 8盒加权抽题
    const nextQ = _drawQuestion(nextNode.type)
    if (!nextQ) { gameState.gameError = '题库加载失败'; return }
    Object.assign(gameState, {
      progress: baseProgress,
      currentQuestion: nextQ,
      selectedAnswer: null,
      isAnswerSubmitted: false,
      isAnswerCorrect: false,
    })
    _questionShownAt = Date.now()
  }

  /** 投降（放弃当前题目） */
  function surrender(): void {
    if (!gameState.progress.isStarted || gameState.isAnswerSubmitted || gameState.isGameOver || gameState.gameError) return

    const p = gameState.progress
    const idx = p.currentNodeIndex
    const currentNode = p.nodes[idx]
    const newNodes = [...p.nodes]

    // 额外答题机会：优先消耗，免罚
    if (gameState.extraChancesRemaining && gameState.extraChancesRemaining > 0) {
      gameState.extraChancesRemaining -= 1
      Object.assign(gameState, {
        progress: { ...p, combo: 0, isNodePerfect: false },
        isAnswerSubmitted: true,
        isAnswerCorrect: false,
      })
      return
    }

    // 扣血 5
    let newHP = Math.max(p.currentHP - 5, 0)

    // 羽毛 +1
    const newFeather = currentNode.featherCount + 1
    newNodes[idx] = { ...currentNode, featherCount: newFeather }

    const newProgress = { ...p, nodes: newNodes, combo: 0, isNodePerfect: false }

    // 铃仙·元气充能：每次扣羽毛时获得元气
    const bonuses = _getActiveBonuses()
    if (bonuses.genkiChargeRemaining > 0) {
      newProgress.genki += 1
      for (const char of p.activeCharacters) {
        const eff = char.starEffects[char.starLevel - 1]
        if (eff?.special?.type === 'genki_charge' && (eff.special.currentCharges ?? eff.special.charges) !== 0) {
          if (eff.special.charges !== -1) {
            eff.special.currentCharges = (eff.special.currentCharges ?? eff.special.charges) - 1
          }
        }
      }
    }

    if (newFeather >= 3) {
      // 强制完成节点 + 额外扣 10 HP
      newNodes[idx] = {
        ...newNodes[idx],
        isComplete: true,
        currentToughness: 0,
      }
      newHP = Math.max(newHP - 10, 0)
    }

    newProgress.currentHP = newHP

    if (newHP <= 0) {
      Object.assign(gameState, {
        progress: { ...newProgress, currentHP: 0 },
        isAnswerSubmitted: true,
        isAnswerCorrect: false,
        isGameOver: true,
      })
      return
    }

    Object.assign(gameState, {
      progress: newProgress,
      isAnswerSubmitted: true,
      isAnswerCorrect: false,
    })
  }

  /** 关闭商店弹窗 */
  function closeShop(): void {
    gameState.showShop = false
  }

  /** 刷新商店（阮·梅免费，否则消耗5星琼） */
  function refreshShop(): boolean {
    // 优先检查阮·梅免费刷新
    const char = gameState.progress.activeCharacters.find(c => {
      const eff = c.starEffects[c.starLevel - 1]
      return eff?.special?.type === 'shop_refresh'
    })
    if (char) {
      const effect = char.starEffects[char.starLevel - 1]
      if (effect?.special) {
        const remaining = effect.special.currentCharges ?? effect.special.charges
        if (remaining > 0 || remaining === -1) {
          if (effect.special.charges !== -1) {
            effect.special.currentCharges = remaining - 1
          }
          gameState.shopOptions = _generateShopOptions()
          return true
        }
      }
    }
    // 付费刷新：消耗5星琼
    if (gameState.progress.starJade < 5) return false
    gameState.progress.starJade -= 5
    gameState.shopOptions = _generateShopOptions()
    return true
  }

  /** 购买商店选项 — 返回是否成功 */
  function buyShopOption(option: ShopOption): boolean {
    if (gameState.progress.starJade < option.cost) return false

    const p = gameState.progress
    let newProgress = { ...p, starJade: p.starJade - option.cost }

    if (option.type === 'character' && option.character) {
      gameState.progress = newProgress
      _addOrStarUpCharacter(option.character)
      return true
    } else if (option.type === 'buff' && option.buff) {
      switch (option.buff.type) {
        case ShopBuffType.ExtraBreak:
          newProgress.extraBreakCharges += 1
          break
        case ShopBuffType.HpRestore:
          newProgress.currentHP = Math.min(p.currentHP + 30, p.maxHP)
          break
        case ShopBuffType.StarJadeBoost:
          newProgress.starJadeBoostActive = true
          break
        case ShopBuffType.CombatResume:
          newProgress.combatResume = Math.min(p.combatResume + 1, 3)
          break
      }
    }

    gameState.progress = newProgress
    return true
  }

  /** 补给站选择角色（重复则升星） */
  function selectSupplyCharacter(character: BreakCharacter): void {
    _addOrStarUpCharacter(character)
    const p = gameState.progress
    const updatedNodes = [...p.nodes]

    // 标记补给节点完成
    if (p.currentNodeIndex < updatedNodes.length) {
      updatedNodes[p.currentNodeIndex] = {
        ...updatedNodes[p.currentNodeIndex],
        isComplete: true,
      }
    }

    gameState.progress = {
      ...p,
      nodes: updatedNodes,
    }
    gameState.showSupply = false
  }

  /** 关闭 Boss 奖励弹窗 */
  function closeBossReward(): void {
    gameState.showBossReward = false
  }

  /** Boss 奖励招募角色（重复则升星） */
  function selectBossRewardCharacter(character: BreakCharacter): void {
    _addOrStarUpCharacter(character)
    gameState.showBossReward = false
  }

  /** 获取角色技能描述 */
  function getSkillDescription(characterId: string): string {
    return SKILL_DESCRIPTIONS[characterId] ?? '暂无描述'
  }

  /** 判断角色技能是否可用 */
  function canUseSkill(characterId: string): boolean {
    const char = gameState.progress.activeCharacters.find(c => c.id === characterId)
    if (!char || char.starEffects.length === 0) return false
    const effect = char.starEffects[char.starLevel - 1]
    if (!effect?.special) return false
    // 冷却中不可用
    if (effect.special.cooldown > 0 && (effect.special.currentCooldown ?? 0) > 0) return false
    // charges === -1 表示无限使用（但受冷却限制）
    if (effect.special.charges === -1) return true
    const current = effect.special.currentCharges ?? effect.special.charges
    return current > 0
  }

  /** 使用角色技能 — 返回是否成功 */
  function useSkill(characterId: string): boolean {
    const char = gameState.progress.activeCharacters.find(c => c.id === characterId)
    if (!char || char.starEffects.length === 0) return false

    const effect = char.starEffects[char.starLevel - 1]
    if (!effect?.special) return false

    const special = effect.special

    // 检查充能
    if (special.charges !== -1) {
      const current = special.currentCharges ?? special.charges
      if (current <= 0) return false
      special.currentCharges = current - 1
    }

    // 设置冷却
    if (special.cooldown > 0) {
      special.currentCooldown = special.cooldown
    }

    // 执行技能效果
    const p = gameState.progress
    switch (special.type) {
      case 'potion': {
        const roll = Math.floor(Math.random() * 3)
        if (roll === 0) {
          gameState.progress = { ...p, combatResume: Math.min(p.combatResume + 1, 3) }
        } else if (roll === 1) {
          gameState.progress = { ...p, currentHP: Math.min(p.currentHP + 15, p.maxHP) }
        } else {
          gameState.progress = { ...p, genki: p.genki + 1 }
        }
        break
      }
      // shop_refresh / perfect_recovery / reward_double / genki_charge / extra_reward_node
      // 这些被动技能由对应的 UI 逻辑处理，此处仅消耗充能/设置冷却
      case 'knowledge_card':
        break
      default:
        break
    }

    return true
  }

  /** 获取当前商店选项列表 */
  function getShopOptions(): ShopOption[] {
    return gameState.shopOptions
  }

  /** 获取当前 Boss 奖励选项列表 */
  function getBossRewardOptions(): BreakCharacter[] {
    return gameState.rewardOptions
  }

  return {
    gameState,
    currentNode,
    phaseNodes,
    currentPhaseIndex,
    hpPercent,
    isHpLow,
    completedNodeCount,
    maxCombo,
    revealedOptions,
    initGame,
    restartGame,
    selectAnswer,
    submitAnswer,
    nextQuestion,
    surrender,
    closeShop,
    buyShopOption,
    refreshShop,
    selectSupplyCharacter,
    closeBossReward,
    selectBossRewardCharacter,
    getSkillDescription,
    canUseSkill,
    useSkill,
    getShopOptions,
    getBossRewardOptions,
  }
}

// ─── 工厂函数 ────────────────────────────────────────────────

/** 创建默认进度对象 */
export function createDefaultProgress(): BreakProgress {
  return {
    currentNodeIndex: 0,
    nodes: [],
    phase: 1,
    combo: 0,
    starJade: 0,
    activeCharacters: [],
    phaseQuestionsAnswered: 0,
    isStarted: false,
    isFinished: false,
    currentHP: 75,
    maxHP: 100,
    combatResume: 0,
    genki: 0,
    baseBreak: 1,
    breakMultiplier: 1,
    breakBonus: 0,
    isNodePerfect: true,
    extraBreakCharges: 0,
    starJadeBoostActive: false,
    preDrawnQuestionIds: [],
  }
}
