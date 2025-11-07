<script setup lang="ts">
import Clock from '../components/Clock.vue'
import Calendar from '../components/Calendar.vue'
import Weather from '../components/Weather.vue'
import Calculator from '../components/Calculator.vue'
import AIAssistant from '../components/AIAssistant.vue'
import Workflow from '../components/Workflow.vue'
// 覆盖式网格重构后，不再使用 vuedraggable
import { useAuthStore } from '@/stores/auth.js'
import { ref, onMounted, reactive, onBeforeUnmount } from 'vue'
import doubaoImage from '../assets/doubao.png'
import clockImage from '../assets/clock.jpeg'
import calculatorImage from '../assets/Calculator.png'
import { supabase } from '@/supabase.js'

// 类型定义
interface GridItem {
  id: string
  type: 'widget' | 'empty'
  name?: string
  icon?: string
  gridColumn: number
  gridRow: number
  gradient?: string
  backgroundImage?: string
  preview?: (() => string) | string | null
  previewType?: 'time' | 'date' | 'temp' | 'count' | null
  _col?: number
  _row?: number
}

interface Website {
  name: string
  url: string
}

interface UserProfile {
  displayName?: string
  username?: string
}

interface WorkflowItem {
  id: any
  avatar: any
  userName: any
  publishTime: string
  imageUrl: any
  title: any
  description: any
  tags: any[]
  likes: any
  favorites: any
  comments: number
  createdAt: any
}

const authStore = useAuthStore()
const userProfile = ref<UserProfile | null>(null)
const searchKeyword = ref<string>('')

// 壁纸相关
const wallpaperUrl = ref<string | null>(null)

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

// 工作流数据（收藏的帖子/工作流）
const workflowData = ref<WorkflowItem[]>([])

// 从数据库加载用户收藏数据
const loadUserFavorites = async () => {
  try {
    if (!authStore.user?.id) {
      console.log('用户未登录，无法加载收藏数据')
      return
    }

    // 查询用户收藏的帖子
    const { data: favorites, error } = await supabase
      .from('user_favorites')
      .select(`
        article_id,
        created_at,
        articles (
          id,
          article_title,
          description,
          cover_image,
          tags,
          like_count,
          favorite_count,
          created_at,
          user_id,
          users!articles_user_id_fkey (
            user_profiles (
              display_name,
              avatar_url
            )
          )
        )
      `)
      .eq('user_id', authStore.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('查询收藏失败:', error)
      return
    }

    // 转换数据格式以匹配Workflow组件
    const formattedFavorites = favorites.map((fav: any) => {
      const article = fav.articles
      if (!article) return null
      
      // 解析tags字段
      let tags = []
      try {
        const tagData = JSON.parse(article.tags || '{}')
        if (tagData.content_type) tags.push(tagData.content_type)
        if (tagData.scenes && Array.isArray(tagData.scenes)) {
          tags = tags.concat(tagData.scenes.slice(0, 2))
        }
        if (tagData.attributes && Array.isArray(tagData.attributes)) {
          tags = tags.concat(tagData.attributes.slice(0, 1))
        }
      } catch (e) {
        console.warn('解析tags字段失败:', e)
      }
      
      // 如果没有解析到tags，使用默认tags
      if (tags.length === 0) {
        tags = ['工作流', '自动化']
      }
      
      return {
        id: article.id,
        avatar: article.users?.user_profiles?.avatar_url || '/src/assets/default-avatar.png',
        userName: article.users?.user_profiles?.display_name || '匿名用户',
        publishTime: formatTimeAgo(article.created_at),
        imageUrl: article.cover_image || 'https://picsum.photos/id/0/600/400',
        title: article.article_title,
        description: article.description || '暂无描述',
        tags: tags,
        likes: article.like_count || 0,
        favorites: article.favorite_count || 0,
        comments: 0,
        createdAt: article.created_at
      }
    }).filter(Boolean) as WorkflowItem[] // 过滤掉null值

    workflowData.value = formattedFavorites
    console.log('加载用户收藏成功:', formattedFavorites.length)
  } catch (error) {
    console.error('加载收藏数据失败:', error)
  }
}

