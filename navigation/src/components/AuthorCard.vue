<template>
  <div class="author-card">
    <div class="card-content" @click="handleCardClick">
      <div class="avatar-area">
        <img :src="authorInfo?.avatar || '/src/assets/default.jpg'" alt="作者头像" class="avatar">
        <div>
          <div class="name">{{ authorInfo?.name || '匿名用户' }}</div>
          <div class="intro">{{ authorInfo?.bio || '个人简介：热爱技术分享，专注前端开发领域' }}</div>
        </div>
      </div>
      <div class="stats">
        <div class="stat-item">
          <div class="stat-num">{{ authorInfo?.articleCount || 37 }}</div>
          <div class="stat-label">原创</div>
        </div>
        <div class="stat-item">
          <div class="stat-num">
            <span v-if="isCalculating" class="loading-dots">...</span>
            <span v-else class="stat-num-text">{{ formatNumber(totalLikeCount) || 1117 }}</span>
          </div>
          <div class="stat-label">获赞</div>
        </div>
        <div class="stat-item">
          <div class="stat-num">
            <span v-if="isCalculatingFavorite" class="loading-dots">...</span>
            <span v-else class="stat-num-text">{{ formatNumber(totalFavoriteCount) || 4286 }}</span>
          </div>
          <div class="stat-label">收藏</div>
        </div>
        <div class="stat-item">
          <div class="stat-num">
            <span v-if="isCalculatingFollower" class="loading-dots">...</span>
            <span v-else class="stat-num-text">{{ formatNumber(totalFollowerCount) || 667 }}</span>
          </div>
          <div class="stat-label">粉丝</div>
        </div>
      </div>
    </div>
    <div v-if="!isCurrentUser" class="action-buttons">
      <button 
        class="btn" 
        :class="{ 
          'btn-follow': !isFollowing, 
          'btn-following': isFollowing,
          'btn-loading': isLoading
        }" 
        @click.stop="handleFollow"
        :disabled="isLoading"
      >
        <span v-if="isLoading">处理中...</span>
        <span v-else>{{ isFollowing ? '已关注' : '关注' }}</span>
      </button>
      <button class="btn btn-private" @click.stop="handlePrivateMessage">私信</button>
    </div>
    <div v-else class="action-buttons">
      <div class="self-prompt">这是您自己的主页</div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUserId, supabase } from '@/supabase.js'

// 定义组件属性
const props = defineProps({
  authorInfo: {
    type: Object,
    default: () => ({
      name: '匿名用户',
      avatar: '/src/assets/default.jpg',
      bio: '个人简介：热爱技术分享，专注前端开发领域',
      articleCount: 37,
      likeCount: 1117,
      favoriteCount: 4286,
      followerCount: 667
    })
  },
  authorId: {
    type: String,
    default: ''
  }
})

// 定义组件事件
const emit = defineEmits(['follow', 'privateMessage', 'profileClick'])

const router = useRouter()
const isFollowing = ref(false)
const isLoading = ref(false)
const totalLikeCount = ref(0)
const totalFavoriteCount = ref(0)
const totalFollowerCount = ref(0)
const isCalculating = ref(false)
const isCalculatingFavorite = ref(false)
const isCalculatingFollower = ref(false)

// 判断是否是当前用户
const isCurrentUser = computed(() => {
  const currentUserId = getCurrentUserId()
  const authorId = props.authorId || props.authorInfo?.id
  
  // 如果没有当前用户ID，则显示按钮
  if (!currentUserId) return false
  
  // 如果没有作者ID，则显示按钮
  if (!authorId) return false
  
  // 比较当前用户ID和作者ID
  return currentUserId === authorId
})

// 检查是否已经关注该作者
const checkFollowStatus = async () => {
  if (isCurrentUser.value) return
  
  const currentUserId = getCurrentUserId()
  const authorId = props.authorId || props.authorInfo?.id
  
  if (!currentUserId || !authorId) return
  
  try {
    const { data, error } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', currentUserId)
      .eq('followed_id', authorId)
      .maybeSingle()
    
    if (!error) {
      isFollowing.value = !!data
    }
  } catch (err) {
    console.error('检查关注状态失败:', err)
  }
}

// 处理关注按钮点击
const handleFollow = async () => {
  if (isLoading.value) return
  
  const currentUserId = getCurrentUserId()
  const authorId = props.authorId || props.authorInfo?.id
  
  if (!currentUserId || !authorId) {
    console.log('用户未登录或作者ID无效')
    return
  }
  
  if (isCurrentUser.value) {
    console.log('不能关注自己')
    return
  }
  
  isLoading.value = true
  
  try {
    if (isFollowing.value) {
      // 取消关注
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('followed_id', authorId)
      
      if (error) {
        console.error('取消关注失败:', error)
      } else {
        isFollowing.value = false
        console.log('取消关注成功')
      }
    } else {
      // 添加关注
      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: currentUserId,
          followed_id: authorId
        })
      
      if (error) {
        console.error('关注失败:', error)
      } else {
        isFollowing.value = true
        console.log('关注成功')
      }
    }
    
    // 触发事件通知父组件
    emit('follow', props.authorInfo)
  } catch (err) {
    console.error('关注操作失败:', err)
  } finally {
    isLoading.value = false
  }
}

