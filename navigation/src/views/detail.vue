<template>
  <div class="detail-container">
    <!-- 顶部极简导航栏 -->
    <div class="detail-navbar">
      <div class="navbar-content">
        <!-- 面包屑导航 -->
        <div class="breadcrumb">
          <span class="breadcrumb-item" @click="handleBack">工具集市</span>
          <span class="breadcrumb-separator">></span>
          <span class="breadcrumb-item current">帖子详情</span>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 加载状态 - 使用骨架屏保持布局 -->
      <template v-if="loading">
        <div class="post-content-area">
          <div class="skeleton-container">
            <div class="skeleton-card">
              <!-- 标题骨架 -->
              <div class="skeleton-title"></div>
              <!-- 作者信息骨架 -->
              <div class="skeleton-author">
                <div class="skeleton-avatar"></div>
                <div class="skeleton-author-info">
                  <div class="skeleton-line short"></div>
                  <div class="skeleton-line shorter"></div>
                </div>
              </div>
              <!-- 内容骨架 -->
              <div class="skeleton-content">
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line medium"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
              </div>
            </div>
          </div>
        </div>
        <!-- 侧边栏骨架 -->
        <div class="sidebar">
          <div class="skeleton-sidebar-card skeleton-author-card"></div>
          <div class="skeleton-sidebar-card skeleton-button"></div>
          <div class="skeleton-sidebar-card skeleton-list"></div>
        </div>
      </template>

      <!-- 错误状态 -->
      <template v-else-if="error">
        <div class="post-content-area">
          <div class="error-container">
            <div class="error-icon">⚠️</div>
            <h3>加载失败</h3>
            <p>{{ error }}</p>
            <button class="retry-btn" @click="fetchArticleDetail(route.params.id)">重试</button>
          </div>
        </div>
      </template>

      <!-- 帖子内容区域 -->
      <div v-else class="post-content-area">
        <!-- 帖子卡片 -->
        <article class="post-card">
          <h1 class="post-title">
            {{ article?.title || '文章标题' }}
          </h1>
        
          <!-- 作者信息 -->
          <div class="author-info">
            <div class="author-details" @click="navigateToAuthorProfile">
              <img :src="article?.author?.avatar || 'https://picsum.photos/id/237/60/60'" alt="作者头像" class="author-avatar">
              <div>
                <div class="flex items-center">
                  <span class="author-name">{{ article?.author?.name || '匿名用户' }}</span>
                  <span v-if="article?.author?.badge" class="author-badge">{{ article.author.badge }}</span>
                </div>
                <div class="post-meta">
                  发布于 <time>{{ article?.publishTime || '未知时间' }}</time>
                </div>
              </div>
            </div>
            
            <button class="more-options">
              <i class="fa fa-ellipsis-h"></i>
            </button>
          </div>
          
          <!-- 相关链接区域 -->
          <div v-if="relatedLinks && relatedLinks.length > 0" class="related-links-section">
            <h3 class="related-links-title">相关链接 - {{ getPlatformDisplayName() }}</h3>
            <div class="related-links-container">
              <div 
                v-for="link in relatedLinks" 
                :key="link.id" 
                class="related-link-item"
                :class="{ 'info-item': link.isInfo }"
                @click="!link.isInfo && openLink(link.url)"
              >
                <div class="link-icon" :style="{ backgroundColor: link.isInfo ? '#6b7280' : getLinkColor(link.name) }">
                  <img v-if="isImageIcon(link.icon)" :src="link.icon" :alt="link.name" class="link-icon-img">
                  <i v-else :class="link.icon || 'uil-globe'"></i>
                </div>
                <div class="link-info">
                  <div class="link-name">{{ link.name }}</div>
                  <div v-if="!link.isInfo" class="link-url">{{ formatUrl(link.url) }}</div>
                  <div v-else class="link-info-text">文章包含链接信息，但需要完善URL格式</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 帖子内容 -->
          <div class="post-content" v-html="article?.content || '<p>文章内容加载中...</p>'">
          </div>
          
          <!-- 标签 -->
          <div v-if="article?.tags && article.tags.length > 0" class="tags">
            <span 
              v-for="tag in article.tags" 
              :key="tag" 
              class="tag" 
              :class="{ 'tag-primary': tag === 'React', 'tag-neutral': tag !== 'React' }"
            >
              #{{ tag }}
            </span>
          </div>
          
          <!-- 互动按钮 -->
          <div class="action-buttons">
            <div class="left-actions">
              <button class="action-button like-button" @click="handleLike" :class="{ 'liked': isLiked }">
                <i class="fa" :class="isLiked ? 'fa-thumbs-up' : 'fa-thumbs-o-up'"></i>
                <span>{{ isLiked ? '已赞同' : '赞同' }} ({{ article?.likes || 0 }})</span>
              </button>
              <button class="action-button" @click="handleFavorite" :class="{ 'favorited': isFavorited }">
                <i class="fa" :class="isFavorited ? 'fa-star' : 'fa-star-o'"></i>
                <span>{{ isFavorited ? '已收藏' : '收藏' }} ({{ article?.favorites || 0 }})</span>
              </button>
              <button class="action-button" @click="handleComment">
                <i class="fa fa-comment"></i>
                <span>评论 ({{ comments.length }})</span>
              </button>
            </div>
            
            <div class="right-actions">
              <button class="action-button" @click="handleShare">
                <i class="fa fa-share-alt"></i>
                <span>分享</span>
              </button>
            </div>
          </div>
        </article>

        <!-- 评论区 -->
        <section v-if="showComments" class="comment-section">
          <h2 class="comment-title">评论 (32)</h2>
          
          <!-- 评论输入框 -->
          <div class="comment-input-container">
            <div class="flex gap-4">
              <img :src="currentUserAvatar" alt="你的头像" class="avatar">
              <div class="flex-grow">
                <textarea 
                  placeholder="分享你的想法..." 
                  class="comment-textarea"
                  rows="3"
                  v-model="commentContent"
                ></textarea>
                <div class="flex justify-end mt-3">
                  <button class="btn-primary" @click="submitComment">
                    发表评论
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 评论排序 -->
          <div class="sort-container">
            <div class="flex space-x-4">
              <button class="sort-btn active">
                <span>最新</span>
                <i class="fa fa-chevron-down text-xs"></i>
              </button>
              <button class="sort-btn">
                <span>最热</span>
              </button>
            </div>
            <button class="view-all text-sm">
              查看全部{{ comments.length }}条评论
            </button>
          </div>
          
            <!-- 评论列表 -->
            <div class="comment-list">
              <!-- 加载状态 -->
              <div v-if="commentsLoading" class="loading-comments">
                <i class="fa fa-spinner fa-spin"></i>
                <span>加载评论中...</span>
              </div>
              
              <!-- 空状态 -->
              <div v-else-if="comments.length === 0" class="empty-comments">
                <div class="empty-icon">
                  <i class="fa fa-comments"></i>
                </div>
                <p class="empty-text">暂无评论，快来发表第一条评论吧！</p>
              </div>
              
              <!-- 动态评论列表 -->
              <div v-else>
                <div v-for="comment in comments" :key="comment.id" class="comment-item">
                  <div class="flex gap-4">
                    <!-- 头像 -->
                    <img 
                      :src="comment.author_avatar || 'https://picsum.photos/id/1005/50/50'" 
                      :alt="comment.author_name || '用户'" 
                      class="avatar"
                    >
                    <div class="flex-grow">
                      <!-- 评论头部 -->
                      <div class="comment-header">
                        <div>
                          <h4 class="comment-author">
                            {{ comment.author_name || '匿名用户' }}
                            <span v-if="article && article.author_id === comment.user_id" class="author-badge">作者</span>
                          </h4>
                          <p class="comment-time">{{ formatTime(comment.created_at) }}</p>
                        </div>
                        <button class="more-btn" @click="handleCommentMenu(comment)">
                          <i class="fa fa-ellipsis-h"></i>
                        </button>
                      </div>
                      
                      <!-- 评论内容 -->
                      <div class="comment-content">
                        {{ comment.content }}
                      </div>
                      
                      <!-- 评论操作 -->
                      <div class="comment-actions">
                        <button 
                          class="action-btn" 
                          :class="{ liked: comment.user_liked }"
                          @click="handleLikeComment(comment)"
                        >
                          <i 
                            class="fa" 
                            :class="comment.user_liked ? 'fa-thumbs-up' : 'fa-thumbs-o-up'"
                          ></i>
                          <span>{{ comment.like_count || 0 }}</span>
                        </button>
                        <button 
                          class="action-btn reply-btn"
                          @click="startReply(comment.id)"
                        >
                          <i class="fa fa-reply"></i>
                          <span>回复</span>
                        </button>
                      </div>
                      

                      
                      <!-- 评论的回复 -->
                      <div v-if="comment.replies && comment.replies.length > 0" class="replies-container">
                        <div 
                          v-for="reply in comment.replies" 
                          :key="reply.id" 
                          class="reply-item"
                        >
                          <img 
                            :src="reply.author_avatar || 'https://picsum.photos/id/237/40/40'" 
                            :alt="reply.author_name || '用户'" 
                            class="reply-avatar"
                          >
                          <div class="flex-grow">
                            <div class="comment-header">
                              <div>
                                <h5 class="comment-author">
                                  {{ reply.author_name || '匿名用户' }}
                                  <span v-if="article && article.author_id === reply.user_id" class="author-badge">作者</span>
                                  <span v-if="reply.reply_to_name" class="reply-to-text">回复 @{{ reply.reply_to_name }}</span>
                                </h5>
                                <p class="comment-time">{{ formatTime(reply.created_at) }}</p>
                              </div>
                            </div>
                            
                            <div class="comment-content">
                              {{ reply.content }}
                            </div>
                            
                            <div class="reply-actions">
                              <button 
                                class="action-btn" 
                                :class="{ liked: reply.user_liked }"
                                @click="handleLikeComment(reply)"
                              >
                                <i 
                                  class="fa" 
                                  :class="reply.user_liked ? 'fa-thumbs-up' : 'fa-thumbs-o-up'"
                                ></i>
                                <span>{{ reply.like_count || 0 }}</span>
                              </button>
                              <button 
                                class="action-btn reply-btn"
                                @click="startReply(comment.id, reply.user_id)"
                              >
                                <i class="fa fa-reply"></i>
                                <span>回复</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 加载更多评论 -->
              <div v-if="comments.length > 0 && showAllComments" class="load-more">
                <button class="load-more-btn" @click="loadMoreComments">
                  加载更多评论
                </button>
              </div>
              
              <!-- 固定位置的回复输入框（始终显示在评论列表底部） -->
              <div v-if="replyToComment" class="fixed-reply-container">
                <div class="reply-input-card">
                  <div class="reply-header">
                    <span class="reply-target">回复给: {{ getReplyTargetName() }}</span>
                    <button class="close-reply-btn" @click="cancelReply">
                      <i class="fa fa-times"></i>
                    </button>
                  </div>
                  <div class="flex gap-4">
                    <img :src="currentUserAvatar" alt="你的头像" class="avatar">
                    <div class="flex-grow">
                      <textarea 
                        :placeholder="getReplyPlaceholder()" 
                        class="comment-textarea"
                        rows="3"
                        v-model="replyContent"
                      ></textarea>
                      <div class="flex justify-end gap-2 mt-3">
                        <button class="btn-secondary" @click="cancelReply">
                          取消
                        </button>
                        <button class="btn-primary" @click="submitReply(replyToComment)">
                          发表回复
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </section>
      </div>

      <!-- 右侧边栏 -->
      <div class="sidebar">
        <!-- 作者卡片 -->
        <AuthorCard 
          :author-info="authorInfo"
          :author-id="authorId"
          @follow="handleAuthorFollow"
          @private-message="handleAuthorPrivateMessage"
        />

        <!-- 一键总结按钮 -->
        <div class="summary-button-wrapper">
          <button class="summary-button" @click="handleSummary" :disabled="isSummarizing">
            <i class="fa fa-magic"></i>
            <span>{{ isSummarizing ? '总结中...' : '一键总结' }}</span>
          </button>
          
          <!-- 总结结果卡片 -->
          <div v-if="showSummaryCard && summaryResult" class="summary-card">
            <div class="summary-card-header">
              <h3 class="summary-title">
                <i class="fa fa-file-text"></i>
                文章总结
              </h3>
              <button class="summary-close-btn" @click="showSummaryCard = false">
                <i class="fa fa-times"></i>
              </button>
            </div>
            <div class="summary-content">
              <div class="summary-text">{{ summaryResult }}</div>
            </div>
            <div class="summary-card-footer">
              <div class="summary-meta">
                <i class="fa fa-clock-o"></i>
                <span>AI智能生成</span>
              </div>
              <button class="summary-copy-btn" @click="copySummary">
                <i class="fa fa-copy"></i>
                复制总结
              </button>
            </div>
          </div>
        </div>

        <!-- TA的精选 -->
        <div class="selected-works">
          <div class="selected-list">
            <div class="list-header">TA的精选</div>
            
            <!-- 加载状态 -->
            <div v-if="selectedWorksLoading" class="loading-state">
              <div class="loading-spinner-small"></div>
              <span>正在加载精选文章...</span>
            </div>
            
            <!-- 文章列表 -->
            <div v-else-if="selectedWorks.length > 0">
              <div 
                v-for="work in selectedWorks" 
                :key="work.id" 
                class="list-item"
                @click="handleSelectedWorkClick(work.id)"
              >
                <span 
                  class="tag" 
                  :class="{ 
                    'tag-new': work.isNew, 
                    'tag-hot': work.isHot 
                  }"
                >
                  {{ work.tagLabel }}
                </span>
                <a href="javascript:void(0)" class="item-title">{{ work.title }}</a>
                <div class="item-read">{{ work.viewCount }} 阅读</div>
              </div>
            </div>
            
            <!-- 空状态 -->
            <div v-else class="empty-state">
              <span>暂无精选文章</span>
            </div>
            
            <div class="view-more-container">
              <button class="view-more" @click="handleViewMore">查看更多&gt;</button>
            </div>
          </div>
        </div>

        <!-- 热门话题 -->
        <HotTopicsCard />
      </div>
    </div>
