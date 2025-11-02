<template>
  <div class="market-container">
    <!-- 顶部导航条 -->
    <div class="market-header">
      <!-- 左侧：页面标题和图标 -->
      <div class="header-left">
        <div class="page-title">
          <span>FlowShare</span>
        </div>
      </div>
      
      <!-- 中间：搜索框 -->
      <div class="header-center">
        <div class="search-container">
          <i class="uil uil-search"></i>
          <input 
            type="text" 
            class="search-input" 
            placeholder="搜索工作流/智能体，教程，标签..."
            v-model="searchKeyword"
            @input="handleSearch"
          />
        </div>
      </div>
      
      <!-- 右侧：操作按钮 -->
      <div class="header-right">
        <button class="publish-btn" @click="handlePublish">
          <i class="uil uil-plus"></i>
          发布
        </button>
        <div class="notification-bell">
          <i class="uil uil-bell"></i>
          <span class="notification-badge" v-if="hasNotifications"></span>
        </div>
      </div>
    </div>
    
    <!-- 主内容区域 -->
    <div class="market-content">
      <!-- 左侧筛选卡片 -->
      <div class="filter-card-container">
        <div class="filter-card">
          <div class="filter-title">
            <span class="filter-icon">▼</span> 分类筛选
          </div>

          <div class="filter-group">
            <div class="group-title">内容类型</div>
            <div class="checkbox-item">
              <input type="checkbox" class="checkbox" v-model="filters.contentTypes.workflow" @change="updateFilters"> 工作流
            </div>
            <div class="checkbox-item">
              <input type="checkbox" class="checkbox" v-model="filters.contentTypes.agent" @change="updateFilters"> 智能体
            </div>
            <div class="checkbox-item">
              <input type="checkbox" class="checkbox" v-model="filters.contentTypes.tutorial" @change="updateFilters"> 教程/模板
            </div>
          </div>

          <div class="filter-group">
            <div class="group-title">应用场景</div>
            <div class="tag-group">
              <span 
                class="tag" 
                :class="{ selected: filters.scenarios.includes('办公自动化') }"
                @click="toggleScenario('办公自动化')"
              >办公自动化</span>
              <span 
                class="tag" 
                :class="{ selected: filters.scenarios.includes('数据处理') }"
                @click="toggleScenario('数据处理')"
              >数据处理</span>
              <span 
                class="tag" 
                :class="{ selected: filters.scenarios.includes('内容创作') }"
                @click="toggleScenario('内容创作')"
              >内容创作</span>
              <span 
                class="tag" 
                :class="{ selected: filters.scenarios.includes('开发工具') }"
                @click="toggleScenario('开发工具')"
              >开发工具</span>
              <span 
                class="tag" 
                :class="{ selected: filters.scenarios.includes('生活服务') }"
                @click="toggleScenario('生活服务')"
              >生活服务</span>
            </div>
          </div>

          <div class="filter-group">
            <div class="group-title">来源平台</div>
            <div class="tag-group">
              <span 
                class="tag" 
                :class="{ selected: filters.platforms.includes('n8n') }"
                @click="togglePlatform('n8n')"
              >n8n</span>
              <span 
                class="tag" 
                :class="{ selected: filters.platforms.includes('Zapier') }"
                @click="togglePlatform('Zapier')"
              >Zapier</span>
              <span 
                class="tag" 
                :class="{ selected: filters.platforms.includes('Make') }"
                @click="togglePlatform('Make')"
              >Make</span>
              <span 
                class="tag" 
                :class="{ selected: filters.platforms.includes('扣子') }"
                @click="togglePlatform('扣子')"
              >扣子</span>
              <span 
                class="tag" 
                :class="{ selected: filters.platforms.includes('智谱清言') }"
                @click="togglePlatform('智谱清言')"
              >智谱清言</span>
            </div>
          </div>

          <div class="filter-group">
            <div class="group-title">属性</div>
            <div class="tag-group">
              <span 
                class="tag" 
                :class="{ selected: filters.attributes.includes('开源免费') }"
                @click="toggleAttribute('开源免费')"
              >开源免费</span>
              <span 
                class="tag" 
                :class="{ selected: filters.attributes.includes('商业付费') }"
                @click="toggleAttribute('商业付费')"
              >商业付费</span>
              <span 
                class="tag" 
                :class="{ selected: filters.attributes.includes('个人原创') }"
                @click="toggleAttribute('个人原创')"
              >个人原创</span>
            </div>
          </div>

          <div class="btn-group">
            <button class="filter-btn reset-btn" @click="resetFilters">重置筛选</button>
            <button class="filter-btn apply-btn" @click="applyFilters">应用筛选</button>
          </div>
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="content-area">
        <div class="main-content-container">
          <!-- 用户自定义选项条 -->
          <div class="custom-options-bar">
            <div class="options-bar-content">
              <div class="options-left">
                <!-- 选项卡 -->
                <div class="tab-group">
                  <button 
                    class="tab-btn" 
                    :class="{ active: currentTab === 'all' }"
                    @click="switchTab('all')"
                  >
                    全部内容
                  </button>
                  <button 
                    class="tab-btn" 
                    :class="{ active: currentTab === 'latest' }"
                    @click="switchTab('latest')"
                  >
                    最新发布
                  </button>
                  <button 
                    class="tab-btn" 
                    :class="{ active: currentTab === 'likes' }"
                    @click="switchTab('likes')"
                  >
                    最多点赞
                  </button>
                  <button 
                    class="tab-btn" 
                    :class="{ active: currentTab === 'favorites' }"
                    @click="switchTab('favorites')"
                  >
                    最多收藏
                  </button>
                </div>
              </div>
              <div class="options-right">
                <div class="view-toggle">
                  <button 
                    class="view-btn card-view" 
                    :class="{ active: currentView === 'card' }"
                    title="卡片视图"
                    @click="switchView('card')"
                  >
                    <i class="uil uil-apps"></i>
                  </button>
                  <button 
                    class="view-btn list-view" 
                    :class="{ active: currentView === 'list' }"
                    title="列表视图"
                    @click="switchView('list')"
                  >
                    <i class="uil uil-list-ul"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 内容渲染区域 -->
          <div class="content-render-area" style="margin-top: 10px;">
            <!-- 卡片视图 -->
            <div v-if="currentView === 'card'" class="card-grid">
              <WorkflowCard 
                v-for="item in workflowData" 
                :key="item.id"
                :avatar="item.avatar"
                :user-name="item.userName"
                :publish-time="item.publishTime"
                :tags="item.tags"
                :title="item.title"
                :image-url="item.imageUrl"
                :description="item.description"
                :likes="item.likes"
                :favorites="item.favorites"
                :comments="item.comments"
                @like="(newLikes) => handleCardLike(item.id, newLikes)"
                @favorite="(newFavorites) => handleCardFavorite(item.id, newFavorites)"
                @comment="() => handleCardComment(item.id)"
                @detail="() => handleCardDetail(item.id)"
                @card-click="() => handleCardClick(item.id)"
              />
            </div>

            <!-- 列表视图 -->
            <div v-else class="list-container">
              <CompactCard 
                v-for="item in workflowData" 
                :key="item.id"
                :avatar="item.avatar"
                :user-name="item.userName"
                :publish-time="item.publishTime"
                :tags="item.tags"
                :title="item.title"
                :image-url="item.imageUrl"
                :description="item.description"
                :likes="item.likes"
                :favorites="item.favorites"
                :comments="item.comments"
                @like="(newLikes) => handleCardLike(item.id, newLikes)"
                @favorite="(newFavorites) => handleCardFavorite(item.id, newFavorites)"
                @comment="() => handleCardComment(item.id)"
                @detail="() => handleCardDetail(item.id)"
                @card-click="() => handleCardClick(item.id)"
              />
            </div>
          </div>
        </div>

        <!-- 右侧卡片容器 -->
        <div class="right-cards-container">
          <!-- 热门推荐卡片 -->
          <div class="hot-recommend-card">
            <div class="hot-recommend-header">
              <i class="uil uil-fire"></i>
              <h3>热门推荐</h3>
            </div>
            <div class="hot-item" @click="handleHotItemClick(1)">
              <div class="hot-item-img">
                <img src="https://picsum.photos/200/200?random=30" alt="热门内容">
              </div>
              <div class="hot-item-content">
                <h4 class="hot-item-title">用ChatGPT+Zapier打造全自动内容发布流水线</h4>
                <p class="hot-item-meta">1.2k 人使用</p>
              </div>
            </div>
            <div class="hot-item" @click="handleHotItemClick(2)">
              <div class="hot-item-img">
                <img src="https://picsum.photos/200/200?random=31" alt="热门内容">
              </div>
              <div class="hot-item-content">
                <h4 class="hot-item-title">n8n自动化处理邮件附件并保存到云盘</h4>
                <p class="hot-item-meta">986 人使用</p>
              </div>
            </div>
            <div class="hot-item" @click="handleHotItemClick(3)">
              <div class="hot-item-img">
                <img src="https://picsum.photos/200/200?random=32" alt="热门内容">
              </div>
              <div class="hot-item-content">
                <h4 class="hot-item-title">智能体：自动分析竞品价格并生成报告</h4>
                <p class="hot-item-meta">753 人使用</p>
              </div>
            </div>
          </div>

          <!-- 最新发布卡片 -->
          <div class="latest-posts-card">
            <div class="latest-posts-header">
              <i class="uil uil-file-alt"></i>
              <h3>最新发布</h3>
            </div>
            <div class="post-links">
              <a href="#" class="post-link" @click="handlePostClick(1)">用n8n自动同步Notion数据到Excel的工作流</a>
              <a href="#" class="post-link" @click="handlePostClick(2)">Zapier自动化社交媒体内容发布</a>
              <a href="#" class="post-link" @click="handlePostClick(3)">Make自动化数据清洗和报表生成</a>
              <a href="#" class="post-link" @click="handlePostClick(4)">扣子平台自动化代码部署流程</a>
              <a href="#" class="post-link" @click="handlePostClick(5)">智谱清言智能客服机器人配置</a>
              <a href="#" class="post-link" @click="handlePostClick(6)">n8n自动化邮件营销系统</a>
            </div>
          </div>

          <!-- 热门话题卡片 -->
          <HotTopicsCard 
            @topic-click="handleTopicClick"
            @view-all="handleViewAllTopics"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import WorkflowCard from '@/components/WorkflowCard.vue'
