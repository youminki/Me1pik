import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { Suspense, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import AddCardPayple from '@/__tests__/development/AddCardPayple';
import PaypleTest from '@/__tests__/development/PaypleTest';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import LoginModal from '@/components/shared/LoginModal';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useLoadingState } from '@/hooks/useLoadingState';
import Melpik from '@/pages/melpiks/Melpik';
import GlobalStyles from '@/styles/GlobalStyles';
import { theme } from '@/styles/Theme';
import { refreshToken, getCurrentToken } from '@/utils/auth';
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

// 최적화된 lazy 로딩 함수
const createLazyComponent = (
  importFn: () => Promise<{ default: React.ComponentType }>
) => {
  let Component: React.ComponentType | null = null;
  let loadingPromise: Promise<{ default: React.ComponentType }> | null = null;

  const LazyComponent = React.lazy(() => {
    if (Component) {
      return Promise.resolve({ default: Component });
    }

    if (loadingPromise) {
      return loadingPromise;
    }

    loadingPromise = importFn().then((module) => {
      Component = module.default;
      return { default: Component };
    });

    return loadingPromise;
  });

  // 프리로딩 함수 추가
  (
    LazyComponent as React.LazyExoticComponent<React.ComponentType> & {
      preload?: () => Promise<{ default: React.ComponentType }>;
    }
  ).preload = () => {
    if (!Component && !loadingPromise) {
      loadingPromise = importFn().then((module) => {
        Component = module.default;
        return { default: Component };
      });
    }
    return loadingPromise || Promise.resolve({ default: Component! });
  };

  return LazyComponent;
};

// 지연 로딩을 위한 컴포넌트들 (캐싱 적용)
const Alarm = createLazyComponent(() => import('@/pages/alarms/Alarm'));
const Analysis = createLazyComponent(() => import('@/pages/analyses/Analysis'));
const FindId = createLazyComponent(() => import('@/pages/auths/FindId'));
const FindPassword = createLazyComponent(
  () => import('@/pages/auths/FindPassword')
);
const Login = createLazyComponent(() => import('@/pages/auths/Login'));
const ReadyLogin = createLazyComponent(
  () => import('@/pages/auths/LoginReady')
);
const TestLogin = createLazyComponent(() => import('@/pages/auths/LoginTest'));
const PasswordChange = createLazyComponent(
  () => import('@/pages/auths/PasswordChange')
);
const Signup = createLazyComponent(() => import('@/pages/auths/Signup'));

// Brand 관련 컴포넌트들
const Brand = createLazyComponent(() => import('@/pages/brands/Brand'));
const BrandDetail = createLazyComponent(
  () => import('@/pages/brands/BrandDetail')
);

// 테스트 페이지 컴포넌트들
const TestLoginPage = createLazyComponent(
  () => import('@/pages/tests/TestLogin')
);
const TestDashboard = createLazyComponent(
  () => import('@/pages/tests/TestDashboard')
);
const Basket = createLazyComponent(() => import('@/pages/baskets/Basket'));
const CustomerService = createLazyComponent(
  () => import('@/pages/customer-services/CustomerService')
);
const DocumentDetail = createLazyComponent(
  () => import('@/pages/customer-services/documents/DocumentDetail')
);
const DocumentList = createLazyComponent(
  () => import('@/pages/customer-services/documents/DocumentList')
);
const NotFound = createLazyComponent(() => import('@/pages/errors/NotFound'));
const Home = createLazyComponent(() => import('@/pages/homes/Home'));
const HomeDetail = createLazyComponent(
  () => import('@/pages/homes/HomeDetail')
);
const Landing = createLazyComponent(() => import('@/pages/landings/Landing'));
const AppLayout = createLazyComponent(
  () => import('@/pages/layouts/AppLayout')
);
const Link = createLazyComponent(() => import('@/pages/links/Link'));
const PersonalLink = createLazyComponent(
  () => import('@/pages/links/PersonalLink')
);
const LockerRoom = createLazyComponent(
  () => import('@/pages/locker-rooms/LockerRoom')
);
const MyCloset = createLazyComponent(
  () => import('@/pages/locker-rooms/my-closets/MyCloset')
);
const MyTicket = createLazyComponent(
  () => import('@/pages/locker-rooms/my-tickets/MyTicket')
);
const PurchaseOfPasses = createLazyComponent(
  () => import('@/pages/locker-rooms/my-tickets/PurchaseOfPasses')
);
const TicketDetail = createLazyComponent(
  () => import('@/pages/locker-rooms/my-tickets/TicketDetail')
);
const TicketPayment = createLazyComponent(
  () => import('@/pages/locker-rooms/my-tickets/TicketPayment.tsx')
);
const AddCard = createLazyComponent(
  () => import('@/pages/locker-rooms/payment-methods/AddCard')
);
const PaymentMethod = createLazyComponent(
  () => import('@/pages/locker-rooms/payment-methods/PaymentMethod')
);
const Point = createLazyComponent(
  () => import('@/pages/locker-rooms/points/Point')
);
const ProductReview = createLazyComponent(
  () => import('@/pages/locker-rooms/product-reviews/ProductReview')
);
const ProductReviewWrite = createLazyComponent(
  () => import('@/pages/locker-rooms/product-reviews/ProductReviewWrite')
);
const UsageHistory = createLazyComponent(
  () => import('@/pages/locker-rooms/usage-histories/UsageHistory')
);
const SalesSettlement = createLazyComponent(
  () => import('@/pages/melpiks/calculates/SalesSettlement')
);
const SalesSettlementDetail = createLazyComponent(
  () => import('@/pages/melpiks/calculates/SalesSettlementDetail')
);
const SettlementRequest = createLazyComponent(
  () => import('@/pages/melpiks/calculates/SettlementRequest')
);
const ContemporarySettings = createLazyComponent(
  () => import('@/pages/melpiks/creates/ContemporarySettings')
);
const CreateMelpik = createLazyComponent(
  () => import('@/pages/melpiks/creates/CreateMelpik')
);
const Schedule = createLazyComponent(
  () => import('@/pages/melpiks/schedules/Schedule')
);
const ScheduleConfirmation = createLazyComponent(
  () => import('@/pages/melpiks/schedules/ScheduleConfirmation')
);
const ScheduleReservation1 = createLazyComponent(
  () => import('@/pages/melpiks/schedules/ScheduleReservationStep1')
);
const ScheduleReservation2 = createLazyComponent(
  () => import('@/pages/melpiks/schedules/ScheduleReservationStep2')
);
const ScheduleReservation3 = createLazyComponent(
  () => import('@/pages/melpiks/schedules/ScheduleReservationStep3')
);
const Setting = createLazyComponent(
  () => import('@/pages/melpiks/settings/SettingMelpik')
);
const MyInfoList = createLazyComponent(
  () => import('@/pages/my-info/MyInfoList')
);
const MyStyle = createLazyComponent(() => import('@/pages/my-styles/MyStyle'));
const Payment = createLazyComponent(() => import('@/pages/payments/Payment'));
const PaymentComplete = createLazyComponent(
  () => import('@/pages/payments/PaymentComplete')
);
const PaymentFail = createLazyComponent(
  () => import('@/pages/payments/Paymentfail')
);
const ChangePassword = createLazyComponent(
  () => import('@/pages/profile/ChangePassword')
);
const DeliveryManagement = createLazyComponent(
  () => import('@/pages/profile/DeliveryManagement')
);
const EditAddress = createLazyComponent(
  () => import('@/pages/profile/EditAddress')
);
const UpdateProfile = createLazyComponent(
  () => import('@/pages/profile/UpdateProfile')
);

