<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>添加新分类</h3>
        <button @click="closeModal" class="modal-close-btn">×</button>
      </div>
      
      <div class="modal-body">
        <!-- 分类名称输入 -->
        <div class="input-group">
          <label>分类名称</label>
          <input 
            v-model="newCategory.name" 
            placeholder="请输入分类名称" 
            class="category-input"
            maxlength="20"
          >
          <span class="char-count">{{ newCategory.name.length }}/20</span>
        </div>
        
        <!-- 图标选择 -->
        <div class="input-group">
          <label>选择图标</label>
          <div class="icon-grid">
            <div 
              v-for="icon in availableIcons" 
              :key="icon" 
              :class="['icon-item', { 'selected': newCategory.icon === icon }]"
              @click="selectIcon(icon)"
            >
              <i :class="['uil', icon]"></i>
            </div>
          </div>
        </div>
        
        <!-- 颜色选择 -->
        <div class="input-group">
          <label>选择颜色</label>
          <div class="color-grid">
            <div 
              v-for="color in availableColors" 
              :key="color" 
              :class="['color-item', { 'selected': newCategory.color === color }]"
              :style="{ backgroundColor: color }"
              @click="selectColor(color)"
            ></div>
          </div>
        </div>
        
        <!-- 分类描述 -->
        <div class="input-group">
          <label>分类描述（可选）</label>
          <textarea 
            v-model="newCategory.description" 
            placeholder="请输入分类描述" 
            class="category-textarea"
            rows="2"
            maxlength="100"
          ></textarea>
          <span class="char-count">{{ newCategory.description.length }}/100</span>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="closeModal" class="cancel-btn">取消</button>
        <button @click="saveCategory" class="save-btn" :disabled="!isFormValid">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { supabase } from '../supabase.js'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'categoryAdded'])

const authStore = useAuthStore()

// 新分类数据
const newCategory = ref({
  name: '',
  icon: 'uil-folder',
  color: '#3498db',
  description: ''
})

// 可用图标列表
const availableIcons = [
  'uil-folder',
  'uil-star',
  'uil-heart',
  'uil-bookmark',
  'uil-tag',
  'uil-palette',
  'uil-music',
  'uil-video',
  'uil-camera',
  'uil-game',
  'uil-graduation-cap',
  'uil-briefcase',
  'uil-shopping-cart',
  'uil-utensils',
  'uil-car',
  'uil-home',
  'uil-plane',
  'uil-medical',
  'uil-flask',
  'uil-code'
]

// 可用颜色列表
const availableColors = [
  '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6',
  '#1abc9c', '#d35400', '#c0392b', '#16a085', '#8e44ad',
  '#27ae60', '#2980b9', '#f1c40f', '#e67e22', '#95a5a6'
]

// 表单验证
const isFormValid = computed(() => {
  return newCategory.value.name.trim().length > 0 && 
         newCategory.value.name.trim().length <= 20
})

// 选择图标
const selectIcon = (icon) => {
  newCategory.value.icon = icon
}

// 选择颜色
const selectColor = (color) => {
  newCategory.value.color = color
}

// 关闭模态框
const closeModal = () => {
  emit('update:show', false)
  resetForm()
}

// 重置表单
const resetForm = () => {
  newCategory.value = {
    name: '',
    icon: 'uil-folder',
    color: '#3498db',
    description: ''
  }
}

// 保存分类
const saveCategory = async () => {
  if (!isFormValid.value || !authStore.user?.id) return
  
  try {
    // 1. 首先在category_templates表中创建新的分类模板
    const { data: templateData, error: templateError } = await supabase
      .from('category_templates')
      .insert([{
        name: newCategory.value.name.trim(),
        icon: newCategory.value.icon,
        color: newCategory.value.color,
        description: newCategory.value.description.trim(),
        is_default: false,
        created_by: authStore.user.id
      }])
      .select()
      .single()
    
    if (templateError) throw templateError
    
    // 2. 然后在user_category_mappings表中创建用户映射
    const { error: mappingError } = await supabase
      .from('user_category_mappings')
      .insert([{
        user_id: authStore.user.id,
        template_id: templateData.id,
        sort_order: await getNextSortOrder()
      }])
    
    if (mappingError) throw mappingError
    
    // 3. 发送成功事件
    emit('categoryAdded', templateData)
    closeModal()
    
  } catch (error) {
    console.error('保存分类失败:', error)
    alert('保存分类失败，请重试')
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

// 监听show属性变化
watch(() => props.show, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.3s;
}

.modal-close-btn:hover {
  color: #333;
  background: #f5f5f5;
}

.modal-body {
  padding: 24px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.category-input, .category-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.category-input:focus, .category-textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
}

.category-textarea {
  resize: vertical;
  min-height: 60px;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-top: 8px;
}

.icon-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 2px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 18px;
  color: #666;
}

.icon-item:hover {
  border-color: #3498db;
  color: #3498db;
}

.icon-item.selected {
  border-color: #3498db;
  background-color: #3498db;
  color: white;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-top: 8px;
}

.color-item {
  width: 30px;
  height: 30px;
  border: 2px solid #eee;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
}

.color-item:hover {
  transform: scale(1.1);
}

.color-item.selected {
  border-color: #333;
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #eee;
  justify-content: flex-end;
}

.cancel-btn, .save-btn {
  padding: 10px 20px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn {
  background: #fff;
  color: #666;
}

.cancel-btn:hover {
  background: #f5f5f5;
  border-color: #999;
}

.save-btn {
  background: #3498db;
  color: #fff;
  border-color: #3498db;
}

.save-btn:hover:not(:disabled) {
  background: #2980b9;
  border-color: #2980b9;
}

.save-btn:disabled {
  background: #bdc3c7;
  border-color: #bdc3c7;
  cursor: not-allowed;
}
</style>