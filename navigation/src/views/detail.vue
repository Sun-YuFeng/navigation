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
import { useRouter, useRoute } from 'vue-router'
import { ref, onMounted, watch } from 'vue'
import { supabase, getCurrentUserId } from '../supabase.js'
import HotTopicsCard from '@/components/HotTopicsCard.vue'
import AuthorCard from '@/components/AuthorCard.vue'
import { markdownToHtml } from '../services/markdownToHtml.js'

const router = useRouter()
const route = useRoute()

// 文章详情数据
const article = ref(null)
const loading = ref(true)
const error = ref(null)

// 作者信息数据
const authorInfo = ref(null)
const authorId = ref('')


// 作者精选文章数据
const selectedWorks = ref([])
const selectedWorksLoading = ref(false)

// 相关链接数据
const relatedLinks = ref([])
const relatedLinksLoading = ref(false)

// 一键总结功能
const isSummarizing = ref(false)
const summaryResult = ref('')
const showSummaryCard = ref(false)

// 评论功能
const comments = ref([])
const commentsLoading = ref(false)
const commentContent = ref('')
const replyToComment = ref(null)
const replyContent = ref('')
const currentSort = ref('latest')
const showAllComments = ref(false)

// 当前用户头像
const currentUserAvatar = ref('https://picsum.photos/id/64/50/50') // 默认头像

// 获取当前用户头像
const getCurrentUserAvatar = async () => {
  try {
    const userId = getCurrentUserId()
    if (!userId) {
      // 未登录用户使用默认头像
      currentUserAvatar.value = 'https://picsum.photos/id/64/50/50'
      return
    }
    
    // 从数据库中获取用户头像
    const { data, error } = await supabase
      .from('user_profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.warn('获取用户头像失败:', error)
      // 使用默认头像
      currentUserAvatar.value = 'https://picsum.photos/id/64/50/50'
      return
    }
    
    if (data && data.avatar_url) {
      currentUserAvatar.value = data.avatar_url
    } else {
      // 用户没有设置头像，使用默认头像
      currentUserAvatar.value = 'https://picsum.photos/id/64/50/50'
    }
  } catch (err) {
    console.error('获取用户头像时出错:', err)
    currentUserAvatar.value = 'https://picsum.photos/id/64/50/50'
  }
}

// 处理返回按钮点击
const handleBack = () => {
  router.back()
}

