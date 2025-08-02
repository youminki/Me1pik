// 홈 상세 모달 컴포넌트 - 재사용 가능한 모달 UI 제공
import React from 'react';
import styled from 'styled-components';

// 모달 Props 타입 정의
type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
  height?: string;
};

// 메인 모달 컴포넌트
const ReusableModal2: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  width = '100%',
  height = '360px',
}) => {
  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) return null;

  // 배경 클릭 시 모달 닫기 핸들러
  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onClose();
  };

  // 모달 내용 클릭 시 이벤트 전파 방지
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <StyledModal onClick={handleBackgroundClick}>
      <ModalContent width={width} height={height} onClick={handleContentClick}>
        {children}
      </ModalContent>
    </StyledModal>
  );
};

export default ReusableModal2;

// 스타일 컴포넌트들
const StyledModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);

  display: flex;
  justify-content: center;
  align-items: center;
  padding: 27px;

  z-index: 9999;
`;

const ModalContent = styled.div<{ width: string; height: string }>`
  background-color: #ffffff;
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  max-width: 1000px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 6px;
`;
