# 当前任务进度 — Elyxira

## 已完成

### 绯想击破 v2.0.2 重大更新 (2026-06-25)
- [x] **GitHub 同步系统** — useBreakSync（pull/push/queue，Git Data API 5 请求批量提交）
- [x] **批量 AI 笔记生成** — useBreakAI（补给站一键生成全部笔记，并发 + SVG 进度环）
- [x] **IndexedDB 存储层** — breakStorage（替代 localStorage，自动迁移旧数据，无限配额）
- [x] **AI 提示词重构** — 知识点精讲/考点速记与答案分析分离，新增板块职责定义表
- [x] **题目答题统计** — 每题 answerCount/correctCount/lastAnswerTime 追踪
- [x] **开局预抽题池** — 总击破值 × 1.5 共享池，节点消耗 + 错题重试全覆盖
- [x] **导入导出增强** — break 笔记/标签/仓库配置全部打入导出 JSON，合并导入
- [x] **标签补全** — regenerateMissingTags（并发 AI + 优先提取已有笔记标签）
- [x] **咲夜技能重做** — 从节点转换改为通过奖励节点额外获得 5/10/15 星琼
- [x] **HTML 围栏展开** — ```html 代码块自动展开为渲染 HTML
- [x] **配置迁移按钮** — ModalBreakSettings 新增导出/导入
- [x] **移动端修复** — 补给站去掉免费标签、文件选择器 JSON 格式适配
- [x] **README 更新** — MIT 协议、THMED 标、功能描述同步
- [x] **Git 历史重整** — 重新 init + 逻辑分组提交

### 击破字段重构 + Bug 修复 (2026-06-25)
- [x] **击破公式重构** — StarEffect 删除 breakBonus，BreakProgress 加 baseBreak/breakMultiplier/breakBonus 三个全局字段，新公式 `baseBreak * breakMultiplier + breakBonus + genki + extraBreakCharges`
- [x] **surrender() 修复** — 补充铃仙元气充能触发 + extraChancesRemaining 优先消耗
- [x] **符华完美恢复修复** — fuHuaRecovery 独立追踪，仅完美通关时触发
- [x] **生命周期修复** — initGame/restartGame 补充 revealedOptions + extraChancesRemaining 重置
- [x] **数据清理** — CHARACTER_POOL (21处) + JSON ×2 移除全部角色 breakBonus 字段

### 绯想击破 v2.0.1 全面修复 (2026-06-24)
- [x] 16 项 Bug 修复（水平溢出、音效延迟、FA 图标、structuredClone、流式处理、标签渲染）
- [x] AI 提示词三模式分层（精简/完整/中间）+ 四单元大纲嵌入
- [x] AI 题目标签系统（` ```tags ` → 彩色徽章渲染 → `localStorage.break_tags`）
- [x] 考点速记合并（答案+理由+口诀+公式+检查+治疗+思维链）
- [x] 音效预加载（4 个 Audio 实例复用，消除延迟）
- [x] 移动端适配修复（375/412px 零溢出）
- [x] 角色面板手机卡死修复
- [x] 提示词编辑工具链（`.txt` + `build-prompt.ps1`）

