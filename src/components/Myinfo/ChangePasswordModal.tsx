// src/components/ChangePasswordModal.tsx
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  // 입력 상태 관리
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 입력값 핸들러
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };
  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
  };
  const handleNewPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };
  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  // 폼 제출 핸들러
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // 비밀번호 일치 여부 확인
    if (newPassword !== confirmPassword) {
      alert('새 비밀번호와 확인용 비밀번호가 일치하지 않습니다.');
      return;
    }

    // TODO: API 연동 로직 (이름, 전화번호, newPassword) 추가
    console.log({ name, phone, newPassword });

    // 제출 후 모달 닫고 입력 초기화
    onClose();
    setName('');
    setPhone('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Esc 키 누르면 모달 닫기
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
          <Title>비밀번호 변경</Title>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </Header>
        <Body>
          <FormContainer onSubmit={handleSubmit}>
            <Label htmlFor='cp-name'>이름</Label>
            <Input
              id='cp-name'
              type='text'
              value={name}
              onChange={handleNameChange}
              placeholder='이름을 입력하세요'
              required
            />

            <Label htmlFor='cp-phone'>전화번호</Label>
            <Input
              id='cp-phone'
              type='tel'
              value={phone}
              onChange={handlePhoneChange}
              placeholder='휴대전화 번호를 입력하세요'
              required
            />

            <Label htmlFor='cp-new-password'>새 비밀번호</Label>
            <Input
              id='cp-new-password'
              type='password'
              value={newPassword}
              onChange={handleNewPasswordChange}
              placeholder='새 비밀번호를 입력하세요'
              required
            />

            <Label htmlFor='cp-confirm-password'>새 비밀번호 확인</Label>
            <Input
              id='cp-confirm-password'
              type='password'
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder='비밀번호를 한 번 더 입력하세요'
              required
            />

            {/* Divider 추가: 버튼 위에 경계선 */}
            <Divider />

            <SubmitBtn type='submit'>비밀번호 재설정</SubmitBtn>
          </FormContainer>
        </Body>
      </ModalWrapper>
    </Overlay>
  );
};

export default ChangePasswordModal;

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
  /* 버튼 영역과 위쪽 필드를 분리하기 위한 여백 조절 */
  margin-bottom: 0;
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
  border: 1px solid #000000;

  outline: none;

  &:focus {
    border-color: #f6ae24;
  }
`;

/* 버튼 위에 검은색 경계선을 그어주는 Divider */
const Divider = styled.div`
  margin: 50px 0 0 0;
  border-top: 1px solid #ccc;
`;

/* 검은색 테두리를 버튼 위에 추가 */
const SubmitBtn = styled.button`
  margin-top: 12px;
  width: 100%;
  padding: 12px 0;
  background: #000000;
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
