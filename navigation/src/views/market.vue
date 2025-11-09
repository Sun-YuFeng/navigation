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
            @input="onSearchInput"
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
      <!-- 左侧筛选卡片区域 -->
      <div class="left-sidebar">
        <!-- 筛选卡片 -->
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
                <input type="checkbox" class="checkbox" v-model="filters.contentTypes.tutorial" @change="updateFilters"> 教程
              </div>
            </div>

            <div class="filter-group">
              <div class="group-title">内容类型</div>
              <div class="tag-group">
                <span 
                  class="tag" 
                  :class="{ selected: filters.subTypes.includes('自动化工作流') }"
                  @click="toggleSubType('自动化工作流')"
                >自动化工作流</span>
                <span 
                  class="tag" 
                  :class="{ selected: filters.subTypes.includes('手动协作流') }"
                  @click="toggleSubType('手动协作流')"
                >手动协作流</span>
                <span 
                  class="tag" 
                  :class="{ selected: filters.subTypes.includes('跨工具集成流') }"
                  @click="toggleSubType('跨工具集成流')"
                >跨工具集成流</span>
                <span 
                  class="tag" 
                  :class="{ selected: filters.subTypes.includes('AI助手型') }"
                  @click="toggleSubType('AI助手型')"
                >AI助手型</span>
                <span 
                  class="tag" 
                  :class="{ selected: filters.subTypes.includes('数据处理型') }"
                  @click="toggleSubType('数据处理型')"
                >数据处理型</span>
                <span 
                  class="tag" 
                  :class="{ selected: filters.subTypes.includes('决策支持型') }"
                  @click="toggleSubType('决策支持型')"
                >决策支持型</span>
                <span 
                  class="tag" 
                  :class="{ selected: filters.subTypes.includes('工具入门') }"
                  @click="toggleSubType('工具入门')"
                >工具入门</span>
                <span 
                  class="tag" 
                  :class="{ selected: filters.subTypes.includes('场景案例') }"
                  @click="toggleSubType('场景案例')"
                >场景案例</span>
                <span 
                  class="tag" 
                  :class="{ selected: filters.subTypes.includes('故障排查') }"
                  @click="toggleSubType('故障排查')"
                >故障排查</span>
              </div>
            </div>

            <div class="filter-group">
              <div class="group-title">应用场景</div>
              <div class="tag-group">
                <span 
                  class="tag" 
                  :class="{ selected: filters.scenarios.includes('电商运营') }"
                  @click="toggleScenario('电商运营')"
                >电商运营</span>
                <span 
                  class="tag" 
                  :class="{ selected: filters.scenarios.includes('新媒体') }"
                  @click="toggleScenario('新媒体')"
                >新媒体</span>
                <span 
                  class="tag" 
                  :class="{ selected: filters.scenarios.includes('人力资源') }"
                  @click="toggleScenario('人力资源')"
                >人力资源</span>
                <span 
                  class="tag" 
                  :class="{ selected: filters.scenarios.includes('财务') }"
                  @click="toggleScenario('财务')"
                >财务</span>
                <span 
                  class="tag" 
                  :class="{ selected: filters.scenarios.includes('客户服务') }"
                  @click="toggleScenario('客户服务')"
                >客户服务</span>
                <span 
                  class="tag" 
                  :class="{ selected: filters.scenarios.includes('市场营销') }"
                  @click="toggleScenario('市场营销')"
                >市场营销</span>
                <span 
                  class="tag" 
                  :class="{ selected: filters.scenarios.includes('数据采集') }"
                  @click="toggleScenario('数据采集')"
                >数据采集</span>
                <span 
                  class="tag" 
                  :class="{ selected: filters.scenarios.includes('流程审批') }"
                  @click="toggleScenario('流程审批')"
                >流程审批</span>
                <span 
                  class="tag" 
                  :class="{ selected: filters.scenarios.includes('内容分发') }"
                  @click="toggleScenario('内容分发')"
                >内容分发</span>
                <span 
                  class="tag" 
                  :class="{ selected: filters.scenarios.includes('智能客服') }"
                  @click="toggleScenario('智能客服')"
                >智能客服</span>
                <span 
                  class="tag" 
                  :class="{ selected: filters.scenarios.includes('报表生成') }"
                  @click="toggleScenario('报表生成')"
                >报表生成</span>
                <span 
                  class="tag" 
                  :class="{ selected: filters.scenarios.includes('监控预警') }"
                  @click="toggleScenario('监控预警')"
                >监控预警</span>
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
                  :class="{ selected: filters.platforms.includes('IFTTT') }"
                  @click="togglePlatform('IFTTT')"
                >IFTTT</span>
                <span 
                  class="tag" 
                  :class="{ selected: filters.platforms.includes('Power Automate') }"
                  @click="togglePlatform('Power Automate')"
                >Power Automate</span>
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
                  :class="{ selected: filters.attributes.includes('试用版') }"
                  @click="toggleAttribute('试用版')"
                >试用版</span>
                <span 
                  class="tag" 
                  :class="{ selected: filters.attributes.includes('个人原创') }"
                  @click="toggleAttribute('个人原创')"
                >个人原创</span>
                <span 
                  class="tag" 
                  :class="{ selected: filters.attributes.includes('团队协作') }"
                  @click="toggleAttribute('团队协作')"
                >团队协作</span>
                <span 
                  class="tag" 
                  :class="{ selected: filters.attributes.includes('官方模板') }"
                  @click="toggleAttribute('官方模板')"
                >官方模板</span>
              </div>
            </div>

            <div class="btn-group">
              <button class="filter-btn reset-btn" @click="resetFilters">重置筛选</button>
              <button class="filter-btn apply-btn" @click="applyFilters">应用筛选</button>
            </div>
          </div>
        </div>
        
        <!-- 去广场看看按钮 -->
        <div class="community-button-container">
          <button class="community-button" @click="goToCommunity">
            <i class="uil uil-compass"></i>
            去广场看看
          </button>
        </div>
        
        <!-- 去搭建区域 -->
        <div class="build-platforms-card">
          <div class="build-platforms-header">
            <h3>去搭建</h3>
          </div>
          <div class="build-platforms-content">
            <div 
              v-for="platform in buildPlatforms" 
              :key="platform.name"
              class="build-platform-card"
              @click="openPlatform(platform.url)"
            >
              <div class="build-card-icon-container">
                <img 
                  :src="getPlatformIcon(platform.url)" 
                  :alt="platform.name + '图标'" 
                  class="build-card-icon"
                  @error="handlePlatformIconError($event, platform)"
                >
              </div>
              <div class="build-card-text">
                <h3 class="build-card-title">{{ platform.name }}</h3>
                <p class="build-card-desc">{{ platform.desc }}</p>
              </div>
            </div>
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
            <!-- 加载状态 -->
            <div v-if="isLoading && isInitialLoad" class="loading-container">
              <div class="loading-spinner"></div>
              <p class="loading-text">正在加载数据...</p>
            </div>
            
            <!-- 搜索状态提示 -->
            <div v-else class="content-area-inner">
              <div class="search-status-info" v-if="searchKeyword.trim()">
                <div class="search-results-info" v-if="filteredData.length > 0">
                  <i class="uil uil-search"></i>
                  搜索 "{{ searchKeyword }}" 找到 {{ filteredData.length }} 条结果
                </div>
                <div class="search-no-results" v-else>
                  <i class="uil uil-search-minus"></i>
                  没有找到与 "{{ searchKeyword }}" 相关的内容
                  <div class="search-suggestions">
                    建议：尝试其他关键词或检查拼写
                  </div>
                </div>
              </div>
              
              <!-- 筛选结果统计 -->
              <div class="filter-results-info" v-if="filteredData.length !== originalData.length && !searchKeyword.trim()">
                筛选结果：{{ filteredData.length }} 条（共 {{ originalData.length }} 条）
              </div>
              
              <!-- 卡片视图 -->
              <div v-if="currentView === 'card'" class="card-grid">
                <WorkflowCard 
                  v-for="item in filteredData" 
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
                  @comment="() => handleCardComment(item.id)"
                  @detail="() => handleCardDetail(item.id)"
                  @card-click="() => handleCardClick(item.id)"
                />
              </div>

              <!-- 列表视图 -->
              <div v-else class="list-container">
                <CompactCard 
                  v-for="item in filteredData" 
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
                  @comment="() => handleCardComment(item.id)"
                  @detail="() => handleCardDetail(item.id)"
                  @card-click="() => handleCardClick(item.id)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧卡片容器 -->
        <div class="right-cards-container">
          <!-- 热门推荐卡片 -->
          <HotRecommendCard 
            @item-click="handleHotItemClick"
          />

          <!-- 最新发布卡片 -->
          <div class="latest-posts-card">
            <div class="latest-posts-header">
              <i class="uil uil-file-alt"></i>
              <h3>最新发布</h3>
            </div>
            <div class="post-links">
              <a 
                v-for="post in latestPosts" 
                :key="post.id"
                href="#" 
                class="post-link" 
                @click="handlePostClick(post.id)"
              >{{ post.title }}</a>
              <!-- 如果没有数据，显示提示信息 -->
              <div v-if="latestPosts.length === 0" class="no-posts">
                暂无最新发布内容
              </div>
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
import { ref, reactive, onMounted, computed, watch, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import WorkflowCard from '@/components/WorkflowCard.vue'
import CompactCard from '@/components/CompactCard.vue'
import HotTopicsCard from '@/components/HotTopicsCard.vue'
import HotRecommendCard from '@/components/HotRecommendCard.vue'
import { supabase } from '../supabase.js'

const router = useRouter()

// 滚动处理相关
const handleScroll = () => {
  // 使用CSS sticky，这里只是确保功能正常
  // 如果需要，可以添加额外的JavaScript逻辑
}

// 加载状态
const isLoading = ref(false)
const isInitialLoad = ref(true)

// 搜索关键词
const searchKeyword = ref('')

// 是否有通知
const hasNotifications = ref(true)

// 筛选条件
const filters = reactive({
  contentTypes: {
    workflow: false,
    agent: false,
    tutorial: false
  },
  subTypes: [],
  scenarios: [],
  platforms: [],
  attributes: []
})

// 防抖函数
const debounce = (fn, delay) => {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), delay)
  }
}

