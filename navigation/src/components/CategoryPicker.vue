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
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase.js'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const show = ref(false)
const buttonPosition = ref(null)
const userExistingCategories = ref([])

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

// 从数据库加载所有可用的分类选项（排除媒体分类）
const allCategories = ref([])

// 加载数据库中的分类模板
const loadCategoryTemplates = async () => {
  try {
    const { data, error } = await supabase
      .from('category_templates')
      .select('*')
      .neq('name', '媒体') // 排除媒体分类，因为它是默认分类
      .order('sort_order')
    
    if (!error && data) {
      allCategories.value = data.map(template => ({
        name: template.name,
        icon: template.icon,
        color: template.color
      }))
    }
  } catch (error) {
    console.error('加载分类模板失败:', error)
  }
}

// 过滤后的可用分类选项（排除用户已有的分类）
const availableCategories = computed(() => {
  const existingNames = userExistingCategories.value.map(cat => cat.name)
  return allCategories.value.filter(cat => !existingNames.includes(cat.name))
})

// 加载用户已有分类
const loadUserCategories = async () => {
  if (!authStore.user?.id) return
  
  try {
    const { data, error } = await supabase
      .from('user_category_mappings')
      .select(`
        *,
        category_templates (
          name,
          icon,
          color
        )
      `)
      .eq('user_id', authStore.user.id)
    
    if (!error && data) {
      userExistingCategories.value = data.map(mapping => ({
        name: mapping.category_templates.name,
        icon: mapping.category_templates.icon,
        color: mapping.category_templates.color
      }))
    }
  } catch (error) {
    console.error('加载用户分类失败:', error)
  }
}

// 打开选择器
const openPicker = async (buttonRect) => {
  buttonPosition.value = buttonRect
  await loadUserCategories()
  
  // 检查是否已达到最大分类数量（6个）
  if (userExistingCategories.value.length >= 6) {
    alert('您已达到最大分类数量限制（6个），无法添加更多分类。')
    return
  }
  
  show.value = true
}

// 关闭选择器
const closePicker = () => {
  show.value = false
}

// 选择分类
const selectCategory = async (category) => {
  try {
    if (!authStore.user?.id) {
      console.error('用户未登录')
      return
    }

    // 1. 首先获取对应的分类模板ID
    const { data: templateData, error: templateError } = await supabase
      .from('category_templates')
      .select('id')
      .eq('name', category.name)
      .single()
    
    if (templateError) throw templateError
    
    // 2. 在user_category_mappings表中创建用户映射
    const { error: mappingError } = await supabase
      .from('user_category_mappings')
      .insert([{
        user_id: authStore.user.id,
        template_id: templateData.id,
        sort_order: await getNextSortOrder()
      }])
    
    if (mappingError) throw mappingError
    
    // 触发自定义事件
    emit('categoryAdded', { ...category, id: templateData.id })
    closePicker()
  } catch (error) {
    console.error('添加分类失败:', error)
  }
}

// 获取下一个排序序号
const getNextSortOrder = async () => {
  const { data, error } = await supabase
    .from('user_category_mappings')
    .select('sort_order')
    .eq('user_id', authStore.user.id)
    .order('sort_order', { ascending: false })
    .limit(1)
  
  if (error) {
    console.error('获取排序序号失败:', error)
    return 0
  }
  
  return data.length > 0 ? data[0].sort_order + 1 : 0
}

// 定义事件
const emit = defineEmits(['categoryAdded'])

// 暴露方法给父组件
defineExpose({
  openPicker,
  closePicker
})

// 初始化时加载用户分类和分类模板
onMounted(() => {
  loadCategoryTemplates()
  if (authStore.user?.id) {
    loadUserCategories()
  }
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