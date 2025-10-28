<template>
  <div class="classify-container">
    <!-- 左侧导航条组件 -->
    <SidebarNavigation />
    
    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 顶部标题区域 -->
      <div class="page-header">
        <h1 class="page-title">{{ currentCategoryName }}</h1>
      </div>

      <!-- 主要内容区域 - 大卡片 -->
      <div class="content-card">
        <!-- 6×3网格布局 -->
        <div class="grid-container">
          <!-- 网站项：图标和文字组合 -->
          <div 
            v-for="(site, index) in websites" 
            :key="index"
            class="website-item"
            @click="openWebsite(site.url)"
          >
            <div class="website-icon-box">
              <i :class="['uil', site.icon]"></i>
            </div>
            <span class="website-name">{{ site.name }}</span>
          </div>

          <!-- 添加按钮：图标+文字 -->
          <div class="add-item" @click="showAddModal">
            <div class="add-icon-box">
              <i class="uil uil-plus"></i>
            </div>
            <span class="add-name">添加网站</span>
          </div>
        </div>
      </div>

      <!-- 添加网站模态框 -->
      <div v-if="showModal" class="modal-overlay" @click="hideModal">
        <div class="modal-content" @click.stop>
          <!-- 顶部导航栏 -->
          <div class="modal-header">
            <h3>添加网站</h3>
            <button class="close-btn" @click="hideModal">
              <i class="uil uil-times"></i>
            </button>
          </div>
          
          <!-- 导航标签 -->
          <div class="modal-tabs">
            <button 
              :class="['tab-btn', { active: activeTab === 'recommended' }]"
              @click="activeTab = 'recommended'"
            >
              推荐网站
            </button>
            <button 
              :class="['tab-btn', { active: activeTab === 'custom' }]"
              @click="activeTab = 'custom'"
            >
              自定义网站
            </button>
          </div>
          
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
                  <button class="add-site-btn" @click.stop="addRecommendedSite(site)">
                    <i class="uil uil-plus"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 自定义网站内容 -->
          <div v-if="activeTab === 'custom'" class="custom-content">
            <div class="custom-scroll-container">
              <div class="modal-body">
                <!-- URL输入区域 -->
                <div class="url-input-section">
                  <input 
                    v-model="newSite.url" 
                    placeholder="请输入网站URL" 
                    class="url-input"
                  >
                  <div class="url-buttons">
                    <button @click="parseWebsite" class="parse-btn">开始解析</button>
                    <button @click="clearParse" class="clear-btn">清空解析</button>
                  </div>
                </div>
                
                <!-- 网站图标区域 -->
                <div class="icon-section">
                  <div class="icon-preview">
                    <img :src="newSite.icon_url || getDefaultIconUrl()" :alt="newSite.name" class="website-icon">
                    <div class="icon-actions">
                      <input 
                        type="file" 
                        ref="iconInput" 
                        accept="image/*" 
                        @change="handleIconUpload" 
                        style="display: none"
                      >
                      <div class="action-buttons">
                        <button @click="$refs.iconInput.click()" class="upload-icon-btn">上传图标</button>
                        <button @click="resetIcon" class="reset-icon-btn">重置图标</button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 网站信息输入区域 -->
                <div class="info-input-section">
                  <div class="input-group">
                    <label>网站名称</label>
                    <input 
                      v-model="newSite.name" 
                      placeholder="请输入网站名称" 
                      class="info-input"
                    >
                  </div>
                  
                  <div class="input-group">
                    <label>网站地址</label>
                    <input 
                      v-model="newSite.url" 
                      placeholder="请输入网站地址" 
                      class="info-input"
                      disabled
                    >
                  </div>
                  

                </div>
              </div>
              
              <!-- 模态框底部按钮 -->
              <div class="modal-footer">
                <button @click="hideModal" class="cancel-btn">取消</button>
                <button @click="addWebsite" class="save-btn">添加</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import SidebarNavigation from '../components/SidebarNavigation.vue'
import { getCategoryByName } from '../utils/categoryData'
import { supabase } from '../supabase.js'

const route = useRoute()

// 当前分类名称
const currentCategoryName = ref('我的分类')

// 根据UUID从数据库获取分类名称
const loadCategoryName = async () => {
  const categoryId = route.params.categoryId
  console.log('路由参数 categoryId:', categoryId)
  
  if (!categoryId) {
    currentCategoryName.value = '我的分类'
    return
  }
  
  try {
    // 从category_templates表查询分类名称
    const { data, error } = await supabase
      .from('category_templates')
      .select('name')
      .eq('id', categoryId)
      .single()
    
    if (error) {
      console.error('查询分类名称失败:', error)
      currentCategoryName.value = '我的分类'
    } else if (data) {
      console.log('查询到的分类名称:', data.name)
      currentCategoryName.value = data.name
    }
  } catch (error) {
    console.error('加载分类名称异常:', error)
    currentCategoryName.value = '我的分类'
  }
}