import CompactCard from '@/components/CompactCard.vue'
import HotTopicsCard from '@/components/HotTopicsCard.vue'

const router = useRouter()

// 搜索关键词
const searchKeyword = ref('')

// 是否有通知
const hasNotifications = ref(true)

// 筛选条件
const filters = reactive({
  contentTypes: {
    workflow: true,
    agent: true,
    tutorial: true
  },
  scenarios: ['办公自动化'],
  platforms: ['n8n'],
  attributes: ['开源免费']
})

// 处理搜索
const handleSearch = () => {
  console.log('搜索关键词:', searchKeyword.value)
  // 这里可以添加搜索逻辑
}

// 切换应用场景
const toggleScenario = (scenario) => {
  const index = filters.scenarios.indexOf(scenario)
  if (index > -1) {
    filters.scenarios.splice(index, 1)
  } else {
    filters.scenarios.push(scenario)
  }
}

// 切换来源平台
const togglePlatform = (platform) => {
  const index = filters.platforms.indexOf(platform)
  if (index > -1) {
    filters.platforms.splice(index, 1)
  } else {
    filters.platforms.push(platform)
  }
}

// 切换属性
const toggleAttribute = (attribute) => {
  const index = filters.attributes.indexOf(attribute)
  if (index > -1) {
    filters.attributes.splice(index, 1)
  } else {
    filters.attributes.push(attribute)
  }
}