// 根据文章ID获取文章详情
const fetchArticleDetail = async (articleId) => {
  try {
    loading.value = true
    error.value = null
    
    if (!articleId) {
      // 如果没有传递ID，使用默认数据
      article.value = {
        id: 'default',
        title: '如何在React项目中优雅地处理表单验证？分享几个实用技巧',
        author: {
          name: '张前端',
          avatar: 'https://picsum.photos/id/237/60/60',
          badge: '资深开发者'
        },
        publishTime: '2023年6月15日',
        readTime: '5分钟阅读',
        content: `
          <p>在现代前端开发中，表单验证是一个非常重要的环节。良好的表单验证不仅能提升用户体验，还能保证数据的准确性。今天我想分享几个在React项目中处理表单验证的实用技巧。</p>
          
          <h2>1. 选择合适的表单库</h2>
          <p>虽然原生React也可以处理表单，但使用成熟的表单库可以节省大量时间：</p>
          <ul>
            <li>Formik - 功能全面，API友好</li>
            <li>React Hook Form - 性能优秀，基于hooks</li>
            <li>Final Form - 高度可定制，适合复杂场景</li>
          </ul>
          
          <div class="code-block">
            <pre class="scrollbar-hide"><code>// React Hook Form 示例
import { useForm } from "react-hook-form";

function MyForm() {
  const { register, handleSubmit, errors } = useForm();
  const onSubmit = (data) => console.log(data);
  
  return (
    &lt;form onSubmit={handleSubmit(onSubmit)}&gt;
      &lt;input {...register("name", { required: true })} /&gt;
      {errors.name &amp;&amp; &lt;span&gt;This field is required&lt;/span&gt;}
      
      &lt;input type="submit" /&gt;
    &lt;/form&gt;
  );
}</code></pre>
          </div>
          
          <h2>2. 实时验证与提交前验证结合</h2>
          <p>实时验证可以及时给用户反馈，但过于频繁的验证可能会影响性能。建议：</p>
          <ol>
            <li>输入框失焦时进行验证</li>
            <li>提交前进行全量验证</li>
            <li>对于复杂验证，可以添加延迟防抖</li>
          </ol>
          
          <h2>3. 错误信息展示原则</h2>
          <p>良好的错误信息应该：</p>
          <ul>
            <li>位置靠近相关输入框</li>
            <li>使用明确的语言说明问题</li>
            <li>提供解决方案建议</li>
            <li>使用醒目的颜色（通常是红色）</li>
          </ul>
          
          <p>希望这些技巧能帮助你在React项目中更好地处理表单验证。如果你有其他好的方法，欢迎在评论区分享！</p>
        `,
        tags: ['React', '表单验证', '前端开发', 'JavaScript'],
        likes: 128,
        comments: 32,
        favorites: 89
      }
      loading.value = false
      return
    }
    
    // 从数据库获取文章详情，包括标题、内容、标签、平台等字段，同时关联查询用户信息
    const { data, error: dbError } = await supabase
      .from('articles')
      .select(`
        id, 
        article_title, 
        content, 
        tags, 
        platforms,
        description, 
        cover_image, 
        created_at, 
        view_count, 
        like_count, 
        favorite_count, 
        user_id,
        users!inner (
          user_profiles (
            display_name,
            avatar_url
          )
        )
      `)
      .eq('id', articleId)
      .single()
    
    if (dbError) {
      console.error('获取文章详情失败:', dbError)
      
      // 如果数据库中没有找到，尝试从mock数据中查找
      const mockData = await loadMockArticle(articleId)
      if (mockData) {
        article.value = mockData
      } else {
        error.value = '文章不存在'
      }
    } else {
      // 解析标签数据
      const parseTags = (tagsData) => {
        if (!tagsData) return []
        
        try {
          // 如果tags是JSON字符串，解析它
          if (typeof tagsData === 'string') {
            const parsed = JSON.parse(tagsData)
            return extractTagsFromObject(parsed)
          }
          // 如果tags已经是数组，直接返回
          if (Array.isArray(tagsData)) {
            return tagsData
          }
          // 如果tags是对象，提取标签
          if (typeof tagsData === 'object') {
            return extractTagsFromObject(tagsData)
          }
          return []
        } catch (error) {
          console.error('解析标签数据失败:', error)
          return []
        }
      }
      
      // 从对象中提取标签
      const extractTagsFromObject = (obj) => {
        const tags = []
        
        // 处理content_type字段
        if (obj.content_type) {
          tags.push(obj.content_type)
        }
        
        // 处理scenes数组字段
        if (Array.isArray(obj.scenes)) {
          tags.push(...obj.scenes)
        }
        
        // 处理attributes数组字段
        if (Array.isArray(obj.attributes)) {
          tags.push(...obj.attributes)
        }
        
        // 处理visibility字段
        if (obj.visibility) {
          tags.push(obj.visibility)
        }
        
        // 过滤掉空值
        return tags.filter(tag => tag && tag.trim() !== '')
      }
      
      const articleTags = parseTags(data.tags)
      
      // 获取用户信息
      const userProfile = data.users?.user_profiles || {}
      const avatarUrl = userProfile.avatar_url || '/src/assets/default.jpg'
      const userName = userProfile.display_name || '用户' + data.user_id.slice(0, 8)
      
      // 打印获取到的原始内容和转换后的内容
      console.log('=== 获取到的文章内容详情 ===')
      console.log('文章ID:', data.id)
      console.log('文章标题:', data.article_title)
      console.log('文章描述:', data.description)
      console.log('原始标签数据:', data.tags)
      console.log('解析后的标签:', articleTags)
      console.log('原始Markdown内容:')
      console.log(data.content)
      console.log('转换后的HTML内容:')
      console.log(markdownToHtml(data.content))
      console.log('封面图片:', data.cover_image)
      console.log('作者信息:', { userName, avatarUrl })
      console.log('发布时间:', data.created_at)
      console.log('============================')
      
      // 处理平台信息
      let platforms = []
      try {
        if (data.platforms) {
          // 数据库中的platforms字段已经是数组格式，不需要JSON.parse
          platforms = Array.isArray(data.platforms) ? data.platforms : []
        }
      } catch (e) {
        console.warn('处理platforms字段失败:', e)
      }
      
      article.value = {
        id: data.id,
        title: data.article_title || '文章标题',
        description: data.description || '',
        author: {
          name: userName,
          avatar: avatarUrl,
          badge: '作者'
        },
        publishTime: data.created_at ? new Date(data.created_at).toLocaleDateString('zh-CN') : '未知时间',
        readTime: '5分钟阅读',
        content: markdownToHtml(data.content) || '<p>文章内容加载中...</p>',
        tags: articleTags,
        platforms: platforms,
        likes: data.like_count || 0,
        comments: 0, // 暂时设为0，后续可以添加评论功能
        favorites: data.favorite_count || 0,
        coverImage: data.cover_image || null,
        viewCount: data.view_count || 0
      }
      
      // 获取作者详细信息
      await fetchAuthorInfo(data.user_id)
      
      // 获取作者精选文章（排除当前文章）
      await fetchSelectedWorks(data.user_id, data.id)
      
      // 获取相关链接
      await fetchRelatedLinks(data.id)
      
      // 获取评论数据
      await fetchComments(data.id)
    }
  } catch (err) {
    console.error('获取文章详情时出错:', err)
    error.value = '加载文章失败，请稍后重试'
  } finally {
    loading.value = false
    // 检查收藏状态
    await checkFavoriteStatus()
    // 检查点赞状态
    await checkLikeStatus()
  }
}

// 从mock数据中加载文章
const loadMockArticle = async (articleId) => {
  // 这里可以添加mock数据匹配逻辑
  // 暂时返回null，后续可以根据需要扩展
  return null
}

// 获取作者详细信息
const fetchAuthorInfo = async (userId) => {
  try {
    if (!userId) {
      console.warn('用户ID为空，使用默认作者信息')
      authorInfo.value = {
        name: '仔仔木',
        avatar: '/src/assets/default.jpg',
        bio: '个人简介：热爱技术分享，专注前端开发领域',
        articleCount: 37,
        likeCount: 1117,
        favoriteCount: 4286,
        followerCount: 667
      }
      // 设置作者ID
      authorId.value = ''
      return
    }
    
    // 设置作者ID
    authorId.value = userId
    
    // 从数据库获取用户详细信息 - 修正字段名
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('display_name, avatar_url, bio')
      .eq('id', userId)  // 使用 id 字段来匹配 user_profiles 表
      .single()
    
    if (profileError) {
      console.error('获取用户资料失败:', profileError)
      // 使用默认信息
      authorInfo.value = {
        name: '用户' + userId.slice(0, 8),
        avatar: '/src/assets/default.jpg',
        bio: '个人简介：热爱技术分享，专注前端开发领域',
        articleCount: 37,
        likeCount: 1117,
        favoriteCount: 4286,
        followerCount: 667
      }
      return
    }
    
    // 获取用户的文章数量
    const { data: articlesData, error: articlesError } = await supabase
      .from('articles')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
    
    // 获取用户的统计数据（点赞数、收藏数、粉丝数）
    // 这里暂时使用默认值，后续可以根据实际需求实现
    
    authorInfo.value = {
      name: userProfile.display_name || '用户' + userId.slice(0, 8),
      avatar: userProfile.avatar_url || '/src/assets/default.jpg',
      bio: userProfile.bio || '个人简介：热爱技术分享，专注前端开发领域',
      articleCount: articlesData ? articlesData.length : 37,
      likeCount: 1117, // 暂时使用默认值
      favoriteCount: 4286, // 暂时使用默认值
      followerCount: 667 // 暂时使用默认值
    }
    
    console.log('获取到的作者信息:', authorInfo.value)
    
  } catch (err) {
    console.error('获取作者信息时出错:', err)
    // 出错时使用默认信息
    authorInfo.value = {
      name: '仔仔木',
      avatar: '/src/assets/default.jpg',
      bio: '个人简介：热爱技术分享，专注前端开发领域',
      articleCount: 37,
      likeCount: 1117,
      favoriteCount: 4286,
      followerCount: 667
    }
  }
}

