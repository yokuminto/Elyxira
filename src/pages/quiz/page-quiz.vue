<template>
  <div class="page-quiz" :style="{ '--font-family': config.fontFamily || 'sans-serif' }">
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
          <button class="page-quiz__mode-button edit-button" v-if="config.canEditQuestion"
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
          <div class="page-quiz__question-text" ref="questionTextRef" :class="{ 'slide-up': config.animationEnabled }">
            <span class="page-quiz__question-id">第{{ currentQuestion.id || (currentIndex + 1) }}题</span>
            <span v-html="currentQuestion.question"></span>
          </div>

          <ul class="page-quiz__options-list"
            :class="[{ 'page-quiz--submitted': isQuizSubmitted }, { 'fade-in': config.animationEnabled }]">
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
              <button class="page-quiz__button page-quiz__submit-button" @click="submitAnswer"
                :disabled="!canSubmitAnswer">
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
              <h3 class="page-quiz__notes-title">笔记</h3>
              <div class="page-quiz__notes-actions">
                <button v-if="config.canSyncNotes" class="page-quiz__button page-quiz__button--icon sync-status"
                  :class="syncStatusClass" :title="syncStatusTitle" @click="triggerSync"
                  :disabled="syncStatus === 'pending'">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="feather feather-refresh-cw">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                </button>
                <button @click="openSyncConfigModal"
                  class="page-quiz__button page-quiz__button--secondary page-quiz__button--icon" title="远程仓库配置">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="feather feather-github">
                    <path
                      d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22">
                    </path>
                  </svg>
                </button>
                <button @click="toggleNotesEditor" :disabled="isQuizSubmitted"
                  class="page-quiz__button page-quiz__button--secondary page-quiz__button--icon"
                  :title="isEditingNotes ? '取消编辑' : '编辑笔记'">
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
                <button @click="triggerAINotesGeneration" :disabled="isGeneratingNote || isQuizSubmitted"
                  class="page-quiz__button page-quiz__button--primary page-quiz__ai-button" title="AI生成笔记">
                  <span v-if="isGeneratingNote" class="loading-spinner"></span>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="feather feather-zap">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                </button>
                <button @click="showApiConfigModal = true"
                  class="page-quiz__button page-quiz__button--secondary page-quiz__button--icon" title="AI设置">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path
                      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z">
                    </path>
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
    <ModalQuestionOverview :show="showOverviewModal" :questions="localQuestions" :current-index="currentIndex"
      @close="showOverviewModal = false" @jump-to="jumpToQuestion" />
    <ModalStatistics :show="showModalStatistics" :stats="quizStats" @close="showModalStatistics = false"
      @view-wrong="viewWrongQuestions" @continue="showModalStatistics = false" @back-home="navigateBack" />
    <ModalSettings :show="showModalSettings" :current-settings="configAsGeneralSettings"
      @close="showModalSettings = false" @save="applySettings" />
    <ModalQuestionEdit :show="showEditModal" :question="questionToEdit"
      @close="showEditModal = false; questionToEdit = null" @save="handleSaveQuestion" />
    <ModalQuizSync :show="showSyncConfigModal" @close="showSyncConfigModal = false" @save="handleSyncConfigSave"
      :current-quiz="currentQuizInfo" />
    <ModalApiConfig :show="showApiConfigModal" @close="showApiConfigModal = false" @save="handleApiConfigSave"
      :current-config="getCompleteApiConfig()" />

  </div>
</template>

// --- SCRIPT SETUP ---
<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { marked } from 'marked';
import mermaid from 'mermaid';
import { QuizStore } from '@/stores/store-quiz';
import { QuizMode } from '@/pages/library/types'; // 移除未使用的 QuizSourceType
import type { QuizData as StoreQuizData, Chapter as StoreChapter } from '@/pages/library/types'; // 导入 Store 的类型
import './page-quiz.css';
import '../../styles/variables.css';

// 引入子组件
import ModalQuestionEdit from '@/modals/modal-question-edit.vue';
import ModalQuestionOverview from '@/modals/modal-question-overview.vue';
import ModalStatistics from '@/modals/modal-statistics.vue';
import ModalSettings from '@/modals/modal-settings.vue';
import ModalQuizSync from '@/modals/modal-quiz-sync.vue';
import ModalApiConfig from '@/modals/modal-api-config.vue';
import type { GeneralSettings } from '@/modals/modal-settings.vue'; // 移除未使用的 QuizSettings

// 类型定义
interface Question {
  id: number | string;
  question: string;
  options: string[];
  answer: string;
  notes?: string;
  userAnswer?: string | null;
  chapterTitle?: string;
  explanation?: string;
}

// 添加实际JSON数据格式的接口定义
interface RawQuestionData {
  id?: number | string;
  question?: string;
  title?: string;
  options?: string[];
  answer?: string | number;
  notes?: string;
  explanation?: string;
  userAnswer?: string | null;
  previousAnswer?: string;
  number?: number;
}

interface ApiConfig {
  enabled: boolean;
  autoGenerate?: boolean;
  streamOutput?: boolean;
}

interface QuizConfig {
  autoSubmit?: boolean;
  autoNext?: boolean;
  allowSkip?: boolean;
  showNotesAfterAnswer?: boolean;
  lockAnswerAfterWrong?: boolean; // 已废弃，保留向后兼容
  lockAnswerAfterSubmit?: boolean;
  showCorrectAnswerImmediately?: boolean;
  showProgress?: boolean;
  swipeGestureEnabled?: boolean;
  randomMode?: boolean;
  reviewMode?: boolean;
  canEditQuestion?: boolean;
  canSyncNotes?: boolean;
  viewWrongAfterAll?: boolean; // 答题完成后查看错题
  apiConfig?: ApiConfig;
  fontFamily?: string;
  animationEnabled?: boolean;
}

interface QuizStats {
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  wrongQuestionIds: string[];
}

type StreamCallback = (chunk: string) => void;
type CompletionCallback = (finalNote: string, error?: string) => void;

// 路由
const router = useRouter();

// 响应式状态
const loading = ref(true);
const error = ref<string | null>(null);
const localQuestions = ref<Question[]>([]);
const currentIndex = ref(0);
const selectedAnswer = ref<string | null>(null);
const isQuizSubmitted = ref(false);
const wrongQuestionIds = ref<string[]>([]);
const isReviewingWrong = ref(false);

// 组件配置状态
const config = reactive<QuizConfig>({
  autoSubmit: false,
  autoNext: true,
  allowSkip: true,
  showNotesAfterAnswer: true,
  lockAnswerAfterSubmit: false,
  showCorrectAnswerImmediately: false,
  showProgress: true,
  swipeGestureEnabled: true,
  randomMode: false,
  reviewMode: false,
  canEditQuestion: true,
  canSyncNotes: true,
  apiConfig: { enabled: false, autoGenerate: false, streamOutput: true },
  fontFamily: 'sans-serif',
  animationEnabled: true,
});

// 笔记状态
const isEditingNotes = ref(false);
const isGeneratingNote = ref(false);
const notesEditText = ref('');
const renderedNotesHtml = ref('');
const syncStatus = ref('idle');

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
const questionAreaRef = ref<HTMLElement | null>(null);
const notesDisplayRef = ref<HTMLElement | null>(null);
const notesTextareaRef = ref<HTMLTextAreaElement | null>(null);
const questionTextRef = ref<HTMLElement | null>(null);

// 主题状态
const isDarkMode = ref(document.body.classList.contains('dark-theme'));

// 章节选择相关变量
const selectedChapter = ref('all');
const chapters = ref<string[]>([]);

// 题库数据
interface Chapter {
  title?: string;
  questions?: Question[];
}

interface QuizData {
  chapters?: Chapter[];
}

const quizData = ref<QuizData | null>(null);

// --- 计算属性 ---
const quizTitle = computed(() => {
  const quizData = QuizStore.state.quizData;
  if (!quizData) return '测验';
  return quizData.title || QuizStore.state.lastLoaded.name || '测验';
});

// 当前显示的问题对象
const currentQuestion = computed<Question | null>(() => {
  if (currentIndex.value >= 0 && currentIndex.value < localQuestions.value.length) {
    return localQuestions.value[currentIndex.value];
  }
  return null;
});

// 当前问题是否已回答
const isCurrentAnswered = computed(() => {
  return currentQuestion.value?.userAnswer !== null && currentQuestion.value?.userAnswer !== undefined;
});

