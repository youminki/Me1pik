import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { Suspense, useCallback, useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useLocation,
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
  checkTokenAndRedirect,
  isProtectedRoute,
  hasValidToken,
  refreshToken,
  getCurrentToken,
  restorePersistentLogin,
  checkAndSetupAutoLogin,
} from '@/utils/auth';
import { monitoringService, setUserId } from '@/utils/monitoring';

// RootRedirect 컴포넌트 - 토큰 상태에 따라 적절한 페이지로 리다이렉트
const RootRedirect: React.FC = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // 1. 지속 로그인 상태 확인
        const persistentLogin = localStorage.getItem('persistentLogin');
        const autoLogin = localStorage.getItem('autoLogin');

        if (persistentLogin === 'true' || autoLogin === 'true') {
          console.log('🔄 지속 로그인 설정 감지됨 - 자동 로그인 시도');

          // 2. 저장된 토큰으로 자동 로그인 시도
          const autoLoginSuccess = await restorePersistentLogin();
          if (autoLoginSuccess) {
            console.log('✅ 자동 로그인 성공 - 홈으로 이동');
            setRedirectPath('/home');
            return;
          }
        }

        // 3. 일반 토큰 상태 확인
        const token = getCurrentToken();
        if (token && hasValidToken()) {
          console.log('✅ 유효한 토큰 존재 - 홈으로 이동');
          setRedirectPath('/home');
        } else {
          console.log('ℹ️ 유효한 토큰 없음 - 로그인 페이지로 이동');
          setRedirectPath('/login');
        }
      } catch (error) {
        console.error('로그인 상태 확인 중 오류:', error);
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

// Performance API 타입 정의
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface NetworkInformation extends EventTarget {
  effectiveType: string;
  downlink: number;
  rtt: number;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

// React Query 클라이언트 설정 - 성능 최적화
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 캐시 시간 최적화
      staleTime: 1000 * 60 * 10, // 10분 (기존 5분에서 증가)
      gcTime: 1000 * 60 * 30, // 30분 (기존 5분에서 증가)

      // 재시도 로직 최적화
      retry: (failureCount, error: unknown) => {
        // 401 오류는 재시도하지 않음
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 401) {
            return false;
          }
        }
        // 네트워크 오류는 2번만 재시도 (기존 3번에서 감소)
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
const ReadyLogin = React.lazy(() => import('@/pages/auths/LoginReady'));

const PasswordChange = React.lazy(() => import('@/pages/auths/PasswordChange'));
const Signup = React.lazy(() => import('@/pages/auths/Signup'));

// 테스트 페이지 컴포넌트들
const TestLoginPage = React.lazy(() => import('@/pages/tests/TestLogin'));
const TestDashboard = React.lazy(() => import('@/pages/tests/TestDashboard'));
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
const PaymentFail = React.lazy(() => import('@/pages/payments/Paymentfail'));
const ChangePassword = React.lazy(
  () => import('@/pages/profile/ChangePassword')
);
const DeliveryManagement = React.lazy(
  () => import('@/pages/profile/DeliveryManagement')
);
const EditAddress = React.lazy(() => import('@/pages/profile/EditAddress'));
const UpdateProfile = React.lazy(() => import('@/pages/profile/UpdateProfile'));

const AuthGuard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);

  // 로그인 페이지로 이동하는 함수
  const redirectToLogin = useCallback(() => {
    if (location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    // 초기 인증 체크
    const checkInitialAuth = async () => {
      try {
        // 테스트 관련 경로는 인증 체크 제외 (/test-*, /test/* 모두)
        const isTestRoute =
          location.pathname.startsWith('/test-') ||
          location.pathname.startsWith('/test/');

        if (isTestRoute) {
          setIsInitialized(true);
          return;
        }

        const needsRedirect = checkTokenAndRedirect(location.pathname);
        if (needsRedirect && isProtectedRoute(location.pathname)) {
          redirectToLogin();
        }
      } catch {
        redirectToLogin();
      } finally {
        setIsInitialized(true);
      }
    };

    checkInitialAuth();
  }, [location.pathname, navigate, redirectToLogin]);

  // 라우트 변경 시 인증 체크
  useEffect(() => {
    if (!isInitialized) return;

    // 테스트 관련 경로는 인증 체크 제외 (/test-*, /test/* 모두)
    const isTestRoute =
      location.pathname.startsWith('/test-') ||
      location.pathname.startsWith('/test/');

    if (isTestRoute) {
      return;
    }

    // 보호된 라우트에서 토큰 체크 및 리다이렉트
    const needsRedirect = checkTokenAndRedirect(location.pathname);
    if (needsRedirect) {
      redirectToLogin();
      return;
    }
  }, [location.pathname, isInitialized, redirectToLogin]);

  return null;
};

// 모듈 스코프에서 interval 관리
let autoRefreshTimer: ReturnType<typeof setInterval> | null = null;

