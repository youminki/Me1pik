// src/layouts/AppLayout.tsx
import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import styled from 'styled-components';

import UnifiedHeader from '../../components/shared/headers/UnifiedHeader';
import BottomNav from '../../components/bottom-navigation';
import useHeaderConfig from '../../hooks/useHeaderConfig';

const AppLayout: React.FC = () => {
  const location = useLocation();

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
