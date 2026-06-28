---
name: elyxira-retrospect
description: 会话结束时扫描全部消息，按 agent-reference 04/07 规范生成回顾文件，同时更新 current_tasks.md 和 design_decisions.md，清理过期内容。
category: elyxira-core
status: active
trigger: "沉淀" | "回顾" | "retrospect" | "记录一下" | "总结一下"
---

# 会话沉淀与项目记忆维护

## 适用场景
- 完成一个里程碑后
- 修复了一个复杂 bug 后
- 做了一次架构重构后
- 对话结束时用户要求沉淀

## 执行流程

### 第一步：读取现有记忆
读取以下文件（如果存在）：
```
.agent/memory/project_memory.md
.agent/memory/current_tasks.md
.agent/memory/design_decisions.md
.agent/memory/code_conventions.md
```

### 第二步：扫描本次会话
从会话消息中提取：
- 新增功能（文件清单 + 一句话说明）
- 修复的 Bug（根因 → 修法）
- 架构决策（做了什么决定 + 理由）
- 踩坑经验（什么坑 → 怎么发现的 → 怎么避）
- 待跟进事项（明确还没做完的）

### 第三步：更新文件

#### 3a. current_tasks.md — 同步任务状态
- 本次会话完成的 → 标记 `[x]`
- 新发现的任务 → 追加到「待处理」
- 已过期（超过 2 周）的待处理 → 移到「已归档」或删除
- 检查是否有矛盾条目（如标记完成但又在待处理中）

#### 3b. design_decisions.md — 追加架构决策
按模板追加：
```markdown
### {序号}. {标题}
**日期**: {YYYY-MM-DD}
**决策**: {做了什么决定}
**理由**: {为什么这么做}
**影响**: {影响的模块}
```

#### 3c. retrospectives/{日期}.md — 创建回顾
按 agent-reference 04 号文档模板：
```markdown
# 回顾 — {版本/任务名}
**日期**: {YYYY-MM-DD}

## 一、任务概述
{本次会话的目标和总体完成情况}

## 二、已完成的工作
- [x] {具体事项}

## 三、反思与收获
### 做得好
{哪些做法有效}

### 可改进
{哪些地方可以做得更好}

### 待跟进
{遗留问题}

## 四、经验总结
{这次学到的可复用经验，参考 07-lessons-learned 格式}
```

### 第四步：清理过期内容
- `current_tasks.md` 中超过 2 周未动的待处理 → 询问是否归档
- `retrospectives/` 中超过 3 个月的回顾 → 询问是否精简
- 检查 `GitHub Actions CI/CD 部署状态` — 如果 CI 有新的失败运行，提醒用户

### 第五步：验证
- 确认所有文件写入成功
- 确认日期格式一致（YYYY-MM-DD）
- 确认 Markdown 格式无语法错误
- 输出变更摘要

## 常见陷阱
- **不要重复记录**: 同一决策不要同时写进 design_decisions.md 和 retrospective.md — design_decisions 存档，retrospective 总结
- **不要删除历史**: retrospectives 和 design_decisions 只追加，不删除
- **命名一致**: 回顾文件用 `YYYY-MM-DD.md` 格式，不要用中文日期
- **待办要具体**: "改一下 XX" 不能写进 current_tasks.md — 必须写清楚"XX 文件 — 修改 YY 以达到 ZZ 效果"