</div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { supabase } from '../supabase.js'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const fileInput = ref(null)
const vditorRef = ref(null)
const authStore = useAuthStore()

// 平台分类映射
const platformCategories = {
  '自动化工作流': ['n8n', 'Zapier', 'Make', 'IFTTT', '扣子', 'Power Automate'],
  '手动协作流': ['n8n', 'Zapier', 'Make', 'IFTTT', '扣子', 'Power Automate'],
  '跨工具集成流': ['n8n', 'Zapier', 'Make', 'IFTTT', '扣子', 'Power Automate'],
  'AI助手型': ['扣子', 'OpenAI', 'Claude', '文心一言', 'Power Automate'],
  '数据处理型': ['扣子', 'OpenAI', 'Claude', '文心一言', 'Power Automate'],
  '决策支持型': ['扣子', 'OpenAI', 'Claude', '文心一言', 'Power Automate'],
  '工具入门': ['n8n', 'Zapier', 'Make', 'IFTTT', '扣子', 'OpenAI', 'Claude', '文心一言', 'Power Automate'],
  '场景案例': ['n8n', 'Zapier', 'Make', 'IFTTT', '扣子', 'OpenAI', 'Claude', '文心一言', 'Power Automate'],
  '故障排查': ['n8n', 'Zapier', 'Make', 'IFTTT', '扣子', 'OpenAI', 'Claude', '文心一言', 'Power Automate']
}



