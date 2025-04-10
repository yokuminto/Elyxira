# 命名规则

## 1. 文件命名

- 格式：小写字母 + 连字符（kebab-case）
  - 例如：`page-error.vue`
  - 命名格式：按组件-功能命名

## 2. 样式命名（BEM规范）

BEM 是 "Block（块）-Element（元素）-Modifier（修饰符）" 的缩写，广泛用于 CSS 类命名

### 结构说明：

- **Block（块）**  
  独立的功能模块  
  示例：`.page-error`（表示一个错误页面组件）

- **Element（元素）**  
  块内的子元素，用双下划线 `__` 连接  
  示例：`.page-error__card`（表示错误页面中的卡片）

- **Modifier（修饰符）**  
  块或元素的变体，用双横线 `--` 连接  
  示例：`.page-error--dark`（表示深色模式的错误页面）

# 操作建议

- 样式命名：使用 BEM 规范
- 命名规范：使用小写字母 + 连字符（kebab-case）
- 命名顺序：组件名 > 组件内元素 > 组件内元素的状态
- 命名长度：尽量保持简短，避免过长

- 避免多余的无用css样式

# CSS变量使用指南

项目使用全局CSS变量统一样式，简化维护。

## 引入变量

1. **HTML中引入**

```html
<link rel="stylesheet" href="/src/styles/variables.css" />
```

2. **CSS文件中引入**

```css
@import '../styles/variables.css';
```

3. **使用变量**

```css
.my-element {
  background-color: var(--color-primary);
  color: var(--text-main);
}
```

## 变量分类

### 颜色系统 (Color System)

#### 基础颜色

- **Cyan**: `--color-cyan-very-light`, `--color-cyan-light`, `--color-cyan`, `--color-cyan-dark`, `--color-cyan-very-dark`
- **Blue**: `--color-blue-very-light`, `--color-blue-light`, `--color-blue`, `--color-blue-dark`, `--color-blue-very-dark`
- **Purple**: `--color-purple-very-light`, `--color-purple-light`, `--color-purple`, `--color-purple-dark`, `--color-purple-very-dark`
- **Gray**: `--color-gray-very-light`, `--color-gray-light`, `--color-gray`, `--color-gray-dark`, `--color-gray-very-dark`
- **White & Black**: `--color-white`, `--color-white-transparent`, `--color-black`, `--color-black-transparent`
- **Transparent**: `--color-transparent`

#### 功能色

- **Primary**: `--color-primary-light`, `--color-primary`
- **Secondary**: `--color-secondary`
- **Success**: `--color-success`
- **Warning**: `--color-warning`
- **Tertiary**: `--color-tertiary`
- **Danger**: `--color-danger`

#### 主色调

- `--c-blue`, `--c-indigo`, `--c-green`, `--c-red`, `--c-yellow`, `--c-sky`, `--c-pink`, `--c-purple`, `--c-orange`, `--c-brown`, `--c-gray`, `--c-cyan`

#### 文本颜色

- `--t-dark`, `--t-medium`, `--t-light`, `--t-accent`

#### 背景颜色

- `--bg-blue`, `--bg-indigo`, `--bg-green`, `--bg-red`, `--bg-yellow`, `--bg-sky`, `--bg-pink`, `--bg-purple`, `--bg-orange`, `--bg-brown`, `--bg-gray`, `--bg-cyan`
- **基础背景色**: `--bg-white`, `--bg-white-light`, `--bg-white-transparent`, `--bg-black-transparent`
- **透明背景色**: `--bg-gray-transparent`
- **功能背景色**: `--bg-knowledge`, `--bg-quiz`, `--bg-anime`, `--bg-medical`, `--bg-danger`, `--bg-success`

#### 边框颜色

- `--border`, `--border-gray-transparent`

#### 文字颜色

- `--text`, `--text-light`, `--text-main`, `--text-secondary`, `--text-heading`

#### 交互状态

- `--hover-primary`, `--hover-tertiary`, `--hover-danger`

### 渐变效果 (Gradients)

- `--gradient-primary`, `--gradient-card`, `--gradient-logo`

### 布局相关 (Layout Related)

- **圆角**: `--radius-sm`, `--radius`, `--radius-lg`, `--radius-full`
- **阴影**: `--shadow-light`, `--shadow`, `--shadow-dark`, `--shadow-very-dark`
- **卡片颜色**: `--card`, `--card-dark`

### 动画相关 (Animation Related)

- `--transition-duration`, `--transition-timing`, `--transition-all`

### 主题切换 (Theme Toggle)

- `--theme-toggle__bg-white`, `--theme-toggle__border`, `--theme-toggle__icon-sun`, `--theme-toggle__icon-moon`, `--theme-toggle__bg-black`

### 导航栏 (Navbar)

- `--navbar__bg`, `--navbar__bg-search`, `--navbar__border`, `--navbar__height`

### 字体 (Font)

- `--family-font`

## 维护原则

- 保持分类结构
- 使用有意义的命名
- 添加注释说明用途
- 确保亮色和暗色主题都有对应变量

# 模态框样式指南 (modal.css)

项目中的所有模态框组件共用 `src/styles/modal.css` 中定义的样式，基于 BEM 命名规范。

## 核心命名规则

- 模态框基础类：`.modal`
- 模态框元素：`.modal__element`（如：`.modal__header`，`.modal__footer`）
- 模态框修饰符：`.modal--modifier`（如：`.modal--active`，`.modal--large`）

