import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '0.0.0.0',
    port: 5176,
    proxy: {
      '/api': {
        target: 'https://zector-digital-crm-leads-git-master-zector-digitals-projects.vercel.app',
        changeOrigin: true,
        secure: true
      }
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // React and core dependencies
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI component libraries
          'ui-vendor': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip'
          ],
          
          // Charts and data visualization
          'charts-vendor': ['recharts', 'd3-scale', 'd3-shape', 'd3-path'],
          
          // Internationalization
          'i18n-vendor': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          
          // Icons and animations
          'icons-vendor': ['lucide-react'],
          
          // Form and validation
          'forms-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // Date utilities
          'date-vendor': ['date-fns'],
          
          // Query and state management
          'query-vendor': ['@tanstack/react-query', 'axios'],
          
          // Utility libraries
          'utils-vendor': ['clsx', 'tailwind-merge', 'class-variance-authority']
        }
      }
    }
  },
}));
