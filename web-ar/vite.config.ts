import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,     // Allow LAN access for mobile testing
    port: 5173,
    // For HTTPS on mobile: run `npx vite --https` or use mkcert (see README)
  },
  optimizeDeps: {
    exclude: [],
    include: ['three', 'zustand'],
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
        },
      },
    },
  },
});
