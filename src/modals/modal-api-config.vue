<template>
  <BaseModal :show="show" @close="$emit('close')" class="modal-api-config" title="API配置">
    <div class="modal__body">
      <div class="modal__settings-group">
        <div class="modal__setting-item">
          <div class="modal__setting-description">
            <div class="modal__setting-name">自动生成笔记</div>
            <div class="modal__setting-detail">加载题目时，若下题未生成AI笔记，则自动生成下一题的AI笔记</div>
          </div>
          <label class="modal__toggle-switch">
            <input type="checkbox" v-model="configModel.autoGenerateNotes">
            <span class="slider"></span>
          </label>
        </div>
        <div class="modal__form-group">
          <label class="modal__form-label">API地址</label>
          <div class="modal__setting-detail">AI服务的API端点URL</div>
          <div class="modal__prompt-controls">
            <select v-model="selectedApiPreset" class="modal__form-input" @change="handleApiPresetChange">
              <option value="">选择API预设...</option>
              <option v-for="preset in apiUrlPresets" :key="preset.id" :value="preset.id">
                {{ preset.name }}
              </option>
            </select>
          </div>
          <input type="text" v-model="configModel.apiUrl" class="modal__form-input"
            placeholder="https://api.example.com/v1/chat/completions">
        </div>

        <div class="modal__form-group">
          <label class="modal__form-label">API密钥</label>
          <div class="modal__setting-detail">访问AI服务所需的密钥</div>
          <input type="password" v-model="configModel.apiKey" class="modal__form-input" placeholder="sk-...">
        </div>

        <div class="modal__form-group">
          <label class="modal__form-label">模型名称</label>
          <div class="modal__setting-detail">要使用的AI模型</div>
          <input type="text" v-model="configModel.model" class="modal__form-input"
            placeholder="deepseek/deepseek-chat-v3-0324:free">
        </div>
      </div>

      <div class="modal__settings-group">
        <h3 class="modal__section-title">提示词设置</h3>
        <div class="modal__form-group">
          <label class="modal__form-label">提示词预设</label>
          <div class="modal__setting-detail">选择或自定义AI助手的行为模式</div>
          <div class="modal__prompt-controls">
            <select v-model="selectedPreset" class="modal__form-input" @change="handlePresetChange">
              <option value="">选择提示词预设...</option>
              <option v-for="preset in promptPresets" :key="preset.id" :value="preset.id">
                {{ preset.name }}
              </option>
            </select>
            <div class="modal__prompt-buttons">
              <button @click="editPreset" class="modal__button modal__button--secondary" title="编辑当前预设">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button @click="createNewPreset" class="modal__button modal__button--success" title="新建预设">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
              <button @click="deletePreset" class="modal__button modal__button--danger" title="删除当前预设">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2">
                  </path>
                </svg>
              </button>
              <button @click="saveAsNewPreset" class="modal__button modal__button--primary" title="另存为新预设">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="modal__form-group">
          <label class="modal__form-label">系统提示词</label>
          <div class="modal__setting-detail">定义AI助手的行为和专业领域</div>
          <textarea v-model="configModel.systemPrompt" class="modal__form-textarea"
            placeholder="你是一个医学专家助手，擅长解释医学概念和知识点。"></textarea>
        </div>
      </div>

      <div class="modal__settings-group">
        <h3 class="modal__section-title">高级设置</h3>
        <div class="modal__setting-item">
          <div class="modal__setting-description">
            <div class="modal__setting-name">启用流式输出</div>
            <div class="modal__setting-detail">实时显示AI生成的内容</div>
          </div>
          <label class="modal__toggle-switch">
            <input type="checkbox" v-model="configModel.streamOutput">
            <span class="slider"></span>
          </label>
        </div>
        <div class="modal__form-group">
          <label class="modal__form-label">温度</label>
          <div class="modal__setting-detail">控制输出的随机性（0-1）</div>
          <input type="number" v-model.number="configModel.temperature" class="modal__form-input" min="0" max="1"
            step="0.1">
        </div>
        <div class="modal__form-group">
          <label class="modal__form-label">Top P</label>
          <div class="modal__setting-detail">控制输出的多样性（0-1）</div>
          <input type="number" v-model.number="configModel.topP" class="modal__form-input" min="0" max="1" step="0.1">
        </div>
      </div>
    </div>
    <template #footer>
      <button @click="saveConfig" class="modal__button modal__button--success">保存配置</button>
      <button @click="$emit('close')" class="modal__button modal__button--secondary">取消</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import BaseModal from './modal-base.vue';

const props = defineProps<{
  show: boolean;
  currentConfig?: {
    apiUrl?: string;
    apiKey?: string;
    model?: string;
    systemPrompt?: string;
    autoGenerateNotes?: boolean;
    streamOutput?: boolean;
    temperature?: number;
    topP?: number;
  };
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', config: {
    apiUrl: string;
    apiKey: string;
    model: string;
    systemPrompt: string;
    autoGenerateNotes: boolean;
    streamOutput: boolean;
    temperature: number;
    topP: number;
  }): void;
}>();

// 配置模型
const configModel = reactive({
  apiUrl: '',
  apiKey: '',
  model: 'deepseek/deepseek-chat-v3-0324:free',
  systemPrompt: '你是一个医学专家助手，擅长解释医学概念和知识点，请为学生提供详细、准确的笔记。',
  autoGenerateNotes: true,
  streamOutput: true,
  temperature: 0.7,
  topP: 0.9
});

