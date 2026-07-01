<template>
  <BaseModal title="P2P 配对同步" :show="show" @close="$emit('close')">
    <!-- 状态栏 -->
    <div v-if="state.status === 'error'" class="p2p-banner p2p-banner--error">
      {{ state.error }}
    </div>
    <div v-else-if="state.status === 'paired'" class="p2p-banner p2p-banner--success">
      <font-awesome-icon :icon="['fas', 'wifi']" /> 已配对 {{ state.peers.length }} 台设备
    </div>
    <div v-else-if="state.status === 'hosting'" class="p2p-banner p2p-banner--info">
      等待设备加入…
    </div>
    <div v-else-if="state.status === 'joining'" class="p2p-banner p2p-banner--info">
      正在加入配对…
    </div>

    <!-- 配对区域 -->
    <div class="p2p-section">
      <div class="p2p-pin-row">
        <span class="p2p-pin-label">本机 PIN</span>
        <strong class="p2p-pin-value">{{ state.pin || '—' }}</strong>
        <button
          v-if="state.status === 'idle' || state.status === 'hosting'"
          class="p2p-refresh-btn"
          @click="handleRefresh"
          :disabled="importProgress !== null"
          title="刷新 PIN"
        >
          <font-awesome-icon :icon="['fas', 'sync']" />
        </button>
      </div>

      <div class="p2p-join-row">
        <input
          type="text"
          v-model="joinPin"
          placeholder="输入配对 PIN"
          class="p2p-join-input"
          maxlength="6"
          @keyup.enter="handleJoin"
          :disabled="state.status === 'hosting' || state.status === 'joining' || importProgress !== null"
        />
        <button
          class="modal__button modal__button--primary"
          @click="handleJoin"
          :disabled="state.status === 'joining' || state.status === 'hosting' || !joinPin.trim() || importProgress !== null"
        >
          加入
        </button>
      </div>
    </div>

    <!-- 已连接设备 -->
    <div class="p2p-section">
      <h4 class="p2p-subtitle">已连接设备</h4>
      <div v-if="state.peers.length === 0" class="p2p-hint">等待设备加入…</div>
      <div v-else class="p2p-peer-list">
        <div v-for="peer in state.peers" :key="peer.id" class="p2p-peer-item">
          <font-awesome-icon :icon="['fas', 'mobile-screen']" />
          <span>{{ peer.name }}</span>
        </div>
      </div>
    </div>

    <!-- 设备配置（合并信令 URL，不再藏高级开关） -->
    <div class="p2p-section">
      <h4 class="p2p-subtitle">设备配置</h4>
      <div class="p2p-form-group">
        <label class="p2p-label">设备名称</label>
        <input type="text" v-model="localDeviceName" @change="handleDeviceNameChange" class="p2p-input" />
      </div>
      <div class="p2p-form-group">
        <label class="p2p-label">信令服务器</label>
        <div class="p2p-url-row">
          <input type="text" v-model="localSignalingUrl" @change="handleSignalingUrlChange" class="p2p-input" />
          <button class="p2p-reset-btn" @click="handleResetUrl" title="重置为默认地址">
            <font-awesome-icon :icon="['fas', 'rotate-left']" />
          </button>
        </div>
      </div>
    </div>

    <!-- 导入进度 -->
    <div v-if="importProgress !== null" class="p2p-progress-bar">
      <div class="p2p-progress-fill" :style="{ width: importProgress + '%' }"></div>
      <span class="p2p-progress-text">{{ importProgress }}%</span>
    </div>

    <template #footer>
      <div class="p2p-footer">
        <button
          class="modal__button"
          :class="state.status !== 'idle' ? 'modal__button--danger' : 'modal__button--secondary'"
          @click="handleDisconnectOrClose"
          :disabled="importProgress !== null"
        >
          {{ state.status !== 'idle' ? '断开' : '关闭' }}
        </button>
        <button
          v-if="state.status === 'paired'"
          class="modal__button modal__button--primary"
          @click="handleImport"
          :disabled="importProgress !== null"
        >
          {{ importProgress !== null ? `导入中 ${importProgress}%` : '从对端导入' }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseModal from './modal-base.vue'
import { useSync } from '@/services/p2p-sync'
import { showToast } from '@/utils/toast'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faWifi, faMobileScreen, faSync, faRotateLeft } from '@fortawesome/free-solid-svg-icons'
library.add(faWifi, faMobileScreen, faSync, faRotateLeft)

const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const { state, startHosting, joinPairing, disconnect, importFromPeer, setSignalingUrl, setDeviceName } = useSync()

const joinPin = ref('')
const localDeviceName = ref(state.deviceName)
const localSignalingUrl = ref(state.signalingUrl)
const importProgress = ref<number | null>(null)

/** 刷新 PIN（发起配对） */
async function handleRefresh(): Promise<void> {
  try {
    await startHosting()
    showToast('PIN 已刷新', 'info')
  } catch (e) {
    showToast(`刷新失败：${(e as Error).message}`, 'error')
  }
}

