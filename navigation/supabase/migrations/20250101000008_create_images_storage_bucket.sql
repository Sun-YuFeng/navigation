-- 创建images存储桶（绕过RLS的自定义认证方案）
-- 由于使用自定义认证，需要禁用RLS或使用服务端密钥

-- 1. 创建存储桶（如果不存在）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('images', 'images', true, 5242880, '{"image/jpeg","image/png","image/gif"}')
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = '{"image/jpeg","image/png","image/gif"}';

-- 2. 禁用存储桶的RLS策略（因为使用自定义认证）
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 3. 删除所有现有的存储策略（避免冲突）
DROP POLICY IF EXISTS "任何人都可以读取图片" ON storage.objects;
DROP POLICY IF EXISTS "认证用户可以上传图片" ON storage.objects;
DROP POLICY IF EXISTS "用户只能删除自己的图片" ON storage.objects;

-- 4. 创建宽松的存储策略（允许匿名访问，因为使用自定义认证）
-- 读取策略：任何人都可以读取
CREATE POLICY "任何人都可以读取图片" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- 上传策略：任何人都可以上传（通过服务端密钥控制）
CREATE POLICY "任何人都可以上传图片" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'images');

-- 删除策略：任何人都可以删除（通过服务端密钥控制）
CREATE POLICY "任何人都可以删除图片" ON storage.objects
FOR DELETE USING (bucket_id = 'images');

-- 5. 重新启用RLS（但策略已经设置为宽松）
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 6. 创建存储桶检查函数（用于前端验证）
CREATE OR REPLACE FUNCTION check_storage_bucket_exists(bucket_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = bucket_name
    );
END;
$$ LANGUAGE plpgsql;