// 推荐网站数据（根据当前分类名称获取）
const recommendedSites = computed(() => {
  const categoryName = currentCategoryName.value
  
  // 如果分类名称为空或默认值，返回空数组
  if (!categoryName || categoryName === '我的分类') {
    return []
  }
  
  // 根据分类名称查找对应的分类数据
  const category = getCategoryByName(categoryName)
  
  // 如果找到对应的分类数据，返回该分类的网站列表
  if (category && category.tools && category.tools.length > 0) {
    return category.tools
  }
  
  // 如果找不到对应的分类数据，返回空数组
  return []
})

// 网站数据
const websites = ref([
  { name: '百度', url: 'https://baidu.com', icon: 'uil-search' },
  { name: '知乎', url: 'https://zhihu.com', icon: 'uil-book-open' },
  { name: 'B站', url: 'https://bilibili.com', icon: 'uil-play-circle' },
  { name: 'GitHub', url: 'https://github.com', icon: 'uil-github' },
  { name: '淘宝', url: 'https://taobao.com', icon: 'uil-shopping-cart' },
  { name: '微信', url: 'https://weixin.qq.com', icon: 'uil-comment' },
  { name: '微博', url: 'https://weibo.com', icon: 'uil-comment-alt' },
  { name: '网易云', url: 'https://music.163.com', icon: 'uil-music' },
  { name: '豆瓣', url: 'https://douban.com', icon: 'uil-star' },
  { name: '腾讯视频', url: 'https://v.qq.com', icon: 'uil-film' },
  { name: '京东', url: 'https://jd.com', icon: 'uil-shopping-bag' },
  { name: '美团', url: 'https://meituan.com', icon: 'uil-utensils' },
  { name: '饿了么', url: 'https://ele.me', icon: 'uil-pizza-slice' },
  { name: '携程', url: 'https://ctrip.com', icon: 'uil-plane' },
  { name: '滴滴', url: 'https://didiglobal.com', icon: 'uil-car' },
  { name: '高德地图', url: 'https://amap.com', icon: 'uil-map-marker' },
  { name: '钉钉', url: 'https://dingtalk.com', icon: 'uil-briefcase' },
])

// 模态框状态
const showModal = ref(false)
const activeTab = ref('recommended') // 默认显示推荐网站
const newSite = ref({ 
  name: '', 
  url: '', 
  description: '',
  icon_url: '/src/assets/smile.jpeg'
})

// 打开网站
const openWebsite = (url) => {
  window.open(url, '_blank')
}

// 显示添加模态框
const showAddModal = () => {
  newSite.value = { 
    name: '', 
    url: '', 
    description: '',
    icon_url: '/src/assets/smile.jpeg'
  }
  showModal.value = true
}

// 隐藏模态框
const hideModal = () => {
  showModal.value = false
}

// 选择推荐网站
const selectRecommendedSite = (site) => {
  newSite.value = {
    name: site.title,
    url: site.url
  }
  activeTab.value = 'custom'
}

// 直接添加推荐网站
const addRecommendedSite = (site) => {
  websites.value.push({
    name: site.title,
    url: site.url,
    icon: site.icon || 'uil-globe' // 使用推荐网站的图标，无则兜底
  })
  hideModal()
}

// 解析网站信息
const parseWebsite = () => {
  if (!newSite.value.url) {
    alert('请输入网站URL')
    return
  }
  
  // 简单解析URL，提取网站名称
  try {
    const url = new URL(newSite.value.url)
    const hostname = url.hostname.replace('www.', '')
    
    // 如果没有设置名称，使用域名作为默认名称
    if (!newSite.value.name) {
      newSite.value.name = hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1)
    }
    
    // 设置默认图标URL
    newSite.value.icon_url = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`
    
    alert('网站信息解析完成！')
  } catch (error) {
    alert('URL格式不正确，请检查后重试')
  }
}

// 清空解析
const clearParse = () => {
  newSite.value = { 
    name: '', 
    url: '', 
    description: '',
    icon_url: '/src/assets/smile.jpeg'
  }
}

// 处理图标上传
const handleIconUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      newSite.value.icon_url = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// 重置图标
const resetIcon = () => {
  if (newSite.value.url) {
    try {
      const url = new URL(newSite.value.url)
      newSite.value.icon_url = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`
    } catch (error) {
      newSite.value.icon_url = '/src/assets/smile.jpeg'
    }
  } else {
    newSite.value.icon_url = '/src/assets/smile.jpeg'
  }
}

// 获取默认图标URL
const getDefaultIconUrl = () => {
  return '/src/assets/smile.jpeg'
}

// 添加网站
const addWebsite = () => {
  if (newSite.value.name && newSite.value.url) {
    websites.value.push({
      name: newSite.value.name,
      url: newSite.value.url,
      icon: 'uil-globe'
    })
    hideModal()
  } else {
    alert('请填写网站名称和URL')
  }
}

// 处理图标加载错误
const handleIconError = (event) => {
  event.target.src = '/src/assets/smile.jpeg'
}

// 监听路由参数变化
import { watch } from 'vue'

