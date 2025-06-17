import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '0.0.0.0',
    port: 5176,
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './pulse-main/src'),
    },
  },
  root: './',
  publicDir: './pulse-main/public',
  build: {
    outDir: './dist',
    sourcemap: mode === 'development',
    chunkSizeWarningLimit: 1000,
  },
}));