// 表单数据
const formData = reactive({
  contentType: '自动化工作流',
  title: '',
  platforms: [],
  scenes: [],
  attributes: [],
  description: '',
  templateLink: '',
  apiLink: '',
  repositoryLink: '',
  linkType: 'template',
  visibility: '公开',
  accessPassword: '',
  content: '',
  coverImage: '' // 新增封面图片字段
})

// 折叠状态
const collapsedSections = reactive({
  workflow: true,     // 工作流默认折叠
  agent: true,        // 智能体默认折叠
  tutorial: true,     // 教程默认折叠
  platforms: false,   // 必选项默认展开
  scenes: true,       // 非必选项默认折叠
  attributes: true,   // 非必选项默认折叠
  visibility: true    // 非必选项默认折叠
})

// 上传的文件
const uploadedFiles = ref([])

// 封面文件输入引用
const coverFileInput = ref(null)

// 编辑器实例
let vditor = null

// 草稿相关数据
const showModal = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')
const modalType = ref('alert') // alert, confirm
const modalConfirmText = ref('确定')
const modalCancelText = ref('取消')
let modalConfirmCallback = null
let modalCancelCallback = null

// 封面选择相关数据
const showCoverModal = ref(false)
const coverImageFile = ref(null)
const coverImagePreview = ref('')
const coverUploadStep = ref('upload') // upload, preview

// AI辅助相关数据
const showAITooltip = ref(false) // 气泡提示
const showAIPanel = ref(false)
const aiInputText = ref('')
const aiResult = ref('')
const aiError = ref('')
const aiLoading = ref(false)
const aiCurrentAction = ref(null) // 0=润色, 1=补充
let cursorIdleTimer = null
let tooltipTimer = null // 气泡提示定时器
let lastInputTime = 0
let lastCursorPosition = null
let isInputDetected = false
const DIFY_API_URL = 'https://dify.aipfuture.com/v1'
const DIFY_API_KEY = 'app-ubRloSwWqJJk4TIk1A6VndlS'

// 根据内容类型筛选平台
const filteredPlatforms = computed(() => {
  const category = platformCategories[formData.contentType] || []
  return category
})

// 表单验证
const isFormValid = computed(() => {
  const hasValidLink = () => {
    switch (formData.linkType) {
      case 'template':
        return formData.templateLink.trim()
      case 'api':
        return formData.apiLink.trim()
      case 'repository':
        return formData.repositoryLink.trim()
      default:
        return false
    }
  }
  
  return formData.title.trim() && 
         formData.platforms.length > 0 && 
         formData.description.trim() && 
         hasValidLink()
})

// 切换折叠状态
const toggleSection = (section) => {
  collapsedSections[section] = !collapsedSections[section]
}

