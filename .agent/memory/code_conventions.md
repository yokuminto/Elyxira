# 编码规范 — Elyxira

## TypeScript / Vue 3

### 组件结构
- 所有组件使用 `<script setup lang="ts">`
- Props/Emits 类型通过接口定义，放在 `component-contracts.ts`
- 样式使用 `<style scoped>` 或引入独立 CSS 文件

### 命名约定

| 元素 | 规范 | 示例 |
|------|------|------|
| Vue 组件 | PascalCase | `BreakQuestionPanel.vue` |
| Composable | `use` + PascalCase | `useBreakGame.ts` |
| 类型文件 | kebab-case | `break-types.ts` |
| 页面 CSS | `page-{name}.css` | `page-break.css` |
| CSS 类名 | BEM + kebab-case | `.break-route__node--current` |
| 事件 emit | kebab-case | `@use-skill`, `@back-to-library` |

### Props/Emits 契约
- 所有组件的 Props/Emits 统一定义在 `component-contracts.ts`
- 组件代码中引用类型：`defineProps<BreakQuestionPanelProps>()`
- 模板中绑定使用 kebab-case：`:current-h-p="..." @character-tap="..."`

### CSS 变量体系
- 全局变量定义在 `src/styles/variables.css`
- 功能色使用别名：`--c-blue`, `--c-green`, `--c-red`
- 禁止在组件中重新定义 `--break-*` 暗黑变量（已废弃）
- 字体通过 CSS 自定义属性控制：`--font-family`, `--font-size`
- **scoped 样式覆盖规则**：scoped 属性选择器优先级高于全局 class，调试颜色问题时优先排查 scoped 样式中的 `color` 声明

### 四色法则（笔记渲染）
- 蓝（`--c-blue` / `--c-indigo`）：核心概念、定义、术语、括号补充
- 红（`--c-red` / `--c-pink`）：危急值、禁忌症、危险信号
- 绿（`--c-green`）：治疗方案、首选药物、预后良好
- 金（`--c-yellow`）：金标准检查、高频考点、诊断公式

## 游戏逻辑规范

### 状态管理
- 使用 Vue `reactive()` 管理游戏状态（不依赖 Pinia）
- 响应式追踪变量用 `ref()` 而非 `let`（如 `_maxComboValue`）
- 模块级变量仅用于非响应式追踪

### 流式处理规范（SSE/AI 生成）
- **TextDecoder flush**：流结束后必须调用 `decoder.decode()` 清空内部缓冲
- **缓冲区残留**：SSE 最后一行可能不带 `\n`，while 循环后需 flush
- **避免流式节流**：`setTimeout` 延迟渲染会被 `handleCompletion` 的 `clearTimeout` 误杀，改为直接渲染
- **`<think>` 标签**：跨 chunk 用状态机缓冲区处理，单 chunk 正则不可靠

### 代码搬迁原则（铁律）
- **逐行复制，不做裁剪** — 从参考源搬迁代码时，不允许省略任何逻辑
- **适配最小化** — 只改需要适配的部分（数据源、存储方式）
- **保留所有防御性代码** — try/catch、边界检查、超时处理全量保留

## 禁止事项

| 禁止 | 原因 |
|------|------|
| `@ts-ignore` / `as any` | 掩盖类型错误 |
| npm 11.x | Exit handler never called 已知 bug，升级或降级 npm 版本 |
| `--break-*` CSS 变量 | 暗黑主题已废弃，统一用 quiz 设计 token |
| 修改 `modal-settings.vue` | 刷题和 break 各自独立设置弹窗 |
| 在组件中硬编码 `font-family` | 应继承 `--font-family` CSS 变量 |
| 流式渲染用 `setTimeout` 节流 | 会导致最后一帧丢失 |
| `rem` 用于字号 | 想随设置缩放必须用 `em`，`rem` 始终相对于根 `<html>` |
