import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5001',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  build: {
    // Code splitting for smaller bundles
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks (cached separately)
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-charts': ['recharts'],
          'vendor-editor': ['@uiw/react-md-editor'],
          'vendor-ui': ['lucide-react', 'date-fns', 'react-hot-toast'],
          'vendor-dnd': ['@hello-pangea/dnd'],
        },
      },
    },
    // Raise warning threshold since we now chunk properly
    chunkSizeWarningLimit: 600,
  },
})