// 更新筛选条件
const updateFilters = () => {
  console.log('筛选条件已更新:', filters)
}

// 重置筛选
const resetFilters = () => {
  filters.contentTypes = {
    workflow: true,
    agent: true,
    tutorial: true
  }
  filters.scenarios = ['办公自动化']
  filters.platforms = ['n8n']
  filters.attributes = ['开源免费']
  console.log('筛选条件已重置')
}

// 应用筛选
const applyFilters = () => {
  console.log('应用筛选条件:', filters)
  // 这里可以添加筛选逻辑
}

// 获取激活的内容类型
const getActiveContentTypes = () => {
  const activeTypes = []
  if (filters.contentTypes.workflow) activeTypes.push('工作流')
  if (filters.contentTypes.agent) activeTypes.push('智能体')
  if (filters.contentTypes.tutorial) activeTypes.push('教程/模板')
  return activeTypes.join(', ') || '无'
}

// 视图切换功能
const currentView = ref('card') // 默认卡片视图

const switchView = (viewType) => {
  currentView.value = viewType
  console.log('切换到视图:', viewType)
  // 这里可以添加视图切换逻辑
}

// 选项卡功能
const currentTab = ref('all') // 默认全部内容

const switchTab = (tabType) => {
  currentTab.value = tabType
  console.log('切换到选项卡:', tabType)
  // 这里可以添加选项卡切换逻辑
}

