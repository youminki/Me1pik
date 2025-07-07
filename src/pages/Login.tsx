// src/page/Login.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import {
  forceSaveAppToken,
  saveTokensWithKeepLogin,
  getKeepLoginSetting,
} from '../utils/auth';

type LoginFormValues = {
  email: string;
  password: string;
};

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

interface WebLoginSuccessData {
  token: string;
  refreshToken: string;
  email: string;
  userId: string;
  name: string;
  keepLogin: boolean;
}

interface WindowWithWebLogin extends Window {
  handleWebLoginSuccess?: (data: WebLoginSuccessData) => void;
}

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
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const NaverLoginBox = styled.div`
  background: #fff;
  border-radius: 12px;

  width: 100%;
  max-width: 400px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 64px;
`;

const FormSectionWrapper = styled.div`
  padding: 2rem;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 64px;
  margin-left: auto;
  margin-right: auto;
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
  font-size: 10px;
  color: #222;
  font-weight: 700;
  margin-bottom: 4px;
`;

const InputFieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
`;

const InputWrap = styled.div`
  position: relative;
  width: 100%;
`;

const InputIconBtn = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  z-index: 2;
`;

const StyledInput = styled.input<{ hasError?: boolean }>`
  width: 100%;
  height: 51px;
  border: 1.5px solid ${({ hasError }) => (hasError ? '#ff4d4f' : '#dadada')};

  font-size: 16px;
  padding: 0 44px 0 15px;
  background: #fafbfb;
  box-sizing: border-box;
  color: #222;
  transition:
    border 0.2s,
    background 0.2s;
  &:focus {
    border-color: ${({ hasError }) => (hasError ? '#ff4d4f' : '#F6AE24')};
    background: #fff;
    outline: none;
  }
  &::placeholder {
    color: #b0b8c1;
    font-size: 16px;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4d4f;
  font-size: 13px;
  margin-top: 2px;
  margin-bottom: 2px;
`;

const LoginBtn = styled.button<{ active?: boolean }>`
  width: 100%;
  height: 52px;
  background: ${({ active }) => (active ? '#222' : '#F6AE24')};
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
    background: ${({ active }) => (active ? '#111' : '#e09e1f')};
  }
  &:disabled {
    background: #f6ae24;
    cursor: not-allowed;
  }
`;

const LinksRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 18px;
`;

const LinksLeft = styled.div`
  display: flex;
  gap: 0;
`;

const LinksRight = styled.div`
  display: flex;
