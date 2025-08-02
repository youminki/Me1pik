import React from 'react';
import styled from 'styled-components';

/**
 * StatsRow 컴포넌트
 *
 * StatsSection과 아이콘을 함께 배치하는 재사용 가능한 컴포넌트입니다.
 *
 * @param children - StatsSection 컴포넌트
 * @param icon - 우측에 표시할 아이콘 이미지 경로 (선택사항)
 * @param iconAlt - 아이콘의 alt 텍스트 (선택사항)
 */
interface StatsRowProps {
  children: React.ReactNode;
  icon?: string;
  iconAlt?: string;
}

const StatsRow: React.FC<StatsRowProps> = ({ children, icon, iconAlt }) => {
  return (
    <Container>
      {children}
      {icon && <MenuIcon src={icon} alt={iconAlt || '메뉴 이미지'} />}
    </Container>
  );
};

export default StatsRow;

const Container = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 20px;
`;

const MenuIcon = styled.img`
  width: 64px;
  height: 58px;
`;