watch(() => route.params.categoryId, (newCategoryId) => {
  console.log('路由参数变化，新的categoryId:', newCategoryId)
  loadCategoryName()
})

// 初始化
onMounted(() => {
  console.log('分类页面加载完成')
  loadCategoryName()
  console.log('路由参数 categoryId:', route.params.categoryId)
  console.log('推荐网站数据:', recommendedSites.value)
})
</script>

<style scoped>
.classify-container {
  min-height: 100vh;
  background: #f8f9fa;
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  display: flex;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  padding: 20px;
  margin-left: 60px; /* 导航栏宽度 */
}

/* 顶部标题区域 */
.page-header {
  margin-bottom: 24px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 24px;
}

.page-title {
  color: #667eea;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
}

/* 主要内容卡片 */
.content-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  min-height: 500px;
  max-width: 1200px;
  margin: 10px auto 0;
}

/* 网格布局 */
.grid-container {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 60px; /* 图标之间的间距 */
  margin: 20px 60px;
}

/* 网站项：包含图标和文字 */
.website-item {
  position: relative;
  cursor: pointer;
  aspect-ratio: 1; /* 保持正方形比例 */
}

/* 图标盒子：仅承载图标 */
.website-icon-box {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.website-icon-box i {
  font-size: 24px;
  color: white;
}

.website-item:hover .website-icon-box {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 文字：绝对定位在图标正下方 */
.website-name {
  position: absolute;
  top: calc(100% + 8px); /* 图标底部 + 间距 */
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #333;
  font-weight: 500;
  white-space: nowrap; /* 防止文字换行 */
  text-align: center;
}

/* 添加按钮项 */
.add-item {
  position: relative;
  cursor: pointer;
}

/* 添加按钮的图标盒子 */
.add-icon-box {
  width: 100%;
  height: 100%;
  background: #e9ecef;
  border: 2px dashed #adb5bd;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.add-icon-box i {
  font-size: 24px;
  color: #adb5bd;
}

.add-item:hover .add-icon-box {
  background: #dee2e6;
  border-color: #667eea;
  transform: translateY(-2px);
}

/* 添加按钮的文字 */
.add-name {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
  white-space: nowrap;
  text-align: center;
}

/* 模态框样式 */
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
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 800px; /* 加大模态框宽度 */
  max-height: 90vh; /* 限制最大高度 */
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
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
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 20px;
}

.tab-btn {
  flex: 1;
  padding: 12px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: #6c757d;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.tab-btn:hover {
  color: #495057;
}

/* 推荐网站内容样式 - 移除不必要的宽度和边距 */
.recommended-content {
  max-height: 400px; /* 调整最大高度，适配模态框 */
  overflow: hidden;
  padding: 0;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
}

/* 滚动容器 - 优化滚动体验 */
.recommended-scroll-container {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px;
  width: 100%;
  box-sizing: border-box;
}

/* 推荐网站网格 - 改为自适应列数，确保宽度正确 */
.recommended-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); /* 自动填充，每列最小280px */
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
}

/* 推荐网站项 - 优化Flex布局和间距 */
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

/* 网站图标 - 调整尺寸和背景 */
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
  justify-content: center; /* 图标加载前的兜底对齐 */
}

.site-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* 改为contain，确保图标完整显示 */
}

/* 网站信息 - 允许文字换行，优化溢出 */
.site-info {
  flex: 1;
  min-width: 0;
}

.site-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
  white-space: normal; /* 允许换行 */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1; /* 最多显示1行 */
  -webkit-box-orient: vertical;
}

.site-desc {
  font-size: 12px;
  color: #6c757d;
  margin: 0;
  white-space: normal; /* 允许换行 */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1; /* 最多显示1行 */
  -webkit-box-orient: vertical;
}

/* 添加按钮 - 调整尺寸和位置 */
.add-site-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
  outline: none;
}

.add-site-btn:hover {
  background: #5a6fd8;
  transform: scale(1.1);
}

/* 自定义网站内容样式 - 仿照Community.vue样式 */
.custom-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 500px; /* 限制最大高度 */
  overflow: hidden; /* 隐藏外层溢出 */
}

/* 自定义网站滚动容器 */
.custom-scroll-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px; /* 为滚动条留出空间 */
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

/* 模态框底部按钮 */
.modal-footer {
  display: flex;
  gap: 10px;
  padding: 16px 0 0 0;
  border-top: 1px solid #eee;
  justify-content: flex-end;
  margin-top: auto;
}

.cancel-btn, .save-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn {
  background: transparent;
  color: #666;
}

.cancel-btn:hover {
  background: #f8f9fa;
}

.save-btn {
  background: #007bff;
  color: #fff;
  border-color: #007bff;
}

.save-btn:hover {
  background: #0056b3;
  border-color: #0056b3;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .main-content {
    padding: 16px;
    margin-left: 0;
  }
  
  .content-card {
    padding: 16px;
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
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .page-title {
    font-size: 24px;
  }
  
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