// 是否可以提交答案
const canSubmitAnswer = computed(() => {
  // 需要选择了答案，且如果已经回答过则需要没有锁定答案
  return selectedAnswer.value !== null &&
    !isQuizSubmitted.value &&
    !config.reviewMode &&
    (!isCurrentAnswered.value || !config.lockAnswerAfterSubmit);
});

// 如果选错且配置了锁定，则锁定
const isAnswerLocked = computed(() => {
  return isCurrentAnswered.value &&
    (config.lockAnswerAfterSubmit ||
      (config.lockAnswerAfterWrong && currentQuestion.value?.userAnswer !== currentQuestion.value?.answer));
});

// 是否可以进入下一题
const canGoNext = computed(() => {
  return !isQuizSubmitted.value &&
    (currentIndex.value < totalQuestions.value - 1 || (isCurrentAnswered.value || config.reviewMode || config.allowSkip));
});

// 是否可以返回上一题
const canGoPrev = computed(() => {
  return currentIndex.value > 0 && !isQuizSubmitted.value;
});

// 问题总数
const totalQuestions = computed(() => localQuestions.value.length);

// 已回答问题数量
const answeredCount = computed(() => {
  return localQuestions.value.filter(q => q.userAnswer !== null && q.userAnswer !== undefined).length;
});

// 正确回答数量
const correctCount = computed(() => {
  return localQuestions.value.filter(q => q.userAnswer !== null && q.userAnswer !== undefined && q.userAnswer === q.answer).length;
});

// 进度百分比
const progressPercent = computed(() => {
  return totalQuestions.value > 0 ? Math.round((answeredCount.value / totalQuestions.value) * 100) : 0;
});

// 正确率百分比
const accuracyPercent = computed(() => {
  if (answeredCount.value === 0) return 0;
  return Math.round((correctCount.value / answeredCount.value) * 100);
});

// 测验统计数据
const quizStats = computed<QuizStats>(() => ({
  totalQuestions: totalQuestions.value,
  answeredCount: answeredCount.value,
  correctCount: correctCount.value,
  wrongQuestionIds: wrongQuestionIds.value.map(String)
}));

// 笔记是否应该可见
const notesVisible = computed(() => {
  if (!currentQuestion.value) return false;
  return forceShowNotes.value || !config.showNotesAfterAnswer || config.reviewMode || isCurrentAnswered.value;
});

// 同步按钮状态对应的Class
const syncStatusClass = computed(() => {
  if (syncStatus.value === 'idle') return '';
  return `sync-status--${syncStatus.value}`;
});

// 同步按钮状态对应的Title
const syncStatusTitle = computed(() => {
  const map: Record<string, string> = { idle: '同步笔记', pending: '同步中...', success: '笔记已同步', error: '同步失败 (点击重试)' };
  return map[syncStatus.value] || '同步笔记';
});

// 将当前配置转换为通用设置格式
const configAsGeneralSettings = computed<GeneralSettings>(() => {
  return {
    uiSettings: {
      darkMode: isDarkMode.value,
      themeColor: localStorage.getItem('themeColor') || 'default',
      customColor: localStorage.getItem('customColor') || '#4caf50',
      fontSize: parseInt(localStorage.getItem('fontSize') || '14'),
      fontFamily: config.fontFamily || 'sans-serif',
      animationEnabled: config.animationEnabled !== undefined ? config.animationEnabled : true
    },
    quizSettings: {
      autoSubmit: config.autoSubmit ?? false,
      autoNext: config.autoNext ?? true,
      allowSkip: config.allowSkip ?? true,
      showNotesAfterAnswer: config.showNotesAfterAnswer ?? true,
      lockAnswerAfterSubmit: config.lockAnswerAfterSubmit ?? false,
      showCorrectAnswerImmediately: config.showCorrectAnswerImmediately ?? true,
      showProgress: config.showProgress ?? true,
      swipeGestureEnabled: config.swipeGestureEnabled ?? true,
      randomMode: config.randomMode ?? false,
      reviewMode: config.reviewMode ?? false,
      canEditQuestion: config.canEditQuestion,
      canSyncNotes: config.canSyncNotes,
      viewWrongAfterAll: config.viewWrongAfterAll ?? true
    },
    debugEnabled: localStorage.getItem('debugEnabled') === 'true',
    apiConfig: config.apiConfig
  };
});

// --- 方法 ---
let toastTimer: number | null = null;
function showToast(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', duration = 3000) {
  // 清除上一个定时器，防止Toast堆叠
  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
    const existingToast = document.querySelector('.page-quiz .toast--show');
    if (existingToast) existingToast.remove();
  }

  toast.message = message;
  toast.type = type;
  toast.show = true;

  // 设置定时器隐藏Toast
  toastTimer = setTimeout(() => {
    toast.show = false;
    toastTimer = null;
  }, duration);
}

// 返回上级页面
function navigateBack() {
  router.push('/library');
}

// 初始化
function initializeQuiz() {
  console.log("初始化测验界面...");
  loading.value = true;
  isQuizSubmitted.value = false;
  isReviewingWrong.value = false;
  wrongQuestionIds.value = [];
  error.value = null;

  // 初始化 Mermaid 图表库
  initMermaid();
  // 设置键盘监听
  setupKeyboardListeners();

  // 加载题库数据
  loadQuizData(); // 加载题库数据，内部会调用prepareQuestions

  // 准备题目数据
  prepareQuizData();

  // 加载保存的笔记
  loadNotesFromLocalStorage();

  // 加载第一道题目
  loadQuestion(0);

  console.log("测验界面初始化完成");
}

// 加载指定索引的问题
function loadQuestion(index: number) {
  if (index < 0 || index >= localQuestions.value.length) {
    console.warn("无效的问题索引:", index);
    if (!isQuizSubmitted.value) submitQuiz();
    return;
  }

  currentIndex.value = index;
  selectedAnswer.value = null; // 清除上一题的选择
  isEditingNotes.value = false; // 重置笔记编辑状态

  // 恢复当前问题的用户答案（如果存在）
  selectedAnswer.value = currentQuestion.value?.userAnswer ?? null;

  // 确保加载当前问题的笔记
  try {
    // 如果当前问题没有笔记，尝试从localStorage加载
    if (currentQuestion.value && (!currentQuestion.value.notes || currentQuestion.value.notes.trim() === '')) {
      const notesDataStr = localStorage.getItem('quizNotes');
      if (notesDataStr) {
        const notesData = JSON.parse(notesDataStr);
        if (currentQuestion.value.id && notesData[String(currentQuestion.value.id)]) {
          currentQuestion.value.notes = notesData[String(currentQuestion.value.id)];
        }
      }
    }
  } catch (error) {
    console.error('加载问题笔记失败:', error);
  }

  renderNotesForCurrentQuestion(); // 渲染当前题目的笔记

  // 平滑滚动到问题区域顶部
  if (questionAreaRef.value) {
    questionAreaRef.value.scrollTo({ top: 0, behavior: 'smooth' });
  }

  emitStateChange();

  // 检查是否需要预生成下一题笔记
  if (config.apiConfig?.enabled && config.apiConfig?.autoGenerate) {
    checkAndGenerateNextNote();
  }
}

// 处理选项点击
function handleOptionClick(key: string) {
  // 如果已提交测验、回顾模式或答案已锁定，则不允许选择
  if (isQuizSubmitted.value || config.reviewMode || isAnswerLocked.value) {
    // 如果已提交/回顾模式/已锁定，则不允许选择
    return;
  }

  // 如果之前已回答且不允许修改答案，则不进行任何操作
  if (isCurrentAnswered.value && config.lockAnswerAfterSubmit) {
    return;
  }

  selectedAnswer.value = key;

  // 如果已经回答过且现在选择了不同的答案，则需要重新设置问题状态
  if (isCurrentAnswered.value && currentQuestion.value && currentQuestion.value.userAnswer !== key) {
    // 更新用户答案
    currentQuestion.value.userAnswer = key;
    saveCurrentAnswerState(); // 保存当前答案状态
  }

  // 如果配置了自动提交且尚未回答
  if (config.autoSubmit && !isCurrentAnswered.value) {
    nextTick(() => {
      submitAnswer();
    });
  }
}

