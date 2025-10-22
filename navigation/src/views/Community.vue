<template>
  <div class="community-container">
    <!-- 左侧导航条组件 -->
    <SidebarNavigation />
    
    <!-- 主内容区域 -->
    <div class="main-content">
      <h1>社区页面开发中</h1>
    </div>
  </div>
</template>

<script setup>
import SidebarNavigation from '../components/SidebarNavigation.vue'
</script>

<style scoped>
.community-container {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 60px; /* 与导航栏宽度一致 */
  padding: 20px;
  background-color: #f5f6fa;
  min-height: 100vh;
}
</style>