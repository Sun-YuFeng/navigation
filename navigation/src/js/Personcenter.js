import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../supabase.js'

// 导出 composable 函数
export function usePersonCenter() {
  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()

  // 从路由参数获取 userId
  const userId = computed(() => route.params.userId || '')

  // 当前显示的用户ID（根据参数或当前登录用户）
  const currentUserId = computed(() => {
    return userId.value || authStore.user?.id || ''
  })

  // 判断当前页面是否是查看自己的个人中心
  const isViewingOwnProfile = computed(() => {
    if (!userId.value && authStore.user?.id) {
      return true // 没有指定userId，查看当前登录用户
    }
    return userId.value === authStore.user?.id
  })

  // 用户信息
  const userAvatar = ref('/src/assets/default-avatar.png')
  const userNickname = ref('')

  // AuthorCard组件数据
  const authorInfo = ref({
    name: '',
    avatar: '',
    bio: '',
    articleCount: 0,
    likeCount: 0,
    favoriteCount: 0,
    followerCount: 0
  })

  // 导航菜单
  const navItems = ref([
    { id: 'recently', name: '最近' },
    { id: 'workflow', name: '工作流' },
    { id: 'collect', name: '收藏' },
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
  const posts = ref([])
  const recentPosts = ref([])
  const hotPosts = ref([])
  const collectedPosts = ref([])

  // 关注用户数据
  const followingUsers = ref([])
  const followerUsers = ref([])

  // 加载用户文章数据
  const loadUserArticles = async () => {
    try {
      const targetUserId = currentUserId.value

      if (!targetUserId) {
        console.log('没有用户ID，无法加载文章')
        return
      }

      // 查询目标用户的所有文章，按创建时间倒序排列（用于最近动态）
      const { data: articles, error } = await supabase
        .from('articles')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('查询文章失败:', error)
        return
      }

      // 获取用户信息
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('display_name, avatar_url')
        .eq('id', targetUserId)
        .single()

      if (profileError) {
        console.error('查询用户信息失败:', profileError)
      }

      // 转换数据格式以匹配CompactCard组件
      const formattedPosts = articles.map(article => {
        // 解析tags字段，与market.vue保持一致
        let tags = []
        try {
          const tagData = JSON.parse(article.tags || '{}')
          if (tagData.content_type) tags.push(tagData.content_type)
          if (tagData.scenes && Array.isArray(tagData.scenes)) {
            tags = tags.concat(tagData.scenes.slice(0, 2))
          }
          if (tagData.attributes && Array.isArray(tagData.attributes)) {
            tags = tags.concat(tagData.attributes.slice(0, 1))
          }
        } catch (e) {
          console.warn('解析tags字段失败:', e)
        }

        // 如果没有解析到tags，使用默认tags
        if (tags.length === 0) {
          tags = ['工作流', '自动化']
        }

        return {
          id: article.id,
          avatar: userProfile?.avatar_url || '/src/assets/default-avatar.png',
          userName: userProfile?.display_name || '匿名用户',
          publishTime: formatTimeAgo(article.created_at),
          imageUrl: article.cover_image || 'https://picsum.photos/id/0/600/400',
          title: article.article_title,
          description: article.description || '暂无描述',
          tags: tags,
          likes: article.like_count || 0,
          favorites: article.favorite_count || 0,
          comments: 0 // 暂时设为0，后续可以添加评论功能
        }
      })

      posts.value = formattedPosts
      recentPosts.value = formattedPosts // 最近动态按创建时间排序

      // 工作流区域按点赞数排序（前端排序）
      hotPosts.value = [...formattedPosts].sort((a, b) => b.likes - a.likes)

      // 更新AuthorCard的原创字段为实际文章数量
      authorInfo.value.articleCount = formattedPosts.length

      console.log('加载用户文章成功:', formattedPosts.length)
    } catch (error) {
      console.error('加载文章数据失败:', error)
    }
  }

  // 加载用户收藏的帖子
  const loadUserFavorites = async () => {
    try {
      const targetUserId = currentUserId.value

      if (!targetUserId) {
        console.log('没有目标用户ID，无法加载收藏')
        return
      }

      // 查询目标用户收藏的帖子
      const { data: favorites, error } = await supabase
        .from('user_favorites')
        .select(`
        article_id,
        created_at,
        articles (
          id,
          article_title,
          description,
          cover_image,
          tags,
          like_count,
          favorite_count,
          created_at,
          user_id,
          users!articles_user_id_fkey (
            user_profiles (
              display_name,
              avatar_url
            )
          )
        )
      `)
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('查询收藏失败:', error)
        return
      }

      // 转换数据格式以匹配CompactCard组件
      const formattedFavorites = favorites.map(fav => {
        const article = fav.articles
        if (!article) return null

        // 解析tags字段
        let tags = []
        try {
          const tagData = JSON.parse(article.tags || '{}')
          if (tagData.content_type) tags.push(tagData.content_type)
          if (tagData.scenes && Array.isArray(tagData.scenes)) {
            tags = tags.concat(tagData.scenes.slice(0, 2))
          }
          if (tagData.attributes && Array.isArray(tagData.attributes)) {
            tags = tags.concat(tagData.attributes.slice(0, 1))
          }
        } catch (e) {
          console.warn('解析tags字段失败:', e)
        }

        // 如果没有解析到tags，使用默认tags
        if (tags.length === 0) {
          tags = ['工作流', '自动化']
        }

        return {
          id: article.id,
          avatar: article.users?.user_profiles?.avatar_url || '/src/assets/default-avatar.png',
          userName: article.users?.user_profiles?.display_name || '匿名用户',
          publishTime: formatTimeAgo(article.created_at),
          imageUrl: article.cover_image || 'https://picsum.photos/id/0/600/400',
          title: article.article_title,
          description: article.description || '暂无描述',
          tags: tags,
          likes: article.like_count || 0,
          favorites: article.favorite_count || 0,
          comments: 0
        }
      }).filter(Boolean) // 过滤掉null值

      collectedPosts.value = formattedFavorites
      console.log('加载用户收藏成功:', formattedFavorites.length)
    } catch (error) {
      console.error('加载收藏数据失败:', error)
    }
  }

  // 格式化时间显示
  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const postTime = new Date(timestamp)
    const diffInSeconds = Math.floor((now - postTime) / 1000)

    if (diffInSeconds < 60) {
      return '刚刚'
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}分钟前`
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}小时前`
    } else if (diffInSeconds < 2592000) {
      return `${Math.floor(diffInSeconds / 86400)}天前`
    } else {
      return postTime.toLocaleDateString('zh-CN')
    }
  }

  // 加载用户关注的用户列表
  const loadFollowingUsers = async () => {
    try {
      const targetUserId = currentUserId.value

      if (!targetUserId) {
        console.log('没有用户ID，无法加载关注用户')
        return
      }

      // 查询用户关注的人
      const { data: following, error } = await supabase
        .from('user_follows')
        .select(`
        followed_id,
        users!user_follows_followed_id_fkey (
          user_profiles (
            id,
            display_name,
            avatar_url,
            bio
          )
        )
      `)
        .eq('follower_id', targetUserId)

      if (error) {
        console.error('查询关注用户失败:', error)
        return
      }

      // 检查当前登录用户是否已经关注了这些用户
      const currentUserFollowStatus = await getCurrentUserFollowStatus(following.map(f => f.followed_id))

      // 转换数据格式
      const formattedFollowing = following.map(follow => {
        const user = follow.users?.user_profiles
        if (!user) return null

        return {
          id: follow.followed_id,
          name: user.display_name || '匿名用户',
          avatar: user.avatar_url || '/src/assets/default-avatar.png',
          description: user.bio || '暂无个人简介',
          isFollowing: currentUserFollowStatus[follow.followed_id] || false
        }
      }).filter(Boolean)

      followingUsers.value = formattedFollowing
      console.log('加载关注用户成功:', formattedFollowing.length)
    } catch (error) {
      console.error('加载关注用户数据失败:', error)
    }
  }

  // 检查当前登录用户是否已经关注了指定用户列表
  const getCurrentUserFollowStatus = async (followedIds) => {
    try {
      const currentUserId = authStore.user?.id

      // 如果没有登录用户，则全部返回false
      if (!currentUserId || followedIds.length === 0) {
        return {}
      }

      // 查询当前登录用户是否关注了这些用户
      const { data: currentUserFollows, error } = await supabase
        .from('user_follows')
        .select('followed_id')
        .eq('follower_id', currentUserId)
        .in('followed_id', followedIds)

      if (error) {
        console.error('查询当前用户关注状态失败:', error)
        return {}
      }

      // 构建关注状态映射
      const followStatus = {}
      currentUserFollows.forEach(follow => {
        followStatus[follow.followed_id] = true
      })

      return followStatus
    } catch (error) {
      console.error('获取用户关注状态时出错:', error)
      return {}
    }
  }

  // 处理导航点击
  const handleNavClick = async (item) => {
    currentNav.value = item.id

    // 如果点击的是收藏，加载收藏数据
    if (item.id === 'collect') {
      await loadUserFavorites()
    }

    // 如果点击的是关注，加载关注用户数据
    if (item.id === 'attention') {
      await loadFollowingUsers()
    }
  }

  // 处理帖子点击，跳转到详情页
  const handlePostClick = async (postId) => {
    if (postId) {
      try {
        // 先调用数据库函数增加浏览量
        const { error } = await supabase.rpc('increment_article_view_count', {
          article_uuid: postId
        })

        if (error) {
          console.error('增加浏览量失败:', error)
        } else {
          console.log(`文章 ${postId} 浏览量已增加`)
        }
      } catch (err) {
        console.error('调用增加浏览量函数时出错:', err)
      }

      // 跳转到详情页
      router.push(`/detail/${postId}`)
    }
  }

  // AuthorCard组件事件处理
  const handleFollow = (author) => {
    console.log('关注作者:', author.name)
    // 这里可以添加关注逻辑
  }

  // 处理关注用户操作
  const handleFollowUser = async (user) => {
    try {
      // 如果没有登录，提示用户登录
      if (!authStore.user?.id) {
        alert('请先登录后再进行关注操作')
        return
      }

      const currentUserId = authStore.user.id
      const targetUserId = user.id

      // 如果是查看自己的关注列表，只能进行取消关注操作
      if (isViewingOwnProfile.value) {
        // 确认取消关注
        if (confirm(`确定要取消关注 ${user.name} 吗？`)) {
          const { error } = await supabase
            .from('user_follows')
            .delete()
            .eq('follower_id', currentUserId)
            .eq('followed_id', targetUserId)

          if (error) {
            console.error('取消关注失败:', error)
            alert('取消关注失败，请重试')
          } else {
            // 更新本地状态
            user.isFollowing = false
            // 从关注列表中移除该用户
            followingUsers.value = followingUsers.value.filter(u => u.id !== targetUserId)
            console.log('取消关注成功')
          }
        }
      } else {
        // 查看他人关注列表，可以进行关注/取消关注
        if (user.isFollowing) {
          // 取消关注
          const { error } = await supabase
            .from('user_follows')
            .delete()
            .eq('follower_id', currentUserId)
            .eq('followed_id', targetUserId)

          if (error) {
            console.error('取消关注失败:', error)
            alert('取消关注失败，请重试')
          } else {
            // 更新本地状态
            user.isFollowing = false
            console.log('取消关注成功')
          }
        } else {
          // 关注用户
          const { error } = await supabase
            .from('user_follows')
            .insert({
              follower_id: currentUserId,
              followed_id: targetUserId
            })

          if (error) {
            console.error('关注失败:', error)
            alert('关注失败，请重试')
          } else {
            // 更新本地状态
            user.isFollowing = true
            console.log('关注成功')
          }
        }
      }
    } catch (error) {
      console.error('处理关注操作时出错:', error)
      alert('操作失败，请重试')
    }
  }

  // 处理用户点击事件，跳转到该用户的个人中心
  const handleUserClick = (user) => {
    if (user.id) {
      // 跳转到该用户的个人中心页面，传递用户ID
      router.push(`/person-center/${user.id}`)
    }
  }

  // 获取关注按钮的文本
  const getFollowButtonText = (user) => {
    if (isViewingOwnProfile.value) {
      return '已关注'
    }
    return user.isFollowing ? '已关注' : '+ 关注'
  }

  // 处理删除帖子操作
  const handleDeletePost = async (post) => {
    try {
      // 确认是否删除
      if (confirm(`确定要删除帖子《${post.title}》吗？此操作不可撤销。`)) {
        // 调用数据库删除文章
        const { error } = await supabase
          .from('articles')
          .delete()
          .eq('id', post.id)

        if (error) {
          console.error('删除帖子失败:', error)
          alert('删除帖子失败，请重试')
        } else {
          console.log('删除帖子成功')

          // 从本地数据中移除该帖子
          posts.value = posts.value.filter(p => p.id !== post.id)
          recentPosts.value = recentPosts.value.filter(p => p.id !== post.id)
          hotPosts.value = hotPosts.value.filter(p => p.id !== post.id)

          // 更新AuthorCard的文章数量
          authorInfo.value.articleCount = posts.value.length

          alert('帖子删除成功')
        }
      }
    } catch (error) {
      console.error('处理删除帖子时出错:', error)
      alert('删除失败，请重试')
    }
  }

  // 从数据库获取用户资料
  const fetchUserProfile = async () => {
    try {
      const targetUserId = currentUserId.value

      if (!targetUserId) {
        console.log('没有用户ID，使用默认数据')
        setDefaultUserData()
        return
      }

      // 查询用户资料表
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', targetUserId)
        .single()

      if (error) {
        console.error('获取用户资料失败:', error)
        // 使用默认数据
        setDefaultUserData()
        return
      }

      if (data) {
        // 更新用户信息
        userNickname.value = data.display_name || '用户'
        userAvatar.value = data.avatar_url || '/src/assets/default-avatar.png'

        // 更新AuthorCard数据
        authorInfo.value = {
          name: data.display_name || '用户',
          avatar: data.avatar_url || '/src/assets/default-avatar.png',
          bio: data.bio || '热爱生活，热爱编程！专注于前端开发和自动化工具',
          articleCount: 0, // 这些字段在表中不存在，使用默认值
          likeCount: 0,
          favoriteCount: 0,
          followerCount: 0
        }

        // 更新用户资料
        userProfile.value.nickname = data.display_name || '用户'
        userProfile.value.signature = data.bio || '热爱生活，热爱编程！'
      } else {
        // 如果没有用户资料记录，使用默认数据
        setDefaultUserData()
      }
    } catch (error) {
      console.error('获取用户资料时发生错误:', error)
      setDefaultUserData()
    }
  }

  // 设置默认用户数据
  const setDefaultUserData = () => {
    userNickname.value = '用户'
    userProfile.value.nickname = '用户'
    authorInfo.value = {
      name: '枫。',
      avatar: '/src/assets/default-avatar.png',
      bio: '热爱生活，热爱编程！专注于前端开发和自动化工具',
      articleCount: 37,
      likeCount: 1117,
      favoriteCount: 4286,
      followerCount: 667
    }
  }

  // 初始化时加载用户信息和文章数据
  onMounted(async () => {
    await fetchUserProfile()
    await loadUserArticles()
  })

  // 监听用户ID变化，重新加载数据
  watch(currentUserId, async (newUserId, oldUserId) => {
    if (newUserId && newUserId !== oldUserId) {
      console.log('用户ID发生变化，重新加载数据:', newUserId)
      await fetchUserProfile()
      await loadUserArticles()

      // 如果当前正在查看收藏页，重新加载收藏数据
      if (currentNav.value === 'collect') {
        await loadUserFavorites()
      }

      // 如果当前正在查看关注页，重新加载关注用户数据
      if (currentNav.value === 'attention') {
        await loadFollowingUsers()
      }
    }
  })

  // 返回所有需要在模板中使用的数据和方法
  return {
    // 响应式数据
    userAvatar,
    userNickname,
    authorInfo,
    navItems,
    currentNav,
    userProfile,
    posts,
    recentPosts,
    hotPosts,
    collectedPosts,
    followingUsers,
    followerUsers,
    currentUserId,
    isViewingOwnProfile,
    // 方法
    handleNavClick,
    handlePostClick,
    handleFollow,
    handleFollowUser,
    handleUserClick,
    getFollowButtonText,
    handleDeletePost
  }
}