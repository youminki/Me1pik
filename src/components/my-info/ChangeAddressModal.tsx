// src/components/ChangeAddressModal.tsx
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import styled from 'styled-components';

interface ChangeAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangeAddressModal: React.FC<ChangeAddressModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [addressName, setAddressName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [detailAddress, setDetailAddress] = useState('');

  const handleAddressNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAddressName(e.target.value);
  };
  const handlePostalCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPostalCode(e.target.value);
  };
  const handleDetailAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDetailAddress(e.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log({ addressName, postalCode, detailAddress });
    onClose();
    setAddressName('');
    setPostalCode('');
    setDetailAddress('');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalWrapper onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>배송지 관리</Title>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </Header>
        <Body>
          <FormContainer onSubmit={handleSubmit}>
            <Label htmlFor='addr-name'>배송지명</Label>
            <Input
              id='addr-name'
              type='text'
              value={addressName}
              onChange={handleAddressNameChange}
              placeholder='배송지명을 입력하세요'
              required
            />

            <Label htmlFor='addr-postal'>우편번호</Label>
            <Input
              id='addr-postal'
              type='text'
              value={postalCode}
              onChange={handlePostalCodeChange}
              placeholder='우편번호를 입력하세요'
              required
            />

            <Label htmlFor='addr-detail'>상세주소</Label>
            <Input
              id='addr-detail'
              type='text'
              value={detailAddress}
              onChange={handleDetailAddressChange}
              placeholder='상세주소를 입력하세요'
              required
            />

            <Divider />

            <SubmitBtn type='submit'>주소 저장</SubmitBtn>
          </FormContainer>
        </Body>
      </ModalWrapper>
    </Overlay>
  );
};

export default ChangeAddressModal;

/* ───────────────────────── Styled Components ───────────────────────── */

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalWrapper = styled.div`
  width: 100%;
  max-width: 300px;
  background: #fff;

  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
`;

const Header = styled.div`
  position: relative;
  padding: 12px 16px;
  background-color: #fffcfc;
  border-bottom: 1px solid #000;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #000;
  text-align: center;
`;

const CloseButton = styled.button`
  position: absolute;
  right: 16px;
  background: transparent;
  border: none;
  color: #000;
  cursor: pointer;
  padding: 0;
  font-size: 20px;
  line-height: 1;
`;

const Body = styled.div`
  padding: 1rem;
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 700;
  margin-top: 12px;
  margin-bottom: 4px;
  color: #333;
`;

const Input = styled.input`
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #000;
  outline: none;

  &:focus {
    border-color: #f6ae24;
  }
`;

const Divider = styled.div`
  margin: 50px 0 0 0;
  border-top: 1px solid #ccc;
`;

const SubmitBtn = styled.button`
  margin-top: 12px;
  width: 100%;
  padding: 12px 0;
  background: #000;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background: #dfa11d;
  }
`;
