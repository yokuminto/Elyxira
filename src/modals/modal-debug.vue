<template>
  <div class="modal modal--active">
    <div class="modal__content">
      <div class="modal__header">
        <h2 class="modal__title">调试</h2>
        <button class="modal__close" @click="$emit('close')">&times;</button>
      </div>
      <div class="modal__body">
        <div class="modal__debug-info">
          <h3>系统信息</h3>
          <div class="modal__debug-item">
            <span>浏览器：</span>
            <span>{{ browserInfo }}</span>
          </div>
          <div class="modal__debug-item">
            <span>本地存储使用：</span>
            <span>{{ formatBytes(localStorageSize) }}</span>
          </div>
          <h3>题库缓存</h3>
          <div class="modal__debug-item" v-for="(item, index) in cacheItems" :key="index">
            <span>{{ item.key }}：</span>
            <span>{{ formatBytes(item.size) }}</span>
          </div>
        </div>
      </div>
      <div class="modal__footer">
        <button class="modal__button modal__button--danger" @click="clearCache">清除缓存</button>
        <button class="modal__button modal__button--secondary" @click="$emit('close')">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

defineEmits(['close']);

const browserInfo = ref('');
const localStorageSize = ref(0);
const cacheItems = ref<{ key: string; size: number; }[]>([]);

onMounted(() => {
  // 获取浏览器信息
  browserInfo.value = navigator.userAgent;

  // 计算localStorage使用情况
  calculateStorageUsage();
});

// 计算localStorage使用量
function calculateStorageUsage() {
  let total = 0;
  const items: { key: string; size: number; }[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key) || '';
      const size = (key.length + value.length) * 2; // 估算大小（UTF-16，每个字符2字节）

      total += size;

      // 如果是题库相关缓存，添加到列表
      if (key.startsWith('quizCache_')) {
        items.push({ key: key.replace('quizCache_', ''), size });
      }
    }
  }

  localStorageSize.value = total;
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
  // 确认框
  if (confirm('确定要清除所有题库缓存吗？这将删除所有本地保存的题库数据。')) {
    // 遍历localStorage，删除题库相关的缓存
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('quizCache_') || key === 'cachedQuizList')) {
        localStorage.removeItem(key);
      }
    }

    // 重新计算存储使用情况
    calculateStorageUsage();

    // 显示提示
    alert('缓存已清除');
  }
}
</script>
