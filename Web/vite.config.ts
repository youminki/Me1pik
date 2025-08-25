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
    // 빌드 성능 최적화
    target: 'es2015', // 브라우저 호환성
    reportCompressedSize: false, // 압축 크기 계산 비활성화로 빌드 속도 향상
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
        // 청크 분할 최적화 - 무한스크롤 성능 향상
        manualChunks: (id) => {
          // React 관련 라이브러리들을 vendor로 분리
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom')
          ) {
            return 'vendor-react';
          }

          // 라우팅 관련
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router';
          }

          // 상태 관리 및 유틸리티
          if (
            id.includes('node_modules/@tanstack') ||
            id.includes('node_modules/styled-components')
          ) {
            return 'vendor-utils';
          }

          // 기타 큰 라이브러리들
          if (id.includes('node_modules/')) {
            return 'vendor-other';
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
    // 개발 서버 성능 최적화
    hmr: {
      overlay: false, // HMR 오버레이 비활성화로 성능 향상
    },
    // 파일 시스템 캐싱
    fs: {
      strict: false,
      allow: ['..'],
    },
  },
  preview: {
    port: 4173,
    host: '0.0.0.0',
  },
});