// 初始化编辑器
onMounted(() => {
  // 确保DOM元素存在
  const vditorElement = document.getElementById('vditor')
  if (!vditorElement) {
    console.error('Vditor container not found')
    return
  }

  try {
    // 使用 nextTick 确保 DOM 完全渲染
    setTimeout(() => {
      vditor = new Vditor('vditor', {
        height: 800,
        placeholder: '请输入详细内容...',
        theme: 'classic',
        icon: 'material',
        // 默认所见即所得模式
        mode: 'wysiwyg',
        lang: 'zh_CN',
        toolbar: [
          'emoji',
          'headings',
          'bold',
          'italic',
          'strike',
          'link',
          '|',
          'list',
          'ordered-list',
          'check',
          'outdent',
          'indent',
          '|',
          'quote',
          'line',
          'code',
          'inline-code',
          '|',
          'table',
          '|',
          'undo',
          'redo',
          '|',
          'edit-mode',
          '|',
          'fullscreen',
          'preview'
        ],
        cache: {
          enable: false
        },
        input: (value) => {
          formData.content = value
          // 检测到输入，重置定时器
          handleEditorInput()
        },
        focus: (value) => {
          console.log('编辑器获得焦点', value)
          // 开始检测光标空闲
          startCursorIdleDetection()
        },
        blur: (value) => {
          console.log('编辑器失去焦点', value)
          // 停止检测
          stopCursorIdleDetection()
          // 隐藏AI气泡提示
          hideAITooltip()
        },
        upload: {
          accept: 'image/*',
          handler: (files) => {
            // 处理图片上传
            const file = files[0]
            if (file) {
              return new Promise((resolve) => {
                const reader = new FileReader()
                reader.onload = (e) => {
                  resolve([e.target.result])
                }
                reader.readAsDataURL(file)
              })
            }
          }
        },
        after: () => {
          // 在 Vditor 初始化完成后，绑定到内部可编辑区域
          bindEditorClipboardAndDnd()
          // 绑定编辑器事件用于检测光标位置
          setupCursorDetection()
        }
      })
      
      // 兜底：延时再绑定一次，避免极端情况下未获取到内部元素
      setTimeout(() => {
        bindEditorClipboardAndDnd()
        // 同时设置光标检测
        setupCursorDetection()
      }, 500)
    }, 100)
    
    // 兜底：延时再绑定一次，避免极端情况下未获取到内部元素
    setTimeout(() => {
      bindEditorClipboardAndDnd()
      // 同时设置光标检测
      setupCursorDetection()
    }, 500)
  } catch (error) {
    console.error('Vditor 初始化失败:', error)
  }
})

// 组件销毁时清理编辑器
onUnmounted(() => {
  // 清理AI检测定时器
  stopCursorIdleDetection()
  // 清理气泡提示定时器
  if (tooltipTimer) {
    clearTimeout(tooltipTimer)
    tooltipTimer = null
  }
  
  if (vditor) {
    vditor.destroy()
    vditor = null
  }
  // 清理编辑区事件监听
  unbindEditorClipboardAndDnd()
})

// 文件上传相关方法
const triggerFileInput = () => {
  fileInput.value.click()
}

const handleDragOver = (event) => {
  event.preventDefault()
  event.currentTarget.style.borderColor = '#007bff'
  event.currentTarget.style.backgroundColor = 'rgba(0,123,255,0.05)'
}

const handleDragLeave = (event) => {
  event.currentTarget.style.borderColor = '#ddd'
  event.currentTarget.style.backgroundColor = 'transparent'
}

const handleDrop = (event) => {
  event.preventDefault()
  event.currentTarget.style.borderColor = '#ddd'
  event.currentTarget.style.backgroundColor = 'transparent'
  
  if (event.dataTransfer.files.length) {
    const files = event.dataTransfer.files
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && 
      ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'].includes(file.type)
    )
    
    if (imageFiles.length > 0) {
      // 如果有图片文件，直接插入到编辑器中
      insertImagesToEditor(imageFiles)
    } else {
      // 非图片文件，按原逻辑处理
      processFiles(files)
    }
  }
}

// 编辑区粘贴/拖拽图片（直达编辑器）
let boundEditorEl = null

const getVditorEditableEl = () => {
  try {
    if (!vditor || !vditor.vditor) return null
    // wysiwyg 优先，其次 ir/sv
    return (
      (vditor.vditor.wysiwyg && vditor.vditor.wysiwyg.element) ||
      (vditor.vditor.ir && vditor.vditor.ir.element) ||
      (vditor.vditor.sv && vditor.vditor.sv.element) ||
      null
    )
  } catch (e) {
    return null
  }
}

const bindEditorClipboardAndDnd = () => {
  const el = getVditorEditableEl()
  if (!el || el === boundEditorEl) return
  unbindEditorClipboardAndDnd()
  el.addEventListener('paste', editorPasteHandler)
  el.addEventListener('drop', editorDropHandler)
  el.addEventListener('dragover', editorDragOverHandler)
  boundEditorEl = el
}

const unbindEditorClipboardAndDnd = () => {
  if (!boundEditorEl) return
  boundEditorEl.removeEventListener('paste', editorPasteHandler)
  boundEditorEl.removeEventListener('drop', editorDropHandler)
  boundEditorEl.removeEventListener('dragover', editorDragOverHandler)
  boundEditorEl = null
}

const editorPasteHandler = (event) => {
  const clipboard = event.clipboardData || window.clipboardData
  if (!clipboard) return
  const files = clipboard.files && clipboard.files.length ? clipboard.files : null
  const items = clipboard.items || []
  const imageFiles = []
  if (files) {
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      if (f && f.type && f.type.startsWith('image/')) imageFiles.push(f)
    }
  } else {
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item && item.type && item.type.startsWith('image/')) {
        const file = item.getAsFile && item.getAsFile()
        if (file) imageFiles.push(file)
      }
    }
  }
  if (imageFiles.length > 0) {
    event.preventDefault()
    insertImagesToEditor(imageFiles)
  }
}

const editorDropHandler = (event) => {
  event.preventDefault()
  const dt = event.dataTransfer
  if (!dt) return
  const files = dt.files
  if (!files || files.length === 0) return
  const imageFiles = Array.from(files).filter(file => 
    file.type && file.type.startsWith('image/') &&
    ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'].includes(file.type)
  )
  if (imageFiles.length > 0) {
    insertImagesToEditor(imageFiles)
  }
}

const editorDragOverHandler = (event) => {
  event.preventDefault()
}

const handleFileSelect = (event) => {
  if (event.target.files.length) {
    const files = event.target.files
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && 
      ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'].includes(file.type)
    )
    
    if (imageFiles.length > 0) {
      // 如果有图片文件，直接插入到编辑器中
      insertImagesToEditor(imageFiles)
    } else {
      // 非图片文件，按原逻辑处理
      processFiles(files)
    }
  }
}

