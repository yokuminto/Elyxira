<template>
  <div class="page-library">

    <div class="page-library__content">

      <!-- 优化页面头部 -->
      <div class="page-library__header">
        <button class="page-library__action-button page-library__action-button--secondary" title="返回主页"
          @click="goToHome">
          <BaseIcon name="home" />
        </button>
        <div class="page-library__title">
          Elyxira
        </div>
        <div class="page-library__actions">
          <div class="page-library__theme-toggle" @click="handleToggleTheme" :class="{ 'dark': isDarkMode }">
            <i class="sun-icon fas fa-sun"></i>
            <i class="moon-icon fas fa-moon"></i>
          </div>
          <SettingsButton class="page-library__action-button page-library__action-button--secondary"
            @open-general-settings="showGeneralSettings = true" @open-repo-settings="showRepoConfig = true"
            @open-debug="showDebugModal = true" />
        </div>
      </div>


      <!-- 题库列表区域 -->
      <div class="page-library__card">
        <div class="page-library__card-header">
          <div class="page-library__card-title">题库列表</div>
          <div class="page-library__card-menu">
            <input type="file" id="quizFileInput" accept=".json,.txt" class="file-input" @change="handleFileSelect"
              style="display: none;" />
            <button class="page-library__action-button page-library__action-button--primary"
              @click="showlibraryDataModal = true">
              <BaseIcon name="upload" size="16" />
            </button>
            <button class="page-library__action-button page-library__action-button--secondary"
              @click="handleOpenSyncConfig" title="同步仓库">
              <BaseIcon name="github" size="16" />
            </button>
            <button class="page-library__action-button page-library__action-button--secondary" @click="loadQuizList"
              title="刷新列表">
              <BaseIcon name="refresh" size="16" />
            </button>
          </div>
        </div>

        <div class="page-library__filters">
          <div class="page-library__filter-group">
            <button class="page-library__filter-button"
              :class="{ 'page-library__filter-button--active': activeFilter === QuizCategoryType.CACHE || !activeFilter }"
              @click="changeFilter(QuizCategoryType.CACHE)">
              缓存
            </button>
            <button class="page-library__filter-button"
              :class="{ 'page-library__filter-button--active': activeFilter === QuizCategoryType.ONLINE }"
              @click="changeFilter(QuizCategoryType.ONLINE)">
              在线
            </button>
            <button class="page-library__filter-button"
              :class="{ 'page-library__filter-button--active': activeFilter === QuizCategoryType.REMOTE }"
              @click="changeFilter(QuizCategoryType.REMOTE)">
              远程
            </button>
          </div>

          <div class="page-library__search">
            <input type="text" v-model="searchQuery" placeholder="搜索题库..." class="page-library__search-input" />
            <BaseIcon name="search" size="14" class="page-library__search-icon" />
          </div>
        </div>

        <!-- 题库列表 - 转换为表格布局 -->
        <div class="page-library__table-container">
          <table class="page-library__table">
            <thead>
              <tr>
                <th>题库名称</th>
                <th>来源</th>
                <th>描述</th>
                <th>最后修改</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <!-- 加载状态覆盖层 -->
              <tr v-if="refreshLoading" class="page-library__loading-overlay">
                <td colspan="5">
                  <div class="page-library__loading-content">
                    <div class="page-library__loading-spinner">
                      <BaseIcon name="refresh" size="24" />
                    </div>
                    <div class="page-library__loading-text">正在刷新题库列表...</div>
                  </div>
                </td>
              </tr>

              <!-- 数据行 -->
              <template v-if="!refreshLoading">
                <tr v-for="quiz in filteredQuizList" :key="quiz.id" :class="{
                  'page-library__table-row': true,
                  'loading': loadingQuizItem && loadingQuizItem.id === quiz.id
                }">
                  <td class="page-library__table-title">{{ quiz.name }}</td>
                  <td>
                    <span class="source-badge" :class="getQuizSourceClass(quiz)">
                      {{ getQuizSourceLabel(quiz) }}
                    </span>
                  </td>
                  <td class="page-library__table-desc">{{ getQuizDescription(quiz) }}</td>
                  <td>{{ quiz.lastModified ? new Date(quiz.lastModified).toLocaleDateString() : '未知' }}</td>
                  <td class="page-library__table-actions">
                    <button class="page-library__table-button" @click="selectQuiz(quiz)">选择</button>
                    <button v-if="quiz.source !== QuizSourceType.ONLINE" class="page-library__table-more"
                      @click="showContextMenu($event, quiz.source, quiz)">
                      <BaseIcon name="more" size="16" />
                    </button>
                  </td>
                </tr>

                <!-- 无数据状态 -->
                <tr v-if="filteredQuizList.length === 0">
                  <td colspan="5">
                    <div class="page-library__empty">
                      <div class="page-library__empty-icon">📭</div>
                      <h3 class="page-library__empty-title">没有找到题库</h3>
                      <p class="page-library__empty-subtitle">请导入题库或更改筛选条件</p>
                      <button class="page-library__empty-action" @click="showlibraryDataModal = true">导入题库</button>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 上下文菜单 -->
      <div v-if="showMenu" class="context-menu" :class="{ 'closing': isMenuClosing }"
        :style="{ top: menuTop + 'px', left: menuLeft + 'px' }">
        <!-- 远程和缓存题库都可以重命名和删除 -->
        <div class="menu-item" @click="handleRename"
          v-if="selectedQuiz && selectedQuiz.source !== QuizSourceType.ONLINE">
          <BaseIcon name="rename" size="16" />
          重命名
        </div>
        <div class="menu-item delete" @click="handleDelete"
          v-if="selectedQuiz && selectedQuiz.source !== QuizSourceType.ONLINE">
          <BaseIcon name="delete" size="16" />
          删除
        </div>
        <!-- 缓存题库可以与远程同步 - 仅当GitHub配置有效时显示 -->
        <div class="menu-item" v-if="selectedQuiz && selectedQuiz.source === QuizSourceType.LOCAL && isGithubConfigured"
          @click="handleSyncFromRemote">
          <BaseIcon name="refresh" size="16" />
          从远程同步
        </div>
        <div class="menu-item" v-if="selectedQuiz && selectedQuiz.source === QuizSourceType.LOCAL && isGithubConfigured"
          @click="handlePushToRemote">
          <BaseIcon name="upload" size="16" />
          推送到远程
        </div>
      </div>

      <!-- 重命名对话框 -->
      <div class="modal-overlay" :class="{ active: showRenameModal }" @click.self="showRenameModal = false">
        <div class="page-library__modal">
          <div class="page-library__modal-header">
            <h2 class="page-library__modal-title">重命名题库</h2>
            <button class="page-library__modal-close" @click="showRenameModal = false">&times;</button>
          </div>
          <div class="page-library__modal-body">
            <div class="form-group">
              <label for="newQuizName">题库名称</label>
              <div class="form-description">输入新的题库名称</div>
              <input type="text" id="newQuizName" v-model="newQuizName" class="page-library__search-input"
                placeholder="请输入新名称" @keyup.enter="confirmRename" />
            </div>
          </div>
          <div class="page-library__modal-footer">
            <button class="page-library__filter-button" @click="showRenameModal = false">取消</button>
            <button class="page-library__card-action" @click="confirmRename">确认</button>
          </div>
        </div>
      </div>

      <!-- 刷题配置区域 -->
      <div class="page-library__card">
        <div class="page-library__card-header">
          <div class="page-library__card-title">刷题设置</div>
        </div>

        <div class="page-library__card-body">
          <!-- 题库信息区 -->
          <div class="page-library__quiz-info" v-if="selectedQuizItem">
            <div class="page-library__quiz-info-header">
              <h3 class="page-library__quiz-title">{{ selectedQuizItem.name }}</h3>
              <div class="source-badge" :class="getQuizSourceClass(selectedQuizItem)">
                {{ getQuizSourceLabel(selectedQuizItem) }}
              </div>
            </div>
            <p class="page-library__quiz-desc">{{ getQuizDescription(selectedQuizItem) }}</p>
          </div>
          <div class="page-library__empty" v-else>
            <p>请从上方列表选择一个题库</p>
          </div>

          <!-- 控制区域 -->
          <div class="page-library__settings-row">
            <div class="page-library__filter-group">
              <div class="page-library__filter-label">章节：</div>
              <select v-model="selectedChapter" class="page-library__filter-select" :disabled="refreshLoading">
                <option value="all">全部章节</option>
                <option v-for="(c, index) in chaptersValue" :key="index" :value="c">
                  {{ c }}
                </option>
              </select>

              <button class="page-library__filter-button" @click="openQuizModeModal" :disabled="refreshLoading">
                <BaseIcon name="stats" size="16" />
                <span>刷题模式</span>
              </button>
            </div>

            <!-- 开始刷题按钮 -->
            <button class="page-library__card-action page-library__start-button" @click="startQuiz"
              :disabled="!quizLoaded || refreshLoading">
              <BaseIcon name="start" size="16" />
              <span>开始刷题</span>
            </button>
          </div>
        </div>

        <!-- 统计面板 -->
        <div class="page-library__card-body page-library__stats-container">
          <h4 class="page-library__section-title">题库统计</h4>
          <div class="page-library__stats-grid" :class="{ 'loading': refreshLoading }">
            <!-- 加载状态覆盖层 -->
            <div v-if="refreshLoading" class="page-library__stats-loading">
              <div class="page-library__loading-spinner">
                <BaseIcon name="refresh" size="24" />
              </div>
              <div class="page-library__loading-text">正在加载统计数据...</div>
            </div>

            <div class="page-library__stat-card">
              <div class="page-library__stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </div>
              <div class="page-library__stat-info">
                <div class="page-library__stat-title">章节数</div>
                <div class="page-library__stat-value">{{ chaptersValue.length || 0 }}</div>
              </div>
            </div>

            <div class="page-library__stat-card">
              <div class="page-library__stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2">
                  </path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
              </div>
              <div class="page-library__stat-info">
                <div class="page-library__stat-title">题目数</div>
                <div class="page-library__stat-value">{{ totalQuestionsValue || 0 }}</div>
              </div>
            </div>

            <div class="page-library__stat-card">
              <div class="page-library__stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 6v6l4 2"></path>
                </svg>
              </div>
              <div class="page-library__stat-info">
                <div class="page-library__stat-title">已答题数</div>
                <div class="page-library__stat-value">{{ answeredQuestions || 0 }}</div>
              </div>
            </div>

            <div class="page-library__stat-card">
              <div class="page-library__stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div class="page-library__stat-info">
                <div class="page-library__stat-title">正确题数</div>
                <div class="page-library__stat-value">{{ correctQuestions || 0 }}</div>
              </div>
            </div>

            <div class="page-library__stat-card">
              <div class="page-library__stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <div class="page-library__stat-info">
                <div class="page-library__stat-title">正确率</div>
                <div class="page-library__stat-value">{{ statsAccuracyRate }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 刷题模式选择模态框 -->
      <div class="modal-overlay" :class="{ active: showQuizModeModal }" @click.self="showQuizModeModal = false">
        <div class="page-library__modal">
          <div class="page-library__modal-header">
            <h2 class="page-library__modal-title">选择刷题模式</h2>
            <button class="page-library__modal-close" @click="showQuizModeModal = false">&times;</button>
          </div>
          <div class="page-library__modal-body">
            <div class="mode-options">
              <div class="mode-option" :class="{ active: quizMode === QuizMode.NORMAL }"
                @click="quizMode = QuizMode.NORMAL">
                <input type="radio" name="quizMode" value="normal" v-model="quizMode" />
                <span class="mode-label">普通模式</span>
                <span class="mode-desc">按照题库顺序进行刷题</span>
              </div>

              <div class="mode-option" :class="{ active: quizMode === QuizMode.RANGE }"
                @click="quizMode = QuizMode.RANGE">
                <input type="radio" name="quizMode" value="range" v-model="quizMode" />
                <span class="mode-label">范围模式</span>
                <span class="mode-desc">选择特定题号范围进行刷题</span>

                <!-- 范围选择器，在范围模式下显示 -->
                <div class="range-inputs" v-if="quizMode === QuizMode.RANGE" @click.stop>
                  <input type="number" placeholder="起始题号" min="1" v-model="rangeStart"
                    class="page-library__search-input">
                  <span class="range-separator">至</span>
                  <input type="number" placeholder="结束题号" min="1" v-model="rangeEnd" class="page-library__search-input">
                </div>
              </div>
            </div>
          </div>
          <div class="page-library__modal-footer">
            <button class="page-library__filter-button" @click="showQuizModeModal = false">取消</button>
            <button class="page-library__card-action" @click="confirmQuizMode">确认</button>
          </div>
        </div>
      </div>

      <!-- 题库数据管理模态框 -->
      <div class="modal-overlay" :class="{ active: showlibraryDataModal }" @click.self="showlibraryDataModal = false">
        <LibraryDataModal v-if="showlibraryDataModal" :quiz-data="quizData || undefined"
          @close="showlibraryDataModal = false" @import-complete="loadQuizList" />
      </div>

      <!-- 题库同步与仓库配置模态框 -->
      <div class="modal-overlay" :class="{ active: showlibrarySyncConfigModal }"
        @click.self="showlibrarySyncConfigModal = false">
        <QuizSyncModal v-if="showlibrarySyncConfigModal" :current-quiz="{
          name: selectedQuizItem?.name || '',
          source: selectedQuizItem?.source || '',
          isLocal: selectedQuizItem?.source === 'local',
          exists: !!selectedQuizItem
        }" @close="showlibrarySyncConfigModal = false" @sync-complete="loadQuizList" @save="handleRepoConfigSave" />
      </div>

      <!-- 通用设置模态框 -->
      <ModalSettings :show="showGeneralSettings" :current-settings="generalSettings"
        @close="showGeneralSettings = false" @save="handleGeneralSettingsSave" />

      <!-- 调试模态框 -->
      <div class="modal-overlay" :class="{ active: showDebugModal }" @click.self="showDebugModal = false">
        <DebugModal v-if="showDebugModal" @close="showDebugModal = false" />
      </div>

      <!-- 错误详情模态框 -->
      <div class="modal-overlay" :class="{ active: showErrorModal }" @click.self="closeErrorModal()">
        <div class="page-library__modal" v-if="showErrorModal">
          <div class="page-library__modal-header">
            <h3 class="page-library__modal-title">错误详情</h3>
            <button class="page-library__modal-close" @click="closeErrorModal()">&times;</button>
          </div>
          <div class="page-library__modal-body">
            <div class="error-details">
              <pre>{{ errorDetails }}</pre>
            </div>
          </div>
          <div class="page-library__modal-footer">
            <button class="page-library__card-action" @click="closeErrorModal()">关闭</button>
          </div>
        </div>
      </div>

      <!-- 删除确认对话框 -->
      <div class="modal-overlay" :class="{ active: showDeleteConfirmModal }"
        @click.self="showDeleteConfirmModal = false">
        <div class="page-library__modal">
          <div class="page-library__modal-header">
            <h3 class="page-library__modal-title">确认删除</h3>
            <button class="page-library__modal-close" @click="showDeleteConfirmModal = false">&times;</button>
          </div>
          <div class="page-library__modal-body">
            <p class="delete-confirm-message">
              <BaseIcon name="warning" size="24" />
              确定要删除题库 <strong>{{ deleteTargetName }}</strong> 吗？
            </p>
            <p v-if="deleteTargetSource === 'remote'" class="delete-confirm-warning">
              此操作将从GitHub仓库中永久删除该文件，无法恢复！
            </p>
          </div>
          <div class="page-library__modal-footer">
            <button class="page-library__filter-button" @click="showDeleteConfirmModal = false">取消</button>
            <button class="page-library__card-action page-library__card-action--danger" @click="confirmDelete()"
              :disabled="isDeleting">
              <span v-if="isDeleting">
                <BaseIcon name="refresh" size="16" class="icon-spin" />
                删除中...
              </span>
              <span v-else>确认删除</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { computed, ref, onMounted, reactive } from 'vue'
