-- 为articles表添加互动统计字段
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS favorite_count INTEGER DEFAULT 0;

-- 为统计字段添加约束，确保不能为负数
ALTER TABLE articles 
ADD CONSTRAINT view_count_non_negative CHECK (view_count >= 0),
ADD CONSTRAINT like_count_non_negative CHECK (like_count >= 0),
ADD CONSTRAINT favorite_count_non_negative CHECK (favorite_count >= 0);

-- 为统计字段添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_articles_view_count ON articles(view_count);
CREATE INDEX IF NOT EXISTS idx_articles_like_count ON articles(like_count);
CREATE INDEX IF NOT EXISTS idx_articles_favorite_count ON articles(favorite_count);

-- 创建用户互动记录表，用于记录用户的点赞和收藏行为
CREATE TABLE IF NOT EXISTS article_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('like', 'favorite')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(article_id, user_id, interaction_type)
);

-- 为用户互动记录表启用行级安全策略
ALTER TABLE article_interactions ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的互动记录
CREATE POLICY "用户只能查看自己的互动记录" ON article_interactions
FOR SELECT USING (auth.uid() = user_id);

-- 用户只能插入自己的互动记录
CREATE POLICY "用户只能插入自己的互动记录" ON article_interactions
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的互动记录
CREATE POLICY "用户只能更新自己的互动记录" ON article_interactions
FOR UPDATE USING (auth.uid() = user_id);

-- 用户只能删除自己的互动记录
CREATE POLICY "用户只能删除自己的互动记录" ON article_interactions
FOR DELETE USING (auth.uid() = user_id);

-- 为互动记录表添加索引
CREATE INDEX IF NOT EXISTS idx_article_interactions_article_id ON article_interactions(article_id);
CREATE INDEX IF NOT EXISTS idx_article_interactions_user_id ON article_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_article_interactions_type ON article_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_article_interactions_created_at ON article_interactions(created_at);

-- 创建视图，方便查询文章的互动统计
CREATE OR REPLACE VIEW article_stats AS
SELECT 
    a.id,
    a.article_title,
    a.view_count,
    a.like_count,
    a.favorite_count,
    COUNT(DISTINCT CASE WHEN ai.interaction_type = 'like' THEN ai.user_id END) as unique_likes,
    COUNT(DISTINCT CASE WHEN ai.interaction_type = 'favorite' THEN ai.user_id END) as unique_favorites,
    a.created_at,
    a.updated_at
FROM articles a
LEFT JOIN article_interactions ai ON a.id = ai.article_id
GROUP BY a.id, a.article_title, a.view_count, a.like_count, a.favorite_count, a.created_at, a.updated_at;

-- 创建函数来增加文章浏览量
CREATE OR REPLACE FUNCTION increment_article_view_count(article_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE articles 
    SET view_count = view_count + 1,
        updated_at = NOW()
    WHERE id = article_uuid;
END;
$$ LANGUAGE plpgsql;

-- 创建函数来处理点赞操作
CREATE OR REPLACE FUNCTION toggle_article_like(article_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    existing_like BOOLEAN;
BEGIN
    -- 检查是否已经点赞
    SELECT EXISTS(
        SELECT 1 FROM article_interactions 
        WHERE article_id = article_uuid 
        AND user_id = user_uuid 
        AND interaction_type = 'like'
    ) INTO existing_like;
    
    IF existing_like THEN
        -- 取消点赞
        DELETE FROM article_interactions 
        WHERE article_id = article_uuid 
        AND user_id = user_uuid 
        AND interaction_type = 'like';
        
        UPDATE articles 
        SET like_count = GREATEST(0, like_count - 1),
            updated_at = NOW()
        WHERE id = article_uuid;
        
        RETURN FALSE;
    ELSE
        -- 添加点赞
        INSERT INTO article_interactions (article_id, user_id, interaction_type)
        VALUES (article_uuid, user_uuid, 'like');
        
        UPDATE articles 
        SET like_count = like_count + 1,
            updated_at = NOW()
        WHERE id = article_uuid;
        
        RETURN TRUE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建函数来处理收藏操作
CREATE OR REPLACE FUNCTION toggle_article_favorite(article_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    existing_favorite BOOLEAN;
BEGIN
    -- 检查是否已经收藏
    SELECT EXISTS(
        SELECT 1 FROM article_interactions 
        WHERE article_id = article_uuid 
        AND user_id = user_uuid 
        AND interaction_type = 'favorite'
    ) INTO existing_favorite;
    
    IF existing_favorite THEN
        -- 取消收藏
        DELETE FROM article_interactions 
        WHERE article_id = article_uuid 
        AND user_id = user_uuid 
        AND interaction_type = 'favorite';
        
        UPDATE articles 
        SET favorite_count = GREATEST(0, favorite_count - 1),
            updated_at = NOW()
        WHERE id = article_uuid;
        
        RETURN FALSE;
    ELSE
        -- 添加收藏
        INSERT INTO article_interactions (article_id, user_id, interaction_type)
        VALUES (article_uuid, user_uuid, 'favorite');
        
        UPDATE articles 
        SET favorite_count = favorite_count + 1,
            updated_at = NOW()
        WHERE id = article_uuid;
        
        RETURN TRUE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_article_interactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_article_interactions_updated_at
    BEFORE UPDATE ON article_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_article_interactions_updated_at();