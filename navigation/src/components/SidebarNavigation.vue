<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { supabase } from '../supabase.js'
import ProfileEditCard from './ProfileEditCard.vue'
import CategoryPicker from './CategoryPicker.vue'

const router = useRouter()
const authStore = useAuthStore()

// 固定分类数据
const fixedCategories = ref([
  { id: 'home', name: '首页', icon: 'uil-home', route: '/' },
  { id: 'community', name: '社区', icon: 'uil-users-alt', route: '/community' },
  { id: 'media', name: '媒体', icon: 'uil-play-circle', route: '/classify' },
])

// 用户自定义分类
const userCategories = ref([])

// 分类选择器引用
const categoryPickerRef = ref(null)

// 加载用户自定义分类
const loadUserCategories = async () => {
  if (authStore.user?.id) {
    try {
      const { data, error } = await supabase
        .from('user_category_mappings')
        .select(`
          *,
          category_templates (
            id,
            name,
            icon,
            color
          )
        `)
        .eq('user_id', authStore.user.id)
        .order('sort_order')
      
      if (!error && data) {
        userCategories.value = data.map(mapping => ({
          id: mapping.category_templates.id,
          name: mapping.category_templates.name,
          icon: mapping.category_templates.icon,
          color: mapping.category_templates.color,
          route: `/classify/${mapping.category_templates.id}`
        }))
      }
    } catch (error) {
      console.error('加载用户分类失败:', error)
    }
  }
}

// 添加分类的函数
const addCategory = (event) => {
  if (categoryPickerRef.value) {
    // 获取加号按钮的位置
    const buttonRect = event.currentTarget.getBoundingClientRect()
    categoryPickerRef.value.openPicker(buttonRect)
  }
}

// 处理分类添加事件
const handleCategoryAdded = (category) => {
  // 重新加载用户分类
  loadUserCategories()
}

// 初始化时加载用户分类
onMounted(() => {
  loadUserCategories()
})

// 用户头像
const userAvatar = ref('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMwMDdiZmYiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxMiIgcj0iNCIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE2IDI0QzIwIDI0IDI0IDIyIDI0IDE4SDBDMC4wMDEgMjIgNCAyNCAxNiAyNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==')

// 控制个人资料卡片显示
const showProfileCard = ref(false)

// 加载用户头像
const loadUserAvatar = async () => {
  if (authStore.user?.id) {
    try {
      // 优先查询user_profiles表（个人资料页面使用的表）
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('avatar_url')
        .eq('id', authStore.user.id)
        .single()
      
      if (!profileError && profileData?.avatar_url) {
        userAvatar.value = profileData.avatar_url
        console.log('从user_profiles表加载头像成功:')
      } else {
        // 如果user_profiles表没有头像，再查询users表
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('avatar_url')
          .eq('id', authStore.user.id)
          .single()
        
        if (!userError && userData?.avatar_url) {
          userAvatar.value = userData.avatar_url
          console.log('从users表加载头像成功:', userData.avatar_url)
        } else {
          console.log('未找到用户头像，使用默认头像')
        }
      }
    } catch (error) {
      console.error('加载用户头像失败:', error)
      // 如果查询失败，使用默认头像
      userAvatar.value = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzAwN2JmZiIvPgo8Y2lyY2xlIGN4PSIxNiIgY3k9IjEyIiByPSI0IiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTYgMjRDMjAgMjQgMjQgMjIgMjQgMThIMEMwLjAwMSAyMiA0IDI0IDE2IDI0WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+'
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
    <!-- 顶部区域 - 固定分类 -->
    <div class="top-section">
      <div 
        v-for="category in fixedCategories" 
        :key="category.id" 
        class="nav-item"
        @click="navigateTo(category.route)"
      >
        <i :class="['uil', category.icon]"></i>
        <span class="tooltip">{{ category.name }}</span>
      </div>
    </div>

    <!-- 用户自定义分类区域 -->
    <div class="user-categories-section" v-if="userCategories.length > 0">
      <div 
        v-for="category in userCategories" 
        :key="category.id" 
        class="nav-item user-category-item"
        @click="navigateTo(category.route)"
      >
        <i :class="['uil', category.icon]"></i>
        <span class="tooltip">{{ category.name }}</span>
      </div>
    </div>

    <!-- 中间区域 - 添加分类按钮 -->
    <div class="middle-section">
      <div class="nav-item add-category-item" @click="addCategory($event)">
        <div class="add-icon-container">
          <i class="uil uil-plus"></i>
        </div>
        <span class="tooltip">添加分类</span>
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
  
  <!-- 分类选择器 -->
  <CategoryPicker ref="categoryPickerRef" @categoryAdded="handleCategoryAdded" />
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
  justify-content: space-between;
}

.top-section {
  display: flex;
  flex-direction: column;
  gap: 25px;
  margin-top: 20px;
}

.user-categories-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 10px 0;
}

.middle-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 10px 0;
}

.bottom-section {
  display: flex;
  flex-direction: column;
  gap: 25px;
  margin-top: auto;
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

.add-category-item {
  position: relative;
}

.add-icon-container {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #2c3e50;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
}

.add-category-item:hover .add-icon-container {
  background: linear-gradient(135deg, #2980b9 0%, #3498db 100%);
  transform: scale(1.1);
  box-shadow: 0 6px 12px rgba(0,0,0,0.3);
}

.add-category-item .uil-plus {
  font-size: 18px;
  color: white;
  font-weight: bold;
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
  z-index: 1100;
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