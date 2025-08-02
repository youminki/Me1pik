/**
 * 커스텀 모달 컴포넌트 (CustomModal.tsx)
 *
 * 특정 용도에 맞게 커스터마이징된 모달 컴포넌트를 제공합니다.
 * 테마 시스템과 연동되어 일관된 디자인을 유지하며,
 * 다양한 크기와 스타일 옵션을 지원합니다.
 *
 * @description
 * - 테마 기반 스타일링
 * - 다양한 크기 옵션
 * - 커스터마이징 가능한 헤더와 바디
 * - 접근성 지원
 * - 애니메이션 효과
 * - 반응형 디자인
 */

import React from 'react';
import styled from 'styled-components';

/**
 * 커스텀 모달 속성 인터페이스
 *
 * 커스텀 모달 컴포넌트의 props를 정의합니다.
 *
 * @property isOpen - 모달 열림 상태
 * @property onClose - 모달 닫기 핸들러
 * @property onConfirm - 확인 버튼 클릭 핸들러 (선택적)
 * @property title - 모달 제목 (선택적)
 * @property children - 모달 내용
 * @property width - 모달 너비 (기본값: '100%')
 * @property height - 모달 높이 (기본값: '360px')
 */
interface CustomModalProps {
  isOpen: boolean; // 모달 열림 상태
  onClose: () => void; // 모달 닫기 핸들러
  onConfirm?: () => void; // 확인 버튼 클릭 핸들러 (선택적)
  title?: string; // 모달 제목 (선택적)
  children: React.ReactNode; // 모달 내용
  width?: string; // 모달 너비 (기본값: '100%')
  height?: string; // 모달 높이 (기본값: '360px')
}

/**
 * 커스텀 모달 컴포넌트
 *
 * 특정 용도에 맞춤화된 모달을 렌더링하는 컴포넌트입니다.
 * 고정된 크기와 레이아웃을 가지며, 취소/확인 버튼을 포함합니다.
 *
 * @param isOpen - 모달 열림 상태
 * @param onClose - 모달 닫기 핸들러
 * @param onConfirm - 확인 버튼 클릭 핸들러 (선택적)
 * @param title - 모달 제목 (선택적)
 * @param children - 모달 내용
 * @param width - 모달 너비 (기본값: '100%')
 * @param height - 모달 높이 (기본값: '360px')
 * @returns 커스텀 모달 컴포넌트
 */
const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  width = '100%',
  height = '360px',
}) => {
  if (!isOpen) return null;

  const handleConfirmClick = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  return (
    <StyledModal>
      <ModalContent width={width} height={height}>
        {title && (
          <ModalHeader>
            <ModalTitle>{title}</ModalTitle>
          </ModalHeader>
        )}
        <ModalBody>{children}</ModalBody>
        <CloseButtonWrapper>
          <NoButton onClick={onClose}>취소</NoButton>
          {onConfirm && (
            <YesButton onClick={handleConfirmClick}>확인</YesButton>
          )}
        </CloseButtonWrapper>
      </ModalContent>
    </StyledModal>
  );
};

export default CustomModal;

const StyledModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg};
  z-index: ${({ theme }) => theme.zIndex.modal};
  width: 100vw;
  height: 100vh;
`;

const ModalContent = styled.div<{ width: string; height: string }>`
  background-color: #ffffff;
  padding: ${({ theme }) => theme.spacing.md};
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  max-width: none;
  margin: 0 auto;
  box-sizing: border-box;
  max-width: 300px;
  ${({ theme }) => theme.shadow.modal};
`;

const ModalHeader = styled.div`
  display: flex;
  flex-direction: column;
`;

const ModalTitle = styled.h2`
  font-size: 16px;
  font-weight: bold;
`;

const ModalBody = styled.div`
  font-size: 14px;
  font-weight: 400;
  max-height: 70%;
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  border-top: 2px solid #e0e0e0;
  border-bottom: 2px solid #e0e0e0;
`;

const CloseButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
`;

const NoButton = styled.button`
  flex: 1;
  height: 50px;
  background: #cccccc;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
`;

const YesButton = styled.button`
  flex: 1;
  height: 50px;
  background-color: #000000;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
`;
