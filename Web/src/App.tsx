import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { Suspense, useEffect, useState, useRef } from 'react';
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import AddCardPayple from '@/__tests__/development/AddCardPayple';
import PaypleTest from '@/__tests__/development/PaypleTest';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import Brand from '@/pages/brands/Brand';
import BrandDetail from '@/pages/brands/BrandDetail';
import Melpik from '@/pages/melpiks/Melpik';
import GlobalStyles from '@/styles/GlobalStyles';
import { theme } from '@/styles/Theme';
import {
  hasValidToken,
  refreshToken,
  getCurrentToken,
  restorePersistentLogin,
  checkAndSetupAutoLogin,
  setupNetworkMonitoring,
} from '@/utils/auth';
import { monitoringService } from '@/utils/monitoring';

// RootRedirect 컴포넌트 - 토큰 상태에 따라 적절한 페이지로 리다이렉트
// 🔧 개선: RootRedirect는 라우팅 결정만 - 복구/스케줄링은 App에서 처리
const RootRedirect: React.FC = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        console.log('🔍 RootRedirect: 라우팅 결정을 위한 토큰 상태 확인...');

        // 🔧 개선: 실제 복구는 하지 않고 상태만 확인
        const persistentLogin = localStorage.getItem('persistentLogin');
        const autoLogin = localStorage.getItem('autoLogin');
        const hasPersistentSetting =
          persistentLogin === 'true' || autoLogin === 'true';

        // 현재 토큰 상태만 확인 (복구 로직 제거)
        const token = getCurrentToken();
        const hasValid = token && hasValidToken();

        if (hasValid) {
          console.log('✅ RootRedirect: 유효한 토큰 발견 - 홈으로 이동');
          setRedirectPath('/home');
        } else if (hasPersistentSetting) {
          console.log(
            '🔄 RootRedirect: 지속 로그인 설정 있음 - 홈으로 이동 (복구는 App에서)'
          );
          setRedirectPath('/home');
        } else {
          console.log(
            'ℹ️ RootRedirect: 유효한 토큰 없음 - 로그인 페이지로 이동'
          );
          setRedirectPath('/login');
        }
      } catch (error) {
        console.error('RootRedirect: 로그인 상태 확인 중 오류:', error);
        setRedirectPath('/login');
      } finally {
        setIsChecking(false);
      }
    };

    checkLoginStatus();
  }, []);

  if (isChecking) {
    return <div>로그인 상태 확인 중...</div>;
  }

  if (redirectPath === '/home') {
    return <Navigate to='/home' replace />;
  } else {
    return <Navigate to='/login' replace />;
  }
};

// React Query 클라이언트 설정 - 성능 최적화
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 캐시 시간 최적화
      staleTime: 1000 * 60 * 10, // 10분
      gcTime: 1000 * 60 * 30, // 30분

      // 재시도 로직 최적화
      retry: (failureCount, err: Error) => {
        // 🔧 개선: 더 안전한 에러 체크
        const errorResponse = err as { response?: { status?: number } };
        if (errorResponse?.response?.status === 401) return false;
        // 네트워크 오류는 2번만 재시도
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // 최대 10초

      // 백그라운드 업데이트 비활성화로 성능 향상
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      // 뮤테이션 재시도 비활성화
      retry: false,
    },
  },
});

// 지연 로딩을 위한 컴포넌트들
const Alarm = React.lazy(() => import('@/pages/alarms/Alarm'));
const Analysis = React.lazy(() => import('@/pages/analyses/Analysis'));
const FindId = React.lazy(() => import('@/pages/auths/FindId'));
const FindPassword = React.lazy(() => import('@/pages/auths/FindPassword'));
const Login = React.lazy(() => import('@/pages/auths/Login'));

const PasswordChange = React.lazy(() => import('@/pages/auths/PasswordChange'));
const Signup = React.lazy(() => import('@/pages/auths/Signup'));

