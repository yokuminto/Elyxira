<template>
  <div class="page-quiz" :style="{ '--font-family': uiSettings.fontFamily || 'sans-serif' }">
    <!-- 轻量级提示信息 -->
    <div :class="['toast', toast.type ? `toast--${toast.type}` : '', toast.show ? 'toast--show' : '']">
      {{ toast.message }}
    </div>

    <div class="page-quiz__container">

      <!-- 页眉 -->
      <header class="page-quiz__header">
        <button class="page-quiz__back-button" @click="navigateBack" title="返回" aria-label="返回">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="feather feather-arrow-left">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h1 class="page-quiz__title">{{ quizTitle }}</h1>
        <!-- 操作按钮区域 -->
        <div class="page-quiz__header-actions">
          <!-- 主题切换按钮 -->
          <div class="page-quiz__theme-toggle" @click="toggleTheme" :class="{ 'dark': isDarkMode }">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="sun-icon feather feather-sun">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="moon-icon feather feather-moon">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </div>
          <button class="page-quiz__settings-button" @click="showModalSettings = true" title="设置" aria-label="设置">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z">
              </path>
            </svg>
          </button>
        </div>
      </header>

      <!-- 选项栏 -->
      <div class="page-quiz__options-bar">
        <div class="page-quiz__chapter-select">
          <span>章节：</span>
          <select v-model="selectedChapter" class="page-quiz__select">
            <option value="all">全部章节</option>
            <option v-for="(chapter, index) in chapters" :key="index" :value="chapter">
              {{ chapter }}
            </option>
          </select>
        </div>

        <div class="page-quiz__mode-buttons">
          <button class="page-quiz__mode-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            <span>刷题模式</span>
          </button>
          <button class="page-quiz__mode-button" @click="showOverviewModal = true">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>题目总览</span>
          </button>
          <button class="page-quiz__mode-button edit-button" v-if="quizSettings.canEditQuestion"
            @click="openCurrentQuestionEditor">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
            </svg>
            <span>编辑题目</span>
          </button>
        </div>
      </div>

      <!-- 问题区域 -->
      <div class="page-quiz__question-area" ref="questionAreaRef" @touchstart="handleTouchStart"
        @touchend="handleTouchEnd">
        <template v-if="currentQuestion">
          <div class="page-quiz__question-text" ref="questionTextRef"
            :class="{ 'slide-up': uiSettings.animationEnabled }">
            <span class="page-quiz__question-id">第{{ currentQuestion.number || (currentIndex + 1) }}题</span>
            <span v-html="formatQuestionTitle(currentQuestion.question)"></span>
          </div>

          <ul class="page-quiz__options-list"
            :class="[{ 'page-quiz--submitted': isQuizSubmitted }, { 'fade-in': uiSettings.animationEnabled }]">
            <li v-for="(option, index) in currentQuestion.options" :key="index" class="page-quiz__option"
              :class="getOptionClass(getOptionKey(option, index))" :data-key="getOptionKey(option, index)"
              @click="handleOptionClick(getOptionKey(option, index))">
              <div class="page-quiz__option-text">
                <span class="page-quiz__option-letter">{{ getOptionKey(option, index) }}</span>
                <span v-html="getOptionContent(option)"></span>
              </div>
              <div class="page-quiz__option-number" :class="getOptionKeyClass(getOptionKey(option, index))">
                {{ index + 1 }}
              </div>
            </li>
          </ul>

          <!-- 按钮区域 -->
          <div class="page-quiz__action-buttons-container">
            <div class="page-quiz__action-left">
              <button class="page-quiz__button page-quiz__submit-button" @click="submitAnswer" :disabled="!canSubmit">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  class="feather feather-check-circle">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                提交
                <span class="page-quiz__key-hint">空格</span>
              </button>

              <button class="page-quiz__button page-quiz__next-button" @click="nextQuestion" :disabled="!canGoNext">
                <span>下一题</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
                <span class="page-quiz__key-hint">空格</span>
              </button>
            </div>

            <div class="page-quiz__action-right">
              <button class="page-quiz__button page-quiz__submit-all-button" @click="submitQuiz"
                :disabled="isQuizSubmitted">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  class="feather feather-check-circle">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                交卷
              </button>

              <button class="page-quiz__button page-quiz__nav-button" @click="previousQuestion" :disabled="!canGoPrev">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                <span>上一题</span>
              </button>

              <button class="page-quiz__button page-quiz__redo-button" @click="redoQuiz" :disabled="isQuizSubmitted">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  class="feather feather-rotate-ccw">
                  <polyline points="1 4 1 10 7 10"></polyline>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                </svg>
                重做
              </button>
            </div>
          </div>

          <!-- 进度条 -->
          <div class="page-quiz__progress-footer">
            <div class="page-quiz__progress-info">
              <span>进度: {{ answeredCount }}/{{ totalQuestions }}</span>
              <span class="page-quiz__accuracy">正确率: {{ accuracyPercent }}%</span>
            </div>
            <div class="page-quiz__progress-bar-container">
              <div class="page-quiz__progress-bar" :style="{ width: progressPercent + '%' }"></div>
            </div>
          </div>

          <!-- 笔记区域 -->
          <div class="page-quiz__notes" :class="{ 'page-quiz__notes--hidden': !notesVisible }">
            <div class="page-quiz__notes-header">
              <h3 class="page-quiz__notes-title">
                笔记
                <span v-if="isGeneratingCurrent" class="notes-generation-status current">
                  题目({{ activeGenerationIndex !== null ? activeGenerationIndex + 1 : '?' }})生成笔记中...
                </span>
              </h3>
              <div class="page-quiz__notes-actions">
                <button class="page-quiz__button page-quiz__button--icon sync-status" :class="syncStatusClass"
                  :title="syncStatusTitle" @click="triggerSync" :disabled="syncStatus === 'pending'">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="feather feather-refresh-cw">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                </button>
                <button class="page-quiz__button page-quiz__button--icon" @click="toggleNotesEditor"
                  :disabled="isQuizSubmitted || isGenerating" :title="isEditingNotes ? '取消编辑' : '编辑笔记'">
                  <svg v-if="!isEditingNotes" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" class="feather feather-edit">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="feather feather-x">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                <button class="page-quiz__button page-quiz__button--icon page-quiz__ai-button icon-only"
                  @click="triggerAINotesGeneration" :disabled="isQuizSubmitted || isGenerating"
                  :class="{ 'button--loading': isGeneratingCurrent }"
                  :title="isGeneratingCurrent ? '正在生成笔记...' : 'AI生成笔记'">
                  <span v-if="isGeneratingCurrent" class="loading-spinner"></span>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="feather feather-zap">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                </button>
                <button class="page-quiz__button page-quiz__button--icon page-quiz__settings-button"
                  @click="openSyncConfigModal" title="GitHub仓库设置">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="feather feather-github">
                    <path
                      d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22">
                    </path>
                  </svg>
                </button>
                <button class="page-quiz__button page-quiz__button--icon page-quiz__settings-button"
                  @click="showApiConfigModal = true" title="API设置">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="feather feather-sliders">
                    <line x1="4" y1="21" x2="4" y2="14"></line>
                    <line x1="4" y1="10" x2="4" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12" y2="3"></line>
                    <line x1="20" y1="21" x2="20" y2="16"></line>
                    <line x1="20" y1="12" x2="20" y2="3"></line>
                    <line x1="1" y1="14" x2="7" y2="14"></line>
                    <line x1="9" y1="8" x2="15" y2="8"></line>
                    <line x1="17" y1="16" x2="23" y2="16"></line>
                  </svg>
                </button>
              </div>
            </div>

            <div ref="notesDisplayRef" class="page-quiz__notes-display markdown-body"
              :class="{ 'page-quiz__notes-display--hidden': isEditingNotes, 'generating': isGeneratingCurrent }"
              v-html="renderedNotesHtml"></div>

            <div class="page-quiz__notes-editor" :class="{ 'page-quiz__notes-editor--hidden': !isEditingNotes }">
              <div class="page-quiz__markdown-toolbar">
                <button @click="insertMarkdown('**粗体**')">粗体</button>
                <button @click="insertMarkdown('*斜体*')">斜体</button>
                <button @click="insertMarkdown('# 标题')">标题</button>
                <button @click="insertMarkdown('- 列表项')">列表</button>
                <button @click="insertMarkdown('```\\n代码块\\n```')">代码</button>
                <button @click="insertMarkdown('```mermaid\\ngraph TD;\\nA-->B;\\n```')">图表</button>
              </div>
              <textarea ref="notesTextareaRef" class="page-quiz__notes-textarea" placeholder="在此添加笔记..."
                v-model="notesEditText" @input="autoResizeTextarea"></textarea>
              <button @click="saveNotes" class="page-quiz__button page-quiz__button--primary">保存笔记</button>
            </div>
          </div>
        </template>
        <div v-else class="page-quiz__loading">
          {{ loading ? '题目加载中...' : '没有题目数据或加载失败' }}
        </div>
      </div>
    </div>

    <!-- 模态框 -->
    <ModalQuestionOverview :show="showOverviewModal" :questions="localQuestions as any" :current-index="currentIndex"
      @close="showOverviewModal = false" @jump-to="jumpToQuestion" />
    <ModalStatistics :show="showModalStatistics" :stats="quizStats" @close="showModalStatistics = false"
      @view-wrong="viewWrongQuestions" @continue="showModalStatistics = false" @back-home="navigateBack" />
    <ModalSettings :show="showModalSettings" :ui-settings="uiSettings" :quiz-settings="quizSettings"
      :debug-enabled="configService.isDebugEnabled()" @close="showModalSettings = false"
      @save="applySettingsFromModal" />
    <ModalQuestionEdit :show="showEditModal" :question="questionToEdit as any" @close="closeEditModal"
      @save="handleSaveQuestion" />
    <ModalQuizSync :show="showSyncConfigModal" @close="showSyncConfigModal = false" @save="handleSyncConfigSave"
      :current-quiz="currentQuizInfo" />
    <ModalApiConfig :show="showApiConfigModal" @close="showApiConfigModal = false"
      :current-config="getCompleteApiConfig()" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import MarkdownIt from 'markdown-it'
