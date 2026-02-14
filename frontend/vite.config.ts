import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { readFileSync } from 'fs'
import { vitePluginFtp } from './vite-plugin-ftp'

// Читаем версию из package.json
const packageJson = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'))
const appVersion = packageJson.version || '1.0.0'
const buildsContent = readFileSync(path.resolve(__dirname, '../BUILDS.txt'), 'utf-8')
const releaseDateMatch = buildsContent.match(/^- Date:\s*(.+)$/m)
const appReleaseDate = releaseDateMatch?.[1]?.trim() || 'unknown'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Автоматическая загрузка на FTP после билда
    vitePluginFtp('../secrets/ftp.json'),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __APP_RELEASE_DATE__: JSON.stringify(appReleaseDate),
  },
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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('recharts')) return 'recharts'
          if (id.includes('react-router')) return 'router'
          if (id.includes('react-dom') || id.includes('react')) return 'react'
          if (id.includes('@tanstack')) return 'tanstack'
          if (id.includes('date-fns')) return 'date-fns'
          if (id.includes('react-hook-form') || id.includes('@hookform')) return 'forms'
          if (id.includes('zod')) return 'zod'
          return 'vendor'
        },
      },
    },
  },
})