// 테스트 페이지 컴포넌트들
const TestLoginPage = React.lazy(() => import('@/pages/tests/TestLogin'));
const TestDashboard = React.lazy(() => import('@/pages/tests/TestDashboard'));
const ReadyLogin = React.lazy(() => import('@/pages/auths/LoginReady'));
const Basket = React.lazy(() => import('@/pages/baskets/Basket'));
const CustomerService = React.lazy(
  () => import('@/pages/customer-services/CustomerService')
);
const DocumentDetail = React.lazy(
  () => import('@/pages/customer-services/documents/DocumentDetail')
);
const DocumentList = React.lazy(
  () => import('@/pages/customer-services/documents/DocumentList')
);
const NotFound = React.lazy(() => import('@/pages/errors/NotFound'));
const Home = React.lazy(() => import('@/pages/homes/Home'));
const HomeDetail = React.lazy(() => import('@/pages/homes/HomeDetail'));
const Landing = React.lazy(() => import('@/pages/landings/Landing'));
const AppLayout = React.lazy(() => import('@/pages/layouts/AppLayout'));
const Link = React.lazy(() => import('@/pages/links/Link'));
const PersonalLink = React.lazy(() => import('@/pages/links/PersonalLink'));
const LockerRoom = React.lazy(() => import('@/pages/locker-rooms/LockerRoom'));
const MyCloset = React.lazy(
  () => import('@/pages/locker-rooms/my-closets/MyCloset')
);
const MyTicket = React.lazy(
  () => import('@/pages/locker-rooms/my-tickets/MyTicket')
);
const PurchaseOfPasses = React.lazy(
  () => import('@/pages/locker-rooms/my-tickets/PurchaseOfPasses')
);
const TicketDetail = React.lazy(
  () => import('@/pages/locker-rooms/my-tickets/TicketDetail')
);
const TicketPayment = React.lazy(
  () => import('@/pages/locker-rooms/my-tickets/TicketPayment.tsx')
);
const AddCard = React.lazy(
  () => import('@/pages/locker-rooms/payment-methods/AddCard')
);
const PaymentMethod = React.lazy(
  () => import('@/pages/locker-rooms/payment-methods/PaymentMethod')
);
const Point = React.lazy(() => import('@/pages/locker-rooms/points/Point'));
const ProductReview = React.lazy(
  () => import('@/pages/locker-rooms/product-reviews/ProductReview')
);
const ProductReviewWrite = React.lazy(
  () => import('@/pages/locker-rooms/product-reviews/ProductReviewWrite')
);
const UsageHistory = React.lazy(
  () => import('@/pages/locker-rooms/usage-histories/UsageHistory')
);
const SalesSettlement = React.lazy(
  () => import('@/pages/melpiks/calculates/SalesSettlement')
);
const SalesSettlementDetail = React.lazy(
  () => import('@/pages/melpiks/calculates/SalesSettlementDetail')
);
const SettlementRequest = React.lazy(
  () => import('@/pages/melpiks/calculates/SettlementRequest')
);
const ContemporarySettings = React.lazy(
  () => import('@/pages/melpiks/creates/ContemporarySettings')
);
const CreateMelpik = React.lazy(
  () => import('@/pages/melpiks/creates/CreateMelpik')
);
const Schedule = React.lazy(() => import('@/pages/melpiks/schedules/Schedule'));
const ScheduleConfirmation = React.lazy(
  () => import('@/pages/melpiks/schedules/ScheduleConfirmation')
);
const ScheduleReservation1 = React.lazy(
  () => import('@/pages/melpiks/schedules/ScheduleReservationStep1')
);
const ScheduleReservation2 = React.lazy(
  () => import('@/pages/melpiks/schedules/ScheduleReservationStep2')
);
const ScheduleReservation3 = React.lazy(
  () => import('@/pages/melpiks/schedules/ScheduleReservationStep3')
);
const Setting = React.lazy(
  () => import('@/pages/melpiks/settings/SettingMelpik')
);
const MyInfoList = React.lazy(() => import('@/pages/my-info/MyInfoList'));
const MyStyle = React.lazy(() => import('@/pages/my-styles/MyStyle'));
const Payment = React.lazy(() => import('@/pages/payments/Payment'));
const PaymentComplete = React.lazy(
  () => import('@/pages/payments/PaymentComplete')
);
const PaymentFail = React.lazy(() => import('@/pages/payments/PaymentFail'));
const ChangePassword = React.lazy(
  () => import('@/pages/profile/ChangePassword')
);
const DeliveryManagement = React.lazy(
  () => import('@/pages/profile/DeliveryManagement')
);
const EditAddress = React.lazy(() => import('@/pages/profile/EditAddress'));
const UpdateProfile = React.lazy(() => import('@/pages/profile/UpdateProfile'));

