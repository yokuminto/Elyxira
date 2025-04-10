<template>
  <div v-if="show" class="modal modal--active" @click.self="$emit('close')">
    <div class="modal__content" :class="contentClass">
      <div class="modal__header">
        <h2 class="modal__title">{{ title }}</h2>
        <button class="modal__close" @click="$emit('close')" title="关闭">×</button>
      </div>
      <div class="modal__body">
        <slot></slot> <!-- Content goes here -->
      </div>
      <div v-if="$slots.footer" class="modal__footer">
        <slot name="footer"></slot> <!-- Optional footer actions -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  show: { // 控制显示/隐藏
    type: Boolean,
    required: true
  },
  title: { // 模态框标题
    type: String,
    default: '提示'
  },
  contentClass: { // 自定义内容区域样式类
    type: String,
    default: ''
  }
});

defineEmits(['close']); // 发出关闭事件
</script>