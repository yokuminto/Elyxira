// ============================================================
// useBreakCharacters.ts — 角色/羁绊加载与管理 Composable
//
// 契约文件。提供角色加载、羁绊计算、技能查询的纯函数签名。
// 实现者：严格按此接口实现，不得修改签名。
// 消费者：引用此 composable 获取角色数据。
// ============================================================

import { ref, computed, type Ref, type ComputedRef } from 'vue'
import type { BreakCharacter, BondGroup } from '../types/break-types'

// ─── 返回类型 ────────────────────────────────────────────────

export interface UseBreakCharactersReturn {
  // --- 响应式状态 ---
  /** 全部角色数据 */
  characters: Ref<BreakCharacter[]>
  /** 全部羁绊组数据 */
  bonds: Ref<BondGroup[]>
  /** 加载中标志 */
  loading: Ref<boolean>
  /** 错误信息 */
  error: Ref<string | null>

  // --- 计算属性 ---
  /** 当前队伍已激活的羁绊加成（key: 效果类型, value: 累加值） */
  activeBondBonuses: ComputedRef<Record<string, number>>

  // --- 方法 ---
  /**
   * 加载全部角色和羁绊数据
   * 数据源：assets/data/break-characters.json & break-bonds.json
   * 可通过 import 静态导入或 fetch 动态加载。
   */
  loadData: () => Promise<void>

  /**
   * 根据角色 ID 查找角色
   * @returns 找到的角色，找不到返回 undefined
   */
  getCharacterById: (id: string) => BreakCharacter | undefined

  /**
   * 统计当前队伍中各羁绊组的角色人数
   * @param activeCharacters 当前队伍角色列表
   * @returns Map<羁绊组ID, 人数>
   */
  getBondCounts: (activeCharacters: BreakCharacter[]) => Map<string, number>

  /**
   * 计算当前激活的羁绊加成
   * @param bondCounts 羁绊组人数统计
   * @returns 效果类型 → 累加值 的映射
   */
  calculateBondBonuses: (bondCounts: Map<string, number>) => Record<string, number>

  /**
   * 随机获取 N 个角色（用于补给站）
   * @param count 数量，默认 3
   * @param exclude 排除的角色 ID 列表
   * @returns 随机角色列表
   */
  getRandomCharacters: (count?: number, exclude?: string[]) => BreakCharacter[]
}

// ─── Composable 入口 ─────────────────────────────────────────

/**
 * 绯想击破 — 角色与羁绊管理
 *
 * @param activeCharactersRef - 可选。传入当前队伍的响应式引用，使 activeBondBonuses 自动追踪变化。
 *   不传时 activeBondBonuses 始终返回 {}，可改用 getBondCounts + calculateBondBonuses 手动计算。
 *
 * 用法：
 * ```ts
 * // 基础用法（不追踪队伍变化）
 * const { characters, bonds, loadData, getRandomCharacters } = useBreakCharacters()
 * await loadData()
 * const supplyOptions = getRandomCharacters(3)
 *
 * // 响应式羁绊（追踪队伍变化）
 * const activeCharacters = ref<BreakCharacter[]>([])
 * const { activeBondBonuses } = useBreakCharacters(activeCharacters)
 * // activeBondBonuses 自动随队伍变化更新
 * ```
 */
export function useBreakCharacters(
  activeCharactersRef?: Ref<BreakCharacter[]>,
): UseBreakCharactersReturn {
  // ═══════════════════════════════════════════════════════════
  // 签名和返回接口严格按此契约，不可更改。
  // 可选参数 activeCharactersRef 使 activeBondBonuses 响应式。
  // ═══════════════════════════════════════════════════════════

  const characters = ref<BreakCharacter[]>([])
  const bonds = ref<BondGroup[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function loadData(): Promise<void> {
    if (loading.value) return
    loading.value = true
    error.value = null
    try {
      const [charsModule, bondsModule] = await Promise.all([
        import('../../../../assets/data/break-characters.json'),
        import('../../../../assets/data/break-bonds.json'),
      ])
      characters.value = (charsModule.default ?? charsModule) as BreakCharacter[]
      bonds.value = (bondsModule.default ?? bondsModule) as BondGroup[]
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load character data'
      error.value = message
      console.error('[useBreakCharacters]', message)
    } finally {
      loading.value = false
    }
  }

  function getCharacterById(id: string): BreakCharacter | undefined {
    return characters.value.find(c => c.id === id)
  }

  function getBondCounts(activeCharacters: BreakCharacter[]): Map<string, number> {
    const counts = new Map<string, number>()
    for (const char of activeCharacters) {
      if (char.bondGroup) {
        counts.set(char.bondGroup, (counts.get(char.bondGroup) ?? 0) + 1)
      }
    }
    return counts
  }

  function calculateBondBonuses(bondCounts: Map<string, number>): Record<string, number> {
    const bonuses: Record<string, number> = {}
    for (const bond of bonds.value) {
      const count = bondCounts.get(bond.id) ?? 0
      for (const threshold of bond.thresholds) {
        if (count >= threshold.count) {
          for (const effect of threshold.effects) {
            bonuses[effect.type] = (bonuses[effect.type] ?? 0) + effect.value
          }
        }
      }
    }
    return bonuses
  }

  function getRandomCharacters(count = 3, exclude: string[] = []): BreakCharacter[] {
    const pool = characters.value.filter(c => !exclude.includes(c.id))
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  const activeBondBonuses = computed(() => {
    if (!activeCharactersRef?.value?.length) return {}
    const counts = getBondCounts(activeCharactersRef.value)
    return calculateBondBonuses(counts)
  })

  return {
    characters,
    bonds,
    loading,
    error,
    activeBondBonuses,
    loadData,
    getCharacterById,
    getBondCounts,
    calculateBondBonuses,
    getRandomCharacters,
  }
}
