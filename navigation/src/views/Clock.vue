<template>
  <div class="clock-page">
    <div class="page-header">
      <h1>时钟工具</h1>
      <p>数字时钟、模拟时钟、秒表和世界时钟</p>
    </div>
    <Clock />
  </div>
</template>

<script setup>
import Clock from '../components/Clock.vue'
</script>

<style scoped>
.clock-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-header p {
  font-size: 16px;
  color: #666;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .clock-page {
    padding: 15px;
  }
  
  .page-header h1 {
    font-size: 24px;
  }
}
</style>

