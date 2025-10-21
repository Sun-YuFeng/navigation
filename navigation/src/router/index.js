import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import LoginView from '../views/Login.vue'
import SettingsView from '../views/Settings.vue'
import WeatherView from '../views/Weather.vue'
import ClockView from '../views/Clock.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/weather',
      name: 'weather',
      component: WeatherView,
      meta: { requiresAuth: true }
    },
    {
      path: '/clock',
      name: 'clock',
      component: ClockView,
      meta: { requiresAuth: true }
    },
  ],
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查本地存储中的认证状态
  const currentUser = localStorage.getItem('currentUser')
  const isAuthenticated = !!currentUser

  // 检查当前路径是否需要认证
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
