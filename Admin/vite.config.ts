import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './', // 상대경로로 설정하여 배포 환경에서 경로 문제 최소화
  plugins: [
    react(),
    svgrPlugin(), // SVG를 React 컴포넌트로 변환
    tsconfigPaths(), // tsconfig.json의 paths를 자동 반영
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Melpik Admin',
        short_name: 'Melpik',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#3071B2',
        icons: [
          {
            src: '/assets/favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
      },
    }),
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
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
      },
    },
  },
});
