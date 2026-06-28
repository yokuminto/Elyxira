<!--
  BreakQuestionPanel.vue — 题目展示 / 选项 / 答题交互（医学蓝白风格）
  契约：BreakQuestionPanelProps / BreakQuestionPanelEmits
  风格参考：page-quiz.css 的选项卡片、按钮、题目文字样式
-->
<template>
  <div class="break-question-panel">
    <!-- ─── 题目文字 ──────────────────────────────────────── -->
    <Transition name="qp-slide" mode="out-in">
      <div class="break-qp__question" :key="questionKey" v-html="questionText" />
    </Transition>

    <!-- ─── 选项列表 ──────────────────────────────────────── -->
    <TransitionGroup name="qp-option" tag="ul" class="break-qp__options">
      <li
        v-for="(option, index) in question.options"
        :key="index"
        class="break-qp__option"
        :class="{
          'break-qp__option--selected': !isSubmitted && selectedAnswer === getOptionKey(index),
          'break-qp__option--correct': isSubmitted && isCorrect && selectedAnswer === getOptionKey(index),
          'break-qp__option--wrong': isSubmitted && !isCorrect && selectedAnswer === getOptionKey(index),
          'break-qp__option--reveal-correct': isSubmitted && isCorrectAnswer(index) && selectedAnswer !== getOptionKey(index),
          'break-qp__option--disabled': isSubmitted,
          'break-qp__option--revealed': !isSubmitted && revealedIndices.has(index),
        }"
        @click="handleSelect(getOptionKey(index))"
      >
        <span class="break-qp__option-key">{{ getOptionKey(index) }}</span>
        <span class="break-qp__option-text">{{ option }}</span>
        <span
          v-if="isSubmitted && isCorrectAnswer(index)"
          class="break-qp__option-check"
        >✓</span>
        <span
          v-if="isSubmitted && !isCorrectAnswer(index) && selectedAnswer === getOptionKey(index)"
          class="break-qp__option-cross"
        >✗</span>
      </li>
    </TransitionGroup>

    <!-- ─── 低血量警告 ────────────────────────────────────── -->
    <div v-if="hpPercent <= 25 && !isSubmitted" class="break-qp__hp-warning">
      <span class="break-qp__hp-warning-icon">⚠</span>
      <span>HP 过低 — 答错将承受致命伤害</span>
    </div>

    <!-- ─── 操作按钮 ──────────────────────────────────────── -->
    <div class="break-qp__actions">
      <!-- 提交按钮 -->
      <button
        v-if="!isSubmitted"
        class="break-qp__btn break-qp__btn--submit"
        :disabled="!selectedAnswer"
        @click="$emit('submit')"
      >
        提交答案
      </button>

      <!-- 正确 → 绿色继续 -->
      <button
        v-else-if="isCorrect"
        class="break-qp__btn break-qp__btn--next"
        @click="$emit('next')"
      >
        ✓ 继续
      </button>

      <!-- 错误 → 红色下一题 -->
      <button
        v-else
        class="break-qp__btn break-qp__btn--retry"
        @click="$emit('next')"
      >
        → 下一题
      </button>

      <!-- 投降按钮（仅在提交前显示） -->
      <button
        v-if="!isSubmitted"
        class="break-qp__btn break-qp__btn--surrender"
        @click="$emit('surrender')"
      >
        投降 (-5HP)
      </button>
    </div>

    <!-- ─── 笔记区（完整复制自 page-quiz） ───────────────────── -->
    <BreakNotesPanel :question="question" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BreakQuestionPanelProps, BreakQuestionPanelEmits } from '../types/component-contracts'
import BreakNotesPanel from './BreakNotesPanel.vue'

const props = defineProps<BreakQuestionPanelProps>()
const emit = defineEmits<BreakQuestionPanelEmits>()

const questionText = computed(() => props.question.question || props.question.title || '')

