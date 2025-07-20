// src/components/myinfos/ChangeRefundAccountModal.tsx
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';

interface ChangeRefundAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangeRefundAccountModal: React.FC<ChangeRefundAccountModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  const handleBankNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setBankName(e.target.value);
  };
  const handleAccountNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAccountNumber(e.target.value);
  };
  const handleAccountHolderChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAccountHolder(e.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log({ bankName, accountNumber, accountHolder });
    onClose();
    setBankName('');
    setAccountNumber('');
    setAccountHolder('');
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
          <Title>환불 계좌정보 변경</Title>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </Header>
        <Body>
          <FormContainer onSubmit={handleSubmit}>
            <Label htmlFor='ra-bank'>은행명</Label>
            <Input
              id='ra-bank'
              type='text'
              value={bankName}
              onChange={handleBankNameChange}
              placeholder='은행명을 입력하세요'
              required
            />

            <Label htmlFor='ra-account-number'>계좌번호</Label>
            <Input
              id='ra-account-number'
              type='text'
              value={accountNumber}
              onChange={handleAccountNumberChange}
              placeholder='계좌번호를 입력하세요'
              required
            />

            <Label htmlFor='ra-holder'>예금주</Label>
            <Input
              id='ra-holder'
              type='text'
              value={accountHolder}
              onChange={handleAccountHolderChange}
              placeholder='예금주명을 입력하세요'
              required
            />

            <Divider />

            <SubmitBtn type='submit'>계좌정보 저장</SubmitBtn>
          </FormContainer>
        </Body>
      </ModalWrapper>
    </Overlay>
  );
};

export default ChangeRefundAccountModal;

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
  padding: 16px;
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 700;
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
  margin: 24px 0 0 0;
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
