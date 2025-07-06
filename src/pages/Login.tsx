// src/page/Login.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Theme from '../styles/Theme';
import { LoginPost } from '../api/auth/LoginPost';
import { getMembershipInfo, MembershipInfo } from '../api/user/userApi';
import MelpikLogo from '../assets/LoginLogo.svg';
import { schemaLogin } from '../hooks/ValidationYup';
import ReusableModal from '../components/ReusableModal';
import { isNativeApp, saveNativeLoginInfo } from '../utils/nativeApp';

type LoginFormValues = {
  email: string;
  password: string;
};

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [autoLogin, setAutoLogin] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(schemaLogin),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    const savedAutoLogin = localStorage.getItem('autoLogin');
    if (savedAutoLogin === 'true') {
      setAutoLogin(true);
      const savedEmail = localStorage.getItem('autoLoginEmail');
      const savedPassword = localStorage.getItem('autoLoginPassword');
      if (savedEmail && savedPassword) {
        // 자동 로그인 시도
        handleLoginClick({ email: savedEmail, password: savedPassword }).catch(
          () => {
            // 자동로그인 실패 시 자동로그인 정보 삭제
            localStorage.removeItem('autoLogin');
            localStorage.removeItem('autoLoginEmail');
            localStorage.removeItem('autoLoginPassword');
          }
        );
      }
    }
    // eslint-disable-next-line
  }, []);

  const handleModalClose = () => setIsModalOpen(false);

  const handleLoginClick = async (data: LoginFormValues) => {
    try {
      const response = (await LoginPost(
        data.email,
        data.password
      )) as LoginResponse;
      const { accessToken, refreshToken } = response;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      if (autoLogin) {
        localStorage.setItem('autoLogin', 'true');
        localStorage.setItem('autoLoginEmail', data.email);
        localStorage.setItem('autoLoginPassword', data.password);
      } else {
        localStorage.removeItem('autoLogin');
        localStorage.removeItem('autoLoginEmail');
        localStorage.removeItem('autoLoginPassword');
      }

      // === 네이티브 앱에 로그인 정보 전달 ===
      if (isNativeApp()) {
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

      navigate('/home', {
        replace: true,
        state: {
          showNotice: true,
          membership,
        },
      });
    } catch (error: unknown) {
      setModalMessage(
        error instanceof Error
          ? error.message
          : '로그인 실패. 다시 시도해주세요.'
      );
      setIsModalOpen(true);
    }
  };

  return (
    <ThemeProvider theme={Theme}>
      <Container>
        <TopSection>
          <Logo src={MelpikLogo} alt='멜픽 로고' />
          <Slogan>
            이젠 <span style={{ color: '#F6AE24' }}>멜픽</span>을 통해
            <br />
            브랜드를 골라보세요
            <br />
            <SloganSub>사고, 팔고, 빌리는 것을 한번에!</SloganSub>
          </Slogan>
        </TopSection>
        <FormSection
          onSubmit={handleSubmit(handleLoginClick)}
          autoComplete='on'
        >
          <InputLabel>로그인 계정</InputLabel>
          <Controller
            control={control}
            name='email'
            render={({ field, fieldState: { error } }) => (
              <div style={{ width: '100%', marginBottom: '16px' }}>
                <StyledInput
                  type='text'
                  placeholder='아이디(이메일) 입력하세요'
                  autoComplete='username'
                  {...field}
                />
                {error && error.message && (
                  <ErrorMessage>{error.message}</ErrorMessage>
                )}
              </div>
            )}
          />
          <Controller
            control={control}
            name='password'
            render={({ field, fieldState: { error } }) => (
              <div style={{ width: '100%', marginBottom: '16px' }}>
                <StyledInput
                  type='password'
                  placeholder='비밀번호를 입력하세요'
                  autoComplete='current-password'
                  {...field}
                />
                {error && error.message && (
                  <ErrorMessage>{error.message}</ErrorMessage>
                )}
              </div>
            )}
          />
          <AutoLoginRow>
            <CheckboxInput
              type='checkbox'
              checked={autoLogin}
              onChange={() => setAutoLogin((prev) => !prev)}
            />
            <CheckboxText>
              자동 로그인 <span className='option'>(선택)</span>
            </CheckboxText>
          </AutoLoginRow>
          <StyledLoginButton type='submit' disabled={!isValid || isSubmitting}>
            {isSubmitting ? '로그인 중...' : '로그인'}
          </StyledLoginButton>
        </FormSection>
        <BottomLinks>
          <LeftLinks>
            <Link onClick={() => navigate('/findid')}>아이디 찾기</Link>
            <Divider />
            <Link onClick={() => navigate('/findPassword')}>비밀번호 찾기</Link>
          </LeftLinks>
          <RightLink>
            <Link onClick={() => navigate('/signup')}>
              회원가입 <span style={{ color: '#aaa' }}>(이메일)</span>
            </Link>
          </RightLink>
        </BottomLinks>
        <ReusableModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          title='로그인 실패'
        >
          {modalMessage}
        </ReusableModal>
      </Container>
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

const Slogan = styled.div`
  width: 158px;
  text-align: center;

  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #000;
`;

const SloganSub = styled.div`
  font-weight: 400;
  font-size: 12px;
  color: #aaa;
  margin-top: 8px;
`;

const FormSection = styled.form`
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  margin-top: 10vh;
`;

const InputLabel = styled.div`
  font-weight: 700;
  font-size: 10px;
  color: #000;
  margin-bottom: 8px;
`;

const AutoLoginRow = styled.div`
  display: flex;
  align-items: center;

  margin-bottom: 8px;
`;

const CheckboxInput = styled.input`
  width: 20px;
  height: 20px;
  border: 1px solid lightgray;
  appearance: none;
  position: relative;
  cursor: pointer;

  &:checked::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 10px;
    height: 5px;
    border-left: 3px solid orange;
    border-bottom: 3px solid orange;
    transform: rotate(-45deg);
  }
`;

const CheckboxText = styled.div`
  font-size: 12px;
  font-weight: 700;
  margin-left: 8px;
  color: #000;

  /* (선택) 부분만 색상 변경 */
  span.option {
    color: #aaaaaa;
    font-weight: 400;
  }
`;

const StyledLoginButton = styled.button`
  width: 100%;
  height: 64px;
  background: #f6ae24;
  border-radius: 4px;
  border: none;

  font-weight: 800;
  font-size: 16px;
  color: #fff;
  margin-top: 16px;
  cursor: pointer;
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

const Divider = styled.div`
  width: 1px;
  height: 16px;
  background: #ddd;
`;

const StyledInput = styled.input`
  width: 100%;
  height: 56px;
  padding: 0 16px;
  border: 1px solid #ccc;

  font-size: 16px;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: #000;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 2px;
  margin-left: 2px;
`;
