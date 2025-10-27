<template>
  <div class="auth-modal-overlay" @click="$emit('close')">
    <div class="auth-modal-content" @click.stop>
      <div class="auth-modal-header">
        <h3>{{ isLogin ? '登录' : '注册' }}</h3>
        <button @click="$emit('close')" class="auth-modal-close-btn">×</button>
      </div>
      
      <div class="auth-modal-body">
        <form @submit.prevent="handleAuth">
          <div class="input-group">
            <label>邮箱</label>
            <input 
              v-model="authData.email" 
              type="email" 
              placeholder="请输入邮箱" 
              class="auth-input"
              required
            >
          </div>
          
          <div class="input-group">
            <label>密码</label>
            <input 
              v-model="authData.password" 
              type="password" 
              placeholder="请输入密码" 
              class="auth-input"
              required
            >
          </div>
          
          <button type="submit" class="auth-submit-btn" :disabled="loading">
            {{ loading ? '处理中...' : (isLogin ? '登录' : '注册') }}
          </button>
        </form>
        
        <div class="auth-switch">
          <span>{{ isLogin ? '没有账号？' : '已有账号？' }}</span>
          <button @click="isLogin = !isLogin" class="auth-switch-btn">
            {{ isLogin ? '立即注册' : '立即登录' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'

const emit = defineEmits(['close', 'success'])

const isLogin = ref(true)
const loading = ref(false)
const authData = ref({
  email: '',
  password: ''
})

const handleAuth = async () => {
  loading.value = true
  
  try {
    if (isLogin.value) {
      // 登录
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authData.value.email,
        password: authData.value.password
      })
      
      if (error) throw error
      
      console.log('登录成功:', data.user)
      emit('success', data.user)
    } else {
      // 注册
      const { data, error } = await supabase.auth.signUp({
        email: authData.value.email,
        password: authData.value.password
      })
      
      if (error) throw error
      
      console.log('注册成功:', data.user)
      alert('注册成功！请检查邮箱验证邮件')
      emit('success', data.user)
    }
  } catch (error) {
    console.error('认证失败:', error)
    alert(error.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-modal-overlay {
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

.auth-modal-content {
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.auth-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.auth-modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.auth-modal-close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.3s;
}

.auth-modal-close-btn:hover {
  color: #333;
  background: #f5f5f5;
}

.auth-modal-body {
  padding: 20px;
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
}

.auth-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.auth-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.auth-submit-btn {
  width: 100%;
  padding: 12px;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.auth-submit-btn:hover:not(:disabled) {
  background: #0056b3;
}

.auth-submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.auth-switch {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: #666;
}

.auth-switch-btn {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  text-decoration: underline;
  font-size: 14px;
}

.auth-switch-btn:hover {
  color: #0056b3;
}
</style>