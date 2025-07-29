// src/components/melpiks/create-melpiks/settings/Modal.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import ReusableModal from '@/components/shared/modals/ReusableModal';
import { theme } from '@/styles/Theme';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (brands: string[]) => void;
  selectedBrands: string[]; // 부모에서 내려오는 현재 저장된 brands
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedBrands: initialSelectedBrands,
}) => {
  const brands = [
    '모조 (MOJO)',
    '듀엘 (DEW L)',
    '쥬크 (ZOOC)',
    '씨씨콜렉트 (CC Collect)',
    '미샤 (MICHAA)',
    '잇미샤 (it MICHAA)',
    '마쥬 (MAJE)',
    '산드로 (SANDRO)',
    '이로 (IRO)',
    '시슬리 (SISLEY)',
    '사틴 (SATIN)',
    '에스블랑 (S Blanc)',
    '올리브 데 올리브 (OLIVE DES OLIVE)',
    '클럽 모나코 (CLUB Monaco)',
    '데코 (DECO)',
    '에고이스트 (EGOIST)',
    '지고트 (JIGOTT)',
    '케네스 레이디 (KENNETH LADY)',
    '라인 (LINE)',
    '지컷 (G-cut)',
  ];

  // 내부 선택 상태
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  // 부모로부터 받은 값이 바뀔 때마다 내부 상태 동기화
  useEffect(() => {
    if (isOpen) {
      setSelectedBrands(initialSelectedBrands);
    }
  }, [initialSelectedBrands, isOpen]);

  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [cancelConfirmationVisible, setCancelConfirmationVisible] =
    useState(false);

  const handleBrandSelect = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands((prev) => prev.filter((b) => b !== brand));
    } else if (selectedBrands.length < 3) {
      setSelectedBrands((prev) => [...prev, brand]);
    }
  };

  const handleCompleteSelection = () => {
    if (selectedBrands.length < 3) {
      setWarningModalVisible(true);
    } else {
      onSelect(selectedBrands);
      onClose();
    }
  };

  const handleCancelClick = () => {
    setCancelConfirmationVisible(true);
  };

  return (
    <>
      {isOpen && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                브랜드 선택 <GrayText>(3가지 선택)</GrayText>
              </ModalTitle>
              <GrayLine />
            </ModalHeader>

            <ModalBody>
              <BrandSelectionGrid>
                {brands.map((brand) => (
                  <BrandOption
                    key={brand}
                    selected={selectedBrands.includes(brand)}
                    onClick={() => handleBrandSelect(brand)}
                  >
                    {brand}
                  </BrandOption>
                ))}
              </BrandSelectionGrid>
            </ModalBody>

            <GrayLine />
            <ButtonRow>
              <CancelButton onClick={handleCancelClick}>취소</CancelButton>
              <CompleteButton onClick={handleCompleteSelection}>
                선택완료
              </CompleteButton>
            </ButtonRow>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* 경고 모달 */}
      <ReusableModal
        isOpen={warningModalVisible}
        onClose={() => setWarningModalVisible(false)}
        title='경고'
      >
        <p>3가지 브랜드를 선택해야 합니다.</p>
      </ReusableModal>

      {/* 취소 확인 모달 */}
      <ReusableModal
        isOpen={cancelConfirmationVisible}
        onClose={() => setCancelConfirmationVisible(false)}
        onConfirm={onClose}
        title='선택 취소'
        showConfirmButton={true}
      >
        <p>설정하신 내용을 취소 하시겠습니까?</p>
      </ReusableModal>
    </>
  );
};

export default Modal;

const ModalOverlay = styled.div`
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
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: ${theme.colors.white};
  padding: 20px;
  width: 100%;
  max-width: 500px;

  /* 최대 높이 제한 및 내부 스크롤 */
  max-height: 60vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  flex-direction: column;
`;

const ModalTitle = styled.p`
  font-weight: 800;
  font-size: 16px;
`;

const GrayText = styled.span`
  color: ${theme.colors.gray1};
`;

const GrayLine = styled.hr`
  border: none;
  width: 100%;
  border: 1px solid ${theme.colors.gray0};
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const BrandSelectionGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const BrandOption = styled.div<{ selected: boolean }>`
  padding: 10px;
  background-color: ${theme.colors.white};
  color: ${(props) =>
    props.selected ? theme.colors.yellow : theme.colors.black};
  border: ${(props) =>
    props.selected
      ? `3px solid ${theme.colors.yellow}`
      : `1px solid ${theme.colors.gray1}`};
  text-align: center;
  cursor: pointer;
  font-weight: 800;
  font-size: 12px;
  line-height: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 10px;
`;

const CancelButton = styled.button`
  width: 100%;
  height: 56px;
  background-color: ${theme.colors.gray1};
  color: ${theme.colors.white};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 800;
  font-size: 16px;
`;

const CompleteButton = styled(CancelButton)`
  background-color: ${theme.colors.black};
`;