import BaseIcon from '../../components/icon.vue'
import SettingsButton from '../../components/button-settings.vue'
import DebugModal from '@/modals/modal-debug.vue'
import LibraryDataModal from '@/modals/modal-library-data.vue'
import QuizSyncModal from '@/modals/modal-quiz-sync.vue'
import ModalSettings from '@/modals/modal-settings.vue'
import type { GeneralSettings } from '@/modals/modal-settings.vue'
import { showToast, injectToastStyles } from '../../utils/toast'
import { QuizStore } from '../../stores/store-quiz'
import type {
  QuizData,
  QuizItem,
  GithubApiFile,
  LocalQuizCache,
  QuizItemExtended
} from './types'
import { QuizMode, QuizSourceType, QuizCategoryType } from './types'
import { parseTextQuiz } from './utils'
import { enhancedValidQuizData } from './fixes'

// 在页面加载前确保Material Icons和Toast样式已加载
onMounted(() => {
  if (!document.getElementById('material-icons-css')) {
    const link = document.createElement('link');
    link.id = 'material-icons-css';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
    document.head.appendChild(link);
  }

  // 注入Toast样式
  injectToastStyles();
});

const router = useRouter()

// 状态
const localQuizList = ref<LocalQuizCache[]>([])
const onlineQuizList = ref<QuizItem[]>([])
const remoteQuizList = ref<QuizItem[]>([])
const quizData = ref<QuizData | null>(null)
const selectedChapter = ref('all')
const quizMode = ref<QuizMode>(QuizMode.NORMAL)
const rangeStart = ref(1)
const rangeEnd = ref(50)
const isLoading = ref(false)
const lastLoadedQuiz = ref({
  name: '',
  source: ''
})
const showMenu = ref(false)
const menuTop = ref(0)
const menuLeft = ref(0)

