<template>
  <div class="folder-container">
    <div class="folder-header">
      <h2>{{ folderName }}</h2>
      <button @click="showAddForm = !showAddForm" class="add-btn">
        <i class="uil uil-plus"></i>
        添加网站
      </button>
    </div>

    <!-- 添加网站表单 -->
    <div v-if="showAddForm" class="add-form">
      <input 
        v-model="newWebsite.name" 
        placeholder="网站名称" 
        class="form-input"
      />
      <input 
        v-model="newWebsite.url" 
        placeholder="网站地址 (https://...)" 
        class="form-input"
      />
      <div class="form-actions">
        <button @click="addWebsite" class="btn-primary">添加</button>
        <button @click="cancelAdd" class="btn-secondary">取消</button>
      </div>
    </div>

    <!-- 网站列表 -->
    <div class="websites-grid">
      <div 
        v-for="(site, index) in websites" 
        :key="index" 
        class="website-item"
      >
        <a :href="site.url" target="_blank" class="website-link">
          <div class="website-icon">
            <img 
              :src="`https://www.google.com/s2/favicons?domain=${getDomain(site.url)}&sz=64`" 
              :alt="site.name"
              @error="handleImageError"
            />
          </div>
          <div class="website-name">{{ site.name }}</div>
        </a>
        <button @click="removeWebsite(index)" class="delete-btn">
          <i class="uil uil-times"></i>
        </button>
      </div>

      <!-- 空状态 -->
      <div v-if="websites.length === 0" class="empty-state">
        <i class="uil uil-folder-open"></i>
        <p>文件夹是空的</p>
        <p class="empty-hint">点击上方"添加网站"按钮添加网站</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue'

const props = defineProps({
  folderName: {
    type: String,
    default: '我的收藏'
  },
  initialWebsites: {
    type: Array,
    default: () => []
  }
})

const websites = ref([...props.initialWebsites])
const showAddForm = ref(false)
const newWebsite = ref({
  name: '',
  url: ''
})

// 添加网站
const addWebsite = () => {
  if (newWebsite.value.name && newWebsite.value.url) {
    // 确保URL有协议
    let url = newWebsite.value.url
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }
    
    websites.value.push({
      name: newWebsite.value.name,
      url: url
    })
    
    // 重置表单
    newWebsite.value = { name: '', url: '' }
    showAddForm.value = false
  }
}

// 取消添加
const cancelAdd = () => {
  newWebsite.value = { name: '', url: '' }
  showAddForm.value = false
}

// 删除网站
const removeWebsite = (index) => {
  websites.value.splice(index, 1)
}

// 获取域名
const getDomain = (url) => {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch (e) {
    return 'example.com'
  }
}

// 处理图片加载失败
const handleImageError = (e) => {
  e.target.style.display = 'none'
  e.target.parentElement.innerHTML = '<i class="uil uil-link"></i>'
}
</script>

<style scoped>
.folder-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.folder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e0e0e0;
}

.folder-header h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

/* 添加表单 */
.add-form {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 15px;
  margin-bottom: 30px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-actions {
  display: flex;
  gap: 10px;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

/* 网站网格 */
.websites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 20px;
  min-height: 200px;
}

.website-item {
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.website-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.website-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: inherit;
}

.website-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #667eea;
}

.website-icon img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
}

.website-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  text-align: center;
  word-break: break-word;
  line-height: 1.4;
}

.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 0, 0, 0.1);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  color: #ff0000;
  font-size: 14px;
}

.website-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: rgba(255, 0, 0, 0.2);
  transform: scale(1.1);
}

/* 空状态 */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 16px;
  margin: 8px 0;
}

.empty-hint {
  font-size: 14px;
  color: #bbb;
}

/* 响应式 */
@media (max-width: 768px) {
  .folder-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .folder-header h2 {
    font-size: 1.5rem;
  }
  
  .websites-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 15px;
  }
}
</style>

