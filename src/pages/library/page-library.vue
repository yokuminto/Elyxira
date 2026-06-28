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
            @open-general-settings="showGeneralSettings = true" @open-repo-settings="showlibrarySyncConfigModal = true"
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
          @click="handleGithubSync('fetch')">
          <BaseIcon name="refresh" size="16" />
          从远程同步
        </div>
        <div class="menu-item" v-if="selectedQuiz && selectedQuiz.source === QuizSourceType.LOCAL && isGithubConfigured"
          @click="handleGithubSync('push')">
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

            <!-- 绯想击破按钮 -->
            <button class="page-library__card-action page-library__break-button" @click="startBreakMode">
              <BaseIcon name="start" size="16" />
              <span>绯想击破</span>
            </button>

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
      <LibraryDataModal v-if="showlibraryDataModal" :quiz-data="quizData || undefined" :show="showlibraryDataModal"
        @close="showlibraryDataModal = false" @import-complete="loadQuizList" />


      <!-- 题库同步与仓库配置模态框 -->
      <QuizSyncModal :show="showlibrarySyncConfigModal" @close="showlibrarySyncConfigModal = false"
        @sync-complete="handleSyncComplete" @save="handleRepoConfigSave" />


      <!-- 通用设置模态框 -->
      <ModalSettings :show="showGeneralSettings" :current-settings="appSettings" @close="showGeneralSettings = false"
        @save="handleAppSettingsSave" />

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

      <!-- 通用确认对话框 -->
      <div class="modal-overlay" :class="{ active: showConfirmModal }" @click.self="showConfirmModal = false">
        <div class="page-library__modal">
          <div class="page-library__modal-header">
            <h3 class="page-library__modal-title">{{ confirmModalContent.title }}</h3>
            <button class="page-library__modal-close" @click="showConfirmModal = false">&times;</button>
          </div>
          <div class="page-library__modal-body">
            <p class="delete-confirm-message">
              <BaseIcon name="warning" size="24" />
              {{ confirmModalContent.message }}
            </p>
          </div>
          <div class="page-library__modal-footer">
            <button class="page-library__filter-button" @click="confirmModalContent.onCancel">
              {{ confirmModalContent.cancelText || '取消' }}
            </button>
            <button class="page-library__card-action" @click="confirmModalContent.onConfirm">
              {{ confirmModalContent.confirmText || '确定' }}
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
import { showToast, injectToastStyles } from '../../utils/toast'
import configService, {
  QuizMode, QuizSourceType,
  QuizCategoryType,
} from '@/services/config-service'
import type {
  QuizData,
  QuizItem,
  QuizConfig,
  QuizItemExtended,
  LocalQuizCache,
  GithubApiFile,
  GeneralSettings,
  AppSettings,
  UiSettings,
  QuizSettings
} from '@/services/config-service'
import { parseQuiz } from '@/services/service-quiz-parser'

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
const showGeneralSettings = ref(false)
const showDebugModal = ref(false)
const showlibraryDataModal = ref(false)
const showlibrarySyncConfigModal = ref(false)
const showRenameModal = ref(false)
const showQuizModeModal = ref(false)
const showDeleteConfirmModal = ref(false)
const showConfirmModal = ref(false)
const newQuizName = ref('')
const selectedQuiz = ref<{ source: QuizSourceType; quiz: QuizItem } | null>(null)
const isDarkMode = ref(configService.getUiSettings().darkMode)
const deleteTargetName = ref('')
const deleteTargetSource = ref('')
const isDeleting = ref(false)

// 通用确认对话框内容
const confirmModalContent = ref({
  title: '',
  message: '',
  confirmText: '确定',
  cancelText: '取消',
  onConfirm: () => {
    showConfirmModal.value = false;
  },
  onCancel: () => {
    showConfirmModal.value = false;
  }
});

