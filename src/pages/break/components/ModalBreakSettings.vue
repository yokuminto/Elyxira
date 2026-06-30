<template>
  <BaseModal :show="show" title="绯想击破 · 设置" content-class="modal__content--settings" @close="$emit('close')">
    <div class="modal__tab-container">
      <div class="modal__settings-group">
        <h3 class="modal__settings-group-title">显示</h3>
        <div class="modal__setting-item">
          <span class="modal__setting-item-name">字体大小</span>
          <div class="modal__form-input-group">
            <input type="range" v-model.number="local.fontSize" min="12" max="20" step="1" />
            <span>{{ local.fontSize }}px</span>
          </div>
        </div>
        <div class="modal__setting-item">
          <span class="modal__setting-item-name">字体选择</span>
          <select v-model="local.fontFamily" class="modal__select-styled">
            <option v-for="f in fonts" :key="f.value" :value="f.value">{{ f.name }}</option>
          </select>
        </div>
        <div class="modal__setting-item">
          <span class="modal__setting-item-name">启用动画效果</span>
          <label class="modal__toggle-switch">
            <input type="checkbox" v-model="local.animationEnabled" /><span class="modal__toggle-slider"></span>
          </label>
        </div>
      </div>
      <div class="modal__settings-group">
        <h3 class="modal__settings-group-title">音效</h3>
        <div class="modal__setting-item">
          <span class="modal__setting-item-name">启用音效</span>
          <label class="modal__toggle-switch">
            <input type="checkbox" v-model="local.soundEnabled" /><span class="modal__toggle-slider"></span>
          </label>
        </div>
        <div class="modal__setting-item">
          <span class="modal__setting-item-name">音量调节</span>
          <div class="modal__form-input-group">
            <input type="range" v-model.number="local.soundVolume" min="0" max="1" step="0.1" />
            <span>{{ Math.round(local.soundVolume * 100) }}%</span>
          </div>
        </div>
      </div>
      <div class="modal__settings-group">
        <h3 class="modal__settings-group-title">同步</h3>
        <div class="modal__setting-item">
          <span class="modal__setting-item-name">GitHub 仓库配置</span>
          <button class="modal__button modal__button--primary modal__button--sm" @click="showRepoConfig = true">打开</button>
        </div>
        <div class="modal__setting-item">
          <span class="modal__setting-item-name">P2P 配对同步</span>
          <button class="modal__button modal__button--primary modal__button--sm" @click="showP2pSync = true">打开</button>
        </div>
        <div class="modal__setting-item">
          <span class="modal__setting-item-name">配置迁移</span>
          <div class="modal__form-actions">
            <button class="modal__button modal__button--primary modal__button--sm" @click="exportConfig">导出配置</button>
            <button class="modal__button modal__button--secondary modal__button--sm" @click="triggerImport">导入配置</button>
          </div>
        </div>
        <input ref="importInputRef" type="file" accept=".json,application/json" style="display:none" @change="handleImport" />
      </div>
    </div>
    <ModalBreakRepo :show="showRepoConfig" @close="showRepoConfig = false" />
    <ModalP2pSync :show="showP2pSync" @close="showP2pSync = false" />
    <template #footer>
      <button @click="$emit('close')" class="modal__button modal__button--secondary">取消</button>
      <button @click="save" class="modal__button modal__button--primary">保存设置</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import BaseModal from '@/modals/modal-base.vue'
import configService from '@/services/config-service'
import { showToast } from '@/utils/toast'
import ModalBreakRepo from './ModalBreakRepo.vue'
import ModalP2pSync from '@/modals/modal-p2p-sync.vue'

defineProps<{ show: boolean }>()
defineEmits<{ (e: 'close'): void }>()

const showRepoConfig = ref(false)
const showP2pSync = ref(false)
const importInputRef = ref<HTMLInputElement>()

const fonts = [
  { name: '系统默认 (sans-serif)', value: 'sans-serif' },
  { name: '系统默认 (serif)', value: 'serif' },
  { name: '系统默认 (monospace)', value: 'monospace' },
  { name: '苹方 (PingFang SC)', value: '\'PingFang SC\', sans-serif' },
  { name: '微软雅黑 (Microsoft YaHei)', value: '\'Microsoft YaHei\', sans-serif' },
  { name: '思源黑体 (Noto Sans SC)', value: '\'Noto Sans SC\', sans-serif' },
  { name: '霞鹜文楷 (LXGW WenKai)', value: '\'LXGW WenKai\', cursive' },
  { name: 'JetBrains Mono', value: '\'JetBrains Mono\', monospace' },
  { name: 'Fira Code', value: '\'Fira Code\', monospace' },
  { name: 'IBM Plex Sans', value: '\'IBM Plex Sans\', sans-serif' },
  { name: 'Roboto Mono', value: '\'Roboto Mono\', monospace' },
  { name: '更纱黑体 (Sarasa Gothic)', value: '\'Sarasa Gothic SC\', sans-serif' },
]

const s = configService.getUiSettings()
const local = reactive({
  fontSize: s.fontSize,
  fontFamily: s.fontFamily,
  animationEnabled: s.animationEnabled,
  soundEnabled: s.soundEffectsEnabled,
  soundVolume: s.soundVolume,
})

function save() {
  configService.saveGeneralSettings({
    uiSettings: {
      ...s,
      fontSize: local.fontSize,
      fontFamily: local.fontFamily,
      animationEnabled: local.animationEnabled,
      soundEffectsEnabled: local.soundEnabled,
      soundVolume: local.soundVolume,
    },
    quizSettings: configService.getQuizSettings(),
    debugEnabled: configService.isDebugEnabled(),
  })
}

function exportConfig() { configService.exportConfig() }
function triggerImport() { importInputRef.value?.click() }

async function handleImport(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const ok = await configService.importConfigFromFile(file)
  if (ok) {
    showToast('配置导入成功，即将刷新', 'success')
    setTimeout(() => location.reload(), 1000)
  }
}
</script>

<style scoped>
.modal__button--sm {
  padding: 0.25rem 0.7rem;
  font-size: 0.8em;
  border-radius: var(--radius, 6px);
}
</style>
