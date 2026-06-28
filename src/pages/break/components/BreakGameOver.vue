<!-- BreakGameOver.vue — 游戏结束面板 契约：BreakGameOverProps / BreakGameOverEmits -->
<template>
  <div class="break-overlay">
    <div class="break-modal break-gameover">
      <!-- Error -->
      <template v-if="errorMessage">
        <h2 class="break-gameover__title break-gameover__title--defeat">出错了</h2>
        <p class="break-gameover__subtitle break-gameover__subtitle--defeat">{{ errorMessage }}</p>
      </template>

      <!-- Victory -->
      <template v-else-if="isVictory">
        <h2 class="break-gameover__title break-gameover__title--victory">
          通关成功！
        </h2>
        <p class="break-gameover__subtitle">全部节点已击破，恭喜通关！</p>
      </template>

      <!-- Defeat -->
      <template v-else>
        <h2 class="break-gameover__title break-gameover__title--defeat">力尽而亡</h2>
        <p class="break-gameover__subtitle break-gameover__subtitle--defeat">HP 归零，旅程中断</p>
      </template>

      <!-- Stats grid (2×2) -->
      <div class="break-gameover__stats">
        <div class="break-gameover__stat">
          <span class="break-gameover__stat-label">完成节点</span>
          <span class="break-gameover__stat-value">{{ completedNodes }}/{{ totalNodes }}</span>
        </div>
        <div class="break-gameover__stat">
          <span class="break-gameover__stat-label">最高连击</span>
          <span class="break-gameover__stat-value">{{ maxCombo }}</span>
        </div>
        <div class="break-gameover__stat">
          <span class="break-gameover__stat-label">星琼获得</span>
          <span class="break-gameover__stat-value break-gameover__stat-value--gold">◆ {{ starJade }}</span>
        </div>
        <div class="break-gameover__stat">
          <span class="break-gameover__stat-label">招募角色</span>
          <span class="break-gameover__stat-value">{{ characterCount }} 位</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="break-gameover__actions">
        <button class="break-gameover__btn break-gameover__btn--primary" @click="$emit('restart')">再来一局</button>
        <button class="break-gameover__btn break-gameover__btn--outline" @click="$emit('back-to-library')">返回题库</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BreakGameOverProps, BreakGameOverEmits } from '../types/component-contracts'
defineProps<BreakGameOverProps>()
defineEmits<BreakGameOverEmits>()
</script>

<style scoped>
.break-gameover {
  text-align: center;
}

/* ── Title ── */
.break-gameover__title {
  font-size: 1.15rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
}

.break-gameover__title--victory {
  color: var(--c-blue, #4468ee);
}

.break-gameover__title--defeat {
  color: var(--c-red, #e54960);
}

/* ── Subtitle ── */
.break-gameover__subtitle {
  font-size: 0.85rem;
  color: var(--text-secondary, #5a5a68);
  margin: 0 0 1.25rem;
}

.break-gameover__subtitle--defeat {
  color: var(--c-red, #e54960);
  opacity: 0.7;
}

/* ── Stats grid ── */
.break-gameover__stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;
  margin-bottom: 1.25rem;
}

.break-gameover__stat {
  background: var(--color-blue-light, #e8edfd);
  border-radius: 8px;
  padding: 0.6rem 0.4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
}

.break-gameover__stat-label {
  font-size: 0.72rem;
  color: var(--text-secondary, #5a5a68);
  letter-spacing: 0.06em;
}

.break-gameover__stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--c-blue, #4468ee);
}

.break-gameover__stat-value--gold {
  color: var(--c-yellow, #f5a623);
}

/* ── Actions ── */
.break-gameover__actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.break-gameover__btn {
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius, 12px);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.break-gameover__btn--primary {
  background: var(--c-blue, #4468ee);
  color: var(--color-white, #fff);
  border: none;
}

.break-gameover__btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}

.break-gameover__btn--outline {
  background: transparent;
  color: var(--text-secondary, #5a5a68);
  border: 1px solid var(--border, #e5e7eb);
}

.break-gameover__btn--outline:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}

/* ── 手机端：单列统计 + 按钮竖排 (≤400px) ── */
@media (max-width: 400px) {
  .break-gameover__stats {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .break-gameover__actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .break-gameover__btn {
    width: 100%;
    text-align: center;
  }
}
</style>
