import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { assetManifestPlugin } from './vite-asset-manifest';

const publicDir = fileURLToPath(new URL('./public', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), assetManifestPlugin(publicDir)],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    include: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        // Divide el bundle: los vendors cambian poco → se cachean mejor
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('@supabase')) return 'vendor-supabase';
          if (id.includes('react-dom') || id.includes('scheduler') || /node_modules[\\/]react[\\/]/.test(id)) return 'vendor-react';
          if (id.includes('lucide-react')) return 'vendor-icons';
          if (id.includes('pdfjs-dist')) return 'vendor-pdf';
          if (id.includes('xlsx')) return 'vendor-xlsx';
          return undefined;
        },
      },
    },
  },
});
