<template>
  <div v-if="show" class="speech-bubble-container" :style="containerStyle">
    <!-- 气泡三角 -->
    <div class="speech-bubble-triangle" :style="triangleStyle"></div>
    
    <!-- 气泡内容 -->
    <div class="speech-bubble" @click.stop>
      <div class="bubble-header">
        <span class="bubble-title">选择创建分类</span>
        <button class="bubble-close-btn" @click="closePicker">
          <i class="uil uil-times"></i>
        </button>
      </div>
      
      <div class="bubble-categories-grid">
        <div 
          v-for="category in availableCategories" 
          :key="category.name"
          class="bubble-category-option"
          @click="selectCategory(category)"
        >
          <div class="bubble-category-icon">
            <i :class="['uil', category.icon]"></i>
          </div>
          <span class="bubble-category-name">{{ category.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { supabase } from '../supabase.js'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const show = ref(false)
const buttonPosition = ref(null)

// 计算容器样式
const containerStyle = computed(() => {
  if (!buttonPosition.value) return {}
  
  const buttonRect = buttonPosition.value
  return {
    top: `${buttonRect.top + buttonRect.height / 2}px`,
    left: `${buttonRect.left + buttonRect.width}px`
  }
})

// 计算三角形样式
const triangleStyle = computed(() => {
  if (!buttonPosition.value) return {}
  
  const buttonRect = buttonPosition.value
  return {
    top: `${buttonRect.height / 2 - 8}px`,
    left: '-8px'
  }
})

// 可用的分类选项
const availableCategories = ref([
  { name: 'AI', icon: 'uil-robot', color: '#3498db' },
  { name: '购物', icon: 'uil-shopping-cart', color: '#e74c3c' },
  { name: '娱乐', icon: 'uil-game-structure', color: '#9b59b6' },
  { name: '影视', icon: 'uil-film', color: '#e67e22' },
  { name: '编程', icon: 'uil-desktop', color: '#2ecc71' },
  { name: '音乐', icon: 'uil-music', color: '#1abc9c' },
  { name: '媒体', icon: 'uil-play-circle', color: '#f39c12' },
  { name: '学习', icon: 'uil-book-open', color: '#34495e' },
  { name: '阅读', icon: 'uil-book', color: '#16a085' },
  { name: '设计', icon: 'uil-palette', color: '#8e44ad' }
])

// 打开选择器
const openPicker = (buttonRect) => {
  buttonPosition.value = buttonRect
  show.value = true
}

// 关闭选择器
const closePicker = () => {
  show.value = false
}

// 选择分类
const selectCategory = async (category) => {
  try {
    const { data, error } = await supabase
      .from('user_categories')
      .insert([
        {
          user_id: authStore.user.id,
          name: category.name,
          icon: category.icon,
          color: category.color
        }
      ])
      .select()
    
    if (error) throw error
    
    // 触发自定义事件
    emit('categoryAdded', data[0])
    closePicker()
  } catch (error) {
    console.error('添加分类失败:', error)
  }
}

// 定义事件
const emit = defineEmits(['categoryAdded'])

// 暴露方法给父组件
defineExpose({
  openPicker,
  closePicker
})
</script>

<style scoped>
.speech-bubble-container {
  position: fixed;
  z-index: 2000;
}

.speech-bubble-triangle {
  position: absolute;
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 8px solid rgba(108, 117, 125, 0.7);
  filter: drop-shadow(-2px 0 2px rgba(0, 0, 0, 0.2));
}

.speech-bubble {
  background: rgba(108, 117, 125, 0.7);
  border-radius: 12px;
  padding: 15px;
  max-width: 280px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.bubble-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.bubble-title {
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.bubble-close-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s;
}

.bubble-close-btn:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

.bubble-categories-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.bubble-category-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.bubble-category-option:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.bubble-category-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
  transition: all 0.3s ease;
}

.bubble-category-option:hover .bubble-category-icon {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.bubble-category-icon i {
  font-size: 14px;
  color: white;
}

.bubble-category-name {
  font-size: 10px;
  color: white;
  text-align: center;
  font-weight: 500;
  line-height: 1.2;
}
</style>