<template>
  <button :class="['settings-button', className]" title="通用设置" @click="openGeneralSettings">
    <BaseIcon name="settings" size="16" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseIcon from './icon.vue';

// 接收class属性
const props = defineProps<{
  class?: string;
}>();

// 计算组件最终使用的class
const className = computed(() => props.class || '');

const emit = defineEmits(['open-general-settings']);

// 打开通用设置
function openGeneralSettings() {
  emit('open-general-settings');
}
</script>

<style scoped>
.settings-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-color);
  transition: background-color 0.2s;
}

.settings-button:hover {
  background-color: var(--hover-bg);
}
</style>
