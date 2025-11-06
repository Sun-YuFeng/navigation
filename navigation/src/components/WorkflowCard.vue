<template>
  <div class="card" @click="handleCardClick">
    <!-- 用户信息区域 -->
    <div class="user-info">
      <div class="user-left">
        <img :src="avatar" alt="用户头像" class="user-avatar">
        <span class="user-name">{{ userName }}</span>
      </div>
      <span class="publish-time">{{ publishTime }}</span>
    </div>
    
    <!-- 标签区域 -->
    <div class="tags">
      <span 
        v-for="tag in tags" 
        :key="tag" 
        class="tag"
      >
        {{ tag }}
      </span>
    </div>
    
    <!-- 标题区域 -->
    <div class="card-title">
      {{ title }}
    </div>
    
    <!-- 图片区域 -->
    <div class="card-image">
      <img 
        :src="imageUrl" 
        :alt="title" 
        class="card-img"
      >
    </div>
    
    <!-- 描述区域 -->
    <div class="card-desc">
      {{ description }}
    </div>
    
    <!-- 互动数据区域 -->
    <div class="card-actions">
      <div class="action-group">
        <div class="action-item">
          <i class="uil uil-thumbs-up"></i>
          <span>{{ likes }}</span>
        </div>
        <div class="action-item">
          <i class="uil uil-star"></i>
          <span>{{ favorites }}</span>
        </div>
        <div class="action-item" @click="handleComment">
          <i class="uil uil-comment-alt"></i>
          <span>{{ comments }}</span>
        </div>
      </div>
      <a href="#" class="detail-link" @click="handleDetail">查看详情</a>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue'

// 定义组件属性
const props = defineProps({
  // 用户信息
  avatar: {
    type: String,
    default: 'https://picsum.photos/id/1005/40/40'
  },
  userName: {
    type: String,
    default: '张小明'
  },
  publishTime: {
    type: String,
    default: '3小时前'
  },
  
  // 内容信息
  tags: {
    type: Array,
    default: () => ['n8n', '办公自动化', '开源免费']
  },
  title: {
    type: String,
    default: '用n8n自动同步Notion数据到Excel的工作流'
  },
  imageUrl: {
    type: String,
    default: 'https://p11-flow-imagex-download-sign.byteimg.com/tos-cn-i-a9rns2rl98/13d145d4b7704a7197dbeab1c412dcba.png~tplv-a9rns2rl98-24:720:720.png?rcl=2025103108173094F4DEC7B354C2A595B7&rk3s=8e244e95&rrcfp=8a172a1a&x-expires=1762474651&x-signature=SzqZ0TUmLFHe1O494yLVua92PCY%3D'
  },
  description: {
    type: String,
    default: '无需代码，通过3个节点实现Notion数据库新增内容自动写入Excel，附详细步骤图和配置说明。'
  },
  
  // 互动数据
  likes: {
    type: Number,
    default: 128
  },
  favorites: {
    type: Number,
    default: 56
  },
  comments: {
    type: Number,
    default: 12
  }
})

// 定义组件事件
const emit = defineEmits(['comment', 'detail', 'cardClick'])

const handleComment = () => {
  emit('comment')
}

const handleDetail = (e) => {
  e.preventDefault()
  emit('detail')
}

// 处理卡片点击事件
const handleCardClick = (e) => {
  // 阻止事件冒泡，避免与内部按钮点击冲突
  e.stopPropagation()
  emit('cardClick')
}
</script>

<style scoped>
/* 基础样式重置与全局设置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', system-ui, sans-serif;
}

/* 卡片核心样式 - 增大圆角至16px */
.card {
  max-width: 385px;
  width: 100%;
  background-color: #ffffff;
  border-radius: 16px; /* 圆角增大 */
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f1f1;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

/* 用户信息区域 */
.user-info {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 8px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #1D2129;
}

.publish-time {
  font-size: 12px;
  color: #86909C;
}

.user-left {
  display: flex;
  align-items: center;
}

/* 标签区域 */
.tags {
  padding: 0 16px 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  font-size: 12px;
  color: #165DFF;
  background-color: rgba(22, 93, 255, 0.08);
  padding: 4px 8px;
  border-radius: 12px;
}

/* 标题区域 */
.card-title {
  padding: 0 16px 12px;
  font-size: 16px;
  font-weight: 600;
  color: #1D2129;
  line-height: 1.4;
}

/* 图片区域 */
.card-image {
  width: 92%;
  height: 160px;
  overflow: hidden;
  border-radius: 12px;
  margin: 10px auto ;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

/* 描述区域 */
.card-desc {
  padding: 16px;
  font-size: 14px;
  color: #86909C;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}

/* 互动区域 */
.card-actions {
  padding: 0 16px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
}

.action-group {
  display: flex;
  align-items: center;
  gap: 24px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #86909C;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-item:hover {
  color: #165DFF;
}



.detail-link {
  color: #165DFF;
  text-decoration: none;
}

.detail-link:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card {
    max-width: 100%;
    margin: 0 16px;
  }
  
  .action-group {
    gap: 16px;
  }
  
  .user-info {
    padding: 12px;
  }
  
  .card-title {
    padding: 0 12px 8px;
  }
  
  .card-desc {
    padding: 12px;
  }
  
  .card-actions {
    padding: 0 12px 12px;
  }
}
</style>