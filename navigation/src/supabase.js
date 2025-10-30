import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})

// 获取当前用户ID的函数
export function getCurrentUserId() {
  try {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      return user.id || ''
    }
  } catch (error) {
    console.error('获取用户ID失败:', error)
  }
  return ''
}

// 动态更新头信息的函数
export function updateSupabaseHeaders() {
  const userId = getCurrentUserId()
  
  // 更新REST客户端的头信息
  if (supabase.rest) {
    supabase.rest.headers['x-user-id'] = userId
  }
}

// 验证用户ID是否有效的函数
export async function validateUserId(userId) {
  if (!userId) return false
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()
    
    return !error && data !== null
  } catch (error) {
    console.error('验证用户ID失败:', error)
    return false
  }
}