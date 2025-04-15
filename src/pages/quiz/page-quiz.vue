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
        <h1 class="page-quiz__title">Elyxira</h1>
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
          <button class="page-quiz__mode-button"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg><span>刷题模式</span></button>
          <button class="page-quiz__mode-button" @click="showOverviewModal = true"><svg
              xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg><span>题目总览</span></button>
          <button class="page-quiz__mode-button edit-button" v-if="quizSettings.canEditQuestion"
            @click="openCurrentQuestionEditor"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
            </svg><span>编辑题目</span></button>
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

                <button class="page-quiz__button page-quiz__nav-button" @click="previousQuestion"
                  :disabled="!canGoPrev">
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
                <button @click="toggleNotesEditor" :disabled="isQuizSubmitted || isGenerating"
                  class="page-quiz__button page-quiz__button--icon" :title="isEditingNotes ? '取消编辑' : '编辑笔记'">
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
                <button @click="triggerAINotesGeneration" :disabled="isQuizSubmitted || isGenerating"
                  class="page-quiz__button page-quiz__button--icon page-quiz__ai-button icon-only" :class="{
                    'button--loading': isGeneratingCurrent
                  }" :title="isGeneratingCurrent ? '正在生成笔记...' : 'AI生成笔记'">
                  <span v-if="isGeneratingCurrent" class="loading-spinner"></span>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="feather feather-zap">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                </button>
                <button @click="openSyncConfigModal"
                  class="page-quiz__button page-quiz__button--icon page-quiz__settings-button" title="GitHub仓库设置">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="feather feather-github">
                    <path
                      d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22">
                    </path>
                  </svg>
                </button>
                <button @click="showApiConfigModal = true"
                  class="page-quiz__button page-quiz__button--icon page-quiz__settings-button" title="API设置">
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
              :class="{ 'page-quiz__notes-display--hidden': isEditingNotes }" v-html="renderedNotesHtml"></div>

            <div class="page-quiz__notes-editor" :class="{ 'page-quiz__notes-editor--hidden': !isEditingNotes }">
              <div class="page-quiz__markdown-toolbar">
                <button @click="insertMarkdown('**粗体**')">粗体</button>
                <button @click="insertMarkdown('*斜体*')">斜体</button>
                <button @click="insertMarkdown('# 标题')">标题</button>
                <button @click="insertMarkdown('- 列表项')">列表</button>
                <button @click="insertMarkdown('```\n代码块\n```')">代码</button>
                <button @click="insertMarkdown('```mermaid\ngraph TD;\nA-->B;\n```')">图表</button>
              </div>
              <textarea ref="notesTextareaRef" class="page-quiz__notes-textarea" placeholder="在此添加笔记..."
                v-model="notesEditText"></textarea>
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
    <ModalQuestionEdit :show="showEditModal" :question="questionToEdit as any"
      @close="showEditModal = false; questionToEdit = null" @save="handleSaveQuestion" />
    <ModalQuizSync :show="showSyncConfigModal" @close="showSyncConfigModal = false" @save="handleSyncConfigSave"
      :current-quiz="currentQuizInfo" />
    <ModalApiConfig :show="showApiConfigModal" @close="showApiConfigModal = false"
      :current-config="getCompleteApiConfig()" />

  </div>
</template>

// --- SCRIPT SETUP ---
<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Marked } from 'marked'
import { markedXhtml } from "marked-xhtml"
import mermaid from 'mermaid'
import configService, { QuizMode, type Question, type GithubConfig, type UiSettings, type QuizSettings } from '@/services/config-service' // Added GithubConfig, UiSettings, QuizSettings import
import type { QuizData as StoreQuizData, Chapter as StoreChapter, AppSettings, ApiConfig } from '@/services/config-service' // Keep types if needed, update ApiConfig import
import './page-quiz.css'
import '../../styles/variables.css'
import { showToast } from '@/utils/toast'

// 引入子组件
import ModalQuestionOverview from '@/modals/modal-question-overview.vue'
import ModalStatistics from '@/modals/modal-statistics.vue'
import ModalSettings from '@/modals/modal-settings.vue'
import ModalQuestionEdit from '@/modals/modal-question-edit.vue'
import ModalQuizSync from '@/modals/modal-quiz-sync.vue'
import ModalApiConfig from '@/modals/modal-api-config.vue'

// 路由
const router = useRouter();

// 类型定义
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
type MermaidRenderCallback = (svgCode: string) => void;

// 响应式状态
const loading = ref(true);
const error = ref<string | null>(null);
const localQuestions = ref<Question[]>([]);
const currentIndex = ref(0);
const selectedAnswer = ref<string | null>(null);
const isQuizSubmitted = ref(false);
const wrongQuestionIds = ref<string[]>([]);
const isReviewingWrong = ref(false);
const renderedNotesHtml = ref(''); // 添加缺失的HTML内容引用
const syncStatus = ref('idle');
const activeGenerationIndex = ref<number | null>(null);

// --- 使用 configService 获取设置 ---
const quizSettings = computed(() => configService.getQuizSettings());
const uiSettings = computed(() => configService.getUiSettings());
const apiConfig = computed(() => configService.getApiConfig());
// ---------------------------------

// 笔记状态
const isEditingNotes = ref(false);
const isGenerating = ref(false);
const notesEditText = ref('');

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

// DOM引用
const questionAreaRef = ref<HTMLDivElement | null>(null);
const notesDisplayRef = ref<HTMLDivElement | null>(null);
const notesTextareaRef = ref<HTMLTextAreaElement | null>(null);
const reasoningDisplayRef = ref<HTMLDivElement | null>(null);
const questionTextRef = ref<HTMLElement | null>(null);

// 主题状态
const isDarkMode = computed(() => uiSettings.value.darkMode);

// 计算属性：是否为当前问题生成笔记
const isGeneratingCurrent = computed(() => {
  return isGenerating.value && activeGenerationIndex.value !== null;
});

// 章节选择相关变量
const selectedChapter = ref('all');
const chapters = ref<string[]>([]);

// --- 计算属性 ---
const quizTitle = computed(() => {
  // UPDATE: Use configService to get quiz title
  const quizData = configService.getQuizData();
  const lastLoaded = configService.getLastLoadedQuiz();
  if (!quizData && !lastLoaded?.name) return '测验';
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
  return !isQuizSubmitted.value &&
    (currentIndex.value < totalQuestions.value - 1 || (isCurrentAnswered.value || quizSettings.value.reviewMode || quizSettings.value.allowSkip));
});

const canGoPrev = computed(() => {
  return currentIndex.value > 0 && !isQuizSubmitted.value;
});

const totalQuestions = computed(() => localQuestions.value.length);

const answeredCount = computed(() => {
  return localQuestions.value.filter(q => q.userAnswer !== null && q.userAnswer !== undefined).length;
});

const correctCount = computed(() => {
  return localQuestions.value.filter(q => q.userAnswer !== null && q.userAnswer !== undefined && q.userAnswer === q.answer).length;
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
  wrongQuestionIds: wrongQuestionIds.value.map(String)
}));

