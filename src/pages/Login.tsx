// src/page/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Theme from '../styles/Theme';
import { LoginPost } from '../api/auth/LoginPost';
import { getMembershipInfo, MembershipInfo } from '../api/user/userApi';
import MelpikLogo from '../assets/LoginLogo.svg';
import { schemaLogin } from '../hooks/ValidationYup';
import ReusableModal from '../components/ReusableModal';
import { isNativeApp, saveNativeLoginInfo } from '../utils/nativeApp';
import DeleteIcon from '../assets/DeleteButtonIcon.svg';

import { saveTokens } from '../utils/auth';

type LoginFormValues = {
  email: string;
  password: string;
};

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

// 네이버 스타일 X(전체삭제) 아이콘
const NaverDeleteIcon = () => (
  <svg width='20' height='20' viewBox='0 0 20 20'>
    <g fill='none' fillRule='evenodd'>
      <circle fill='#000' cx='10' cy='10' r='10' />
      <path
        stroke='#FFF'
        strokeWidth='1.5'
        strokeLinecap='round'
        d='M7.5 7.5l5 5m0-5l-5 5'
      />
    </g>
  </svg>
);
// 네이버 스타일 눈(보기) 아이콘
const NaverEyeOpenIcon = () => (
  <svg width='20' height='20' viewBox='0 0 20 20'>
    <g fill='none' fillRule='evenodd'>
      <path
        d='M1.667 10c1.667-3.333 5-6.667 8.333-6.667S16.667 6.667 18.333 10c-1.667 3.333-5 6.667-8.333 6.667S3.333 13.333 1.667 10z'
        stroke='#000'
        strokeWidth='1.5'
      />
      <circle cx='10' cy='10' r='3' stroke='#000' strokeWidth='1.5' />
    </g>
  </svg>
);
// 네이버 스타일 눈감김(숨김) 아이콘
const NaverEyeCloseIcon = () => (
  <svg width='20' height='20' viewBox='0 0 20 20'>
    <g fill='none' fillRule='evenodd'>
      <path
        d='M1.667 10c1.667-3.333 5-6.667 8.333-6.667S16.667 6.667 18.333 10c-1.667 3.333-5 6.667-8.333 6.667S3.333 13.333 1.667 10z'
        stroke='#000'
        strokeWidth='1.5'
      />
      <circle cx='10' cy='10' r='3' stroke='#000' strokeWidth='1.5' />
      <path
        stroke='#000'
        strokeWidth='1.5'
        strokeLinecap='round'
        d='M4 16L16 4'
      />
    </g>
  </svg>
);

const NaverLoginBg = styled.div`
  min-height: 100vh;
  background: #f5f6f7;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NaverLoginBox = styled.div`
  background: #fff;
  border-radius: 12px;
  border: 1.5px solid #e3e5e8;
  width: 100%;
  max-width: 400px;
  padding: 48px 32px 32px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LogoWrap = styled.div`
  margin-bottom: 24px;
`;

const LogoImg = styled.img`
  width: 184px;
  height: 83px;
`;

const Slogan = styled.div`
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: #222;
  margin-bottom: 18px;
  line-height: 1.5;
`;

const SloganSub = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: #888;
  margin-top: 4px;
`;

const FormSection = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InputLabel = styled.label`
  font-size: 14px;
  color: #222;
  font-weight: 700;
  margin-bottom: 4px;
