// src/layouts/AppLayout.tsx
import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import styled from 'styled-components';

import BottomNav from '@/components/bottom-navigation';
import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';
import useHeaderConfig from '@/hooks/useHeaderConfig';
import { hideScrollbar } from '@/styles/CommonStyles';
import { isNativeApp } from '@/utils/nativeApp';

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
  top: ${() => (isNativeApp() ? 'var(--android-top-margin, 0px)' : '0')};
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
  padding-top: ${() =>
    isNativeApp() ? 'calc(70px + var(--android-top-margin, 0px))' : '70px'};

  ${hideScrollbar}
`;
