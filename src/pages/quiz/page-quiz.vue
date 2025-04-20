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
        @touchmove="handleTouchMove" @touchend="handleTouchEnd">
        <transition name="question-fade-slide" mode="out-in" :css="uiSettings.animationEnabled">
          <div class="page-quiz__question-content-wrapper" v-if="currentQuestion" :key="currentQuestion.id">
            <div class="page-quiz__question-text" ref="questionTextRef">
              <span class="page-quiz__question-id">第{{ currentQuestion.number || (currentIndex + 1) }}题</span>
              <span v-html="formatQuestionTitle(currentQuestion.question)"></span>
            </div>

            <ul class="page-quiz__options-list" :class="{ 'page-quiz--submitted': isQuizSubmitted }">
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
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
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
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
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
          </div>
          <div v-else-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <p class="loading-text">题目加载中...</p>
          </div>
          <div v-else class="page-quiz__loading">
            {{ error || '没有题目数据或加载失败' }}
          </div>
        </transition>
      </div>
    </div>

    <!-- 模态框 -->
    <ModalQuestionOverview :show="showOverviewModal" :questions="localQuestions as any" :current-index="currentIndex"
      @close="showOverviewModal = false" @jump-to="jumpToQuestion" />
    <ModalStatistics :show="showModalStatistics" :stats="quizStats" @close="showModalStatistics = false"
      @view-wrong="viewWrongQuestions" @continue="showModalStatistics = false" @back-home="navigateBack" />
    <ModalSettings :show="showModalSettings" @close="showModalSettings = false" />
    <ModalQuestionEdit :show="showEditModal" :question="questionToEdit as any" @close="closeEditModal"
      @save="handleSaveQuestion" />
    <ModalQuizSync :show="showSyncConfigModal" @close="showSyncConfigModal = false" @save="handleSyncConfigSave"
      :current-quiz="currentQuizInfo" @sync-complete="handleSyncComplete" />
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
import '../../styles/quiz-medical.css'  // 添加医学专家模式的样式

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
const syncStatus = ref<'idle' | 'pending' | 'success' | 'error'>('idle'); // 更具体的类型
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
  selectedChapter.value = savedConfig.chapterIndex || 'all'; // 设置selectedChapter再过滤

  filterQuestionsByChapter(selectedChapter.value); // 基于正确的章节过滤

  if (localQuestions.value.length > 0) {
    nextTick(() => {
      loadQuestion(0); // 从所选章节/全部的第一个问题开始
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
    if (!isQuizSubmitted.value && localQuestions.value.length > 0) { // 仅当有问题时提交
      submitQuiz();
    }
    return;
  }

  currentIndex.value = index;
  selectedAnswer.value = currentQuestion.value?.userAnswer ?? null; // 加载已保存的答案
  isEditingNotes.value = false; // 更改问题时关闭编辑器

  await renderNotesForCurrentQuestion();

  // 将问题区域滚动到顶部
  if (questionAreaRef.value) {
    questionAreaRef.value.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 检查并触发下一个问题的自动生成
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
    question.userAnswer = selectedAnswer.value; // 首先更新本地视图

    // 使用configService更新持久状态和统计
    const updateSuccess = configService.updateQuestion(question.id, { userAnswer: selectedAnswer.value });

    if (updateSuccess) {
      configService.updateQuizStats({
        totalAnswered: 1, // 增加已回答计数
        correctCount: isCorrect ? 1 : 0, // 如果适用，增加正确计数
        wrongCount: isCorrect ? 0 : 1   // 如果适用，增加错误计数
      });

      // 根据正确性更新错题ID列表
      const questionIdStr = String(question.id);
      const wasWrongIndex = wrongQuestionIds.value.indexOf(questionIdStr);

      if (!isCorrect && wasWrongIndex === -1) {
        wrongQuestionIds.value.push(questionIdStr);
      } else if (isCorrect && wasWrongIndex !== -1) {
        wrongQuestionIds.value.splice(wasWrongIndex, 1);
      }
      configService.saveQuizState(); // 持久化包括统计在内的更改

    } else {
      console.error("Failed to save user answer via configService for question:", question.id);
      showToast("保存答案失败", "error");
      return; // 如果保存失败，停止进一步处理（如自动下一题）
    }
  }


  // 渲染笔记（如果设置了答后显示）
  if (quizSettings.value.showNotesAfterAnswer) {
    forceShowNotes.value = true; // 确保笔记可见
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
  // 保存本次测验统计快照
  localStorage.setItem('lastQuizStats', JSON.stringify({
    ...quizStats.value,
    timestamp: Date.now(),
    quizTitle: quizTitle.value
  }));
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
    isReviewingWrong.value = false; // 退出错题回顾模式（如果活动）

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
      configService.setQuizData(quizData); // 更新内部状态
      configService.saveQuizState(); // 保存已清除的答案和可能重置的统计
    }

    // 基于原始过滤（selectedChapter）重新加载问题
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

  // 筛选出错题
  const allQuestions = configService.getQuizData()?.chapters.flatMap(c => c.questions) || [];
  const wrongQs = allQuestions.filter(q => wrongQuestionIds.value.includes(String(q.id)));

  if (wrongQs.length > 0) {
    localQuestions.value = wrongQs.map(q => ({ ...q, userAnswer: null })); // 重置错题答案
    isQuizSubmitted.value = false; // 允许在错题模式下答题
    isReviewingWrong.value = true; // 标记为错题回顾模式
    currentIndex.value = 0;
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
        autoResizeTextarea(); // 调整聚焦后的高度
      }
    });
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

    isEditingNotes.value = false; // 退出编辑模式
    nextTick(renderNotesForCurrentQuestion); // 重新渲染保存的笔记
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
  const generating = isGeneratingCurrent.value && activeGenerationIndex.value === currentIndex.value; // 检查是否正在为当前题目生成笔记

  if (!noteContent && !generating) {
    renderedNotesHtml.value = '<p class="page-quiz__notes-placeholder">这道题目还没有笔记...</p>';
    return;
  }

  try {
    // 渲染markdown内容
    let htmlContent = '';
    if (noteContent) {
      htmlContent = mdInstance.render(noteContent);
    }

    // 如果正在生成则添加占位符
    if (generating && !htmlContent) {
      htmlContent = '<p class="page-quiz__notes-placeholder">思考中...</p>';
    } else if (!htmlContent) {
      htmlContent = '<p class="page-quiz__notes-placeholder">这道题目还没有笔记...</p>';
    }

    renderedNotesHtml.value = htmlContent;

    // 渲染HTML后处理Mermaid图表
    await nextTick(); // 等待DOM更新

    // **** START MODIFICATION ****
    // Skip Mermaid rendering if notes are currently being generated via stream
    if (!notesDisplayRef.value || (isGeneratingCurrent.value && activeGenerationIndex.value === currentIndex.value)) {
      console.log('[Mermaid] Skipping rendering during note generation.');
      return;
    }
    // **** END MODIFICATION ****

    try {
      await initMermaid(); // 确保mermaid已初始化

      // 处理pre>code块
      const mermaidCodeBlocks = notesDisplayRef.value.querySelectorAll('pre code.language-mermaid');
      mermaidCodeBlocks.forEach(block => {
        const preElement = block.closest('pre');
        // 避免重新处理已转换为div.mermaid的元素
        if (!preElement || preElement.classList.contains('mermaid-processed')) return;

        const code = block.textContent || '';
        if (!code.trim()) return;

        const mermaidDiv = document.createElement('div');
        mermaidDiv.className = 'mermaid';
        mermaidDiv.textContent = code;

        if (preElement.parentNode) {
          preElement.parentNode.replaceChild(mermaidDiv, preElement);
        }
        // 标记原始pre元素，避免重复替换
        preElement.classList.add('mermaid-processed');
      });

      // 查找所有指定用于mermaid渲染的元素
      const mermaidElementsToRender = notesDisplayRef.value.querySelectorAll<HTMLElement>('.mermaid');

      if (mermaidElementsToRender.length > 0) {
        const elementsArray = Array.from(mermaidElementsToRender);
        console.log(`[Mermaid] 尝试渲染 ${elementsArray.length} 个图表。`);
        try {
          // 让mermaid.run处理幂等渲染
          await mermaid.run({ nodes: elementsArray });
          console.log(`[Mermaid] 成功渲染或更新了 ${elementsArray.length} 个图表。`);
        } catch (renderError) {
          console.error('[Mermaid] 渲染错误:', renderError);
          // 在div内添加错误信息以提供用户反馈
          elementsArray.forEach(el => {
            // 避免在run多次失败时添加多个错误信息
            if (!el.querySelector('.mermaid-error-message')) {
              el.classList.add('mermaid-error');
              const errorMessage = document.createElement('div');
              errorMessage.className = 'mermaid-error-message';
              errorMessage.textContent = `图表渲染失败: ${renderError instanceof Error ? renderError.message : '未知错误'}`;
              el.appendChild(errorMessage);
            }
          });
        }
      }

    } catch (mermaidError) {
      console.error('Mermaid处理失败:', mermaidError);
    }

    // 如果正在生成笔记，则滚动到底部
    if (generating && notesDisplayRef.value) {
      notesDisplayRef.value.scrollTop = notesDisplayRef.value.scrollHeight;
    }

  } catch (error) {
    console.error('笔记渲染错误:', error);
    renderedNotesHtml.value = `<p class="page-quiz__notes-error">笔记内容解析失败: ${error instanceof Error ? error.message : '未知错误'}</p>`;
  }
}

