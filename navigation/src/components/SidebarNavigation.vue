<script setup>
import { ref } from 'vue'

// 导航分类数据
const categories = ref([
  { id: 1, name: '首页', icon: 'uil-home' },
  { id: 2, name: '发现', icon: 'uil-compass' },
  { id: 3, name: '收藏', icon: 'uil-star' },
  { id: 4, name: '历史', icon: 'uil-history' },
  { id: 5, name: '下载', icon: 'uil-download-alt' }
])

// 用户头像（默认使用SVG圆形头像）
const userAvatar = ref('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMwMDdiZmYiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxMiIgcj0iNCIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE2IDI0QzIwIDI0IDI0IDIyIDI0IDE4SDBDMC4wMDEgMjIgNCAyNCAxNiAyNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==')

// 处理头像上传
const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      userAvatar.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
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
      >
        <i :class="['uil', category.icon]"></i>
        <span class="tooltip">{{ category.name }}</span>
      </div>
    </div>

    <!-- 底部区域 -->
    <div class="bottom-section">
      <!-- 用户头像 -->
      <div class="nav-item avatar-item">
        <div class="avatar-container">
          <img :src="userAvatar" alt="用户头像" class="avatar" />
          <input 
            type="file" 
            accept="image/*" 
            @change="handleAvatarUpload" 
            class="avatar-upload"
          />
        </div>
        <span class="tooltip">个人资料</span>
      </div>

      <!-- 设置图标 -->
      <div class="nav-item">
        <i class="uil uil-cog"></i>
        <span class="tooltip">设置</span>
      </div>
    </div>
  </nav>
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

.avatar-upload {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
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