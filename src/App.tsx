import React, { useEffect, useState, useCallback, Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import AppLayout from '@/pages/layouts/AppLayout';

import Landing from '@/pages/landings/Landing';
import Login from '@/pages/auths/Login';
import ReadyLogin from '@/pages/auths/LoginReady';

import TestLogin from '@/pages/auths/LoginTest';
import Signup from '@/pages/auths/Signup';
import FindId from '@/pages/auths/FindId';
import FindPassword from '@/pages/auths/FindPassword';

import MyInfoList from '@/pages/my-info/MyInfoList';
import MyStyle from '@/pages/my-styles/MyStyle';

import Basket from '@/pages/baskets/Basket';
import Alarm from '@/pages/alarms/Alarm';
// import Payment from '@/pages/payments/Payment';
import PersonalLink from '@/pages/links/PersonalLink';

// import Home from '@/pages/homes/Home';
// import HomeDetail from '@/pages/homes/HomeDetail';
import Analysis from '@/pages/analyses/Analysis';

// import Brand from '@/pages/brands/Brand';
// import BrandDetail from '@/pages/brands/BrandDetail';

import Melpik from '@/pages/melpiks/Melpik';
import CreateMelpik from '@/pages/melpiks/creates/CreateMelpik';
import ContemporarySettings from '@/pages/melpiks/creates/ContemporarySettings';
import Setting from '@/pages/melpiks/settings/SettingMelpik';
import SalesSettlement from '@/pages/melpiks/calculates/SalesSettlement';
import SalesSettlementDetail from '@/pages/melpiks/calculates/SalesSettlementDetail';
import SettlementRequest from '@/pages/melpiks/calculates/SettlementRequest';

import LockerRoom from '@/pages/locker-rooms/LockerRoom';
import UsageHistory from '@/pages/locker-rooms/usage-histories/UsageHistory';
import Point from '@/pages/locker-rooms/points/Point';
import MyCloset from '@/pages/locker-rooms/my-closets/MyCloset';
import MyTicket from '@/pages/locker-rooms/my-tickets/MyTicket';
import PurchaseOfPasses from '@/pages/locker-rooms/my-tickets/PurchaseOfPasses';

import TicketPayment from '@/pages/locker-rooms/my-tickets/TicketPayment.tsx';

// import SubscriptionPass from '@/pages/locker-rooms/my-tickets/SubscriptionPass';
// import OnetimePass from '@/pages/locker-rooms/my-tickets/OnetimePass';

import PaymentMethod from '@/pages/locker-rooms/payment-methods/PaymentMethod';
import AddCard from '@/pages/locker-rooms/payment-methods/AddCard';

import ProductReview from '@/pages/locker-rooms/product-reviews/ProductReview';
import ProductReviewWrite from '@/pages/locker-rooms/product-reviews/ProductReviewWrite';

import CustomerService from '@/pages/customer-services/CustomerService';
import DocumentList from '@/pages/customer-services/documents/DocumentList';
import DocumentDetail from '@/pages/customer-services/documents/DocumentDetail';

import Scedule from '@/pages/melpiks/schedules/Schedule';
import ScheduleConfirmation from '@/pages/melpiks/schedules/ScheduleConfirmation';
import ScheduleReservation1 from '@/pages/melpiks/schedules/ScheduleReservationStep1';
import ScheduleReservation2 from '@/pages/melpiks/schedules/ScheduleReservationStep2';
import ScheduleReservation3 from '@/pages/melpiks/schedules/ScheduleReservationStep3';

import PaypleTest from '@/__tests__/development/PaypleTest';
import AddCardPayple from '@/__tests__/development/AddCardPayple';
import PasswordChange from '@/pages/auths/PasswordChange';
// import PaymentComplete from '@/pages/payments/PaymentComplete';
// import PaymentFail from '@/pages/payments/Paymentfail';
import TicketDetail from '@/pages/locker-rooms/my-tickets/TicketDetail';

import Link from '@/pages/links/Link';
import UpdateProfile from '@/pages/profile/UpdateProfile';
import ChangePassword from '@/pages/profile/ChangePassword';
import DeliveryManagement from '@/pages/profile/DeliveryManagement';
import EditAddress from '@/pages/profile/EditAddress';
import NotFound from '@/pages/errors/NotFound';

import { isNativeApp } from '@/utils/nativeApp';
import {
  saveTokens,
  isProtectedRoute,
  checkTokenAndRedirect,
} from '@/utils/auth';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

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

// 정적 import → lazy import로 변경
const Home = lazy(() => import('@/pages/homes/Home'));
const HomeDetail = lazy(() => import('@/pages/homes/HomeDetail'));
const Brand = lazy(() => import('@/pages/brands/Brand'));
const BrandDetail = lazy(() => import('@/pages/brands/BrandDetail'));
const Payment = lazy(() => import('@/pages/payments/Payment'));
const PaymentComplete = lazy(() => import('@/pages/payments/PaymentComplete'));
const PaymentFail = lazy(() => import('@/pages/payments/Paymentfail.tsx'));

const App: React.FC = () => {
  return (
    <Router>
      <AuthGuard />
      <Suspense fallback={<LoadingSpinner label='페이지를 불러오는 중...' />}>
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
            <Route path='/payment' element={<Payment />} />
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
            <Route path='/sales-schedule' element={<Scedule />} />
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
            <Route path='/customerService/:type' element={<DocumentList />} />
            <Route
              path='/customerService/:type/:id'
              element={<DocumentDetail />}
            />
            <Route path='/password-change' element={<PasswordChange />} />
            <Route path='/payment-complete' element={<PaymentComplete />} />
            <Route path='/payment-fail' element={<PaymentFail />} />

            <Route path='/ticketDetail/:ticketId' element={<TicketDetail />} />
          </Route>
          <Route path='*' element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
