import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import LoginButton from '../common-components/buttons/primary-button';
import InputField from '../common-components/forms/input-field';
import Theme from '../styles/Theme';
import MelpikLogo from '../assets/LoginLogo.svg';
import { schemaLogin } from '../hooks/ValidationYup';
import ReusableModal from '../common-components/modals/reusable-modal';

type LoginFormValues = {
  email: string;
  password: string;
};

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

  // 로그인 대신 점검중 메시지 표시
  const handleLoginClick = () => {
    setModalMessage('지금은 점검중입니다.');
    setIsModalOpen(true);
  };

  return (
    <ThemeProvider theme={Theme}>
      <Container>
        <LoginContainer>
          <Logo src={MelpikLogo} alt='멜픽 로고' />

          <LoginForm onSubmit={handleSubmit(() => handleLoginClick())}>
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
          title='알림'
        >
          {modalMessage}
        </ReusableModal>
      </Container>
    </ThemeProvider>
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
