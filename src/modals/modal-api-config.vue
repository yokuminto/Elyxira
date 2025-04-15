<template>
  <ModalBase title="API配置" :show="show" @close="$emit('close')">
    <div>
      <!-- 预设管理 -->
      <div class="modal__form-group modal__form-group--preset">
        <label for="preset-select" class="modal__form-label">当前预设</label>
        <div class="modal__preset-controls">
          <select id="preset-select" v-model="activePresetName" @change="handlePresetChange"
            class="modal__form-control modal__form-control--select">
            <option v-for="preset in apiPresets" :key="preset.name" :value="preset.name">
              {{ preset.name }}
            </option>
          </select>
          <button class="modal__button modal__button--icon modal__button--add" @click="addPreset" title="添加预设">
            <i class="fas fa-plus"></i>
          </button>
          <button class="modal__button modal__button--icon modal__button--rename" @click="renamePreset" title="重命名预设"
            :disabled="apiPresets.length <= 0">
            <i class="fas fa-edit"></i>
          </button>
          <button class="modal__button modal__button--icon modal__button--delete" @click="deletePreset"
            :disabled="apiPresets.length <= 1" title="删除预设">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>

      <!-- API配置表单 -->
      <div class="modal__form-group modal__form-group--switch">
        <label for="api-enabled" class="modal__form-label">启用API</label>
        <label class="modal__toggle-switch">
          <input type="checkbox" id="api-enabled" v-model="localConfig.enabled">
          <span class="modal__toggle-slider"></span>
        </label>
      </div>

      <div class="modal__form-group">
        <label for="api-url" class="modal__form-label">API地址</label>
        <input type="text" id="api-url" v-model="localConfig.apiUrl" class="modal__form-control"
          placeholder="例如: https://api.openai.com/v1/chat/completions">
      </div>

      <div class="modal__form-group">
        <label for="api-key" class="modal__form-label">API密钥</label>
        <input type="password" id="api-key" v-model="localConfig.apiKey" class="modal__form-control"
          placeholder="sk-...">
      </div>

      <div class="modal__form-group">
        <label for="api-model" class="modal__form-label">模型名称</label>
        <input type="text" id="api-model" v-model="localConfig.model" class="modal__form-control"
          placeholder="例如: gpt-3.5-turbo">
      </div>

      <div class="modal__form-group modal__form-group--switch">
        <label for="auto-generate" class="modal__form-label">自动生成</label>
        <label class="modal__toggle-switch">
          <input type="checkbox" id="auto-generate" v-model="localConfig.autoGenerate">
          <span class="modal__toggle-slider"></span>
        </label>
      </div>

      <div class="modal__form-group modal__form-group--switch">
        <label for="auto-sync" class="modal__form-label">自动同步</label>
        <label class="modal__toggle-switch">
          <input type="checkbox" id="auto-sync" v-model="localConfig.autoSync">
          <span class="modal__toggle-slider"></span>
        </label>
      </div>
      <div class="modal__form-description">启用后，AI生成内容后将自动同步到远程仓库 (需配置GitHub)</div>


      <div class="modal__form-group modal__form-group--switch">
        <label for="stream-output" class="modal__form-label">流式输出</label>
        <label class="modal__toggle-switch">
          <input type="checkbox" id="stream-output" v-model="localConfig.streamOutput">
          <span class="modal__toggle-slider"></span>
        </label>
      </div>

      <div class="modal__form-group">
        <label for="system-prompt" class="modal__form-label">系统提示词</label>
        <div class="modal__prompt-controls">
          <button class="modal__button modal__button--small modal__button--reset" @click="showPromptPresets"
            title="加载提示词预设">
            <i class="fas fa-list"></i>
          </button>
        </div>
        <textarea id="system-prompt" v-model="localConfig.systemPrompt" class="modal__form-control" rows="3"
          placeholder="输入系统提示词"></textarea>
      </div>

      <div class="modal__form-group">
        <label for="temperature" class="modal__form-label">温度 (0-1)</label>
        <div class="modal__form-input-group">
          <input type="range" id="temperature" v-model.number="localConfig.temperature" min="0" max="1" step="0.1">
          <span>{{ localConfig.temperature?.toFixed(1) }}</span>
        </div>
      </div>

      <div class="modal__form-group">
        <label for="max-tokens" class="modal__form-label">最大令牌数</label>
        <input type="number" id="max-tokens" v-model.number="localConfig.maxTokens" min="1" class="modal__form-control">
      </div>

      <div class="modal__form-group">
        <label for="top-p" class="modal__form-label">Top P (0-1)</label>
        <div class="modal__form-input-group">
          <input type="range" id="top-p" v-model.number="localConfig.topP" min="0" max="1" step="0.1">
          <span>{{ localConfig.topP?.toFixed(1) }}</span>
        </div>
      </div>

      <!-- 提示词预设弹出框，移到这里，确保不被遮挡 -->
      <div v-if="showingPromptPresets" class="modal__prompt-presets-container">
        <div class="modal__prompt-presets">
          <div class="modal__prompt-presets-header">选择提示词预设</div>
          <div v-if="promptPresets.length > 0" class="modal__prompt-presets-list">
            <div v-for="preset in promptPresets" :key="preset.name" class="modal__prompt-preset-item"
              @click="loadPromptPreset(preset)">
              <div class="modal__prompt-preset-name">{{ preset.name }}</div>
              <div class="modal__prompt-preset-desc">{{ preset.description }}</div>
            </div>
          </div>
          <div v-else class="modal__prompt-presets-empty">
            未找到提示词预设
          </div>
          <div class="modal__prompt-presets-actions">
            <button class="modal__button modal__button--small" @click="clearSystemPrompt">清空提示词</button>
            <button class="modal__button modal__button--small" @click="closePromptPresets">关闭</button>
          </div>
        </div>
      </div>

      <div class="modal__footer-buttons">
        <button class="modal__button modal__button--secondary" @click="$emit('close')">取消</button>
        <button class="modal__button modal__button--primary" @click="saveConfig">保存当前预设</button>
      </div>
    </div>
  </ModalBase>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import ModalBase from './modal-base.vue'