## 模态框基础结构

```html
<div class="modal modal--active">
  <div class="modal__content">
    <div class="modal__header">
      <h2 class="modal__title">标题</h2>
      <button class="modal__close">&times;</button>
    </div>
    <div class="modal__body">
      <!-- 内容区域 -->
    </div>
    <div class="modal__footer">
      <button class="modal__button modal__button--secondary">取消</button>
      <button class="modal__button modal__button--primary">确认</button>
    </div>
  </div>
</div>
```

## 重要样式类列表

### 1. 基础类

- `.modal` - 模态框容器
- `.modal--active` - 激活状态的模态框
- `.modal__content` - 模态框内容区
- `.modal__header` - 模态框头部
- `.modal__body` - 模态框主体
- `.modal__footer` - 模态框底部

### 2. 内容变体类

- `.modal__content--settings` - 设置模态框内容样式
- `.modal__content--large` - 大尺寸模态框

### 3. 按钮类

- `.modal__button` - 基础按钮样式
- `.modal__button--primary` - 主要按钮
- `.modal__button--secondary` - 次要按钮
- `.modal__button--danger` - 危险操作按钮
- `.modal__button--success` - 成功操作按钮

### 4. 表单元素类

- `.modal__form-group` - 表单组
- `.modal__form-label` - 表单标签
- `.modal__form-input` - 表单输入框
- `.modal__toggle-switch` - 开关

### 5. 设置界面类

- `.modal__settings-tabs` - 设置标签页容器
- `.modal__settings-tab` - 设置标签页
- `.modal__settings-tab--active` - 激活的设置标签页
- `.modal__tab-container` - 标签页内容容器
- `.modal__settings-group` - 设置组
- `.modal__setting-item` - 设置项

## 重要注意事项

1. **禁止内联样式**：所有模态框样式必须定义在 `modal.css` 中，禁止在组件中使用内联 `<style>` 标签
2. **复用现有类**：在创建新模态框组件前，请查看现有类是否满足需求
3. **命名一致性**：新增样式必须遵循 BEM 命名规范和现有的命名前缀
4. **避免冗余**：避免创建与现有功能重复的样式
5. **变量使用**：使用 CSS 变量保持样式的一致性
6. **结构清晰**：模态框组件应保持清晰的 HTML 结构层次

## 示例：创建新的模态框组件

```javascript
<template>
  <div class="modal" :class="{ 'modal--active': isVisible }">
    <div class="modal__content">
      <!-- 使用现有的模态框样式结构 -->
    </div>
  </div>
</template>

<script setup>
// 无需添加<style>标签，所有样式均在modal.css中定义
</script>
```

# astrea_tool.py 文件操作工具使用指南

astrea_tool.py 是一个多功能文件操作工具，支持文件的重命名、删除、移动，以及目录内容的查看和文件搜索。

## 基本命令格式

```
python astrea_tool.py <命令> [选项] <参数>
```

## 支持的命令

### 1. 重命名文件

```
python astrea_tool.py rename <源文件路径> <新名称>
```

例如：

- 重命名单个文件：`python astrea_tool.py rename old-file.txt new-file.txt`
- 重命名多个文件（添加前缀）：`python astrea_tool.py rename *.css "prefix-*"`

### 2. 删除文件

```
python astrea_tool.py delete <文件路径>
```

例如：

- 删除单个文件：`python astrea_tool.py delete temp.log`
- 删除多个文件：`python astrea_tool.py delete *.tmp temp/*.bak`

### 3. 移动文件

```
python astrea_tool.py move <源文件路径> <目标路径>
```

例如：

- 移动单个文件：`python astrea_tool.py move report.pdf documents/`
- 移动多个文件：`python astrea_tool.py move *.jpg images/`

### 4. 列出目录内容

```
python astrea_tool.py list <目录路径> [-r]
```

选项：

- `-r`, `--recursive`：递归列出子目录内容

例如：

- 列出当前目录内容：`python astrea_tool.py list .`
- 递归列出指定目录内容：`python astrea_tool.py list -r documents/`

### 5. 搜索文件

```
python astrea_tool.py search <目录路径> <搜索模式> [-r]
```

选项：

- `-r`, `--recursive`：递归搜索子目录

例如：

- 在当前目录搜索：`python astrea_tool.py search . "*.md"`
- 递归搜索代码文件：`python astrea_tool.py search -r src "*.js"`
- 使用正则表达式搜索：`python astrea_tool.py search . "page-[0-9]+\.vue"`

## 特别功能

1. **多文件处理**：所有命令都支持使用通配符一次处理多个文件，如：`*.txt`、`docs/*.pdf`
2. **模式替换**：重命名多文件时可以使用`*`作为替换标记，例如：
   - `python astrea_tool.py rename *.txt "new-*"` 将文件重命名为"new-原文件名"
3. **搜索灵活性**：搜索功能同时支持glob通配符和正则表达式
4. **自动创建目录**：移动文件时，如果目标目录不存在，工具会自动创建

## 兼容旧版接口

为保持向后兼容性，工具仍支持旧版调用方式：

```
python astrea_tool.py <文件路径> <新名称>
```

或使用`--legacy`参数明确指定使用旧接口：

```
python astrea_tool.py --legacy <文件路径> <新名称>
```