// 提示词预设
interface PromptPreset {
  id: string;
  name: string;
  systemPrompt: string;
  isSystem?: boolean;
}

const promptPresets = ref<PromptPreset[]>([
  {
    id: 'medical',
    name: '医学专家',
    systemPrompt: '你是一个医学专家助手，擅长解释医学概念和知识点，请为学生提供详细、准确的笔记。'
  },
  {
    id: 'educator',
    name: '教育专家',
    systemPrompt: '你是一个教育专家，擅长将复杂知识简化为易于理解的学习笔记，善于使用类比和例子。'
  },
  {
    id: 'openrouter',
    name: 'OpenRouter应用',
    systemPrompt: '你是一个专业的助手，负责根据题目生成高质量的学习笔记，包含相关知识点、解释和记忆方法。请提供详细、准确、结构化的笔记，使用markdown格式以便更好地展示。'
  }
]);

// API预设
interface ApiUrlPreset {
  id: string;
  name: string;
  url: string;
  defaultModel: string;
}

const apiUrlPresets = ref<ApiUrlPreset[]>([
  {
    id: 'openrouter',
    name: 'OpenRouter API',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    defaultModel: 'deepseek/deepseek-chat-v3-0324:free'
  }
]);

// 添加API URL预设选择器
const selectedApiPreset = ref('');

function handleApiPresetChange() {
  if (selectedApiPreset.value) {
    const preset = apiUrlPresets.value.find(p => p.id === selectedApiPreset.value);
    if (preset) {
      configModel.apiUrl = preset.url;
      configModel.model = preset.defaultModel;
    }
  }
}

const selectedPreset = ref('');

// 监听配置变化
watch(() => props.currentConfig, (newConfig) => {
  if (newConfig) {
    Object.assign(configModel, {
      ...configModel,
      ...newConfig
    });
  }
}, { immediate: true, deep: true });

// 处理预设选择变化
function handlePresetChange() {
  if (selectedPreset.value) {
    const preset = promptPresets.value.find(p => p.id === selectedPreset.value);
    if (preset) {
      configModel.systemPrompt = preset.systemPrompt;
    }
  }
}

// 编辑当前预设
function editPreset() {
  if (!selectedPreset.value) {
    alert('请先选择一个预设');
    return;
  }

  const preset = promptPresets.value.find(p => p.id === selectedPreset.value);
  if (preset) {
    preset.systemPrompt = configModel.systemPrompt;
    savePresets();
  }
}

// 创建新预设
function createNewPreset() {
  const name = prompt('请输入新预设名称:');
  if (!name) return;

  const id = 'preset_' + Date.now();
  promptPresets.value.push({
    id,
    name,
    systemPrompt: configModel.systemPrompt
  });

  selectedPreset.value = id;
  savePresets();
}

// 删除预设
function deletePreset() {
  if (!selectedPreset.value) {
    alert('请先选择一个预设');
    return;
  }

  if (confirm('确定要删除此预设吗?')) {
    promptPresets.value = promptPresets.value.filter(p => p.id !== selectedPreset.value);
    selectedPreset.value = '';
    savePresets();
  }
}

// 另存为新预设
function saveAsNewPreset() {
  const name = prompt('请输入新预设名称:');
  if (!name) return;

  const id = 'preset_' + Date.now();
  promptPresets.value.push({
    id,
    name,
    systemPrompt: configModel.systemPrompt
  });

  selectedPreset.value = id;
  savePresets();
}

// 保存预设到本地存储
function savePresets() {
  localStorage.setItem('aiPromptPresets', JSON.stringify(promptPresets.value));
}

// 加载预设
function loadPresets() {
  const savedPresets = localStorage.getItem('aiPromptPresets');
  if (savedPresets) {
    try {
      promptPresets.value = JSON.parse(savedPresets);
    } catch (error) {
      console.error('加载AI提示词预设失败:', error);
    }
  }
}

// 保存配置
function saveConfig() {
  const config = { ...configModel };
  localStorage.setItem('aiApiConfig', JSON.stringify(config));
  emit('save', config);
  emit('close');
}

// 组件挂载时加载预设
onMounted(async () => {
  // 先尝试加载系统预设
  try {
    const response = await fetch('/prompts/index.json');
    if (response.ok) {
      const indexData = await response.json();
      for (const item of indexData) {
        try {
          const promptResponse = await fetch(`/prompts/${item.path}`);
          if (promptResponse.ok) {
            const promptData = await promptResponse.json();
            // 添加系统预设
            promptPresets.value.push({
              id: `system_${promptData.name}`,
              name: promptData.name,
              systemPrompt: promptData.system_prompt,
              isSystem: true // 标记为系统预设
            });
            console.log(`加载系统预设: ${promptData.name}`);
          }
        } catch (promptError) {
          console.error(`加载预设文件 ${item.path} 失败:`, promptError);
        }
      }
    }
  } catch (error) {
    console.error('加载系统预设索引失败:', error);
  }

  // 再加载用户自定义预设
  loadPresets();

  // 加载保存的配置
  const savedConfig = localStorage.getItem('aiApiConfig');
  if (savedConfig) {
    try {
      const config = JSON.parse(savedConfig);
      Object.assign(configModel, config);
    } catch (error) {
      console.error('加载AI配置失败:', error);
    }
  }
});
</script>
