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
});
