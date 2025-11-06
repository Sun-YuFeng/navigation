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
                <span>评论 ({{ article?.comments || 0 }})</span>
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
              <img src="https://picsum.photos/id/64/50/50" alt="你的头像" class="avatar">
              <div class="flex-grow">
                <textarea 
                  placeholder="分享你的想法..." 
                  class="comment-textarea"
                  rows="3"
                ></textarea>
                <div class="flex justify-end mt-3">
                  <button class="btn-primary">
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
              查看全部32条评论
            </button>
          </div>
          
          <!-- 评论列表 -->
          <div class="comment-list">
            <!-- 评论1 -->
            <div class="comment-item">
              <div class="flex gap-4">
                <img src="https://picsum.photos/id/1005/50/50" alt="评论者头像" class="avatar">
                <div class="flex-grow">
                  <div class="comment-header">
                    <div>
                      <h4 class="comment-author">李开发</h4>
                      <p class="comment-time">2天前</p>
                    </div>
                    <button class="more-btn">
                      <i class="fa fa-ellipsis-h"></i>
                    </button>
                  </div>
                  
                  <div class="comment-content">
                    非常实用的技巧！我最近在项目中使用React Hook Form，确实比自己手写表单逻辑要高效得多。另外，对于复杂的嵌套表单，推荐使用Yup进行 schema 验证，可以和Formik完美配合。
                  </div>
                  
                  <div class="comment-actions">
                    <button class="action-btn">
                      <i class="fa fa-thumbs-up"></i>
                      <span>24</span>
                    </button>
                    <button class="action-btn">
                      <i class="fa fa-reply"></i>
                      <span>回复</span>
                    </button>
                  </div>
                  
                  <!-- 评论的回复 -->
                  <div class="replies-container">
                    <div class="reply-item">
                      <img src="https://picsum.photos/id/237/40/40" alt="回复者头像" class="reply-avatar">
                      <div class="flex-grow">
                        <div class="comment-header">
                          <div>
                            <h5 class="comment-author">张前端 <span class="author-badge">作者</span></h5>
                            <p class="comment-time">1天前</p>
                          </div>
                        </div>
                        
                        <div class="comment-content">
                          @李开发 是的，Yup确实是个好选择，它的schema定义非常直观，而且支持异步验证，很适合复杂场景。
                        </div>
                        
                        <div class="reply-actions">
                          <button class="action-btn">
                            <i class="fa fa-thumbs-up"></i>
                            <span>8</span>
                          </button>
                          <button class="action-btn">
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
            
            <!-- 评论2 -->
            <div class="comment-item">
              <div class="flex gap-4">
                <img src="https://picsum.photos/id/1012/50/50" alt="评论者头像" class="avatar">
                <div class="flex-grow">
                  <div class="comment-header">
                    <div>
                      <h4 class="comment-author">王程序</h4>
                      <p class="comment-time">3天前</p>
                    </div>
                    <button class="more-btn">
                      <i class="fa fa-ellipsis-h"></i>
                    </button>
                  </div>
                  
                  <div class="comment-content">
                    请问对于动态表单（比如可以动态添加/删除表单项）的情况，哪种方案处理起来更优雅呢？我目前遇到的问题是动态增减项后，验证状态经常会出问题。
                  </div>
                  
                  <div class="comment-actions">
                    <button class="action-btn">
                      <i class="fa fa-thumbs-up"></i>
                      <span>15</span>
                    </button>
                    <button class="action-btn">
                      <i class="fa fa-reply"></i>
                      <span>回复</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 加载更多评论 -->
            <div class="load-more">
              <button class="load-more-btn">
                加载更多评论
              </button>
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
      
      // 获取相关链接
      await fetchRelatedLinks(data.id)
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
      
      // 显示总结结果（使用更好的展示方式）
      alert(`文章总结完成：

${summaryText}`)
    } else {
      console.warn('未找到预期的总结内容，完整返回结果:', result)
      summaryResult.value = JSON.stringify(result, null, 2)
      alert(`文章总结完成，但返回格式异常。请查看控制台获取详细信息。`)
    }
    
  } catch (error) {
    console.error('一键总结失败:', error)
    alert(`一键总结失败：${error.message}`)
  } finally {
    isSummarizing.value = false
  }
}

