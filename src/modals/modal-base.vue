<template>
  <div v-if="show" class="modal modal--active" @click.self="$emit('close')">
    <div class="modal__content" :class="contentClass">
      <div class="modal__header">
        <h2 class="modal__title">{{ title }}</h2>
        <button class="modal__close" @click="$emit('close')" title="关闭">×</button>
      </div>
      <div class="modal__body">
        <slot></slot>
      </div>
      <div v-if="$slots.footer" class="modal__footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  show: Boolean,
  title: { type: String, default: '提示' },
  contentClass: { type: String, default: '' }
});

defineEmits(['close']);
</script>
