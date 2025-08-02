/**
 * 하단 네비게이션 컴포넌트 (bottom-navigation.tsx)
 *
 * 모바일 앱과 유사한 하단 네비게이션을 제공하는 컴포넌트입니다.
 * 주요 기능으로는 탭 간 이동, 스크롤에 따른 자동 숨김/표시,
 * 활성 탭 표시 애니메이션, 접근성 지원을 포함합니다.
 *
 * @description
 * - 탭 간 이동 및 라우팅 기능
 * - 스크롤 기반 자동 숨김/표시 (UX 개선)
 * - 활성 탭 표시 애니메이션 (글로우 효과)
 * - 접근성 지원 (키보드 네비게이션, 스크린 리더)
 * - 반응형 디자인 (모바일 최적화)
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import BrandIcon from '@/assets/bottom-navigations/BrandIcon.svg';
import CustomerServiceIcon from '@/assets/bottom-navigations/CustomerServiceIcon.svg';
import HomeIcon from '@/assets/bottom-navigations/HomeIcon.svg';
import LockerRoomIcon from '@/assets/bottom-navigations/LockerRoomIcon.svg';
import MelpikIcon from '@/assets/bottom-navigations/MelpikIcon.svg';

/**
 * 탭 정보 인터페이스
 *
 * 네비게이션 탭의 기본 정보를 정의합니다.
 * 각 탭의 식별자, 라우트, 아이콘, 라벨을 포함합니다.
 *
 * @property key - 탭 식별자 (고유한 키)
 * @property route - 라우트 경로 (React Router 경로)
 * @property icon - 아이콘 경로 (SVG 파일 경로)
 * @property label - 표시 라벨 (사용자에게 보여지는 텍스트)
 */
interface Tab {
  key: string; // 탭 식별자
  route: string; // 라우트 경로
  icon: string; // 아이콘 경로
  label: string; // 표시 라벨
}

/**
 * 네비게이션 탭 설정 상수
 *
 * 애플리케이션의 주요 섹션들을 정의하는 탭 설정입니다.
 * 각 탭은 사용자의 주요 작업 영역을 나타냅니다:
 * - 홈: 메인 페이지 (대시보드)
 * - 브랜드: 브랜드 목록 및 검색
 * - 다이어리: 개인 스타일 다이어리
 * - 락커룸: 개인 저장소 및 컬렉션
 * - 고객센터: 고객 지원 및 문의
 */
const TABS: Tab[] = [
  { key: 'home', route: '/home', icon: HomeIcon, label: '홈' },
  { key: 'brand', route: '/brand', icon: BrandIcon, label: '브랜드' },
  { key: 'melpik', route: '/melpik', icon: MelpikIcon, label: '다이어리' },
  {
    key: 'lockerRoom',
    route: '/lockerRoom',
    icon: LockerRoomIcon,
    label: '락커룸',
  },
  {
    key: 'customerService',
    route: '/customerService',
    icon: CustomerServiceIcon,
    label: '고객센터',
  },
];

/**
 * 활성 탭 표시 바 너비 상수
 *
 * 활성 탭을 시각적으로 표시하는 바의 너비를 정의합니다.
 * 애니메이션과 시각적 피드백을 위한 크기 설정입니다.
 */
const BAR_WIDTH = 40;

/**
 * 하단 네비게이션 컴포넌트
 *
 * 모바일 앱과 유사한 하단 네비게이션을 렌더링하는 메인 컴포넌트입니다.
 * 탭 간 이동, 스크롤 기반 자동 숨김/표시, 애니메이션 효과를 포함합니다.
 *
 * @returns 하단 네비게이션 JSX 엘리먼트
 */
const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);

  // 상태 관리
  const [activeKey, setActiveKey] = useState<string | null>(null); // 현재 활성 탭
  const [glow, setGlow] = useState(false); // 글로우 애니메이션 상태
  const [barPos, setBarPos] = useState(0); // 활성 탭 표시 바 위치
  const [visible, setVisible] = useState(true); // 네비게이션 표시 상태
  const lastScrollY = useRef(0); // 이전 스크롤 위치

  /**
   * 스크롤에 따른 네비게이션 자동 숨김/표시
   *
   * 스크롤 방향과 위치에 따라 네비게이션을 자동으로 숨기거나 표시합니다.
   * 사용자가 아래로 스크롤할 때는 숨기고, 위로 스크롤할 때는 표시합니다.
   */
  useEffect(() => {
    lastScrollY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setVisible(!(y > lastScrollY.current && y > 50));
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /**
   * 현재 라우트에 따른 활성 탭 및 표시 바 위치 계산
   *
   * 현재 경로에 맞는 탭을 활성화하고, 해당 탭의 위치에 표시 바를 배치합니다.
   * 글로우 애니메이션도 함께 처리합니다.
   */
  useEffect(() => {
    const current = TABS.find((t) => t.route === location.pathname);
    if (current && navRef.current) {
      setActiveKey(current.key);
      const el = navRef.current.querySelector<HTMLElement>(
        `[data-key="${current.key}"]`
      );
      if (el) {
        const containerRect = navRef.current.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        setBarPos(
          elRect.left - containerRect.left + (elRect.width - BAR_WIDTH) / 2
        );
      }
    } else {
      setActiveKey(null);
    }
    setGlow(false);
    const t = setTimeout(() => setGlow(true), 300);
    return () => clearTimeout(t);
  }, [location.pathname]);

  /**
   * handleClick 함수
   *
   * 탭 클릭 핸들러입니다.
   *
   * @param tab - 클릭된 탭 정보
   * @param enabled - 탭 활성화 여부
   */
  const handleClick = (tab: Tab, enabled: boolean) => {
    if (!enabled) return;
    if (tab.key !== activeKey) {
      setGlow(false);
      navigate(tab.route);
    }
  };

  return (
    <DockContainer $visible={visible}>
      <Dock ref={navRef}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeKey && glow;
          // home, lockerRoom 만 활성화 예시
          const enabled =
            tab.key === 'home' ||
            tab.key === 'brand' ||
            tab.key === 'melpik' ||
            tab.key === 'lockerRoom' ||
            tab.key === 'customerService';
          return (
            <NavItem
              key={tab.key}
              data-key={tab.key}
              $disabled={!enabled}
              onClick={() => handleClick(tab, enabled)}
            >
              <IconWrapper $isActive={isActive} $disabled={!enabled}>
                <Icon src={tab.icon} alt={tab.label} $isActive={isActive} />
              </IconWrapper>
              <Label $isActive={isActive} $disabled={!enabled}>
                {tab.label}
              </Label>
            </NavItem>
          );
        })}
        <Bar style={{ left: barPos }} />
      </Dock>
    </DockContainer>
  );
};

