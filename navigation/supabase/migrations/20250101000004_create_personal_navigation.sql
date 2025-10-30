-- 创建个人导航表
CREATE TABLE IF NOT EXISTS personal_navigation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    website_url VARCHAR(500) NOT NULL,
    website_name VARCHAR(100) NOT NULL,
    website_description TEXT,
    custom_icon_url VARCHAR(500), -- 只存储用户上传的自定义图片
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 禁用个人导航表的行级安全策略（直接使用应用层权限控制）
ALTER TABLE personal_navigation DISABLE ROW LEVEL SECURITY;

-- 为个人导航表添加索引
CREATE INDEX IF NOT EXISTS idx_personal_navigation_user_id ON personal_navigation(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_navigation_created_at ON personal_navigation(created_at);