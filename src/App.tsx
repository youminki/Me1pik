import React, { useEffect, useState, useCallback } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import AppLayout from './pages/layouts/AppLayout';

import Landing from './pages/landings/Landing';
import Login from './pages/auths/Login';
import ReadyLogin from './pages/auths/ReadyLogin';

import TestLogin from './pages/auths/TestLogin';
import Signup from './pages/auths/Signup';
import FindId from './pages/auths/FindId';
import FindPassword from './pages/auths/FindPassword';

import MyinfoList from './pages/myinfos/MyinfoList';
import MyStyle from './pages/mystyles/MyStyle';

import Basket from './pages/baskets/Basket';
import Alarm from './pages/alarms/Alarm';
import Payment from './pages/payments/Payment';
import PersonalLink from './pages/links/PersonalLink';

import Home from './pages/homes/Home';
import HomeDetail from './pages/homes/HomeDetail';
import Analysis from './pages/analyses/Analysis';

import Brand from './pages/brands/Brand';
import BrandDetail from './pages/brands/BrandDetail';

import Melpik from './pages/melpiks/Melpik';
import CreateMelpik from './pages/melpiks/creates/CreateMelpik';
import ContemporarySettings from './pages/melpiks/creates/ContemporarySettings';
import Setting from './pages/melpiks/settings/SettingMelpik';
import SalesSettlement from './pages/melpiks/calculates/SalesSettlement';
import SalesSettlementDetail from './pages/melpiks/calculates/SalesSettlementDetail';
import SettlementRequest from './pages/melpiks/calculates/SettlementRequest';

import LockerRoom from './pages/locker-rooms/LockerRoom';
import UsageHistory from './pages/locker-rooms/usage-histories/UsageHistory';
import Point from './pages/locker-rooms/points/Point';
import MyCloset from './pages/locker-rooms/my-closets/MyCloset';
import MyTicket from './pages/locker-rooms/my-tickets/MyTicket';
import PurchaseOfPasses from './pages/locker-rooms/my-tickets/PurchaseOfPasses';

import TicketPayment from './pages/locker-rooms/my-tickets/TicketPayment.tsx';

// import SubscriptionPass from './pages/locker-rooms/my-tickets/SubscriptionPass';
// import OnetimePass from './pages/locker-rooms/my-tickets/OnetimePass';

import PaymentMethod from './pages/locker-rooms/payment-methods/PaymentMethod';
import AddCard from './pages/locker-rooms/payment-methods/AddCard';

import ProductReview from './pages/locker-rooms/product-reviews/ProductReview';
import ProductReviewWrite from './pages/locker-rooms/product-reviews/ProductReviewWrite';

import CustomerService from './pages/customer-services/CustomerService';
import DocumentList from './pages/customer-services/documents/DocumentList';
import DocumentDetail from './pages/customer-services/documents/DocumentDetail';

import Scedule from './pages/melpiks/schedules/Scedule';
import ScheduleConfirmation from './pages/melpiks/schedules/ScheduleConfirmation';
import ScheduleReservation1 from './pages/melpiks/schedules/ScheduleReservation1';
import ScheduleReservation2 from './pages/melpiks/schedules/ScheduleReservation2';
import ScheduleReservation3 from './pages/melpiks/schedules/ScheduleReservation3';

import PaypleTest from './tests/PaypleTest';
import AddCardPayple from './tests/AddCardPayple';
import PasswordChange from './pages/auths/PasswordChange';
import PaymentComplete from './pages/payments/PaymentComplete';
import PaymentFail from './pages/payments/Paymentfail.tsx';
import TicketDetail from './pages/locker-rooms/my-tickets/TicketDetail';

import Link from './pages/links/Link';
import UpdateProfile from './pages/profile/UpdateProfile';
import ChangePassword from './pages/profile/ChangePassword';
import DeliveryManagement from './pages/profile/DeliveryManagement';
import EditAddress from './pages/profile/EditAddress';
import NotFound from './pages/errors/NotFound';

import { Axios } from './api-utils/Axios';
import { isNativeApp } from './utils/nativeApp';
import {
  clearTokens,
  saveTokens,
  isProtectedRoute,
  checkTokenAndRedirect,
} from './utils/auth';

const AuthGuard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);

  // 로그인 페이지로 이동하는 함수
  const redirectToLogin = useCallback(() => {
    if (location.pathname !== '/login') {
      console.log('인증 실패로 로그인 페이지로 이동');
      navigate('/login', { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    // 네이티브 앱 로그인 정보 수신 처리
    function handleLoginInfoReceived(e: Event) {
      const customEvent = e as CustomEvent;
      const loginInfo = customEvent.detail;

      console.log('네이티브 로그인 정보 수신:', loginInfo);

      if (loginInfo.isLoggedIn && loginInfo.userInfo) {
        // 토큰 저장 (앱에서는 항상 localStorage에 저장)
        saveTokens(loginInfo.userInfo.token, loginInfo.userInfo.refreshToken);
        Axios.defaults.headers.Authorization = `Bearer ${loginInfo.userInfo.token}`;
      } else {
        // 로그아웃 처리
        clearTokens();
        // 로그인 페이지로 이동
        redirectToLogin();
      }
    }

    // 초기 인증 체크
    const checkInitialAuth = () => {
      if (isInitialized) return;

      const isProtected = isProtectedRoute(location.pathname);

      console.log('초기 인증 체크:', {
        pathname: location.pathname,
        isProtected,
        isNative: isNativeApp(),
      });

      // 보호된 라우트에서 토큰 체크 및 리다이렉트
      if (checkTokenAndRedirect(location.pathname)) {
        setIsInitialized(true);
        return;
      }

      setIsInitialized(true);
    };

    checkInitialAuth();

    window.addEventListener('loginInfoReceived', handleLoginInfoReceived);
    return () => {
      window.removeEventListener('loginInfoReceived', handleLoginInfoReceived);
    };
  }, [location.pathname, navigate, isInitialized, location, redirectToLogin]);

  // 라우트 변경 시 인증 체크
  useEffect(() => {
    if (!isInitialized) return;

    // 보호된 라우트에서 토큰 체크 및 리다이렉트
    if (checkTokenAndRedirect(location.pathname)) {
      return; // 이미 리다이렉트됨
    }

    // 필요 없는 자동로그인 체크 코드 제거
  }, [location.pathname, isInitialized, navigate, redirectToLogin]);

  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthGuard />
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
          <Route path='/DeliveryManagement' element={<DeliveryManagement />} />
          <Route path='/EditAddress' element={<EditAddress />} />
          {/* User Pages */}
          <Route path='/MyinfoList' element={<MyinfoList />} />
          <Route path='/MyStyle' element={<MyStyle />} />

          {/* Main */}
          <Route path='/home' element={<Home />} />
          <Route path='/item/:id' element={<HomeDetail />} />
          <Route path='/analysis' element={<Analysis />} />
          <Route path='/basket' element={<Basket />} />
          <Route path='/alarm' element={<Alarm />} />
          <Route path='/payment/:id' element={<Payment />} />

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
    </Router>
  );
};

export default App;
