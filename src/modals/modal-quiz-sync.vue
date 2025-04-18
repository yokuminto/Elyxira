<template>
  <BaseModal title="仓库配置" :show="show" @close="$emit('close')">
    <!-- 当前题库信息 -->
    <div class="modal__section">
      <h3 class="modal__section-title">当前题库信息</h3>
      <div v-if="!currentQuiz?.exists" class="modal__info-message">
        未处于刷题页面或未加载题库。
      </div>
      <div v-else class="modal__info-grid">
        <div class="modal__info-item">
          <span class="modal__info-label">题库名称:</span>
          <span class="modal__info-value">{{ currentQuiz.name || '未命名题库' }}</span>
        </div>
        <div class="modal__info-item">
          <span class="modal__info-label">来源类型:</span>
          <span class="modal__info-value">{{ getSourceTypeName(currentQuiz.source) }}</span>
        </div>
      </div>
    </div>

    <!-- 题库同步功能 -->
    <div class="modal__separator"></div>
    <div class="modal__section">
      <h3 class="modal__section-title">题库同步</h3>

      <div class="modal__form-group">
        <label for="syncQuizName" class="modal__form-label">同步题库名称</label>
        <div class="modal__form-description">与GitHub仓库进行同步操作时使用的文件名</div>
        <input type="text" id="syncQuizName" v-model="syncQuizName" placeholder="例如: my-quiz"
          class="modal__form-control" />
      </div>

      <div class="modal__form-group modal__form-group--switch" v-if="currentQuiz?.isLocal">
        <label class="modal__form-label">创建远程版本</label>
        <label class="modal__toggle-switch">
          <input type="checkbox" v-model="createRemoteRepo" />
          <span class="modal__toggle-slider"></span>
        </label>
      </div>
      <div v-if="currentQuiz?.isLocal" class="modal__form-description">推送时若远程不存在，则创建新文件</div>

      <div class="modal__form-group modal__form-group--switch">
        <label class="modal__form-label">覆盖同名题库</label>
        <label class="modal__toggle-switch">
          <input type="checkbox" v-model="overrideQuiz" />
          <span class="modal__toggle-slider"></span>
        </label>
      </div>
      <div class="modal__form-description">同步时覆盖已存在的题库（推送时覆盖远程，拉取时覆盖本地）</div>

      <div class="modal__form-actions">
        <button class="modal__button modal__button--primary" @click="pullFromGithub"
          :disabled="loading || !syncQuizName">
          <BaseIcon name="download" size="16" />
          {{ loading && syncAction === 'pull' ? '拉取中...' : '从GitHub拉取' }}
        </button>
        <button v-if="currentQuiz?.exists" class="modal__button modal__button--success" @click="pushToGithub"
          :disabled="loading || !isValid || !syncQuizName">
          <BaseIcon name="upload" size="16" />
          {{ loading && syncAction === 'push' ? '推送中...' : '推送到GitHub' }}
        </button>
      </div>
    </div>

    <!-- 仓库配置 -->
    <div class="modal__separator"></div>
    <h3 class="modal__section-title">GitHub 仓库设置</h3>

    <div class="modal__form-group">
      <label for="githubOwner" class="modal__form-label">GitHub 用户名或组织</label>
      <input type="text" id="githubOwner" v-model="config.owner" placeholder="例如: username"
        class="modal__form-control" />
    </div>

    <div class="modal__form-group">
      <label for="githubRepo" class="modal__form-label">仓库名称</label>
      <input type="text" id="githubRepo" v-model="config.repo" placeholder="例如: quiz-data"
        class="modal__form-control" />
    </div>

    <div class="modal__form-group">
      <label for="githubBranch" class="modal__form-label">分支名称</label>
      <input type="text" id="githubBranch" v-model="config.branch" placeholder="例如: main" class="modal__form-control" />
    </div>

    <div class="modal__form-group">
      <label for="githubPath" class="modal__form-label">仓库路径 (可选)</label>
      <input type="text" id="githubPath" v-model="config.path" placeholder="例如: quizzes/" class="modal__form-control" />
    </div>

    <div class="modal__form-group">
      <label for="githubToken" class="modal__form-label">个人访问令牌 (PAT)</label>
      <div class="modal__form-description">用于读写私有仓库或进行推送操作</div>
      <input type="password" id="githubToken" v-model="config.token" placeholder="ghp_xxxxxx"
        class="modal__form-control" />
    </div>

    <div class="modal__form-actions">
      <button class="modal__button modal__button--primary" @click="testConnection" :disabled="loading">
        {{ loading && syncAction === 'test' ? '测试中...' : '测试连接' }}
      </button>
    </div>

    <template #footer>
      <button class="modal__button modal__button--secondary" @click="$emit('close')">取消</button>
      <button class="modal__button modal__button--primary" @click="handleSave" :disabled="!isValid">保存配置</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import { showToast } from '../utils/toast';
