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
import { theme } from '@/styles/Theme';
import {
  checkTokenAndRedirect,
  isProtectedRoute,
  saveTokens,
  hasValidToken,
  refreshToken,
  getCurrentToken,
} from '@/utils/auth';
import { isNativeApp } from '@/utils/nativeApp';

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
    // 네이티브 앱 로그인 정보 수신 처리
    function handleLoginInfoReceived(e: Event) {
      const customEvent = e as CustomEvent;
      const loginInfo = customEvent.detail;

      if (loginInfo && loginInfo.token) {
        // 토큰 저장
        saveTokens(loginInfo.token, loginInfo.refreshToken || '');

        // 홈으로 이동
        navigate('/home', { replace: true });
      }
    }

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

    // 네이티브 앱 이벤트 리스너 등록
    if (isNativeApp()) {
      window.addEventListener('loginInfoReceived', handleLoginInfoReceived);
    }

    checkInitialAuth();

    // 클린업
    return () => {
      if (isNativeApp()) {
        window.removeEventListener(
          'loginInfoReceived',
          handleLoginInfoReceived
        );
      }
    };
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
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
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