### 绯想击破 v2 (2026-06-18)
- [x] **maxCombo 响应式修复** — `_maxComboValue` 改为 `ref(0)`
- [x] **extraBreakCharges / starJadeBoostActive 集成** — 答题击破和星琼奖励中生效
- [x] **咲夜·额外奖励节点** — 每层将普通节点转为奖励节点（+3星琼）
- [x] **帕秋莉·知识卡片** — 已移除（角色及技能）
- [x] **阮·梅·商店刷新** — 免费刷新按钮，刷新消耗5星琼
- [x] **铃仙·元气充能** — 元气计入击破加成，每层重置充能
- [x] **角色星级效果差异** — optionReveal（排除错误选项）、extraChances（免罚重试）、scoreMultiplier 归一
- [x] **CSS markdown-body 体系同步** — 标题/代码块/表格/引用/aside 气泡从 quiz 同步到 break
- [x] **`<think>` 标签流式过滤** — 跨 chunk 状态机 + TextDecoder flush + 缓冲区残留处理
- [x] **AI 生成流式渲染节流移除** — 每 chunk 直接 renderNotes()，解决最后一帧截断
- [x] **提示词融合** — 爱莉希雅教授（正向临床推演 + 四色法则），public/prompts/medical_professor.json
- [x] **四色法则 CSS** — 蓝色概念/红色危急/绿色方案/金色考点，括号自动蓝着色
- [x] **节点奖励重平衡** — 普通10 / 精英20 / Boss40 / 奖励20，完美通关回复5HP
- [x] **商店重设计** — 只卖3角色（30星琼/个），刷新5星琼
- [x] **按钮音效全覆盖** — 提交/下一题/继续推进/商店/补给/Boss/重新开始
- [x] **版本号 v2.0.0** — package.json + page-home.vue
- [x] **Git 仓库整理** — 按模块分组提交，屏蔽私密文件，CI/CD 自动部署
- [x] **CI/CD 修复** — Node 22 + npm ci + package-lock.json

### 绯想击破 v1 (2026-06-17)
- [x] 核心游戏逻辑（useBreakGame.ts — 27 节点 × 3 层，答题/击破/羽毛/HP 系统）
- [x] 角色系统（7 角色、羁绊、星级、被动效果）
- [x] 补给站 / 商店 / Boss 奖励
- [x] 状态栏（羽毛块 + 击破点 + 节点路线 + HP/星琼/Buff）
- [x] 角色迷你卡片 + 详情弹窗
- [x] 完整笔记系统（编辑/AI 生成/同步/Markdown 预处理）
- [x] 显示/音效设置（独立 ModalBreakSettings）
- [x] 入口按钮（首页 + 题库页）
- [x] 路由注册（/break）
- [x] 视觉统一为 quiz 蓝白风格
- [x] 项目记忆系统初始化

### 绯想击破 v2.1 规范化 + 8盒系统 (2026-06-28)
- [x] **8盒加权预抽题池** — 三阶段（完成率<30%/30-60%/≥60%）自动切换权重表，4节点类型×8盒
- [x] **AnswerRecord.duration** — 每题计时统计
- [x] **IndexedDB 自动迁移** — `_ensureDB` 首次加载自动从 localStorage 迁移旧数据
- [x] **生命周期守卫** — initGame/restartGame 补充 revealedOptions + extraChancesRemaining 重置
- [x] **错误状态面板** — BreakGameOver 显示非空 errorMessage 时渲染错误面板而非结算面板
- [x] **链式借用** — 三级回退抽题（预抽盒→同号全量盒→兜底链→全库随机）
- [x] **安全阀** — 单盒权重≤40%，超出部分按比例重分配
- [x] **项目规范化** — 删除 44 个 yml 垃圾、pnpm 锁文件、quiz-medical.css；修复 FA 版本；统一版本号 2.0.2
- [x] **类型安全** — 移除全部 as any/as unknown；空 catch 块加 console.warn
- [x] **死代码清理** — 16 行注释死代码 + [DEBUG] console.log 清理
- [x] **文档同步** — project_memory / AGENTS / README / CONFIG 全部更新

## 待处理

### 高优先级
1. GitHub Pages CDN 缓存延迟 — 部署后可能需要数分钟才能看到更新

### 中优先级
1. 批量生成失败重试 — 当前失败项需手动重新点击生成
2. 自动推送开关 — 单题生成时的 optional auto-push 设置

### 低优先级
1. 大文件拆分（useBreakGame.ts 1222 行、config-service.ts 2019 行）
2. 羁绊效果未接入游戏逻辑（数据层已完成）
3. 在线题库从 elyxira-data 仓库拉取
