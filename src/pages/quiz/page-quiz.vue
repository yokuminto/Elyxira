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
            <span v-html="formatQuestionText(currentQuestion.question)"></span>
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
              <h3 class="page-quiz__notes-title">笔记</h3>
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
    <ModalQuestionOverview :show="showOverviewModal" :questions="localQuestions as any" :current-index="currentIndex"
      @close="showOverviewModal = false" @jump-to="jumpToQuestion" />
    <ModalStatistics :show="showModalStatistics" :stats="quizStats" @close="showModalStatistics = false"
      @view-wrong="viewWrongQuestions" @continue="showModalStatistics = false" @back-home="navigateBack" />
    <ModalSettings :show="showModalSettings" :current-settings="configAsGeneralSettings"
      @close="showModalSettings = false" @save="applySettings" />
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
import { marked } from 'marked'
import mermaid from 'mermaid'
import { QuizStore } from '@/stores/store-quiz'
import { QuizMode, type Question } from '@/services/config-service' // 直接导入Question
import type { QuizData as StoreQuizData, Chapter as StoreChapter, AppSettings } from '@/services/config-service'
import './page-quiz.css'
import '../../styles/variables.css'
import * as storage from '@/utils/storage'
import configService from '@/services/config-service'
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
// 删除本地的Question接口定义

// 添加用户答案记录接口
interface UserAnswerRecord {
  answer: string;
  timestamp?: number;
  isCorrect?: boolean;
}

// 用户答案映射类型定义
interface UserAnswersMap {
  [questionId: string]: UserAnswerRecord;
}

// 添加实际JSON数据格式的接口定义
interface RawQuestionData {
  id?: number | string;
  question?: string;
  title?: string;
  options?: string[];
  answer?: string | number | number[];
  notes?: string;
  explanation?: string;
  userAnswer?: string | null;
  previousAnswer?: string;
  number?: number;
}

// 测验统计数据
interface QuizStats {
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  wrongQuestionIds: string[];
}

// API回调类型定义
type StreamCallback = (chunk: string) => void;
type CompletionCallback = (finalNote: string, error?: string) => void;

// ... existing code ...
type MermaidRenderCallback = (svgCode: string) => void;

// 响应式状态
const loading = ref(true);
const error = ref<string | null>(null);
const localQuestions = ref<Question[]>([]); // 使用导入的 Question 类型
const currentIndex = ref(0);
const selectedAnswer = ref<string | null>(null);
const isQuizSubmitted = ref(false);
const wrongQuestionIds = ref<string[]>([]);
const isReviewingWrong = ref(false);

// --- 使用 configService 获取设置 ---
const quizSettings = computed(() => configService.getQuizSettings());
const uiSettings = computed(() => configService.getUiSettings());
const apiConfig = computed(() => configService.getApiConfig());
// ---------------------------------

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
const questionToEdit = ref<Question | null>(null); // 使用导入的 Question 类型

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
const isDarkMode = computed(() => uiSettings.value.darkMode);

// 章节选择相关变量
const selectedChapter = ref('all');
const chapters = ref<string[]>([]);

// 题库数据
// 删除本地的 Chapter 和 QuizData 接口定义

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
const canSubmit = computed(() => {
  // 需要选择了答案，且如果已经回答过则需要没有锁定答案
  return selectedAnswer.value !== null &&
    !isQuizSubmitted.value &&
    !quizSettings.value.reviewMode &&
    (!isCurrentAnswered.value || !quizSettings.value.lockAnswerAfterSubmit);
});

// 如果选错且配置了锁定，则锁定
const isAnswerLocked = computed(() => {
  // 注意: lockAnswerAfterWrong 已废弃，仅使用 lockAnswerAfterSubmit
  return isCurrentAnswered.value && quizSettings.value.lockAnswerAfterSubmit;
});

// 是否可以进入下一题
const canGoNext = computed(() => {
  return !isQuizSubmitted.value &&
    (currentIndex.value < totalQuestions.value - 1 || (isCurrentAnswered.value || quizSettings.value.reviewMode || quizSettings.value.allowSkip));
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
  // 使用 quizSettings 替代本地 config
  return forceShowNotes.value || !quizSettings.value.showNotesAfterAnswer || quizSettings.value.reviewMode || isCurrentAnswered.value;
});

