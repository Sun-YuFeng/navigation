<template>
  <div class="workflow-container">
    <div class="workflow-header">
      <h2>{{ folderName }}</h2>
      <button @click="goToMarket" class="add-btn">
        <i class="uil uil-plus"></i>
        添加工作流
      </button>
    </div>

    <!-- 添加工作流表单 -->
    <div v-if="showAddForm" class="add-form">
      <input 
        v-model="newWorkflow.title" 
        placeholder="工作流标题" 
        class="form-input"
      />
      <textarea 
        v-model="newWorkflow.description" 
        placeholder="工作流描述" 
        class="form-textarea"
        rows="3"
      ></textarea>
      <input 
        v-model="newWorkflow.url" 
        placeholder="工作流链接 (可选)" 
        class="form-input"
      />
      <div class="form-actions">
        <button @click="addWorkflow" class="btn-primary">添加</button>
        <button @click="cancelAdd" class="btn-secondary">取消</button>
      </div>
    </div>

    <!-- 收藏的工作流列表 - 仿照个人中心收藏 -->
    <div class="posts-grid">
      <CompactCard 
        v-for="workflow in workflows" 
        :key="workflow.id || workflow.title"
        :avatar="workflow.avatar || '/src/assets/default-avatar.png'"
        :user-name="workflow.userName || '用户'"
        :publish-time="workflow.publishTime || formatTimeAgo(workflow.createdAt)"
        :image-url="workflow.imageUrl || 'https://picsum.photos/id/0/600/400'"
        :title="workflow.title"
        :description="workflow.description"
        :tags="workflow.tags || ['工作流', '自动化']"
        :likes="workflow.likes || 0"
        :favorites="workflow.favorites || 0"
        :comments="workflow.comments || 0"
        @cardClick="openWorkflow(workflow)"
      />

      <!-- 空状态 -->
      <div v-if="workflows.length === 0" class="empty-state">
        <i class="uil uil-processor"></i>
        <p>还没有收藏的工作流</p>
        <p class="empty-hint">点击上方"添加工作流"按钮添加收藏</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue'
import { useRouter } from 'vue-router'
import CompactCard from './CompactCard.vue'

const router = useRouter()

const props = defineProps({
  folderName: {
    type: String,
    default: '工作流'
  },
  initialWorkflows: {
    type: Array,
    default: () => []
  }
})

const workflows = ref([...props.initialWorkflows])
const showAddForm = ref(false)
const newWorkflow = ref({
  title: '',
  description: '',
  url: ''
})

// 添加工作流
const addWorkflow = () => {
  if (newWorkflow.value.title && newWorkflow.value.description) {
    workflows.value.push({
      title: newWorkflow.value.title,
      description: newWorkflow.value.description,
      url: newWorkflow.value.url || '',
      createdAt: new Date().toISOString()
    })
    
    // 重置表单
    newWorkflow.value = { title: '', description: '', url: '' }
    showAddForm.value = false
  }
}

// 取消添加
const cancelAdd = () => {
  newWorkflow.value = { title: '', description: '', url: '' }
  showAddForm.value = false
}

// 删除工作流
const removeWorkflow = (index) => {
  workflows.value.splice(index, 1)
}

// 打开工作流
const openWorkflow = (workflow) => {
  // 如果工作流有ID，跳转到详情页面
  if (workflow.id) {
    router.push(`/detail/${workflow.id}`)
  } else if (workflow.url) {
    // 如果没有ID但有URL，在新窗口打开链接
    window.open(workflow.url, '_blank')
  } else {
    // 如果既没有ID也没有URL，显示提示信息
    console.log('打开工作流:', workflow.title)
  }
}

// 跳转到market界面
const goToMarket = () => {
  router.push('/market')
}

// 获取域名
const getDomain = (url) => {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch (e) {
    return '本地工作流'
  }
}

// 格式化时间显示（仿照个人中心）
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '刚刚'
  
  const now = new Date()
  const postTime = new Date(timestamp)
  const diffInSeconds = Math.floor((now - postTime) / 1000)
  
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
</script>

<style scoped>
.workflow-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.workflow-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e0e0e0;
}

.workflow-header h2 {
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

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
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

/* 帖子网格样式 - 仿照个人中心 */
.posts-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
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
  .workflow-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .workflow-header h2 {
    font-size: 1.5rem;
  }
}
</style>