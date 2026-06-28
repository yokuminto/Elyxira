<!-- CharacterDetailModal.vue — 角色详情弹窗（技能/羁绊/箭头导航） -->
<template>
  <div class="break-overlay">
    <!-- 左箭头区域 -->
    <button
      v-if="hasPrev"
      class="char-detail__arrow char-detail__arrow--left"
      @click="$emit('prev')"
      title="上一个角色"
    >
      ‹
    </button>

    <!-- 弹窗主体 -->
    <div class="break-modal char-detail">
      <button class="char-detail__close" @click="$emit('close')">✕</button>

      <!-- 角色名 + 星级 -->
      <div class="char-detail__header">
        <span class="char-detail__name">{{ character.name }}</span>
        <span class="char-detail__stars">
          <span v-for="n in character.starLevel" :key="n">★</span>
        </span>
        <span class="char-detail__bond" :style="{ '--bond-color': bondColor }">
          {{ bondLabel }}
        </span>
      </div>

      <!-- 技能 -->
      <div class="char-detail__section">
        <div class="char-detail__section-title">技能 · Lv.{{ character.starLevel }}</div>
        <p class="char-detail__skill-desc">{{ skillDescription }}</p>
        <button
          v-if="canActivate"
          class="char-detail__use-btn"
          @click="$emit('use-skill', character.id)"
        >
          使用技能
        </button>
      </div>

      <!-- 羁绊 -->
      <div class="char-detail__section" v-if="bondInfo">
        <div class="char-detail__section-title">羁绊 · {{ bondInfo.name }}</div>
        <p class="char-detail__bond-status">
          已有 {{ bondInfo.currentCount }} 人{{ bondInfo.nextThreshold ? `（${bondInfo.nextThreshold.count}人触发：${bondInfo.nextThreshold.desc}）` : '' }}
        </p>
      </div>
    </div>

    <!-- 右箭头区域 -->
    <button
      v-if="hasNext"
      class="char-detail__arrow char-detail__arrow--right"
      @click="$emit('next')"
      title="下一个角色"
    >
      ›
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BreakCharacter } from '../types/break-types'
import type { BondGroup } from '../types/break-types'
import { bondColor as getBondColor } from '../composables/bondColors'

const props = defineProps<{
  character: BreakCharacter
  characterIndex: number
  totalCharacters: number
  skillDescription: string
  canActivate: boolean
  bondInfo: {
    name: string
    currentCount: number
    nextThreshold?: { count: number; desc: string }
  } | null
}>()

defineEmits<{
  close: []
  prev: []
  next: []
  'use-skill': [characterId: string]
}>()

const hasPrev = computed(() => props.characterIndex > 0)
const hasNext = computed(() => props.characterIndex < props.totalCharacters - 1)

const BOND_LABELS: Record<string, string> = { xianzhou: '仙舟同盟', touhou: '幻想乡', genius: '天才俱乐部' }
const bondLabel = computed(() => BOND_LABELS[props.character.bondGroup] ?? props.character.bondGroup)
const bondColor = computed(() => getBondColor(props.character.bondGroup))
</script>

<style scoped>
.char-detail {
  text-align: center;
  position: relative;
  padding-top: 2rem;
}

.char-detail__close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  font-size: 1rem;
  color: var(--text-secondary, #5a5a68);
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.char-detail__close:hover {
  background: var(--color-primary-light, rgba(68,104,238,0.08));
  color: var(--c-blue, #4468ee);
}

/* ── 标题区 ── */
.char-detail__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 1rem;
}

.char-detail__name {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-main, #2a2a30);
}

.char-detail__stars {
  color: var(--c-yellow, #f5a623);
  font-size: 1.1rem;
  letter-spacing: 0.1em;
}

.char-detail__bond {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.15rem 0.6rem;
  border-radius: 4px;
  background: color-mix(in srgb, var(--bond-color) 15%, transparent);
  color: var(--bond-color);
}

/* ── 技能区 ── */
.char-detail__section {
  background: var(--color-blue-light, #e8edfd);
  border-radius: var(--radius, 12px);
  padding: 0.75rem 1rem;
  margin-bottom: 0.75rem;
  text-align: left;
}

.char-detail__section-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--c-blue, #4468ee);
  margin-bottom: 0.35rem;
  letter-spacing: 0.04em;
}

.char-detail__skill-desc {
  font-size: 0.85rem;
  color: var(--text-main, #2a2a30);
  line-height: 1.5;
  margin: 0;
}

.char-detail__use-btn {
  display: block;
  margin: 0.6rem auto 0;
  padding: 0.4rem 1.25rem;
  background: var(--c-blue, #4468ee);
  color: var(--color-white, #fff);
  border: none;
  border-radius: var(--radius, 12px);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}
.char-detail__use-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.12);
}

/* ── 羁绊区 ── */
.char-detail__bond-status {
  font-size: 0.82rem;
  color: var(--text-secondary, #5a5a68);
  margin: 0;
  line-height: 1.4;
}

/* ── 左右箭头 ── */
.char-detail__arrow {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border: none;
  background: var(--card, #fff);
  border-radius: 50%;
  font-size: 1.4rem;
  color: var(--c-blue, #4468ee);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.15s;
  margin: 0 0.75rem;
}
.char-detail__arrow:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

/* ── 手机端箭头 (≤560px) — 绝对定位贴边 ── */
@media (max-width: 560px) {
  .char-detail__arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 32px;
    height: 32px;
    font-size: 1.1rem;
    margin: 0;
    z-index: 1010;
    opacity: 0.85;
    box-shadow: 0 2px 6px rgba(0,0,0,0.12);
  }

  .char-detail__arrow--left {
    left: 4px;
  }

  .char-detail__arrow--right {
    right: 4px;
  }

  .char-detail__arrow:hover {
    opacity: 1;
    transform: translateY(-50%) scale(1.05);
  }

  /* 弹窗留出让箭头不遮挡内容的内边距 */
  .char-detail.break-modal {
    padding-left: 2.5rem;
    padding-right: 2.5rem;
  }
}

</style>
