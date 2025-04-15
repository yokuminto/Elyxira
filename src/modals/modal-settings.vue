<template>
  <BaseModal :show="show" title="设置" content-class="modal__content--settings" @close="$emit('close')">
    <div class="modal__settings-tabs">
      <button class="modal__settings-tab" :class="{ 'modal__settings-tab--active': activeTab === 'quiz' }"
        @click="activeTab = 'quiz'">刷题设置</button>
      <button class="modal__settings-tab" :class="{ 'modal__settings-tab--active': activeTab === 'general' }"
        @click="activeTab = 'general'">通用设置</button>
    </div>

    <div v-if="activeTab === 'quiz'" class="modal__tab-container">
      <!-- 测验设置选项卡内容 -->
      <div class="modal__settings-group">
        <h3 class="modal__settings-group-title">模式</h3>
        <div class="modal__setting-item">
          <span class="modal__setting-item-name">随机刷题</span>
          <label class="modal__toggle-switch"><input type="checkbox"
              v-model="localSettings.quizSettings.randomMode"><span class="modal__toggle-slider"></span></label>
        </div>
        <div class="modal__setting-item">
          <span class="modal__setting-item-name">背题模式</span>
          <label class="modal__toggle-switch"><input type="checkbox"
              v-model="localSettings.quizSettings.reviewMode"><span class="modal__toggle-slider"></span></label>
        </div>
      </div>

      <div class="modal__settings-group">
        <h3 class="modal__settings-group-title">交互</h3>
        <div class="modal__setting-item">
          <span class="modal__setting-item-name">选择后自动提交</span>
          <label class="modal__toggle-switch"><input type="checkbox"
              v-model="localSettings.quizSettings.autoSubmit"><span class="modal__toggle-slider"></span></label>
        </div>
        <div class="modal__setting-item">
          <span class="modal__setting-item-name">提交后自动下一题</span>
          <label class="modal__toggle-switch"><input type="checkbox" v-model="localSettings.quizSettings.autoNext"><span
              class="modal__toggle-slider"></span></label>
        </div>
        <div class="modal__setting-item">
          <span class="modal__setting-item-name">允许跳过未答题目</span>
          <label class="modal__toggle-switch"><input type="checkbox"
              v-model="localSettings.quizSettings.allowSkip"><span class="modal__toggle-slider"></span></label>
        </div>
        <div class="modal__setting-item">
          <span class="modal__setting-item-name">滑动手势切换</span>
          <label class="modal__toggle-switch"><input type="checkbox"
              v-model="localSettings.quizSettings.swipeGestureEnabled"><span
              class="modal__toggle-slider"></span></label>
        </div>
      </div>

      <div class="modal__settings-group">
        <h3 class="modal__settings-group-title">显示</h3>
        <div class="modal__setting-item">
          <span class="modal__setting-item-name">回答后显示笔记</span>
          <label class="modal__toggle-switch"><input type="checkbox"
              v-model="localSettings.quizSettings.showNotesAfterAnswer"><span
              class="modal__toggle-slider"></span></label>
        </div>
        <div class="modal__setting-item">
          <span class="modal__setting-item-name">显示进度条/正确率</span>
          <label class="modal__toggle-switch"><input type="checkbox"
              v-model="localSettings.quizSettings.showProgress"><span class="modal__toggle-slider"></span></label>
        </div>
      </div>

      <div class="modal__settings-group">
        <h3 class="modal__settings-group-title">答案行为</h3>
        <div class="modal__setting-item">
          <span class="modal__setting-item-name">提交后不允许更改</span>
          <label class="modal__toggle-switch"><input type="checkbox"
              v-model="localSettings.quizSettings.lockAnswerAfterSubmit"><span
              class="modal__toggle-slider"></span></label>
        </div>
        <div class="modal__setting-item">
          <span class="modal__setting-item-name">提交后立即显示正确答案</span>
          <label class="modal__toggle-switch"><input type="checkbox"
              v-model="localSettings.quizSettings.showCorrectAnswerImmediately"><span
              class="modal__toggle-slider"></span></label>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'general'" class="modal__tab-container">
      <!-- 通用设置选项卡内容 -->
      <div class="modal__settings-group">
        <h3 class="modal__settings-group-title">显示</h3>
        <div class="modal__setting-item">
          <span class="modal__setting-item-name">字体大小</span>
          <div class="modal__form-input-group">
            <input type="range" v-model.number="localSettings.uiSettings.fontSize" min="12" max="20" step="1" />
            <span>{{ localSettings.uiSettings.fontSize }}px</span>
          </div>
        </div>
        <div class="modal__setting-item">
          <span class="modal__setting-item-name">字体选择</span>
          <select v-model="localSettings.uiSettings.fontFamily" class="modal__select-styled">
            <option v-for="font in availableFonts" :key="font.value" :value="font.value">
              {{ font.name }}
            </option>
          </select>
        </div>
        <div class="modal__setting-item">
          <span class="modal__setting-item-name">启用动画效果</span>
          <label class="modal__toggle-switch"><input type="checkbox"
              v-model="localSettings.uiSettings.animationEnabled"><span class="modal__toggle-slider"></span></label>
        </div>
      </div>

      <div class="modal__settings-group">
        <h3 class="modal__settings-group-title">数据管理</h3>
        <div class="modal__setting-item">
          <span class="modal__setting-item-name">导出配置</span>
          <button class="modal__button modal__button--secondary" @click="exportConfig">
            导出为JSON
          </button>
        </div>
        <div class="modal__setting-item">
          <span class="modal__setting-item-name">导入配置</span>
          <button class="modal__button modal__button--secondary" @click="showImportModal">
            选择文件导入
          </button>
        </div>
      </div>

      <div class="modal__settings-group">
        <h3 class="modal__settings-group-title">调试</h3>
        <div class="modal__setting-item">
          <span class="modal__setting-item-name">调试模式</span>
          <label class="modal__toggle-switch">
            <input type="checkbox" v-model="localSettings.debugEnabled" />
            <span class="modal__toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>

    <template #footer>
      <button @click="$emit('close')" class="modal__button modal__button--secondary">取消</button>
      <button @click="saveSettings" class="modal__button modal__button--primary">保存设置</button>
    </template>
  </BaseModal>

  <!-- 导入配置模态框 -->
  <BaseModal :show="isImportModalVisible" title="导入配置" @close="isImportModalVisible = false">
    <div class="modal__body">
      <p>选择要导入的配置文件：</p>
      <input type="file" id="importFileInput" accept=".json" @change="handleImportFileSelect" />
    </div>
    <template #footer>
      <button @click="isImportModalVisible = false" class="modal__button modal__button--secondary">取消</button>
      <button @click="importConfig" class="modal__button modal__button--primary">导入</button>
    </template>
  </BaseModal>

  <!-- 导出成功提示 -->
  <BaseModal :show="isExportSuccessModalVisible" title="导出成功" @close="isExportSuccessModalVisible = false">
    <div class="modal__body">
      <p>配置文件已成功导出为JSON文件。</p>
      <p>导出时间：{{ exportTimestamp }}</p>
    </div>
    <template #footer>
      <button @click="isExportSuccessModalVisible = false" class="modal__button modal__button--primary">关闭</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onBeforeUnmount, onMounted } from 'vue';