// 配置转换为通用设置对象
const configAsGeneralSettings = computed(() => {
  return configService.getSettings();
});

// 同步状态相关计算属性
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

  initMermaid();
  setupKeyboardListeners();

  // 初始化时，加载题库数据并根据初始章节(默认all)过滤
  loadQuizDataAndFilter();

  console.log("测验界面初始化完成");
}

// 新增：加载题库数据并根据章节过滤
function loadQuizDataAndFilter() {
  loading.value = true;
  error.value = null;

  const quizData = QuizStore.getQuizData();
  if (!quizData || !quizData.chapters) {
    error.value = '题库数据为空，请返回选择题库';
    loading.value = false;
    return;
  }

  // 提取章节列表
  chapters.value = quizData.chapters.map(c => c.title);

  // 根据当前选中的章节过滤题目 (初始为 'all')
  filterQuestionsByChapter(selectedChapter.value);

  // 如果有题目，加载第一题
  if (localQuestions.value.length > 0) {
    // 延迟加载，确保DOM渲染完成
    nextTick(() => {
      loadQuestion(currentIndex.value);
    });
  } else {
    error.value = '当前章节没有题目';
  }

  loading.value = false;
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

  renderNotesForCurrentQuestion(); // 渲染当前题目的笔记

  // 平滑滚动到问题区域顶部
  if (questionAreaRef.value) {
    questionAreaRef.value.scrollTo({ top: 0, behavior: 'smooth' });
  }

  emitStateChange();

  // 检查是否需要预生成下一题笔记
  if (apiConfig.value.enabled && apiConfig.value.autoGenerate) {
    checkAndGenerateNextNote();
  }
}

