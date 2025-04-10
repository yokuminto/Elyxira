<template>
  <BaseModal :show="show" title="测验结果" content-class="modal__content--statistics" @close="$emit('close')">
    <div class="modal__statistics-results">
      <div class="modal__statistics-results-section">
        <h3 class="modal__statistics-results-title">总分</h3>
        <div class="modal__statistics-results-card">
          <div class="modal__statistics-results-score-display">{{ totalScore }}分</div>
          <div class="modal__statistics-results-score-detail">{{ scoreDetail }}</div>
        </div>
      </div>
      <!-- Chapter statistics section can be added here if needed, passing chapterStats prop -->
    </div>
    <template #footer>
      <button v-if="hasWrongQuestions" @click="$emit('view-wrong')"
        class="modal__button modal__button--danger">查看错题</button>
      <button @click="$emit('continue')" class="modal__button modal__button--secondary">继续</button>
      <button @click="$emit('back-home')" class="modal__button modal__button--primary">返回主页</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseModal from './modal-base.vue';

interface Stats {
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  wrongQuestionIds: string[] | number[];
}

const props = defineProps({
  show: { type: Boolean, required: true },
  stats: { // 统计数据对象
    type: Object as () => Stats,
    required: true,
    default: () => ({ totalQuestions: 0, answeredCount: 0, correctCount: 0, wrongQuestionIds: [] })
  },
  // chapterStats: { type: Object, default: null } // Optional chapter stats
});

defineEmits(['close', 'view-wrong', 'continue', 'back-home']);

const totalScore = computed(() => {
  return props.stats.answeredCount > 0
    ? Math.round((props.stats.correctCount / props.stats.answeredCount) * 100)
    : 0;
});

const scoreDetail = computed(() => {
  return `共${props.stats.totalQuestions}题，已答${props.stats.answeredCount}题，答对${props.stats.correctCount}题，正确率${totalScore.value}%`;
});

const hasWrongQuestions = computed(() => props.stats.wrongQuestionIds.length > 0);

</script>