import BaseModal from './modal-base.vue';
import { showToast } from '../utils/toast';
import configService from '../services/config-service';
import type { AppSettings, UiSettings, QuizSettings } from '@/services/config-service';

// 字体列表
const availableFonts = [
  { name: '系统默认 (sans-serif)', value: 'sans-serif' },
  { name: '系统默认 (serif)', value: 'serif' },
  { name: '系统默认 (monospace)', value: 'monospace' },
  { name: '苹方 (PingFang SC)', value: '\'PingFang SC\', sans-serif' },
  { name: '微软雅黑 (Microsoft YaHei)', value: '\'Microsoft YaHei\', sans-serif' },
  { name: '思源黑体 (Noto Sans SC)', value: '\'Noto Sans SC\', sans-serif' },
  { name: '霞鹜文楷 (LXGW WenKai)', value: '\'LXGW WenKai\', cursive' },
  { name: 'JetBrains Mono', value: '\'JetBrains Mono\', monospace' },
  { name: 'Fira Code', value: '\'Fira Code\', monospace' },
  { name: 'IBM Plex Sans', value: '\'IBM Plex Sans\', sans-serif' },
  { name: 'Roboto Mono', value: '\'Roboto Mono\', monospace' },
  { name: '更纱黑体 (Sarasa Gothic)', value: '\'Sarasa Gothic SC\', sans-serif' },
];

