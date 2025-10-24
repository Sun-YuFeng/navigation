-- 创建网站链接表
CREATE TABLE IF NOT EXISTS website_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    url VARCHAR(500) NOT NULL,
    icon VARCHAR(50) DEFAULT 'uil-globe',
    color VARCHAR(20) DEFAULT '#3498db',
    category_id UUID NOT NULL REFERENCES user_categories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 为网站链接表启用行级安全策略
ALTER TABLE website_links ENABLE ROW LEVEL SECURITY;

-- 用户只能操作自己的网站链接
CREATE POLICY "用户只能查看自己的网站链接" ON website_links
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能插入自己的网站链接" ON website_links
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的网站链接" ON website_links
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的网站链接" ON website_links
FOR DELETE USING (auth.uid() = user_id);

-- 为网站链接表添加索引
CREATE INDEX IF NOT EXISTS idx_website_links_user_id ON website_links(user_id);
CREATE INDEX IF NOT EXISTS idx_website_links_category_id ON website_links(category_id);
CREATE INDEX IF NOT EXISTS idx_website_links_sort_order ON website_links(sort_order);

-- 插入一些示例数据
INSERT INTO website_links (name, url, icon, color, category_id, user_id, sort_order) VALUES
('YouTube', 'https://www.youtube.com', 'uil-video', '#FF0000', 
    (SELECT id FROM user_categories WHERE name = '媒体' LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1), 1),
('Netflix', 'https://www.netflix.com', 'uil-film', '#E50914', 
    (SELECT id FROM user_categories WHERE name = '媒体' LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1), 2),
('Bilibili', 'https://www.bilibili.com', 'uil-play-circle', '#FB7299', 
    (SELECT id FROM user_categories WHERE name = '媒体' LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1), 3),
('QQ音乐', 'https://y.qq.com', 'uil-music', '#31C27C', 
    (SELECT id FROM user_categories WHERE name = '媒体' LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1), 4);