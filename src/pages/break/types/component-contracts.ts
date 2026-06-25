// ============================================================
// component-contracts.ts — 全部 UI 组件的 Props / Emits 接口
//
// 此文件定义所有组件的输入输出契约。
// 各子智能体开发组件时，严格遵循此接口。
// 集成方（page-break.vue）按此接口绑定数据。
// ============================================================

import type {
  BreakCharacter,
  ShopOption,
  BreakNodeType,
} from './break-types'
import type { Question } from '@/services/config-service'

// ═══════════════════════════════════════════════════════════════
// BreakQuestionPanel.vue — 题目展示 + 选项 + 答题交互
// ═══════════════════════════════════════════════════════════════

export interface BreakQuestionPanelProps {
  /** 当前展示的题目 */
  question: Question
  /** 当前选中的答案 key（如 "A", "B"...），null = 未选择 */
  selectedAnswer: string | null
  /** 是否已提交答案 */
  isSubmitted: boolean
  /** 提交的答案是否正确 */
  isCorrect: boolean
  /** 当前节点信息（用于显示节点类型标签） */
  currentNodeType: BreakNodeType
  /** 当前 HP（用于低血量警告提示） */
  currentHP: number
  /** 最大 HP */
  maxHP: number
  /** 角色技能揭示的错误选项数（角色星级效果） */
  revealedOptions?: number
}

export interface BreakQuestionPanelEmits {
  /** 用户选择了一个答案 */
  (e: 'select', answerKey: string): void
  /** 用户点击提交 */
  (e: 'submit'): void
  /** 用户点击下一题/进入下一节点 */
  (e: 'next'): void
  /** 用户点击投降 */
  (e: 'surrender'): void
}

// ═══════════════════════════════════════════════════════════════
// BreakShop.vue — 商店弹窗
// ═══════════════════════════════════════════════════════════════

export interface BreakShopProps {
  /** 商店选项列表（角色/Buff） */
  options: ShopOption[]
  /** 当前星琼余额 */
  starJade: number
  /** 阮·梅免费刷新次数 */
  freeRefreshCount?: number
}

export interface BreakShopEmits {
  /** 购买某个选项 */
  (e: 'buy', option: ShopOption): void
  /** 关闭商店 */
  (e: 'close'): void
  /** 免费刷新（阮·梅技能） */
  (e: 'refresh'): void
}

// ═══════════════════════════════════════════════════════════════
// BreakSupply.vue — 补给站选角弹窗
// ═══════════════════════════════════════════════════════════════

export interface BreakSupplyProps {
  /** 可选角色列表（3个） */
  options: BreakCharacter[]
}

export interface BreakSupplyEmits {
  /** 选择了一个角色 */
  (e: 'select', character: BreakCharacter): void
}

// ═══════════════════════════════════════════════════════════════
// BreakBossReward.vue — Boss 击败后招募弹窗
// ═══════════════════════════════════════════════════════════════

export interface BreakBossRewardProps {
  /** 可招募角色列表 */
  options: BreakCharacter[]
}

export interface BreakBossRewardEmits {
  /** 选择了角色 */
  (e: 'select', character: BreakCharacter): void
  /** 跳过（不招募） */
  (e: 'skip'): void
}

// ═══════════════════════════════════════════════════════════════
// BreakGameOver.vue — 游戏结束面板
// ═══════════════════════════════════════════════════════════════

export interface BreakGameOverProps {
  /** 是否通关（true=全部完成，false=HP归零死亡） */
  isVictory: boolean
  /** 完成节点数 */
  completedNodes: number
  /** 总节点数 */
  totalNodes: number
  /** 最高连击 */
  maxCombo: number
  /** 获得星琼 */
  starJade: number
  /** 招募角色数 */
  characterCount: number
  /** 错误信息（非空时显示错误面板而非结算面板） */
  errorMessage?: string
}

export interface BreakGameOverEmits {
  /** 重新开始 */
  (e: 'restart'): void
  /** 返回题库 */
  (e: 'back-to-library'): void
}

// ═══════════════════════════════════════════════════════════════
// CharacterCard.vue — 角色卡片（可复用子组件）
// ═══════════════════════════════════════════════════════════════

export interface CharacterCardProps {
  /** 角色数据 */
  character: BreakCharacter
  /** 显示模式 */
  mode?: 'compact' | 'full'
  /** 是否显示技能描述 */
  showSkill?: boolean
  /** 技能描述文本（外部传入） */
  skillDescription?: string
  /** 是否显示价格（商店中使用） */
  price?: number
  /** 是否可选（高亮状态） */
  selectable?: boolean
  /** 是否已选中 */
  selected?: boolean
}

export interface CharacterCardEmits {
  /** 点击角色卡片 */
  (e: 'click', character: BreakCharacter): void
}
