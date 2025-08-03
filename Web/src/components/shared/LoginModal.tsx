import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import ReusableModal from './modals/ReusableModal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  message = '로그인이 필요한 서비스입니다.',
}) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title='🔐 로그인 필요'
      width='400px'
      actions={
        <ModalActions>
          <CancelButton onClick={onClose}>취소</CancelButton>
          <LoginButton onClick={handleLogin}>로그인하기</LoginButton>
        </ModalActions>
      }
    >
      <ModalContent>
        <Message>{message}</Message>
        <Description>
          이 기능을 사용하려면 로그인이 필요합니다. 로그인 후 다시 시도해주세요.
        </Description>
      </ModalContent>
    </ReusableModal>
  );
};

export default LoginModal;

// Styled Components
const ModalContent = styled.div`
  padding: 20px 0;
`;

const Message = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  text-align: center;
`;

const Description = styled.div`
  font-size: 0.95rem;
  color: #666;
  line-height: 1.5;
  text-align: center;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
`;

const Button = styled.button`
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
`;

const CancelButton = styled(Button)`
  background-color: #f8f9fa;
  color: #666;
  border: 1px solid #e9ecef;

  &:hover {
    background-color: #e9ecef;
    color: #495057;
  }
`;

const LoginButton = styled(Button)`
  background-color: #f7c600;
  color: #333;

  &:hover {
    background-color: #e6b800;
  }
`;