// 新增变量
const selectedQuizItem = ref<QuizItemExtended | null>(null);
const loadingQuizItem = ref<QuizItemExtended | null>(null);
const appliedQuizItem = ref<QuizItemExtended | null>(null);

// 定义isMenuClosing变量
const isMenuClosing = ref(false);

// 模态框显示状态
const showRepoConfig = ref(false)
const showGeneralSettings = ref(false)
const showDebugModal = ref(false)
const showlibraryDataModal = ref(false)
const showlibrarySyncConfigModal = ref(false)
const showRenameModal = ref(false)
const showQuizModeModal = ref(false)
const newQuizName = ref('')
const selectedQuiz = ref<{ source: QuizSourceType; quiz: QuizItem } | null>(null)
const isDarkMode = ref(document.body.classList.contains('dark-theme'))

// 计算属性
const totalQuestionsValue = computed(() => {
  // 首先尝试从 selectedQuizItem.value?.data 获取数据
  if (selectedQuizItem.value?.data?.chapters) {
    return selectedQuizItem.value.data.chapters.reduce((acc: number, chapter: { questions?: Array<unknown> }) => {
      return acc + (chapter.questions?.length || 0);
    }, 0);
  }

  // 如果上面没有数据，则尝试从 quizData.value 获取数据
  if (quizData.value && quizData.value.chapters) {
    return quizData.value.chapters.reduce((acc: number, chapter: { questions?: Array<unknown> }) => {
      return acc + (chapter.questions?.length || 0);
    }, 0);
  }

  return 0;
});

const chaptersValue = computed(() => {
  // 首先尝试从 selectedQuizItem.value?.data 获取数据
  if (selectedQuizItem.value?.data?.chapters) {
    return selectedQuizItem.value.data.chapters.map((c: { title: string }) => c.title);
  }

  // 如果上面没有数据，则尝试从 quizData.value 获取数据
  if (quizData.value && quizData.value.chapters) {
    return quizData.value.chapters.map((c: { title: string }) => c.title);
  }

  return [];
})

// 用于显示的变量
const answeredQuestions = ref(0)
const correctQuestions = ref(0)
const userAnswerData = ref<{
  totalAnswered: number;
  correctCount: number;
  wrongCount: number;
  dailyActivity: number[];
}>({
  totalAnswered: 0,
  correctCount: 0,
  wrongCount: 0,
  dailyActivity: []
})

const statsAccuracyRate = computed(() => {
  const total = answeredQuestions.value;
  if (total === 0) return '0%';
  return Math.round((correctQuestions.value / total) * 100) + '%';
});

// 检查是否配置了远程题库
const hasRemoteConfig = computed(() => {
  return Boolean(localStorage.getItem('github_repo') && localStorage.getItem('github_token'))
})

// 生命周期钩子
onMounted(async () => {
  // 设置加载状态
  isLoading.value = true;
  refreshLoading.value = true;

  // 初始化主题
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDarkMode.value = true
    const themeToggle = document.querySelector('.page-library__theme-toggle') as HTMLElement
    if (themeToggle) {
      themeToggle.classList.add('dark')
      document.body.classList.add('dark-theme')
    }
  }

  try {
    // 加载题库列表
    await loadQuizList();

    // 加载统计数据
    loadStatsData();

    // 恢复之前选择的题库
    restoreLastSelectedQuiz();
  } catch (error) {
    console.error('初始化题库页面失败:', error);
    showToast('初始化题库页面失败，请刷新页面重试', 'error');
  } finally {
    refreshLoading.value = false;
    isLoading.value = false;
  }
})

// 恢复上次选择的题库
function restoreLastSelectedQuiz() {
  const savedData = localStorage.getItem('quizData');
  const lastQuiz = localStorage.getItem('lastLoadedQuiz');

  if (savedData && lastQuiz) {
    try {
      quizData.value = JSON.parse(savedData);
      lastLoadedQuiz.value = JSON.parse(lastQuiz);

      // 恢复设置
      const savedChapter = localStorage.getItem('selectedChapter');
      if (savedChapter) selectedChapter.value = savedChapter;

      const savedMode = localStorage.getItem('quizMode');
      if (savedMode && Object.values(QuizMode).includes(savedMode as QuizMode)) {
        quizMode.value = savedMode as QuizMode;
      }

      // 恢复范围值
      rangeStart.value = parseInt(localStorage.getItem('rangeStart') || '1');
      rangeEnd.value = parseInt(localStorage.getItem('rangeEnd') || getMaxQuestionNumber().toString());

      // 恢复选中的题库
      const quiz = getMergedQuizList().find(q =>
        q.name === lastLoadedQuiz.value.name &&
        q.source === lastLoadedQuiz.value.source
      );

      if (quiz && quizData.value) {
        // 设置选中的题库，并确保包含当前加载的数据
        selectedQuizItem.value = {
          ...quiz,
          data: quizData.value
        };
        // 同时设置为已应用的题库
        appliedQuizItem.value = selectedQuizItem.value;
      } else if (quiz) {
        selectedQuizItem.value = quiz;
        appliedQuizItem.value = quiz;
      }

      showToast('已恢复上次的题库数据', 'success');
    } catch (error) {
      console.error('解析保存的题库数据失败:', error);
      localStorage.removeItem('quizData');
    }
  }
}

