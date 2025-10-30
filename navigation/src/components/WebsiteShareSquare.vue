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
                    <img :src="getFaviconUrl(site.url)" :alt="site.name" class="favicon-icon" @error="handleFaviconError">
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
          <button class="share-btn" @click="openShareModal">我也要分享</button>
        </div>
      </div>
    </div>

    <!-- 分享网站模态框 -->
    <div v-if="showModal" class="modal-overlay" @click="hideShareModal">
      <div class="modal-content" @click.stop>
        <!-- 卡片头部 -->
        <div class="modal-header">
          <div class="header-content">
            <h3 class="modal-title">分享网站</h3>
            <p class="modal-subtitle">选择您想要分享的网站</p>
          </div>
          <button class="close-btn" @click="hideShareModal">
            <i class="uil uil-times"></i>
          </button>
        </div>
        
        <!-- 卡片主体 -->
        <div class="modal-body">
          <!-- 导航标签 -->
          <div class="modal-tabs">
            <button 
              :class="['tab-btn', { active: activeTab === 'recommended' }]"
              @click="activeTab = 'recommended'"
            >
              <i class="uil uil-star"></i>
              我的网站
            </button>
            <button 
              :class="['tab-btn', { active: activeTab === 'custom' }]"
              @click="activeTab = 'custom'"
            >
              <i class="uil uil-edit"></i>
              自定义网站
            </button>
          </div>
          
          <!-- 内容区域 -->
          <div class="modal-content-area">
            
            <!-- 推荐网站内容 -->
            <div v-if="activeTab === 'recommended'" class="recommended-content">
              <div class="recommended-scroll-container">
                <div class="recommended-grid">
                  <div 
                    v-for="(site, index) in recommendedSites" 
                    :key="index"
                    class="recommended-site"
                    @click="selectRecommendedSite(site)"
                  >
                    <div class="site-icon">
                      <img :src="site.icon" :alt="site.title" @error="handleIconError">
                    </div>
                    <div class="site-info">
                      <h4 class="site-title">{{ site.title }}</h4>
                      <p class="site-desc">{{ site.description }}</p>
                    </div>
                    <button 
                      class="share-site-btn" 
                      :class="{ 'shared-btn': isSiteShared(site) }"
                      @click.stop="isSiteShared(site) ? removeSharedSite(site) : shareRecommendedSite(site)"
                    >
                      <i :class="isSiteShared(site) ? 'uil uil-share-alt' : 'uil uil-share'"></i>
                      <span class="btn-text">{{ isSiteShared(site) ? '已分享' : '分享' }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 自定义网站内容 -->
            <div v-if="activeTab === 'custom'" class="custom-content">
              <div class="custom-scroll-container">
                <!-- URL输入区域 -->
                <div class="url-input-section">
                  <input 
                    v-model="newShareSite.url" 
                    placeholder="请输入网站URL" 
                    class="url-input"
                  >
                  <div class="url-buttons">
                    <button @click="parseShareWebsite" class="parse-btn">开始解析</button>
                    <button @click="clearShareParse" class="clear-btn">清空解析</button>
                  </div>
                </div>
                
                <!-- 网站图标区域 -->
                <div class="icon-section">
                  <div class="icon-preview">
                    <img :src="newShareSite.icon_url || getDefaultIconUrl()" :alt="newShareSite.name" class="website-icon">
                    <div class="icon-actions">
                      <input 
                        type="file" 
                        ref="shareIconInput" 
                        accept="image/*" 
                        @change="handleShareIconUpload" 
                        style="display: none"
                      >
                      <div class="action-buttons">
                        <button @click="$refs.shareIconInput.click()" class="upload-icon-btn">上传图标</button>
                        <button @click="resetShareIcon" class="reset-icon-btn">重置图标</button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 网站信息输入区域 -->
                <div class="info-input-section">
                  <div class="input-group">
                    <label>网站名称</label>
                    <input 
                      v-model="newShareSite.name" 
                      placeholder="请输入网站名称" 
                      class="info-input"
                    >
                  </div>
                  
                  <div class="input-group">
                    <label>网站地址</label>
                    <input 
                      v-model="newShareSite.url" 
                      placeholder="请输入网站地址" 
                      class="info-input"
                      disabled
                    >
                  </div>
                  
                  <div class="input-group">
                    <label>网站描述</label>
                    <textarea 
                      v-model="newShareSite.description" 
                      placeholder="请输入网站简短描述（可选）" 
                      class="info-textarea"
                      rows="2"
                    ></textarea>
                  </div>
                </div>
                
                <!-- 自定义网站操作按钮 -->
                <div class="custom-action-buttons" ref="publishButtonRef">
                  <button @click="clearShareParse" class="clear-custom-btn">清空</button>
                  <button @click="shareWebsite" class="publish-custom-btn">发布</button>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { supabase, getCurrentUserId } from '../supabase.js'

// 定义props
const props = defineProps({
  personalLinks: {
    type: Array,
    default: () => []
  }
})

// 响应式数据
const searchKeyword = ref('')

// 模态框状态
const showModal = ref(false)
const activeTab = ref('recommended') // 默认显示推荐网站
const newShareSite = ref({ 
  name: '', 
  url: '', 
  description: '',
  icon_url: '/src/assets/smile.jpeg'
})

// 发布按钮引用
const publishButtonRef = ref(null)

// 推荐网站数据 - 使用个人链接数据
const recommendedSites = computed(() => {
  // 将个人链接转换为推荐网站格式
  return props.personalLinks.map(link => {
    // 从URL中提取域名用于favicon服务
    let domain = ''
    try {
      const url = new URL(link.website_url)
      domain = url.hostname.replace('www.', '')
    } catch (error) {
      domain = link.website_url.replace(/^https?:\/\/|\/.*$/g, '').replace('www.', '')
    }
    
    return {
      title: link.website_name,
      url: link.website_url,
      icon: `https://favicon.im/${domain}?larger=true`,
      description: link.website_description || link.website_name
    }
  })
})

// 真实数据 - 从数据库获取
const hotSites = ref([])
const allSites = ref([])
const todaySites = ref([])

// 分页相关
const currentPage = ref(1)
const pageSize = 12
const hasMore = ref(true)
const isLoading = ref(false)

// 获取热门网站（按点击次数排序）
const fetchHotSites = async () => {
  try {
    const { data, error } = await supabase
      .from('shared_websites')
      .select(`
        *,
        users!inner (
          user_profiles!inner (
            display_name
          )
        )
      `)
      .order('click_times', { ascending: false })
      .limit(3)
    
    if (error) throw error
    
    hotSites.value = data.map(site => ({
      name: site.name,
      url: site.url,
      uploader: site.users?.user_profiles?.display_name || '匿名用户',
      uploadTime: new Date(site.created_at).toLocaleDateString(),
      usageCount: site.click_times || 0
    }))
  } catch (error) {
    console.error('获取热门网站失败:', error)
  }
}

// 获取今日分享网站
const fetchTodaySites = async () => {
  try {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    
    const { data, error } = await supabase
      .from('shared_websites')
      .select(`
        *,
        users!inner (
          user_profiles!inner (
            display_name
          )
        )
      `)
      .gte('created_at', startOfDay.toISOString())
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) throw error
    
    todaySites.value = data.map(site => ({
      name: site.name,
      url: site.url,
      uploader: site.users?.user_profiles?.display_name || '匿名用户',
      uploadTime: new Date(site.created_at).toLocaleDateString(),
      usageCount: site.click_times || 0
    }))
  } catch (error) {
    console.error('获取今日分享失败:', error)
  }
}

