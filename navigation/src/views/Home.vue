<script setup lang="ts">
import Clock from '../components/Clock.vue'
import Calendar from '../components/Calendar.vue'
import Weather from '../components/Weather.vue'
import Calculator from '../components/Calculator.vue'
import draggable from 'vuedraggable'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { ref, onMounted, computed } from 'vue'

// 类型定义
interface GridItem {
  id: string
  type: 'widget' | 'empty'
  name?: string
  icon?: string
  gridColumn: number
  gridRow: number
  gradient?: string
  preview?: (() => string) | string | null
  previewType?: 'time' | 'date' | 'temp' | 'count' | null
}

interface Website {
  name: string
  url: string
}

interface UserProfile {
  displayName?: string
  username?: string
}

const router = useRouter()
const authStore = useAuthStore()
const userProfile = ref<UserProfile | null>(null)
const searchKeyword = ref<string>('')

// 模态框控制
const activeModal = ref<string | null>(null)

// 文件夹初始数据
const folderWebsites = ref<Website[]>([
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
const gridItems = ref<GridItem[]>([
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
    preview: () => new Date().getDate().toString(),
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
  },
  // 新文件夹
  {
    id: 'folder2',
    type: 'widget',
    name: '工作资料',
    icon: 'uil-folder',
    gridColumn: 2,
    gridRow: 2,
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    preview: () => '0 个文件',
    previewType: 'count'
  },
  // AI组件卡片
  {
    id: 'ai',
    type: 'widget',
    name: 'AI助手',
    icon: 'uil-robot',
    gridColumn: 2,
    gridRow: 2,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    preview: () => '智能助手',
    previewType: null
  }
])

// 生成剩余空白格子（限制为4行，总共40个格子）
const totalGridItems = 23 // 4行 × 10列
const existingItems = gridItems.value.length
// 确保不会超过40个格子
for (let i = existingItems + 1; i <= totalGridItems; i++) {
  gridItems.value.push({
    id: `empty-${i}`,
    type: 'empty',
    gridColumn: 1,
    gridRow: 1
  })
}
// 如果gridItems超过40个，截断到40个
if (gridItems.value.length > totalGridItems) {
  gridItems.value = gridItems.value.slice(0, totalGridItems)
}

// 拖拽配置
const drag = ref(false)
const isDragging = ref(false)

// TypeScript拖拽算法
let dragStartIndex: number = -1

// 网格位置计算
const getGridPosition = (index: number): { col: number; row: number } => {
  const gridColumns = 10
  const row = Math.floor(index / gridColumns) + 1
  const col = (index % gridColumns) + 1
  return { col, row }
}

// 拖拽结束后优化布局（移除，保持原有布局）
const optimizeLayoutAfterDrag = (): void => {
  // 不再重新排序，保持拖拽后的布局
}

const handleBaiduSearch = () => {
  if (searchKeyword.value.trim()) {
    const encodedKeyword = encodeURIComponent(searchKeyword.value.trim())
    window.open(`https://www.baidu.com/s?wd=${encodedKeyword}`, '_blank')
  }
}

// 打开模态框（拖拽时不触发）
const openModal = (modalName: string) => {
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
      const layout: string[] = JSON.parse(savedLayout)
      const newItems: GridItem[] = []
      
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
const onDragStart = (evt: { oldIndex: number }) => {
  drag.value = true
  isDragging.value = true
  dragStartIndex = evt.oldIndex
}

// 拖拽变化事件
const onDragChange = (evt: { moved?: { oldIndex: number, newIndex: number } }) => {
  if (evt.moved) {
    // 使用vuedraggable内置的动画，这里不需要额外处理
    // 动画由vuedraggable的animation属性控制
  }
}

// 拖拽结束时保存布局并优化布局
const onDragEnd = () => {
  drag.value = false
  
  // 拖拽结束后优化布局
  optimizeLayoutAfterDrag()
  
  saveLayout()
  
  // 延迟重置isDragging，防止点击事件触发
  setTimeout(() => {
    isDragging.value = false
    dragStartIndex = -1
  }, 100)
}



onMounted(() => {
  userProfile.value = authStore.user
  loadLayout()
})
</script>

<template>
  <div class="home-container">
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
      </div>

      <!-- 网格区域 -->
      <draggable 
        v-model="gridItems" 
        class="grid-container"
        item-key="id"
        :animation="400"
        :easing="'cubic-bezier(0.4, 0.0, 0.2, 1)'"
        ghost-class="ghost"
        chosen-class="chosen"
        drag-class="drag"
        :force-fallback="false"
        :fallback-tolerance="3"
        :scroll-sensitivity="100"
        :bubble-scroll="true"
        :invert-swap="true"
        :swap-threshold="0.5"
        :direction="'horizontal'"
        :group="{ name: 'grid', pull: true, put: true }"
        @start="onDragStart"
        @change="onDragChange"
        @end="onDragEnd"
      >
        <template #item="{ element, index }">
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
            :data-index="index"
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
        <div class="modal-content modal-calendar" @click.stop>
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

      <!-- 模态框 - 新文件夹 -->
      <div v-if="activeModal === 'folder2'" class="modal-overlay" @click="closeModal">
        <div class="modal-content modal-folder" @click.stop>
          <button class="modal-close" @click="closeModal">
            <i class="uil uil-times"></i>
          </button>
          <Folder folder-name="工作资料" :initial-websites="[]" />
        </div>
      </div>

      <!-- 模态框 - AI组件 -->
      <div v-if="activeModal === 'ai'" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="closeModal">
            <i class="uil uil-times"></i>
          </button>
          <div class="ai-content">
            <h2>AI助手</h2>
            <p>AI助手功能正在开发中...</p>
          </div>
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
  margin-left: 50px;
  padding: 20px;
  width: calc(100% - 50px);
  min-height: 100vh;
}

/* 问候语样式 */
.greeting-section {
  text-align: center;
  margin-bottom: 20px;
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
  margin-bottom: 10px;
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





/* 网格样式 - 手机桌面风格 */
.grid-container {
  display: grid;
  grid-template-columns: repeat(10, minmax(80px, 1fr));
  grid-template-rows: repeat(4, minmax(100px, 1fr));
  gap: 12px;
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  grid-auto-flow: row dense;
  align-items: start;
  justify-items: center;
  transition: grid-template-rows 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.grid-item {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: move;
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  user-select: none;
  will-change: transform;
  touch-action: none;
  box-sizing: border-box;
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

/* 单格高度卡片的紧凑样式 */
.widget-calendar,
.widget-weather,
.widget-calculator {
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0;
  min-height: 0;
  height: 100%;
  box-sizing: border-box;
}

.widget-calendar .widget-icon,
.widget-weather .widget-icon,
.widget-calculator .widget-icon {
  line-height: 1;
}

.widget-calendar .widget-title,
.widget-weather .widget-title,
.widget-calculator .widget-title {
  line-height: 1.2;
}

.widget-calendar .widget-preview,
.widget-weather .widget-preview,
.widget-calculator .widget-preview {
  line-height: 1;
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
  margin: 0;
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
  font-size: 2rem;
  margin-bottom: 2px;
}

.widget-calculator .widget-title {
  font-size: 0.8rem;
  margin-bottom: 0;
}

.widget-calendar .widget-icon {
  font-size: 1.5rem;
  margin-bottom: 2px;
}

.widget-calendar .widget-title {
  font-size: 0.75rem;
  margin-bottom: 2px;
}

.widget-calendar .widget-preview {
  margin-top: 0;
}

.widget-calendar .preview-date {
  font-size: 1.3rem !important;
}

.widget-weather .widget-icon {
  font-size: 1.6rem;
  margin-bottom: 2px;
}

.widget-weather .widget-title {
  font-size: 0.75rem;
  margin-bottom: 2px;
}

.widget-weather .widget-preview {
  margin-top: 0;
}

.widget-weather .preview-temp {
  font-size: 0.95rem !important;
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
.modal-content :deep(.weather-container) {
  max-width: 800px;
  margin: 0 auto;
}

/* 计算器模态框特殊样式 */
.modal-content:has(.calculator) {
  max-width: 90vw !important;
  width: auto !important;
  min-width: 400px;
  overflow: visible !important; /* 去除滚动条 */
}

.modal-content :deep(.calculator) {
  max-width: 500px !important;
  width: 100% !important;
  margin: 0 auto;
  padding-right: 50px; /* 为关闭按钮预留空间 */
}

.modal-content :deep(.calculator) .calculator {
  max-width: 100% !important;
  width: 100% !important;
  padding: 20px;
}

.modal-content :deep(.calculator) .btn {
  height: 60px;
  font-size: 1.4rem;
}

.modal-content :deep(.calculator) .display-value {
  font-size: 2.2rem;
}

/* 日历模态框特殊样式 */
.modal-content:has(.calendar) {
  max-width: 95vw;
  width: auto;
  min-width: 600px;
  overflow: visible;
}

.modal-content :deep(.calendar) {
  max-width: 700px;
  width: 100%;
  margin: 0 auto;
  padding-right: 50px; /* 为关闭按钮预留空间 */
}

.modal-content :deep(.calendar) .calendar-card {
  max-width: 100%;
  width: 100%;
  padding: 30px;
}

.modal-content :deep(.calendar) .calendar-header {
  padding: 25px;
}

.modal-content :deep(.calendar) .calendar-header h3 {
  font-size: 1.5rem;
  margin-bottom: 20px;
}

.modal-content :deep(.calendar) .current-month {
  font-size: 1.3rem;
  min-width: 150px;
}

.modal-content :deep(.calendar) .nav-btn {
  width: 40px;
  height: 40px;
  font-size: 22px;
}

.modal-content :deep(.calendar) .calendar-wrapper {
  padding: 25px;
}

.modal-content :deep(.calendar) .weekday {
  font-size: 1.1rem;
  padding: 12px 0;
}

.modal-content :deep(.calendar) .day-cell {
  aspect-ratio: 1;
  min-height: 45px;
}

.modal-content :deep(.calendar) .day-number {
  font-size: 1.1rem;
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
    grid-template-rows: repeat(4, minmax(100px, 1fr));
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