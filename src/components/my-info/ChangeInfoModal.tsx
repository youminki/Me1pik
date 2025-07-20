// src/components/ChangeInfoModal.tsx
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';

interface ChangeInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangeInfoModal: React.FC<ChangeInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [phone, setPhone] = useState('');
  const [serviceArea, setServiceArea] = useState('');

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };
  const handleBirthDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setBirthDate(e.target.value);
  };
  const handleGenderChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as 'male' | 'female' | 'other';
    setGender(val);
  };
  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
  };
  const handleServiceAreaChange = (e: ChangeEvent<HTMLInputElement>) => {
    setServiceArea(e.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log({ name, birthDate, gender, phone, serviceArea });
    onClose();
    setName('');
    setBirthDate('');
    setGender('male');
    setPhone('');
    setServiceArea('');
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
          <Title>회원정보 변경</Title>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </Header>
        <Body>
          <FormContainer onSubmit={handleSubmit}>
            <Label htmlFor='info-name'>이름</Label>
            <Input
              id='info-name'
              type='text'
              value={name}
              onChange={handleNameChange}
              placeholder='이름을 입력하세요'
              required
            />

            <Label htmlFor='info-birth'>생년월일</Label>
            <Input
              id='info-birth'
              type='date'
              value={birthDate}
              onChange={handleBirthDateChange}
              required
            />

            <Label htmlFor='info-gender'>성별</Label>
            <Select
              id='info-gender'
              value={gender}
              onChange={handleGenderChange}
            >
              <option value='male'>남성</option>
              <option value='female'>여성</option>
              <option value='other'>기타</option>
            </Select>

            <Label htmlFor='info-phone'>휴대전화</Label>
            <Input
              id='info-phone'
              type='tel'
              value={phone}
              onChange={handlePhoneChange}
              placeholder='휴대전화 번호를 입력하세요'
              required
            />

            <Label htmlFor='info-area'>서비스 지역</Label>
            <Input
              id='info-area'
              type='text'
              value={serviceArea}
              onChange={handleServiceAreaChange}
              placeholder='서비스 지역을 입력하세요'
              required
            />

            <Divider />

            <SubmitBtn type='submit'>정보 저장</SubmitBtn>
          </FormContainer>
        </Body>
      </ModalWrapper>
    </Overlay>
  );
};

export default ChangeInfoModal;

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

const Select = styled.select`
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