import mermaid from 'mermaid'

import configService, { QuizMode, type Question, type GithubConfig, type UiSettings, type QuizSettings, type AppSettings, type ApiConfig } from '@/services/config-service'
import { showToast } from '@/utils/toast'

// 引入子组件
import ModalQuestionOverview from '@/modals/modal-question-overview.vue'
import ModalStatistics from '@/modals/modal-statistics.vue'
import ModalSettings from '@/modals/modal-settings.vue'
import ModalQuestionEdit from '@/modals/modal-question-edit.vue'
import ModalQuizSync from '@/modals/modal-quiz-sync.vue'
import ModalApiConfig from '@/modals/modal-api-config.vue'

// 引入样式
import './page-quiz.css'
import '../../styles/variables.css'

// --- 类型定义 ---
interface UserAnswerRecord {
  answer: string;
  timestamp?: number;
  isCorrect?: boolean;
}

interface QuizStats {
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  wrongQuestionIds: string[];
}

type StreamCallback = (chunk: string, targetIndex: number) => void;
type CompletionCallback = (finalNote: string, targetIndex: number, error?: string) => void;

// --- 路由 ---
const router = useRouter();

// --- 响应式状态 ---
const loading = ref(true);
const error = ref<string | null>(null);
const localQuestions = ref<Question[]>([]);
const currentIndex = ref(0);
const selectedAnswer = ref<string | null>(null);
const isQuizSubmitted = ref(false);
const wrongQuestionIds = ref<string[]>([]);
const isReviewingWrong = ref(false);
const syncStatus = ref<'idle' | 'pending' | 'success' | 'error'>('idle'); // More specific type
const activeGenerationIndex = ref<number | null>(null);
const selectedChapter = ref('all');
const chapters = ref<string[]>([]);
const isEditingNotes = ref(false);
const isGenerating = ref(false);
const notesEditText = ref('');
const renderedNotesHtml = ref('');
const forceShowNotes = ref(false);

// 模态框状态
const showOverviewModal = ref(false);
const showModalStatistics = ref(false);
const showModalSettings = ref(false);
const showEditModal = ref(false);
const showSyncConfigModal = ref(false);
const showApiConfigModal = ref(false);
const questionToEdit = ref<Question | null>(null);

// 提示信息状态
const toast = reactive<{ show: boolean; message: string; type: 'info' | 'success' | 'warning' | 'error' }>({
  show: false,
  message: '',
  type: 'info'
});
let toastTimer: number | null = null;

// --- 服务配置 ---
const quizSettings = computed(() => configService.getQuizSettings());
const uiSettings = computed(() => configService.getUiSettings());
const apiConfig = computed(() => configService.getApiConfig());
const isDarkMode = computed(() => uiSettings.value.darkMode);

// --- DOM引用 ---
const questionAreaRef = ref<HTMLDivElement | null>(null);
const notesDisplayRef = ref<HTMLDivElement | null>(null);
const notesTextareaRef = ref<HTMLTextAreaElement | null>(null);
const questionTextRef = ref<HTMLElement | null>(null);

// --- 计算属性 ---
const quizTitle = computed(() => {
  const quizData = configService.getQuizData();
  const lastLoaded = configService.getLastLoadedQuiz();
  return quizData?.title || lastLoaded?.name || '测验';
});

const currentQuestion = computed<Question | null>(() => {
  if (currentIndex.value >= 0 && currentIndex.value < localQuestions.value.length) {
    return localQuestions.value[currentIndex.value];
  }
  return null;
});

const isCurrentAnswered = computed(() => {
  return currentQuestion.value?.userAnswer !== null && currentQuestion.value?.userAnswer !== undefined;
});

const canSubmit = computed(() => {
  return selectedAnswer.value !== null &&
    !isQuizSubmitted.value &&
    !quizSettings.value.reviewMode &&
    (!isCurrentAnswered.value || !quizSettings.value.lockAnswerAfterSubmit);
});

const isAnswerLocked = computed(() => {
  return isCurrentAnswered.value && quizSettings.value.lockAnswerAfterSubmit;
});

const canGoNext = computed(() => {
  const hasMoreQuestions = currentIndex.value < totalQuestions.value - 1;
  const canProceed = isCurrentAnswered.value || quizSettings.value.reviewMode || quizSettings.value.allowSkip;
  return !isQuizSubmitted.value && (hasMoreQuestions || canProceed);
});

const canGoPrev = computed(() => {
  return currentIndex.value > 0 && !isQuizSubmitted.value;
});

const totalQuestions = computed(() => localQuestions.value.length);

const answeredCount = computed(() => {
  return localQuestions.value.filter(q => q.userAnswer !== null && q.userAnswer !== undefined).length;
});

const correctCount = computed(() => {
  return localQuestions.value.filter(q => q.userAnswer !== null && q.userAnswer !== undefined && compareAnswers(q.userAnswer, q.answer)).length;
});

const progressPercent = computed(() => {
  return totalQuestions.value > 0 ? Math.round((answeredCount.value / totalQuestions.value) * 100) : 0;
});

const accuracyPercent = computed(() => {
  if (answeredCount.value === 0) return 0;
  return Math.round((correctCount.value / answeredCount.value) * 100);
});

const quizStats = computed<QuizStats>(() => ({
  totalQuestions: totalQuestions.value,
  answeredCount: answeredCount.value,
  correctCount: correctCount.value,
  wrongQuestionIds: wrongQuestionIds.value.map(String) // Ensure IDs are strings
}));

const notesVisible = computed(() => {
  if (!currentQuestion.value) return false;
  const isAnswered = isCurrentAnswered.value;
  const showAfterAnswer = quizSettings.value.showNotesAfterAnswer;
  return forceShowNotes.value || !showAfterAnswer || quizSettings.value.reviewMode || isAnswered;
});

const syncStatusClass = computed(() => {
  switch (syncStatus.value) {
    case 'pending': return 'sync-pending';
    case 'success': return 'sync-success';
    case 'error': return 'sync-error';
    default: return 'sync-idle';
  }
});

const syncStatusTitle = computed(() => {
  switch (syncStatus.value) {
    case 'pending': return '同步中...';
    case 'success': return '同步成功';
    case 'error': return '同步失败';
    default: return '点击同步笔记';
  }
});

const isGeneratingCurrent = computed(() => {
  return isGenerating.value && activeGenerationIndex.value !== null;
});

const currentQuizInfo = computed(() => {
  const quizData = configService.getQuizData();
  const lastLoaded = configService.getLastLoadedQuiz();
  const exists = !!quizData || !!lastLoaded?.name;

  return {
    name: lastLoaded?.name || quizData?.title || '',
    source: lastLoaded?.source || '',
    isLocal: lastLoaded?.source === 'local',
    exists: exists
  };
});

// --- Markdown & Mermaid ---
const mdInstance = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
});

// --- 方法 ---

/**
 * 显示轻量级提示信息
 */
function showCustomToast(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', duration = 3000) {
  if (toastTimer) {
    clearTimeout(toastTimer);
  }
  toast.message = message;
  toast.type = type;
  toast.show = true;
  toastTimer = window.setTimeout(() => {
    toast.show = false;
    toastTimer = null;
  }, duration);
}

/**
 * 导航回题库列表
 */
function navigateBack() {
  router.push('/library');
}

/**
 * 初始化测验页面
 */
function initializeQuiz() {
  loading.value = true;
  isQuizSubmitted.value = false;
  isReviewingWrong.value = false;
  wrongQuestionIds.value = [];
  error.value = null;

  initMermaid();
  setupKeyboardListeners();
  loadQuizDataAndFilter();
}

/**
 * 加载题库数据并根据章节过滤
 */
