<template>
  <div class="community-container">
    <!-- 主内容区域 -->
    <div class="main-content">
      <div class="nav-container">
        <!-- 顶部自定义导航区域 -->
        <div class="custom-nav">
          <div class="nav-card">
            <h2 class="nav-title">我的导航🌹🌹🌹🌹🌹</h2>
            
            <!-- 用户状态提示 -->
            <div class="user-section">
              <div class="user-info">
                <span class="user-email">HI，{{ userName }}</span>
              </div>
            </div>
            
            <!-- 添加链接按钮 -->
            <div class="add-link-section">
              <button @click="handleAddLinkClick" class="add-link-btn">
                <span class="plus-icon">+</span>
                添加链接
              </button>
            </div>
            
            <!-- 用户链接卡片展示区域 -->
            <div class="user-links-section">
              <div class="section-header">
                <h3 class="section-title">个人链接🔗</h3>
                <span class="link-count">{{ customLinks.length }} 个链接</span>
              </div>
              
              <!-- 自定义链接卡片网格 - 仿照ProgrammingTools.vue样式 -->
              <div class="custom-links-container">
                <div class="cards-wrapper">
                  <div 
                    v-for="(link, index) in customLinks" 
                    :key="index" 
                    class="card"
                    @click="handleCustomLinkClick(link)"
                  >
                    <div class="card-icon-container">
                      <img :src="getLinkIcon(link)" :alt="link.website_name + '图标'" class="card-icon" @error="handleIconError($event, link)">
                    </div>
                    <div class="card-text">
                      <h3 class="card-title">{{ link.website_name }}</h3>
                      <p class="card-desc">{{ link.website_description || link.website_url }}</p>
                    </div>
                    <button @click.stop="removeCustomLink(index)" class="link-delete-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <!-- 空状态提示 -->
                <div v-if="customLinks.length === 0" class="empty-state">
                  <div class="empty-icon">📋</div>
                  <p class="empty-text">还没有添加任何链接</p>
                  <p class="empty-subtext">点击上方的"添加链接"按钮开始创建您的个人导航</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 网站分享广场 -->
        <div class="website-share-section">
          <WebsiteShareSquare :personal-links="customLinks" @navigation-updated="handleNavigationUpdated" />
        </div>
        
        <!-- 10个类别的导航卡片 -->
        <div class="category-navigation">
          <ProgrammingTools 
            v-for="category in categories" 
            :key="category.title"
            :title="category.title" 
            :icon="category.icon"
            :tools="category.tools"
            @tool-click="handleCategoryToolClick"
          />
        </div>
        
        <!-- 添加链接模态框 -->
        <div v-if="showAddLinkModal" class="modal-overlay">
          <div class="modal-content">
            <div class="modal-header">
              <h3>新增链接</h3>
              <button @click="showAddLinkModal = false" class="modal-close-btn">×</button>
            </div>
            
            <div class="modal-body">
              <!-- URL输入区域 -->
              <div class="url-input-section">
                <input 
                  v-model="newLink.url" 
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
                  <img :src="newLink.icon_url || getDefaultIconUrl()" :alt="newLink.name" class="website-icon">
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
                    v-model="newLink.name" 
                    placeholder="请输入网站名称" 
                    class="info-input"
                  >
                </div>
                
                <div class="input-group">
                  <label>网站地址</label>
                  <input 
                    v-model="newLink.url" 
                    placeholder="请输入网站地址" 
                    class="info-input"
                    disabled
                  >
                </div>
                
                <div class="input-group">
                  <label>网站描述</label>
                  <textarea 
                    v-model="newLink.description" 
                    placeholder="请输入网站描述" 
                    class="info-textarea"
                    rows="3"
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div class="modal-footer">
              <button @click="showAddLinkModal = false" class="cancel-btn">取消</button>
              <button @click="addCustomLink" class="save-btn">保存</button>
            </div>
          </div>
        </div>
        
        <!-- 智能体按钮（固定右侧） -->
        <div class="ai-assistant-float-btn" @click="showAIModal = true">
          <div class="bubble-tooltip">
            你来描述，我帮你找！
          </div>
          <img :src="fatcatImg" alt="智能助手" class="ai-btn-icon">
        </div>
        
        <!-- 智能体对话框气泡 -->
        <div v-if="showAIModal" class="ai-chat-bubble">
          <div class="ai-bubble-content">
            <div class="ai-bubble-header">
              <h3>智能助手</h3>
              <button @click="showAIModal = false" class="ai-bubble-close-btn">×</button>
            </div>
            <div class="ai-bubble-body">
              <iframe 
                src="https://www.coze.cn/store/agent/7570328779717918746?bot_id=true&ui.header=false"
                width="100%"
                height="500px"
                frameborder="0"
                allow="fullscreen"
                scrolling="auto"
              ></iframe>
            </div>
          </div>
          <!-- 气泡箭头指向按钮 -->
          <div class="ai-bubble-arrow"></div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import ProgrammingTools from '../components/ProgrammingTools.vue'