/**
 * 在笔记编辑区插入Markdown标记
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

  // 基本占位符替换
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
      // 调整选择范围到标记内部（如果可能）
      if (key.includes('**') || key.includes('*')) {
        selectionOffset = key.indexOf(placeholders[key]);
      } else if (key.includes('```')) {
        selectionOffset = key.indexOf('\n') + 1; // 将光标放在第一个换行符后
      }
      break;
    }
  }


  // 插入文本
  textarea.value = text.substring(0, start) + insertedMarkup + text.substring(end);
  notesEditText.value = textarea.value; // 更新v-model绑定

  // 设置光标位置或选择范围
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
    textarea.style.height = 'auto'; // 重置高度以重新计算
    nextTick(() => { // 确保DOM更新后再测量scrollHeight
      if (textarea) { // 再次检查，因为它可能已消失
        const scrollHeight = textarea.scrollHeight;
        const minHeight = 80; // CSS中的最小高度示例
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
      const dataTimeout = 30000; // 30秒超时

      const heartbeatInterval = setInterval(() => {
        if (Date.now() - lastDataReceived > dataTimeout) {
          console.warn(`[WARN] 数据流接收超时，可能存在网络问题 (Index: ${generationTargetIndex})`);
          showToast('网络连接不稳定，笔记生成可能中断', 'warning');
          clearInterval(heartbeatInterval);
          reader.cancel('Timeout').catch(console.error);
          completionCallback(generatedNote, generationTargetIndex, '数据流接收超时');
        }
      }, 10000); // 每10秒检查一次


      try {

        while (true) {
          const { done, value } = await reader.read();
          lastDataReceived = Date.now(); // 更新接收数据的时间戳

          if (done) {
            console.log(`[LOG] 流读取完成 (done) for index ${generationTargetIndex}`);
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // 逐行处理
          let lineEndIndex;
          while ((lineEndIndex = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, lineEndIndex).trim();
            buffer = buffer.slice(lineEndIndex + 1);

            if (line.startsWith('data: ')) {
              const dataStr = line.substring(6);
              if (dataStr === '[DONE]') {
                console.log(`[LOG] 收到 [DONE] 信号，索引 ${generationTargetIndex}`);
                break;
              }
              try {
                const parsed = JSON.parse(dataStr);
                // --- 增加日志 ---
                console.log(`[DEBUG] Raw dataStr (Index ${generationTargetIndex}):`, dataStr);
                console.log(`[DEBUG] Parsed data (Index ${generationTargetIndex}):`, parsed);
                // --- Potential Issue Area ---
                const content = parsed.choices?.[0]?.delta?.content ||
                  parsed.choices?.[0]?.message?.content || // This might be for non-streamed messages
                  parsed.delta?.content || // Check if this path is used by DeepSeek R1
                  ''; // Default to empty string

                if (content) {
                  generatedNote += content;
                  streamCallback(content, generationTargetIndex); // 传递内容块和索引
                }
              } catch (e) {
                if (dataStr.trim()) { // 避免将空数据行记录为错误
                  console.error('[ERROR] 解析流式 JSON 出错:', e, '原始行:', line, `(Index: ${generationTargetIndex})`);
                }
              }
            }
          }
        }
      } catch (streamError) {
        // 处理流读取过程中的潜在错误（如网络问题）
        console.error(`[ERROR] 流读取过程中发生错误 (Index: ${generationTargetIndex}):`, streamError);
        // 触发完成回调，使用现有笔记内容和错误信息
        completionCallback(generatedNote, generationTargetIndex, `流处理错误: ${(streamError as Error).message}`);
        clearInterval(heartbeatInterval); // 清理定时器
        return; // 流失败时退出函数
      } finally {
        clearInterval(heartbeatInterval); // 确保定时器被清理
      }
      console.log(`[LOG] 流处理完成，索引 ${generationTargetIndex}. 最终笔记长度: ${generatedNote.length}`);
      completionCallback(generatedNote.trim(), generationTargetIndex); // 流成功结束后调用完成回调

    } else { // 处理非流式响应
      const data = await response.json();
      // 提取内容，基于常见的OpenAI/兼容结构
      generatedNote = data.choices?.[0]?.message?.content ||
        data.choices?.[0]?.text ||
        data.content?.[0]?.text ||
        '';

      console.log(`[LOG] 非流式响应笔记 (Index: ${generationTargetIndex}):`, generatedNote.substring(0, 100) + "...");
      completionCallback(generatedNote.trim(), generationTargetIndex);
    }

  } catch (error) {
    console.error(`[ERROR] 生成笔记失败，索引 ${generationTargetIndex}:`, error);
    // 确保即使在fetch/设置错误时也会调用完成回调
    completionCallback('', generationTargetIndex, `笔记生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 触发手动 AI 笔记生成
 */
