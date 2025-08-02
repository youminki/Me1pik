/**
 * 앱 루트 컴포넌트 (App.tsx)
 *
 * 전체 애플리케이션의 핵심 진입점으로 다음 기능들을 통합 관리합니다:
 * - 전역 상태 관리 (React Query)
 * - 테마 및 스타일링 (styled-components)
 * - 라우팅 및 인증 가드
 * - 성능 모니터링 및 분석
 * - 네이티브 앱 연동
 */
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

/**
 * Core Web Vitals 및 성능 모니터링 타입 정의
 *
 * 웹 성능 측정을 위한 주요 인터페이스들을 정의합니다:
 * - LayoutShift: 레이아웃 변화 측정
 * - PerformanceEventTiming: 이벤트 타이밍 측정
 * - NetworkInformation: 네트워크 상태 정보
 * - PerformanceWithMemory: 메모리 사용량 측정
 */
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
  startTime: number;
}

/**
 * 네트워크 연결 정보를 위한 타입 정의
 */
interface NetworkInformation extends EventTarget {
  effectiveType: string; // 연결 타입 (4g, 3g 등)
  downlink: number; // 다운로드 속도 (Mbps)
  rtt: number; // 왕복 시간 (ms)
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

/**
 * 메모리 사용량 모니터링을 위한 타입 정의
 */
interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number; // 사용 중인 힙 메모리
    totalJSHeapSize: number; // 총 힙 메모리
    jsHeapSizeLimit: number; // 힙 메모리 제한
  };
}

/**
 * React Query 클라이언트 설정
 *
 * API 요청의 효율성과 사용자 경험 최적화를 위한 설정:
 * - 캐시 관리 (신선도 유지, 가비지 컬렉션)
 * - 재시도 로직 (네트워크 오류, 인증 오류 구분)
 * - 백오프 전략 (지수 백오프)
 * - 포커스/네트워크 재연결 시 동작
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10분 - 데이터 신선도 유지 시간
      gcTime: 1000 * 60 * 30, // 30분 - 가비지 컬렉션 시간

      retry: (failureCount, error: unknown) => {
        // 401 인증 오류는 재시도하지 않음 (토큰 갱신으로 처리)
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 401) {
            return false;
          }
        }
        // 네트워크 오류는 최대 2번만 재시도
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // 지수 백오프, 최대 10초

      refetchOnWindowFocus: false, // 윈도우 포커스 시 재요청 비활성화
      refetchOnReconnect: true, // 네트워크 재연결 시 재요청 활성화
    },
    mutations: {
      retry: false, // 뮤테이션은 재시도하지 않음
    },
  },
});

/**
 * 코드 스플리팅을 위한 지연 로딩 컴포넌트들
 * 초기 번들 크기를 줄이고 필요할 때만 로드
 */
const Alarm = React.lazy(() => import('@/pages/alarms/Alarm'));
const Analysis = React.lazy(() => import('@/pages/analyses/Analysis'));
const FindId = React.lazy(() => import('@/pages/auths/FindId'));
const FindPassword = React.lazy(() => import('@/pages/auths/FindPassword'));
const Login = React.lazy(() => import('@/pages/auths/Login'));
const ReadyLogin = React.lazy(() => import('@/pages/auths/LoginReady'));
const TestLogin = React.lazy(() => import('@/pages/auths/LoginTest'));
const PasswordChange = React.lazy(() => import('@/pages/auths/PasswordChange'));
const Signup = React.lazy(() => import('@/pages/auths/Signup'));
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

  /**
   * 라우트 변경 시 인증 상태 확인
   * 보호된 라우트에 접근할 때마다 토큰 유효성을 검사
   */
  useEffect(() => {
    if (!isInitialized) return;

    const needsRedirect = checkTokenAndRedirect(location.pathname);
    if (needsRedirect) {
      redirectToLogin();
      return;
    }
  }, [location.pathname, isInitialized, redirectToLogin]);

  return null;
};

/**
 * 메인 애플리케이션 컴포넌트
 *
 * 주요 기능:
 * - 자동 로그인 처리
 * - 성능 모니터링 초기화
 * - Service Worker 등록
 * - 네트워크 상태 모니터링
 */
