import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import LoginView from '../views/Login.vue'
import SettingsView from '../views/Settings.vue'
import CommunityView from '../views/Community.vue'
import ClassifyView from '../views/Classify.vue'
import MarketView from '../views/market.vue'
import EditView from '../views/edit.vue'
import DetailView from '../views/detail.vue'
import PersonCenterView from '../views/personCenter.vue'

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
      path: '/community',
      name: 'community',
      component: CommunityView,
      meta: { requiresAuth: true }
    },
    {
      path: '/market',
      name: 'market',
      component: MarketView,
      meta: { requiresAuth: true }
    },
    {
      path: '/classify/:categoryId?',
      name: 'classify',
      component: ClassifyView,
      meta: { requiresAuth: true },
      props: true
    },
    {
      path: '/edit',
      name: 'edit',
      component: EditView,
      meta: { requiresAuth: true }
    },
    {
      path: '/detail/:id?',
      name: 'detail',
      component: DetailView,
      meta: { requiresAuth: true },
      props: true
    },
    {
      path: '/person-center',
      name: 'person-center',
      component: PersonCenterView,
      meta: { requiresAuth: true }
    },
  ],
})

// 路由守卫
router.beforeEach((to, _, next) => {
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
