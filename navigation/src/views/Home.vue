<script setup>
import SidebarNavigation from '../components/SidebarNavigation.vue'
</script>

<template>
  <div class="home-container">
    <!-- 左侧导航条组件 -->
    <SidebarNavigation />
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.sidebar {
  width: 60px;
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 1000;
}

.categories-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 25px;
}

.bottom-section {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #bdc3c7;
}

.nav-item:hover {
  background-color: #3498db;
  color: white;
  transform: scale(1.1);
}

.nav-item:hover .tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
}

.nav-item i {
  font-size: 20px;
}

.avatar-item {
  position: relative;
}

.avatar-container {
  position: relative;
  width: 40px;
  height: 40px;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #3498db;
}

.avatar-upload {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.tooltip {
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%) translateX(-10px);
  background-color: #2c3e50;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.tooltip::before {
  content: '';
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 5px solid transparent;
  border-right-color: #2c3e50;
}

.main-content {
  margin-left: 60px;
  padding: 40px;
  background-color: white;
  min-height: 100vh;
  width: calc(100% - 60px);
}

.main-content h1 {
  color: #2c3e50;
  margin-bottom: 16px;
  font-size: 2.5rem;
}

.main-content p {
  color: #7f8c8d;
  line-height: 1.6;
  font-size: 1.1rem;
  margin-bottom: 30px;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.content-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;
  transition: transform 0.3s ease;
}

.content-card:hover {
  transform: translateY(-5px);
}
</style>