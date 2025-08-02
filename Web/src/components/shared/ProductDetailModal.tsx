import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import CancleIconIcon from '@/assets/headers/CancleIcon.svg';
import HomeIcon from '@/assets/headers/HomeIcon.svg';
import ShareIcon from '@/assets/headers/ShareIcon.svg';
import HomeDetail from '@/pages/homes/HomeDetail';

interface ProductDetailModalProps {
  isOpen: boolean;
  modalId: string | null;
  onClose: () => void;
  onShare: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  modalId,
  onClose,
  onShare,
}) => {
  const navigate = useNavigate();

  if (!isOpen || !modalId) return null;

  return (
    <ModalOverlay>
      <ModalBox>
        <ModalHeaderWrapper>
          <ModalHeaderContainer>
            <LeftSection>
              <CancleIcon src={CancleIconIcon} alt='취소' onClick={onClose} />
            </LeftSection>
            <CenterSection />
            <RightSection>
              <Icon src={ShareIcon} alt='공유' onClick={onShare} />
              <Icon src={HomeIcon} alt='홈' onClick={() => navigate('/home')} />
            </RightSection>
          </ModalHeaderContainer>
        </ModalHeaderWrapper>
        <ModalBody>
          <HomeDetail id={modalId} />
        </ModalBody>
      </ModalBox>
    </ModalOverlay>
  );
};

export default ProductDetailModal;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  overscroll-behavior: contain;
`;

const ModalBox = styled.div`
  background: #fff;
  width: 100%;
  max-width: 1000px;
  height: 100%;
  overflow-y: auto;
  position: relative;
  overscroll-behavior: contain;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ModalHeaderWrapper = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  background: #fff;
  z-index: 2100;
`;

const ModalHeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
`;

const ModalBody = styled.div`
  padding-top: 70px;
`;

const LeftSection = styled.div`
  cursor: pointer;
`;

const CenterSection = styled.div`
  flex: 1;
`;

const RightSection = styled.div`
  display: flex;
  gap: 19px;
`;

const CancleIcon = styled.img`
  cursor: pointer;
`;

const Icon = styled.img`
  cursor: pointer;
`;
