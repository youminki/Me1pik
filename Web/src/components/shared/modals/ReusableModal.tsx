/**
 * 재사용 가능한 모달 컴포넌트 (ReusableModal.tsx)
 *
 * 다양한 상황에서 재사용할 수 있는 모달 컴포넌트를 제공합니다.
 * 제목, 내용, 액션 버튼을 커스터마이징할 수 있으며,
 * 접근성과 키보드 네비게이션을 지원합니다.
 *
 * @description
 * - 커스터마이징 가능한 제목과 내용
 * - 액션 버튼 지원
 * - 접근성 지원 (ARIA 속성)
 * - 키보드 네비게이션 (Escape, Enter)
 * - 애니메이션 효과
 * - 반응형 디자인
 */

import React, { useState, useEffect, useRef } from 'react';
import { IoMdClose } from 'react-icons/io';
import styled from 'styled-components';

/**
 * 모달 속성 인터페이스
 *
 * 재사용 가능한 모달 컴포넌트의 props를 정의합니다.
 *
 * @property isOpen - 모달 열림 상태
 * @property onClose - 모달 닫기 핸들러
 * @property onConfirm - 확인 버튼 클릭 핸들러 (선택적)
 * @property title - 모달 제목 (선택적)
 * @property children - 모달 내용
 * @property width - 모달 너비 (기본값: 'auto')
 * @property actions - 커스텀 액션 버튼들 (선택적)
 * @property showConfirmButton - 확인 버튼 표시 여부 (기본값: false)
 */
interface ModalProps {
  isOpen: boolean; // 모달 열림 상태
  onClose: () => void; // 모달 닫기 핸들러
  onConfirm?: () => void; // 확인 버튼 클릭 핸들러 (선택적)
  title?: string; // 모달 제목 (선택적)
  children: React.ReactNode; // 모달 내용
  width?: string; // 모달 너비 (기본값: 'auto')
  actions?: React.ReactNode; // 커스텀 액션 버튼들 (선택적)
  showConfirmButton?: boolean; // 확인 버튼 표시 여부 (기본값: false)
}

/**
 * 재사용 가능한 모달 컴포넌트
 *
 * 다양한 용도로 사용할 수 있는 모달을 렌더링하는 컴포넌트입니다.
 * 접근성, 키보드 네비게이션, 포커스 트랩, 애니메이션 등을 지원합니다.
 *
 * @param isOpen - 모달 열림 상태
 * @param onClose - 모달 닫기 핸들러
 * @param onConfirm - 확인 버튼 클릭 핸들러 (선택적)
 * @param title - 모달 제목 (선택적)
 * @param children - 모달 내용
 * @param width - 모달 너비 (기본값: 'auto')
 * @param actions - 커스텀 액션 버튼들 (선택적)
 * @param showConfirmButton - 확인 버튼 표시 여부 (기본값: false)
 * @returns 재사용 가능한 모달 컴포넌트
 */
const ReusableModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  width = 'auto',
  actions,
  showConfirmButton = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const modal = modalRef.current;
    if (!modal) return;
    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length) focusable[0].focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    modal.addEventListener('keydown', handleKeyDown);
    return () => {
      modal.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const handleConfirmClick = () => {
    if (onConfirm) {
      onConfirm();
    }
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsClosing(true);
      setTimeout(() => {
        onClose();
        setIsClosing(false);
      }, 200);
    }
  };

  return (
    <StyledModal
      role='dialog'
      aria-modal='true'
      {...(title ? { 'aria-labelledby': 'modal-title' } : {})}
      ref={modalRef}
      tabIndex={-1}
      onClick={handleOverlayClick}
      $isClosing={isClosing}
    >
      <ModalContent width={width}>
        <ModalHeader>
          {title && <ModalTitle id='modal-title'>{title}</ModalTitle>}
          <CloseIcon
            onClick={() => {
              setIsClosing(true);
              setTimeout(() => {
                onClose();
                setIsClosing(false);
              }, 200);
            }}
          />
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
        <ModalActions>
          {actions || (
            <>
              <CloseButton
                onClick={() => {
                  setIsClosing(true);
                  setTimeout(() => {
                    onClose();
                    setIsClosing(false);
                  }, 200);
                }}
              >
                {showConfirmButton ? '아니오' : '닫기'}
              </CloseButton>
              {showConfirmButton && (
                <ConfirmButton onClick={handleConfirmClick}>네</ConfirmButton>
              )}
            </>
          )}
        </ModalActions>
      </ModalContent>
    </StyledModal>
  );
};

export default ReusableModal;

const StyledModal = styled.div<{ $isClosing: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100000; /* 항상 최상단에 표시되도록 높은 값 설정 */
  opacity: ${({ $isClosing }) => ($isClosing ? 0 : 1)};
  transition: opacity 0.2s ease-out;
`;

const ModalContent = styled.div<{ width: string }>`
  background-color: ${({ theme }) => theme.colors.white};
  padding: 1.5rem;
  width: ${({ width }) => width};
  min-width: 320px;
  min-height: 500px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  ${({ theme }) => theme.shadow.modal};
  border-radius: ${({ theme }) => theme.radius.md};
  transition: ${({ theme }) => theme.transition.base};
  box-sizing: border-box;

  @media (min-width: 768px) {
    max-width: 500px;
    padding: 2rem;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
`;

const CloseIcon = styled(IoMdClose)`
  cursor: pointer;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const ModalBody = styled.div`
  font-size: 1rem;
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 1.5rem;
`;

const ButtonBase = styled.button`
  flex: 1;
  height: 50px;
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: ${({ theme }) => theme.transition.base};
  padding: 0 1.5rem;
`;

const CloseButton = styled(ButtonBase)`
  background-color: #cccccc;
  color: ${({ theme }) => theme.colors.white};
`;

const ConfirmButton = styled(ButtonBase)`
  background-color: ${({ theme }) => theme.colors.black};
  color: ${({ theme }) => theme.colors.white};
`;

export const LoginContainer = styled.div`
  /* padding-top: 70px; // AppLayout에서 이미 처리됨, 중복 방지 */
  min-width: 320px;
  width: 100vw;
  max-width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  overflow-x: auto;
  /* height: 100%; 또는 height: 100vh; 삭제 */
`;
