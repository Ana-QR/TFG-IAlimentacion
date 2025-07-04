import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  css: {
  postcss: {
    plugins: [
      require('tailwindcss'),
      require('autoprefixer')
    ]
  },
  // server: {
  //   proxy: {
  //     '/api': {
  //       target: 'https://ialimentacion.onrender.com',
  //       changeOrigin: true,
  //       secure: false,
  //     }
  //   }
  // }
}
})