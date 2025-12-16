import path from "path"
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: ['ec2-3-144-46-118.us-east-2.compute.amazonaws.com'],
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://ec2-3-144-46-118.us-east-2.compute.amazonaws.com:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
