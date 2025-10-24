<template>
  <div class="community-container">
    <!-- 左侧导航条组件 -->
    <SidebarNavigation />
    
    <!-- 主内容区域 -->
    <div class="main-content">
      <div class="nav-container">
        <!-- 顶部自定义导航区域 -->
        <div class="custom-nav">
          <div class="nav-card">
            <h2 class="nav-title">我的导航</h2>
            
            <!-- 添加链接按钮 -->
            <div class="add-link-section">
              <button @click="showAddLinkModal = true" class="add-link-btn">
                <span class="plus-icon">+</span>
                添加链接
              </button>
            </div>
            
            <!-- 自定义链接卡片 -->
            <div class="custom-links-grid">
              <div 
                v-for="(link, index) in customLinks" 
                :key="index" 
                class="link-card"
              >
                <div class="link-card-content">
                  <img :src="link.icon || '/default-icon.png'" :alt="link.name" class="link-icon">
                  <div class="link-info">
                    <h3 class="link-name">{{ link.name }}</h3>
                    <p class="link-url">{{ link.url }}</p>
                  </div>
                </div>
                <button @click="removeCustomLink(index)" class="link-delete-btn">×</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 添加链接模态框 -->
        <div v-if="showAddLinkModal" class="modal-overlay" @click="showAddLinkModal = false">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>新增链接</h3>
              <button @click="showAddLinkModal = false" class="modal-close-btn">×</button>
            </div>
            
            <div class="modal-body">
              <!-- URL输入区域 -->
              <div class="url-input-section">
                <input 
                  v-model="newLink.url" 
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
                  <img :src="newLink.icon || '/default-icon.png'" :alt="newLink.name" class="website-icon">
                  <button class="upload-icon-btn">上传图标</button>
                </div>
              </div>
              
              <!-- 网站信息输入区域 -->
              <div class="info-input-section">
                <div class="input-group">
                  <label>网站名称</label>
                  <input 
                    v-model="newLink.name" 
                    placeholder="请输入网站名称" 
                    class="info-input"
                  >
                </div>
                
                <div class="input-group">
                  <label>网站地址</label>
                  <input 
                    v-model="newLink.url" 
                    placeholder="请输入网站地址" 
                    class="info-input"
                    disabled
                  >
                </div>
                
                <div class="input-group">
                  <label>网站描述</label>
                  <textarea 
                    v-model="newLink.desc" 
                    placeholder="请输入网站描述" 
                    class="info-textarea"
                    rows="3"
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div class="modal-footer">
              <button @click="showAddLinkModal = false" class="cancel-btn">取消</button>
              <button @click="addCustomLink" class="save-btn">保存</button>
            </div>
          </div>
        </div>

        <!-- 热门推荐区域 -->
        <div class="hot-recommendation">
          <h2 class="section-title">热门推荐</h2>
          <div class="tabs">
            <button 
              v-for="(tab, index) in tabs" 
              :key="index" 
              :class="{ 'active': currentTab === index }" 
              @click="currentTab = index"
            >
              {{ tab }}
            </button>
            <button class="rank-btn">排行榜</button>
          </div>
          <div class="app-grid">
            <div 
              v-for="(app, index) in filteredApps" 
              :key="index" 
              class="app-card"
            >
              <img :src="app.icon" :alt="app.name" class="app-icon">
              <div class="app-info">
                <h3 class="app-name">{{ app.name }}</h3>
                <p class="app-desc">{{ app.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SidebarNavigation from '../components/SidebarNavigation.vue'

// 模态框显示状态
const showAddLinkModal = ref(false)

// 自定义导航链接
const customLinks = ref([])
const newLink = ref({ 
  name: '', 
  url: '', 
  desc: '',
  icon: '/default-icon.png'
})

// 热门推荐标签和应用数据
const tabs = ['全部', '工具', '娱乐', '学习']
const currentTab = ref(0)
const apps = ref([
  { name: 'NBtab-美女动态', desc: '清新无广告，浏览更...', icon: 'https://via.placeholder.com/40', category: '娱乐' },
  { name: '享趣追剧神器', desc: '超高清4K，永久免费...', icon: 'https://via.placeholder.com/40', category: '娱乐' },
  { name: '火车太顺', desc: '火车票抢票助手', icon: 'https://via.placeholder.com/40', category: '工具' },
  { name: '555电影', desc: '免费影视平台', icon: 'https://via.placeholder.com/40', category: '娱乐' },
  { name: 'DeepSeek', desc: '深度求索AI', icon: 'https://via.placeholder.com/40', category: '工具' },
  { name: '豆包', desc: '字节跳动智能助手', icon: 'https://via.placeholder.com/40', category: '工具' },
  { name: '电子木鱼', desc: '赛博功德积累神器', icon: 'https://via.placeholder.com/40', category: '娱乐' },
  { name: 'Excalidraw', desc: '手绘风格流程图工具', icon: 'https://via.placeholder.com/40', category: '工具' },
  { name: '反向词典', desc: '清华大学开源词汇工具', icon: 'https://via.placeholder.com/40', category: '学习' },
])

// 计算属性
const filteredApps = computed(() => {
  if (currentTab.value === 0) return apps.value;
  return apps.value.filter(app => app.category === tabs[currentTab.value]);
})

// 方法
const addCustomLink = () => {
  if (newLink.value.name && newLink.value.url) {
    // 验证URL格式
    if (!newLink.value.url.startsWith('http://') && !newLink.value.url.startsWith('https://')) {
      newLink.value.url = 'https://' + newLink.value.url;
    }
    customLinks.value.push({ ...newLink.value });
    newLink.value = { 
      name: '', 
      url: '', 
      desc: '',
      icon: '/default-icon.png'
    };
    showAddLinkModal.value = false;
  }
}

const removeCustomLink = (index) => {
  customLinks.value.splice(index, 1);
}

// 解析网站信息（暂未实现）
const parseWebsite = () => {
  // 后期实现网站解析功能
  console.log('开始解析网站:', newLink.value.url);
}

// 清空解析结果
const clearParse = () => {
  newLink.value = { 
    name: '', 
    url: newLink.value.url, // 保留URL
    desc: '',
    icon: '/default-icon.png'
  };
}
</script>

<style scoped>
.community-container {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 60px; /* 与导航栏宽度一致 */
  padding: 20px;
  background-color: #f5f6fa;
  min-height: 100vh;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.custom-nav {
  margin-bottom: 40px;
}

.nav-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-title {
  font-size: 24px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  color: #333;
  font-weight: 600;
}

.nav-title::before {
  content: '';
  display: inline-block;
  width: 24px;
  height: 24px;
  background: url('https://via.placeholder.com/24') no-repeat center;
  margin-right: 12px;
}

.add-link-section {
  margin-bottom: 24px;
}

.add-link-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: transparent;
  border: 2px dashed #ddd;
  border-radius: 8px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
  justify-content: center;
}

.add-link-btn:hover {
  border-color: #007bff;
  color: #007bff;
  background: rgba(0, 123, 255, 0.05);
}

.plus-icon {
  font-size: 18px;
  font-weight: bold;
}

.custom-links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.link-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s;
  border: 1px solid #e9ecef;
}

.link-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.link-card-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.link-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: cover;
}