export default BottomNav;

/* Styled Components */

/**
 * DockContainer 스타일 컴포넌트
 *
 * 네비게이션 컨테이너의 스타일을 정의합니다.
 * 스크롤에 따른 표시/숨김 애니메이션을 포함합니다.
 *
 * @property $visible - 표시 여부
 */
const DockContainer = styled.nav<{ $visible: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  transform: translateY(${({ $visible }) => ($visible ? '0' : '100%')});
  transition: transform 0.3s ease;
  width: 100%;
  z-index: 1000;

  @media (min-width: 768px) {
    bottom: 3%;
    left: 50%;
    transform: translateX(-50%)
      translateY(${({ $visible }) => ($visible ? '0' : '100%')});
    max-width: 400px;
  }
`;

/**
 * Dock 스타일 컴포넌트
 *
 * 네비게이션 도크의 스타일을 정의합니다.
 * 블러 효과와 그림자를 포함합니다.
 */
const Dock = styled.div`
  position: relative;
  display: flex;
  background: #1d1d1b;
  backdrop-filter: blur(16px);
  border-radius: 32px;
  padding: 12px 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    border-radius: 0;
    padding: 0 0 25px 0;
    width: 100%;
  }
`;

/**
 * NavItem 스타일 컴포넌트
 *
 * 네비게이션 아이템의 스타일을 정의합니다.
 *
 * @property $disabled - 비활성화 여부
 */
const NavItem = styled.div<{ $disabled: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
`;

/**
 * IconWrapper 스타일 컴포넌트
 *
 * 아이콘 래퍼의 스타일을 정의합니다.
 * 배경 호버 색변경과 비활성 상태를 처리합니다.
 *
 * @property $isActive - 활성 상태
 * @property $disabled - 비활성화 여부
 */
const IconWrapper = styled.div<{ $isActive: boolean; $disabled: boolean }>`
  position: relative;
  width: 48px;
  height: 48px;

  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;

  &::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 50px;
    background: rgba(255, 255, 255, 0.2);
    filter: blur(16px);
    clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0 100%);
    opacity: ${({ $isActive }) => ($isActive ? 1 : 0)};
    transition: opacity 0.3s ease;
    pointer-events: none;
  }
`;

/**
 * Icon 스타일 컴포넌트
 *
 * 아이콘의 스타일을 정의합니다.
 * 활성 시 흰색, 비활성 시 회색으로 필터를 적용합니다.
 *
 * @property $isActive - 활성 상태
 */
const Icon = styled.img<{ $isActive: boolean }>`
  width: auto;
  height: auto;
  /* 활성 시 흰색, 비활성 시 회색 */
  filter: ${({ $isActive }) =>
    $isActive ? 'brightness(0) invert(1)' : 'brightness(0) invert(0.7)'};
`;

/**
 * Label 스타일 컴포넌트
 *
 * 라벨의 스타일을 정의합니다.
 *
 * @property $isActive - 활성 상태
 * @property $disabled - 비활성화 여부
 */
const Label = styled.span<{ $isActive: boolean; $disabled: boolean }>`
  font-size: 11px;
  color: ${({ $isActive, $disabled }) => {
    if ($disabled) return 'rgba(255,255,255,0.5)';
    return $isActive ? '#fff' : 'rgba(200,200,200,0.7)';
  }};
  transition: color 0.2s ease;

  @media (max-width: 768px) {
    font-size: 10px;
  }
`;

/**
 * Bar 스타일 컴포넌트
 *
 * 활성 탭 표시 바의 스타일을 정의합니다.
 */
const Bar = styled.div`
  position: absolute;
  top: 0;
  width: ${BAR_WIDTH}px;
  height: 4px;
  background-color: #fff;
  border-radius: 2px;
  transition: left 0.3s ease;
`;