/** 用于 Transition key 切换动画 */
const questionKey = computed(() => props.question.id || questionText.value.slice(0, 40))

const hpPercent = computed(() =>
  props.maxHP > 0 ? Math.round((props.currentHP / props.maxHP) * 100) : 0
)

// ─── 选项逻辑 ───────────────────────────────────────────────

function getOptionKey(index: number): string {
  return String.fromCharCode(65 + index)
}

function isCorrectAnswer(index: number): boolean {
  const answer = props.question.answer
  if (typeof answer === 'number') return answer === index
  if (typeof answer === 'string') return answer === getOptionKey(index)
  if (Array.isArray(answer)) return answer.includes(index)
  return false
}

/** 角色技能揭示前 N 个错误选项 */
const revealedIndices = computed<Set<number>>(() => {
  const result = new Set<number>()
  const count = props.revealedOptions ?? 0
  if (count <= 0 || props.isSubmitted) return result
  const options = props.question.options
  let found = 0
  for (let i = 0; i < options.length && found < count; i++) {
    if (!isCorrectAnswer(i)) {
      result.add(i)
      found++
    }
  }
  return result
})

function handleSelect(key: string) {
  if (!props.isSubmitted) {
    emit('select', key)
  }
}
</script>

<style scoped>
/* ══════════════════════════════════════════════════════════════
   BreakQuestionPanel — 医学蓝白答题面板（基于 page-quiz 设计系统）
   ══════════════════════════════════════════════════════════════ */

.break-question-panel {
  box-sizing: border-box;
  flex: 1;
  padding: 0.75rem 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 0;
  animation: fade-in 0.35s ease-out;
  max-width: 720px;
  margin: 0 auto;
  width: 100%;
}