// 处理搜索（带防抖）
const handleSearch = debounce(() => {
  console.log('搜索关键词:', searchKeyword.value)
  // filterData 会在 computed 中自动处理
}, 300)

// 搜索输入处理
const onSearchInput = () => {
  handleSearch()
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

// 切换内容子类型
const toggleSubType = (subType) => {
  const index = filters.subTypes.indexOf(subType)
  if (index > -1) {
    filters.subTypes.splice(index, 1)
  } else {
    filters.subTypes.push(subType)
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
    workflow: false,
    agent: false,
    tutorial: false
  }
  filters.subTypes = []
  filters.scenarios = []
  filters.platforms = []
  filters.attributes = []
  console.log('筛选条件已重置')
}

// 应用筛选
const applyFilters = () => {
  console.log('应用筛选条件:', filters)
}

// 获取激活的内容类型数组
const getActiveContentTypesArray = () => {
  const activeTypes = []
  if (filters.contentTypes.workflow) activeTypes.push('工作流')
  if (filters.contentTypes.agent) activeTypes.push('智能体')
  if (filters.contentTypes.tutorial) activeTypes.push('教程/模板')
  return activeTypes
}

// 根据选项卡排序数据
const sortDataByTab = (data) => {
  const sortedData = [...data]
  
  switch (currentTab.value) {
    case 'latest':
      // 按发布时间排序（这里需要根据实际数据结构调整）
      // 由于mock数据没有时间戳，暂时按原顺序
      break
    case 'likes':
      sortedData.sort((a, b) => b.likes - a.likes)
      break
    case 'favorites':
      sortedData.sort((a, b) => b.favorites - a.favorites)
      break
    default:
      // 'all' 保持原顺序
      break
  }
  
  return sortedData
}

// 使用 computed 优化筛选逻辑，避免重复计算
const filteredData = computed(() => {
  if (originalData.value.length === 0) return []
  
  let filtered = [...originalData.value]
  const keyword = searchKeyword.value.toLowerCase().trim()
  
  // 平台筛选
  if (filters.platforms.length > 0) {
    filtered = filtered.filter(item => {
      return filters.platforms.some(platform => 
        item.platforms && item.platforms.includes(platform)
      )
    })
  }
  
  // 应用场景筛选
  if (filters.scenarios.length > 0) {
    filtered = filtered.filter(item => {
      return filters.scenarios.some(scenario => 
        item.tags && item.tags.includes(scenario)
      )
    })
  }
  
  // 内容子类型筛选
  if (filters.subTypes.length > 0) {
    filtered = filtered.filter(item => {
      return filters.subTypes.some(subType => 
        item.tags && item.tags.includes(subType)
      )
    })
  }
  
  // 属性筛选
  if (filters.attributes.length > 0) {
    filtered = filtered.filter(item => {
      return filters.attributes.some(attribute => 
        item.tags && item.tags.includes(attribute)
      )
    })
  }
  
  // 搜索关键词筛选
  if (keyword) {
    filtered = filtered.filter(item => {
      const titleMatch = item.title && item.title.toLowerCase().includes(keyword)
      const descriptionMatch = item.description && item.description.toLowerCase().includes(keyword)
      const tagsMatch = item.tags && item.tags.some(tag => tag.toLowerCase().includes(keyword))
      const platformsMatch = item.platforms && item.platforms.some(platform => 
        platform.toLowerCase().includes(keyword)
      )
      const userNameMatch = item.userName && item.userName.toLowerCase().includes(keyword)
      
      return titleMatch || descriptionMatch || tagsMatch || platformsMatch || userNameMatch
    })
    
    // 对搜索结果进行排序：标题匹配优先，然后是描述匹配
    filtered.sort((a, b) => {
      const aTitleMatch = a.title && a.title.toLowerCase().includes(keyword)
      const bTitleMatch = b.title && b.title.toLowerCase().includes(keyword)
      
      if (aTitleMatch && !bTitleMatch) return -1
      if (!aTitleMatch && bTitleMatch) return 1
      
      const aDescriptionMatch = a.description && a.description.toLowerCase().includes(keyword)
      const bDescriptionMatch = b.description && b.description.toLowerCase().includes(keyword)
      
      if (aDescriptionMatch && !bDescriptionMatch) return -1
      if (!aDescriptionMatch && bDescriptionMatch) return 1
      
      return 0
    })
  }
  
  // 内容类型筛选（工作流/智能体/教程）
  const activeContentTypes = getActiveContentTypesArray()
  if (activeContentTypes.length > 0) {
    filtered = filtered.filter(item => {
      return activeContentTypes.some(contentType => 
        item.tags && item.tags.includes(contentType)
      )
    })
  }
  
  // 根据当前选项卡排序
  return sortDataByTab(filtered)
})

// 视图切换功能
const currentView = ref('card') // 默认卡片视图

const switchView = (viewType) => {
  currentView.value = viewType
  console.log('切换到视图:', viewType)
}

// 选项卡功能
const currentTab = ref('all') // 默认全部内容

const switchTab = (tabType) => {
  currentTab.value = tabType
  console.log('切换到选项卡:', tabType)
}

// 从数据库获取文章数据（优化版）- 包含评论数量
const loadArticlesFromDatabase = async () => {
  try {
    isLoading.value = true
    console.log('开始从数据库获取文章数据...')
    
    // 优化查询：包含评论数量统计
    const { data: articles, error } = await supabase
      .from('articles')
      .select(`
        id,
        user_id,
        article_title,
        description,
        cover_image,
        tags,
        platforms,
        like_count,
        favorite_count,
        created_at,
        users!inner (
          user_profiles (
            display_name,
            avatar_url
          )
        ),
        comment_details (id)
      `)
      .order('created_at', { ascending: false })
      .limit(20)
    
    if (error) {
      console.error('获取文章数据失败:', error)
      return []
    }
    
    console.log('成功获取文章数据:', articles?.length || 0, '条')
    
    // 直接处理数据，对于20条数据来说同步处理足够快
    const formattedArticles = articles.map(article => {
      // 解析tags字段
      let tags = []
      try {
        const tagData = typeof article.tags === 'string' ? JSON.parse(article.tags || '{}') : (article.tags || {})
        if (tagData.content_type) tags.push(tagData.content_type)
        if (tagData.scenes && Array.isArray(tagData.scenes)) {
          tags = tags.concat(tagData.scenes.slice(0, 2))
        }
        if (tagData.attributes && Array.isArray(tagData.attributes)) {
          tags = tags.concat(tagData.attributes.slice(0, 1))
        }
      } catch (e) {
        console.warn('解析tags字段失败:', e)
      }
      
      // 如果没有解析到tags，使用默认tags
      if (tags.length === 0) {
        tags = ['工作流', '自动化']
      }
      
      // 处理平台信息
      let platforms = []
      try {
        if (article.platforms) {
          platforms = Array.isArray(article.platforms) ? article.platforms : []
        }
      } catch (e) {
        console.warn('处理platforms字段失败:', e)
      }
      
      // 如果没有平台信息，从tags中提取
      if (platforms.length === 0 && tags.length > 0) {
        platforms = tags.filter(tag => ['n8n', 'Zapier', 'Make', '扣子', 'IFTTT', 'Power Automate'].includes(tag))
      }
      
      // 合并平台信息到tags
      const finalTags = [...new Set([...tags, ...platforms])].slice(0, 3)
      
      // 获取封面图片URL
      let coverImageUrl = '/src/assets/default.jpg'
      
      if (article.cover_image) {
        try {
          if (article.cover_image.startsWith('http://') || article.cover_image.startsWith('https://')) {
            coverImageUrl = article.cover_image
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('images')
              .getPublicUrl(article.cover_image)
            
            if (publicUrl) {
              coverImageUrl = publicUrl
            }
          }
        } catch (error) {
          console.warn('获取封面图片URL失败:', error)
        }
      }
      
      // 获取用户信息
      const userProfile = article.users?.user_profiles || {}
      const avatarUrl = userProfile.avatar_url || '/src/assets/default.jpg'
      const userName = userProfile.display_name || '用户' + article.user_id.slice(0, 8)
      
      return {
        id: article.id,
        avatar: avatarUrl,
        userName: userName,
        publishTime: formatTimeAgo(article.created_at),
        tags: finalTags,
        platforms: platforms,
        title: article.article_title || '无标题',
        imageUrl: coverImageUrl,
        description: article.description || '暂无描述',
        likes: article.like_count || 0,
        favorites: article.favorite_count || 0,
        comments: article.comment_details?.length || 0
      }
    })
    
    return formattedArticles
  } catch (error) {
    console.error('加载文章数据时发生错误:', error)
    return []
  } finally {
    isLoading.value = false
  }
}

// 格式化时间显示
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  return date.toLocaleDateString('zh-CN')
}