const processFiles = (files) => {
  const newFiles = Array.from(files).slice(0, 5 - uploadedFiles.value.length)
  
  newFiles.forEach(file => {
    if (file.size > 5 * 1024 * 1024) {
      alert(`文件 ${file.name} 超过5MB限制`)
      return
    }
    
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'].includes(file.type)) {
      alert(`文件 ${file.name} 格式不支持`)
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedFiles.value.push({
        file: file,
        name: file.name,
        preview: e.target.result
      })
    }
    reader.readAsDataURL(file)
  })
}

const removeFile = (index) => {
  uploadedFiles.value.splice(index, 1)
}

// 弹窗相关方法
const showAlert = (title, message, confirmText = '确定') => {
  modalTitle.value = title
  modalMessage.value = message
  modalType.value = 'alert'
  modalConfirmText.value = confirmText
  showModal.value = true
  
  return new Promise((resolve) => {
    modalConfirmCallback = resolve
  })
}

const showConfirm = (title, message, confirmText = '确定', cancelText = '取消') => {
  modalTitle.value = title
  modalMessage.value = message
  modalType.value = 'confirm'
  modalConfirmText.value = confirmText
  modalCancelText.value = cancelText
  showModal.value = true
  
  return new Promise((resolve) => {
    modalConfirmCallback = () => resolve(true)
    modalCancelCallback = () => resolve(false)
  })
}

const closeModal = () => {
  showModal.value = false
  modalConfirmCallback = null
  modalCancelCallback = null
}

const handleConfirmAction = () => {
  if (modalConfirmCallback) {
    modalConfirmCallback()
  }
  closeModal()
}

const handleCancelAction = () => {
  if (modalCancelCallback) {
    modalCancelCallback()
  }
  closeModal()
}

const handleModalOverlayClick = () => {
  closeModal()
}

// 草稿相关方法
const saveDraft = async () => {
  try {
    // 构建草稿数据，使用与发布相同的结构
    const draftData = {
      article_title: formData.title,
      description: formData.description,
      content: vditor ? vditor.getValue() : '',
      
      // 链接信息
      link_type: formData.linkType,
      template_link: formData.templateLink,
      api_link: formData.apiLink,
      repository_link: formData.repositoryLink,
      
      // 平台信息
      platforms: formData.platforms,
      
      // 将内容类型、应用场景、属性、可见范围打包成JSON
      tags: JSON.stringify({
        content_type: formData.contentType,
        scenes: formData.scenes,
        attributes: formData.attributes,
        visibility: formData.visibility,
        access_password: formData.accessPassword
      }),
      
      // 上传的文件信息
      uploaded_files: uploadedFiles.value.map(file => ({
        name: file.name,
        preview: file.preview
      })),
      
      timestamp: new Date().getTime()
    }
    
    // 检查数据大小（限制5MB）
    const dataSize = new Blob([JSON.stringify(draftData)]).size
    if (dataSize > 5 * 1024 * 1024) {
      await showAlert('存储失败', '草稿数据超过5MB限制，请减少图片数量或大小')
      return
    }
    
    localStorage.setItem('edit_draft', JSON.stringify(draftData))
    await showAlert('保存成功', '草稿已成功保存到本地')
    
  } catch (error) {
    console.error('保存草稿失败:', error)
    await showAlert('保存失败', '草稿保存失败，请重试')
  }
}

const loadDraft = () => {
  try {
    const draftData = localStorage.getItem('edit_draft')
    if (draftData) {
      const parsedData = JSON.parse(draftData)
      
      // 恢复表单数据（新结构）
      formData.title = parsedData.article_title || ''
      formData.description = parsedData.description || ''
      formData.content = parsedData.content || ''
      
      // 恢复链接信息
      formData.linkType = parsedData.link_type || 'template'
      formData.templateLink = parsedData.template_link || ''
      formData.apiLink = parsedData.api_link || ''
      formData.repositoryLink = parsedData.repository_link || ''
      
      // 恢复平台信息
      formData.platforms = parsedData.platforms || []
      
      // 恢复tags中的配置信息
      if (parsedData.tags) {
        const tags = JSON.parse(parsedData.tags)
        formData.contentType = tags.content_type || '自动化工作流'
        formData.scenes = tags.scenes || []
        formData.attributes = tags.attributes || []
        formData.visibility = tags.visibility || '公开'
        formData.accessPassword = tags.access_password || ''
      }
      
      // 恢复编辑器内容
      if (vditor && parsedData.content) {
        vditor.setValue(parsedData.content)
      }
      
      // 恢复上传的文件
      if (parsedData.uploaded_files) {
        uploadedFiles.value = parsedData.uploaded_files
      }
      
      return true
    }
  } catch (error) {
    console.error('加载草稿失败:', error)
  }
  return false
}

const clearDraft = () => {
  localStorage.removeItem('edit_draft')
}

// 检查是否有草稿数据
const hasDraft = () => {
  return !!localStorage.getItem('edit_draft')
}

// 页面离开提示
const setupBeforeUnload = () => {
  const handleBeforeUnload = async (e) => {
    if (hasDraft()) {
      e.preventDefault()
      e.returnValue = ''
      
      const confirmed = await showConfirm(
        '离开页面提示',
        '您有未保存的草稿，确定要离开吗？离开后将丢失草稿数据。',
        '确定离开',
        '继续编辑'
      )
      
      if (confirmed) {
        clearDraft()
      } else {
        // 阻止页面离开
        return false
      }
    }
  }
  
  window.addEventListener('beforeunload', handleBeforeUnload)
  
  // 清理函数
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
}

// 页面加载时检查草稿
const checkDraftOnLoad = async () => {
  if (hasDraft()) {
    const confirmed = await showConfirm(
      '恢复草稿',
      '检测到上次编辑的草稿，是否恢复？',
      '恢复草稿',
      '重新开始'
    )
    
    if (confirmed) {
      loadDraft()
      await showAlert('恢复成功', '草稿已成功恢复')
    } else {
      const confirmedCancel = await showConfirm(
        '确认取消',
        '取消后将失去草稿数据，确认吗？',
        '确认取消',
        '重新考虑'
      )
      
      if (confirmedCancel) {
        clearDraft()
        await showAlert('已清除', '草稿数据已清除')
      } else {
        // 用户重新考虑，再次询问是否恢复
        checkDraftOnLoad()
      }
    }
  }
}

// 发布处理
const handleSubmit = async () => {
  if (!isFormValid.value) {
    await showAlert('发布失败', '请填写完整的必填信息')
    return
  }
  
  const confirmed = await showConfirm(
    '确认发布',
    '确定要发布此内容吗？发布后将对其他用户可见。',
    '确认发布',
    '再检查一下'
  )
  
  if (confirmed) {
    // 显示封面选择弹窗
    showCoverModal.value = true
  }
}