// 格式化时间显示
const formatTimeAgo = (timestamp: string | Date | null | undefined) => {
  if (!timestamp) return '刚刚'
  
  const now = new Date()
  const postTime = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - postTime.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return '刚刚'
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}分钟前`
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}小时前`
  } else if (diffInSeconds < 2592000) {
    return `${Math.floor(diffInSeconds / 86400)}天前`
  } else {
    return postTime.toLocaleDateString('zh-CN')
  }
}

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
    backgroundImage: clockImage,
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
    // 不使用背景图片，显示日历内容
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
    backgroundImage: calculatorImage,
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
    name: '工作流',
    icon: 'uil-folder',
    gridColumn: 2,
    gridRow: 2,
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    preview: () => `${workflowData.value.length} 个工作流`,
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
    backgroundImage: doubaoImage,
    preview: () => '智能助手',
    previewType: null
  }
])

// 生成剩余空白格子（4行 × 10列 = 40 个格子）
const totalGridItems = 40
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
const isDragging = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const backgroundRef = ref<HTMLElement | null>(null)
const overlayRef = ref<HTMLElement | null>(null)
const gridMetrics = reactive({
  cols: 10,
  rows: 4,
  gap: 12,
  padding: 20,
  cellWidth: 100,
  cellHeight: 100
})

// 兼容旧逻辑占位（不再使用）
// let dragStartIndex: number = -1

// 网格位置计算
// const getGridPosition = (index: number): { col: number; row: number } => {
//   const gridColumns = 10
//   const row = Math.floor(index / gridColumns) + 1
//   const col = (index % gridColumns) + 1
//   return { col, row }
// }

// 拖拽结束后优化布局（移除，保持原有布局）
// const optimizeLayoutAfterDrag = (): void => {}

const handleBaiduSearch = () => {
  if (searchKeyword.value.trim()) {
    const encodedKeyword = encodeURIComponent(searchKeyword.value.trim())
    window.open(`https://www.baidu.com/s?wd=${encodedKeyword}`, '_blank')
  }
}

// 处理组件点击（拖拽时不触发）
const handleWidgetClick = (modalName: string) => {
  // 如果执行了拖拽，不打开模态框
  if (!hasActuallyDragged && !isDragging.value) {
    // 时钟和日历组件不弹出模态框
    if (modalName === 'clock' || modalName === 'calendar') {
      return
    }
    activeModal.value = modalName
  }
}

// 关闭模态框
const closeModal = () => {
  activeModal.value = null
}

// 保存布局到localStorage（保存列/行坐标）
const saveLayout = () => {
  const layout = gridItems.value
    .filter(i => i.type === 'widget')
    .map(i => ({ id: i.id, col: (i as any)._col || 0, row: (i as any)._row || 0 }))
  localStorage.setItem('dashboardLayout', JSON.stringify(layout))
}

// 防抖（防止频繁触发布局保存和可能的重排）
const debounce = (fn: Function, delay = 200) => {
  let timer: number | null = null
  return (...args: any[]) => {
    if (timer) window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      fn(...args)
      timer = null
    }, delay)
  }
}

const debouncedSaveLayout = debounce(saveLayout, 250)

// 初始化默认位置（如果没有保存的布局）
const initializeDefaultPositions = () => {
  const widgets = gridItems.value.filter(i => i.type === 'widget')
  let currentCol = 0
  let currentRow = 0
  const maxCols = gridMetrics.cols
  
  widgets.forEach((item: any) => {
    // 如果已经有位置（从localStorage加载），跳过
    if (item._col !== undefined && item._row !== undefined) {
      return
    }
    
    // 检查当前行是否放得下
    if (currentCol + item.gridColumn > maxCols) {
      currentCol = 0
      currentRow += 2 // 移动到下一行（假设最大高度是2）
    }
    
    // 设置位置
    item._col = currentCol
    item._row = currentRow
    
    // 移动到下一个位置
    currentCol += item.gridColumn
  })
}

