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
    minify: 'esbuild',
    cssCodeSplit: true,
    assetsDir: 'assets',
    // 빌드 시 소스맵 생성 (디버깅용)
    sourcemap: false,
    // 청크 크기 경고 임계값 설정
    chunkSizeWarningLimit: 1000,
    // 빌드 시 타임스탬프 추가로 캐시 무효화
    rollupOptions: {
      output: {
        // 모든 산출물을 /assets/ 밑으로 모으고, [name].[hash] 패턴 사용
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()
            : 'chunk';
          return `assets/${facadeModuleId}.[hash].js`;
        },
        assetFileNames: 'assets/[name].[hash][extname]',
        // 청크 분할 최적화
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          utils: ['@tanstack/react-query', 'styled-components'],
        },
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
