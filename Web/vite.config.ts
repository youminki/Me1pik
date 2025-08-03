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
          // 파일명을 해시 없이 고정
          entryFileNames: 'assets/[name].js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name].[ext]',
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
            'auth-other': [
              './src/pages/auths/LoginReady.tsx',
              './src/pages/auths/LoginTest.tsx',
              './src/pages/auths/PasswordChange.tsx',
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

            'melpik-create': ['./src/pages/melpiks/creates/CreateMelpik.tsx'],

            // Brand와 Melpik 컴포넌트를 메인 번들에 포함
            'brand-components': [
              './src/pages/brands/Brand.tsx',
              './src/pages/brands/BrandDetail.tsx',
            ],
            'melpik-components': ['./src/pages/melpiks/Melpik.tsx'],

            // 알람 및 분석 페이지
            'alarm-analysis': [
              './src/pages/alarms/Alarm.tsx',
              './src/pages/analyses/Analysis.tsx',
            ],

            // 고객 서비스 관련
            'customer-service': [
              './src/pages/customer-services/CustomerService.tsx',
              './src/pages/customer-services/documents/DocumentDetail.tsx',
              './src/pages/customer-services/documents/DocumentList.tsx',
            ],

            // 결제 관련
            payment: [
              './src/pages/payments/Payment.tsx',
              './src/pages/payments/PaymentComplete.tsx',
              './src/pages/payments/Paymentfail.tsx',
            ],

            // 프로필 관련
            profile: [
              './src/pages/profile/ChangePassword.tsx',
              './src/pages/profile/DeliveryManagement.tsx',
              './src/pages/profile/EditAddress.tsx',
              './src/pages/profile/UpdateProfile.tsx',
            ],

            // 멜픽 스케줄 관련
            'melpik-schedule': [
              './src/pages/melpiks/schedules/Schedule.tsx',
              './src/pages/melpiks/schedules/ScheduleConfirmation.tsx',
              './src/pages/melpiks/schedules/ScheduleReservationStep1.tsx',
              './src/pages/melpiks/schedules/ScheduleReservationStep2.tsx',
              './src/pages/melpiks/schedules/ScheduleReservationStep3.tsx',
            ],

            // 멜픽 설정 및 정산 관련
            'melpik-settings': [
              './src/pages/melpiks/settings/SettingMelpik.tsx',
              './src/pages/melpiks/calculates/SalesSettlement.tsx',
              './src/pages/melpiks/calculates/SalesSettlementDetail.tsx',
              './src/pages/melpiks/calculates/SettlementRequest.tsx',
              './src/pages/melpiks/creates/ContemporarySettings.tsx',
            ],

            // 락커룸 관련
            'locker-components': [
              './src/pages/locker-rooms/my-closets/MyCloset.tsx',
              './src/pages/locker-rooms/my-tickets/MyTicket.tsx',
              './src/pages/locker-rooms/my-tickets/PurchaseOfPasses.tsx',
              './src/pages/locker-rooms/my-tickets/TicketDetail.tsx',
              './src/pages/locker-rooms/my-tickets/TicketPayment.tsx',
              './src/pages/locker-rooms/payment-methods/AddCard.tsx',
              './src/pages/locker-rooms/payment-methods/PaymentMethod.tsx',
              './src/pages/locker-rooms/points/Point.tsx',
              './src/pages/locker-rooms/product-reviews/ProductReview.tsx',
              './src/pages/locker-rooms/product-reviews/ProductReviewWrite.tsx',
              './src/pages/locker-rooms/usage-histories/UsageHistory.tsx',
            ],

            // 테스트 페이지들
            'test-pages': [
              './src/pages/tests/TestLogin.tsx',
              './src/pages/tests/TestDashboard.tsx',
            ],

            // 기타 페이지들
            'other-pages': [
              './src/pages/errors/NotFound.tsx',
              './src/pages/landings/Landing.tsx',
              './src/pages/layouts/AppLayout.tsx',
              './src/pages/links/Link.tsx',
              './src/pages/links/PersonalLink.tsx',
              './src/pages/my-info/MyInfoList.tsx',
              './src/pages/my-styles/MyStyle.tsx',
              './src/pages/baskets/Basket.tsx',
            ],

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
