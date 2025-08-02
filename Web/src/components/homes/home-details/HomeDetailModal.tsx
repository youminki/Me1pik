import React from 'react';
import styled from 'styled-components';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
  height?: string;
};

const ReusableModal2: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  width = '100%',
  height = '360px',
}) => {
  if (!isOpen) return null;

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onClose();
  };

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
