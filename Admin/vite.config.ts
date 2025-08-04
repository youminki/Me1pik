import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  base: './', // 상대경로로 설정하여 배포 환경에서 경로 문제 최소화
  plugins: [
    react(),
    svgrPlugin(), // SVG를 React 컴포넌트로 변환
    tsconfigPaths(), // tsconfig.json의 paths를 자동 반영
    // PWA 기능을 일시적으로 비활성화 (Service Worker 오류 해결)
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   manifest: {
    //     name: 'Melpik Admin',
    //     short_name: 'Melpik',
    //     start_url: '/',
    //     display: 'standalone',
    //     background_color: '#ffffff',
    //     theme_color: '#3071B2',
    //     icons: [
    //       {
    //         src: '/assets/favicon.svg',
    //         sizes: '192x192',
    //         type: 'image/svg+xml',
    //       },
    //     ],
    //   },
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,svg,woff2}'],
    //     // API 요청은 캐시하지 않도록 설정
    //     runtimeCaching: [
    //       {
    //         urlPattern: /^https:\/\/api\.stylewh\.com\/.*$/,
    //         handler: 'NetworkOnly',
    //         options: {
    //           cacheName: 'api-cache',
    //         },
    //       },
    //     ],
    //   },
    // }),
  ],
  resolve: {
    // tsconfigPaths()가 paths를 처리해 주므로
    // 별도의 alias 설정은 필요 없지만,
    // '@'만 수동으로 유지하고 싶다면 아래처럼 추가 가능합니다.
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@api': path.resolve(__dirname, 'src/api'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@config': path.resolve(__dirname, 'src/config'),
    },
  },
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 2000, // 청크 크기 경고 제한을 2MB로 늘림
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        manualChunks: {
          // React 관련 라이브러리들을 별도 청크로 분리
          'react-vendor': ['react', 'react-dom'],
          // 라우팅 관련 라이브러리
          'router-vendor': ['react-router-dom'],
          // 차트 라이브러리
          'chart-vendor': ['recharts'],
          // 유틸리티 라이브러리
          'utils-vendor': ['lodash', 'date-fns', 'axios'],
          // 폼 관련 라이브러리
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'yup'],
          // 스타일링 라이브러리
          'style-vendor': ['styled-components', 'styled-reset'],
          // 아이콘 라이브러리
          'icon-vendor': ['react-icons'],
          // 날짜 관련 라이브러리
          'date-vendor': ['react-datepicker', 'react-day-picker', 'date-holidays'],
          // 쿠키 라이브러리
          'cookie-vendor': ['js-cookie'],
        },
      },
    },
  },
});
