<!-- BreakBossReward.vue — Boss 击败招募弹窗 契约：BreakBossRewardProps / BreakBossRewardEmits -->
<template>
  <div class="break-overlay" @click.self="$emit('skip')">
    <div class="break-modal break-reward">
      <h3 class="break-reward__title">Boss 击破！</h3>
      <p class="break-reward__message">选择一名角色招募至麾下</p>

      <div class="break-reward__options">
        <div
          v-for="char in options"
          :key="char.id"
          class="break-reward__card"
          @click="$emit('select', char)"
        >
          <div class="break-reward__name">{{ char.name }}</div>
          <div class="break-reward__rarity">
            <span
              v-for="n in char.starLevel"
              :key="n"
              class="break-reward__star"
            >★</span>
          </div>
          <div class="break-reward__bond" :style="{ '--bond-color': bondColor(char) }">
            {{ bondLabel(char) }}
          </div>
        </div>
      </div>

      <div class="break-reward__actions">
        <button class="break-reward__btn break-reward__btn--submit" disabled>招募</button>
        <button class="break-reward__btn break-reward__btn--skip" @click="$emit('skip')">跳过</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BreakBossRewardProps, BreakBossRewardEmits } from '../types/component-contracts'
import { bondColor } from '../composables/bondColors'
defineProps<BreakBossRewardProps>()
defineEmits<BreakBossRewardEmits>()

const BOND_LABELS: Record<string, string> = { xianzhou: '仙舟同盟', touhou: '幻想乡', genius: '天才俱乐部' }
function bondLabel(c: { bondGroup: string }) { return BOND_LABELS[c.bondGroup] ?? c.bondGroup }
</script>

<style scoped>
.break-reward {
  text-align: center;
}

.break-reward__title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--c-yellow, #f5a623);
  margin: 0 0 0.3rem;
}

.break-reward__message {
  font-size: 0.85rem;
  color: var(--text-secondary, #5a5a68);
  margin: 0 0 1rem;
}

/* ── Card grid ── */
.break-reward__options {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.break-reward__card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 1.25rem 0.75rem 1rem;
  background: var(--card, #fff);
  border: 1px solid var(--c-yellow, #f5a623);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.break-reward__card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(245, 166, 35, 0.15);
  border-color: var(--c-yellow, #f5a623);
}

.break-reward__card:active {
  transform: translateY(-1px);
}

/* ── Name ── */
.break-reward__name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-main, #2a2a30);
}

/* ── Rarity ── */
.break-reward__rarity {
  display: flex;
  gap: 0.1rem;
}

.break-reward__star {
  color: var(--c-yellow, #f5a623);
  font-size: 0.9rem;
}

/* ── Source ── */
.break-reward__bond {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  background: color-mix(in srgb, var(--bond-color) 15%, transparent);
  color: var(--bond-color);
}

/* ── Actions ── */
.break-reward__actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.break-reward__btn {
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius, 12px);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  border: none;
}

.break-reward__btn--submit {
  background: var(--c-blue, #4468ee);
  color: var(--color-white, #fff);
}

.break-reward__btn--submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.break-reward__btn--submit:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}

.break-reward__btn--skip {
  background: transparent;
  color: var(--text-secondary, #5a5a68);
  border: 1px solid var(--border, #e5e7eb);
}

.break-reward__btn--skip:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}

/* ── 手机端：卡片竖排 (≤500px) ── */
@media (max-width: 500px) {
  .break-reward__options {
    flex-direction: column;
    gap: 0.5rem;
  }

  .break-reward__card {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0.85rem 1rem;
    gap: 0.5rem;
    text-align: left;
  }

  .break-reward__name {
    font-size: 1rem;
    flex: 0 0 auto;
  }

  .break-reward__rarity {
    flex-shrink: 0;
  }

  .break-reward__bond {
    flex-shrink: 0;
  }
}
</style>
