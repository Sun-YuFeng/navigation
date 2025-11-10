<template>
  <div class="persona-center">
    <!-- 顶部艺术导航栏 -->
    <div class="header-bg">
      <div class="avatar-area">
        <div class="avatar">
          <img :src="userAvatar" alt="头像">
        </div>
        <div class="nickname">{{ userNickname }}</div>
      </div>
      <div class="space-title">{{ userNickname }}的个人空间</div>
    </div>
    
    <!-- 导航菜单 -->
    <div class="nav">
      <ul>
        <li v-for="item in navItems" :key="item.id">
          <a href="#" 
             @click.prevent="handleNavClick(item)"
             :class="{ active: currentNav === item.id }">{{ item.name }}</a>
        </li>
      </ul>
    </div>
    
    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- AuthorCard组件 - 固定在左侧 -->
      <div class="author-card-container">
        <AuthorCard :author-info="authorInfo" :author-id="currentUserId" @follow="handleFollow" @private-message="handlePrivateMessage" />
      </div>
      
      <!-- 根据当前选中的导航项显示不同内容 -->
      <div v-if="currentNav === 'recently'" class="content-section">
        <h2>最近动态</h2>
        <div class="posts-grid">
          <CompactCard 
            v-for="post in recentPosts" 
            :key="post.id"
            :avatar="post.avatar"
            :user-name="post.userName"
            :publish-time="post.publishTime"
            :image-url="post.imageUrl"
            :title="post.title"
            :description="post.description"
            :tags="post.tags"
            :likes="post.likes"
            :favorites="post.favorites"
            :comments="post.comments"
            :show-delete="isViewingOwnProfile"
            @cardClick="handlePostClick(post.id)"
            @delete="handleDeletePost(post)"
          />
        </div>
      </div>
      
      <div v-if="currentNav === 'workflow'" class="content-section">
        <h2>工作流</h2>
        <div class="posts-grid">
          <CompactCard 
            v-for="post in hotPosts" 
            :key="post.id"
            :avatar="post.avatar"
            :user-name="post.userName"
            :publish-time="post.publishTime"
            :image-url="post.imageUrl"
            :title="post.title"
            :description="post.description"
            :tags="post.tags"
            :likes="post.likes"
            :favorites="post.favorites"
            :comments="post.comments"
            :show-delete="isViewingOwnProfile"
            @cardClick="handlePostClick(post.id)"
            @delete="handleDeletePost(post)"
          />
        </div>
      </div>
      
      <div v-if="currentNav === 'collect'" class="content-section">
        <h2>收藏</h2>
        <div class="posts-grid">
          <CompactCard 
            v-for="post in collectedPosts" 
            :key="post.id"
            :avatar="post.avatar"
            :user-name="post.userName"
            :publish-time="post.publishTime"
            :image-url="post.imageUrl"
            :title="post.title"
            :description="post.description"
            :tags="post.tags"
            :likes="post.likes"
            :favorites="post.favorites"
            :comments="post.comments"
            :show-delete="false"
            @cardClick="handlePostClick(post.id)"
          />
        </div>
      </div>
      
      <div v-if="currentNav === 'attention'" class="content-section">
        <h2>关注</h2>
        <div class="attention-content">
          <div class="title">全部共 {{ followingUsers.length }} 个关注用户</div>
          <div class="user-list">
            <div v-for="user in followingUsers" :key="user.id" class="user-card">
              <img :src="user.avatar" :alt="user.name" class="user-avatar" @click="handleUserClick(user)">
              <div class="user-info">
                <div class="user-name" @click="handleUserClick(user)">{{ user.name }}</div>
                <div class="user-desc">{{ user.description }}</div>
                <button 
                  class="follow-btn"
                  :class="{ 'followed': user.isFollowing, 'disabled': !isViewingOwnProfile && !user.isFollowing }"
                  @click="handleFollowUser(user)"
                  :disabled="!isViewingOwnProfile && !user.isFollowing">
                  {{ getFollowButtonText(user) }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      

    </div>
  </div>
</template>

<script setup>
import { usePersonCenter } from '../js/Personcenter.js'
import CompactCard from '../components/CompactCard.vue'
import AuthorCard from '../components/AuthorCard.vue'

// 使用 composable 函数
const {
  userAvatar,
  userNickname,
  authorInfo,
  navItems,
  currentNav,
  recentPosts,
  hotPosts,
  collectedPosts,
  followingUsers,
  currentUserId,
  isViewingOwnProfile,
  handleNavClick,
  handlePostClick,
  handleFollow,
  handleFollowUser,
  handleUserClick,
  getFollowButtonText,
  handleDeletePost
} = usePersonCenter()

// 处理私信功能（如果需要）
const handlePrivateMessage = () => {
  console.log('私信功能')
}
</script>

<style scoped>
.persona-center {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 头部背景样式 */
.header-bg {
  background-image: url(../assets/background.jpeg);
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  height: 250px;
  position: relative;
}

/* 头像区域样式，设置正方形 */
.avatar-area {
  position: absolute;
  left: 200px; /* 缩小左边距 */
  bottom: -50px; /* 减少超出头部背景的距离 */
  display: flex;
  align-items: center;
  gap: 15px; /* 缩小间距 */
}

.avatar {
  width: 150px; /* 缩小头像尺寸 */
  height: 150px;
  border-radius: 8px; /* 改为圆角正方形 */
  border: 2px solid #fff; /* 缩小边框 */
  overflow: hidden;
  background-color: #fff;
  flex-shrink: 0;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2); /* 缩小阴影 */
  transform: translateY(-15px); /* 减少上移距离 */
  transition: all 0.3s ease;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nickname {
  color: #ffffff;
  font-size: 20px; /* 缩小字体大小 */
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
}

/* 空间标题样式 */
.space-title {
  position: absolute;
  left: 200px; /* 与缩小后的头像左对齐 */
  top: 25px;
  color: white;
  font-size: 24px; /* 缩小字体大小 */
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

/* 导航栏样式 */
.nav {
  background-color: #f8f9fa;
  border-bottom: 1px solid #ddd;
  height: 50px;
  line-height: 50px;
  padding-left: 430px; /* 向右移动30px */
}

.nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav ul li {
  display: inline-block;
  margin-right: 20px;
}

.nav ul li a {
  text-decoration: none;
  color: #333;
  font-size: 14px;
  padding: 5px 10px;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.nav ul li a:hover {
  color: #007bff;
  background-color: #e9ecef;
}

.nav ul li a.active {
  color: #007bff;
  background-color: #e9ecef;
  font-weight: bold;
  border-bottom: 2px solid #007bff;
}

/* 主内容区域 */
.main-content {
  padding: 30px;
  margin-left: 50px; /* 整体向右移动50px，比原来往左增加100px */
  display: flex;
  flex-direction: row; /* 确保AuthorCard在content-section的左边 */
  gap: 15px; /* AuthorCard和content-section之间的间距 */
}

/* AuthorCard容器样式 */
.author-card-container {
  flex-shrink: 0;
  width: 300px; /* 固定AuthorCard的宽度 */
  position: sticky;
  top: 30px; /* 固定在顶部 */
  height: fit-content;
}

/* 帖子网格样式 */
.posts-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

/* 帖子网格样式 */
.posts-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.content-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  flex: 1; /* 占据剩余空间 */
  margin-right: 100px; /* 缩短宽度，右边留出更多空间（增加50px） */
}

.content-section h2 {
  color: #333;
  margin-bottom: 20px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
}

/* 关注用户列表样式 */
.title {
  margin-bottom: 25px;
  font-size: 19px;
  color: #333;
  font-weight: bold;
}

.user-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
}

.user-card {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  background: #f9f9f9;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.user-card:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #409eff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-avatar:hover {
  border-color: #1890ff;
  transform: scale(1.05);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 10px;
  flex: 1;
}

.user-name {
  font-size: 19px;
  font-weight: bold;
  color: #409eff;
  cursor: pointer;
  transition: color 0.3s ease;
}

.user-name:hover {
  color: #1890ff;
  text-decoration: underline;
}

.user-desc {
  font-size: 15px;
  color: #666;
  line-height: 1.5;
}

.follow-btn {
  width: 100px;
  height: 36px;
  background-color: #409eff;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  margin-top: 5px;
  transition: all 0.2s ease;
}

.follow-btn:hover {
  background-color: #1890ff;
  transform: scale(1.05);
}

/* 已关注状态的按钮样式 */
.follow-btn.followed {
  background-color: #67c23a;
  color: #fff;
}

.follow-btn.followed:hover {
  background-color: #5daf34;
}

/* 禁用状态的按钮样式 */
.follow-btn.disabled {
  background-color: #c0c4cc;
  color: #fff;
  cursor: not-allowed;
}

.follow-btn.disabled:hover {
  background-color: #c0c4cc;
  transform: none;
}

/* 已关注状态的按钮样式 */
.follow-btn.followed {
  background-color: #67c23a;
  color: #fff;
}

.follow-btn.followed:hover {
  background-color: #5daf34;
}

/* 禁用状态的按钮样式 */
.follow-btn.disabled {
  background-color: #c0c4cc;
  color: #fff;
  cursor: not-allowed;
}

.follow-btn.disabled:hover {
  background-color: #c0c4cc;
  transform: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 15px;
    margin-left: 0;
    gap: 20px;
  }
  
  .author-card-container {
    width: 100%;
    position: static;
  }
  
  .content-section {
    margin-right: 0;
  }
  
  .user-list {
    grid-template-columns: 1fr;
  }
  
  .user-avatar {
    width: 80px;
    height: 80px;
    border-width: 2px;
  }
}

</style>