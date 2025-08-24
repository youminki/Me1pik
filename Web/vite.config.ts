// vite.config.ts
import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()], // 함수형이 아니라 객체 리터럴로 전달
  base: '/', // 루트에 배포면 '/'
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,

    // 리터럴 타입 유지: 'esbuild' as const (또는 boolean/terser)
    minify: 'esbuild', // 필요시 false로 바꿔도 됨
    cssCodeSplit: true,

    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // 모든 산출물을 /assets/ 밑으로 모으고, [name].[hash] 패턴 사용
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: '0.0.0.0',
  },
});
