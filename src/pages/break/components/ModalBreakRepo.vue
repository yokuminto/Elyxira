<!-- ModalBreakRepo.vue — 绯想击破专属 GitHub 仓库配置弹窗 -->
<template>
  <BaseModal :show="show" title="仓库配置" content-class="modal__content--settings" @close="$emit('close')">
    <div class="modal__settings-group">
      <h3 class="modal__settings-group-title">同步模式</h3>

      <div class="break-repo__mode-select">
        <label class="break-repo__mode-option" :class="{ 'break-repo__mode-option--active': local.mode === 'default' }">
          <input type="radio" v-model="local.mode" value="default" />
          <span class="break-repo__mode-label">官方仓库（只读）</span>
          <span class="break-repo__mode-desc">从 Elyxira 官方仓库拉取共享笔记，不可推送</span>
        </label>
        <label class="break-repo__mode-option" :class="{ 'break-repo__mode-option--active': local.mode === 'custom' }">
          <input type="radio" v-model="local.mode" value="custom" />
          <span class="break-repo__mode-label">自定义仓库</span>
          <span class="break-repo__mode-desc">使用自己的 GitHub 仓库，可读写同步</span>
        </label>
      </div>
    </div>

    <!-- 默认模式信息 -->
    <div v-if="local.mode === 'default'" class="modal__settings-group">
      <div class="break-repo__info">
        <div class="break-repo__info-item">
          <span class="break-repo__info-label">仓库</span>
          <span class="break-repo__info-value">elyxira/elyxira-data</span>
        </div>
        <div class="break-repo__info-item">
          <span class="break-repo__info-label">分支</span>
          <span class="break-repo__info-value">main</span>
        </div>
        <p class="break-repo__info-hint">
          游戏启动时将自动从官方仓库拉取笔记和题目标签，不会覆盖本地已有内容。
        </p>
      </div>
    </div>

    <!-- 自定义模式配置 -->
    <div v-if="local.mode === 'custom'" class="modal__settings-group">
      <div class="modal__form-group">
        <label for="breakOwner" class="modal__form-label">GitHub 用户名或组织</label>
        <input type="text" id="breakOwner" v-model="local.owner" placeholder="例如: username" class="modal__form-control" />
      </div>
      <div class="modal__form-group">
        <label for="breakRepo" class="modal__form-label">仓库名称</label>
        <input type="text" id="breakRepo" v-model="local.repo" placeholder="例如: my-break-notes" class="modal__form-control" />
      </div>
      <div class="modal__form-group">
        <label for="breakBranch" class="modal__form-label">分支名称</label>
        <input type="text" id="breakBranch" v-model="local.branch" placeholder="例如: main" class="modal__form-control" />
      </div>
      <div class="modal__form-group">
        <label for="breakToken" class="modal__form-label">个人访问令牌 (PAT)</label>
        <div class="modal__form-description">需要 repo 权限以读写仓库内容</div>
        <input type="password" id="breakToken" v-model="local.token" placeholder="ghp_xxxxxx" class="modal__form-control" />
      </div>
    </div>

    <!-- 操作区 -->
    <div class="modal__settings-group">
      <div class="modal__form-actions">
        <button class="modal__button modal__button--primary" @click="testPull" :disabled="syncState.isPulling">
          {{ syncState.isPulling ? '拉取中...' : '测试拉取' }}
        </button>
        <button v-if="local.mode === 'custom'" class="modal__button modal__button--success" @click="pushAll" :disabled="syncState.isPushing">
          {{ syncState.isPushing ? '推送中...' : '推送全部' }}
        </button>
      </div>
    </div>

    <template #footer>
      <button @click="$emit('close')" class="modal__button modal__button--secondary">取消</button>
      <button @click="save" class="modal__button modal__button--primary">保存配置</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { reactive, onMounted, watch } from 'vue'
import BaseModal from '@/modals/modal-base.vue'
import { useBreakSync } from '../composables/useBreakSync'
import { showToast } from '@/utils/toast'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const { getRepoConfig, saveRepoConfig, manualPull, manualPush, state: syncState } = useBreakSync()

const local = reactive({ ...getRepoConfig() })

watch(() => props.show, (v) => {
  if (v) Object.assign(local, getRepoConfig())
})

function save() {
  const cfg = { ...local }
  if (cfg.mode === 'default') {
    cfg.owner = 'elyxira'
    cfg.repo = 'elyxira-data'
    cfg.token = ''
  }
  saveRepoConfig(cfg)
  showToast('仓库配置已保存', 'success')
  emit('close')
}

async function testPull() {
  // 临时保存当前配置以供拉取使用
  const current = getRepoConfig()
  // 用当前填写值做拉取
  saveRepoConfig({ ...local })
  const count = await manualPull()
  // 恢复
  saveRepoConfig(current)
}

async function pushAll() {
  saveRepoConfig({ ...local })
  await manualPush()
}
</script>

<style scoped>
.break-repo__mode-select {
  display: flex;
  gap: 0.5rem;
}

.break-repo__mode-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  border: 1px solid var(--border, #e5e7eb);
  border-radius: var(--radius, 8px);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.break-repo__mode-option input { display: none; }

.break-repo__mode-option--active {
  border-color: var(--c-blue, #4468ee);
  background: var(--color-primary-light, rgba(68, 104, 238, 0.05));
}

.break-repo__mode-label {
  font-weight: 600;
  font-size: 0.9em;
}

.break-repo__mode-desc {
  font-size: 0.75em;
  color: var(--text-secondary, #5a5a68);
}

.break-repo__info {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.75rem;
  background: var(--color-primary-light, rgba(68, 104, 238, 0.04));
  border-radius: var(--radius, 8px);
}

.break-repo__info-item {
  display: flex;
  gap: 0.5rem;
  font-size: 0.85em;
}

.break-repo__info-label {
  color: var(--text-secondary, #5a5a68);
  min-width: 3em;
}

.break-repo__info-value {
  font-weight: 500;
  color: var(--c-blue, #4468ee);
}

.break-repo__info-hint {
  margin: 0.35rem 0 0;
  font-size: 0.78em;
  color: var(--text-secondary, #5a5a68);
}

.modal__form-group { margin-bottom: 0.75rem; }
.modal__form-label { display: block; font-size: 0.85em; font-weight: 500; margin-bottom: 0.25rem; }
.modal__form-description { font-size: 0.75em; color: var(--text-secondary, #5a5a68); margin-bottom: 0.25rem; }
.modal__form-control { width: 100%; padding: 0.45rem 0.6rem; border: 1px solid var(--border, #e5e7eb); border-radius: var(--radius, 6px); font-size: 0.85em; }
.modal__form-control:focus { outline: none; border-color: var(--c-blue, #4468ee); }
.modal__form-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
.modal__button { padding: 0.45rem 1rem; font-size: 0.85em; border: none; border-radius: var(--radius, 6px); cursor: pointer; font-weight: 500; }
.modal__button--primary { background: var(--c-blue, #4468ee);   color: var(--color-white, #fff); }
.modal__button--secondary { background: var(--card, #fff); color: var(--text-secondary, #5a5a68); border: 1px solid var(--border, #e5e7eb); }
.modal__button--success { background: var(--c-green, #059669);   color: var(--color-white, #fff); }
.modal__button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
