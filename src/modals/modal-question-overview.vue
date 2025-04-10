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

function getItemClass(question: Question, index: number): string[] {
  const classes: string[] = [];
  if (index === props.currentIndex) {
    classes.push('modal__question-overview-item--current');
  }
  if (question.userAnswer !== null && question.userAnswer !== undefined) {
    classes.push('modal__question-overview-item--answered');
    if (question.userAnswer === question.answer) {
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