// 假数据
const mockWorkflowData = [
  {
    id: 1,
    avatar: 'https://picsum.photos/id/1005/40/40',
    userName: '张小明',
    publishTime: '3小时前',
    tags: ['n8n', '办公自动化', '开源免费'],
    platforms: ['n8n'],
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
    platforms: ['Zapier'],
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
    platforms: ['Make'],
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
    platforms: ['扣子'],
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
    platforms: ['智谱清言'],
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
    platforms: ['n8n'],
    title: 'n8n自动化邮件营销系统',
    imageUrl: 'https://picsum.photos/id/5/600/400',
    description: '根据用户行为自动发送个性化邮件，支持A/B测试和转化率追踪。',
    likes: 178,
    favorites: 93,
    comments: 31
  }
]

// 工作流数据（包含数据库文章和假数据）
const workflowData = ref([])
// 原始数据备份，用于筛选
const originalData = ref([])

// 组件挂载时加载数据（优化版：不阻塞初始渲染）
onMounted(async () => {
  console.log('market.vue 组件挂载，开始加载数据...')
  
  // 先显示假数据，让用户看到内容
  originalData.value = [...mockWorkflowData]
  workflowData.value = [...mockWorkflowData]
  
  // 使用 nextTick 确保初始渲染完成后再加载数据库数据
  await nextTick()
  
  // 异步加载数据库数据，不阻塞UI
  loadArticlesFromDatabase().then(databaseArticles => {
    console.log('数据库文章数量:', databaseArticles.length)
    
    // 合并数据：数据库文章在前，假数据在后
    const allData = [...databaseArticles, ...mockWorkflowData]
    workflowData.value = allData
    originalData.value = allData
    isInitialLoad.value = false
    console.log('合并后的文章总数:', allData.length)
  }).catch(error => {
    console.error('加载数据库数据失败:', error)
    isInitialLoad.value = false
  })
  
  // 加载最新发布的数据
  loadLatestPosts()
  
  // 添加滚动监听
  window.addEventListener('scroll', handleScroll, { passive: true })
})