const App: React.FC = () => {
  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 앱 초기화 시작');

      // 1. 자동 로그인 상태 복원 시도
      const autoLoginSuccess = await restorePersistentLogin();
      if (autoLoginSuccess) {
        console.log('✅ 자동 로그인 성공 - 사용자 인증됨');
      } else {
        console.log('ℹ️ 자동 로그인 실패 또는 설정되지 않음');
      }

      // 2. 자동 로그인 설정 확인 및 타이머 설정
      checkAndSetupAutoLogin();

      // 3. 기존 자동 로그인 로직 실행
      const tryAutoLogin = async () => {
        const token = getCurrentToken();
        const autoLogin = localStorage.getItem('autoLogin') === 'true';

        if (token && !hasValidToken()) {
          // accessToken이 만료된 경우 refresh 시도
          await refreshToken();
          // refresh 실패 시에는 기존 인증 체크 로직에 따라 로그인 페이지로 이동
        }

        // 30일 자동 로그인 설정이 활성화된 경우 추가 처리
        if (autoLogin) {
          // 30일 자동 로그인 설정이 활성화되어 있습니다

          // 기존 interval이 있으면 정리
          if (autoRefreshTimer) {
            clearInterval(autoRefreshTimer);
            autoRefreshTimer = null;
          }

          // 자동 토큰 갱신 인터벌 설정
          autoRefreshTimer = setInterval(async () => {
            try {
              const currentToken = getCurrentToken();
              if (currentToken && !hasValidToken()) {
                await refreshToken();
              }
            } catch (error) {
              console.error('자동 토큰 갱신 실패:', error);
              // 실패 시 interval 정리
              if (autoRefreshTimer) {
                clearInterval(autoRefreshTimer);
                autoRefreshTimer = null;
              }
            }
          }, 60_000); // 1분마다 체크
        }
      };

      tryAutoLogin();
    };

    initializeApp();

    // 강제 로그인 리다이렉트 이벤트 리스너
    const handleForceLoginRedirect = () => {
      // 강제 로그인 리다이렉트 이벤트 발생
      window.location.href = '/login';
    };

    window.addEventListener('forceLoginRedirect', handleForceLoginRedirect);

    // 컴포넌트 언마운트 시 interval 정리
    return () => {
      if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
        autoRefreshTimer = null;
      }
    };
  }, []);

  // 모니터링 시스템 초기화
  useEffect(() => {
    // 앱 시작 이벤트 추적
    monitoringService.trackCustomEvent('app_start', {
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      environment: import.meta.env.MODE,
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    });

    // 사용자 ID 설정 (로그인 시)
    const token = getCurrentToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.userId) {
          setUserId(payload.userId);
        }
      } catch (error) {
        console.warn('토큰에서 사용자 ID 추출 실패:', error);
      }
    }

    // Service Worker 등록 (더 안전한 방식)
    if ('serviceWorker' in navigator) {
      if (import.meta.env.DEV) {
        // 개발 환경에서는 기존 Service Worker 제거
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
      } else {
        // 프로덕션 환경에서는 기존 등록 유지하고 업데이트만 확인
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            // Service Worker 등록 성공
            registration.update(); // 최신본 확인

            // Service Worker 업데이트 확인
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (
                    newWorker.state === 'installed' &&
                    navigator.serviceWorker.controller
                  ) {
                    // 새 버전이 설치되었을 때 사용자에게 알림
                    monitoringService.trackCustomEvent('sw_update_available');
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error('❌ Service Worker 등록 실패:', error);
            monitoringService.trackCustomEvent('sw_registration_failed', {
              error: error.message,
            });
          });
      }
    }

    // 성능 모니터링 시작
    const startPerformanceMonitoring = () => {
      if ('PerformanceObserver' in window) {
        const observers: PerformanceObserver[] = [];

        // LCP (Largest Contentful Paint)
        try {
          const lcpObs = new PerformanceObserver((list) => {
            const last = list.getEntries().pop();
            if (last) {
              monitoringService.trackCustomEvent('performance_lcp', {
                value: last.startTime,
                url: location.href,
              });
            }
          });
          lcpObs.observe({
            type: 'largest-contentful-paint',
            buffered: true,
          } as PerformanceObserverInit);
          observers.push(lcpObs);
        } catch {
          // PerformanceObserver 지원하지 않는 경우 무시
        }

        // INP (Interaction to Next Paint) - FID 대신 사용
        try {
          const inpObs = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const eventEntry = entry as PerformanceEntry & {
                duration?: number;
                name?: string;
              };
              if (eventEntry.name === 'event' && eventEntry.duration) {
                monitoringService.trackCustomEvent('performance_inp', {
                  value: eventEntry.duration,
                  url: location.href,
                });
              }
            }
          });
          inpObs.observe({
            type: 'event',
            buffered: true,
          } as PerformanceObserverInit);
          observers.push(inpObs);
        } catch {
          // PerformanceObserver 지원하지 않는 경우 무시
        }

        // CLS (Cumulative Layout Shift)
        let clsValue = 0;
        try {
          const clsObs = new PerformanceObserver((list) => {
            for (const e of list.getEntries()) {
              const layoutShiftEntry = e as LayoutShift;
              if (!layoutShiftEntry.hadRecentInput)
                clsValue += layoutShiftEntry.value || 0;
            }
          });
          clsObs.observe({
            type: 'layout-shift',
            buffered: true,
          } as PerformanceObserverInit);
          observers.push(clsObs);

          // 페이지 숨김/종료 시 CLS 전송
          const flushCls = () =>
            monitoringService.trackCustomEvent('performance_cls', {
              value: clsValue,
              url: location.href,
            });

          document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') flushCls();
          });
          window.addEventListener('pagehide', flushCls);
        } catch {
          // PerformanceObserver 지원하지 않는 경우 무시
        }

        // TTFB (Time to First Byte) - navigation entry에서 측정
        const nav = performance.getEntriesByType('navigation')[0] as
          | PerformanceNavigationTiming
          | undefined;
        if (nav) {
          monitoringService.trackCustomEvent('performance_ttfb', {
            value: nav.responseStart - nav.requestStart,
            url: location.href,
          });
        }

        // 컴포넌트 언마운트 시 옵저버 정리
        return () => {
          observers.forEach((o) => o.disconnect());
        };
      }
    };

    const cleanupPerformanceMonitoring = startPerformanceMonitoring();

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (cleanupPerformanceMonitoring) {
        cleanupPerformanceMonitoring();
      }
    };

    // 네트워크 상태 모니터링
    const monitorNetworkStatus = () => {
      const nav = navigator as NavigatorWithConnection;
      const connection = nav.connection;

      if (connection?.addEventListener) {
        connection.addEventListener('change', () => {
          monitoringService.trackCustomEvent('network_change', {
            effectiveType: connection.effectiveType || 'unknown',
            downlink: connection.downlink || 0,
            rtt: connection.rtt || 0,
            url: location.href,
          });
        });
      }
    };

    monitorNetworkStatus();

    // 메모리 사용량 모니터링 (Chrome에서만 지원)
    if ('memory' in performance) {
      const memory = (
        performance as Performance & { memory: PerformanceMemory }
      ).memory;
      if (memory) {
        monitoringService.trackCustomEvent('performance_memory', {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          url: location.href,
        });
      }
    }
  }, []);

  // 네이티브 앱 환경에서 상태바 높이 설정
  // 앱 초기화 코드 제거됨

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <GlobalStyles />
          <Router>
            <AuthGuard />
            {/* 전체 페이지 라우트 로딩에는 원형 스피너, 명확한 안내 문구 */}
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
                {/* <Route path='/findid' element={<FindId />} />
            <Route path='/findPassword' element={<FindPassword />} /> */}

                <Route element={<AppLayout />}>
                  <Route path='/UpdateProfile' element={<UpdateProfile />} />
                  <Route path='/ChangePassword' element={<ChangePassword />} />
                  <Route
                    path='/DeliveryManagement'
                    element={<DeliveryManagement />}
                  />
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
                  {/* <Route path='/payment/:id' element={<Payment />} /> */}
                  <Route path='/payment/:id' element={<Payment />} />
                  <Route
                    path='/payment/complete'
                    element={<PaymentComplete />}
                  />
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
                  <Route
                    path='/sales-settlement'
                    element={<SalesSettlement />}
                  />
                  <Route
                    path='/sales-settlement-detail/:id'
                    element={<SalesSettlementDetail />}
                  />
                  <Route
                    path='/settlement-request'
                    element={<SettlementRequest />}
                  />

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

                  {/* <Route
          path='/my-ticket/SubscriptionPass'
          element={<SubscriptionPass />}
        />
        <Route path='/my-ticket/OnetimePass' element={<OnetimePass />} /> */}

                  {/* PaymentMethod & Reviews */}
                  <Route path='/payment-method' element={<PaymentMethod />} />
                  <Route path='/payment-method/addcard' element={<AddCard />} />

                  <Route path='/product-review' element={<ProductReview />} />
                  <Route
                    path='/payment-review/Write'
                    element={<ProductReviewWrite />}
                  />

                  {/* CustomerService */}
                  <Route
                    path='/customerService'
                    element={<CustomerService />}
                  />
                  <Route
                    path='/customerService/:type'
                    element={<DocumentList />}
                  />
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

                  <Route
                    path='/ticketDetail/:ticketId'
                    element={<TicketDetail />}
                  />
                </Route>
                <Route path='*' element={<NotFound />} />
              </Routes>
            </Suspense>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
