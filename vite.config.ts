import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages publishes this app at /smart-invoice/.
// Keeping the base path here prevents black-screen asset path issues after future builds.
export default defineConfig({
  base: '/smart-invoice/',
  plugins: [react()],
})
