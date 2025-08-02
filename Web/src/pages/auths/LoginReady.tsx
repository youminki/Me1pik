import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import MelpikLogo from '@/assets/LoginLogo.svg';
import LoginButton from '@/components/shared/buttons/PrimaryButton';
import InputField from '@/components/shared/forms/InputField';
import ReusableModal from '@/components/shared/modals/ReusableModal';
import { schemaLogin } from '@/hooks/useValidationYup';

/**
 * 로그인 준비 페이지 컴포넌트 (LoginReady.tsx)
 *
 * 현재 점검 중인 로그인 페이지를 제공합니다.
 * 실제 로그인 기능은 비활성화되어 있고, 점검 중 메시지를 표시합니다.
 * 폼 유효성 검사와 접근성 기능은 그대로 유지되어 개발 및 테스트 목적으로 사용됩니다.
 *
 * @description
 * - 점검 중 메시지 표시
 * - 폼 유효성 검사 유지
 * - 접근성 기능 유지
 * - 개발/테스트 목적
 */

/**
 * 로그인 폼 데이터 인터페이스
 *
 * 로그인 폼에서 사용되는 데이터 구조를 정의합니다.
 * React Hook Form과 연동하여 타입 안전성을 보장합니다.
 */
interface LoginFormValues {
  email: string; // 사용자 이메일
  password: string; // 비밀번호
}

/**
 * 로그인 준비 페이지 컴포넌트
 *
 * 점검 중인 로그인 페이지를 렌더링하는 메인 컴포넌트입니다.
 * 폼 유효성 검사와 접근성 기능을 포함하며, 점검 중 메시지를 표시합니다.
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // React Hook Form 설정
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(schemaLogin),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  /**
   * 모달 닫기 핸들러
   *
   * 점검 중 메시지를 표시하는 모달을 닫는 함수입니다.
   */
  const handleModalClose = () => setIsModalOpen(false);

  /**
   * 로그인 클릭 핸들러
   *
   * 현재는 점검 중이므로 실제 로그인 대신 점검 중 메시지를 표시합니다.
   * 개발 및 테스트 목적으로 사용되며, 실제 인증 로직은 비활성화되어 있습니다.
   */
  const handleLoginClick = () => {
    setModalMessage('지금은 점검중입니다.');
    setIsModalOpen(true);
  };

  return (
    <Container>
      <LoginContainer>
        <Logo src={MelpikLogo} alt='멜픽 로고' />

        <LoginForm onSubmit={handleSubmit(() => handleLoginClick())}>
          {/* 접근성을 위한 숨겨진 사용자명 필드 */}
          <input
            type='text'
            name='username'
            autoComplete='username'
            style={{ display: 'none' }}
            aria-hidden='true'
          />

          <InputFieldRow>
            <Controller
              control={control}
              name='email'
              render={({ field, fieldState: { error } }) => (
                <InputField
                  label='사용자 이메일'
                  type='text'
                  placeholder='이메일을 입력하세요'
                  error={error}
                  autoComplete='username'
                  {...field}
                />
              )}
            />
          </InputFieldRow>
          <InputFieldRow>
            <Controller
              control={control}
              name='password'
              render={({ field, fieldState: { error } }) => (
                <InputField
                  label='비밀번호'
                  type='password'
                  placeholder='비밀번호를 입력하세요'
                  error={error}
                  autoComplete='current-password'
                  {...field}
                />
              )}
            />
          </InputFieldRow>

          <LoginButton type='submit' disabled={!isValid || isSubmitting}>
            {isSubmitting ? '로그인 중...' : '로그인'}
          </LoginButton>
        </LoginForm>

        <ExtraLinks>
          <Link onClick={() => navigate('/findid')}>아이디 찾기</Link>
          <LinkSeparator>|</LinkSeparator>
          <Link onClick={() => navigate('/findpassword')}>비밀번호 찾기</Link>
          <LinkSeparator>|</LinkSeparator>
          <Link onClick={() => navigate('/signup')}>회원가입</Link>
        </ExtraLinks>
      </LoginContainer>

      <ReusableModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title='알림'
      >
        {modalMessage}
      </ReusableModal>
    </Container>
  );
};

export default Login;

// --- styled-components ---
const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  max-width: 600px;
  padding: 1rem;
`;
const LoginContainer = styled.div`
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;
const Logo = styled.img`
  width: 150px;
  margin: 50px 0 21px;
`;
const LoginForm = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const InputFieldRow = styled.div`
  width: 100%;
`;

const ExtraLinks = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  min-width: 264px;
  margin-top: 30px;
`;
const Link = styled.a`
  color: ${({ theme }) => theme.colors.black};
  padding: 5px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;
const LinkSeparator = styled.span`
  color: ${({ theme }) => theme.colors.gray2};
  font-size: 15px;
`;
