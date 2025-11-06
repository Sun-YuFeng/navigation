import { supabase } from '../supabase.js'

/**
 * 获取浏览量前三的文章数据
 * @returns {Promise<Array>} 热门文章数据
 */
export const getTopViewedArticles = async () => {
  try {
    console.log('开始获取浏览量前三的文章数据...')
    
    // 查询浏览量前三的文章，同时关联查询用户信息
    const { data: articles, error } = await supabase
      .from('articles')
      .select(`
        id,
        article_title,
        description,
        cover_image,
        view_count,
        like_count,
        favorite_count,
        created_at,
        user_id,
        users!inner (
          username
        )
      `)
      .order('view_count', { ascending: false })
      .limit(3)
    
    if (error) {
      console.error('获取热门文章数据失败:', error)
      return []
    }
    
    console.log('成功获取热门文章数据:', articles)
    
    // 格式化数据为组件需要的格式
    const formattedArticles = articles.map((article, index) => {
      // 获取用户信息
      const user = article.users || {}
      const avatarUrl = '/src/assets/default.jpg'
      const userName = user.username || '用户' + (article.user_id?.slice(0, 8) || '未知')
      
      // 获取封面图片URL
      let coverImageUrl = '/src/assets/default.jpg'
      if (article.cover_image) {
        try {
          if (article.cover_image.startsWith('http://') || article.cover_image.startsWith('https://')) {
            coverImageUrl = article.cover_image
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('images')
              .getPublicUrl(article.cover_image)
            
            if (publicUrl) {
              coverImageUrl = publicUrl
            }
          }
        } catch (error) {
          console.warn('获取封面图片URL失败:', error)
        }
      }
      
      // 格式化使用人数（使用view_count）
      const usageCount = formatUsageCount(article.view_count)
      
      return {
        id: article.id,
        imageUrl: coverImageUrl,
        title: article.article_title || '无标题',
        usageCount: usageCount,
        viewCount: article.view_count || 0,
        likeCount: article.like_count || 0,
        favoriteCount: article.favorite_count || 0,
        userName: userName,
        userAvatar: avatarUrl,
        description: article.description || '暂无描述',
        createdAt: article.created_at
      }
    })
    
    return formattedArticles
  } catch (error) {
    console.error('获取热门文章数据时发生错误:', error)
    return []
  }
}

/**
 * 格式化使用人数显示
 * @param {number} count 原始数量
 * @returns {string} 格式化后的显示文本
 */
const formatUsageCount = (count) => {
  if (!count) return '0'
  
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  
  return count.toString()
}

/**
 * 增加文章浏览量
 * @param {string} articleId 文章ID
 * @returns {Promise<boolean>} 是否成功
 */
export const incrementArticleViewCount = async (articleId) => {
  try {
    const { error } = await supabase.rpc('increment_article_view_count', {
      article_uuid: articleId
    })
    
    if (error) {
      console.error('增加文章浏览量失败:', error)
      return false
    }
    
    console.log(`文章 ${articleId} 浏览量已增加`)
    return true
  } catch (error) {
    console.error('增加文章浏览量时发生错误:', error)
    return false
  }
}