-- 创建分类模板表
CREATE TABLE IF NOT EXISTS category_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(20) DEFAULT '#3498db',
    is_default BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 插入默认的分类模板数据
INSERT INTO category_templates (name, icon, color, is_default, sort_order) VALUES
('AI', 'uil-robot', '#3498db', false, 1),
('购物', 'uil-shopping-cart', '#e74c3c', false, 2),
('娱乐', 'uil-game-structure', '#9b59b6', false, 3),
('影视', 'uil-film', '#e67e22', false, 4),
('编程', 'uil-desktop', '#2ecc71', false, 5),
('音乐', 'uil-music', '#1abc9c', false, 6),
('学习', 'uil-book-open', '#34495e', false, 7),
('阅读', 'uil-book', '#16a085', false, 8),
('设计', 'uil-palette', '#8e44ad', false, 9),
('媒体', 'uil-play-circle', '#f39c12', true, 0);

-- 修改现有的 user_categories 表，添加 template_id 字段
ALTER TABLE user_categories ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES category_templates(id);

-- 为 user_categories 表添加索引
CREATE INDEX IF NOT EXISTS idx_user_categories_user_id ON user_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_categories_template_id ON user_categories(template_id);

-- 为分类模板表启用行级安全策略
ALTER TABLE category_templates ENABLE ROW LEVEL SECURITY;

-- 创建策略：所有用户都可以读取分类模板
CREATE POLICY "任何人都可以读取分类模板" ON category_templates
FOR SELECT USING (true);

-- 创建策略：只有管理员可以修改分类模板
CREATE POLICY "只有管理员可以修改分类模板" ON category_templates
FOR ALL USING (auth.role() = 'authenticated');

-- 为现有的 user_categories 表添加 RLS 策略（如果还没有）
ALTER TABLE user_categories ENABLE ROW LEVEL SECURITY;

-- 用户只能操作自己的分类
CREATE POLICY "用户只能查看自己的分类" ON user_categories
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能插入自己的分类" ON user_categories
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的分类" ON user_categories
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的分类" ON user_categories
FOR DELETE USING (auth.uid() = user_id);