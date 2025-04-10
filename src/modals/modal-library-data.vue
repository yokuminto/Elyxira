<template>
  <BaseModal title="题库数据管理" :show="show" @close="$emit('close')">
    <div class="modal__tabs">
      <div class="modal__tab-headers">
        <button class="modal__tab-header" :class="{ 'modal__tab-header--active': activeTab === 'import' }"
          @click="activeTab = 'import'">
          导入题库
        </button>
        <button class="modal__tab-header" :class="{ 'modal__tab-header--active': activeTab === 'export' }"
          @click="activeTab = 'export'">
          导出题库
        </button>
      </div>

      <div class="modal__tab-content">
        <!-- 导入面板 -->
        <div v-if="activeTab === 'import'" class="modal__tab-panel modal__tab-panel--active">
          <div class="modal__import-options">
            <div class="modal__import-option">
              <h3>本地文件导入</h3>
              <p>支持 JSON 和 TXT 格式的题库文件</p>
              <div class="modal__file-input-wrapper">
                <input type="file" id="quizFileInput" accept=".json,.txt" @change="handleFileSelect" />
                <label for="quizFileInput" class="modal__file-input-label">
                  <BaseIcon name="upload" size="16" />
                  选择文件
                </label>
              </div>
            </div>

            <div class="modal__import-option">
              <h3>URL导入</h3>
              <p>输入题库文件的URL地址</p>
              <div class="modal__url-import">
                <input type="text" v-model="importUrl" placeholder="https://example.com/quiz.json" />
                <button @click="importFromUrl" :disabled="!importUrl || isLoading">导入</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 导出面板 -->
        <div v-if="activeTab === 'export'" class="modal__tab-panel modal__tab-panel--active">
          <div class="modal__export-options">
            <div class="modal__export-option" v-if="quizData">
              <h3>导出当前题库</h3>
              <p>将当前加载的题库导出为JSON文件</p>
              <button @click="exportCurrentQuiz" class="modal__export-button">
                <BaseIcon name="download" size="16" />
                导出题库
              </button>
            </div>

            <div class="modal__export-option" v-else>
              <h3>未加载题库</h3>
              <p>请先加载一个题库才能导出</p>
            </div>

            <div class="modal__export-option">
              <h3>导出所有本地题库</h3>
              <p>将所有本地缓存的题库导出为ZIP文件</p>
              <button @click="exportAllQuizzes" class="modal__export-button">
                <BaseIcon name="download" size="16" />
                导出所有题库
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <button class="modal__button modal__button--secondary" @click="$emit('close')">关闭</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseIcon from '@/components/icon.vue';
import BaseModal from './modal-base.vue';
import type { QuizData } from '../services/config-service'
import configService from '../services/config-service'
import { parseQuiz } from '@/services/service-quiz-parser';
import { showToast } from '@/utils/toast';

const props = defineProps<{
  quizData?: QuizData;
  show: boolean;
}>();

const emit = defineEmits(['close', 'import-complete']);

const activeTab = ref('import');
const importUrl = ref('');
const isLoading = ref(false);

/**
 * 处理文件上传
 */
function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input?.files?.[0];
  if (!file) return;

  processImportFile(file, input);
}

/**
 * 从URL导入题库
 */
function importFromUrl() {
  if (!importUrl.value || isLoading.value) return;

  isLoading.value = true;
  showToast('正在从URL加载题库...', 'info');

  fetch(importUrl.value)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP错误：${response.status}`);
      }
      return response.text();
    })
    .then(text => {
      processImportData(text, importUrl.value);
    })
    .catch(error => {
      showToast(`URL导入失败: ${error.message}`, 'error');
    })
    .finally(() => {
      isLoading.value = false;
    });
}

/**
 * 处理导入文件内容
 */
function processImportFile(file: File, input: HTMLInputElement) {
  isLoading.value = true;
  showToast('正在解析题库文件...', 'info');

  const reader = new FileReader();

  reader.onload = (e: ProgressEvent<FileReader>) => {
    try {
      const content = e.target?.result as string;
      processImportData(content, file.name);
    } catch (error) {
      showToast(`解析题库文件失败: ${(error as Error).message}`, 'error');
    } finally {
      isLoading.value = false;
      // 重置文件输入，以便用户可以再次选择同一文件
      if (input) input.value = '';
    }
  };

  reader.onerror = () => {
    showToast('读取文件失败', 'error');
    isLoading.value = false;
  };

  reader.readAsText(file);
}

/**
 * 处理导入的数据内容
 */
function processImportData(content: string, filename: string) {
  try {
    // 使用统一解析器
    const data = parseQuiz(content, filename);

    // 使用增强版的验证函数，提高兼容性
    if (configService.enhancedValidQuizData(data)) {
      // 导入成功
      showToast(`成功解析题库：${filename}`, 'success');
      emit('import-complete', data);
    } else {
      throw new Error('题库格式无效');
    }
  } catch (error) {
    showToast(`解析题库失败: ${(error as Error).message}`, 'error');
  } finally {
    isLoading.value = false;
  }
}

/**
 * 导出当前题库
 */
function exportCurrentQuiz() {
  if (!props.quizData) {
    showToast('没有可导出的题库', 'error');
    return;
  }

  const dataStr = JSON.stringify(props.quizData, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
  const exportFileName = `${props.quizData.title || 'quiz'}_${new Date().toISOString().split('T')[0]}.json`;

  downloadFile(dataUri, exportFileName);
  showToast('题库导出成功', 'success');
}

/**
 * 导出所有题库
 */
function exportAllQuizzes() {
  showToast('多题库导出功能尚未实现', 'warning');
}

/**
 * 辅助函数：下载文件
 */
function downloadFile(dataUri: string, fileName: string) {
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', fileName);
  linkElement.click();
}
</script>
