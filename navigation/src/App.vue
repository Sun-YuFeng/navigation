<script setup>
import { onMounted } from 'vue'

// 动态加载Unicons图标库
onMounted(() => {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://unicons.iconscout.com/release/v4.0.8/css/line.css'
  document.head.appendChild(link)
})
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f5;
}

#app {
  min-height: 100vh;
}
</style>