import WebsiteShareSquare from '../components/WebsiteShareSquare.vue'
import { getAllCategories } from '../utils/categoryData'
import { supabase, updateSupabaseHeaders, validateUserId } from '../supabase.js'
import { useAuthStore } from '../stores/auth.js'
import fatcatImg from '../assets/fatcat.jpg'

// 模态框显示状态
const showAddLinkModal = ref(false)
const showAIModal = ref(false)

// 自定义导航链接
const customLinks = ref([])
const newLink = ref({ 
  name: '', 
  url: '', 
  description: '',
  icon_url: '/src/assets/smile.jpeg'
})

// 10个类别的导航数据
const categories = ref(getAllCategories())

// 使用 Pinia store 获取用户信息
const authStore = useAuthStore()

// 计算属性获取用户昵称
const userName = computed(() => {
  return authStore.user?.displayName || authStore.user?.username || '用户'
})

// 计算属性获取当前用户状态
const currentUser = computed(() => {
  return authStore.user
})



// 热门推荐标签和应用数据
const tabs = ['全部', '工具', '娱乐', '学习']
const currentTab = ref(0)
const apps = ref([
  { name: 'NBtab-美女动态', desc: '清新无广告，浏览更...', icon: '/src/assets/smile.jpeg', category: '娱乐' },
  { name: '享趣追剧神器', desc: '超高清4K，永久免费...', icon: '/src/assets/smile.jpeg', category: '娱乐' },
  { name: '火车太顺', desc: '火车票抢票助手', icon: '/src/assets/smile.jpeg', category: '工具' },
  { name: '555电影', desc: '免费影视平台', icon: '/src/assets/smile.jpeg', category: '娱乐' },
  { name: 'DeepSeek', desc: '深度求索AI', icon: '/src/assets/smile.jpeg', category: '工具' },
  { name: '豆包', desc: '字节跳动智能助手', icon: '/src/assets/smile.jpeg', category: '工具' },
  { name: '电子木鱼', desc: '赛博功德积累神器', icon: '/src/assets/smile.jpeg', category: '娱乐' },
  { name: 'Excalidraw', desc: '手绘风格流程图工具', icon: '/src/assets/smile.jpeg', category: '工具' },
  { name: '反向词典', desc: '清华大学开源词汇工具', icon: '/src/assets/smile.jpeg', category: '学习' },
])

// 计算属性
const filteredApps = computed(() => {
  if (currentTab.value === 0) return apps.value;
  return apps.value.filter(app => app.category === tabs[currentTab.value]);
})

// 生命周期
onMounted(async () => {
  await authStore.initializeAuth()
  await loadCustomLinks();
})

// 加载用户自定义链接
const loadCustomLinks = async () => {
  if (!currentUser.value) return;
  
  try {
    // 更新Supabase认证头信息
    updateSupabaseHeaders()
    
    // 直接查询个人导航链接表（RLS策略已禁用）
    const { data, error } = await supabase
      .from('personal_navigation')
      .select('*')
      .eq('user_id', currentUser.value.id)
      .order('created_at', { ascending: true })
    
    if (!error && data) {
      customLinks.value = data.map(link => ({
        ...link,
        desc: link.website_description
      }))
    } else {
      console.error('加载自定义链接失败:', error)
    }
  } catch (error) {
    console.error('加载自定义链接异常:', error)
  }
}

