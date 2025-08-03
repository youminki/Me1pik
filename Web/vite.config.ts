// vite.config.ts
import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react()],
    base: '/', // 명시적으로 base URL 설정
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

            // 더 세분화된 페이지별 청크 분할
            'auth-login': ['./src/pages/auths/Login.tsx'],
            'auth-signup': ['./src/pages/auths/Signup.tsx'],
            'auth-find': [
              './src/pages/auths/FindId.tsx',
              './src/pages/auths/FindPassword.tsx',
            ],

            // 홈 페이지 세분화 (가장 큰 청크)
            'home-main': ['./src/pages/homes/Home.tsx'],
            'home-detail': ['./src/pages/homes/HomeDetail.tsx'],
            'home-components': [
              './src/components/homes/ItemList.tsx',
              './src/components/homes/ItemCard.tsx',
              './src/components/homes/FilterContainer.tsx',
            ],

            'locker-main': ['./src/pages/locker-rooms/LockerRoom.tsx'],
            'locker-closet': [
              './src/pages/locker-rooms/my-closets/MyCloset.tsx',
            ],
            'locker-ticket': [
              './src/pages/locker-rooms/my-tickets/MyTicket.tsx',
              './src/pages/locker-rooms/my-tickets/PurchaseOfPasses.tsx',
            ],

            'melpik-main': ['./src/pages/melpiks/Melpik.tsx'],
            'melpik-create': ['./src/pages/melpiks/creates/CreateMelpik.tsx'],

            // 공통 컴포넌트 분리
            'shared-components': [
              './src/components/shared/buttons/PrimaryButton.tsx',
              './src/components/shared/forms/InputField.tsx',
              './src/components/shared/modals/ReusableModal.tsx',
            ],

            // 유틸리티 분리
            'utils-common': [
              './src/utils/auth.ts',
              './src/utils/format.ts',
              './src/utils/validation.ts',
            ],
          },
        },
      },
      chunkSizeWarningLimit: 500, // 경고 임계값 낮춤
      sourcemap: false,
      // CSS 최적화
      cssCodeSplit: true,
      // 에셋 최적화
      assetsInlineLimit: 4096, // 4KB 이하 파일은 인라인
      // 트리 셰이킹 최적화
      minify: 'esbuild' as const, // terser 대신 esbuild 사용 (더 빠름)
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
