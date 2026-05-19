import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const handleProxyError = (err, _req, res) => {
  if (res?.writeHead && !res.headersSent) {
    res.writeHead(502, { 'Content-Type': 'application/json' })
  }
  if (res?.end) {
    res.end(JSON.stringify({ success: false, message: 'Backend API is not available. Start the backend on port 5001.' }))
  }
  console.warn(`[vite proxy] Backend unavailable: ${err.code || err.message}`)
}

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
        configure: (proxy) => {
          proxy.on('error', handleProxyError)
        },
      },
      '/socket.io': {
        target: 'http://localhost:5001',
        ws: true,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.warn(`[vite proxy] Socket backend unavailable: ${err.code || err.message}`)
          })
        },
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
