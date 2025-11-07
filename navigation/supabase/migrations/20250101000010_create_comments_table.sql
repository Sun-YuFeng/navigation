-- 创建评论表，支持无限级回复功能
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE DEFAULT NULL,
    content TEXT NOT NULL,
    reply_to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 确保内容不为空
    CHECK (content <> ''),
    
    -- 确保不能回复自己
    CHECK (reply_to_user_id != user_id OR reply_to_user_id IS NULL)
);

-- 禁用行级安全策略，使用自定义权限控制
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;

-- 为评论表添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_reply_to_user_id ON comments(reply_to_user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_like_count ON comments(like_count);
CREATE INDEX IF NOT EXISTS idx_comments_is_deleted ON comments(is_deleted);

-- 创建复合索引，用于快速查询特定帖子的评论树
CREATE INDEX IF NOT EXISTS idx_comments_post_parent ON comments(post_id, parent_id, created_at);

-- 创建触发器自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_comments_updated_at();

-- 创建函数来计算评论的回复数量
CREATE OR REPLACE FUNCTION get_comment_reply_count(comment_id UUID)
RETURNS INTEGER AS $$
DECLARE
    reply_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO reply_count 
    FROM comments 
    WHERE parent_id = comment_id AND is_deleted = FALSE;
    
    RETURN COALESCE(reply_count, 0);
END;
$$ LANGUAGE plpgsql;

-- 创建视图，方便查询评论详情及用户信息
CREATE OR REPLACE VIEW comment_details AS
SELECT 
    c.id,
    c.user_id,
    c.post_id,
    c.parent_id,
    c.content,
    c.reply_to_user_id,
    c.is_deleted,
    c.like_count,
    c.created_at,
    c.updated_at,
    up_author.display_name as author_name,
    up_author.avatar_url as author_avatar,
    up_reply.display_name as reply_to_name,
    up_reply.avatar_url as reply_to_avatar,
    get_comment_reply_count(c.id) as reply_count
FROM comments c
LEFT JOIN user_profiles up_author ON c.user_id = up_author.id
LEFT JOIN user_profiles up_reply ON c.reply_to_user_id = up_reply.id;

-- 创建视图，用于查询帖子的评论统计
CREATE OR REPLACE VIEW post_comment_stats AS
SELECT 
    post_id,
    COUNT(*) as total_comments,
    COUNT(CASE WHEN parent_id IS NULL THEN 1 END) as top_level_comments,
    SUM(like_count) as total_likes
FROM comments
WHERE is_deleted = FALSE
GROUP BY post_id;