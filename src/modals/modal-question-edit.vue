<template>
  <BaseModal :show="show" title="编辑题目" content-class="modal__content--edit-question" @close="$emit('close')">
    <form @submit.prevent="saveQuestion">
      <div class="modal__form-group">
        <label for="question" class="modal__form-label">题目内容</label>
        <textarea id="question" v-model="editedQuestion.question" class="modal__form-control" rows="3"
          required></textarea>
      </div>

      <div class="modal__form-group">
        <label class="modal__form-label">选项</label>
        <div v-for="(option, index) in editedQuestion.options" :key="index" class="modal__option-row">
          <div class="modal__option-label">
            {{ String.fromCharCode(65 + index) }}. <!-- A, B, C, D... -->
          </div>
          <div class="modal__option-content">
            <input type="text" v-model="editedQuestion.options[index]" class="modal__form-control" required />
          </div>
          <button type="button" class="modal__option-delete" @click="removeOption(index)"
            :disabled="editedQuestion.options.length <= 2">&times;</button>
        </div>
        <button type="button" class="modal__add-option-btn" @click="addOption">+ 添加选项</button>
      </div>

      <div class="modal__form-group">
        <label for="answer" class="modal__form-label">正确答案</label>
        <select id="answer" v-model="editedQuestion.answer" class="modal__form-control" required>
          <option v-for="(option, index) in editedQuestion.options" :key="index"
            :value="String.fromCharCode(65 + index)">
            {{ String.fromCharCode(65 + index) }}
          </option>
        </select>
      </div>

      <div class="modal__form-group">
        <label for="notes" class="modal__form-label">笔记内容 (Markdown)</label>
        <textarea id="notes" v-model="editedQuestion.notes" class="modal__form-control" rows="5"></textarea>
      </div>
    </form>

    <template #footer>
      <button @click="$emit('close')" class="modal__button modal__button--secondary">取消</button>
      <button @click="saveQuestion" class="modal__button modal__button--primary">保存</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import BaseModal from './modal-base.vue';

interface Question {
  id?: string | number;
  number?: number;
  question: string;
  options: string[];
  answer: string;
  notes?: string;
  userAnswer?: string | null;
  chapterTitle?: string;
}

const props = defineProps<{
  show: boolean;
  question: Question | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', question: Question): void;
}>();

// 创建一个可编辑的问题副本
const editedQuestion = reactive<Question>({
  question: '',
  options: ['', ''],
  answer: 'A',
  notes: ''
});

// 当问题更改时，更新编辑的问题
watch(() => props.question, (newQuestion) => {
  if (newQuestion) {
    Object.assign(editedQuestion, JSON.parse(JSON.stringify(newQuestion)));
  }
}, { immediate: true, deep: true });

// 添加选项
function addOption() {
  editedQuestion.options.push('');
}

// 删除选项
function removeOption(index: number) {
  if (editedQuestion.options.length > 2) {
    editedQuestion.options.splice(index, 1);

    // 如果删除的是当前答案，将答案重置为A
    const answerIndex = editedQuestion.answer.charCodeAt(0) - 65;
    if (answerIndex === index || answerIndex >= editedQuestion.options.length) {
      editedQuestion.answer = 'A';
    }
  }
}

// 保存编辑后的问题
function saveQuestion() {
  emit('save', JSON.parse(JSON.stringify(editedQuestion)));
}
</script>