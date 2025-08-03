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
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import GlobalStyles from '@/styles/GlobalStyles';
import { theme } from '@/styles/Theme';
import {
  checkTokenAndRedirect,
  isProtectedRoute,
  hasValidToken,
  refreshToken,
  getCurrentToken,
} from '@/utils/auth';
import { monitoringService, setUserId } from '@/utils/monitoring';

// Performance API 타입 정의
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
  startTime: number;
}

interface NetworkInformation extends EventTarget {
  effectiveType: string;
  downlink: number;
  rtt: number;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
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
const TestLogin = React.lazy(() => import('@/pages/auths/LoginTest'));
const PasswordChange = React.lazy(() => import('@/pages/auths/PasswordChange'));
const Signup = React.lazy(() => import('@/pages/auths/Signup'));
const TokenTestPage = React.lazy(
  () => import('@/pages/token-test/TokenTestPage')
);
const Basket = React.lazy(() => import('@/pages/baskets/Basket'));
const Brand = React.lazy(() => import('@/pages/brands/Brand'));
const BrandDetail = React.lazy(() => import('@/pages/brands/BrandDetail'));
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
const Melpik = React.lazy(() => import('@/pages/melpiks/Melpik'));
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

    // 보호된 라우트에서 토큰 체크 및 리다이렉트
    const needsRedirect = checkTokenAndRedirect(location.pathname);
    if (needsRedirect) {
      redirectToLogin();
      return;
    }
  }, [location.pathname, isInitialized, redirectToLogin]);

  return null;
};

const App: React.FC = () => {
  useEffect(() => {
    const tryAutoLogin = async () => {
      const token = getCurrentToken();
      if (token && !hasValidToken()) {
        // accessToken이 만료된 경우 refresh 시도
        await refreshToken();
        // refresh 실패 시에는 기존 인증 체크 로직에 따라 로그인 페이지로 이동
      }
      // 토큰이 없으면 기존 인증 체크 로직이 동작함
    };
    tryAutoLogin();
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

    // Service Worker 등록
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker 등록 성공:', registration);

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

    // 성능 모니터링 시작
    const startPerformanceMonitoring = () => {
      // Core Web Vitals 모니터링
      if ('PerformanceObserver' in window) {
        // LCP (Largest Contentful Paint)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry.entryType === 'largest-contentful-paint') {
            monitoringService.trackCustomEvent('performance_lcp', {
              value: lastEntry.startTime,
              url: window.location.href,
            });
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // FID (First Input Delay) 모니터링
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'first-input') {
              const firstInputEntry = entry as PerformanceEventTiming;
              monitoringService.trackCustomEvent('performance_fid', {
                value:
                  firstInputEntry.processingStart - firstInputEntry.startTime,
                url: window.location.href,
              });
            }
          });
        }).observe({ entryTypes: ['first-input'] });

        // CLS (Cumulative Layout Shift) 모니터링
        let clsValue = 0;
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'layout-shift') {
              const layoutShiftEntry = entry as LayoutShift;
              if (!layoutShiftEntry.hadRecentInput) {
                clsValue += layoutShiftEntry.value;
              }
            }
          });

          // 페이지 언로드 시 CLS 값 전송
          window.addEventListener('beforeunload', () => {
            monitoringService.trackCustomEvent('performance_cls', {
              value: clsValue,
              url: window.location.href,
            });
          });
        }).observe({ entryTypes: ['layout-shift'] });
      }
    };

    startPerformanceMonitoring();

    // 네트워크 상태 모니터링
    const monitorNetworkStatus = () => {
      if ('connection' in navigator) {
        const connection = (navigator as NavigatorWithConnection).connection;

        if (connection) {
          monitoringService.trackCustomEvent('network_info', {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
          });

          connection.addEventListener('change', () => {
            monitoringService.trackCustomEvent('network_change', {
              effectiveType: connection.effectiveType,
              downlink: connection.downlink,
              rtt: connection.rtt,
            });
          });
        }
      }
    };

    monitorNetworkStatus();

    // 메모리 사용량 모니터링 (개발 환경에서만)
    if (import.meta.env.DEV && 'memory' in performance) {
      const memory = (performance as PerformanceWithMemory).memory;
      if (memory) {
        setInterval(() => {
          monitoringService.trackCustomEvent('memory_usage', {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
          });
        }, 30000); // 30초마다 체크
      }
    }
  }, []);

  // 네이티브 앱 환경에서 상태바 높이 설정
  // 앱 초기화 코드 제거됨

  return (
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
              <Route path='/' element={<Navigate to='/home' replace />} />
              <Route path='/login' element={<Login />} />
              <Route path='/ladyLogin' element={<ReadyLogin />} />
              <Route path='/TestLogin' element={<TestLogin />} />
              <Route path='/PersonalLink' element={<PersonalLink />} />
              <Route path='/test/payple' element={<PaypleTest />} />
              <Route path='/test/AddCardPayple' element={<AddCardPayple />} />
              <Route path='/token-test' element={<TokenTestPage />} />
              <Route path='/Link' element={<Link />} />
              <Route path='/signup' element={<Signup />} />
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
                <Route path='/customerService' element={<CustomerService />} />
                <Route
                  path='/customerService/:type'
                  element={<DocumentList />}
                />
                <Route
                  path='/customerService/:type/:id'
                  element={<DocumentDetail />}
                />
                <Route path='/password-change' element={<PasswordChange />} />
                <Route path='/payment-complete' element={<PaymentComplete />} />
                <Route path='/payment-fail' element={<PaymentFail />} />

                <Route
                  path='/ticketDetail/:ticketId'
                  element={<TicketDetail />}
                />
              </Route>
              <Route path='*' element={<NotFound />} />
            </Routes>
          </Suspense>

          {/* 개발 모드에서만 토큰 테스트 패널 표시 */}
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
