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
                loading="lazy"
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
                    <img :src="site.icon" :alt="site.title" loading="lazy" @error="handleIconError">
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getCategoryByName } from '../utils/categoryData'
import { supabase, updateSupabaseHeaders, validateUserId } from '../supabase.js'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// ========== 性能优化：数据缓存 ==========
// 缓存分类名称，避免重复查询
const categoryNameCache = new Map()
// 缓存用户分类映射ID，避免重复查询
const categoryMappingCache = new Map()
// 缓存用户验证结果（5分钟有效期）
const userValidationCache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5分钟

// 当前分类名称
const currentCategoryName = ref('我的分类')

// 根据UUID从数据库获取分类名称（带缓存）
const loadCategoryName = async () => {
  const categoryId = route.params.categoryId
  
  if (!categoryId) {
    currentCategoryName.value = '我的分类'
    return
  }
  
  // 检查缓存
  if (categoryNameCache.has(categoryId)) {
    currentCategoryName.value = categoryNameCache.get(categoryId)
    return
  }
  
  try {
    const { data, error } = await supabase
      .from('category_templates')
      .select('name')
      .eq('id', categoryId)
      .single()
    
    if (error) {
      console.error('查询分类名称失败:', error)
      currentCategoryName.value = '我的分类'
    } else if (data) {
      currentCategoryName.value = data.name
      // 缓存结果
      categoryNameCache.set(categoryId, data.name)
    } else {
      currentCategoryName.value = '我的分类'
    }
  } catch (error) {
    console.error('加载分类名称异常:', error)
    currentCategoryName.value = '我的分类'
  }
}

// 推荐网站数据（根据当前分类名称获取）- 使用缓存优化
const recommendedSitesCache = new Map()
const recommendedSites = computed(() => {
  const categoryName = currentCategoryName.value
  
  if (!categoryName || categoryName === '我的分类') {
    return []
  }
  
  // 检查缓存
  if (recommendedSitesCache.has(categoryName)) {
    return recommendedSitesCache.get(categoryName)
  }
  
  const category = getCategoryByName(categoryName)
  const result = (category && category.tools && category.tools.length > 0) 
    ? category.tools 
    : []
  
  // 缓存结果
  recommendedSitesCache.set(categoryName, result)
  return result
})

// 网站数据
const websites = ref([])

// 删除按钮显示状态 - 使用 requestAnimationFrame 优化
const showDeleteIndex = ref(-1)
const hoverTimers = ref({})

// ========== 性能优化：提取公共查询逻辑 ==========
// 获取用户分类映射ID（带缓存）
const getCategoryMappingId = async (categoryTemplateId, userId) => {
  const cacheKey = `${categoryTemplateId}_${userId}`
  
  // 检查缓存
  if (categoryMappingCache.has(cacheKey)) {
    return categoryMappingCache.get(cacheKey)
  }
  
  // 更新Supabase认证头信息
  updateSupabaseHeaders()
  
  const { data: mappingData, error: mappingError } = await supabase
    .from('user_category_mappings')
    .select('id, user_id')
    .eq('template_id', categoryTemplateId)
    .eq('user_id', userId)
    .single()
  
  if (mappingError || !mappingData) {
    return null
  }
  
  // 缓存结果
  categoryMappingCache.set(cacheKey, mappingData.id)
  return mappingData.id
}

// 验证用户ID（带缓存）
const validateUserWithCache = async (userId) => {
  // 检查缓存
  const cached = userValidationCache.get(userId)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.valid
  }
  
  const valid = await validateUserId(userId)
  // 缓存结果
  userValidationCache.set(userId, { valid, timestamp: Date.now() })
  return valid
}