// 获取作者精选文章
const fetchSelectedWorks = async (userId, currentArticleId = null) => {
  try {
    selectedWorksLoading.value = true
    
    if (!userId) {
      console.warn('用户ID为空，使用默认精选文章')
      selectedWorks.value = [
        {
          id: '1',
          title: '【数据结构】树与二叉树的基本概念及性质',
          viewCount: 1389,
          isNew: true,
          isHot: false,
          tagLabel: '新'
        },
        {
          id: '2', 
          title: '【计算机组成原理】：计算机系统概述',
          viewCount: 1371,
          isNew: true,
          isHot: false,
          tagLabel: '新'
        },
        {
          id: '3',
          title: '水仙花数（3位水仙花、100-999之内的所有水仙花、三位及以上水仙花）',
          viewCount: 75613,
          isNew: false,
          isHot: true,
          tagLabel: '热'
        },
        {
          id: '4',
          title: '【数据结构】：单链表之头插法和尾插法（动图+图解）',
          viewCount: 73118,
          isNew: false,
          isHot: true,
          tagLabel: '热'
        },
        {
          id: '5',
          title: '求二维数组每一列（行）上的最大值(Java)',
          viewCount: 14685,
          isNew: false,
          isHot: true,
          tagLabel: '热'
        }
      ]
      selectedWorksLoading.value = false
      return
    }
    
    // 从数据库获取作者的其他文章，按点赞量排序，排除当前文章
    let query = supabase
      .from('articles')
      .select('id, article_title, view_count, like_count, created_at')
      .eq('user_id', userId)
      .order('like_count', { ascending: false })
      .limit(5)
    
    // 如果当前文章ID存在，排除当前文章
    if (currentArticleId) {
      query = query.neq('id', currentArticleId)
    }
    
    const { data: worksData, error: worksError } = await query
    
    if (worksError) {
      console.error('获取作者精选文章失败:', worksError)
      // 使用默认数据
      selectedWorks.value = [
        {
          id: '1',
          title: '【数据结构】树与二叉树的基本概念及性质',
          viewCount: 1389,
          isNew: true,
          isHot: false,
          tagLabel: '新'
        },
        {
          id: '2', 
          title: '【计算机组成原理】：计算机系统概述',
          viewCount: 1371,
          isNew: true,
          isHot: false,
          tagLabel: '新'
        },
        {
          id: '3',
          title: '水仙花数（3位水仙花、100-999之内的所有水仙花、三位及以上水仙花）',
          viewCount: 75613,
          isNew: false,
          isHot: true,
          tagLabel: '热'
        },
        {
          id: '4',
          title: '【数据结构】：单链表之头插法和尾插法（动图+图解）',
          viewCount: 73118,
          isNew: false,
          isHot: true,
          tagLabel: '热'
        },
        {
          id: '5',
          title: '求二维数组每一列（行）上的最大值(Java)',
          viewCount: 14685,
          isNew: false,
          isHot: true,
          tagLabel: '热'
        }
      ]
      selectedWorksLoading.value = false
      return
    }
    
    if (worksData && worksData.length > 0) {
      // 处理获取到的文章数据
      selectedWorks.value = worksData.map(work => {
        // 判断文章标签（新/热）
        const now = new Date()
        const createdDate = new Date(work.created_at)
        const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24))
        
        const isNew = daysDiff <= 7 // 7天内为新文章
        const isHot = work.like_count > 100 || work.view_count > 1000 // 点赞超过100或阅读超过1000为热门
        
        return {
          id: work.id,
          title: work.article_title || '文章标题',
          viewCount: work.view_count || 0,
          isNew,
          isHot,
          tagLabel: isNew ? '新' : (isHot ? '热' : '推荐')
        }
      })
      
      console.log('获取到的作者精选文章:', selectedWorks.value)
    } else {
      selectedWorks.value = []
    }
    
  } catch (err) {
    console.error('获取作者精选文章时出错:', err)
    selectedWorks.value = []
  } finally {
    selectedWorksLoading.value = false
  }
}

