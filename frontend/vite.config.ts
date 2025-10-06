import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const useClerkShim = !env.VITE_CLERK_PUBLISHABLE_KEY;

  return {
    plugins: [react()],
    test: {
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts']
    },
    define: {
      global: 'globalThis',
      'process.env': {}
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    resolve: {
      alias: {
        process: "process/browser",
        stream: "stream-browserify",
        zlib: "browserify-zlib",
        util: 'util',
        ...(useClerkShim
          ? { '@clerk/clerk-react': path.resolve(__dirname, 'src/shims/clerk-react.tsx') }
          : {})
      }
    },
    server: {
      port: 5173,
      strictPort: false,
      proxy: {
        '/api': {
          target: 'http://localhost:8001',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  };
});