const notesVisible = computed(() => {
  if (!currentQuestion.value) return false;
  return forceShowNotes.value || !quizSettings.value.showNotesAfterAnswer || quizSettings.value.reviewMode || isCurrentAnswered.value;
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

// --- 方法 ---
let toastTimer: number | null = null;

function showCustomToast(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', duration = 3000) {
  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
    const existingToast = document.querySelector('.page-quiz .toast--show');
    if (existingToast) existingToast.remove();
  }
  toast.message = message;
  toast.type = type;
  toast.show = true;
  toastTimer = setTimeout(() => {
    toast.show = false;
    toastTimer = null;
  }, duration);
}

function navigateBack() {
  router.push('/library');
}

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

function loadQuizDataAndFilter() {
  loading.value = true;
  error.value = null;

  // UPDATE: Use configService
  const quizData = configService.getQuizData();
  if (!quizData || !quizData.chapters) {
    error.value = '题库数据为空，请返回选择题库';
    loading.value = false;
    return;
  }

  // UPDATE: Use configService
  chapters.value = configService.getQuizChapters(); // quizData.chapters.map(c => c.title);
  filterQuestionsByChapter(selectedChapter.value);

  if (localQuestions.value.length > 0) {
    nextTick(() => {
      loadQuestion(currentIndex.value);
    });
  } else {
    error.value = '当前章节没有题目';
  }

  // UPDATE: Use configService for initial state
  const savedConfig = configService.getQuizConfig();
  selectedChapter.value = savedConfig.chapterIndex || 'all';
  // Apply other saved config if needed (mode, range)

  loading.value = false;
}

async function loadQuestion(index: number) {
  if (index < 0 || index >= localQuestions.value.length) {
    console.warn("无效的问题索引:", index);
    if (!isQuizSubmitted.value) submitQuiz();
    return;
  }

  currentIndex.value = index;
  selectedAnswer.value = null;
  isEditingNotes.value = false;
  // UPDATE: User answer should already be part of the question object from configService state
  // selectedAnswer.value = currentQuestion.value?.userAnswer ?? null;

  // 渲染当前题目的笔记
  await renderNotesForCurrentQuestion(); // 修改为 await

  if (questionAreaRef.value) {
    questionAreaRef.value.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // UPDATE: Call configService to save state if needed implicitly, or remove explicit state emitting
  // emitStateChange();

  nextTick(() => {
    const currentApiConfig = configService.getApiConfig();
    if (currentApiConfig.enabled && currentApiConfig.autoGenerate) {
      checkAndTriggerAutoGeneration();
    }
  });
}

function handleOptionClick(key: string) {
  if (isQuizSubmitted.value || quizSettings.value.reviewMode || isAnswerLocked.value) {
    return;
  }
  if (isCurrentAnswered.value && quizSettings.value.lockAnswerAfterSubmit) {
    return;
  }
  selectedAnswer.value = key;
  if (isCurrentAnswered.value && currentQuestion.value && currentQuestion.value.userAnswer !== key) {
    currentQuestion.value.userAnswer = key;
    // UPDATE: Update configService stats and save state
    configService.updateQuizStats({
      totalAnswered: 1,
      correctCount: 0,
      wrongCount: 1
    });
    configService.saveQuizState(); // Persist the answer

    // Update wrong question list based on the new answer
    const questionIdStr = String(currentQuestion.value.id);
    const wasWrong = wrongQuestionIds.value.includes(questionIdStr);

    if (!wasWrong) {
      wrongQuestionIds.value.push(questionIdStr);
    }
  }
  if (quizSettings.value.autoSubmit && !isCurrentAnswered.value) {
    nextTick(() => {
      submitAnswer();
    });
  }
}

function submitAnswer() {
  if (selectedAnswer.value === null || (isCurrentAnswered.value && quizSettings.value.lockAnswerAfterSubmit)) return;
  const question = currentQuestion.value;
  if (!question) return;
  const isCorrect = compareAnswers(selectedAnswer.value, question.answer);

  if (question.userAnswer !== selectedAnswer.value) {
    question.userAnswer = selectedAnswer.value;

    configService.updateQuizStats({
      totalAnswered: 1,
      correctCount: isCorrect ? 1 : 0,
      wrongCount: isCorrect ? 0 : 1
    });
    configService.saveQuizState();

    const questionIdStr = String(question.id);
    const wasWrong = wrongQuestionIds.value.includes(questionIdStr);

    if (!isCorrect && !wasWrong) {
      wrongQuestionIds.value.push(questionIdStr);
    } else if (isCorrect && wasWrong) {
      const index = wrongQuestionIds.value.indexOf(questionIdStr);
      if (index !== -1) {
        wrongQuestionIds.value.splice(index, 1);
      }
    }
  }

  if (quizSettings.value.autoNext && currentIndex.value < totalQuestions.value - 1) {
    setTimeout(nextQuestion, 1000);
  }
}

function previousQuestion() {
  if (canGoPrev.value) {
    loadQuestion(currentIndex.value - 1);
  }
}

function nextQuestion() {
  if (currentIndex.value < totalQuestions.value - 1) {
    loadQuestion(currentIndex.value + 1);
  } else if (!isQuizSubmitted.value) {
    showToast('已经是最后一题了', 'info');
  }
}

function jumpToQuestion(index: number) {
  if (index >= 0 && index < totalQuestions.value) {
    loadQuestion(index);
  }
}

function submitQuiz() {
  if (isQuizSubmitted.value) return;
  isQuizSubmitted.value = true;
  showModalStatistics.value = true;
  const stats = quizStats.value; // This is session stats
  // Keep saving session stats snapshot if needed
  localStorage.setItem('lastQuizStats', JSON.stringify({
    ...stats,
    timestamp: Date.now(),
    quizTitle: quizTitle.value
  }));
  // Optionally save cumulative stats from configService as well
  // configService.saveQuizStatsToStorage();
}

function redoQuiz() {
  if (window.confirm('确定要重做本次测验吗？所有答题记录将被清空。')) {
    isQuizSubmitted.value = false;
    wrongQuestionIds.value = [];
    selectedAnswer.value = null;
    // UPDATE: Clear answers in configService state
    const quizData = configService.getQuizData();
    if (quizData) {
      quizData.chapters.forEach(chapter => {
        chapter.questions.forEach(q => {
          if (localQuestions.value.some(lq => lq.id === q.id)) { // Only clear for current filtered questions
            q.userAnswer = null;
          }
        });
      });
      configService.setQuizData(quizData); // Update internal state
      configService.saveQuizState(); // Persist cleared answers
    }

    // REMOVE: localStorage clearing for userAnswers, handled by saveQuizState
    // const userAnswers = localStorage.getItem('userAnswers');
    // ... (removed code block) ...

    currentIndex.value = 0; // 回到第一题
    loadQuestion(0);
    showToast('测验已重置', 'success');
  }
}

// 查看错题
function viewWrongQuestions() {
  if (wrongQuestionIds.value.length === 0) {
    showToast('没有错题记录', 'info');
    return;
  }
  showModalStatistics.value = false; // 关闭统计

  // 筛选出错题
  const wrongQs = localQuestions.value.filter(q => wrongQuestionIds.value.includes(String(q.id)));

  if (wrongQs.length > 0) {
    // 用错题替换当前题目列表
    localQuestions.value = wrongQs.map(q => ({ ...q, userAnswer: null })); // 重置错题的答案状态
    isQuizSubmitted.value = false; // 允许在错题模式下答题
    isReviewingWrong.value = true; // 标记为错题回顾模式
    wrongQuestionIds.value = [];   // 清空当前错题记录 (or maybe keep them to track progress within wrong mode?)
    currentIndex.value = 0;
    // UPDATE: Update configService mode?
    // configService.setQuizConfig({ mode: QuizMode.WRONG }); // If configService tracks mode
    loadQuestion(0);
    showToast(`已切换到错题回顾 (${wrongQs.length}题)`, 'info');
  } else {
    showToast('没有找到错题详情', 'warning');
  }
}

// --- Notes Methods ---

// 切换笔记编辑状态
function toggleNotesEditor() {
  isEditingNotes.value = !isEditingNotes.value;
  if (isEditingNotes.value) {
    // 切换到编辑模式，获取当前笔记内容
    notesEditText.value = currentQuestion.value?.notes || '';

    nextTick(() => {
      if (notesTextareaRef.value) {
        notesTextareaRef.value.focus();
        autoResizeTextarea();
      }
    });
  }
}

// 保存笔记
function saveNotes() {
  if (!currentQuestion.value) return;

  // 直接保存编辑后的笔记内容，不再处理标记
  const updatedNotes = notesEditText.value;

  // 设置问题的笔记
  currentQuestion.value.notes = updatedNotes;

  // 使用configService保存笔记
  if (currentQuestion.value.id) {
    const success = configService.saveNoteToQuestion(currentQuestion.value.id, updatedNotes);
    if (!success) {
      showToast('保存笔记失败', 'error');
      return;
    }
    // 更新本地问题对象
    const localQIndex = localQuestions.value.findIndex(q => q.id === currentQuestion.value?.id);
    if (localQIndex > -1) {
      localQuestions.value[localQIndex].notes = updatedNotes;
    }
  } else {
    showToast('无法保存笔记：缺少问题ID', 'error');
    return;
  }

  // 更新笔记呈现
  isEditingNotes.value = false;
  nextTick(() => {
    renderNotesForCurrentQuestion();
  });

  showToast('笔记已保存', 'success');
}

// 渲染当前问题的笔记 (Markdown + Mermaid)
async function renderNotesForCurrentQuestion() {
  if (!currentQuestion.value) {
    renderedNotesHtml.value = '<p class="page-quiz__notes-placeholder">请先加载题目</p>';
    return;
  }

  const noteContent = currentQuestion.value.notes || '';

  if (!noteContent && !isGenerating.value) {
    renderedNotesHtml.value = '<p class="page-quiz__notes-placeholder">这道题目还没有笔记...</p>';
    return;
  }

  try {
    // 使用configService.renderNote渲染内容
    const renderResult = await configService.renderNote(noteContent, isGeneratingCurrent.value, markedInstance);

    const mainHtmlContent = renderResult.contentHtml;
    // 更新渲染的HTML
    if (mainHtmlContent) {
      renderedNotesHtml.value = mainHtmlContent;
    } else if (isGenerating.value) {
      renderedNotesHtml.value = '<p class="page-quiz__notes-placeholder">等待内容生成...</p>';
    } else {
      renderedNotesHtml.value = '<p class="page-quiz__notes-placeholder">这道题目还没有笔记...</p>';
    }

    // 添加生成中的样式类
    nextTick(() => {
      if (notesDisplayRef.value) {
        if (isGeneratingCurrent.value) {
          notesDisplayRef.value.classList.add('generating');
          notesDisplayRef.value.scrollTop = notesDisplayRef.value.scrollHeight;
        } else {
          notesDisplayRef.value.classList.remove('generating');
        }
      }
    });

    // 处理Mermaid图表
    await nextTick();
    processMermaidInElement(notesDisplayRef.value, isGeneratingCurrent.value);

  } catch (error) {
    console.error('Markdown渲染错误:', error);
    renderedNotesHtml.value = `<p class="page-quiz__notes-error">笔记内容解析失败: ${error instanceof Error ? error.message : '未知错误'}</p>`;
  }
}

// 处理指定元素中的Mermaid图表
async function processMermaidInElement(element: HTMLElement | null, isGenerating: boolean) {
  if (!element) return;

  try {
    // 确保 Mermaid 初始化
    await initMermaid();

    // 替换 language-mermaid 类元素为 mermaid 类元素
    const mermaidCodeBlocks = element.querySelectorAll('pre code.language-mermaid');
    mermaidCodeBlocks.forEach(block => {
      try {
        const code = block.textContent || '';
        if (!code.trim()) return;

        const mermaidDiv = document.createElement('div');
        mermaidDiv.className = 'mermaid';
        mermaidDiv.textContent = code;

        const preElement = block.closest('pre');
        if (preElement && preElement.parentNode) {
          preElement.parentNode.replaceChild(mermaidDiv, preElement);
        }
      } catch (e) {
        console.error('替换Mermaid代码块失败:', e);
      }
    });

    // 只在非生成状态下初始化mermaid，避免频繁重绘
    if (!isGenerating) {
      mermaid.init(undefined, '.mermaid').catch(err => {
        console.error('Mermaid渲染错误:', err);
      });
    }
  } catch (mermaidError) {
    console.error('Mermaid处理失败:', mermaidError);
  }
}

// 将Markdown表格转换为HTML表格
function convertMarkdownTablesToHtml(content: string): string {
  if (!content) return content;

  // 正则表达式匹配Markdown表格结构
  // 表格行: | cell1 | cell2 | ...
  // 表格分隔行: |------|-------|...
  const tableRegex = /^\s*\|(.+)\|\s*\n\s*\|([\s\-:|]+)\|\s*\n((?:\s*\|.+\|\s*\n?)+)/gm;

  return content.replace(tableRegex, (match, headerRow, separatorRow, bodyRows) => {
    const headers = headerRow.split('|').map((cell: string) => cell.trim());
    const rows = bodyRows.trim().split('\n').map((row: string) => {
      return row.split('|').map((cell: string) => cell.trim());
    });

    // 生成HTML表格
    let htmlTable = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 16px 0;">\n';

    // 表头
    htmlTable += '  <thead>\n    <tr>\n';
    headers.forEach((header: string) => {
      if (header) {
        htmlTable += `      <th style="padding: 8px; border: 1px solid #ddd;">${header}</th>\n`;
      }
    });
    htmlTable += '    </tr>\n  </thead>\n';

    // 表格内容
    htmlTable += '  <tbody>\n';
    rows.forEach((row: string[]) => {
      htmlTable += '    <tr>\n';
      row.forEach((cell: string) => {
        if (cell) {
          htmlTable += `      <td style="padding: 8px; border: 1px solid #ddd;">${cell}</td>\n`;
        }
      });
      htmlTable += '    </tr>\n';
    });
    htmlTable += '  </tbody>\n';
    htmlTable += '</table>';

    return htmlTable;
  });
}
// 在笔记编辑区插入 Markdown 标记
function insertMarkdown(markup: string) {
  const textarea = notesTextareaRef.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selectedText = text.substring(start, end);
  let insertedMarkup = markup;

  // 占位符替换
  if (selectedText) {
    if (markup.includes('粗体')) insertedMarkup = markup.replace('粗体', selectedText);
    else if (markup.includes('斜体')) insertedMarkup = markup.replace('斜体', selectedText);
    else if (markup.includes('标题')) insertedMarkup = markup.replace('标题', selectedText);
    else if (markup.includes('列表项')) insertedMarkup = markup.replace('列表项', selectedText);
    else if (markup.includes('代码块')) insertedMarkup = markup.replace('代码块', selectedText);
    else if (markup.includes('A-->B')) insertedMarkup = markup.replace('A-->B', selectedText || 'A-->B');
    else insertedMarkup = markup + selectedText;
  }

  textarea.value = text.substring(0, start) + insertedMarkup + text.substring(end);
  notesEditText.value = textarea.value; // 更新v-model绑定

  // 设置光标位置
  textarea.focus();
  nextTick(() => {
    textarea.selectionStart = textarea.selectionEnd = start + insertedMarkup.length;
    autoResizeTextarea();
  });
}

// 自动调整文本区高度
function autoResizeTextarea() {
  const textarea = notesTextareaRef.value;
  if (textarea) {
    textarea.style.height = 'auto';
    nextTick(() => {
      if (textarea && textarea.scrollHeight) {
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    });
  }
}

// 实际调用AI API生成笔记 (MODIFIED to accept index and pass it to callbacks)
async function generateAINotes(
  question: Question | null,
  generationTargetIndex: number, // ADDED: Index parameter
  completionCallback: CompletionCallback,
  streamCallback?: StreamCallback
) {
  console.log(`[LOG] 进入 generateAINotes: 目标索引=${generationTargetIndex}, 问题=`, question ? question.id : 'null'); // DEBUG -> LOG
  if (!question) {
    // FIX: Add generationTargetIndex
    completionCallback('', generationTargetIndex, '无法获取问题信息');
    return;
  }

  const currentApiConfig = configService.getApiConfig();

  if (!currentApiConfig.apiUrl || !currentApiConfig.apiKey) {
    showToast('请先配置AI API设置', 'info');
    showApiConfigModal.value = true;
    // FIX: Add generationTargetIndex
    completionCallback('', generationTargetIndex, '请先在API配置中设置API地址和密钥');
    return;
  }

  try {
    // 使用configService获取请求参数
    const requestData = configService.getNotesGenerationRequestParams(question);

    console.log(`[LOG] generateAINotes: 发起 API 请求, 目标索引=${generationTargetIndex}, URL=${currentApiConfig.apiUrl}`);

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
      console.error(`[LOG] API 请求失败: ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    let generatedNote = '';

    if (requestData.stream) {
      // 处理流式输出
      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法读取响应流');
      console.log(`[LOG] generateAINotes: 开始读取流 for index ${generationTargetIndex}`);

      const decoder = new TextDecoder();
      let buffer = '';

      // 网络波动保护相关变量
      let lastDataReceived = Date.now();
      const dataTimeout = 30000; // 30秒无数据视为超时
      const heartbeatInterval = setInterval(() => {
        const now = Date.now();
        const elapsed = now - lastDataReceived;
        if (elapsed > dataTimeout) {
          console.warn(`[WARN] 数据流接收超时(${elapsed}ms)，可能存在网络问题`);
          showToast('网络连接不稳定，数据接收中断', 'warning');
          clearInterval(heartbeatInterval);
        }
      }, 10000); // 每10秒检查一次

      try {
        let retryCount = 0;
        const maxRetries = 3;

        while (true) {
          try {
            const { done, value } = await reader.read();

            // 重置超时计时器，因为收到了数据
            lastDataReceived = Date.now();

            if (done) {
              console.log(`[LOG] generateAINotes: 流读取完成 (done) for index ${generationTargetIndex}`);
              break;
            }

            // 将新块添加到缓冲区
            buffer += decoder.decode(value, { stream: true });
            retryCount = 0; // 成功接收数据，重置重试计数

            // 从缓冲区处理完整行
            while (true) {
              const lineEnd = buffer.indexOf('\n');
              if (lineEnd === -1) break;

              const line = buffer.slice(0, lineEnd).trim();
              buffer = buffer.slice(lineEnd + 1);

              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') break;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices[0]?.delta?.content ||
                    parsed.choices[0]?.message?.content || '';

                  if (content) {
                    console.log(`[LOG] generateAINotes: 收到content='${content}'`);
                    generatedNote += content;
                    if (streamCallback) {
                      streamCallback(content, generationTargetIndex);
                    }
                  }
                } catch (e) {
                  console.error('[ERROR] generateAINotes: 解析流式 JSON 出错:', e, '原始行:', line);
                  // 忽略无效的JSON
                }
              }
            }
          } catch (e) {
            // 网络错误处理逻辑
            retryCount++;
            const isNetworkError = e instanceof Error &&
              (e.message.includes('network') || e.message.includes('fetch') || e.message.includes('abort'));

            if (isNetworkError && retryCount <= maxRetries) {
              console.warn(`[WARN] 流读取出错，正在进行第${retryCount}次重试:`, e.message);
              showToast(`网络不稳定，正在重试(${retryCount}/${maxRetries})...`, 'warning');
              // 等待短暂时间后重试
              await new Promise(resolve => setTimeout(resolve, 2000));
              continue;
            } else {
              // 重试次数用尽或非网络错误，抛出以终止循环
              throw e;
            }
          }
        }
      } finally {
        clearInterval(heartbeatInterval);
        reader.cancel();
      }
      console.log(`[LOG] generateAINotes: 流处理完成 for index ${generationTargetIndex}. Final Note Length: ${generatedNote.length}`);
    } else {
      // 处理非流式输出
      const data = await response.json();
      if (data.choices && data.choices[0]) {
        // 兼容不同的API响应格式
        if (data.choices[0].message) {
          generatedNote = data.choices[0].message.content || '';
        } else if (data.choices[0].text) {
          generatedNote = data.choices[0].text || '';
        } else if (data.choices[0].delta && data.choices[0].delta.content) {
          generatedNote = data.choices[0].delta.content || '';
        }
      }

      console.log(`[LOG] generateAINotes: 非流式输出生成的最终笔记:`, generatedNote);
    }

    // 使用configService格式化笔记
    const formattedNote = generatedNote.trim();
    completionCallback(formattedNote, generationTargetIndex);
  } catch (error) {
    completionCallback('', generationTargetIndex, error instanceof Error ? error.message : '未知错误');
  }
}

// 触发 AI 笔记生成 (Manual Trigger - MODIFIED)
function triggerAINotesGeneration() {
  if (!currentQuestion.value || isQuizSubmitted.value) return;

  // 显示笔记区域
  forceShowNotes.value = true;

  // 使用统一的请求生成函数，传入当前索引和手动标记
  requestNoteGeneration(currentIndex.value, true);
}

// 触发笔记同步
function triggerSync() {
  if (syncStatus.value === 'pending') return;

  syncStatus.value = 'pending';
  showToast('笔记同步中...', 'info');

  try {
    // 确保当前问题的最新笔记在同步前保存到 QuizStore
    if (currentQuestion.value) {
      // Note: saveNoteToQuestion already updates and saves, direct call might be redundant
      // We assume notes are up-to-date in configService state due to prior saves
      // configService.saveNoteToQuestion(currentQuestion.value.id, currentQuestion.value.notes);
    }

    // 获取GitHub配置
    const githubConfig = configService.getGithubConfig();
    const owner = githubConfig.owner;
    const repo = githubConfig.repo;
    const branch = githubConfig.branch;
    const path = githubConfig.path;
    const token = githubConfig.token;
    const useForceSync = githubConfig.forceSync;
    const syncQuizName = githubConfig.syncQuizName || currentQuizInfo.value.name;

    // 检查是否配置了GitHub
    if (!owner || !repo || !token) {
      syncStatus.value = 'error';
      showToast('请先配置GitHub仓库信息', 'error');
      showSyncConfigModal.value = true;
      return;
    }

    // 构建API路径
    let apiPath = path.replace(/\/$/, '');
    if (!apiPath.endsWith('.json')) {
      apiPath = apiPath ? `${apiPath}/${syncQuizName}.json` : `${syncQuizName}.json`;
    }

    // 获取要同步的完整题库数据
    const currentQuizData = configService.getQuizData();
    if (!currentQuizData) {
      syncStatus.value = 'error';
      showToast('无法获取当前题库数据进行同步', 'error');
      return;
    }

    // 准备要同步的内容
    const contentJson = JSON.stringify(currentQuizData, null, 2);
    const encodedContent = btoa(unescape(encodeURIComponent(contentJson)));

    // 执行同步
    configService.pushQuizToGithub(syncQuizName, useForceSync)
      .then(success => {
        if (success) {
          syncStatus.value = 'success';
          showToast('题库已成功同步到GitHub', 'success'); // Message adjusted slightly
          setTimeout(() => syncStatus.value = 'idle', 2000);
        } else {
          syncStatus.value = 'error';
          showToast('同步失败，请检查网络或配置', 'error');
        }
      })
      .catch(err => {
        console.error('同步失败:', err);
        syncStatus.value = 'error';
        showToast(`同步失败: ${err instanceof Error ? err.message : '未知错误'}`, 'error');
      })
      .finally(() => {
        // Ensure status is reset if promise resolved/rejected but wasn't success/error
        // if (syncStatus.value === 'pending') syncStatus.value = 'error'; // Or 'idle'?
      });

  } catch (err) {
    console.error('同步笔记失败:', err);
    syncStatus.value = 'error';
    showToast(`同步失败: ${err instanceof Error ? err.message : '未知错误'}`, 'error');
  }
}

// 打开同步配置模态框
function openSyncConfigModal() {
  showSyncConfigModal.value = true;
}

// 处理同步配置保存
function handleSyncConfigSave(config: Record<string, unknown>) { // 使用 Record<string, unknown> 代替 any
  console.log('同步配置已保存:', config);
  // UPDATE: Use configService to update Github config
  configService.updateGithubConfig(config as Partial<GithubConfig>);
  // showToast('远程仓库配置已保存', 'success'); // updateGithubConfig already shows toast
}

// 获取当前题库信息
const currentQuizInfo = computed(() => {
  // UPDATE: Use configService
  const quizData = configService.getQuizData();
  const lastLoaded = configService.getLastLoadedQuiz();

  // 检查是否有有效的题库数据
  const exists = !!quizData || !!lastLoaded?.name; // Adjusted logic slightly

  return {
    name: lastLoaded?.name || quizData?.title || '', // Prioritize last loaded name
    source: lastLoaded?.source || '', // Assuming lastLoaded has source
    isLocal: lastLoaded?.source === 'local',
    exists: exists
  };
});

// --- Modal Methods ---

// 应用设置
function applySettings(newSettings: AppSettings) {
  // UPDATE: Use configService
  configService.updateSettings(newSettings);
}

// NEW: Function to handle save event from ModalSettings
function applySettingsFromModal(settings: { uiSettings: UiSettings, quizSettings: QuizSettings, debugEnabled: boolean }) {
  // Update only the relevant parts using configService methods or updateSettings
  configService.updateUiSettings(settings.uiSettings, false);
  configService.updateQuizSettings(settings.quizSettings, false);
  configService.setDebugEnabled(settings.debugEnabled, false);
  showToast('通用设置已保存', 'success'); // Show toast after applying changes
  // Note: updateSettings could also be used if ModalSettings returns AppSettings partial
  // configService.updateSettings({
  //   uiSettings: settings.uiSettings,
  //   quizSettings: settings.quizSettings,
  //   debugEnabled: settings.debugEnabled,
  // });
}

// 打开当前问题的编辑器
function openCurrentQuestionEditor() {
  if (!quizSettings.value.canEditQuestion || isQuizSubmitted.value || !currentQuestion.value) {
    showToast('当前状态无法编辑题目', 'warning');
    return;
  }
  questionToEdit.value = currentQuestion.value;
  showEditModal.value = true;
}

// 处理保存问题
function handleSaveQuestion(updatedQuestionData: Partial<Question>) {
  if (!questionToEdit.value || !questionToEdit.value.id) return;

  // 获取需要更新的题目ID
  const questionId = questionToEdit.value.id; // Keep original type if possible

  // UPDATE: Call configService.updateQuestion (to be implemented)
  const success = configService.updateQuestion(questionId, updatedQuestionData);
  // const success = true; // Placeholder until updateQuestion is implemented
  // console.warn("configService.updateQuestion is not implemented yet. Skipping actual update.")

  if (success) {
    // Update local question list immediately for UI responsiveness
    const localQuestionIndex = localQuestions.value.findIndex(q => q.id === questionId);
    if (localQuestionIndex !== -1) {
      // Create a new object to ensure reactivity
      localQuestions.value[localQuestionIndex] = {
        ...localQuestions.value[localQuestionIndex],
        ...updatedQuestionData
      };
    }
    showToast('题目已更新', 'success');
  } else {
    showToast('更新题目失败', 'error');
  }


  // REMOVE: Manual update logic for QuizStore and local list
  // const quizData = QuizStore.state.quizData;
  // ... (removed code block) ...
}

// 更新QuizStore源数据的函数
function updateQuizStoreSourceData(updatedQuestionData: Partial<Question>) {
  if (!updatedQuestionData.id) {
    console.error("无法更新题目：缺少ID");
    return;
  }

  const questionId = String(updatedQuestionData.id); // 确保ID为字符串类型

  // 获取QuizStore中的题库数据
  const quizData = configService.getQuizData();
  if (!quizData || !quizData.chapters) {
    console.error("无法更新题目：未找到题库数据");
    return;
  }

  // 在所有章节中查找该题目
  let found = false;
  for (let i = 0; i < quizData.chapters.length; i++) {
    const chapter = quizData.chapters[i];
    const questionIndex = chapter.questions.findIndex(q => String(q.id) === questionId);

    if (questionIndex !== -1) {
      // 找到题目，更新它
      const updatedQuestion = {
        ...quizData.chapters[i].questions[questionIndex],
      };

      // 只更新非undefined的字段
      Object.keys(updatedQuestionData).forEach(key => {
        const typedKey = key as keyof Question;
        if (updatedQuestionData[typedKey] !== undefined) {
          (updatedQuestion as Record<string, unknown>)[typedKey] = updatedQuestionData[typedKey];
        }
      });

      quizData.chapters[i].questions[questionIndex] = updatedQuestion;
      found = true;
      break;
    }
  }

  if (found) {
    // 更新QuizStore中的数据
    configService.setQuizData(quizData);
    // 保存到存储
    configService.saveQuizState();
    console.log("已更新QuizStore中的题目数据，ID:", updatedQuestionData.id);
  } else {
    console.warn("在QuizStore中未找到要更新的题目，ID:", updatedQuestionData.id);
  }
}

// 存储相关方法

// 触发状态变更
function emitStateChange() {
  console.log("内部触发状态变更，索引:", currentIndex.value);
}

// --- 生命周期钩子 ---
onMounted(() => {
  try {
    mermaid.initialize({ startOnLoad: true });

    // UPDATE: Load initial quiz data
    loadQuizDataAndFilter();

    // 设置键盘事件监听
    document.addEventListener('keydown', handleKeyPress);

    // 初始化定时器
    initTimer();
  } catch (err) {
    console.error('处理题库数据失败:', err);
    loading.value = false;
    const errorMsg = err instanceof Error ? err.message : String(err);
    error.value = '处理题库数据时出错: ' + errorMsg;
  }
});

// 初始化定时器
function initTimer() {
  console.log('定时器已初始化');
}

// --- 辅助方法 ---

// 获取选项的 Key (e.g., 'A')
function getOptionKey(optionText: string, index: number): string {
  const keyMatch = typeof optionText === 'string' ? optionText.match(/^([A-Z])[:.)]?\s*/i) : null;
  return keyMatch ? keyMatch[1].toUpperCase() : String.fromCharCode(65 + index);
}

// 获取选项的内容
function getOptionContent(optionText: string): string {
  const keyMatch = typeof optionText === 'string' ? optionText.match(/^([A-Z])[:.)]?\s*/i) : null;
  return keyMatch ? formatQuestionText(optionText.substring(keyMatch[0].length)) : formatQuestionText(optionText);
}

// 获取选项的 CSS 类
function getOptionClass(optionKey: string): string {
  const question = currentQuestion.value;
  if (!question) return '';

  const classes = [];
  const isSelected = selectedAnswer.value === optionKey;
  const isUserAnswer = question.userAnswer === optionKey;
  const isCorrectAnswer = isCorrectAnswerOption(question.answer, optionKey);
  const answered = isCurrentAnswered.value;
  const canChange = !quizSettings.value.lockAnswerAfterSubmit; // 使用 quizSettings

  // 如果允许修改答案，且当前选择了此选项但还未保存
  if (isSelected && ((!answered) || (answered && canChange))) {
    classes.push('page-quiz__option--selected');
  }

  if (answered || quizSettings.value.reviewMode) { // 已回答或回顾模式 // 使用 quizSettings
    // 显示正确答案的条件：
    // 1. 处于回顾模式，或
    // 2. 启用了立即显示正确答案，或
    // 3. 用户的回答是这个选项（显示用户回答状态）
    if ((quizSettings.value.reviewMode || quizSettings.value.showCorrectAnswerImmediately || isUserAnswer) && isCorrectAnswer) { // 使用 quizSettings
      classes.push('page-quiz__option--correct');
    }

    // 添加对错误选项的处理
    if (isUserAnswer && !isCorrectAnswer) {
      classes.push('page-quiz__option--incorrect');
    }
  }

  return classes.join(' ');
}

// 判断选项是否为正确答案
function isCorrectAnswerOption(answer: string | number | number[] | undefined, optionKey: string): boolean {
  if (answer === undefined || answer === null) return false;

  // 计算选项的索引 ('A' -> 0, 'B' -> 1)
  const optionIndex = optionKey.charCodeAt(0) - 65;

  if (typeof answer === 'number') {
    // 数字类型答案，比较索引
    return answer === optionIndex;
  } else if (typeof answer === 'string') {
    // 字符串类型答案，直接比较
    return answer === optionKey;
  } else if (Array.isArray(answer)) {
    if (answer.length === 0) return false;

    // 处理答案为数组的情况
    for (const item of answer) {
      if (typeof item === 'number') {
        if (item === optionIndex) {
          return true;
        }
      } else if (typeof item === 'string') {
        if (item === optionKey) {
          return true;
        }
      }
    }
    return false;
  }

  console.warn("无法识别的答案格式:", answer, "对比值:", optionKey);
  return false;
}

// 比较选择的答案与正确答案
function compareAnswers(selected: string | null, correct: string | number | number[] | undefined): boolean {
  if (selected === null || correct === undefined) return false;
  return isCorrectAnswerOption(correct, selected);
}

// 获取选项 Key 的 CSS 类 (主要用于对错标记)
function getOptionKeyClass(optionKey: string): string {
  const question = currentQuestion.value;
  if (!question || (!isCurrentAnswered.value && !quizSettings.value.reviewMode)) return '';

  const isCorrectAnswer = question.answer === optionKey;
  const isUserWrongAnswer = question.userAnswer === optionKey && question.userAnswer !== question.answer;

  if (isCorrectAnswer && (quizSettings.value.reviewMode || quizSettings.value.showCorrectAnswerImmediately)) {
    return 'page-quiz__option-number--correct';
  } else if (isUserWrongAnswer) {
    return 'page-quiz__option-number--incorrect';
  }
  return '';
}

// --- 键盘和滑动处理 ---
let touchStartX = 0;
let touchStartY = 0;

// 处理触摸开始事件
function handleTouchStart(e: TouchEvent) {
  if (!quizSettings.value.swipeGestureEnabled) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY; // 记录Y轴起始位置
}

// 处理触摸结束事件
function handleTouchEnd(e: TouchEvent) {
  if (!quizSettings.value.swipeGestureEnabled) return;
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  const diffX = touchStartX - touchEndX;
  const diffY = touchStartY - touchEndY;

  // 获取屏幕尺寸，计算阈值
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const horizontalThreshold = screenWidth * 0.15;
  const verticalThreshold = screenHeight * 0.10;

  // 检查滑动是否主要为水平方向，且超过阈值
  if (Math.abs(diffX) > horizontalThreshold && Math.abs(diffY) < verticalThreshold) {
    if (diffX > 0) { // 左滑 -> 下一题
      if (canGoNext.value) {
        nextQuestion();
      }
    } else { // 右滑 -> 上一题
      if (canGoPrev.value) {
        previousQuestion();
      }
    }
  }
}

// 处理键盘按键事件
function handleKeyPress(e: KeyboardEvent) {
  // 忽略输入框/文本域内的按键
  const activeElement = document.activeElement;
  if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
    return;
  }

  // 忽略模态框激活时的按键 (允许 Esc 关闭)
  const activeModal = document.querySelector('.modal.modal--active');
  if (activeModal) {
    if (e.key === 'Escape') {
      // 关闭所有可能的模态框
      showOverviewModal.value = false;
      showModalStatistics.value = false;
      showModalSettings.value = false;
      showEditModal.value = false;
      questionToEdit.value = null;
    }
    return; // 阻止其他快捷键在模态框激活时生效
  }

  // 数字键 1-7 对应选项
  if (e.key >= '1' && e.key <= '7') {
    const optionIndex = parseInt(e.key) - 1;
    if (currentQuestion.value && optionIndex < currentQuestion.value.options.length) {
      const key = getOptionKey(currentQuestion.value.options[optionIndex], optionIndex);
      handleOptionClick(key);
      e.preventDefault();
    }
  }
  // 空格键 提交/下一题
  else if (e.key === ' ') {
    e.preventDefault(); // 防页面滚动
    if (canSubmit.value) {
      submitAnswer();
    } else if (canGoNext.value) {
      nextQuestion();
    }
  }
  // 左右箭头键 上一题/下一题
  else if (e.key === 'ArrowLeft') {
    if (canGoPrev.value) {
      previousQuestion();
      e.preventDefault();
    }
  } else if (e.key === 'ArrowRight') {
    if (canGoNext.value) {
      nextQuestion();
      e.preventDefault();
    }
  }
}

// 设置键盘事件监听
function setupKeyboardListeners() {
  document.addEventListener('keydown', handleKeyPress);
}

// 移除键盘事件监听
function removeKeyboardListeners() {
  document.removeEventListener('keydown', handleKeyPress);
}

// --- 辅助方法 ---

// 初始化 Mermaid 图表库
async function initMermaid() {
  try {
    mermaid.initialize({
      startOnLoad: false,
      theme: document.body.classList.contains('dark-theme') ? 'dark' : 'default',
      securityLevel: 'loose',
      flowchart: { useMaxWidth: true },
    });
    renderMermaidDiagrams();
  } catch (error) {
    console.error('初始化Mermaid失败:', error);
  }
}

// 处理Mermaid图表渲染的统一函数
function renderMermaidDiagrams(container?: HTMLElement) {
  try {
    const targets = container
      ? container.querySelectorAll('pre code.language-mermaid')
      : document.querySelectorAll('.mermaid');

    if (targets.length === 0) return;

    targets.forEach((el, index) => {
      if (el instanceof HTMLElement && !el.querySelector('svg')) {
        try {
          const id = `mermaid-diagram-${Date.now()}-${index}`;
          el.id = id;

          mermaid.render(
            id,
            el.textContent || ''
          ).then((result) => {
            if (el instanceof HTMLElement) {
              el.innerHTML = result.svg;
            }
          });
        } catch (diagramError) {
          console.warn('渲染图表失败:', diagramError);
          el.classList.add('mermaid-error');
          el.innerHTML = `<div class="mermaid-error-message">图表渲染失败</div>`;
        }
      }
    });
  } catch (error) {
    console.error('处理Mermaid图表失败:', error);
  }
}

// 渲染笔记中特定容器内的Mermaid图表
function renderMermaidInContainer(container: HTMLElement) {
  if (!container) return;

  const mermaidCodeBlocks = container.querySelectorAll('pre code.language-mermaid');
  mermaidCodeBlocks.forEach((el, index) => {
    if (el instanceof HTMLElement) {
      const id = `mermaid-diagram-${Date.now()}-${index}`;
      el.id = id;

      mermaid.render(
        id,
        el.textContent || ''
      ).then((result) => {
        if (el instanceof HTMLElement) {
          el.innerHTML = result.svg;
        }
      });
    }
  });
}

// 新增UI状态变量
const forceShowNotes = ref(false);

// 切换主题方法
function toggleTheme() {
  // 使用configService切换主题
  configService.toggleDarkMode();
  // isDarkMode 计算属性会自动更新，无需手动设置

  // 重新初始化mermaid以应用主题变化
  nextTick(() => {
    if (typeof mermaid !== 'undefined') {
      mermaid.initialize({
        startOnLoad: false,
        theme: isDarkMode.value ? 'dark' : 'default' // 使用计算属性
      });
    }
    renderNotesForCurrentQuestion();
  });
}

// 获取完整的API配置 (现在直接从configService获取)
function getCompleteApiConfig() {
  // 直接返回从 configService 获取的 API 配置
  return configService.getApiConfig();
}

// 辅助函数：比较题目 ID
function compareQuestionIds(a: Question, b: Question): number {
  const idA = String(a.id || '');
  const idB = String(b.id || '');
  // 尝试解析为数字进行比较，失败则使用字符串比较
  const numA = parseInt(idA.replace(/[^0-9]/g, ''), 10);
  const numB = parseInt(idB.replace(/[^0-9]/g, ''), 10);
  if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
    return numA - numB;
  }
  return idA.localeCompare(idB);
}

// 监听章节选择变化
watch(selectedChapter, (newChapter) => {
  console.log(`章节切换到: ${newChapter}`);
  loading.value = true;
  filterQuestionsByChapter(newChapter);

  // 重置状态
  currentIndex.value = 0;
  selectedAnswer.value = null;
  isQuizSubmitted.value = false;
  isReviewingWrong.value = false;

  if (localQuestions.value.length > 0) {
    loadQuestion(0);
  } else {
    console.warn('切换章节后没有题目可加载');
  }
  loading.value = false;
});

// 格式化题目文本，将选项字母后的顿号替换为空格
function formatQuestionText(text: string | undefined): string {
  if (!text) return '';
  // 使用正则表达式匹配 A、 B、 C、 D、 E、 并将顿号替换为空格
  return text.replace(/([A-E])、/g, '$1 ');
}

// 新增：格式化题目文本，移除开头的题号
function formatQuestionTitle(title: string | undefined): string {
  if (!title) return '';
  // 修复正则表达式，移除反斜杠，正确匹配开头的数字和点号
  return title.replace(/^\s*\d+\s*\.\s*/, '');
}
// NEW: Unified function to request note generation
function requestNoteGeneration(targetIndex: number, isManual: boolean) {
  console.debug(`[DEBUG] 请求生成笔记: 目标索引=${targetIndex}, 手动=${isManual}, 当前索引=${currentIndex.value}, activeGenIndex=${activeGenerationIndex.value}, isGenerating=${isGenerating.value}`);

  const questionToGenerate = localQuestions.value[targetIndex];

  // 基本检查
  if (!questionToGenerate || isQuizSubmitted.value) {
    console.warn(`忽略索引 ${targetIndex} 的生成请求：无问题或测验已提交`);
    return;
  }

  // 已有笔记且不是手动请求时跳过
  if (!isManual && questionToGenerate.notes && questionToGenerate.notes.trim() !== '') {
    console.log(`跳过索引 ${targetIndex} 的生成，已存在笔记`);
    // 如果是自动生成跳过，也需要检查下一个
    if (!isManual) {
      checkAndTriggerAutoGeneration();
    }
    return;
  }

  // 检查是否已有生成任务正在进行
  if (isGenerating.value || activeGenerationIndex.value !== null) {
    const currentGenIndex = activeGenerationIndex.value;
    // 避免对同一题目的重复手动请求提示过多
    if (!(isManual && currentGenIndex === targetIndex)) {
      showToast(`已有笔记生成任务进行中 (题目 ${currentGenIndex !== null ? currentGenIndex + 1 : '?'})`, 'info');
    }
    console.warn(`忽略索引 ${targetIndex} 的生成请求。当前活跃生成索引: ${currentGenIndex}`);
    return;
  }

  // 移除对 isGeneratingNextInBackground 的检查

  // 开始生成
  console.debug(`[DEBUG] 开始生成笔记: 设置activeGenerationIndex=${targetIndex}, isGenerating=true`);
  activeGenerationIndex.value = targetIndex;
  isGenerating.value = true; // 用于UI显示
  forceShowNotes.value = true;
  showToast(`开始为题目 ${targetIndex + 1} 生成笔记...`, 'info');

  // 清除此问题之前的笔记
  questionToGenerate.notes = '';

  // 仅在当前查看的是被清除的问题时立即渲染
  if (currentIndex.value === targetIndex) {
    renderNotesForCurrentQuestion();
  }

  let lastRenderTime = 0;
  const baseThrottleDelay = 100;
  let throttleDelay = baseThrottleDelay;
  let pendingChunks = '';
  let renderTimeout: number | null = null;
  let autoSaveTimeout: number | null = null;

  // 自动保存函数
  const autoSaveNotes = () => {
    if (activeGenerationIndex.value === targetIndex && questionToGenerate.notes) {
      configService.saveNoteToQuestion(questionToGenerate.id, questionToGenerate.notes);
      // 添加：保存整个测验状态，确保笔记持久化
      configService.saveQuizState();
      autoSaveTimeout = window.setTimeout(autoSaveNotes, 5000);
    } else {
      if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
      autoSaveTimeout = null;
    }
  };
  autoSaveTimeout = window.setTimeout(autoSaveNotes, 5000); // 开始自动保存

  // 处理流式响应
  const handleStreamChunk: StreamCallback = (chunk, streamTargetIndex) => {
    console.debug(`[DEBUG] handleStreamChunk: 接收到 chunk, 目标索引=${streamTargetIndex}, 当前期望索引=${targetIndex}, chunk='${chunk.substring(0, 50)}...'`);
    // 确保更新对应的问题对象
    if (streamTargetIndex !== targetIndex) {
      console.debug(`[DEBUG] handleStreamChunk: 索引不匹配，忽略 chunk (期望=${targetIndex})`);
      return;
    }

    console.log(`[LOG] handleStreamChunk: Called for index ${targetIndex} with chunk: ${chunk.substring(0, 50)}...`); // 添加日志

    // 更新问题笔记
    questionToGenerate.notes = (questionToGenerate.notes || '') + chunk;
    pendingChunks += chunk;
    console.log(`[LOG] handleStreamChunk: 更新笔记 for index ${targetIndex}, 新长度 ${questionToGenerate.notes?.length}`); // 添加日志

    // 定期保存 (流式时也保存)
    if (pendingChunks.length > 100) {
      console.debug(`[DEBUG] handleStreamChunk: 达到保存阈值，保存笔记 for index ${targetIndex}`);
      configService.saveNoteToQuestion(questionToGenerate.id, questionToGenerate.notes); // Use configService
      // 添加：保存整个测验状态，确保笔记持久化
      configService.saveQuizState();
    }

    console.debug(`[DEBUG] handleStreamChunk: 检查是否渲染, apiConfig.streamOutput=${apiConfig.value.streamOutput}, currentIndex=${currentIndex.value}, streamTargetIndex=${streamTargetIndex}`);
    // 仅当当前查看的题目是正在生成的题目时才渲染更新
    if (apiConfig.value.streamOutput && currentIndex.value === streamTargetIndex) {
      const now = Date.now();
      const timeSinceLastRender = now - lastRenderTime;
      const hasImportantMarkers = /\n|```|\*\*|#|>|-\s|1\.|\<|!\[/.test(pendingChunks);

      if (pendingChunks.length > 100) throttleDelay = baseThrottleDelay * 2;
      else if (hasImportantMarkers) throttleDelay = 0;
      else throttleDelay = baseThrottleDelay;

      if (renderTimeout) clearTimeout(renderTimeout);

      if (timeSinceLastRender > throttleDelay || hasImportantMarkers) {
        console.debug(`[DEBUG] handleStreamChunk: 立即渲染 (节流=${throttleDelay}ms, 间隔=${timeSinceLastRender}ms, 有标记=${hasImportantMarkers})`);
        renderNotesForCurrentQuestion();
        lastRenderTime = now;
        pendingChunks = '';
        renderTimeout = null;
      } else {
        console.debug(`[DEBUG] handleStreamChunk: 延迟渲染 (节流=${throttleDelay}ms, 间隔=${timeSinceLastRender}ms)`);
        renderTimeout = window.setTimeout(() => {
          console.debug(`[DEBUG] handleStreamChunk: 执行延迟渲染`);
          if (pendingChunks.length > 0 && activeGenerationIndex.value === streamTargetIndex && currentIndex.value === streamTargetIndex) {
            renderNotesForCurrentQuestion();
            pendingChunks = '';
          }
          renderTimeout = null;
        }, throttleDelay - timeSinceLastRender);
      }
    }
  };

  // 处理完成回调
  const handleCompletion: CompletionCallback = (finalNote, completedIndex, error) => {
    console.debug(`[DEBUG] 笔记生成完成回调: 完成索引=${completedIndex}, 当前活跃索引=${activeGenerationIndex.value}, 匹配=${activeGenerationIndex.value === completedIndex}, 目标索引=${targetIndex}`);
    console.log(`[LOG] handleCompletion: Called for index ${completedIndex}. Final Note Length: ${finalNote?.length || 0}. Error: ${error}`); // 添加日志，打印 finalNote 长度和错误

    // 清理定时器
    if (renderTimeout) clearTimeout(renderTimeout);
    if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
    autoSaveTimeout = null;

    // 仅处理匹配的完成事件 (检查 activeGenerationIndex 和 completedIndex)
    if (activeGenerationIndex.value !== completedIndex) {
      console.warn(`[WARN] 忽略索引 ${completedIndex} 的完成回调。当前活跃生成索引为 ${activeGenerationIndex.value}`);
      return;
    }

    try {
      // 处理完成
      questionToGenerate.notes = finalNote;
      // UPDATE: Use configService to save final note
      if (questionToGenerate && questionToGenerate.id) {
        const finalSaveSuccess = configService.saveNoteToQuestion(questionToGenerate.id, finalNote);
        if (!finalSaveSuccess) {
          console.error(`[ERROR] Final save failed for index ${targetIndex}`);
        } else {
          // 添加：保存整个测验状态，确保笔记持久化
          configService.saveQuizState();
        }
      } else {
        console.error(`[ERROR] Cannot perform final save for index ${targetIndex}, missing question or ID`);
      }
      console.debug(`[DEBUG] 完成回调: 最终笔记已保存 for index ${completedIndex}`);

      // **重要：渲染当前题目**
      // 只有当完成的是当前正在查看的题目时，才需要强制重新渲染
      if (currentIndex.value === completedIndex) {
        console.debug(`[DEBUG] 完成回调: 完成的是当前题目，准备渲染笔记`);
        nextTick(() => renderNotesForCurrentQuestion());
      } else {
        console.debug(`[DEBUG] 完成回调: 完成的不是当前题目 (${currentIndex.value})，不主动渲染`);
      }

      if (error) {
        showToast(`题目 ${completedIndex + 1} 笔记生成失败: ${error}`, 'error');
        console.error(`[ERROR] 笔记生成失败 for index ${completedIndex}:`, error);
      } else {
        showToast(`题目 ${completedIndex + 1} 笔记生成完成`, 'success');
        console.log(`[LOG] 笔记生成成功 for index ${completedIndex}`);
        // 检查自动同步 - 仅当完成的是当前问题或当前问题的下一题时才自动同步
        const currentApiConfig = configService.getApiConfig();
        if (currentApiConfig.autoSync && !isManual &&
          (completedIndex === currentIndex.value || completedIndex === currentIndex.value + 1)) {
          showToast('正在自动同步到远程仓库...', 'info');
          triggerSync();
        }
      }
    } finally {
      // **重要：重置状态（必须在 finally 中确保执行）**
      console.debug(`[DEBUG] 重置生成状态: activeGenerationIndex从${activeGenerationIndex.value}变为null, isGenerating=false`);
      activeGenerationIndex.value = null;
      isGenerating.value = false;

      // **重要：在状态重置后检查下一个自动生成**
      checkAndTriggerAutoGeneration();
    }
  };

  // 发起API调用
  generateAINotes(questionToGenerate, targetIndex, handleCompletion, handleStreamChunk);
}

// 组件卸载时清理事件监听器
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyPress);

  // 清理定时器
  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }
});

