<template>
  <div class="topic-card sticky-card">
    <div class="topic-header">
      <i class="uil uil-fire"></i>
      <h3>热门话题</h3>
    </div>
    <ul class="topic-list">
      <li 
        v-for="(topic, index) in topics" 
        :key="topic.id"
        :class="{ divider: index < topics.length - 1 }"
        @click="handleTopicClick(topic.id)"
      >
        <div>
          <span 
            v-if="index < 3" 
            :class="['rank-tag', { top1: index === 0, other: index > 0 }]"
          >
            TOP {{ index + 1 }}
          </span>
          {{ topic.title }}
        </div>
        <span class="view-count">
          <i class="uil uil-eye"></i> {{ formatViewCount(topic.viewCount) }}
        </span>
      </li>
    </ul>
    <div class="view-all" @click="handleViewAllTopics">
      查看全部 <i class="uil uil-angle-right"></i>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 定义组件属性
const props = defineProps({
  // 话题数据
  topics: {
    type: Array,
    default: () => [
      {
        id: 1,
        title: 'AI工作流自动化最佳实践',
        viewCount: 12500
      },
      {
        id: 2,
        title: 'n8n vs Zapier性能对比',
        viewCount: 9800
      },
      {
        id: 3,
        title: '企业级自动化解决方案',
        viewCount: 7300
      },
      {
        id: 4,
        title: '低代码平台发展趋势',
        viewCount: 6100
      },
      {
        id: 5,
        title: '智能体应用场景分析',
        viewCount: 5400
      },
      {
        id: 6,
        title: '数据自动化处理技巧',
        viewCount: 4900
      }
    ]
  }
})

// 定义组件事件
const emit = defineEmits(['topicClick', 'viewAll'])

// 格式化浏览量显示
const formatViewCount = (count) => {
  if (count >= 10000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count.toLocaleString()
}

// 处理话题点击
const handleTopicClick = (topicId) => {
  emit('topicClick', topicId)
}

// 处理查看全部
const handleViewAllTopics = () => {
  emit('viewAll')
}
</script>

<style scoped>
/* 热门话题卡片样式 */
.topic-card {
  background-color: #fff;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  border: 1px solid #E5E7EB;
  width: 100%;
  height: fit-content;
}

/* 固定热门话题卡片 */
.sticky-card {
  position: sticky;
  top: 70px; /* 距离顶部70px，避免与顶部导航重叠 */
  z-index: 10;
}

/* 话题头部样式 */
.topic-header {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.05));
  color: #6366F1;
  font-weight: 600;
}

.topic-header i {
  font-size: 1.25rem;
  margin-right: 0.5rem;
}

.topic-header h3 {
  font-size: 1.125rem;
  margin: 0;
}

/* 话题列表样式 */
.topic-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.topic-list li {
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.topic-list li:hover {
  background-color: #F3F4F6;
  padding-left: calc(1rem + 2px);
}

.topic-list .divider {
  border-bottom: 1px solid #E5E7EB;
}

/* 排名标签样式 */
.rank-tag {
  font-size: 0.75rem;
  font-weight: 700;
  margin-right: 0.5rem;
}

.rank-tag.top1 {
  color: #F59E0B;
}

.rank-tag.other {
  color: #6B7280;
}

/* 浏览量样式 */
.view-count {
  color: #6B7280;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.view-count i {
  font-size: 0.875rem;
}

/* 查看全部样式 */
.view-all {
  padding: 0.75rem 1rem;
  text-align: right;
  color: #6366F1;
  font-size: 0.875rem;
  cursor: pointer;
  border-top: 1px solid #E5E7EB;
}

.view-all:hover {
  text-decoration: underline;
}

.view-all i {
  font-size: 0.75rem;
  margin-left: 0.25rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .topic-card {
    position: static;
    margin-top: 20px;
  }
  
  .topic-list li {
    padding: 0.75rem 1rem;
  }
}
</style>