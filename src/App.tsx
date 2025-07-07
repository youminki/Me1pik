import React, { useEffect, useState, useCallback } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import AppLayout from './pages/AppLayout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import ReadyLogin from './pages/ReadyLogin';

import TestLogin from './pages/TestLogin';
import Signup from './pages/Signup';
import FindId from './pages/FindId';
import FindPassword from './pages/FindPassword';

import MyinfoList from './pages/MyinfoList';
import MyStyle from './pages/MyStyle';

import Basket from './pages/Basket';
import Alarm from './pages/Alarm';
import Payment from './pages/Payment';
import PersonalLink from './pages/PersonalLink';

import Home from './pages/Home/Home';
import HomeDetail from './pages/Home/HomeDetail';
import Analysis from './pages/Analysis';

import Brand from './pages/Brand/Brand';
import BrandDetail from './pages/Brand/BrandDetail';

import Melpik from './pages/Melpik/Melpik';
import CreateMelpik from './pages/Melpik/Create/CreateMelpik';
import ContemporarySettings from './pages/Melpik/Create/ContemporarySettings';
import Setting from './pages/Melpik/Setting/SettingMelpik';
import SalesSettlement from './pages/Melpik/Calculate/SalesSettlement';
import SalesSettlementDetail from './pages/Melpik/Calculate/SalesSettlementDetail';
import SettlementRequest from './pages/Melpik/Calculate/SettlementRequest';

import LockerRoom from './pages/LockerRoom/LockerRoom';
import UsageHistory from './pages/LockerRoom/UsageHistory/UsageHistory';
import Point from './pages/LockerRoom/Point/Point';
import MyCloset from './pages/LockerRoom/MyCloset/MyCloset';
import MyTicket from './pages/LockerRoom/MyTicket/MyTicket';
import PurchaseOfPasses from './pages/LockerRoom/MyTicket/PurchaseOfPasses';

import TicketPayment from './pages/LockerRoom/MyTicket/TicketPayment.tsx';

// import SubscriptionPass from './pages/LockerRoom/MyTicket/SubscriptionPass';
// import OnetimePass from './pages/LockerRoom/MyTicket/OnetimePass';

import PaymentMethod from './pages/LockerRoom/PaymentMethod/PaymentMethod';
import AddCard from './pages/LockerRoom/PaymentMethod/AddCard';

import ProductReview from './pages/LockerRoom/ProductReview/ProductReview';
import ProductReviewWrite from './pages/LockerRoom/ProductReview/ProductReviewWrite';

import CustomerService from './pages/CustomerService/CustomerService';
import FrequentlyAskedQuestions from './pages/CustomerService/FrequentlyAskedQuestions/FrequentlyAskedQuestions';
import Notice from './pages/CustomerService/Notice/Notice';
import NoticeDetail from './pages/CustomerService/Notice/NoticeDetail';
import PersonalInformationProcessingPolicy from './pages/CustomerService/PersonalInformationProcessingPolicy/PersonalInformationProcessingPolicy';
import PersonalInformationProcessingPolicyDetail from './pages/CustomerService/PersonalInformationProcessingPolicy/PersonalInformationProcessingPolicyDetail';
import TermsAndConditionsOfUse from './pages/CustomerService/TermsAndConditionsOfUse/TermsAndConditionsOfUse';
import TermsAndConditionsOfUseDetail from './pages/CustomerService/TermsAndConditionsOfUse/TermsAndConditionsOfUseDetail';

import Scedule from './pages/Melpik/Schedule/Scedule';
import ScheduleConfirmation from './pages/Melpik/Schedule/ScheduleConfirmation';
import ScheduleReservation1 from './pages/Melpik/Schedule/ScheduleReservation1';
import ScheduleReservation2 from './pages/Melpik/Schedule/ScheduleReservation2';
import ScheduleReservation3 from './pages/Melpik/Schedule/ScheduleReservation3';

import PaypleTest from './Test/PaypleTest';
import AddCardPayple from './Test/AddCardPayple';
import PasswordChange from './pages/PasswordChange';
import PaymentComplete from './pages/PaymentComplete';
import PaymentFail from './pages/Paymentfail.tsx';
import TicketDetail from './pages/LockerRoom/MyTicket/TicketDetail';

