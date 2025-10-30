<template>
  <div class="market-container">
    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>工具集市</h1>
        <p>发现各种实用工具和应用程序</p>
      </div>
      
      <!-- 工具分类区域 -->
      <div class="tools-section">
        <div class="tools-grid">
          <!-- 工具卡片示例 -->
          <div class="tool-card">
            <div class="tool-icon">
              <i class="uil uil-calculator"></i>
            </div>
            <h3>计算器</h3>
            <p>多功能计算工具</p>
          </div>
          
          <div class="tool-card">
            <div class="tool-icon">
              <i class="uil uil-clock"></i>
            </div>
            <h3>时钟</h3>
            <p>实时时间显示</p>
          </div>
          
          <div class="tool-card">
            <div class="tool-icon">
              <i class="uil uil-calendar-alt"></i>
            </div>
            <h3>日历</h3>
            <p>日期管理工具</p>
          </div>
          
          <div class="tool-card">
            <div class="tool-icon">
              <i class="uil uil-cloud-sun"></i>
            </div>
            <h3>天气</h3>
            <p>天气预报应用</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

</script>

<style scoped>
.market-container {
  display: flex;
  min-height: 100vh;
  background-color: #f5f6fa;
}

.main-content {
  flex: 1;
  margin-left: 60px;
  padding: 40px;
}

.page-header {
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.page-header p {
  font-size: 1.1rem;
  color: #7f8c8d;
}

.tools-section {
  margin-top: 30px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.tool-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  text-align: center;
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.tool-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.tool-icon i {
  font-size: 2rem;
  color: white;
}

.tool-card h3 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.tool-card p {
  color: #7f8c8d;
  font-size: 0.95rem;
  line-height: 1.5;
}
</style>