function loadQuizDataAndFilter() {
  loading.value = true;
  error.value = null;

  const quizData = configService.getQuizData();
  if (!quizData || !quizData.chapters) {
    error.value = '题库数据为空，请返回选择题库';
    loading.value = false;
    return;
  }

  chapters.value = configService.getQuizChapters();
  const savedConfig = configService.getQuizConfig();
  selectedChapter.value = savedConfig.chapterIndex || 'all'; // Set selectedChapter before filtering

  filterQuestionsByChapter(selectedChapter.value); // Now filter based on the correct chapter

  if (localQuestions.value.length > 0) {
    nextTick(() => {
      loadQuestion(0); // Start from the first question of the selected chapter/all
    });
  } else {
    error.value = `当前章节 "${selectedChapter.value}" 没有题目`;
  }

  loading.value = false;
}

/**
 * 加载指定索引的问题
 */
async function loadQuestion(index: number) {
  if (index < 0 || index >= localQuestions.value.length) {
    console.warn("无效的问题索引:", index);
    if (!isQuizSubmitted.value && localQuestions.value.length > 0) { // Only submit if there were questions
      submitQuiz();
    }
    return;
  }

  currentIndex.value = index;
  selectedAnswer.value = currentQuestion.value?.userAnswer ?? null; // Load saved answer
  isEditingNotes.value = false; // Close editor when changing questions

  await renderNotesForCurrentQuestion();

  // Scroll question area to top
  if (questionAreaRef.value) {
    questionAreaRef.value.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Check and trigger auto-generation for the *next* question
  nextTick(() => {
    checkAndTriggerAutoGeneration();
  });
}

/**
 * 处理选项点击
 */
function handleOptionClick(key: string) {
  if (isQuizSubmitted.value || quizSettings.value.reviewMode || isAnswerLocked.value) {
    return;
  }

  selectedAnswer.value = key;

  // 如果允许修改答案并且答案已提交，则立即更新答案
  if (isCurrentAnswered.value && !quizSettings.value.lockAnswerAfterSubmit) {
    updateUserAnswer(key);
  }

  // 如果开启了自动提交且尚未回答，则提交
  if (quizSettings.value.autoSubmit && !isCurrentAnswered.value) {
    nextTick(submitAnswer);
  }
}

/**
 * 更新用户答案并保存状态
 */
function updateUserAnswer(answerKey: string) {
  const question = currentQuestion.value;
  if (!question) return;

  const previousAnswer = question.userAnswer;
  question.userAnswer = answerKey;

  // 保存问题状态
  configService.updateQuestion(question.id, { userAnswer: answerKey });

  // 更新错题统计
  const isCorrect = compareAnswers(answerKey, question.answer);
  const questionIdStr = String(question.id);
  const wasWrongIndex = wrongQuestionIds.value.indexOf(questionIdStr);
  const wasWrong = wasWrongIndex !== -1;

  if (!isCorrect && !wasWrong) {
    wrongQuestionIds.value.push(questionIdStr);
  } else if (isCorrect && wasWrong) {
    wrongQuestionIds.value.splice(wasWrongIndex, 1);
  }

  // 如果答案是从错误变正确或从未答变正确，可能需要更新整体统计数据
  // 注意：configService.updateQuizStats 在 submitAnswer 中处理初次提交
  // 这里只处理答案修改的情况
  if (previousAnswer !== answerKey) {
    // configService.saveQuizState(); // updateQuestion already saves state implicitly
  }
}


/**
 * 提交当前问题的答案
 */
function submitAnswer() {
  if (selectedAnswer.value === null || isAnswerLocked.value) return;

  const question = currentQuestion.value;
  if (!question) return;

  const isCorrect = compareAnswers(selectedAnswer.value, question.answer);

  // 只有在用户答案改变时才更新统计和状态
  if (question.userAnswer !== selectedAnswer.value) {
    question.userAnswer = selectedAnswer.value; // Update local view first

    // Use configService to update the persistent state and stats
    const updateSuccess = configService.updateQuestion(question.id, { userAnswer: selectedAnswer.value });

    if (updateSuccess) {
      configService.updateQuizStats({
        totalAnswered: 1, // Increment answered count
        correctCount: isCorrect ? 1 : 0, // Increment correct count if applicable
        wrongCount: isCorrect ? 0 : 1   // Increment wrong count if applicable
      });

      // Update wrong question ID list based on correctness
      const questionIdStr = String(question.id);
      const wasWrongIndex = wrongQuestionIds.value.indexOf(questionIdStr);

      if (!isCorrect && wasWrongIndex === -1) {
        wrongQuestionIds.value.push(questionIdStr);
      } else if (isCorrect && wasWrongIndex !== -1) {
        wrongQuestionIds.value.splice(wasWrongIndex, 1);
      }
      configService.saveQuizState(); // Persist the changes including stats

    } else {
      console.error("Failed to save user answer via configService for question:", question.id);
      // Optionally revert local userAnswer or show an error
      // question.userAnswer = previousAnswer; // Revert if save failed?
      showToast("保存答案失败", "error");
      return; // Stop further processing like auto-next if save failed
    }
  }


  // 渲染笔记（如果设置了答后显示）
  if (quizSettings.value.showNotesAfterAnswer) {
    forceShowNotes.value = true; // Ensure notes are visible
    renderNotesForCurrentQuestion();
  }

  // 自动进入下一题
  if (quizSettings.value.autoNext && canGoNext.value) {
    setTimeout(nextQuestion, 1000);
  }
}


/**
 * 导航到上一题
 */
function previousQuestion() {
  if (canGoPrev.value) {
    loadQuestion(currentIndex.value - 1);
  }
}

/**
 * 导航到下一题
 */
function nextQuestion() {
  if (currentIndex.value < totalQuestions.value - 1) {
    loadQuestion(currentIndex.value + 1);
  } else if (!isQuizSubmitted.value) {
    showToast('已经是最后一题了', 'info');
    // Consider submitting the quiz automatically if autoSubmit is enabled or showing stats
    // submitQuiz();
  }
}

/**
 * 跳转到指定问题
 */
function jumpToQuestion(index: number) {
  if (index >= 0 && index < totalQuestions.value) {
    loadQuestion(index);
  }
}

/**
 * 提交整个测验
 */
function submitQuiz() {
  if (isQuizSubmitted.value) return;
  isQuizSubmitted.value = true;
  showModalStatistics.value = true;
  // 保存本次测验统计快照 (可选)
  localStorage.setItem('lastQuizStats', JSON.stringify({
    ...quizStats.value, // Use computed session stats
    timestamp: Date.now(),
    quizTitle: quizTitle.value
  }));
  // 可以考虑保存累积统计数据
  // configService.saveQuizStatsToStorage();
}

/**
 * 重做当前测验
 */
function redoQuiz() {
  if (window.confirm('确定要重做本次测验吗？所有答题记录将被清空。')) {
    // 清除本地视图状态
    isQuizSubmitted.value = false;
    wrongQuestionIds.value = [];
    selectedAnswer.value = null;
    isReviewingWrong.value = false; // Exit wrong review mode if active

    // 清除 configService 中的答案和统计
    const quizData = configService.getQuizData();
    if (quizData) {
      quizData.chapters.forEach(chapter => {
        chapter.questions.forEach(q => {
          // 只清除当前过滤出的问题的答案
          if (localQuestions.value.some(lq => lq.id === q.id)) {
            q.userAnswer = null;
          }
        });
      });
      configService.setQuizData(quizData); // Update internal state
      // Reset stats related to this quiz session if needed
      // configService.resetQuizStats(); // Assuming such a method exists
      configService.saveQuizState(); // Persist cleared answers and potentially reset stats
    }

    // Reload questions based on the original filter (selectedChapter)
    filterQuestionsByChapter(selectedChapter.value);

    // 回到第一题
    currentIndex.value = 0;
    if (localQuestions.value.length > 0) {
      loadQuestion(0);
    }

    showToast('测验已重置', 'success');
  }
}

/**
 * 查看错题
 */
function viewWrongQuestions() {
  if (wrongQuestionIds.value.length === 0) {
    showToast('没有错题记录', 'info');
    return;
  }
  showModalStatistics.value = false;

  // 筛选出错题 (从原始数据源或当前 localQuestions 筛选)
  const allQuestions = configService.getQuizData()?.chapters.flatMap(c => c.questions) || [];
  const wrongQs = allQuestions.filter(q => wrongQuestionIds.value.includes(String(q.id)));
  // const wrongQs = localQuestions.value.filter(q => wrongQuestionIds.value.includes(String(q.id)));


  if (wrongQs.length > 0) {
    localQuestions.value = wrongQs.map(q => ({ ...q, userAnswer: null })); // 重置错题答案
    isQuizSubmitted.value = false; // 允许在错题模式下答题
    isReviewingWrong.value = true; // 标记为错题回顾模式
    // wrongQuestionIds.value = []; // Optionally clear for this specific review session
    currentIndex.value = 0;
    // configService.setQuizConfig({ mode: QuizMode.WRONG }); // Update mode if tracked
    loadQuestion(0);
    showToast(`已切换到错题回顾 (${wrongQs.length}题)`, 'info');
  } else {
    showToast('没有找到错题详情', 'warning');
  }
}


// --- Notes Methods ---

/**
 * 切换笔记编辑/显示状态
 */
function toggleNotesEditor() {
  isEditingNotes.value = !isEditingNotes.value;
  if (isEditingNotes.value) {
    notesEditText.value = currentQuestion.value?.notes || '';
    nextTick(() => {
      if (notesTextareaRef.value) {
        notesTextareaRef.value.focus();
        autoResizeTextarea(); // Adjust height after focusing
      }
    });
  } else {
    // Optionally save changes when switching back? Or rely on explicit save button?
    // saveNotes();
  }
}

/**
 * 保存笔记
 */
function saveNotes() {
  if (!currentQuestion.value || !currentQuestion.value.id) return;

  const updatedNotes = notesEditText.value;

  // 使用 configService 保存笔记
  const success = configService.saveNoteToQuestion(currentQuestion.value.id, updatedNotes);

  if (success) {
    // 更新本地问题对象的 notes，确保 UI 同步
    const localQIndex = localQuestions.value.findIndex(q => q.id === currentQuestion.value?.id);
    if (localQIndex > -1) {
      localQuestions.value[localQIndex].notes = updatedNotes;
    }

    isEditingNotes.value = false; // Exit edit mode
    nextTick(renderNotesForCurrentQuestion); // Re-render the saved notes
    showToast('笔记已保存', 'success');
  } else {
    showToast('保存笔记失败', 'error');
  }
}


/**
 * 渲染当前问题的笔记 (Markdown + Mermaid)
 */
async function renderNotesForCurrentQuestion() {
  const question = currentQuestion.value;
  if (!question) {
    renderedNotesHtml.value = '<p class="page-quiz__notes-placeholder">请先加载题目</p>';
    return;
  }

  const noteContent = question.notes || '';
  const generating = isGeneratingCurrent.value && activeGenerationIndex.value === currentIndex.value; // Check if *this* question is generating

  if (!noteContent && !generating) {
    renderedNotesHtml.value = '<p class="page-quiz__notes-placeholder">这道题目还没有笔记...</p>';
    return;
  }

  try {
    // Render markdown content
    let htmlContent = '';
    if (noteContent) {
      htmlContent = mdInstance.render(noteContent);
    }

    // Add placeholder if generating
    if (generating && !htmlContent) {
      htmlContent = '<p class="page-quiz__notes-placeholder">思考中...</p>';
    } else if (!htmlContent) {
      htmlContent = '<p class="page-quiz__notes-placeholder">这道题目还没有笔记...</p>';
    }

    renderedNotesHtml.value = htmlContent;

    // Process Mermaid diagrams after rendering HTML
    await nextTick(); // Wait for DOM update

    const notesElement = notesDisplayRef.value;
    if (!notesElement) return;

    try {
      await initMermaid(); // Ensure mermaid is initialized

      // 1. Find and replace pre>code blocks if markdown-it doesn't handle it correctly
      // (Some Markdown renderers might wrap mermaid code differently)
      const mermaidCodeBlocks = notesElement.querySelectorAll('pre code.language-mermaid');
      mermaidCodeBlocks.forEach(block => {
        const preElement = block.closest('pre');
        // Avoid reprocessing if we already converted it to a div.mermaid
        if (!preElement || preElement.classList.contains('mermaid-processed')) return;

        const code = block.textContent || '';
        if (!code.trim()) return;

        const mermaidDiv = document.createElement('div');
        mermaidDiv.className = 'mermaid';
        mermaidDiv.textContent = code;

        if (preElement.parentNode) {
          preElement.parentNode.replaceChild(mermaidDiv, preElement);
        }
        // Mark the original pre element so we don't try to replace it again
        preElement.classList.add('mermaid-processed');
      });

      // 2. Find all elements designated for mermaid rendering
      const mermaidElementsToRender = notesElement.querySelectorAll<HTMLElement>('.mermaid');

      if (mermaidElementsToRender.length > 0) {
        const elementsArray = Array.from(mermaidElementsToRender);
        console.log(`[Mermaid] Attempting to render ${elementsArray.length} diagrams.`);
        try {
          // Let mermaid.run handle rendering idempotently if possible
          await mermaid.run({ nodes: elementsArray });
          console.log(`[Mermaid] Successfully rendered or updated ${elementsArray.length} diagrams.`);
          // Optional: Add a class to indicate successful rendering if needed for styling
          // elementsArray.forEach(el => el.classList.add('mermaid-rendered'));
        } catch (renderError) {
          console.error('[Mermaid] Rendering error:', renderError);
          // Add error message inside the div for user feedback
          elementsArray.forEach(el => {
            // Avoid adding multiple error messages if run fails repeatedly
            if (!el.querySelector('.mermaid-error-message')) {
              el.classList.add('mermaid-error');
              const errorMessage = document.createElement('div');
              errorMessage.className = 'mermaid-error-message';
              errorMessage.textContent = `图表渲染失败: ${renderError instanceof Error ? renderError.message : '未知错误'}`;
              el.appendChild(errorMessage);
            }
          });
        }
      } else {
        // console.log('[Mermaid] No .mermaid elements found to render.');
      }

    } catch (mermaidError) {
      console.error('Mermaid processing failed:', mermaidError);
      // Display a general error if mermaid itself fails badly
      // This part might be redundant if the inner try/catch handles display
    }

    // Scroll to bottom if generating
    if (generating && notesElement) {
      notesElement.scrollTop = notesElement.scrollHeight;
    }

  } catch (error) {
    console.error('笔记渲染错误:', error);
    renderedNotesHtml.value = `<p class="page-quiz__notes-error">笔记内容解析失败: ${error instanceof Error ? error.message : '未知错误'}</p>`;
  }
}


/**
 * 处理指定元素内的Mermaid图表
 */
// This function might become redundant or simplified after the changes above.
// Keeping it for now in case specific targeted processing is needed elsewhere.
// async function processMermaidInElement(element: HTMLElement | null, isGenerating: boolean) {
//   if (!element) return;
//   // ... (logic moved to renderNotesForCurrentQuestion) ...
// }


/**
 * 在笔记编辑区插入 Markdown 标记
 */
function insertMarkdown(markup: string) {
  const textarea = notesTextareaRef.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selectedText = text.substring(start, end);

  let insertedMarkup = markup;
  let selectionOffset = 0;

  // Basic placeholder replacement
  const placeholders: Record<string, string> = {
    '**粗体**': '粗体',
    '*斜体*': '斜体',
    '# 标题': '标题',
    '- 列表项': '列表项',
    '```\\n代码块\\n```': '代码块',
    '```mermaid\\ngraph TD;\\nA-->B;\\n```': 'A-->B',
  };

  for (const key in placeholders) {
    if (markup === key && selectedText) {
      insertedMarkup = markup.replace(placeholders[key], selectedText);
      // Adjust selection to be *inside* the markup if possible
      if (key.includes('**') || key.includes('*')) {
        selectionOffset = key.indexOf(placeholders[key]);
      } else if (key.includes('```')) {
        selectionOffset = key.indexOf('\n') + 1; // Place cursor after first newline
      }
      break;
    }
  }


  // Insert the text
  textarea.value = text.substring(0, start) + insertedMarkup + text.substring(end);
  notesEditText.value = textarea.value; // Update v-model binding

  // Set cursor position or selection
  textarea.focus();
  nextTick(() => {
    if (selectedText && selectionOffset > 0) {
      textarea.selectionStart = start + selectionOffset;
      textarea.selectionEnd = start + selectionOffset + selectedText.length;
    } else {
      textarea.selectionStart = textarea.selectionEnd = start + insertedMarkup.length;
    }
    autoResizeTextarea();
  });
}


/**
 * 自动调整文本区高度
 */
function autoResizeTextarea() {
  const textarea = notesTextareaRef.value;
  if (textarea) {
    textarea.style.height = 'auto'; // Reset height to recalculate
    nextTick(() => { // Ensure DOM update before measuring scrollHeight
      if (textarea) { // Check again as it might be gone
        const scrollHeight = textarea.scrollHeight;
        // Add a small buffer for padding/border, or use min-height from CSS
        const minHeight = 80; // Example min-height from CSS
        textarea.style.height = `${Math.max(scrollHeight, minHeight)}px`;
      }
    });
  }
}

/**
 * 实际调用AI API生成笔记
 */
async function generateAINotes(
  question: Question | null,
  generationTargetIndex: number,
  completionCallback: CompletionCallback,
  streamCallback?: StreamCallback
) {
  console.log(`[LOG] 请求生成笔记: 目标索引=${generationTargetIndex}, 问题ID=${question?.id ?? 'null'}`);
  if (!question) {
    completionCallback('', generationTargetIndex, '无法获取问题信息');
    return;
  }

  const currentApiConfig = configService.getApiConfig();
  if (!currentApiConfig.enabled || !currentApiConfig.apiUrl || !currentApiConfig.apiKey) {
    showToast('请先启用并配置AI API设置', 'info');
    showApiConfigModal.value = true;
    completionCallback('', generationTargetIndex, 'API未配置或未启用');
    return;
  }

  try {
    const requestData = configService.getNotesGenerationRequestParams(question);
    console.log(`[LOG] 发起 API 请求: 索引=${generationTargetIndex}, URL=${currentApiConfig.apiUrl}, Model=${requestData.model}, Stream=${requestData.stream}`);

    const response = await fetch(currentApiConfig.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentApiConfig.apiKey}`
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[ERROR] API 请求失败: ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`API请求失败 (${response.status}): ${response.statusText || errorBody}`);
    }

    let generatedNote = '';

    if (requestData.stream && response.body && streamCallback) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let lastDataReceived = Date.now();
      const dataTimeout = 30000; // 30 seconds timeout

      const heartbeatInterval = setInterval(() => {
        if (Date.now() - lastDataReceived > dataTimeout) {
          console.warn(`[WARN] 数据流接收超时，可能存在网络问题 (Index: ${generationTargetIndex})`);
          showToast('网络连接不稳定，笔记生成可能中断', 'warning');
          clearInterval(heartbeatInterval);
          reader.cancel('Timeout').catch(console.error); // Attempt to cancel the stream
          // Trigger completion with error after timeout cancellation attempt
          completionCallback(generatedNote, generationTargetIndex, '数据流接收超时');
        }
      }, 10000); // Check every 10 seconds


      try {

        while (true) {
          const { done, value } = await reader.read();
          lastDataReceived = Date.now(); // Update timestamp on receiving data

          if (done) {
            console.log(`[LOG] 流读取完成 (done) for index ${generationTargetIndex}`);
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // Process line by line
          let lineEndIndex;
          while ((lineEndIndex = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, lineEndIndex).trim();
            buffer = buffer.slice(lineEndIndex + 1);

            if (line.startsWith('data: ')) {
              const dataStr = line.substring(6);
              if (dataStr === '[DONE]') {
                console.log(`[LOG] Received [DONE] signal for index ${generationTargetIndex}`);
                // Break inner loop, outer loop will check reader.read() result 'done'
                break;
              }
              try {
                const parsed = JSON.parse(dataStr);
                // Extract content based on common OpenAI/compatible structures
                const content = parsed.choices?.[0]?.delta?.content ||
                  parsed.choices?.[0]?.message?.content ||
                  parsed.delta?.content || // Some Anthropic-like structures
                  '';

                if (content) {
                  // console.log(`[LOG] 收到 chunk: '${content.substring(0, 50)}...' (Index: ${generationTargetIndex})`);
                  generatedNote += content;
                  streamCallback(content, generationTargetIndex); // Pass content chunk and index
                }
              } catch (e) {
                if (dataStr.trim()) { // Avoid logging empty data lines as errors
                  console.error('[ERROR] 解析流式 JSON 出错:', e, '原始行:', line, `(Index: ${generationTargetIndex})`);
                }
              }
            }
          }
        }
      } catch (streamError) {
        // Handle potential errors during stream reading (e.g., network issues)
        console.error(`[ERROR] 流读取过程中发生错误 (Index: ${generationTargetIndex}):`, streamError);
        // Trigger completion with existing note content and the error
        completionCallback(generatedNote, generationTargetIndex, `流处理错误: ${(streamError as Error).message}`);
        clearInterval(heartbeatInterval); // Clean up interval
        return; // Exit the function as the stream failed
      } finally {
        clearInterval(heartbeatInterval); // Ensure interval is cleared
        // reader.releaseLock(); // Not needed with await reader.read() loop
      }
      console.log(`[LOG] 流处理完成 for index ${generationTargetIndex}. Final Note Length: ${generatedNote.length}`);
      completionCallback(generatedNote.trim(), generationTargetIndex); // Call completion after stream ends successfully

    } else { // Handle non-streamed response
      const data = await response.json();
      // Extract content based on common OpenAI/compatible structures
      generatedNote = data.choices?.[0]?.message?.content ||
        data.choices?.[0]?.text || // Older completion API style
        data.content?.[0]?.text || // Anthropic style
        '';

      console.log(`[LOG] 非流式响应笔记 (Index: ${generationTargetIndex}):`, generatedNote.substring(0, 100) + "...");
      completionCallback(generatedNote.trim(), generationTargetIndex);
    }

  } catch (error) {
    console.error(`[ERROR] 生成笔记失败 for index ${generationTargetIndex}:`, error);
    // Ensure completion callback is called even on fetch/setup errors
    completionCallback('', generationTargetIndex, `笔记生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 触发手动 AI 笔记生成
 */
function triggerAINotesGeneration() {
  if (!currentQuestion.value || isQuizSubmitted.value) return;
  forceShowNotes.value = true; // Show notes area immediately
  requestNoteGeneration(currentIndex.value, true); // Request for the current question, manually triggered
}

/**
 * 触发笔记同步到GitHub
 */
async function triggerSync() {
  if (syncStatus.value === 'pending') return;

  syncStatus.value = 'pending';
  showToast('笔记同步中...', 'info');

  try {
    const githubConfig = configService.getGithubConfig();
    const syncQuizName = githubConfig.syncQuizName || currentQuizInfo.value.name;

    if (!syncQuizName) {
      syncStatus.value = 'error';
      showToast('无法确定要同步的题库名称', 'error');
      return;
    }

    // Use configService to push the quiz data
    const success = await configService.pushQuizToGithub(syncQuizName, githubConfig.forceSync);

    if (success) {
      syncStatus.value = 'success';
      showToast(`题库 "${syncQuizName}" 已成功同步到GitHub`, 'success');
      setTimeout(() => syncStatus.value = 'idle', 2000);
    } else {
      syncStatus.value = 'error';
      // configService.pushQuizToGithub should show specific errors
      // showToast('同步失败，请检查网络或配置', 'error');
    }
  } catch (err) {
    console.error('同步失败:', err);
    syncStatus.value = 'error';
    showToast(`同步失败: ${err instanceof Error ? err.message : '未知错误'}`, 'error');
  } finally {
    // Ensure status is reset if still pending after operation attempt
    if (syncStatus.value === 'pending') {
      syncStatus.value = 'idle'; // Or 'error' depending on desired behavior
    }
  }
}


/**
 * 打开同步配置模态框
 */
function openSyncConfigModal() {
  showSyncConfigModal.value = true;
}

/**
 * 处理同步配置保存
 */
function handleSyncConfigSave(config: Partial<GithubConfig>) { // Use Partial<GithubConfig>
  console.log('同步配置已保存:', config);
  configService.updateGithubConfig(config); // Let configService handle validation and saving
}

/**
 * 打开API配置模态框
 */
function openApiConfigModal() {
  showApiConfigModal.value = true;
}

/**
 * 获取完整的当前活动API配置
 */
function getCompleteApiConfig(): ApiConfig {
  // Directly return the active config from the service
  return configService.getApiConfig();
}


// --- Modal Methods ---

/**
 * 应用来自设置模态框的设置
 */
function applySettingsFromModal(settings: { uiSettings: UiSettings, quizSettings: QuizSettings, debugEnabled: boolean }) {
  // Use specific update methods for clarity and potential granular notifications
  configService.updateUiSettings(settings.uiSettings, false);
  configService.updateQuizSettings(settings.quizSettings, false);
  configService.setDebugEnabled(settings.debugEnabled, false);
  // configService.updateSettings({ // Alternative: use single update method
  //   uiSettings: settings.uiSettings,
  //   quizSettings: settings.quizSettings,
  //   debugEnabled: settings.debugEnabled,
  // }, false);
  showToast('通用设置已保存', 'success'); // Show toast after all settings are applied
  configService.saveQuizState(); // Save state if settings might affect it
}

/**
 * 打开当前问题的编辑器
 */
function openCurrentQuestionEditor() {
  if (!quizSettings.value.canEditQuestion || isQuizSubmitted.value || !currentQuestion.value) {
    showToast('当前状态无法编辑题目', 'warning');
    return;
  }
  // Deep clone the question object for editing to avoid modifying the original directly
  questionToEdit.value = JSON.parse(JSON.stringify(currentQuestion.value));
  showEditModal.value = true;
}

/**
 * 关闭编辑题目模态框
 */
function closeEditModal() {
  showEditModal.value = false;
  questionToEdit.value = null; // Clear the editing question
}


/**
 * 处理保存问题编辑
 */
function handleSaveQuestion(updatedQuestionData: Partial<Question>) {
  if (!questionToEdit.value || !questionToEdit.value.id) {
    console.error("无法保存：编辑中的问题或其ID无效");
    showToast('保存题目失败：内部错误', 'error');
    return;
  }

  const questionId = questionToEdit.value.id;

  // Call configService to update the question in the central store
  const success = configService.updateQuestion(questionId, updatedQuestionData);

  if (success) {
    // Update the question in the local list for immediate UI feedback
    const localIndex = localQuestions.value.findIndex(q => q.id === questionId);
    if (localIndex !== -1) {
      // Merge changes into the local question object
      localQuestions.value[localIndex] = { ...localQuestions.value[localIndex], ...updatedQuestionData };
      // Ensure reactivity if needed, though spread syntax usually handles this
      // Vue.set(localQuestions.value, localIndex, { ... }); // For Vue 2 reactivity
    }
    // Also update the currentQuestion computed property if it's the one being edited
    if (currentQuestion.value && currentQuestion.value.id === questionId) {
      // Re-trigger computed property or manually update relevant fields if necessary
      // This might not be strictly needed if localQuestions update triggers recomputation
    }

    // Re-render notes if notes content might have changed
    if ('notes' in updatedQuestionData) {
      renderNotesForCurrentQuestion();
    }


    showToast('题目已更新', 'success');
    closeEditModal(); // Close modal on successful save
  } else {
    showToast('更新题目失败', 'error');
    // Keep the modal open for the user to retry or cancel
  }
}


// --- 辅助方法 ---

/**
 * 获取选项的 Key (e.g., 'A')
 * Handles options that might already start with a letter.
 */
function getOptionKey(optionText: string | unknown, index: number): string {
  if (typeof optionText === 'string') {
    // Match A., A), A:, A followed by space, or just A at the beginning
    const keyMatch = optionText.match(/^([A-Z])([.:)]|\s+|$)/i);
    if (keyMatch) {
      return keyMatch[1].toUpperCase();
    }
  }
  // Default to generating key based on index if no prefix found or not a string
  return String.fromCharCode(65 + index);
}


/**
 * 获取选项的内容 (移除可能的字母前缀)
 */
function getOptionContent(optionText: string | unknown): string {
  if (typeof optionText !== 'string') return String(optionText); // Return as string if not already

  // Match A., A), A:, A followed by space
  const keyMatch = optionText.match(/^([A-Z])([.:)]|\s+)/i);
  if (keyMatch) {
    // Return the part after the prefix, trimmed
    return formatQuestionText(optionText.substring(keyMatch[0].length).trim());
  }
  // If no prefix, return the original text formatted
  return formatQuestionText(optionText);
}


/**
 * 获取选项的 CSS 类
 */
function getOptionClass(optionKey: string): string {
  const question = currentQuestion.value;
  if (!question) return '';

  const classes = ['page-quiz__option']; // Base class
  const isSelected = selectedAnswer.value === optionKey;
  const isUserAnswer = question.userAnswer === optionKey;
  const isCorrect = isCorrectAnswerOption(question.answer, optionKey);
  const answered = isCurrentAnswered.value;
  const reviewMode = quizSettings.value.reviewMode;
  const showCorrect = quizSettings.value.showCorrectAnswerImmediately;
  const locked = isAnswerLocked.value;

  // --- Selection state (only if not locked) ---
  if (isSelected && !locked && !reviewMode) {
    classes.push('page-quiz__option--selected');
  }

  // --- Feedback state (if answered or in review mode) ---
  if (answered || reviewMode) {
    if (isCorrect) {
      // Always show correct if in review mode or if set to show immediately
      if (reviewMode || showCorrect) {
        classes.push('page-quiz__option--correct');
      }
      // Also highlight if the user's answer was correct (even if not shown immediately)
      else if (isUserAnswer) {
        classes.push('page-quiz__option--correct'); // Or a different class like 'user-correct'
      }
    } else if (isUserAnswer) { // Incorrect user answer
      classes.push('page-quiz__option--incorrect');
    }
  }

  // --- Locked state ---
  if (locked || isQuizSubmitted.value) {
    classes.push('page-quiz__option--locked');
  }


  return classes.join(' ');
}

/**
 * 获取选项 Key (圆圈数字) 的 CSS 类
 */
function getOptionKeyClass(optionKey: string): string {
  const question = currentQuestion.value;
  if (!question) return 'page-quiz__option-number'; // Default class

  const isCorrect = isCorrectAnswerOption(question.answer, optionKey);
  const isUserAnswer = question.userAnswer === optionKey;
  const answered = isCurrentAnswered.value;
  const reviewMode = quizSettings.value.reviewMode;
  const showCorrect = quizSettings.value.showCorrectAnswerImmediately;

  const classes = ['page-quiz__option-number']; // Base class

  if (answered || reviewMode) {
    if (isCorrect && (reviewMode || showCorrect)) {
      classes.push('page-quiz__option-number--correct');
    } else if (isUserAnswer && !isCorrect) {
      classes.push('page-quiz__option-number--incorrect');
    }
  }

  return classes.join(' ');
}


/**
 * 判断提供的选项键是否是正确答案的一部分
 */
function isCorrectAnswerOption(correctAnswer: Question['answer'], optionKey: string): boolean {
  if (correctAnswer === undefined || correctAnswer === null || optionKey === '') return false;

  // 将 'A', 'B' 等转换为 0, 1 索引，用于数字类型答案比较
  const optionIndex = optionKey.charCodeAt(0) - 65;

  if (Array.isArray(correctAnswer)) {
    // 检查数组中的每个元素
    return correctAnswer.some(ans => {
      // 数组中只包含数字类型
      return ans === optionIndex;
    });
  } else if (typeof correctAnswer === 'number') {
    return correctAnswer === optionIndex;
  } else if (typeof correctAnswer === 'string') {
    // 不区分大小写比较字符串答案
    return correctAnswer.toUpperCase() === optionKey.toUpperCase();
  }

  console.warn("无法识别的答案格式:", correctAnswer, "对比值:", optionKey);
  return false;
}

/**
 * 比较用户选择的答案与正确答案
 */
function compareAnswers(selected: string | null | undefined, correctAnswer: Question['answer']): boolean {
  if (selected === null || selected === undefined || correctAnswer === undefined || correctAnswer === null) {
    return false;
  }
  // Reuse the detailed checking logic
  return isCorrectAnswerOption(correctAnswer, selected);
}


// --- 键盘和滑动处理 ---
let touchStartX = 0;
let touchStartY = 0;

/**
 * 处理触摸开始事件
 */
function handleTouchStart(e: TouchEvent) {
  if (!quizSettings.value.swipeGestureEnabled) return;
  // 仅在主要触摸时记录起始点
  if (e.touches.length === 1) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }
}