import configService, { type ApiConfig, type ApiPreset } from '../services/config-service'
import { showToast } from '@/utils/toast' // 引入 showToast

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  // 不再需要 'save' 事件，因为配置直接通过 service 保存
}>();

const apiPresets = ref<ApiPreset[]>([]);
const activePresetName = ref<string>('');
const localConfig = ref<ApiConfig>({
  enabled: false,
  autoGenerate: false,
  streamOutput: true,
  autoSync: false,
  apiUrl: '',
  apiKey: '',
  model: '',
  systemPrompt: '',
  temperature: 0.7,
  maxTokens: 2000,
  topP: 1,
});

// 提示词预设相关
const promptPresets = ref<{ name: string, description: string, path: string }[]>([]);
const showingPromptPresets = ref(false);

// --- 数据加载与同步 ---

// 加载预设列表和当前活动预设
const loadPresets = () => {
  apiPresets.value = configService.getApiPresets();
  activePresetName.value = configService.getActiveApiPresetName();
  // 确保 localConfig 反映当前的活动预设
  updateLocalConfigFromPreset(activePresetName.value);
  // console.log('Presets loaded:', apiPresets.value, 'Active:', activePresetName.value);
};

// 根据预设名称更新 localConfig
const updateLocalConfigFromPreset = (presetName: string) => {
  const preset = apiPresets.value.find(p => p.name === presetName);
  if (preset) {
    // 仅复制 ApiConfig 的属性，排除 name
    const { name, ...config } = preset;
    localConfig.value = { ...config };
    // 确保新字段也被正确加载
    // console.log('Local config updated from preset:', presetName, localConfig.value);
  } else {
    console.warn(`Preset "${presetName}" not found when updating local config.`);
    // 可以选择加载默认值或第一个预设的值
    const firstPreset = apiPresets.value[0];
    if (firstPreset) {
      const { name, ...config } = firstPreset;
      localConfig.value = { ...config };
      activePresetName.value = firstPreset.name; // 同时更新活动名称
    } else {
      // 如果连第一个预设都没有（异常情况），加载默认 API 配置
      localConfig.value = configService.getApiConfig(); // 获取默认或兜底配置
    }
  }
};


// --- 生命周期钩子和监听器 ---

// 配置变更监听器
const configChangeListener = () => {
  // console.log('API config change detected by listener');
  loadPresets(); // 重新加载预设列表和活动预设
};

onMounted(() => {
  loadPresets(); // 初始加载
  configService.addListener('api', configChangeListener); // 添加监听器
});

onBeforeUnmount(() => {
  configService.removeListener('api', configChangeListener); // 移除监听器
});

// 监听模态框显示状态
watch(() => props.show, (newVal) => {
  if (newVal) {
    loadPresets(); // 每次显示时重新加载，确保数据最新
  }
});

// 监听活动预设名称的变化，自动更新表单内容
watch(activePresetName, (newName) => {
  // console.log('Active preset name changed:', newName);
  updateLocalConfigFromPreset(newName);
});


// --- 预设管理操作 ---

// 切换预设
const handlePresetChange = () => {
  if (activePresetName.value) {
    // console.log('Preset changed via select:', activePresetName.value);
    configService.setActiveApiPreset(activePresetName.value);
    // setActiveApiPreset 会触发 listener，listener 会调用 loadPresets，
    // loadPresets 会调用 updateLocalConfigFromPreset，所以这里不需要手动调用 update
  }
};

