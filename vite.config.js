import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    chunkSizeWarningLimit: 1000, // เพิ่มขีดจำกัดเป็น 1000 kB เพื่อปิดคำเตือน
  }// ช่วยให้หาไฟล์ assets เจอเมื่อ deploy ในโฟลเดอร์ย่อย
})

