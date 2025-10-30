-- 创建广场分享网站表
CREATE TABLE IF NOT EXISTS shared_websites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    url VARCHAR(500) NOT NULL,
    avatar VARCHAR(500), -- 用户上传的图标URL
    description TEXT, -- 简要描述
    click_times INTEGER DEFAULT 0, -- 点击次数
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 添加约束
    CONSTRAINT valid_url CHECK (url ~ '^https?://'),
    CONSTRAINT valid_click_times CHECK (click_times >= 0)
);

-- 为广场分享网站表添加索引
CREATE INDEX IF NOT EXISTS idx_shared_websites_user_id ON shared_websites(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_websites_created_at ON shared_websites(created_at);
CREATE INDEX IF NOT EXISTS idx_shared_websites_click_times ON shared_websites(click_times);

-- 启用行级安全策略
ALTER TABLE shared_websites ENABLE ROW LEVEL SECURITY;

-- 创建策略：所有用户都可以查看广场分享的网站
CREATE POLICY "任何人都可以查看广场分享的网站" ON shared_websites
    FOR SELECT USING (true);

-- 创建策略：认证用户可以添加分享网站
CREATE POLICY "认证用户可以添加分享网站" ON shared_websites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 创建策略：用户只能更新自己分享的网站
CREATE POLICY "用户只能更新自己分享的网站" ON shared_websites
    FOR UPDATE USING (auth.uid() = user_id);

-- 创建策略：用户只能删除自己分享的网站
CREATE POLICY "用户只能删除自己分享的网站" ON shared_websites
    FOR DELETE USING (auth.uid() = user_id);

-- 创建触发器自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_shared_websites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_shared_websites_updated_at
    BEFORE UPDATE ON shared_websites
    FOR EACH ROW
    EXECUTE FUNCTION update_shared_websites_updated_at();