// 提交当前答案
function submitAnswer() {
  // 检查是否可以提交答案：有选择的答案 且 (尚未回答或已回答但允许修改)
  if (selectedAnswer.value === null || (isCurrentAnswered.value && config.lockAnswerAfterSubmit)) return;

  const question = currentQuestion.value;
  if (!question) return;

  const isCorrect = selectedAnswer.value === question.answer;

  // 如果已回答且选择的答案与原答案相同，无需再次提交
  if (isCurrentAnswered.value && question.userAnswer === selectedAnswer.value) return;

  // 更新本地问题的 userAnswer
  question.userAnswer = selectedAnswer.value;

  // 更新错题记录
  if (!isCorrect) {
    if (!wrongQuestionIds.value.includes(String(question.id))) {
      wrongQuestionIds.value.push(String(question.id));
    }
  } else {
    // 如果现在答对了，从错题记录中移除
    const index = wrongQuestionIds.value.indexOf(String(question.id));
    if (index !== -1) {
      wrongQuestionIds.value.splice(index, 1);
    }
  }

  saveCurrentAnswerState(); // 保存当前答案到 localStorage

  // 如果配置了自动下一题
  if (config.autoNext && currentIndex.value < totalQuestions.value - 1) {
    setTimeout(nextQuestion, 1000); // 延迟以便用户看到反馈
  }
}

// 显示上一题
function previousQuestion() {
  if (canGoPrev.value) {
    loadQuestion(currentIndex.value - 1);
  }
}

// 显示下一题
function nextQuestion() {
  if (currentIndex.value < totalQuestions.value - 1) {
    loadQuestion(currentIndex.value + 1);
  } else if (!isQuizSubmitted.value) {
    showToast('已经是最后一题了', 'info');
  }
}

// 跳转到指定题目
function jumpToQuestion(index: number) {
  if (index >= 0 && index < totalQuestions.value) {
    loadQuestion(index);
  }
}

// 交卷处理
function submitQuiz() {
  if (isQuizSubmitted.value) return;
  isQuizSubmitted.value = true;
  showModalStatistics.value = true; // 显示统计模态框

  // 保存测验结果到本地存储
  const stats = quizStats.value;
  localStorage.setItem('lastQuizStats', JSON.stringify({
    ...stats,
    timestamp: Date.now(),
    quizTitle: quizTitle.value
  }));
}

// 重做测验
function redoQuiz() {
  if (window.confirm('确定要重做本次测验吗？所有答题记录将被清空。')) {
    isQuizSubmitted.value = false;
    wrongQuestionIds.value = [];
    selectedAnswer.value = null;

    // 清除所有本地问题的 userAnswer
    localQuestions.value.forEach(q => q.userAnswer = null);

    // 清除localStorage中的答案
    const userAnswers = localStorage.getItem('userAnswers');
    if (userAnswers) {
      const answersData = JSON.parse(userAnswers);
      const currentQuizIds = localQuestions.value.map(q => q.id?.toString() || '');

      // 只清除当前测验中题目的答案
      currentQuizIds.forEach(id => {
        if (id && answersData[id]) {
          delete answersData[id];
        }
      });

      localStorage.setItem('userAnswers', JSON.stringify(answersData));
    }

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
    wrongQuestionIds.value = [];   // 清空当前错题记录
    currentIndex.value = 0;
    loadQuestion(0);
    showToast(`已切换到错题回顾 (${wrongQs.length}题)`, 'info');
  } else {
    showToast('没有找到错题详情', 'warning');
  }
}

// --- Notes Methods ---

// 切换笔记编辑状态
function toggleNotesEditor() {
  if (isQuizSubmitted.value) return;

  isEditingNotes.value = !isEditingNotes.value;
  if (isEditingNotes.value) {
    // 进入编辑模式，加载当前笔记内容
    notesEditText.value = currentQuestion.value?.notes || '';
    nextTick(() => {
      autoResizeTextarea();
      notesTextareaRef.value?.focus();
    });
  }
}

// 保存笔记
function saveNotes() {
  if (!currentQuestion.value || !isEditingNotes.value) return;

  const newNotes = notesEditText.value;
  if (currentQuestion.value.notes !== newNotes) {
    currentQuestion.value.notes = newNotes; // 更新本地数据
    renderNotesForCurrentQuestion(); // 更新显示
    showToast('笔记已保存', 'success');
    saveCurrentNotesState(); // 保存笔记到localStorage
  }
  isEditingNotes.value = false; // 保存后退出编辑模式
}

// 渲染当前问题的笔记 (Markdown + Mermaid)
async function renderNotesForCurrentQuestion() {
  if (!currentQuestion.value) {
    renderedNotesHtml.value = '<p class="page-quiz__notes-placeholder">请先加载题目</p>';
    return;
  }

  const noteContent = currentQuestion.value.notes || '';

  if (!noteContent) {
    renderedNotesHtml.value = '<p class="page-quiz__notes-placeholder">这道题目还没有笔记...</p>';
    return;
  }

  try {
    marked.setOptions({
      breaks: true,
      gfm: true
    });

    // 预处理笔记内容，处理一些特殊格式
    const processedContent = noteContent
      // 修复加粗文本问题
      .replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>')
      // 去除CSS变量引用，避免Mermaid解析错误
      .replace(/var\(--[^)]+\)/g, '');

    // 解析 Markdown
    renderedNotesHtml.value = marked.parse(processedContent) as string;

    // 在流式生成时添加光标动画
    if (isGeneratingNote.value) {
      renderedNotesHtml.value += '<span class="typing-cursor"></span>';
    }

    // 动态添加生成中的class
    nextTick(() => {
      if (notesDisplayRef.value) {
        if (isGeneratingNote.value) {
          notesDisplayRef.value.classList.add('generating');
        } else {
          notesDisplayRef.value.classList.remove('generating');
        }
      }
    });

    // 等待 DOM 更新后再处理 Mermaid
    await nextTick();

    if (notesDisplayRef.value) {
      try {
        // 确保 Mermaid 初始化
        await initMermaid();

        // 替换 language-mermaid 类元素为 mermaid 类元素
        const mermaidCodeBlocks = notesDisplayRef.value.querySelectorAll('pre code.language-mermaid');
        mermaidCodeBlocks.forEach(block => {
          try {
            const code = block.textContent || '';
            if (!code.trim()) return;

            const mermaidDiv = document.createElement('div');
            mermaidDiv.className = 'mermaid';
            mermaidDiv.textContent = code;

            // 查找父元素，通常是 pre 标签
            const preElement = block.closest('pre');
            if (preElement && preElement.parentNode) {
              preElement.parentNode.replaceChild(mermaidDiv, preElement);
            }
          } catch (e) {
            console.error('替换Mermaid代码块失败:', e);
          }
        });

        // 一次性初始化所有Mermaid图表
        mermaid.init(undefined, '.mermaid').catch(err => {
          console.error('Mermaid渲染错误:', err);
          // 处理渲染失败的情况 - 添加错误信息
          const notesDisplay = notesDisplayRef.value;
          if (notesDisplay) {
            const errorElements = notesDisplay.querySelectorAll('.mermaid:not(svg)');
            errorElements.forEach(el => {
              const errorNode = document.createElement('div');
              errorNode.className = 'page-quiz__notes-error';
              errorNode.innerHTML = `<p>Mermaid图表渲染失败</p>
                <details>
                  <summary>查看原始代码</summary>
                  <pre>${el.textContent}</pre>
                </details>`;
              el.parentNode?.replaceChild(errorNode, el);
            });
          }
        });
      } catch (mermaidError) {
        console.error('Mermaid处理失败:', mermaidError);
        // 不让Mermaid错误影响整个笔记渲染
        const notesDisplay = notesDisplayRef.value;
        if (notesDisplay) {
          const mermaidBlocks = notesDisplay.querySelectorAll('.mermaid:not(svg)');
          mermaidBlocks.forEach(block => {
            const errorNode = document.createElement('div');
            errorNode.className = 'page-quiz__notes-error';
            errorNode.innerHTML = `<p>Mermaid图表处理失败</p>
              <details>
                <summary>查看原始代码</summary>
                <pre>${block.textContent}</pre>
              </details>`;
            block.parentNode?.replaceChild(errorNode, block);
          });
        }
      }
    }

    // 如果是在生成笔记中，滚动到底部
    if (isGeneratingNote.value && notesDisplayRef.value) {
      nextTick(() => {
        if (notesDisplayRef.value) {
          // 平滑滚动到底部
          notesDisplayRef.value.scrollTop = notesDisplayRef.value.scrollHeight;

          // 聚焦到笔记区域，增强用户体验
          notesDisplayRef.value.focus();
        }
      });
    }
  } catch (error) {
    console.error('Markdown/Mermaid渲染失败:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    renderedNotesHtml.value = `<p class="page-quiz__notes-error">笔记渲染出错: ${errorMessage}</p>`;
  }
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

  // 简单的占位符替换
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
  notesEditText.value = textarea.value; // 更新 v-model 绑定
  // 设置光标位置
  textarea.focus();
  nextTick(() => {
    textarea.selectionStart = textarea.selectionEnd = start + insertedMarkup.length;
    autoResizeTextarea();
  });
}