// 封面选择相关函数
const triggerCoverUpload = () => {
  if (coverFileInput.value) {
    coverFileInput.value.click()
  }
}

const handleCoverFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    // 检查文件类型和大小
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp', 'image/bmp'].includes(file.type)) {
      showAlert('格式错误', '请选择JPG、PNG、GIF、WebP或BMP格式的图片')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      showAlert('文件过大', '封面图片不能超过5MB')
      return
    }
    
    // 读取文件并显示预览
    const reader = new FileReader()
    reader.onload = (e) => {
      coverImageFile.value = file
      coverImagePreview.value = e.target.result
      coverUploadStep.value = 'preview'
    }
    reader.readAsDataURL(file)
  }
}

const resetCoverUpload = () => {
  coverImageFile.value = null
  coverImagePreview.value = ''
  coverUploadStep.value = 'upload'
  
  // 清空文件输入
  if (coverFileInput.value) {
    coverFileInput.value.value = ''
  }
}

const nextStep = () => {
  if (coverImagePreview.value) {
    coverUploadStep.value = 'preview'
  }
}

const skipCover = async () => {
  // 跳过封面，直接发布
  await publishArticle()
}

const confirmCover = async () => {
  // 确认封面，发布文章
  await publishArticle()
}

const closeCoverModal = () => {
  showCoverModal.value = false
  resetCoverUpload()
}

const handleCoverModalOverlayClick = () => {
  closeCoverModal()
}

// 上传封面图片到 Supabase Storage（适配自定义认证）
const uploadCoverImage = async (file) => {
  if (!file) return null
  
  try {
    // 清理文件名，只保留英文字母、数字、下划线和连字符
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    
    // 生成唯一的文件名，包含用户ID（如果可用）
    const currentUser = authStore.user
    const userId = currentUser?.id || 'anonymous'
    const fileName = `covers/${userId}/${Date.now()}_${cleanFileName}`
    
    console.log('开始上传封面图片:', fileName)
    
    // 使用当前Supabase客户端上传（存储桶策略已设置为宽松）
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      console.error('封面图片上传失败:', error)
      
      // 检查存储桶是否存在
      const bucketExists = await checkStorageBucketExists()
      if (!bucketExists) {
        throw new Error('存储桶配置缺失，请先运行数据库迁移脚本创建images存储桶')
      }
      
      // 如果是权限错误，提示用户检查存储桶策略
      if (error.message.includes('row-level security') || error.message.includes('permission')) {
        throw new Error('上传权限错误，请确保存储桶策略允许匿名上传')
      }
      
      throw new Error('封面图片上传失败: ' + error.message)
    }
    
    console.log('封面图片上传成功:', data)
    
    // 获取公开访问URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName)
    
    console.log('封面图片公开URL:', publicUrl)
    
    // 直接返回图片URL，不包装成HTML标签
    return publicUrl
  } catch (error) {
    console.error('封面图片处理失败:', error)
    throw error
  }
}

// 检查存储桶是否存在
const checkStorageBucketExists = async () => {
  try {
    // 尝试列出存储桶内容来验证存储桶是否存在
    const { data, error } = await supabase.storage
      .from('images')
      .list('covers', { limit: 1 })
    
    // 如果没有错误或者错误不是"存储桶不存在"，则认为存储桶存在
    if (!error || (error && !error.message.includes('bucket'))) {
      return true
    }
    
    return false
  } catch (error) {
    console.error('检查存储桶失败:', error)
    return false
  }
}

// 实际发布文章的函数
const publishArticle = async () => {
  try {
    // 保存编辑器内容到表单
    if (vditor) {
      formData.content = vditor.getValue()
    }
    
    // 上传封面图片（如果有）
    let coverImageUrl = null
    if (coverImageFile.value) {
      coverImageUrl = await uploadCoverImage(coverImageFile.value)
    }
    
    // 构建文章数据
    const articleData = {
      article_title: formData.title, // 文章标题
      description: formData.description, // 简介
      content: formData.content, // 文章内容
      
      // 链接信息
      link_type: formData.linkType,
      template_link: formData.templateLink,
      api_link: formData.apiLink,
      repository_link: formData.repositoryLink,
      
      // 平台信息
      platforms: formData.platforms,
      
      // 封面图片URL
      cover_image: coverImageUrl,
      
      // 将内容类型、应用场景、属性、可见范围打包成JSON存到tags字段
      tags: JSON.stringify({
        content_type: formData.contentType, // 内容类型
        scenes: formData.scenes, // 应用场景
        attributes: formData.attributes, // 属性
        visibility: formData.visibility, // 可见范围
        access_password: formData.accessPassword // 访问密码（如果有）
      }),
      
      // 上传的文件信息
      uploaded_files: uploadedFiles.value.map(file => ({
        name: file.name,
        preview: file.preview
      })),
      
      // 用户信息
      user_id: getCurrentUserId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // 保存到数据库
    const { data, error } = await supabase
      .from('articles')
      .insert([articleData])
      .select()
    
    if (error) {
      console.error('保存文章失败:', error)
      throw new Error('保存文章失败: ' + error.message)
    }
    
    console.log('文章保存成功:', data)
    
    // 清除草稿
    clearDraft()
    
    // 关闭封面弹窗
    closeCoverModal()    
    await showAlert('发布成功', '内容已成功发布并保存到数据库')
    
    // 跳转到市场页面
    router.push('/market')
    
  } catch (error) {
    console.error('发布失败:', error)
    await showAlert('发布失败', error.message || '发布过程中出现错误，请重试')
  }
}

// 取消编辑
const handleCancel = async () => {
  const confirmed = await showConfirm(
    '确认取消',
    '确定要取消编辑吗？未保存的内容将丢失。',
    '确定取消',
    '继续编辑'
  )
  
  if (confirmed) {
    clearDraft()
    router.push('/market')
  }
}

// 组件挂载时
onMounted(() => {
  // 设置页面离开监听
  setupBeforeUnload()
  
  // 延迟检查草稿，确保编辑器已初始化
  setTimeout(() => {
    checkDraftOnLoad()
  }, 500)
})

// 获取当前用户ID
const getCurrentUserId = () => {
  // 首先尝试从authStore获取
  if (authStore.user && authStore.user.id) {
    return authStore.user.id
  }
  
  // 如果store中没有用户信息，尝试从localStorage获取
  const savedUser = localStorage.getItem('currentUser')
  if (savedUser) {
    try {
      const userData = JSON.parse(savedUser)
      if (userData && userData.id) {
        return userData.id
      }
    } catch (error) {
      console.error('解析用户数据失败:', error)
    }
  }
  
  // 如果都没有，返回一个有效的用户ID（使用数据库中的admin用户ID）
  console.warn('无法获取当前用户ID，使用默认用户ID')
  return 'dcdd4de9-66a1-4a6b-8b58-3c3324d7b1b4' // admin用户的ID
}

// AI辅助功能相关方法
const startCursorIdleDetection = () => {
  stopCursorIdleDetection()
  
  // 清除之前的定时器
  if (cursorIdleTimer) {
    clearTimeout(cursorIdleTimer)
  }
  
  // 重置输入检测
  isInputDetected = false
  lastInputTime = Date.now()
  
  // 获取初始光标位置
  updateCursorPosition()
  
  // 设置2秒后检测
  cursorIdleTimer = setTimeout(() => {
    checkCursorIdle()
  }, 2000)
}

const stopCursorIdleDetection = () => {
  if (cursorIdleTimer) {
    clearTimeout(cursorIdleTimer)
    cursorIdleTimer = null
  }
  hideAITooltip()
}

const handleEditorInput = () => {
  const now = Date.now()
  lastInputTime = now
  isInputDetected = true
  hideAITooltip() // 输入后隐藏气泡提示
  // 输入后立即隐藏提示，并重新开始检测
  stopCursorIdleDetection()
  // 延迟重新开始检测，避免频繁触发
  setTimeout(() => {
    isInputDetected = false
    startCursorIdleDetection()
  }, 100)
}

const updateCursorPosition = () => {
  try {
    if (!vditor) return
    
    const editableEl = getVditorEditableEl()
    if (!editableEl) return
    
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      lastCursorPosition = {
        startContainer: range.startContainer,
        startOffset: range.startOffset,
        endContainer: range.endContainer,
        endOffset: range.endOffset
      }
    }
  } catch (error) {
    console.error('更新光标位置失败:', error)
  }
}

