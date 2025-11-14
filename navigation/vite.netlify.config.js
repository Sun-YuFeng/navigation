import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 专门用于Netlify部署的配置
export default defineConfig({
  plugins: [vue()],
  build: {
    // 确保Netlify兼容性
    target: 'es2015',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        // 避免复杂的模块分割
        manualChunks: undefined
      }
    }
  },
  base: './'
})