// 获取评论数据（使用优化后的索引）
const fetchComments = async (articleId) => {
  try {
    commentsLoading.value = true
    
    if (!articleId || articleId === 'default') {
      console.warn('文章ID为空或默认，返回空评论列表')
      comments.value = []
      commentsLoading.value = false
      return
    }
    
    // 使用优化的查询从数据库获取评论数据
    // 查询帖子的一级评论（parent_id为null或不存在）
    const { data: topLevelCommentsData, error: topLevelError } = await supabase
      .from('comment_details')
      .select('*')
      .eq('post_id', articleId)
      .eq('is_deleted', false)
      .is('parent_id', null)
      .order('created_at', { ascending: false })
    
    if (topLevelError) {
      console.error('获取一级评论失败:', topLevelError)
      comments.value = []
      return
    }
    
    // 获取所有回复评论
    const { data: replyCommentsData, error: replyError } = await supabase
      .from('comment_details')
      .select('*')
      .eq('post_id', articleId)
      .eq('is_deleted', false)
      .not('parent_id', 'is', null)
      .order('created_at', { ascending: true })
    
    if (replyError) {
      console.error('获取回复评论失败:', replyError)
      // 继续处理一级评论，只是没有回复
    }
    
    // 构建评论树结构
    const commentsMap = new Map()
    const topLevelComments = []
    
    // 处理一级评论
    if (topLevelCommentsData) {
      topLevelCommentsData.forEach(comment => {
        commentsMap.set(comment.id, {
          ...comment,
          replies: [],
          user_liked: false
        })
        topLevelComments.push(commentsMap.get(comment.id))
      })
    }
    
    // 处理回复评论
    if (replyCommentsData) {
      replyCommentsData.forEach(comment => {
        commentsMap.set(comment.id, {
          ...comment,
          replies: [],
          user_liked: false
        })
        
        // 如果是回复，添加到父评论的replies数组中
        if (comment.parent_id) {
          const parentComment = commentsMap.get(comment.parent_id)
          if (parentComment) {
            parentComment.replies.push(commentsMap.get(comment.id))
          }
        } else {
          // 如果是顶级评论，添加到topLevelComments
          topLevelComments.push(commentsMap.get(comment.id))
        }
      })
    }
    
    comments.value = topLevelComments
    console.log('获取到的评论数据:', comments.value)
    
  } catch (err) {
    console.error('获取评论数据时出错:', err)
    comments.value = []
  } finally {
    commentsLoading.value = false
  }
}

// 获取相关链接
const fetchRelatedLinks = async (articleId) => {
  try {
    relatedLinksLoading.value = true
    
    if (!articleId) {
      console.warn('文章ID为空，使用默认相关链接')
      relatedLinks.value = []
      relatedLinksLoading.value = false
      return
    }
    
    // 从数据库获取当前文章的链接信息
    const { data: articleData, error: articleError } = await supabase
      .from('articles')
      .select('template_link, api_link, repository_link, link_type')
      .eq('id', articleId)
      .single()
    
    if (articleError) {
      console.error('获取文章链接失败:', articleError)
      relatedLinks.value = []
      relatedLinksLoading.value = false
      return
    }
    
    // 构建相关链接数组
    const links = []
    
    // 智能判断并添加模板链接
    if (articleData.template_link && isValidUrl(articleData.template_link)) {
      links.push({
        id: 'template',
        name: getLinkDisplayName(articleData.template_link, '模板链接'),
        url: articleData.template_link,
        icon: 'uil-file-code'
      })
    }
    
    // 智能判断并添加API链接
    if (articleData.api_link && isValidUrl(articleData.api_link)) {
      links.push({
        id: 'api',
        name: getLinkDisplayName(articleData.api_link, 'API文档'),
        url: articleData.api_link,
        icon: 'uil-server-network'
      })
    }
    
    // 智能判断并添加仓库链接
    if (articleData.repository_link && isValidUrl(articleData.repository_link)) {
      links.push({
        id: 'repository',
        name: getLinkDisplayName(articleData.repository_link, '代码仓库'),
        url: articleData.repository_link,
        icon: 'uil-github'
      })
    }
    
    // 如果没有有效的URL链接，显示提示信息
    if (links.length === 0) {
      // 检查是否有非URL的链接数据
      const hasLinkData = articleData.template_link || articleData.api_link || articleData.repository_link
      
      if (hasLinkData) {
        // 有链接数据但格式不正确，显示提示
        links.push({
          id: 'info',
          name: '链接信息',
          url: '',
          icon: 'uil-info-circle',
          isInfo: true
        })
      }
    }
    
    relatedLinks.value = links
    console.log('获取到的相关链接:', relatedLinks.value)
    
  } catch (err) {
    console.error('获取相关链接时出错:', err)
    relatedLinks.value = []
  } finally {
    relatedLinksLoading.value = false
  }
}

// 处理精选文章点击
const handleSelectedWorkClick = async (articleId) => {
  console.log('点击精选文章:', articleId)
  
  try {
    // 先调用数据库函数增加浏览量
    const { error } = await supabase.rpc('increment_article_view_count', {
      article_uuid: articleId
    })
    
    if (error) {
      console.error('增加浏览量失败:', error)
    } else {
      console.log(`文章 ${articleId} 浏览量已增加`)
    }
  } catch (err) {
    console.error('调用增加浏览量函数时出错:', err)
  }
  
  // 跳转到详情页
  router.push(`/detail/${articleId}`)
}

// 处理查看更多
const handleViewMore = () => {
  if (!authorInfo.value || !authorInfo.value.name) {
    alert('作者信息未加载完成')
    return
  }
  
  const currentUserId = getCurrentUserId()
  const currentAuthorId = authorId.value
  
  // 判断是否是当前用户查看自己的主页
  const isCurrentUser = currentUserId && currentAuthorId && currentUserId === currentAuthorId
  
  if (isCurrentUser) {
    // 跳转到自己的个人中心（使用当前用户ID）
    router.push(`/person-center/${currentUserId}`)
    console.log('跳转到个人中心页面（当前用户）')
  } else {
    // 跳转到作者的个人中心页面（传递作者ID）
    router.push(`/person-center/${currentAuthorId}`)
    console.log('跳转到作者个人中心页面:', authorInfo.value.name)
  }
}

// 增加文章浏览量
const incrementViewCount = async (articleId) => {
  try {
    // 调用数据库函数增加浏览量
    const { error } = await supabase.rpc('increment_article_view_count', {
      article_uuid: articleId
    })
    
    if (error) {
      console.error('增加浏览量失败:', error)
    } else {
      console.log(`文章 ${articleId} 浏览量已增加`)
    }
  } catch (err) {
    console.error('调用增加浏览量函数时出错:', err)
  }
}

// 跳转到作者个人中心
const navigateToAuthorProfile = () => {
  if (authorId.value) {
    router.push(`/person-center/${authorId.value}`)
  } else {
    console.warn('无法跳转到作者个人中心：作者ID为空')
  }
}