// 🔧 개선: 전역 네비게이션 헬퍼 (라우터 컨텍스트 외부에서 사용)
// window 객체에 직접 할당하여 타입 문제 해결

// 🔧 개선: 전역 네비게이션 헬퍼 타입 정의
declare global {
  interface Window {
    tokenRefreshTimer?: number;
    tokenRefreshTime?: Date;
    globalNavigate?: (path: string, options?: { replace?: boolean }) => void;
  }
}

// App 컴포넌트
const App: React.FC = () => {
  // 🔧 개선: StrictMode 이펙트 2회 실행 방지
  const didInitRef = useRef(false);

  // 🔧 개선: 타이머 타입을 number로 변경 (브라우저 환경에 맞게)
  const autoRefreshTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // 🔧 개선: StrictMode 가드로 중복 초기화 방지
    if (didInitRef.current) {
      console.log('⚠️ App: 이미 초기화됨 - 중복 실행 방지');
      return;
    }
    didInitRef.current = true;

    const initializeApp = async () => {
      console.log('🚀 App: 앱 초기화 시작');

      try {
        // 🎯 0. 네트워크 모니터링 설정 (최우선)
        setupNetworkMonitoring();

        // 🎯 1. 동기적 토큰 상태 확인
        console.log('🔍 App: 동기적 토큰 상태 확인...');
        const currentToken = getCurrentToken();
        const hasValid = currentToken && hasValidToken();

        if (hasValid) {
          console.log('✅ App: 유효한 토큰 발견 - 즉시 인증 완료');
          localStorage.setItem('autoLoginCompleted', 'true');
          localStorage.removeItem('autoLoginInProgress');

          // 백그라운드에서 토큰 갱신 타이머 설정
          setTimeout(async () => {
            try {
              const { setupOptimizedTokenRefreshTimer } = await import(
                '@/utils/auth'
              );
              setupOptimizedTokenRefreshTimer(currentToken);
              console.log('⏰ App: 백그라운드에서 토큰 갱신 타이머 설정 완료');
            } catch (error) {
              console.error('토큰 갱신 타이머 설정 실패:', error);
            }
          }, 100);

          return; // 유효한 토큰이 있으면 추가 작업 불필요
        }

        // 🎯 2. 자동 로그인 시도 (토큰이 없거나 만료된 경우)
        console.log('🔄 App: 자동 로그인 시도 시작...');
        localStorage.setItem('autoLoginInProgress', 'true');

        const autoLoginSuccess = await restorePersistentLogin();
        if (autoLoginSuccess) {
          console.log('✅ App: 자동 로그인 성공 - 사용자 인증됨');
          localStorage.setItem('autoLoginCompleted', 'true');

          // 🔧 개선: 자동 로그인 성공 후 토큰 갱신 타이머 설정
          const newToken = getCurrentToken();
          if (newToken) {
            setTimeout(async () => {
              try {
                const { setupOptimizedTokenRefreshTimer } = await import(
                  '@/utils/auth'
                );
                setupOptimizedTokenRefreshTimer(newToken);
                console.log(
                  '⏰ App: 자동 로그인 성공 후 토큰 갱신 타이머 설정 완료'
                );
              } catch (error) {
                console.error(
                  '자동 로그인 후 토큰 갱신 타이머 설정 실패:',
                  error
                );
              }
            }, 100);
          }
        } else {
          console.log('ℹ️ App: 자동 로그인 실패 또는 설정되지 않음');
          localStorage.setItem('autoLoginCompleted', 'false');
        }

        localStorage.removeItem('autoLoginInProgress');

        // 🎯 3. 자동 로그인 설정 확인 및 타이머 설정 (이미 설정된 경우는 건너뜀)
        if (!autoLoginSuccess) {
          await checkAndSetupAutoLogin();
        }
      } catch (error) {
        console.error('App: 앱 초기화 중 오류:', error);
        localStorage.setItem('autoLoginCompleted', 'false');
        localStorage.removeItem('autoLoginInProgress');
      } finally {
        console.log('🚀 App: 앱 초기화 완료');
      }
    };

    initializeApp();

    // 🎯 강제 로그인 리다이렉트 이벤트 리스너
    const handleForceLoginRedirect = () => {
      console.log('🔄 강제 로그인 리다이렉트 이벤트 발생');
      // 🔧 개선: 전역 네비게이션 헬퍼 사용
      if (window.globalNavigate) {
        window.globalNavigate('/login', { replace: true });
      } else {
        // 폴백: 하드 리로드 (권장하지 않음)
        window.location.href = '/login';
      }
    };

    // 🎯 자동 로그인 실패 이벤트 리스너
    const handleAutoLoginFailed = (event: CustomEvent) => {
      console.log('❌ 자동 로그인 실패 이벤트:', event.detail);
      // 사용자에게 알림 표시 (선택사항)
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(event.detail.message || '자동 로그인에 실패했습니다.');
      }
    };

    // 🎯 토큰 갱신 성공 이벤트 리스너
    const handleTokenRefreshSuccess = (event: CustomEvent) => {
      console.log('✅ 토큰 갱신 성공 이벤트:', event.detail);
    };

    // 🎯 토큰 에러 이벤트 리스너
    const handleTokenError = (event: CustomEvent) => {
      console.log('❌ 토큰 에러 이벤트:', event.detail);
      // 사용자에게 에러 메시지 표시
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(event.detail.message || '토큰 관련 오류가 발생했습니다.');
      }
    };

    // 🎯 토큰 복구 성공 이벤트 리스너
    const handleTokenRecoverySuccess = (event: CustomEvent) => {
      console.log('🔄 토큰 복구 성공 이벤트:', event.detail);
    };

    // 🎯 토큰 복구 실패 이벤트 리스너
    const handleTokenRecoveryFailed = (event: CustomEvent) => {
      console.log('❌ 토큰 복구 실패 이벤트:', event.detail);
      // 사용자에게 복구 실패 메시지 표시
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(
          event.detail.message || '로그인 상태 복구에 실패했습니다.'
        );
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('forceLoginRedirect', handleForceLoginRedirect);
    window.addEventListener(
      'autoLoginFailed',
      handleAutoLoginFailed as EventListener
    );
    window.addEventListener(
      'tokenRefreshSuccess',
      handleTokenRefreshSuccess as EventListener
    );
    window.addEventListener('tokenError', handleTokenError as EventListener);
    window.addEventListener(
      'tokenRecoverySuccess',
      handleTokenRecoverySuccess as EventListener
    );
    window.addEventListener(
      'tokenRecoveryFailed',
      handleTokenRecoveryFailed as EventListener
    );

    // 🎯 정리 함수
    return () => {
      window.removeEventListener(
        'forceLoginRedirect',
        handleForceLoginRedirect
      );
      window.removeEventListener(
        'autoLoginFailed',
        handleAutoLoginFailed as EventListener
      );
      window.removeEventListener(
        'tokenRefreshSuccess',
        handleTokenRefreshSuccess as EventListener
      );
      window.removeEventListener(
        'tokenError',
        handleTokenError as EventListener
      );
      window.removeEventListener(
        'tokenRecoverySuccess',
        handleTokenRecoverySuccess as EventListener
      );
      window.removeEventListener(
        'tokenRecoveryFailed',
        handleTokenRecoveryFailed as EventListener
      );

      // 🔧 개선: 자동 갱신 타이머 정리 (타입에 맞게)
      if (autoRefreshTimerRef.current) {
        window.clearTimeout(autoRefreshTimerRef.current);
        autoRefreshTimerRef.current = null;
      }
    };
  }, []);

  // 🔧 개선: 30초 polling 제거 - 이미 setupOptimizedTokenRefreshTimer가 만료 시점 기반 스케줄링
  // 대신 visibilitychange/focus 이벤트로 보강
  useEffect(() => {
    // 🔧 개선: 중복 호출 방지를 위한 디바운싱
    let isProcessing = false;
    let debounceTimer: number | null = null;

    const handleVisibilityChange = async () => {
      if (document.hidden || isProcessing) return;

      console.log('🔄 페이지 가시성 변경 - 토큰 상태 확인');

      // 디바운싱 적용
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      debounceTimer = window.setTimeout(async () => {
        if (isProcessing) return;
        isProcessing = true;

        try {
          const currentToken = getCurrentToken();
          if (currentToken && !hasValidToken()) {
            console.log('🔄 토큰 만료 감지 - 갱신 시도');
            const success = await refreshToken();
            if (success) {
              console.log('✅ 토큰 갱신 성공');
            } else {
              console.log('❌ 토큰 갱신 실패');
            }
          }
        } catch (error) {
          console.error('가시성 변경 시 토큰 확인 실패:', error);
        } finally {
          isProcessing = false;
        }
      }, 1000); // 1초 디바운싱
    };

    const handleFocus = async () => {
      if (isProcessing) return;

      console.log('🔄 윈도우 포커스 - 토큰 상태 확인');

      // 디바운싱 적용
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      debounceTimer = window.setTimeout(async () => {
        if (isProcessing) return;
        isProcessing = true;

        try {
          const currentToken = getCurrentToken();
          if (currentToken && !hasValidToken()) {
            console.log('🔄 토큰 만료 감지 - 갱신 시도');
            const success = await refreshToken();
            if (success) {
              console.log('✅ 토큰 갱신 성공');
            } else {
              console.log('❌ 토큰 갱신 실패');
            }
          }
        } catch (error) {
          console.error('포커스 시 토큰 확인 실패:', error);
        } finally {
          isProcessing = false;
        }
      }, 1000); // 1초 디바운싱
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);

      // 타이머 정리
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, []);

  // 모니터링 시스템 초기화
  useEffect(() => {
    // 앱 시작 이벤트 추적
    if (monitoringService) {
      monitoringService.trackCustomEvent('app_started', {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
      });
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <GlobalStyles />
          <Router>
            {/* 🔧 개선: 전역 네비게이션 헬퍼 설정 */}
            <AppRouter />
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

// 🔧 개선: 라우터 컴포넌트를 분리하여 useNavigate 사용
const AppRouter: React.FC = () => {
  const navigate = useNavigate();

  // 전역 네비게이션 헬퍼 설정
  React.useEffect(() => {
    window.globalNavigate = navigate;
  }, [navigate]);

  return (
    <Suspense
      fallback={
        <LoadingSpinner
          label='페이지를 불러오는 중입니다...'
          size={48}
          color='#f7c600'
        />
      }
    >
      <Routes>
        {/* Landing & Auth */}
        <Route path='/landing' element={<Landing />} />
        <Route path='/' element={<RootRedirect />} />
        <Route path='/login' element={<Login />} />
        <Route path='/ladyLogin' element={<ReadyLogin />} />

        <Route path='/PersonalLink' element={<PersonalLink />} />
        <Route path='/test/payple' element={<PaypleTest />} />
        <Route path='/test/AddCardPayple' element={<AddCardPayple />} />
        <Route path='/Link' element={<Link />} />
        <Route path='/signup' element={<Signup />} />

        {/* 테스트 페이지 라우트 - 일반 경로로 이동 */}
        <Route path='/test-login' element={<TestLoginPage />} />
        <Route path='/test-dashboard' element={<TestDashboard />} />

        <Route element={<AppLayout />}>
          <Route path='/UpdateProfile' element={<UpdateProfile />} />
          <Route path='/ChangePassword' element={<ChangePassword />} />
          <Route path='/DeliveryManagement' element={<DeliveryManagement />} />
          <Route path='/EditAddress' element={<EditAddress />} />
          {/* User Pages */}
          <Route path='/MyinfoList' element={<MyInfoList />} />
          <Route path='/MyStyle' element={<MyStyle />} />

          {/* Main */}
          <Route path='/home' element={<Home />} />
          <Route path='/item/:id' element={<HomeDetail />} />
          <Route path='/analysis' element={<Analysis />} />
          <Route path='/basket' element={<Basket />} />
          <Route path='/alarm' element={<Alarm />} />
          <Route path='/payment/:id' element={<Payment />} />
          <Route path='/payment/complete' element={<PaymentComplete />} />
          <Route path='/payment/fail' element={<PaymentFail />} />

          {/* Brand */}
          <Route path='/brand' element={<Brand />} />
          <Route path='/brand/:brandId' element={<BrandDetail />} />

          {/* Melpik */}
          <Route path='/melpik' element={<Melpik />} />
          <Route path='/create-melpik' element={<CreateMelpik />} />
          <Route
            path='/createMelpik/settings'
            element={<ContemporarySettings />}
          />
          <Route path='/melpik-settings' element={<Setting />} />

          {/* Settlement */}
          <Route path='/sales-settlement' element={<SalesSettlement />} />
          <Route
            path='/sales-settlement-detail/:id'
            element={<SalesSettlementDetail />}
          />
          <Route path='/settlement-request' element={<SettlementRequest />} />

          {/* Schedule */}
          <Route path='/sales-schedule' element={<Schedule />} />
          <Route
            path='/schedule/confirmation/:scheduleId'
            element={<ScheduleConfirmation />}
          />
          <Route
            path='/schedule/reservation1'
            element={<ScheduleReservation1 />}
          />
          <Route
            path='/schedule/reservation2'
            element={<ScheduleReservation2 />}
          />
          <Route
            path='/schedule/reservation3'
            element={<ScheduleReservation3 />}
          />

          {/* FindId, FindPassword를 AppLayout 내부로 이동 */}
          <Route path='/findid' element={<FindId />} />
          <Route path='/findPassword' element={<FindPassword />} />

          {/* LockerRoom */}
          <Route path='/lockerRoom' element={<LockerRoom />} />
          <Route path='/usage-history' element={<UsageHistory />} />
          <Route path='/point' element={<Point />} />
          <Route path='/my-closet' element={<MyCloset />} />
          <Route path='/my-ticket' element={<MyTicket />} />
          <Route
            path='/my-ticket/PurchaseOfPasses'
            element={<PurchaseOfPasses />}
          />

          <Route
            path='/my-ticket/PurchaseOfPasses/TicketPayment'
            element={<TicketPayment />}
          />

          {/* PaymentMethod & Reviews */}
          <Route path='/payment-method' element={<PaymentMethod />} />
          <Route path='/payment-method/addcard' element={<AddCard />} />

          <Route path='/product-review' element={<ProductReview />} />
          <Route
            path='/payment-review/Write'
            element={<ProductReviewWrite />}
          />

          {/* CustomerService */}
          <Route path='/customerService' element={<CustomerService />} />
          <Route path='/customerService/:type' element={<DocumentList />} />
          <Route
            path='/customerService/:type/:id'
            element={<DocumentDetail />}
          />
          <Route path='/password-change' element={<PasswordChange />} />

          {/* 결제 완료/실패 - 이전 경로는 리다이렉트로 처리 */}
          <Route
            path='/payment-complete'
            element={<Navigate to='/payment/complete' replace />}
          />
          <Route
            path='/payment-fail'
            element={<Navigate to='/payment/fail' replace />}
          />

          <Route path='/ticketDetail/:ticketId' element={<TicketDetail />} />
        </Route>
        <Route path='*' element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
