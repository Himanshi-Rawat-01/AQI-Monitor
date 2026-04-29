import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true, // Fail if 3000 is occupied
    host: '0.0.0.0',
    proxy: {
      '/api': 'http://127.0.0.1:5001',
      '/dashboard': 'http://127.0.0.1:5001',
      '/frontend': 'http://127.0.0.1:5001'
    }
  },
  build: {
    outDir: 'dist',
  }
})
