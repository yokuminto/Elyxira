# 回顾 — 2026-06-24 绯想击破全面修复与增强

**日期**: 2026-06-24

## 一、任务概述

系统性修复绯想击破模块 16 项 Bug，重构 AI 提示词为三模式分层结构，新增题目标签捕获与渲染系统。

## 二、已完成的工作

### Bug 修复（12 项）

- [x] 全局水平溢出 17px — `box-sizing: border-box` + `overflow-x: hidden`
- [x] 选项字母徽章 27→24px — `box-sizing: border-box`
- [x] 音效触发延迟 — 预加载 4 个 Audio 实例
- [x] 角色面板手机卡死 — 删除 `position: relative` 覆盖
- [x] FA GitHub 图标 — 安装 `free-brands-svg-icons`
- [x] FA plus/trash/list — `<i>` → `<font-awesome-icon>`
- [x] `structuredClone` — `JSON.parse(JSON.stringify())`
- [x] 流式笔记末段缺失 — `filterThinkStream` 加 flush
- [x] 流式 buffer 残留行丢失 — while 循环处理
- [x] 标签渲染 ReferenceError — 函数定义移到调用之前
- [x] 标签徽章不显示 — v-html + scoped CSS → 内联 style
- [x] 笔记编辑时标签消失 — 只提取不修改原笔记

### 功能增强

- [x] 提示词三模式分层（精简/完整/中间）
- [x] 执业医师四单元大纲嵌入提示词
- [x] AI 末尾输出 ` ```tags ` 题目标签
- [x] 笔记内嵌彩色徽章渲染 + 编辑保留原始
- [x] 标签独立存储 (`localStorage.break_tags`)
- [x] 考点速记合并（答案+理由+口诀+公式+检查+治疗+思维链）
- [x] 四色标签层次（蓝/绿/紫/红橙绿）
- [x] prompt 编辑工具链（`.txt` + `build-prompt.ps1`）

### 待处理（Agent 扫描发现的遗留问题）

- [ ] `page-library.vue` — `<i class="fas">` ×2 替换
- [ ] `page-quiz.vue` + `modal-question-edit.vue` — `structuredClone` ×3 替换
- [ ] `BreakNotesPanel.vue` — v-html + scoped CSS 占位符样式
- [ ] `page-quiz.vue` — `addBrTags` 代码块保护

## 三、反思与收获

### 做得好

- 用 Playwright + MCP 实际验证每个修复的效果（截屏、DOM 抓取、console 检查）
- 发现深层问题不满足于表面修复（如 filterThinkStream 的根因分析）
- 提示词从经验中迭代：实测 4 道真题 → 发现 65% 题型在推演/鉴别上浪费 → 三模式分层
- 遇到 PowerShell 字符串替换困境后创建了工具脚本，降低了后续维护成本

### 可改进

- 提示词修改流程应该一开始就用纯文本 + 脚本，而不是在 JSON 里挣扎了 5 轮
- Agent 扫描应在每次功能增强后自动执行，而不是等用户提醒
- 多个修复批量 push 导致 CI 构建失败才被发现（faGithub 类型错误），应该先在本地 `vue-tsc --build`

### 待跟进

- GitHub 专属仓库同步（已出规划，待实现）
- 题库知识标签体系完善（当前全部 `subject:clinical`，无区分度）
- 抽取机制优化（当前纯随机无放回，可加 Fisher-Yates + 去重）

## 四、经验总结

| # | 教训 | 一句话 |
|---|------|--------|
| 1 | Vue SFC 不做函数 hoist | 函数定义必须放在调用之前 |
| 2 | v-html + scoped CSS 无效 | 动态 HTML 用内联 style |
| 3 | `position: fixed` 是 absolute 的包含块 | 不需要改成 relative 来定位箭头 |
| 4 | preprocessLineBreaks 破坏代码块 | 先替换标记再预处理 |
| 5 | FA brands 包需单独安装 | `<i>` 不适用于 tree-shaken FA |
| 6 | structuredClone 无法处理 Vue proxy | 用 JSON round-trip |
| 7 | 流式过滤器必须有 flush | 安全缓冲区在流结束时排空 |
| 8 | dispatchEvent 可能不触发 Vue handler | 优先用 Playwright `.click()` |
| 9 | hex + 字符串拼接颜色不可靠 | 用 `rgba()` 明确格式 |
| 10 | JSON 内嵌长文本不适用于频繁修改 | `.txt` + 打包脚本 |

## 修复清单（12 项）

| # | 问题 | 根因 | 修复 | 文件 |
|---|------|------|------|------|
| 1 | 全局水平溢出 17px | `box-sizing: content-box` 默认值 + `width:100%` + padding | 加 `box-sizing: border-box` + `overflow-x: hidden` | page-break.css |
| 2 | 选项字母徽章 27→24px 不生效 | `border: 1.5px` + `content-box` = 24+3=27px | 加 `box-sizing: border-box` | BreakQuestionPanel.vue |
| 3 | 音效触发延迟 | 每次 `new Audio(url)` → 浏览器重新 fetch MP3 | 预加载 4 个 Audio 实例，复用 + `currentTime=0` | page-break.vue |
| 4 | 角色面板手机卡死 | `position: relative` 覆盖了 `position: fixed`，弹窗退回文档流 | 删掉 `relative` 覆盖 | CharacterDetailModal.vue |
| 5 | FA GitHub 图标不显示 | `@fortawesome/free-brands-svg-icons` 未安装 | 安装包 + main.ts 导入 `faGithub` | main.ts |
| 6 | FA plus/trash/list 图标不显示 | `<i class="fas fa-xxx">` 无法用于 tree-shaken FA | 替换为 `<font-awesome-icon>` + 导入 | modal-api-config.vue |
| 7 | `structuredClone` 报错 | Vue reactive proxy 无法被 structuredClone 序列化 | 改用 `JSON.parse(JSON.stringify())` | config-service.ts |
| 8 | 流式笔记末段缺失 | `filterThinkStream` 安全缓冲区（6-8 字符）流结束时未排空 | 加 `flush` 参数，流结束时排空 | BreakNotesPanel.vue |
| 9 | 流式笔记残留行丢失 | 流结束后 buffer flush 只处理一行 | 改为 `while` 循环处理所有残留行 | BreakNotesPanel.vue |
| 10 | 标签渲染失败 | Vue scoped CSS 对 `v-html` 无效 → 标签徽章不显示 | 改用内联 style 生成徽章 HTML | BreakNotesPanel.vue |
| 11 | 标签渲染失败（第二轮） | `preprocessLineBreaks` 在 ` ```tags ` 块内插入 `<br>` → 正则匹配失败 | 先替换 tags 为徽章，再预处理 | BreakNotesPanel.vue |
| 12 | 标签渲染失败（第三轮） | `_replaceTagsWithBadges` 在 `<script setup>` 中定义在调用之后 → ReferenceError | 移到 `renderNotes()` 之前定义 | BreakNotesPanel.vue |

