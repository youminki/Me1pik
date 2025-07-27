// src/components/BottomNav.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import BrandIcon from '@/assets/bottom-navigations/BrandIcon.svg';
import CustomerServiceIcon from '@/assets/bottom-navigations/CustomerServiceIcon.svg';
import HomeIcon from '@/assets/bottom-navigations/HomeIcon.svg';
import LockerRoomIcon from '@/assets/bottom-navigations/LockerRoomIcon.svg';
import MelpikIcon from '@/assets/bottom-navigations/MelpikIcon.svg';

interface Tab {
  key: string;
  route: string;
  icon: string;
  label: string;
}

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

const BAR_WIDTH = 40;

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);

  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [glow, setGlow] = useState(false);
  const [barPos, setBarPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  // 스크롤에 따라 숨김 토글
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

  // activeKey, barPos 계산
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

const DockContainer = styled.nav<{ $visible: boolean }>`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%)
    translateY(${({ $visible }) => ($visible ? '0' : '100%')});
  transition: transform 0.3s ease;
  width: 100%;

  padding: 0 16px;
  z-index: 1000;

  @media (min-width: 768px) {
    bottom: 3%;
    transform: translateX(-50%);
    max-width: 400px;
  }
`;

const Dock = styled.div`
  position: relative;
  display: flex;
  background: #1d1d1b;
  backdrop-filter: blur(16px);
  border-radius: 32px;
  padding: 0px 0 20px 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    border-radius: 0;
  }
`;

const NavItem = styled.div<{ $disabled: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
`;

// 아이콘 래퍼 배경 호버 색변경, 비활성 제외
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

const Icon = styled.img<{ $isActive: boolean }>`
  width: auto;
  height: auto;
  /* 활성 시 흰색, 비활성 시 회색 */
  filter: ${({ $isActive }) =>
    $isActive ? 'brightness(0) invert(1)' : 'brightness(0) invert(0.7)'};
`;

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

const Bar = styled.div`
  position: absolute;
  top: 0;
  width: ${BAR_WIDTH}px;
  height: 4px;
  background-color: #fff;
  border-radius: 2px;
  transition: left 0.3s ease;
`;