`;

const StyledInput = styled.input`
  width: 100%;
  height: 48px;
  border: 1.5px solid #dadada;
  border-radius: 6px;
  font-size: 16px;
  padding: 0 44px 0 12px;
  background: #fafbfb;
  box-sizing: border-box;
  &:focus {
    border-color: #03c75a;
    background: #fff;
    outline: none;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4d4f;
  font-size: 13px;
  margin-top: 2px;
  margin-bottom: 2px;
`;

const LoginBtn = styled.button`
  width: 100%;
  height: 52px;
  background: #03c75a;
  color: #fff;
  font-size: 18px;
  font-weight: 800;
  border: none;
  border-radius: 6px;
  margin-top: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background 0.2s;
  &:hover:enabled {
    background: #02b152;
  }
  &:disabled {
    background: #b2e2c6;
    cursor: not-allowed;
  }
`;

const LinksWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  width: 100%;
  margin-top: 18px;
`;

const LinkBtn = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 0 8px;
  &:hover {
    color: #03c75a;
    text-decoration: underline;
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 16px;
  background: #e5e5e5;
`;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const {
    handleSubmit,
    formState: { isValid, isSubmitting, errors },
    setValue,
  } = useForm<LoginFormValues>({
    resolver: yupResolver(schemaLogin),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  const handleModalClose = () => setIsModalOpen(false);

  const handleLoginClick = async (data: LoginFormValues) => {
    try {
      console.log('로그인 시도:', data.email);
      const response = (await LoginPost(
        data.email,
        data.password
      )) as LoginResponse;
      const { accessToken, refreshToken } = response;
      console.log('로그인 성공, 토큰 저장');
      saveTokens(accessToken, refreshToken);
      if (isNativeApp()) {
        console.log('네이티브 앱에 로그인 정보 전달');
        saveNativeLoginInfo({
          id: data.email, // 또는 서버에서 받은 user id
          email: data.email,
          name: '', // 필요하다면 서버에서 받은 이름
          token: accessToken,
          refreshToken: refreshToken,
          expiresAt: new Date(
            Date.now() + 1000 * 60 * 60 * 24 * 7
          ).toISOString(), // 예시: 7일 뒤 만료
        });
      }
      const membership: MembershipInfo = await getMembershipInfo();
      console.log('홈으로 이동');
      navigate('/home', {
        replace: true,
        state: {
          showNotice: true,
          membership,
        },
      });
    } catch (error: unknown) {
      console.log('로그인 실패:', error);
      setModalMessage(
        error instanceof Error
          ? error.message
          : '로그인 실패. 다시 시도해주세요.'
      );
      setIsModalOpen(true);
    }
  };

  // 입력값 동기화
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setValue('email', e.target.value, { shouldValidate: true });
  };
  const handlePwChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setValue('password', e.target.value, { shouldValidate: true });
  };

  return (
    <ThemeProvider theme={Theme}>
      <NaverLoginBg>
        <NaverLoginBox>
          <LogoWrap>
            <LogoImg src={MelpikLogo} alt='멜픽 로고' />
          </LogoWrap>
          <Slogan>
            이젠 <span style={{ color: '#F6AE24' }}>멜픽</span>을 통해
            <br />
            브랜드를 골라보세요
            <br />
            <SloganSub>사고, 팔고, 빌리는 것을 한번에!</SloganSub>
          </Slogan>
          <FormSection onSubmit={handleSubmit(handleLoginClick)}>
            <InputLabel htmlFor='email'>아이디</InputLabel>
            <InputWrap>
              <StyledInput
                id='email'
                type='text'
                placeholder='아이디(이메일)'
                value={email}
                onChange={handleEmailChange}
              />
              {email && (
                <InputIconBtn
                  type='button'
                  onClick={() => {
                    setEmail('');
                    setValue('email', '', { shouldValidate: true });
                  }}
                >
                  <NaverDeleteIcon />
                </InputIconBtn>
              )}
            </InputWrap>
            {errors.email && (
              <ErrorMessage>{errors.email.message}</ErrorMessage>
            )}

            <InputLabel htmlFor='password'>비밀번호</InputLabel>
            <InputWrap>
              <StyledInput
                id='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='비밀번호'
                value={password}
                onChange={handlePwChange}
              />
              {password && (
                <InputIconBtn
                  type='button'
                  onClick={() => {
                    setPassword('');
                    setValue('password', '', { shouldValidate: true });
                  }}
                >
                  <NaverDeleteIcon />
                </InputIconBtn>
              )}
              {password && (
                <InputIconBtn
                  type='button'
                  onClick={() => setShowPassword((v) => !v)}
                  style={{ right: email ? 44 : 12 }}
                >
                  {showPassword ? <NaverEyeOpenIcon /> : <NaverEyeCloseIcon />}
                </InputIconBtn>
              )}
            </InputWrap>
            {errors.password && (
              <ErrorMessage>{errors.password.message}</ErrorMessage>
            )}

            <LoginBtn type='submit' disabled={!isValid || isSubmitting}>
              {isSubmitting ? '로그인 중...' : '로그인'}
            </LoginBtn>
          </FormSection>
          <LinksWrap>
            <LinkBtn onClick={() => navigate('/findid')}>아이디 찾기</LinkBtn>
            <Divider />
            <LinkBtn onClick={() => navigate('/findPassword')}>
              비밀번호 찾기
            </LinkBtn>
            <Divider />
            <LinkBtn onClick={() => navigate('/signup')}>회원가입</LinkBtn>
          </LinksWrap>
        </NaverLoginBox>
        <ReusableModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          title='로그인 실패'
        >
          {modalMessage}
        </ReusableModal>
      </NaverLoginBg>
    </ThemeProvider>
  );
};

export default Login;

// --- styled-components (display 기반) ---
const Container = styled.div`
  min-height: 100vh;
  margin: 0 auto;
  padding: 1rem;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  max-width: 600px;
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  margin-top: 15vh;
`;

const Logo = styled.img`
  width: 184px;
  height: 83px;
  margin-bottom: 21px;
`;

const BottomLinks = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 32px;
`;

const LeftLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const RightLink = styled.div`
  display: flex;
  align-items: center;
`;

const Link = styled.a`
  font-weight: 800;
  font-size: 12px;
  color: #000;
  text-decoration: none;
  cursor: pointer;
`;

const InputWrap = styled.div<{ focus?: boolean }>`
  width: 100%;
  margin-bottom: 18px;
  position: relative;
  display: flex;
  align-items: center;
  border: 1.5px solid ${({ focus }) => (focus ? '#03c75a' : '#dadada')};
  border-radius: 6px;
  background: #fafbfb;
  transition: border 0.2s;
`;

const InputIconBtn = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`;