// 假数据
const workflowData = ref([
  {
    id: 1,
    avatar: 'https://picsum.photos/id/1005/40/40',
    userName: '张小明',
    publishTime: '3小时前',
    tags: ['n8n', '办公自动化', '开源免费'],
    title: '用n8n自动同步Notion数据到Excel的工作流',
    imageUrl: 'https://picsum.photos/id/0/600/400',
    description: '无需代码，通过3个节点实现Notion数据库新增内容自动写入Excel，附详细步骤图和配置说明。',
    likes: 128,
    favorites: 56,
    comments: 12
  },
  {
    id: 2,
    avatar: 'https://picsum.photos/id/1011/40/40',
    userName: '李小红',
    publishTime: '5小时前',
    tags: ['Zapier', '内容创作', '商业付费'],
    title: 'Zapier自动化社交媒体内容发布',
    imageUrl: 'https://picsum.photos/id/1/600/400',
    description: '连接Twitter、LinkedIn和Facebook，一键发布内容到多个平台，节省90%的时间。',
    likes: 89,
    favorites: 34,
    comments: 8
  },
  {
    id: 3,
    avatar: 'https://picsum.photos/id/1012/40/40',
    userName: '王大力',
    publishTime: '1天前',
    tags: ['Make', '数据处理', '个人原创'],
    title: 'Make自动化数据清洗和报表生成',
    imageUrl: 'https://picsum.photos/id/2/600/400',
    description: '从多个数据源自动收集数据，清洗后生成可视化报表，支持Excel和PDF导出。',
    likes: 156,
    favorites: 78,
    comments: 23
  },
  {
    id: 4,
    avatar: 'https://picsum.photos/id/1015/40/40',
    userName: '赵小云',
    publishTime: '2天前',
    tags: ['扣子', '开发工具', '开源免费'],
    title: '扣子平台自动化代码部署流程',
    imageUrl: 'https://picsum.photos/id/3/600/400',
    description: 'GitHub代码提交后自动触发测试、构建和部署流程，支持多环境部署。',
    likes: 67,
    favorites: 29,
    comments: 5
  },
  {
    id: 5,
    avatar: 'https://picsum.photos/id/1016/40/40',
    userName: '陈小刚',
    publishTime: '3天前',
    tags: ['智谱清言', '生活服务', '个人原创'],
    title: '智谱清言智能客服机器人配置',
    imageUrl: 'https://picsum.photos/id/4/600/400',
    description: '基于智谱清言大模型搭建智能客服系统，支持多轮对话和业务知识库。',
    likes: 234,
    favorites: 112,
    comments: 45
  },
  {
    id: 6,
    avatar: 'https://picsum.photos/id/1019/40/40',
    userName: '刘小美',
    publishTime: '1周前',
    tags: ['n8n', '办公自动化', '商业付费'],
    title: 'n8n自动化邮件营销系统',
    imageUrl: 'https://picsum.photos/id/5/600/400',
    description: '根据用户行为自动发送个性化邮件，支持A/B测试和转化率追踪。',
    likes: 178,
    favorites: 93,
    comments: 31
  }
])



