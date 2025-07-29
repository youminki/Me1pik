// src/layouts/AppLayout.tsx
import React, { useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import styled from 'styled-components';

import BottomNav from '@/components/bottom-navigation';
import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';
import useHeaderConfig from '@/hooks/useHeaderConfig';
import { hideScrollbar } from '@/styles/CommonStyles';
import {
  isNativeApp,
  isAndroidApp,
  setupStatusBarHeightListener,
  getStatusBarHeight,
} from '@/utils/nativeApp';

const AppLayout: React.FC = () => {
  const location = useLocation();

  const {
    includeHeader1,
    includeHeader2,
    includeHeader3,
    includeHeader4,
    includeBottomNav,
    headerTitle,
  } = useHeaderConfig(location.pathname);

  // 앱 초기화 시 상태바 높이 설정
  useEffect(() => {
    if (isNativeApp()) {
      // 상태바 높이 리스너 설정
      setupStatusBarHeightListener();

      // 초기 상태바 높이 설정
      const initialHeight = getStatusBarHeight();
      if (initialHeight > 0) {
        document.documentElement.style.setProperty(
          '--status-bar-height',
          `${initialHeight}px`
        );
      }

      // 안드로이드 앱의 경우 기본값 설정
      if (isAndroidApp()) {
        const defaultHeight = 24; // 안드로이드 기본 상태바 높이
        document.documentElement.style.setProperty(
          '--status-bar-height',
          `${defaultHeight}px`
        );
      }
    }
  }, []);

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
      {includeHeader1 && <FixedHeader variant='default' />}
      {includeHeader2 && <FixedHeader variant='oneDepth' />}
      {includeHeader3 && (
        <FixedHeader
          variant='twoDepth'
          title={headerTitle}
          onBack={undefined}
        />
      )}
      {includeHeader4 && (
        <FixedHeader
          variant='threeDepth'
          title={headerTitle}
          onBack={undefined}
        />
      )}
      <ContentContainer>
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
  height: 100vh;
  overflow: hidden;
  background: #fff;
`;

const FixedHeader = styled(UnifiedHeader)`
  position: fixed;
  top: ${() => {
    if (isNativeApp()) {
      // 안드로이드 앱의 경우 웹뷰에 이미 상단 패딩이 추가되어 있으므로 0으로 처리
      if (isAndroidApp()) {
        return '0';
      }
      // iOS 앱의 경우
      return 'var(--status-bar-height, 0px)';
    }
    return '0';
  }};
  left: 0;
  width: 100%;
  z-index: 1000;
`;

const ContentContainer = styled.div`
  position: relative;
  height: calc(100vh - 70px);
  overflow-y: auto;
  background: #fff;
  padding: 1rem;
  margin: auto;
  padding-top: ${() => {
    if (isNativeApp()) {
      // 안드로이드 앱의 경우 웹뷰에 이미 상단 패딩이 추가되어 있으므로 헤더 높이만큼만 패딩
      if (isAndroidApp()) {
        return '70px';
      }
      // iOS 앱의 경우
      return 'calc(70px + var(--status-bar-height, 0px))';
    }
    return '70px';
  }};

  ${hideScrollbar}
`;