// 从数据库加载网站数据（优化版本）
const loadWebsites = async () => {
  try {
    const categoryTemplateId = route.params.categoryId
    
    if (!categoryTemplateId) {
      websites.value = []
      return
    }
    
    const user = authStore.user
    if (!user) {
      websites.value = []
      return
    }
    
    // 使用缓存的验证
    const isValidUser = await validateUserWithCache(user.id)
    if (!isValidUser) {
      websites.value = []
      return
    }
    
    // 使用缓存的映射ID
    const mappingId = await getCategoryMappingId(categoryTemplateId, user.id)
    if (!mappingId) {
      websites.value = []
      return
    }
    
    updateSupabaseHeaders()
    
    const { data, error } = await supabase.rpc('get_website_links', {
      p_category_mapping_id: mappingId,
      p_user_id: user.id
    })
    
    if (error) {
      console.error('加载网站数据失败:', error)
      websites.value = []
    } else {
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

// 移除推荐网站（优化版本）
const removeRecommendedSite = async (site) => {
  try {
    const websiteToRemove = websites.value.find(website => website.url === site.url)
    
    if (!websiteToRemove) {
      return
    }
    
    const user = authStore.user
    if (!user) {
      alert('请先登录后再操作')
      return
    }
    
    // 使用缓存的验证
    const isValidUser = await validateUserWithCache(user.id)
    if (!isValidUser) {
      alert('用户ID无效，请重新登录')
      return
    }
    
    updateSupabaseHeaders()
    
    // 乐观更新：先从前端移除
    const index = websites.value.findIndex(website => website.url === site.url)
    const removedSite = index !== -1 ? websites.value.splice(index, 1)[0] : null
    
    const { error } = await supabase.rpc('delete_website_link', {
      p_id: websiteToRemove.id,
      p_user_id: user.id
    })
    
    if (error) {
      console.error('移除网站失败:', error)
      // 如果删除失败，恢复数据
      if (removedSite && index !== -1) {
        websites.value.splice(index, 0, removedSite)
      }
      alert('移除网站失败，请重试')
    }
    // 成功则不需要额外操作，数据已经更新
  } catch (error) {
    console.error('移除网站异常:', error)
    alert('移除网站失败，请重试')
  }
}

// ========== 性能优化：改进防抖和加载状态管理 ==========
const debounceTimers = ref({})
const loadingStates = ref({})

// 优化的防抖函数（使用 Promise 缓存）
const debounceCache = new Map()
const debounce = (func, delay, key) => {
  // 如果已有相同的请求在处理中，返回该 Promise
  if (debounceCache.has(key)) {
    return debounceCache.get(key)
  }
  
  // 清除之前的定时器
  if (debounceTimers.value[key]) {
    clearTimeout(debounceTimers.value[key])
  }
  
  // 创建新的 Promise
  const promise = new Promise((resolve) => {
    debounceTimers.value[key] = setTimeout(async () => {
      try {
        const result = await func()
        resolve(result)
      } catch (error) {
        resolve(null)
      } finally {
        // 清除缓存
        debounceCache.delete(key)
      }
    }, delay)
  })
  
  // 缓存 Promise
  debounceCache.set(key, promise)
  return promise
}

// 直接添加推荐网站（优化版本 - 使用缓存和优化逻辑）
const addRecommendedSite = async (site) => {
  const siteKey = site.url
  
  if (loadingStates.value[siteKey]) {
    return
  }
  
  loadingStates.value[siteKey] = true
  
  try {
    await debounce(async () => {
      const categoryId = route.params.categoryId
      
      if (!categoryId) {
        alert('无法添加网站：缺少分类ID')
        return
      }
      
      const user = authStore.user
      if (!user) {
        alert('请先登录后再添加网站')
        return
      }
      
      // 使用缓存的验证
      const isValidUser = await validateUserWithCache(user.id)
      if (!isValidUser) {
        alert('用户ID无效，请重新登录')
        return
      }
      
      // 使用缓存的映射ID
      const mappingId = await getCategoryMappingId(categoryId, user.id)
      if (!mappingId) {
        alert('无法添加网站：未找到对应的分类映射')
        return
      }
      
      // 准备插入的数据
      const insertData = {
        name: site.title,
        url: site.url,
        icon: site.icon || 'uil-globe',
        category_mapping_id: mappingId,
        user_id: user.id,
        sort_order: websites.value.length + 1
      }
      
      // 立即添加到本地数组（乐观更新）
      const tempSite = {
        id: 'temp_' + Date.now(),
        name: site.title,
        url: site.url,
        icon: site.icon || 'uil-globe'
      }
      websites.value.push(tempSite)
      
      updateSupabaseHeaders()
      
      // 异步保存到数据库
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
        // 移除临时数据
        const index = websites.value.findIndex(s => s.id === tempSite.id)
        if (index !== -1) {
          websites.value.splice(index, 1)
        }
        alert('添加网站失败，请重试')
      } else {
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
        
        // 清除相关缓存，确保数据一致性
        categoryMappingCache.delete(`${categoryId}_${user.id}`)
        
        // 延迟关闭模态框
        setTimeout(() => {
          hideModal()
        }, 800)
      }
    }, 500, siteKey)
    
  } catch (error) {
    console.error('添加推荐网站异常:', error)
    alert('添加网站失败，请重试')
  } finally {
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

// 添加网站（优化版本）
const addWebsite = async () => {
  if (!newSite.value.name || !newSite.value.url) {
    alert('请填写网站名称和URL')
    return
  }
  
  try {
    const categoryId = route.params.categoryId
    
    if (!categoryId) {
      alert('无法添加网站：缺少分类ID')
      return
    }
    
    const user = authStore.user
    if (!user) {
      alert('请先登录后再添加网站')
      return
    }
    
    // 使用缓存的验证
    const isValidUser = await validateUserWithCache(user.id)
    if (!isValidUser) {
      alert('用户ID无效，请重新登录')
      return
    }
    
    // 使用缓存的映射ID
    const mappingId = await getCategoryMappingId(categoryId, user.id)
    if (!mappingId) {
      alert('无法添加网站：未找到对应的分类映射')
      return
    }
    
    updateSupabaseHeaders()
    
    const { data, error } = await supabase.rpc('insert_website_link', {
      p_name: newSite.value.name,
      p_url: newSite.value.url,
      p_icon: 'uil-globe',
      p_category_mapping_id: mappingId,
      p_user_id: user.id,
      p_sort_order: websites.value.length + 1
    })
    
    if (error) {
      console.error('添加网站到数据库失败:', error)
      alert('添加网站失败，请重试')
    } else {
      // 清除相关缓存
      categoryMappingCache.delete(`${categoryId}_${user.id}`)
      // 重新加载网站数据
      await loadWebsites()
      hideModal()
    }
  } catch (error) {
    console.error('添加网站异常:', error)
    alert('添加网站失败，请重试')
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

// 显示删除按钮（优化版本 - 使用 requestAnimationFrame）
const showDeleteButton = (index) => {
  if (hoverTimers.value[index]) {
    clearTimeout(hoverTimers.value[index])
  }
  
  hoverTimers.value[index] = setTimeout(() => {
    requestAnimationFrame(() => {
      showDeleteIndex.value = index
    })
  }, 3000)
}

// 隐藏删除按钮（优化版本）
const hideDeleteButton = (index) => {
  if (hoverTimers.value[index]) {
    clearTimeout(hoverTimers.value[index])
    delete hoverTimers.value[index]
  }
  
  if (showDeleteIndex.value === index) {
    requestAnimationFrame(() => {
      showDeleteIndex.value = -1
    })
  }
}

// 删除分类及其所有网站内容（优化版本）
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
    const user = authStore.user
    if (!user) {
      alert('请先登录后再操作')
      return
    }
    
    // 使用缓存的验证
    const isValidUser = await validateUserWithCache(user.id)
    if (!isValidUser) {
      alert('用户ID无效，请重新登录')
      return
    }
    
    // 使用缓存的映射ID
    const mappingId = await getCategoryMappingId(categoryId, user.id)
    if (!mappingId) {
      alert('无法删除分类：未找到对应的分类映射')
      return
    }
    
    updateSupabaseHeaders()
    
    // 先删除该分类下的所有网站内容
    const { error: deleteWebsitesError } = await supabase.rpc('delete_website_links_by_category', {
      p_category_mapping_id: mappingId,
      p_user_id: user.id
    })
    
    if (deleteWebsitesError) {
      console.error('删除网站内容失败:', deleteWebsitesError)
      // 继续尝试删除分类映射，不中断流程
    }
    
    // 删除用户分类映射记录
    const { error: deleteMappingError } = await supabase.rpc('delete_user_category_mapping', {
      p_id: mappingId,
      p_user_id: user.id
    })
    
    if (deleteMappingError) {
      console.error('删除用户分类映射失败:', deleteMappingError)
      throw deleteMappingError
    }
    
    // 清除相关缓存
    categoryNameCache.delete(categoryId)
    categoryMappingCache.delete(`${categoryId}_${user.id}`)
    
    alert('分类删除成功！')
    router.push('/')
    
  } catch (error) {
    console.error('删除分类异常:', error)
    alert('删除分类失败，请重试')
  }
}

// 删除网站（优化版本 - 乐观更新）
const deleteWebsite = async (siteId, index) => {
  if (!confirm('确定要删除这个网站吗？')) {
    return
  }
  
  try {
    const user = authStore.user
    if (!user) {
      alert('请先登录后再操作')
      return
    }
    
    // 使用缓存的验证
    const isValidUser = await validateUserWithCache(user.id)
    if (!isValidUser) {
      alert('用户ID无效，请重新登录')
      return
    }
    
    // 乐观更新：先从前端移除
    const removedSite = websites.value.splice(index, 1)[0]
    
    updateSupabaseHeaders()
    
    const { error } = await supabase.rpc('delete_website_link', {
      p_id: siteId,
      p_user_id: user.id
    })
    
    if (error) {
      console.error('删除网站失败:', error)
      // 如果删除失败，恢复数据
      websites.value.splice(index, 0, removedSite)
      alert('删除网站失败，请重试')
    }
    // 成功则不需要额外操作
  } catch (error) {
    console.error('删除网站异常:', error)
    alert('删除网站失败，请重试')
  }
}

// 监听路由参数变化（优化版本 - 清除缓存）
watch(() => route.params.categoryId, async (newCategoryId, oldCategoryId) => {
  // 清除旧分类的缓存
  if (oldCategoryId) {
    categoryNameCache.delete(oldCategoryId)
    // 清除相关映射缓存
    const user = authStore.user
    if (user) {
      categoryMappingCache.delete(`${oldCategoryId}_${user.id}`)
    }
  }
  await loadCategoryName()
  await loadWebsites()
})

// 初始化
onMounted(async () => {
  await loadCategoryName()
  await loadWebsites()
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
  margin-left: 50px; /* 导航栏宽度，减少10px */
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
  line-clamp: 1; /* 标准属性，用于兼容性 */
  line-clamp: 1; /* 标准属性，用于兼容性 */
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
  line-clamp: 1; /* 标准属性，用于兼容性 */
  line-clamp: 1; /* 标准属性，用于兼容性 */
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