import configService from '@/services/config-service';
import BaseModal from './modal-base.vue';
import BaseIcon from '../components/icon.vue';
import type { GithubConfig } from '@/services/config-service';

const emit = defineEmits(['close', 'sync-complete', 'save']);

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  currentQuiz: {
    type: Object,
    default: () => ({
      name: '',
      source: '',
      isLocal: true,
      exists: false
    })
  }
});

const SOURCE_TYPES: Record<string, string> = {
  local: '本地题库',
  online: '在线题库',
  remote: '远程题库',
  'online-import': '从在线导入',
  'remote-import': '从远程导入'
};

const config = ref<GithubConfig>({
  owner: '',
  repo: '',
  branch: 'main',
  path: '',
  token: '',
  forceSync: true
});

const loading = ref(false);
const syncAction = ref<'push' | 'pull' | 'test' | ''>('');
const syncQuizName = ref('');
const createRemoteRepo = ref(false);
const overrideQuiz = ref(true);

// --- Helper to get quiz-specific storage key ---
function getSyncNameStorageKey(quizName: string): string | null {
  return quizName ? `syncName_${quizName}` : null;
}

// 配置变更监听器
const configChangeListener = () => {
  const githubConfig = configService.getGithubConfig();
  config.value = { ...githubConfig }; // Load general GitHub config
  overrideQuiz.value = !!githubConfig.forceSync;
  createRemoteRepo.value = !!githubConfig.createRemoteRepo;

  // Load quiz-specific sync name if quiz exists
  if (props.currentQuiz?.exists && props.currentQuiz.name) {
    const storageKey = getSyncNameStorageKey(props.currentQuiz.name);
    if (storageKey) {
      syncQuizName.value = localStorage.getItem(storageKey) || props.currentQuiz.name || githubConfig.syncQuizName || '';
    } else {
      // Fallback to current quiz name or global default if storage key is null
      syncQuizName.value = props.currentQuiz.name || githubConfig.syncQuizName || '';
    }
  } else {
    // Fallback to global default if no quiz loaded
    syncQuizName.value = githubConfig.syncQuizName || '';
  }
};

// 初始化：从配置服务加载配置
onMounted(() => {
  loadConfig();

  // 添加配置变更监听器
  configService.addListener('github', configChangeListener);
});

onBeforeUnmount(() => {
  // 移除配置变更监听器
  configService.removeListener('github', configChangeListener);
});

// 更新同步名称基于当前题库
watch(() => props.currentQuiz, (quiz) => {
  if (quiz?.exists && quiz.name) {
    const storageKey = getSyncNameStorageKey(quiz.name);
    const storedName = storageKey ? localStorage.getItem(storageKey) : null;
    // Prioritize stored name, then quiz name, then global default from configService
    syncQuizName.value = storedName || quiz.name || configService.getGithubConfig().syncQuizName || '';
  } else {
    // Fallback if no quiz exists
    syncQuizName.value = configService.getGithubConfig().syncQuizName || '';
  }
}, { immediate: true, deep: true });

// 当显示模态框时重新加载配置
watch(() => props.show, (newVal) => {
  if (newVal) {
    loadConfig();
  }
}, { immediate: true });

// 计算属性：配置是否有效
const isValid = computed(() => !!config.value.owner && !!config.value.repo);

// 获取来源类型的友好名称
function getSourceTypeName(source: string): string {
  if (!source) return '未知来源';
  const key = source.toLowerCase();
  return SOURCE_TYPES[key] || source || '未知来源';
}

function loadConfig() {
  const githubConfig = configService.getGithubConfig();
  config.value = { ...githubConfig };
  overrideQuiz.value = !!githubConfig.forceSync;
  createRemoteRepo.value = !!githubConfig.createRemoteRepo;

  // Load quiz-specific sync name
  if (props.currentQuiz?.exists && props.currentQuiz.name) {
    const storageKey = getSyncNameStorageKey(props.currentQuiz.name);
    const storedName = storageKey ? localStorage.getItem(storageKey) : null;
    syncQuizName.value = storedName || props.currentQuiz.name || githubConfig.syncQuizName || '';
  } else {
    syncQuizName.value = githubConfig.syncQuizName || '';
  }
}

