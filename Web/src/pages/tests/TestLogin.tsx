import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { LoginPost } from '@/api-utils/user-managements/auth/LoginPost';
import { getMembershipInfo } from '@/api-utils/user-managements/users/userApi';
import MelpikLogo from '@/assets/LoginLogo.svg';
import LoginButton from '@/components/shared/buttons/PrimaryButton';
import InputField from '@/components/shared/forms/InputField';
import ReusableModal from '@/components/shared/modals/ReusableModal';
import { saveTokens } from '@/utils/auth';

interface LoginFormValues {
  email: string;
  password: string;
}

const TestLogin: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [enableLongTermPersistence, setEnableLongTermPersistence] =
    useState(true);

  const [formData, setFormData] = useState<LoginFormValues>({
    email: '',
    password: '',
  });

  const handleModalClose = () => setIsModalOpen(false);

  const handleInputChange = (field: keyof LoginFormValues, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 30일 지속성 보장을 위한 토큰 저장 함수
  const saveTokensForLongTermPersistence = (
    accessToken: string,
    refreshToken: string,
    email: string
  ) => {
    // 1. 모든 저장소에 토큰 저장 (지속성 보장)
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userEmail', email);

    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);

    // 2. 쿠키에 토큰 저장 (브라우저 재시작 시에도 유지)
    document.cookie = `accessToken=${accessToken}; path=/; max-age=${30 * 24 * 60 * 60}`; // 30일
    document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}`; // 30일

    // 3. 자동 로그인 설정 (30일 지속성 보장)
    if (enableLongTermPersistence) {
      localStorage.setItem('autoLogin', 'true');
    }

    // 4. 사용자 정보 저장
    localStorage.setItem('userEmail', email);
    localStorage.setItem('loginTimestamp', Date.now().toString());

    console.log('🔐 30일 지속성 토큰 저장 완료:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      autoLogin: enableLongTermPersistence,
      timestamp: new Date().toLocaleString(),
    });
  };

  const handleLoginClick = async () => {
    // 이메일 검증 (테스트용으로 완화)
    if (!formData.email) {
      setModalMessage('이메일을 입력해주세요.');
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

      // 2) 30일 지속성을 위한 토큰 저장
      saveTokensForLongTermPersistence(
        accessToken,
        refreshToken,
        formData.email
      );

      // 3) 표준 토큰 저장 함수도 호출 (기존 로직과 호환성)
      saveTokens(accessToken, refreshToken);

      // 4) 멤버십 정보 조회
      const membership = await getMembershipInfo();

      // 5) 30일 지속성 설정 확인
      const persistenceStatus = {
        localStorage: !!localStorage.getItem('accessToken'),
        sessionStorage: !!sessionStorage.getItem('accessToken'),
        cookies: !!document.cookie.includes('accessToken'),
        autoLogin: localStorage.getItem('autoLogin') === 'true',
      };

      console.log('✅ 30일 지속성 설정 완료:', persistenceStatus);

      // 6) 테스트 대시보드로 이동
      navigate('/test-dashboard', {
        replace: true,
        state: {
          showNotice: true,
          membership,
          longTermPersistence: enableLongTermPersistence,
          persistenceStatus,
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
      <LoginCard>
        <LogoSection>
          <Logo src={MelpikLogo} alt='멜픽 로고' />
          <Title>🧪 테스트 로그인</Title>
          <Subtitle>개발자 전용 테스트 페이지</Subtitle>
        </LogoSection>

        <FormSection>
          <FormTitle>테스트 계정 정보</FormTitle>
          <FormDescription>테스트용 계정으로 로그인하세요</FormDescription>

          <LoginForm>
            <InputFieldRow>
              <InputField
                label='이메일'
                type='email'
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder='이메일을 입력하세요'
                autoComplete='email'
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

            <PersistenceSection>
              <PersistenceCheckbox
                type='checkbox'
                id='longTermPersistence'
                checked={enableLongTermPersistence}
                onChange={(e) => setEnableLongTermPersistence(e.target.checked)}
              />
              <PersistenceLabel htmlFor='longTermPersistence'>
                🔐 30일 지속성 보장 (자동 로그인 + 다중 저장소)
              </PersistenceLabel>
              <PersistenceDescription>
                체크하면 30일간 로그인 상태가 유지됩니다
              </PersistenceDescription>
            </PersistenceSection>

            <LoginButton
              onClick={handleLoginClick}
              disabled={!formData.email || !formData.password || isLoading}
            >
              {isLoading ? '로그인 중...' : '테스트 페이지 접속'}
            </LoginButton>
          </LoginForm>
        </FormSection>

        <BackSection>
          <BackLink onClick={() => navigate('/login')}>
            ← 일반 로그인으로 돌아가기
          </BackLink>
        </BackSection>
      </LoginCard>

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
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 480px;
  overflow: hidden;
`;

const LogoSection = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 30px;
  text-align: center;
`;

const Logo = styled.img`
  width: 100px;
  margin-bottom: 20px;
  filter: brightness(0) invert(1);
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: white;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
`;

const FormSection = styled.div`
  padding: 40px 30px;
`;

const FormTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const FormDescription = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 30px;
`;

const LoginForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InputFieldRow = styled.div`
  width: 100%;
`;

const PersistenceSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
  margin-bottom: 20px;
  color: #555;
  font-size: 0.85rem;
`;

const PersistenceCheckbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #667eea;
`;

const PersistenceLabel = styled.label`
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
`;

const PersistenceDescription = styled.span`
  font-size: 0.75rem;
  color: #888;
`;

const BackSection = styled.div`
  padding: 20px 30px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
`;

const BackLink = styled.a`
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #5a6fd8;
    text-decoration: underline;
  }
`;
