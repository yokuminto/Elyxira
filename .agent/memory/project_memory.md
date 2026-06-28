# 项目记忆 — Elyxira

## 项目概述
- **项目名称**: Elyxira
- **版本**: 2.0.2
- **目标**: 开源医学学习平台，支持刷题、笔记、AI 辅助、题库同步
- **新增模式**: 绯想击破 — HSR 风格肉鸽刷题（27 节点 × 3 层）
- **仓库**: `yokuminto/Elyxira`（代码）→ CI 自动部署到 `elyxira/elyxira.github.io`（在线访问）
- **数据仓库**: `elyxira/elyxira-data`（共享笔记/标签/题库）

## 技术栈

| 组件 | 技术 |
|------|------|
| 语言 | TypeScript |
| 框架 | Vue 3 (Composition API, `<script setup>`) |
| 构建 | Vite 6 |
| 路由 | Vue Router (hash 模式) |
| 状态 | reactive composables |
| 样式 | CSS 自定义变量 + scoped |
| 图标 | Font Awesome 6 |
| 依赖 | markdown-it, vue-toastification, vue-router |
| 测试 | Vitest + Playwright（待搭建） |
| CI/CD | GitHub Actions → elyxira.github.io |
## 项目结构

```
src/
├── App.vue                 # 根组件
├── main.ts                 # 入口文件
├── vue-shims.d.ts          # 类型声明
├── router/
│   └── index.ts            # 路由定义（hash 模式）
├── pages/
│   ├── quiz/               # 刷题模式（医学蓝白风格）
│   ├── break/              # 绯想击破（独立模块）
│   │   ├── composables/    # 游戏逻辑 + 同步 + AI + 存储
│   │   │   ├── useBreakGame.ts       # 核心游戏状态机
│   │   │   ├── useBreakAI.ts         # 批量 AI 笔记生成
│   │   │   ├── useBreakSync.ts       # GitHub 云同步
│   │   │   ├── useBreakCharacters.ts # 角色数据加载
│   │   │   └── breakStorage.ts       # IndexedDB 存储层
│   │   ├── components/     # UI 组件（9 个）
│   │   └── types/          # 类型定义
│   ├── library/            # 题库管理
│   ├── home/               # 首页
│   └── error/              # 错误页
├── services/               # 配置、解析器、API
│   ├── config-service.ts
│   └── service-quiz-parser.ts
├── modals/                 # 通用模态框（9 个）
├── styles/                 # 全局样式 + CSS 变量
│   ├── variables.css
│   ├── modal.css
├── components/             # 通用组件（button-settings, icon）
└── utils/                  # 工具函数（toast.ts）
```

## 关键设计

### 1. 绯想击破独立于刷题模式
- 使用独立 composable（`useBreakGame`），不依赖 Pinia
- 题目来源：`public/data/break-questions.json`（专属题库）
- 状态隔离：不共享 `configService.quizState`
- 笔记存储：IndexedDB（breakStorage.ts，独立于 configService）

### 2. 角色系统
- 8 个角色（白露/永琳/阮·梅/符华/星/铃仙/咲夜/帕秋莉）
- 1-3 星级，重复获取升星（最高 3 级）
- 3 个羁绊组（仙舟同盟/幻想乡/天才俱乐部）
- 仅永琳的 potion 可主动激活，其余均为被动效果

### 3. CSS 设计系统
- 全局变量：`src/styles/variables.css`（`--c-blue`, `--c-green`, `--radius` 等）
- 绯想击破与刷题模式共用同一套设计 token
- markdown-body 样式体系完全同步（标题/代码块/表格/引用/aside 气泡）
- 四色法则：蓝（概念/括号）、红（危急）、绿（方案）、金（考点）
- 括号内文本自动蓝着色（渲染层 JS 处理）

### 4. AI 笔记系统
- 完整复制 page-quiz 的笔记功能到 `BreakNotesPanel.vue`
- Markdown 渲染 + 自定义预处理（`preprocessLineBreaks`）
- `<think>` 标签流式过滤（跨 chunk 状态机 + TextDecoder flush）
- AI 生成无节流直接渲染，避免最后一帧丢失
- 提示词：爱莉希雅教授，三模式分层（精简/完整/中间）+ 四单元大纲嵌入
- 音效系统：4 个 Audio 实例预加载，`currentTime=0` 复用，消除触发延迟

### 5. AI 题目标签系统
- AI 末尾输出 ` ```tags ` 块（单元/系统/细目/难度）
- `extractTags` 解析 + `_replaceTagsWithBadges` 内联样式徽章渲染
- 编辑时保留原始 ` ```tags `，渲染时显示彩色徽章
- `breakStorage` 同步存储（IndexedDB，含首次加载自动迁移旧 localStorage 数据）

### 6. 提示词编辑工具链
- `public/prompts/medical_professor.txt` — 可编辑纯文本
- `scripts/build-prompt.ps1` — 打包回 `.json`
- 编辑流程：改 `.txt` → 运行脚本 → 完成

### 7. 节点奖励体系
- 普通 10 / 精英 20 / Boss 40 / 奖励 20 星琼
- 完美通关（0 羽毛）回复 5HP（与符华技能叠加）
- 商店只卖角色（3 个，30 星琼/个），刷新 5 星琼
- 阮·梅提供免费刷新次数

### 8. 云端同步系统
- useBreakSync: 笔记/标签的 GitHub pull/push/队列管理
- Git Data API 批量提交（5 请求全量推送，替代逐文件 PUT）
- ModalBreakRepo: 默认（官方只读）/ 自定义仓库双模式
- 启动时 initSync 后台拉取，不阻塞游戏

### 9. IndexedDB 存储层
- breakStorage.ts: 替代 localStorage（5MB→浏览器配额）
- 首次加载自动迁移旧数据（含分片格式)
- 内存缓存 + 异步 IndexedDB 落盘

### 10. 批量 AI 笔记生成
- 补给站一键生成本轮全部题目笔记
- 开局预抽共享题池（totalToughness × 1.5）
- 并发生成 + SVG 进度环 + 180s 超时 + 失败计数

## 更新日志
- 2026-06-25 — 绯想击破 v2.0.2：GitHub 同步、批量 AI 生成、IndexedDB 存储、提示词重构、导入导出增强
- 2026-06-23 — 项目文档全面审计与修正（README/package.json/GUIDE/AGENTS/设计决策/编码规范）
- 2026-06-18 — 绯想击破 v2.0 完成：7 项 Bug 修复、CSS 同步、提示词融合、节点重平衡、商店重设计、CI/CD
- 2026-06-17 — 绯想击破 v1 完成，创建项目记忆
