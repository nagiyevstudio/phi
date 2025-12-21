import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { vitePluginFtp } from './vite-plugin-ftp'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Автоматическая загрузка на FTP после билда
    vitePluginFtp('./ftp-config.json'),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
      },
    },
  },
})