// 评论点赞交互
const handleCommentLike = (event) => {
  const btn = event.currentTarget
  const countSpan = btn.querySelector('span')
  if (countSpan) {
    let count = parseInt(countSpan.textContent)
    
    if (btn.classList.contains('active')) {
      btn.classList.remove('active')
      countSpan.textContent = count - 1
    } else {
      btn.classList.add('active')
      countSpan.textContent = count + 1
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
.detail-container {
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* 骨架屏样式 */
.skeleton-container {
  width: 100%;
}

.skeleton-card {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 1.5rem;
}

.skeleton-title {
  height: 2.5rem;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.skeleton-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  flex-shrink: 0;
}

.skeleton-author-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.skeleton-line {
  height: 1rem;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 0.25rem;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-line.medium {
  width: 70%;
}

.skeleton-line.short {
  width: 50%;
}

.skeleton-line.shorter {
  width: 30%;
}

.skeleton-sidebar-card {
  width: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 12px;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  margin-bottom: 16px;
}

.skeleton-author-card {
  height: 280px;
}

.skeleton-button {
  height: 50px;
}

.skeleton-list {
  height: 400px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 保留原有的加载状态样式（用于错误状态） */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-left: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  color: #6b7280;
  font-size: 1rem;
}

/* 错误状态样式 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  margin: 0;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-container h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}

.error-container p {
  color: #6b7280;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.retry-btn {
  padding: 0.5rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.retry-btn:hover {
  background-color: #2563eb;
}

/* 顶部导航栏样式 */
.detail-navbar {
  background: white;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 8px 24px;
  max-width: 1200px;
  margin: 0;
  height: 48px;
}

/* 面包屑导航样式 */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6c757d;
}

.breadcrumb-item {
  cursor: pointer;
  transition: color 0.2s ease;
  padding: 4px 8px;
  border-radius: 4px;
}

.breadcrumb-item:hover {
  color: #495057;
  background-color: #f8f9fa;
}

.breadcrumb-item.current {
  color: #495057;
  font-weight: 500;
  cursor: default;
}

.breadcrumb-item.current:hover {
  background-color: transparent;
}

.breadcrumb-separator {
  color: #adb5bd;
  margin: 0 4px;
}

/* 内容区域布局 */
.content-area {
  display: flex;
  gap: 15px;
  margin: 15px auto;
  max-width: 1450px;
  padding: 0 5px;
}

/* 侧边栏样式 */
.sidebar {
  width: 325px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 侧边栏样式 */
.sidebar {
  width: 325px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 帖子内容区域样式 */
.post-content-area {
  flex: 1;
  max-width: 1100px;
}



/* 帖子卡片 */
.post-card {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.post-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

@media (min-width: 768px) {
  .post-card {
    padding: 2rem;
  }
}

/* 标题 */
.post-title {
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  text-wrap: balance;
}

/* 作者信息 */
.author-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.author-details {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  border-radius: 8px;
  padding: 4px 8px;
  transition: all 0.2s ease;
}

.author-details:hover {
  background-color: #f5f5f5;
  transform: translateY(-1px);
}

.author-details:active {
  background-color: #e9ecef;
  transform: translateY(0);
}

.author-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
}

.author-name {
  font-weight: 500;
  color: #1F2937;
}

.author-badge {
  margin-left: 0.5rem;
  font-size: 0.75rem;
  background-color: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
}

.post-meta {
  font-size: 0.875rem;
  color: #6B7280;
  margin-top: 0.125rem;
}

.more-options {
  color: #6B7280;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.more-options:hover {
  color: #3B82F6;
}

.more-options i {
  font-size: 1.25rem;
}

/* 帖子内容 */
.post-content {
  color: #4B5563;
  margin-bottom: 2rem;
}

.post-content p {
  margin-bottom: 1.5rem;
}

.post-content h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: #1F2937;
}

.post-content ul, .post-content ol {
  margin-left: 1.5rem;
  margin-bottom: 1.5rem;
}

.post-content ul {
  list-style-type: disc;
}

.post-content ol {
  list-style-type: decimal;
}

.post-content li {
  margin-bottom: 0.5rem;
}

/* 代码块 */
.code-block {
  background-color: #F3F4F6;
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1.5rem 0;
  border-left: 4px solid #3B82F6;
  overflow-x: auto;
}

.code-block pre {
  font-size: 0.875rem;
  color: #1F2937;
}

.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* 图片 */
.post-image {
  width: 100%;
  height: auto;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  margin: 1.5rem 0;
}

/* 标签 */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 2rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 9999px;
}

.tag-primary {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
}

.tag-neutral {
  background-color: #acc8ff;
  color: #374151;
}

/* 互动按钮 */
.action-buttons {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
  border-top: 1px solid #E5E7EB;
}

.left-actions, .right-actions {
  display: flex;
  align-items: center;
}

.left-actions {
  gap: 1.5rem;
}

.right-actions {
  gap: 1rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4B5563;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.action-button:hover {
  color: #3B82F6;
}

.action-button.favorited {
  color: #f59e0b;
}

.action-button.favorited:hover {
  color: #d97706;
}

.action-button.liked {
  color: #3b82f6;
}

.action-button.liked:hover {
  color: #2563eb;
}

.action-button i {
  font-size: 1.25rem;
  transition: transform 0.2s ease;
}

.action-button:hover i {
  transform: scale(1.1);
}

.action-button span {
  display: none;
}

@media (min-width: 768px) {
  .action-button span {
    display: inline;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar-content {
    padding: 12px 16px;
  }
  
  .breadcrumb {
    font-size: 13px;
  }
}

/* TA的精选样式 */
.selected-works {
  width: 100%;
}

.selected-list {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  padding-bottom: 12px;
  background-color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.selected-list:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.list-header {
  background-color: #f8f9fa;
  padding: 12px 16px;
  font-weight: 600;
  font-size: 16px;
  color: #111827;
  border-bottom: 1px solid #e5e7eb;
}

.list-item {
  padding: 8px 16px;
  transition: background-color 0.2s;
}

.list-item:hover {
  background-color: #f8f9fa;
}

.tag {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  color: #fff;
  margin-right: 8px;
  font-weight: 600;
}

.tag-new {
  background-color: #ef4444;
}

.tag-hot {
  background-color: #f59e0b;
}

.item-title {
  display: block;
  margin-bottom: 4px;
  color: #111827;
  text-decoration: none;
  font-size: 14px;
  line-height: 1.4;
  font-weight: 500;
}

.item-title:hover {
  color: #3b82f6;
}

.item-read {
  font-size: 12px;
  color: #6b7280;
}

.view-more-container {
  text-align: center;
  padding: 0 16px;
  margin-top: 8px;
}

.view-more {
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  background-color: #fff;
  cursor: pointer;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  width: 100%;
  box-sizing: border-box;
  color: #6b7280;
  font-weight: 500;
}

.view-more:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
}

/* 评论区样式 */
.comment-section {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: all 0.3s ease;
  margin-top: 1.5rem;
}

@media (min-width: 768px) {
  .comment-section {
    padding: 2rem;
  }
}

.comment-section:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.comment-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #111827;
  margin-bottom: 1.5rem;
}

/* 评论输入框 */
.comment-input-container {
  margin-bottom: 2rem;
}

.flex {
  display: flex;
}

.gap-4 {
  gap: 1rem;
}

.avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.flex-grow {
  flex-grow: 1;
}

.comment-textarea {
  width: 100%;
  border: 1px solid #D1D5DB;
  border-radius: 0.5rem;
  padding: 0.75rem;
  resize: none;
  transition: all 0.2s ease;
  font-family: inherit;
  font-size: 0.875rem;
}

.comment-textarea:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.justify-end {
  justify-content: flex-end;
}

.mt-3 {
  margin-top: 0.75rem;
}

.btn-primary {
  padding: 0.5rem 1.25rem;
  background-color: #3B82F6;
  color: white;
  border-radius: 0.5rem;
  border: none;
  font-weight: 500;
  transition: background-color 0.2s ease;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-primary:hover {
  background-color: #2563eb;
}

/* 评论排序 */
.sort-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #E5E7EB;
}

.space-x-4 {
  gap: 1rem;
}

.sort-btn {
  display: flex;
  align-items: center;
  border: none;
  background: none;
  cursor: pointer;
  transition: color 0.2s ease;
  font-size: 0.875rem;
  color: #6B7280;
}

.sort-btn.active {
  color: #3B82F6;
  font-weight: 500;
}

.sort-btn:hover {
  color: #3B82F6;
}

.text-sm {
  font-size: 0.875rem;
}

.view-all {
  color: #6B7280;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
  font-size: 0.875rem;
}

.view-all:hover {
  color: #3B82F6;
}

/* 评论列表 */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.comment-item {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.comment-author {
  font-weight: 500;
  color: #111827;
  font-size: 0.875rem;
  margin: 0;
}

.comment-time {
  font-size: 0.75rem;
  color: #6B7280;
  margin-top: 0.125rem;
}

.more-btn {
  color: #9CA3AF;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.more-btn:hover {
  color: #4B5563;
}

.comment-content {
  margin-top: 0.5rem;
  color: #374151;
  font-size: 0.875rem;
  line-height: 1.5;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #6B7280;
  background: none;
  border: none;
  font-size: 0.75rem;
  cursor: pointer;
  transition: color 0.2s ease;
}

.action-btn:hover {
  color: #3B82F6;
}

.action-btn.active {
  color: #3B82F6;
}

/* 评论回复 */
.replies-container {
  margin-top: 1rem;
  margin-left: 1.5rem;
  padding-left: 1rem;
  border-left: 2px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reply-item {
  display: flex;
  gap: 0.75rem;
}

.reply-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.author-badge {
  font-size: 0.75rem;
  background-color: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  margin-left: 0.5rem;
}

.reply-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding-top: 1rem;
}

.load-more-btn {
  padding: 0.5rem 1.5rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.5rem;
  color: #4B5563;
  background: none;
  font-weight: 500;
  transition: background-color 0.2s ease;
  cursor: pointer;
  font-size: 0.875rem;
}

.load-more-btn:hover {
  background-color: #fafafa;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .content-area {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
  }
  
  /* 移动端骨架屏优化 */
  .skeleton-card {
    padding: 1.5rem;
  }
  
  .skeleton-title {
    height: 2rem;
  }
  
  .skeleton-author-card {
    height: 200px;
  }
  
  .skeleton-button {
    height: 45px;
  }
  
  .skeleton-list {
    height: 300px;
  }
}

/* TA的精选 - 加载状态和空状态样式 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #6b7280;
  font-size: 14px;
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f4f6;
  border-left: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #9ca3af;
  font-size: 14px;
  font-style: italic;
}

/* 确保列表项有正确的光标样式 */
.list-item {
  cursor: pointer;
}

.list-item:hover {
  background-color: #f8f9fa;
}

/* TA的精选 - 加载状态和空状态样式 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #6b7280;
  font-size: 14px;
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f4f6;
  border-left: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #9ca3af;
  font-size: 14px;
  font-style: italic;
}

/* 确保列表项有正确的光标样式 */
.list-item {
  cursor: pointer;
}

.list-item:hover {
  background-color: #f8f9fa;
}

/* 一键总结按钮包装器样式 */
.summary-button-wrapper {
  width: 100%;
  margin-top: 8px;
}

/* 一键总结按钮样式 */
.summary-button {
  width: 100%;
  padding: 12px 16px;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

.summary-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.summary-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
}

.summary-button:disabled {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
  cursor: not-allowed;
  opacity: 0.7;
  transform: none;
  box-shadow: none;
}

.summary-button i {
  font-size: 16px;
}

.summary-button span {
  font-size: 14px;
  font-weight: 600;
}

.summary-button {
  width: 100%;
  padding: 12px 16px;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

.summary-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.summary-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
}

.summary-button:disabled {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
  cursor: not-allowed;
  opacity: 0.7;
  transform: none;
  box-shadow: none;
}

.summary-button i {
  font-size: 16px;
}

.summary-button span {
  font-size: 14px;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .summary-button {
    padding: 10px 14px;
    font-size: 13px;
  }
  
  .summary-button i {
    font-size: 14px;
  }
}

/* 相关链接区域样式 */
.related-links-section {
  margin-bottom: 2rem;
  background-color: #f8f9fa;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
}

.related-links-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.related-links-title::before {
  content: '🔗';
  margin-right: 0.5rem;
  font-size: 1rem;
}

.related-links-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.related-link-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: white;
  border-radius: 0.5rem;
  border: 1px solid #e9ecef;
  cursor: pointer;
  transition: all 0.2s ease;
}

.related-link-item:hover {
  background-color: #f1f3f4;
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.link-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  flex-shrink: 0;
  overflow: hidden;
}

.link-icon-img {
  width: 60%;
  height: 60%;
  object-fit: contain;
}

.link-info {
  flex: 1;
  min-width: 0;
}

.link-name {
  font-weight: 500;
  color: #111827;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.link-url {
  font-size: 0.75rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.link-info-text {
  font-size: 0.75rem;
  color: #9ca3af;
  font-style: italic;
}

.info-item {
  cursor: default !important;
  opacity: 0.7;
}

.info-item:hover {
  transform: none !important;
  box-shadow: none !important;
  border-color: #e9ecef !important;
}

.link-info-text {
  font-size: 0.75rem;
  color: #9ca3af;
  font-style: italic;
}

.info-item {
  cursor: default !important;
  opacity: 0.7;
}

.info-item:hover {
  transform: none !important;
  box-shadow: none !important;
  border-color: #e9ecef !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .related-links-section {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .related-link-item {
    padding: 0.5rem;
  }
  
  .link-icon {
    width: 2rem;
    height: 2rem;
    font-size: 1rem;
  }
}
</style>