// vite.config.ts
import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // 핵심 라이브러리들
            'react-vendor': ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['styled-components'],
            utils: ['axios', '@tanstack/react-query'],
            form: ['react-hook-form', '@hookform/resolvers'],
            validation: ['yup'],

            // 페이지별 청크 분할
            'auth-pages': [
              './src/pages/auths/Login.tsx',
              './src/pages/auths/Signup.tsx',
              './src/pages/auths/FindId.tsx',
              './src/pages/auths/FindPassword.tsx',
            ],
            'home-pages': [
              './src/pages/homes/Home.tsx',
              './src/pages/homes/HomeDetail.tsx',
            ],
            'locker-pages': [
              './src/pages/locker-rooms/LockerRoom.tsx',
              './src/pages/locker-rooms/my-closets/MyCloset.tsx',
              './src/pages/locker-rooms/my-tickets/MyTicket.tsx',
            ],
            'melpik-pages': [
              './src/pages/melpiks/Melpik.tsx',
              './src/pages/melpiks/creates/CreateMelpik.tsx',
            ],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
      sourcemap: false,
      // CSS 최적화
      cssCodeSplit: true,
      // 에셋 최적화
      assetsInlineLimit: 4096, // 4KB 이하 파일은 인라인
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'styled-components',
        'axios',
        '@tanstack/react-query',
        'react-hook-form',
        '@hookform/resolvers',
        'yup',
      ],
      exclude: ['@vitejs/plugin-react'],
    },
    // 개발 서버 최적화
    server: {
      hmr: {
        overlay: false, // HMR 오버레이 비활성화로 성능 향상
      },
    },
    // CSS 최적화는 postcss.config.js에서 처리
  };
});
