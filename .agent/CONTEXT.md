# 冻结快照 — Elyxira

> 本文件在 session 开始时作为冻结快照注入。修改只在下一次 session 生效。
> 详细 CSS 变量值、禁止事项表、技术栈详见 `AGENTS.md`，此处不重复。

## 架构约束

- **绯想击破独立模块**: `src/pages/break/` 完全独立于 quiz 模式，不共享状态、不修改 quiz 代码。状态管理用 Vue `reactive()` composable，不依赖 Pinia
- **路由**: hash 模式 (`createWebHashHistory`)
- **存储**: quiz 设置/统计用 localStorage；break 笔记/标签/统计用 IndexedDB (`breakStorage.ts`)，内存缓存读 + 异步写穿
- **组件**: 全部 `<script setup lang="ts">`，Props/Emits 契约在 `component-contracts.ts`

## 目录关键文件

| 文件 | 作用 | 行数 |
|------|------|------|
| `src/services/config-service.ts` | 设置 + quiz 状态管理 | ~2400 |
| `src/pages/quiz/page-quiz.vue` | 刷题主页面 | ~1815 |
| `src/pages/library/page-library.vue` | 题库管理 | ~2020 |
| `src/pages/break/composables/useBreakGame.ts` | 绯想击破游戏逻辑 | ~1383 |
| `src/pages/break/composables/breakStorage.ts` | IndexedDB 存储层 | ~323 |
| `src/pages/break/composables/useBreakSync.ts` | GitHub 云同步 | ~468 |
| `src/services/p2p-sync.ts` | P2P Yjs CRDT 同步 | ~590 |

## 编码硬约束

- **禁止**: `as any` / `@ts-ignore` / 组件内硬编码 `font-family` / `rem` 用于字号（用 `em`）
- **流式处理**: TextDecoder 结束必须 `decoder.decode()` flush；禁止 `setTimeout` 节流；`<think>` 标签用状态机跨 chunk 过滤
- **代码搬迁**: 逐行复制，不做精简；只改需要适配的部分；保留所有防御性代码
- **颜色**: 统一用 `--c-*` CSS 变量，禁止 `--break-*` 暗黑变量（已废弃），禁止 scoped 内覆盖全局颜色变量
- **npm**: 项目 npm 11.11，已知 bug 已在 npm 11.18 修复，建议 `npm i -g npm@11.18`

## 关键设计原则

1. **四色法则**: 蓝（概念/括号）、红（危急/禁忌）、绿（方案/治疗）、金（考点/公式）
2. **IndexedDB 写穿**: 内存缓存同步更新 + 异步 IndexedDB 落盘（fire-and-forget），读从内存
3. **P2P 镜像**: `mirrorToYjs()` 在 `_isApplyingRemote=true` 时自动 skip 防回环；settings token/apiKey 脱敏后广播
