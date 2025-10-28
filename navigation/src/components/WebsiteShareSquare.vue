<template>
  <div class="website-share-square">
    <!-- 最外层大卡片 -->
    <div class="main-container">
      <h1 class="main-title">📍广场-分享你喜欢的网站</h1>
      
      <div class="content-wrapper">
        <div class="left-content">
          <!-- 热门卡片 -->
          <div class="hot-card">
            <h2 class="hot-title">热门🔥</h2>
            <ul class="hot-list">
              <li 
                v-for="(site, index) in hotSites" 
                :key="index" 
                class="hot-site-item"
                @click="handleSiteClick(site)"
              >
                <div class="site-content">
                  <span class="site-name">{{ site.name }}</span>
                  <div class="site-meta">
                    <span class="meta-item">上传人：{{ site.uploader }}</span>
                    <span class="meta-item">上传时间：{{ site.uploadTime }}</span>
                    <span class="meta-item">使用次数：{{ site.usageCount }}</span>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          
          <!-- 所有分享 -->
          <div class="all-share">
            <h2 class="all-share-title">所有分享🥰</h2>
            <input 
              type="text" 
              class="search-box" 
              placeholder="搜索网站..."
              v-model="searchKeyword"
              @input="handleSearch"
            >
            
            <div class="share-container">
              <div class="share-items">
                <div 
                  v-for="(site, index) in filteredSites" 
                  :key="index" 
                  class="share-item"
                  @click="handleSiteClick(site)"
                  :title="`分享人：${site.uploader} | 分享时间：${site.uploadTime}`"
                >
                  <div class="card-icon-container">
                    <div class="default-icon">🌐</div>
                  </div>
                  <div class="card-text">
                    <h3 class="card-title">{{ site.name }}</h3>
                    <p class="card-desc">{{ getSiteDescription(site.name) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="right-content">
          <!-- 今日新分享 -->
          <div 
            class="today-share"
            @mouseenter="stopTodayScroll"
            @mouseleave="resumeTodayScroll"
          >
            <h2 class="today-title">今日新分享🐳🐳</h2>
            <ul class="today-list">
              <li 
                v-for="(site, index) in todaySites" 
                :key="index"
                class="today-site-item"
                @click="handleSiteClick(site)"
              >
                <div class="today-site-content">
                  <span class="today-site-name">{{ site.name }}</span>
                  <div class="today-site-meta">
                    <span class="meta-item">上传人：{{ site.uploader }}</span>
                    <span class="meta-item">上传时间：{{ site.uploadTime }}</span>
                    <span class="meta-item">使用次数：{{ site.usageCount }}</span>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          
          <!-- 分享按钮 -->
          <button class="share-btn" @click="handleShareClick">我也要分享</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 响应式数据
const searchKeyword = ref('')

// 模拟数据 - 增强数据结构
const hotSites = ref([
  { 
    name: '网站1 - 资源聚合平台', 
    url: 'https://example1.com',
    uploader: '张三',
    uploadTime: '2024-01-15',
    usageCount: 156
  },
  { 
    name: '网站2 - 创意设计社区', 
    url: 'https://example2.com',
    uploader: '李四',
    uploadTime: '2024-01-14',
    usageCount: 89
  },
  { 
    name: '网站3 - 技术学习论坛', 
    url: 'https://example3.com',
    uploader: '王五',
    uploadTime: '2024-01-13',
    usageCount: 234
  }
])

const allSites = ref([
  { 
    name: '网站1 - 资源聚合平台', 
    url: 'https://example1.com',
    uploader: '张三',
    uploadTime: '2024-01-15'
  },
  { 
    name: '网站2 - 创意设计社区', 
    url: 'https://example2.com',
    uploader: '李四',
    uploadTime: '2024-01-14'
  },
  { 
    name: '网站3 - 技术学习论坛', 
    url: 'https://example3.com',
    uploader: '王五',
    uploadTime: '2024-01-13'
  },
  { 
    name: '网站4 - 影视资源导航', 
    url: 'https://example4.com',
    uploader: '赵六',
    uploadTime: '2024-01-12'
  },
  { 
    name: '网站5 - 读书交流社区', 
    url: 'https://example5.com',
    uploader: '钱七',
    uploadTime: '2024-01-11'
  },
  { 
    name: '网站6 - 运动健身指南', 
    url: 'https://example6.com',
    uploader: '孙八',
    uploadTime: '2024-01-10'
  },
  { 
    name: '网站7 - 美食菜谱大全', 
    url: 'https://example7.com',
    uploader: '周九',
    uploadTime: '2024-01-09'
  },
  { 
    name: '网站8 - 旅行攻略平台', 
    url: 'https://example8.com',
    uploader: '吴十',
    uploadTime: '2024-01-08'
  },
  { 
    name: '网站9 - 音乐分享社区', 
    url: 'https://example9.com',
    uploader: '郑十一',
    uploadTime: '2024-01-07'
  },
  { 
    name: '网站10 - 编程工具集合', 
    url: 'https://example10.com',
    uploader: '王十二',
    uploadTime: '2024-01-06'
  },
  { 
    name: '网站11 - 摄影作品展示', 
    url: 'https://example11.com',
    uploader: '李十三',
    uploadTime: '2024-01-05'
  },
  { 
    name: '网站12 - 职场技能提升', 
    url: 'https://example12.com',
    uploader: '张十四',
    uploadTime: '2024-01-04'
  },
  { 
    name: '网站12 - 职场技能提升', 
    url: 'https://example12.com',
    uploader: '张十四',
    uploadTime: '2024-01-04'
  },
  { 
    name: '网站12 - 职场技能提升', 
    url: 'https://example12.com',
    uploader: '张十四',
    uploadTime: '2024-01-04'
  }
])

const todaySites = ref([
  { 
    name: '网站A - 高效工具集合', 
    url: 'https://exampleA.com',
    uploader: '赵六',
    uploadTime: '2024-01-28',
    usageCount: 45
  },
  { 
    name: '网站B - 小众兴趣社区', 
    url: 'https://exampleB.com',
    uploader: '钱七',
    uploadTime: '2024-01-28',
    usageCount: 32
  },
  { 
    name: '网站C - 职场技能干货', 
    url: 'https://exampleC.com',
    uploader: '孙八',
    uploadTime: '2024-01-28',
    usageCount: 78
  },
  { 
    name: '网站D - 生活方式指南', 
    url: 'https://exampleD.com',
    uploader: '周九',
    uploadTime: '2024-01-28',
    usageCount: 23
  },
  { 
    name: '网站E - 学习资源汇总', 
    url: 'https://exampleE.com',
    uploader: '吴十',
    uploadTime: '2024-01-28',
    usageCount: 67
  },
  { 
    name: '网站F - 创意灵感库', 
    url: 'https://exampleF.com',
    uploader: '郑十一',
    uploadTime: '2024-01-28',
    usageCount: 89
  }
])

// 今日分享滚动相关
const isTodayScrolling = ref(true)
const scrollInterval = ref(null)

// 计算属性：过滤网站列表
const filteredSites = computed(() => {
  if (!searchKeyword.value) {
    return allSites.value
  }
  return allSites.value.filter(site => 
    site.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 事件处理函数
const handleSearch = () => {
  // 搜索逻辑已通过计算属性实现
}

const handleSiteClick = (site) => {
  console.log('点击了网站:', site)
  if (site.url) {
    window.open(site.url, '_blank')
  }
}

const handleShareClick = () => {
  console.log('点击了分享按钮')
  // 这里可以添加分享网站的逻辑
}

// 生成网站简介
const getSiteDescription = (siteName) => {
  const descriptions = {
    '资源聚合平台': '一站式资源整合平台',
    '创意设计社区': '设计师灵感交流社区',
    '技术学习论坛': '程序员技术学习平台',
    '影视资源导航': '影视资源分类导航',
    '读书交流社区': '读书爱好者分享平台',
    '运动健身指南': '健身运动指导平台',
    '美食菜谱大全': '美食菜谱分享社区',
    '旅行攻略平台': '旅行攻略经验分享',
    '音乐分享社区': '音乐爱好者交流平台',
    '编程工具集合': '程序员实用工具集',
    '摄影作品展示': '摄影作品展示平台',
    '职场技能提升': '职场技能提升指南'
  }
  
  // 从网站名称中提取关键词
  for (const [key, desc] of Object.entries(descriptions)) {
    if (siteName.includes(key)) {
      return desc
    }
  }
  
  // 默认简介
  return '优质网站资源分享'
}

// 今日分享滚动控制
const startTodayScroll = () => {
  scrollInterval.value = setInterval(() => {
    if (isTodayScrolling.value) {
      const todayList = document.querySelector('.today-list')
      if (todayList) {
        todayList.scrollTop += 1
        if (todayList.scrollTop >= todayList.scrollHeight - todayList.clientHeight) {
          todayList.scrollTop = 0
        }
      }
    }
  }, 50)
}

const stopTodayScroll = () => {
  isTodayScrolling.value = false
}

const resumeTodayScroll = () => {
  isTodayScrolling.value = true
}

// 生命周期
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  startTodayScroll()
})

onUnmounted(() => {
  if (scrollInterval.value) {
    clearInterval(scrollInterval.value)
  }
})
</script>

<style scoped>
/* 全局样式重置与基础设置 */
.website-share-square * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Microsoft YaHei", "Helvetica Neue", sans-serif;
}

.website-share-square {
  min-height: auto;
}

/* 最外层大卡片 */
.main-container {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}

/* 标题样式 */
.main-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 25px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

/* 主内容区布局 */
.content-wrapper {
  display: flex;
  gap: 20px;
}

.left-content {
  flex: 2;
}

.right-content {
  flex: 1;
}

/* 热门卡片样式 */
.hot-card {
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.hot-title {
  color: #ff4d4f;
  font-weight: bold;
  margin-bottom: 12px;
  font-size: 16px;
}

.hot-list {
  padding-left: 20px;
}

.hot-list li {
  margin-bottom: 6px;
  color: #333;
  line-height: 1.4;
}

.hot-site-item {
  cursor: pointer;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.hot-site-item:hover {
  background-color: #f8f9fa;
  border-radius: 4px;
  padding-left: 8px;
  padding-right: 8px;
}

.hot-site-item:last-child {
  border-bottom: none;
}

.site-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.site-name {
  font-weight: 500;
  flex-shrink: 0;
}

.site-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #666;
  flex-wrap: wrap;
}

.meta-item {
  background-color: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  white-space: nowrap;
}

/* 所有分享区域 */
.all-share {
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.all-share-title {
  color: #1890ff;
  font-weight: bold;
  margin-bottom: 12px;
  font-size: 16px;
}

.search-box {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  margin-bottom: 15px;
  font-size: 14px;
}

.search-box:focus {
  outline: none;
  border-color: #1890ff;
}

.share-container {
  height: 230px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background-color: #fafafa;
  padding: 10px;
}

/* 优化滚动条样式 */
.share-container::-webkit-scrollbar {
  width: 8px;
}

.share-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.share-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.share-container::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* Firefox 滚动条样式兼容 */
.share-container {
  scrollbar-width: thin;
  scrollbar-color: #ccc #f1f1f1;
}

.share-items {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

/* 单个卡片样式 - 改为左右布局 */
.share-item {
  display: flex;
  align-items: center;
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  padding: 8px;
  transition: all 0.3s ease;
  height: 50px;
  overflow: hidden;
  cursor: pointer;
}

/* 左侧正方形图标区域 */
.card-icon-container {
  width: 45px;
  height: 45px;
  flex-shrink: 0;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 4px;
}

/* 卡片图标 - 适应正方形区域 */
.card-icon {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* 默认图标样式 */
.default-icon {
  font-size: 20px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 右侧文字区域 */
.card-text {
  flex-grow: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 卡片标题 */
.card-title {
  font-size: 13px;
  color: #333;
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 卡片描述 */
.card-desc {
  font-size: 11px;
  color: #666;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.share-item:hover {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

/* 今日新分享区域 */
.today-share {
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  height: calc(100% - 60px);
  position: relative;
  overflow: hidden;
}

.today-title {
  color: #fa8c16;
  font-weight: bold;
  margin-bottom: 12px;
  font-size: 16px;
}

.today-list {
  list-style: none;
  max-height: 420px;
  overflow: hidden;
  position: relative;
  padding-left: 20px;
}

.today-list li {
  margin-bottom: 6px;
  color: #333;
  line-height: 1.4;
}

.today-site-item {
  cursor: pointer;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.today-site-item:hover {
  background-color: #f8f9fa;
  border-radius: 4px;
  padding-left: 8px;
  padding-right: 8px;
}

.today-site-item:last-child {
  border-bottom: none;
}

.today-site-content {
  display: block;
}

.today-site-name {
  display: block;
  font-weight: 500;
  margin-bottom: 4px;
}

.today-site-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #666;
  flex-wrap: wrap;
}

/* 分享按钮 */
.share-btn {
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 15px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  margin-top: 20px;
  transition: background-color 0.2s ease;
}

.share-btn:hover {
  background-color: #096dd9;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
  }
  
  .share-items {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .today-share {
    height: auto;
    margin-bottom: 20px;
  }
}

@media (max-width: 480px) {
  .share-items {
    grid-template-columns: 1fr;
  }
  
  .website-share-square {
    padding: 10px;
  }
  
  .main-container {
    padding: 15px;
  }
}
</style>