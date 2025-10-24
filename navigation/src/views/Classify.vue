<template>
  <div class="classify-container">
    <!-- 左侧导航条组件 -->
    <SidebarNavigation />
    
    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 顶部标题区域 -->
      <div class="page-header">
        <h1 class="page-title">{{ currentCategoryName }}</h1>
      </div>

      <!-- 主要内容区域 - 大卡片 -->
      <div class="content-card">
        <!-- 6×3网格布局 -->
        <div class="grid-container">
          <!-- 网站URL小盒子 -->
          <div 
            v-for="(site, index) in websites" 
            :key="index"
            class="website-box"
            @click="openWebsite(site.url)"
          >
            <div class="website-icon">
              <i :class="['uil', site.icon]"></i>
            </div>
            <span class="website-name">{{ site.name }}</span>
          </div>

          <!-- 最后一个格子 - 添加按钮 -->
          <div class="add-box" @click="showAddModal">
            <div class="add-icon">
              <i class="uil uil-plus"></i>
            </div>
            <span class="add-text">添加网站</span>
          </div>
        </div>
      </div>

      <!-- 添加网站模态框 -->
      <div v-if="showModal" class="modal-overlay" @click="hideModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>添加网站</h3>
            <button class="close-btn" @click="hideModal">
              <i class="uil uil-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <input 
              v-model="newSite.name" 
              type="text" 
              placeholder="网站名称" 
              class="input-field"
            >
            <input 
              v-model="newSite.url" 
              type="url" 
              placeholder="网站URL" 
              class="input-field"
            >
            <button class="add-btn" @click="addWebsite">添加</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import SidebarNavigation from '../components/SidebarNavigation.vue'

const route = useRoute()

// 当前分类名称（从路由参数获取）
const currentCategoryName = computed(() => {
  const categoryId = route.params.categoryId
  // 根据categoryId获取分类名称，这里先使用默认值
  if (categoryId === 'media') return '媒体'
  if (categoryId === 'social') return '社交'
  if (categoryId === 'tools') return '工具'
  return '我的分类'
})

// 网站数据
const websites = ref([
  { name: '百度', url: 'https://baidu.com', icon: 'uil-search' },
  { name: '知乎', url: 'https://zhihu.com', icon: 'uil-book-open' },
  { name: 'B站', url: 'https://bilibili.com', icon: 'uil-play-circle' },
  { name: 'GitHub', url: 'https://github.com', icon: 'uil-github' },
  { name: '淘宝', url: 'https://taobao.com', icon: 'uil-shopping-cart' },
  { name: '微信', url: 'https://weixin.qq.com', icon: 'uil-comment' },
  { name: '微博', url: 'https://weibo.com', icon: 'uil-comment-alt' },
  { name: '网易云', url: 'https://music.163.com', icon: 'uil-music' },
  { name: '豆瓣', url: 'https://douban.com', icon: 'uil-star' },
  { name: '腾讯视频', url: 'https://v.qq.com', icon: 'uil-film' },
  { name: '京东', url: 'https://jd.com', icon: 'uil-shopping-bag' },
  { name: '美团', url: 'https://meituan.com', icon: 'uil-utensils' },
  { name: '饿了么', url: 'https://ele.me', icon: 'uil-pizza-slice' },
  { name: '携程', url: 'https://ctrip.com', icon: 'uil-plane' },
  { name: '滴滴', url: 'https://didiglobal.com', icon: 'uil-car' },
  { name: '高德地图', url: 'https://amap.com', icon: 'uil-map-marker' },
  { name: '钉钉', url: 'https://dingtalk.com', icon: 'uil-briefcase' },
])

// 模态框状态
const showModal = ref(false)
const newSite = ref({ name: '', url: '' })

// 打开网站
const openWebsite = (url) => {
  window.open(url, '_blank')
}

// 显示添加模态框
const showAddModal = () => {
  newSite.value = { name: '', url: '' }
  showModal.value = true
}

// 隐藏模态框
const hideModal = () => {
  showModal.value = false
}

// 添加网站
const addWebsite = () => {
  if (newSite.value.name && newSite.value.url) {
    websites.value.push({
      ...newSite.value,
      icon: 'uil-globe'
    })
    hideModal()
  }
}

// 初始化
onMounted(() => {
  console.log('分类页面加载完成，当前分类:', currentCategoryName.value)
})
</script>

<style scoped>
.classify-container {
  min-height: 100vh;
  background: #f8f9fa;
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  display: flex;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  padding: 20px;
  margin-left: 60px; /* 导航栏宽度 */
}

/* 顶部标题区域 */
.page-header {
  margin-bottom: 24px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 24px;
}

.page-title {
  color: #667eea;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
}

/* 主要内容卡片 */
.content-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  min-height: 500px;
  max-width: 1200px;
  margin: 30px auto 0;
}

/* 网格布局 */
.grid-container {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(3, 120px);
  gap: 50px;
  height: auto;
  margin: 20px 60px;
}

/* 网站小盒子样式 */
.website-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  background: #f8f9fa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  aspect-ratio: 1 / 1;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.website-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
  background: white;
}

.website-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.website-icon i {
  font-size: 24px;
  color: white;
}

.website-name {
  font-size: 12px;
  color: #333;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
  word-break: break-all;
}

/* 添加按钮样式 */
.add-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  background: #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px dashed #adb5bd;
  aspect-ratio: 1 / 1;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.add-box:hover {
  background: #dee2e6;
  border-color: #667eea;
  transform: translateY(-2px);
}

.add-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #adb5bd;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.add-icon i {
  font-size: 24px;
  color: white;
}

.add-text {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
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
  width: 90%;
  max-width: 400px;
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

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-field {
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
}

.input-field:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.add-btn {
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(6, 1fr);
  }
  
  .main-content {
    padding: 16px;
    margin-left: 0;
  }
  
  .content-card {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(9, 1fr);
  }
  
  .page-title {
    font-size: 24px;
  }
}
</style>