// 检查下一个自动生成
function checkAndTriggerAutoGeneration() {
  // 使用配置服务获取当前API配置
  const currentApiConfig = configService.getApiConfig();

  // 如果自动生成未启用或测验已提交，直接返回
  if (!currentApiConfig.enabled || !currentApiConfig.autoGenerate || isQuizSubmitted.value) return;

  // 检查是否有下一个问题可以生成笔记
  const nextIndex = currentIndex.value + 1;
  if (nextIndex < localQuestions.value.length) {
    const nextQuestion = localQuestions.value[nextIndex];
    // 检查下一题是否存在、是否已有笔记、是否正在生成中
    if (nextQuestion &&
      (!nextQuestion.notes || nextQuestion.notes.trim() === '') &&
      activeGenerationIndex.value !== nextIndex) {
      // 给下一个问题自动生成笔记
      console.log(`准备为题目索引 ${nextIndex} 生成笔记`);
      showToast(`将为题目 ${nextIndex + 1} 生成笔记`, 'info');
      requestNoteGeneration(nextIndex, false);
    }
  }
}

// 清除答案
function clearAnswers() {
  // 清除localStorage中的答案
  const userAnswers = localStorage.getItem('userAnswers');
  if (userAnswers) {
    const answersData = JSON.parse(userAnswers);
    // 清除该章节题目的答案
    localQuestions.value.forEach(q => {
      if (answersData[q.id || '']) {
        delete answersData[q.id || ''];
      }
    });
    localStorage.setItem('userAnswers', JSON.stringify(answersData));
  }

  // 清除内存中的答案
  localQuestions.value.forEach(q => {
    q.userAnswer = null;
  });

  // 清除当前视图状态
  selectedAnswer.value = null;
  isQuizSubmitted.value = false;
  isReviewingWrong.value = false;
  wrongQuestionIds.value = [];
  showToast('已清除所有答案', 'success');
}

