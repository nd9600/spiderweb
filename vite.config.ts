import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'resources/assets/js')
    }
  },
  build: {
    outDir: 'public/dist',
    rollupOptions: {
      input: resolve(__dirname, 'index.html')
    },
    assetsDir: 'assets'
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8000'
    }
  },
  optimizeDeps: {
    include: ['vue', 'pinia']
  },
  css: {
    preprocessorOptions: {
      css: {
        charset: false
      }
    }
  }
})