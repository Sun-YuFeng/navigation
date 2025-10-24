-- 修复用户分类映射表的RLS策略
-- 删除原有的INSERT策略
DROP POLICY IF EXISTS "用户只能插入自己的分类映射" ON user_category_mappings;

-- 重新创建正确的INSERT策略
CREATE POLICY "用户只能插入自己的分类映射" ON user_category_mappings
FOR INSERT WITH CHECK (auth.uid() = user_id);