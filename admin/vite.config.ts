import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: import.meta.env.VITE_BACKEND_URL || 'http://45.137.194.145:8090',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});