// 组件事件处理
const handleCardLike = (cardId, newLikes) => {
  const card = workflowData.value.find(item => item.id === cardId)
  if (card) {
    card.likes = newLikes
    console.log(`卡片 ${cardId} 点赞数更新为: ${newLikes}`)
  }
}

const handleCardFavorite = (cardId, newFavorites) => {
  const card = workflowData.value.find(item => item.id === cardId)
  if (card) {
    card.favorites = newFavorites
    console.log(`卡片 ${cardId} 收藏数更新为: ${newFavorites}`)
  }
}

const handleCardComment = (cardId) => {
  console.log(`打开卡片 ${cardId} 的评论`)
}

const handleCardDetail = (cardId) => {
  console.log(`查看卡片 ${cardId} 的详情`)
}

// 处理卡片点击事件 - 跳转到详情页
const handleCardClick = (cardId) => {
  console.log(`点击卡片 ${cardId}，跳转到详情页`)
  router.push('/detail')
}

// 处理热门推荐项点击
const handleHotItemClick = (itemId) => {
  console.log(`点击热门推荐项 ${itemId}`)
  // 这里可以添加跳转到对应内容的逻辑
}

// 处理最新动态项点击
const handleNewsItemClick = (itemId) => {
  console.log(`点击最新动态项 ${itemId}`)
  // 这里可以添加跳转到对应动态的逻辑
}

// 处理帖子点击
const handlePostClick = (postId) => {
  console.log(`点击帖子 ${postId}`)
  // 这里可以添加跳转到对应帖子的逻辑
  // 例如：router.push(`/post/${postId}`)
}

// 处理热门话题点击
const handleTopicClick = (topicId) => {
  console.log(`点击热门话题 ${topicId}`)
  // 这里可以添加跳转到对应话题的逻辑
  // 例如：router.push(`/topic/${topicId}`)
}

// 处理查看全部话题
const handleViewAllTopics = () => {
  console.log('查看全部话题')
  // 这里可以添加跳转到话题列表页面的逻辑
  // 例如：router.push('/topics')
}

// 处理发布按钮点击
const handlePublish = () => {
  console.log('点击发布按钮，跳转到编辑页面')
  router.push('/edit')
}
</script>

<style scoped>
.market-container {
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* 顶部导航条样式 */
.market-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

/* 左侧样式 */
.header-left {
  flex: 0 0 auto;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-family: "黑体", "SimHei", "Microsoft YaHei", sans-serif;
  font-weight: 900;
  color: #2c3e50;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.page-title i {
  font-size: 24px;
  color: #667eea;
}

/* 中间搜索框样式 */
.header-center {
  flex: 1;
  max-width: 500px;
  margin: 0 32px;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 8px 12px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.search-container:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.search-container i {
  color: #6c757d;
  font-size: 16px;
  margin-right: 8px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #2c3e50;
}

.search-input::placeholder {
  color: #adb5bd;
}

/* 右侧按钮样式 */
.header-right {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
}

.publish-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.publish-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.publish-btn i {
  font-size: 16px;
}

.notification-bell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #f8f9fa;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.notification-bell:hover {
  background: #e9ecef;
}

.notification-bell i {
  font-size: 18px;
  color: #6c757d;
}

.notification-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: #ff6b6b;
  border-radius: 50%;
  border: 2px solid white;
}

