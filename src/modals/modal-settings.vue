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
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import BaseModal from './modal-base.vue';

// UI设置接口
interface UiSettings {
  darkMode: boolean;
  themeColor: string;
  customColor: string;
  fontSize: number;
  fontFamily: string;
  animationEnabled: boolean;
}

// 测验设置接口
export interface QuizSettings {
  autoSubmit: boolean;
  autoNext: boolean;
  allowSkip: boolean;
  showNotesAfterAnswer: boolean;
  lockAnswerAfterSubmit: boolean;
  showCorrectAnswerImmediately: boolean;
  showProgress: boolean;
  swipeGestureEnabled: boolean;
  randomMode: boolean;
  reviewMode: boolean;
  canEditQuestion?: boolean;
  canSyncNotes?: boolean;
  viewWrongAfterAll?: boolean;
}

// API配置接口
interface ApiConfig {
  enabled: boolean;
  autoGenerate?: boolean;
  streamOutput?: boolean;
}

// 通用设置接口
export interface GeneralSettings {
  uiSettings: UiSettings;
  quizSettings: QuizSettings;
  debugEnabled: boolean;
  apiConfig?: ApiConfig;
}

const props = defineProps<{
  show: boolean;
  currentSettings?: GeneralSettings;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', settings: GeneralSettings): void;
}>();

// 活动标签
const activeTab = ref('quiz');

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

// 默认设置
const defaultSettings: GeneralSettings = {
  uiSettings: {
    darkMode: document.documentElement.getAttribute('theme') === 'dark',
    themeColor: 'default',
    customColor: '#4caf50',
    fontSize: 14,
    fontFamily: 'sans-serif',
    animationEnabled: true
  },
  quizSettings: {
    autoSubmit: false,
    autoNext: true,
    allowSkip: true,
    showNotesAfterAnswer: true,
    lockAnswerAfterSubmit: false,
    showCorrectAnswerImmediately: true,
    showProgress: true,
    swipeGestureEnabled: true,
    randomMode: false,
    reviewMode: false,
    viewWrongAfterAll: true
  },
  debugEnabled: localStorage.getItem('debugEnabled') === 'true'
};

// 本地设置
const localSettings = reactive<GeneralSettings>(JSON.parse(JSON.stringify(defaultSettings)));

// 监听属性变化更新本地状态
watch(() => props.show, (newVal) => {
  if (newVal && props.currentSettings) {
    // 使用深拷贝，避免直接修改props
    const mergedSettings = { ...defaultSettings };

    // 合并UI设置
    if (props.currentSettings.uiSettings) {
      mergedSettings.uiSettings = { ...mergedSettings.uiSettings, ...props.currentSettings.uiSettings };
    }

    // 合并测验设置
    if (props.currentSettings.quizSettings) {
      mergedSettings.quizSettings = { ...mergedSettings.quizSettings, ...props.currentSettings.quizSettings };
    }

    // 合并其他设置
    mergedSettings.debugEnabled = props.currentSettings.debugEnabled ?? defaultSettings.debugEnabled;

    if (props.currentSettings.apiConfig) {
      mergedSettings.apiConfig = { ...props.currentSettings.apiConfig };
    }

    // 应用合并后的设置
    Object.assign(localSettings, mergedSettings);
  }
}, { immediate: true });

// 监听当前设置变化
watch(() => props.currentSettings, (newSettings) => {
  if (props.show && newSettings) {
    const mergedSettings = { ...defaultSettings };

    // 合并UI设置
    if (newSettings.uiSettings) {
      mergedSettings.uiSettings = { ...mergedSettings.uiSettings, ...newSettings.uiSettings };
    }

    // 合并测验设置
    if (newSettings.quizSettings) {
      mergedSettings.quizSettings = { ...mergedSettings.quizSettings, ...newSettings.quizSettings };
    }

    // 合并其他设置
    mergedSettings.debugEnabled = newSettings.debugEnabled ?? defaultSettings.debugEnabled;

    if (newSettings.apiConfig) {
      mergedSettings.apiConfig = { ...newSettings.apiConfig };
    }

    // 应用合并后的设置
    Object.assign(localSettings, mergedSettings);
  }
}, { deep: true });

// 保存设置
function saveSettings() {
  emit('save', JSON.parse(JSON.stringify(localSettings)));
  emit('close');
}
</script>
