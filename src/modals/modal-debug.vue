<template>
  <BaseModal title="调试" :show="show" @close="$emit('close')">
    <div class="modal__debug-info">
      <h3>系统信息</h3>
      <div class="modal__debug-item">
        <span class="modal__debug-label">浏览器</span>
        <span class="modal__debug-value">{{ browserInfo }}</span>
      </div>
      <div class="modal__debug-item">
        <span class="modal__debug-label">本地存储使用</span>
        <span class="modal__debug-value">{{ formatBytes(localStorageSize) }}</span>
      </div>
      <h3>题库缓存</h3>
      <div v-if="cacheItems.length === 0" class="modal__debug-empty">
        <span>暂无缓存数据</span>
      </div>
      <div v-else class="modal__debug-item" v-for="(item, index) in cacheItems" :key="index">
        <span class="modal__debug-label">{{ item.key }}</span>
        <span class="modal__debug-value">{{ formatBytes(item.size) }}</span>
      </div>
    </div>

    <template #footer>
      <button class="modal__button modal__button--danger" @click="clearCache">清除缓存</button>
      <button class="modal__button modal__button--secondary" @click="$emit('close')">关闭</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import configService from '@/services/config-service';
import BaseModal from './modal-base.vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
});

defineEmits(['close']);

const browserInfo = ref('');
const localStorageSize = ref(0);
const cacheItems = ref<{ key: string; size: number; }[]>([]);

// 监听显示状态变化
watch(() => props.show, (newVal) => {
  if (newVal) {
    // 当模态框显示时更新统计信息
    updateStorageInfo();
  }
}, { immediate: true });

onMounted(() => {
  browserInfo.value = navigator.userAgent;
  updateStorageInfo();
});

// 更新存储统计信息
function updateStorageInfo() {
  const { totalSize, items } = configService.getCacheStats();
  localStorageSize.value = totalSize;
  cacheItems.value = items;
}

// 格式化字节大小
function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 清除缓存
function clearCache() {
  if (confirm('确定要清除所有题库缓存吗？这将删除所有本地保存的题库数据。')) {
    const cleared = configService.clearQuizCache();
    if (cleared) {
      updateStorageInfo();
    }
  }
}
</script>