function triggerAINotesGeneration() {
  if (!currentQuestion.value || isQuizSubmitted.value) return;
  forceShowNotes.value = true; // 立即显示笔记区域
  requestNoteGeneration(currentIndex.value, true); // 请求当前问题的笔记生成，手动触发
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

    // 使用configService推送题库数据
    const success = await configService.pushQuizToGithub(syncQuizName, githubConfig.forceSync);

    if (success) {
      syncStatus.value = 'success';
      showToast(`题库 "${syncQuizName}" 已成功同步到GitHub`, 'success');
      setTimeout(() => syncStatus.value = 'idle', 2000);
    } else {
      syncStatus.value = 'error';
    }
  } catch (err) {
    console.error('同步失败:', err);
    syncStatus.value = 'error';
    showToast(`同步失败: ${err instanceof Error ? err.message : '未知错误'}`, 'error');
  } finally {
    // 确保操作尝试后状态仍为pending时重置
    if (syncStatus.value === 'pending') {
      syncStatus.value = 'idle';
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
function handleSyncConfigSave(config: Partial<GithubConfig>) {
  console.log('同步配置已保存:', config);
  configService.updateGithubConfig(config); // 让configService处理验证和保存
}

/**
 * 处理题库同步完成
 */
async function handleSyncComplete(result: { action: string; quiz: string; overrideLocal?: boolean; success: boolean }) {
  console.log('同步完成', result);

  // 使用configService处理同步结果
  const syncResult = await configService.handleQuizSyncComplete(result);

  // 如果同步成功且当前有题库加载
  if (syncResult && syncResult.data && configService.getQuizData()) {
    // 如果同步的题库与当前加载的题库同名且覆盖了本地题库
    const lastLoaded = configService.getLastLoadedQuiz();
    if (lastLoaded && lastLoaded.name === syncResult.quizName && syncResult.wasOverridden) {
      // 重新加载题库数据
      configService.setQuizData(syncResult.data);

      // 刷新题目列表
      initializeQuiz();

      showToast(`已更新当前题库: ${syncResult.quizName}`, 'success');
    }
  }
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
  // 直接从服务返回活动配置
  return configService.getApiConfig();
}


// --- Modal Methods ---

/**
 * 应用来自设置模态框的设置 - 这个方法现在不再需要了
 */
/*
function applySettingsFromModal(settings: { uiSettings: UiSettings, quizSettings: QuizSettings, debugEnabled: boolean }) {
  // 使用特定的更新方法以提高清晰度和潜在的精细通知
  configService.updateUiSettings(settings.uiSettings, false);
  configService.updateQuizSettings(settings.quizSettings, false);
  configService.setDebugEnabled(settings.debugEnabled, false);

  showToast('通用设置已保存', 'success'); // 所有设置应用后显示toast
  configService.saveQuizState(); // 如果设置可能影响状态，则保存状态
}
*/

/**
 * 打开当前问题的编辑器
 */
function openCurrentQuestionEditor() {
  if (!quizSettings.value.canEditQuestion || isQuizSubmitted.value || !currentQuestion.value) {
    showToast('当前状态无法编辑题目', 'warning');
    return;
  }
  // 深度克隆问题对象以进行编辑，避免直接修改原始对象
  questionToEdit.value = JSON.parse(JSON.stringify(currentQuestion.value));
  showEditModal.value = true;
}

/**
 * 关闭编辑题目模态框
 */
function closeEditModal() {
  showEditModal.value = false;
  questionToEdit.value = null; // 清除正在编辑的问题
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

  // 调用configService更新中央存储中的问题
  const success = configService.updateQuestion(questionId, updatedQuestionData);

  if (success) {
    // 更新本地列表中的问题以立即反馈UI
    const localIndex = localQuestions.value.findIndex(q => q.id === questionId);
    if (localIndex !== -1) {
      // 将更改合并到本地问题对象中
      localQuestions.value[localIndex] = { ...localQuestions.value[localIndex], ...updatedQuestionData };
      // 如果需要，确保响应性，但展开语法通常会处理这个问题
      // Vue.set(localQuestions.value, localIndex, { ... }); // Vue 2响应性处理
    }
    // 如果当前编辑的问题就是正在查看的问题，也更新currentQuestion计算属性
    if (currentQuestion.value && currentQuestion.value.id === questionId) {
      // 重新触发计算属性或手动更新相关字段（如有必要）
      // 如果localQuestions更新触发重新计算，这可能不是严格必需的
    }

    // 如果笔记内容可能已更改，重新渲染笔记
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
 * 获取选项的Key (如'A')
 * 处理可能已以字母开头的选项。
 */
function getOptionKey(optionText: string | unknown, index: number): string {
  if (typeof optionText === 'string') {
    // 匹配A.、A)、A:、A后跟空格，或仅在开头的A
    const keyMatch = optionText.match(/^([A-Z])([.:)]|\s+|$)/i);
    if (keyMatch) {
      return keyMatch[1].toUpperCase();
    }
  }
  // 如果未找到前缀或不是字符串，则默认基于索引生成键
  return String.fromCharCode(65 + index);
}


/**
 * 获取选项的内容 (移除可能的字母前缀)
 */
function getOptionContent(optionText: string | unknown): string {
  if (typeof optionText !== 'string') return String(optionText); // 如果不是字符串则转换为字符串

  // 匹配A.、A)、A:、A后跟空格
  const keyMatch = optionText.match(/^([A-Z])([.:)]|\s+)/i);
  if (keyMatch) {
    // 返回前缀后的部分，已修整
    return formatQuestionText(optionText.substring(keyMatch[0].length).trim());
  }
  // 如果没有前缀，返回格式化的原始文本
  return formatQuestionText(optionText);
}


/**
 * 获取选项的CSS类
 */
function getOptionClass(optionKey: string): string {
  const question = currentQuestion.value;
  if (!question) return '';

  const classes = ['page-quiz__option']; // 基本类
  const isSelected = selectedAnswer.value === optionKey;
  const isUserAnswer = question.userAnswer === optionKey;
  const isCorrect = isCorrectAnswerOption(question.answer, optionKey);
  const answered = isCurrentAnswered.value;
  const reviewMode = quizSettings.value.reviewMode;
  const showCorrect = quizSettings.value.showCorrectAnswerImmediately;
  const locked = isAnswerLocked.value;

  // 选择状态（仅当未锁定时）
  if (isSelected && !locked && !reviewMode) {
    classes.push('page-quiz__option--selected');
  }

  // 反馈状态（如果已回答或在复习模式中）
  if (answered || reviewMode) {
    if (isCorrect) {
      // 如果在复习模式中或设置为立即显示，则始终显示正确
      if (reviewMode || showCorrect) {
        classes.push('page-quiz__option--correct');
      }
      // 如果用户答案正确，也要突出显示（即使不立即显示）
      else if (isUserAnswer) {
        classes.push('page-quiz__option--correct');
      }
    } else if (isUserAnswer) { // 不正确的用户答案
      classes.push('page-quiz__option--incorrect');
    }
  }

  // 锁定状态
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
  if (!question) return 'page-quiz__option-number'; // 默认类

  const isCorrect = isCorrectAnswerOption(question.answer, optionKey);
  const isUserAnswer = question.userAnswer === optionKey;
  const answered = isCurrentAnswered.value;
  const reviewMode = quizSettings.value.reviewMode;
  const showCorrect = quizSettings.value.showCorrectAnswerImmediately;

  const classes = ['page-quiz__option-number']; // 基本类

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
  // 重用详细的检查逻辑
  return isCorrectAnswerOption(correctAnswer, selected);
}


// --- 键盘和滑动处理 ---
let touchStartX = 0;
let touchStartY = 0;
let isSwiping = false;

/**
 * 处理触摸开始事件
 */
function handleTouchStart(e: TouchEvent) {
  if (!quizSettings.value.swipeGestureEnabled) return;
  // 仅在主要触摸时记录起始点
  if (e.touches.length === 1) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping = false;
  }
}

/**
 * 处理触摸移动事件
 */
function handleTouchMove(e: TouchEvent) {
  if (!quizSettings.value.swipeGestureEnabled || touchStartX === 0) return;

  if (e.touches.length === 1) {
    const touchMoveX = e.touches[0].clientX;
    const touchMoveY = e.touches[0].clientY;
    const diffX = touchStartX - touchMoveX;
    const diffY = touchStartY - touchMoveY;

    // 判断是水平滑动还是垂直滑动
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      // 水平滑动，防止页面滚动
      e.preventDefault();
      isSwiping = true;
    }
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
    if (isSwiping || (Math.abs(diffX) > horizontalThreshold && Math.abs(diffY) < verticalThreshold)) {
      if (diffX > 0) { // 向左滑动 -> 下一题
        if (canGoNext.value) {
          nextQuestion();
          e.preventDefault();
        }
      } else { // 向右滑动 -> 上一题
        if (canGoPrev.value) {
          previousQuestion();
          e.preventDefault();
        }
      }
    }
  }

  // 处理后重置起始坐标与状态
  touchStartX = 0;
  touchStartY = 0;
  isSwiping = false;
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
  configService.toggleDarkMode(); // 处理状态和保存
  // isDarkMode计算属性将自动更新

  // 在DOM更新后重新初始化或更新Mermaid主题
  nextTick(() => {
    initMermaid(); // 重新初始化以应用新主题
    renderNotesForCurrentQuestion(); // 使用可能的新主题重新渲染笔记
  });
}

