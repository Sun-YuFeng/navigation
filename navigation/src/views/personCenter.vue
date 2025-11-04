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
          <a href="#" @click.prevent="handleNavClick(item)">{{ item.name }}</a>
        </li>
      </ul>
    </div>
    
    <!-- 主内容区域 -->
    <div class="main-content">
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
          />
        </div>
      </div>
      
      <div v-if="currentNav === 'home'" class="content-section">
        <h2>个人主页</h2>
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
          />
        </div>
      </div>
      
      <div v-if="currentNav === 'personal_data'" class="content-section">
        <h2>资料编辑</h2>
        <div class="profile-edit">
          <div class="edit-form">
            <div class="form-group">
              <label>昵称：</label>
              <input type="text" v-model="userProfile.nickname">
            </div>
            <div class="form-group">
              <label>个性签名：</label>
              <textarea v-model="userProfile.signature"></textarea>
            </div>
            <button class="save-btn">保存修改</button>
          </div>
        </div>
      </div>
      
      <div v-if="currentNav === 'attention'" class="content-section">
        <h2>关注</h2>
        <div class="attention-content">
          <div class="attention-item">
            <h3>关注的人</h3>
            <p>查看你关注的好友动态</p>
          </div>
          <div class="attention-item">
            <h3>粉丝</h3>
            <p>关注你的用户列表</p>
          </div>
        </div>
      </div>

      <div v-if="currentNav === 'personal_data'" class="content-section">
        <h2>资料编辑</h2>
        <div class="profile-edit">
          <div class="edit-form">
            <div class="form-group">
              <label>昵称：</label>
              <input type="text" v-model="userProfile.nickname">
            </div>
            <div class="form-group">
              <label>个性签名：</label>
              <textarea v-model="userProfile.signature"></textarea>
            </div>
            <button class="save-btn">保存修改</button>
          </div>
        </div>
      </div>
      
      <div v-if="currentNav === 'attention'" class="content-section">
        <h2>关注</h2>
        <div class="attention-content">
          <div class="attention-item">
            <h3>关注的人</h3>
            <p>查看你关注的好友动态</p>
          </div>
          <div class="attention-item">
            <h3>粉丝</h3>
            <p>关注你的用户列表</p>
          </div>
        </div>
      </div>
      

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import CompactCard from '../components/CompactCard.vue'

const authStore = useAuthStore()

// 用户信息
const userAvatar = ref('https://via.placeholder.com/100/FFCC00/333333?Text=柴犬')
const userNickname = ref('')



// 导航菜单
const navItems = ref([
  { id: 'recently', name: '最近' },
  { id: 'workflow', name: '工作流' },
  { id: 'collect', name: '收藏' },
  { id: 'personal_data', name: '资料编辑' },
  { id: 'attention', name: '关注' },
])

// 当前选中的导航项
const currentNav = ref('recently')

const userProfile = ref({
  nickname: '枫。',
  gender: '男',
  age: 25,
  city: '北京',
  signature: '热爱生活，热爱编程！'
})

// 帖子数据
const posts = ref([
  {
    id: 1,
    avatar: 'https://picsum.photos/id/64/100/100',
    userName: '枫。',
    publishTime: '2小时前',
    imageUrl: 'https://picsum.photos/id/0/600/400',
    title: '用n8n自动同步Notion数据到Excel的工作流',
    description: '无需代码，通过3个节点实现Notion数据库新增内容自动写入Excel，附详细步骤图和配置说明。',
    tags: ['n8n', '办公自动化', '开源免费'],
    likes: 128,
    favorites: 56,
    comments: 12
  },
  {
    id: 2,
    avatar: 'https://picsum.photos/id/64/100/100',
    userName: '枫。',
    publishTime: '5小时前',
    imageUrl: 'https://picsum.photos/id/1/600/400',
    title: 'Vue3 + TypeScript最佳实践指南',
    description: '分享在大型项目中Vue3和TypeScript的结合使用经验，包括类型定义、组件设计模式等。',
    tags: ['Vue3', 'TypeScript', '前端开发'],
    likes: 89,
    favorites: 34,
    comments: 8
  },
  {
    id: 3,
    avatar: 'https://picsum.photos/id/64/100/100',
    userName: '枫。',
    publishTime: '1天前',
    imageUrl: 'https://picsum.photos/id/2/600/400',
    title: 'Docker容器化部署实战',
    description: '从零开始学习Docker，包含镜像构建、容器编排、网络配置等实战内容。',
    tags: ['Docker', '容器化', 'DevOps'],
    likes: 156,
    favorites: 67,
    comments: 15
  },
  {
    id: 4,
    avatar: 'https://picsum.photos/id/65/100/100',
    userName: '技术达人',
    publishTime: '3天前',
    imageUrl: 'https://picsum.photos/id/3/600/400',
    title: 'React Hooks深度解析',
    description: '深入理解React Hooks的工作原理和使用技巧，包含自定义Hooks的实战案例。',
    tags: ['React', 'Hooks', '前端框架'],
    likes: 234,
    favorites: 89,
    comments: 23
  },
  {
    id: 5,
    avatar: 'https://picsum.photos/id/66/100/100',
    userName: '编程爱好者',
    publishTime: '1周前',
    imageUrl: 'https://picsum.photos/id/4/600/400',
    title: 'Python数据分析入门',
    description: '使用Pandas和Matplotlib进行数据分析和可视化，适合初学者入门。',
    tags: ['Python', '数据分析', '可视化'],
    likes: 178,
    favorites: 45,
    comments: 9
  }
])