// 添加自定义链接
const addCustomLink = async () => {
  if (!currentUser.value) {
    alert('请先登录')
    return;
  }
  
  if (newLink.value.name && newLink.value.url) {
    // 验证URL格式
    if (!newLink.value.url.startsWith('http://') && !newLink.value.url.startsWith('https://')) {
      newLink.value.url = 'https://' + newLink.value.url;
    }
    
    // 只存储用户上传的自定义图片，不存储解析的图片
    const customIconUrl = newLink.value.icon_url === '/src/assets/smile.jpeg' || 
                         newLink.value.icon_url.startsWith('blob:') ? 
                         newLink.value.icon_url : null;
    
    try {
      // 更新Supabase认证头信息
      updateSupabaseHeaders()
      
      // 直接插入数据到数据库（RLS策略已禁用）
      const { data, error } = await supabase
        .from('personal_navigation')
        .insert({
          user_id: currentUser.value.id,
          website_url: newLink.value.url,
          website_name: newLink.value.name,
          website_description: newLink.value.description,
          custom_icon_url: customIconUrl
        })
        .select()
      
      if (!error && data && data.length > 0) {
        // 添加到本地列表
        const newLinkData = data[0]
        customLinks.value.push({
          ...newLinkData,
          desc: newLinkData.website_description
        })
        
        // 重置表单
        newLink.value = { 
          name: '', 
          url: '', 
          description: '',
          icon_url: '/src/assets/smile.jpeg'
        };
        showAddLinkModal.value = false;
      } else {
        console.error('保存自定义链接失败:', error)
        alert('保存失败，请重试')
      }
    } catch (error) {
      console.error('保存自定义链接异常:', error)
      alert('保存失败，请重试')
    }
  }
}

// 删除自定义链接
const removeCustomLink = async (index) => {
  const link = customLinks.value[index]
  if (!link.id) {
    customLinks.value.splice(index, 1)
    return
  }
  
  if (!currentUser.value) {
    alert('请先登录')
    return
  }
  
  try {
    // 更新Supabase认证头信息
    updateSupabaseHeaders()
    
    // 直接删除数据（RLS策略已禁用）
    const { error } = await supabase
      .from('personal_navigation')
      .delete()
      .eq('id', link.id)
      .eq('user_id', currentUser.value.id)
    
    if (!error) {
      customLinks.value.splice(index, 1)
    } else {
      console.error('删除自定义链接失败:', error)
      alert('删除失败，请重试')
    }
  } catch (error) {
    console.error('删除自定义链接异常:', error)
    alert('删除失败，请重试')
  }
}

// 解析网站信息
const parseWebsite = async () => {
  if (!newLink.value.url) {
    alert('请输入网站URL')
    return
  }
  
  try {
    // 验证URL格式
    let url = newLink.value.url
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
      newLink.value.url = url
    }
    
    // 获取网站信息
    const domain = new URL(url).hostname
    
    // 使用指定的favicon服务
    newLink.value.icon_url = `https://favicon.im/${domain}`
    
    if (!newLink.value.name) {
      // 从URL中提取网站名称
      const nameFromUrl = domain.replace('www.', '').split('.')[0]
      newLink.value.name = nameFromUrl.charAt(0).toUpperCase() + nameFromUrl.slice(1)
    }
    
    if (!newLink.value.description) {
      newLink.value.description = `快速访问 ${domain}`
    }
    
    console.log('网站解析完成:', newLink.value)
    alert('网站信息已自动填充，请检查并修改')
  } catch (error) {
    console.error('解析网站失败:', error)
    alert('解析网站失败，请手动填写信息')
  }
}

// 获取默认图标URL
const getDefaultIconUrl = () => {
  // 使用正确的静态资源路径
  return '/src/assets/smile.jpeg'
}

// 清空解析结果
const clearParse = () => {
  newLink.value = { 
    name: '', 
    url: newLink.value.url, // 保留URL
    description: '',
    icon_url: '/src/assets/smile.jpeg'
  };
}

// 处理类别工具点击
const handleCategoryToolClick = (tool) => {
  console.log('类别工具被点击:', tool.title)
  if (tool.url && tool.url !== '#') {
    window.open(tool.url, '_blank')
  }
}

