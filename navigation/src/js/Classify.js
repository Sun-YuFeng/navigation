import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getCategoryByName } from '../utils/categoryData'
import { supabase, updateSupabaseHeaders, validateUserId } from '../supabase.js'
import { useAuthStore } from '../stores/auth'

// 导出 composable 函数
export function useClassify() {
  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()

  // 壁纸相关
  const wallpaperUrl = ref(null)

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

// 加载壁纸
const loadWallpaper = () => {
  const saved = localStorage.getItem('selectedWallpaper')
  if (saved) {
    try {
      const wallpaper = JSON.parse(saved)
      wallpaperUrl.value = wallpaper.url
    } catch (e) {
      console.error('加载壁纸失败:', e)
    }
  }
}

// 监听壁纸变化事件
const handleWallpaperChange = (event) => {
  wallpaperUrl.value = event.detail.url
}

// 初始化
onMounted(async () => {
  await loadCategoryName()
  await loadWebsites()
  // 加载壁纸
  loadWallpaper()
  // 监听壁纸变化事件
  window.addEventListener('wallpaper-changed', handleWallpaperChange)
})

  // 组件卸载时移除事件监听
  onBeforeUnmount(() => {
    window.removeEventListener('wallpaper-changed', handleWallpaperChange)
  })

  // 返回所有需要在模板中使用的数据和方法
  return {
    // 响应式数据
    wallpaperUrl,
    currentCategoryName,
    recommendedSites,
    websites,
    showDeleteIndex,
    showModal,
    activeTab,
    newSite,
    loadingStates,
    // 方法
    openWebsite,
    showAddModal,
    hideModal,
    selectRecommendedSite,
    isSiteAdded,
    removeRecommendedSite,
    addRecommendedSite,
    parseWebsite,
    clearParse,
    handleIconUpload,
    resetIcon,
    getDefaultIconUrl,
    addWebsite,
    handleIconError,
    getWebsiteIcon,
    handleWebsiteIconError,
    showDeleteButton,
    hideDeleteButton,
    deleteCategory,
    deleteWebsite
  }
}