// 组件卸载时移除滚动监听
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})



const handleCardComment = (cardId) => {
  console.log(`打开卡片 ${cardId} 的评论`)
}

const handleCardDetail = (cardId) => {
  console.log(`查看卡片 ${cardId} 的详情`)
}

// 处理卡片点击事件 - 跳转到详情页
const handleCardClick = async (cardId) => {
  console.log(`点击卡片 ${cardId}，跳转到详情页`)
  
  try {
    // 先调用数据库函数增加浏览量
    const { error } = await supabase.rpc('increment_article_view_count', {
      article_uuid: cardId
    })
    
    if (error) {
      console.error('增加浏览量失败:', error)
      // 即使增加浏览量失败，也继续跳转
    } else {
      console.log(`文章 ${cardId} 浏览量已增加`)
    }
  } catch (err) {
    console.error('调用增加浏览量函数时出错:', err)
  }
  
  // 跳转到详情页，传递文章ID
  router.push(`/detail/${cardId}`)
}

// 处理热门推荐项点击
const handleHotItemClick = async (itemId) => {
  console.log(`点击热门推荐项 ${itemId}，跳转到详情页`)
  
  try {
    // 先调用数据库函数增加浏览量
    const { error } = await supabase.rpc('increment_article_view_count', {
      article_uuid: itemId
    })
    
    if (error) {
      console.error('增加浏览量失败:', error)
      // 即使增加浏览量失败，也继续跳转
    } else {
      console.log(`文章 ${itemId} 浏览量已增加`)
    }
  } catch (err) {
    console.error('调用增加浏览量函数时出错:', err)
  }
  
  // 跳转到详情页，传递文章ID
  router.push(`/detail/${itemId}`)
}

