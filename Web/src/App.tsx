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
import LoadingSpinner, {
  InlineSpinner,
  SkeletonLoader,
  TextSkeleton,
} from '@/components/shared/LoadingSpinner';
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

// 🔧 개선: localStorage 안전 래퍼 (사파리/웹뷰 에지 케이스 대응)
const safeLS = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      // QuotaExceededError 등 예외 무시
    }
  },
  remove: (k: string) => {
    try {
      localStorage.removeItem(k);
    } catch {
      // 예외 무시
    }
  },
};

// ✅ 빠른 체크리스트 - 모든 수정 완료 + 마지막 1% 미세 튜닝 완료
// [x] utils/auth에 setupNetworkMonitoring 진짜로 export 되어 있다
// [x] visibilitychange 리스너는 한 곳만 등록되고, cleanup 확실
// [x] FindId/FindPassword는 공개 라우트
// [x] Axios 401 인터셉터로 refresh→재시도 + 복구 중 요청 큐잉
// [x] iOS WebView가 비-ephemeral이고, 가능하면 Keychain 브릿지 병행
// [x] RootRedirect의 setInterval 정리로 메모리 누수 방지
// [x] FindId/FindPassword를 AppLayout 밖으로 이동하여 레이아웃 의존성 제거
// [x] initializeApp에서 토큰 체크 한 줄로 단순화
// [x] setupNetworkMonitoring()는 멱등(한 번만 등록) 보장
// [x] 401 인터셉터: "단일 refresh in-flight + 요청 큐잉" 확인
// [x] 결제 콜백 라우트 공개 여부 - 외부 결제→콜백 직후 토큰 만료 시에도 결과 페이지 표시
// [x] RootRedirect 폴링 로직 안전화 - 복구 실패 시에도 폴링 종료 보장
// [x] Axios 재시도 시 최신 토큰 주입으로 안전성 향상
// [x] 테스트 라우트 가드 - 프로덕션 환경에서 테스트 페이지 제외
// [x] iOS 브릿지 재주입 이벤트 - 앱 재실행 시 네이티브→WebView 토큰 동기화
// [x] iOS WebView 브릿지 감지 타입 안전성 향상
// [x] localStorage 안전 래퍼 (사파리/웹뷰 에지 케이스 대응)
// [x] 로그인 보호 리다이렉트에 "원래 가려던 곳" 복귀 UX
// [x] RootRedirect 폴링에 타임아웃 추가 (8초 상한)
// [x] 테스트 라우트 제거 조건 로그 가드
// [x] 동적 import 경로 확실히
// [x] 전역 네비게이션 헬퍼 정리 (Router 내부에서 설정)
// [x] biometric_auth_integration.js 에러 처리 개선 (웹 환경에서 조용히 처리)

// RootRedirect 컴포넌트 - 토큰 상태에 따라 적절한 페이지로 리다이렉트
// 🔧 개선: RootRedirect는 라우팅 결정만 - 복구/스케줄링은 App에서 처리
const RootRedirect: React.FC = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [dest, setDest] = useState<'/home' | '/login'>('/login');

  useEffect(() => {
    let pollId: number | null = null;

    const checkLoginStatus = () => {
      try {
        // 🔧 개선: 실제 복구는 하지 않고 상태만 확인
        const persistentLogin =
          safeLS.get('persistentLogin') === 'true' ||
          safeLS.get('autoLogin') === 'true';
        const ok = hasValidToken();
        const inProgress = safeLS.get('autoLoginInProgress') === 'true';

        if (ok) {
          setDest('/home');
          setIsChecking(false);
          return;
        }

        if (persistentLogin && inProgress) {
          // 복구 시도 중이면 잠깐 대기

          setIsChecking(true);
          // 🔧 개선: 폴링에 타임아웃 추가 (8초 상한)
          const start = Date.now();
          pollId = window.setInterval(() => {
            const stillInProgress =
              safeLS.get('autoLoginInProgress') === 'true';
            const nowOk = hasValidToken();
            const timedOut = Date.now() - start > 8000;

            // 🔑 복구가 끝났다면(성공/실패 모두) 또는 타임아웃 시 폴링 종료
            if (!stillInProgress || nowOk || timedOut) {
              setDest(nowOk ? '/home' : '/login');
              setIsChecking(false);
              if (pollId) {
                clearInterval(pollId);
                pollId = null;
              }
            }
          }, 300);
        } else {
          // 복구가 진행 중이 아니면 곧장 라우팅 결정

          setDest('/login');
          setIsChecking(false);
        }
      } catch (error) {
        console.error('RootRedirect: 로그인 상태 확인 중 오류:', error);
        setDest('/login');
        setIsChecking(false);
      }
    };

    checkLoginStatus();

    // 🔧 수정: useEffect cleanup에서 interval 정리
    return () => {
      if (pollId) {
        clearInterval(pollId);
      }
    };
  }, []);

  if (isChecking) {
    return <LoadingSpinner variant='dots' label='자동 로그인 확인 중...' />;
  }

  return <Navigate to={dest} replace />;
};

