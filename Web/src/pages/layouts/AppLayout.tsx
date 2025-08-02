/**
 * 앱 레이아웃 컴포넌트 (AppLayout.tsx)
 *
 * 애플리케이션의 기본 레이아웃 구조를 제공합니다.
 * 헤더, 콘텐츠 영역, 하단 네비게이션을 포함하며,
 * 경로에 따라 동적으로 UI 요소를 표시/숨김 처리합니다.
 *
 * @description
 * - 동적 헤더 표시 (경로별 설정)
 * - 콘텐츠 영역 관리
 * - 하단 네비게이션 표시/숨김
 * - 반응형 레이아웃 구조
 * - 스크롤바 숨김 처리
 */
import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import styled from 'styled-components';

import BottomNav from '@/components/bottom-navigation';
import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';
import useHeaderConfig from '@/hooks/useHeaderConfig';
import { hideScrollbar } from '@/styles/CommonStyles';

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

  /**
   * 하단 네비게이션 표시 대상 경로
   *
   * 하단 네비게이션이 표시되어야 하는 경로들을 정의합니다.
   * 메인 네비게이션 탭들에 해당하는 경로들입니다.
   */
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

/**
 * 스타일드 컴포넌트
 *
 * 레이아웃 구성 요소들의 스타일을 정의합니다.
 * 반응형 디자인과 사용자 경험을 고려한 스타일링을 제공합니다.
 */

const AppContainer = styled.div`
  height: 100vh;
  background: #fff;
`;

const FixedHeader = styled(UnifiedHeader)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
`;

const ContentContainer = styled.div`
  position: relative;
  height: 100vh;
  overflow-y: auto;
  background: #fff;
  padding: 1rem;
  margin: auto;
  padding-top: 70px;

  ${hideScrollbar}
`;
