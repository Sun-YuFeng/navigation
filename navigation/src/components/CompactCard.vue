<template>
  <div class="card" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave" @click="handleCardClick">
    <div class="card-container">
      <!-- 左侧图片区域 -->
      <div class="card-left">
        <img :src="imageUrl" :alt="title" class="card-img">
      </div>
      
      <!-- 右侧内容区域 -->
      <div class="card-right">
        <!-- 用户信息和标签区域 -->
        <div class="card-meta">
          <div class="user-info">
            <img :src="avatar" alt="用户头像" class="user-avatar">
            <span class="user-name">{{ userName }}</span>
            <span class="post-time">{{ publishTime }}</span>
          </div>
          <div class="tag-group">
            <span 
              v-for="tag in tags" 
              :key="tag" 
              class="tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
        
        <!-- 标题 -->
        <h3 class="card-title">{{ title }}</h3>
        
        <!-- 描述 -->
        <p class="card-desc">{{ description }}</p>
        
        <!-- 互动区域 -->
        <div class="card-interact">
          <div class="interact-stats">
            <span class="like" @click="handleLike">👍 {{ likes }}</span>
            <span class="star" @click="handleFavorite">⭐ {{ favorites }}</span>
            <span class="comment" @click="handleComment">💬 {{ comments }}</span>
          </div>
          <a href="#" class="detail-link" @click="handleDetail">查看详情</a>
        </div>
      </div>
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
    default: 'https://picsum.photos/id/64/100/100'
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
  imageUrl: {
    type: String,
    default: 'https://picsum.photos/id/0/600/400'
  },
  title: {
    type: String,
    default: '用n8n自动同步Notion数据到Excel的工作流'
  },
  description: {
    type: String,
    default: '无需代码，通过3个节点实现Notion数据库新增内容自动写入Excel，附详细步骤图和配置说明。'
  },
  tags: {
    type: Array,
    default: () => ['n8n', '办公自动化', '开源免费']
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
const emit = defineEmits(['like', 'favorite', 'comment', 'detail', 'cardClick'])

// 鼠标悬停状态
const isHovered = ref(false)

// 事件处理函数
const handleLike = () => {
  emit('like', props.likes + 1)
}

const handleFavorite = () => {
  emit('favorite', props.favorites + 1)
}

const handleComment = () => {
  emit('comment')
}

const handleDetail = (e) => {
  e.preventDefault()
  emit('detail')
}

const handleMouseEnter = () => {
  isHovered.value = true
}

const handleMouseLeave = () => {
  isHovered.value = false
}

// 处理卡片点击事件
const handleCardClick = (e) => {
  // 阻止事件冒泡，避免与内部按钮点击冲突
  e.stopPropagation()
  emit('cardClick')
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.card {
  width: 100%;
  max-width: 785px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #e0e0e0;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
}

.card-container {
  display: flex;
}

.card-left {
  flex: 0 0 220px;
  display: flex;
  align-items: flex-start;
  padding: 0.75rem; /* 缩减内边距 */
}

.card-img {
  width: 100%;
  height: 100%; /* 压缩图片高度 */
  object-fit: cover;
  display: block;
  border-radius: 8px;
}

.card-right {
  flex: 1;
  padding: 0.75rem; /* 缩减内边距 */
  display: flex;
  flex-direction: column;
}

.card-meta {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem; /* 缩减间距 */
  flex-wrap: wrap;
  gap: 0.5rem; /* 缩减间距 */
  justify-content: space-between;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* 缩减间距 */
}

.user-avatar {
  width: 28px; /* 缩小头像 */
  height: 28px; /* 缩小头像 */
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f0f0f0;
}

.user-name {
  font-weight: 600;
  color: #333333;
  font-size: 0.8rem; /* 缩小字体 */
}

.post-time {
  color: #888888;
  font-size: 0.75rem; /* 缩小字体 */
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem; /* 缩减间距 */
}

.tag {
  background-color: #f0f5ff;
  color: #165DFF;
  font-size: 0.7rem; /* 缩小字体 */
  padding: 0.2rem 0.6rem; /* 缩减内边距 */
  border-radius: 20px;
  font-weight: 500;
}

.card-title {
  font-size: 1.25rem; /* 缩小字体 */
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem; /* 缩减间距 */
  line-height: 1.3; /* 缩减行高 */
  transition: color 0.3s ease;
}

.card:hover .card-title {
  color: #165DFF;
}

.card-desc {
  color: #666666;
  font-size: 0.95rem; /* 缩小字体 */
  line-height: 1.4; /* 缩减行高 */
  margin-bottom: 0.75rem; /* 缩减间距 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-interact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.25rem; /* 缩减上内边距 */
  border-top: 1px solid #f5f5f5;
  margin-top: auto;
}

.interact-stats {
  display: flex;
  gap: 1rem; /* 缩减间距 */
}

.like, .star, .comment {
  color: #888888;
  font-size: 0.8rem; /* 缩小字体 */
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: color 0.2s ease;
  cursor: pointer;
}

.like:hover, .star:hover, .comment:hover {
  color: #165DFF;
}

.detail-link {
  color: #165DFF;
  font-size: 0.85rem; /* 缩小字体 */
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: opacity 0.2s ease;
}

.detail-link:hover {
  opacity: 0.8;
}

.detail-link::after {
  content: "→";
  font-size: 0.8rem; /* 缩小字体 */
}

@media (max-width: 768px) {
  .card-container {
    flex-direction: column;
  }
  
  .card-left {
    flex: 0 0 150px; /* 压缩移动端图片高度 */
    align-self: center;
  }
  
  .card-meta {
    flex-direction: column;
    align-items: flex-start !important;
  }
  
  .tag-group {
    margin-top: 0.25rem; /* 缩减间距 */
  }
}
</style>