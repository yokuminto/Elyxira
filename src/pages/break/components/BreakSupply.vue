<!-- BreakSupply.vue — 补给站选角弹窗 契约：BreakSupplyProps / BreakSupplyEmits -->
<template>
  <div class="break-overlay">
    <div class="break-modal break-supply">
      <h3 class="break-supply__title">补给站 — 免费招募</h3>

      <div class="break-supply__options">
        <div
          v-for="char in options"
          :key="char.id"
          class="break-supply__card"
          @click="$emit('select', char)"
        >
          <div class="break-supply__name">{{ char.name }}</div>

          <div class="break-supply__star-level">
            <span
              v-for="n in char.starLevel"
              :key="n"
              class="break-supply__star"
            >★</span>
          </div>

          <div class="break-supply__badges">
            <span class="break-supply__bond" :style="{ '--bond-color': bondColor(char) }">
              {{ bondLabel(char) }}
            </span>
          </div>

          <div class="break-supply__free-badge">免费</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BreakSupplyProps, BreakSupplyEmits } from '../types/component-contracts'
import { bondColor } from '../composables/bondColors'
defineProps<BreakSupplyProps>()
defineEmits<BreakSupplyEmits>()

const BOND_LABELS: Record<string, string> = { xianzhou: '仙舟同盟', touhou: '幻想乡', genius: '天才俱乐部' }
function bondLabel(c: { bondGroup: string }) { return BOND_LABELS[c.bondGroup] ?? c.bondGroup }
</script>

<style scoped>
.break-supply {
  text-align: center;
}

.break-supply__title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--c-blue, #4468ee);
  margin: 0 0 1rem;
}

/* ── Card grid ── */
.break-supply__options {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.break-supply__card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 1.25rem 0.75rem 1rem;
  background: var(--card, #fff);
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.break-supply__card:hover {
  border-color: var(--c-blue, #4468ee);
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(68, 104, 238, 0.1);
}

.break-supply__card:active {
  transform: translateY(-1px);
}

/* ── Name ── */
.break-supply__name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main, #2a2a30);
  line-height: 1.2;
}

/* ── Rarity stars ── */
.break-supply__star-level {
  display: flex;
  gap: 0.1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.break-supply__star {
  color: var(--c-yellow, #f5a623);
  font-size: 0.9rem;
}

/* ── Source badge ── */
.break-supply__badges {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
  justify-content: center;
}

.break-supply__bond {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  background: color-mix(in srgb, var(--bond-color) 15%, transparent);
  color: var(--bond-color);
}

/* ── Free badge ── */
.break-supply__free-badge {
  margin-top: 0.2rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--c-green, #36b991);
  background: rgba(54, 185, 145, 0.12);
  padding: 0.15rem 0.75rem;
  border-radius: 10px;
  letter-spacing: 0.05em;
}

/* ── 手机端：卡片竖排 (≤500px) ── */
@media (max-width: 500px) {
  .break-supply__options {
    flex-direction: column;
    gap: 0.5rem;
  }

  .break-supply__card {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0.85rem 1rem;
    gap: 0.5rem;
    text-align: left;
  }

  .break-supply__name {
    font-size: 1rem;
    flex-shrink: 0;
  }

  .break-supply__star-level {
    flex-shrink: 0;
  }

  .break-supply__badges {
    flex: 1;
    justify-content: flex-end;
  }

  .break-supply__free-badge {
    display: none;
  }
}
</style>