/**
 * 处理触摸结束事件
 */
function handleTouchEnd(e: TouchEvent) {
  if (!quizSettings.value.swipeGestureEnabled || touchStartX === 0) return; // 确保起始点已记录

  // 使用 changedTouches，因为 touchend 时 touches 数组将为空
  if (e.changedTouches.length === 1) {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // 基于视口大小定义阈值，以提高响应性
    const horizontalThreshold = window.innerWidth * 0.15; // 宽度的15%
    const verticalThreshold = window.innerHeight * 0.1;  // 高度的10%

    // 检查是否有明显的水平滑动，且垂直移动很小
    if (Math.abs(diffX) > horizontalThreshold && Math.abs(diffY) < verticalThreshold) {
      if (diffX > 0) { // 向左滑动 -> 下一题
        if (canGoNext.value) nextQuestion();
      } else { // 向右滑动 -> 上一题
        if (canGoPrev.value) previousQuestion();
      }
    }
  }

  // 处理后重置起始坐标
  touchStartX = 0;
  touchStartY = 0;
}


/**
 * 处理键盘按键事件
 */
function handleKeyPress(e: KeyboardEvent) {
  const activeElement = document.activeElement;
  const isInputActive = activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT' || (activeElement as HTMLElement).isContentEditable);
  const isModalActive = !!document.querySelector('.modal.modal--active'); // 检查是否有由该组件管理的模态框处于激活状态

  // --- Escape键: 关闭模态框 ---
  if (e.key === 'Escape' && isModalActive) {
    e.preventDefault(); // 阻止默认浏览器行为（如停止页面加载）
    showOverviewModal.value = false;
    showModalStatistics.value = false;
    showModalSettings.value = false;
    closeEditModal(); // 使用专用函数关闭编辑模态框
    showSyncConfigModal.value = false;
    showApiConfigModal.value = false;
    return; // 如果模态框被关闭，不处理其他按键
  }

  // --- 如果输入框/文本区域被聚焦或模态框处于激活状态（除Escape外），忽略按键 ---
  if (isInputActive || isModalActive) {
    return;
  }

  // --- 选项选择（1-7） ---
  if (e.key >= '1' && e.key <= '7') {
    const optionIndex = parseInt(e.key) - 1;
    if (currentQuestion.value && optionIndex < currentQuestion.value.options.length) {
      const key = getOptionKey(currentQuestion.value.options[optionIndex], optionIndex);
      handleOptionClick(key);
      e.preventDefault(); // 阻止默认行为（如浏览器快捷键）
    }
  }
  // --- 空格键: 提交或下一题 ---
  else if (e.key === ' ') {
    e.preventDefault(); // 防止页面滚动
    if (canSubmit.value) {
      submitAnswer();
    } else if (canGoNext.value && isCurrentAnswered.value) { // 仅在已回答时允许空格键进入下一题
      nextQuestion();
    }
  }
  // --- 方向键: 上一题/下一题 ---
  else if (e.key === 'ArrowLeft') {
    if (canGoPrev.value) {
      previousQuestion();
      e.preventDefault();
    }
  } else if (e.key === 'ArrowRight') {
    if (canGoNext.value) { // 如果可能，始终允许右箭头
      nextQuestion();
      e.preventDefault();
    }
  }
  // --- 回车键: 提交（空格的替代方式） ---
  else if (e.key === 'Enter') {
    if (canSubmit.value) {
      submitAnswer();
      e.preventDefault();
    }
  }
}