// 监听路由参数变化
watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchArticleDetail(newId)
  }
})

// 组件挂载时加载文章
onMounted(() => {
  const articleId = route.params.id
  if (articleId) {
    // 先增加浏览量，再加载文章详情
    incrementViewCount(articleId)
    fetchArticleDetail(articleId)
  } else {
    // 如果没有ID，使用默认数据
    fetchArticleDetail(null)
  }
  
  // 获取当前用户头像
  getCurrentUserAvatar()
})

// 点赞状态
const isLiked = ref(false)

// 评论显示状态
const showComments = ref(false)

// 检查用户是否已经点赞过该文章
const checkLikeStatus = async () => {
  if (!article.value || !article.value.id || article.value.id === 'default') return
  
  try {
    // 获取当前用户ID（使用自定义登录系统）
    const userId = getCurrentUserId()
    if (!userId) return
    
    // 检查用户是否已经点赞过该文章
    const { data, error } = await supabase
      .from('article_interactions')
      .select('id')
      .eq('user_id', userId)
      .eq('article_id', article.value.id)
      .eq('interaction_type', 'like')
      .maybeSingle()
    
    if (error && error.code !== 'PGRST116') {
      console.error('检查点赞状态失败:', error)
      return
    }
    
    isLiked.value = !!data
  } catch (err) {
    console.error('检查点赞状态时出错:', err)
  }
}

// 处理点赞
const handleLike = async () => {
  if (!article.value) return
  
  try {
    // 获取当前用户ID（使用自定义登录系统）
    const userId = getCurrentUserId()
    if (!userId) {
      alert('请先登录后再点赞')
      return
    }
    
    if (isLiked.value) {
      // 取消点赞
      const { error: deleteError } = await supabase
        .from('article_interactions')
        .delete()
        .eq('user_id', userId)
        .eq('article_id', article.value.id)
        .eq('interaction_type', 'like')
      
      if (deleteError) {
        console.error('取消点赞失败:', deleteError)
        return
      }
      
      // 更新本地状态
      isLiked.value = false
      article.value.likes = Math.max(0, (article.value.likes || 0) - 1)
      
      // 更新文章点赞数
      if (article.value.id && article.value.id !== 'default') {
        await supabase
          .from('articles')
          .update({ like_count: article.value.likes })
          .eq('id', article.value.id)
      }
      
      console.log('取消点赞成功')
    } else {
      // 添加点赞
      const { error: insertError } = await supabase
        .from('article_interactions')
        .insert({
          user_id: userId,
          article_id: article.value.id,
          interaction_type: 'like'
        })
      
      if (insertError) {
        console.error('添加点赞失败:', insertError)
        return
      }
      
      // 更新本地状态
      isLiked.value = true
      article.value.likes = (article.value.likes || 0) + 1
      
      // 更新文章点赞数
      if (article.value.id && article.value.id !== 'default') {
        await supabase
          .from('articles')
          .update({ like_count: article.value.likes })
          .eq('id', article.value.id)
      }
      
      console.log('点赞成功')
    }
  } catch (err) {
    console.error('处理点赞时出错:', err)
  }
}

// 处理评论
const handleComment = () => {
  showComments.value = !showComments.value
  if (showComments.value) {
    // 滚动到评论区
    setTimeout(() => {
      const commentSection = document.querySelector('.comment-section')
      if (commentSection) {
        commentSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }
}

// 收藏状态
const isFavorited = ref(false)

// 检查用户是否已经收藏过该文章
const checkFavoriteStatus = async () => {
  if (!article.value || !article.value.id || article.value.id === 'default') return
  
  try {
    // 获取当前用户ID（使用自定义登录系统）
    const userId = getCurrentUserId()
    if (!userId) return
    
    // 检查用户是否已经收藏过该文章
    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('article_id', article.value.id)
      .maybeSingle()
    
    if (error && error.code !== 'PGRST116') {
      console.error('检查收藏状态失败:', error)
      return
    }
    
    isFavorited.value = !!data
  } catch (err) {
    console.error('检查收藏状态时出错:', err)
  }
}

// 时间格式化函数
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  
  return date.toLocaleDateString('zh-CN')
}

// 发表评论
const submitComment = async () => {
  try {
    if (!commentContent.value.trim()) {
      alert('请输入评论内容')
      return
    }
    
    // 获取当前用户ID
    const userId = getCurrentUserId()
    if (!userId) {
      alert('请先登录后再发表评论')
      return
    }
    
    if (!article.value || !article.value.id) {
      alert('文章信息不完整，无法发表评论')
      return
    }
    
    // 发布评论到数据库
    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: userId,
        post_id: article.value.id,
        parent_id: null, // 顶级评论
        content: commentContent.value.trim(),
        reply_to_user_id: null
      })
      .select()
      .single()
    
    if (error) {
      console.error('发表评论失败:', error)
      alert('发表评论失败，请稍后重试')
      return
    }
    
    console.log('评论发表成功:', data)
    
    // 清空评论框
    commentContent.value = ''
    
    // 重新加载评论
    await fetchComments(article.value.id)
    
    // 显示成功提示
    alert('评论发表成功！')
    
  } catch (err) {
    console.error('发表评论时出错:', err)
    alert('发表评论失败，请稍后重试')
  }
}

