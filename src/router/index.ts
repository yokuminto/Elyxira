// src/router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const loadView = (name: string) => {
  const viewName = `${name.toLowerCase().replace(/\s+/g, '-')}`
  return () =>
    import(`@/pages/${viewName}/page-${viewName}.vue`).catch((error) => {
      console.warn(`[Router] ${name} view load failed:`, error)

      // 保存错误信息到localStorage，以便错误页面可以获取
      const errorInfo = {
        message: `加载页面 "${name}" 失败`,
        details: error.message || error.toString(),
      }
      localStorage.setItem('lastRouteError', JSON.stringify(errorInfo))

      // 返回错误页面 - 确保使用正确的路径
      return import('@/pages/error/page-error.vue')
    })
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: loadView('home'),
    meta: { title: '首页' },
  },
  {
    path: '/library',
    name: 'library',
    component: loadView('library'),
    meta: { title: '题库' },
  },
  {
    path: '/notes',
    name: 'notes',
    component: loadView('notes'),
    meta: { title: '笔记' },
  },
  {
    path: '/about',
    name: 'about',
    component: loadView('about'),
    meta: { title: '关于' },
  },
  {
    path: '/ai-assistant',
    name: 'ai-assistant',
    component: loadView('ai-assistant'),
    meta: { title: 'AI助手' },
  },
  {
    path: '/flashcards',
    name: 'flashcards',
    component: loadView('flashcards'),
    meta: { title: '闪卡' },
  },
  {
    path: '/quiz',
    name: 'quiz',
    component: loadView('quiz'),
    meta: { title: '测验' },
  },
  {
    path: '/error',
    name: 'error',
    component: () => import('@/pages/error/page-error.vue'),
    meta: { title: '错误页面' },
    props: (route) => ({
      errorMessage: route.query.message,
      errorDetails: route.query.details,
    }),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} - Elyxira` : 'Elyxira - 开源学习平台'
})

export default router