// 处理自定义链接点击
const handleCustomLinkClick = (link) => {
  if (link.website_url) {
    window.open(link.website_url, '_blank')
  }
}

// 处理导航更新事件
const handleNavigationUpdated = async () => {
  console.log('收到导航更新事件，重新加载个人导航数据')
  await loadCustomLinks()
}

// 处理添加链接点击
const handleAddLinkClick = () => {
  showAddLinkModal.value = true
}



// 处理图标上传
const handleIconUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      newLink.value.icon_url = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// 重置图标
const resetIcon = () => {
  const domain = newLink.value.url ? new URL(newLink.value.url).hostname : ''
  newLink.value.icon_url = domain ? 
    `https://favicon.im/${domain}` : 
    '/src/assets/smile.jpeg'
}

// 获取链接图标
const getLinkIcon = (link) => {
  // 如果链接有自定义图标，优先使用
  if (link.custom_icon_url && link.custom_icon_url !== '/src/assets/smile.jpeg') {
    return link.custom_icon_url;
  }
  
  // 否则使用favicon.im服务获取网站图标
  if (link.website_url) {
    try {
      const domain = new URL(link.website_url).hostname;
      return `https://favicon.im/${domain}`;
    } catch (error) {
      console.error('解析URL失败:', error);
      return '/src/assets/smile.jpeg';
    }
  }
  
  // 默认图标
  return '/src/assets/smile.jpeg';
}

// 处理图标加载错误
const handleIconError = (event, link) => {
  console.log('图标加载失败，使用默认图标');
  event.target.src = '/src/assets/smile.jpeg';
}
</script>

<style scoped>
.community-container {
  min-height: 100vh;
}

.main-content {
  margin-left: 30px;
  padding: 40px;
  background-color: #f5f6fa;
  min-height: 100vh;
  width: calc(100% - 30px);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.custom-nav {
  margin-bottom: 40px;
}

.nav-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-title {
  font-size: 24px;
  margin-bottom: 20px;
  text-align: left;
  color: #333;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.user-section {
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-email {
  font-size: 14px;
  color: #666;
}

.add-link-section {
  margin-bottom: 24px;
}

.add-link-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: transparent;
  border: 2px dashed #ddd;
  border-radius: 8px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
  justify-content: center;
}

.add-link-btn:hover {
  border-color: #007bff;
  color: #007bff;
  background: rgba(0, 123, 255, 0.05);
}

.plus-icon {
  font-size: 18px;
  font-weight: bold;
}

.custom-links-container {
  max-width: 1200px;
  height: 280px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.cards-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 4px;
  height: calc(100% - 40px);
  overflow-y: auto;
}

.card {
  display: flex;
  align-items: center;
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  padding: 8px;
  transition: all 0.3s ease;
  height: 55px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
}

.card:hover {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.card-icon-container {
  width: 45px;
  height: 45px;
  flex-shrink: 0;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.card-text {
  flex-grow: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 0px;
}

.card-title {
  font-size: 15px;
  color: #424242;
  margin-bottom: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
}

.card-desc {
  font-size: 11px;
  color: #909090;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  line-clamp: 2;
}

.link-delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  transition: background-color 0.3s;
  opacity: 0;
  transform: scale(0.8);
}

.card:hover .link-delete-btn {
  opacity: 1;
  transform: scale(1);
}

.link-delete-btn:hover {
  background: #ff5252;
}

@media (min-width: 1200px) {
  .card {
    width: calc(16.666% - 6.666px);
  }
}

@media (max-width: 1200px) {
  .card {
    width: calc(20% - 6.4px);
  }
}

@media (max-width: 992px) {
  .card {
    width: calc(25% - 6px);
  }
}

@media (max-width: 768px) {
  .card {
    width: calc(33.333% - 5.333px);
  }
}

@media (max-width: 576px) {
  .card {
    width: calc(50% - 4px);
  }
}

@media (max-width: 400px) {
  .card {
    width: 100%;
  }
}

.empty-state {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px;
  color: #666;
  min-height: 200px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
}

.empty-subtext {
  font-size: 14px;
  color: #999;
}

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
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 480px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.3s;
}

.modal-close-btn:hover {
  color: #333;
  background: #f5f5f5;
}

.modal-body {
  padding: 20px;
}

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
  gap: 16px;
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

.info-input-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid #eee;
  justify-content: flex-end;
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
  background: #fff;
  color: #666;
}

