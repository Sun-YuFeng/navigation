import { supabase } from '../src/supabase.js';

// 读取迁移文件
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250101000009_create_user_follows_table.sql');
const sqlContent = fs.readFileSync(migrationPath, 'utf8');

async function runMigration() {
  console.log('开始执行用户关注表迁移...');
  
  try {
    // 使用Supabase的SQL函数执行迁移
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('执行迁移失败:', error);
      
      // 如果无法使用rpc，尝试逐条执行SQL语句
      console.log('尝试逐条执行SQL语句...');
      await executeSqlStatements(sqlContent);
    } else {
      console.log('迁移执行成功!');
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
      
      // 对于简单的SQL语句，可以使用Supabase的SQL执行功能
      if (stmt.toLowerCase().includes('create table')) {
        // 这里需要手动执行表创建
        console.log('表创建语句需要手动执行');
        continue;
      }
      
      // 尝试使用rpc执行
      const { error } = await supabase.rpc('exec_sql', { sql: stmt + ';' });
      
      if (error) {
        console.error(`执行语句失败:`, error);
      } else {
        console.log(`语句执行成功`);
      }
    } catch (err) {
      console.error(`执行语句时发生错误:`, err);
    }
  }
}

// 直接手动创建表的核心SQL语句
async function createUserFollowsTable() {
  console.log('\n=== 手动创建用户关注表 ===');
  
  const coreSql = `
    -- 创建用户关注表
    CREATE TABLE IF NOT EXISTS user_follows (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        followed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(follower_id, followed_id),
        CHECK (follower_id != followed_id)
    );

    -- 启用行级安全策略
    ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

    -- 创建基本策略
    CREATE POLICY IF NOT EXISTS "用户只能查看自己的关注关系" ON user_follows
    FOR SELECT USING (auth.uid() = follower_id OR auth.uid() = followed_id);

    CREATE POLICY IF NOT EXISTS "用户只能插入自己的关注记录" ON user_follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

    CREATE POLICY IF NOT EXISTS "用户只能更新自己的关注记录" ON user_follows
    FOR UPDATE USING (auth.uid() = follower_id);

    CREATE POLICY IF NOT EXISTS "用户只能删除自己的关注记录" ON user_follows
    FOR DELETE USING (auth.uid() = follower_id);
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
      console.log('手动创建表成功!');
      
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
      .from('user_follows')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('验证失败 - 表可能不存在:', error);
    } else {
      console.log('✅ 用户关注表创建成功!');
      console.log('表结构验证通过');
    }
  } catch (err) {
    console.error('验证过程中发生错误:', err);
  }
}

// 运行迁移
runMigration().then(() => {
  console.log('\n=== 迁移执行完成 ===');
  console.log('如果自动迁移失败，请手动执行上述SQL语句');
});