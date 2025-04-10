<template>
  <div class="modal" :class="{ 'modal--active': show }">
    <div class="modal__content">
      <div class="modal__header">
        <h2 class="modal__title">仓库配置</h2>
        <button class="modal__close" @click="$emit('close')">&times;</button>
      </div>
      <div class="modal__body">
        <!-- 当前题库信息 -->
        <div class="modal__info-panel">
          <h3 class="modal__info-title">当前题库信息</h3>
          <div v-if="!currentQuiz || !currentQuiz.exists" class="modal__info-message">
            未选择题库，请先从题库列表选择或加载题库。
          </div>
          <div v-else class="modal__info-content">
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

        <!-- 同步设置 -->
        <div class="modal__form-group">
          <div v-if="currentQuiz && currentQuiz.exists" class="modal__form-group">
            <label for="syncQuizName" class="modal__form-label">同步题库名称</label>
            <div class="modal__form-description">推送到远程仓库时使用的文件名</div>
            <input type="text" id="syncQuizName" v-model="syncQuizName" placeholder="例如: my-quiz"
              class="modal__form-input" />
          </div>

          <div v-if="currentQuiz && currentQuiz.exists && currentQuiz.isLocal" class="modal__form-group">
            <label class="modal__form-label">
              <input type="checkbox" v-model="createRemoteRepo" />
              创建远程仓库版本
            </label>
            <div class="modal__form-description">将本地题库推送到远程仓库，创建线上副本</div>
          </div>
        </div>

        <!-- 仓库配置 -->
        <div class="modal__separator"></div>
        <h3 class="modal__section-title">GitHub 仓库设置</h3>

        <div class="modal__form-group">
          <label for="githubOwner" class="modal__form-label">GitHub 用户名或组织</label>
          <input type="text" id="githubOwner" v-model="config.owner" placeholder="例如: username"
            class="modal__form-input" />
        </div>

        <div class="modal__form-group">
          <label for="githubRepo" class="modal__form-label">仓库名称</label>
          <input type="text" id="githubRepo" v-model="config.repo" placeholder="例如: quiz-data"
            class="modal__form-input" />
        </div>

        <div class="modal__form-group">
          <label for="githubBranch" class="modal__form-label">分支名称</label>
          <input type="text" id="githubBranch" v-model="config.branch" placeholder="例如: main"
            class="modal__form-input" />
        </div>

        <div class="modal__form-group">
          <label for="githubPath" class="modal__form-label">仓库路径 (可选)</label>
          <input type="text" id="githubPath" v-model="config.path" placeholder="例如: quizzes/"
            class="modal__form-input" />
        </div>

        <div class="modal__form-group">
          <label for="githubToken" class="modal__form-label">个人访问令牌 (PAT)</label>
          <div class="modal__form-description">用于读写私有仓库或进行推送操作</div>
          <input type="password" id="githubToken" v-model="config.token" placeholder="ghp_xxxxxx"
            class="modal__form-input" />
        </div>

        <div class="modal__form-group">
          <label class="modal__form-label">
            <input type="checkbox" v-model="forceSync" />
            强制同步 (覆盖远程)
          </label>
          <div class="modal__form-description">同步时不检查冲突，直接覆盖远程仓库内容</div>
        </div>

        <div class="modal__form-actions">
          <button class="modal__button modal__button--primary" @click="testConnection" :disabled="loading">
            <span v-if="loading">测试中...</span>
            <span v-else>测试连接</span>
          </button>
        </div>
      </div>
      <div class="modal__footer">
        <button class="modal__button modal__button--secondary" @click="$emit('close')">取消</button>
        <button class="modal__button modal__button--primary" @click="saveConfig" :disabled="!isValid">保存配置</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { showToast } from '../utils/toast';

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

interface GithubConfig {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  token: string;
}

const config = ref<GithubConfig>({
  owner: '',
  repo: '',
  branch: 'main',
  path: '',
  token: ''
});

const loading = ref(false);
const forceSync = ref(true);
const syncQuizName = ref('');
const createRemoteRepo = ref(false);

// 初始化同步题库名称
watch(() => props.currentQuiz, (newVal) => {
  if (newVal && newVal.exists && newVal.name) {
    syncQuizName.value = newVal.name;
  } else if (!newVal || !newVal.exists) {
    // 如果题库不存在，清空同步题库名称
    syncQuizName.value = '';
  }
}, { immediate: true, deep: true });

// 计算属性：配置是否有效
const isValid = computed(() => {
  return !!config.value.owner && !!config.value.repo;
});

// 获取来源类型的友好名称
function getSourceTypeName(source: string): string {
  if (!source) return '未知来源';

  switch (source.toLowerCase()) {
    case 'local': return '本地题库';
    case 'online': return '在线题库';
    case 'remote': return '远程题库';
    case 'online-import': return '从在线导入';
    case 'remote-import': return '从远程导入';
    default: return source || '未知来源';
  }
}

// 初始化：从localStorage加载配置
onMounted(() => {
  config.value.owner = localStorage.getItem('github_owner') || '';
  config.value.repo = localStorage.getItem('github_repo') || '';
  config.value.branch = localStorage.getItem('github_branch') || 'main';
  config.value.path = localStorage.getItem('github_path') || '';
  config.value.token = localStorage.getItem('github_token') || '';
  forceSync.value = localStorage.getItem('force_sync') === 'true';
});

// 测试连接
async function testConnection() {
  if (!isValid.value) {
    showToast('请填写必要的配置信息', 'error');
    return;
  }

  loading.value = true;

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
  }
}

// 保存配置
function saveConfig() {
  if (!isValid.value) return;

  const { owner, repo, branch, path, token } = config.value;

  localStorage.setItem('github_owner', owner);
  localStorage.setItem('github_repo', repo);
  localStorage.setItem('github_branch', branch);
  localStorage.setItem('github_path', path);
  localStorage.setItem('force_sync', forceSync.value.toString());

  if (token) {
    localStorage.setItem('github_token', token);
  }

  // 保存同步题库名称
  if (syncQuizName.value) {
    localStorage.setItem('sync_quiz_name', syncQuizName.value);
  }

  showToast('GitHub 配置已保存', 'success');

  emit('save', {
    ...config.value,
    forceSync: forceSync.value,
    syncQuizName: syncQuizName.value,
    createRemoteRepo: createRemoteRepo.value
  });
}
</script>

<style>
/* 使用 src/styles/modal.css 中定义的通用模态框样式 */
</style>