// --- Mermaid Instance ---
// 使用Marked实例进行Markdown渲染
const markedInstance = new Marked({
  gfm: true,
  breaks: true
});

// 预处理函数：在markdown渲染前替换文本
function processMarkdown(markdown: string): string {
  // 如果输入为空，直接返回
  if (!markdown) return '';

  // 处理数字列表：匹配以数字+点+空格开头的行（如"1. ", "2. "等）
  // 替换为HTML有序列表格式，保留原始数字
  let processedText = markdown;



  // 查找连续的数字列表项
  // 修正：直接使用正则，精确匹配以数字+点+空格开头的行，不包含HTML标签的行
  const listPattern = /^(\d+)\.\s+(.*?)$/gm;
  const htmlPattern = /^<\w+.*>.*$/;

  // 使用数组存储最终结果
  const resultArray = [];
  let currentListItems = [];

  // 按行处理
  const lines = processedText.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // 精确匹配数字列表项（排除以HTML标签开头的行）
    const isListItem = line.match(/^\d+\.\s+/) && !line.match(/^<\w+/);

    if (isListItem) {
      // 是列表项，添加到当前列表集合
      const match = line.match(/^(\d+)\.\s+(.*)/);
      if (match) {
        const [, number, content] = match;
        currentListItems.push({ number, content });
      }
    } else {
      // 不是列表项，先处理当前收集的列表项
      if (currentListItems.length > 0) {
        // 创建HTML列表
        const listHTML = '<ol>' +
          currentListItems.map(item =>
            `<li value="${item.number}">${item.content}</li>`
          ).join('') +
          '</ol>';
        resultArray.push(listHTML);
        currentListItems = []; // 清空列表项
      }

      // 然后添加当前非列表行
      resultArray.push(line);
    }
  }

  // 处理最后收集的列表项（如果有）
  if (currentListItems.length > 0) {
    const listHTML = '<ol>' +
      currentListItems.map(item =>
        `<li value="${item.number}">${item.content}</li>`
      ).join('') +
      '</ol>';
    resultArray.push(listHTML);
  }

  // 合并最终结果
  processedText = resultArray.join('\n');

  // 处理加粗语法：将**xxx**替换为<strong>xxx</strong>
  processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // 处理行末两个空格，替换为<br>标签
  processedText = processedText.replace(/  \n/g, '<br>\n');

  // 检测连续两个换行符并替换为HTML段落标签
  processedText = processedText.replace(/\n\n/g, '</p><p>');
  // 确保文本以段落标签开始和结束
  processedText = '<p>' + processedText + '</p>';

  return processedText;
}