import Link from './pages/Link';
import UpdateProfile from './pages/profile/UpdateProfile';
import ChangePassword from './pages/profile/ChangePassword';
import DeliveryManagement from './pages/profile/DeliveryManagement';
import EditAddress from './pages/profile/EditAddress';
import NotFound from './pages/NotFound';

import { Axios } from './api/Axios';
import { isNativeApp, requestNativeLogin } from './utils/nativeApp';
import {
  clearTokens,
  saveTokens,
  isProtectedRoute,
  checkAutoLogin,
  ensureAppToken,
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

    // 초기 인증 체크 (무신사 스타일)
    const checkInitialAuth = () => {
      if (isInitialized) return;

      const isAutoLoginAvailable = checkAutoLogin();
      const isProtected = isProtectedRoute(location.pathname);
      const hasAppToken = ensureAppToken();

      console.log('초기 인증 체크 (무신사 스타일):', {
        isAutoLoginAvailable,
        hasAppToken,
        pathname: location.pathname,
        isProtected,
        isNative: isNativeApp(),
      });

      // 앱에서 토큰이 없고 보호된 라우트에 있으면 로그인 페이지로
      if (!hasAppToken && isProtected) {
        console.log('앱에 토큰이 없어 로그인 페이지로 이동');
        redirectToLogin();
        setIsInitialized(true);
        return;
      }

      // 자동로그인이 가능하고 보호된 라우트에 있으면 그대로 유지
      if (isAutoLoginAvailable && isProtected) {
        console.log('자동로그인 성공, 현재 페이지 유지');
        setIsInitialized(true);
        return;
      }

      // 자동로그인이 불가능하고 보호된 라우트에 있으면 로그인 페이지로
      if (!isAutoLoginAvailable && isProtected) {
        if (isNativeApp()) {
          console.log('네이티브 앱에서 로그인 요청');
          requestNativeLogin();
        } else {
          console.log('웹 환경에서 로그인 페이지로 이동');
          redirectToLogin();
        }
      }

      setIsInitialized(true);
    };

    checkInitialAuth();

    window.addEventListener('loginInfoReceived', handleLoginInfoReceived);
    return () => {
      window.removeEventListener('loginInfoReceived', handleLoginInfoReceived);
    };
  }, [location.pathname, navigate, isInitialized, location, redirectToLogin]);

  // 라우트 변경 시 인증 체크 (무신사 스타일)
  useEffect(() => {
    if (!isInitialized) return;

    // 보호된 라우트에서 토큰 체크 및 리다이렉트
    if (checkTokenAndRedirect(location.pathname)) {
      return; // 이미 리다이렉트됨
    }

    const isAutoLoginAvailable = checkAutoLogin();
    const isProtected = isProtectedRoute(location.pathname);

    console.log('라우트 변경 인증 체크 (무신사 스타일):', {
      pathname: location.pathname,
      isAutoLoginAvailable,
      isProtected,
      isInitialized,
    });

    // 자동로그인이 불가능하고 보호된 라우트에 있으면 로그인 페이지로
    if (!isAutoLoginAvailable && isProtected) {
      console.log('라우트 변경으로 인한 로그인 페이지 이동');
      redirectToLogin();
      return;
    }
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
        <Route path='/findid' element={<FindId />} />
        <Route path='/findPassword' element={<FindPassword />} />

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
            path='/customerService/FrequentlyAskedQuestions'
            element={<FrequentlyAskedQuestions />}
          />
          <Route path='/customerService/Notice' element={<Notice />} />
          <Route
            path='/customerService/NoticeDetail'
            element={<NoticeDetail />}
          />
          <Route
            path='/customerService/PersonalInformationProcessingPolicy'
            element={<PersonalInformationProcessingPolicy />}
          />
          <Route
            path='/customerService/PersonalInformationProcessingPolicyDetail'
            element={<PersonalInformationProcessingPolicyDetail />}
          />
          <Route
            path='/customerService/TermsAndConditionsOfUse'
            element={<TermsAndConditionsOfUse />}
          />
          <Route
            path='/customerService/TermsAndConditionsOfUseDetail'
            element={<TermsAndConditionsOfUseDetail />}
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
