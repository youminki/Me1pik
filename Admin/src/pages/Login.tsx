import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import styled, { keyframes } from 'styled-components';
import InputField from '@components/InputField';
import { schemaLogin } from 'src/hooks/ValidationYup';
import { adminLogin } from '@api/adminAuth';
import Cookies from 'js-cookie';
import MelpikLogo from '@/assets/LoginLogo.svg';

type LoginFormInputs = {
  email: string;
  password: string;
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(schemaLogin),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      setErrorMessage(''); // 에러 메시지 초기화

      const response = await adminLogin({
        id: data.email,
        password: data.password,
      });

      Cookies.set('accessToken', response.accessToken, { secure: true });
      Cookies.set('refreshToken', response.refreshToken, { secure: true });

      navigate('/adminlist');
    } catch (error: any) {
      // 로그인 실패 시 에러 메시지 설정
      setErrorMessage(
        error?.response?.data?.message || '아이디 또는 비밀번호가 올바르지 않습니다.',
      );
    }
  };

  return (
    <Container>
      <LoginContainer>
        <Header>
          <LogoContainer>
            <LogoImage src={MelpikLogo} alt="Melpik Logo" />
            <LogoSubText>ADMIN SYSTEM</LogoSubText>
          </LogoContainer>
          <Title>관리자 로그인</Title>
          <Subtitle>시스템에 접속하려면 로그인해주세요</Subtitle>
        </Header>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <InputField
                label="아이디"
                id="email"
                type="text"
                placeholder="관리자 아이디를 입력하세요"
                error={errors.email}
                {...field}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <InputField
                label="비밀번호"
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                error={errors.password}
                {...field}
              />
            )}
          />

          {/* 서버 에러 메시지 표시 */}
          {errorMessage && (
            <ErrorMessageContainer>
              <ErrorMessage>{errorMessage}</ErrorMessage>
            </ErrorMessageContainer>
          )}

          <ButtonRow>
            <LoginButton type="submit">로그인</LoginButton>
          </ButtonRow>
        </Form>
        <Footer>
          <FooterText>© 2024 Melpik Admin System. All rights reserved.</FooterText>
        </Footer>
      </LoginContainer>
    </Container>
  );
};

export default Login;

/* ===== Styled Components ===== */

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const LoginContainer = styled.div`
  background: #ffffff;
  padding: 48px 40px;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  animation: ${fadeIn} 0.6s ease-out;
  border: 1px solid #e1e5e9;
`;

const Header = styled.div`
  margin-bottom: 40px;
  text-align: center;
`;

const LogoContainer = styled.div`
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LogoImage = styled.img`
  width: 158px;
  height: 69px;
  margin-bottom: 12px;
`;

const LogoSubText = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
  letter-spacing: 1px;
`;

const Title = styled.h1`
  margin: 0 0 8px 0;
  font-weight: 700;
  font-size: 24px;
  line-height: 32px;
  color: #000000;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: #6c757d;
  font-weight: 400;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ErrorMessageContainer = styled.div`
  margin-top: 8px;
  padding: 12px 16px;
  background-color: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 6px;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
`;

const ButtonRow = styled.div`
  margin-top: 8px;
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #f6ae24 0%, #e59c20 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(246, 174, 36, 0.3);

  &:hover {
    background: linear-gradient(135deg, #e59c20 0%, #cc8c1c 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(246, 174, 36, 0.4);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(246, 174, 36, 0.3);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(246, 174, 36, 0.2);
  }
`;

const Footer = styled.div`
  margin-top: 32px;
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #e1e5e9;
`;

const FooterText = styled.p`
  margin: 0;
  font-size: 12px;
  color: #6c757d;
  font-weight: 400;
`;
