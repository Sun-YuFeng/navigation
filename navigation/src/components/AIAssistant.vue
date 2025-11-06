<template>
  <div class="ai-assistant-container">
    <div class="ai-chat-wrapper">
      <iframe 
        src="https://www.doubao.com" 
        class="ai-chat-iframe"
        frameborder="0"
        allow="microphone"
      ></iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
// AI助手组件
</script>

<style scoped>
.ai-assistant-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.ai-chat-wrapper {
  width: 100%;
  height: 600px;
  min-height: 600px;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.ai-chat-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}
</style>

