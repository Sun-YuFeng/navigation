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

</script>

<style scoped>
@import '../css/detailView.css';
</style>