import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true, // Fail if 3000 is occupied
    host: '127.0.0.1', // Bind to IPv4 explicitly
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
      '/dashboard': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        timeout: 60000,
        proxyTimeout: 60000,
      },
      '/frontend': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        timeout: 60000,
        proxyTimeout: 60000,
      }
    }
  },
  build: {
    outDir: 'dist',
  }
})