// 计算属性
const totalQuestionsValue = computed(() => {
  // 首先尝试从 selectedQuizItem.value?.data 获取数据
  if (selectedQuizItem.value?.data?.chapters) {
    return selectedQuizItem.value.data.chapters.reduce((acc: number, chapter: { questions?: Array<unknown> }) => {
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
  const githubConfig = configService.getGithubConfig();
  return Boolean(githubConfig?.repo && githubConfig?.token);
})

// 生命周期钩子
onMounted(async () => {
  // 设置加载状态
  isLoading.value = true;
  refreshLoading.value = true;

  // 初始化主题
  const uiSettings = configService.getUiSettings();
  isDarkMode.value = uiSettings.darkMode;
  if (isDarkMode.value) {
    const themeToggle = document.querySelector('.page-library__theme-toggle') as HTMLElement;
    if (themeToggle) {
      themeToggle.classList.add('dark');
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
    showToast('初始化题库页面失败，请刷新页面重试', 'error');
  } finally {
    refreshLoading.value = false;
    isLoading.value = false;
  }
})

// 恢复上次选择的题库
function restoreLastSelectedQuiz() {
  // 使用configService获取数据
  const lastQuiz = configService.getLastLoadedQuiz();
  const quizDataFromService = configService.getQuizData();

  if (quizDataFromService && lastQuiz) {
    try {
      quizData.value = quizDataFromService;
      lastLoadedQuiz.value = lastQuiz;

      // 从configService恢复设置
      const quizConfig = configService.getQuizConfig();
      selectedChapter.value = quizConfig.chapterIndex;
      quizMode.value = quizConfig.mode;

      // 恢复范围值
      rangeStart.value = quizConfig.rangeStart;
      rangeEnd.value = quizConfig.rangeEnd || getMaxQuestionNumber();

      // 恢复选中的题库
      const quiz = getMergedQuizList().find(q =>
        q.name === lastQuiz.name &&
        q.source === lastQuiz.source
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
      configService.clearCurrentQuiz();
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
    // 使用configService加载题库列表，而不是直接操作localStorage
    localQuizList.value = configService.loadQuizList();
  } catch (error) {
    showToast('加载缓存题库列表失败', 'warning');
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
    showToast(`加载在线题库列表失败: ${(err as Error).message}`, 'error');
    onlineQuizList.value = [];
  }
}

// 加载远程题库列表 - 优化版
async function loadRemoteQuizList() {
  try {
    const githubConfig = configService.getGithubConfig();
    if (!githubConfig?.repo || !githubConfig?.token) {
      showToast('GitHub 配置不完整', 'error');
      return;
    }

    // 构建API请求URL - 使用配置的路径或默认路径
    const path = githubConfig.path || 'quizzes';
    const apiUrl = `https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/contents/${path}`;

    // 获取远程题库列表
    const response = await fetch(`${apiUrl}?ref=${githubConfig.branch}`, {
      headers: {
        'Authorization': `token ${githubConfig.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error(`获取远程题库列表失败 (${response.status}): ${await response.text()}`);
    }

    const data = await response.json();

    // 确保data是数组
    if (!Array.isArray(data)) {
      throw new Error('获取的远程题库列表格式无效');
    }

    // 过滤出JSON和TXT文件
    remoteQuizList.value = data
      .filter((item: GithubApiFile) =>
        item.type === 'file' &&
        (item.name.endsWith('.json') || item.name.endsWith('.txt'))
      )
      .map((item: GithubApiFile) => ({
        id: `remote-${item.path}`,
        source: QuizSourceType.REMOTE,
        name: item.name.replace(/\.(json|txt)$/, ''),
        info: `GitHub: ${githubConfig.repo}/${path}`,
        path: item.path,
        title: item.name.replace(/\.(json|txt)$/, ''),
        lastModified: Date.now(),
        download_url: item.download_url
      }));

    if (remoteQuizList.value.length > 0) {
      showToast(`已加载 ${remoteQuizList.value.length} 个远程题库`, 'success');
    } else {
      showToast(`远程仓库 ${path} 中未找到题库文件`, 'warning');
    }
  } catch (error) {
    console.error('加载远程题库失败:', error);
    showToast(`加载远程题库失败: ${(error as Error).message}`, 'error');
    remoteQuizList.value = [];
  }
}

// 保存当前题库状态到localStorage
function saveQuizState() {
  if (quizData.value) {
    // 使用configService统一管理状态
    configService.setQuizData(quizData.value);
    configService.saveLastLoadedQuiz(lastLoadedQuiz.value.name, lastLoadedQuiz.value.source);
    configService.setQuizConfig({
      chapterIndex: selectedChapter.value,
      mode: quizMode.value,
      rangeStart: parseInt(rangeStart.value.toString()),
      rangeEnd: parseInt(rangeEnd.value.toString()),
      randomize: quizMode.value === 'random',
      wrongOnly: quizMode.value === 'wrong',
    });

    // 保存到configService的存储
    configService.saveQuizState();
  }
}

// 开始绯想击破模式
const startBreakMode = () => {
  router.push('/break')
}

// 开始刷题 - 优化版
const startQuiz = async () => {
  if (!quizData.value) {
    showToast('请先选择一个题库', 'error');
    return;
  }

  // 设置刷题配置
  configService.setQuizConfig({
    chapterIndex: selectedChapter.value,
    mode: quizMode.value === 'wrong' ? QuizMode.REVIEW : quizMode.value,
    rangeStart: parseInt(rangeStart.value.toString()),
    rangeEnd: parseInt(rangeEnd.value.toString()),
    randomize: quizMode.value === 'random',
    wrongOnly: quizMode.value === 'wrong',
  });

  // 保存状态
  configService.saveQuizState();

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
  console.log('Attempting to confirm delete...');
  if (!selectedQuiz.value) {
    console.log('Confirm delete aborted: No quiz selected.');
    return;
  }

  isDeleting.value = true;
  console.log(`Deleting quiz: ${selectedQuiz.value.quiz.name} (Source: ${selectedQuiz.value.source})`);

  try {
    if (selectedQuiz.value.source === 'local' || selectedQuiz.value.source === QuizSourceType.ONLINE_IMPORT || selectedQuiz.value.source === QuizSourceType.REMOTE_IMPORT) {
      deleteLocalQuiz();
    } else if (selectedQuiz.value.source === 'remote') {
      await deleteRemoteQuiz();
    }
    // 关闭确认对话框
    showDeleteConfirmModal.value = false;
    console.log('Delete confirmation modal closed.');
  } catch (err) {
    console.error('删除题库失败:', err);
    errorDetails.value = `删除题库失败: ${(err as Error).message}`;
    showErrorModal.value = true;
  } finally {
    isDeleting.value = false;
    console.log('Delete operation finished.');
  }
}

function deleteLocalQuiz() {
  if (!selectedQuiz.value) return;

  const quizToDelete = selectedQuiz.value.quiz;
  const quizName = quizToDelete.name;
  const quizSource = selectedQuiz.value.source;

  console.log(`尝试删除本地题库: ${quizName} (来源: ${quizSource})`);

  // 使用名称和来源精确查找索引
  const index = localQuizList.value.findIndex(
    (q) => q.name === quizName && q.source === quizSource
  );

  console.log(`找到要删除的索引: ${index}`);

  if (index > -1) {
    // 从列表中移除
    localQuizList.value.splice(index, 1);
    console.log(`已从题库列表中移除`);

    // 使用configService更新题库列表和移除题库缓存
    configService.saveQuizList(localQuizList.value);
    configService.removeQuizFromStorage(quizName);
    console.log(`已保存题库列表并移除缓存: ${quizName}`);

    // 如果当前加载的就是这个题库，也清空当前题库
    if (
      lastLoadedQuiz.value &&
      lastLoadedQuiz.value.source === quizSource &&
      lastLoadedQuiz.value.name === quizName
    ) {
      configService.clearCurrentQuiz();
      quizData.value = null;
      lastLoadedQuiz.value = { name: '', source: '' };
      selectedQuizItem.value = null;
      appliedQuizItem.value = null;
      console.log(`已清空当前题库数据，因为它是正在被删除的题库`);
    }

    showToast('题库删除成功', 'success');
    selectedQuiz.value = null;

    // 手动刷新题库列表，确保UI更新
    loadQuizList();
    console.log('已手动刷新题库列表以确保UI更新');
  } else {
    console.warn(`尝试删除本地题库失败：在列表中未找到 ${quizName} (来源: ${quizSource})`);
    configService.removeQuizFromStorage(quizName);
    console.log(`尝试从存储中移除: ${quizName}`);
    showToast('删除失败：无法在列表中找到题库', 'error');
  }
}

// 删除远程题库 - 更新为实际删除GitHub仓库文件
async function deleteRemoteQuiz() {
  if (!selectedQuiz.value) return;

  // 使用configService获取GitHub配置
  const githubConfig = configService.getGithubConfig();
  const owner = githubConfig.owner;
  const repoName = githubConfig.repo;
  const branch = githubConfig.branch || 'main';
  const token = githubConfig.token;

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
      configService.clearCurrentQuiz();
      quizData.value = null;
      lastLoadedQuiz.value = {
        name: '',
        source: ''
      };
    }

    showToast('题库已成功从GitHub仓库删除', 'success');
  }
}

// 处理仓库配置保存
function handleRepoConfigSave(config: Record<string, unknown>) {
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

      // 使用统一解析器，传入文件名作为格式提示
      const data = parseQuiz(content, file.name)

      // 使用增强版的验证函数，提高兼容性
      if (configService.enhancedValidQuizData(data)) {
        quizData.value = data
        configService.setQuizData(data)

        // 记录当前加载的题库
        lastLoadedQuiz.value = {
          source: 'file',
          name: file.name.replace(/\.(json|txt)$/, ''),
        }

        // 记录最后加载的题库
        configService.saveLastLoadedQuiz(file.name.replace(/\.(json|txt)$/, ''), 'file');

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

        // 使用configService保存题库列表
        configService.saveQuizList(localQuizList.value);

        // 保存独立缓存
        configService.saveQuizToStorage(localCacheEntry.name, data);

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

  reader.readAsText(file)
}

// 添加一个反应式的 AppSettings 变量
const appSettings = reactive(configService.getSettings());

// 处理通用设置保存的函数
const handleAppSettingsSave = () => { // 移除 settings 参数
  // configService.updateSettings(settings); // 移除此行，因为 modal-settings 已经保存
  // 更新本地响应式变量
  Object.assign(appSettings, configService.getSettings()); // 从服务重新获取最新设置
  isDarkMode.value = appSettings.uiSettings.darkMode; // 从更新后的 appSettings 获取 darkMode
};

// 保持原有 handleGeneralSettingsSave 的引用（如果其他地方还在用）
// 或者，如果确定不再需要，可以完全移除

// 返回主页方法
const goToHome = () => {
  router.push('/')
}

// 变量定义
const quizLoaded = computed(() => quizData.value !== null)

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
      lastModified: Date.now()
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

  // 检查是否为远程题库且是否存在同名本地题库
  if (quiz.source === QuizSourceType.REMOTE) {
    const localQuiz = localQuizList.value.find(
      q => q.name === quiz.name && (q.source === QuizSourceType.LOCAL || q.source === QuizSourceType.REMOTE_IMPORT)
    );

    if (localQuiz) {
      // 如果存在同名本地题库，显示确认对话框
      showConfirmModal.value = true;
      confirmModalContent.value = {
        title: '覆盖本地题库',
        message: `发现同名本地题库"${quiz.name}"，加载远程版本将覆盖本地版本，是否继续？`,
        confirmText: '覆盖加载',
        cancelText: '取消',
        onConfirm: () => {
          showConfirmModal.value = false;
          showToast(`正在加载题库: ${quiz.name}`, 'info');
          loadQuizAndOverrideLocal(quiz);
        },
        onCancel: () => {
          showConfirmModal.value = false;
          selectedQuizItem.value = null;
          loadingQuizItem.value = null;
        }
      };
      return;
    }
  }

  showToast(`正在加载题库: ${quiz.name}`, 'info');

  // 自动加载题库
  loadSelectedQuiz().then(() => {
    // 设置为已应用的题库
    appliedQuizItem.value = selectedQuizItem.value;
    showToast(`已加载题库: ${quiz.name}`, 'success');
  }).catch(err => {
    showToast(`加载题库失败: ${(err as Error).message}`, 'error');
  }).finally(() => {
    loadingQuizItem.value = null;
  });
}

// 加载远程题库并覆盖本地题库
async function loadQuizAndOverrideLocal(quiz: QuizItemExtended) {
  try {
    // 从远程获取数据
    const data = await fetchQuizData(quiz);

    if (data) {
      // 强制覆盖本地题库
      configService.saveQuizToStorage(quiz.name, data);

      // 更新本地题库列表
      const existingIndex = localQuizList.value.findIndex(
        q => q.name === quiz.name && (
          q.source === QuizSourceType.LOCAL ||
          q.source === QuizSourceType.REMOTE_IMPORT ||
          q.source === QuizSourceType.ONLINE_IMPORT
        )
      );

      const localEntry = {
        id: `${QuizSourceType.REMOTE_IMPORT}-${Date.now()}`,
        name: quiz.name,
        path: 'localStorage',
        source: QuizSourceType.REMOTE_IMPORT,
        info: getSourceDescription(QuizSourceType.REMOTE_IMPORT),
        title: quiz.name,
        lastModified: Date.now()
      };

      if (existingIndex >= 0) {
        localQuizList.value[existingIndex] = localEntry;
      } else {
        localQuizList.value.push(localEntry);
      }

      // 保存更新后的题库列表
      configService.saveQuizList(localQuizList.value);

      // 设置题库数据
      setupQuizData(quiz, data);

      // 更新选中题库为导入类型
      selectedQuizItem.value = {
        ...quiz,
        source: QuizSourceType.REMOTE_IMPORT as QuizSourceType,
        id: localEntry.id
      };

      // 设置为已应用的题库
      appliedQuizItem.value = selectedQuizItem.value;

      showToast(`已覆盖并加载题库: ${quiz.name}`, 'success');
    } else {
      throw new Error(`无法加载远程题库: ${quiz.name}`);
    }
  } catch (err) {
    showToast(`加载题库失败: ${(err as Error).message}`, 'error');
  } finally {
    loadingQuizItem.value = null;
  }
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
    if (!configService.enhancedValidQuizData(data)) {
      throw new Error(`无效的题库数据格式: ${quiz.name}`);
    }

    return data;
  } catch (error) {
    console.error(`题库数据格式错误: ${quiz.name}`, error);
    throw new Error(`题库数据格式错误: ${quiz.name}`);
  }
}

// 从缓存加载题库
function loadQuizFromCache(quiz: QuizItemExtended) {
  // 使用configService加载题库数据
  const cachedData = configService.loadQuizFromStorage(quiz.name);

  if (cachedData) {
    return cachedData;
  } else if (quiz.source === QuizSourceType.LOCAL) {
    throw new Error(`找不到题库缓存: ${quiz.name}`);
  }

  return null;
}

// 将题库保存到缓存
function saveQuizToCache(quiz: QuizItemExtended, data: QuizData) {
  // 使用configService保存题库数据
  configService.saveQuizToStorage(quiz.name, data);

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

  // 使用configService保存题库列表
  configService.saveQuizList(localQuizList.value);

  // 更新选中的题库来源为导入类型
  selectedQuizItem.value = {
    ...quiz,
    source: importSource as QuizSourceType
  };
}

// 设置加载成功的题库数据
function setupQuizData(quiz: QuizItemExtended, data: QuizData) {
  // 设置题库数据
  quizData.value = data
  configService.setQuizData(data)

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

  // 更新最后加载的题库记录
  configService.saveLastLoadedQuiz(quiz.name, selectedQuizItem.value!.source);

  // 重置设置
  selectedChapter.value = 'all';
  quizMode.value = QuizMode.NORMAL;
  rangeStart.value = 1;
  rangeEnd.value = getMaxQuestionNumber();

  // 更新测验配置
  configService.setQuizConfig({
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
    // 使用configService获取统计数据，不再直接操作localStorage
    answeredQuestions.value = configService.getQuizAnsweredCount();
    correctQuestions.value = configService.getQuizCorrectCount();
    userAnswerData.value = {
      totalAnswered: answeredQuestions.value,
      correctCount: correctQuestions.value,
      wrongCount: configService.getQuizAnsweredCount() - configService.getQuizCorrectCount(),
      dailyActivity: []
    };
  } catch (error) {
    showToast('加载统计数据失败', 'error');
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
  // 保存选择的刷题模式并更新配置
  configService.setQuizConfig({
    mode: quizMode.value,
    rangeStart: rangeStart.value,
    rangeEnd: rangeEnd.value,
    randomize: quizMode.value === 'random',
    chapterIndex: selectedChapter.value,
    wrongOnly: quizMode.value === 'wrong'
  });

  // 保存状态
  configService.saveQuizState();

  // 关闭模态框
  showQuizModeModal.value = false;

  showToast('刷题模式已设置', 'success');
}

// 检查GitHub是否已配置
const isGithubConfigured = computed(() => {
  const githubConfig = configService.getGithubConfig();
  return Boolean(githubConfig.owner && githubConfig.repo && githubConfig.token);
});

// 处理GitHub同步功能
async function handleGithubSync(action: 'fetch' | 'push') {
  if (!selectedQuiz.value) return;

  closeContextMenu();
  const quiz = selectedQuiz.value.quiz;
  const quizName = quiz.name;
  const actionText = action === 'fetch' ? '从远程同步' : '推送到远程';

  showToast(`正在${actionText}题库...`, 'info');
  isLoading.value = true;

  try {
    let success = false;

    if (action === 'fetch') {
      // 从GitHub获取题库
      const data = await configService.syncQuizFromGithub(quizName);
      success = !!data;

      if (success && data) {
        // 注意：实际同步的题库名可能与请求的题库名不同
        // 例如，可能匹配了部分名称或使用了其他匹配方法
        // 因此我们需要判断返回的数据是否与当前已加载题库相关

        // 如果当前加载的题库与请求同步的题库相关，则刷新数据
        if (lastLoadedQuiz.value && lastLoadedQuiz.value.name === quizName) {
          quizData.value = data;
          if (selectedQuizItem.value) {
            selectedQuizItem.value.data = data;
          }
        }

        // 成功后无论如何都刷新题库列表
        await loadQuizList();
      }
    } else {
      // 推送题库到GitHub
      success = await configService.pushQuizToGithub(quizName);
    }

    if (success) {
      // 如果成功，刷新题库列表
      await loadQuizList();
    }
  } catch (error) {
    showToast(`${actionText}失败: ${(error as Error).message}`, 'error');
  } finally {
    isLoading.value = false;
  }
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
        const oldName = quiz.name;
        quiz.name = newQuizName.value;

        // 更新本地缓存列表
        configService.saveQuizList(localQuizList.value);

        // 如果存在缓存数据，需要重命名缓存
        const quizData = configService.loadQuizFromStorage(oldName);
        if (quizData) {
          // 保存到新名称
          configService.saveQuizToStorage(newQuizName.value, quizData);
          // 删除旧缓存
          configService.removeQuizFromStorage(oldName);
        }

        // 如果当前加载的就是这个题库，也更新title和lastLoadedQuiz
        if (
          lastLoadedQuiz.value &&
          lastLoadedQuiz.value.source === 'local' &&
          lastLoadedQuiz.value.name === selectedQuiz.value.quiz.name
        ) {
          if (quizData) {
            quizData.title = newQuizName.value;
            configService.setQuizData(quizData);
          }

          lastLoadedQuiz.value.name = newQuizName.value;
          configService.saveLastLoadedQuiz(newQuizName.value, lastLoadedQuiz.value.source);
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

          // 使用configService保存
          configService.setQuizData(quizData.value);
          configService.saveLastLoadedQuiz(newQuizName.value, lastLoadedQuiz.value.source);
        }

        showToast('题库重命名成功（仅本地显示名称变更）', 'success');
      }
    }
  } catch (err) {
    showToast(`重命名题库失败: ${(err as Error).message}`, 'error');
  } finally {
    // 关闭重命名模态框
    showRenameModal.value = false;
  }
}

// 切换主题方法
const handleToggleTheme = () => {
  // 使用configService切换主题
  configService.toggleDarkMode();

  // 更新界面状态
  isDarkMode.value = configService.getUiSettings().darkMode;

  // 更新切换按钮样式
  const themeToggle = document.querySelector('.page-library__theme-toggle') as HTMLElement;
  if (themeToggle) {
    themeToggle.classList.toggle('dark', isDarkMode.value);
  }
}

// 打开GitHub同步设置模态框
function handleOpenSyncConfig() {
  if (!selectedQuizItem.value) {
    showToast('请先选择一个题库', 'warning');
    return;
  }
  showlibrarySyncConfigModal.value = true;
}

// 处理同步完成事件
async function handleSyncComplete(result: { action: string; quiz: string; overrideLocal?: boolean; success: boolean; retainedNotes?: boolean }) {
  console.log('同步完成', result);

  // 刷新题库列表
  await loadQuizList();

  // 使用configService统一处理同步完成后的操作
  const syncResult = await configService.handleQuizSyncComplete(result);

  // 如果有同步结果并成功处理了导入
  if (syncResult) {
    // 如果是新题库或覆盖了本地题库，则需要加载这个题库
    if ((syncResult.isNewQuiz || syncResult.wasOverridden) && syncResult.data) {
      // 创建扩展的题库对象用于加载
      const extendedQuiz: QuizItemExtended = {
        id: `${syncResult.source}-${Date.now()}`,
        name: syncResult.quizName,
        source: QuizSourceType.REMOTE_IMPORT,
        path: 'localStorage',
        info: getSourceDescription(QuizSourceType.REMOTE_IMPORT),
        data: syncResult.data,
        title: syncResult.data.title || syncResult.quizName
      };

      // 设置为选中状态
      selectedQuizItem.value = extendedQuiz;

      // 设置题库数据
      setupQuizData(extendedQuiz, syncResult.data);

      // 设置为已应用的题库
      appliedQuizItem.value = selectedQuizItem.value;

      // 如果是从拉取操作来的，直接跳转到刷题页面
      if (result.action === 'pull') {
        showToast(`题库已加载，正在跳转到刷题页面...`, 'success');
        // 延迟一下再跳转，给用户一个体验过渡的时间
        setTimeout(() => {
          startQuiz();
        }, 1000);
      } else {
        showToast(`已加载题库: ${syncResult.quizName}`, 'success');
      }
    }

    // 再次刷新列表以确保UI更新
    await loadQuizList();
  }
}
</script>

<style>
@import './page-library.css';
@import '../../styles/variables.css';
@import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
</style>
