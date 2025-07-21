import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { LoginPost } from '../../api-utils/user-managements/auth/LoginPost';
import {
  getMembershipInfo,
  MembershipInfo,
} from '../../api-utils/user-managements/users/userApi';
import MelpikLogo from '../../assets/LoginLogo.svg';
import LoginButton from '../../components/shared/buttons/PrimaryButton';
import InputField from '../../components/shared/forms/InputField';
import ReusableModal from '../../components/shared/modals/ReusableModal';
import { schemaLogin } from '../../hooks/useValidationYup';

interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(schemaLogin),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  const handleModalClose = () => setIsModalOpen(false);

  const handleLoginClick = async (data: LoginFormValues) => {
    try {
      // 1) 로그인 요청
      const response = (await LoginPost(
        data.email,
        data.password
      )) as LoginResponse;
      const { accessToken, refreshToken } = response;

      // 2) 토큰 로컬 저장
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // 3) 멤버십 정보 조회
      const membership: MembershipInfo = await getMembershipInfo();

      navigate('/home', {
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
    }
  };

  return (
    <Container>
      <LoginContainer>
        <Logo src={MelpikLogo} alt='멜픽 로고' />

        {/* ... 로고 아래 설명 영역 생략 ... */}

        <LoginForm onSubmit={handleSubmit(handleLoginClick)}>
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
        title='로그인 실패'
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
