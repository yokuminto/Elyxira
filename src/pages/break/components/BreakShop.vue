<!-- BreakShop.vue — 商店弹窗 契约：BreakShopProps / BreakShopEmits -->
<template>
  <div class="break-overlay" @click.self="$emit('close')">
    <div class="break-modal break-shop">
      <h3 class="break-shop__title">商店</h3>

      <div class="break-shop__balance">
        <span class="break-shop__balance-icon">◆</span>
        <span class="break-shop__balance-value">{{ starJade }}</span>
      </div>

      <div class="break-shop__options">
        <div
          v-for="(opt, i) in options"
          :key="i"
          class="break-shop__option"
          :class="{ 'break-shop__option--disabled': starJade < opt.cost }"
          @click="starJade >= opt.cost && $emit('buy', opt)"
        >
          <div class="break-shop__option-info">
            <!-- Buff option -->
            <template v-if="opt.buff">
              <div class="break-shop__option-name">
                <span class="break-shop__option-icon">✦</span>
                {{ opt.buff.name }}
              </div>
              <div class="break-shop__option-desc">{{ opt.buff.description }}</div>
            </template>
            <!-- Character option -->
            <template v-else-if="opt.character">
              <div class="break-shop__option-name">
                <span class="break-shop__option-icon">👤</span>
                {{ opt.character.name }}
              </div>
              <div class="break-shop__option-rarity">
                <span
                  v-for="n in opt.character.starLevel"
                  :key="n"
                  class="break-shop__star"
                >★</span>
              </div>
            </template>
          </div>

          <div
            class="break-shop__cost"
            :class="{ 'break-shop__cost--afford': starJade >= opt.cost }"
          >
            ◆ {{ opt.cost }}
          </div>
        </div>
      </div>

      <!-- 刷新按钮 -->
      <button
        class="break-shop__refresh-btn"
        @click="$emit('refresh')"
      >
        <template v-if="freeRefreshCount && freeRefreshCount > 0">
          ✦ 免费刷新（剩余 {{ freeRefreshCount }} 次）
        </template>
        <template v-else>
          ✦ 刷新（5◆）
        </template>
      </button>

      <button class="break-shop__close-btn" @click="$emit('close')">离开商店</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BreakShopProps, BreakShopEmits } from '../types/component-contracts'
defineProps<BreakShopProps>()
defineEmits<BreakShopEmits>()
</script>

<style scoped>
.break-shop {
  text-align: center;
}

.break-shop__title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--c-blue, #4468ee);
  margin: 0 0 1rem;
}

/* ── Balance display ── */
.break-shop__balance {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--color-blue-light, #e8edfd);
  border-radius: 8px;
  padding: 0.4rem 1rem;
  margin-bottom: 1rem;
}

.break-shop__balance-icon {
  font-size: 1.2rem;
  color: var(--c-yellow, #f5a623);
}

.break-shop__balance-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--c-yellow, #f5a623);
}

/* ── Option cards ── */
.break-shop__options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.break-shop__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: #fff;
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}

.break-shop__option:hover {
  border-color: var(--c-blue, #4468ee);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.break-shop__option:active {
  transform: translateY(0);
}

.break-shop__option--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* ── Option info ── */
.break-shop__option-info {
  flex: 1;
  min-width: 0;
}

.break-shop__option-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-main, #2a2a30);
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.break-shop__option-icon {
  color: var(--c-blue, #4468ee);
  font-size: 0.85rem;
}

.break-shop__option-desc {
  font-size: 0.78rem;
  color: var(--text-secondary, #5a5a68);
  margin-top: 0.2rem;
  line-height: 1.3;
}

.break-shop__option-rarity {
  margin-top: 0.15rem;
  display: flex;
  gap: 0.1rem;
  flex-wrap: wrap;
}

.break-shop__star {
  color: var(--c-yellow, #f5a623);
  font-size: 0.85rem;
}

/* ── Cost badge ── */
.break-shop__cost {
  flex-shrink: 0;
  margin-left: 0.75rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--c-red, #e54960);
  white-space: nowrap;
}

.break-shop__cost--afford {
  color: var(--c-yellow, #f5a623);
}

/* ── Close button ── */
.break-shop__close-btn {
  background: transparent;
  color: var(--text-secondary, #5a5a68);
  border: 1px solid var(--border, #e5e7eb);
  border-radius: var(--radius, 12px);
  padding: 0.5rem 1.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.break-shop__close-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}

/* ── Free refresh button (阮·梅) ── */
.break-shop__refresh-btn {
  display: block;
  width: 100%;
  background: rgba(68, 104, 238, 0.08);
  color: var(--c-blue, #4468ee);
  border: 1px dashed var(--c-blue, #4468ee);
  border-radius: var(--radius, 12px);
  padding: 0.5rem 1rem;
  font-size: 0.85em;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: 0.5rem;
}

.break-shop__refresh-btn:hover {
  background: rgba(68, 104, 238, 0.12);
  transform: translateY(-1px);
}

/* ── 手机端适配 (≤480px) ── */
@media (max-width: 480px) {
  .break-shop__option {
    padding: 0.75rem 0.85rem;
    min-height: 48px; /* 触控友好 */
  }

  .break-shop__option-name {
    font-size: 0.9rem;
  }

  .break-shop__option-desc {
    font-size: 0.74rem;
  }

  .break-shop__cost {
    font-size: 0.82rem;
    margin-left: 0.5rem;
  }

  .break-shop__refresh-btn {
    font-size: 0.8em;
    padding: 0.55rem 0.75rem;
    min-height: 44px;
  }

  .break-shop__close-btn {
    width: 100%;
    min-height: 44px;
  }
}
</style>
