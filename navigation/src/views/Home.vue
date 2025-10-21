<script setup>
import SidebarNavigation from '../components/SidebarNavigation.vue'
import Clock from '../components/Clock.vue'
import Calendar from '../components/Calendar.vue'
import Weather from '../components/Weather.vue'
import Calculator from '../components/Calculator.vue'
import Folder from '../components/Folder.vue'
import draggable from 'vuedraggable'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ref, onMounted, computed } from 'vue'

const router = useRouter()
const authStore = useAuthStore()
const userProfile = ref(null)
const searchKeyword = ref('')

// 模态框控制
const activeModal = ref(null)

// 文件夹初始数据
const folderWebsites = ref([
  {
    name: '腾讯视频',
    url: 'https://v.qq.com'
  },
  {
    name: '抖音',
    url: 'https://www.douyin.com'
  },
  {
    name: 'B站',
    url: 'https://www.bilibili.com'
  },
  {
    name: '网易云音乐',
    url: 'https://music.163.com'
  }
])

// 网格项配置（数据驱动）
const gridItems = ref([
  // 时钟
  {
    id: 'clock',
    type: 'widget',
    name: '时钟',
    icon: 'uil-clock',
    gridColumn: 3,
    gridRow: 2,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    preview: () => new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    previewType: 'time'
  },
  // 日历
  {
    id: 'calendar',
    type: 'widget',
    name: '日历',
    icon: 'uil-calendar-alt',
    gridColumn: 2,
    gridRow: 1,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    preview: () => new Date().getDate(),
    previewType: 'date'
  },
  // 天气
  {
    id: 'weather',
    type: 'widget',
    name: '天气',
    icon: 'uil-cloud-sun',
    gridColumn: 2,
    gridRow: 1,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    preview: () => '18°C',
    previewType: 'temp'
  },
  // 计算器
  {
    id: 'calculator',
    type: 'widget',
    name: '计算器',
    icon: 'uil-calculator',
    gridColumn: 2,
    gridRow: 1,
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    preview: null,
    previewType: null
  },
  // 空白格子
  {
    id: 'empty-1',
    type: 'empty',
    gridColumn: 1,
    gridRow: 1
  },
  // 文件夹
  {
    id: 'folder',
    type: 'widget',
    name: '我的收藏',
    icon: 'uil-folder',
    gridColumn: 2,
    gridRow: 2,
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    preview: () => `${folderWebsites.value.length} 个网站`,
    previewType: 'count'
  }
])

// 生成剩余空白格子
for (let i = 2; i <= 24; i++) {
  gridItems.value.push({
    id: `empty-${i}`,
    type: 'empty',
    gridColumn: 1,
    gridRow: 1
  })
}

// 拖拽配置
const drag = ref(false)
const isDragging = ref(false)

const handleBaiduSearch = () => {
  if (searchKeyword.value.trim()) {
    const encodedKeyword = encodeURIComponent(searchKeyword.value.trim())
    window.open(`https://www.baidu.com/s?wd=${encodedKeyword}`, '_blank')
  }
}

// 打开模态框（拖拽时不触发）
const openModal = (modalName) => {
  if (!isDragging.value) {
    activeModal.value = modalName
  }
}

// 关闭模态框
const closeModal = () => {
  activeModal.value = null
}

// 保存布局到localStorage
const saveLayout = () => {
  const layout = gridItems.value.map(item => item.id)
  localStorage.setItem('dashboardLayout', JSON.stringify(layout))
}

// 从localStorage加载布局
const loadLayout = () => {
  const savedLayout = localStorage.getItem('dashboardLayout')
  if (savedLayout) {
    try {
      const layout = JSON.parse(savedLayout)
      const newItems = []
      
      // 按照保存的顺序重新排列
      layout.forEach(id => {
        const item = gridItems.value.find(i => i.id === id)
        if (item) {
          newItems.push(item)
        }
      })
      
      // 添加新增的项（如果有）
      gridItems.value.forEach(item => {
        if (!layout.includes(item.id)) {
          newItems.push(item)
        }
      })
      
      gridItems.value = newItems
    } catch (e) {
      console.error('加载布局失败:', e)
    }
  }
}