// 收藏的帖子数据
const collectedPosts = ref([
  {
    id: 6,
    avatar: 'https://picsum.photos/id/67/100/100',
    userName: '架构师',
    publishTime: '2天前',
    imageUrl: 'https://picsum.photos/id/5/600/400',
    title: '微服务架构设计模式',
    description: '深入探讨微服务架构的各种设计模式，包括服务发现、负载均衡、熔断器等。',
    tags: ['微服务', '架构设计', '分布式'],
    likes: 312,
    favorites: 123,
    comments: 31
  },
  {
    id: 7,
    avatar: 'https://picsum.photos/id/68/100/100',
    userName: '全栈工程师',
    publishTime: '4天前',
    imageUrl: 'https://picsum.photos/id/6/600/400',
    title: 'Node.js性能优化指南',
    description: '分享Node.js应用的性能优化技巧，包括内存管理、异步编程、集群部署等。',
    tags: ['Node.js', '性能优化', '后端开发'],
    likes: 189,
    favorites: 78,
    comments: 17
  }
])

// 计算属性：按时间排序的帖子（最近）
const recentPosts = computed(() => {
  return [...posts.value].sort((a, b) => {
    // 简单的按ID排序模拟时间排序
    return b.id - a.id
  })
})

// 计算属性：按热度排序的帖子（工作流）
const hotPosts = computed(() => {
  return [...posts.value].sort((a, b) => b.likes - a.likes)
})

// 处理导航点击
const handleNavClick = (item) => {
  currentNav.value = item.id
}

// 初始化时加载用户信息
onMounted(() => {
  if (authStore.user) {
    // 如果有用户信息，使用真实数据
    const nickname = authStore.user.displayName || authStore.user.nickname || '用户'
    userNickname.value = nickname
    userAvatar.value = authStore.user.avatar || authStore.user.avatar_url || userAvatar.value
    
    // 更新用户资料
    userProfile.value.nickname = nickname
    userProfile.value.signature = authStore.user.signature || userProfile.value.signature
  } else {
    // 如果没有用户信息，使用默认值
    userNickname.value = '用户'
    userProfile.value.nickname = '用户'
  }
})
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
  left: 250px; /* 增加左边距，整体向右移动150px */
  bottom: -50px; /* 让头像部分超出头部背景，形成悬浮效果 */
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar {
  width: 150px;
  height: 150px;
  border-radius: 8px; /* 改为圆角正方形 */
  border: 3px solid #fff;
  overflow: hidden;
  background-color: #fff;
  flex-shrink: 0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  transform: translateY(-20px);
  transition: all 0.3s ease;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nickname {
  color: #ffffff;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
}

/* 空间标题样式 */
.space-title {
  position: absolute;
  left: 250px; /* 与头像左对齐 */
  top: 25px;
  color: white;
  font-size: 28px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

/* 导航栏样式 */
.nav {
  background-color: #f8f9fa;
  border-bottom: 1px solid #ddd;
  height: 50px;
  line-height: 50px;
  padding-left: 450px; /* 增加左边距，整体向右移动150px */
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

/* 主内容区域 */
.main-content {
  padding: 30px;
  margin-left: 50px; /* 整体向右移动50px，比原来往左增加100px */
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
  margin-left: 350px; /* 与导航栏的'最近'按钮左对齐 */
  margin-right: 100px; /* 缩短宽度，右边留出更多空间（增加50px） */
}

.content-section h2 {
  color: #333;
  margin-bottom: 20px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
}




</style>