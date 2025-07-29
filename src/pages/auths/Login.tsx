// src/page/Login.tsx
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';

import { LoginPost } from '@/api-utils/user-managements/auth/LoginPost';
import {
  getMembershipInfo,
  MembershipInfo,
} from '@/api-utils/user-managements/users/userApi';
import MelpikLogo from '@/assets/LoginLogo.svg';
import {
  LoginContainer,
  LoginInfoBox,
  FormSectionWrapper,
  LogoWrap,
  LogoImg,
  Slogan,
  SloganSub,
  FormSection,
  InputLabel,
  InputFieldsContainer,
  InputWrap,
  InputIconBtn,
  StyledInput,
  ErrorMessage as InputErrorMessage,
} from '@/auth-utils/AuthCommon';
import ErrorMessage from '@/components/shared/ErrorMessage';
import { schemaLogin } from '@/hooks/useValidationYup';
import { theme } from '@/styles/Theme';
import { forceSaveAppToken } from '@/utils/auth';
import { isNativeApp } from '@/utils/nativeApp';

interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

// 네이버 스타일 X(전체삭제) 아이콘
const ClearIcon = () => (
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
const ShowPasswordIcon = () => (
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
const HidePasswordIcon = () => (
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

const LoginBtn = styled.button<{ $active?: boolean }>`
  width: 100%;
  height: 52px;
  background: ${({ $active }) => ($active ? '#222' : '#F6AE24')};
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
    background: ${({ $active }) => ($active ? '#111' : '#e09e1f')};
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
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLogin, setKeepLogin] = useState(false); // 로그인 상태 유지
  const [isCapsLock, setIsCapsLock] = useState(false);

  useEffect(() => {}, [errorMessage]);
  useEffect(() => {}, []);

  useEffect(() => {
    const handleForceLoginRedirect = () => {
      navigate('/login', { replace: true });
    };
    window.addEventListener('forceLoginRedirect', handleForceLoginRedirect);
    return () => {
      window.removeEventListener(
        'forceLoginRedirect',
        handleForceLoginRedirect
      );
    };
  }, [navigate]);

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
      const response = (await LoginPost(
        data.email,
        data.password,
        keepLogin
      )) as LoginResponse;
      const { accessToken, refreshToken } = response;

      // 토큰 디코딩하여 만료시간 확인
      try {
        JSON.parse(atob(accessToken.split('.')[1]));
        // const expiresAt = new Date(payload.exp * 1000);
      } catch {
        // do nothing
      }

      // 앱에서는 항상 localStorage에 저장 (영구 보관)
      if (isNativeApp()) {
        forceSaveAppToken(accessToken, refreshToken);
      } else {
        // 토큰을 localStorage에 저장
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // 자동로그인 여부 저장
        if (keepLogin) {
          localStorage.setItem('autoLogin', 'true');
        } else {
          localStorage.removeItem('autoLogin');
        }
      }

      const membership: MembershipInfo = await getMembershipInfo();

      // 네이티브 앱 환경이면 브릿지로 로그인 정보 전달 (로그 포함)
      const win = window as unknown as {
        webkit?: {
          messageHandlers?: {
            saveLoginInfo?: {
              postMessage: (msg: Record<string, unknown>) => void;
            };
          };
        };
      };
      if (
        typeof window !== 'undefined' &&
        win.webkit &&
        win.webkit.messageHandlers &&
        win.webkit.messageHandlers.saveLoginInfo
      ) {
        console.log('[BRIDGE] 네이티브 브릿지 호출!');
        win.webkit.messageHandlers.saveLoginInfo.postMessage({
          loginData: {
            id:
              membership && 'id' in membership
                ? (membership as { id?: string }).id
                : undefined,
            email:
              membership && 'email' in membership
                ? (membership as { email?: string }).email
                : undefined,
            name: membership.name,
            token: accessToken,
            refreshToken: refreshToken,
            // expiresAt: (만료일 필요시 추가)
          },
        });
      } else {
        console.log('[BRIDGE] 네이티브 브릿지 없음');
      }

      const redirectTo = location.state?.from || '/home';
      navigate(redirectTo, {
        replace: true,
        state: {
          showNotice: true,
          membership,
        },
      });
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '로그인 실패. 다시 시도해주세요.'
      );
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

  // 예시: 로딩/에러 상태 처리
  // if (isSubmitting) {
  //   return <LoadingSpinner label="로그인 중입니다..." />;
  // }
  // if (에러상태) {
  //   return <CommonErrorMessage message="로그인에 실패했습니다." />;
  // }

  // 에러 메시지는 인풋 필드 아래에서만 노출
  return (
    <ThemeProvider theme={theme}>
      <>
        <LoginContainer>
          <LoginInfoBox>
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
          </LoginInfoBox>
          <FormSectionWrapper>
            <FormSection onSubmit={handleSubmit(handleLoginClick)}>
              <InputLabel style={{ marginBottom: '8px' }}>
                로그인 계정
              </InputLabel>
              <InputFieldsContainer>
                <InputWrap>
                  <StyledInput
                    id='email'
                    type='text'
                    placeholder='아이디(이메일)'
                    value={email}
                    onChange={handleEmailChange}
                    $hasError={!!errors.email}
                    autoComplete='username'
                  />
                  {email && (
                    <InputIconBtn type='button' onClick={handleEmailClear}>
                      <ClearIcon />
                    </InputIconBtn>
                  )}
                </InputWrap>
                {errors.email && (
                  <ErrorMessage message={errors.email.message ?? ''} />
                )}
                <InputWrap>
                  <StyledInput
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='비밀번호'
                    value={password}
                    onChange={handlePwChange}
                    $hasError={!!errors.password}
                    autoComplete='current-password'
                    onKeyDown={handlePwKeyDown}
                    onBlur={handlePwBlur}
                  />
                  {password && (
                    <InputIconBtn type='button' onClick={handlePwClear}>
                      <ClearIcon />
                    </InputIconBtn>
                  )}
                  {password && (
                    <InputIconBtn
                      style={{ right: '40px' }}
                      onClick={toggleShowPassword}
                      type='button'
                    >
                      {showPassword ? (
                        <ShowPasswordIcon />
                      ) : (
                        <HidePasswordIcon />
                      )}
                    </InputIconBtn>
                  )}
                </InputWrap>
                {isCapsLock && (
                  <CapsLockNotice>Caps Lock이 켜져 있습니다.</CapsLockNotice>
                )}
                {errors.password && (
                  <InputErrorMessage>
                    {errors.password.message}
                  </InputErrorMessage>
                )}
                {/* 서버 에러 메시지(로그인 실패 등)는 인풋 아래에 노출 */}
                {errorMessage && !errors.password && (
                  <InputErrorMessage>{errorMessage}</InputErrorMessage>
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
                    로그인 상태 유지{' '}
                    <span style={{ color: '#aaa' }}>(선택)</span>
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
                $active={isValid && !isSubmitting}
              >
                {isSubmitting ? '로그인 중...' : '로그인'}
              </LoginBtn>
            </FormSection>
            <LinksRow>
              <LinksLeft>
                <LinkBtn onClick={() => navigate('/findid')}>
                  아이디 찾기
                </LinkBtn>
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
        </LoginContainer>
      </>
    </ThemeProvider>
  );
};

export default Login;