/**
 * 设置键盘事件监听器
 */
function setupKeyboardListeners() {
  document.addEventListener('keydown', handleKeyPress);
}

/**
 * 移除键盘事件监听器
 */
function removeKeyboardListeners() {
  document.removeEventListener('keydown', handleKeyPress);
}


// --- Mermaid 初始化 ---

/**
 * 初始化 Mermaid 图表库
 */
async function initMermaid() {
  try {
    // 确保 Mermaid 已加载（它可能是异步加载的）
    if (typeof mermaid !== 'undefined' && mermaid.initialize) {
      mermaid.initialize({
        startOnLoad: false, // 我们手动触发渲染
        theme: isDarkMode.value ? 'dark' : 'default',
        securityLevel: 'loose', // 如果使用不可信输入，请考虑其影响
        flowchart: { useMaxWidth: true },
        // 如果需要，可以配置其他图表类型
      });
      console.log("Mermaid 已初始化，主题:", isDarkMode.value ? 'dark' : 'default');
    } else {
      console.warn("Mermaid 库尚未完全加载或初始化。");
    }

  } catch (error) {
    console.error('初始化Mermaid失败:', error);
  }
}


// --- UI 辅助函数 ---

/**
 * 切换主题方法
 */
function toggleTheme() {
  configService.toggleDarkMode(); // Service handles state and saving
  // isDarkMode computed property will update automatically

  // Re-initialize or update Mermaid theme after DOM updates
  nextTick(() => {
    initMermaid(); // Re-initialize to apply the new theme
    renderNotesForCurrentQuestion(); // Re-render notes which might contain diagrams
  });
}

