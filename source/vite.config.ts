import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative asset paths let the same GitHub Pages build work at the repository root
// or inside a project path such as /smart-invoice/.
export default defineConfig({
  base: './',
  plugins: [react()],
})