// 拖拽开始
const onDragStart = () => {
  drag.value = true
  isDragging.value = true
}

// 拖拽结束时保存布局
const onDragEnd = () => {
  drag.value = false
  saveLayout()
  // 延迟重置isDragging，防止点击事件触发
  setTimeout(() => {
    isDragging.value = false
  }, 100)
}

// 重置布局
const resetLayout = () => {
  localStorage.removeItem('dashboardLayout')
  location.reload()
}

onMounted(() => {
  userProfile.value = authStore.user
  loadLayout()
})
</script>

<template>
  <div class="home-container">
    <!-- 左侧导航条组件 -->
    <SidebarNavigation />
    
    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 用户问候语 -->
      <div class="greeting-section">
        <h1>hi，{{ userProfile?.displayName || userProfile?.username || '用户' }}</h1>
      </div>
      
      <!-- 搜索框 -->
      <div class="search-section">
        <form class="baidu-search" @submit.prevent="handleBaiduSearch">
          <input 
            type="text" 
            v-model="searchKeyword" 
            placeholder="输入搜索内容"
            class="search-input"
          />
        </form>
        <div class="drag-hint">
          <i class="uil uil-draggabledots"></i>
          <span>拖拽卡片可以重新排列位置</span>
          <button @click="resetLayout" class="reset-btn" title="重置布局">
            <i class="uil uil-redo"></i>
          </button>
        </div>
      </div>

      <!-- 网格区域 -->
      <draggable 
        v-model="gridItems" 
        class="grid-container"
        item-key="id"
        :animation="300"
        :easing="'cubic-bezier(0.4, 0.0, 0.2, 1)'"
        ghost-class="ghost"
        chosen-class="chosen"
        drag-class="drag"
        :force-fallback="false"
        :fallback-tolerance="3"
        :scroll-sensitivity="100"
        :bubble-scroll="true"
        @start="onDragStart"
        @end="onDragEnd"
      >
        <template #item="{ element }">
          <div
            :class="[
              'grid-item',
              element.type === 'widget' ? 'widget-card' : 'empty-item',
              `widget-${element.id}`
            ]"
            :style="{
              gridColumn: `span ${element.gridColumn}`,
              gridRow: `span ${element.gridRow}`,
              background: element.gradient || 'transparent',
              aspectRatio: element.type === 'empty' ? '1 / 1' : `${element.gridColumn} / ${element.gridRow}`
            }"
            @click="element.type === 'widget' ? openModal(element.id) : null"
          >
            <!-- 小部件内容 -->
            <template v-if="element.type === 'widget'">
              <div class="widget-icon">
                <i :class="`uil ${element.icon}`"></i>
              </div>
              <div class="widget-title">{{ element.name }}</div>
              <div v-if="element.preview" class="widget-preview">
                <span 
                  :class="{
                    'preview-time': element.previewType === 'time',
                    'preview-date': element.previewType === 'date',
                    'preview-temp': element.previewType === 'temp',
                    'preview-count': element.previewType === 'count'
                  }"
                >
                  {{ typeof element.preview === 'function' ? element.preview() : element.preview }}
                </span>
              </div>
            </template>
          </div>
        </template>
      </draggable>

      <!-- 模态框 - 时钟 -->
      <div v-if="activeModal === 'clock'" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="closeModal">
            <i class="uil uil-times"></i>
          </button>
          <Clock />
        </div>
      </div>

      <!-- 模态框 - 日历 -->
      <div v-if="activeModal === 'calendar'" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="closeModal">
            <i class="uil uil-times"></i>
          </button>
          <Calendar title="日历" />
        </div>
      </div>

      <!-- 模态框 - 天气 -->
      <div v-if="activeModal === 'weather'" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="closeModal">
            <i class="uil uil-times"></i>
          </button>
          <Weather />
        </div>
      </div>

      <!-- 模态框 - 计算器 -->
      <div v-if="activeModal === 'calculator'" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="closeModal">
            <i class="uil uil-times"></i>
          </button>
          <Calculator />
        </div>
      </div>

      <!-- 模态框 - 文件夹 -->
      <div v-if="activeModal === 'folder'" class="modal-overlay" @click="closeModal">
        <div class="modal-content modal-folder" @click.stop>
          <button class="modal-close" @click="closeModal">
            <i class="uil uil-times"></i>
          </button>
          <Folder folder-name="我的收藏" :initial-websites="folderWebsites" />
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.main-content {
  margin-left: 60px;
  padding: 20px;
  width: calc(100% - 60px);
  min-height: 100vh;
}

