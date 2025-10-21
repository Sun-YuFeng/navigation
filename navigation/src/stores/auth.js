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
      // 使用upsert操作到user_profiles表
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.value.id,
          display_name: profileData.nickname,
          email: profileData.email,
          avatar_url: profileData.avatar,
          bio: profileData.bio,
          updated_at: new Date().toISOString()
        })
      
      if (error) {
        throw new Error('更新资料失败: ' + error.message)
      }
      
      // 更新本地状态
      user.value = {
        ...user.value,
        displayName: profileData.nickname,
        email: profileData.email,
        avatar: profileData.avatar
      }
      
      localStorage.setItem('currentUser', JSON.stringify(user.value))
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