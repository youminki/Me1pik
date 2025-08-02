/**
 * 심플 헤더 컴포넌트 (SimpleHeader.tsx)
 *
 * 간단한 헤더 컴포넌트를 제공합니다.
 * 뒤로가기 버튼과 제목을 포함하며, 다양한 페이지에서
 * 재사용할 수 있는 기본적인 헤더 구조를 제공합니다.
 *
 * @description
 * - 뒤로가기 버튼
 * - 제목 표시
 * - 반응형 디자인
 * - 접근성 지원
 */

import React from 'react';
import styled from 'styled-components';

import BackButtonIcon from '@/assets/headers/BackButton.svg';

/**
 * 간단한 헤더 속성 인터페이스
 *
 * 간단한 헤더 컴포넌트의 props를 정의합니다.
 *
 * @property title - 헤더 제목
 * @property onBack - 뒤로가기 핸들러 (선택적)
 */
interface SimpleHeaderProps {
  title: string; // 헤더 제목
  onBack?: () => void; // 뒤로가기 핸들러 (선택적)
}

/**
 * 간단한 헤더 컴포넌트
 *
 * 간단한 구조의 헤더를 렌더링하는 컴포넌트입니다.
 * 뒤로가기 버튼과 제목만 포함하는 최소한의 헤더를 제공합니다.
 *
 * @param title - 헤더 제목
 * @param onBack - 뒤로가기 핸들러 (선택적)
 * @returns 간단한 헤더 컴포넌트
 */
const SimpleHeader: React.FC<SimpleHeaderProps> = ({ title, onBack }) => {
  const handleBack = () => {
    if (onBack) onBack();
    else window.history.back();
  };

  return (
    <HeaderWrapper>
      <HeaderContainer>
        <BackButton src={BackButtonIcon} alt='뒤로가기' onClick={handleBack} />
        <Title>{title}</Title>
      </HeaderContainer>
    </HeaderWrapper>
  );
};

export default SimpleHeader;

const HeaderWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #fff;
  z-index: 1000;
`;

const HeaderContainer = styled.header`
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 1rem;
`;

const BackButton = styled.img`
  width: 28px;
  height: 28px;
  cursor: pointer;
`;

const Title = styled.h1`
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #222;
`;