// 从localStorage加载布局（载入列/行坐标）
const loadLayout = () => {
  const savedLayout = localStorage.getItem('dashboardLayout')
  if (savedLayout) {
    try {
      const layout: Array<{ id: string, col: number, row: number }> = JSON.parse(savedLayout)
      layout.forEach(pos => {
        const item = gridItems.value.find(i => i.id === pos.id)
        if (item) {
          ;(item as any)._col = pos.col
          ;(item as any)._row = pos.row
        }
      })
      // 为没有保存位置的组件设置默认位置
      initializeDefaultPositions()
    } catch (e) {
      console.error('加载布局失败:', e)
      // 如果加载失败，初始化默认位置
      initializeDefaultPositions()
    }
  } else {
    // 如果没有保存的布局，初始化默认位置
    initializeDefaultPositions()
  }
}

// 绝对定位覆盖层拖拽
let activeId: string | null = null
let startClientX = 0
let startClientY = 0
let startCol = 0
let startRow = 0
// 记录是否真的执行了拖拽（移动距离超过阈值）
let hasActuallyDragged = false
const DRAG_THRESHOLD = 5 // 拖拽阈值（像素）

const onOverlayPointerDown = (e: PointerEvent, id: string) => {
  const item = gridItems.value.find(i => i.id === id)
  if (!item) return
  activeId = id
  isDragging.value = true
  hasActuallyDragged = false // 重置拖拽标志
  ;(e.target as Element).setPointerCapture(e.pointerId)
  startClientX = e.clientX
  startClientY = e.clientY
  startCol = (item as any)._col || 0
  startRow = (item as any)._row || 0
  // 重置检测位置
  lastCheckedCol = -1
  lastCheckedRow = -1
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

// 检测两个矩形是否重叠
const checkCollision = (item1: any, item2: any): boolean => {
  if (item1.id === item2.id) return false
  
  const col1 = item1._col ?? 0
  const row1 = item1._row ?? 0
  const col2 = item2._col ?? 0
  const row2 = item2._row ?? 0
  
  const right1 = col1 + item1.gridColumn
  const bottom1 = row1 + item1.gridRow
  const right2 = col2 + item2.gridColumn
  const bottom2 = row2 + item2.gridRow
  
  return !(right1 <= col2 || col1 >= right2 || bottom1 <= row2 || row1 >= bottom2)
}

// 获取组件占用的所有格子坐标（暂时未使用，保留以备后用）
// const getOccupiedCells = (item: any): Array<{ col: number; row: number }> => {
//   const cells: Array<{ col: number; row: number }> = []
//   const col = item._col ?? 0
//   const row = item._row ?? 0
//   
//   for (let r = 0; r < item.gridRow; r++) {
//     for (let c = 0; c < item.gridColumn; c++) {
//       cells.push({ col: col + c, row: row + r })
//     }
//   }
//   return cells
// }

// 检查位置是否在网格范围内
const isValidPosition = (col: number, row: number, gridColumn: number, gridRow: number): boolean => {
  return col >= 0 && 
         row >= 0 && 
         col + gridColumn <= gridMetrics.cols && 
         row + gridRow <= gridMetrics.rows
}

// 找到一个组件可以移动到的最近空位置（智能搜索）
const findEmptyPosition = (item: any, direction: 'right' | 'down' | 'left' | 'up' = 'right', excludeItems: Set<string> = new Set(), draggingItemPosition: { col: number; row: number; gridColumn: number; gridRow: number } | null = null, plannedPositions: Map<string, { col: number; row: number; gridColumn: number; gridRow: number }> = new Map()): { col: number; row: number } | null => {
  // 排除当前组件、正在拖动的组件和已移动的组件
  const allWidgets = gridItems.value.filter(i => 
    i.type === 'widget' && 
    i.id !== item.id && 
    i.id !== activeId && 
    !excludeItems.has(i.id)
  )
  
  // 如果正在拖拽组件，需要将其新位置也考虑进去进行碰撞检测
  const widgetsToCheck = draggingItemPosition ? [...allWidgets, {
    id: activeId,
    _col: draggingItemPosition.col,
    _row: draggingItemPosition.row,
    gridColumn: draggingItemPosition.gridColumn,
    gridRow: draggingItemPosition.gridRow
  }] : allWidgets
  
  // 添加所有已计划的位置到检查列表
  const allPositionsToCheck = [...widgetsToCheck]
  plannedPositions.forEach((pos, id) => {
    if (id !== item.id && id !== activeId && !excludeItems.has(id)) {
      allPositionsToCheck.push({
        id: id,
        _col: pos.col,
        _row: pos.row,
        gridColumn: pos.gridColumn,
        gridRow: pos.gridRow
      })
    }
  })
  
  const currentCol = item._col ?? 0
  const currentRow = item._row ?? 0
  
  // 优先在同一行/列搜索，然后扩展到附近
  if (direction === 'right') {
    // 向右搜索，优先同一行
    for (let row = Math.max(0, currentRow - 1); row <= Math.min(gridMetrics.rows - item.gridRow, currentRow + item.gridRow + 1); row++) {
      for (let col = currentCol + item.gridColumn; col <= gridMetrics.cols - item.gridColumn; col++) {
        const testItem = { ...item, _col: col, _row: row }
        const hasCollision = allPositionsToCheck.some(w => checkCollision(testItem, w))
        if (!hasCollision && isValidPosition(col, row, item.gridColumn, item.gridRow)) {
          return { col, row }
        }
      }
    }
    // 如果找不到，搜索整个网格
    for (let row = 0; row <= gridMetrics.rows - item.gridRow; row++) {
      for (let col = 0; col <= gridMetrics.cols - item.gridColumn; col++) {
        const testItem = { ...item, _col: col, _row: row }
        const hasCollision = allPositionsToCheck.some(w => checkCollision(testItem, w))
        if (!hasCollision && isValidPosition(col, row, item.gridColumn, item.gridRow)) {
          return { col, row }
        }
      }
    }
  } else if (direction === 'down') {
    // 向下搜索，优先同一列
    for (let col = Math.max(0, currentCol - 1); col <= Math.min(gridMetrics.cols - item.gridColumn, currentCol + item.gridColumn + 1); col++) {
      for (let row = currentRow + item.gridRow; row <= gridMetrics.rows - item.gridRow; row++) {
        const testItem = { ...item, _col: col, _row: row }
        const hasCollision = allPositionsToCheck.some(w => checkCollision(testItem, w))
        if (!hasCollision && isValidPosition(col, row, item.gridColumn, item.gridRow)) {
          return { col, row }
        }
      }
    }
    // 如果找不到，搜索整个网格
    for (let row = 0; row <= gridMetrics.rows - item.gridRow; row++) {
      for (let col = 0; col <= gridMetrics.cols - item.gridColumn; col++) {
        const testItem = { ...item, _col: col, _row: row }
        const hasCollision = allPositionsToCheck.some(w => checkCollision(testItem, w))
        if (!hasCollision && isValidPosition(col, row, item.gridColumn, item.gridRow)) {
          return { col, row }
        }
      }
    }
  } else if (direction === 'left') {
    // 向左搜索
    for (let row = Math.max(0, currentRow - 1); row <= Math.min(gridMetrics.rows - item.gridRow, currentRow + item.gridRow + 1); row++) {
      for (let col = currentCol - 1; col >= 0; col--) {
        const testItem = { ...item, _col: col, _row: row }
        const hasCollision = allPositionsToCheck.some(w => checkCollision(testItem, w))
        if (!hasCollision && isValidPosition(col, row, item.gridColumn, item.gridRow)) {
          return { col, row }
        }
      }
    }
  } else if (direction === 'up') {
    // 向上搜索
    for (let col = Math.max(0, currentCol - 1); col <= Math.min(gridMetrics.cols - item.gridColumn, currentCol + item.gridColumn + 1); col++) {
      for (let row = currentRow - 1; row >= 0; row--) {
        const testItem = { ...item, _col: col, _row: row }
        const hasCollision = allPositionsToCheck.some(w => checkCollision(testItem, w))
        if (!hasCollision && isValidPosition(col, row, item.gridColumn, item.gridRow)) {
          return { col, row }
        }
      }
    }
  }
  
  return null
}

// 移动组件到新位置（处理连锁碰撞）
const moveItemToPosition = (item: any, newCol: number, newRow: number, movedItems: Set<string> = new Set(), depth: number = 0, draggingItemPosition: { col: number; row: number; gridColumn: number; gridRow: number } | null = null, plannedPositions: Map<string, { col: number; row: number; gridColumn: number; gridRow: number }> = new Map()): void => {
  // 防止循环移动和过深递归
  if (movedItems.has(item.id) || depth > 10) return
  movedItems.add(item.id)
  
  // 临时设置新位置用于碰撞检测
  const tempItem = { ...item, _col: newCol, _row: newRow }
  
  // 检查新位置是否与其他组件碰撞（排除已移动的组件和正在拖动的组件）
  const allWidgets = gridItems.value.filter(i => 
    i.type === 'widget' && 
    i.id !== item.id && 
    i.id !== activeId && 
    !movedItems.has(i.id)
  )
  
  // 如果正在拖拽组件，需要将其新位置也考虑进去
  const widgetsToCheck = draggingItemPosition ? [...allWidgets, {
    id: activeId,
    _col: draggingItemPosition.col,
    _row: draggingItemPosition.row,
    gridColumn: draggingItemPosition.gridColumn,
    gridRow: draggingItemPosition.gridRow
  }] : allWidgets
  
  // 添加所有已计划的位置到检查列表
  const allPositionsToCheck = [...widgetsToCheck]
  plannedPositions.forEach((pos, id) => {
    if (id !== item.id && id !== activeId && !movedItems.has(id)) {
      allPositionsToCheck.push({
        id: id,
        _col: pos.col,
        _row: pos.row,
        gridColumn: pos.gridColumn,
        gridRow: pos.gridRow
      })
    }
  })
  
  const collisions = allPositionsToCheck.filter(w => checkCollision(tempItem, w))
  
  if (collisions.length > 0) {
    // 如果有碰撞，先移动被碰撞的组件
    collisions.forEach(collidedItem => {
      // 计算移动方向（优先向右和向下）
      const collidedCol = (collidedItem as any)._col ?? 0
      const collidedRow = (collidedItem as any)._row ?? 0
      const dx = collidedCol - newCol
      const dy = collidedRow - newRow
      
      let direction: 'right' | 'down' | 'left' | 'up' = 'right'
      if (Math.abs(dx) > Math.abs(dy)) {
        direction = dx > 0 ? 'right' : 'left'
      } else {
        direction = dy > 0 ? 'down' : 'up'
      }
      
      // 尝试找到空位置（传入正在拖拽组件的位置信息和计划位置）
      const newPos = findEmptyPosition(collidedItem, direction, movedItems, draggingItemPosition, plannedPositions)
      if (newPos && collidedItem.id) {
        // 将找到的位置添加到计划集合中
        plannedPositions.set(collidedItem.id, {
          col: newPos.col,
          row: newPos.row,
          gridColumn: collidedItem.gridColumn,
          gridRow: collidedItem.gridRow
        })
        moveItemToPosition(collidedItem, newPos.col, newPos.row, movedItems, depth + 1, draggingItemPosition, plannedPositions)
      } else if (!newPos) {
        // 如果找不到，尝试其他方向
        const directions: Array<'right' | 'down' | 'left' | 'up'> = ['right', 'down', 'left', 'up']
        for (const dir of directions) {
          if (dir !== direction) {
            const altPos = findEmptyPosition(collidedItem, dir, movedItems, draggingItemPosition, plannedPositions)
            if (altPos && collidedItem.id) {
              // 将找到的位置添加到计划集合中
              plannedPositions.set(collidedItem.id, {
                col: altPos.col,
                row: altPos.row,
                gridColumn: collidedItem.gridColumn,
                gridRow: collidedItem.gridRow
              })
              moveItemToPosition(collidedItem, altPos.col, altPos.row, movedItems, depth + 1, draggingItemPosition, plannedPositions)
              break
            }
          }
        }
      }
    })
  }
  
  // 设置新位置
  item._col = newCol
  item._row = newRow
}

// 记录上次检测的格子位置，避免频繁重排
let lastCheckedCol = -1
let lastCheckedRow = -1

const onOverlayPointerMove = (e: PointerEvent) => {
  if (!activeId) return
  const item = gridItems.value.find(i => i.id === activeId)
  if (!item) return
  const dx = e.clientX - startClientX
  const dy = e.clientY - startClientY
  
  // 检测是否真的执行了拖拽（移动距离超过阈值）
  const distance = Math.sqrt(dx * dx + dy * dy)
  if (distance > DRAG_THRESHOLD) {
    hasActuallyDragged = true
  }
  
  const stepX = gridMetrics.cellWidth + gridMetrics.gap
  const stepY = gridMetrics.cellHeight + gridMetrics.gap
  const dCol = Math.round(dx / stepX)
  const dRow = Math.round(dy / stepY)
  const newCol = clamp(startCol + dCol, 0, gridMetrics.cols - item.gridColumn)
  const newRow = clamp(startRow + dRow, 0, gridMetrics.rows - item.gridRow)
  
  // 只有位置真正改变到新格子时才检测碰撞（避免频繁计算）
  const currentCol = (item as any)._col ?? 0
  const currentRow = (item as any)._row ?? 0
  
  // 如果位置改变了，检查碰撞并自动移动其他组件
  if (newCol !== currentCol || newRow !== currentRow) {
    // 只有进入新格子时才检测（避免在同一个格子内频繁检测）
    if (newCol !== lastCheckedCol || newRow !== lastCheckedRow) {
      lastCheckedCol = newCol
      lastCheckedRow = newRow
      
      // 先检查新位置是否会发生碰撞（在更新位置之前）
      const tempItem = { ...item, _col: newCol, _row: newRow }
      const allWidgets = gridItems.value.filter(i => i.type === 'widget' && i.id !== activeId)
      const collisions = allWidgets.filter(w => checkCollision(tempItem, w))
      
      if (collisions.length > 0) {
        // 有碰撞，先移动被碰撞的组件（在设置被拖拽组件新位置之前）
        const movedItems = new Set<string>()
        movedItems.add(activeId)
        
        // 创建正在拖拽组件的位置信息，用于碰撞检测
        const draggingItemPosition = {
          col: newCol,
          row: newRow,
          gridColumn: item.gridColumn,
          gridRow: item.gridRow
        }
        
        // 记录所有被碰撞的组件是否成功移动
        let allMoved = true
        
        // 创建一个Map来跟踪所有已计划的位置，避免多个组件移动到同一位置
        const plannedPositions = new Map<string, { col: number; row: number; gridColumn: number; gridRow: number }>()
        
        // 先移动所有被碰撞的组件
        collisions.forEach(collidedItem => {
          // 计算移动方向（根据拖动方向决定）
          const collidedCol = (collidedItem as any)._col ?? 0
          const collidedRow = (collidedItem as any)._row ?? 0
          const relDx = collidedCol - newCol
          const relDy = collidedRow - newRow
          
          let direction: 'right' | 'down' | 'left' | 'up' = 'right'
          // 优先向右和向下移动
          if (dCol > 0) {
            // 向右拖动，被碰撞的组件向右移动
            direction = 'right'
          } else if (dCol < 0) {
            // 向左拖动，被碰撞的组件向左移动
            direction = 'left'
          } else if (dRow > 0) {
            // 向下拖动，被碰撞的组件向下移动
            direction = 'down'
          } else if (dRow < 0) {
            // 向上拖动，被碰撞的组件向上移动
            direction = 'up'
          } else {
            // 根据相对位置决定
            if (Math.abs(relDx) > Math.abs(relDy)) {
              direction = relDx >= 0 ? 'right' : 'left'
            } else {
              direction = relDy >= 0 ? 'down' : 'up'
            }
          }
          
          // 查找位置时，传入已计划的位置，避免与其他正在移动的组件冲突
          const newPos = findEmptyPosition(collidedItem, direction, movedItems, draggingItemPosition, plannedPositions)
          if (newPos && collidedItem.id) {
            // 立即将找到的位置添加到计划集合中，供后续组件参考
            plannedPositions.set(collidedItem.id, {
              col: newPos.col,
              row: newPos.row,
              gridColumn: collidedItem.gridColumn,
              gridRow: collidedItem.gridRow
            })
            moveItemToPosition(collidedItem, newPos.col, newPos.row, movedItems, 0, draggingItemPosition, plannedPositions)
          } else if (!newPos) {
            // 如果找不到位置，尝试其他方向
            const directions: Array<'right' | 'down' | 'left' | 'up'> = ['right', 'down', 'left', 'up']
            let found = false
            for (const dir of directions) {
              if (dir !== direction) {
                const altPos = findEmptyPosition(collidedItem, dir, movedItems, draggingItemPosition, plannedPositions)
                if (altPos && collidedItem.id) {
                  // 立即将找到的位置添加到计划集合中
                  plannedPositions.set(collidedItem.id, {
                    col: altPos.col,
                    row: altPos.row,
                    gridColumn: collidedItem.gridColumn,
                    gridRow: collidedItem.gridRow
                  })
                  moveItemToPosition(collidedItem, altPos.col, altPos.row, movedItems, 0, draggingItemPosition, plannedPositions)
                  found = true
                  break
                }
              }
            }
            if (!found) {
              allMoved = false
            }
          }
        })
        
        // 在所有被碰撞的组件都移动完成后，再次检查是否还有碰撞
        // 只有在确认没有碰撞后，才更新被拖拽组件的位置
        if (allMoved) {
          const remainingWidgets = gridItems.value.filter(i => i.type === 'widget' && i.id !== activeId)
          const remainingCollisions = remainingWidgets.filter(w => checkCollision(tempItem, w))
          
          // 只有在没有剩余碰撞时，才更新位置
          if (remainingCollisions.length === 0) {
            ;(item as any)._col = newCol
            ;(item as any)._row = newRow
          }
          // 如果仍有碰撞，不更新位置，保持原位置
        }
        // 如果有组件无法移动，不更新被拖拽组件的位置，保持原位置
      } else {
        // 没有碰撞，直接更新位置
        ;(item as any)._col = newCol
        ;(item as any)._row = newRow
      }
    }
  }
}

const onOverlayPointerUp = () => {
  if (!activeId) return
  
  // 延迟重置状态，确保点击事件能先执行并检查 hasActuallyDragged 标志
  setTimeout(() => {
    isDragging.value = false
    activeId = null
    hasActuallyDragged = false
  }, 100) // 给点击事件时间来判断是否执行了拖拽
  
  debouncedSaveLayout()
}

const computeMetrics = () => {
  const bg = backgroundRef.value
  if (!bg) return
  const rect = bg.getBoundingClientRect()
  const innerWidth = rect.width - gridMetrics.gap * (gridMetrics.cols - 1)
  const innerHeight = rect.height - gridMetrics.gap * (gridMetrics.rows - 1)
  gridMetrics.cellWidth = innerWidth / gridMetrics.cols
  gridMetrics.cellHeight = innerHeight / gridMetrics.rows
}

// 为覆盖项计算样式
// @ts-ignore
const getItemStyle = (element: any) => {
  const col = element._col ?? 0
  const row = element._row ?? 0
  const left = col * (gridMetrics.cellWidth + gridMetrics.gap)
  const top = row * (gridMetrics.cellHeight + gridMetrics.gap)
  const width = element.gridColumn * gridMetrics.cellWidth + (element.gridColumn - 1) * gridMetrics.gap
  const height = element.gridRow * gridMetrics.cellHeight + (element.gridRow - 1) * gridMetrics.gap
  const isActive = activeId === element.id
  
  // 如果有背景图片，使用图片；否则使用渐变
  // 日历组件如果有backgroundImage则使用图片，否则使用透明背景显示日历内容
  let background = ''
  if (element.backgroundImage) {
    background = `url(${element.backgroundImage}) center/cover no-repeat`
  } else if (element.id === 'calendar') {
    background = 'transparent'
  } else {
    background = element.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }
  
  return {
    left: left + 'px',
    top: top + 'px',
    width: width + 'px',
    height: height + 'px',
    position: 'absolute' as const,
    background: background,
    borderRadius: '16px',
    boxShadow: isActive ? '0 12px 30px rgba(0, 0, 0, 0.25)' : '0 2px 8px rgba(0, 0, 0, 0.08)',
    zIndex: isActive ? 1000 : 1,
    cursor: isDragging.value && isActive ? 'grabbing' : 'move',
    // 拖动中的组件不应用过渡，其他组件平滑移动
    transition: isActive && isDragging.value ? 'none' : 'left 0.3s cubic-bezier(0.4, 0.0, 0.2, 1), top 0.3s cubic-bezier(0.4, 0.0, 0.2, 1), box-shadow 0.3s ease'
  }
}



const handleResize = () => {
  computeMetrics()
}

// 加载壁纸
const loadWallpaper = () => {
  const saved = localStorage.getItem('selectedWallpaper')
  if (saved) {
    try {
      const wallpaper = JSON.parse(saved)
      wallpaperUrl.value = wallpaper.url
    } catch (e) {
      console.error('加载壁纸失败:', e)
    }
  }
}

// 监听壁纸变化事件
const handleWallpaperChange = (event: Event) => {
  const customEvent = event as CustomEvent
  wallpaperUrl.value = customEvent.detail.url
}

onMounted(() => {
  userProfile.value = authStore.user
  computeMetrics()
  // 等待下一帧确保DOM已渲染
  setTimeout(() => {
    loadLayout()
  }, 0)
  // 加载用户收藏数据
  loadUserFavorites()
  // 加载壁纸
  loadWallpaper()
  // 监听壁纸变化事件
  window.addEventListener('wallpaper-changed', handleWallpaperChange)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('wallpaper-changed', handleWallpaperChange)
})
</script>

<template>
  <div class="home-container" :style="wallpaperUrl ? { backgroundImage: `url(${wallpaperUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } : {}">
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

      <!-- 覆盖式桌面网格 -->
      <div class="grid-wrapper" ref="containerRef">
        <!-- 背景网格（40格，仅视觉） -->
        <div class="grid-background" :class="{ 'dragging': isDragging }" ref="backgroundRef">
          <div v-for="n in 40" :key="n" class="grid-cell"></div>
        </div>
        <!-- 前景覆盖（组件绝对定位） -->
        <div class="grid-overlay" ref="overlayRef">
          <div
            v-for="element in gridItems.filter(i => i.type === 'widget')"
            :key="element.id"
            class="overlay-item widget-card"
            :class="[`widget-${element.id}`]"
            :style="getItemStyle(element)"
            @pointerdown="(e) => onOverlayPointerDown(e, element.id)"
            @pointermove="onOverlayPointerMove"
            @pointerup="onOverlayPointerUp"
            @click.stop="handleWidgetClick(element.id)"
          >
              <!-- 时钟组件特殊显示 -->
              <div v-if="element.id === 'clock'" class="widget-clock-preview">
                <Clock :compact-mode="true" />
              </div>
              <!-- 日历组件：如果有背景图片则不显示内容，否则显示日历内容 -->
              <template v-else-if="element.id === 'calendar' && !element.backgroundImage">
                <div class="widget-calendar-preview">
                  <Calendar :compact-mode="true" />
                </div>
              </template>
              <!-- 如果有背景图片，不显示任何内容，让背景图片显示 -->
              <!-- 计算器组件只显示背景图片，不显示图标和文字 -->
              <template v-else-if="element.id === 'calculator'">
              </template>
              <template v-else>
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
        </div>
      </div>

      <!-- 模态框 - 时钟 -->
      <div v-if="activeModal === 'clock'" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="closeModal">
            <i class="uil uil-times"></i>
          </button>
          <Clock :compact-mode="true" />
        </div>
      </div>

      <!-- 模态框 - 日历 -->
      <div v-if="activeModal === 'calendar'" class="modal-overlay" @click="closeModal">
        <div class="modal-content modal-calendar" @click.stop>
          <button class="modal-close" @click="closeModal">
            <i class="uil uil-times"></i>
          </button>
          <Calendar title="日历" :compact-mode="true" />
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

      <!-- 模态框 - 工作流 -->
      <div v-if="activeModal === 'folder2'" class="modal-overlay" @click="closeModal">
        <div class="modal-content modal-workflow" @click.stop>
          <button class="modal-close" @click="closeModal">
            <i class="uil uil-times"></i>
          </button>
          <Workflow folder-name="工作流" :initial-workflows="workflowData" />
        </div>
      </div>

      <!-- 模态框 - AI组件 -->
      <div v-if="activeModal === 'ai'" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="closeModal">
            <i class="uil uil-times"></i>
          </button>
          <AIAssistant />
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
@import '../css/homeView.css';
</style>