// 自动调整 Textarea 高度
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

// 获取AI API配置
function getAIAPIConfig() {
  const savedConfig = localStorage.getItem('aiApiConfig');
  const defaultConfig = {
    apiUrl: '',
    apiKey: '',
    model: 'deepseek-r1-250120',
    systemPrompt: '你是一个医学专家助手，擅长解释医学概念和知识点，请为学生提供详细、准确的笔记。',
    temperature: 0.7,
    topP: 0.9
  };

  if (savedConfig) {
    try {
      return { ...defaultConfig, ...JSON.parse(savedConfig) };
    } catch (error) {
      console.error('解析API配置失败:', error);
      return defaultConfig;
    }
  }
  return defaultConfig;
}

// 实际调用AI API生成笔记
async function generateAINotes(question: Question | null, completionCallback: CompletionCallback, streamCallback?: StreamCallback) {
  if (!question) {
    completionCallback('', '无法获取问题信息');
    return;
  }

  const apiConfig = getAIAPIConfig();

  // 验证必要的API配置
  if (!apiConfig.apiUrl || !apiConfig.apiKey) {
    showToast('请先配置AI API设置', 'info');
    showApiConfigModal.value = true;
    completionCallback('', '请先在API配置中设置API地址和密钥');
    return;
  }

  try {
    // 构建请求数据
    const questionData = {
      question: question.question,
      options: question.options,
      answer: question.answer
    };

    const prompt = `请根据以下题目生成详细的学习笔记，包括重点知识、相关概念解释和记忆技巧：\n\n问题：${questionData.question}\n\n选项：${JSON.stringify(questionData.options)}\n\n正确答案：${questionData.answer}`;

    const requestData = {
      model: apiConfig.model,
      messages: [
        { role: "system", content: apiConfig.systemPrompt },
        { role: "user", content: prompt }
      ],
      stream: config.apiConfig?.streamOutput !== false,
      temperature: apiConfig.temperature,
      top_p: apiConfig.topP
    };

    const response = await fetch(apiConfig.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiConfig.apiKey}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    let generatedNote = '';

    if (requestData.stream) {
      // 处理流式输出
      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法读取响应流');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                const content = data.choices[0].delta.content;
                generatedNote += content;
                if (streamCallback) {
                  streamCallback(content);
                }
              }
            } catch (e) {
              console.error('解析流式响应出错:', e);
            }
          }
        }
      }
    } else {
      // 处理非流式输出
      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        generatedNote = data.choices[0].message.content;
      }
    }

    completionCallback(generatedNote);
  } catch (error) {
    completionCallback('', error instanceof Error ? error.message : '未知错误');
  }
}

