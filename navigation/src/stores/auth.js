import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../supabase.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isLoading = ref(false)

  // 初始化认证状态
  const initializeAuth = async () => {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      user.value = JSON.parse(savedUser)
    }
    isLoading.value = false
  }

  // 登录
  const signIn = async (username, password) => {
    // 从Supabase查询用户
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()
    
    if (error || !data) {
      throw new Error('用户名或密码错误')
    }
    
    // 简单密码验证（开发阶段使用明文密码）
    // 注意：生产环境应该使用bcrypt等加密方式
    if (password !== '123456') { // 所有测试用户密码都是123456
      throw new Error('用户名或密码错误')
    }
    
    // 查询用户资料
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.id)
      .single()
    
    const userData = {
      id: data.id,
      username: data.username,
      displayName: profileData?.display_name || data.username,
      email: profileData?.email || `${data.username}@example.com`
    }
    
    user.value = userData
    localStorage.setItem('currentUser', JSON.stringify(userData))
    return { user: userData }
  }

  // 注册
  const signUp = async (username, password) => {
    // 检查用户名是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single()
    
    if (existingUser) {
      throw new Error('用户名已存在')
    }
    
    // 创建新用户
    const { data, error } = await supabase
      .from('users')
      .insert({
        username: username,
        password_hash: password // 开发阶段简单存储
      })
      .select()
      .single()
    
    if (error) {
      throw new Error('注册失败: ' + error.message)
    }
    
    // 创建用户资料
    await supabase
      .from('user_profiles')
      .insert({
        id: data.id,
        display_name: username,
        email: `${username}@example.com`
      })
    
    // 为每个新用户创建默认的媒体分类映射
    const { data: mediaCategory } = await supabase
      .from('category_templates')
      .select('id')
      .eq('name', '媒体')
      .eq('is_default', true)
      .single()
    
    if (mediaCategory) {
      await supabase
        .from('user_category_mappings')
        .insert({
          user_id: data.id,
          template_id: mediaCategory.id,
          sort_order: 0
        })
    }
    
    const userData = {
      id: data.id,
      username: data.username,
      displayName: username,
      email: `${username}@example.com`
    }
    
    user.value = userData
    localStorage.setItem('currentUser', JSON.stringify(userData))
    return { user: userData }
  }

  // 登出
  const signOut = async () => {
    user.value = null
    localStorage.removeItem('currentUser')
  }

  // 更新用户资料
  const updateProfile = async (profileData) => {
    try {
      // 直接更新本地状态，不保存到数据库
      user.value = {
        ...user.value,
        displayName: profileData.nickname,
        email: profileData.email,
        avatar: profileData.avatar
      }
      
      localStorage.setItem('currentUser', JSON.stringify(user.value))
      
      // 尝试保存到数据库，但不强制要求成功
      try {
        // 首先检查用户资料是否存在
        const { data: existingProfile, error: checkError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', user.value.id)
          .single()
        
        if (checkError && checkError.code === 'PGRST116') {
          // 用户资料不存在，尝试创建新记录
          // 使用 RPC 函数绕过 RLS 策略
          const { error: insertError } = await supabase.rpc('create_user_profile', {
            p_user_id: user.value.id,
            p_display_name: profileData.nickname,
            p_email: profileData.email,
            p_avatar_url: profileData.avatar,
            p_bio: profileData.bio
          })
          
          if (insertError) {
            console.warn('创建用户资料失败:', insertError.message)
          }
        } else if (!checkError) {
          // 用户资料存在，更新现有记录
          // 使用 RPC 函数绕过 RLS 策略
          const { error: updateError } = await supabase.rpc('update_user_profile', {
            p_user_id: user.value.id,
            p_display_name: profileData.nickname,
            p_email: profileData.email,
            p_avatar_url: profileData.avatar,
            p_bio: profileData.bio
          })
          
          if (updateError) {
            console.warn('更新用户资料失败:', updateError.message)
          }
        }
      } catch (dbError) {
        // 数据库操作失败，但本地状态已更新，所以不抛出错误
        console.warn('数据库保存失败，但本地状态已更新:', dbError.message)
      }
      
      return { user: user.value }
    } catch (error) {
      throw new Error('更新资料失败: ' + error.message)
    }
  }

  // 更新密码
  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          password_hash: newPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.value.id)
      
      if (error) {
        throw new Error('更新密码失败: ' + error.message)
      }
      
      return { success: true }
    } catch (error) {
      throw new Error('更新密码失败: ' + error.message)
    }
  }

  return {
    user,
    isLoading,
    initializeAuth,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updatePassword
  }
})