// 获取所有分享网站（分页）
const fetchAllSites = async (page = 1, append = false) => {
  if (isLoading.value) return
  
  isLoading.value = true
  try {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    
    const { data, error } = await supabase
      .from('shared_websites')
      .select(`
        *,
        users!inner (
          user_profiles!inner (
            display_name
          )
        )
      `)
      .order('created_at', { ascending: false })
      .range(from, to)
    
    if (error) throw error
    
    const newSites = data.map(site => ({
      name: site.name,
      url: site.url,
      uploader: site.users?.user_profiles?.display_name || '匿名用户',
      uploadTime: new Date(site.created_at).toLocaleDateString(),
      description: site.description || ''
    }))
    
    if (append) {
      allSites.value = [...allSites.value, ...newSites]
    } else {
      allSites.value = newSites
    }
    
    hasMore.value = data.length === pageSize
    currentPage.value = page
  } catch (error) {
    console.error('获取所有分享失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 节流变量
let lastScrollTime = 0
const scrollThrottleDelay = 500 // 500ms节流延迟

// 无限滚动加载
const handleScroll = () => {
  const container = document.querySelector('.share-container')
  if (!container || isLoading.value || !hasMore.value) return
  
  // 节流控制：防止高频触发
  const now = Date.now()
  if (now - lastScrollTime < scrollThrottleDelay) {
    return
  }
  lastScrollTime = now
  
  const { scrollTop, scrollHeight, clientHeight } = container
  const threshold = 100 // 距离底部100px时触发加载
  
  // 精确判断是否滚动到底部
  const isAtBottom = scrollHeight - scrollTop - clientHeight <= threshold
  
  if (isAtBottom) {
    console.log('滚动到底部，触发加载第', currentPage.value + 1, '页')
    
    // 延迟500ms后加载，避免连续触发
    setTimeout(() => {
      fetchAllSites(currentPage.value + 1, true)
    }, 500)
  }
}

// 初始化数据
const initData = async () => {
  await Promise.all([
    fetchHotSites(),
    fetchTodaySites(),
    fetchAllSites(1)
  ])
}

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

const handleSiteClick = async (site) => {
  console.log('点击了网站:', site)
  
  // 优先打开网站
  if (site.url) {
    window.open(site.url, '_blank')
  }
  
  // 异步更新点击次数（不阻塞页面跳转）
  try {
    // 首先获取当前点击次数
    const { data: currentData, error: fetchError } = await supabase
      .from('shared_websites')
      .select('click_times')
      .eq('url', site.url)
      .single()
    
    if (fetchError) {
      console.error('获取点击次数失败:', fetchError)
    } else {
      // 更新点击次数 +1
      const { error: updateError } = await supabase
        .from('shared_websites')
        .update({ 
          click_times: (currentData.click_times || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('url', site.url)
      
      if (updateError) {
        console.error('更新点击次数失败:', updateError)
      } else {
        console.log('点击次数已更新')
        
        // 重新加载热门网站和今日新分享数据以更新显示
        await Promise.all([
          fetchHotSites(),
          fetchTodaySites()
        ])
      }
    }
  } catch (error) {
    console.error('处理点击统计时出错:', error)
  }
}

// 显示分享模态框
const openShareModal = () => {
  newShareSite.value = { 
    name: '', 
    url: '', 
    description: '',
    icon_url: '/src/assets/smile.jpeg'
  }
  showModal.value = true
}

// 隐藏分享模态框
const hideShareModal = () => {
  showModal.value = false
}

// 选择推荐网站
const selectRecommendedSite = (site) => {
  newShareSite.value = {
    name: site.title,
    url: site.url,
    description: site.description
  }
  activeTab.value = 'custom'
}

// 判断推荐网站是否已分享
const isSiteShared = (site) => {
  return allSites.value.some(sharedSite => sharedSite.url === site.url)
}

// 移除已分享的网站
const removeSharedSite = async (site) => {
  const userId = getCurrentUserId()
  if (!userId) {
    alert('请先登录后再操作')
    return
  }
  
  try {
    // 从数据库中删除
    const { error } = await supabase
      .from('shared_websites')
      .delete()
      .eq('url', site.url)
      .eq('user_id', userId)
    
    if (error) {
      throw error
    }
    
    // 重新加载数据
    await Promise.all([
      fetchHotSites(),
      fetchTodaySites(),
      fetchAllSites(1)
    ])
    
    console.log('已移除分享的网站:', site.title)
  } catch (error) {
    console.error('移除网站失败:', error)
    alert('移除网站失败，请重试')
  }
}

// 分享推荐网站
const shareRecommendedSite = async (site) => {
  const userId = getCurrentUserId()
  if (!userId) {
    alert('请先登录后再分享网站')
    return
  }
  
  try {
    // 插入到数据库
    const { data, error } = await supabase
      .from('shared_websites')
      .insert({
        user_id: userId,
        name: site.title,
        url: site.url,
        avatar: site.icon,
        description: site.description
      })
      .select()
    
    if (error) {
      throw error
    }
    
    // 重新加载数据
    await Promise.all([
      fetchHotSites(),
      fetchTodaySites(),
      fetchAllSites(1)
    ])
    
    alert('网站分享成功！')
  } catch (error) {
    console.error('分享网站失败:', error)
    alert('分享网站失败，请重试')
  }
}

// 解析网站信息
const parseShareWebsite = () => {
  if (!newShareSite.value.url) {
    alert('请输入网站URL')
    return
  }
  
  // 简单解析URL，提取网站名称
  try {
    const url = new URL(newShareSite.value.url)
    const hostname = url.hostname.replace('www.', '')
    
    // 如果没有设置名称，使用域名作为默认名称
    if (!newShareSite.value.name) {
      newShareSite.value.name = hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1)
    }
    
    // 使用 favicon.im 服务获取网站图标
    newShareSite.value.icon_url = `https://favicon.im/${hostname}?larger=true`
    
    // 解析完成后自动滚动到发布按钮
    nextTick(() => {
      if (publishButtonRef.value) {
        publishButtonRef.value.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
      }
    })
    
    alert('网站信息解析完成！图标已加载，请查看预览效果。')
  } catch (error) {
    alert('URL格式不正确，请检查后重试')
  }
}

// 清空解析
const clearShareParse = () => {
  newShareSite.value = { 
    name: '', 
    url: '', 
    description: '',
    icon_url: '/src/assets/smile.jpeg'
  }
}

// 处理图标上传
const handleShareIconUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      newShareSite.value.icon_url = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// 重置图标
const resetShareIcon = () => {
  if (newShareSite.value.url) {
    try {
      const url = new URL(newShareSite.value.url)
      const hostname = url.hostname.replace('www.', '')
      newShareSite.value.icon_url = `https://favicon.im/${hostname}?larger=true`
    } catch (error) {
      newShareSite.value.icon_url = '/src/assets/smile.jpeg'
    }
  } else {
    newShareSite.value.icon_url = '/src/assets/smile.jpeg'
  }
}

// 获取默认图标URL
const getDefaultIconUrl = () => {
  return '/src/assets/smile.jpeg'
}

// 分享网站
const shareWebsite = async () => {
  if (newShareSite.value.name && newShareSite.value.url) {
    const userId = getCurrentUserId()
    if (!userId) {
      alert('请先登录后再分享网站')
      return
    }
    
    try {
      // 如果用户没有填写描述，直接使用网站名字作为描述
      const description = newShareSite.value.description || newShareSite.value.name
      
      // 插入到数据库
      const { data, error } = await supabase
        .from('shared_websites')
        .insert({
          user_id: userId,
          name: newShareSite.value.name,
          url: newShareSite.value.url,
          avatar: newShareSite.value.icon_url,
          description: description
        })
        .select()
      
      if (error) {
        throw error
      }
      
      // 重新加载数据
      await Promise.all([
        fetchHotSites(),
        fetchTodaySites(),
        fetchAllSites(1)
      ])
      
      hideShareModal()
      alert('网站分享成功！')
    } catch (error) {
      console.error('分享网站失败:', error)
      alert('分享网站失败，请重试')
    }
  } else {
    alert('请填写网站名称和URL')
  }
}

// 获取网站 favicon URL
const getFaviconUrl = (url) => {
  try {
    const domain = new URL(url).hostname.replace('www.', '')
    return `https://favicon.im/${domain}?larger=true`
  } catch (error) {
    return 'https://favicon.im/hey.com'
  }
}

// 处理 favicon 加载错误
const handleFaviconError = (event) => {
  event.target.src = 'https://favicon.im/hey.com'
}

// 处理图标加载错误
const handleIconError = (event) => {
  event.target.src = '/src/assets/smile.jpeg'
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
onMounted(() => {
  initData()
  
  // 添加滚动监听器
  const container = document.querySelector('.share-container')
  if (container) {
    container.addEventListener('scroll', handleScroll)
  }
  
  startTodayScroll()
})

onUnmounted(() => {
  // 移除滚动监听器
  const container = document.querySelector('.share-container')
  if (container) {
    container.removeEventListener('scroll', handleScroll)
  }
  
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



/* 默认图标样式 */
.default-icon {
  font-size: 20px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Favicon 图标样式 */
.favicon-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 4px;
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

/* 模态框样式 - 仿照Classify.vue */
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
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 0;
  width: 100%;
  max-width: 850px;
  max-height: 90vh;
  height: 700px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  animation: slideUp 0.3s ease;
  transform: translateY(0);
}

/* 动画效果 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(30px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 24px 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px 20px 0 0;
}

.header-content {
  flex: 1;
}

.modal-title {
  margin: 0 0 4px 0;
  color: white;
  font-size: 20px;
  font-weight: 600;
}

.modal-subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 400;
}

/* 模态框主体 */
.modal-body {
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 模态框内容区域 */
.modal-content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 24px 24px 24px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s;
}

.close-btn:hover {
  color: #333;
  background: #f8f9fa;
}

/* 模态框标签页样式 */
.modal-tabs {
  display: flex;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 8px;
  margin: 16px 24px 24px 24px;
  gap: 4px;
  border: 2px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab-btn {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #6c757d;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tab-btn.active {
  background: white;
  color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.tab-btn:hover {
  color: #495057;
  background: rgba(102, 126, 234, 0.1);
}

/* 推荐网站内容样式 */
.recommended-content {
  max-height: 450px;
  overflow: hidden;
  padding: 0;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  background: #fff;
}

/* 滚动容器 */
.recommended-scroll-container {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px;
  width: 100%;
  box-sizing: border-box;
}

/* 推荐网站网格 */
.recommended-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
}

/* 推荐网站项 */
.recommended-site {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
  box-sizing: border-box;
  min-height: 72px;
}

.recommended-site:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

/* 网站图标 */
.site-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.site-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 网站信息 */
.site-info {
  flex: 1;
  min-width: 0;
}

.site-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.site-desc {
  font-size: 12px;
  color: #6c757d;
  margin: 0;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

/* 分享按钮 */
.share-site-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 20px;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
  outline: none;
  font-size: 12px;
  gap: 4px;
  min-width: 60px;
}

.share-site-btn:hover {
  background: #5a6fd8;
  transform: translateY(-1px);
}

/* 已分享按钮样式 */
.shared-btn {
  background: #28a745 !important;
}

.shared-btn:hover {
  background: #20c997 !important;
}

.btn-text {
  font-weight: 500;
}

/* 自定义网站内容样式 */
.custom-content {
  display: flex;
  flex-direction: column;
  height: auto;
  max-height: 500px;
  overflow: hidden;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  background: #fff;
  padding: 16px;
}

/* 自定义网站滚动容器 */
.custom-scroll-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px;
  max-height: 380px;
}

/* 自定义滚动条样式 */
.custom-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.custom-scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.custom-scroll-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.custom-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* URL输入区域 */
.url-input-section {
  margin-bottom: 16px;
}

.url-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 10px;
}

.url-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.url-buttons {
  display: flex;
  gap: 10px;
}

.parse-btn, .clear-btn {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #007bff;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.parse-btn {
  background: #007bff;
  color: #fff;
}

.parse-btn:hover {
  background: #0056b3;
  border-color: #0056b3;
}

.clear-btn {
  background: transparent;
  color: #007bff;
}

.clear-btn:hover {
  background: rgba(0, 123, 255, 0.1);
}

/* 网站图标区域 */
.icon-section {
  margin-bottom: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.icon-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.website-icon {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  border: 2px solid #ddd;
  flex-shrink: 0;
}

.icon-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.upload-icon-btn, .reset-icon-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.upload-icon-btn:hover {
  border-color: #007bff;
  color: #007bff;
}

.reset-icon-btn:hover {
  border-color: #ff6b6b;
  color: #ff6b6b;
}

/* 网站信息输入区域 */
.info-input-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group label {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.info-input, .info-textarea {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.info-input:focus, .info-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.info-textarea {
  resize: vertical;
  min-height: 60px;
  max-height: 80px;
}

/* 自定义网站操作按钮 */
.custom-action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 16px 0;
  border-top: 1px solid #eee;
}

.clear-custom-btn, .publish-custom-btn {
  padding: 10px 20px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 80px;
}

.clear-custom-btn {
  background: transparent;
  color: #666;
}

.clear-custom-btn:hover {
  background: #f8f9fa;
  border-color: #999;
}

.publish-custom-btn {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: #fff;
  border: none;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
}

.publish-custom-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
}

/* 模态框底部按钮 */
.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 0 0 0;
  border-top: 1px solid #eee;
  justify-content: flex-end;
  margin-top: 20px;
}

.cancel-btn, .save-btn {
  padding: 12px 24px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 80px;
}

.cancel-btn {
  background: transparent;
  color: #666;
}

.cancel-btn:hover {
  background: #f8f9fa;
  border-color: #999;
}

.save-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

/* 模态框响应式设计 */
@media (max-width: 768px) {
  .modal-content {
    margin: 20px;
    width: calc(100% - 40px);
  }
  
  .recommended-grid {
    grid-template-columns: 1fr;
  }
  
  .recommended-site {
    padding: 12px;
  }
  
  .site-icon {
    width: 40px;
    height: 40px;
    margin-right: 12px;
  }
}

@media (max-width: 480px) {
  .modal-content {
    margin: 20px;
    width: calc(100% - 40px);
  }
  
  .recommended-site {
    flex-direction: column;
    text-align: center;
    padding: 16px;
  }
  
  .site-icon {
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .site-icon {
    margin-right: 0;
    margin-bottom: 8px;
  }
  
  .site-info {
    text-align: center;
  }
}
</style>