13 | 标签渲染 ReferenceError | `_replaceTagsWithBadges` 定义在调用之后，Vue SFC 不做 hoist | 移到 `renderNotes()` 之前 | BreakNotesPanel.vue |
14 | 标签徽章不显示 | `v-html` + scoped CSS → data-v-xxx 不匹配 | 改用内联 style | BreakNotesPanel.vue |
15 | 笔记编辑时标签消失 | `parseTagsFromNote` 剥离了 ` ```tags ` → 原始内容丢失 | 只提取不修改，渲染时替换 | BreakNotesPanel.vue |
16 | 提示词修改困难 | `.json` 内嵌长字符串 → edit 工具精确匹配失败 | 抽出 `.txt` + `build-prompt.ps1` 自动打包 | prompts/ + scripts/ |

## 新增功能

| 功能 | 说明 |
|------|------|
| 提示词三模式分层 | 精简/完整/中间模式，按题型自动路由，答案前置 |
| 执业医师大纲嵌入 | 四单元完整目录嵌入提示词，供 AI 参考打标签 |
| AI 题目标签 | AI 末尾输出 ` ```tags ` 块（单元/系统/细目/难度） |
| 笔记内嵌徽章 | ` ```tags ` → 彩色徽章 HTML，渲染时显示，编辑时保留原始 |
| 标签独立存储 | `localStorage.break_tags`，与笔记分离 |
| 考点速记合并 | 答案+理由+口诀+公式+检查+治疗+思维链合一节 |
| 四色标签层次 | 蓝(单元)→绿(系统)→紫(细目)→红/橙/绿(难度) |
| prompt 编辑工具链 | `.txt` 纯文本编辑 + `build-prompt.ps1` 一键打包 |

## 经验教训

### 1. Vue `<script setup>` — 函数定义必须在使用之前

Vue SFC 编译器**不做函数声明提升（hoisting）**。即使使用 `function` 声明（非 `const`），定义在调用之后也会报 `ReferenceError: xxx is not defined`。

**规范**：所有辅助函数定义在调用它们的函数之前。

### 2. Vue `scoped` CSS — 对 `v-html` 无效

`<style scoped>` 通过 `data-v-xxxxx` 属性实现作用域，但 `v-html` 动态插入的 DOM 不带该属性 → CSS 不会应用。

**方案**：对需要动态渲染的 HTML 使用**内联 `style` 属性**，或使用 `:deep()` 选择器。

### 3. `position: fixed` 本身就是 `absolute` 子元素的包含块

不需要把 `fixed` 改成 `relative` 来定位箭头。`position: fixed` 创建的包含块对 `absolute` 子元素完全有效。改成 `relative` 反而会把弹窗踢出全屏覆盖层。

### 4. `preprocessLineBreaks` — 代码块防护

`addBrTags` 在每行末尾插 `<br>`，包括 ` ``` ` 代码块内部 → 后续正则匹配失败。