/**
 * 比较题目 ID (优先数字，然后字符串)
 */
function compareQuestionIds(a: Question, b: Question): number {
  const idA = String(a.id || '');
  const idB = String(b.id || '');

  // 尝试提取开头的数字作为主要排序依据
  const numA = parseInt(idA.match(/^\d+/)?.[0] || '', 10);
  const numB = parseInt(idB.match(/^\d+/)?.[0] || '', 10);

  // 如果两者都有有效的前导数字且它们不同，则按数字排序
  if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
    return numA - numB;
  }

  // 否则，回退到区域感知的字符串比较以保证健壮性
  return idA.localeCompare(idB);
}


/**
 * 格式化题目或选项文本 (移除特定前缀，如 A、)
 */
function formatQuestionText(text: string | undefined): string {
  if (!text) return '';
  // 移除潜在的前缀，如 "A.", "B)", "C:" 或 "D "
  return text.replace(/^([A-Z])([.:)]|\s)\s*/, '').trim();
}

/**
 * 格式化问题标题 (移除开头的题号，如 "1. ")
 */
function formatQuestionTitle(title: string | undefined): string {
  if (!title) return '';
  // 移除开头的数字、句点和空格
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
      // 合并所有章节的问题
      fullQuizData.chapters.forEach((chapter) => {
        if (chapter.questions && Array.isArray(chapter.questions)) {
          const chapterQuestions = chapter.questions.map(q => ({
            ...q,
            chapterTitle: chapter.title // 确保设置了chapterTitle
          }));
          filteredQuestions.push(...chapterQuestions);
        }
      });
    } else {
      // 查找特定章节
      const targetChapter = fullQuizData.chapters.find(c => c.title === chapterTitle);
      if (targetChapter && targetChapter.questions && Array.isArray(targetChapter.questions)) {
        filteredQuestions = targetChapter.questions.map(q => ({
          ...q,
          chapterTitle: targetChapter.title // 确保设置了chapterTitle
        }));
      }
    }

    // 过滤后处理

    // 1. 确保唯一ID和基本结构
    const questionNumber = 1;
    filteredQuestions = filteredQuestions.map((q, index) => ({
      ...q,
      id: q.id || `gen_${chapterTitle}_${index}`, // 如果缺少ID则生成
      title: q.title || q.question || '', // 确保存在标题
      question: q.question || q.title || '', // 确保存在问题
      options: q.options || [],
    }));


    // 2. 排序问题（在编号和洗牌之前始终排序）
    filteredQuestions.sort(compareQuestionIds);


    // 3. 如果启用，应用随机模式洗牌
    if (quizSettings.value.randomMode) {
      // Fisher-Yates洗牌算法
      for (let i = filteredQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filteredQuestions[i], filteredQuestions[j]] = [filteredQuestions[j], filteredQuestions[i]];
      }
    }

    // 4. 排序/洗牌后分配顺序编号
    filteredQuestions.forEach((q, index) => {
      q.number = index + 1;
    });


    localQuestions.value = filteredQuestions;
    error.value = filteredQuestions.length === 0 ? `章节 "${chapterTitle}" 下没有题目` : null;

    // 根据新过滤的列表更新wrongQuestionIds
    wrongQuestionIds.value = filteredQuestions
      .filter(q => q.userAnswer !== null && q.userAnswer !== undefined && !compareAnswers(q.userAnswer, q.answer))
      .map(q => String(q.id)); // 确保ID是字符串

    // 保存选定的章节到配置
    configService.setQuizConfig({ chapterIndex: chapterTitle });

    console.log(`Filtered ${filteredQuestions.length} questions. Random mode: ${quizSettings.value.randomMode}`);

  } catch (err) {
    console.error("Error during question filtering:", err);
    error.value = "过滤题目时发生错误";
    localQuestions.value = []; // 错误时清除问题
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

  // 如果自动生成笔记已存在则跳过
  if (!isManual && questionToGenerate.notes && questionToGenerate.notes.trim() !== '') {
    console.log(`[LOG] 跳过自动生成 (Index: ${targetIndex}): 已有笔记`);
    checkAndTriggerAutoGeneration(); // 检查*下一个*问题
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

  // --- 开始生成 ---
  activeGenerationIndex.value = targetIndex;
  isGenerating.value = true;
  forceShowNotes.value = true; // 确保笔记区域可见
  showToast(`开始为题目 ${targetIndex + 1} 生成笔记...`, 'info');

  // Clear existing notes *first* for the target question
  if (questionToGenerate) {
    questionToGenerate.notes = '';
  }

  // If the generation target is the currently viewed question,
  // immediately render the cleared state and loading indicator.
  if (currentIndex.value === targetIndex) {
    // Render the cleared state BEFORE the API call
    renderNotesForCurrentQuestion();
  }

  // --- 设置回调 ---
  let lastRenderTime = 0;
  const baseThrottleDelay = 150; // 稍微增加的延迟
  const throttleDelay = baseThrottleDelay;
  const pendingChunks = '';
  let renderTimeoutId: number | null = null;
  let autoSaveTimeoutId: number | null = null;

  // Auto-save function (throttled)
  const autoSaveNotes = () => {
    if (autoSaveTimeoutId) clearTimeout(autoSaveTimeoutId); // 清除之前的超时
    autoSaveTimeoutId = window.setTimeout(() => {
      if (activeGenerationIndex.value === targetIndex && questionToGenerate.id && questionToGenerate.notes) {
        console.log(`[LOG] Auto-saving notes for index ${targetIndex}`);
        configService.saveNoteToQuestion(questionToGenerate.id, questionToGenerate.notes);
      }
    }, 2000); // 在生成过程中每2秒无活动保存一次
  };

  // Stream chunk handler
  const handleStreamChunk: StreamCallback = (chunk, streamTargetIndex) => {
    if (streamTargetIndex !== targetIndex) return; // 忽略错误索引的块

    questionToGenerate.notes = (questionToGenerate.notes || '') + chunk;
    autoSaveNotes(); // 触发新块的自动保存

    // **** START MODIFICATION: Simplify throttling and update logic ****
    // Update UI for the currently viewed question with throttling
    if (currentIndex.value === streamTargetIndex) {
      const now = Date.now();
      const fixedThrottleDelay = 250; // Use a fixed throttle delay (e.g., 250ms)

      if (!renderTimeoutId) {
        // If no timeout is pending, schedule one
        renderTimeoutId = window.setTimeout(() => {
          if (activeGenerationIndex.value === streamTargetIndex && currentIndex.value === streamTargetIndex) {
            // console.debug(`[DEBUG] Executing Throttled Render (Stream)`);
            renderNotesForCurrentQuestion(); // Render Markdown updates (Mermaid skipped inside)
            lastRenderTime = Date.now();
          }
          renderTimeoutId = null;
        }, fixedThrottleDelay);
      } else if (now - lastRenderTime > fixedThrottleDelay * 4) {
        // Force render if it hasn't updated in a while (e.g., 4x delay)
        clearTimeout(renderTimeoutId);
        renderTimeoutId = null;
        if (activeGenerationIndex.value === streamTargetIndex && currentIndex.value === streamTargetIndex) {
          renderNotesForCurrentQuestion();
          lastRenderTime = now;
        }
      }
    }
    // **** END MODIFICATION ****
  };

  // Completion handler
  const handleCompletion: CompletionCallback = (finalNote, completedIndex, error) => {
    console.log(`[LOG] 生成完成: Index=${completedIndex}, Expected=${targetIndex}, Error=${error || 'None'}, Final Length=${finalNote?.length}`);

    if (renderTimeoutId) clearTimeout(renderTimeoutId);
    if (autoSaveTimeoutId) clearTimeout(autoSaveTimeoutId);

    if (activeGenerationIndex.value !== completedIndex) {
      console.warn(`[WARN] 忽略过时的完成回调 (Completed: ${completedIndex}, Active: ${activeGenerationIndex.value})`);
      return;
    }

    try {
      questionToGenerate.notes = finalNote; // Update local object with final note
      if (questionToGenerate.id) {
        console.log(`[LOG] 最终保存索引 ${completedIndex} 的笔记`);
        configService.saveNoteToQuestion(questionToGenerate.id, finalNote);
        configService.saveQuizState(); // Ensure overall state is persisted
      } else {
        console.error(`[ERROR] 无法为索引 ${completedIndex} 执行最终保存，缺少问题ID`);
      }

      // **** START MODIFICATION: Final render after completion ****
      // Reset generation state *before* final render
      console.log(`[LOG] 重置生成状态: activeGenerationIndex from ${activeGenerationIndex.value} to null`);
      const previousActiveIndex = activeGenerationIndex.value;
      activeGenerationIndex.value = null;
      isGenerating.value = false;

      // If the completed question is the currently viewed question, render the final note *including* Mermaid.
      if (currentIndex.value === completedIndex) {
        console.log(`[LOG] 为当前查看的索引 ${completedIndex} 渲染最终笔记 (包含Mermaid)`);
        nextTick(renderNotesForCurrentQuestion); // Now Mermaid will be rendered
      }
      // **** END MODIFICATION ****

      // 显示适当的提示消息
      if (error) {
        showToast(`题目 ${completedIndex + 1} 笔记生成失败: ${error}`, 'error');
      } else {
        showToast(`题目 ${completedIndex + 1} 笔记生成完成`, 'success');
      }

      // 如果启用自动同步且生成成功，则触发同步
      if (!error && apiConfig.value.autoSync && !isManual) {
        showToast('正在自动同步到远程仓库...', 'info');
        triggerSync();
      }

    } catch (completionError) {
      console.error(`[ERROR] 处理索引 ${completedIndex} 的完成回调时出错:`, completionError);
      showToast('处理笔记生成结果时出错', 'error');
    } finally {
      // Reset state (already done before final render)
      // if (activeGenerationIndex.value === completedIndex) { // Ensure state reset only if it was the active one
      //   console.log(`[LOG] 重置生成状态 (finally block): activeGenerationIndex from ${activeGenerationIndex.value} to null`);
      //   activeGenerationIndex.value = null;
      //   isGenerating.value = false;
      // }

      // --- 关键: 在重置状态后检查下一个自动生成 --- (moved from inside try)
      console.log("[LOG] 完成处理结束，检查下一个自动生成。");
      checkAndTriggerAutoGeneration();
    }
  };

  // --- 发起API调用 ---
  generateAINotes(questionToGenerate, targetIndex, handleCompletion, handleStreamChunk);
}


/**
 * 检查并触发下一个问题的自动笔记生成
 */
function checkAndTriggerAutoGeneration() {
  console.log("[LOG] 自动生成检查被调用。");
  if (!apiConfig.value.enabled || !apiConfig.value.autoGenerate || isQuizSubmitted.value || isGenerating.value || activeGenerationIndex.value !== null) {
    console.log(`[LOG] 自动生成检查跳过: 启用=${apiConfig.value.enabled}, 自动生成=${apiConfig.value.autoGenerate}, 已提交=${isQuizSubmitted.value}, 生成中=${isGenerating.value}, 活动索引=${activeGenerationIndex.value}`);
    return;
  }

  const nextIndex = currentIndex.value + 1;
  console.log(`[LOG] 检查下一索引的自动生成: ${nextIndex}`);

  if (nextIndex < localQuestions.value.length) {
    const nextQuestion = localQuestions.value[nextIndex];
    // 检查下一个问题是否存在且没有笔记
    if (nextQuestion && (!nextQuestion.notes || nextQuestion.notes.trim() === '')) {
      console.log(`[LOG] 触发索引 ${nextIndex} 的自动生成`);
      // showToast(`将为下一题 (${nextIndex + 1}) 自动生成笔记`, 'info');
      requestNoteGeneration(nextIndex, false); // false表示自动触发
    } else {
      console.log(`[LOG] 跳过索引 ${nextIndex} 的自动生成: 问题已有笔记或不存在。`);
      // 如果跳过了下一个，我们是否应该检查index+2？可能不需要，保持简单
    }
  } else {
    console.log("[LOG] 没有更多问题可自动生成。");
  }
}


// --- 生命周期钩子 ---
onMounted(() => {
  initializeQuiz(); // 加载数据，设置监听器等
  window.addEventListener('resize', autoResizeTextarea); // 调整文本区的大小
});

onUnmounted(() => {
  removeKeyboardListeners(); // 清理全局监听器
  window.removeEventListener('resize', autoResizeTextarea);
  // 清理定时器
  if (toastTimer) clearTimeout(toastTimer);
});

// --- 监听器 ---
watch(selectedChapter, (newChapter, oldChapter) => {
  if (newChapter !== oldChapter) {
    console.log(`章节切换到: ${newChapter}`);
    currentIndex.value = 0; // 重置索引
    selectedAnswer.value = null;
    isQuizSubmitted.value = false;
    isReviewingWrong.value = false; // 退出错题复习模式
    filterQuestionsByChapter(newChapter); // 首先过滤问题
    if (localQuestions.value.length > 0) {
      loadQuestion(0); // 然后加载新集合的第一个问题
    } else {
      // 处理新章节没有问题的情况
      renderedNotesHtml.value = ''; // 清除笔记显示
      error.value = `章节 "${newChapter}" 下没有题目`;
    }
  }
});

// 监听笔记文本变化以调整文本区大小
watch(notesEditText, () => {
  if (isEditingNotes.value) {
    autoResizeTextarea();
  }
});

// 监听暗黑模式变化以重新初始化Mermaid
watch(isDarkMode, () => {
  nextTick(() => {
    initMermaid();
    renderNotesForCurrentQuestion(); // 使用可能的新主题重新渲染笔记
  });
});

</script>
