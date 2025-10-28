-- 创建个人导航表
CREATE TABLE IF NOT EXISTS personal_navigation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    website_url VARCHAR(500) NOT NULL,
    website_name VARCHAR(100) NOT NULL,
    website_description TEXT,
    custom_icon_url VARCHAR(500), -- 只存储用户上传的自定义图片
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 为个人导航表启用行级安全策略
ALTER TABLE personal_navigation ENABLE ROW LEVEL SECURITY;

-- 用户只能操作自己的个人导航数据
CREATE POLICY "用户只能查看自己的个人导航" ON personal_navigation
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能插入自己的个人导航" ON personal_navigation
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的个人导航" ON personal_navigation
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的个人导航" ON personal_navigation
FOR DELETE USING (auth.uid() = user_id);

-- 为个人导航表添加索引
CREATE INDEX IF NOT EXISTS idx_personal_navigation_user_id ON personal_navigation(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_navigation_created_at ON personal_navigation(created_at);