**方案**：在任何文本处理之前，先提取/替换代码块内容。

### 5. Font Awesome tree-shaking — brands 包需单独安装

`@fortawesome/free-solid-svg-icons` 只含 solid 图标。品牌图标（`fab`）需要额外安装 `@fortawesome/free-brands-svg-icons`。CSS class 写法 `<i class="fas">` 不适用于 tree-shaken FA。

### 6. `structuredClone` — 无法处理 Vue reactive

Vue 的 `reactive()` 包装的对象通过 Proxy 实现，`structuredClone` 无法序列化 Proxy → `DataCloneError`。

**方案**：使用 `JSON.parse(JSON.stringify(obj))` 深拷贝。

### 7. 流式过滤器缓冲 — 必须有 flush 机制

`filterThinkStream` 保留 6-8 字符安全缓冲区防止截断标签，但流结束时未排空 → 末段字符永久丢失。

**方案**：所有带缓冲的流式处理器必须提供 `flush` 参数或流结束时的排空逻辑。

### 8. Playwright + Vue — `dispatchEvent('click')` 可能不触发 Vue handler

Vue 在 production mode 下使用 `addEventListener`，但 Playwright 的 `dispatchEvent` 不总是触发。优先用 Playwright 的 `.click()` 方法，但注意模态框遮挡问题。

### 9. PowerShell 环境变量管道语法

`$env:VAR='val'; cmd1; cmd2` ✅ 但不能用 `&&` 连接（那是 bash 语法），用 `;` 分隔。

### 10. 标签颜色 — hex + 字符串拼接不可靠

`'#d97706' + '0f'` = `'#d977060f'`，这是 8 位 hex（含 alpha），alpha 值 `0f` ≈ 16/255 ≈ 0.06 → 几乎透明。

**方案**：使用明确的 `rgba()` 格式。

### 11. JSON 内嵌长文本 — 不适用于频繁修改

`medical_professor.json` 的 `system_prompt` 字段是一个包含 `\n` 转义的巨型字符串（11000+ 字符）。`edit` 工具依赖精确字符串匹配，但 JSON 转义字符和文件编码的细微差异导致匹配失败率极高。PowerShell 字符串替换也因为 `@` sign、backtick 转义等问题频繁出错。

**方案**：将提示词抽成纯文本 `.txt` 文件，用脚本 `build-prompt.ps1` 读 `.txt` 打包回 `.json`。改提示词只需编辑 `.txt` + 运行脚本。

### 12. Playwright + Vue 3 — 多种 click 方式对比

| 方式 | 效果 |
|------|------|
| `page.locator().click({ force: true })` | 绕过可见性检查，但仍可能被 modal 遮罩拦截 |
| `page.evaluate(() => el.click())` | 原生 JS click，可能不触发 Vue `@click` handler |
| `.dispatchEvent(new MouseEvent('click'))` | 同上，可靠性差 |
| `page.locator().click()` | 标准方式，需要元素 visible + enabled + stable |

在 Vue 3 + HMR 环境下，最可靠的是确保 modal 完全关闭后再点击。模态框遮罩（`<div class="modal--active">`）会拦截 pointer events。

### 13. PowerShell 命令提示符模式

| 场景 | 正确 | 错误 |
|------|------|------|
| 管道顺序执行 | `cmd1; cmd2` | `cmd1 && cmd2`（bash 语法） |
| 环境变量 | `$env:VAR='1'; cmd` | 不能放在管道中间 |
| 多行字符串 | `@'...'@` | 注意 `@` 和括号的边界 |
| JSON 中的 `\n` | `` -replace '\\n', "`n" `` | 区分字面 `\n` 和转义 |

### 14. 扫描残留问题（待修）