/* 问候语样式 */
.greeting-section {
  text-align: center;
  margin-bottom: 30px;
}

.greeting-section h1 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 3rem;
  margin: 0;
  font-weight: 700;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  letter-spacing: -0.5px;
  line-height: 1.1;
}

/* 搜索框样式 */
.search-section {
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.baidu-search {
  display: flex;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  border-radius: 25px;
  overflow: hidden;
  background: white;
  border: 1px solid #e1e5e9;
}

.search-input {
  flex: 1;
  padding: 15px 20px;
  border: none;
  font-size: 1rem;
  outline: none;
  background: transparent;
  color: #333;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.search-input::placeholder {
  color: #888;
  font-weight: 400;
}

.drag-hint {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 20px;
  color: #667eea;
  font-size: 0.9rem;
  font-weight: 500;
  animation: fadeInUp 0.5s ease;
}

.drag-hint i {
  font-size: 1.2rem;
}

.reset-btn {
  background: rgba(102, 126, 234, 0.2);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #667eea;
  transition: all 0.3s ease;
  margin-left: auto;
}

.reset-btn:hover {
  background: rgba(102, 126, 234, 0.3);
  transform: rotate(180deg);
}

.reset-btn i {
  font-size: 1.1rem;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 网格样式 */
.grid-container {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(4, auto);
  gap: 15px;
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
}

.grid-item {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1),
              box-shadow 0.3s cubic-bezier(0.4, 0.0, 0.2, 1),
              opacity 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: move;
  position: relative;
  width: 100%;
  user-select: none;
  will-change: transform;
  touch-action: none;
}

/* 确保所有grid-item保持在grid中 */
.grid-item:not(.sortable-drag) {
  position: relative !important;
}

/* 拖拽状态样式 */
.ghost {
  opacity: 0.4 !important;
  background: rgba(102, 126, 234, 0.3) !important;
  border: 2px dashed #667eea !important;
  transition: none !important;
}

.chosen {
  transform: scale(1.05) !important;
  box-shadow: 0 12px 30px rgba(0,0,0,0.25) !important;
  z-index: 1000 !important;
  cursor: grabbing !important;
  transition: none !important;
}

.drag {
  opacity: 0.9 !important;
  transform: rotate(2deg) scale(1.03) !important;
  transition: none !important;
}

/* 在拖拽时，其他元素的平滑过渡 */
.grid-container:not(.sortable-drag) .grid-item {
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

/* 防止拖拽时元素换行 */
.sortable-drag {
  position: fixed !important;
  pointer-events: none !important;
  z-index: 9999 !important;
}

.sortable-ghost {
  position: relative !important;
  pointer-events: none !important;
}

/* 拖拽时为grid container添加额外的稳定性 */
.grid-container.sortable-drag-active {
  min-height: fit-content;
}

/* 平滑移动其他元素 */
.grid-item {
  transform-origin: center center;
}

/* 卡片样式 */
.widget-card {
  padding: 20px;
  text-align: center;
}

.widget-card:not(.chosen):not(.drag):hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.widget-card:not(.chosen):not(.drag):active {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.widget-icon {
  font-size: 3rem;
  margin-bottom: 12px;
  transition: transform 0.3s ease;
}

.widget-card:not(.chosen):not(.drag):hover .widget-icon {
  transform: scale(1.1);
}

.widget-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.widget-preview {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.preview-time {
  font-family: 'Courier New', monospace;
  font-size: 1.2rem;
  font-weight: 600;
  color: #667eea;
}

.preview-date {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
}

.preview-temp {
  font-size: 1.3rem;
  font-weight: 600;
  color: #667eea;
}

/* 空白格子样式 */
.empty-item {
  background: transparent;
  border: 2px dashed #e0e0e0;
  box-shadow: none;
  cursor: move;
  aspect-ratio: 1 / 1;
  min-height: 0;
  pointer-events: auto;
}

.empty-item:not(.chosen):not(.drag):hover {
  background: rgba(102, 126, 234, 0.05);
  border-color: #667eea;
  transform: none !important;
}

.empty-item.chosen {
  background: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
}

/* 小部件通用样式（有渐变背景的） */
.widget-card[style*="gradient"] {
  color: white;
}

.widget-card[style*="gradient"] .widget-icon {
  color: white;
}

.widget-card[style*="gradient"] .widget-title {
  color: white;
}

/* 特殊预览样式 */
.preview-time {
  color: rgba(255, 255, 255, 0.95);
  font-size: 2.5rem;
}

.preview-date {
  color: rgba(255, 255, 255, 0.95);
  font-size: 2rem;
  font-weight: 700;
}

.preview-temp {
  color: rgba(255, 255, 255, 0.95);
  font-size: 1.3rem;
  font-weight: 600;
}

.preview-count {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

/* 特定小部件图标大小调整 */
.widget-clock .widget-icon {
  font-size: 3rem;
}

.widget-calculator .widget-icon {
  font-size: 3.5rem;
}

.widget-folder .widget-icon {
  font-size: 4rem;
  margin-bottom: 15px;
}

.widget-folder .widget-title {
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.folder-preview {
  margin-top: 15px;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 20px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  animation: slideUp 0.3s ease;
  padding: 20px;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #333;
  transition: all 0.3s ease;
  z-index: 10;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.2);
  transform: rotate(90deg);
}

.modal-close i {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 模态框中的组件样式 */
.modal-content :deep(.clock-container),
.modal-content :deep(.calendar-card),
.modal-content :deep(.weather-container),
.modal-content :deep(.calculator) {
  max-width: 800px;
  margin: 0 auto;
}

/* 文件夹模态框特殊样式 */
.modal-folder {
  max-width: 95vw;
  width: 900px;
}

.modal-folder :deep(.folder-container) {
  max-width: 100%;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .grid-container {
    max-width: 900px;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 15px;
  }
  
  .greeting-section h1 {
    font-size: 2rem;
  }
  
  .grid-container {
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: auto;
    max-width: 100%;
    gap: 10px;
  }
  
  .widget-icon {
    font-size: 2.5rem;
  }
  
  .widget-title {
    font-size: 0.9rem;
  }
  
  .modal-content {
    max-width: 95vw;
    max-height: 95vh;
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .greeting-section h1 {
    font-size: 1.5rem;
  }
  
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
    padding: 10px;
    gap: 8px;
  }
  
  .widget-card {
    padding: 15px;
  }
  
  .widget-icon {
    font-size: 2rem;
    margin-bottom: 8px;
  }
  
  .widget-title {
    font-size: 0.8rem;
  }
  
  .preview-time {
    font-size: 1.5rem !important;
  }
  
  .preview-date {
    font-size: 1.5rem !important;
  }
  
  .preview-temp {
    font-size: 1rem !important;
  }
  
  .empty-item {
    display: none;
  }
  
  .modal-content {
    padding: 10px;
    border-radius: 15px;
  }
  
  .modal-close {
    width: 35px;
    height: 35px;
    font-size: 20px;
  }
}
</style>