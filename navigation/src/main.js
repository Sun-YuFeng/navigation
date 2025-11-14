// 解决Netlify部署问题的全局脚本版本
// 不使用ES模块语法，改为全局变量方式

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    try {
        // 使用全局变量
        const { createApp } = Vue;
        
        // 创建Pinia实例（使用生产版本避免devtools错误）
        const pinia = Pinia.createPinia();
        
        // 使用Vue Router
        const router = VueRouter.createRouter({
            history: VueRouter.createWebHashHistory(),
            routes: window.__ROUTES__ || []
        });
        
        // 创建Vue应用
        const app = createApp({
            template: '<div id="app"><App /></div>',
            components: {
                App: window.__APP__ || { template: '<div>Loading...</div>' }
            }
        });
        
        // 使用插件
        app.use(pinia);
        app.use(router);
        
        // 挂载应用
        app.mount('#app');
        
    } catch (error) {
        console.error('Application initialization failed:', error);
        document.getElementById('app').innerHTML = '<div style="padding: 20px; color: red;">Application failed to load: ' + error.message + '</div>';
    }
});