/* 主内容区域样式 */
.market-content {
  display: flex;
  gap: 30px; /* 左侧筛选卡片与右侧内容区域间距60px */
  padding: 15px 24px 24px 24px; /* 顶部边距15px */
  min-height: calc(100vh - 80px);
}

/* 筛选卡片容器 */
.filter-card-container {
  flex: 0 0 auto;
  margin-left: 30px; /* 向右移动30px，靠近用户自定义选项条 */
  position: sticky;
  top: 85px;
  align-self: flex-start;
}

/* 筛选卡片样式 */
.filter-card {
  width: 255px; /* 进一步缩短宽度 */
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 18px; /* 增加内边距 */
  font-family: "Microsoft Yahei", sans-serif;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-title {
  font-size: 20px; /* 增大字体 */
  font-weight: bold;
  margin-bottom: 18px; /* 增加间距 */
  display: flex;
  align-items: center;
}

.filter-icon {
  color: #007AFF;
  margin-right: 6px;
}

.filter-group {
  margin-bottom: 18px; /* 进一步减少间距 */
}

.group-title {
  font-size: 18px; /* 增大字体 */
  color: #333;
  margin-bottom: 8px; /* 进一步减少间距 */
  font-weight: 600;
}

.checkbox-item {
  display: flex;
  align-items: center;
  margin-bottom: 4px; /* 进一步减少间距 */
  padding: 3px 6px; /* 进一步减少内边距 */
  border-radius: 3px;
  background-color: transparent; /* 移除灰色背景 */
  transition: background-color 0.2s ease;
  font-size: 15px; /* 增大字体 */
}

.checkbox-item:hover {
  background-color: #f0f0f0;
}

.checkbox {
  margin-right: 6px;
  transform: scale(0.9); /* 缩小复选框 */
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px; /* 进一步减少间距 */
}

.tag {
  padding: 3px 8px; /* 进一步减少内边距 */
  border-radius: 14px;
  font-size: 12px; /* 增大字体 */
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f7f7f7; /* 更淡的灰色背景 */
  color: #666;
  border: none; /* 移除边框 */
}

.tag.selected {
  background-color: #007AFF;
  color: #fff;
  border-color: #007AFF;
}

.tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-group {
  display: flex;
  gap: 6px; /* 进一步减少间距 */
  margin-top: 24px; /* 进一步减少间距 */
}

.filter-btn {
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  width: calc(50% - 6px);
  transition: all 0.3s ease;
}

.reset-btn {
  background-color: #fff;
  border: 1px solid #ddd;
  color: #666;
}

.reset-btn:hover {
  background-color: #f8f9fa;
  border-color: #ccc;
}

.apply-btn {
  background-color: #007AFF;
  color: #fff;
}

.apply-btn:hover {
  background-color: #0056cc;
  transform: translateY(-1px);
}

/* 用户自定义选项条 */
.custom-options-bar {
  width: 785px;
  height: 70px;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #eee;
}

.options-bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
}

.options-left {
  flex: 1;
}

/* 选项卡样式 */
.tab-group {
  display: flex;
  gap: 8px;
}

.tab-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #fff;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.tab-btn:hover {
  background-color: #f8f9fa;
  border-color: #ccc;
}

.tab-btn.active {
  background-color: #007AFF;
  border-color: #007AFF;
  color: #fff;
}

.options-right {
  display: flex;
  align-items: center;
}

.view-toggle {
  display: flex;
  gap: 8px;
}

.view-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.view-btn i {
  font-size: 18px;
  color: #666;
}

.view-btn:hover {
  background-color: #f8f9fa;
  border-color: #ccc;
}

.view-btn.active {
  background-color: #007AFF;
  border-color: #007AFF;
}

.view-btn.active i {
  color: #fff;
}

/* 右侧内容区域 */
.content-area {
  display: flex;
  gap: 20px;
  min-width: 0;
}

.main-content-container {
  flex: 1;
  min-width: 0;
}

