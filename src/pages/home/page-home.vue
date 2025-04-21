<template>
  <div class="page-home">
    <!-- 装饰元素 -->
    <div class="page-home__decorations">
      <div class="page-home__decoration page-home__decoration--1">✨</div>
      <div class="page-home__decoration page-home__decoration--2">✨</div>
    </div>

    <!-- 导航栏 -->
    <header class="page-home__navbar">
      <!-- 左侧 Logo 文字 -->
      <div class="page-home__navbar-title">
        <RouterLink to="/">
          <span class="page-home__navbar-logo-text">Elyxira</span>
        </RouterLink>
      </div>

      <!-- 中间搜索框 -->
      <div class="page-home__navbar-search">
        <svg class="page-home__navbar-search-icon" viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor"
            d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z">
          </path>
        </svg>
        <input type="text" class="page-home__navbar-search-input" placeholder="搜索">
        <div class="page-home__navbar-search-shortcut">Ctrl K</div>
      </div>

      <!-- 右侧菜单 -->
      <div class="page-home__navbar-menu">
        <RouterLink v-for="item in navItems" :key="item.text" :to="item.link" class="page-home__navbar-menu-item">
          {{ item.text }}
        </RouterLink>
        <div class="page-home__navbar-theme-toggle" @click="toggleTheme">
          <i class="sun-icon fas fa-sun"></i>
          <i class="moon-icon fas fa-moon"></i>
        </div>
        <a href="https://github.com/yokuminto/elyxira" target="_blank" class="page-home__navbar-github-icon">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path fill="currentColor"
              d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z">
            </path>
          </svg>
        </a>
      </div>
    </header>

    <div class="page-home__container">
      <!-- Logo区域 -->
      <div class="page-home__logo">
        <h1 class="page-home__logo-text" data-text="Elyxira">Elyxira
          <div class="page-home__version">v0.1.0</div>
        </h1>
        <p class="page-home__tagline">开源学习与知识管理平台，助力临床技能提升与医考备考</p>
      </div>

      <!-- 应用展示区域 -->
      <div class="page-home__showcase">
        <div class="page-home__showcase-item" v-for="(image, index) in showcaseImages" :key="index">
          <img :src="image.src" :alt="image.alt" />
        </div>
      </div>

      <!-- 按钮区域 -->
      <div class="page-home__actions">
        <RouterLink to="/library" class="page-home__button page-home__button--library">浏览题库</RouterLink>
        <RouterLink to="/notes" class="page-home__button page-home__button--notes">查看笔记</RouterLink>
      </div>

      <!-- 核心功能区域 -->
      <h2 class="page-home__section-title">核心功能</h2>
      <div class="page-home__features">
        <div class="page-home__feature" v-for="(feature, index) in features" :key="index">
          <div class="page-home__feature-icon">{{ feature.icon }}</div>
          <h3 class="page-home__feature-title">{{ feature.title }}</h3>
          <p class="page-home__feature-description">{{ feature.description }}</p>
        </div>
      </div>

      <!-- 关于区域 -->
      <h2 class="page-home__section-title">关于 Elyxira</h2>
      <div class="page-home__about">
        <div class="page-home__about-content">
          <p>Elyxira 是一个专为自学者、学生和教育工作者设计的开源学习平台，目的是提供一个简单易用的工具，帮助人们更高效地学习和复习。</p>
          <p>不同于传统的学习软件，Elyxira 注重隐私保护和数据控制，你可以选择将数据保存在本地，或者同步到自己的GitHub仓库，而不是依赖中心化服务器。</p>
          <p>该项目秉承开源精神，欢迎所有人参与贡献，一起打造更好的学习体验。</p>
        </div>
        <div class="page-home__github">
          <a href="https://github.com/yokuminto/elyxira" target="_blank" rel="noopener noreferrer"
            class="page-home__github-link">
            <i class="fab fa-github"></i>
            GitHub 项目
          </a>
          <div class="page-home__github-stats">
            <div class="page-home__stat">
              <span class="page-home__stat-value">MIT</span>
              <span class="page-home__stat-label">开源协议</span>
            </div>
            <div class="page-home__stat">
              <span class="page-home__stat-value">Vue 3</span>
              <span class="page-home__stat-label">技术栈</span>
            </div>
            <div class="page-home__stat">
              <span class="page-home__stat-value">TypeScript</span>
              <span class="page-home__stat-label">开发语言</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 品牌支持区域 -->
      <h2 class="page-home__section-title">感谢支持</h2>
      <div class="page-home__brand">
        <a href="https://thfmu.com/" target="_blank" rel="noopener noreferrer" title="东方医学">
          <img :src="themedLogo" width="180" alt="THMED" class="page-home__brand-logo" />
        </a>
        <p class="page-home__brand-text">欢迎来到东方医学(THMED)！</p>
        <p class="page-home__brand-description" v-html="brandDescription"></p>
      </div>
    </div>
    <!-- 简洁页脚组件 -->
    <footer class="page-home__footer">
      <div class="page-home__footer-container">
        <div class="page-home__footer-columns">
          <!-- 学习 -->
          <div class="page-home__footer-column">
            <h3 class="page-home__footer-title">学习</h3>
            <div class="page-home__footer-links">
              <RouterLink to="/library" class="page-home__footer-link">题库 »</RouterLink>
              <RouterLink to="/notes" class="page-home__footer-link">笔记 »</RouterLink>
            </div>
          </div>

          <!-- 工具 -->
          <div class="page-home__footer-column">
            <h3 class="page-home__footer-title">工具</h3>
            <div class="page-home__footer-links">
              <RouterLink to="/ai-assistant" class="page-home__footer-link">题库录入（未完工） »</RouterLink>
              <RouterLink to="/flashcards" class="page-home__footer-link">自动纠错（未完工） »</RouterLink>
            </div>
          </div>

          <!-- 社区 -->
          <div class="page-home__footer-column">
            <h3 class="page-home__footer-title">社区</h3>
            <div class="page-home__footer-links">
              <a href="https://github.com/yokuminto/elyxira" target="_blank" rel="noopener noreferrer"
                class="page-home__footer-link">GitHub »</a>
              <RouterLink to="/about" class="page-home__footer-link">关于我们 »</RouterLink>
            </div>
          </div>
        </div>

        <!-- 版权信息 -->
        <div class="page-home__footer-copyright">
          &copy; 2025 Elyxira. All Rights Reserved.
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { onMounted, ref, computed } from 'vue'
// 导入showToast函数
import { showToast } from '../../utils/toast'

