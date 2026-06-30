# 版本历史

## v1.0 — 绯想击破初版 (2026-06-17)
- 从 Flutter 迁移到 Vue 3 + TypeScript，15 个新文件
- 确立代码搬迁铁律（逐行复制，不做精简）
- 视觉三轮迭代：暗黑科幻 → 蓝白医学 → 细节打磨

## v2.0 — Bug 修复与同步 (2026-06-18)
- 修复 7 项核心 Bug（maxCombo 响应式、被动技能、CSS 同步）
- `<think>` 标签跨 chunk 流式过滤 + TextDecoder flush
- 节点奖励重平衡（10/20/40/20），商店纯角色化
- CI/CD 自动部署上线

## v2.0.1 — 全面修复与增强 (2026-06-24)
- 修复 12 项 Bug（音效延迟、 structuredClone、流式过滤等）
- AI 提示词三模式分层（精简/完整/中间）+ 四单元大纲嵌入
- 题目标签系统（AI 输出 ` ```tags ` → 彩色徽章渲染）
- Prompt 编辑工具链（`.txt` + `build-prompt.ps1`）

## v2.0.2 — 云同步与存储重构 (2026-06-25)
- GitHub 云同步（Git Data API 批量提交，5 请求替代 2N）
- 批量 AI 笔记生成（补给站一键生成，并发生成 + 180s 超时）
- 存储从 localStorage 迁移到 IndexedDB（含自动升迁）
- 开局预抽共享题池（totalToughness × 1.5）
- 击破字段重构：角色 `breakBonus` → 全局 `baseBreak × multiplier + bonus`

## v2.1 — 智能抽题系统 (2026-06-28)
- 8 盒加权分类（难题/顽固/波动/奖励/复杂/熟悉/陌生/未做）
- 三阶段动态权重（一期<30% → 二期30-60% → 三期≥60%）
- 三级回退抽取（预抽盒 → 全量盒 → 兜底链 → 全题库随机）
- 答题耗时记录 + 生命周期守卫 + 错误状态面板

## v2.1.1 — P2P 跨设备同步 (2026-06-30)
- Yjs CRDT + y-webrtc DataChannel 直传，PIN 配对（6 位数字）
- 自部署 Cloudflare Worker 信令（Durable Object，2-peer 上限）
- AES-GCM 内建加密（PBKDF2 派生，password=PIN）
- 脱敏策略：token/apiKey 置空，远端合并保留本地敏感字段
- 防回环：`_isApplyingRemote` flag 阻断 mirror 死循环