/**
 * 比较题目 ID (优先数字，然后字符串)
 */
function compareQuestionIds(a: Question, b: Question): number {
  const idA = String(a.id || '');
  const idB = String(b.id || '');

  // Attempt to extract leading numbers for primary sort
  const numA = parseInt(idA.match(/^\d+/)?.[0] || '', 10);
  const numB = parseInt(idB.match(/^\d+/)?.[0] || '', 10);

  // If both have valid leading numbers and they are different, sort numerically
  if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
    return numA - numB;
  }

  // Otherwise, fall back to locale-aware string comparison for robustness
  return idA.localeCompare(idB);
}


/**
 * 格式化题目或选项文本 (移除特定前缀，如 A、)
 */
function formatQuestionText(text: string | undefined): string {
  if (!text) return '';
  // Remove potential prefixes like "A.", "B)", "C:" or "D "
  return text.replace(/^([A-Z])([.:)]|\s)\s*/, '').trim();
}

/**
 * 格式化问题标题 (移除开头的题号，如 "1. ")
 */
function formatQuestionTitle(title: string | undefined): string {
  if (!title) return '';
  // Remove leading number, period, and whitespace
  return title.replace(/^\s*\d+\s*\.\s*/, '').trim();
}

/**
 * 根据章节过滤题目
 */
