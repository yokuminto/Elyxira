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
          <font-awesome-icon icon="arrow-left" />
        </button>
        <h1 class="page-quiz__title">{{ quizTitle }}</h1>
        <!-- 操作按钮区域 -->
        <div class="page-quiz__header-actions">
          <!-- 主题切换按钮 -->
          <div class="page-quiz__theme-toggle" @click="toggleTheme" :class="{ 'dark': isDarkMode }">
            <font-awesome-icon icon="sun" class="sun-icon" />
            <font-awesome-icon icon="moon" class="moon-icon" />
          </div>
          <button class="page-quiz__settings-button" @click="showModalSettings = true" title="设置" aria-label="设置">
            <font-awesome-icon icon="cog" />
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
            <!-- <i data-feather="repeat"></i> -->
            <font-awesome-icon icon="repeat" />
            <span>刷题模式</span>
          </button>
          <button class="page-quiz__mode-button" @click="showOverviewModal = true">
            <!-- <i data-feather="grid"></i> -->
            <font-awesome-icon icon="th-large" /> <!-- 使用 th-large 替代 grid -->
            <span>题目总览</span>
          </button>
          <button class="page-quiz__mode-button edit-button" v-if="quizSettings.canEditQuestion"
            @click="openCurrentQuestionEditor">
            <!-- <i data-feather="edit"></i> -->
            <font-awesome-icon icon="edit" />
            <span>编辑题目</span>
          </button>
        </div>
      </div>
      <!-- 问题区域 -->
      <div class="page-quiz__question-area" ref="questionAreaRef">
        <transition name="question-fade-slide" mode="out-in">
          <div v-if="!loading && currentQuestion" :key="currentQuestion.id || currentIndex">
            <div class="page-quiz__question-content-wrapper">
              <!-- Question Content -->
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
                  <button class="page-quiz__button page-quiz__submit-button" @click="submitAnswer"
                    :disabled="!canSubmit">
                    <!-- <i data-feather="check-circle"></i> -->
                    <font-awesome-icon icon="check-circle" />
                    提交
                    <span class="page-quiz__key-hint">空格</span>
                  </button>
                  <button class="page-quiz__button page-quiz__next-button" @click="nextQuestion" :disabled="!canGoNext">
                    <span>下一题</span>
                    <!-- <i data-feather="chevron-right"></i> -->
                    <font-awesome-icon icon="chevron-right" />
                    <span class="page-quiz__key-hint">空格</span>
                  </button>
                </div>
                <div class="page-quiz__action-right">
                  <button class="page-quiz__button page-quiz__submit-all-button" @click="submitQuiz"
                    :disabled="isQuizSubmitted">
                    <!-- <i data-feather="check-circle"></i> -->
                    <font-awesome-icon icon="check-circle" />
                    交卷
                  </button>
                  <button class="page-quiz__button page-quiz__nav-button" @click="previousQuestion"
                    :disabled="!canGoPrev">
                    <!-- <i data-feather="chevron-left"></i> -->
                    <font-awesome-icon icon="chevron-left" />
                    <span>上一题</span>
                  </button>
                  <button class="page-quiz__button page-quiz__redo-button" @click="redoQuiz"
                    :disabled="isQuizSubmitted">
                    <!-- <i data-feather="rotate-ccw"></i> -->
                    <font-awesome-icon icon="undo" /> <!-- 使用 undo 替代 rotate-ccw -->
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
                      <!-- <i data-feather="refresh-cw"></i> -->
                      <font-awesome-icon icon="sync" />
                    </button>
                    <button class="page-quiz__button page-quiz__button--icon" @click="toggleNotesEditor"
                      :disabled="isQuizSubmitted || isGenerating" :title="isEditingNotes ? '取消编辑' : '编辑笔记'">
                      <!-- <i v-if="!isEditingNotes" data-feather="edit"></i> -->
                      <!-- <i v-else data-feather="x"></i> -->
                      <font-awesome-icon :icon="isEditingNotes ? 'times' : 'edit'" />
                    </button>
                    <button class="page-quiz__button page-quiz__button--icon page-quiz__ai-button icon-only"
                      @click="triggerAINotesGeneration" :disabled="isQuizSubmitted || isGenerating"
                      :class="{ 'button--loading': isGeneratingCurrent }"
                      :title="isGeneratingCurrent ? '正在生成笔记...' : 'AI生成笔记'">
                      <span v-if="isGeneratingCurrent" class="loading-spinner"></span>
                      <!-- <i v-else data-feather="zap"></i> -->
                      <font-awesome-icon v-else icon="bolt" />
                    </button>
                    <button class="page-quiz__button page-quiz__button--icon page-quiz__settings-button"
                      @click="openSyncConfigModal" title="GitHub仓库设置">
                      <!-- <i data-feather="github"></i> -->
                      <font-awesome-icon :icon="['fab', 'github']" /> <!-- 使用 brands 图标 -->
                    </button>
                    <button class="page-quiz__button page-quiz__button--icon page-quiz__settings-button"
                      @click="showApiConfigModal = true" title="API设置">
                      <!-- <i data-feather="sliders"></i> -->
                      <font-awesome-icon icon="sliders-h" />
                    </button>
                  </div>
                </div>

                <!-- Reasoning Section (Moved Above Notes Display/Editor) -->
                <div v-if="isGeneratingCurrent && reasoningContent && !hasContentStartedStreaming"
                  class="page-quiz__notes-reasoning" ref="reasoningContainerRef">
                  <div class="reasoning-content markdown-body" v-html="renderedReasoningHtml"></div>
                </div>
                <!-- End Reasoning Section -->

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
                  </div>
                  <textarea ref="notesTextareaRef" class="page-quiz__notes-textarea" placeholder="在此添加笔记..."
                    v-model="notesEditText" @input="autoResizeTextarea"></textarea>
                  <button @click="saveNotes" class="page-quiz__button page-quiz__button--primary">保存笔记</button>
                </div>
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
import configService, { QuizMode, type Question, type GithubConfig, type UiSettings, type QuizSettings, type AppSettings, type ApiConfig } from '@/services/config-service'
import { showToast } from '@/utils/toast'
import ModalQuestionOverview from '@/modals/modal-question-overview.vue'
import ModalStatistics from '@/modals/modal-statistics.vue'
import ModalSettings from '@/modals/modal-settings.vue'
import ModalQuestionEdit from '@/modals/modal-question-edit.vue'
import ModalQuizSync from '@/modals/modal-quiz-sync.vue'
import ModalApiConfig from '@/modals/modal-api-config.vue'
import './page-quiz.css'
import '../../styles/variables.css'
import '../../styles/quiz-medical.css'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false, // Changed from true to false
  xhtmlOut: true,
});
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
const router = useRouter();
const loading = ref(true);
const error = ref<string | null>(null);
const localQuestions = ref<Question[]>([]);
const currentIndex = ref(0);
const selectedAnswer = ref<string | null>(null);
const isQuizSubmitted = ref(false);
const wrongQuestionIds = ref<string[]>([]);
const isReviewingWrong = ref(false);
const syncStatus = ref<'idle' | 'pending' | 'success' | 'error'>('idle');
const activeGenerationIndex = ref<number | null>(null);
const selectedChapter = ref('all');
const chapters = ref<string[]>([]);
const isEditingNotes = ref(false);
const isGenerating = ref(false);
const notesEditText = ref('');
const renderedNotesHtml = ref('');
const forceShowNotes = ref(false);
const reasoningContent = ref<string>('');
const renderedReasoningHtml = ref<string>(''); // RE-ADDED
const hasContentStartedStreaming = ref(false); // <-- ADDED: Flag for content start
const showOverviewModal = ref(false);
const showModalStatistics = ref(false);
const showModalSettings = ref(false);
const showEditModal = ref(false);
const showSyncConfigModal = ref(false);
const showApiConfigModal = ref(false);
const questionToEdit = ref<Question | null>(null);
const toast = reactive<{ show: boolean; message: string; type: 'info' | 'success' | 'warning' | 'error' }>({
  show: false,
  message: '',
  type: 'info'
});
let toastTimer: number | null = null;
const quizSettings = computed(() => configService.getQuizSettings());
const uiSettings = computed(() => configService.getUiSettings());
const apiConfig = computed(() => configService.getApiConfig());
const isDarkMode = computed(() => uiSettings.value.darkMode);
const questionAreaRef = ref<HTMLDivElement | null>(null);
const notesDisplayRef = ref<HTMLDivElement | null>(null);
const notesTextareaRef = ref<HTMLTextAreaElement | null>(null);
const questionTextRef = ref<HTMLElement | null>(null);
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
  wrongQuestionIds: wrongQuestionIds.value.map(String)
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
function navigateBack() {
  router.push('/library');
}
function initializeQuiz() {
  loading.value = true;
  isQuizSubmitted.value = false;
  isReviewingWrong.value = false;
  wrongQuestionIds.value = [];
  error.value = null;
  loadQuizDataAndFilter();
}
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
  selectedChapter.value = savedConfig.chapterIndex || 'all';
  filterQuestionsByChapter(selectedChapter.value);
  if (localQuestions.value.length > 0) {
    nextTick(() => {
      loadQuestion(0);
    });
  } else {
    error.value = `当前章节 "${selectedChapter.value}" 没有题目`;
  }
  loading.value = false;
}
async function loadQuestion(index: number) {
  if (index < 0 || index >= localQuestions.value.length) {
    console.warn("无效的问题索引:", index);
    if (!isQuizSubmitted.value && localQuestions.value.length > 0) {
      submitQuiz();
    }
    return;
  }
  const previousIndex = currentIndex.value;
  currentIndex.value = index;
  selectedAnswer.value = currentQuestion.value?.userAnswer ?? null;
  isEditingNotes.value = false;
  await renderNotesForCurrentQuestion();
  if (questionAreaRef.value) {
    questionAreaRef.value.scrollTo({ top: 0, behavior: 'smooth' });
  }
  // 播放导航音效 (如果不是第一次加载)
  if (previousIndex !== index && index !== 0) { // 避免第一次加载和原地跳转时播放
    playAudio('navigate');
  }
  nextTick(() => {
    checkAndTriggerAutoGeneration();
  });
}
function handleOptionClick(key: string) {
  if (isQuizSubmitted.value || quizSettings.value.reviewMode || isAnswerLocked.value) {
    return;
  }
  selectedAnswer.value = key;
  playAudio('select'); // 播放选择音效
  if (isCurrentAnswered.value && !quizSettings.value.lockAnswerAfterSubmit) {
    updateUserAnswer(key);
  }
  if (quizSettings.value.autoSubmit && !isCurrentAnswered.value) {
    nextTick(submitAnswer);
  }
}
function updateUserAnswer(answerKey: string) {
  const question = currentQuestion.value;
  if (!question) return;
  const previousAnswer = question.userAnswer;
  question.userAnswer = answerKey;
  configService.updateQuestion(question.id, { userAnswer: answerKey });
  const isCorrect = compareAnswers(answerKey, question.answer);
  const questionIdStr = String(question.id);
  const wasWrongIndex = wrongQuestionIds.value.indexOf(questionIdStr);
  const wasWrong = wasWrongIndex !== -1;
  if (!isCorrect && !wasWrong) {
    wrongQuestionIds.value.push(questionIdStr);
  } else if (isCorrect && wasWrong) {
    wrongQuestionIds.value.splice(wasWrongIndex, 1);
  }
  // 播放正确或错误音效
  playAudio(isCorrect ? 'correct' : 'incorrect');
}
function submitAnswer() {
  if (selectedAnswer.value === null || isAnswerLocked.value) return;
  const question = currentQuestion.value;
  if (!question) return;
  const isCorrect = compareAnswers(selectedAnswer.value, question.answer);
  if (question.userAnswer !== selectedAnswer.value) {
    question.userAnswer = selectedAnswer.value;
    const updateSuccess = configService.updateQuestion(question.id, { userAnswer: selectedAnswer.value });
    if (updateSuccess) {
      configService.updateQuizStats({
        totalAnswered: 1,
        correctCount: isCorrect ? 1 : 0,
        wrongCount: isCorrect ? 0 : 1
      });
      const questionIdStr = String(question.id);
      const wasWrongIndex = wrongQuestionIds.value.indexOf(questionIdStr);
      if (!isCorrect && wasWrongIndex === -1) {
        wrongQuestionIds.value.push(questionIdStr);
      } else if (isCorrect && wasWrongIndex !== -1) {
        wrongQuestionIds.value.splice(wasWrongIndex, 1);
      }
      configService.saveQuizState();
    } else {
      console.error("Failed to save user answer via configService for question:", question.id);
      showToast("保存答案失败", "error");
      return;
    }
  }
  if (quizSettings.value.showNotesAfterAnswer) {
    forceShowNotes.value = true;
    renderNotesForCurrentQuestion();
  }
  if (quizSettings.value.autoNext && canGoNext.value) {
    setTimeout(nextQuestion, 1000);
  }
}
function previousQuestion() {
  if (canGoPrev.value) {
    // playAudio('navigate'); // 移动到 loadQuestion 中播放
    loadQuestion(currentIndex.value - 1);
  }
}
function nextQuestion() {
  if (currentIndex.value < totalQuestions.value - 1) {
    // playAudio('navigate'); // 移动到 loadQuestion 中播放
    loadQuestion(currentIndex.value + 1);
  } else if (!isQuizSubmitted.value) {
    showToast('已经是最后一题了', 'info');
  }
}
function jumpToQuestion(index: number) {
  if (index >= 0 && index < totalQuestions.value) {
    // playAudio('navigate'); // 移动到 loadQuestion 中播放
    loadQuestion(index);
  }
}
function submitQuiz() {
  if (isQuizSubmitted.value) return;
  isQuizSubmitted.value = true;
  showModalStatistics.value = true;
  localStorage.setItem('lastQuizStats', JSON.stringify({
    ...quizStats.value,
    timestamp: Date.now(),
    quizTitle: quizTitle.value
  }));
}
function redoQuiz() {
  if (window.confirm('确定要重做本次测验吗？所有答题记录将被清空。')) {
    isQuizSubmitted.value = false;
    wrongQuestionIds.value = [];
    selectedAnswer.value = null;
    isReviewingWrong.value = false;
    const quizData = configService.getQuizData();
    if (quizData) {
      quizData.chapters.forEach(chapter => {
        chapter.questions.forEach(q => {
          if (localQuestions.value.some(lq => lq.id === q.id)) {
            q.userAnswer = null;
          }
        });
      });
      configService.setQuizData(quizData);
      configService.saveQuizState();
    }
    filterQuestionsByChapter(selectedChapter.value);
    currentIndex.value = 0;
    if (localQuestions.value.length > 0) {
      loadQuestion(0);
    }
    showToast('测验已重置', 'success');
  }
}
function viewWrongQuestions() {
  if (wrongQuestionIds.value.length === 0) {
    showToast('没有错题记录', 'info');
    return;
  }
  showModalStatistics.value = false;
  const allQuestions = configService.getQuizData()?.chapters.flatMap(c => c.questions) || [];
  const wrongQs = allQuestions.filter(q => wrongQuestionIds.value.includes(String(q.id)));
  if (wrongQs.length > 0) {
    localQuestions.value = wrongQs.map(q => ({ ...q, userAnswer: null }));
    isQuizSubmitted.value = false;
    isReviewingWrong.value = true;
    currentIndex.value = 0;
    loadQuestion(0);
    showToast(`已切换到错题回顾 (${wrongQs.length}题)`, 'info');
  } else {
    showToast('没有找到错题详情', 'warning');
  }
}
function toggleNotesEditor() {
  isEditingNotes.value = !isEditingNotes.value;
  if (isEditingNotes.value) {
    notesEditText.value = currentQuestion.value?.notes || '';
    nextTick(() => {
      if (notesTextareaRef.value) {
        notesTextareaRef.value.focus();
        autoResizeTextarea();
      }
    });
  }
}
function saveNotes() {
  if (!currentQuestion.value || !currentQuestion.value.id) return;
  const updatedNotes = notesEditText.value;
  const success = configService.saveNoteToQuestion(currentQuestion.value.id, updatedNotes);
  if (success) {
    const localQIndex = localQuestions.value.findIndex(q => q.id === currentQuestion.value?.id);
    if (localQIndex > -1) {
      localQuestions.value[localQIndex].notes = updatedNotes;
    }
    isEditingNotes.value = false;
    nextTick(renderNotesForCurrentQuestion);
    showToast('笔记已保存', 'success');
  } else {
    showToast('保存笔记失败', 'error');
  }
}
async function renderNotesForCurrentQuestion() {
  const question = currentQuestion.value;
  if (!question) {
    renderedNotesHtml.value = '<p class="page-quiz__notes-placeholder">请先加载题目</p>';
    return;
  }
  const noteContent = question.notes || '';
  const isGeneratingThisQuestion = isGenerating.value && activeGenerationIndex.value === currentIndex.value;
  console.log(`[DEBUG] renderNotes: Index=${currentIndex.value}, isGeneratingThis=${isGeneratingThisQuestion}, Note Length=${noteContent.length}`);

  try {
    let htmlContent = '';
    if (isGeneratingThisQuestion) {
      htmlContent = noteContent
        ? md.render(noteContent)
        : '<p class="page-quiz__notes-placeholder">思考中...</p>';
      console.log('[DEBUG] Rendered HTML Output (Generating):\n', htmlContent); // Log rendered HTML (generating case)
    }
    else if (noteContent) {
      // Render raw content directly, letting markdown-it handle paragraphs and lists
      // const preprocessedContent = preprocessLineBreaks(noteContent); // Bypassed preprocessing
      // console.log('[DEBUG] Preprocessed Content for Rendering:\n', preprocessedContent);
      htmlContent = md.render(noteContent);
      console.log('[DEBUG] Rendered HTML Output (Raw Note Rendered):\n', htmlContent);
    }
    renderedNotesHtml.value = htmlContent || '<p class="page-quiz__notes-placeholder">暂无笔记，可点击编辑或AI生成。</p>';

  } catch (error) {
    console.error('笔记 Markdown 渲染失败:', error);
    renderedNotesHtml.value = `<p class="page-quiz__notes-error">笔记内容解析失败: ${error instanceof Error ? error.message : '未知错误'}</p>`;
  }
}
function insertMarkdown(markup: string) {
  const textarea = notesTextareaRef.value;
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;
  const selectedText = text.substring(start, end);
  let insertedMarkup = markup;
  let selectionOffset = 0;
  const placeholders: Record<string, string> = {
    '**粗体**': '粗体',
    '*斜体*': '斜体',
    '# 标题': '标题',
    '- 列表项': '列表项',
    '```\\n代码块\\n```': '代码块',
  };
  for (const key in placeholders) {
    if (markup === key && selectedText) {
      insertedMarkup = markup.replace(placeholders[key], selectedText);
      if (key.includes('**') || key.includes('*')) {
        selectionOffset = key.indexOf(placeholders[key]);
      } else if (key.includes('```')) {
        selectionOffset = key.indexOf('\n') + 1;
      }
      break;
    }
  }
  textarea.value = text.substring(0, start) + insertedMarkup + text.substring(end);
  notesEditText.value = textarea.value;
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
function autoResizeTextarea() {
  const textarea = notesTextareaRef.value;
  if (textarea) {
    textarea.style.height = 'auto';
    nextTick(() => {
      if (textarea) {
        const scrollHeight = textarea.scrollHeight;
        const minHeight = 80;
        textarea.style.height = `${Math.max(scrollHeight, minHeight)}px`;
      }
    });
  }
}
async function generateAINotes(
  question: Question | null,
  generationTargetIndex: number,
  completionCallback: CompletionCallback,
) {
  console.log(`[LOG] 请求生成笔记: 目标索引=${generationTargetIndex}, 问题ID=${question?.id ?? 'null'}`);
  const questionRef = localQuestions.value[generationTargetIndex];
  if (!questionRef) {
    completionCallback('', generationTargetIndex, '无法获取问题信息');
    return;
  }
  const currentApiConfig = configService.getApiConfig();
  if (!currentApiConfig.enabled || !currentApiConfig.apiUrl || !currentApiConfig.apiKey) {
    showToast('请先启用并配置AI API设置', 'info');
    showApiConfigModal.value = true;
    completionCallback(questionRef.notes ?? '', generationTargetIndex, 'API未配置或未启用');
    return;
  }
  let lastRenderTime = 0;
  const baseThrottleDelay = 150;
  let renderTimeoutId: number | null = null;
  let autoSaveTimeoutId: number | null = null;
  const autoSaveNotes = () => {
    if (autoSaveTimeoutId) clearTimeout(autoSaveTimeoutId);
    autoSaveTimeoutId = window.setTimeout(() => {
      if (activeGenerationIndex.value === generationTargetIndex && questionRef && questionRef.id && questionRef.notes) {
        console.log(`[LOG] Auto-saving notes for index ${generationTargetIndex}`);
        configService.saveNoteToQuestion(questionRef.id, questionRef.notes);
      } else {
      }
    }, 2000);
  };
  const handleStreamChunk: StreamCallback = (chunk, streamTargetIndex) => {
    if (streamTargetIndex !== generationTargetIndex || !questionRef) return;
    const reasoningMarker = "[REASONING_START]";
    if (chunk.includes(reasoningMarker)) {
      console.warn("Reasoning marker detected, but handling not fully implemented yet.");
      questionRef.notes = (questionRef.notes || '') + chunk;
    } else {
      questionRef.notes = (questionRef.notes || '') + chunk;
    }
    autoSaveNotes();
    if (currentIndex.value === streamTargetIndex) {
      const now = Date.now();
      const fixedThrottleDelay = 250;
      if (!renderTimeoutId) {
        renderTimeoutId = window.setTimeout(() => {
          if (activeGenerationIndex.value === streamTargetIndex && currentIndex.value === streamTargetIndex) {
            renderNotesForCurrentQuestion();
            lastRenderTime = Date.now();
          }
          renderTimeoutId = null;
        }, fixedThrottleDelay);
      } else if (now - lastRenderTime > fixedThrottleDelay * 4) {
        clearTimeout(renderTimeoutId);
        renderTimeoutId = null;
        if (activeGenerationIndex.value === streamTargetIndex && currentIndex.value === streamTargetIndex) {
          renderNotesForCurrentQuestion();
          lastRenderTime = now;
        }
      }
    }
  };
  const handleCompletion: CompletionCallback = async (finalNote, completedIndex, error) => {
    console.log(`[LOG] 生成完成: Index=${completedIndex}, Expected=${generationTargetIndex}, Error=${error || 'None'}, Final Length=${finalNote?.length}`);
    if (renderTimeoutId) clearTimeout(renderTimeoutId);
    if (autoSaveTimeoutId) clearTimeout(autoSaveTimeoutId);
    const completedQuestionRef = localQuestions.value[completedIndex];
    if (activeGenerationIndex.value !== completedIndex) {
      console.warn(`[WARN] 忽略过时的完成回调 (Completed: ${completedIndex}, Active: ${activeGenerationIndex.value})`);
      return;
    }
    const previousActiveIndex = activeGenerationIndex.value;
    activeGenerationIndex.value = null;
    isGenerating.value = false;
    console.log(`[LOG] Resetting generation state: activeGenerationIndex from ${previousActiveIndex} to null`);
    if (!completedQuestionRef) {
      console.warn(`[WARN] Generation completed for index ${completedIndex}, but the question object no longer exists after state reset.`);
      checkAndTriggerAutoGeneration();
      return;
    }
    try {
      completedQuestionRef.notes = finalNote;
      if (completedQuestionRef.id) {
        console.log(`[LOG] 最终保存索引 ${completedIndex} 的笔记 (Length: ${finalNote?.length})`);
        configService.saveNoteToQuestion(completedQuestionRef.id, completedQuestionRef.notes);
        configService.saveQuizState();
      } else {
        console.error(`[ERROR] 无法为索引 ${completedIndex} 执行最终保存，缺少问题ID`);
      }
      if (currentIndex.value === completedIndex) {
        console.log(`[LOG] Rendering final Markdown for currently viewed index ${completedIndex}`);
        await nextTick();
        await renderNotesForCurrentQuestion();
        await nextTick();
      }
      if (error) {
        showToast(`题目 ${completedIndex + 1} 笔记生成失败: ${error}`, 'error');
      } else {
        if (finalNote && finalNote.trim().length > 0) {
          showToast(`题目 ${completedIndex + 1} 笔记生成完成`, 'success');
        } else {
          showToast(`题目 ${completedIndex + 1} 笔记生成结束 (无内容)`, 'info');
        }
      }
      if (!error && apiConfig.value.autoSync) {
        showToast('正在自动同步到远程仓库...', 'info');
        triggerSync();
      }
    } catch (completionError) {
      console.error(`[ERROR] 处理索引 ${completedIndex} 的完成回调时出错:`, completionError);
      showToast('处理笔记生成结果时出错', 'error');
    } finally {
      console.log("[LOG] 完成处理结束，检查下一个自动生成。");
      checkAndTriggerAutoGeneration();
    }
  };
  try {
    const requestData = configService.getNotesGenerationRequestParams(questionRef);
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
    if (requestData.stream && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let lastDataReceived = Date.now();
      const dataTimeout = 30000;
      const heartbeatInterval = setInterval(() => {
        if (Date.now() - lastDataReceived > dataTimeout) {
          console.warn(`[WARN] 数据流接收超时，可能存在网络问题 (Index: ${generationTargetIndex})`);
          clearInterval(heartbeatInterval);
          reader.cancel('Timeout').catch(console.error);
          handleCompletion(questionRef?.notes?.trim() ?? '', generationTargetIndex, '数据流接收超时');
        }
      }, 10000);
      try {
        while (true) {
          const { done, value } = await reader.read();
          lastDataReceived = Date.now();
          if (done) {
            console.log(`[LOG] 流读取完成 (done) for index ${generationTargetIndex}`);
            break;
          }
          buffer += decoder.decode(value, { stream: true });
          let lineEndIndex;
          while ((lineEndIndex = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, lineEndIndex).trim();
            buffer = buffer.slice(lineEndIndex + 1);
            console.log(`[DEBUG] Raw Line: ${line}`);
            if (line.startsWith('data: ')) {
              const dataStr = line.substring(6);
              console.log(`[DEBUG] Data String: ${dataStr}`);
              if (dataStr === '[DONE]') {
                console.log(`[LOG] 收到 [DONE] 信号，索引 ${generationTargetIndex}`);
                continue;
              }
              try {
                const parsed = JSON.parse(dataStr);
                console.log(`[DEBUG] Parsed JSON:`, parsed);
                let content = '';
                let reasoningChunk = ''; // 新增: 用于存储reasoning片段
                if (parsed.choices && parsed.choices.length > 0) {
                  const delta = parsed.choices[0].delta; // 获取delta对象
                  if (delta) { // 检查delta是否存在
                    if (delta.content) {
                      content = delta.content;
                    }
                    // --- 新增: 提取reasoning ---
                    if (delta.reasoning) {
                      reasoningChunk = delta.reasoning;
                    }
                    // --- 结束新增 ---
                  } else if (parsed.choices[0].message && parsed.choices[0].message.content) {
                    // 处理非delta的内容 (流式传输中不太可能，但保留兼容性)
                    content = parsed.choices[0].message.content;
                  } else if (parsed.choices[0].text) {
                    // 处理旧格式
                    content = parsed.choices[0].text;
                  }
                } else if (parsed.delta && parsed.delta.content) { // 兼容某些API直接返回delta的情况
                  content = parsed.delta.content;
                  // --- 新增: 提取reasoning (兼容结构) ---
                  if (parsed.delta.reasoning) {
                    reasoningChunk = parsed.delta.reasoning;
                  }
                  // --- 结束新增 ---
                } else if (parsed.delta && parsed.delta.text) { // 兼容旧格式
                  content = parsed.delta.text;
                } else if (parsed.text) { // 兼容更旧的格式
                  content = parsed.text;
                }
                console.log(`[DEBUG] Extracted Content: '${content}', Reasoning: '${reasoningChunk}'`); // 修改日志输出
                if (content) {
                  // Check if this is the first content chunk
                  if (!hasContentStartedStreaming.value) {
                    console.log("[LOG] First content chunk received, hiding reasoning.");
                    hasContentStartedStreaming.value = true; // <-- ADDED: Set flag on first content
                  }
                  handleStreamChunk(content, generationTargetIndex);
                }
                // --- 修改: 限制显示的Reasoning行数 ---
                if (reasoningChunk) {
                  reasoningContent.value += reasoningChunk; // 直接追加
                }
                // --- 结束修改 ---
              } catch (e) {
                if (dataStr.trim()) {
                  console.error('[ERROR] 解析流式 JSON 出错:', e, '原始行:', line, `(Index: ${generationTargetIndex})`);
                } else {
                }
              }
            } else if (line) {
              console.warn(`[WARN] Received non-data line: ${line}`);
            }
          }
        }
        console.log(`[DEBUG] Final notes in ref before completion (Index ${generationTargetIndex}):`, questionRef?.notes?.substring(0, 100) + "...");
      } catch (streamError) {
        console.error(`[ERROR] 流读取过程中发生错误 (Index: ${generationTargetIndex}):`, streamError);
        clearInterval(heartbeatInterval);
        handleCompletion(questionRef?.notes?.trim() ?? '', generationTargetIndex, `流处理错误: ${(streamError as Error).message}`);
        return;
      } finally {
        clearInterval(heartbeatInterval);
      }
      console.log(`[LOG] 流处理完成，索引 ${generationTargetIndex}. 最终笔记长度: ${questionRef?.notes?.length ?? 0}`);
      const finalNotesBeforeCallback = questionRef?.notes?.trim() ?? '';
      console.log(`[DEBUG] Calling completion for Index ${generationTargetIndex} with final notes:`, finalNotesBeforeCallback.substring(0, 100) + "...");
      handleCompletion(finalNotesBeforeCallback, generationTargetIndex);
    } else {
      const data = await response.json();
      console.log("[DEBUG] Non-streaming response data:", data);
      const nonStreamedNote = data.choices?.[0]?.message?.content ||
        data.choices?.[0]?.text ||
        data.content?.[0]?.text ||
        '';
      if (questionRef) {
        questionRef.notes = nonStreamedNote;
      }
      console.log(`[LOG] 非流式响应笔记 (Index: ${generationTargetIndex}):`, nonStreamedNote.substring(0, 100) + "...");
      handleCompletion(questionRef?.notes?.trim() ?? '', generationTargetIndex);
    }
  } catch (error) {
    console.error(`[ERROR] 生成笔记失败，索引 ${generationTargetIndex}:`, error);
    handleCompletion(questionRef?.notes?.trim() ?? '', generationTargetIndex, `笔记生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}
function triggerAINotesGeneration() {
  if (!currentQuestion.value || isQuizSubmitted.value) return;
  forceShowNotes.value = true;
  reasoningContent.value = '';
  renderedReasoningHtml.value = '';
  hasContentStartedStreaming.value = false; // <-- ADDED: Reset flag on manual trigger
  requestNoteGeneration(currentIndex.value, true);
}
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
    if (syncStatus.value === 'pending') {
      syncStatus.value = 'idle';
    }
  }
}
function openSyncConfigModal() {
  showSyncConfigModal.value = true;
}
function handleSyncConfigSave(config: Partial<GithubConfig>) {
  console.log('同步配置已保存:', config);
  configService.updateGithubConfig(config);
}
async function handleSyncComplete(result: { action: string; quiz: string; overrideLocal?: boolean; success: boolean }) {
  console.log('同步完成', result);
  const syncResult = await configService.handleQuizSyncComplete(result);
  if (syncResult && syncResult.data && configService.getQuizData()) {
    const lastLoaded = configService.getLastLoadedQuiz();
    if (lastLoaded && lastLoaded.name === syncResult.quizName && syncResult.wasOverridden) {
      configService.setQuizData(syncResult.data);
      initializeQuiz();
      showToast(`已更新当前题库: ${syncResult.quizName}`, 'success');
    }
  }
}
function openApiConfigModal() {
  showApiConfigModal.value = true;
}
function getCompleteApiConfig(): ApiConfig {
  return configService.getApiConfig();
}
function openCurrentQuestionEditor() {
  if (!quizSettings.value.canEditQuestion || isQuizSubmitted.value || !currentQuestion.value) {
    showToast('当前状态无法编辑题目', 'warning');
    return;
  }
  questionToEdit.value = JSON.parse(JSON.stringify(currentQuestion.value));
  showEditModal.value = true;
}
function closeEditModal() {
  showEditModal.value = false;
  questionToEdit.value = null;
}
function handleSaveQuestion(updatedQuestionData: Partial<Question>) {
  if (!questionToEdit.value || !questionToEdit.value.id) {
    console.error("无法保存：编辑中的问题或其ID无效");
    showToast('保存题目失败：内部错误', 'error');
    return;
  }
  const questionId = questionToEdit.value.id;
  const success = configService.updateQuestion(questionId, updatedQuestionData);
  if (success) {
    const localIndex = localQuestions.value.findIndex(q => q.id === questionId);
    if (localIndex !== -1) {
      localQuestions.value[localIndex] = { ...localQuestions.value[localIndex], ...updatedQuestionData };
    }
    if (currentQuestion.value && currentQuestion.value.id === questionId) {
    }
    if ('notes' in updatedQuestionData) {
      renderNotesForCurrentQuestion();
    }
    showToast('题目已更新', 'success');
    closeEditModal();
  } else {
    showToast('更新题目失败', 'error');
  }
}
function getOptionKey(optionText: string | unknown, index: number): string {
  if (typeof optionText === 'string') {
    const keyMatch = optionText.match(/^([A-Z])([.:)]|\s+|$)/i);
    if (keyMatch) {
      return keyMatch[1].toUpperCase();
    }
  }
  return String.fromCharCode(65 + index);
}
function getOptionContent(optionText: string | unknown): string {
  if (typeof optionText !== 'string') return String(optionText);
  const keyMatch = optionText.match(/^([A-Z])([.:)]|\s)\s*/);
  if (keyMatch) {
    return formatQuestionText(optionText.substring(keyMatch[0].length).trim());
  }
  return formatQuestionText(optionText);
}
function getOptionClass(optionKey: string): string {
  const question = currentQuestion.value;
  if (!question) return '';
  const classes = ['page-quiz__option'];
  const isSelected = selectedAnswer.value === optionKey;
  const isUserAnswer = question.userAnswer === optionKey;
  const isCorrect = isCorrectAnswerOption(question.answer, optionKey);
  const answered = isCurrentAnswered.value;
  const reviewMode = quizSettings.value.reviewMode;
  const showCorrect = quizSettings.value.showCorrectAnswerImmediately;
  const locked = isAnswerLocked.value;
  if (isSelected && !locked && !reviewMode) {
    classes.push('page-quiz__option--selected');
  }
  if (answered || reviewMode) {
    if (isCorrect) {
      if (reviewMode || showCorrect) {
        classes.push('page-quiz__option--correct');
      }
      else if (isUserAnswer) {
        classes.push('page-quiz__option--correct');
      }
    } else if (isUserAnswer) {
      classes.push('page-quiz__option--incorrect');
    }
  }
  if (locked || isQuizSubmitted.value) {
    classes.push('page-quiz__option--locked');
  }
  return classes.join(' ');
}
function getOptionKeyClass(optionKey: string): string {
  const question = currentQuestion.value;
  if (!question) return 'page-quiz__option-number';
  const isCorrect = isCorrectAnswerOption(question.answer, optionKey);
  const isUserAnswer = question.userAnswer === optionKey;
  const answered = isCurrentAnswered.value;
  const reviewMode = quizSettings.value.reviewMode;
  const showCorrect = quizSettings.value.showCorrectAnswerImmediately;
  const classes = ['page-quiz__option-number'];
  if (answered || reviewMode) {
    if (isCorrect && (reviewMode || showCorrect)) {
      classes.push('page-quiz__option-number--correct');
    } else if (isUserAnswer && !isCorrect) {
      classes.push('page-quiz__option-number--incorrect');
    }
  }
  return classes.join(' ');
}
function isCorrectAnswerOption(correctAnswer: Question['answer'], optionKey: string): boolean {
  if (correctAnswer === undefined || correctAnswer === null || optionKey === '') return false;
  const optionIndex = optionKey.charCodeAt(0) - 65;
  if (Array.isArray(correctAnswer)) {
    return correctAnswer.some(ans => {
      return ans === optionIndex;
    });
  } else if (typeof correctAnswer === 'number') {
    return correctAnswer === optionIndex;
  } else if (typeof correctAnswer === 'string') {
    return correctAnswer.toUpperCase() === optionKey.toUpperCase();
  }
  console.warn("无法识别的答案格式:", correctAnswer, "对比值:", optionKey);
  return false;
}
function compareAnswers(selected: string | null | undefined, correctAnswer: Question['answer']): boolean {
  if (selected === null || selected === undefined || correctAnswer === undefined || correctAnswer === null) {
    return false;
  }
  return isCorrectAnswerOption(correctAnswer, selected);
}
let touchStartX = 0;
let touchStartY = 0;
let isSwiping = false;
function handleTouchStart(e: TouchEvent) {
  if (!quizSettings.value.swipeGestureEnabled) return;
  if (e.touches.length === 1) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping = false;
  }
}
function handleTouchMove(e: TouchEvent) {
  if (!quizSettings.value.swipeGestureEnabled || touchStartX === 0) return;
  if (e.touches.length === 1) {
    const touchMoveX = e.touches[0].clientX;
    const touchMoveY = e.touches[0].clientY;
    const diffX = touchStartX - touchMoveX;
    const diffY = touchStartY - touchMoveY;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      e.preventDefault();
      isSwiping = true;
    }
  }
}
function handleTouchEnd(e: TouchEvent) {
  if (!quizSettings.value.swipeGestureEnabled || touchStartX === 0) return;
  if (e.changedTouches.length === 1) {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    const horizontalThreshold = window.innerWidth * 0.5; // 修改这里
    const verticalThreshold = window.innerHeight * 0.1;
    if (isSwiping || (Math.abs(diffX) > horizontalThreshold && Math.abs(diffY) < verticalThreshold)) {
      if (diffX > 0) {
        if (canGoNext.value) {
          nextQuestion();
          e.preventDefault();
        }
      } else {
        if (canGoPrev.value) {
          previousQuestion();
          e.preventDefault();
        }
      }
    }
  }
  touchStartX = 0;
  touchStartY = 0;
  isSwiping = false;
}
function handleKeyPress(e: KeyboardEvent) {
  const activeElement = document.activeElement;
  const isInputActive = activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT' || (activeElement as HTMLElement).isContentEditable);
  const isModalActive = !!document.querySelector('.modal.modal--active');
  if (e.key === 'Escape' && isModalActive) {
    e.preventDefault();
    showOverviewModal.value = false;
    showModalStatistics.value = false;
    showModalSettings.value = false;
    closeEditModal();
    showSyncConfigModal.value = false;
    showApiConfigModal.value = false;
    return;
  }
  if (isInputActive || isModalActive) {
    return;
  }
  if (e.key >= '1' && e.key <= '7') {
    const optionIndex = parseInt(e.key) - 1;
    if (currentQuestion.value && optionIndex < currentQuestion.value.options.length) {
      const key = getOptionKey(currentQuestion.value.options[optionIndex], optionIndex);
      handleOptionClick(key);
      e.preventDefault();
    }
  }
  else if (e.key === ' ') {
    e.preventDefault();
    if (isCurrentAnswered.value && canGoNext.value) {
      nextQuestion();
    } else if (canSubmit.value) {
      submitAnswer();
    }
  }
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
  else if (e.key === 'Enter') {
    if (canSubmit.value) {
      submitAnswer();
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
function toggleTheme() {
  configService.toggleDarkMode();
  nextTick(() => {
    renderNotesForCurrentQuestion();
    renderReasoning();
  });
}
function compareQuestionIds(a: Question, b: Question): number {
  const idA = String(a.id || '');
  const idB = String(b.id || '');
  const numA = parseInt(idA.match(/^\d+/)?.[0] || '', 10);
  const numB = parseInt(idB.match(/^\d+/)?.[0] || '', 10);
  if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
    return numA - numB;
  }
  return idA.localeCompare(idB);
}
function formatQuestionText(text: string | undefined): string {
  if (!text) return '';
  return text.replace(/^([A-Z])([.:)]|\s)\s*/, '').trim();
}
function formatQuestionTitle(title: string | undefined): string {
  if (!title) return '';
  return title.replace(/^\s*\d+\s*\.\s*/, '').trim();
}
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
      fullQuizData.chapters.forEach((chapter) => {
        if (chapter.questions && Array.isArray(chapter.questions)) {
          const chapterQuestions = chapter.questions.map(q => ({
            ...q,
            chapterTitle: chapter.title
          }));
          filteredQuestions.push(...chapterQuestions);
        }
      });
    } else {
      const targetChapter = fullQuizData.chapters.find(c => c.title === chapterTitle);
      if (targetChapter && targetChapter.questions && Array.isArray(targetChapter.questions)) {
        filteredQuestions = targetChapter.questions.map(q => ({
          ...q,
          chapterTitle: targetChapter.title
        }));
      }
    }
    const questionNumber = 1;
    filteredQuestions = filteredQuestions.map((q, index) => ({
      ...q,
      id: q.id || `gen_${chapterTitle}_${index}`,
      title: q.title || q.question || '',
      question: q.question || q.title || '',
      options: q.options || [],
    }));
    filteredQuestions.sort(compareQuestionIds);
    if (quizSettings.value.randomMode) {
      for (let i = filteredQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filteredQuestions[i], filteredQuestions[j]] = [filteredQuestions[j], filteredQuestions[i]];
      }
    }
    filteredQuestions.forEach((q, index) => {
      q.number = index + 1;
    });
    localQuestions.value = filteredQuestions;
    error.value = filteredQuestions.length === 0 ? `章节 "${chapterTitle}" 下没有题目` : null;
    wrongQuestionIds.value = filteredQuestions
      .filter(q => q.userAnswer !== null && q.userAnswer !== undefined && !compareAnswers(q.userAnswer, q.answer))
      .map(q => String(q.id));
    configService.setQuizConfig({ chapterIndex: chapterTitle });
    console.log(`Filtered ${filteredQuestions.length} questions. Random mode: ${quizSettings.value.randomMode}`);
  } catch (err) {
    console.error("Error during question filtering:", err);
    error.value = "过滤题目时发生错误";
    localQuestions.value = [];
  } finally {
    loading.value = false;
  }
}
function requestNoteGeneration(targetIndex: number, isManual: boolean) {
  console.log(`[LOG] 请求生成笔记: Index=${targetIndex}, Manual=${isManual}, CurrentGenIndex=${activeGenerationIndex.value}, isGenerating=${isGenerating.value}`);
  const questionToGenerate = localQuestions.value[targetIndex];
  if (!questionToGenerate || isQuizSubmitted.value) {
    console.warn(`[WARN] 忽略生成请求 (Index: ${targetIndex}): 无问题或测验已提交`);
    return;
  }
  if (!isManual && questionToGenerate.notes && questionToGenerate.notes.trim() !== '') {
    console.log(`[LOG] 跳过自动生成 (Index: ${targetIndex}): 已有笔记`);
    checkAndTriggerAutoGeneration();
    return;
  }
  if (isGenerating.value || activeGenerationIndex.value !== null) {
    if (!(isManual && activeGenerationIndex.value === targetIndex)) {
      showToast(`已有笔记生成任务进行中 (题目 ${activeGenerationIndex.value !== null ? activeGenerationIndex.value + 1 : '?'})`, 'info');
    }
    console.warn(`[WARN] 忽略生成请求 (Index: ${targetIndex}): 当前活跃生成 Index: ${activeGenerationIndex.value}`);
    return;
  }
  activeGenerationIndex.value = targetIndex;
  isGenerating.value = true;
  forceShowNotes.value = true;
  // Reset states for the new generation request
  reasoningContent.value = '';
  renderedReasoningHtml.value = '';
  hasContentStartedStreaming.value = false; // <-- ADDED: Reset flag at the start of request processing

  showToast(`开始为题目 ${targetIndex + 1} 生成笔记...`, 'info');
  if (questionToGenerate) {
    questionToGenerate.notes = ''; // Clear existing notes only if manually triggered or auto-gen on empty
    // REMOVED Redundant call: requestNoteGeneration(targetIndex, isManual);
  } else {
    // Handle case where questionToGenerate might be null after async checks (though unlikely here)
    console.error(`[ERROR] Cannot start generation for index ${targetIndex}, question data became unavailable.`);
    activeGenerationIndex.value = null;
    isGenerating.value = false;
    return;
  }

  if (currentIndex.value === targetIndex) {
    renderNotesForCurrentQuestion(); // Render cleared notes or placeholder immediately
  }
  let lastRenderTime = 0;
  const baseThrottleDelay = 150;
  const throttleDelay = baseThrottleDelay;
  const pendingChunks = '';
  let renderTimeoutId: number | null = null;
  let autoSaveTimeoutId: number | null = null;
  const autoSaveNotes = () => {
    if (autoSaveTimeoutId) clearTimeout(autoSaveTimeoutId);
    autoSaveTimeoutId = window.setTimeout(() => {
      if (activeGenerationIndex.value === targetIndex && questionToGenerate.id && questionToGenerate.notes) {
        console.log(`[LOG] Auto-saving notes for index ${targetIndex}`);
        configService.saveNoteToQuestion(questionToGenerate.id, questionToGenerate.notes);
      }
    }, 2000);
  };
  const handleStreamChunk: StreamCallback = (chunk, streamTargetIndex) => {
    if (streamTargetIndex !== targetIndex) return;
    questionToGenerate.notes = (questionToGenerate.notes || '') + chunk;
    autoSaveNotes();
    if (currentIndex.value === streamTargetIndex) {
      const now = Date.now();
      const fixedThrottleDelay = 250;
      if (!renderTimeoutId) {
        renderTimeoutId = window.setTimeout(() => {
          if (activeGenerationIndex.value === streamTargetIndex && currentIndex.value === streamTargetIndex) {
            renderNotesForCurrentQuestion();
            lastRenderTime = Date.now();
          }
          renderTimeoutId = null;
        }, fixedThrottleDelay);
      } else if (now - lastRenderTime > fixedThrottleDelay * 4) {
        clearTimeout(renderTimeoutId);
        renderTimeoutId = null;
        if (activeGenerationIndex.value === streamTargetIndex && currentIndex.value === streamTargetIndex) {
          renderNotesForCurrentQuestion();
          lastRenderTime = now;
        }
      }
    }
  };
  const handleCompletion: CompletionCallback = async (finalNote, completedIndex, error) => {
    console.log(`[LOG] 生成完成: Index=${completedIndex}, Expected=${targetIndex}, Error=${error || 'None'}, Final Length=${finalNote?.length}`);
    if (renderTimeoutId) clearTimeout(renderTimeoutId);
    if (autoSaveTimeoutId) clearTimeout(autoSaveTimeoutId);
    const questionToGenerate = localQuestions.value[completedIndex];
    if (!questionToGenerate) {
      console.warn(`[WARN] Generation completed for index ${completedIndex}, but the question object no longer exists.`);
      if (activeGenerationIndex.value === completedIndex) {
        activeGenerationIndex.value = null;
        isGenerating.value = false;
      }
      checkAndTriggerAutoGeneration();
      return;
    }
    if (activeGenerationIndex.value !== completedIndex) {
      console.warn(`[WARN] 忽略过时的完成回调 (Completed: ${completedIndex}, Active: ${activeGenerationIndex.value})`);
      return;
    }
    try {
      questionToGenerate.notes = finalNote;
      if (questionToGenerate.id) {
        console.log(`[LOG] 最终保存索引 ${completedIndex} 的笔记 (Length: ${finalNote?.length})`);
        configService.saveNoteToQuestion(questionToGenerate.id, finalNote);
        configService.saveQuizState();
      } else {
        console.error(`[ERROR] 无法为索引 ${completedIndex} 执行最终保存，缺少问题ID`);
      }
      console.log(`[LOG] Resetting generation state: activeGenerationIndex from ${activeGenerationIndex.value} to null`);
      activeGenerationIndex.value = null;
      isGenerating.value = false;
      reasoningContent.value = ''; // <-- ADDED: Clear reasoning on completion

      if (currentIndex.value === completedIndex) {
        console.log(`[LOG] Rendering final Markdown for currently viewed index ${completedIndex}`);
        await renderNotesForCurrentQuestion();
        await nextTick();
      }
      if (error) {
        showToast(`题目 ${completedIndex + 1} 笔记生成失败: ${error}`, 'error');
      } else {
        showToast(`题目 ${completedIndex + 1} 笔记生成完成`, 'success');
      }
      if (!error && apiConfig.value.autoSync && !isManual) {
        showToast('正在自动同步到远程仓库...', 'info');
        triggerSync();
      }
    } catch (completionError) {
      console.error(`[ERROR] 处理索引 ${completedIndex} 的完成回调时出错:`, completionError);
      showToast('处理笔记生成结果时出错', 'error');
      if (activeGenerationIndex.value === completedIndex) {
        activeGenerationIndex.value = null;
        isGenerating.value = false;
        reasoningContent.value = ''; // <-- ADDED: Clear reasoning on error
      }
    } finally {
      if (activeGenerationIndex.value === completedIndex) {
        console.warn(`[WARN] Generation state was not reset before finally block for index ${completedIndex}. Resetting now.`);
        activeGenerationIndex.value = null;
        isGenerating.value = false;
        reasoningContent.value = ''; // <-- ADDED: Clear reasoning in finally just in case
      }
      console.log("[LOG] 完成处理结束，检查下一个自动生成。");
      checkAndTriggerAutoGeneration();
    }
  };

  // Call the actual generation function
  generateAINotes(questionToGenerate, targetIndex, handleCompletion);
}
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
    if (nextQuestion && (!nextQuestion.notes || nextQuestion.notes.trim() === '')) {
      console.log(`[LOG] 触发索引 ${nextIndex} 的自动生成`);
      requestNoteGeneration(nextIndex, false);
    } else {
      console.log(`[LOG] 跳过索引 ${nextIndex} 的自动生成: 问题已有笔记或不存在。`);
    }
  } else {
    console.log("[LOG] 没有更多问题可自动生成。");
  }
}
onMounted(() => {
  initializeQuiz();
  setupKeyboardListeners();
  window.addEventListener('resize', autoResizeTextarea);
  const questionAreaElement = questionAreaRef.value;
  if (questionAreaElement) {
    questionAreaElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    questionAreaElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    questionAreaElement.addEventListener('touchend', handleTouchEnd, { passive: false });
  } else {
    console.warn("未能找到问题区域元素来绑定触摸事件。");
  }
});
onUnmounted(() => {
  removeKeyboardListeners();
  window.removeEventListener('resize', autoResizeTextarea);
  if (toastTimer) clearTimeout(toastTimer);
  const questionAreaElement = questionAreaRef.value;
  if (questionAreaElement) {
    questionAreaElement.removeEventListener('touchstart', handleTouchStart);
    questionAreaElement.removeEventListener('touchmove', handleTouchMove);
    questionAreaElement.removeEventListener('touchend', handleTouchEnd);
  }
});
watch(selectedChapter, (newChapter, oldChapter) => {
  if (newChapter !== oldChapter) {
    console.log(`章节切换到: ${newChapter}`);
    currentIndex.value = 0;
    selectedAnswer.value = null;
    isQuizSubmitted.value = false;
    isReviewingWrong.value = false;
    filterQuestionsByChapter(newChapter);
    if (localQuestions.value.length > 0) {
      loadQuestion(0);
    } else {
      renderedNotesHtml.value = '';
      error.value = `章节 "${newChapter}" 下没有题目`;
    }
  }
});
watch(notesEditText, () => {
  if (isEditingNotes.value) {
    autoResizeTextarea();
  }
});
watch(isDarkMode, () => {
  nextTick(() => {
    renderNotesForCurrentQuestion();
    renderReasoning();
  });
});
function renderReasoning() {
  console.log(`[DEBUG] renderReasoning called. Content length: ${reasoningContent.value?.length}`);
  if (reasoningContent.value) {
    try {
      // Preprocess line breaks before rendering
      const preprocessedContent = preprocessLineBreaks(reasoningContent.value);
      renderedReasoningHtml.value = md.render(preprocessedContent); // Use preprocessed content
      console.log(`[DEBUG] Reasoning rendered successfully. HTML length: ${renderedReasoningHtml.value?.length}`);
      // 添加滚动逻辑
      nextTick(() => {
        const container = reasoningContainerRef.value;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    } catch (error) {
      console.error("Reasoning Markdown rendering failed:", error); // Restore error message
      renderedReasoningHtml.value = `<p class="page-quiz__notes-error">思考过程解析失败: ${error instanceof Error ? error.message : '未知错误'}</p>`;
    }
  } else {
    renderedReasoningHtml.value = '';
    console.log("[DEBUG] Reasoning content empty, cleared HTML.");
  }
}
watch(reasoningContent, renderReasoning);

// 改回使用文件加载的 playAudio 函数
const playAudio = (soundName: 'select' | 'correct' | 'incorrect' | 'navigate') => {
  const settings = configService.getUiSettings();
  if (!settings.soundEffectsEnabled) return;

  // 避免快速重复播放同一个音效
  const now = Date.now();
  if (lastSoundPlayed.name === soundName && now - lastSoundPlayed.time < 100) {
    return;
  }

  try {
    const audio = new Audio(`/audio/${soundName}.mp3`); // 使用文件路径
    audio.volume = settings.soundVolume;
    audio.play().catch(err => console.warn('播放音效失败:', err)); // 添加播放错误捕获
    lastSoundPlayed.name = soundName;
    lastSoundPlayed.time = now;
  } catch (err) {
    console.error('创建或播放音效失败:', err);
  }
};

// 存储上次播放的音效信息，用于防止快速重复播放 (移动到顶层作用域)
const lastSoundPlayed = reactive({ name: '', time: 0 });

// New ref for reasoning container
const reasoningContainerRef = ref<HTMLDivElement | null>(null);

// New function to preprocess line breaks
function preprocessLineBreaks(text: string | undefined): string {
  if (!text) return '';

  const lines = text.split('\n');

  const resultLines = lines.map(line => {
    const trimmedEndLine = line.trimEnd(); // Preserve leading whitespace, trim trailing
    const trimmedLine = trimmedEndLine.trim(); // For checks

    // 1. Skip empty lines
    if (trimmedLine.length === 0) {
      return '';
    }

    // 2. Keep lines already ending with <br>
    if (/<br\s*\/?>$/i.test(trimmedEndLine)) {
      return trimmedEndLine;
    }

    // 3. Identify lines that are part of HTML/Markdown structures and should NOT get an extra <br>
    const blockTagRegex = /^<(p|h[1-6]|div|ul|ol|li|blockquote|table|tr|td|th|form|address|article|aside|details|dialog|dd|dl|dt|fieldset|figcaption|figure|footer|header|hr|main|nav|pre|section)\b/i;
    const listMarkerRegex = /^(\s*[-*+]\s+|\s*\d+\.\s+)/; // Matches '- ', '* ', '1. '
    const tableRowRegex = /^\s*\|.*\|\s*$/; // Matches '| ... |'
    // Fixed regex for table separator line
    const tableSeparatorRegex = /^\s*\|[-\s:|]{3,}\|?\s*$/; // Matches '|---|---|', '|:---|:---:|' etc.
    const headingMarkerRegex = /^#{1,6}\s+/; // Matches '# ', '## '

    if (blockTagRegex.test(trimmedLine) ||
      listMarkerRegex.test(trimmedLine) ||
      tableRowRegex.test(trimmedLine) ||
      tableSeparatorRegex.test(trimmedLine) ||
      headingMarkerRegex.test(trimmedLine)) {
      return trimmedEndLine; // Let markdown-it handle these structures
    }

    // 4. Don't add <br> to lines containing only HTML tags (like closing tags)
    const contentWithoutTags = trimmedLine.replace(/<[^>]*>/g, '').trim();
    if (contentWithoutTags.length === 0 && /^<.*>$/.test(trimmedLine)) {
      return trimmedEndLine;
    }

    // 5. Otherwise, it's likely inline content or text needing a manual break
    return trimmedEndLine + '<br>';
  }); // End of lines.map()

  return resultLines.join(''); // Join lines back
} // End of preprocessLineBreaks function

</script>
