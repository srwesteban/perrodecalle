import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'   // 👈 importa el plugin

export default defineConfig({
  plugins: [react(), tailwind()],          // 👈 agrégalo aquí
})