// 定义 refreshLoading 变量来控制刷新按钮的加载状态
const refreshLoading = ref(false);

// 加载题库列表 - 简化后的版本
async function loadQuizList() {
  // 设置加载状态
  refreshLoading.value = true;

  try {
    // 先立即加载本地题库 - 这个是最快的
    await loadLocalQuizList();

    // 分别独立处理在线和远程题库，互不影响
    loadOnlineQuizList().catch(err => {
      console.warn('加载在线题库列表失败:', err);
      showToast('部分在线题库加载失败，请检查网络连接', 'warning');
    });

    // 仅当配置了GitHub时才尝试加载远程题库
    if (hasRemoteConfig.value) {
      loadRemoteQuizList().catch(err => {
        console.warn('加载远程GitHub题库列表失败:', err);
        showToast('GitHub仓库同步失败，但不影响其他功能', 'warning');
      });
    }

    showToast('题库列表刷新成功', 'success');
  } catch (error) {
    console.error('加载题库列表失败:', error);
    showToast('加载题库列表失败，请检查网络连接', 'error');
  } finally {
    // 恢复状态
    refreshLoading.value = false;
  }
}

// 加载缓存题库列表 - 简化版
async function loadLocalQuizList() {
  try {
    const savedQuizList = localStorage.getItem('cachedQuizList');

    if (savedQuizList) {
      const parsedList = JSON.parse(savedQuizList);

      // 只保留有效的题库（有缓存数据的）
      localQuizList.value = parsedList.filter((quiz: LocalQuizCache) => {
        const cacheKey = `quizCache_${quiz.name}`;
        return localStorage.getItem(cacheKey) !== null;
      });

      // 如果有无效题库被移除，更新缓存列表
      if (localQuizList.value.length !== parsedList.length) {
        localStorage.setItem('cachedQuizList', JSON.stringify(localQuizList.value));
      }
    } else {
      localQuizList.value = [];
    }
  } catch (error) {
    console.warn('加载缓存题库列表失败:', error);
    localQuizList.value = [];
  }
}

// 加载在线题库列表 - 优化版
async function loadOnlineQuizList() {
  try {
    const indexUrl = '/data/index.json';

    // 修改fetch请求，添加正确的headers来确保正确的MIME类型
    const response = await fetch(indexUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`无法加载题库索引文件 (${response.status}): 请确认public/data/index.json文件存在且格式正确`);
    }

    // 尝试解析JSON
    let data;
    try {
      data = await response.json();
    } catch {
      // 不使用error参数
      throw new Error('题库索引格式错误: 请确认index.json是有效的JSON文件');
    }

    if (Array.isArray(data)) {
      onlineQuizList.value = data.map(item => {
        // 统一处理路径问题
        let downloadUrl = item.download_url;
        let itemPath = item.path || `${item.name}.json`;

        // 规范化路径 - 确保能正确访问到资源
        if (!downloadUrl) {
          if (!itemPath.startsWith('/') && !itemPath.startsWith('http')) {
            itemPath = `/data/${itemPath}`;
          }
          downloadUrl = itemPath;
        }

        return {
          ...item,
          path: itemPath,
          source: QuizSourceType.ONLINE,
          download_url: downloadUrl
        };
      });
    } else {
      throw new Error('题库索引格式无效: 应为题库数组');
    }
  } catch (err) {
    console.error('加载在线题库列表失败:', err);
    showToast(`加载在线题库列表失败: ${(err as Error).message}`, 'error');
    onlineQuizList.value = [];
  }
}

