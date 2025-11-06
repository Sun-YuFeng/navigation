-- 创建用户关注表，用于记录用户之间的关注关系
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- 关注者ID
    followed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- 被关注者ID
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 确保一个用户不能重复关注同一个用户
    UNIQUE(follower_id, followed_id),
    
    -- 确保用户不能关注自己
    CHECK (follower_id != followed_id)
);

-- 为用户关注表启用行级安全策略
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

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

-- 为用户关注表添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_followed_id ON user_follows(followed_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_created_at ON user_follows(created_at);

-- 创建函数来处理关注/取消关注操作
CREATE OR REPLACE FUNCTION toggle_user_follow(follower_uuid UUID, followed_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    existing_follow BOOLEAN;
BEGIN
    -- 检查是否已经关注
    SELECT EXISTS(
        SELECT 1 FROM user_follows 
        WHERE follower_id = follower_uuid 
        AND followed_id = followed_uuid
    ) INTO existing_follow;
    
    IF existing_follow THEN
        -- 取消关注
        DELETE FROM user_follows 
        WHERE follower_id = follower_uuid 
        AND followed_id = followed_uuid;
        
        RETURN FALSE;
    ELSE
        -- 添加关注
        INSERT INTO user_follows (follower_id, followed_id)
        VALUES (follower_uuid, followed_uuid);
        
        RETURN TRUE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建视图，方便查询用户的关注统计
CREATE OR REPLACE VIEW user_follow_stats AS
SELECT 
    u.id as user_id,
    u.email,
    up.display_name,
    up.avatar_url,
    COUNT(DISTINCT uf1.followed_id) as following_count,
    COUNT(DISTINCT uf2.follower_id) as follower_count
FROM users u
LEFT JOIN user_profiles up ON u.id = up.id
LEFT JOIN user_follows uf1 ON u.id = uf1.follower_id
LEFT JOIN user_follows uf2 ON u.id = uf2.followed_id
GROUP BY u.id, u.email, up.display_name, up.avatar_url;

-- 创建视图，方便查询用户的关注列表
CREATE OR REPLACE VIEW user_following_list AS
SELECT 
    uf.follower_id,
    uf.followed_id,
    up_follower.display_name as follower_name,
    up_follower.avatar_url as follower_avatar,
    up_followed.display_name as followed_name,
    up_followed.avatar_url as followed_avatar,
    uf.created_at
FROM user_follows uf
LEFT JOIN user_profiles up_follower ON uf.follower_id = up_follower.id
LEFT JOIN user_profiles up_followed ON uf.followed_id = up_followed.id;

-- 创建触发器自动更新updated_at字段
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