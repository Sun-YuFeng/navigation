<template>
  <div class="classify-page">
    <SidebarNavigation />
    
    <div class="classify-container">
      <div class="classify-header">
        <h1>媒体分类</h1>
        <p>管理您的媒体内容</p>
      </div>
      
      <div class="grid-container">
        <!-- 7x3 网格布局 -->
        <div 
          v-for="(item, index) in gridItems" 
          :key="index"
          class="grid-item"
          :class="{ 
            'add-item': item.type === 'add', 
            'media-item': item.type === 'media',
            'placeholder-item': item.type === 'placeholder'
          }"
          @click="handleGridClick(index)"
        >
          <div v-if="item.type === 'add'" class="add-content">
            <div class="plus-icon">+</div>
            <span class="add-text">添加媒体</span>
          </div>
          <div v-else-if="item.type === 'media'" class="media-content">
            <span>{{ item.content }}</span>
          </div>
          <div v-else class="placeholder-content">
            <span></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SidebarNavigation from '../components/SidebarNavigation.vue'

// 网格数据
const gridItems = ref([])
const addButtonPosition = ref(0) // 加号格子的位置

// 初始化网格
const initializeGrid = () => {
  const totalGrids = 21 // 7x3 = 21个格子
  gridItems.value = Array(totalGrids).fill(null).map((_, index) => ({
    id: index,
    type: index === addButtonPosition.value ? 'add' : 'placeholder',
    content: index < addButtonPosition.value ? `媒体 ${index + 1}` : null
  }))
}

// 处理网格点击事件
const handleGridClick = (index) => {
  if (gridItems.value[index].type === 'add') {
    // 点击了添加按钮
    if (addButtonPosition.value === gridItems.value.length - 1) {
      // 加号在最后一个位置，不能再添加
      alert('不能再添加了，格子已满！')
      return
    }
    
    // 添加新的媒体格子
    addButtonPosition.value++
    
    // 更新网格数据
    gridItems.value = gridItems.value.map((item, i) => {
      if (i < addButtonPosition.value) {
        // 已添加的媒体格子
        return {
          ...item,
          type: 'media',
          content: `媒体 ${i + 1}`
        }
      } else if (i === addButtonPosition.value) {
        // 新的加号位置
        return {
          ...item,
          type: 'add'
        }
      } else {
        // 占位符格子
        return {
          ...item,
          type: 'placeholder'
        }
      }
    })
    
    console.log(`添加了媒体格子 ${addButtonPosition.value}`)
  } else if (gridItems.value[index].type === 'media') {
    // 点击了媒体格子
    console.log(`点击了${gridItems.value[index].content}`)
    // 后续可以在这里添加媒体详情或编辑逻辑
  }
}

// 初始化
initializeGrid()
</script>

<style scoped>
.classify-container {
  padding: 30px 80px; /* 增加左右边距，留出更多空白空间 */
  margin-left: 60px; /* 为左侧导航栏留出空间 */
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.classify-header {
  text-align: center;
  margin-bottom: 30px;
}

.classify-header h1 {
  font-size: 2.2rem;
  color: #2c3e50;
  margin-bottom: 10px;
  font-weight: 600;
}

.classify-header p {
  font-size: 1rem;
  color: #7f8c8d;
  margin: 0;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 15px; /* 减小格子间距 */
  max-width: 1200px; /* 减小最大宽度 */
  margin: 0 auto;
  padding: 20px 40px; /* 增加网格容器的内边距 */
}

/* 占位符格子的样式 - 完全隐藏但保持布局 */
.placeholder-item {
  background: transparent;
  border: 2px solid transparent;
  box-shadow: none;
  cursor: default;
  visibility: hidden; /* 完全隐藏 */
}

.placeholder-item:hover {
  transform: none;
  box-shadow: none;
}

/* 媒体格子的样式 */
.media-item {
  background: #ecf0f1;
  border: 2px solid #bdc3c7;
}

.media-item:hover {
  background: #d5dbdb;
}

/* 添加按钮的特殊样式 */
.add-item {
  background: #ecf0f1; /* 灰色背景 */
  border: none; /* 移除边框 */
}

.add-item:hover {
  background: #d5dbdb; /* 悬停时深灰色 */
  transform: scale(1.02);
}

.grid-item {
  aspect-ratio: 1;
  border-radius: 10px;
  background: #ecf0f1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  min-height: 80px; /* 设置最小高度 */
}

.grid-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.add-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.plus-icon {
  font-size: 2rem; /* 减小加号大小 */
  font-weight: 300;
  line-height: 1;
  margin-bottom: 5px;
}

.add-text {
  font-size: 0.8rem; /* 减小文字大小 */
  font-weight: 500;
}

.media-content {
  color: #2c3e50;
  font-size: 0.9rem;
  font-weight: 500;
}

.placeholder-content {
  display: none; /* 隐藏占位符内容 */
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .grid-container {
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(6, 1fr);
  }
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(10, 1fr);
    gap: 15px;
  }
  
  .classify-container {
    margin-left: 0;
    padding: 10px;
  }
  
  .classify-header h1 {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(14, 1fr);
    gap: 10px;
  }
}
</style>