const App: React.FC = () => {
  /**
   * 자동 로그인 처리
   * 저장된 토큰이 있지만 만료된 경우 자동으로 갱신 시도
   */
  useEffect(() => {
    const tryAutoLogin = async () => {
      const token = getCurrentToken();
      if (token && !hasValidToken()) {
        // 토큰이 만료된 경우 자동 갱신 시도
        await refreshToken();
      }
    };
    tryAutoLogin();
  }, []);

  /**
   * 애플리케이션 초기화 및 모니터링 설정
   *
   * 수행하는 작업:
   * - 앱 시작 이벤트 추적
   * - 사용자 ID 설정
   * - Service Worker 등록
   * - 성능 모니터링 시작
   * - 네트워크 상태 모니터링
   */
  useEffect(() => {
    // 앱 시작 이벤트 추적
    monitoringService.trackCustomEvent('app_start', {
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      environment: import.meta.env.MODE,
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    });

    /**
     * JWT 토큰에서 사용자 ID 추출 및 설정
     *
     * 토큰의 payload를 디코딩하여 사용자 ID를 추출합니다.
     * 토큰이 유효하지 않은 경우 경고 로그를 출력합니다.
     */
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

    /**
     * Service Worker 등록
     *
     * Service Worker는 다음 기능을 제공합니다:
     * - 오프라인 캐싱
     * - 백그라운드 동기화
     * - 푸시 알림
     * - 자동 업데이트 감지
     */
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker 등록 성공:', registration);

          // 새 버전 업데이트 감지
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  // 새 버전이 설치되면 업데이트 이벤트 추적
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

    /**
     * Core Web Vitals 성능 모니터링 시작
     *
     * Google에서 정의한 웹 성능의 핵심 지표들을 실시간으로 모니터링합니다.
     *
     * 모니터링 지표:
     * - LCP (Largest Contentful Paint): 페이지 로딩 성능 측정
     * - FID (First Input Delay): 사용자 상호작용 응답성 측정
     * - CLS (Cumulative Layout Shift): 시각적 안정성 측정
     */
    const startPerformanceMonitoring = () => {
      if ('PerformanceObserver' in window) {
        /**
         * LCP (Largest Contentful Paint) 모니터링
         *
         * 페이지에서 가장 큰 콘텐츠가 렌더링되는 시간을 측정합니다.
         * 사용자가 페이지가 로드되었다고 인식하는 시점을 나타냅니다.
         */
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

        /**
         * FID (First Input Delay) 모니터링
         *
         * 사용자의 첫 번째 상호작용부터 브라우저가 응답하기까지의 시간을 측정합니다.
         * 사용자 경험의 반응성을 평가하는 중요한 지표입니다.
         */
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

        /**
         * CLS (Cumulative Layout Shift) 모니터링
         *
         * 페이지 로딩 중 레이아웃 변화량을 누적하여 측정합니다.
         * 시각적 안정성을 평가하는 지표로, 낮을수록 좋습니다.
         */
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

          // 페이지 언로드 시 누적 CLS 값 전송
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

    /**
     * 네트워크 연결 상태 모니터링
     *
     * 모니터링하는 정보:
     * - effectiveType: 연결 타입 (4g, 3g, 2g 등)
     * - downlink: 다운로드 속도 (Mbps)
     * - rtt: 왕복 시간 (Round Trip Time, ms)
     */
    const monitorNetworkStatus = () => {
      if ('connection' in navigator) {
        const connection = (navigator as NavigatorWithConnection).connection;

        if (connection) {
          // 초기 네트워크 정보 추적
          monitoringService.trackCustomEvent('network_info', {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
          });

          // 네트워크 상태 변화 감지
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

    /**
     * 메모리 사용량 모니터링 (개발 환경 전용)
     *
     * 30초마다 메모리 사용량을 추적하여 성능 문제 조기 발견
     * 프로덕션에서는 비활성화되어 성능에 영향을 주지 않음
     */
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

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <Router>
          <AuthGuard />
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
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
