-- 用户关注表创建脚本
-- 请在Supabase Dashboard的SQL编辑器中执行以下SQL语句

-- 1. 创建用户关注表
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 确保一个用户不能重复关注同一个用户
    UNIQUE(follower_id, followed_id),
    
    -- 确保用户不能关注自己
    CHECK (follower_id != followed_id)
);

-- 2. 启用行级安全策略
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- 3. 创建行级安全策略
-- 用户只能查看自己的关注关系
CREATE POLICY "用户只能查看自己的关注关系" ON user_follows
FOR SELECT USING (
    auth.uid() = follower_id OR 
    auth.uid() = followed_id
);

-- 用户只能插入自己的关注记录
CREATE POLICY "用户只能插入自己的关注记录" ON user_follows
FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- 用户只能更新自己的关注记录
CREATE POLICY "用户只能更新自己的关注记录" ON user_follows
FOR UPDATE USING (auth.uid() = follower_id);

-- 用户只能删除自己的关注记录
CREATE POLICY "用户只能删除自己的关注记录" ON user_follows
FOR DELETE USING (auth.uid() = follower_id);

-- 4. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_followed_id ON user_follows(followed_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_created_at ON user_follows(created_at);

-- 5. 创建触发器自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_user_follows_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_follows_updated_at
    BEFORE UPDATE ON user_follows
    FOR EACH ROW
    EXECUTE FUNCTION update_user_follows_updated_at();

-- 6. 验证表是否创建成功
SELECT '用户关注表创建成功!' as result;