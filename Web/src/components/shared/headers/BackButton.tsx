/**
 * 뒤로가기 버튼 컴포넌트 (BackButton.tsx)
 *
 * 헤더에서 사용하는 뒤로가기 버튼 컴포넌트를 제공합니다.
 * 클릭 시 이전 페이지로 이동하며, 접근성을 고려한
 * 키보드 네비게이션을 지원합니다.
 *
 * @description
 * - 뒤로가기 네비게이션
 * - 접근성 지원
 * - 키보드 네비게이션
 * - 반응형 디자인
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import BackButtonIcon from '@/assets/BackButton.svg';

/**
 * 뒤로가기 버튼 속성 인터페이스
 *
 * 뒤로가기 버튼 컴포넌트의 props를 정의합니다.
 *
 * @property onClick - 커스텀 클릭 핸들러 (선택적)
 */
interface BackButtonProps {
  onClick?: () => void; // 커스텀 클릭 핸들러 (선택적)
}

/**
 * 뒤로가기 버튼 컴포넌트
 *
 * 뒤로가기 기능을 제공하는 버튼을 렌더링하는 컴포넌트입니다.
 * 커스텀 핸들러가 제공되면 해당 함수를 실행하고,
 * 그렇지 않으면 브라우저 히스토리의 이전 페이지로 이동합니다.
 *
 * @param onClick - 커스텀 클릭 핸들러 (선택적)
 * @returns 뒤로가기 버튼 컴포넌트
 */
const BackButton: React.FC<BackButtonProps> = ({ onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <Container>
      <IconButton onClick={handleClick}>
        <Icon src={BackButtonIcon} alt='뒤로 가기' />
      </IconButton>
    </Container>
  );
};

export default BackButton;

const Container = styled.div`
  position: relative;
  width: 100%;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
`;

const Icon = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer;
`;
