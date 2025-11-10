<template>
  <div class="classify-container" :style="wallpaperUrl ? { backgroundImage: `url(${wallpaperUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } : {}">
    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 顶部标题区域 -->
      <div class="page-header">
        <h1 class="page-title">{{ currentCategoryName }}</h1>
        <button class="delete-category-btn" @click="deleteCategory" title="删除该分类及其所有网站内容">
          <i class="uil uil-trash-alt"></i>
        </button>
      </div>

      <!-- 主要内容区域 - 大卡片 -->
      <div class="content-card">
        <!-- 6×3网格布局 -->
        <div class="grid-container">
          <!-- 网站项：图标和文字组合 -->
          <div 
            v-for="(site, index) in websites" 
            :key="index"
            class="website-item"
            @mouseenter="showDeleteButton(index)"
            @mouseleave="hideDeleteButton(index)"
          >
            <div class="website-icon-box" @click="openWebsite(site.url)">
              <img 
                :src="getWebsiteIcon(site.url)" 
                :alt="site.name"
                class="website-icon-img"
                loading="lazy"
                @error="handleWebsiteIconError"
              />
              <!-- 删除按钮 -->
              <button 
                v-if="showDeleteIndex === index"
                class="delete-btn"
                @click.stop="deleteWebsite(site.id, index)"
              >
                <i class="uil uil-trash-alt"></i>
              </button>
            </div>
            <span class="website-name">{{ site.name }}</span>
          </div>

          <!-- 添加按钮：固定在最后一个格子位置 -->
          <div class="add-item" @click="showAddModal">
            <div class="add-icon-box">
              <i class="uil uil-plus"></i>
            </div>
            <span class="add-name">添加网站</span>
          </div>
        </div>
      </div>

      <!-- 添加网站模态框 -->
      <div v-if="showModal" class="modal-overlay" @click="hideModal">
        <div class="modal-content" @click.stop>
          <!-- 顶部导航栏 -->
          <div class="modal-header">
            <h3>添加网站</h3>
            <button class="close-btn" @click="hideModal">
              <i class="uil uil-times"></i>
            </button>
          </div>
          
          <!-- 导航标签 -->
          <div class="modal-tabs">
            <button 
              :class="['tab-btn', { active: activeTab === 'recommended' }]"
              @click="activeTab = 'recommended'"
            >
              推荐网站
            </button>
            <button 
              :class="['tab-btn', { active: activeTab === 'custom' }]"
              @click="activeTab = 'custom'"
            >
              自定义网站
            </button>
          </div>
          
          <!-- 推荐网站内容 -->
          <div v-if="activeTab === 'recommended'" class="recommended-content">
            <div class="recommended-scroll-container">
              <div class="recommended-grid">
                <div 
                  v-for="(site, index) in recommendedSites" 
                  :key="index"
                  class="recommended-site"
                  @click="selectRecommendedSite(site)"
                >
                  <div class="site-icon">
                    <img :src="site.icon" :alt="site.title" loading="lazy" @error="handleIconError">
                  </div>
                  <div class="site-info">
                    <h4 class="site-title">{{ site.title }}</h4>
                    <p class="site-desc">{{ site.description }}</p>
                  </div>
                  <button 
                    class="add-site-btn" 
                    :class="{ 
                      'remove-btn': isSiteAdded(site), 
                      'loading-btn': loadingStates[site.url] 
                    }"
                    @click.stop="isSiteAdded(site) ? removeRecommendedSite(site) : addRecommendedSite(site)"
                    :disabled="loadingStates[site.url]"
                  >
                    <i 
                      v-if="!loadingStates[site.url]" 
                      :class="isSiteAdded(site) ? 'uil uil-minus' : 'uil uil-plus'"
                    ></i>
                    <i v-else class="uil uil-spinner uil-spin"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 自定义网站内容 -->
          <div v-if="activeTab === 'custom'" class="custom-content">
            <div class="custom-scroll-container">
              <div class="modal-body">
                <!-- URL输入区域 -->
                <div class="url-input-section">
                  <input 
                    v-model="newSite.url" 
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
                    <img :src="newSite.icon_url || getDefaultIconUrl()" :alt="newSite.name" class="website-icon">
                    <div class="icon-actions">
                      <input 
                        type="file" 
                        ref="iconInput" 
                        accept="image/*" 
                        @change="handleIconUpload" 
                        style="display: none"
                      >
                      <div class="action-buttons">
                        <button @click="$refs.iconInput.click()" class="upload-icon-btn">上传图标</button>
                        <button @click="resetIcon" class="reset-icon-btn">重置图标</button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 网站信息输入区域 -->
                <div class="info-input-section">
                  <div class="input-group">
                    <label>网站名称</label>
                    <input 
                      v-model="newSite.name" 
                      placeholder="请输入网站名称" 
                      class="info-input"
                    >
                  </div>
                  
                  <div class="input-group">
                    <label>网站地址</label>
                    <input 
                      v-model="newSite.url" 
                      placeholder="请输入网站地址" 
                      class="info-input"
                      disabled
                    >
                  </div>
                  

                </div>
              </div>
              
              <!-- 模态框底部按钮 -->
              <div class="modal-footer">
                <button @click="hideModal" class="cancel-btn">取消</button>
                <button @click="addWebsite" class="save-btn">添加</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useClassify } from '../js/Classify.js'

// 使用 composable 函数
const {
  wallpaperUrl,
  currentCategoryName,
  recommendedSites,
  websites,
  showDeleteIndex,
  showModal,
  activeTab,
  newSite,
  loadingStates,
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
} = useClassify()
</script>

<style scoped>
@import '../css/ClassifyView.css';
</style>