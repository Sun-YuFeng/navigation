import { createClient } from '@supabase/supabase-js'

// 使用正确的 navigation 项目配置
const supabaseUrl = 'https://zpiabcsywqezlspzbqrv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwaWFiY3N5d3FlemxzcHpicXJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTc0NTYsImV4cCI6MjA3NjQ3MzQ1Nn0.qm4aGAsImDHbqLVmSG5YypXFDtgK-QilnLgS6u3f6Io'

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
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