// 加载远程题库列表 - 优化版
async function loadRemoteQuizList() {
  // 如果未配置远程仓库，直接返回
  if (!hasRemoteConfig.value) {
    remoteQuizList.value = [];
    return;
  }

  const owner = localStorage.getItem('github_owner');
  const repoName = localStorage.getItem('github_repo');
  const branch = localStorage.getItem('github_branch') || 'main';
  const path = localStorage.getItem('github_path') || '';
  const token = localStorage.getItem('github_token');

  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    const repo = `${owner}/${repoName}`;
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`;

    // 添加超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

    const response = await fetch(apiUrl, {
      headers,
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`GitHub API错误 (${response.status}): ${errorData.message || '未知错误'}`);
    }

    const files = await response.json();

    if (!Array.isArray(files)) {
      throw new Error('GitHub API返回格式错误');
    }

    remoteQuizList.value = files
      .filter((file: GithubApiFile) =>
        file.type === 'file' &&
        (file.name.endsWith('.json') || file.name.endsWith('.txt'))
      )
      .map((file: GithubApiFile) => ({
        name: file.name.replace(/\.(json|txt)$/, ''),
        path: file.path,
        download_url: file.download_url,
        source: QuizSourceType.REMOTE,
        info: `来自${repo}的远程题库`
      }));
  } catch (e) {
    // 使用e代替err避免类型错误
    console.error('加载GitHub题库列表失败:', e);
    remoteQuizList.value = [];
    throw e; // 重新抛出错误，由调用方决定如何处理
  }
}

// 保存当前题库状态到localStorage
function saveQuizState() {
  if (quizData.value) {
    // 保存到localStorage
    localStorage.setItem('quizData', JSON.stringify(quizData.value));
    localStorage.setItem('selectedChapter', selectedChapter.value);
    localStorage.setItem('quizMode', quizMode.value);
    localStorage.setItem('rangeStart', rangeStart.value.toString());
    localStorage.setItem('rangeEnd', rangeEnd.value.toString());
    localStorage.setItem('lastLoadedQuiz', JSON.stringify(lastLoadedQuiz.value));

    // 同时更新QuizStore
    QuizStore.setQuizData(quizData.value);
    QuizStore.setLastLoaded(lastLoadedQuiz.value.name, lastLoadedQuiz.value.source);

    // 保存到QuizStore的存储
    QuizStore.saveToStorage();

    // 如果有名称，保存到独立缓存
    if (lastLoadedQuiz.value.name) {
      const quizCacheKey = `quizCache_${lastLoadedQuiz.value.name}`;
      localStorage.setItem(quizCacheKey, JSON.stringify(quizData.value));

      // 更新本地缓存列表
      const existingIndex = localQuizList.value.findIndex(
        q => q.name === lastLoadedQuiz.value.name
      );

      if (existingIndex >= 0) {
        localQuizList.value[existingIndex].lastModified = Date.now();
      } else {
        // 添加到本地缓存列表
        localQuizList.value.push({
          id: `local-${Date.now()}`,
          name: lastLoadedQuiz.value.name,
          path: 'localStorage',
          source: 'local',
          info: quizData.value.description || '缓存题库',
          title: quizData.value.title || lastLoadedQuiz.value.name,
          lastModified: Date.now()
        });
      }

      // 保存题库列表
      localStorage.setItem('cachedQuizList', JSON.stringify(localQuizList.value));
    }
  }
}

// 开始刷题 - 优化版
const startQuiz = async () => {
  if (!quizData.value) {
    showToast('请先选择一个题库', 'error');
    return;
  }

  // 设置刷题配置
  QuizStore.setConfig({
    chapterIndex: selectedChapter.value,
    mode: quizMode.value === 'wrong' ? QuizMode.REVIEW : quizMode.value,
    rangeStart: parseInt(rangeStart.value.toString()),
    rangeEnd: parseInt(rangeEnd.value.toString()),
    randomize: quizMode.value === 'random',
    wrongOnly: quizMode.value === 'wrong',
  });

  // 保存状态
  saveQuizState();

  // 跳转到刷题页面
  router.push('/quiz');
}

// 上下文菜单相关功能
function showContextMenu(event: MouseEvent, source: QuizSourceType, quiz: QuizItem) {
  // 在线题库不显示右键菜单
  if (source === QuizSourceType.ONLINE) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  // 先移除原有的事件监听
  document.removeEventListener('click', closeContextMenu);
  document.removeEventListener('contextmenu', closeContextMenu);

  // 如果菜单已经显示，并且点击的是同一个题库，则关闭菜单后返回
  if (showMenu.value && selectedQuiz.value && selectedQuiz.value.quiz &&
    quiz.name === selectedQuiz.value.quiz.name &&
    quiz.source === selectedQuiz.value.quiz.source) {
    closeContextMenu();
    return;
  }

  // 关闭之前可能打开的菜单
  if (showMenu.value) {
    closeContextMenu();
    // 给一个短暂延迟，确保之前的菜单动画完成
    setTimeout(() => showNewMenu(event, source, quiz), 300);
  } else {
    showNewMenu(event, source, quiz);
  }
}

// 将菜单显示逻辑提取为独立函数
function showNewMenu(event: MouseEvent, source: QuizSourceType, quiz: QuizItem) {
  // 存储选中的题库信息
  selectedQuiz.value = { source, quiz };
  isMenuClosing.value = false;

  // 获取按钮元素的位置用于定位菜单
  const button = event.currentTarget as HTMLElement;
  if (button) {
    const rect = button.getBoundingClientRect();

    // 计算菜单位置：显示在按钮的下方右侧
    menuLeft.value = rect.right - 150; // 菜单宽度约150px，对齐菜单右侧与按钮右侧
    menuTop.value = rect.bottom + window.pageYOffset + 5; // 按钮下方5px处

    // 确保菜单不会超出可视区域右侧和底部
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = 150; // 估计菜单宽度
    const menuHeight = 150; // 估计菜单高度

    if (menuLeft.value + menuWidth > viewportWidth) {
      menuLeft.value = viewportWidth - menuWidth - 10; // 离右边界10px
    }

    if (rect.bottom + menuHeight > viewportHeight) {
      // 如果下方空间不足，则在按钮上方显示
      menuTop.value = rect.top + window.pageYOffset - menuHeight - 5;
    }
  }

  // 显示菜单
  showMenu.value = true;

  // 延迟添加事件监听，避免立即关闭
  setTimeout(() => {
    document.addEventListener('click', closeContextMenu);
    document.addEventListener('contextmenu', closeContextMenu);
  }, 0);
}

// 关闭右键菜单函数，添加关闭动画
function closeContextMenu() {
  if (!showMenu.value || isMenuClosing.value) return;

  // 设置关闭动画标志
  isMenuClosing.value = true;

  // 延迟关闭，等待动画完成
  setTimeout(() => {
    showMenu.value = false;
    isMenuClosing.value = false;
  }, 200); // 与CSS动画时长匹配
}

// 上下文菜单操作函数
function handleRename() {
  if (!selectedQuiz.value) return;

  // 获取当前题库的名称作为默认值
  newQuizName.value = selectedQuiz.value.quiz.name || '';

  // 显示重命名模态框
  showRenameModal.value = true;

  // 关闭上下文菜单
  closeContextMenu();
}

function handleDelete() {
  if (!selectedQuiz.value) return;

  // 设置删除目标信息
  deleteTargetName.value = selectedQuiz.value.quiz.name || '';
  deleteTargetSource.value = selectedQuiz.value.source;

  // 显示确认对话框
  showDeleteConfirmModal.value = true;

  // 关闭上下文菜单
  closeContextMenu();
}

// 确认删除
async function confirmDelete() {
  if (!selectedQuiz.value) return;

  isDeleting.value = true;

  try {
    if (selectedQuiz.value.source === 'local') {
      deleteLocalQuiz();
    } else if (selectedQuiz.value.source === 'remote') {
      await deleteRemoteQuiz();
    }
    // 关闭确认对话框
    showDeleteConfirmModal.value = false;
  } catch (err) {
    console.error('删除题库失败:', err);
    errorDetails.value = `删除题库失败: ${(err as Error).message}`;
    showErrorModal.value = true;
  } finally {
    isDeleting.value = false;
  }
}

// 删除本地题库
function deleteLocalQuiz() {
  if (!selectedQuiz.value) return;

  const index = localQuizList.value.findIndex((q) => q.path === selectedQuiz.value?.quiz.path);
  if (index > -1) {
    localQuizList.value.splice(index, 1);

    // 更新本地缓存列表
    localStorage.setItem('cachedQuizList', JSON.stringify(localQuizList.value));

    // 如果当前加载的就是这个题库，也清空当前题库
    if (
      lastLoadedQuiz.value &&
      lastLoadedQuiz.value.source === 'local' &&
      lastLoadedQuiz.value.name === selectedQuiz.value.quiz.name
    ) {
      quizData.value = null;
      lastLoadedQuiz.value = {
        name: '',
        source: ''
      };
      localStorage.removeItem('quizData');
      localStorage.removeItem('lastLoadedQuiz');
    }

    showToast('题库删除成功', 'success');
  }
}

// 删除远程题库 - 更新为实际删除GitHub仓库文件
async function deleteRemoteQuiz() {
  if (!selectedQuiz.value) return;

  // 从GitHub获取必要的配置
  const owner = localStorage.getItem('github_owner');
  const repoName = localStorage.getItem('github_repo');
  const branch = localStorage.getItem('github_branch') || 'main';
  const token = localStorage.getItem('github_token');

  if (!owner || !repoName || !token) {
    throw new Error('GitHub配置不完整，无法删除远程文件');
  }

  const quiz = selectedQuiz.value.quiz;
  const filePath = quiz.path;

  if (!filePath) {
    throw new Error('无效的文件路径');
  }

  // 1. 首先获取文件的当前SHA
  const getFileUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${filePath}?ref=${branch}`;

  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json'
  };

  // 获取文件信息以获取SHA
  const fileResponse = await fetch(getFileUrl, { headers });

  if (!fileResponse.ok) {
    const errorData = await fileResponse.json();
    throw new Error(`获取文件信息失败 (${fileResponse.status}): ${errorData.message || '未知错误'}`);
  }

  const fileData = await fileResponse.json();
  const fileSha = fileData.sha;

  // 2. 使用DELETE请求删除文件
  const deleteUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${filePath}`;

  const deleteResponse = await fetch(deleteUrl, {
    method: 'DELETE',
    headers,
    body: JSON.stringify({
      message: `删除题库: ${quiz.name}`,
      sha: fileSha,
      branch
    })
  });

  if (!deleteResponse.ok) {
    let errorMessage = `删除失败 (${deleteResponse.status})`;
    try {
      const errorData = await deleteResponse.json();
      errorMessage += `: ${errorData.message || '未知错误'}`;
    } catch {
      // 如果无法解析错误信息，使用默认消息
    }
    throw new Error(errorMessage);
  }

  // 3. 从本地列表中删除
  const index = remoteQuizList.value.findIndex((q) => q.path === quiz.path);
  if (index > -1) {
    remoteQuizList.value.splice(index, 1);

    // 如果当前加载的就是这个题库，也清空当前题库
    if (
      lastLoadedQuiz.value &&
      lastLoadedQuiz.value.source === 'remote' &&
      lastLoadedQuiz.value.name === quiz.name
    ) {
      quizData.value = null;
      lastLoadedQuiz.value = {
        name: '',
        source: ''
      };
      localStorage.removeItem('quizData');
      localStorage.removeItem('lastLoadedQuiz');
    }

    showToast('题库已成功从GitHub仓库删除', 'success');
  }
}

// 处理仓库配置保存
function handleRepoConfigSave(config: Record<string, unknown>) {
  console.log('仓库配置已保存:', config);
  // 刷新题库列表
  loadQuizList();
}

// 处理文件上传
function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input?.files?.[0]
  if (!file) return

  isLoading.value = true
  showToast('正在解析题库文件...', 'info')

  const reader = new FileReader()

  reader.onload = function (e: ProgressEvent<FileReader>) {
    try {
      const content = e.target?.result as string
      let data

      if (file.name.endsWith('.json')) {
        // 解析JSON格式
        data = JSON.parse(content)
      } else if (file.name.endsWith('.txt')) {
        // 解析文本格式 (简单格式)
        data = parseTextQuiz(content)
      } else {
        throw new Error('不支持的文件格式')
      }

      // 使用增强版的验证函数，提高兼容性
      if (enhancedValidQuizData(data)) {
        quizData.value = data
        QuizStore.setQuizData(data)

        // 记录当前加载的题库
        lastLoadedQuiz.value = {
          source: 'file',
          name: file.name.replace(/\.(json|txt)$/, ''),
        }

        // 重置设置
        selectedChapter.value = 'all'
        quizMode.value = QuizMode.NORMAL

        // 更新范围值
        rangeStart.value = 1
        rangeEnd.value = getMaxQuestionNumber()

        // 保存状态
        saveQuizState()

        // 添加到本地缓存列表
        const localCacheEntry: LocalQuizCache = {
          id: `file-${file.name}`,
          name: file.name.replace(/\.(json|txt)$/, ''),
          path: 'localStorage',
          source: QuizSourceType.LOCAL, // 明确指定为本地导入
          lastModified: Date.now(),
          data: data,
          info: '从文件导入' // 添加描述信息
        }

        // 查找是否已存在
        const existingIndex = localQuizList.value.findIndex((q) => q.name === localCacheEntry.name && q.source === QuizSourceType.LOCAL);
        if (existingIndex >= 0) {
          localQuizList.value[existingIndex] = localCacheEntry;
        } else {
          localQuizList.value.push(localCacheEntry);
        }

        // 保存题库列表
        localStorage.setItem('cachedQuizList', JSON.stringify(localQuizList.value));

        // 保存独立缓存
        const cacheKey = `quizCache_${localCacheEntry.name}`;
        localStorage.setItem(cacheKey, JSON.stringify(data));

        // 显示成功消息
        showToast(`成功加载题库：${file.name}`, 'success');
      } else {
        throw new Error('题库格式无效')
      }
    } catch (error) {
      console.error('解析题库文件失败:', error)
      showToast(`解析题库文件失败: ${(error as Error).message}`, 'error')
    } finally {
      isLoading.value = false
      // 重置文件输入，以便用户可以再次选择同一文件
      if (input) input.value = ''
    }
  }

  reader.onerror = function () {
    showToast('读取文件失败', 'error')
    isLoading.value = false
  }

  if (file.name.endsWith('.json') || file.name.endsWith('.txt')) {
    reader.readAsText(file)
  } else {
    showToast('不支持的文件格式，请上传 .json 或 .txt 文件', 'error')
    isLoading.value = false
  }
}

// 处理通用设置保存
function handleGeneralSettingsSave(settings: GeneralSettings) {
  console.log('保存通用设置:', settings)
  // 应用设置，这里可以根据需要添加更多逻辑
  if (settings.uiSettings) {
    // 应用UI设置
    document.documentElement.setAttribute('theme', settings.uiSettings.darkMode ? 'dark' : 'light')
    // 应用主题颜色
    const root = document.documentElement
    const color = settings.uiSettings.themeColor === 'custom'
      ? settings.uiSettings.customColor
      : settings.uiSettings.themeColor
    root.style.setProperty('--primary-color', color)
    root.style.setProperty('--font-size-base', `${settings.uiSettings.fontSize}px`)

    // 保存UI设置到localStorage
    localStorage.setItem('theme', settings.uiSettings.darkMode ? 'dark' : 'light')
    localStorage.setItem('themeColor', settings.uiSettings.themeColor)
    localStorage.setItem('customColor', settings.uiSettings.customColor)
    localStorage.setItem('fontSize', settings.uiSettings.fontSize.toString())
    localStorage.setItem('fontFamily', settings.uiSettings.fontFamily)
    localStorage.setItem('animationEnabled', settings.uiSettings.animationEnabled.toString())
  }

  // 应用Debug设置
  if (settings.debugEnabled !== undefined) {
    localStorage.setItem('debugEnabled', settings.debugEnabled.toString())
  }

  // 应用测验设置
  if (settings.quizSettings) {
    // 保存到localStorage以便在quiz页面加载时使用
    localStorage.setItem('quizConfig', JSON.stringify(settings.quizSettings))

    // 同时更新QuizStore的配置
    const quizMode = settings.quizSettings.reviewMode
      ? QuizMode.REVIEW
      : (settings.quizSettings.randomMode ? QuizMode.RANDOM : QuizMode.NORMAL)

    // 更新QuizStore配置
    QuizStore.setConfig({
      mode: quizMode,
      randomize: settings.quizSettings.randomMode,
      // 保留其他现有配置
      chapterIndex: QuizStore.state.config.chapterIndex,
      rangeStart: QuizStore.state.config.rangeStart,
      rangeEnd: QuizStore.state.config.rangeEnd,
      wrongOnly: QuizStore.state.config.wrongOnly
    })

    // 保存到存储
    QuizStore.saveToStorage()
  }

  showToast('设置已保存', 'success')
  showGeneralSettings.value = false
}

// 返回主页方法
const goToHome = () => {
  router.push('/')
}

// 变量定义
const quizLoaded = computed(() => quizData.value !== null)
// const chapter = ref('all')  // 注释掉未使用的变量

// 添加所需的变量和方法
const activeFilter = ref<QuizCategoryType>(QuizCategoryType.CACHE)
const searchQuery = ref('')

// 计算属性：根据筛选条件过滤题库列表
const filteredQuizList = computed(() => {
  const list = getMergedQuizList();
  let filteredList = list;

  // 基于来源分类筛选
  if (activeFilter.value) {
    // 使用辅助函数判断题库来源属于哪个分类
    filteredList = list.filter(item =>
      getQuizCategoryBySource(item.source) === activeFilter.value
    );
  }

  // 搜索筛选
  if (searchQuery.value?.trim()) {
    const searchText = searchQuery.value.toLowerCase();
    filteredList = filteredList.filter(item =>
      item.name.toLowerCase().includes(searchText) ||
      (item.info && item.info.toLowerCase().includes(searchText))
    );
  }

  return filteredList;
});

// 获取合并后的题库列表 - 保留原始来源类型
function getMergedQuizList() {
  // 合并所有来源的题库，保留原始source类型
  return [
    ...localQuizList.value.map(quiz => ({
      id: `${quiz.source || 'local'}-${quiz.name}`,
      source: (quiz.source as QuizSourceType),
      name: quiz.name,
      info: quiz.info || getSourceDescription(quiz.source),
      path: quiz.path,
      title: quiz.title || quiz.name,
      lastModified: quiz.lastModified,
      download_url: undefined as string | undefined
    })),
    ...onlineQuizList.value.map(quiz => ({
      id: `online-${quiz.path}`,
      source: QuizSourceType.ONLINE,
      name: quiz.name,
      info: quiz.info || '在线题库',
      path: quiz.path,
      download_url: quiz.download_url,
      title: quiz.name,
      lastModified: 0
    })),
    ...remoteQuizList.value.map(quiz => ({
      id: `remote-${quiz.path}`,
      source: QuizSourceType.REMOTE,
      name: quiz.name,
      info: quiz.info || '远程题库',
      path: quiz.path,
      download_url: quiz.download_url,
      title: quiz.name,
      lastModified: 0
    }))
  ];
}

// 根据来源类型获取描述
function getSourceDescription(source: QuizSourceType | string): string {
  switch (source) {
    case QuizSourceType.LOCAL:
      return '从文件导入';
    case QuizSourceType.ONLINE_IMPORT:
      return '从在线导入';
    case QuizSourceType.REMOTE_IMPORT:
      return '从远程导入';
    case QuizSourceType.ONLINE:
      return '在线题库';
    case QuizSourceType.REMOTE:
      return '远程题库';
    default:
      return '未知来源';
  }
}

// 选择题库 - 简化版
function selectQuiz(quiz: QuizItemExtended) {
  // 如果正在加载题库，不允许选择其他题库
  if (loadingQuizItem.value) return;

  // 如果点击的是当前选中的题库，不执行操作
  if (selectedQuizItem.value && selectedQuizItem.value.id === quiz.id) return;

  // 记录选中的题库
  selectedQuizItem.value = quiz;
  loadingQuizItem.value = quiz;
  showToast(`正在加载题库: ${quiz.name}`, 'info');

  // 自动加载题库
  loadSelectedQuiz().then(() => {
    // 设置为已应用的题库
    appliedQuizItem.value = selectedQuizItem.value;
    showToast(`已加载题库: ${quiz.name}`, 'success');
  }).catch(err => {
    console.error('加载题库失败:', err);
    showToast(`加载题库失败: ${(err as Error).message}`, 'error');
  }).finally(() => {
    loadingQuizItem.value = null;
  });
}

// 加载选中的题库 - 优化版
async function loadSelectedQuiz() {
  if (!selectedQuizItem.value) return;

  const quiz = selectedQuizItem.value;

  try {
    const source = quiz.source;
    let data = null;

    // 分类处理不同来源的题库
    if (source === QuizSourceType.ONLINE || source === QuizSourceType.REMOTE) {
      // 处理远程或在线题库
      data = await fetchQuizData(quiz);

      if (data) {
        // 保存到缓存并更新缓存列表
        saveQuizToCache(quiz, data);
      }
    } else {
      // 尝试从缓存加载
      data = loadQuizFromCache(quiz);
    }

    // 设置加载成功的题库
    if (data) {
      setupQuizData(quiz, data);
    } else {
      throw new Error(`无法加载题库: ${quiz.name}`);
    }
  } catch (err) {
    // 使用变量err而不是error，避免linter错误
    throw err; // 向上层抛出错误
  }
}

// 从远程或在线来源获取题库数据
async function fetchQuizData(quiz: QuizItemExtended) {
  let url = quiz.download_url;

  // 处理在线题库的URL
  if (quiz.source === QuizSourceType.ONLINE && !url) {
    let path = quiz.path || `${quiz.name}.json`;

    // 规范化路径
    if (path.startsWith('./')) {
      path = path.substring(2);
    }
    if (!path.startsWith('/') && !path.startsWith('http')) {
      path = `/${path}`;
    }
    url = path;
  }

  if (!url) {
    throw new Error(`缺少下载链接: ${quiz.name}`);
  }

  // 添加时间戳避免缓存
  const cacheBuster = `?t=${Date.now()}`;
  const finalUrl = url.includes('?') ? `${url}&t=${Date.now()}` : `${url}${cacheBuster}`;

  const response = await fetch(finalUrl);

  if (!response.ok) {
    throw new Error(`获取题库数据失败 (${response.status}): ${response.statusText}`);
  }

  // 解析JSON数据
  try {
    const data = await response.json();

    // 验证数据格式
    if (!enhancedValidQuizData(data)) {
      throw new Error(`无效的题库数据格式: ${quiz.name}`);
    }

    return data;
  } catch {
    // 捕获任何解析错误，但不使用错误对象
    throw new Error(`题库数据格式错误: ${quiz.name}`);
  }
}

// 从缓存加载题库
function loadQuizFromCache(quiz: QuizItemExtended) {
  const cacheKey = `quizCache_${quiz.name}`;
  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData) {
    try {
      return JSON.parse(cachedData);
    } catch (error) {
      console.error(`解析缓存数据失败: ${quiz.name}`, error);
      throw new Error(`缓存数据损坏: ${quiz.name}`);
    }
  } else if (quiz.source === QuizSourceType.LOCAL) {
    throw new Error(`找不到题库缓存: ${quiz.name}`);
  }

  return null;
}

// 将题库保存到缓存
function saveQuizToCache(quiz: QuizItemExtended, data: QuizData) {
  const cacheKey = `quizCache_${quiz.name}`;
  localStorage.setItem(cacheKey, JSON.stringify(data));

  // 设置保存来源类型
  const importSource = quiz.source === QuizSourceType.ONLINE
    ? QuizSourceType.ONLINE_IMPORT
    : QuizSourceType.REMOTE_IMPORT;

  // 查找是否已存在同名同源的导入题库
  const existingIndex = localQuizList.value.findIndex(
    q => q.name === quiz.name && q.source === importSource
  );

  const localEntry = {
    id: `${importSource}-${Date.now()}`,
    name: quiz.name,
    path: 'localStorage',
    source: importSource,
    info: quiz.info || getSourceDescription(importSource),
    title: quiz.name,
    lastModified: Date.now()
  };

  if (existingIndex >= 0) {
    localQuizList.value[existingIndex] = localEntry;
  } else {
    localQuizList.value.push(localEntry);
  }

  // 保存题库列表
  localStorage.setItem('cachedQuizList', JSON.stringify(localQuizList.value));

  // 更新选中的题库来源为导入类型
  selectedQuizItem.value = {
    ...quiz,
    source: importSource as QuizSourceType
  };
}

// 设置加载成功的题库数据
function setupQuizData(quiz: QuizItemExtended, data: QuizData) {
  // 设置题库数据
  quizData.value = data;
  QuizStore.setQuizData(data);

  // 更新选中的题库的数据
  if (selectedQuizItem.value) {
    selectedQuizItem.value = {
      ...selectedQuizItem.value,
      data: data
    };
  }

  // 记录最后加载的题库
  lastLoadedQuiz.value = {
    source: selectedQuizItem.value!.source,
    name: quiz.name
  };

  // 更新QuizStore的最后加载记录
  QuizStore.setLastLoaded(quiz.name, selectedQuizItem.value!.source);

  // 重置设置
  selectedChapter.value = 'all';
  quizMode.value = QuizMode.NORMAL;
  rangeStart.value = 1;
  rangeEnd.value = getMaxQuestionNumber();

  // 更新QuizStore配置
  QuizStore.setConfig({
    chapterIndex: selectedChapter.value,
    mode: quizMode.value,
    rangeStart: rangeStart.value,
    rangeEnd: rangeEnd.value,
    randomize: false,
    wrongOnly: false
  });

  // 保存状态
  saveQuizState();
}

// 加载统计数据
function loadStatsData() {
  try {
    // 从本地存储加载统计数据
    const statsData = localStorage.getItem('quizStats');
    if (statsData) {
      const stats = JSON.parse(statsData);
      answeredQuestions.value = stats.totalAnswered || 0;
      correctQuestions.value = stats.correctCount || 0;
      userAnswerData.value = stats;
    }
  } catch (error) {
    console.error('加载统计数据失败:', error);
  }
}

// 获取最大题目编号，用于范围模式的结束值
function getMaxQuestionNumber() {
  if (!quizData.value || !quizData.value.chapters) return 100;

  let maxQuestionNum = 0;
  quizData.value.chapters.forEach(chapter => {
    if (chapter.questions && chapter.questions.length > 0) {
      maxQuestionNum += chapter.questions.length;
    }
  });

  return maxQuestionNum > 0 ? maxQuestionNum : 100;
}

// 切换筛选器方法
function changeFilter(filter: QuizCategoryType) {
  activeFilter.value = filter;
}

// 获取题库来源的CSS类
function getQuizSourceClass(quiz: QuizItem) {
  const sourceClassMap: Record<string, string> = {
    [QuizSourceType.LOCAL]: 'source-badge local',
    [QuizSourceType.ONLINE]: 'source-badge online',
    [QuizSourceType.REMOTE]: 'source-badge remote',
    [QuizSourceType.ONLINE_IMPORT]: 'source-badge online-import',
    [QuizSourceType.REMOTE_IMPORT]: 'source-badge remote-import'
  };

  return sourceClassMap[quiz.source] || 'source-badge unknown';
}

// 获取题库来源的显示标签
function getQuizSourceLabel(quiz: QuizItem) {
  return getSourceDescription(quiz.source);
}

// 获取题库描述
function getQuizDescription(quiz: QuizItemExtended | null) {
  if (!quiz) return '暂无描述';

  if (quiz.info) return quiz.info;

  return getSourceDescription(quiz.source);
}

// 打开刷题模式模态框
function openQuizModeModal() {
  showQuizModeModal.value = true;
}

// 确认刷题模式
function confirmQuizMode() {
  // 保存选择的刷题模式
  localStorage.setItem('quizMode', quizMode.value);
  localStorage.setItem('rangeStart', rangeStart.value.toString());
  localStorage.setItem('rangeEnd', rangeEnd.value.toString());

  // 更新QuizStore的配置
  QuizStore.setConfig({
    mode: quizMode.value,
    rangeStart: rangeStart.value,
    rangeEnd: rangeEnd.value,
    // 保留其他现有配置
    randomize: QuizStore.state.config.randomize,
    chapterIndex: QuizStore.state.config.chapterIndex,
    wrongOnly: QuizStore.state.config.wrongOnly
  });

  // 保存到存储
  QuizStore.saveToStorage();

  // 关闭模态框
  showQuizModeModal.value = false;

  showToast('刷题模式已设置', 'success');
}

// 检查GitHub是否已配置
const isGithubConfigured = computed(() => {
  return Boolean(
    localStorage.getItem('github_owner') &&
    localStorage.getItem('github_repo') &&
    localStorage.getItem('github_token')
  );
});

// 从远程同步
function handleSyncFromRemote() {
  if (!selectedQuiz.value) return;

  closeContextMenu();
  showToast('正在从远程同步题库...', 'info');

  // 这里实现同步逻辑
  setTimeout(() => {
    showToast('同步功能尚未实现', 'warning');
  }, 1000);
}

// 推送到远程
function handlePushToRemote() {
  if (!selectedQuiz.value) return;

  closeContextMenu();
  showToast('正在推送题库到远程...', 'info');

  // 这里实现推送逻辑
  setTimeout(() => {
    showToast('推送功能尚未实现', 'warning');
  }, 1000);
}

// 错误详情模态框
const errorDetails = ref<string>('');
const showErrorModal = ref(false);

// 关闭错误详情模态框
function closeErrorModal() {
  showErrorModal.value = false;
}

// 根据来源类型确定分类
function getQuizCategoryBySource(sourceType: QuizSourceType): QuizCategoryType {
  switch (sourceType) {
    case QuizSourceType.LOCAL:
    case QuizSourceType.ONLINE_IMPORT:
    case QuizSourceType.REMOTE_IMPORT:
      return QuizCategoryType.CACHE;
    case QuizSourceType.ONLINE:
      return QuizCategoryType.ONLINE;
    case QuizSourceType.REMOTE:
      return QuizCategoryType.REMOTE;
    default:
      return QuizCategoryType.CACHE; // 默认归为缓存分类
  }
}

// 确认重命名
function confirmRename() {
  if (!selectedQuiz.value || !newQuizName.value.trim()) {
    showToast('请输入有效的题库名称', 'error');
    return;
  }

  try {
    // 实现重命名逻辑
    if (selectedQuiz.value.source === 'local') {
      // 缓存题库重命名
      const quiz = localQuizList.value.find((q) => q.path === selectedQuiz.value?.quiz.path);
      if (quiz) {
        quiz.name = newQuizName.value;

        // 更新本地缓存列表
        localStorage.setItem('cachedQuizList', JSON.stringify(localQuizList.value));

        // 如果当前加载的就是这个题库，也更新title
        if (
          quizData.value &&
          lastLoadedQuiz.value &&
          lastLoadedQuiz.value.source === 'local' &&
          lastLoadedQuiz.value.name === selectedQuiz.value.quiz.name
        ) {
          quizData.value.title = newQuizName.value;
          lastLoadedQuiz.value.name = newQuizName.value;
          saveQuizState();
        }

        showToast('题库重命名成功', 'success');
      }
    } else if (selectedQuiz.value.source === 'remote') {
      // 远程题库重命名逻辑（仅本地显示名）
      const quiz = remoteQuizList.value.find((q) => q.path === selectedQuiz.value?.quiz.path);
      if (quiz) {
        quiz.name = newQuizName.value;

        // 如果当前加载的就是这个题库，也更新title
        if (
          quizData.value &&
          lastLoadedQuiz.value &&
          lastLoadedQuiz.value.source === 'remote' &&
          lastLoadedQuiz.value.name === selectedQuiz.value.quiz.name
        ) {
          quizData.value.title = newQuizName.value;
          lastLoadedQuiz.value.name = newQuizName.value;
          saveQuizState();
        }

        showToast('题库重命名成功（仅本地显示名称变更）', 'success');
      }
    }
  } catch (err) {
    console.error('重命名题库失败:', err);
    showToast('重命名题库失败', 'error');
  } finally {
    // 关闭重命名模态框
    showRenameModal.value = false;
  }
}

// 切换主题方法
const handleToggleTheme = () => {
  const themeToggle = document.querySelector('.page-library__theme-toggle') as HTMLElement
  if (themeToggle) {
    themeToggle.classList.toggle('dark')
    const isDark = themeToggle.classList.contains('dark')
    isDarkMode.value = isDark

    if (isDark) {
      document.body.classList.add('dark-theme')
      localStorage.setItem('theme', 'dark')
    } else {
      document.body.classList.remove('dark-theme')
      localStorage.setItem('theme', 'light')
    }
  }
}

// 添加通用设置对象
const generalSettings = reactive<GeneralSettings>({
  uiSettings: {
    darkMode: document.documentElement.getAttribute('theme') === 'dark',
    themeColor: 'default',
    customColor: '#4caf50',
    fontSize: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--font-size-base') || '14px'),
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
});

// 删除相关状态
const showDeleteConfirmModal = ref(false)
const deleteTargetName = ref('')
const deleteTargetSource = ref('')
const isDeleting = ref(false)

// 打开GitHub同步设置模态框
function handleOpenSyncConfig() {
  if (!selectedQuizItem.value) {
    showToast('请先选择一个题库', 'warning');
    return;
  }
  showlibrarySyncConfigModal.value = true;
}
</script>

<style>
@import './page-library.css';
@import '../../styles/variables.css';
@import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';

/* 添加删除确认框样式 */
.delete-confirm-message {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 16px;
}

.delete-confirm-warning {
  color: var(--error-color, #f44336);
  background-color: rgba(244, 67, 54, 0.08);
  padding: 12px;
  border-radius: 4px;
  margin-top: 16px;
  font-size: 14px;
}

.page-library__card-action--danger {
  background-color: var(--error-color, #f44336) !important;
}

.icon-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