`;

const LinkBtn = styled.button`
  background: none;
  border: none;
  color: #000;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  padding: 0 8px;
  &:hover {
    color: #f6ae24;
    text-decoration: underline;
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 16px;
  background: #e5e5e5;
`;

// 로그인 상태 유지 관련 스타일 주석처리
const KeepLoginWrap = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;
const KeepLoginLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  color: #222;
  user-select: none;
`;
const KeepLoginCheckbox = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`;
const CustomCheckbox = styled.span<{ checked: boolean }>`
  width: 24px;
  height: 24px;
  border: 1.5px solid ${({ checked }) => (checked ? '#F6AE24' : '#ddd')};
  background: ${({ checked }) => (checked ? '#F6AE24' : '#fff')};
  margin-right: 8px;
  display: inline-block;
  position: relative;
  transition:
    border 0.2s,
    background 0.2s;
  box-sizing: border-box;
  cursor: pointer;
  // ${KeepLoginLabel}:hover & {
  //   border-color: #f6ae24;
  // }
  &:focus {
    outline: 2px solid #f6ae24;
    outline-offset: 2px;
  }
  &::after {
    content: '';
    display: ${({ checked }) => (checked ? 'block' : 'none')};
    position: absolute;
    left: 5px;
    top: 0px;
    width: 7px;
    height: 12px;
    border: solid #fff;
    border-width: 0 3px 3px 0;
    border-radius: 1px;
    transform: rotate(45deg);
  }
`;
const KeepLoginNotice = styled.div`
  font-size: 13px;
  color: #ff4d4f;
  margin-bottom: 8px;
  margin-left: 2px;
`;

const CapsLockNotice = styled.div`
  color: #ff4d4f;
  font-size: 13px;
  margin-top: 2px;
  margin-bottom: 2px;
`;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLogin, setKeepLogin] = useState(() => getKeepLoginSetting()); // 이전 설정 복원
  const [isCapsLock, setIsCapsLock] = useState(false);

  const {
    handleSubmit,
    formState: { isValid, isSubmitting, errors },
    setValue,
  } = useForm<LoginFormValues>({
    resolver: yupResolver(schemaLogin),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  // 네이티브 토큰 수신 이벤트 리스너만 등록 (자동로그인 제거)
  useEffect(() => {
    function handleNativeToken(e: CustomEvent) {
      const { accessToken, refreshToken, email, source } = e.detail || {};
      if (source === 'native' && accessToken) {
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
        }
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        if (email) {
          localStorage.setItem('userEmail', email);
        }
      }
    }
    window.addEventListener('nativeToken', handleNativeToken as EventListener);
    return () => {
      window.removeEventListener(
        'nativeToken',
        handleNativeToken as EventListener
      );
    };
  }, []);

  const handleModalClose = () => setIsModalOpen(false);

  // Caps Lock 감지
  const handlePwKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      setIsCapsLock(true);
    } else {
      setIsCapsLock(false);
    }
  };
  const handlePwBlur = () => setIsCapsLock(false);

  const handleLoginClick = async (data: LoginFormValues) => {
    try {
      console.log('로그인 시도:', data.email);
      const response = (await LoginPost(
        data.email,
        data.password
      )) as LoginResponse;
      const { accessToken, refreshToken } = response;
      console.log('로그인 성공, 토큰 저장');

      // 앱에서는 항상 localStorage에 저장 (영구 보관)
      if (isNativeApp()) {
        forceSaveAppToken(accessToken, refreshToken);
        console.log('앱에 토큰 영구 저장됨');
      } else {
        // 인스타그램 방식: 로그인 상태 유지 토큰 저장
        saveTokensWithKeepLogin(accessToken, refreshToken, keepLogin);
      }

      // 디버깅: 토큰 저장 상태 확인
      console.log('토큰 저장 상태 확인:');
      console.log(
        '- localStorage accessToken:',
        localStorage.getItem('accessToken') ? '있음' : '없음'
      );
      console.log(
        '- sessionStorage accessToken:',
        sessionStorage.getItem('accessToken') ? '있음' : '없음'
      );
      console.log(
        '- Cookies accessToken:',
        document.cookie.includes('accessToken') ? '있음' : '없음'
      );

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

      // 인스타그램 방식: 웹뷰 통신 스크립트 호출
      if ((window as WindowWithWebLogin).handleWebLoginSuccess) {
        (window as WindowWithWebLogin).handleWebLoginSuccess!({
          token: accessToken,
          refreshToken: refreshToken,
          email: data.email,
          userId: data.email, // 또는 서버에서 받은 user id
          name: '', // 필요하다면 서버에서 받은 이름
          keepLogin: keepLogin, // 인스타그램 방식 로그인 상태 유지 설정
        });
      }

      const membership: MembershipInfo = await getMembershipInfo();
      console.log('홈으로 이동');
      const redirectTo = location.state?.from || '/';
      navigate(redirectTo, {
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

  const handleEmailClear = () => {
    setEmail('');
    setValue('email', '', { shouldValidate: true });
  };

  const handlePwClear = () => {
    setPassword('');
    setValue('password', '', { shouldValidate: true });
  };

  const toggleShowPassword = () => {
    setShowPassword((v) => !v);
  };

  const handleKeepLoginChange = () => {
    setKeepLogin((prev) => !prev);
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
        </NaverLoginBox>
        <FormSectionWrapper>
          <FormSection onSubmit={handleSubmit(handleLoginClick)}>
            <InputLabel style={{ marginBottom: '8px' }}>로그인 계정</InputLabel>
            <InputFieldsContainer>
              <InputWrap>
                <StyledInput
                  id='email'
                  type='text'
                  placeholder='아이디(이메일)'
                  value={email}
                  onChange={handleEmailChange}
                  hasError={!!errors.email}
                  autoComplete='username'
                />
                {email && (
                  <InputIconBtn type='button' onClick={handleEmailClear}>
                    <NaverDeleteIcon />
                  </InputIconBtn>
                )}
              </InputWrap>
              {errors.email && (
                <ErrorMessage>{errors.email.message}</ErrorMessage>
              )}
              <InputWrap>
                <StyledInput
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='비밀번호'
                  value={password}
                  onChange={handlePwChange}
                  hasError={!!errors.password}
                  autoComplete='current-password'
                  onKeyDown={handlePwKeyDown}
                  onBlur={handlePwBlur}
                />
                {password && (
                  <InputIconBtn type='button' onClick={handlePwClear}>
                    <NaverDeleteIcon />
                  </InputIconBtn>
                )}
                {password && (
                  <InputIconBtn
                    style={{ right: '40px' }}
                    onClick={toggleShowPassword}
                    type='button'
                  >
                    {showPassword ? (
                      <NaverEyeOpenIcon />
                    ) : (
                      <NaverEyeCloseIcon />
                    )}
                  </InputIconBtn>
                )}
              </InputWrap>
              {isCapsLock && (
                <CapsLockNotice>Caps Lock이 켜져 있습니다.</CapsLockNotice>
              )}
              {errors.password && (
                <ErrorMessage>{errors.password.message}</ErrorMessage>
              )}
            </InputFieldsContainer>
            <KeepLoginWrap>
              <KeepLoginLabel htmlFor='keepLogin'>
                <KeepLoginCheckbox
                  type='checkbox'
                  checked={keepLogin}
                  onChange={handleKeepLoginChange}
                  id='keepLogin'
                  aria-label='로그인 상태 유지'
                />
                <CustomCheckbox checked={keepLogin} tabIndex={0} />
                <span>
                  로그인 상태 유지 <span style={{ color: '#aaa' }}>(선택)</span>
                </span>
              </KeepLoginLabel>
            </KeepLoginWrap>
            {keepLogin && (
              <KeepLoginNotice>
                공용 PC에서는 개인정보 보호를 위해 로그인 상태 유지를 사용하지
                마세요.
              </KeepLoginNotice>
            )}

            <LoginBtn
              type='submit'
              disabled={!isValid || isSubmitting}
              active={isValid && !isSubmitting}
            >
              {isSubmitting ? '로그인 중...' : '로그인'}
            </LoginBtn>
          </FormSection>
          <LinksRow>
            <LinksLeft>
              <LinkBtn onClick={() => navigate('/findid')}>아이디 찾기</LinkBtn>
              <Divider />
              <LinkBtn onClick={() => navigate('/findPassword')}>
                비밀번호 찾기
              </LinkBtn>
            </LinksLeft>
            <LinksRight>
              <LinkBtn onClick={() => navigate('/signup')}>
                회원가입 <span style={{ color: '#aaa' }}>(이메일)</span>
              </LinkBtn>
            </LinksRight>
          </LinksRow>
        </FormSectionWrapper>
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
