<template>
  <BaseModal title="P2P 配对同步" :show="show" contentClass="modal__content--settings" @close="$emit('close')">
    <!-- Status Banner -->
    <div v-if="state.status === 'error'" class="modal__settings-group" style="background:var(--bg-danger,rgba(239,68,68,0.1));padding:10px 12px;border-radius:var(--radius);color:var(--color-danger,#e54960);">
      {{ state.error }}
    </div>
    <div v-else-if="state.status === 'paired'" class="modal__settings-group" style="background:var(--bg-success,rgba(5,150,105,0.1));padding:10px 12px;border-radius:var(--radius);color:var(--color-success,#059669);">
      <font-awesome-icon :icon="['fas', 'wifi']" /> 已配对 {{ state.peers.length }} 台设备
    </div>

    <div class="modal__separator"></div>

    <!-- Role Switch Tabs -->
    <div class="modal__section">
      <div class="modal__settings-tabs">
        <button class="modal__settings-tab" :class="{ 'modal__settings-tab--active': activeTab === 'host' }" @click="switchTab('host')" :disabled="state.status === 'joining'">
          <font-awesome-icon :icon="['fas', 'qrcode']" /> 发起配对（显示二维码）
        </button>
        <button class="modal__settings-tab" :class="{ 'modal__settings-tab--active': activeTab === 'join' }" @click="switchTab('join')" :disabled="state.status === 'joining'">
          加入配对（扫描/输入）
        </button>
      </div>

      <!-- Host Mode -->
      <div v-if="activeTab === 'host'" class="modal__settings-group">
        <div style="text-align:center;">
          <canvas ref="qrCanvas" class="p2p-qr"></canvas>
        </div>
        <div v-if="state.pin" style="text-align:center;margin-top:8px;">
          <span class="modal__info-value">配对 PIN：<strong>{{ state.pin }}</strong></span>
        </div>
        <div style="text-align:center;margin-top:10px;">
          <button class="modal__button modal__button--secondary" @click="handleRefreshQR" :disabled="state.status === 'joining'">
            <font-awesome-icon :icon="['fas', 'sync']" /> 刷新二维码
          </button>
        </div>
        <div v-if="state.status === 'hosting'" class="modal__info-message" style="text-align:center;margin-top:8px;">
          等待设备扫码加入...
        </div>
      </div>

      <!-- Join Mode -->
      <div v-if="activeTab === 'join'" class="modal__settings-group">
        <div class="modal__form-group">
          <label class="modal__form-label">扫码结果</label>
          <input type="text" v-model="joinInput" placeholder='粘贴扫码获取的 JSON 字符串' class="modal__form-control" />
        </div>
        <div style="text-align:center;margin:8px 0;color:var(--text-secondary);font-size:0.9em;">或</div>
        <div class="modal__form-group">
          <label class="modal__form-label">手动输入配对 PIN</label>
          <input type="text" v-model="joinPin" placeholder="6 位数字 PIN" class="modal__form-control" maxlength="6" />
        </div>
        <div style="margin-top:12px;">
          <button class="modal__button modal__button--primary" @click="handleJoin" :disabled="state.status === 'hosting' || state.status === 'joining' || (!joinInput.trim() && !joinPin.trim())">
            加入
          </button>
        </div>
      </div>
    </div>

    <div class="modal__separator"></div>

    <!-- Connected Peers -->
    <div class="modal__section">
      <div class="modal__info-panel">
        <h4 class="modal__info-title">已连接设备</h4>
        <div v-if="state.peers.length === 0" class="modal__info-message">
          等待设备加入...
        </div>
        <div v-else class="modal__info-content">
          <div v-for="peer in state.peers" :key="peer.id" class="modal__info-item">
            <span class="modal__info-label">设备：</span>
            <span class="modal__info-value">{{ peer.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Device Config -->
    <div class="modal__section">
      <h3 class="modal__section-title">设备配置</h3>
      <div class="modal__form-group">
        <label class="modal__form-label" for="p2pDeviceName">设备名称</label>
        <input type="text" id="p2pDeviceName" v-model="localDeviceName" @change="handleDeviceNameChange" class="modal__form-control" />
      </div>
      <div class="modal__form-group modal__form-group--switch">
        <label class="modal__form-label">高级设置</label>
        <label class="modal__toggle-switch">
          <input type="checkbox" v-model="showAdvanced" />
          <span class="modal__toggle-slider"></span>
        </label>
      </div>
      <div v-if="showAdvanced" class="modal__form-group">
        <label class="modal__form-label" for="p2pSignalingUrl">信令服务器 URL</label>
        <div class="modal__form-description">自定义 WebRTC 信令服务器地址</div>
        <input type="text" id="p2pSignalingUrl" v-model="localSignalingUrl" @change="handleSignalingUrlChange" class="modal__form-control" />
      </div>
    </div>

    <template #footer>
      <button class="modal__button" :class="state.status !== 'idle' ? 'modal__button--danger' : 'modal__button--secondary'" @click="handleDisconnectOrClose">
        {{ state.status !== 'idle' ? '断开' : '关闭' }}
      </button>
      <button v-if="state.status === 'paired'" class="modal__button modal__button--primary" @click="handleManualSync">
        手动同步
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import BaseModal from './modal-base.vue'
import QRCode from 'qrcode'
import { useSync, parseQRPayload } from '@/services/p2p-sync'
import { showToast } from '@/utils/toast'

// Register FA icons used by this component
import { library } from '@fortawesome/fontawesome-svg-core'
import { faQrcode, faWifi } from '@fortawesome/free-solid-svg-icons'
library.add(faQrcode, faWifi)

const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const { state, startHosting, joinPairing, disconnect, setSignalingUrl, setDeviceName } = useSync()

const activeTab = ref<'host' | 'join'>('host')
const joinInput = ref('')
const joinPin = ref('')
const qrPayload = ref('')
const qrCanvas = ref<HTMLCanvasElement | null>(null)
const localDeviceName = ref(state.deviceName)
const localSignalingUrl = ref(state.signalingUrl)
const showAdvanced = ref(false)

function switchTab(tab: 'host' | 'join'): void {
  activeTab.value = tab
}

async function renderQR(): Promise<void> {
  if (!qrCanvas.value || !qrPayload.value) return
  try {
    await QRCode.toCanvas(qrCanvas.value, qrPayload.value, { width: 240, margin: 1 })
  } catch (e) {
    console.error('[p2p-sync] QR render failed:', e)
  }
}

async function handleRefreshQR(): Promise<void> {
  try {
    qrPayload.value = await startHosting()
    await nextTick()
    await renderQR()
    showToast('二维码已刷新', 'info')
  } catch (e) {
    showToast(`刷新失败：${(e as Error).message}`, 'error')
  }
}

async function handleJoin(): Promise<void> {
  let qrStr = ''

  if (joinPin.value.trim()) {
    qrStr = JSON.stringify({ v: 1, pin: joinPin.value.trim(), name: '' })
  } else if (joinInput.value.trim()) {
    try {
      parseQRPayload(joinInput.value.trim())
    } catch (e) {
      showToast(`无效的扫码内容：${(e as Error).message}`, 'error')
      return
    }
    qrStr = joinInput.value.trim()
  } else {
    showToast('请粘贴扫码结果或输入配对 PIN', 'warning')
    return
  }

  try {
    await joinPairing(qrStr)
    showToast('配对成功', 'success')
  } catch (e) {
    showToast(`配对失败：${(e as Error).message}`, 'error')
  }
}

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

function handleManualSync(): void {
  showToast('手动同步请求已发送', 'success')
}

function handleDeviceNameChange(): void {
  setDeviceName(localDeviceName.value)
}

function handleSignalingUrlChange(): void {
  setSignalingUrl(localSignalingUrl.value)
}

// Open modal → sync local form fields, auto-start hosting if idle
watch(() => props.show, async (newVal) => {
  if (!newVal) return
  localDeviceName.value = state.deviceName
  localSignalingUrl.value = state.signalingUrl
  if (state.status === 'idle') {
    activeTab.value = 'host'
    await nextTick()
    await handleRefreshQR()
  }
})

// Re-render QR when payload changes (separate from auto-start path)
watch(qrPayload, async () => {
  if (qrPayload.value && activeTab.value === 'host') {
    await nextTick()
    await renderQR()
  }
})
</script>

<style scoped>
.p2p-qr {
  width: 240px;
  height: 240px;
  display: block;
  margin: 0 auto;
}
</style>