// Toast测试函数
const showInfoToast = () => {
  showToast('这是一条信息提示', 'info', 3000)
}

const showSuccessToast = () => {
  showToast('操作成功完成！', 'success', 3000)
}

const showWarningToast = () => {
  showToast('请注意，这是一个警告提示', 'warning', 3000)
}

const showErrorToast = () => {
  showToast('出错了，请重试', 'error', 3000)
}

const showMultipleToasts = () => {
  // 连续显示多个不同类型的Toast
  showToast('第一条消息：信息提示', 'info', 3000)
  setTimeout(() => showToast('第二条消息：成功提示', 'success', 3000), 500)
  setTimeout(() => showToast('第三条消息：警告提示', 'warning', 3000), 1000)
  setTimeout(() => showToast('第四条消息：错误提示', 'error', 3000), 1500)
}

// Define the toggleTheme function
const toggleTheme = () => {
  const themeToggle = document.querySelector('.page-home__navbar-theme-toggle') as HTMLElement
  if (themeToggle) {
    themeToggle.classList.toggle('dark')
    const isDark = themeToggle.classList.contains('dark')

    if (isDark) {
      document.body.classList.add('dark-theme')
      localStorage.setItem('theme', 'dark')
    } else {
      document.body.classList.remove('dark-theme')
      localStorage.setItem('theme', 'light')
    }

    // 同步所有主题状态
    syncThemeState()
  }
}

// 同步主题状态的函数
const syncThemeState = () => {
  const isDark = document.body.classList.contains('dark-theme')
  isDarkTheme.value = isDark

  // 更新导航栏样式
  const navbar = document.querySelector('.page-home__navbar') as HTMLElement
  if (navbar) {
    if (isDark) {
      navbar.classList.add('dark')
    } else {
      navbar.classList.remove('dark')
    }

    // 如果已经滚动，保持scrolled类
    if (window.scrollY > 10) {
      navbar.classList.add('page-home__navbar--scrolled')
    }
  }
}

// 添加logo计算属性
const isDarkTheme = ref(false)
const themedLogo = computed(() => {
  // 直接返回 public 目录下的路径
  return isDarkTheme.value
    ? '/images/thmed-white.png'
    : '/images/thmed-red.png'
})

const brandDescription = '东方医学致力于医学病案交流、循证体系建构与文化传播<br />提供东方世界观作品与医学专业课的交流平台<br />我们希望您在这里度过一段美好的时光～'