// 🔧 개선: 보호 라우트(RequireAuth)로 2중 안전망 + 원래 경로 복귀
const RequireAuth: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  if (hasValidToken()) return children;

  const persistent =
    safeLS.get('persistentLogin') === 'true' ||
    safeLS.get('autoLogin') === 'true';

  // 복구 중이면 로딩
  if (persistent && safeLS.get('autoLoginInProgress') === 'true') {
    return <LoadingSpinner variant='wave' label='세션 복구 중...' />;
  }

  // 🔧 개선: 로그인 후 원래 경로로 복귀
  return (
    <Navigate to='/login' replace state={{ from: window.location.pathname }} />
  );
};

// 🔧 추가: 로딩 데모 컴포넌트
const LoadingDemo: React.FC = () => {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🎨 로딩 애니메이션 데모</h1>

      <section style={{ marginBottom: '40px' }}>
        <h2>1. 전체 화면 로딩 스피너</h2>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <button onClick={() => window.location.reload()}>
            스피너 (기본)
          </button>
          <button onClick={() => window.location.reload()}>
            도트 애니메이션
          </button>
          <button onClick={() => window.location.reload()}>
            펄스 애니메이션
          </button>
          <button onClick={() => window.location.reload()}>
            웨이브 애니메이션
          </button>
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2>2. 인라인 스피너</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span>
            로딩 중... <InlineSpinner size={16} />
          </span>
          <span>
            처리 중... <InlineSpinner size={24} color='#007bff' />
          </span>
          <span>
            저장 중... <InlineSpinner size={20} color='#28a745' />
          </span>
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2>3. 스켈레톤 로딩</h2>
        <div
          style={{
            display: 'grid',
            gap: '20px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          }}
        >
          <div>
            <h3>카드 스켈레톤</h3>
            <SkeletonLoader width='100%' height='120px' borderRadius='8px' />
            <div style={{ marginTop: '12px' }}>
              <SkeletonLoader width='70%' height='16px' />
              <SkeletonLoader width='50%' height='14px' />
            </div>
          </div>
          <div>
            <h3>텍스트 스켈레톤</h3>
            <TextSkeleton lines={4} />
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2>4. 실제 사용 예시</h2>
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
          }}
        >
          <h3>사용자 프로필</h3>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <SkeletonLoader width='60px' height='60px' borderRadius='50%' />
            <div style={{ flex: 1 }}>
              <SkeletonLoader width='40%' height='20px' />
              <SkeletonLoader width='60%' height='16px' />
            </div>
          </div>
          <div style={{ marginTop: '16px' }}>
            <TextSkeleton lines={3} />
          </div>
        </div>
      </section>
    </div>
  );
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
  () => import('@/pages/locker-rooms/my-tickets/TicketPayment')
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

  // 🔧 개선: 전역 네비게이션 헬퍼는 Router 내부에서 설정
  // (App 컴포넌트는 Router 밖에서 실행되므로 useNavigate 사용 불가)

  // 🔧 개선: 불필요한 타이머 ref 제거 (실제로 사용되지 않음)
  // const autoRefreshTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // 🔧 개선: StrictMode 가드로 중복 초기화 방지
    if (didInitRef.current) {
      return;
    }
    didInitRef.current = true;

    const initializeApp = async () => {
      try {
        // 🎯 0. iOS 브릿지 재주입 이벤트 대기 (최우선)
        const isIOSWebView =
          typeof (window as { webkit?: { messageHandlers?: unknown } }).webkit
            ?.messageHandlers === 'object';
        if (isIOSWebView) {
          await new Promise<void>((resolve) => {
            // 최대 2초 대기 후 진행 (브릿지가 없어도 계속 진행)
            const timeout = setTimeout(resolve, 2000);

            const handleBridgeInjection = () => {
              clearTimeout(timeout);
              window.removeEventListener(
                'bridgeTokenInjected',
                handleBridgeInjection
              );

              resolve();
            };

            window.addEventListener(
              'bridgeTokenInjected',
              handleBridgeInjection
            );
          });
        }

        // 🎯 1. 네트워크 모니터링 설정
        setupNetworkMonitoring();

        // 🎯 1. 동기적 토큰 상태 확인

        const hasValid = hasValidToken();

        if (hasValid) {
          safeLS.set('autoLoginCompleted', 'true');
          safeLS.remove('autoLoginInProgress');

          // 백그라운드에서 토큰 갱신 타이머 설정
          setTimeout(async () => {
            try {
              const { setupOptimizedTokenRefreshTimer } = await import(
                '@/utils/auth'
              );
              const currentToken = getCurrentToken();
              if (currentToken) {
                setupOptimizedTokenRefreshTimer(currentToken);
              }
            } catch (error) {
              console.error('토큰 갱신 타이머 설정 실패:', error);
            }
          }, 100);

          return; // 유효한 토큰이 있으면 추가 작업 불필요
        }

        // 🎯 2. 자동 로그인 시도 (토큰이 없거나 만료된 경우)

        safeLS.set('autoLoginInProgress', 'true');

        const autoLoginSuccess = await restorePersistentLogin();
        if (autoLoginSuccess) {
          safeLS.set('autoLoginCompleted', 'true');

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
          safeLS.set('autoLoginCompleted', 'false');
        }

        safeLS.remove('autoLoginInProgress');

        // 🎯 3. 자동 로그인 설정 확인 및 타이머 설정 (이미 설정된 경우는 건너뜀)
        if (!autoLoginSuccess) {
          await checkAndSetupAutoLogin();
        }

        // 🔧 수정: 포그라운드 복귀 시 재확인 로직은 바깥 useEffect에서 처리
        // (중복 등록 방지 및 cleanup 보장)
      } catch (error) {
        console.error('App: 앱 초기화 중 오류:', error);
        safeLS.set('autoLoginCompleted', 'false');
        safeLS.remove('autoLoginInProgress');
      } finally {
        console.log('🚀 App: 앱 초기화 완료');
      }
    };

    initializeApp();

    // 🎯 강제 로그인 리다이렉트 이벤트 리스너
    const handleForceLoginRedirect = () => {
      console.log('🔄 강제 로그인 리다이렉트 이벤트 발생');
      // 🔧 개선: 전역 네비게이션 헬퍼 사용 (Router 내부에서 설정됨)
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
      if (window.tokenRefreshTimer) {
        window.clearTimeout(window.tokenRefreshTimer);
        window.tokenRefreshTimer = undefined;
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
          variant='pulse'
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
        <Route path='/signup' element={<Signup />} />
        <Route path='/findid' element={<FindId />} />
        <Route path='/findPassword' element={<FindPassword />} />

        <Route path='/PersonalLink' element={<PersonalLink />} />
        <Route path='/Link' element={<Link />} />

        {/* 테스트 페이지들 - 프로덕션 환경에서는 제외 */}
        {!import.meta.env.PROD && (
          <>
            <Route path='/test/payple' element={<PaypleTest />} />
            <Route path='/test/AddCardPayple' element={<AddCardPayple />} />
            <Route path='/test-login' element={<TestLoginPage />} />
            <Route path='/test-dashboard' element={<TestDashboard />} />
            <Route path='/test-loading' element={<LoadingDemo />} />
          </>
        )}

        {/* 🔧 개선: Router 내부에서 전역 네비게이션 헬퍼 설정 */}
        <Route element={<AppLayout />}>
          <Route
            path='/UpdateProfile'
            element={
              <RequireAuth>
                <UpdateProfile />
              </RequireAuth>
            }
          />
          <Route
            path='/ChangePassword'
            element={
              <RequireAuth>
                <ChangePassword />
              </RequireAuth>
            }
          />
          <Route
            path='/DeliveryManagement'
            element={
              <RequireAuth>
                <DeliveryManagement />
              </RequireAuth>
            }
          />
          <Route
            path='/EditAddress'
            element={
              <RequireAuth>
                <EditAddress />
              </RequireAuth>
            }
          />
          {/* User Pages */}
          <Route
            path='/MyinfoList'
            element={
              <RequireAuth>
                <MyInfoList />
              </RequireAuth>
            }
          />
          <Route
            path='/MyStyle'
            element={
              <RequireAuth>
                <MyStyle />
              </RequireAuth>
            }
          />

          {/* Main */}
          <Route
            path='/home'
            element={
              <RequireAuth>
                <Home />
              </RequireAuth>
            }
          />
          <Route
            path='/item/:id'
            element={
              <RequireAuth>
                <HomeDetail />
              </RequireAuth>
            }
          />
          <Route
            path='/analysis'
            element={
              <RequireAuth>
                <Analysis />
              </RequireAuth>
            }
          />
          <Route
            path='/basket'
            element={
              <RequireAuth>
                <Basket />
              </RequireAuth>
            }
          />
          <Route
            path='/alarm'
            element={
              <RequireAuth>
                <Alarm />
              </RequireAuth>
            }
          />
          <Route
            path='/payment/:id'
            element={
              <RequireAuth>
                <Payment />
              </RequireAuth>
            }
          />
          <Route path='/payment/complete' element={<PaymentComplete />} />
          <Route path='/payment/fail' element={<PaymentFail />} />

          {/* Brand */}
          <Route
            path='/brand'
            element={
              <RequireAuth>
                <Brand />
              </RequireAuth>
            }
          />
          <Route
            path='/brand/:brandId'
            element={
              <RequireAuth>
                <BrandDetail />
              </RequireAuth>
            }
          />

          {/* Melpik */}
          <Route
            path='/melpik'
            element={
              <RequireAuth>
                <Melpik />
              </RequireAuth>
            }
          />
          <Route
            path='/create-melpik'
            element={
              <RequireAuth>
                <CreateMelpik />
              </RequireAuth>
            }
          />
          <Route
            path='/createMelpik/settings'
            element={
              <RequireAuth>
                <ContemporarySettings />
              </RequireAuth>
            }
          />
          <Route
            path='/melpik-settings'
            element={
              <RequireAuth>
                <Setting />
              </RequireAuth>
            }
          />

          {/* Settlement */}
          <Route
            path='/sales-settlement'
            element={
              <RequireAuth>
                <SalesSettlement />
              </RequireAuth>
            }
          />
          <Route
            path='/sales-settlement-detail/:id'
            element={
              <RequireAuth>
                <SalesSettlementDetail />
              </RequireAuth>
            }
          />
          <Route
            path='/settlement-request'
            element={
              <RequireAuth>
                <SettlementRequest />
              </RequireAuth>
            }
          />

          {/* Schedule */}
          <Route
            path='/sales-schedule'
            element={
              <RequireAuth>
                <Schedule />
              </RequireAuth>
            }
          />
          <Route
            path='/schedule/confirmation/:scheduleId'
            element={
              <RequireAuth>
                <ScheduleConfirmation />
              </RequireAuth>
            }
          />
          <Route
            path='/schedule/reservation1'
            element={
              <RequireAuth>
                <ScheduleReservation1 />
              </RequireAuth>
            }
          />
          <Route
            path='/schedule/reservation2'
            element={
              <RequireAuth>
                <ScheduleReservation2 />
              </RequireAuth>
            }
          />
          <Route
            path='/schedule/reservation3'
            element={
              <RequireAuth>
                <ScheduleReservation3 />
              </RequireAuth>
            }
          />

          {/* FindId, FindPassword는 공개 라우트로 변경 - AppLayout 밖으로 이동됨 */}

          {/* LockerRoom */}
          <Route
            path='/lockerRoom'
            element={
              <RequireAuth>
                <LockerRoom />
              </RequireAuth>
            }
          />
          <Route
            path='/usage-history'
            element={
              <RequireAuth>
                <UsageHistory />
              </RequireAuth>
            }
          />
          <Route
            path='/point'
            element={
              <RequireAuth>
                <Point />
              </RequireAuth>
            }
          />
          <Route
            path='/my-closet'
            element={
              <RequireAuth>
                <MyCloset />
              </RequireAuth>
            }
          />
          <Route
            path='/my-ticket'
            element={
              <RequireAuth>
                <MyTicket />
              </RequireAuth>
            }
          />
          <Route
            path='/my-ticket/PurchaseOfPasses'
            element={
              <RequireAuth>
                <PurchaseOfPasses />
              </RequireAuth>
            }
          />

          <Route
            path='/my-ticket/PurchaseOfPasses/TicketPayment'
            element={
              <RequireAuth>
                <TicketPayment />
              </RequireAuth>
            }
          />

          {/* PaymentMethod & Reviews */}
          <Route
            path='/payment-method'
            element={
              <RequireAuth>
                <PaymentMethod />
              </RequireAuth>
            }
          />
          <Route
            path='/payment-method/addcard'
            element={
              <RequireAuth>
                <AddCard />
              </RequireAuth>
            }
          />

          <Route
            path='/product-review'
            element={
              <RequireAuth>
                <ProductReview />
              </RequireAuth>
            }
          />
          <Route
            path='/payment-review/Write'
            element={
              <RequireAuth>
                <ProductReviewWrite />
              </RequireAuth>
            }
          />

          {/* CustomerService */}
          <Route
            path='/customerService'
            element={
              <RequireAuth>
                <CustomerService />
              </RequireAuth>
            }
          />
          <Route
            path='/customerService/:type'
            element={
              <RequireAuth>
                <DocumentList />
              </RequireAuth>
            }
          />
          <Route
            path='/customerService/:type/:id'
            element={
              <RequireAuth>
                <DocumentDetail />
              </RequireAuth>
            }
          />
          <Route
            path='/password-change'
            element={
              <RequireAuth>
                <PasswordChange />
              </RequireAuth>
            }
          />

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
            element={
              <RequireAuth>
                <TicketDetail />
              </RequireAuth>
            }
          />
        </Route>
        <Route path='*' element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
