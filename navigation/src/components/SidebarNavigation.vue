<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../supabase.js'
import ProfileEditCard from './ProfileEditCard.vue'

const router = useRouter()
const authStore = useAuthStore()

// 导航分类数据
const categories = ref([
  { id: 1, name: '首页', icon: 'uil-home', route: '/' },
  { id: 2, name: '天气', icon: 'uil-sun', route: '/weather' },
  { id: 3, name: '时钟', icon: 'uil-clock', route: '/clock' },
  { id: 4, name: '发现', icon: 'uil-compass', route: '/discover' },
  { id: 5, name: '收藏', icon: 'uil-star', route: '/favorites' },
  { id: 6, name: '历史', icon: 'uil-history', route: '/history' },
  { id: 7, name: '下载', icon: 'uil-download-alt', route: '/downloads' }
])

// 用户头像
const userAvatar = ref('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMwMDdiZmYiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxMiIgcj0iNCIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE2IDI0QzIwIDI0IDI0IDIyIDI0IDE4SDBDMC4wMDEgMjIgNCAyNCAxNiAyNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==')

// 控制个人资料卡片显示
const showProfileCard = ref(false)

// 加载用户头像
const loadUserAvatar = async () => {
  if (authStore.user?.id) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('avatar_url')
        .eq('id', authStore.user.id)
        .single()
      
      if (!error && data?.avatar_url) {
        userAvatar.value = data.avatar_url
      }
    } catch (error) {
      console.error('加载用户头像失败:', error)
    }
  }
}

// 监听个人资料卡片关闭，重新加载头像
watch(showProfileCard, (newVal) => {
  if (!newVal) {
    // 卡片关闭后重新加载头像
    setTimeout(() => {
      loadUserAvatar()
    }, 500)
  }
})

// 初始化时加载头像
onMounted(() => {
  loadUserAvatar()
})

// 打开个人资料卡片
const openProfileCard = () => {
  showProfileCard.value = true
}

// 打开设置页面
const openSettings = () => {
  router.push('/settings')
}

// 导航到指定页面
const navigateTo = (route) => {
  router.push(route)
}
</script>

<template>
  <!-- 左侧导航条 -->
  <nav class="sidebar">
    <!-- 分类区域 - 垂直居中 -->
    <div class="categories-section">
      <div 
        v-for="category in categories" 
        :key="category.id" 
        class="nav-item"
        @click="navigateTo(category.route)"
      >
        <i :class="['uil', category.icon]"></i>
        <span class="tooltip">{{ category.name }}</span>
      </div>
    </div>

    <!-- 底部区域 -->
    <div class="bottom-section">
      <!-- 用户头像 -->
      <div class="nav-item avatar-item" @click="openProfileCard">
        <div class="avatar-container">
          <img :src="userAvatar" alt="用户头像" class="avatar" />
        </div>
        <span class="tooltip">个人资料</span>
      </div>

      <!-- 设置图标 -->
      <div class="nav-item" @click="openSettings">
        <i class="uil uil-cog"></i>
        <span class="tooltip">设置</span>
      </div>
    </div>
  </nav>

  <!-- 个人资料编辑卡片 -->
  <ProfileEditCard v-model:show="showProfileCard" />
</template>

<style scoped>
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

.nav-item:hover .tooltip {
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
</style>