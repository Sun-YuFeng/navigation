<template>
  <div class="hot-recommend-card">
    <div class="hot-recommend-header">
      <i class="uil uil-fire"></i>
      <h3>热门推荐</h3>
    </div>
    <div 
      class="hot-item" 
      v-for="item in displayItems" 
      :key="item.id"
      @click="handleItemClick(item.id)"
    >
      <div class="hot-item-img">
        <img :src="item.imageUrl" :alt="item.title">
      </div>
      <div class="hot-item-content">
        <h4 class="hot-item-title">{{ item.title }}</h4>
        <p class="hot-item-meta">{{ item.usageCount }} 人使用</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, onMounted, computed } from 'vue'
import { getTopViewedArticles, incrementArticleViewCount } from '@/services/articleService.js'

// 定义组件属性
const props = defineProps({
  // 热门项目数据（可选，如果提供则使用提供的数据，否则从数据库获取）
  hotItems: {
    type: Array,
    default: null
  },
  // 是否自动从数据库加载数据
  autoLoad: {
    type: Boolean,
    default: true
  }
})

// 定义组件事件
const emit = defineEmits(['item-click'])

// 响应式数据
const hotItemsData = ref([])
const loading = ref(false)

// 处理项目点击事件
const handleItemClick = async (itemId) => {
  // 增加文章浏览量
  await incrementArticleViewCount(itemId)
  
  // 触发父组件事件
  emit('item-click', itemId)
}

// 从数据库加载热门文章数据
const loadHotArticles = async () => {
  if (!props.autoLoad) return
  
  loading.value = true
  try {
    const articles = await getTopViewedArticles()
    hotItemsData.value = articles
  } catch (error) {
    console.error('加载热门文章失败:', error)
    // 如果加载失败，使用默认数据作为后备
    hotItemsData.value = getDefaultHotItems()
  } finally {
    loading.value = false
  }
}

// 获取默认的热门项目数据（后备方案）
const getDefaultHotItems = () => {
  return [
    {
      id: 1,
      imageUrl: 'https://picsum.photos/200/200?random=30',
      title: '用ChatGPT+Zapier打造全自动内容发布流水线',
      usageCount: '1.2k'
    },
    {
      id: 2,
      imageUrl: 'https://picsum.photos/200/200?random=31',
      title: 'n8n自动化处理邮件附件并保存到云盘',
      usageCount: '986'
    },
    {
      id: 3,
      imageUrl: 'https://picsum.photos/200/200?random=32',
      title: '智能体：自动分析竞品价格并生成报告',
      usageCount: '753'
    }
  ]
}

// 计算最终显示的数据
const displayItems = computed(() => {
  // 如果父组件提供了数据，优先使用父组件的数据
  if (props.hotItems && props.hotItems.length > 0) {
    return props.hotItems
  }
  // 否则使用从数据库加载的数据
  return hotItemsData.value
})

// 组件挂载时加载数据
onMounted(() => {
  loadHotArticles()
})
</script>

<style scoped>
.hot-recommend-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.hot-recommend-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.hot-recommend-header i {
  color: #ff6b6b;
  font-size: 20px;
  margin-right: 8px;
}

.hot-recommend-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.hot-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f3f4;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.hot-item:hover {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin: 0 -12px;
}

.hot-item:last-child {
  border-bottom: none;
}

.hot-item-img {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 12px;
}

.hot-item-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hot-item-content {
  flex: 1;
  min-width: 0;
}

.hot-item-title {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  margin: 0 0 4px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hot-item-meta {
  font-size: 12px;
  color: #6c757d;
  margin: 0;
}
</style>