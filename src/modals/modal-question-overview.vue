<template>
  <BaseModal :show="show" title="题目总览" content-class="modal__content--overview" @close="$emit('close')">
    <div class="modal__question-overview-grid">
      <div v-for="(question, index) in questions" :key="question.id || index" class="modal__question-overview-item"
        :class="getItemClass(question, index)" :data-index="index" @click="goToQuestion(index)">
        {{ question.id || question.number || (index + 1) }}
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from './modal-base.vue';
import { type Question } from '@/services/config-service'; // 导入Question接口

const props = defineProps({
  show: { type: Boolean, required: true },
  questions: { type: Array as () => Question[], required: true }, // 所有问题列表
  currentIndex: { type: Number, required: true } // 当前问题索引
});

const emit = defineEmits(['close', 'jump-to']); // 关闭和跳转事件

/**
 * 比较用户答案和正确答案
 */
function isCorrect(question: Question): boolean {
  const selected = question.userAnswer;
  const correctAnswer = question.answer;

  if (selected === null || selected === undefined || correctAnswer === undefined || correctAnswer === null) {
    return false;
  }

  // 将 'A', 'B' 等转换为 0, 1 索引，用于数字类型答案比较
  // 假设 userAnswer 存储的是 'A', 'B' 等字符串
  const optionIndex = typeof selected === 'string' ? selected.charCodeAt(0) - 65 : -1;

  if (Array.isArray(correctAnswer)) {
    // 检查数组中的每个元素是否等于选项索引
    return correctAnswer.some(ans => ans === optionIndex);
  } else if (typeof correctAnswer === 'number') {
    return correctAnswer === optionIndex;
  } else if (typeof correctAnswer === 'string') {
    // 不区分大小写比较字符串答案
    return correctAnswer.toUpperCase() === selected.toUpperCase();
  }

  console.warn("无法识别的答案格式:", correctAnswer, "对比值:", selected);
  return false;
}

function getItemClass(question: Question, index: number): string[] {
  const classes: string[] = [];
  if (index === props.currentIndex) {
    classes.push('modal__question-overview-item--current');
  }
  if (question.userAnswer !== null && question.userAnswer !== undefined) {
    classes.push('modal__question-overview-item--answered');
    // 使用新的比较函数
    if (isCorrect(question)) {
      classes.push('modal__question-overview-item--correct');
    } else {
      classes.push('modal__question-overview-item--incorrect');
    }
  }
  return classes;
}

function goToQuestion(index: number): void {
  emit('jump-to', index);
  emit('close'); // 跳转后关闭
}
</script>
