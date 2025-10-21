<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../supabase.js'

const authStore = useAuthStore()
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show'])

const showProfileCard = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

// 用户资料数据
const profileData = ref({
  avatar: '',
  nickname: '',
  username: '',
  email: '',
  password: '',
  bio: ''
})

// 编辑状态
const isEditing = ref({
  nickname: false,
  email: false,
  password: false,
  bio: false
})

// 临时编辑值
const editValues = ref({
  nickname: '',
  email: '',
  password: '',
  bio: ''
})

// 从Supabase加载用户完整资料
const loadUserProfile = async () => {
  if (authStore.user) {
    try {
      // 从user_profiles表加载资料，如果不存在则使用默认值
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authStore.user.id)
        .single()
      
      if (error && error.code !== 'PGRST116') { // PGRST116表示没有找到记录
        throw error
      }
      
      // 如果找到用户资料，使用资料数据；否则使用默认数据
      if (data) {
        profileData.value = {
          avatar: data.avatar_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzAwN2JmZiIvPgo8Y2lyY2xlIGN4PSIxNiIgY3k9IjEyIiByPSI0IiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTYgMjRDMjAgMjQgMjQgMjIgMjQgMThIMEMwLjAwMSAyMiA0IDI0IDE2IDI0WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
          nickname: data.display_name || authStore.user.username,
          username: authStore.user.username,
          email: data.email || `${authStore.user.username}@example.com`,
          password: '••••••••',
          bio: data.bio || '这个人很懒，什么都没有留下...'
        }
      } else {
        // 没有找到用户资料，使用默认数据
        profileData.value = {
          avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMwMDdiZmYiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxMiIgcj0iNCIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE2IDI0QzIwIDI0IDI0IDIyIDI0IDE4SDBDMC4wMDEgMjIgNCAyNCAxNiAyNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==',
          nickname: authStore.user.displayName || authStore.user.username,
          username: authStore.user.username,
          email: authStore.user.email || `${authStore.user.username}@example.com`,
          password: '••••••••',
          bio: '这个人很懒，什么都没有留下...'
        }
      }
    } catch (error) {
      console.error('加载用户资料失败:', error)
      // 使用默认数据
      profileData.value = {
        avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMwMDdiZmYiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxMiIgcj0iNCIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE2IDI0QzIwIDI0IDI0IDIyIDI0IDE4SDBDMC4wMDEgMjIgNCAyNCAxNiAyNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==',
        nickname: authStore.user.displayName || authStore.user.username,
        username: authStore.user.username,
        email: authStore.user.email || `${authStore.user.username}@example.com`,
        password: '••••••••',
        bio: '这个人很懒，什么都没有留下...'
      }
    }
  }
}

// 初始化用户资料
onMounted(() => {
  loadUserProfile()
})

// 监听卡片显示状态，显示时重新加载数据
watch(() => props.show, (newVal) => {
  if (newVal) {
    loadUserProfile()
  }
})

// 处理头像上传
const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      profileData.value.avatar = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// 开始编辑
const startEdit = (field) => {
  isEditing.value[field] = true
  editValues.value[field] = profileData.value[field]
}

// 取消编辑
const cancelEdit = (field) => {
  isEditing.value[field] = false
  editValues.value[field] = ''
}

// 保存编辑
const saveEdit = (field) => {
  if (editValues.value[field].trim()) {
    profileData.value[field] = editValues.value[field]
  }
  isEditing.value[field] = false
  editValues.value[field] = ''
}

// 保存所有更改
const saveProfile = async () => {
  try {
    // 保存基本资料
    await authStore.updateProfile({
      nickname: profileData.value.nickname,
      email: profileData.value.email,
      avatar: profileData.value.avatar,
      bio: profileData.value.bio
    })
    
    // 如果密码被修改且不是默认的掩码
    if (profileData.value.password !== '••••••••' && profileData.value.password.trim()) {
      await authStore.updatePassword(profileData.value.password)
    }
    
    showProfileCard.value = false
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败: ' + error.message)
  }
}

// 关闭卡片
const closeProfileCard = () => {
  showProfileCard.value = false
}
</script>

