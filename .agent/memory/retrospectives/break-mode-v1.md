# 回顾 — 绯想击破 v1
**日期**: 2026-06-17

## 一、任务概述
从零构建绯想击破游戏化刷题模式，参考 Flutter 版 break_viewmodel.dart（846 行），迁移到 Vue 3 + TypeScript。

## 二、已完成的工作
- [x] 15 个文件从零创建（2 composable / 7 component / 3 type / 2 page / 1 CSS）
- [x] 3 个外部文件微改（router / library 入口 / home 入口）
- [x] Flutter 游戏逻辑逐行迁移（submitAnswer / nextQuestion / surrender / 商店 / 补给）
- [x] 笔记系统完整搬迁（包含 AI 生成、流式解析、自定义 Markdown 预处理）
- [x] 3 轮视觉重设计（暗黑科幻 → 蓝白医学 → 细节打磨）
- [x] 多轮 bug 修复（npm 兼容、答案编码、Boss 重复领取、缺少 defineProps 等）

## 三、反思与收获

### 做得好
- **契约优先** — 先写类型定义和接口，再并行派发 5 个子智能体施工。避免了接口冲突。
- **测试驱动调试** — 使用 Playwright 打开浏览器直接看渲染效果 + 抓 DOM 内容定位问题。
- **分层回退** — npm 失败换 pnpm、import 失败换 fetch、Vite 缓存杀掉进程重启。

### 可改进
- **搬迁代码时不应自行精简** — AI 多次判断某些逻辑"不需要"而省略（preprocessLineBreaks、AI 推理渲染），导致功能缺失。修正：铁律"逐行复制，不做裁剪"。
- **并行施工后应更仔细验收** — 子智能体各自的实现可能有细微差异（如 `defineProps` 存储与否），需逐一检查。
- **视觉设计应先确认再开发** — 第一版暗黑科幻全量开发完成后被否决，重新设计浪费了大量工时。

### 待跟进
- maxCombo 始终为 0（`_maxComboValue` 是普通 `let`，Vue computed 无法追踪）
- 6 个被动角色技能未接入游戏流程
- useBreakGame.ts（871 行）待拆分

## 四、经验总结

### 可复用的经验
1. **npm 11 + Node 24 组合必炸** → 检查环境，直接用 pnpm
2. **从 Flutter/Dart 迁 TS** → 注意答案编码差异（Flutter 用 `String.fromCharCode(64+n)`，数据驱动确认 0-indexed vs 1-indexed）
3. **Vue reactive 嵌套对象** → `Object.assign` 替换整个属性比深拷贝更高效可靠
4. **`rem` vs `em`** → 想让字号随设置变化，必须用 `em`（相对父级），`rem` 始终相对于根 `<html>`
5. **Vite 动态 import JSON** → 大文件（4MB）用 `fetch('/data/file.json')` 比 `await import()` 更可靠

### 应该沉淀为规范的
- 搬迁代码铁律（写入了 `code_conventions.md`）
- 禁止 `--break-*` CSS 变量（写入了 `design_decisions.md`）
- npm 改用 pnpm（写入了 `design_decisions.md`）
