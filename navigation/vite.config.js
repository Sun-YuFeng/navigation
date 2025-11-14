import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'vue': fileURLToPath(new URL('./node_modules/vue/dist/vue.esm-bundler.js', import.meta.url)),
      'pinia': fileURLToPath(new URL('./node_modules/pinia/dist/pinia.esm-browser.js', import.meta.url)),
      'vue-router': fileURLToPath(new URL('./node_modules/vue-router/dist/vue-router.esm-browser.js', import.meta.url))
    },
  },
  build: {
    // 确保Netlify部署兼容性
    target: 'es2015',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        inlineDynamicImports: false
      }
    }
  },
  // 确保使用正确的base路径（Netlify部署使用绝对路径）
  base: '/'
})