<template>
  <!-- 个人资料编辑卡片 -->
  <div v-if="showProfileCard" class="profile-overlay" @click="closeProfileCard">
    <div class="profile-card" @click.stop>
      <!-- 卡片头部 -->
      <div class="profile-header">
        <h2>编辑个人资料</h2>
        <button class="close-btn" @click="closeProfileCard">
          <i class="uil uil-times"></i>
        </button>
      </div>

      <!-- 头像上传区域 -->
      <div class="avatar-section">
        <div class="avatar-container">
          <img :src="profileData.avatar" alt="用户头像" class="avatar" />
          <div class="avatar-upload-overlay">
            <i class="uil uil-camera"></i>
            <input 
              type="file" 
              accept="image/*" 
              @change="handleAvatarUpload" 
              class="avatar-upload-input"
            />
          </div>
        </div>
        <p class="avatar-hint">点击头像上传新照片</p>
      </div>

      <!-- 资料编辑表单 -->
      <div class="profile-form">
        <!-- 昵称 -->
        <div class="form-field">
          <label>昵称</label>
          <div class="field-content">
            <div v-if="!isEditing.nickname" class="display-value">
              <span>{{ profileData.nickname }}</span>
              <button class="edit-btn" @click="startEdit('nickname')">
                <i class="uil uil-edit"></i>
              </button>
            </div>
            <div v-else class="edit-controls">
              <input 
                v-model="editValues.nickname" 
                type="text" 
                class="edit-input"
                placeholder="请输入昵称（最长12个汉字）"
                maxlength="12"
              />
              <button class="save-btn" @click="saveEdit('nickname')">
                <i class="uil uil-check"></i>
              </button>
              <button class="cancel-btn" @click="cancelEdit('nickname')">
                <i class="uil uil-times"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- 账号 -->
        <div class="form-field">
          <label>账号</label>
          <div class="field-content">
            <span class="display-value">{{ profileData.username }}</span>
            <span class="readonly-hint">（不可修改）</span>
          </div>
        </div>

        <!-- 邮箱 -->
        <div class="form-field">
          <label>邮箱</label>
          <div class="field-content">
            <div v-if="!isEditing.email" class="display-value">
              <span>{{ profileData.email }}</span>
              <button class="edit-btn" @click="startEdit('email')">
                <i class="uil uil-edit"></i>
              </button>
            </div>
            <div v-else class="edit-controls">
              <input 
                v-model="editValues.email" 
                type="email" 
                class="edit-input"
                placeholder="请输入邮箱地址"
              />
              <button class="save-btn" @click="saveEdit('email')">
                <i class="uil uil-check"></i>
              </button>
              <button class="cancel-btn" @click="cancelEdit('email')">
                <i class="uil uil-times"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- 密码 -->
        <div class="form-field">
          <label>密码</label>
          <div class="field-content">
            <div v-if="!isEditing.password" class="display-value">
              <span>{{ profileData.password }}</span>
              <button class="edit-btn" @click="startEdit('password')">
                <i class="uil uil-edit"></i>
              </button>
            </div>
            <div v-else class="edit-controls">
              <input 
                v-model="editValues.password" 
                type="password" 
                class="edit-input"
                placeholder="请输入新密码"
              />
              <button class="save-btn" @click="saveEdit('password')">
                <i class="uil uil-check"></i>
              </button>
              <button class="cancel-btn" @click="cancelEdit('password')">
                <i class="uil uil-times"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- 简介 -->
        <div class="form-field">
          <label>个人简介</label>
          <div class="field-content">
            <div v-if="!isEditing.bio" class="display-value">
              <span>{{ profileData.bio }}</span>
              <button class="edit-btn" @click="startEdit('bio')">
                <i class="uil uil-edit"></i>
              </button>
            </div>
            <div v-else class="edit-controls">
              <textarea 
                v-model="editValues.bio" 
                class="edit-textarea"
                placeholder="请输入个人简介"
                rows="3"
              ></textarea>
              <div class="textarea-controls">
                <button class="save-btn" @click="saveEdit('bio')">
                  <i class="uil uil-check"></i>
                </button>
                <button class="cancel-btn" @click="cancelEdit('bio')">
                  <i class="uil uil-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 保存按钮 -->
      <div class="profile-actions">
        <button class="save-profile-btn" @click="saveProfile">
          <i class="uil uil-save"></i>
          保存更改
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.profile-card {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.profile-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #7f8c8d;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.close-btn:hover {
  background-color: #f5f5f5;
  color: #2c3e50;
}

.avatar-section {
  padding: 24px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

.avatar-container {
  position: relative;
  display: inline-block;
  margin-bottom: 12px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #3498db;
}

.avatar-upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
}

.avatar-container:hover .avatar-upload-overlay {
  opacity: 1;
}

.avatar-upload-overlay i {
  color: white;
  font-size: 24px;
}

.avatar-upload-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.avatar-hint {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.profile-form {
  padding: 24px;
}

.form-field {
  margin-bottom: 20px;
}

.form-field label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 500;
  font-size: 14px;
}

.field-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
}

.display-value {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.display-value span {
  color: #2c3e50;
  font-size: 15px;
}

.readonly-hint {
  color: #95a5a6;
  font-size: 12px;
  font-style: italic;
}

.edit-btn {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 6px;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.edit-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.edit-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s ease;
}

.edit-input:focus {
  border-color: #3498db;
}

.edit-textarea {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  outline: none;
  transition: border-color 0.3s ease;
}

.edit-textarea:focus {
  border-color: #3498db;
}

.textarea-controls {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.save-btn, .cancel-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.save-btn {
  background: #27ae60;
  color: white;
}

.save-btn:hover {
  background: #219a52;
}

.cancel-btn {
  background: #e74c3c;
  color: white;
}

.cancel-btn:hover {
  background: #c0392b;
}

.profile-actions {
  padding: 20px 24px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
}

.save-profile-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.save-profile-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.save-profile-btn:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-card {
    width: 95%;
    margin: 20px;
  }
  
  .profile-header {
    padding: 16px 20px;
  }
  
  .avatar-section {
    padding: 20px;
  }
  
  .profile-form {
    padding: 20px;
  }
  
  .field-content {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .edit-controls {
    flex-direction: column;
  }
}
</style>