-- 创建文章表
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    link_type VARCHAR(50),
    template_link TEXT,
    api_link TEXT,
    repository_link TEXT,
    platforms JSONB,
    tags JSONB,
    uploaded_files JSONB,
    cover_image TEXT, -- 新增封面字段
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 为文章表启用行级安全策略
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- 任何人都可以查看文章
CREATE POLICY "任何人都可以查看文章" ON articles
FOR SELECT USING (true);

-- 用户只能插入自己的文章
CREATE POLICY "用户只能插入自己的文章" ON articles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的文章
CREATE POLICY "用户只能更新自己的文章" ON articles
FOR UPDATE USING (auth.uid() = user_id);

-- 用户只能删除自己的文章
CREATE POLICY "用户只能删除自己的文章" ON articles
FOR DELETE USING (auth.uid() = user_id);

-- 为文章表添加索引
CREATE INDEX IF NOT EXISTS idx_articles_user_id ON articles(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at);
CREATE INDEX IF NOT EXISTS idx_articles_view_count ON articles(view_count);
CREATE INDEX IF NOT EXISTS idx_articles_like_count ON articles(like_count);
CREATE INDEX IF NOT EXISTS idx_articles_favorite_count ON articles(favorite_count);

-- 创建触发器自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_articles_updated_at();