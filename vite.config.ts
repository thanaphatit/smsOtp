import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  // Base public path when served in production.
  // If deploying to a sub-path like https://example.com/otp/,
  // set this to '/otp/'. For root deployment, use '/'.
  base: '/',
  build: {
    // Output directory (relative to project root)
    outDir: 'dist',
    // Clean the output directory before building
    emptyOutDir: true,
    // Generate sourcemaps for production debugging
    sourcemap: false,
    // Minify options: 'esbuild' (faster) or 'terser' (smaller)
    minify: 'esbuild',
    // Target browsers
    target: 'es2015',
    // Rollup options for fine-tuning the output
    rollupOptions: {
      output: {
        // Split vendor chunks for better caching
        manualChunks: {
          vendor: ['vue'],
        },
        // Output filenames with content hash for cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
})