// 触发 AI 笔记生成
function triggerAINotesGeneration() {
  if (!currentQuestion.value || isGeneratingNote.value || isQuizSubmitted.value) return;

  // 强制显示笔记区域
  forceShowNotes.value = true;

  isGeneratingNote.value = true;
  showToast('AI笔记生成中...', 'info');

  // 清空之前的笔记内容
  if (currentQuestion.value) {
    currentQuestion.value.notes = '';
    renderNotesForCurrentQuestion();
  }

  // 定义节流变量
  let lastRenderTime = 0;
  const baseThrottleDelay = 100; // 基础节流延迟，毫秒
  let throttleDelay = baseThrottleDelay;
  let pendingChunks = '';
  let renderTimeout: number | null = null;
  let autoSaveTimeout: number | null = null;

  // 定义自动保存函数
  const autoSaveNotes = () => {
    if (currentQuestion.value && currentQuestion.value.notes) {
      saveCurrentNotesState();
    }

    // 定期保存，确保数据不会丢失
    if (isGeneratingNote.value) {
      autoSaveTimeout = window.setTimeout(autoSaveNotes, 5000); // 每5秒自动保存一次
    }
  };

  // 启动自动保存
  autoSaveTimeout = window.setTimeout(autoSaveNotes, 5000);

  // 定义流式和完成回调
  const handleStreamChunk: StreamCallback = (chunk) => {
    if (config.apiConfig?.streamOutput && currentQuestion.value) {
      // 添加到当前内容
      currentQuestion.value.notes = (currentQuestion.value.notes || '') + chunk;
      pendingChunks += chunk;

      // 智能节流处理
      const now = Date.now();
      const timeSinceLastRender = now - lastRenderTime;

      // 快速渲染换行、代码块等重要格式标记
      const hasImportantMarkers = /\n|```|\*\*|#|>|-\s|1\.|<|!\[/.test(pendingChunks);

      // 动态调整节流延迟 - 根据内容长度和时间动态调整
      if (pendingChunks.length > 100) {
        throttleDelay = baseThrottleDelay * 2; // 大块内容时增加延迟
      } else if (hasImportantMarkers) {
        throttleDelay = 0; // 关键格式立即渲染
      }

      // 清除之前的延迟渲染
      if (renderTimeout) {
        clearTimeout(renderTimeout);
        renderTimeout = null;
      }

      // 判断是否应该立即渲染
      if (timeSinceLastRender > throttleDelay || hasImportantMarkers) {
        renderNotesForCurrentQuestion(); // 增量渲染
        lastRenderTime = now;
        pendingChunks = '';
      } else {
        // 如果暂时不渲染，设置一个延迟渲染的定时器确保内容最终会显示
        renderTimeout = window.setTimeout(() => {
          if (pendingChunks.length > 0) {
            renderNotesForCurrentQuestion();
            pendingChunks = '';
          }
        }, throttleDelay - timeSinceLastRender);
      }
    }
  };

  const handleCompletion: CompletionCallback = (finalNote, error) => {
    // 清除可能存在的延迟渲染计时器
    if (renderTimeout) {
      clearTimeout(renderTimeout);
      renderTimeout = null;
    }

    // 清除自动保存计时器
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
      autoSaveTimeout = null;
    }

    // 标记结束前确保最终内容已经渲染
    if (currentQuestion.value) {
      currentQuestion.value.notes = finalNote;
      renderNotesForCurrentQuestion();

      // 延迟标记生成结束，让最终渲染和光标消失有一个平滑过渡
      setTimeout(() => {
        isGeneratingNote.value = false;

        // 再次渲染以移除光标和生成中状态
        renderNotesForCurrentQuestion();

        if (error) {
          showToast(`笔记生成失败: ${error}`, 'error');
        } else {
          // 确保完成后保存笔记
          saveNotesToLocalStorage(); // 保存生成的笔记
          showToast('AI笔记生成完成', 'success');

          if (config.canSyncNotes) triggerSync();
        }
      }, 300); // 300ms延迟，让过渡更加平滑
    } else {
      isGeneratingNote.value = false;
      if (error) {
        showToast(`笔记生成失败: ${error}`, 'error');
      }
    }
  };

  // 调用实际的AI笔记生成函数
  generateAINotes(currentQuestion.value, handleCompletion, handleStreamChunk);
}

// 检查并触发下一个问题的笔记生成
function checkAndGenerateNextNote() {
  if (!config.apiConfig?.enabled || !config.apiConfig?.autoGenerate || isGeneratingNote.value) return;

  const nextIndex = currentIndex.value + 1;
  if (nextIndex < localQuestions.value.length) {
    const nextQ = localQuestions.value[nextIndex];
    // 如果下一个问题存在且没有笔记，则请求生成
    if (nextQ && (!nextQ.notes || nextQ.notes.trim() === '')) {
      console.log(`Requesting background note generation for question ID: ${nextQ.id || (nextIndex + 1)}`);

      // 使用实际的AI笔记生成函数
      generateAINotes(nextQ, (finalNote, error) => {
        if (error) {
          console.warn(`Background note generation failed for QID ${nextQ.id}: ${error}`);
        } else {
          nextQ.notes = finalNote;
          console.log(`Background note generation completed for QID ${nextQ.id}`);
          saveNotesToLocalStorage(); // 保存所有笔记
        }
      });
    }
  }
}

// 保存设置配置
function saveConfig() {
  const configToSave = {
    autoSubmit: config.autoSubmit,
    autoNext: config.autoNext,
    allowSkip: config.allowSkip,
    showNotesAfterAnswer: config.showNotesAfterAnswer,
    lockAnswerAfterSubmit: config.lockAnswerAfterSubmit,
    showCorrectAnswerImmediately: config.showCorrectAnswerImmediately,
    showProgress: config.showProgress,
    swipeGestureEnabled: config.swipeGestureEnabled,
    randomMode: config.randomMode,
    reviewMode: config.reviewMode,
    canEditQuestion: config.canEditQuestion,
    canSyncNotes: config.canSyncNotes,
    viewWrongAfterAll: config.viewWrongAfterAll,
    apiConfig: config.apiConfig,
    fontFamily: config.fontFamily,
    animationEnabled: config.animationEnabled
  };

  localStorage.setItem('quizConfig', JSON.stringify(configToSave));
}

// 处理API配置保存
function handleApiConfigSave(apiConfig: {
  apiUrl: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
  autoGenerateNotes: boolean;
  streamOutput: boolean;
  temperature: number;
  topP: number;
}) {
  // 更新配置
  config.apiConfig = {
    enabled: true,
    autoGenerate: apiConfig.autoGenerateNotes,
    streamOutput: apiConfig.streamOutput
  };

  // 保存到本地存储
  saveConfig();
  showToast('API配置已保存', 'success');
}

// 触发笔记同步
function triggerSync() {
  if (!config.canSyncNotes || syncStatus.value === 'pending') return;

  syncStatus.value = 'pending';
  showToast('笔记同步中...', 'info');

  try {
    // 保存到本地存储
    saveNotesToLocalStorage();

    // 获取GitHub配置
    const owner = localStorage.getItem('github_owner');
    const repo = localStorage.getItem('github_repo');
    const branch = localStorage.getItem('github_branch') || 'main';
    const path = localStorage.getItem('github_path') || '';
    const token = localStorage.getItem('github_token');
    const useForceSync = localStorage.getItem('force_sync') === 'true';
    const syncQuizName = localStorage.getItem('sync_quiz_name') || currentQuizInfo.value.name;

    // 检查是否配置了GitHub
    if (!owner || !repo || !token) {
      syncStatus.value = 'error';
      showToast('请先配置GitHub仓库信息', 'error');
      return;
    }

    // 构建API路径
    let apiPath = path.replace(/\/+$/, '');
    if (!apiPath.endsWith('.json')) {
      apiPath = apiPath ? `${apiPath}/${syncQuizName}.json` : `${syncQuizName}.json`;
    }

    // 准备要同步的数据（当前题库的笔记）
    const notesData: Record<string, string> = {};
    localQuestions.value.forEach(q => {
      if (q.id && q.notes) {
        notesData[String(q.id)] = q.notes;
      }
    });

    // 准备要同步的内容
    const contentJson = JSON.stringify(notesData);
    const encodedContent = btoa(unescape(encodeURIComponent(contentJson)));

    // 执行同步
    forceSyncToGithub(owner, repo, branch, apiPath, token, encodedContent, useForceSync)
      .then(success => {
        if (success) {
          syncStatus.value = 'success';
          showToast('笔记已成功同步到GitHub', 'success');
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
      });
  } catch (err) {
    console.error('同步笔记失败:', err);
    syncStatus.value = 'error';
    showToast(`同步失败: ${err instanceof Error ? err.message : '未知错误'}`, 'error');
  }
}

// 强制同步到GitHub
async function forceSyncToGithub(
  owner: string,
  repo: string,
  branch: string,
  path: string,
  token: string,
  encodedContent: string,
  forceSync = true,
  retryCount = 0,
  maxRetries = 3
): Promise<boolean> {
  try {
    const headers = {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    };

    // 1. 获取文件SHA（如果存在）
    let sha: string | null = null;
    try {
      const fileResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
        { headers }
      );

      if (fileResponse.ok) {
        const fileData = await fileResponse.json();
        sha = fileData.sha;
      } else if (fileResponse.status !== 404) {
        throw new Error(`获取文件信息失败: ${fileResponse.status} ${fileResponse.statusText}`);
      }
    } catch (error) {
      const httpError = error as { status?: number };
      if (httpError.status !== 404) {
        throw error;
      }
    }

    // 2. 准备提交内容
    const requestBody: Record<string, unknown> = {
      message: `${forceSync ? 'Force sync' : 'Sync'} notes at ${new Date().toISOString()}`,
      content: encodedContent,
      branch: branch
    };

    if (sha) {
      requestBody.sha = sha;
    }

    // 3. 执行提交
    const updateResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    if (updateResponse.ok) {
      return true;
    } else {
      const errorData = await updateResponse.json();
      // 处理冲突情况，尝试重试
      if (updateResponse.status === 409 && retryCount < maxRetries) {
        showToast(`检测到冲突，第 ${retryCount + 1} 次重试...`, 'info');
        await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
        return forceSyncToGithub(owner, repo, branch, path, token, encodedContent, forceSync, retryCount + 1, maxRetries);
      }
      throw new Error(`同步失败: ${errorData.message || updateResponse.statusText}`);
    }
  } catch (error) {
    console.error('强制同步出错:', error);
    throw error;
  }
}

// 打开同步配置模态框
function openSyncConfigModal() {
  showSyncConfigModal.value = true;
}

// 处理同步配置保存
function handleSyncConfigSave(config: Record<string, unknown>) { // 使用 Record<string, unknown> 代替 any
  console.log('同步配置已保存:', config);
  showToast('远程仓库配置已保存', 'success');
}

// 获取当前题库信息
const currentQuizInfo = computed(() => {
  // 使用QuizStore中的数据
  const quizData = QuizStore.state.quizData;
  const lastLoaded = QuizStore.getLastLoaded();

  // 检查是否有有效的题库数据
  const exists = !!quizData && !!lastLoaded.name;

  return {
    name: lastLoaded.name || '',
    source: lastLoaded.source || '',
    isLocal: lastLoaded.source === 'local',
    exists: exists
  };
});

// --- Modal Methods ---

// 应用模式设置
function applySettings(newSettings: GeneralSettings) {
  // 从通用设置中提取测验设置
  const newQuizSettings = newSettings.quizSettings;

  // 更新测验配置 - 修复类型转换
  const changedKeys = Object.keys(newQuizSettings).filter(
    key => {
      const configValue = (config as Record<string, unknown>)[key];
      const newValue = (newQuizSettings as unknown as Record<string, unknown>)[key];
      return configValue !== newValue;
    }
  ) as (keyof QuizConfig)[];

  // 更新UI设置
  if (newSettings.uiSettings) {
    const { fontFamily, animationEnabled } = newSettings.uiSettings;
    config.fontFamily = fontFamily;
    config.animationEnabled = animationEnabled;

    // 设置深色模式
    if (isDarkMode.value !== newSettings.uiSettings.darkMode) {
      isDarkMode.value = newSettings.uiSettings.darkMode;
      toggleTheme(); // 使用正确的函数名
    }
  }

  // 更新测验设置
  Object.assign(config, newQuizSettings);

  // 更新调试模式
  localStorage.setItem('debugEnabled', newSettings.debugEnabled.toString());

  showToast('设置已应用', 'success');

  // 如果 reviewMode 改变，需要重新加载当前问题状态
  if (changedKeys.includes('reviewMode')) {
    loadQuestion(currentIndex.value);
  }

  // 保存配置到localStorage
  saveConfigToLocalStorage();
}

// 打开当前问题的编辑器
function openCurrentQuestionEditor() {
  if (!config.canEditQuestion || isQuizSubmitted.value || !currentQuestion.value) {
    showToast('当前状态无法编辑题目', 'warning');
    return;
  }
  questionToEdit.value = currentQuestion.value; // 设置要编辑的问题
  showEditModal.value = true;
}

// 处理问题保存事件
function handleSaveQuestion(updatedQuestionData: Partial<Question>) {
  // 确保ID存在，用于查找问题
  if (!updatedQuestionData.id) {
    showToast('错误：更新的问题缺少ID', 'error');
    return;
  }
  const originalIndex = localQuestions.value.findIndex(q => q.id === updatedQuestionData.id);
  if (originalIndex === -1) {
    showToast('错误：无法找到原始问题进行更新', 'error');
    return;
  }

  // 本地更新和持久化
  try {
    // 更新本地题目
    localQuestions.value[originalIndex] = { ...localQuestions.value[originalIndex], ...updatedQuestionData };

    // 这是一个占位函数，用于更新QuizStore中的源数据
    updateQuizStoreSourceData(updatedQuestionData);

    showToast('问题已更新', 'success');
    showEditModal.value = false; // 关闭模态框
    questionToEdit.value = null;

    // 如果编辑的是当前问题，重新渲染
    if (currentIndex.value === originalIndex) {
      renderNotesForCurrentQuestion();
    }
    if (config.canSyncNotes) {
      saveNotesToLocalStorage();
      triggerSync();
    }

  } catch (error) {
    console.error('更新题目失败:', error);
    showToast(`更新失败: ${error instanceof Error ? error.message : '未知错误'}`, 'error');
  }
}

// 更新QuizStore源数据的函数
function updateQuizStoreSourceData(updatedQuestionData: Partial<Question>) {
  console.warn("尚未实现: 更新QuizStore源数据，问题ID:", updatedQuestionData.id);
  // TODO: 实现更新QuizStore源数据的逻辑
}

// 存储相关方法

// 保存当前答案状态到localStorage
function saveCurrentAnswerState() {
  if (!currentQuestion.value) return;
  const question = currentQuestion.value;
  const isCorrect = selectedAnswer.value === question.answer;

  try {
    const userAnswers = localStorage.getItem('userAnswers') || '{}';
    const answersData = JSON.parse(userAnswers);

    answersData[String(question.id)] = {
      answer: selectedAnswer.value,
      isCorrect: isCorrect,
      timestamp: Date.now()
    };

    localStorage.setItem('userAnswers', JSON.stringify(answersData));
  } catch (err) {
    console.error('保存答题状态失败:', err);
  }
}

// 保存当前笔记状态到localStorage
function saveCurrentNotesState() {
  if (!currentQuestion.value) return;
  const question = currentQuestion.value;

  try {
    const notesDataStr = localStorage.getItem('quizNotes') || '{}';
    const notes = JSON.parse(notesDataStr);

    notes[String(question.id)] = question.notes;
    localStorage.setItem('quizNotes', JSON.stringify(notes));
  } catch (err) {
    console.error('保存笔记失败:', err);
  }
}

// 保存所有笔记到localStorage
function saveNotesToLocalStorage() {
  try {
    const notesData: Record<string, string> = {};
    localQuestions.value.forEach(q => {
      if (q.id && q.notes) {
        notesData[String(q.id)] = q.notes;
      }
    });
    localStorage.setItem('quizNotes', JSON.stringify(notesData));
    console.log('笔记已保存到本地存储');
  } catch (err) {
    console.error('批量保存笔记失败:', err);
  }
}

// 保存配置到localStorage
function saveConfigToLocalStorage() {
  try {
    // 保存完整配置对象
    localStorage.setItem('quizConfig', JSON.stringify(config));

    // 同时保存到QuizStore配置中 - 注意使用对应的键名映射
    if (QuizStore && typeof QuizStore.setConfig === 'function') {
      QuizStore.setConfig({
        mode: config.reviewMode ? QuizMode.REVIEW : (config.randomMode ? QuizMode.RANDOM : QuizMode.NORMAL),
        randomize: config.randomMode || false,
        // 保留其他已有配置
        chapterIndex: QuizStore.state.config.chapterIndex,
        rangeStart: QuizStore.state.config.rangeStart,
        rangeEnd: QuizStore.state.config.rangeEnd,
        wrongOnly: QuizStore.state.config.wrongOnly
      });

      // 调用存储方法以便持久化
      QuizStore.saveToStorage();
    }
  } catch (error) {
    console.error('保存配置失败:', error);
  }
}

// 触发状态变化
function emitStateChange() {
  console.log("State change triggered internally for index:", currentIndex.value);
}

// --- 生命周期钩子 ---
onMounted(() => {
  console.log("页面加载，开始初始化...");

  // 加载保存的配置
  try {
    // 1. 先尝试从QuizStore获取配置
    const storeConfig = QuizStore.getConfig();

    // 2. 转换QuizStore配置到本地配置格式
    if (storeConfig) {
      config.randomMode = storeConfig.randomize || false;
      config.reviewMode = storeConfig.mode === QuizMode.REVIEW;
      // 其他相关配置...
    }

    // 3. 再尝试从localStorage加载更详细的配置
    const savedConfig = localStorage.getItem('quizConfig');
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      Object.assign(config, parsedConfig);
    }
  } catch (error) {
    console.error('加载配置失败:', error);
  }

  // 初始化主题
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    isDarkMode.value = true;
    document.body.classList.add('dark-theme');
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    isDarkMode.value = false;
    document.body.classList.remove('dark-theme');
    document.documentElement.setAttribute('data-theme', 'light');
  }

  // 检查是否有缓存的题库数据
  const hasQuizData = QuizStore.state.quizData !== null;
  console.log("QuizStore中是否有题库数据:", hasQuizData);

  if (!hasQuizData) {
    console.log("尝试从本地存储恢复题库数据...");
    // 尝试从本地存储恢复题库数据
    const restored = QuizStore.loadFromStorage();
    if (!restored) {
      console.warn('未能从本地存储恢复题库数据，需要重新选择题库');
      showToast('请返回并选择题库', 'warning');

      // 如果恢复失败，等待一会儿后跳转到题库页面
      setTimeout(() => {
        router.push('/library');
      }, 1500);
      return; // 不再执行后续初始化逻辑
    } else {
      console.log("成功从本地存储恢复题库数据");
      showToast('已恢复上次练习的题库', 'success');
    }
  }

  // 初始化Mermaid库（如果存在）
  if (typeof mermaid !== 'undefined') {
    mermaid.initialize({
      startOnLoad: false,
      theme: isDarkMode.value ? 'dark' : 'default'
    });
  }

  // 更新章节选择器的值
  const savedChapter = localStorage.getItem('selectedChapter');
  if (savedChapter) {
    console.log("恢复上次选择的章节:", savedChapter);
    // 如果有章节选择器，则设置其值
    if (typeof selectedChapter.value !== 'undefined') {
      selectedChapter.value = savedChapter;
    }
  }

  // 开始初始化题库数据
  initializeQuiz();
});

// 准备题目数据
function prepareQuizData() {
  try {
    // 获取题库数据
    const quizData = QuizStore.getQuizData();
    if (!quizData || !quizData.chapters) {
      throw new Error('题库数据无效');
    }

    // 根据配置处理章节和问题
    processChaptersAndQuestions(quizData);

  } catch (caughtError) { // 使用不同的变量名
    console.error('准备题目数据失败:', caughtError);
    // 更新 ref 变量 error
    error.value = '准备题目数据失败: ' + (caughtError instanceof Error ? caughtError.message : String(caughtError));
    loading.value = false;
  }
}

// 处理章节和问题
function processChaptersAndQuestions(quizData: StoreQuizData) { // 使用导入的 StoreQuizData 类型
  // 提取所有问题或特定章节的问题
  const chapterIndex = QuizStore.state.config.chapterIndex;
  const mode = QuizStore.state.config.mode;
  const allQuestions: Question[] = []; // 这里的 Question 是本地 L300 的类型

  // 从题库中提取问题
  if (quizData && quizData.chapters) { // 添加检查
    if (chapterIndex === 'all') {
      // 提取所有章节的问题
      quizData.chapters.forEach((chapter: StoreChapter) => { // 移除未使用的 index 参数
        if (chapter.questions && Array.isArray(chapter.questions)) {
          // 显式转换类型以匹配 forEach 回调预期
          (chapter.questions as unknown as RawQuestionData[]).forEach((q: RawQuestionData) => { // RawQuestionData 是本地类型，用于解析
            allQuestions.push(formatQuestion(q, chapter.title)); // 移除未使用的 index
          });
        }
      });
    } else {
      // 提取特定章节的问题
      const chapter = quizData.chapters.find((c: StoreChapter) => c.title === chapterIndex); // 使用导入的 StoreChapter 类型
      if (chapter && chapter.questions && Array.isArray(chapter.questions)) {
        // 显式转换类型以匹配 forEach 回调预期
        (chapter.questions as unknown as RawQuestionData[]).forEach((q: RawQuestionData) => {
          allQuestions.push(formatQuestion(q, chapter.title));
        });
      }
    }
  } else {
    console.warn("Quiz data or chapters are missing.");
    error.value = '题库数据或章节信息缺失';
  }

  // 应用范围限制
  let filteredQuestions = allQuestions;
  if (mode === QuizMode.RANGE) {
    const start = QuizStore.state.config.rangeStart - 1; // 转为0索引
    const end = QuizStore.state.config.rangeEnd;
    filteredQuestions = allQuestions.slice(start, end);
  }

  // 应用随机模式
  if (QuizStore.state.config.randomize) {
    filteredQuestions = shuffleArray([...filteredQuestions]);
  }

  // 更新本地问题列表
  localQuestions.value = filteredQuestions;
  loading.value = false;

  if (filteredQuestions.length === 0) {
    error.value = '没有找到符合条件的题目';
  } else {
    // 保存当前章节到localStorage
    localStorage.setItem('selectedChapter', chapterIndex);

    // 初始化错题ID列表
    wrongQuestionIds.value = filteredQuestions
      .filter(q => q.userAnswer !== null && q.userAnswer !== q.answer)
      .map(q => String(q.id));

    // 延迟加载第一题，确保DOM渲染完成
    nextTick(() => {
      loadQuestion(currentIndex.value);
    });
  }
}

// 格式化问题数据
function formatQuestion(rawQuestion: RawQuestionData, chapterTitle?: string): Question { // 移除未使用的 chapterIndex
  return {
    id: rawQuestion.id || rawQuestion.number || 0,
    question: rawQuestion.question || rawQuestion.title || '',
    options: rawQuestion.options || [],
    answer: String(rawQuestion.answer || ''),
    notes: rawQuestion.notes || '',
    explanation: rawQuestion.explanation || '',
    userAnswer: rawQuestion.userAnswer || null,
    chapterTitle: chapterTitle || ''
  };
}

// 打乱数组（随机排序）
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 切换主题方法
function toggleTheme() {
  isDarkMode.value = !isDarkMode.value;

  if (isDarkMode.value) {
    document.body.classList.add('dark-theme');
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove('dark-theme');
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  }

  // 重新初始化mermaid以应用主题变化
  nextTick(() => {
    if (typeof mermaid !== 'undefined') {
      mermaid.initialize({
        startOnLoad: false,
        theme: isDarkMode.value ? 'dark' : 'default'
      });
    }
    renderNotesForCurrentQuestion();
  });
}

onUnmounted(() => {
  removeKeyboardListeners();
  if (toastTimer !== null) {
    clearTimeout(toastTimer);
  }
});

// --- 监听器 ---

// 监听当前问题变化时，重新渲染笔记
watch(currentQuestion, (newQuestion, oldQuestion) => {
  if (newQuestion && newQuestion !== oldQuestion) {
    nextTick(() => {
      renderNotesForCurrentQuestion();
    });
  }
});

// 监听笔记编辑状态，自动调整textarea大小
watch(isEditingNotes, (editing) => {
  if (editing) {
    nextTick(() => autoResizeTextarea());
  }
});

// 监听配置中的字体变化
watch(() => config.fontFamily, (newFontFamily) => {
  console.log(`Font family changed to: ${newFontFamily}`);
  nextTick(() => {
    initMermaid();
    renderNotesForCurrentQuestion();
  });
});

// 监听章节选择变化
watch(selectedChapter, (newChapter) => {
  console.log(`章节切换: ${newChapter}`);
  // 如果章节变更，重新加载题目
  if (quizData.value) {
    prepareQuestions();
    // 重置当前索引
    currentIndex.value = 0;
    // 加载第一题
    nextTick(() => {
      loadQuestion(0);
    });
  }
});

// --- 辅助方法 ---

// 获取选项的 Key (e.g., 'A')
function getOptionKey(optionText: string, index: number): string {
  const keyMatch = typeof optionText === 'string' ? optionText.match(/^([A-Z])[:.)]?\s*/i) : null;
  return keyMatch ? keyMatch[1].toUpperCase() : String.fromCharCode(65 + index);
}

// 获取选项的内容
function getOptionContent(optionText: string): string {
  const keyMatch = typeof optionText === 'string' ? optionText.match(/^([A-Z])[:.)]?\s*/i) : null;
  return keyMatch ? optionText.substring(keyMatch[0].length) : optionText;
}

// 获取选项的 CSS 类
function getOptionClass(optionKey: string): string {
  const question = currentQuestion.value;
  if (!question) return '';

  const classes = [];
  const isSelected = selectedAnswer.value === optionKey;
  const isUserAnswer = question.userAnswer === optionKey;
  const isCorrectAnswer = question.answer === optionKey;
  const answered = isCurrentAnswered.value;
  const canChange = !config.lockAnswerAfterSubmit;

  // 如果允许修改答案，且当前选择了此选项但还未保存
  if (isSelected && ((!answered) || (answered && canChange))) {
    classes.push('page-quiz__option--selected');
  }

  if (answered || config.reviewMode) { // 已回答或回顾模式
    // 显示正确答案的条件：
    // 1. 处于回顾模式，或
    // 2. 启用了立即显示正确答案，或
    // 3. 用户的回答是这个选项（显示用户回答状态）
    if ((config.reviewMode || config.showCorrectAnswerImmediately || isUserAnswer) && isCorrectAnswer) {
      classes.push('page-quiz__option--correct');
    }

    // 添加对错误选项的处理
    if (isUserAnswer && !isCorrectAnswer) {
      classes.push('page-quiz__option--incorrect');
    }
  }

  return classes.join(' ');
}

// 获取选项 Key 的 CSS 类 (主要用于对错标记)
function getOptionKeyClass(optionKey: string): string {
  const question = currentQuestion.value;
  if (!question || (!isCurrentAnswered.value && !config.reviewMode)) return '';

  const isCorrectAnswer = question.answer === optionKey;
  const isUserWrongAnswer = question.userAnswer === optionKey && question.userAnswer !== question.answer;

  // 显示正确答案和错误选择的标记
  // 正确答案只有在回顾模式或启用立即显示正确答案时才显示
  if (isCorrectAnswer && (config.reviewMode || config.showCorrectAnswerImmediately)) {
    return 'page-quiz__option-number--correct';
  } else if (isUserWrongAnswer) {
    return 'page-quiz__option-number--incorrect';
  }
  return '';
}

// --- 键盘和滑动处理 ---
let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(e: TouchEvent) {
  if (!config.swipeGestureEnabled) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}

function handleTouchEnd(e: TouchEvent) {
  if (!config.swipeGestureEnabled) return;
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  const diffX = touchStartX - touchEndX;
  const diffY = touchStartY - touchEndY;

  // 阈值判断，水平滑动为主
  const horizontalThreshold = window.innerWidth * 0.15;
  const verticalThreshold = window.innerHeight * 0.10; // 允许少量垂直移动

  if (Math.abs(diffX) > horizontalThreshold && Math.abs(diffY) < verticalThreshold) {
    if (diffX > 0 && canGoNext.value) { // 左滑 -> 下一题
      nextQuestion();
    } else if (diffX < 0 && canGoPrev.value) { // 右滑 -> 上一题
      previousQuestion();
    }
  }
}

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
      // 手动关闭所有可能的模态框
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
    if (canSubmitAnswer.value) {
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

function setupKeyboardListeners() {
  document.addEventListener('keydown', handleKeyPress);
}

function removeKeyboardListeners() {
  document.removeEventListener('keydown', handleKeyPress);
}

// --- 辅助方法 ---

// 初始化 Mermaid 图表库
async function initMermaid() {
  try {
    mermaid.initialize({
      startOnLoad: false,
      theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: config.fontFamily || 'sans-serif',
      fontSize: 16,
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
        useMaxWidth: true,
        nodeSpacing: 10,
        rankSpacing: 15,
        padding: 5
      },
      sequence: {
        useMaxWidth: true,
        diagramMarginX: 10,
        diagramMarginY: 10,
        boxMargin: 5,
        actorMargin: 30,
        messageMargin: 5
      },
      gantt: {
        useMaxWidth: true,
        barHeight: 20
      },
      er: {
        useMaxWidth: true,
        entityPadding: 10
      },
      class: {
        useMaxWidth: true
      }
    });
    return true;
  } catch (e) {
    console.error("Mermaid initialization failed:", e);
    showToast("图表库初始化失败", "warning");
    return false;
  }
}

// 准备问题数据
function prepareQuestions() {
  const quizData = QuizStore.state.quizData;
  if (!quizData || !quizData.chapters) {
    error.value = '题库数据不存在或格式不正确';
    loading.value = false;
    return;
  }

  // 从 Store 获取用户选择的配置
  const quizConfig = QuizStore.getConfig();
  const initialChapter = quizConfig.chapterIndex;
  const mode = quizConfig.mode;
  const rangeStart = quizConfig.rangeStart;
  const rangeEnd = quizConfig.rangeEnd;
  const randomize = quizConfig.randomize;
  const wrongOnly = quizConfig.wrongOnly;

  // 使用当前选择的章节
  const chapterIndex = selectedChapter.value || initialChapter;
  console.log(`准备题目，当前选择章节: ${chapterIndex}`);

  // 更新组件内部配置
  config.randomMode = randomize;
  config.reviewMode = (mode === QuizMode.REVIEW);

  try {
    let questionsList: Question[] = [];

    // 根据章节选择提取题目
    if (chapterIndex === 'all') {
      // 获取所有章节的题目
      console.log(`加载所有章节题目`);
      questionsList = quizData.chapters.flatMap((chapter): Question[] =>
        (chapter.questions || []).map((q): Question => {
          // 使用自定义接口类型处理实际数据结构与类型定义不一致的问题
          const rawQuestion = q as RawQuestionData;
          return {
            id: String(rawQuestion.id ?? `gen_${Math.random()}`),
            question: rawQuestion.question || rawQuestion.title || '',
            options: rawQuestion.options ? [...rawQuestion.options] : [],
            answer: typeof rawQuestion.answer === 'number' ? String(rawQuestion.answer) : (rawQuestion.answer || ''),
            notes: rawQuestion.notes || rawQuestion.explanation || '',
            chapterTitle: chapter.title
          };
        })
      );
    } else {
      // 获取指定章节的题目
      console.log(`加载章节 "${chapterIndex}" 题目`);
      const chapter = quizData.chapters.find(c => c.title === chapterIndex);
      if (chapter && chapter.questions) {
        questionsList = chapter.questions.map((q): Question => {
          // 使用自定义接口类型处理实际数据结构与类型定义不一致的问题
          const rawQuestion = q as RawQuestionData;
          return {
            id: String(rawQuestion.id ?? `gen_${Math.random()}`),
            question: rawQuestion.question || rawQuestion.title || '',
            options: rawQuestion.options ? [...rawQuestion.options] : [],
            answer: typeof rawQuestion.answer === 'number' ? String(rawQuestion.answer) : (rawQuestion.answer || ''),
            notes: rawQuestion.notes || rawQuestion.explanation || '',
            chapterTitle: chapter.title
          };
        });
      }
    }

    console.log(`总共找到 ${questionsList.length} 题`);

    // 处理范围模式
    if (mode === QuizMode.RANGE && questionsList.length > 0) {
      const start = Math.max(1, rangeStart);
      const end = Math.min(rangeEnd, questionsList.length);
      // 如果有数字ID则按ID过滤，否则按索引过滤
      if (!isNaN(parseInt(String(questionsList[0].id)))) {
        questionsList = questionsList.filter(q => {
          const qIdNum = parseInt(String(q.id));
          return qIdNum >= start && qIdNum <= end;
        });
      } else {
        questionsList = questionsList.slice(start - 1, end);
      }
      console.log(`范围模式，筛选后还有 ${questionsList.length} 题`);
    }

    // 处理错题模式
    if (mode === QuizMode.WRONG || wrongOnly) {
      const userAnswers = localStorage.getItem('userAnswers');
      if (userAnswers) {
        const answersData = JSON.parse(userAnswers);
        const wrongIds = new Set(
          Object.keys(answersData).filter(id => answersData[id]?.isCorrect === false)
        );
        questionsList = questionsList.filter(q => wrongIds.has(q.id?.toString() || ''));
        console.log(`错题模式，筛选后还有 ${questionsList.length} 题`);
      } else {
        error.value = '没有错题记录';
        loading.value = false;
        return;
      }
    }

    // 随机排序
    if (randomize || mode === QuizMode.RANDOM) {
      for (let i = questionsList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questionsList[i], questionsList[j]] = [questionsList[j], questionsList[i]];
      }
      console.log('已随机排序题目');
    }

    // 加载用户答题状态和笔记
    const userAnswers = localStorage.getItem('userAnswers');
    const savedNotes = localStorage.getItem('quizNotes');
    const answersData = userAnswers ? JSON.parse(userAnswers) : {};
    const notesData = savedNotes ? JSON.parse(savedNotes) : {};

    // 合并用户数据到题目对象
    questionsList = questionsList.map((q): Question => {
      const qIdStr = q.id?.toString() || '';
      const answerInfo = answersData[qIdStr];
      const noteInfo = notesData[qIdStr];
      return {
        ...q,
        userAnswer: answerInfo ? answerInfo.answer : null,
        notes: noteInfo || q.notes || undefined // 优先使用已保存的笔记
      };
    });

    // 设置最终的题目列表
    localQuestions.value = questionsList;
    loading.value = false;

    if (questionsList.length === 0) {
      error.value = '没有找到符合条件的题目';
    } else {
      // 保存当前章节到localStorage
      localStorage.setItem('selectedChapter', chapterIndex);

      // 初始化错题ID列表
      wrongQuestionIds.value = questionsList
        .filter(q => q.userAnswer !== null && q.userAnswer !== q.answer)
        .map(q => String(q.id));

      // 延迟加载第一题，确保DOM渲染完成
      nextTick(() => {
        loadQuestion(currentIndex.value);
      });
    }
  } catch (err) {
    console.error('准备题目失败:', err);
    error.value = err instanceof Error ? err.message : '准备题目时发生未知错误';
    loading.value = false;
  }
}

// 加载题库数据的方法
function loadQuizData() {
  // 从 QuizStore 获取题库数据
  const storeQuizData = QuizStore.state.quizData;
  if (!storeQuizData || !storeQuizData.chapters) {
    error.value = '题库数据不存在或格式不正确';
    loading.value = false;
    return;
  }

  // 使用更安全的转换方式
  try {
    // 深拷贝解决只读问题
    const quizDataCopy = JSON.parse(JSON.stringify(storeQuizData));
    quizData.value = quizDataCopy;

    // 章节数据处理
    if (quizData.value && quizData.value.chapters) {
      const chapterSet = new Set<string>();
      quizData.value.chapters.forEach((chapter: Chapter) => {
        if (chapter.title) {
          chapterSet.add(chapter.title);
        }
      });
      chapters.value = Array.from(chapterSet);
    }

    // 准备题目数据
    prepareQuestions();
  } catch (err) {
    console.error('处理题库数据失败:', err);
    error.value = '处理题库数据时出错';
    loading.value = false;
  }
}

// 获取完整的API配置
function getCompleteApiConfig() {
  const apiConfig = getAIAPIConfig();
  return {
    apiUrl: apiConfig.apiUrl,
    apiKey: apiConfig.apiKey,
    model: apiConfig.model,
    systemPrompt: apiConfig.systemPrompt,
    autoGenerateNotes: config.apiConfig?.autoGenerate || false,
    streamOutput: config.apiConfig?.streamOutput !== false,
    temperature: apiConfig.temperature,
    topP: apiConfig.topP
  };
}

// 新增UI状态变量
const forceShowNotes = ref(false);

// 从localStorage加载保存的笔记
function loadNotesFromLocalStorage() {
  try {
    const notesDataStr = localStorage.getItem('quizNotes');
    if (!notesDataStr) return;

    const notesData = JSON.parse(notesDataStr);

    // 将保存的笔记应用到题目上
    localQuestions.value.forEach(question => {
      if (question.id && notesData[String(question.id)]) {
        question.notes = notesData[String(question.id)];
      }
    });

    console.log('已从本地存储加载笔记');
  } catch (error) {
    console.error('加载笔记失败:', error);
  }
}

</script>
