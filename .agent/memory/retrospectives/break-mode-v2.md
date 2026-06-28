# 回顾 — 绯想击破 v2
**日期**: 2026-06-18

## 一、任务概述
修复绯想击破 v1 遗留的 7 项 Bug，同步 quiz/break 双模式 CSS，融合 AI 提示词，重平衡游戏数值，配置 CI/CD 自动部署。

## 二、已完成的工作
- [x] 7 项核心 Bug 修复（maxCombo 响应式、被动技能集成、咲夜额外节点等）
- [x] CSS markdown-body 体系同步（280 行，含 aside 气泡/表格/代码块/标题）
- [x] `<think>` 标签流式过滤（跨 chunk 状态机 + TextDecoder flush）
- [x] AI 流式渲染节流移除（解决最后一帧截断）
- [x] 提示词融合（爱莉希雅教授 + 正向临床推演 + 四色法则）
- [x] 节点奖励重平衡 + 完美通关回复
- [x] 商店重设计（纯角色，刷新 5 星琼）
- [x] 按钮音效全覆盖
- [x] Git 仓库整理 + 版本号 v2.0.0
- [x] CI/CD 自动部署（Node 22 + npm + GitHub Actions → elyxira.github.io）

## 三、反思与收获

### 做得好
- **先诊断再下药** — `<think>` 截断问题先确认 `finish_reason: stop`，排除了 API 侧原因后才定位到前端节流
- **模拟验证** — SSE 流式处理用 Node 脚本模拟各种场景（缺换行、TextDecoder 残留），快速验证修复效果
- **CSS 变量体系** — 全局变量 + scoped 覆盖的组合避免了样式冲突，markdown-body 同步时只加了容器级覆盖规则

### 可改进
- **节流是坑** — 250ms `setTimeout` 节流在大多数场景没问题，但和 `clearTimeout` + `handleCompletion` 的交互导致了数据丢失。以后流式渲染宁可多渲染几次也不要用延迟队列
- **TextDecoder 细节** — `{ stream: true }` 的内部缓冲是 SSE 处理的经典陷阱，应该作为流式处理的标准步骤文档化
- **类型错误拖延** — `adaptedQuestions` 的 `notes` 字段类型错误一直没修，直到 CI 构建失败才发现。应该在提交前就跑 `vue-tsc --noEmit`

### 待跟进
- useBreakGame.ts（1059 行）待拆分
- 羁绊效果未接入游戏逻辑
- 暗黑模式 CSS 残留清理

## 四、经验总结

### 可复用的经验
1. **`finish_reason` 日志** — 在流式处理的最后一个 chunk 记录 `finish_reason`，可快速判断截断是前端问题还是 API 问题
2. **TextDecoder flush** — 任何 SSE 流式处理结束时必须调用 `decoder.decode()` 清空缓冲
3. **Vue scoped 样式优先级** — scoped 属性选择器优先级高于全局 class，调试颜色问题时优先排查 scoped 覆盖
4. **SSE 最后一行无 `\n`** — 流结束后必须 flush 缓冲区残留数据
5. **GitHub Actions Node 版本** — Node 20 已弃用，CI 应使用 Node 22+
