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
          <svg class="sun-icon" viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
          </svg>
          <svg class="moon-icon" viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M12 3c.46 0 .93.04 1.4.14-2.76.92-4.78 3.55-4.78 6.66 0 3.86 3.09 7 6.95 7 .32 0 .64-.02.95-.07-2.12 1.72-4.85 2.77-7.52 2.77C4.48 20.5 2 18.02 2 14c0-4.01 3.01-7.67 6.98-7.99C9.46 3.30 10.69 3 12 3z"/>
          </svg>
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
          <div class="page-home__version">v2.0.0</div>
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
        <RouterLink to="/break" class="page-home__button page-home__button--break">绯想击破</RouterLink>
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
              <svg viewBox="0 0 24 24" width="18" height="18" style="vertical-align: middle; margin-right: 4px;">
                <path fill="currentColor"
                  d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z">
                </path>
              </svg>
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
            </div>
          </div>

          <!-- 工具 -->
          <div class="page-home__footer-column">
            <h3 class="page-home__footer-title">工具</h3>
            <div class="page-home__footer-links">
              <RouterLink to="/break" class="page-home__footer-link">绯想击破 »</RouterLink>
            </div>
          </div>

          <!-- 社区 -->
          <div class="page-home__footer-column">
            <h3 class="page-home__footer-title">社区</h3>
            <div class="page-home__footer-links">
              <a href="https://github.com/yokuminto/elyxira" target="_blank" rel="noopener noreferrer"
                class="page-home__footer-link">GitHub »</a>
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
import configService from '@/services/config-service'

const isDarkTheme = computed(() => configService.getUiSettings().darkMode)

const toggleTheme = () => {
  configService.toggleDarkMode()
  // 视觉切换动画
  const themeToggle = document.querySelector('.page-home__navbar-theme-toggle') as HTMLElement
  if (themeToggle) themeToggle.classList.toggle('dark', isDarkTheme.value)
}
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
  { text: '题库', link: '/library' }
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

  // 初始化主题 toggle 视觉状态
  const themeToggle = document.querySelector('.page-home__navbar-theme-toggle') as HTMLElement
  if (themeToggle) themeToggle.classList.toggle('dark', isDarkTheme.value)

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
