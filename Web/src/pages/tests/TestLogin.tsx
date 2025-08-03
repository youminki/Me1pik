import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { LoginPost } from '@/api-utils/user-managements/auth/LoginPost';
import { getMembershipInfo } from '@/api-utils/user-managements/users/userApi';
import MelpikLogo from '@/assets/LoginLogo.svg';
import LoginButton from '@/components/shared/buttons/PrimaryButton';
import InputField from '@/components/shared/forms/InputField';
import ReusableModal from '@/components/shared/modals/ReusableModal';

interface LoginFormValues {
  email: string;
  password: string;
}

const TestLogin: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<LoginFormValues>({
    email: 'dbalsrl7648@naver.com',
    password: '',
  });

  const handleModalClose = () => setIsModalOpen(false);

  const handleInputChange = (field: keyof LoginFormValues, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLoginClick = async () => {
    // 이메일 검증
    if (formData.email !== 'dbalsrl7648@naver.com') {
      setModalMessage('테스트 페이지는 특정 계정으로만 접근 가능합니다.');
      setIsModalOpen(true);
      return;
    }

    if (!formData.password) {
      setModalMessage('비밀번호를 입력해주세요.');
      setIsModalOpen(true);
      return;
    }

    setIsLoading(true);

    try {
      // 1) 로그인 요청
      const response = await LoginPost(formData.email, formData.password);
      const { accessToken, refreshToken } = response;

      // 2) 토큰 로컬 저장
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userEmail', formData.email);

      // 3) 멤버십 정보 조회
      const membership = await getMembershipInfo();

      // 4) 테스트 대시보드로 이동
      navigate('/test-dashboard', {
        replace: true,
        state: {
          showNotice: true,
          membership,
        },
      });
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? (error as { message: string }).message
          : '로그인 실패. 다시 시도해주세요.';
      setModalMessage(errorMessage);
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <LoginContainer>
        <Logo src={MelpikLogo} alt='멜픽 로고' />
        
        <Title>🧪 테스트 로그인</Title>
        <Subtitle>dbalsrl7648@naver.com 계정으로만 접근 가능합니다</Subtitle>

        <LoginForm>
          <InputFieldRow>
            <InputField
              label='이메일'
              type='email'
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder='dbalsrl7648@naver.com'
              disabled={true}
            />
          </InputFieldRow>
          
          <InputFieldRow>
            <InputField
              label='비밀번호'
              type='password'
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder='비밀번호를 입력하세요'
              autoComplete='current-password'
            />
          </InputFieldRow>

          <LoginButton 
            onClick={handleLoginClick} 
            disabled={!formData.password || isLoading}
          >
            {isLoading ? '로그인 중...' : '테스트 페이지 접속'}
          </LoginButton>
        </LoginForm>

        <BackLink onClick={() => navigate('/login')}>
          ← 일반 로그인으로 돌아가기
        </BackLink>
      </LoginContainer>

      <ReusableModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title='로그인 실패'
      >
        {modalMessage}
      </ReusableModal>
    </Container>
  );
};

export default TestLogin;

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const LoginContainer = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Logo = styled.img`
  width: 120px;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 30px;
`;

const LoginForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
`;

const InputFieldRow = styled.div`
  width: 100%;
`;

const BackLink = styled.a`
  color: #3498db;
  text-decoration: none;
  font-size: 0.9rem;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`; 