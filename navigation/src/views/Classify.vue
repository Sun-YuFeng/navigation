<template>
  <div class="classify-container">
    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 顶部标题区域 -->
      <div class="page-header">
        <h1 class="page-title">{{ currentCategoryName }}</h1>
        <button class="delete-category-btn" @click="deleteCategory" title="删除该分类及其所有网站内容">
          <i class="uil uil-trash-alt"></i>
        </button>
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
            @mouseenter="showDeleteButton(index)"
            @mouseleave="hideDeleteButton(index)"
          >
            <div class="website-icon-box" @click="openWebsite(site.url)">
              <img 
                :src="getWebsiteIcon(site.url)" 
                :alt="site.name"
                class="website-icon-img"
                @error="handleWebsiteIconError"
              />
              <!-- 删除按钮 -->
              <button 
                v-if="showDeleteIndex === index"
                class="delete-btn"
                @click.stop="deleteWebsite(site.id, index)"
              >
                <i class="uil uil-trash-alt"></i>
              </button>
            </div>
            <span class="website-name">{{ site.name }}</span>
          </div>

          <!-- 添加按钮：固定在最后一个格子位置 -->
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
                  <button 
                    class="add-site-btn" 
                    :class="{ 
                      'remove-btn': isSiteAdded(site), 
                      'loading-btn': loadingStates[site.url] 
                    }"
                    @click.stop="isSiteAdded(site) ? removeRecommendedSite(site) : addRecommendedSite(site)"
                    :disabled="loadingStates[site.url]"
                  >
                    <i 
                      v-if="!loadingStates[site.url]" 
                      :class="isSiteAdded(site) ? 'uil uil-minus' : 'uil uil-plus'"
                    ></i>
                    <i v-else class="uil uil-spinner uil-spin"></i>
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
import { useRoute, useRouter } from 'vue-router'