// 添加预设
const addPreset = () => {
  const newName = prompt('请输入新预设的名称:', `预设 ${apiPresets.value.length + 1}`);
  if (newName) {
    const success = configService.addApiPreset(newName, activePresetName.value); // 从当前活动预设复制配置
    if (success) {
      // 添加成功后，切换到新的预设
      nextTick(() => { // 确保 DOM 更新后再设置
        activePresetName.value = newName;
        configService.setActiveApiPreset(newName); // 确保 service 状态也更新
        // loadPresets(); // listener 会自动调用
      });
    }
  }
};

// 重命名预设
const renamePreset = () => {
  const oldName = activePresetName.value;
  if (!oldName) return;

  const newName = prompt(`重命名预设 "${oldName}" 为:`, oldName);
  if (newName && newName !== oldName) {
    const success = configService.renameApiPreset(oldName, newName);
    if (success) {
      // 重命名成功后，下拉菜单需要更新，活动名称可能也需要更新
      nextTick(() => { // 确保 DOM 更新后再设置
        loadPresets(); // 重新加载以获取更新后的列表和活动名称
      });
    }
  }
};


// 删除预设
const deletePreset = () => {
  const nameToDelete = activePresetName.value;
  if (!nameToDelete) return;

  if (apiPresets.value.length <= 1) {
    showToast('无法删除最后一个预设', 'warning');
    return;
  }

  if (confirm(`确定要删除预设 "${nameToDelete}" 吗？`)) {
    const success = configService.deleteApiPreset(nameToDelete);
    if (success) {
      // 删除成功后，下拉菜单和活动预设会自动更新（通过 listener -> loadPresets）
      // 无需在此处手动更新 activePresetName 或 localConfig
      // listener 会确保加载正确的下一个活动预设及其配置
    }
  }
};


// --- 保存配置 ---

// 保存当前活动预设的配置
function saveConfig() {
  configService.updateApiConfig(localConfig.value); // updateApiConfig 现在保存的是当前活动预设
  emit('close');
}

// 显示提示词预设选择框
const showPromptPresets = async () => {
  // 如果已经显示，则关闭
  if (showingPromptPresets.value) {
    showingPromptPresets.value = false;
    return;
  }

  // 加载提示词预设列表
  try {
    const response = await fetch('/prompts/index.json');
    if (response.ok) {
      promptPresets.value = await response.json();
      showingPromptPresets.value = true;

      // 点击外部区域关闭预设框
      nextTick(() => {
        const clickOutsideHandler = (event: MouseEvent) => {
          const presetElement = document.querySelector('.modal__prompt-presets');
          const buttonElement = document.querySelector('.modal__button--reset');

          if (presetElement && buttonElement &&
            !presetElement.contains(event.target as Node) &&
            !buttonElement.contains(event.target as Node)) {
            showingPromptPresets.value = false;
            document.removeEventListener('click', clickOutsideHandler);
          }
        };

        // 延迟添加事件监听器，避免立即触发
        setTimeout(() => {
          document.addEventListener('click', clickOutsideHandler);
        }, 100);
      });
    } else {
      showToast('加载提示词预设列表失败', 'error');
    }
  } catch (error) {
    console.error('加载提示词预设列表出错:', error);
    showToast('加载提示词预设列表出错', 'error');
  }
};

// 清空系统提示词
const clearSystemPrompt = () => {
  localConfig.value.systemPrompt = '';
};

// 关闭提示词预设选择框
const closePromptPresets = () => {
  showingPromptPresets.value = false;
};

// 加载提示词预设
const loadPromptPreset = async (preset: { name: string, description: string, path: string }) => {
  try {
    const response = await fetch(`/prompts/${preset.path}`);
    if (response.ok) {
      const data = await response.json();
      if (data.system_prompt) {
        localConfig.value.systemPrompt = data.system_prompt;
        // 同时应用其他配置如温度、top_p等
        if (data.temperature !== undefined) localConfig.value.temperature = data.temperature;
        if (data.top_p !== undefined) localConfig.value.topP = data.top_p;
        showToast(`已加载"${preset.name}"提示词预设`, 'success');
      } else {
        showToast('提示词预设格式无效', 'warning');
      }
    } else {
      showToast(`加载"${preset.name}"提示词预设失败`, 'error');
    }
  } catch (error) {
    console.error(`加载"${preset.name}"提示词预设出错:`, error);
    showToast(`加载"${preset.name}"提示词预设出错`, 'error');
  } finally {
    showingPromptPresets.value = false;
  }
};
</script>
