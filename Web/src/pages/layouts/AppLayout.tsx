// src/layouts/AppLayout.tsx
import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigationType, Outlet } from 'react-router-dom';
import styled from 'styled-components';

// 🔧 개선: 모바일/웹뷰 레이아웃 안정성 향상 + 노치/웹뷰/키보드/접근성/성능 완벽! 🚀

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

  // 🔧 개선: 헤더 높이 실측으로 자동화 (반응형/다국어 대응)
  const [headerH, setHeaderH] = React.useState(0);

  // 🔧 개선: rAF 디바운스 유틸 함수 (재사용)
  const withRaf = React.useMemo(() => {
    let raf = 0;
    return (fn: () => void) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fn);
    };
  }, []);

  // DOM 렌더링 후 헤더 높이 측정
  React.useLayoutEffect(() => {
    const measureHeader = () => {
      withRaf(() => {
        const el = document.querySelector(
          '[data-header="true"]'
        ) as HTMLElement | null;
        if (el) {
          const h = Math.round(el.offsetHeight);
          setHeaderH((prev) => (prev === h ? prev : h));
        }
      });
    };

    measureHeader();

    // 🔧 개선: ResizeObserver 안전 가드 (구형/특수 WebView 대응)
    if (typeof ResizeObserver === 'undefined') {
      // 폴백: 창 크기 변화 이벤트로 대응
      const handler = () => measureHeader();
      window.addEventListener('resize', handler);
      window.addEventListener('orientationchange', handler);
      // 🔧 개선: 초기 1회 측정 누락 방지
      const tid = window.setTimeout(measureHeader, 0);
      return () => {
        window.removeEventListener('resize', handler);
        window.removeEventListener('orientationchange', handler);
        clearTimeout(tid); // 🔧 개선: setTimeout 정리
      };
    }

    const ro = new ResizeObserver(measureHeader);
    const el = document.querySelector('[data-header="true"]');
    if (el) ro.observe(el);

    return () => ro.disconnect();
  }, [includeHeader1, includeHeader2, includeHeader3, includeHeader4]);

  // 🔧 개선: 바텀 네비게이션 높이도 실측으로 자동화
  const [bottomH, setBottomH] = React.useState(0);

  // 🔧 기존 상수 방식은 그대로 두고, 나중에 차차 실측으로 옮겨도 됨
  const headerHeights = {
    default: 64,
    oneDepth: 64,
    twoDepth: 72,
    threeDepth: 80,
  } as const;

  // 🔧 개선: 바텀 네비게이션 높이 폴백값을 상수로 관리
  const BOTTOM_NAV_HEIGHT = 64;

  // 현재 활성화된 헤더의 높이 계산 (실측값이 있으면 우선 사용)
  let headerHeight = headerH || 0;
  if (!headerHeight) {
    if (includeHeader1) headerHeight = headerHeights.default;
    else if (includeHeader2) headerHeight = headerHeights.oneDepth;
    else if (includeHeader3) headerHeight = headerHeights.twoDepth;
    else if (includeHeader4) headerHeight = headerHeights.threeDepth;
  }

  // 🔧 개선: 전역 네비게이션 헬퍼는 App.tsx에서 통합 관리
  // (중복 설정 방지 및 언마운트 타이밍 최적화)

  // 🔧 개선: 라우트 이동 시 스크롤 복원/초기화
  const ContentContainerEl = useRef<HTMLDivElement>(null);
  const navType = useNavigationType();

  useEffect(() => {
    // POP = 뒤로/앞으로: 스크롤 유지, 나머지 PUSH/REPLACE는 맨 위로
    if (navType !== 'POP') {
      ContentContainerEl.current?.scrollTo({
        top: 0,
        behavior: 'auto',
      });
    }
  }, [location.pathname, navType]);

  // 앱 초기화 코드 제거됨

  // 🔧 개선: BottomNav 표시 대상 경로를 상수로 분리 (재생성 방지)
  const BOTTOM_NAV_PREFIXES = [
    '/home',
    '/brand',
    '/melpik',
    '/lockerRoom',
    '/customerService',
  ] as const;

  const showBottomNav =
    includeBottomNav &&
    BOTTOM_NAV_PREFIXES.some(
      (p: string) =>
        location.pathname === p || location.pathname.startsWith(p + '/')
    );

  // 🔧 개선: 바텀 네비게이션 높이 측정 (showBottomNav 정의 후)
  React.useLayoutEffect(() => {
    const measureBottom = () => {
      withRaf(() => {
        const el = document.querySelector(
          '[data-bottom-nav="true"]'
        ) as HTMLElement | null;
        if (el) {
          const h = Math.round(el.offsetHeight);
          setBottomH((prev) => (prev === h ? prev : h));
        }
      });
    };

    measureBottom();

    // 🔧 개선: ResizeObserver 안전 가드 (구형/특수 WebView 대응)
    if (typeof ResizeObserver === 'undefined') {
      // 폴백: 창 크기 변화 이벤트로 대응
      const handler = () => measureBottom();
      window.addEventListener('resize', handler);
      window.addEventListener('orientationchange', handler);
      // 🔧 개선: 초기 1회 측정 누락 방지
      const tid = window.setTimeout(measureBottom, 0);
      return () => {
        window.removeEventListener('resize', handler);
        window.removeEventListener('orientationchange', handler);
        clearTimeout(tid); // 🔧 개선: setTimeout 정리
      };
    }

    const ro = new ResizeObserver(measureBottom);
    const el = document.querySelector('[data-bottom-nav="true"]');
    if (el) ro.observe(el);

    return () => ro.disconnect();
  }, [showBottomNav]);

  return (
    <AppContainer
      style={
        {
          // CSS 변수로 헤더/바텀 높이 전달
          '--header-h': `${headerHeight}px`,
          '--bottom-h': showBottomNav
            ? `${bottomH || BOTTOM_NAV_HEIGHT}px`
            : '0px',
        } as React.CSSProperties
      }
    >
      {/* 🔧 개선: 접근성 - 본문으로 건너뛰기 스킵 링크 */}
      <a href='#main' className='sr-only'>
        본문으로 건너뛰기
      </a>
      {includeHeader1 && <FixedHeader data-header='true' variant='default' />}
      {includeHeader2 && <FixedHeader data-header='true' variant='oneDepth' />}
      {includeHeader3 && (
        <FixedHeader
          data-header='true'
          variant='twoDepth'
          title={headerTitle}
        />
      )}
      {includeHeader4 && (
        <FixedHeader
          data-header='true'
          variant='threeDepth'
          title={headerTitle}
        />
      )}
      <ContentContainer id='main' ref={ContentContainerEl}>
        <Outlet />
      </ContentContainer>
      {showBottomNav && <BottomNav data-bottom-nav='true' />}
    </AppContainer>
  );
};

