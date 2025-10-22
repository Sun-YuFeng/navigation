<template>
  <div class="category-detail-container">
    <!-- 左侧导航条 -->
    <SidebarNavigation />
    
    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 分类头部 -->
      <div class="category-header">
        <div class="category-info">
          <div class="category-icon" :style="{ backgroundColor: category?.color }">
            <i :class="['uil', category?.icon]"></i>
          </div>
          <div class="category-details">
            <h1>{{ category?.name }}</h1>
            <p>{{ websites.length }} 个网站</p>
          </div>
        </div>
      </div>

      <!-- 网站网格 -->
      <div class="websites-grid">
        <div 
          v-for="website in websites" 
          :key="website.id"
          class="website-card"
          @click="openWebsite(website.url)"
        >
          <div class="website-icon">
            <i :class="['uil', website.icon || 'uil-globe']"></i>
          </div>
          <div class="website-name">{{ website.name }}</div>
        </div>
        
        <!-- 添加网站按钮 -->
        <div class="website-card add-website-card" @click="openAddWebsiteModal">
          <div class="website-icon">
            <i class="uil uil-plus"></i>
          </div>
          <div class="website-name">添加网站</div>
        </div>
      </div>
    </div>

    <!-- 添加网站模态框 -->
    <div v-if="showAddWebsiteModal" class="modal-overlay" @click="closeAddWebsiteModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>添加网站</h3>
          <button class="close-btn" @click="closeAddWebsiteModal">
            <i class="uil uil-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>网站名称</label>
            <input v-model="newWebsite.name" type="text" placeholder="输入网站名称" />
          </div>
          
          <div class="form-group">
            <label>网站地址</label>
            <input v-model="newWebsite.url" type="url" placeholder="https://example.com" />
          </div>
          
          <div class="form-group">
            <label>图标</label>
            <select v-model="newWebsite.icon">
              <option value="uil-globe">地球</option>
              <option value="uil-link">链接</option>
              <option value="uil-star">星星</option>
              <option value="uil-heart">爱心</option>
              <option value="uil-bookmark">书签</option>
            </select>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeAddWebsiteModal">取消</button>
          <button class="btn-save" @click="saveWebsite">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../supabase.js'
import SidebarNavigation from '../components/SidebarNavigation.vue'

const route = useRoute()
const categoryId = route.params.id

// 分类信息
const category = ref(null)
const websites = ref([])

// 添加网站模态框
const showAddWebsiteModal = ref(false)
const newWebsite = ref({
  name: '',
  url: '',
  icon: 'uil-globe'
})

// 加载分类信息
const loadCategory = async () => {
  try {
    const { data, error } = await supabase
      .from('user_categories')
      .select('*')
      .eq('id', categoryId)
      .single()
    
    if (!error) {
      category.value = data
    }
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 加载网站列表
const loadWebsites = async () => {
  try {
    const { data, error } = await supabase
      .from('category_websites')
      .select('*')
      .eq('category_id', categoryId)
      .order('sort_order')
    
    if (!error) {
      websites.value = data
    }
  } catch (error) {
    console.error('加载网站失败:', error)
  }
}

// 打开网站
const openWebsite = (url) => {
  window.open(url, '_blank')
}

// 打开添加网站模态框
const openAddWebsiteModal = () => {
  showAddWebsiteModal.value = true
}

// 关闭添加网站模态框
const closeAddWebsiteModal = () => {
  showAddWebsiteModal.value = false
  newWebsite.value = { name: '', url: '', icon: 'uil-globe' }
}

// 保存网站
const saveWebsite = async () => {
  if (!newWebsite.value.name || !newWebsite.value.url) {
    alert('请填写网站名称和地址')
    return
  }

  try {
    const { error } = await supabase
      .from('category_websites')
      .insert([
        {
          category_id: categoryId,
          name: newWebsite.value.name,
          url: newWebsite.value.url,
          icon: newWebsite.value.icon
        }
      ])
    
    if (error) throw error
    
    // 重新加载网站列表
    await loadWebsites()
    closeAddWebsiteModal()
  } catch (error) {
    console.error('保存网站失败:', error)
    alert('保存失败，请重试')
  }
}

// 监听路由变化
watch(() => route.params.id, (newId) => {
  if (newId) {
    loadCategory()
    loadWebsites()
  }
})

// 初始化
onMounted(() => {
  loadCategory()
  loadWebsites()
})
</script>

<style scoped>
.category-detail-container {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 60px;
  padding: 20px;
  background-color: #f5f6fa;
  min-height: 100vh;
}

.category-header {
  margin-bottom: 30px;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.category-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.category-icon i {
  font-size: 24px;
  color: white;
}

.category-details h1 {
  margin: 0 0 5px 0;
  font-size: 24px;
  color: #2c3e50;
}

.category-details p {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.websites-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 15px;
}

.website-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 10px;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  text-decoration: none;
  color: inherit;
}

.website-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-color: #3498db;
}

.add-website-card {
  background-color: #ecf0f1;
  border: 2px dashed #bdc3c7;
}

.add-website-card:hover {
  background-color: #d5dbdb;
  border-color: #95a5a6;
}

.website-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3498db, #2980b9);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.website-icon i {
  font-size: 18px;
  color: white;
}

.add-website-card .website-icon {
  background: #95a5a6;
}

.website-name {
  font-size: 12px;
  color: #2c3e50;
  text-align: center;
  font-weight: 500;
  word-break: break-all;
}

/* 模态框样式 */
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
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 20px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #7f8c8d;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.close-btn:hover {
  background-color: #ecf0f1;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #2c3e50;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel,
.btn-save {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-cancel {
  background: #ecf0f1;
  color: #7f8c8d;
}

.btn-save {
  background: #3498db;
  color: white;
}

.btn-save:hover {
  background: #2980b9;
}
</style>