// 添加预处理钩子
markedInstance.use({
  hooks: {
    preprocess: processMarkdown
  }
});

// --- 辅助方法 ---

// 新增：根据章节过滤题目
function filterQuestionsByChapter(chapterTitle: string) {
  // UPDATE: Use configService
  const fullQuizData = configService.getQuizData();
  if (!fullQuizData || !fullQuizData.chapters) {
    localQuestions.value = [];
    error.value = '无法加载题库数据';
    loading.value = false;
    return;
  }

  let filteredQuestions: Question[] = [];
  // REMOVE: const userAnswers: UserAnswersMap = getUserAnswers(); - Answers are part of quizData

  if (chapterTitle === 'all') {
    // 加载所有章节题目
    fullQuizData.chapters.forEach((chapter) => {
      if (!chapter.questions) return;

      // 复制并按 ID 排序当前章节的问题
      const sortedQuestions = [...chapter.questions].sort(compareQuestionIds);

      // 遍历排序后的问题，编号并添加到 filteredQuestions
      sortedQuestions.forEach((q, sortedIndex) => {
        // 使用题目自身的 ID 或生成一个唯一 ID
        const questionId = q.id || `q-${chapter.title}-${sortedIndex}`;
        // REMOVE: const userAnswerRecord = userAnswers[questionId]; - Get userAnswer from q itself
        filteredQuestions.push({
          ...q,
          id: questionId,
          title: q.title || '',
          options: q.options || [],
          answer: q.answer, // Keep original answer type
          explanation: q.explanation || '',
          notes: q.notes || '',
          question: q.question || q.title || '',
          chapterTitle: chapter.title,
          number: sortedIndex + 1, // 使用排序后的索引生成编号
          // userAnswer is already part of 'q' from configService state
          // REMOVE: userAnswer: userAnswerRecord ? userAnswerRecord.answer : null
        });
      });
    });
  } else {
    // 加载指定章节题目
    const targetChapter = fullQuizData.chapters.find(c => c.title === chapterTitle);
    if (targetChapter && targetChapter.questions) {
      // 复制并按 ID 排序当前章节的问题
      const sortedQuestions = [...targetChapter.questions].sort(compareQuestionIds);

      // 遍历排序后的问题，编号并映射到 filteredQuestions
      filteredQuestions = sortedQuestions.map((q, sortedIndex) => {
        const questionId = q.id || `q-${chapterTitle}-${sortedIndex}`;
        // REMOVE: const userAnswerRecord = userAnswers[questionId];
        return {
          ...q,
          id: questionId,
          title: q.title || '',
          options: q.options || [],
          answer: q.answer, // Keep original answer type
          explanation: q.explanation || '',
          notes: q.notes || '',
          question: q.question || q.title || '',
          chapterTitle: chapterTitle,
          number: sortedIndex + 1,
          // userAnswer is already part of 'q' from configService state
          // REMOVE: userAnswer: userAnswerRecord ? userAnswerRecord.answer : null
        };
      });
    }
  }

  // 根据配置决定是否打乱题目顺序
  if (quizSettings.value.randomMode) {
    // Fisher-Yates 洗牌算法
    for (let i = filteredQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filteredQuestions[i], filteredQuestions[j]] = [filteredQuestions[j], filteredQuestions[i]];
      // 更新打乱后的 number
      // filteredQuestions[i].number = i + 1;
      // filteredQuestions[j].number = j + 1;
    }
    // Re-number after shuffle
    filteredQuestions.forEach((q, index) => q.number = index + 1);
  }

  localQuestions.value = filteredQuestions;
  error.value = filteredQuestions.length === 0 ? '该章节下没有题目' : null;

  wrongQuestionIds.value = filteredQuestions
    .filter(q => q.userAnswer !== null && q.userAnswer !== undefined && !compareAnswers(q.userAnswer, q.answer))
    .map(q => String(q.id));

  configService.setQuizConfig({ chapterIndex: chapterTitle });
}
</script>