// 获取作者所有帖子的点赞总数
const getAuthorTotalLikeCount = async () => {
  const authorId = props.authorId || props.authorInfo?.id
  
  if (!authorId) {
    totalLikeCount.value = props.authorInfo?.likeCount || 1117
    return
  }
  
  isCalculating.value = true
  
  try {
    // 使用 Supabase 的 aggregate 函数计算该作者所有帖子的点赞总数
    const { data, error } = await supabase
      .from('articles')
      .select('like_count')
      .eq('user_id', authorId)
    
    if (error) {
      console.error('获取作者帖子点赞总数失败:', error)
      totalLikeCount.value = props.authorInfo?.likeCount || 1117
      return
    }
    
    // 计算所有帖子的点赞总数
    const total = data.reduce((sum, article) => sum + (article.like_count || 0), 0)
    totalLikeCount.value = total
    
    console.log(`作者 ${authorId} 的帖子点赞总数: ${total}`)
  } catch (err) {
    console.error('计算作者帖子点赞总数失败:', err)
    totalLikeCount.value = props.authorInfo?.likeCount || 1117
  } finally {
    isCalculating.value = false
  }
}

// 获取用户收藏的帖子总数
const getUserTotalFavoriteCount = async () => {
  const authorId = props.authorId || props.authorInfo?.id
  
  if (!authorId) {
    totalFavoriteCount.value = props.authorInfo?.favoriteCount || 4286
    return
  }
  
  isCalculatingFavorite.value = true
  
  try {
    // 查询用户收藏的帖子总数
    const { data, error, count } = await supabase
      .from('user_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', authorId)
    
    if (error) {
      console.error('获取用户收藏帖子总数失败:', error)
      totalFavoriteCount.value = props.authorInfo?.favoriteCount || 4286
      return
    }
    
    // count 返回收藏的帖子数量
    totalFavoriteCount.value = count || 0
    
    console.log(`用户 ${authorId} 收藏的帖子总数: ${count}`)
  } catch (err) {
    console.error('计算用户收藏帖子总数失败:', err)
    totalFavoriteCount.value = props.authorInfo?.favoriteCount || 4286
  } finally {
    isCalculatingFavorite.value = false
  }
}

// 获取用户的粉丝数量（被关注的数量）
const getUserTotalFollowerCount = async () => {
  const authorId = props.authorId || props.authorInfo?.id
  
  if (!authorId) {
    totalFollowerCount.value = props.authorInfo?.followerCount || 667
    return
  }
  
  isCalculatingFollower.value = true
  
  try {
    // 查询用户被关注的数量（粉丝数）
    const { data, error, count } = await supabase
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('followed_id', authorId)  // 关注的目标是当前用户
    
    if (error) {
      console.error('获取用户粉丝数量失败:', error)
      totalFollowerCount.value = props.authorInfo?.followerCount || 667
      return
    }
    
    // count 返回粉丝数量
    totalFollowerCount.value = count || 0
    
    console.log(`用户 ${authorId} 的粉丝数量: ${count}`)
  } catch (err) {
    console.error('计算用户粉丝数量失败:', err)
    totalFollowerCount.value = props.authorInfo?.followerCount || 667
  } finally {
    isCalculatingFollower.value = false
  }
}

// 格式化数字显示
const formatNumber = (num) => {
  if (!num) return '0'
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  
  return num.toString()
}

// 初始化时检查关注状态并获取统计数据
onMounted(() => {
  checkFollowStatus()
  getAuthorTotalLikeCount()
  getUserTotalFavoriteCount()
  getUserTotalFollowerCount()
})

// 监听 authorId 或 authorInfo 的变化
watch(() => [props.authorId, props.authorInfo?.id], () => {
  checkFollowStatus()
  getAuthorTotalLikeCount()
  getUserTotalFavoriteCount()
  getUserTotalFollowerCount()
})

// 处理卡片点击（跳转到作者个人中心）
const handleCardClick = () => {
  const authorId = props.authorId || props.authorInfo?.id
  if (authorId) {
    router.push(`/person-center/${authorId}`)
  }
  // 触发事件通知父组件
  emit('profileClick', props.authorInfo)
}

// 处理私信按钮点击
const handlePrivateMessage = () => {
  emit('privateMessage', props.authorInfo)
}
</script>

<style scoped>
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

.card-content {
  cursor: pointer;
  transition: all 0.2s ease;
}

.card-content:hover {
  opacity: 0.9;
}

.card-content:active {
  transform: scale(0.98);
}

.card-content {
  cursor: pointer;
  transition: all 0.2s ease;
}

.card-content:hover {
  opacity: 0.9;
}

.card-content:active {
  transform: scale(0.98);
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

/* 确保获赞数字样式与其他统计数字一致 */
.stat-num-text {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  display: inline;
  font-family: inherit;
  line-height: inherit;
}

/* 加载动画样式 */
.loading-dots {
  display: inline-block;
  color: #9ca3af;
  font-family: monospace;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
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

.self-prompt {
  text-align: center;
  color: #6b7280;
  font-size: 14px;
  font-style: italic;
  padding: 10px 0;
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

.btn-following {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
  color: white;
}

.btn-following:hover {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(156, 163, 175, 0.3);
}

.btn-loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-following {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
  color: white;
}

.btn-following:hover {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(156, 163, 175, 0.3);
}

.btn-loading {
  opacity: 0.7;
  cursor: not-allowed;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .author-card {
    padding: 12px;
  }
  
  .avatar {
    width: 48px;
    height: 48px;
  }
  
  .name {
    font-size: 14px;
  }
  
  .intro {
    font-size: 12px;
  }
  
  .stats {
    padding: 8px;
    margin: 12px 0;
  }
  
  .stat-num {
    font-size: 14px;
  }
  
  .stat-label {
    font-size: 10px;
  }
  
  .author-card .btn {
    padding: 8px 12px;
    font-size: 12px;
  }
}
</style>