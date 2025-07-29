// src/components/AddressSearchModal.tsx

import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

declare global {
  interface Window {
    daum: { Postcode: unknown };
  }
}

// Daum 우편번호 스크립트 로드
const loadDaumPostcode = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if (window.daum && window.daum.Postcode) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src =
      '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('다음 우편번호 로드 실패'));
    document.head.appendChild(script);
  });

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string;
  height?: string;
  actions?: React.ReactNode;
}

const ReusableModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = '100%',
  height = '360px',
  actions,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <StyledModal onClick={handleBackdropClick}>
      <ModalContent width={width} height={height}>
        {title && (
          <ModalHeader>
            <ModalTitle>{title}</ModalTitle>
          </ModalHeader>
        )}
        <ModalBody>{children}</ModalBody>
        {actions && <ModalActions>{actions}</ModalActions>}
        <CloseButtonWrapper>
          <CloseButton onClick={onClose}>닫기</CloseButton>
        </CloseButtonWrapper>
      </ModalContent>
    </StyledModal>
  );
};

interface AddressSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (address: string, lat?: number, lng?: number) => void;
}

const AddressSearchModal: React.FC<AddressSearchModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    loadDaumPostcode()
      .then(() => {
        if (!containerRef.current) return;
        containerRef.current.innerHTML = '';
        const Postcode = window.daum.Postcode as
          | (new (options: {
              width: string;
              height: string;
              oncomplete: (data: {
                roadAddress?: string;
                jibunAddress?: string;
                y?: string;
                x?: string;
              }) => void;
            }) => { embed: (container: HTMLElement) => void })
          | undefined;
        if (Postcode) {
          new Postcode({
            width: '100%',
            height: '100%',
            oncomplete: (data: {
              roadAddress?: string;
              jibunAddress?: string;
              y?: string;
              x?: string;
            }) => {
              const addr = data.roadAddress || data.jibunAddress;
              const lat =
                typeof data.y === 'string' ? parseFloat(data.y) : undefined;
              const lng =
                typeof data.x === 'string' ? parseFloat(data.x) : undefined;
              if (typeof addr === 'string') {
                onSelect(addr, lat, lng);
              }
              onClose();
            },
          }).embed(containerRef.current);
        }
      })
      .catch(() => {});
    // cleanup에서 ref를 지역 변수로 저장
    const ref = containerRef.current;
    return () => {
      if (ref) ref.innerHTML = '';
    };
  }, [isOpen, onClose, onSelect]);

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title='주소 검색'
      width='600px'
      height='600px'
    >
      <MapContainer ref={containerRef} />
    </ReusableModal>
  );
};

export default AddressSearchModal;

// — styled-components 모두 생략 없이 아래 그대로 유지 —

const StyledModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 27px;
  z-index: 9999;
  width: 100vw;
  height: 100vh;
`;

const ModalContent = styled.div<{ width: string; height: string }>`
  background-color: #ffffff;
  padding: 1rem;
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  max-width: 600px;
  margin: 0 auto;
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
  flex: 1;
  overflow-y: auto;
  padding: 10px;
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
  background-color: #000000;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  margin: auto;
`;
