<script setup lang="ts">
import Clock from '../components/Clock.vue'
import Calendar from '../components/Calendar.vue'
import Weather from '../components/Weather.vue'
import Calculator from '../components/Calculator.vue'
import draggable from 'vuedraggable'
import { useAuthStore } from '@/stores/auth.js'
import { ref, onMounted } from 'vue'

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
// const getGridPosition = (index: number): { col: number; row: number } => {
//   const gridColumns = 10
//   const row = Math.floor(index / gridColumns) + 1
//   const col = (index % gridColumns) + 1
//   return { col, row }
// }

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
@import '../css/homeView.css';
</style>