/** 加入配对 */
async function handleJoin(): Promise<void> {
  const pin = joinPin.value.trim()
  if (!pin) return
  try {
    const qrStr = JSON.stringify({ v: 1, pin, name: '' })
    await joinPairing(qrStr)
  } catch (e) {
    showToast(`配对失败：${(e as Error).message}`, 'error')
  }
}

/** 断开或关闭 */
async function handleDisconnectOrClose(): Promise<void> {
  if (state.status !== 'idle') {
    try {
      await disconnect()
      showToast('已断开连接', 'info')
    } catch (e) {
      showToast(`断开失败：${(e as Error).message}`, 'error')
    }
  } else {
    emit('close')
  }
}

/** 从对端导入 */
async function handleImport(): Promise<void> {
  importProgress.value = 0
  try {
    await importFromPeer((pct) => {
      importProgress.value = pct
    })
  } catch (e) {
    showToast(`导入失败：${(e as Error).message}`, 'error')
  } finally {
    importProgress.value = null
  }
}

function handleDeviceNameChange(): void {
  setDeviceName(localDeviceName.value)
}

function handleSignalingUrlChange(): void {
  setSignalingUrl(localSignalingUrl.value)
}

/** 重置信令 URL 为默认地址 */
function handleResetUrl(): void {
  const defaultUrl = 'wss://elyxira-signal.yokuminto-107.workers.dev'
  localSignalingUrl.value = defaultUrl
  setSignalingUrl(defaultUrl)
  showToast('信令服务器已重置', 'info')
}

// 弹窗打开 → 同步表单，idle 时自动发起
watch(() => props.show, async (newVal) => {
  if (!newVal) return
  localDeviceName.value = state.deviceName
  localSignalingUrl.value = state.signalingUrl
  joinPin.value = ''
  importProgress.value = null
  // 弹窗打开时不自动发起，让用户自己选择：刷新 PIN 发起，或输入对方 PIN 加入
})

// 监听 lastEvent 显示 toast
watch(() => state.lastEvent, (evt) => {
  if (!evt) return
  const typeMap: Record<string, 'info' | 'success' | 'warning' | 'error'> = {
    info: 'info', success: 'success', warning: 'warning', error: 'error',
  }
  showToast(evt.message, typeMap[evt.type] || 'info', evt.type === 'error' ? 5000 : 3000)
})
</script>

<style scoped>
.p2p-banner {
  padding: 10px 12px;
  border-radius: var(--radius);
  font-size: 0.95em;
  margin-bottom: 16px;
}
.p2p-banner--error {
  background: var(--bg-danger, rgba(239, 68, 68, 0.1));
  color: var(--color-danger, #e54960);
}
.p2p-banner--success {
  background: var(--bg-success, rgba(5, 150, 105, 0.1));
  color: var(--color-success, #059669);
}
.p2p-banner--info {
  background: var(--bg-info, rgba(59, 130, 246, 0.1));
  color: var(--color-blue, #3b82f6);
}

.p2p-section {
  margin-bottom: 16px;
}

.p2p-pin-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.p2p-pin-label {
  color: var(--text-secondary);
  font-size: 0.9em;
}
.p2p-pin-value {
  font-size: 1.3em;
  letter-spacing: 0.1em;
  color: var(--text-main);
}
.p2p-refresh-btn {
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 4px 8px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
}
.p2p-refresh-btn:hover {
  color: var(--color-blue);
  border-color: var(--color-blue);
}
.p2p-refresh-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.p2p-join-row {
  display: flex;
  gap: 8px;
}
.p2p-join-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-white);
  color: var(--text-main);
  font-size: 1em;
  font-family: inherit;
  box-sizing: border-box;
}
.p2p-join-input:focus {
  outline: none;
  border-color: var(--color-blue);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.p2p-subtitle {
  font-size: 0.95em;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.p2p-hint {
  color: var(--text-light, #6b7280);
  font-style: italic;
  font-size: 0.9em;
}
.p2p-peer-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.p2p-peer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-main);
  font-size: 0.95em;
}

.p2p-form-group {
  margin-bottom: 12px;
}
.p2p-label {
  display: block;
  margin-bottom: 4px;
  font-size: 0.85em;
  font-weight: 500;
  color: var(--text-secondary);
}
.p2p-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-white);
  color: var(--text-main);
  font-size: 0.95em;
  font-family: inherit;
  box-sizing: border-box;
}
.p2p-input:focus {
  outline: none;
  border-color: var(--color-blue);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}
.p2p-url-row {
  display: flex;
  gap: 6px;
}
.p2p-reset-btn {
  padding: 6px 10px;
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  color: var(--text-secondary);
  flex-shrink: 0;
  transition: all 0.2s;
}
.p2p-reset-btn:hover {
  color: var(--color-blue);
  border-color: var(--color-blue);
}

.p2p-progress-bar {
  position: relative;
  height: 24px;
  background: var(--bg-white-light, #f0f0f0);
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 16px;
}
.p2p-progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: var(--color-blue, #3b82f6);
  transition: width 0.2s ease;
}
.p2p-progress-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85em;
  font-weight: 600;
  color: var(--text-main);
}

.p2p-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>