-- 创建用户分类映射表
CREATE TABLE IF NOT EXISTS user_category_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES category_templates(id),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, template_id)
);

-- 为用户分类映射表启用行级安全策略
ALTER TABLE user_category_mappings ENABLE ROW LEVEL SECURITY;

-- 用户只能操作自己的分类映射
CREATE POLICY "用户只能查看自己的分类映射" ON user_category_mappings
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能插入自己的分类映射" ON user_category_mappings
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的分类映射" ON user_category_mappings
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的分类映射" ON user_category_mappings
FOR DELETE USING (auth.uid() = user_id);

-- 为用户分类映射表添加索引
CREATE INDEX IF NOT EXISTS idx_user_category_mappings_user_id ON user_category_mappings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_category_mappings_template_id ON user_category_mappings(template_id);

-- 为每个现有用户创建默认的媒体分类映射
INSERT INTO user_category_mappings (user_id, template_id, sort_order)
SELECT 
    u.id as user_id,
    ct.id as template_id,
    0 as sort_order
FROM auth.users u
CROSS JOIN category_templates ct
WHERE ct.name = '媒体' AND ct.is_default = true
AND NOT EXISTS (
    SELECT 1 FROM user_category_mappings ucm 
    WHERE ucm.user_id = u.id AND ucm.template_id = ct.id
);