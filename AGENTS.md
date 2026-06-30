# Elyxira — Agent 行为规则

> 本文档是 AI 开发助手的核心行为规则。每次会话自动加载。

## 1. 项目上下文

每次会话开始，按 stage-gate 顺序加载（冻结快照模式——session 开始后只读）：

### Stage 0 — 身份（必读，10 行）
- `.agent/BOOT.md` — 项目名、版本、技术栈、仓库

### Stage 1 — 约束（必读，≤4KB）
- `.agent/CONTEXT.md` — 架构约束、编码硬约束、CSS token、关键设计原则

### Stage 2 — 状态（必读）
- `.agent/TASKS.md` — 当前任务进度 + 已知问题（每次 session 重写顶部状态栏）

### Stage 3 — 记忆（必读，如有内容）
- `.agent/MEMORY.md` — agent 自学习事实。硬上限 2,200 chars；若超出，必须先 consolidate 再执行任务

### 按需加载
- `.agent/DECISIONS.md` — 做架构决策时查阅（21 条 ADR，含 supersession 标记）
- `session_search(query="关键词")` — 需要历史上下文时搜索跨 session，替代翻阅旧回顾文件
- `.agent/HISTORY.md` — 版本历史（6 个版本的关键事实）
- `.agent/SKILLS/retrospect/SKILL.md` — "沉淀"/"回顾"触发词时加载

## 2. 技术栈

| 组件 | 技术 |
|------|------|
| 语言 | TypeScript |
| 框架 | Vue 3 (Composition API + `<script setup>`) |
| 构建 | Vite 6 |
| 样式 | CSS 自定义变量 + scoped |
| 依赖 | markdown-it, vue-toastification, vue-router, yjs, y-webrtc, y-indexeddb, qrcode, Font Awesome 6 |
| P2P | Yjs CRDT + y-webrtc（PIN=AES-GCM）+ Cloudflare Worker 信令（`cloudflare-worker/`） |

## 3. 绯想击破模块规则

### 独立性
- `src/pages/break/` 是完全独立模块，不修改 quiz 代码
- 状态管理：Vue `reactive()` composable，不依赖 Pinia
- 题目来源：`public/data/break-questions.json`（fetch 加载）
- 笔记存储：IndexedDB via breakStorage.ts（独立于 configService）

### 代码搬迁铁律
**从任何参考源搬迁代码时，逐行复制，不做精简。**
只做最小化适配（数据源、存储方式），保留所有防御性代码（try/catch、超时、边界检查）。

## 4. 禁止事项

| 禁止 | 原因 |
|------|------|
| `@ts-ignore` / `as any` | 掩盖类型错误 |
| npm 11.x | Exit handler never called 已知 bug，升级或降级 npm 版本 |
| `--break-*` CSS 变量 | 暗黑主题已废弃，统一用 quiz 设计 token |
| 修改 `modal-settings.vue` | 刷题和 break 各自独立设置弹窗 |
| 搬迁代码时自行精简 | 导致功能缺失 |
| 组件中硬编码 `font-family` | 应继承 `--font-family` CSS 变量 |
| `rem` 用于字号 | 想随设置缩放必须用 `em` |

## 5. CSS 变量体系

全局变量定义在 `src/styles/variables.css`：
- `--c-blue: #4468ee` — 品蓝
- `--c-indigo: #3a42d5` — 深蓝
- `--c-green: #059669` — 绿松石（高饱和，白底可见）
- `--c-red: #e54960` — 绯红
- `--c-yellow: #d97706` — 金黄（高饱和，白底可见）
- `--c-sky: #3dacf7` — 天蓝
- `--c-pink: #e94db3` — 玫红
- `--c-purple: #7c3aed` — 紫罗兰
- `--c-orange: #ea580c` — 橙
- `--c-brown: #92400e` — 棕
- `--c-gray: #6b7280` — 灰
- `--c-cyan: #0891b2` — 青
- `--radius: 12px` — 卡片圆角
- `--radius-sm: 8px` — 小圆角
- `--radius-lg: 16px` — 大圆角
- `--radius-full: 50%` — 全圆角
- `--card: white` — 卡片底色

## 6. 目录约定

| 目录 | 用途 |
|------|------|
| `.agent/` | Hermes 风格分层记忆——BOOT(身份) / CONTEXT(冻结快照) / MEMORY(自学习) / DECISIONS(ADR) / TASKS(状态) / HISTORY(版本) / PRUNE_LOG(审计) |
| `.agent/SKILLS/` | 可复用技能（retrospect 等），"沉淀"等触发词时加载 |
| `cloudflare-worker/` | 自部署 P2P 信令服务器（wrangler deploy） |