export default AppLayout;

// --- Styled Components ---

const AppContainer = styled.div`
  min-height: 100svh; /* 초기 레이아웃 안정 */
  background: #fff;

  /* 동적 뷰포트 지원 검사 */
  @supports (height: 100dvh) {
    height: 100dvh; /* 주소창 수축/팽창 반영 */
  }

  /* 구형 브라우저 폴백 */
  @supports not (height: 100dvh) {
    height: 100vh;
  }
`;

const FixedHeader = styled(UnifiedHeader)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding-top: env(safe-area-inset-top); /* 노치 대응 */
  padding-top: constant(safe-area-inset-top); /* legacy fallback */
  z-index: 1000;
`;

const ContentContainer = styled.main`
  position: relative;
  min-height: 100svh; /* 초기 레이아웃 안정 */
  overflow-y: auto;
  background: #fff;
  padding: 1rem;
  margin: auto;

  /* 헤더/바텀 간격을 CSS 변수로 */
  padding-top: var(--header-h, 0px);
  /* 🔧 개선: safe-area는 BottomNav에서만 처리, 중복계산 방지 */
  padding-bottom: var(--bottom-h, 0px);

  overscroll-behavior-y: contain; /* iOS 바운스 줄이기 */
  -webkit-overflow-scrolling: touch; /* iOS 스크롤 부드럽게 */
  scrollbar-gutter: stable both-edges; /* 스크롤바 등장/숨김 레이아웃 시프트 방지 */

  /* 🔧 개선: 포커스 이동 시 헤더에 가려지는 요소들 방지 */
  [tabindex='-1'],
  h1,
  h2,
  h3 {
    scroll-margin-top: var(--header-h, 0px);
  }

  /* 동적 뷰포트 지원 검사 */
  @supports (min-height: 100dvh) {
    min-height: 100dvh; /* 주소창 수축/팽창 반영 */
  }

  /* 구형 브라우저 폴백 */
  @supports not (min-height: 100dvh) {
    min-height: 100vh;
  }

  /* 🔧 개선: 인풋 포커스 시 BottomNav에 가려짐 방지 */
  input,
  textarea,
  select,
  [contenteditable='true'] {
    scroll-margin-bottom: var(--bottom-h, 0px);
  }

  ${hideScrollbar}
`;