function handleOptionClick(key: string) {
  // 如果已提交测验、回顾模式或答案已锁定，则不允许选择
  // 使用 quizSettings 替代本地 config
  if (isQuizSubmitted.value || quizSettings.value.reviewMode || isAnswerLocked.value) {
    // 如果已提交/回顾模式/已锁定，则不允许选择
    return;
  }

  // 如果之前已回答且不允许修改答案，则不进行任何操作
  // 使用 quizSettings 替代本地 config
  if (isCurrentAnswered.value && quizSettings.value.lockAnswerAfterSubmit) {
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
  // 使用 quizSettings 替代本地 config
  if (quizSettings.value.autoSubmit && !isCurrentAnswered.value) {
    nextTick(() => {
      submitAnswer();
    });
  }
}

// 提交当前答案
// 提交当前答案
function submitAnswer() {
  // 检查是否可以提交答案：有选择的答案 且 (尚未回答或已回答但允许修改)
  // 使用 quizSettings 替代本地 config
  if (selectedAnswer.value === null || (isCurrentAnswered.value && quizSettings.value.lockAnswerAfterSubmit)) return;

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
  // 使用 quizSettings 替代本地 config
  if (quizSettings.value.autoNext && currentIndex.value < totalQuestions.value - 1) {
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

    // 保存笔记到题库数据
    saveNotesToQuizData();

    // 保存状态到configService
    QuizStore.saveToStorage();
  }
  isEditingNotes.value = false; // 保存后退出编辑模式
}

// 新增：将笔记保存到题库数据
function saveNotesToQuizData() {
  if (!currentQuestion.value || !QuizStore.state.quizData) return;

  const questionId = currentQuestion.value.id;
  const newNotes = currentQuestion.value.notes;

  // 获取当前可写的题库数据
  const quizData = QuizStore.getQuizData();
  if (!quizData || !quizData.chapters) return;

  // 查找并更新题库中对应题目的笔记
  let found = false;
  for (const chapter of quizData.chapters) {
    if (!chapter.questions) continue;

    for (const question of chapter.questions) {
      if (question.id === questionId) {
        question.notes = newNotes;
        found = true;
        break;
      }
    }
    if (found) break;
  }

  if (found) {
    // 更新QuizStore的题库数据
    QuizStore.setQuizData(quizData);

    // 保存到存储，确保笔记与题库数据一起保存
    QuizStore.saveToStorage();
  }
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
    // 配置 marked 选项
    const markedOptions = {
      breaks: true,
      gfm: true,
      tables: true,
      headerIds: false,
      html: true,
      xhtml: true
    };
    marked.setOptions(markedOptions);

    // 预处理笔记内容，处理一些特殊格式
    const processedContent = noteContent
      // 将 • 开头的行转为 HTML 无序列表
      .replace(/^([\\s]*?)[•\\-\\*]\\s+(.*?)$/gm, '<li>$2</li>')

      // 将 数字+. 开头的行转为 HTML 有序列表
      .replace(/^([\\s]*?)(\\d+\\.\\s+)(.*?)$/gm, '<ol>$2$3</ol>')

      // 正确处理 Markdown 粗体
      .replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>'); // Use correct regex for bold

    // 解析 Markdown
    const htmlContent = marked.parse(processedContent) as string;

    // 包裹最终内容
    renderedNotesHtml.value = `${htmlContent}`;


    // 在流式生成时添加光标动画
    if (isGeneratingNote.value) {
      // 需要找到 .markdown-body 内部的最后一个元素来追加光标
      // 暂时简单追加到末尾，后续可优化
      renderedNotesHtml.value = renderedNotesHtml.value.replace('</div>', '<span class="typing-cursor"></span></div>');
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
        // 修改选择器以查找 pre > code.language-mermaid
        const mermaidCodeBlocks = notesDisplayRef.value.querySelectorAll('pre code.language-mermaid');
        mermaidCodeBlocks.forEach(block => {
          try {
            const code = block.textContent || '';
            if (!code.trim()) return;

            const mermaidDiv = document.createElement('div');
            mermaidDiv.className = 'mermaid';
            mermaidDiv.textContent = code;

            // 查找父元素 pre 标签
            const preElement = block.closest('pre');
            if (preElement && preElement.parentNode) {
              // 使用新的mermaidDiv替换掉整个preElement
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

  // 使用 configService 获取 API 配置
  const currentApiConfig = configService.getApiConfig();

  // 验证必要的API配置
  if (!currentApiConfig.apiUrl || !currentApiConfig.apiKey) {
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
      // 使用 configService 中的配置
      model: currentApiConfig.model,
      messages: [
        { role: "system", content: currentApiConfig.systemPrompt },
        { role: "user", content: prompt }
      ],
      stream: currentApiConfig.streamOutput !== false, // 使用 configService 中的配置
      temperature: currentApiConfig.temperature,       // 使用 configService 中的配置
      top_p: currentApiConfig.topP                     // 使用 configService 中的配置
    };

    const response = await fetch(currentApiConfig.apiUrl, { // 使用 configService 中的配置
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentApiConfig.apiKey}`
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
      // 使用新的保存到题库数据的方法
      saveNotesToQuizData();
      // 不再单独保存笔记
      // saveCurrentNotesState();
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
    if (apiConfig.value.streamOutput && currentQuestion.value) {
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

          // 检查是否需要自动同步到远程仓库，只检查autoSync设置
          if (apiConfig.value.autoSync) {
            showToast('正在自动同步到远程仓库...', 'info');
            triggerSync();
          }
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
  // 使用 apiConfig 计算属性替代本地 config
  if (!apiConfig.value?.enabled || !apiConfig.value?.autoGenerate || isGeneratingNote.value) return;

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

          // 将笔记保存到题库数据，而非单独保存
          saveNotesToQuizData();
          // 不再使用单独保存笔记的方法
          // saveNotesToLocalStorage();
        }
      });
    }
  }
}
// 触发笔记同步
function triggerSync() {
  if (syncStatus.value === 'pending') return;

  syncStatus.value = 'pending';
  showToast('笔记同步中...', 'info');

  try {
    // 保存到本地存储 (使用 QuizStore 保存)
    saveNotesToQuizData(); // 确保最新笔记已在QuizStore中

    // 获取GitHub配置 (从 configService 获取)
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
      // 考虑打开设置模态框
      showSyncConfigModal.value = true;
      return;
    }

    // 构建API路径
    let apiPath = path.replace(/\/+$/, '');
    if (!apiPath.endsWith('.json')) {
      apiPath = apiPath ? `${apiPath}/${syncQuizName}.json` : `${syncQuizName}.json`;
    }

    // 获取要同步的完整题库数据
    const currentQuizData = QuizStore.getQuizData();
    if (!currentQuizData) {
      syncStatus.value = 'error';
      showToast('无法获取当前题库数据进行同步', 'error');
      return;
    }

    // 准备要同步的内容 (整个题库)
    const contentJson = JSON.stringify(currentQuizData, null, 2); // Pretty print JSON
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

// 应用设置
function applySettings(newSettings: AppSettings) {
  // 更新configService中的设置
  configService.updateSettings(newSettings);

  // 同步本地配置状态
  // Object.assign(config, configService.getQuizSettings()); // 'config' is no longer used
  // config.fontFamily = configService.getUiSettings().fontFamily; // 'config' is no longer used
  // config.animationEnabled = configService.getUiSettings().animationEnabled; // 'config' is no longer used
  // config.apiConfig = configService.getApiConfig(); // 'config' is no longer used
}

// 打开当前问题的编辑器
function openCurrentQuestionEditor() {
  if (!quizSettings.value.canEditQuestion || isQuizSubmitted.value || !currentQuestion.value) {
    showToast('当前状态无法编辑题目', 'warning');
    return;
  }
  questionToEdit.value = currentQuestion.value; // 设置要编辑的问题
  showEditModal.value = true;
}

// 处理问题保存事件
function handleSaveQuestion(updatedQuestionData: Partial<Question>) {
  if (!questionToEdit.value || !questionToEdit.value.id) return;

  // 获取需要更新的题目ID
  const questionId = questionToEdit.value.id.toString();
  const quizData = QuizStore.state.quizData;
  if (!quizData || !quizData.chapters) {
    showToast('无法保存，题库数据不完整', 'error');
    return;
  }

  let questionUpdatedInStore = false;
  // 在章节中寻找并更新问题 (更新 Store)
  for (let i = 0; i < quizData.chapters.length; i++) {
    const chapter = quizData.chapters[i];
    const questionIndex = chapter.questions.findIndex(q => String(q.id) === questionId);

    if (questionIndex !== -1) {
      // 找到题目，更新它
      const originalQuestion = chapter.questions[questionIndex];
      const updatedQuestionInStore = { ...originalQuestion };

      // 更新题目属性
      Object.keys(updatedQuestionData).forEach(key => {
        const typedKey = key as keyof Question;
        if (updatedQuestionData[typedKey] !== undefined) {
          (updatedQuestionInStore as Record<string, unknown>)[typedKey] = updatedQuestionData[typedKey];
        }
      });

      // 更新题库中的题目
      chapter.questions[questionIndex] = updatedQuestionInStore;
      questionUpdatedInStore = true;
      break; // 假设ID是唯一的
    }
  }

  // 更新 localQuestions.value 以立即反映 UI
  const localQuestionIndex = localQuestions.value.findIndex(q => String(q.id) === questionId);
  if (localQuestionIndex !== -1) {
    const updatedLocalQuestion = { ...localQuestions.value[localQuestionIndex] };
    Object.keys(updatedQuestionData).forEach(key => {
      const typedKey = key as keyof Question;
      if (updatedQuestionData[typedKey] !== undefined) {
        (updatedLocalQuestion as Record<string, unknown>)[typedKey] = updatedQuestionData[typedKey];
      }
    });
    localQuestions.value[localQuestionIndex] = updatedLocalQuestion;

    // 如果当前显示的是这个题目，确保 currentQuestion 也更新
    if (currentQuestion.value && currentQuestion.value.id === questionId) {
      // currentQuestion 是计算属性，它会从 localQuestions.value 自动更新
    }
  }


  if (questionUpdatedInStore) {
    showToast('题目已更新', 'success');
    QuizStore.saveToStorage(); // 保存到本地存储
  } else {
    showToast('未找到要更新的题目', 'error');
  }
}

// 更新QuizStore源数据的函数
function updateQuizStoreSourceData(updatedQuestionData: Partial<Question>) {
  if (!updatedQuestionData.id) {
    console.error("无法更新题目：缺少ID");
    return;
  }

  const questionId = String(updatedQuestionData.id); // 确保ID为字符串类型

  // 获取QuizStore中的题库数据
  const quizData = QuizStore.getQuizData();
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
    QuizStore.setQuizData(quizData);
    // 保存到存储
    QuizStore.saveToStorage();
    console.log("已更新QuizStore中的题目数据，ID:", updatedQuestionData.id);
  } else {
    console.warn("在QuizStore中未找到要更新的题目，ID:", updatedQuestionData.id);
  }
}

// 存储相关方法

// 保存当前答案状态到localStorage
function saveCurrentAnswerState() {
  if (!currentQuestion.value) return;
  const question = currentQuestion.value;
  const isCorrect = selectedAnswer.value === question.answer;

  try {
    const userAnswers = localStorage.getItem('userAnswers') || '{}';
    const answersData: UserAnswersMap = JSON.parse(userAnswers);

    answersData[String(question.id)] = {
      answer: selectedAnswer.value || '',
      isCorrect: isCorrect,
      timestamp: Date.now()
    };

    localStorage.setItem('userAnswers', JSON.stringify(answersData));
  } catch (err) {
    console.error('保存答题状态失败:', err);
  }
}

// 保存所有笔记到localStorage
function saveNotesToLocalStorage() {
  try {
    // 使用QuizStore保存题库状态
    QuizStore.saveToStorage();
    console.log('笔记已保存到本地存储');
  } catch (err) {
    console.error('批量保存笔记失败:', err);
  }
}

// 触发状态变化
function emitStateChange() {
  console.log("State change triggered internally for index:", currentIndex.value);
}

// --- 生命周期钩子 ---
onMounted(() => {
  try {
    mermaid.initialize({ startOnLoad: true });

    // 初始化题库数据并根据章节过滤
    loadQuizDataAndFilter(); // 调用新的函数

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

// 初始化定时器函数
function initTimer() {
  // 实现定时器初始化逻辑
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
function isCorrectAnswerOption(answer: string | number | number[], optionKey: string): boolean {
  // 如果answer是字符串类型
  if (typeof answer === 'string') {
    // 单选答案(一个字母)
    if (/^[A-Z]$/.test(answer)) {
      return answer === optionKey;
    }
    // 多选答案(多个字母)
    if (/^[A-Z]+$/.test(answer)) {
      return answer.includes(optionKey);
    }
    // 数字字符串
    if (/^\d+$/.test(answer)) {
      // 尝试两种可能的索引转换 (0-based或1-based)
      const indexZeroBased = parseInt(answer);
      const indexOneBased = parseInt(answer) - 1;

      // 选择合适的索引转换为字母
      return String.fromCharCode(65 + indexZeroBased) === optionKey ||
        String.fromCharCode(65 + indexOneBased) === optionKey;
    }
  }

  // 如果answer是数字
  if (typeof answer === 'number') {
    return String.fromCharCode(65 + answer) === optionKey;
  }


  return false;
}

// 获取选项 Key 的 CSS 类 (主要用于对错标记)
function getOptionKeyClass(optionKey: string): string {
  const question = currentQuestion.value;
  if (!question || (!isCurrentAnswered.value && !quizSettings.value.reviewMode)) return ''; // 使用 quizSettings

  const isCorrectAnswer = question.answer === optionKey;
  const isUserWrongAnswer = question.userAnswer === optionKey && question.userAnswer !== question.answer;

  // 显示正确答案和错误选择的标记
  // 正确答案只有在回顾模式或启用立即显示正确答案时才显示
  if (isCorrectAnswer && (quizSettings.value.reviewMode || quizSettings.value.showCorrectAnswerImmediately)) { // 使用 quizSettings
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
  // 使用 configService 获取 swipeGestureEnabled
  if (!quizSettings.value.swipeGestureEnabled) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY; // 记录Y轴起始位置
}

function handleTouchEnd(e: TouchEvent) {
  // 使用 configService 获取 swipeGestureEnabled
  if (!quizSettings.value.swipeGestureEnabled) return;
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY; // 记录Y轴结束位置
  const diffX = touchStartX - touchEndX;
  const diffY = touchStartY - touchEndY; // 计算Y轴差值

  // 获取屏幕尺寸，计算阈值
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const horizontalThreshold = screenWidth * 0.15;
  const verticalThreshold = screenHeight * 0.10;

  // 检查滑动是否主要为水平方向，且超过阈值
  if (Math.abs(diffX) > horizontalThreshold && Math.abs(diffY) < verticalThreshold) {
    if (diffX > 0) { // 左滑 -> 下一题
      // 使用 canGoNext 计算属性判断
      if (canGoNext.value) {
        nextQuestion();
      }
    } else { // 右滑 -> 上一题
      // 使用 canGoPrev 计算属性判断
      if (canGoPrev.value) {
        previousQuestion();
      }
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
    if (canSubmit.value) { // 使用 canSubmit
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
    // 如果提供了容器，只处理容器内的图表
    const targets = container
      ? container.querySelectorAll('pre code.language-mermaid')
      : document.querySelectorAll('.mermaid');

    if (targets.length === 0) return;

    targets.forEach((el, index) => {
      if (el instanceof HTMLElement && !el.querySelector('svg')) {
        try {
          const id = `mermaid-diagram-${Date.now()}-${index}`;
          el.id = id;

          // 使用正确的类型处理mermaid.render回调 (移除第四个参数)
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

// 渲染笔记中的特定容器内的Mermaid图表
function renderMermaidInContainer(container: HTMLElement) {
  if (!container) return;

  const mermaidCodeBlocks = container.querySelectorAll('pre code.language-mermaid');
  mermaidCodeBlocks.forEach((el, index) => {
    if (el instanceof HTMLElement) {
      const id = `mermaid-diagram-${Date.now()}-${index}`;
      el.id = id;

      // 修复类型问题 (移除第四个参数)
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

// 新增：根据章节过滤题目
function filterQuestionsByChapter(chapterTitle: string) {
  const fullQuizData = QuizStore.getQuizData();
  if (!fullQuizData || !fullQuizData.chapters) {
    localQuestions.value = [];
    error.value = '无法加载题库数据';
    loading.value = false;
    return;
  }

  let filteredQuestions: Question[] = [];
  const userAnswers: UserAnswersMap = JSON.parse(localStorage.getItem('userAnswers') || '{}');

  if (chapterTitle === 'all') {
    // 加载所有章节题目
    fullQuizData.chapters.forEach((chapter, chapterIndex) => {
      if (!chapter.questions) return;
      chapter.questions.forEach((q, questionIndex) => {
        const questionId = q.id || `q-${chapterIndex}-${questionIndex}`;
        const userAnswerRecord = userAnswers[questionId];
        filteredQuestions.push({
          ...q,
          id: questionId,
          title: q.title || '',
          options: q.options || [],
          answer: typeof q.answer === 'string' ? q.answer : String(q.answer ?? ''),
          question: q.question || q.title || '',
          chapterTitle: chapter.title,
          number: q.number || (questionIndex + 1),
          userAnswer: userAnswerRecord ? userAnswerRecord.answer : null
        });
      });
    });
  } else {
    // 加载指定章节题目
    const targetChapter = fullQuizData.chapters.find(c => c.title === chapterTitle);
    if (targetChapter && targetChapter.questions) {
      filteredQuestions = targetChapter.questions.map((q, index) => {
        const questionId = q.id || `q-${chapterTitle}-${index}`;
        const userAnswerRecord = userAnswers[questionId];
        return {
          ...q,
          id: questionId,
          title: q.title || '',
          options: q.options || [],
          answer: typeof q.answer === 'string' ? q.answer : String(q.answer ?? ''),
          question: q.question || q.title || '',
          chapterTitle: chapterTitle,
          number: q.number || (index + 1),
          userAnswer: userAnswerRecord ? userAnswerRecord.answer : null
        };
      });
    }
  }

  localQuestions.value = filteredQuestions;
  error.value = filteredQuestions.length === 0 ? '该章节下没有题目' : null;

  // 更新错题记录 (基于新的题目列表)
  wrongQuestionIds.value = filteredQuestions
    .filter(q => q.userAnswer !== null && q.userAnswer !== undefined && q.userAnswer !== q.answer)
    .map(q => String(q.id));
}

// 监听章节选择变化
watch(selectedChapter, (newChapter) => {
  console.log(`章节切换到: ${newChapter}`);
  loading.value = true; // 开始加载
  filterQuestionsByChapter(newChapter);
  // 重置状态
  currentIndex.value = 0;
  selectedAnswer.value = null;
  isQuizSubmitted.value = false;
  // wrongQuestionIds 已经在 filterQuestionsByChapter 中更新
  isReviewingWrong.value = false;

  if (localQuestions.value.length > 0) {
    loadQuestion(0); // 加载新题目集的第一题
  } else {
    // 处理没有题目的情况，例如显示提示信息
    console.warn('切换章节后没有题目可加载');
  }
  loading.value = false; // 加载完成
});

// 格式化题目文本，去除顿号
function formatQuestionText(text: string | undefined): string {
  if (!text) return '';
  // 将所有顿号（、）替换为空字符
  return text.replace(/、/g, '');
}
</script>
