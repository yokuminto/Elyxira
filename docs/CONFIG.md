# 配置服务使用说明

## 概述

配置服务(`config-service`)是一个统一的配置管理服务，负责应用程序中所有配置的加载、保存、导入和导出功能。它替代了之前分散在各个组件中的配置管理逻辑，提供了更简洁、统一的配置管理方式。

## 功能

- 加载和保存应用设置
- 管理GitHub仓库配置
- 导入和导出配置
- 缓存管理和统计
- 主题应用和切换
- 重置设置

## 如何使用

### 导入配置服务

```typescript
import configService from '@/services/config-service'
```

### 获取设置

```typescript
// 获取所有设置
const allSettings = configService.getSettings()

// 获取通用设置(UI、刷题、调试等)
const generalSettings = configService.getGeneralSettings()

// 获取GitHub仓库配置
const githubConfig = configService.getGithubConfig()
```

### 保存设置

```typescript
// 保存通用设置
configService.saveGeneralSettings({
  uiSettings: {
    /* UI设置 */
  },
  quizSettings: {
    /* 刷题设置 */
  },
  debugEnabled: true,
  apiConfig: {
    /* API配置 */
  },
})

// 保存GitHub仓库配置
configService.saveGithubConfig({
  owner: 'username',
  repo: 'repo-name',
  branch: 'main',
  path: 'quizzes/',
  token: 'your-token',
  forceSync: true,
})

// 单独保存调试模式设置
configService.saveDebugEnabled(true)
```

### 导入和导出配置

```typescript
// 导出配置到JSON文件
const filename = configService.exportConfig()

// 从对象导入配置
const success = configService.importConfig(configData)

// 从文件导入配置
configService
  .importConfigFromFile(file)
  .then((success) => {
    if (success) {
      // 导入成功
    }
  })
  .catch((error) => {
    // 处理错误
  })
```

### 缓存管理

```typescript
// 获取缓存统计信息
const { totalSize, items } = configService.getCacheStats()

// 清除题库缓存
const cleared = configService.clearQuizCache()
```

### 重置设置

```typescript
// 重置所有设置为默认值
configService.resetAllSettings()
```

## 设置类型

配置服务使用了`@/types/settings.ts`中定义的类型，主要包括：

- `UiSettings`: UI设置接口
- `QuizSettings`: 测验设置接口
- `ApiConfig`: API配置接口
- `GithubConfig`: GitHub仓库配置接口
- `GeneralSettings`: 通用设置接口(包含UI、测验和调试设置)
- `AppSettings`: 完整应用配置接口
- `ConfigExportData`: 导出配置数据格式

## 注意事项

1. 配置服务是一个单例，在整个应用中共享一个实例
2. 修改设置后会自动保存到localStorage
3. 主题设置会立即应用，无需刷新页面
4. 导出的配置文件默认包含所有设置和统计数据
5. 导入配置后可能需要刷新页面以应用所有设置