const props = defineProps<{
  show: boolean;
  'ui-settings'?: UiSettings;
  'quiz-settings'?: QuizSettings;
  'debug-enabled'?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', settings: AppSettings): void;
}>();

// 活动标签
const activeTab = ref('quiz');

// 导入导出相关变量
const isImportModalVisible = ref(false);
const isExportSuccessModalVisible = ref(false);
const exportTimestamp = ref('');

// 本地设置
const localSettings = reactive<AppSettings>(
  JSON.parse(JSON.stringify(configService.getSettings()))
);

// 设置变更监听器
const settingsChangeListener = () => {
  Object.assign(localSettings, JSON.parse(JSON.stringify(configService.getSettings())));
};

onMounted(() => {
  // 添加设置变更监听器
  configService.addListener('settings', settingsChangeListener);
});

onBeforeUnmount(() => {
  // 移除设置变更监听器
  configService.removeListener('settings', settingsChangeListener);
});

// 监听属性变化更新本地状态
watch(() => props.show, (newVal) => {
  if (newVal) {
    // 从配置服务获取最新设置
    const settings = JSON.parse(JSON.stringify(configService.getSettings()));

    // 如果props中传入了这些属性，则使用props中的值覆盖从服务获取的值
    if (props['ui-settings']) {
      settings.uiSettings = { ...settings.uiSettings, ...props['ui-settings'] };
    }

    if (props['quiz-settings']) {
      settings.quizSettings = { ...settings.quizSettings, ...props['quiz-settings'] };
    }

    if (props['debug-enabled'] !== undefined) {
      settings.debugEnabled = props['debug-enabled'];
    }

    Object.assign(localSettings, settings);
  }
}, { immediate: true });

// 保存设置
function saveSettings() {
  // 使用配置服务更新所有设置
  configService.updateSettings(JSON.parse(JSON.stringify(localSettings)));

  // 触发父组件的保存事件
  emit('save', JSON.parse(JSON.stringify(localSettings)));
  emit('close');
}

// 显示导入配置模态框
function showImportModal() {
  isImportModalVisible.value = true;
}

// 处理导入文件选择
function handleImportFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) {
    return;
  }
  // 文件已选择，可在导入按钮点击时处理
}

// 导入配置函数
function importConfig() {
  const fileInput = document.getElementById('importFileInput') as HTMLInputElement;
  if (!fileInput.files || fileInput.files.length === 0) {
    showToast('请选择要导入的配置文件', 'warning');
    return;
  }

  const file = fileInput.files[0];

  configService.importConfigFromFile(file)
    .then((success: boolean) => {
      if (success) {
        isImportModalVisible.value = false;
        // 重新加载应用或刷新设置
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    })
    .catch((error: Error) => {
      showToast('导入配置失败：' + error.message, 'error');
    });
}

// 导出配置函数
function exportConfig() {
  try {
    // 使用配置服务导出配置
    configService.exportConfig();

    // 显示成功提示
    isExportSuccessModalVisible.value = true;
    exportTimestamp.value = new Date().toISOString();
  } catch (error) {
    console.error('导出配置失败:', error);
  }
}
</script>