// AuthGuard 제거 - 로그인 모달로 대체

// 전역 로그인 모달 처리 컴포넌트
const GlobalLoginModalHandler: React.FC = () => {
  const {
    showLoginModal,
    isLoginModalOpen,
    hideLoginModal,
    loginModalMessage,
  } = useAuth();

  useEffect(() => {
    const handleShowLoginModal = (event: CustomEvent) => {
      showLoginModal(event.detail?.message);
    };

    window.addEventListener(
      'showLoginModal',
      handleShowLoginModal as EventListener
    );

    return () => {
      window.removeEventListener(
        'showLoginModal',
        handleShowLoginModal as EventListener
      );
    };
  }, [showLoginModal]);

  return (
    <LoginModal
      isOpen={isLoginModalOpen}
      onClose={hideLoginModal}
      message={loginModalMessage}
    />
  );
};

const App: React.FC = () => {
  const { isLoading } = useLoadingState(5000); // 5초 타임아웃

  useEffect(() => {
    const tryAutoLogin = async () => {
      const token = getCurrentToken();
      if (token) {
        try {
          // 토큰 유효성 확인
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            const currentTime = Date.now() / 1000;

            // 토큰이 만료되었거나 곧 만료될 예정이면 갱신 시도
            if (payload.exp && payload.exp < currentTime + 300) {
              // 5분 전
              await refreshToken();
            }
          }
        } catch (error) {
          console.error('토큰 갱신 실패:', error);
        }
      }
    };
    tryAutoLogin();

    // 강제 로그인 리다이렉트 이벤트 리스너
    const handleForceLoginRedirect = () => {
      console.log('🔄 강제 로그인 리다이렉트 이벤트 발생');
      window.location.href = '/login';
    };

    window.addEventListener('forceLoginRedirect', handleForceLoginRedirect);

    return () => {
      window.removeEventListener(
        'forceLoginRedirect',
        handleForceLoginRedirect
      );
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
        <AuthProvider>
          <Router>
            <GlobalLoginModalHandler />
            {/* 전체 페이지 라우트 로딩에는 원형 스피너, 명확한 안내 문구 */}
            <Suspense
              fallback={
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  <LoadingSpinner
                    label='페이지를 불러오는 중입니다...'
                    size={48}
                    color='#f7c600'
                  />
                  <div
                    style={{
                      fontSize: '14px',
                      color: '#666',
                      textAlign: 'center',
                    }}
                  >
                    {isLoading ? '잠시만 기다려주세요...' : '페이지 로딩 중...'}
                  </div>
                </div>
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
                <Route path='/Link' element={<Link />} />
                <Route path='/signup' element={<Signup />} />

                {/* 테스트 페이지 라우트 */}
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
                  <Route
                    path='/payment-complete'
                    element={<PaymentComplete />}
                  />
                  <Route path='/payment-fail' element={<PaymentFail />} />

                  <Route
                    path='/ticketDetail/:ticketId'
                    element={<TicketDetail />}
                  />
                </Route>
                <Route path='*' element={<NotFound />} />
              </Routes>
            </Suspense>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
