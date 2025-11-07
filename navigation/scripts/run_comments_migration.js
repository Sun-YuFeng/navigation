import { supabase } from '../src/supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250101000010_create_comments_table.sql');
const sqlContent = fs.readFileSync(migrationPath, 'utf8');

async function runCommentsMigration() {
  console.log('开始执行评论表迁移...');
  
  try {
    // 先检查Supabase连接
    console.log('检查Supabase连接...');
    const { data: testData, error: testError } = await supabase.from('users').select('count').limit(1);
    
    if (testError && testError.code !== '42P01') { // 如果不是表不存在的错误
      console.error('Supabase连接失败:', testError);
      return;
    }
    
    console.log('Supabase连接成功!');
    
    // 使用Supabase的SQL函数执行迁移
    console.log('执行评论表迁移SQL...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('使用rpc执行迁移失败:', error);
      console.log('尝试逐条执行SQL语句...');
      await executeSqlStatements(sqlContent);
    } else {
      console.log('评论表迁移执行成功!');
    }
  } catch (err) {
    console.error('迁移过程中发生错误:', err);
    console.log('尝试使用备选方案执行迁移...');
    await executeSqlStatements(sqlContent);
  }
}

async function executeSqlStatements(sqlContent) {
  // 分割SQL语句（简单的按分号分割）
  const statements = sqlContent
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);

  console.log(`发现 ${statements.length} 条SQL语句`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (stmt.trim() === '') continue;
    
    try {
      console.log(`执行第 ${i + 1} 条语句: ${stmt.substring(0, 100)}...`);
      
      // 跳过空语句
      if (stmt === '') continue;
      
      // 尝试使用rpc执行
      const { error } = await supabase.rpc('exec_sql', { sql: stmt + ';' });
      
      if (error) {
        console.error(`执行语句失败:`, error);
        
        // 如果是表创建语句，尝试手动执行
        if (stmt.toLowerCase().includes('create table')) {
          console.log('尝试手动创建表...');
          await createCommentsTableManually();
          break;
        }
      } else {
        console.log(`语句执行成功`);
      }
    } catch (err) {
      console.error(`执行语句时发生错误:`, err);
    }
  }
}

// 手动创建评论表的核心SQL语句
async function createCommentsTableManually() {
  console.log('\n=== 手动创建评论表 ===');
  
  const coreSql = `
    -- 创建评论表，支持无限级回复功能
    CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        post_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
        parent_id UUID REFERENCES comments(id) ON DELETE CASCADE DEFAULT NULL,
        content TEXT NOT NULL,
        reply_to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT NULL,
        is_deleted BOOLEAN DEFAULT FALSE,
        like_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        
        -- 确保内容不为空
        CHECK (content <> ''),
        
        -- 确保不能回复自己
        CHECK (reply_to_user_id != user_id OR reply_to_user_id IS NULL)
    );

    -- 禁用行级安全策略，使用自定义权限控制
    ALTER TABLE comments DISABLE ROW LEVEL SECURITY;

    -- 为评论表添加索引以提高查询性能
    CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
    CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
    CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
    CREATE INDEX IF NOT EXISTS idx_comments_reply_to_user_id ON comments(reply_to_user_id);
    CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
    CREATE INDEX IF NOT EXISTS idx_comments_like_count ON comments(like_count);
    CREATE INDEX IF NOT EXISTS idx_comments_is_deleted ON comments(is_deleted);
    CREATE INDEX IF NOT EXISTS idx_comments_post_parent ON comments(post_id, parent_id, created_at);
  `;

  try {
    console.log('执行核心表创建语句...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: coreSql });
    
    if (error) {
      console.error('手动创建表失败:', error);
      console.log('\n⚠️ 无法自动创建表，请手动在Supabase Dashboard中执行SQL语句');
      console.log('请在Supabase Dashboard的SQL编辑器中执行以下SQL:');
      console.log(coreSql);
    } else {
      console.log('手动创建评论表成功!');
      
      // 验证表是否创建成功
      await verifyTableCreation();
    }
  } catch (err) {
    console.error('手动创建表时发生错误:', err);
    console.log('\n⚠️ 无法自动创建表，请手动在Supabase Dashboard中执行SQL语句');
    console.log('请在Supabase Dashboard的SQL编辑器中执行以下SQL:');
    console.log(coreSql);
  }
}

async function verifyTableCreation() {
  console.log('\n=== 验证表创建结果 ===');
  
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('验证失败 - 表可能不存在:', error);
    } else {
      console.log('✅ 评论表创建成功!');
      console.log('表结构验证通过');
    }
  } catch (err) {
    console.error('验证过程中发生错误:', err);
  }
}

// 运行迁移
runCommentsMigration().then(() => {
  console.log('\n=== 评论表迁移执行完成 ===');
  console.log('如果自动迁移失败，请手动执行上述SQL语句');
}).catch(err => {
  console.error('迁移执行失败:', err);
});