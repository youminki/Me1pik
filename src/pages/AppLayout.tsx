// src/layouts/AppLayout.tsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Cookies from 'js-cookie';

import UnifiedHeader from '../components/UnifiedHeader';
import BottomNav from '../components/BottomNav1';
import useHeaderConfig from '../hooks/useHeaderConfig';
import {
  isNativeApp,
  requestNativeLogin,
  hasValidToken,
  isProtectedRoute,
} from '../utils/nativeApp';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = Cookies.get('accessToken');
    if (!accessToken) return;
    // 사용자 정보 API 호출
  }, []);

  useEffect(() => {
    const token = hasValidToken();

    if (isProtectedRoute(location.pathname) && !token) {
      // 네이티브 앱 환경인 경우 네이티브 로그인 요청
      if (isNativeApp()) {
        console.log(
          '네이티브 앱에서 로그인 토큰이 없습니다. 네이티브 로그인을 요청합니다.'
        );
        requestNativeLogin();
        // 네이티브 앱에서 로그인 처리를 기다리므로 여기서는 페이지 이동하지 않음
        return;
      } else {
        // 웹 환경인 경우 로그인 페이지로 이동
        console.log(
          '웹 환경에서 로그인 토큰이 없습니다. 로그인 페이지로 이동합니다.'
        );
        navigate('/login', { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  const {
    includeHeader1,
    includeHeader2,
    includeHeader3,
    includeHeader4,
    includeBottomNav,
    headerTitle,
    disablePadding,
  } = useHeaderConfig(location.pathname);

  // BottomNav 표시 대상 경로
  const bottomNavPaths = [
    '/home',
    '/brand',
    '/melpik',
    '/lockerRoom',
    '/customerService',
  ];

  return (
    <AppContainer>
      {includeHeader1 && <UnifiedHeader variant='default' />}
      {includeHeader2 && <UnifiedHeader variant='oneDepth' />}
      {includeHeader3 && (
        <UnifiedHeader
          variant='twoDepth'
          title={headerTitle}
          onBack={undefined}
        />
      )}
      {includeHeader4 && (
        <UnifiedHeader
          variant='threeDepth'
          title={headerTitle}
          onBack={undefined}
        />
      )}
      {/* transient prop으로 변경 */}
      <ContentContainer $disablePadding={disablePadding}>
        <Outlet />
      </ContentContainer>
      {includeBottomNav && bottomNavPaths.includes(location.pathname) && (
        <BottomNav />
      )}
    </AppContainer>
  );
};

export default AppLayout;

// --- Styled Components ---

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #fff;
`;

const ContentContainer = styled.div<{
  $disablePadding?: boolean;
}>`
  flex: 1;
  padding: ${({ $disablePadding }) => ($disablePadding ? '0' : '70px 0')};
  overflow: auto;
  min-height: 100vh;
  background: #fff;
`;