// 处理最新动态项点击
const handleNewsItemClick = (itemId) => {
  console.log(`点击最新动态项 ${itemId}`)
  // 这里可以添加跳转到对应动态的逻辑
}

  // 获取最新发布的文章数据
  const latestPosts = ref([])
  
  // 加载最新发布的数据
  const loadLatestPosts = async () => {
    try {
      console.log('开始加载最新发布数据...')
      
      // 查询最新发布的6篇文章
      const { data: articles, error } = await supabase
        .from('articles')
        .select(`
          id,
          article_title,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(6)
      
      if (error) {
        console.error('获取最新发布数据失败:', error)
        return
      }
      
      console.log('成功获取最新发布数据:', articles?.length || 0, '条')
      
      // 格式化数据
      latestPosts.value = articles.map(article => ({
        id: article.id,
        title: article.article_title || '无标题',
        createdAt: article.created_at
      }))
      
    } catch (error) {
      console.error('加载最新发布数据时发生错误:', error)
    }
  }

  // 处理帖子点击
  const handlePostClick = async (postId) => {
    console.log(`点击帖子 ${postId}`)
    
    try {
      // 先调用数据库函数增加浏览量
      const { error } = await supabase.rpc('increment_article_view_count', {
        article_uuid: postId
      })
      
      if (error) {
        console.error('增加浏览量失败:', error)
      } else {
        console.log(`文章 ${postId} 浏览量已增加`)
      }
    } catch (err) {
      console.error('调用增加浏览量函数时出错:', err)
    }
    
    // 跳转到详情页
    router.push(`/detail/${postId}`)
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

// 跳转到广场页面
const goToCommunity = () => {
  console.log('跳转到广场页面')
  router.push('/community')
}

// 搭建平台数据
const buildPlatforms = ref([
  {
    name: 'n8n',
    url: 'https://app.n8n.cloud/',
    desc: '开源自动化工作流平台'
  },
  {
    name: 'Zapier',
    url: 'https://zapier.com',
    desc: '连接应用程序的自动化工具'
  },
  {
    name: 'Make',
    url: 'https://www.make.com',
    desc: '强大的自动化集成平台'
  },
  {
    name: '扣子（Coze）',
    url: 'https://www.coze.cn',
    desc: '字节跳动AI智能体平台'
  },
  {
    name: 'IFTTT',
    url: 'https://ifttt.com',
    desc: '简单易用的自动化服务'
  },
  {
    name: 'Power Automate',
    url: 'https://powerautomate.microsoft.com',
    desc: '微软自动化流程平台'
  }
])

// 获取平台图标
const getPlatformIcon = (url) => {
  try {
    const domain = new URL(url).hostname.replace('www.', '')
    return `https://favicon.im/${domain}`
  } catch (error) {
    console.error('解析URL失败:', error)
    return '/src/assets/default.jpg'
  }
}

// 处理平台图标加载错误
const handlePlatformIconError = (event, platform) => {
  console.log('平台图标加载失败，使用默认图标:', platform.name)
  event.target.src = '/src/assets/default.jpg'
}

// 打开平台网站
const openPlatform = (url) => {
  window.open(url, '_blank')
}
</script>

<style scoped>
@import '../css/marketView.css'
</style>