.content-placeholder {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.content-placeholder h2 {
  font-size: 24px;
  margin-bottom: 12px;
  color: #2c3e50;
}

.filter-status {
  margin-top: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  text-align: left;
}

.filter-status p {
  margin: 8px 0;
  font-size: 14px;
}

/* 内容渲染区域样式 */
.content-render-area {
  width: 785px;
}

/* 卡片网格布局 */
.card-grid {
  display: grid;
  grid-template-columns: 385px 385px;
  justify-content: space-between;
  gap: 15px;
  padding: 10px 0;
}

/* 列表容器布局 */
.list-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 10px 0;
}

/* 右侧卡片容器 */
.right-cards-container {
  flex: 0 0 290px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* 热门推荐卡片样式 */
.hot-recommend-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 10px;
  height: fit-content;
}

/* 最新发布卡片样式 */
.latest-posts-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 10px;
  height: fit-content;
}

.latest-posts-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.latest-posts-header i {
  color: #00B96B;
  font-size: 18px;
  margin-right: 8px;
}

.latest-posts-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.post-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.post-link {
  display: block;
  font-size: 14px;
  color: #1d2129;
  text-decoration: none;
  line-height: 1.4;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  transition: color 0.3s ease-in-out;
  cursor: pointer;
}

.post-link:last-child {
  border-bottom: none;
}

.post-link:hover {
  color: #165DFF;
  text-decoration: none;
}

/* 最新发布卡片样式 */
.latest-posts-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 10px;
  height: fit-content;
}

.latest-posts-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.latest-posts-header i {
  color: #00B96B;
  font-size: 18px;
  margin-right: 8px;
}

.latest-posts-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.post-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.post-link {
  display: block;
  font-size: 14px;
  color: #1d2129;
  text-decoration: none;
  line-height: 1.4;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  transition: color 0.3s ease-in-out;
  cursor: pointer;
}

.post-link:last-child {
  border-bottom: none;
}

.post-link:hover {
  color: #165DFF;
  text-decoration: none;
}

/* 最新动态卡片样式 */
.latest-news-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 10px;
  height: fit-content;
}

.latest-news-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.latest-news-header i {
  color: #007AFF;
  font-size: 18px;
  margin-right: 8px;
}

.latest-news-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.news-item {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.news-item:hover {
  background-color: #f8f9fa;
}

.news-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.news-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.news-content {
  flex: 1;
}

.news-title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  margin: 0 0 4px 0;
  color: #1d2129;
}

.news-meta {
  font-size: 12px;
  color: #86909C;
  margin: 0;
}

.hot-recommend-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.hot-recommend-header i {
  color: #FF7D00;
  font-size: 18px;
  margin-right: 8px;
}

.hot-recommend-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.hot-item {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.hot-item:hover {
  background-color: transparent;
}

.hot-item:hover .hot-item-title {
  color: #165DFF;
}

.hot-item-img {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.hot-item-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hot-item-content {
  flex: 1;
}

.hot-item-title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  margin: 0 0 4px 0;
  transition: color 0.2s;
}

.hot-item-meta {
  font-size: 12px;
  color: #86909C;
  margin: 0;
}

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
  top: 100px; /* 距离顶部100px，避免与顶部导航重叠 */
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
  .market-header {
    padding: 12px 16px;
  }
  
  .header-center {
    margin: 0 16px;
  }
  
  .page-title span {
    display: none;
  }
  
  .publish-btn span {
    display: none;
  }
  
  .market-content {
    padding: 16px;
  }
  
  .card-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .list-container {
    gap: 12px;
  }
  
  .content-area {
    flex-direction: column;
  }
  
  .right-cards-container {
    flex: none;
    width: 100%;
    gap: 20px;
    margin-top: 20px;
  }
  
  .hot-recommend-card {
    flex: none;
    width: 100%;
    position: static;
    margin-top: 0;
  }
  
  .latest-news-card {
    flex: none;
    width: 100%;
    position: static;
  }
}
</style>