function filterQuestionsByChapter(chapterTitle: string) {
  loading.value = true;
  error.value = null;
  console.log(`Filtering questions for chapter: ${chapterTitle}`);

  const fullQuizData = configService.getQuizData();
  if (!fullQuizData || !fullQuizData.chapters) {
    localQuestions.value = [];
    error.value = '无法加载题库数据';
    loading.value = false;
    console.error("Quiz data or chapters not found in configService.");
    return;
  }

  let filteredQuestions: Question[] = [];

  try {
    if (chapterTitle === 'all') {
      // Combine questions from all chapters
      fullQuizData.chapters.forEach((chapter) => {
        if (chapter.questions && Array.isArray(chapter.questions)) {
          const chapterQuestions = chapter.questions.map(q => ({
            ...q,
            chapterTitle: chapter.title // Ensure chapterTitle is set
          }));
          filteredQuestions.push(...chapterQuestions);
        }
      });
    } else {
      // Find the specific chapter
      const targetChapter = fullQuizData.chapters.find(c => c.title === chapterTitle);
      if (targetChapter && targetChapter.questions && Array.isArray(targetChapter.questions)) {
        filteredQuestions = targetChapter.questions.map(q => ({
          ...q,
          chapterTitle: targetChapter.title // Ensure chapterTitle is set
        }));
      }
    }

    // --- Post-filtering processing ---

    // 1. Ensure unique IDs and basic structure
    const questionNumber = 1;
    filteredQuestions = filteredQuestions.map((q, index) => ({
      ...q,
      id: q.id || `gen_${chapterTitle}_${index}`, // Generate ID if missing
      title: q.title || q.question || '', // Ensure title exists
      question: q.question || q.title || '', // Ensure question exists
      options: q.options || [],
      // userAnswer is already loaded from configService, no need to map here
    }));


    // 2. Sort questions (always sort before numbering and shuffling)
    filteredQuestions.sort(compareQuestionIds);


    // 3. Apply random mode shuffle if enabled
    if (quizSettings.value.randomMode) {
      // Fisher-Yates shuffle
      for (let i = filteredQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filteredQuestions[i], filteredQuestions[j]] = [filteredQuestions[j], filteredQuestions[i]];
      }
    }

    // 4. Assign sequential numbers *after* sorting/shuffling
    filteredQuestions.forEach((q, index) => {
      q.number = index + 1;
    });


    localQuestions.value = filteredQuestions;
    error.value = filteredQuestions.length === 0 ? `章节 "${chapterTitle}" 下没有题目` : null;

    // Update wrongQuestionIds based on the newly filtered list
    wrongQuestionIds.value = filteredQuestions
      .filter(q => q.userAnswer !== null && q.userAnswer !== undefined && !compareAnswers(q.userAnswer, q.answer))
      .map(q => String(q.id)); // Ensure IDs are strings

    // Save the selected chapter to config
    configService.setQuizConfig({ chapterIndex: chapterTitle });
    // Optionally save the entire state if filtering implies a state change to persist
    // configService.saveQuizState();

    console.log(`Filtered ${filteredQuestions.length} questions. Random mode: ${quizSettings.value.randomMode}`);

  } catch (err) {
    console.error("Error during question filtering:", err);
    error.value = "过滤题目时发生错误";
    localQuestions.value = []; // Clear questions on error
  } finally {
    loading.value = false;
  }
}

// --- Unified Note Generation Request ---

/**
 * 统一处理笔记生成请求 (手动或自动)
 */
