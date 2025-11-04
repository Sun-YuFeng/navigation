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
      <!-- 帖子内容区域 -->
      <div class="post-content-area">
        <!-- 帖子卡片 -->
        <article class="post-card">
          <h1 class="post-title">
            如何在React项目中优雅地处理表单验证？分享几个实用技巧
          </h1>
        
          <!-- 作者信息 -->
          <div class="author-info">
            <div class="author-details">
              <img src="https://picsum.photos/id/237/60/60" alt="作者头像" class="author-avatar">
              <div>
                <div class="flex items-center">
                  <span class="author-name">张前端</span>
                  <span class="author-badge">资深开发者</span>
                </div>
                <div class="post-meta">
                  发布于 <time datetime="2023-06-15">2023年6月15日</time> · 5分钟阅读
                </div>
              </div>
            </div>
            
            <button class="more-options">
              <i class="fa fa-ellipsis-h"></i>
            </button>
          </div>
          
          <!-- 帖子内容 -->
          <div class="post-content">
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
            
            <img src="https://picsum.photos/id/0/800/400" alt="表单验证示例图" class="post-image">
            
            <h2>3. 错误信息展示原则</h2>
            <p>良好的错误信息应该：</p>
            <ul>
              <li>位置靠近相关输入框</li>
              <li>使用明确的语言说明问题</li>
              <li>提供解决方案建议</li>
              <li>使用醒目的颜色（通常是红色）</li>
            </ul>
            
            <p>希望这些技巧能帮助你在React项目中更好地处理表单验证。如果你有其他好的方法，欢迎在评论区分享！</p>
          </div>
          
          <!-- 标签 -->
          <div class="tags">
            <span class="tag tag-primary">#React</span>
            <span class="tag tag-neutral">#表单验证</span>
            <span class="tag tag-neutral">#前端开发</span>
            <span class="tag tag-neutral">#JavaScript</span>
          </div>
          
          <!-- 互动按钮 -->
          <div class="action-buttons">
            <div class="left-actions">
              <button class="action-button like-button" @click="handleLike">
                <i class="fa fa-thumbs-up"></i>
                <span>赞同 (128)</span>
              </button>
              <button class="action-button" @click="handleComment">
                <i class="fa fa-comment"></i>
                <span>评论 (32)</span>
              </button>
              <button class="action-button" @click="handleFavorite">
                <i class="fa fa-bookmark-o"></i>
                <span>收藏</span>
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
        <div class="author-card">
          <div class="avatar-area">
            <img src="https://via.placeholder.com/60" alt="作者头像" class="avatar">
            <div>
              <div class="name">仔仔木</div>
              <div class="intro">个人简介：热爱技术分享，专注前端开发领域</div>
            </div>
          </div>
          <div class="stats">
            <div class="stat-item">
              <div class="stat-num">37</div>
              <div class="stat-label">原创</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">1117</div>
              <div class="stat-label">点赞</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">4286</div>
              <div class="stat-label">收藏</div>
            </div>
            <div class="stat-item">
              <div class="stat-num">667</div>
              <div class="stat-label">粉丝</div>
            </div>
          </div>
          <div class="action-buttons">
            <button class="btn btn-follow">关注</button>
            <button class="btn btn-private">私信</button>
          </div>
        </div>

        <!-- TA的精选 -->
        <div class="selected-works">
          <div class="selected-list">
            <div class="list-header">TA的精选</div>
            <div class="list-item">
              <span class="tag tag-new">新</span>
              <a href="#" class="item-title">【数据结构】树与二叉树的基本概念及性质</a>
              <div class="item-read">1389 阅读</div>
            </div>
            <div class="list-item">
              <span class="tag tag-new">新</span>
              <a href="#" class="item-title">【计算机组成原理】：计算机系统概述</a>
              <div class="item-read">1371 阅读</div>
            </div>
            <div class="list-item">
              <span class="tag tag-hot">热</span>
              <a href="#" class="item-title">水仙花数（3位水仙花、100-999之内的所有水仙花、三位及以上水仙花）</a>
              <div class="item-read">75613 阅读</div>
            </div>
            <div class="list-item">
              <span class="tag tag-hot">热</span>
              <a href="#" class="item-title">【数据结构】：单链表之头插法和尾插法（动图+图解）</a>
              <div class="item-read">73118 阅读</div>
            </div>
            <div class="list-item">
              <span class="tag tag-hot">热</span>
              <a href="#" class="item-title">求二维数组每一列（行）上的最大值(Java)</a>
              <div class="item-read">14685 阅读</div>
            </div>
            <div class="view-more-container">
              <button class="view-more">查看更多&gt;</button>
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
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase.js'
import HotTopicsCard from '@/components/HotTopicsCard.vue'

const router = useRouter()
const route = useRoute()

// 处理返回按钮点击
const handleBack = () => {
  router.back()
}

// 点赞状态
const likeCount = ref(128)
const isLiked = ref(false)

// 评论显示状态
const showComments = ref(false)

// 处理点赞
const handleLike = () => {
  isLiked.value = !isLiked.value
  likeCount.value = isLiked.value ? likeCount.value + 1 : likeCount.value - 1
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

// 处理收藏
const handleFavorite = () => {
  console.log('收藏帖子')
}

// 处理分享
const handleShare = () => {
  console.log('分享帖子')
}

// 处理话题点击
const handleTopicClick = (topicId) => {
  console.log('点击话题:', topicId)
}

// 处理查看全部
const handleViewAllTopics = () => {
  console.log('查看全部话题')
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
  background-color: #F3F4F6;
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

/* 作者卡片样式 */
.author-card {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  background-color: white;
  transition: all 0.3s ease;
}

.author-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.avatar-area {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
  border: 2px solid #f3f4f6;
  /* 确保在任何情况下都保持圆形 */
  aspect-ratio: 1 / 1;
  flex-shrink: 0;
}

.name {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 2px;
}

.intro {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.4;
}

.stats {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin: 16px 0;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: none;
}

.stat-item {
  text-align: center;
  padding: 6px 8px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  flex: 1;
  min-width: 0;
}

.stat-item:hover {
  background-color: #e9ecef;
}

.stat-num {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  display: block;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.author-card .action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 0;
  border-top: none;
  padding-top: 0;
}

.author-card .btn {
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-follow {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.btn-follow:hover {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.btn-private {
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-private:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
  transform: translateY(-1px);
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
}
</style>