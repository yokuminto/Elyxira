# Elyxira 
![版本](https://img.shields.io/badge/版本-1.0.0-blue)
![MIT](https://img.shields.io/badge/协议-MIT-green)
![CC-BY-NC-SA-4.0](https://img.shields.io/badge/协议-CC--BY--NC--SA--4.0-orange)

> 样式美观&开源&在线的题目练习平台，基于html，支持AI解析、自定义题库

## 📋 功能特点

- **智能解析** - 基于AI的个性化学习解析，精准定位薄弱环节
- **笔记系统** - 支持Markdown格式，结合AI助手整理学习要点
- **数据同步** - 支持GitHub远程仓库同步，随时随地访问学习进度
- **离线使用** - 本地存储学习数据，无网络环境也能学习
- **双主题** - 明亮/暗黑模式自由切换，呵护视力健康
- **学习统计** - 详细记录学习情况，正确率和知识点掌握程度
- **错题收藏** - 自动整理易错题目，形成针对性复习计划

## 🚀 快速开始

1. 访问 [Elyxira网站](https://elyxira.github.io) 进入应用
2. 导入题库或选择预设题库开始学习
3. 登录GitHub账号（可选）以启用数据同步功能

## 💻 本地部署

```

# 克隆仓库
git clone https://github.com/yokuminto/elyxira.git

# 进入项目目录
cd elyxira

# 使用任意HTTP服务器运行
# 例如使用Python内置服务器
python -m http.server
```

## 📱 适配设备

| 设备类型 | 支持状态 |
|---------|---------|
| 桌面端 | ✅ Windows/macOS/Linux |
| 移动端 | ✅ iOS/Android |
| 平板设备 | ✅ 全面支持 |

## 🔧 自定义配置

Elyxira支持多种自定义配置，包括：

- AI接口设置 (支持多种LLM模型)
- GitHub同步配置
- 学习偏好设置
- 界面主题定制
- 学习提醒和计划
- 数据导入导出格式

## 📚 数据格式

Elyxira目前只支持单选题类型的题目；
支持两种主要的数据导入格式：

### JSON格式（标准格式）
```json
{
  "chapters": [
    {
      "title": "章节名称",
      "questions": [
        {
          "question": "题目内容",
          "options": ["选项A", "选项B", "选项C", "选项D"],
          "answer": "B",
          "notes": "解析内容"
        }
      ]
    }
  ]
}
```

### TXT格式（简易格式）
支持简单的纯文本题库导入，格式示例：
```
一、三基知识总论 (格式："序号、章节名"，可选)
一、单选题xxxx（使用章节名时必须在后方换行增加格式："序号、单选题"，后面可接乱码，不影响）
1. 题目内容
A. 选项A
B. 选项B
C. 选项C
D. 选项D
E. 选项E
答案: B（也支持"标准答案"、"正确答案"）

2. 下一道题目
...
```

## 🔄 数据同步

1. 在设置中配置GitHub仓库信息
2. 授权访问令牌 (Personal Access Token)
3. 设置同步路径和分支
4. 启用自动同步或手动同步

## 🤝 贡献指南

欢迎提交PR或Issues帮助改进Elyxira！我们特别欢迎以下贡献：

- 题库资源扩充和优化
- UI/UX改进建议
- 新功能开发
- 文档翻译
- 错误修复

## 📜 开源协议

本项目采用双协议授权：

- 代码部分采用 [MIT 协议](LICENSE-MIT.md)
- 内容部分采用 [知识共享署名-非商业性使用-相同方式共享 4.0 国际许可协议](LICENSE-CC.md)

这意味着：
- 您可以自由使用、修改和分享本项目的代码，但必须保留原始版权声明
- 对于内容部分，您可以分享和改编，但必须提供适当署名，不得用于商业目的，且必须以相同条款共享您的贡献

## 🙏 致谢

- 感谢所有为医学教育做出贡献的教育工作者
- 感谢开源社区提供的技术支持
- 感谢参与测试和反馈的社群

---

<div align="center">
  <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh">
    <img src="https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-nc-sa.svg" width="120" alt="CC BY-NC-SA 4.0">
  </a>
  <p>© 2025 Elyxira - 开源医学学习平台</p>
</div>
