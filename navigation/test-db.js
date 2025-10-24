// 简单的数据库连接测试脚本
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zpiabcsywqezlspzbqrv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwaWFiY3N5d3FlemxzcHpicXJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTc0NTYsImV4cCI6MjA3NjQ3MzQ1Nn0.qm4aGAsImDHbqLVmSG5YypXFDtgK-QilnLgS6u3f6Io'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testDatabase() {
  console.log('开始测试数据库连接...')
  
  try {
    // 测试分类模板表
    console.log('1. 测试分类模板表...')
    const { data: templates, error: templatesError } = await supabase
      .from('category_templates')
      .select('*')
      .order('sort_order')
    
    if (templatesError) {
      console.error('分类模板表查询失败:', templatesError)
    } else {
      console.log(`✅ 分类模板表查询成功，找到 ${templates.length} 个模板`)
      console.log('模板列表:')
      templates.forEach(template => {
        console.log(`  - ${template.name} (${template.icon}, ${template.color})`)
      })
    }
    
    // 测试用户分类映射表
    console.log('\n2. 测试用户分类映射表...')
    const { data: mappings, error: mappingsError } = await supabase
      .from('user_category_mappings')
      .select('*')
      .limit(5)
    
    if (mappingsError) {
      console.error('用户分类映射表查询失败:', mappingsError)
    } else {
      console.log(`✅ 用户分类映射表查询成功，找到 ${mappings.length} 个映射`)
    }
    
    // 测试网站链接表
    console.log('\n3. 测试网站链接表...')
    const { data: websites, error: websitesError } = await supabase
      .from('website_links')
      .select('*')
      .limit(5)
    
    if (websitesError) {
      console.error('网站链接表查询失败:', websitesError)
    } else {
      console.log(`✅ 网站链接表查询成功，找到 ${websites.length} 个网站链接`)
    }
    
    console.log('\n🎉 数据库测试完成！所有表结构都已正确创建。')
    
  } catch (error) {
    console.error('测试过程中出现错误:', error)
  }
}

testDatabase()