.cancel-btn:hover {
  background: #f5f5f5;
  border-color: #999;
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

.section-title {
  font-size: 24px;
  margin-bottom: 15px;
  color: #333;
}

.website-share-section {
  margin-top: 20px;
}

.website-share-section .website-share-square {
  background-color: transparent;
  padding: 0;
}

.website-share-section .website-share-square .main-container {
  width: 100%;
  max-width: none;
  margin: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.category-navigation {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.category-navigation .programming-tools-container {
  margin: 0;
  width: 100%;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 10px;
  }
  
  .nav-container {
    padding: 10px;
  }
  
  .category-navigation {
    gap: 15px;
    margin-top: 15px;
  }
  
  .website-share-section {
    margin-top: 15px;
  }
  
  .website-share-section .website-share-square .main-container {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .website-share-section .website-share-square .main-container {
    padding: 10px;
  }
}

/* 智能体浮动按钮样式 */
.ai-assistant-float-btn {
  position: fixed;
  right: 30px;
  bottom: 120px;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  overflow: visible;
}

.ai-assistant-float-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.ai-btn-icon {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
}

/* 气泡提示样式 */
.bubble-tooltip {
  position: absolute;
  right: 85px;
  top: 50%;
  transform: translateY(-50%);
  background: #333;
  color: #fff;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  z-index: 1000;
}

.bubble-tooltip::after {
  content: '';
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 6px solid #333;
}

.ai-assistant-float-btn:hover .bubble-tooltip {
  opacity: 1;
}

/* 智能体对话框气泡样式 */
.ai-chat-bubble {
  position: fixed;
  right: 110px;
  bottom: 85px;
  z-index: 1000;
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.ai-bubble-content {
  background: #fff;
  border-radius: 16px;
  width: 400px;
  max-height: 560px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.ai-bubble-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 16px 16px 0 0;
}

.ai-bubble-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #fff;
}

.ai-bubble-close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 20px;
  color: #fff;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 50%;
  transition: all 0.3s;
  line-height: 1;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-bubble-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.ai-bubble-body {
  padding: 0;
  overflow: hidden;
  flex: 1;
  background: #fff;
}

.ai-bubble-body iframe {
  width: 100%;
  height: 480px;
  border: none;
  display: block;
}

/* 气泡箭头指向按钮 */
.ai-bubble-arrow {
  position: absolute;
  right: -10px;
  bottom: 35px;
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-left: 10px solid #fff;
  filter: drop-shadow(2px 0 3px rgba(0, 0, 0, 0.15));
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-assistant-float-btn {
    width: 60px;
    height: 60px;
    right: 20px;
    bottom: 100px;
  }
  
  .bubble-tooltip {
    right: 75px;
    font-size: 12px;
    padding: 8px 12px;
  }
  
  .ai-chat-bubble {
    right: 85px;
    bottom: 70px;
  }
  
  .ai-bubble-content {
    width: 340px;
    max-height: 480px;
  }
  
  .ai-bubble-body iframe {
    height: 420px;
  }
  
  .ai-bubble-arrow {
    bottom: 28px;
    right: -8px;
    border-left-width: 8px;
    border-top-width: 8px;
    border-bottom-width: 8px;
  }
}

@media (max-width: 480px) {
  .ai-assistant-float-btn {
    width: 50px;
    height: 50px;
    right: 15px;
    bottom: 80px;
  }
  
  .bubble-tooltip {
    right: 65px;
    font-size: 11px;
    padding: 6px 10px;
  }
  
  .ai-chat-bubble {
    right: 70px;
    bottom: 60px;
  }
  
  .ai-bubble-content {
    width: 280px;
    max-height: 420px;
  }
  
  .ai-bubble-body iframe {
    height: 380px;
  }
  
  .ai-bubble-arrow {
    bottom: 22px;
    right: -8px;
    border-left-width: 8px;
    border-top-width: 8px;
    border-bottom-width: 8px;
  }
}
</style>