function requestNoteGeneration(targetIndex: number, isManual: boolean) {
  console.log(`[LOG] 请求生成笔记: Index=${targetIndex}, Manual=${isManual}, CurrentGenIndex=${activeGenerationIndex.value}, isGenerating=${isGenerating.value}`);

  const questionToGenerate = localQuestions.value[targetIndex];

  if (!questionToGenerate || isQuizSubmitted.value) {
    console.warn(`[WARN] 忽略生成请求 (Index: ${targetIndex}): 无问题或测验已提交`);
    return;
  }

  // Skip auto-generation if notes already exist
  if (!isManual && questionToGenerate.notes && questionToGenerate.notes.trim() !== '') {
    console.log(`[LOG] 跳过自动生成 (Index: ${targetIndex}): 已有笔记`);
    checkAndTriggerAutoGeneration(); // Check for the *next* one
    return;
  }

  // Prevent concurrent generations
  if (isGenerating.value || activeGenerationIndex.value !== null) {
    // Avoid duplicate manual request toasts for the same question
    if (!(isManual && activeGenerationIndex.value === targetIndex)) {
      showToast(`已有笔记生成任务进行中 (题目 ${activeGenerationIndex.value !== null ? activeGenerationIndex.value + 1 : '?'})`, 'info');
    }
    console.warn(`[WARN] 忽略生成请求 (Index: ${targetIndex}): 当前活跃生成 Index: ${activeGenerationIndex.value}`);
    return;
  }

  // --- Start Generation ---
  activeGenerationIndex.value = targetIndex;
  isGenerating.value = true;
  forceShowNotes.value = true; // Ensure notes area is visible
  showToast(`开始为题目 ${targetIndex + 1} 生成笔记...`, 'info');

  // Clear existing notes for the target question before generating
  questionToGenerate.notes = '';
  renderedNotesHtml.value = '<p class="page-quiz__notes-placeholder">思考中...</p>'; // Show placeholder immediately if current


  // If the generation target is the currently viewed question, render the cleared state
  if (currentIndex.value === targetIndex) {
    renderNotesForCurrentQuestion();
  }

  // --- Setup Callbacks ---
  let lastRenderTime = 0;
  const baseThrottleDelay = 150; // Slightly increased delay
  let throttleDelay = baseThrottleDelay;
  let pendingChunks = '';
  let renderTimeoutId: number | null = null;
  let autoSaveTimeoutId: number | null = null;

  // Auto-save function (throttled)
  const autoSaveNotes = () => {
    if (autoSaveTimeoutId) clearTimeout(autoSaveTimeoutId); // Clear previous timeout
    autoSaveTimeoutId = window.setTimeout(() => {
      if (activeGenerationIndex.value === targetIndex && questionToGenerate.id && questionToGenerate.notes) {
        console.log(`[LOG] Auto-saving notes for index ${targetIndex}`);
        configService.saveNoteToQuestion(questionToGenerate.id, questionToGenerate.notes);
        // configService.saveQuizState(); // SaveNoteToQuestion should handle this if needed
      }
    }, 2000); // Save every 2 seconds of inactivity during generation
  };

  // Stream chunk handler
  const handleStreamChunk: StreamCallback = (chunk, streamTargetIndex) => {
    // console.debug(`[DEBUG] Stream Chunk: Target=${streamTargetIndex}, Expected=${targetIndex}, Chunk='${chunk.substring(0,20)}...'`);
    if (streamTargetIndex !== targetIndex) return; // Ignore chunks for wrong index

    questionToGenerate.notes = (questionToGenerate.notes || '') + chunk;
    pendingChunks += chunk;
    autoSaveNotes(); // Trigger auto-save on new chunk

    // Throttle rendering updates only for the currently viewed question
    if (apiConfig.value.streamOutput && currentIndex.value === streamTargetIndex) {
      const now = Date.now();
      const timeSinceLastRender = now - lastRenderTime;
      // Determine if immediate render is needed (significant chunk, important markers, or enough time passed)
      const hasImportantMarkers = /\n|```|\*\*|#|>|-\s|1\.|\<|!\[/.test(pendingChunks);
      const bufferSizeTrigger = pendingChunks.length > 100;
      throttleDelay = bufferSizeTrigger ? baseThrottleDelay * 2 : (hasImportantMarkers ? 50 : baseThrottleDelay); // Adjust delay dynamically

      if (renderTimeoutId) clearTimeout(renderTimeoutId); // Clear pending render

      if (timeSinceLastRender > throttleDelay || hasImportantMarkers || bufferSizeTrigger) {
        // console.debug(`[DEBUG] Immediate Render: Throttle=${throttleDelay}ms, Elapsed=${timeSinceLastRender}ms, Markers=${hasImportantMarkers}, Size=${bufferSizeTrigger}`);
        renderNotesForCurrentQuestion();
        lastRenderTime = now;
        pendingChunks = ''; // Reset buffer after render
      } else {
        // console.debug(`[DEBUG] Delayed Render: Throttle=${throttleDelay}ms, Elapsed=${timeSinceLastRender}ms`);
        renderTimeoutId = window.setTimeout(() => {
          if (pendingChunks.length > 0 && activeGenerationIndex.value === streamTargetIndex && currentIndex.value === streamTargetIndex) {
            // console.debug(`[DEBUG] Executing Delayed Render`);
            renderNotesForCurrentQuestion();
            pendingChunks = '';
          }
          renderTimeoutId = null;
        }, throttleDelay - timeSinceLastRender);
      }
    }
  };

  // Completion handler
  const handleCompletion: CompletionCallback = (finalNote, completedIndex, error) => {
    console.log(`[LOG] 生成完成: Index=${completedIndex}, Expected=${targetIndex}, Error=${error || 'None'}, Final Length=${finalNote?.length}`);

    // Clear timeouts regardless of index match
    if (renderTimeoutId) clearTimeout(renderTimeoutId);
    if (autoSaveTimeoutId) clearTimeout(autoSaveTimeoutId);

    // --- Critical: Only process completion if it matches the active generation index ---
    if (activeGenerationIndex.value !== completedIndex) {
      console.warn(`[WARN] 忽略过时的完成回调 (Completed: ${completedIndex}, Active: ${activeGenerationIndex.value})`);
      return;
    }

    try {
      // Final save of the note
      questionToGenerate.notes = finalNote; // Update local object
      if (questionToGenerate.id) {
        console.log(`[LOG] Final save for index ${completedIndex}`);
        configService.saveNoteToQuestion(questionToGenerate.id, finalNote);
        configService.saveQuizState(); // Ensure overall state persistence
      } else {
        console.error(`[ERROR] Cannot perform final save for index ${completedIndex}, missing question ID`);
      }

      // Render the final notes *only* if the completed question is the one currently viewed
      if (currentIndex.value === completedIndex) {
        console.log(`[LOG] Rendering final notes for currently viewed index ${completedIndex}`);
        nextTick(renderNotesForCurrentQuestion);
      }

      // Show appropriate toast message
      if (error) {
        showToast(`题目 ${completedIndex + 1} 笔记生成失败: ${error}`, 'error');
      } else {
        showToast(`题目 ${completedIndex + 1} 笔记生成完成`, 'success');
      }

      // Trigger auto-sync if enabled and generation was successful
      if (!error && apiConfig.value.autoSync && !isManual) {
        showToast('正在自动同步到远程仓库...', 'info');
        triggerSync();
      }

    } catch (completionError) {
      console.error(`[ERROR] Error in completion handler for index ${completedIndex}:`, completionError);
      showToast('处理笔记生成结果时出错', 'error');
    } finally {
      // --- CRITICAL: Reset generation state ---
      console.log(`[LOG] 重置生成状态: activeGenerationIndex from ${activeGenerationIndex.value} to null`);
      activeGenerationIndex.value = null;
      isGenerating.value = false;

      // --- CRITICAL: Check for next auto-generation AFTER resetting state ---
      console.log("[LOG] Completion finished, checking for next auto-generation.");
      checkAndTriggerAutoGeneration();
    }
  };

  // --- Initiate API Call ---
  generateAINotes(questionToGenerate, targetIndex, handleCompletion, handleStreamChunk);
}


/**
 * 检查并触发下一个问题的自动笔记生成
 */
function checkAndTriggerAutoGeneration() {
  console.log("[LOG] checkAndTriggerAutoGeneration called.");
  if (!apiConfig.value.enabled || !apiConfig.value.autoGenerate || isQuizSubmitted.value || isGenerating.value || activeGenerationIndex.value !== null) {
    console.log(`[LOG] Auto-gen check skipped: Enabled=${apiConfig.value.enabled}, AutoGen=${apiConfig.value.autoGenerate}, Submitted=${isQuizSubmitted.value}, Generating=${isGenerating.value}, ActiveIndex=${activeGenerationIndex.value}`);
    return;
  }

  const nextIndex = currentIndex.value + 1;
  console.log(`[LOG] Checking auto-gen for next index: ${nextIndex}`);

  if (nextIndex < localQuestions.value.length) {
    const nextQuestion = localQuestions.value[nextIndex];
    // Check if next question exists and doesn't have notes already
    if (nextQuestion && (!nextQuestion.notes || nextQuestion.notes.trim() === '')) {
      console.log(`[LOG] Triggering auto-generation for index ${nextIndex}`);
      // showToast(`将为下一题 (${nextIndex + 1}) 自动生成笔记`, 'info');
      requestNoteGeneration(nextIndex, false); // false indicates automatic trigger
    } else {
      console.log(`[LOG] Auto-gen skipped for index ${nextIndex}: Question has notes or does not exist.`);
      // If the next one is skipped, should we check index+2? Maybe not, keep it simple.
    }
  } else {
    console.log("[LOG] No more questions for auto-generation.");
  }
}


// --- Lifecycle Hooks ---
onMounted(() => {
  initializeQuiz(); // Load data, set up listeners, etc.
  window.addEventListener('resize', autoResizeTextarea); // Adjust textarea on resize
});

onUnmounted(() => {
  removeKeyboardListeners(); // Clean up global listener
  window.removeEventListener('resize', autoResizeTextarea);
  // Clean up timers
  if (toastTimer) clearTimeout(toastTimer);
});

// --- Watchers ---
watch(selectedChapter, (newChapter, oldChapter) => {
  if (newChapter !== oldChapter) {
    console.log(`章节切换到: ${newChapter}`);
    currentIndex.value = 0; // Reset index
    selectedAnswer.value = null;
    isQuizSubmitted.value = false;
    isReviewingWrong.value = false; // Exit review mode on chapter change
    filterQuestionsByChapter(newChapter); // Filter questions first
    if (localQuestions.value.length > 0) {
      loadQuestion(0); // Then load the first question of the new set
    } else {
      // Handle case where the new chapter has no questions
      renderedNotesHtml.value = ''; // Clear notes display
      error.value = `章节 "${newChapter}" 下没有题目`;
    }
  }
});

// Watch for notes text changes to resize textarea
watch(notesEditText, () => {
  if (isEditingNotes.value) {
    autoResizeTextarea();
  }
});

// Watch dark mode changes to re-initialize Mermaid
watch(isDarkMode, () => {
  nextTick(() => {
    initMermaid();
    renderNotesForCurrentQuestion(); // Re-render notes with potentially new theme
  });
});

</script>