// 回复评论
const submitReply = async (commentId, replyToUserId = null) => {
  try {
    if (!replyContent.value.trim()) {
      alert('请输入回复内容')
      return
    }
    
    // 获取当前用户ID
    const userId = getCurrentUserId()
    if (!userId) {
      alert('请先登录后再回复')
      return
    }
    
    if (!article.value || !article.value.id) {
      alert('文章信息不完整，无法回复评论')
      return
    }
    
    // 发布回复到数据库
    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: userId,
        post_id: article.value.id,
        parent_id: commentId,
        content: replyContent.value.trim(),
        reply_to_user_id: replyToUserId
      })
      .select()
      .single()
    
    if (error) {
      console.error('回复评论失败:', error)
      alert('回复评论失败，请稍后重试')
      return
    }
    
    console.log('回复发表成功:', data)
    
    // 清空回复框
    replyContent.value = ''
    replyToComment.value = null
    
    // 重新加载评论
    await fetchComments(article.value.id)
    
    // 显示成功提示
    alert('回复发表成功！')
    
  } catch (err) {
    console.error('回复评论时出错:', err)
    alert('回复评论失败，请稍后重试')
  }
}

// 点赞评论
const handleCommentLike = async (commentId) => {
  try {
    // 获取当前用户ID
    const userId = getCurrentUserId()
    if (!userId) {
      alert('请先登录后再点赞')
      return
    }
    
    // 检查用户是否已经点赞过该评论
    const { data: existingLike, error: checkError } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('comment_id', commentId)
      .maybeSingle()
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('检查评论点赞状态失败:', checkError)
      return
    }
    
    if (existingLike) {
      // 取消点赞
      const { error: deleteError } = await supabase
        .from('comment_likes')
        .delete()
        .eq('user_id', userId)
        .eq('comment_id', commentId)
      
      if (deleteError) {
        console.error('取消评论点赞失败:', deleteError)
        return
      }
      
      // 更新评论点赞数
      await updateCommentLikeCount(commentId, -1)
      
      console.log('取消评论点赞成功')
    } else {
      // 添加点赞
      const { error: insertError } = await supabase
        .from('comment_likes')
        .insert({
          user_id: userId,
          comment_id: commentId
        })
      
      if (insertError) {
        console.error('添加评论点赞失败:', insertError)
        return
      }
      
      // 更新评论点赞数
      await updateCommentLikeCount(commentId, 1)
      
      console.log('评论点赞成功')
    }
    
    // 重新加载评论
    if (article.value && article.value.id) {
      await fetchComments(article.value.id)
    }
    
  } catch (err) {
    console.error('处理评论点赞时出错:', err)
  }
}

// 更新评论点赞数
const updateCommentLikeCount = async (commentId, increment) => {
  try {
    // 获取当前点赞数
    const { data: comment, error: getError } = await supabase
      .from('comments')
      .select('like_count')
      .eq('id', commentId)
      .single()
    
    if (getError) {
      console.error('获取评论点赞数失败:', getError)
      return
    }
    
    const newLikeCount = Math.max(0, (comment?.like_count || 0) + increment)
    
    // 更新点赞数
    const { error: updateError } = await supabase
      .from('comments')
      .update({ like_count: newLikeCount })
      .eq('id', commentId)
    
    if (updateError) {
      console.error('更新评论点赞数失败:', updateError)
    }
    
  } catch (err) {
    console.error('更新评论点赞数时出错:', err)
  }
}

// 开始回复
const startReply = (commentId, replyToUserId = null) => {
  console.log('开始回复评论:', commentId, '回复给用户:', replyToUserId)
  replyToComment.value = commentId
  replyContent.value = ''
  
  // 如果有被回复的用户，找到对应的评论并@用户名
  if (replyToUserId) {
    const targetComment = findCommentById(commentId)
    if (targetComment && targetComment.author_name) {
      replyContent.value = `@${targetComment.author_name} `
    }
  }
  
  // 滚动到回复框位置
  setTimeout(() => {
    const replyContainer = document.querySelector('.fixed-reply-container')
    if (replyContainer) {
      replyContainer.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 100)
}

// 获取回复框占位符文本
const getReplyPlaceholder = () => {
  if (!replyToComment.value) return '请输入回复内容...'
  
  const targetComment = findCommentById(replyToComment.value)
  if (targetComment && targetComment.author_name) {
    return `回复 @${targetComment.author_name}...`
  }
  
  return '请输入回复内容...'
}

// 获取回复目标用户名称
const getReplyTargetName = () => {
  if (!replyToComment.value) return '未知用户'
  
  const targetComment = findCommentById(replyToComment.value)
  if (targetComment && targetComment.author_name) {
    return `@${targetComment.author_name}`
  }
  
  return '未知用户'
}

// 取消回复
const cancelReply = () => {
  replyToComment.value = null
  replyContent.value = ''
}

// 根据ID查找评论
const findCommentById = (commentId) => {
  const findComment = (commentList) => {
    for (const comment of commentList) {
      if (comment.id === commentId) {
        return comment
      }
      if (comment.replies && comment.replies.length > 0) {
        const found = findComment(comment.replies)
        if (found) return found
      }
    }
    return null
  }
  
  return findComment(comments.value)
}

// 处理评论菜单
const handleCommentMenu = (comment) => {
  console.log('处理评论菜单:', comment)
  // 这里可以添加举报、删除等操作
}

// 加载更多评论
const loadMoreComments = async () => {
  // 这里可以添加分页加载逻辑
  console.log('加载更多评论')
}

// 点赞评论
const handleLikeComment = async (comment) => {
  try {
    const userId = getCurrentUserId()
    if (!userId) {
      alert('请先登录后再点赞')
      return
    }
    
    if (comment.user_liked) {
      // 取消点赞
      const { error } = await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', comment.id)
        .eq('user_id', userId)
      
      if (error) {
        console.error('取消点赞失败:', error)
        return
      }
      
      comment.user_liked = false
      comment.like_count = Math.max(0, (comment.like_count || 0) - 1)
      
      // 更新评论点赞数
      await updateCommentLikeCount(comment.id, -1)
    } else {
      // 点赞
      const { error } = await supabase
        .from('comment_likes')
        .insert({
          comment_id: comment.id,
          user_id: userId
        })
      
      if (error) {
        console.error('点赞失败:', error)
        return
      }
      
      comment.user_liked = true
      comment.like_count = (comment.like_count || 0) + 1
      
      // 更新评论点赞数
      await updateCommentLikeCount(comment.id, 1)
    }
  } catch (err) {
    console.error('处理评论点赞时出错:', err)
  }
}

// 处理收藏
const handleFavorite = async () => {
  if (!article.value) return
  
  try {
    // 获取当前用户ID（使用自定义登录系统）
    const userId = getCurrentUserId()
    if (!userId) {
      alert('请先登录后再收藏')
      return
    }
    
    if (isFavorited.value) {
      // 取消收藏
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('article_id', article.value.id)
      
      if (error) {
        console.error('取消收藏失败:', error)
        return
      }
      
      // 更新本地状态
      isFavorited.value = false
      article.value.favorites = Math.max(0, (article.value.favorites || 0) - 1)
      
      // 更新文章收藏数
      if (article.value.id && article.value.id !== 'default') {
        await supabase
          .from('articles')
          .update({ favorite_count: article.value.favorites })
          .eq('id', article.value.id)
      }
      
      console.log('取消收藏成功')
    } else {
      // 添加收藏
      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: userId,
          article_id: article.value.id
        })
      
      if (error) {
        console.error('添加收藏失败:', error)
        return
      }
      
      // 更新本地状态
      isFavorited.value = true
      article.value.favorites = (article.value.favorites || 0) + 1
      
      // 更新文章收藏数
      if (article.value.id && article.value.id !== 'default') {
        await supabase
          .from('articles')
          .update({ favorite_count: article.value.favorites })
          .eq('id', article.value.id)
      }
      
      console.log('收藏成功')
    }
  } catch (err) {
    console.error('处理收藏时出错:', err)
  }
}