/* ─── 题目文字 ────────────────────────────────────────────── */
.break-qp__question {
  font-size: 1em;
  line-height: 1.7;
  font-weight: 500;
  color: var(--text-main, #2a2a30);
  background: var(--bg-white, #f9faff);
  border-radius: var(--radius, 12px);
  padding: 18px 22px;
  margin-bottom: 1.25rem;
  position: relative;
  overflow: hidden;
}

/* ─── 选项列表 ────────────────────────────────────────────── */
.break-qp__options {
  list-style: none;
  padding: 0;
  margin: 0 0 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* ─── 单个选项 ────────────────────────────────────────────── */
.break-qp__option {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 16px;
  background: var(--bg-white, #f9faff);
  border: 1px solid transparent;
  border-radius: var(--radius, 12px);
  cursor: pointer;
  transition: all 0.1s ease-out;
  will-change: transform, background-color, border-color;
  overflow: hidden;
}

/* 未提交时悬停 — 上移 + 蓝边 */
.break-qp__option:not(.break-qp__option--disabled):hover {
  transform: translateY(-3px);
  border-color: var(--c-blue, #4468ee);
}

.break-qp__option:not(.break-qp__option--disabled):active {
  transform: translateY(0px) scale(0.99);
  transition-duration: 0.05s;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* 选中状态 */
.break-qp__option--selected {
  background: rgba(68, 104, 238, 0.08);
  border-color: var(--c-blue, #4468ee);
}

/* 提交后正确答案（绿色） */
.break-qp__option--correct {
  background: rgba(54, 185, 145, 0.08) !important;
  border-color: var(--c-green, #36b991) !important;
  animation: qp-flash-correct 0.5s ease-out;
}

.break-qp__option--correct .break-qp__option-text {
  color: var(--c-green, #36b991) !important;
  font-weight: 500;
}

/* 提交后选错的选项 */
.break-qp__option--wrong {
  background: rgba(229, 73, 96, 0.08) !important;
  border-color: var(--c-red, #e54960) !important;
  animation: qp-shake 0.4s ease-out;
}

.break-qp__option--wrong .break-qp__option-text {
  color: var(--c-red, #e54960) !important;
  font-weight: 500;
}

/* 提交后透露正确答案（用户没选的那个正确选项） */
.break-qp__option--reveal-correct {
  background: rgba(54, 185, 145, 0.04);
  border-color: var(--c-green, #36b991);
  border-style: dashed;
}

/* 提交后禁用点击 */
.break-qp__option--disabled {
  cursor: default;
  pointer-events: none;
}

/* 角色技能揭示（排除的错误选项 — 淡化且不可选） */
.break-qp__option--revealed {
  opacity: 0.35;
  cursor: not-allowed;
  pointer-events: none;
  background: rgba(229, 73, 96, 0.04);
  border-color: rgba(229, 73, 96, 0.12);
}

.break-qp__option--revealed .break-qp__option-text {
  text-decoration: line-through;
  color: var(--c-red, #e54960);
}

/* 选项字母 — 小徽章 */
.break-qp__option-key {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--bg-gray-transparent, rgba(255, 255, 255, 0.1));
  color: var(--color-gray, #9ca3af);
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.8em;
  border: 1.5px solid var(--border-gray-transparent, rgba(0, 0, 0, 0.1));
  flex-shrink: 0;
  transition: all 0.1s;
  position: relative;
  z-index: 5;
}

.break-qp__option--selected .break-qp__option-key {
  background: rgba(68, 104, 238, 0.15);
  border-color: var(--c-blue, #4468ee);
  color: var(--c-blue, #4468ee);
}

.break-qp__option--correct .break-qp__option-key {
  background: rgba(54, 185, 145, 0.15);
  border-color: var(--c-green, #36b991);
  color: var(--c-green, #36b991);
}

.break-qp__option--wrong .break-qp__option-key {
  background: rgba(229, 73, 96, 0.15);
  border-color: var(--c-red, #e54960);
  color: var(--c-red, #e54960);
}

/* 选项文字 */
.break-qp__option-text {
  flex: 1;
  font-size: 1em;
  line-height: 1.5;
  color: var(--text-main, #2a2a30);
}

/* 正确/错误标记 */
.break-qp__option-check,
.break-qp__option-cross {
  font-size: 1em;
  font-weight: bold;
  flex-shrink: 0;
  line-height: 1;
}

.break-qp__option-check {
  color: var(--c-green, #36b991);
}

.break-qp__option-cross {
  color: var(--c-red, #e54960);
}

/* ─── HP 过低警告 ──────────────────────────────────────────── */
.break-qp__hp-warning {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-red, rgba(229, 73, 96, 0.08));
  border: 1px solid rgba(229, 73, 96, 0.2);
  border-radius: var(--radius, 12px);
  font-size: 0.8em;
  color: var(--c-red, #e54960);
  margin-bottom: 0.75rem;
  animation: qp-hp-pulse 1.2s ease-in-out infinite;
}

.break-qp__hp-warning-icon {
  font-size: 0.9em;
}

/* ─── 操作按钮 ────────────────────────────────────────────── */
.break-qp__actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.break-qp__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.65rem 1.5rem;
  border: none;
  border-radius: var(--radius, 12px);
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 500;
  transition: all 0.1s ease-out;
  will-change: transform, box-shadow;
  white-space: nowrap;
}

.break-qp__btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}

.break-qp__btn:not(:disabled):active {
  transform: translateY(-1px) scale(0.98);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition-duration: 0.05s;
}

.break-qp__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 提交按钮 — 蓝色 */
.break-qp__btn--submit {
  background: var(--c-blue, #4468ee);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex: 1;
}

/* 继续按钮（正确）— 绿色 */
.break-qp__btn--next {
  background: var(--c-green, #36b991);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex: 1;
}

/* 下一题按钮（错误）— 红色 */
.break-qp__btn--retry {
  background: var(--c-red, #e54960);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex: 1;
}

/* 投降按钮 — 透明 + 文字边框 */
.break-qp__btn--surrender {
  background: transparent;
  color: var(--text-secondary, #5a5a68);
  border: 1px solid var(--border, #9ca3af);
  padding: 0.65rem 1rem;
  font-size: 0.8em;
}

.break-qp__btn--surrender:hover:not(:disabled) {
  border-color: var(--c-blue, #4468ee);
  color: var(--c-blue, #4468ee);
  background: rgba(68, 104, 238, 0.04);
}

/* ══════════════════════════════════════════════════════════════
   动画关键帧
   ══════════════════════════════════════════════════════════════ */

/* 题目滑动切换 */
.qp-slide-enter-active,
.qp-slide-leave-active {
  transition: all 0.3s ease;
}

.qp-slide-enter-from {
  opacity: 0;
  transform: translateX(24px);
}

.qp-slide-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}

/* 选项入场动画 */
.qp-option-enter-active {
  transition: all 0.3s ease;
}

.qp-option-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

/* 正确闪光 */
@keyframes qp-flash-correct {
  0% {
    box-shadow:
      inset 0 0 0 1px rgba(54, 185, 145, 0.2),
      0 0 0 0 rgba(54, 185, 145, 0.3);
  }
  40% {
    box-shadow:
      inset 0 0 0 1px rgba(54, 185, 145, 0.3),
      0 0 16px 4px rgba(54, 185, 145, 0.15);
  }
  100% {
    box-shadow:
      inset 0 0 0 1px rgba(54, 185, 145, 0.2),
      0 0 8px 0 rgba(54, 185, 145, 0.08);
  }
}

/* 错误抖动 */
@keyframes qp-shake {
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-6px); }
  20% { transform: translateX(6px); }
  30% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  50% { transform: translateX(-2px); }
  60% { transform: translateX(2px); }
  70% { transform: translateX(-1px); }
  80% { transform: translateX(1px); }
}

/* HP 脉冲 */
@keyframes qp-hp-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* 淡入 */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ══════════════════════════════════════════════════════════════
   手机端适配 (≤480px)
   ══════════════════════════════════════════════════════════════ */
@media (max-width: 480px) {
  .break-question-panel {
    padding: 0.35rem 0.35rem;
    gap: 0;
  }

  /* 题目文字 — 减小内边距 */
  .break-qp__question {
    padding: 12px 14px;
    font-size: 0.92em;
    line-height: 1.6;
    margin-bottom: 0.85rem;
    border-radius: var(--radius, 10px);
  }

  /* 选项列表 — 减小间距 */
  .break-qp__options {
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  /* 单个选项 — 紧凑 */
  .break-qp__option {
    padding: 12px 12px;
    gap: 0.5rem;
    border-radius: var(--radius, 10px);
  }

  /* 选项字母徽章 — 缩小 */
  .break-qp__option-key {
    width: 24px;
    height: 24px;
    font-size: 0.72em;
    border-radius: 3px;
  }

  /* 选项文字 */
  .break-qp__option-text {
    font-size: 0.92em;
    line-height: 1.4;
  }

  /* 正确/错误标记缩小 */
  .break-qp__option-check,
  .break-qp__option-cross {
    font-size: 0.85em;
  }

  /* HP 警告 — 紧凑 */
  .break-qp__hp-warning {
    padding: 0.4rem 0.6rem;
    font-size: 0.74em;
    margin-bottom: 0.5rem;
    border-radius: var(--radius, 10px);
  }

  /* 操作按钮区 — 竖排 */
  .break-qp__actions {
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.35rem;
  }

  .break-qp__btn {
    width: 100%;
    padding: 0.7rem 1rem;
    font-size: 0.9em;
    border-radius: var(--radius, 10px);
    min-height: 44px; /* 触控友好最小高度 */
  }

  /* 投降按钮 — 独占一行时缩小视觉权重 */
  .break-qp__btn--surrender {
    font-size: 0.82em;
    padding: 0.55rem 0.75rem;
    min-height: 40px;
  }
}

</style>
