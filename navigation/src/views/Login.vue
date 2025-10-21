<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const isLogin = ref(true)
const loading = ref(false)
const errorMessage = ref('')

// 表单数据
const formData = ref({
  username: '',
  password: '',
  confirmPassword: ''
})

// 登录函数
const handleLogin = async () => {
  if (!formData.value.username || !formData.value.password) {
    errorMessage.value = '请填写用户名和密码'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    await authStore.signIn(formData.value.username, formData.value.password)
    // 添加延迟确保认证状态已更新
    setTimeout(() => {
      router.push('/')
    }, 100)
  } catch (error) {
    errorMessage.value = error.message || '登录失败'
  } finally {
    loading.value = false
  }
}

// 注册函数
const handleSignUp = async () => {
  if (!formData.value.username || !formData.value.password) {
    errorMessage.value = '请填写用户名和密码'
    return
  }

  if (formData.value.password !== formData.value.confirmPassword) {
    errorMessage.value = '两次输入的密码不一致'
    return
  }

  if (formData.value.password.length < 6) {
    errorMessage.value = '密码长度至少6位'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    await authStore.signUp(formData.value.username, formData.value.password)
    errorMessage.value = '注册成功！'
    // 3秒后切换到登录界面
    setTimeout(() => {
      isLogin.value = true
      formData.value.confirmPassword = ''
    }, 3000)
  } catch (error) {
    errorMessage.value = error.message || '注册失败'
  } finally {
    loading.value = false
  }
}

// 切换登录/注册模式
const toggleMode = () => {
  isLogin.value = !isLogin.value
  errorMessage.value = ''
  formData.value.confirmPassword = ''
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <!-- 左侧图片区域 -->
      <div class="image-section">
        <div class="image-content">
          <h2>欢迎使用导航系统</h2>
          <p>高效管理您的网站导航</p>
        </div>
      </div>

      <!-- 右侧表单区域 -->
      <div class="form-section">
        <div class="form-content">
          <h1>{{ isLogin ? '登录' : '注册' }}</h1>
          
          <form @submit.prevent="isLogin ? handleLogin() : handleSignUp()">
            <div class="form-group">
              <label for="username">用户名</label>
              <input
                id="username"
                v-model="formData.username"
                type="text"
                placeholder="请输入用户名"
                required
              >
            </div>

            <div class="form-group">
              <label for="password">密码</label>
              <input
                id="password"
                v-model="formData.password"
                type="password"
                placeholder="请输入密码"
                required
              >
            </div>

            <div v-if="!isLogin" class="form-group">
              <label for="confirmPassword">确认密码</label>
              <input
                id="confirmPassword"
                v-model="formData.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                required
              >
            </div>

            <div v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>

            <button type="submit" :disabled="loading" class="submit-btn">
              {{ loading ? '处理中...' : (isLogin ? '登录' : '注册') }}
            </button>
          </form>

          <div class="switch-mode">
            <span>{{ isLogin ? '还没有账号？' : '已有账号？' }}</span>
            <button type="button" @click="toggleMode" class="switch-btn">
              {{ isLogin ? '立即注册' : '立即登录' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 20px;
  box-sizing: border-box;
}

.login-card {
  display: flex;
  width: 100%;
  max-width: 1000px;
  height: 600px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.image-section {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 40px;
}

.image-content h2 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  font-weight: 600;
}

.image-content p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.form-content {
  width: 100%;
  max-width: 320px;
}

.form-content h1 {
  font-size: 2rem;
  margin-bottom: 30px;
  color: #2c3e50;
  text-align: center;
  font-weight: 600;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 15px;
  font-size: 14px;
  text-align: center;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.switch-mode {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.switch-btn {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-weight: 600;
  margin-left: 5px;
}

.switch-btn:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .login-container {
    padding: 0;
    align-items: stretch;
  }
  
  .login-card {
    flex-direction: column;
    height: 100vh;
    max-height: none;
    width: 100%;
    max-width: none;
    border-radius: 0;
  }
  
  .image-section {
    padding: 40px 20px;
    flex: 0 0 35%;
  }
  
  .form-section {
    flex: 1;
    padding: 30px 20px;
  }
  
  .image-content h2 {
    font-size: 1.6rem;
  }
  
  .image-content p {
    font-size: 1rem;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .login-card {
    width: 95%;
    height: 550px;
  }
}
</style>