const checkCursorIdle = () => {
  const now = Date.now()
  const timeSinceLastInput = now - lastInputTime
  
  // 如果2秒内没有输入，且编辑器仍然有焦点，显示AI气泡提示
  if (timeSinceLastInput >= 2000) {
    const editableEl = getVditorEditableEl()
    if (editableEl && (document.activeElement === editableEl || editableEl.contains(document.activeElement))) {
      // 检查当前是否有选中文本
      const selection = window.getSelection()
      const hasSelection = selection && selection.toString().trim().length > 0
      
      // 只有当没有选中文本时才显示AI气泡提示（避免干扰用户选择）
      if (!hasSelection && !showAIPanel.value) {
        showAITooltip.value = true
        // 5秒后自动隐藏气泡提示
        if (tooltipTimer) {
          clearTimeout(tooltipTimer)
        }
        tooltipTimer = setTimeout(() => {
          hideAITooltip()
        }, 5000)
        return // 显示提示后不再继续检测
      }
    }
  }
  
  // 如果条件不满足，继续检测（但只在编辑器有焦点时）
  const editableEl = getVditorEditableEl()
  if (editableEl && (document.activeElement === editableEl || editableEl.contains(document.activeElement))) {
    startCursorIdleDetection()
  }
}

// 隐藏AI气泡提示
const hideAITooltip = () => {
  showAITooltip.value = false
  if (tooltipTimer) {
    clearTimeout(tooltipTimer)
    tooltipTimer = null
  }
}

const setupCursorDetection = () => {
  const editableEl = getVditorEditableEl()
  if (!editableEl) {
    // 如果还没有可编辑元素，延迟重试
    setTimeout(setupCursorDetection, 300)
    return
  }
  
  // 监听键盘输入（包括中文输入法的composition事件）
  editableEl.addEventListener('input', () => {
    handleEditorInput()
  })
  
  // 监听中文输入法的composition事件
  editableEl.addEventListener('compositionend', () => {
    handleEditorInput()
  })
  
  // 监听键盘按键释放
  editableEl.addEventListener('keyup', (e) => {
    // 排除功能键，只关注可输入字符
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
      updateCursorPosition()
      // 重置检测，重新开始计时
      isInputDetected = false
      lastInputTime = Date.now()
      startCursorIdleDetection()
    }
  })
  
  // 监听点击事件
  editableEl.addEventListener('click', () => {
    updateCursorPosition()
    // 点击后重置检测
    isInputDetected = false
    lastInputTime = Date.now()
    startCursorIdleDetection()
  })
  
  // 监听鼠标释放（可能是拖拽选择后的释放）
  editableEl.addEventListener('mouseup', () => {
    updateCursorPosition()
    // 鼠标释放后重置检测
    isInputDetected = false
    lastInputTime = Date.now()
    startCursorIdleDetection()
  })
  
  // 监听键盘按键按下（用于更精确的输入检测）
  editableEl.addEventListener('keydown', (e) => {
    // 如果是可输入字符，立即标记为有输入
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      isInputDetected = true
      lastInputTime = Date.now()
      hideAITooltip()
    }
  })
}

const toggleAIAssistant = () => {
  hideAITooltip() // 点击按钮时隐藏气泡提示
  showAIPanel.value = !showAIPanel.value
  if (showAIPanel.value) {
    // 如果编辑器中有选中的文本，自动填入
    try {
      const selection = window.getSelection()
      if (selection && selection.toString().trim()) {
        aiInputText.value = selection.toString().trim()
      }
    } catch (error) {
      console.error('获取选中文本失败:', error)
    }
  } else {
    // 关闭面板时，如果用户重新开始编辑，重新开始检测
    setTimeout(() => {
      if (!showAIPanel.value) {
        startCursorIdleDetection()
      }
    }, 500)
  }
}

const closeAIPanel = () => {
  showAIPanel.value = false
  aiInputText.value = ''
  aiResult.value = ''
  aiError.value = ''
  aiLoading.value = false
  aiCurrentAction.value = null
}