// 测试连接
async function testConnection() {
  if (!isValid.value) {
    showToast('请填写必要的配置信息', 'error');
    return;
  }

  loading.value = true;
  syncAction.value = 'test';

  try {
    const { owner, repo, branch, path, token } = config.value;
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`GitHub API错误 (${response.status}): ${error.message || '未知错误'}`);
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      showToast(`成功连接到仓库，发现 ${data.length} 个文件`, 'success');
    } else {
      showToast('连接成功，但路径不是一个目录', 'warning');
    }
  } catch (error) {
    showToast(`连接失败: ${(error as Error).message}`, 'error');
  } finally {
    loading.value = false;
    syncAction.value = '';
  }
}

// 处理保存配置并关闭模态框
function handleSave() {
  saveConfig();
  emit('close');
}

// 保存配置
function saveConfig() {
  if (!isValid.value) return;

  // 1. Save quiz-specific sync name to localStorage
  if (props.currentQuiz?.exists && props.currentQuiz.name) {
    const storageKey = getSyncNameStorageKey(props.currentQuiz.name);
    if (storageKey && syncQuizName.value) {
      localStorage.setItem(storageKey, syncQuizName.value);
    } else if (storageKey) {
      // If syncQuizName is empty, remove the specific storage item
      localStorage.removeItem(storageKey);
    }
  }

  // 2. Save general GitHub config (including the *last used* syncQuizName as a fallback)
  const configToSave: GithubConfig = {
    ...config.value,
    forceSync: overrideQuiz.value,
    syncQuizName: syncQuizName.value, // Save the current value as the global fallback/last used
    createRemoteRepo: createRemoteRepo.value
  };
  configService.updateGithubConfig(configToSave);

  emit('save', configToSave);
}

// 推送题库到GitHub
async function pushToGithub() {
  if (!isValid.value) {
    showToast('请填写必要的配置信息', 'error');
    return;
  }

  if (!syncQuizName.value) {
    showToast('请填写同步题库名称', 'error');
    return;
  }

  loading.value = true;
  syncAction.value = 'push';

  try {
    // 先保存当前配置（不关闭模态框）
    saveConfig();

    // 推送题库，将覆盖选项传递给服务
    const result = await configService.pushQuizToGithub(syncQuizName.value, overrideQuiz.value);

    if (result) {
      showToast(`成功推送题库: ${syncQuizName.value}`, 'success');
      emit('sync-complete', {
        action: 'push',
        quiz: syncQuizName.value,
        success: true
      });
    } else {
      showToast(`推送题库失败`, 'error');
    }
  } catch (error) {
    showToast(`推送题库失败: ${(error as Error).message}`, 'error');
  } finally {
    loading.value = false;
    syncAction.value = '';
  }
}

// 从GitHub拉取题库
async function pullFromGithub() {
  if (!isValid.value) {
    showToast('请填写必要的配置信息', 'error');
    return;
  }

  if (!syncQuizName.value) {
    showToast('请填写同步题库名称', 'error');
    return;
  }

  loading.value = true;
  syncAction.value = 'pull';

  try {
    // 先保存当前配置（不关闭模态框）
    saveConfig();

    // 拉取题库
    const quizData = await configService.syncQuizFromGithub(syncQuizName.value);

    if (quizData) {
      // 不管是否自动覆盖，都保存题库数据到本地存储
      // 确保即使未选择覆盖选项，也能将拉取的题库保存到本地
      configService.saveQuizToStorage(syncQuizName.value, quizData);

      showToast(`成功拉取题库: ${syncQuizName.value}`, 'success');

      // 通知上层组件可能的笔记更新，以确保正确刷新显示
      emit('sync-complete', {
        action: 'pull',
        quiz: syncQuizName.value,
        overrideLocal: true, // 确保总是覆盖本地以便正确加载
        success: true,
        retainedNotes: true  // 添加标记表示保留了本地笔记
      });

      // 关闭模态框以便用户可以立即查看拉取的题库
      setTimeout(() => {
        emit('close');
      }, 1500);
    } else {
      showToast(`拉取题库失败`, 'error');
    }
  } catch (error) {
    showToast(`拉取题库失败: ${(error as Error).message}`, 'error');
  } finally {
    loading.value = false;
    syncAction.value = '';
  }
}
</script>