// 导航栏菜单项
const navItems = ref([
  { text: '首页', link: '/' },
  { text: '题库', link: '/library' },
  { text: '笔记', link: '/notes' },
  { text: '关于', link: '/about' }
])

const showcaseImages = ref([
  {
    src: '/images/screenshot1.png', // 更新路径
    alt: 'Elyxira 医学题库截图'
  },
  {
    src: '/images/screenshot2.png', // 更新路径
    alt: 'Elyxira AI分析截图'
  }
])

const features = ref([
  {
    icon: '📚',
    title: '题库系统',
    description: '支持多种题型，可导入、导出题库，随机练习、顺序练习、错题重做等模式'
  },
  {
    icon: '🧠',
    title: '笔记本',
    description: '记录学习笔记，支持基本的文本格式，快速查找，分类整理，随时随地复习'
  },
  {
    icon: '💉',
    title: '多端同步',
    description: '支持本地存储，在线Github仓库同步，多设备访问，数据安全备份无忧'
  },
  {
    icon: '🤖',
    title: 'AI助手',
    description: '集成AI功能，自动生成学习笔记，智能分析题目，提供个性化学习建议'
  }
])

// 增强过渡效果
onMounted(() => {
  // 页面淡入效果
  document.body.style.opacity = '0'
  document.body.style.transition = 'opacity 0.8s ease'
  setTimeout(() => {
    document.body.style.opacity = '1'
  }, 100)

  // 初始化主题
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDarkTheme.value = true
    const themeToggle = document.querySelector('.page-home__navbar-theme-toggle') as HTMLElement
    if (themeToggle) {
      themeToggle.classList.add('dark')
      document.body.classList.add('dark-theme')
      // 确保导航栏也添加dark类
      const navbar = document.querySelector('.page-home__navbar') as HTMLElement
      if (navbar) {
        navbar.classList.add('dark')
      }
    }
  }

  // 初始化后同步所有主题状态
  syncThemeState()

  // 导航栏滚动效果
  const navbar = document.querySelector('.page-home__navbar') as HTMLElement
  let lastScrollY = window.scrollY
  let ticking = false

  const handleScroll = () => {
    lastScrollY = window.scrollY

    if (!ticking) {
      window.requestAnimationFrame(() => {
        const isDark = document.body.classList.contains('dark-theme')

        if (lastScrollY > 10) {
          navbar.classList.add('page-home__navbar--scrolled')
          // 保持与当前主题一致
          if (isDark) {
            navbar.classList.add('dark')
          }
        } else {
          navbar.classList.remove('page-home__navbar--scrolled')
          // 根据主题决定是否有dark类
          if (!isDark) {
            navbar.classList.remove('dark')
          }
        }

        ticking = false
      })

      ticking = true
    }
  }

  // 初始运行一次检查当前位置
  handleScroll()

  // 监听滚动事件
  window.addEventListener('scroll', handleScroll, { passive: true })

  // 平滑滚动效果
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (this: HTMLAnchorElement, e: Event) {
      e.preventDefault()
      const targetId = this.getAttribute('href')
      // 检查 targetId 是否有效且不包含斜杠（即不是路由链接）
      if (!targetId || targetId === '#' || targetId.includes('/')) return

      try {
        const targetElement = document.querySelector(targetId)
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' })
        }
      } catch (error) {
        // 捕获无效选择器错误，以防万一
        console.error(`平滑滚动错误: 无效的选择器 '${targetId}'`, error)
      }
    })
  })

  // 预加载图片并直接显示
  document.querySelectorAll('.page-home__showcase-item img, .page-home__brand-logo').forEach((img) => {
    const imgElement = img as HTMLImageElement

    // 检查图片加载状态
    if (imgElement.complete) {
      console.log('图片已加载完成:', imgElement.src)
    } else {
      imgElement.onload = () => console.log('图片加载成功:', imgElement.src)
      imgElement.onerror = (e) => console.error('图片加载失败:', imgElement.src, e)
    }
  })

  // 搜索框交互
  const searchInput = document.querySelector('.page-home__navbar-search-input') as HTMLInputElement
  if (searchInput) {
    searchInput.addEventListener('focus', function () {
      this.placeholder = '搜索文档...'
    })
    searchInput.addEventListener('blur', function () {
      this.placeholder = '搜索'
    })
  }
})
</script>

<style>
@import './page-home.css';
@import '../../styles/variables.css';
/* 移除CDN引用，改用link标签或本地资源 */
</style>
