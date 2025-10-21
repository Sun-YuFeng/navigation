<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

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
    <!-- 左侧导航条 -->
    <nav class="sidebar">
      <!-- 分类区域 - 垂直居中 -->
      <div class="categories-section">
        <div 
          v-for="category in [
            { id: 1, name: '首页', icon: 'uil-home' },
            { id: 2, name: '发现', icon: 'uil-compass' },
            { id: 3, name: '收藏', icon: 'uil-star' },
            { id: 4, name: '历史', icon: 'uil-history' },
            { id: 5, name: '下载', icon: 'uil-download-alt' }
          ]" 
          :key="category.id" 
          class="nav-item"
          @click="router.push('/')"
        >
          <i :class="['uil', category.icon]"></i>
          <span class="tooltip">{{ category.name }}</span>
        </div>
      </div>

      <!-- 底部区域 -->
      <div class="bottom-section">
        <!-- 用户头像 -->
        <div class="nav-item avatar-item" @click="router.push('/')">
          <div class="avatar-container">
            <img :src="authStore.user?.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMwMDdiZmYiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxMiIgcj0iNCIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE2IDI0QzIwIDI0IDI0IDIyIDI0IDE4SDBDMC4wMDEgMjIgNCAyNCAxNiAyNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg=='" alt="用户头像" class="avatar" />
          </div>
          <span class="tooltip">返回首页</span>
        </div>

        <!-- 设置图标（当前页面高亮） -->
        <div class="nav-item active">
          <i class="uil uil-cog"></i>
          <span class="tooltip">设置</span>
        </div>
      </div>
    </nav>

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

.sidebar {
  width: 60px;
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 1000;
}

.categories-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 25px;
}

.bottom-section {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #bdc3c7;
}

.nav-item:hover {
  background-color: #3498db;
  color: white;
  transform: scale(1.1);
}

.nav-item.active {
  background-color: #3498db;
  color: white;
}

.nav-item:hover .tooltip,
.nav-item.active .tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
}

.nav-item i {
  font-size: 20px;
}

.avatar-item {
  position: relative;
}

.avatar-container {
  position: relative;
  width: 32px;
  height: 32px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #3498db;
  display: block;
  margin: 0 auto;
}

.tooltip {
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%) translateX(-10px);
  background-color: #2c3e50;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.tooltip::before {
  content: '';
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 5px solid transparent;
  border-right-color: #2c3e50;
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