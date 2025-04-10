<script setup lang="ts">
import { RouterView } from 'vue-router';
import { ref, onErrorCaptured, onMounted } from 'vue';
import { injectToastStyles } from './utils/toast';

const hasError = ref(false);
const errorMessage = ref('');

// 初始化Toast样式
onMounted(() => {
  injectToastStyles();
});

onErrorCaptured((err) => {
  console.error('App error:', err);

  // 路由相关错误继续传播
  if (/Failed to load|Loading chunk|module/.test(err.toString())) {
    return true;
  }

  hasError.value = true;
  errorMessage.value = err.toString();
  return false;
});
</script>

<template>
  <RouterView v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <suspense>
        <div class="app-container">
          <component :is="Component" />
        </div>
        <template #fallback>
          <div class="loading">加载中...</div>
        </template>
      </suspense>
    </transition>
  </RouterView>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

html::-webkit-scrollbar,
body::-webkit-scrollbar {
  display: none;
}

/* 页面过渡动画 */
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 加载状态样式 */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.2rem;
  color: var(--color-primary);
}

.app-container {
  min-height: 100vh;
}
</style>
