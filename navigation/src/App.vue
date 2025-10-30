<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import SidebarNavigation from './components/SidebarNavigation.vue'

const router = useRouter()
const authStore = useAuthStore()
const isLoading = ref(true)

// 初始化认证状态
onMounted(async () => {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://unicons.iconscout.com/release/v4.0.8/css/line.css'
  document.head.appendChild(link)
  
  // 加载高德地图API
  const amapKey = import.meta.env.VITE_AMAP_API_KEY || 'your_amap_key_here'
  if (amapKey && amapKey !== 'your_amap_key_here') {
    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${amapKey}`
    script.async = true
    script.onload = () => {
      console.log('高德地图API加载成功')
    }
    script.onerror = () => {
      console.warn('高德地图API加载失败')
    }
    document.head.appendChild(script)
  } else {
    console.warn('未配置高德地图API密钥，将使用模拟数据')
  }
  
  // 初始化认证状态
  await authStore.initializeAuth()
  isLoading.value = false
})
</script>

<template>
  <div id="app">
    <!-- 左侧导航条组件（只在登录后显示） -->
    <SidebarNavigation v-if="authStore.user" />
    
    <!-- 主内容区域 -->
    <main class="main-content" :class="{ 'no-sidebar': !authStore.user }">
      <router-view />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

#app {
  min-height: 100vh;
  display: flex;
}

.main-content {
  flex: 1;
  margin-left: 60px; /* 与侧边栏宽度一致 */
  min-height: 100vh;
  transition: margin-left 0.3s ease;
}

.main-content.no-sidebar {
  margin-left: 0;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading p {
  font-size: 18px;
  font-weight: 500;
}
</style>