import { getCategoryByName } from '../utils/categoryData'
import { supabase, updateSupabaseHeaders, validateUserId } from '../supabase.js'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

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
    // 直接查询category_templates表获取分类名称
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
    } else {
      currentCategoryName.value = '我的分类'
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
const websites = ref([])

// 删除按钮显示状态
const showDeleteIndex = ref(-1)
// 定时器引用
const hoverTimers = ref({})

// 从数据库加载网站数据
const loadWebsites = async () => {
  try {
    const categoryTemplateId = route.params.categoryId
    
    console.log('路由参数 categoryId:', categoryTemplateId)
    
    if (!categoryTemplateId) {
      console.log('没有分类ID，不加载网站数据')
      websites.value = []
      return
    }
    
    // 获取当前用户ID
    const user = authStore.user
    
    if (!user) {
      console.log('用户未登录，不加载网站数据')
      websites.value = []
      return
    }
    
    console.log('当前登录用户ID:', user.id)
    
    // 验证用户ID是否有效
    const isValidUser = await validateUserId(user.id)
    if (!isValidUser) {
      console.error('用户ID无效，请重新登录')
      websites.value = []
      return
    }
    
    // 更新Supabase认证头信息
    updateSupabaseHeaders()
    
    // 首先通过category_templates的ID找到对应的user_category_mappings记录
    console.log('正在查询user_category_mappings表，template_id:', categoryTemplateId, 'user_id:', user.id)
    const { data: mappingData, error: mappingError } = await supabase
      .from('user_category_mappings')
      .select('id, user_id')
      .eq('template_id', categoryTemplateId)
      .eq('user_id', user.id)
      .single()
    
    if (mappingError || !mappingData) {
      console.log('未找到对应的用户分类映射，不加载网站数据，错误详情:', mappingError)
      websites.value = []
      return
    }
    
    console.log('找到用户分类映射:', mappingData)
    
    // 使用存储过程查询网站数据
    console.log('正在使用存储过程查询website_links表，category_mapping_id:', mappingData.id)
    const { data, error } = await supabase.rpc('get_website_links', {
      p_category_mapping_id: mappingData.id,
      p_user_id: user.id
    })
    
    if (error) {
      console.error('加载网站数据失败:', error)
      websites.value = []
    } else {
      console.log('从数据库加载网站数据成功:', data)
      // 转换数据格式以匹配前端需求
      websites.value = data.map(site => ({
        id: site.id,
        name: site.name,
        url: site.url,
        icon: site.icon || 'uil-globe'
      }))
    }
  } catch (error) {
    console.error('加载网站数据异常:', error)
    websites.value = []
  }
}

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

// 判断推荐网站是否已添加
const isSiteAdded = (site) => {
  return websites.value.some(website => website.url === site.url)
}

// 移除推荐网站
const removeRecommendedSite = async (site) => {
  try {
    // 找到对应的网站记录
    const websiteToRemove = websites.value.find(website => website.url === site.url)
    
    if (!websiteToRemove) {
      console.log('未找到要移除的网站')
      return
    }
    
    // 获取当前用户ID
    const user = authStore.user
    
    if (!user) {
      alert('请先登录后再操作')
      return
    }
    
    console.log('开始移除网站，siteId:', websiteToRemove.id, '用户ID:', user.id)
    
    // 验证用户ID是否有效
    const isValidUser = await validateUserId(user.id)
    if (!isValidUser) {
      alert('用户ID无效，请重新登录')
      return
    }
    
    // 更新Supabase认证头信息
    updateSupabaseHeaders()
    
    // 使用存储过程删除网站记录
    const { error } = await supabase.rpc('delete_website_link', {
      p_id: websiteToRemove.id,
      p_user_id: user.id
    })
    
    if (error) {
      console.error('移除网站失败:', error)
      console.error('错误详情:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      alert('移除网站失败，请重试')
    } else {
      console.log('网站移除成功，已从数据库中删除')
      // 从本地数组中移除该网站
      const index = websites.value.findIndex(website => website.url === site.url)
      if (index !== -1) {
        websites.value.splice(index, 1)
      }
      // 重新加载网站数据以确保数据一致性
      await loadWebsites()
    }
  } catch (error) {
    console.error('移除网站异常:', error)
    alert('移除网站失败，请重试')
  }
}

// 防抖状态管理
const debounceTimers = ref({})
const loadingStates = ref({})

// 防抖函数
const debounce = (func, delay, key) => {
  // 清除之前的定时器
  if (debounceTimers.value[key]) {
    clearTimeout(debounceTimers.value[key])
  }
  
  // 设置新的定时器
  return new Promise((resolve) => {
    debounceTimers.value[key] = setTimeout(async () => {
      try {
        const result = await func()
        resolve(result)
      } catch (error) {
        resolve(null)
      }
    }, delay)
  })
}

// 直接添加推荐网站（带防抖和异步优化）
const addRecommendedSite = async (site) => {
  const siteKey = site.url // 使用URL作为防抖标识
  
  // 如果正在加载中，直接返回
  if (loadingStates.value[siteKey]) {
    return
  }
  
  // 设置加载状态
  loadingStates.value[siteKey] = true
  
  try {
    // 防抖处理，500ms内只执行一次
    await debounce(async () => {
      const categoryId = route.params.categoryId
      
      if (!categoryId) {
        alert('无法添加网站：缺少分类ID')
        return
      }
      
      // 获取当前用户ID
      const user = authStore.user
      
      if (!user) {
        alert('请先登录后再添加网站')
        return
      }
      
      // 验证用户ID是否有效
      const isValidUser = await validateUserId(user.id)
      if (!isValidUser) {
        alert('用户ID无效，请重新登录')
        return
      }
      
      // 更新Supabase认证头信息
      updateSupabaseHeaders()
      
      // 首先通过category_templates的ID找到对应的user_category_mappings记录
      const { data: mappingData, error: mappingError } = await supabase
        .from('user_category_mappings')
        .select('id, user_id')
        .eq('template_id', categoryId)
        .eq('user_id', user.id)
        .single()
      
      if (mappingError || !mappingData) {
        alert('无法添加网站：未找到对应的分类映射')
        return
      }
      
      // 准备插入的数据
      const insertData = {
        name: site.title,
        url: site.url,
        icon: site.icon || 'uil-globe',
        category_mapping_id: mappingData.id,
        user_id: user.id,
        sort_order: websites.value.length + 1
      }
      
      console.log('准备插入推荐网站到website_links表的数据:', insertData)
      console.log('当前用户ID:', user.id)
      console.log('category_mapping_id:', mappingData.id)
      
      // 第一步：先在前端展示，提升用户体验
      const tempSite = {
        id: 'temp_' + Date.now(), // 临时ID
        name: site.title,
        url: site.url,
        icon: site.icon || 'uil-globe'
      }
      
      // 立即添加到本地数组
      websites.value.push(tempSite)
      
      // 第二步：异步保存到数据库
      const { data, error } = await supabase.rpc('insert_website_link', {
        p_name: insertData.name,
        p_url: insertData.url,
        p_icon: insertData.icon,
        p_category_mapping_id: insertData.category_mapping_id,
        p_user_id: insertData.user_id,
        p_sort_order: insertData.sort_order
      })
      
      if (error) {
        console.error('添加推荐网站到数据库失败:', error)
        console.error('错误详情:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        
        // 如果数据库保存失败，移除临时数据
        const index = websites.value.findIndex(s => s.id === tempSite.id)
        if (index !== -1) {
          websites.value.splice(index, 1)
        }
        
        alert('添加网站失败，请重试')
      } else {
        console.log('推荐网站添加成功:', data)
        
        // 替换临时数据为真实数据
        const tempIndex = websites.value.findIndex(s => s.id === tempSite.id)
        if (tempIndex !== -1) {
          websites.value[tempIndex] = {
            id: data.id,
            name: site.title,
            url: site.url,
            icon: site.icon || 'uil-globe'
          }
        }
        
        // 可选：重新加载数据确保一致性
        setTimeout(async () => {
          await loadWebsites()
        }, 100)
        
        // 延迟关闭模态框，让用户看到添加成功的效果
        setTimeout(() => {
          hideModal()
        }, 800)
      }
    }, 500, siteKey)
    
  } catch (error) {
    console.error('添加推荐网站异常:', error)
    alert('添加网站失败，请重试')
  } finally {
    // 清除加载状态
    setTimeout(() => {
      loadingStates.value[siteKey] = false
    }, 600)
  }
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
    
    // 使用 favicon.im 服务获取网站图标
    newSite.value.icon_url = `https://favicon.im/${hostname}?larger=true`
    
    alert('网站信息解析完成！图标已加载，请查看预览效果。')
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
      const hostname = url.hostname.replace('www.', '')
      newSite.value.icon_url = `https://favicon.im/${hostname}?larger=true`
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
const addWebsite = async () => {
  if (newSite.value.name && newSite.value.url) {
    try {
      const categoryId = route.params.categoryId
      
      if (!categoryId) {
        alert('无法添加网站：缺少分类ID')
        return
      }
      
      // 获取当前用户ID
      const user = authStore.user
      
      if (!user) {
        alert('请先登录后再添加网站')
        return
      }
      
      // 验证用户ID是否有效
      const isValidUser = await validateUserId(user.id)
      if (!isValidUser) {
        alert('用户ID无效，请重新登录')
        return
      }
      
      // 更新Supabase认证头信息
      updateSupabaseHeaders()
      
      // 首先通过category_templates的ID找到对应的user_category_mappings记录
      const { data: mappingData, error: mappingError } = await supabase
        .from('user_category_mappings')
        .select('id, user_id')
        .eq('template_id', categoryId)
        .eq('user_id', user.id)
        .single()
      
      if (mappingError || !mappingData) {
        alert('无法添加网站：未找到对应的分类映射')
        return
      }
      
      // 准备插入的数据
      const insertData = {
        name: newSite.value.name,
        url: newSite.value.url,
        icon: 'uil-globe',
        category_mapping_id: mappingData.id,
        user_id: user.id,
        sort_order: websites.value.length + 1
      }
      
      console.log('准备插入到website_links表的数据:', insertData)
      console.log('当前用户ID:', user.id)
      console.log('category_mapping_id:', mappingData.id)
      
      // 使用存储过程插入数据到数据库
      const { data, error } = await supabase.rpc('insert_website_link', {
        p_name: insertData.name,
        p_url: insertData.url,
        p_icon: insertData.icon,
        p_category_mapping_id: insertData.category_mapping_id,
        p_user_id: insertData.user_id,
        p_sort_order: insertData.sort_order
      })
      
      if (error) {
        console.error('添加网站到数据库失败:', error)
        console.error('错误详情:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        alert('添加网站失败，请重试')
      } else {
        console.log('网站添加成功:', data)
        // 重新加载网站数据
        await loadWebsites()
        hideModal()
      }
    } catch (error) {
      console.error('添加网站异常:', error)
      alert('添加网站失败，请重试')
    }
  } else {
    alert('请填写网站名称和URL')
  }
}

// 处理图标加载错误
const handleIconError = (event) => {
  event.target.src = '/src/assets/smile.jpeg'
}

// 获取网站图标URL
const getWebsiteIcon = (url) => {
  if (!url) return '/src/assets/smile.jpeg'
  
  try {
    const domain = new URL(url).hostname
    return `https://favicon.im/${domain}?larger=true`
  } catch (error) {
    return '/src/assets/smile.jpeg'
  }
}

// 处理网站图标加载错误
const handleWebsiteIconError = (event) => {
  event.target.src = '/src/assets/smile.jpeg'
}

// 显示删除按钮（3秒延迟）
const showDeleteButton = (index) => {
  // 清除之前的定时器
  if (hoverTimers.value[index]) {
    clearTimeout(hoverTimers.value[index])
  }
  
  // 设置3秒后显示删除按钮
  hoverTimers.value[index] = setTimeout(() => {
    showDeleteIndex.value = index
  }, 3000)
}

// 隐藏删除按钮
const hideDeleteButton = (index) => {
  // 清除定时器
  if (hoverTimers.value[index]) {
    clearTimeout(hoverTimers.value[index])
    delete hoverTimers.value[index]
  }
  
  // 立即隐藏删除按钮
  if (showDeleteIndex.value === index) {
    showDeleteIndex.value = -1
  }
}

// 删除分类及其所有网站内容
const deleteCategory = async () => {
  const categoryId = route.params.categoryId
  
  if (!categoryId) {
    alert('无法删除分类：缺少分类ID')
    return
  }
  
  if (!confirm(`确定要删除分类"${currentCategoryName.value}"及其所有网站内容吗？此操作不可撤销！`)) {
    return
  }
  
  try {
    // 获取当前用户ID
    const user = authStore.user
    
    if (!user) {
      alert('请先登录后再操作')
      return
    }
    
    console.log('开始删除分类，categoryId:', categoryId, '用户ID:', user.id)
    
    // 验证用户ID是否有效
    const isValidUser = await validateUserId(user.id)
    if (!isValidUser) {
      alert('用户ID无效，请重新登录')
      return
    }
    
    // 更新Supabase认证头信息
    updateSupabaseHeaders()
    
    // 首先通过category_templates的ID找到对应的user_category_mappings记录
    const { data: mappingData, error: mappingError } = await supabase
      .from('user_category_mappings')
      .select('id, user_id')
      .eq('template_id', categoryId)
      .eq('user_id', user.id)
      .single()
    
    if (mappingError || !mappingData) {
      alert('无法删除分类：未找到对应的分类映射')
      return
    }
    
    console.log('找到用户分类映射:', mappingData)
    
    // 先删除该分类下的所有网站内容
    console.log('开始删除分类下的所有网站内容，category_mapping_id:', mappingData.id)
    
    // 使用存储过程删除该分类下的所有网站记录
    const { error: deleteWebsitesError } = await supabase.rpc('delete_website_links_by_category', {
      p_category_mapping_id: mappingData.id,
      p_user_id: user.id
    })
    
    if (deleteWebsitesError) {
      console.error('删除网站内容失败:', deleteWebsitesError)
      console.error('错误详情:', {
        code: deleteWebsitesError.code,
        message: deleteWebsitesError.message,
        details: deleteWebsitesError.details,
        hint: deleteWebsitesError.hint
      })
      // 继续尝试删除分类映射，不中断流程
    } else {
      console.log('分类下的所有网站内容删除成功')
    }
    
    // 删除用户分类映射记录
    console.log('开始删除用户分类映射记录，mapping_id:', mappingData.id)
    
    // 使用存储过程删除用户分类映射
    const { error: deleteMappingError } = await supabase.rpc('delete_user_category_mapping', {
      p_id: mappingData.id,
      p_user_id: user.id
    })
    
    if (deleteMappingError) {
      console.error('删除用户分类映射失败:', deleteMappingError)
      console.error('错误详情:', {
        code: deleteMappingError.code,
        message: deleteMappingError.message,
        details: deleteMappingError.details,
        hint: deleteMappingError.hint
      })
      throw deleteMappingError
    }
    
    console.log('分类删除成功')
    alert('分类删除成功！')
    
    // 跳转到首页
    router.push('/')
    
  } catch (error) {
    console.error('删除分类异常:', error)
    alert('删除分类失败，请重试')
  }
}

// 删除网站 - 直接删除数据库记录
const deleteWebsite = async (siteId, index) => {
  if (!confirm('确定要删除这个网站吗？')) {
    return
  }
  
  try {
    // 获取当前用户ID
    const user = authStore.user
    
    if (!user) {
      alert('请先登录后再操作')
      return
    }
    
    console.log('开始删除网站，siteId:', siteId, '用户ID:', user.id)
    
    // 验证用户ID是否有效
    const isValidUser = await validateUserId(user.id)
    if (!isValidUser) {
      alert('用户ID无效，请重新登录')
      return
    }
    
    // 更新Supabase认证头信息
    updateSupabaseHeaders()
    
    // 直接删除数据库中的网站记录 - 使用存储过程绕过RLS
    console.log('执行删除操作，条件: id=', siteId, 'user_id=', user.id)
    
    // 使用存储过程删除网站记录
    const { error } = await supabase.rpc('delete_website_link', {
      p_id: siteId,
      p_user_id: user.id
    })
    
    if (error) {
      console.error('存储过程删除失败:', error)
      console.error('错误详情:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      throw error
    }
    
    if (error) {
      console.error('删除网站失败:', error)
      console.error('错误详情:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      alert('删除网站失败，请重试')
    } else {
      console.log('网站删除成功，已从数据库中删除')
      // 从本地数组中移除该网站
      websites.value.splice(index, 1)
      // 重新加载网站数据以确保数据一致性
      await loadWebsites()
    }
  } catch (error) {
    console.error('删除网站异常:', error)
    alert('删除网站失败，请重试')
  }
}

// 监听路由参数变化
import { watch } from 'vue'

watch(() => route.params.categoryId, async (newCategoryId) => {
  console.log('路由参数变化，新的categoryId:', newCategoryId)
  await loadCategoryName()
  await loadWebsites()
})

// 初始化
onMounted(async () => {
  console.log('分类页面加载完成')
  await loadCategoryName()
  await loadWebsites()
  console.log('路由参数 categoryId:', route.params.categoryId)
  console.log('推荐网站数据:', recommendedSites.value)
})
</script>

<style scoped>
.classify-container {
  height: 100vh; /* 固定高度为视口高度 */
  background: #f8f9fa;
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  display: flex;
  overflow: hidden; /* 隐藏溢出内容 */
}

/* 主内容区域 */
.main-content {
  flex: 1;
  padding: 20px;
  margin-left: 60px; /* 导航栏宽度 */
  overflow: hidden; /* 隐藏溢出内容 */
}

/* 顶部标题区域 */
.page-header {
  margin-bottom: 24px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  color: #667eea;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
}

/* 删除分类按钮 */
.delete-category-btn {
  background: #ff6b6b;
  border: none;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 18px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
}

.delete-category-btn:hover {
  background: #ff5252;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

/* 主要内容卡片 */
.content-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  height: calc(100vh - 100px); /* 自适应高度，减去顶部间距 */
  max-width: 1200px;
  margin: -10px auto 0;
}

/* 网格布局 - 固定结构 */
.grid-container {
  display: grid;
  /* 固定列数（6列），每列等宽 */
  grid-template-columns: repeat(6, 1fr); 
  /* 列与列、行与行之间的间距 */
  row-gap: 30px; /* 上下间距减少5px */
  column-gap: 40px; /* 左右间距保持不变 */
  /* 水平方向居中，剩余空间分布在两侧 */
  justify-content: center; 
  /* 垂直方向顶部对齐，数据少的时候保持顶部布局 */
  align-content: flex-start; 
  margin: 20px 30px; /* 减少左右边距 */
  /* 确保网格项不会因为内容挤压而变形 */
  height: calc(100% - 40px); /* 自适应高度 */
  overflow: hidden; /* 去掉滚动条 */
}

/* 网站项：固定尺寸，确保布局稳定 */
.website-item {
  position: relative;
  cursor: pointer;
  /* 整体格子尺寸 */
  width: 120px;
  height: 150px; /* 增加高度为文字区域留空间 */
}

/* 图标盒子：正方形区域 */
.website-icon-box {
  width: 120px;
  height: 120px; /* 正方形区域 */
  border: 1px solid #e0e0e0; /* 添加边框显示网格结构 */
  border-radius: 16px; /* 增加圆角，让圆角更圆 */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px; /* 图标和文字之间的间距 */
  overflow: hidden; /* 防止图标溢出 */
  background: #f8f9fa; /* 添加背景色 */
}

/* 网站图标图片样式 */
.website-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 让图标铺满整个格子 */
  border-radius: 14px; /* 增加圆角，与容器保持一致 */
}

/* 删除按钮样式 */
.delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #ff6b6b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 10;
}

.delete-btn:hover {
  background: #ff6b6b;
  color: white;
  transform: scale(1.1);
}

/* 网站图标盒子添加相对定位 */
.website-icon-box {
  position: relative;
}

/* 文字：简化样式 - 居中显示 */
.website-name {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  white-space: nowrap; /* 防止文字换行 */
  text-align: center;
  width: 100%; /* 确保宽度为100% */
  display: block; /* 块级元素确保居中 */
}

/* 添加按钮项 - 固定在最后一个位置，固定尺寸 */
.add-item {
  position: relative;
  cursor: pointer;
  order: 9999; /* 确保始终在最后 */
  /* 整体格子尺寸 */
  width: 120px;
  height: 150px; /* 增加高度为文字区域留空间 */
}

/* 添加按钮的图标盒子 - 保持正方形 */
.add-icon-box {
  background: #e9ecef;
  border: 2px dashed #adb5bd;
  border-radius: 16px; /* 增加圆角，让圆角更圆 */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  width: 120px; /* 正方形区域 */
  height: 120px; /* 正方形区域 */
  margin-bottom: 8px; /* 图标和文字之间的间距 */
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

/* 添加按钮的文字 - 居中显示 */
.add-name {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
  white-space: nowrap;
  text-align: center;
  width: 100%; /* 确保宽度为100% */
  display: block; /* 块级元素确保居中 */
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

/* 移除按钮样式 */
.remove-btn {
  background: #ff6b6b !important;
}

.remove-btn:hover {
  background: #ff5252 !important;
}

/* 加载状态按钮样式 */
.loading-btn {
  background: #adb5bd !important;
  cursor: not-allowed !important;
  transform: none !important;
}

.loading-btn:hover {
  background: #adb5bd !important;
  transform: none !important;
}

/* 旋转动画 */
.uil-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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