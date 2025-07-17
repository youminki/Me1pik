// src/components/DeliveryListModal.tsx
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Address } from '../api/address/address';

interface Props {
  isOpen: boolean;
  addresses: Address[];
  selectedId: number | null;
  onSelect: (addr: Address) => void;
  onClose: () => void;
  onConfirm: () => void;
}

const DeliveryListModal: React.FC<Props> = ({
  isOpen,
  addresses,
  selectedId,
  onSelect,
  onClose,
  onConfirm,
}) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalWrapper onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>배송목록 선택</Title>
          <CloseBtn onClick={onClose}>×</CloseBtn>
        </Header>

        <Content>
          {addresses.length === 0 ? (
            <EmptyText>저장된 배송지가 없습니다.</EmptyText>
          ) : (
            addresses.map((addr, idx) => {
              const isSelected = selectedId === addr.id;
              return (
                <Block key={addr.id}>
                  <TitleSmall>
                    {addr.isDefault ? '배송지 (기본)' : `배송지 ${idx + 1}`}
                  </TitleSmall>
                  <ReadOnlyInput value={addr.address} readOnly />
                  <ReadOnlyInput value={addr.addressDetail} readOnly />
                  <ReadOnlyInput value={addr.deliveryMessage || ''} readOnly />
                  <RadioWrapper>
                    <RadioLabel>
                      <input
                        type='radio'
                        checked={isSelected}
                        onChange={() => onSelect(addr)}
                      />{' '}
                      선택
                    </RadioLabel>
                  </RadioWrapper>
                  {idx < addresses.length - 1 && <Separator />}
                </Block>
              );
            })
          )}
        </Content>

        <Footer>
          <ConfirmButton onClick={onConfirm}>선택 완료</ConfirmButton>
        </Footer>
      </ModalWrapper>
    </Overlay>
  );
};

export default DeliveryListModal;

/* Styled Components */
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9990;
`;

const ModalWrapper = styled.div`
  width: 80%;
  max-width: 600px;
  max-height: 80%;
  background: #fff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
`;

const Title = styled.h2`
  font-size: 16px;
  margin: 0;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
`;

const Footer = styled.div`
  position: sticky;
  bottom: 0;

  background: #fff;
  padding: 12px 20px;

  border-top: 1px solid #eee;
  display: flex;
  justify-content: center;
`;

const ConfirmButton = styled.button`
  width: 100%;
  height: 48px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
`;

const EmptyText = styled.p`
  text-align: center;
  color: #666;
`;

const Block = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const TitleSmall = styled.div`
  font-weight: 700;
  font-size: 12px;
  color: #000;
`;

const ReadOnlyInput = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 12px;
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  box-sizing: border-box;
`;

const RadioWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const RadioLabel = styled.label`
  font-size: 14px;
  cursor: pointer;
  input {
    margin-right: 4px;
  }
`;

const Separator = styled.div`
  height: 1px;
  background: #eee;
  margin: 16px 0;
`;
