# 登录注册功能配置指南

## Supabase 配置

1. 前往 [Supabase官网](https://supabase.com) 创建账户和项目
2. 获取项目的 URL 和匿名密钥 (anon key)
3. 编辑 `.env` 文件，替换以下内容：

```env
VITE_SUPABASE_URL=你的_supabase_url
VITE_SUPABASE_ANON_KEY=你的_supabase_anon_key
```

## 功能特性

- ✅ 响应式登录/注册界面（左右分栏设计）
- ✅ 邮箱密码认证
- ✅ 表单验证
- ✅ 错误提示
- ✅ 路由守卫保护
- ✅ 用户状态管理

## 页面结构

- **登录页面** (`/login`) - 左右分栏设计，左侧为欢迎信息，右侧为表单
- **首页** (`/`) - 受保护页面，显示用户信息和登出功能

## 开发说明

项目使用以下技术栈：
- Vue 3 + Vite
- Supabase (认证服务)
- Vue Router (路由管理)
- Pinia (状态管理)

## 启动项目

```bash
npm install
npm run dev
```

## 注意事项

1. 确保 Supabase 项目已启用邮箱认证
2. 注册后需要验证邮箱才能正常登录
3. 生产环境请确保环境变量正确配置