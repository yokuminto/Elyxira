// ============================================================
// 绯想击破（Break）模式 — 全部 TypeScript 类型定义
// 来源：elyxira_flutter/lib/data/models/break_state.dart & break_character.dart
// ============================================================

// ─── 枚举 ────────────────────────────────────────────────────

/** 节点类型 */
export enum BreakNodeType {
  Normal = 'normal',
  Elite = 'elite',
  Boss = 'boss',
  Reward = 'reward',
  Shop = 'shop',
  Supply = 'supply',
}

/** 商店 Buff 类型 */
export enum ShopBuffType {
  ExtraBreak = 'extra_break',
  HpRestore = 'hp_restore',
  StarJadeBoost = 'star_jade_boost',
  CombatResume = 'combat_resume',
}

// ─── 节点 ────────────────────────────────────────────────────

/** 单个地图节点 */
export interface BreakNode {
  id: string
  type: BreakNodeType
  /** 总击破值 */
  toughness: number
  /** 当前剩余击破值 (toughness → 0 即击破) */
  currentToughness: number
  /** 难度：0/1/2 对应第1/2/3 层 */
  difficulty: number
  /** 关联知识点 ID */
  knowledgePointIds: string[]
  /** 节点是否已完成 */
  isComplete: boolean
  /** 羽毛计数 (0-3，满3强制击破 + 额外扣10HP) */
  featherCount: number
}

// ─── 角色 ────────────────────────────────────────────────────

/** 角色特殊技能 */
export interface BreakCharacterSpecial {
  /** 技能类型 */
  type: 'combat_resume' | 'knowledge_card' | 'potion' | 'shop_refresh' | 'perfect_recovery' | 'reward_double' | 'genki_charge' | 'extra_reward_node'
  /** 冷却回合数 (0 = 无冷却) */
  cooldown: number
  /** 充能次数 (-1 = 无限) */
  charges: number
  /** 当前冷却 */
  currentCooldown?: number
  /** 当前剩余充能 */
  currentCharges?: number
}

/** 角色星级效果 */
export interface StarEffect {
  /** 对应星级 (1-3) */
  star: number
  /** 额外击破值 */
  breakBonus: number
  /** 分数倍率 */
  scoreMultiplier: number
  /** 特殊技能 */
  special?: BreakCharacterSpecial
  /** 额外答题机会 */
  extraChances: number
  /** 每节点 HP 恢复 */
  hpRecovery: number
  /** 排除选项数 */
  optionReveal: number
}

/** 角色数据 */
export interface BreakCharacter {
  /** 唯一标识 */
  id: string
  /** 角色名 */
  name: string
  /** 来源作品 */
  source: 'touhou' | 'hsr'
  /** 当前星级 (1-3，初始1，重复获取升星) */
  starLevel: number
  /** 羁绊分组 */
  bondGroup: string
  /** 星级效果数组（索引 = starLevel - 1） */
  starEffects: StarEffect[]
}

// ─── 游戏进度 ───────────────────────────────────────────────

/** 游戏进度状态 */
export interface BreakProgress {
  /** 当前节点索引 (0-26) */
  currentNodeIndex: number
  /** 全部 27 个节点 */
  nodes: BreakNode[]
  /** 当前层 (1-3) */
  phase: number
  /** 连击数 */
  combo: number
  /** 星琼货币 */
  starJade: number
  /** 已招募角色 */
  activeCharacters: BreakCharacter[]
  /** 当前层已答题数 */
  phaseQuestionsAnswered: number
  /** 游戏是否已开始 */
  isStarted: boolean
  /** 游戏是否已通关 */
  isFinished: boolean
  /** 当前 HP */
  currentHP: number
  /** 最大 HP */
  maxHP: number
  /** 战斗续行层数（抵消答错惩罚） */
  combatResume: number
  /** 元气层数 */
  genki: number
  /** 当前节点是否完美（0 失误） */
  isNodePerfect: boolean
  /** 额外击破充能次数 */
  extraBreakCharges: number
  /** 星琼加成是否激活 */
  starJadeBoostActive: boolean
  /** 本次游戏中出现过的题目 ID 列表（供批量生成笔记使用） */
  seenQuestionIds: string[]
}

// ─── 商店 ────────────────────────────────────────────────────

/** 商店 Buff */
export interface ShopBuff {
  type: ShopBuffType
  name: string
  description: string
  cost: number
}

/** 商店选项 */
export interface ShopOption {
  type: 'character' | 'buff'
  character?: BreakCharacter
  buff?: ShopBuff
  cost: number
}

// ─── 羁绊 ────────────────────────────────────────────────────

/** 羁绊效果 */
export interface BondEffect {
  type: string
  value: number
}

/** 羁绊阈值 */
export interface BondThreshold {
  /** 所需人数 */
  count: number
  effects: BondEffect[]
}

/** 羁绊组 */
export interface BondGroup {
  id: string
  name: string
  thresholds: BondThreshold[]
}

// ─── 游戏顶层状态 ────────────────────────────────────────────

/** 游戏完整状态（响应式根对象） */
export interface BreakGameState {
  progress: BreakProgress
  /** 全部可用题目池 */
  allQuestions: import('@/services/config-service').Question[]
  /** 当前节点展示的题目 */
  currentQuestion: import('@/services/config-service').Question | null
  /** 用户选中的答案 key */
  selectedAnswer: string | null
  /** 是否已提交答案 */
  isAnswerSubmitted: boolean
  /** 提交的答案是否正确 */
  isAnswerCorrect: boolean
  /** 是否显示 Boss 奖励弹窗 */
  showBossReward: boolean
  /** 是否显示商店弹窗 */
  showShop: boolean
  /** 是否显示补给站弹窗 */
  showSupply: boolean
  /** Boss 击败后的可招募角色 */
  rewardOptions: BreakCharacter[]
  /** 商店当前选项 */
  shopOptions: ShopOption[]
  /** 补给站候选角色 (3个) */
  supplyOptions: BreakCharacter[]
  /** 游戏是否结束 */
  isGameOver: boolean
  /** 当前节点被揭示的错误选项数 */
  revealedOptions?: number
  /** 额外答题机会（答错免罚） */
  extraChancesRemaining?: number
}

// ─── 辅助常量 ────────────────────────────────────────────────

/** 节点类型对应的默认击破值 */
export const NODE_TOUGHNESS: Record<BreakNodeType, number> = {
  [BreakNodeType.Normal]: 3,
  [BreakNodeType.Elite]: 5,
  [BreakNodeType.Boss]: 8,
  [BreakNodeType.Reward]: 1,
  [BreakNodeType.Shop]: 0,
  [BreakNodeType.Supply]: 0,
}

/** 总节点数 */
export const TOTAL_NODES = 27
/** 每层节点数 */
export const NODES_PER_PHASE = 9
/** 节点类型对应的星琼奖励 */
export const NODE_STAR_JADE_REWARD: Partial<Record<BreakNodeType, number>> = {
  [BreakNodeType.Normal]: 10,
  [BreakNodeType.Elite]: 20,
  [BreakNodeType.Boss]: 40,
  [BreakNodeType.Reward]: 20,
}

/** 角色招募费用 (星琼) */
export const CHARACTER_RECRUIT_COST = 30
