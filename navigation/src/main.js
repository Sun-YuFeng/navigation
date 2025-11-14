import './assets/main.css'
// import '@iconscout/unicons/css/line.css' // 部署时有问题，改为CDN

// 使用全局变量而不是模块导入（解决Netlify部署问题）
const { createApp } = Vue;
const { createPinia } = Pinia;

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
