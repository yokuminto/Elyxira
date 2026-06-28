# 回顾 — 击破字段重构 + Bug 修复 (2026-06-25)

## 背景

用户发现击破值扣除存在异常，排查后确认 root cause 是 `breakBonus` 字段语义混乱：
- 角色 `StarEffect.breakBonus` 原用作"击破加成"（flat 累加），但无技能描述对应
- 用户期望所有角色击破倍数默认为 1，由全局变量控制，未来技能通过修改全局变量生效

## 改动摘要

### 1. 击破字段重构

**旧**: 角色 StarEffect 的 `breakBonus` (0/1/2) → 累加到 `baseBreak = 1 + sum(breakBonus) + genki`

**新**: 三个全局字段挂在 `BreakProgress` 上，角色数据不参与击破计算：

| 字段 | 默认 | 聚合 |
|------|:---:|------|
| `baseBreak` | 1 | 全局固定（未来技能可改） |
| `breakMultiplier` | 1 | MAX（未来技能可翻倍） |
| `breakBonus` | 0 | SUM（未来技能可累加） |

**新公式**: `breakDamage = baseBreak * breakMultiplier + breakBonus + genki + extraBreakCharges`

当前行为: `1 × 1 + 0 + genki + extra = 1 + genki + extra`，与修复后等价。

### 2. Bug 修复

| Bug | 影响 | 修复 |
|-----|------|------|
| `surrender()` 不触发铃仙元气充能 | 投降时 genki 不积累 | 从 `submitAnswer` 复制 genki charge 逻辑 |
| `surrender()` 忽略 extraChances | 额外答题机会被浪费 | 优先消耗 extraChances，免罚返回 |
| 符华 perfect_recovery 使用聚合 hpRecovery | 多角色时完美恢复数超预期 | `fuHuaRecovery` 独立追踪，仅完美时触发 |
| `initGame/restartGame` 漏重置 `revealedOptions/extraChancesRemaining` | 多局游戏时选项排除状态残留 | 显式设 0 |

### 3. 数据同步

- `CHARACTER_POOL` (useBreakGame.ts): 删除全部 21 处 `breakBonus: N`
- `assets/data/break-characters.json`: 删除全部 `breakBonus` 字段
- `public/data/break-characters.json`: 同上

## 影响范围

- 击破计算: `useBreakGame.ts` — `_getActiveBonuses()` 移除 breakBonus 聚合, `submitAnswer()` 新公式
- 类型: `break-types.ts` — `StarEffect` 删 breakBonus, `BreakProgress` 加 3 字段
- 生命周期: `initGame()` + `restartGame()` 补全字段重置
- 角色数据: JSON ×2 + 内联池 ×1 移除 breakBonus

## 验证

- `npx tsc --noEmit`: 零报错
- 双 JSON 文件: `JSON.parse` 验证通过
- 完整 `BreakGameState` 15 字段 + `createDefaultProgress` 20 字段全部显式重置确认
- 多局连续 restart 路径 trace 通过
