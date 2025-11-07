<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 导入6张壁纸
import bc1 from '../assets/background/bc1.jpeg'
import bc2 from '../assets/background/bc2.jpeg'
import bc3 from '../assets/background/bc3.jpeg'
import bc4 from '../assets/background/bc4.jpeg'
import bc5 from '../assets/background/bc5.jpg'
import bc6 from '../assets/background/bc6.jpeg'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show'])

const showThemeCard = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

// 壁纸列表
const wallpapers = [
  { id: 1, name: '壁纸1', url: bc1 },
  { id: 2, name: '壁纸2', url: bc2 },
  { id: 3, name: '壁纸3', url: bc3 },
  { id: 4, name: '壁纸4', url: bc4 },
  { id: 5, name: '壁纸5', url: bc5 },
  { id: 6, name: '壁纸6', url: bc6 }
]

// 当前选中的壁纸
const selectedWallpaper = ref(null)

// 加载保存的壁纸
const loadSavedWallpaper = () => {
  const saved = localStorage.getItem('selectedWallpaper')
  if (saved) {
    try {
      const wallpaper = JSON.parse(saved)
      selectedWallpaper.value = wallpaper.id
    } catch (e) {
      console.error('加载壁纸失败:', e)
    }
  }
}

// 选择壁纸
const selectWallpaper = (wallpaper) => {
  selectedWallpaper.value = wallpaper.id
  // 保存到localStorage
  localStorage.setItem('selectedWallpaper', JSON.stringify({
    id: wallpaper.id,
    url: wallpaper.url,
    name: wallpaper.name
  }))
  
  // 触发自定义事件，通知父组件更新
  window.dispatchEvent(new CustomEvent('wallpaper-changed', {
    detail: wallpaper
  }))
}

// 关闭卡片
const closeThemeCard = () => {
  showThemeCard.value = false
}

// 处理自定义壁纸按钮点击（功能暂未实现）
const handleCustomWallpaper = () => {
  // TODO: 实现自定义壁纸功能
  console.log('自定义壁纸功能待实现')
}

// ESC键监听
const handleKeydown = (event) => {
  if (event.key === 'Escape' && showThemeCard.value) {
    closeThemeCard()
  }
}

onMounted(() => {
  loadSavedWallpaper()
  window.addEventListener('keydown', handleKeydown)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <!-- 主题设置卡片 -->
  <div v-if="showThemeCard" class="theme-overlay" @click="closeThemeCard">
    <div class="theme-card" @click.stop>
      <!-- 卡片头部 -->
      <div class="theme-header">
        <h2>主题设置</h2>
        <button class="close-btn" @click="closeThemeCard">
          <i class="uil uil-times"></i>
        </button>
      </div>

      <!-- 壁纸选择区域 -->
      <div class="wallpaper-section">
        <h3 class="section-title">选择壁纸</h3>
        <div class="wallpaper-grid">
          <div
            v-for="wallpaper in wallpapers"
            :key="wallpaper.id"
            class="wallpaper-item"
            :class="{ selected: selectedWallpaper === wallpaper.id }"
            @click="selectWallpaper(wallpaper)"
          >
            <img :src="wallpaper.url" :alt="wallpaper.name" class="wallpaper-image" />
            <div class="wallpaper-overlay">
              <i class="uil uil-check-circle"></i>
            </div>
          </div>
        </div>
        
        <!-- 自定义按钮 -->
        <div class="custom-button-section">
          <button class="custom-wallpaper-btn" @click="handleCustomWallpaper">
            <i class="uil uil-image-upload"></i>
            <span>自定义壁纸</span>
          </button>
        </div>
      </div>

      <!-- 提示信息 -->
      <div class="theme-hint">
        <i class="uil uil-info-circle"></i>
        <span>选择的壁纸将应用到首页和分类页面</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.theme-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.theme-card {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.theme-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.theme-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #7f8c8d;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.close-btn:hover {
  background-color: #f5f5f5;
  color: #2c3e50;
}

.wallpaper-section {
  padding: 24px;
}

.section-title {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
}

.wallpaper-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 16px;
}

.wallpaper-item {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.3s ease;
}

.wallpaper-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.wallpaper-item.selected {
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.3);
}

.wallpaper-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.wallpaper-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.wallpaper-item:hover .wallpaper-overlay {
  opacity: 1;
}

.wallpaper-item.selected .wallpaper-overlay {
  opacity: 1;
  background: rgba(52, 152, 219, 0.3);
}

.wallpaper-overlay i {
  color: white;
  font-size: 32px;
}

.wallpaper-item.selected .wallpaper-overlay i {
  color: #3498db;
}

.custom-button-section {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.custom-wallpaper-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.custom-wallpaper-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.custom-wallpaper-btn:active {
  transform: translateY(0);
}

.custom-wallpaper-btn i {
  font-size: 18px;
}

.theme-hint {
  padding: 16px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6c757d;
  font-size: 14px;
}

.theme-hint i {
  font-size: 16px;
  color: #3498db;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .theme-card {
    width: 95%;
    margin: 20px;
  }
  
  .theme-header {
    padding: 16px 20px;
  }
  
  .wallpaper-section {
    padding: 20px;
  }
  
  .wallpaper-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 12px;
  }
}
</style>
