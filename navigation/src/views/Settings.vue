<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import SidebarNavigation from '../components/SidebarNavigation.vue'

const router = useRouter()
const authStore = useAuthStore()

// 设置选项
const settings = ref([
  {
    id: 1,
    title: '账户设置',
    icon: 'uil-user',
    description: '管理您的账户信息',
    route: '/profile'
  },
  {
    id: 2,
    title: '隐私设置',
    icon: 'uil-shield',
    description: '管理隐私和安全设置',
    route: '/privacy'
  },
  {
    id: 3,
    title: '通知设置',
    icon: 'uil-bell',
    description: '管理通知偏好',
    route: '/notifications'
  },
  {
    id: 4,
    title: '主题设置',
    icon: 'uil-palette',
    description: '自定义界面外观',
    route: '/theme'
  }
])

// 处理退出登录
const handleLogout = async () => {
  try {
    await authStore.signOut()
    router.push('/login')
  } catch (error) {
    console.error('登出失败:', error)
    router.push('/login')
  }
}

// 处理设置项点击
const handleSettingClick = (setting) => {
  // 这里可以添加具体的设置页面导航逻辑
  console.log('点击设置项:', setting.title)
}

onMounted(() => {
  // 页面加载时的初始化逻辑
})
</script>

<template>
  <div class="settings-container">
    <!-- 左侧导航条组件 -->
    <SidebarNavigation />

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 标题区域 - 左对齐 -->
      <div class="settings-header">
        <h1>设置</h1>
        <p>管理您的账户和应用程序</p>
      </div>

      <!-- 用户信息区域 - 放在上面 -->
      <div class="user-info-section">
        <div class="user-avatar-large">
          <img :src="authStore.user?.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMwMDdiZmYiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxMiIgcj0iNCIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE2IDI0QzIwIDI0IDI0IDIyIDI0IDE4SDBDMC4wMDEgMjIgNCAyNCAxNiAyNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg=='" alt="用户头像" />
        </div>
        <div class="user-details">
          <h2>{{ authStore.user?.displayName || authStore.user?.username || '用户' }}</h2>
          <p>{{ authStore.user?.email || '未设置邮箱' }}</p>
        </div>
      </div>

      <!-- 设置选项网格 -->
      <div class="settings-grid">
        <div 
          v-for="setting in settings" 
          :key="setting.id" 
          class="setting-card"
          @click="handleSettingClick(setting)"
        >
          <div class="setting-icon">
            <i :class="['uil', setting.icon]"></i>
          </div>
          <div class="setting-content">
            <h3>{{ setting.title }}</h3>
            <p>{{ setting.description }}</p>
          </div>
          <div class="setting-arrow">
            <i class="uil uil-angle-right"></i>
          </div>
        </div>
      </div>

      <!-- 退出登录按钮 - 放在右下角 -->
      <div class="logout-section">
        <button class="logout-btn" @click="handleLogout">
          <i class="uil uil-sign-out-alt"></i>
          退出登录
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-container {
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f5;
}



.main-content {
  margin-left: 60px;
  padding: 40px;
  background-color: white;
  min-height: 100vh;
  width: calc(100% - 60px);
}

.settings-header {
  text-align: left;
  margin-bottom: 30px;
}

.settings-header h1 {
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 8px;
}

.settings-header p {
  color: #7f8c8d;
  font-size: 1.1rem;
  margin: 0;
}

.user-info-section {
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.user-avatar-large {
  width: 80px;
  height: 80px;
  margin-right: 20px;
}

.user-avatar-large img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #3498db;
}

.user-details h2 {
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 1.5rem;
}

.user-details p {
  color: #7f8c8d;
  margin: 0;
  font-size: 1rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.setting-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.setting-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  background: white;
}

.setting-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.setting-icon i {
  font-size: 24px;
  color: white;
}

.setting-content {
  flex: 1;
}

.setting-content h3 {
  color: #2c3e50;
  margin-bottom: 5px;
  font-size: 1.2rem;
}

.setting-content p {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0;
}

.setting-arrow i {
  font-size: 20px;
  color: #bdc3c7;
}

.logout-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 40px;
}

.logout-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  width: auto;
  min-width: 120px;
}

.logout-btn:hover {
  background: #c0392b;
  transform: translateY(-1px);
}

.logout-btn:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 20px;
    margin-left: 0;
    width: 100%;
  }
  
  .sidebar {
    display: none;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .user-info {
    flex-direction: column;
    text-align: center;
  }
  
  .user-avatar {
    margin-right: 0;
    margin-bottom: 15px;
  }
}
</style>