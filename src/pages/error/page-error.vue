<template>
  <div class="error-page">
    <div class="error-page__content">
      <h1 class="error-page__title">页面加载失败</h1>
      <p class="error-page__message">抱歉，该页面正在开发中或加载出错。</p>

      <!-- 添加错误详情展示区域 -->
      <div v-if="errorMessage || errorDetails" class="error-details">
        <h3 class="error-details__title">错误详情</h3>
        <div class="error-details__content">
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          <pre v-if="errorDetails" class="error-code">{{ errorDetails }}</pre>
        </div>
      </div>

      <p class="error-page__description">您可以返回首页或尝试其他功能。</p>
      <div class="error-page__actions">
        <button class="btn btn-primary" @click="goHome">返回首页</button>
        <button class="btn btn-secondary" @click="goBack">返回上一页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';

// 定义props
const props = defineProps<{
  errorMessage?: string;
  errorDetails?: string;
}>();

const router = useRouter();
const route = useRoute();

// 错误信息状态
const errorMessage = ref(props.errorMessage || '');
const errorDetails = ref(props.errorDetails || '');

// 从路由参数或全局状态中获取错误信息
onMounted(() => {
  // 如果已通过props提供了错误信息，则优先使用
  if (props.errorMessage) {
    errorMessage.value = props.errorMessage;
  }

  if (props.errorDetails) {
    errorDetails.value = props.errorDetails;
  }

  // 尝试从路由参数中获取错误信息
  if (route.params.errorMessage) {
    errorMessage.value = errorMessage.value || (route.params.errorMessage as string);
  }

  if (route.params.errorDetails) {
    errorDetails.value = errorDetails.value || (route.params.errorDetails as string);
  }

  // 如果URL查询参数中有错误信息
  if (route.query.error) {
    errorMessage.value = errorMessage.value || (route.query.error as string);
  }

  if (route.query.message) {
    errorMessage.value = errorMessage.value || (route.query.message as string);
  }

  if (route.query.details) {
    errorDetails.value = errorDetails.value || (route.query.details as string);
  }

  // 如果localStorage中有错误信息（可能是从其他页面保存的）
  const savedError = localStorage.getItem('lastRouteError');
  if (savedError) {
    try {
      const errorData = JSON.parse(savedError);
      errorMessage.value = errorMessage.value || errorData.message || '';
      errorDetails.value = errorDetails.value || errorData.details || '';
      // 使用后清除，避免在其他场景下不必要地显示
      localStorage.removeItem('lastRouteError');
    } catch (e) {
      console.error('解析保存的错误信息失败:', e);
    }
  }
});

const goHome = () => router.push('/');
const goBack = () => router.back();
</script>

<style scoped>
.error-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: var(--background-color, #f5f5f5);
}

.error-page__content {
  max-width: 800px;
  padding: 2rem;
  background-color: var(--card-background, white);
  border-radius: 8px;
  box-shadow: var(--shadow);
  text-align: center;
}

.error-page__title {
  font-size: 1.75rem;
  margin-bottom: 1rem;
  color: var(--error-color, #dc3545);
}

.error-page__message {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.error-page__description {
  color: var(--text-light, #6c757d);
  margin-bottom: 1.5rem;
}

.error-details {
  margin: 1.5rem 0;
  text-align: left;
  background-color: var(--code-background, #f8f9fa);
  border-radius: 6px;
  padding: 0.5rem;
  border: 1px solid var(--border-color, #dee2e6);
}

.error-details__title {
  font-size: 1.1rem;
  color: var(--error-color, #dc3545);
  margin-bottom: 0.5rem;
  padding: 0 0.5rem;
}

.error-details__content {
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem;
}

.error-message {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.error-code {
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-word;
  background-color: var(--code-background-dark, #343a40);
  color: var(--code-color, #e9ecef);
  padding: 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  overflow-x: auto;
}

.error-page__actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: var(--primary-color, #007bff);
  color: white;
}

.btn-secondary {
  background-color: var(--secondary-color, #6c757d);
  color: white;
}
</style>