.link-info {
  flex: 1;
}

.link-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.link-url {
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-delete-btn {
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: background-color 0.3s;
}

.link-delete-btn:hover {
  background: #ff5252;
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
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 480px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.3s;
}

.modal-close-btn:hover {
  color: #333;
  background: #f5f5f5;
}

.modal-body {
  padding: 20px;
}

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

.icon-section {
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.icon-preview {
  display: flex;
  align-items: center;
  gap: 12px;
}

.website-icon {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid #ddd;
}

.upload-icon-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-icon-btn:hover {
  border-color: #007bff;
  color: #007bff;
}

.info-input-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid #eee;
  justify-content: flex-end;
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
  background: #fff;
  color: #666;
}

.cancel-btn:hover {
  background: #f5f5f5;
  border-color: #999;
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

.hot-recommendation {
  margin-top: 40px;
}

.section-title {
  font-size: 24px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  color: #333;
}

.section-title::before {
  content: '';
  display: inline-block;
  width: 20px;
  height: 20px;
  background: url('https://via.placeholder.com/20/ff5722') no-repeat center;
  margin-right: 8px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}

.tabs button {
  padding: 8px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.tabs button:hover {
  background: #f8f9fa;
}

.tabs button.active {
  background: #007bff;
  color: #fff;
  border-color: #007bff;
}

.rank-btn {
  margin-left: auto;
  background: #ff9800;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 15px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.rank-btn:hover {
  background: #f57c00;
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.app-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s;
  background: #fff;
  cursor: pointer;
}

.app-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  border-color: #007bff;
}

.app-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  margin-bottom: 10px;
  object-fit: cover;
}

.app-name {
  font-size: 16px;
  margin-bottom: 5px;
  color: #333;
  font-weight: 600;
}

.app-desc {
  font-size: 14px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 10px;
  }
  
  .nav-container {
    padding: 10px;
  }
  
  .link-input {
    flex-direction: column;
  }
  
  .app-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }
  
  .tabs {
    flex-wrap: wrap;
  }
  
  .rank-btn {
    margin-left: 0;
    margin-top: 10px;
  }
}
</style>