// 处理作者关注
const handleAuthorFollow = (authorInfo) => {
  console.log('关注作者:', authorInfo.name)
  // 这里可以添加关注逻辑
  alert(`已关注作者 ${authorInfo.name}`)
}

// 处理作者私信
const handleAuthorPrivateMessage = (authorInfo) => {
  console.log('私信作者:', authorInfo.name)
  // 这里可以添加私信逻辑
  alert(`即将向作者 ${authorInfo.name} 发送私信`)
}

// 处理分享
const handleShare = () => {
  if (!article.value) return
  
  const shareUrl = `${window.location.origin}/detail/${article.value.id || 'default'}`
  const shareText = `分享文章: ${article.value.title}`
  
  if (navigator.share) {
    navigator.share({
      title: article.value.title,
      text: shareText,
      url: shareUrl
    })
  } else {
    // 复制到剪贴板
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('链接已复制到剪贴板')
    }).catch(() => {
      // 备用方案
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('链接已复制到剪贴板')
    })
  }
}

// 处理话题点击
const handleTopicClick = (topicId) => {
  console.log('点击话题:', topicId)
}

// 处理查看全部
const handleViewAllTopics = () => {
  console.log('查看全部话题')
}

// 打开链接
const openLink = (url) => {
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

// 格式化URL显示
const formatUrl = (url) => {
  if (!url) return ''
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
  }
}

// 根据链接名称生成颜色
const getLinkColor = (linkName) => {
  if (!linkName) return '#3498db'
  
  // 常见网站的颜色映射
  const colorMap = {
    'github': '#333',
    'git': '#333',
    'youtube': '#FF0000',
    'netflix': '#E50914',
    'bilibili': '#FB7299',
    'qq音乐': '#31C27C',
    'stackoverflow': '#f48024',
    'mdn': '#83d0f2',
    'google': '#4285F4',
    'facebook': '#1877F2',
    'twitter': '#1DA1F2',
    'instagram': '#E4405F',
    'linkedin': '#0A66C2',
    'reddit': '#FF4500',
    'pinterest': '#BD081C',
    'tiktok': '#000000',
    'wechat': '#07C160',
    'weibo': '#E6162D',
    'zhihu': '#0084FF',
    'douyin': '#FE2C55'
  }
  
  const lowerName = linkName.toLowerCase()
  for (const [key, color] of Object.entries(colorMap)) {
    if (lowerName.includes(key)) {
      return color
    }
  }
  
  // 如果没匹配到，使用哈希函数生成稳定颜色
  let hash = 0
  for (let i = 0; i < linkName.length; i++) {
    hash = linkName.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const colors = [
    '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
    '#1abc9c', '#d35400', '#c0392b', '#16a085', '#8e44ad',
    '#27ae60', '#f1c40f', '#e67e22', '#2980b9', '#e74c3c'
  ]
  
  return colors[Math.abs(hash) % colors.length]
}

// 判断图标是否是图片URL
const isImageIcon = (icon) => {
  if (!icon) return false
  return icon.startsWith('http') || icon.startsWith('data:image') || icon.includes('.png') || icon.includes('.jpg') || icon.includes('.svg') || icon.includes('.ico')
}

// 验证URL是否有效
const isValidUrl = (url) => {
  if (!url) return false
  try {
    new URL(url)
    return url.startsWith('http://') || url.startsWith('https://')
  } catch {
    return false
  }
}

// 获取链接显示名称
const getLinkDisplayName = (url, defaultName) => {
  if (!isValidUrl(url)) return defaultName
  
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname
    
    // 常见网站名称映射
    const siteMap = {
      'github.com': 'GitHub',
      'gitlab.com': 'GitLab',
      'gitee.com': 'Gitee',
      'stackoverflow.com': 'Stack Overflow',
      'developer.mozilla.org': 'MDN Web Docs',
      'npmjs.com': 'npm',
      'yarnpkg.com': 'Yarn',
      'docker.com': 'Docker',
      'kubernetes.io': 'Kubernetes',
      'reactjs.org': 'React',
      'vuejs.org': 'Vue.js',
      'angular.io': 'Angular',
      'nodejs.org': 'Node.js',
      'python.org': 'Python',
      'java.com': 'Java',
      'php.net': 'PHP',
      'mysql.com': 'MySQL',
      'postgresql.org': 'PostgreSQL',
      'mongodb.com': 'MongoDB',
      'redis.io': 'Redis'
    }
    
    return siteMap[hostname] || defaultName
  } catch {
    return defaultName
  }
}

