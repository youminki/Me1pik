import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string;
  height?: string;
  actions?: React.ReactNode;
};

const ReusableModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  width = '100%',
  height = '360px',
  actions,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const modal = modalRef.current;
    if (!modal) return;
    // 포커스 가능한 요소들
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
      // ESC 키로 닫히지 않도록 제거
      // if (e.key === 'Escape') {
      //   onClose();
      // }
    };
    modal.addEventListener('keydown', handleKeyDown);
    return () => {
      modal.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirmClick = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <StyledModal
      role='dialog'
      aria-modal='true'
      {...(title ? { 'aria-labelledby': 'modal-title' } : {})}
      ref={modalRef}
      tabIndex={-1}
    >
      <ModalContent width={width} height={height}>
        {title && (
          <ModalHeader>
            <ModalTitle id='modal-title'>{title}</ModalTitle>
          </ModalHeader>
        )}
        <ModalBody>{children}</ModalBody>
        {actions && <ModalActions>{actions}</ModalActions>}
        <CloseButtonWrapper>
          <CloseButton onClick={handleConfirmClick}>닫기</CloseButton>
        </CloseButtonWrapper>
      </ModalContent>
    </StyledModal>
  );
};

export default ReusableModal;

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
  background-color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.md};
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  max-width: 300px;
  margin: 0 auto;
  box-shadow: ${({ theme }) => theme.shadow.modal};
  border-radius: ${({ theme }) => theme.radius.md};
  transition: ${({ theme }) => theme.transition.base};
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
  /* text-align: center; */
  max-height: 70%;
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.sm};
  border-top: 2px solid #e0e0e0;
  border-bottom: 2px solid #e0e0e0;
`;

const CloseButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 10px;
`;

const CloseButton = styled.button`
  width: 100%;
  height: 50px;
  background-color: ${({ theme }) => theme.colors.black};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: ${({ theme }) => theme.transition.base};
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;
