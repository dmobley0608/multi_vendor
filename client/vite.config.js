import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1000, // Increase the limit to 1000 kB
  },
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'], // Example of splitting vendor libraries
      },
    },
  },
  plugins: [react()],
})