// 获取平台显示名称
const getPlatformDisplayName = () => {
  if (!article.value || !article.value.platforms || article.value.platforms.length === 0) {
    return '通用平台'
  }
  
  // 如果有多个平台，显示第一个平台名称
  const platform = article.value.platforms[0]
  
  // 平台名称映射
  const platformMap = {
    'n8n': 'n8n',
    'Zapier': 'Zapier', 
    'Make': 'Make',
    '扣子': '扣子',
    'IFTTT': 'IFTTT',
    'Power Automate': 'Power Automate',
    '智谱清言': '智谱清言'
  }
  
  return platformMap[platform] || platform
}

// 一键总结功能
const handleSummary = async () => {
  if (!article.value || !article.value.content) {
    alert('文章内容为空，无法进行总结')
    return
  }
  
  try {
    isSummarizing.value = true
    
    // 提取所有p标签的内容
    const parser = new DOMParser()
    const doc = parser.parseFromString(article.value.content, 'text/html')
    const pElements = doc.querySelectorAll('p')
    const textContent = Array.from(pElements).map(p => p.textContent.trim()).filter(text => text.length > 0).join('\n')
    
    if (!textContent) {
      alert('文章内容为空，无法进行总结')
      return
    }
    
    // Dify API配置
    const DIFY_API_URL = 'https://dify.aipfuture.com/v1'
    const DIFY_API_KEY = 'app-mIVYYqpCppoThPI2DowPvMPg'
    
    // 限制文本长度，避免超出API限制（通常建议在4000字符以内）
    const maxTextLength = 3000
    const truncatedText = textContent.length > maxTextLength 
      ? textContent.substring(0, maxTextLength) + '...' 
      : textContent
    
    // 构建请求数据 - 根据Dify API文档调整格式
    // Dify工作流API需要 input 字段而不是 text
    const requestData = {
      inputs: {
        input: truncatedText
      },
      response_mode: 'blocking',
      user: 'navigation_user'
    }
    
    console.log('发送Dify API请求:', {
      url: `${DIFY_API_URL}/workflows/run`,
      textLength: truncatedText.length,
      requestData
    })
    
    // 发送请求到Dify工作流
    const response = await fetch(`${DIFY_API_URL}/workflows/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })
    
    console.log('Dify API响应状态:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Dify API错误响应:', errorText)
      throw new Error(`Dify API请求失败: ${response.status} - ${errorText}`)
    }
    
    const result = await response.json()
    console.log('Dify API返回结果:', result)
    
    // 处理返回结果 - 根据Dify API实际返回格式调整
    let summaryText = ''
    
    if (result.data) {
      // 尝试多种可能的输出字段
      if (result.data.outputs) {
        summaryText = result.data.outputs.text || 
                     result.data.outputs.result || 
                     result.data.outputs.answer ||
                     result.data.outputs.summary ||
                     ''
      } else if (result.data.answer) {
        summaryText = result.data.answer
      } else if (result.data.text) {
        summaryText = result.data.text
      } else if (typeof result.data === 'string') {
        summaryText = result.data
      }
    } else if (result.answer) {
      summaryText = result.answer
    } else if (result.text) {
      summaryText = result.text
    } else if (typeof result === 'string') {
      summaryText = result
    }
    
    if (summaryText) {
      summaryResult.value = summaryText
      showSummaryCard.value = true
      
      // 滚动到总结卡片位置
      setTimeout(() => {
        const summaryCard = document.querySelector('.summary-card')
        if (summaryCard) {
          summaryCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      }, 100)
    } else {
      console.warn('未找到预期的总结内容，完整返回结果:', result)
      summaryResult.value = JSON.stringify(result, null, 2)
      showSummaryCard.value = true
      
      // 滚动到总结卡片位置
      setTimeout(() => {
        const summaryCard = document.querySelector('.summary-card')
        if (summaryCard) {
          summaryCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      }, 100)
    }
    
  } catch (error) {
    console.error('一键总结失败:', error)
    alert(`一键总结失败：${error.message}`)
  } finally {
    isSummarizing.value = false
  }
}

// 复制总结内容
const copySummary = async () => {
  try {
    await navigator.clipboard.writeText(summaryResult.value)
    // 显示复制成功提示
    const copyBtn = document.querySelector('.summary-copy-btn')
    if (copyBtn) {
      const originalText = copyBtn.innerHTML
      copyBtn.innerHTML = '<i class="fa fa-check"></i> 已复制'
      copyBtn.style.backgroundColor = '#10b981'
      
      setTimeout(() => {
        copyBtn.innerHTML = originalText
        copyBtn.style.backgroundColor = ''
      }, 2000)
    }
  } catch (err) {
    console.error('复制失败:', err)
    // 备用方案
    const textArea = document.createElement('textarea')
    textArea.value = summaryResult.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    
    // 显示复制成功提示
    const copyBtn = document.querySelector('.summary-copy-btn')
    if (copyBtn) {
      const originalText = copyBtn.innerHTML
      copyBtn.innerHTML = '<i class="fa fa-check"></i> 已复制'
      copyBtn.style.backgroundColor = '#10b981'
      
      setTimeout(() => {
        copyBtn.innerHTML = originalText
        copyBtn.style.backgroundColor = ''
      }, 2000)
    }
  }
}

// 排序按钮交互
const handleSortChange = (event) => {
  const sortBtns = document.querySelectorAll('.sort-btn')
  sortBtns.forEach(b => b.classList.remove('active'))
  event.currentTarget.classList.add('active')
}
</script>

<style scoped>
@import '../css/detailView.css';
</style>