const handleAIAction = async (action) => {
  if (!aiInputText.value.trim()) {
    aiError.value = '请输入需要处理的文本'
    return
  }
  
  aiLoading.value = true
  aiCurrentAction.value = action // action 是数字：0=润色, 1=补充
  aiError.value = ''
  aiResult.value = ''
  
  try {
    // 获取当前用户ID（用于Dify API的user参数）
    const currentUser = authStore.user
    const userId = currentUser?.id || getCurrentUserId() || 'anonymous'
    
    // 调用Dify工作流API
    let response = await fetch(`${DIFY_API_URL}/workflows/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DIFY_API_KEY}`
      },
      body: JSON.stringify({
        inputs: {
          input: aiInputText.value.trim(),
          choose: action // 0=润色, 1=补充
        },
        user: userId, // 添加user参数，这是Dify API要求的
        response_mode: 'blocking' // 阻塞模式，等待结果返回
      })
    })
    
    // 如果第一个端点失败，尝试使用chat-messages端点
    if (!response.ok && response.status === 404) {
      response = await fetch(`${DIFY_API_URL}/chat-messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DIFY_API_KEY}`
        },
        body: JSON.stringify({
          inputs: {
            input: aiInputText.value.trim(),
            choose: action // 0=润色, 1=补充
          },
          user: userId, // 添加user参数
          query: aiInputText.value.trim(),
          response_mode: 'blocking'
        })
      })
    }
    
    if (!response.ok) {
      let errorMessage = `API请求失败: ${response.status} ${response.statusText}`
      // 克隆响应以便读取
      const responseClone = response.clone()
      try {
        const errorData = await responseClone.json()
        console.error('API错误响应:', errorData)
        // 尝试从错误响应中提取更详细的错误信息
        if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        } else if (typeof errorData === 'string') {
          errorMessage = errorData
        }
      } catch (e) {
        // 如果无法解析为JSON，尝试读取文本
        try {
          const errorText = await response.text()
          console.error('API错误响应（文本）:', errorText)
          if (errorText) {
            // 尝试解析JSON字符串
            try {
              const parsedError = JSON.parse(errorText)
              if (parsedError.message) {
                errorMessage = parsedError.message
              } else {
                errorMessage = errorText
              }
            } catch {
              errorMessage = errorText
            }
          }
        } catch (textError) {
          console.error('读取错误响应失败:', textError)
        }
      }
      throw new Error(errorMessage)
    }
    
    const data = await response.json()
    console.log('API响应数据:', data)
    
    // 处理返回结果 - 支持多种可能的响应格式
    let result = ''
    
    // 格式1: data.outputs.xxx
    if (data.data && data.data.outputs) {
      const outputs = data.data.outputs
      // 尝试常见的输出字段名
      result = outputs.output || outputs.text || outputs.result || outputs.content || outputs.message
      
      // 如果还是没有，获取第一个字符串值
      if (!result) {
        for (const key in outputs) {
          if (typeof outputs[key] === 'string') {
            result = outputs[key]
            break
          }
        }
      }
      
      // 如果还是没有，尝试序列化整个outputs对象
      if (!result) {
        result = JSON.stringify(outputs, null, 2)
      }
    }
    // 格式2: 直接在data中
    else if (data.data) {
      result = data.data.output || data.data.text || data.data.result || data.data.content || data.data.message
      if (!result && typeof data.data === 'string') {
        result = data.data
      }
    }
    // 格式3: 在根级别
    else if (data.output || data.text || data.result || data.content || data.message) {
      result = data.output || data.text || data.result || data.content || data.message
    }
    // 格式4: answer字段（常见于chat API）
    else if (data.answer) {
      result = data.answer
    }
    // 格式5: 如果是字符串直接返回
    else if (typeof data === 'string') {
      result = data
    }
    // 格式6: 尝试从event流中获取（如果是流式响应）
    else if (data.event && data.event === 'message' && data.answer) {
      result = data.answer
    }
    // 最后：序列化整个响应
    else {
      result = JSON.stringify(data, null, 2)
    }
    
    if (!result || result.trim() === '') {
      aiError.value = 'AI返回了空结果，请检查工作流配置或重试'
    } else {
      aiResult.value = result
    }
    
  } catch (error) {
    console.error('AI处理失败:', error)
    aiError.value = `处理失败: ${error.message}。请检查网络连接和API配置。`
  } finally {
    aiLoading.value = false
    aiCurrentAction.value = null
  }
}

const insertAIResult = () => {
  if (!aiResult.value || !vditor) return
  
  try {
    // 插入结果到编辑器当前光标位置
    vditor.insertValue(aiResult.value)
    // 清空结果
    aiResult.value = ''
    aiInputText.value = ''
    showAIPanel.value = false
  } catch (error) {
    console.error('插入结果失败:', error)
    aiError.value = '插入结果失败，请重试'
  }
}

const copyAIResult = async () => {
  if (!aiResult.value) return
  
  try {
    await navigator.clipboard.writeText(aiResult.value)
    // 显示成功提示
    const originalError = aiError.value
    aiError.value = '✓ 已复制到剪贴板'
    // 2秒后清除提示
    setTimeout(() => {
      if (aiError.value === '✓ 已复制到剪贴板') {
        aiError.value = originalError
      }
    }, 2000)
  } catch (error) {
    console.error('复制失败:', error)
    aiError.value = '复制失败，请手动复制文本'
  }
}

const clearAIResult = () => {
  aiResult.value = ''
  aiInputText.value = ''
  aiError.value = ''
}

// 将图片插入到编辑器中
const insertImagesToEditor = async (files) => {
  if (!vditor) return
  
  const imageFiles = Array.from(files).slice(0, 5) // 限制最多5张图片
  
  for (const file of imageFiles) {
    if (file.size > 5 * 1024 * 1024) {
      alert(`文件 ${file.name} 超过5MB限制`)
      continue
    }
    
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'].includes(file.type)) {
      alert(`文件 ${file.name} 格式不支持`)
      continue
    }
    
    try {
      // 使用 FileReader 读取图片并插入到编辑器中
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageDataUrl = e.target.result
        // 获取当前光标位置
        const cursorPosition = vditor.getCursorPosition()
        
        // 插入图片到编辑器
        vditor.insertValue(`
![${file.name}](${imageDataUrl})
`)
        
        console.log('图片插入成功:', file.name)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('图片插入失败:', error)
      alert(`图片 ${file.name} 插入失败，请重试`)
    }
  }
}

</script>

<style scoped>
@import '../css/detailView.css';
</style>