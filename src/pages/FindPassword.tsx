import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  NaverLoginBg,
  NaverLoginBox,
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
  ErrorMessage,
  FindBtn,
  MelpikPointText,
} from '../auth/AuthCommon';
import ReusableModal from '../components/ReusableModal';
import { resetPassword } from '../api/user/userApi';
import MelpikLogo from '../assets/LoginLogo.svg';
import Theme from '../styles/Theme';
import { ThemeProvider } from 'styled-components';

// Validation schema
const schemaFindPassword = yup.object().shape({
  name: yup
    .string()
    .required('이름을 입력해주세요.')
    .max(10, '이름은 최대 10자까지 입력 가능합니다.')
    .matches(/^[가-힣]+$/, '이름은 한글만 입력 가능합니다.'),
  email: yup
    .string()
    .required('이메일을 입력해주세요.')
    .email('유효한 이메일 형식이어야 합니다.'),
  phone: yup
    .string()
    .required('전화번호를 입력해주세요.')
    .matches(
      /^\d{3}-\d{4}-\d{4}$/,
      '유효한 전화번호 형식(010-1234-5678)이어야 합니다.'
    ),
  newPassword: yup
    .string()
    .required('새 비밀번호를 입력해주세요.')
    .min(8, '새 비밀번호는 최소 8자 이상이어야 합니다.'),
  confirmPassword: yup
    .string()
    .required('비밀번호 확인을 입력해주세요.')
    .oneOf([yup.ref('newPassword')], '비밀번호가 일치하지 않습니다.'),
});

type FormValues = yup.InferType<typeof schemaFindPassword>;

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

const FindPassword: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: yupResolver(schemaFindPassword),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const name = watch('name');
  const email = watch('email');
  const phone = watch('phone');
  const newPassword = watch('newPassword');
  const confirmPassword = watch('confirmPassword');

  // 비밀번호 보기/숨기기 상태
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toggleShowNewPassword = () => setShowNewPassword((v) => !v);
  const toggleShowConfirmPassword = () => setShowConfirmPassword((v) => !v);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('name', e.target.value, { shouldValidate: true });
  };
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('email', e.target.value, { shouldValidate: true });
  };
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
    const part1 = digits.slice(0, 3);
    const part2 = digits.length > 3 ? digits.slice(3, 7) : '';
    const part3 = digits.length > 7 ? digits.slice(7, 11) : '';
    const formatted = [part1, part2, part3].filter(Boolean).join('-');
    setValue('phone', formatted, { shouldValidate: true });
  };
  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('newPassword', e.target.value, { shouldValidate: true });
  };
  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setValue('confirmPassword', e.target.value, { shouldValidate: true });
  };
  const handleNameClear = () => setValue('name', '', { shouldValidate: true });
  const handleEmailClear = () =>
    setValue('email', '', { shouldValidate: true });
  const handlePhoneClear = () =>
    setValue('phone', '', { shouldValidate: true });
  const handleNewPasswordClear = () =>
    setValue('newPassword', '', { shouldValidate: true });
  const handleConfirmPasswordClear = () =>
    setValue('confirmPassword', '', { shouldValidate: true });

  // 유효성 에러 시 호출
  const onError = () => {
    setErrorMessage('입력하신 내용을 다시 확인해주세요.');
  };

  const onSubmit = async (data: FormValues) => {
    setErrorMessage('');
    try {
      await resetPassword({
        name: data.name,
        email: data.email,
        phoneNumber: data.phone,
        newPassword: data.newPassword,
      });
      setSuccessMessage('새 비밀번호가 성공적으로 설정되었습니다.');
      setIsModalOpen(true);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '비밀번호 재설정에 실패했습니다.'
      );
      setIsModalOpen(true);
    }
  };

  const closeModal = () => setIsModalOpen(false);

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
          <FormSection onSubmit={handleSubmit(onSubmit, onError)}>
            <InputLabel style={{ marginBottom: '8px' }}>
              비밀번호 찾기
            </InputLabel>
            <InputFieldsContainer>
              <InputWrap>
                <StyledInput
                  id='name'
                  type='text'
                  placeholder='이름(한글)'
                  value={name}
                  onChange={handleNameChange}
                  hasError={!!errors.name}
                  autoComplete='off'
                />
                {name && (
                  <InputIconBtn type='button' onClick={handleNameClear}>
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
                  </InputIconBtn>
                )}
              </InputWrap>
              {errors.name && (
                <ErrorMessage>{errors.name.message}</ErrorMessage>
              )}
              <InputWrap>
                <StyledInput
                  id='email'
                  type='text'
                  placeholder='이메일'
                  value={email}
                  onChange={handleEmailChange}
                  hasError={!!errors.email}
                  autoComplete='off'
                />
                {email && (
                  <InputIconBtn type='button' onClick={handleEmailClear}>
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
                  </InputIconBtn>
                )}
              </InputWrap>
              {errors.email && (
                <ErrorMessage>{errors.email.message}</ErrorMessage>
              )}
              <InputWrap>
                <StyledInput
                  id='phone'
                  type='text'
                  placeholder='010-1234-5678'
                  value={phone}
                  onChange={handlePhoneChange}
                  hasError={!!errors.phone}
                  autoComplete='off'
                />
                {phone && (
                  <InputIconBtn type='button' onClick={handlePhoneClear}>
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
                  </InputIconBtn>
                )}
              </InputWrap>
              {errors.phone && (
                <ErrorMessage>{errors.phone.message}</ErrorMessage>
              )}
              <InputWrap>
                <StyledInput
                  id='newPassword'
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder='새 비밀번호를 입력하세요'
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                  hasError={!!errors.newPassword}
                  autoComplete='new-password'
                />
                {newPassword && (
                  <>
                    <InputIconBtn
                      type='button'
                      onClick={handleNewPasswordClear}
                    >
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
                    </InputIconBtn>
                    <InputIconBtn
                      type='button'
                      onClick={toggleShowNewPassword}
                      style={{ right: 40 }}
                    >
                      {showNewPassword ? (
                        <NaverEyeOpenIcon />
                      ) : (
                        <NaverEyeCloseIcon />
                      )}
                    </InputIconBtn>
                  </>
                )}
              </InputWrap>
              {errors.newPassword && (
                <ErrorMessage>{errors.newPassword.message}</ErrorMessage>
              )}
              <InputWrap>
                <StyledInput
                  id='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder='비밀번호를 다시 입력하세요'
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  hasError={!!errors.confirmPassword}
                  autoComplete='new-password'
                />
                {confirmPassword && (
                  <>
                    <InputIconBtn
                      type='button'
                      onClick={handleConfirmPasswordClear}
                    >
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
                    </InputIconBtn>
                    <InputIconBtn
                      type='button'
                      onClick={toggleShowConfirmPassword}
                      style={{ right: 40 }}
                    >
                      {showConfirmPassword ? (
                        <NaverEyeOpenIcon />
                      ) : (
                        <NaverEyeCloseIcon />
                      )}
                    </InputIconBtn>
                  </>
                )}
              </InputWrap>
              {errors.confirmPassword && (
                <ErrorMessage>{errors.confirmPassword.message}</ErrorMessage>
              )}
              {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
            </InputFieldsContainer>
            <FindBtn
              type='submit'
              disabled={!isValid || isSubmitting}
              active={isValid && !isSubmitting}
            >
              {isSubmitting ? '조회 중...' : '비밀번호 변경'}
            </FindBtn>
          </FormSection>
        </FormSectionWrapper>
        <ReusableModal
          isOpen={isModalOpen}
          onClose={closeModal}
          title='비밀번호 찾기 결과'
        >
          <MelpikPointText>{successMessage}</MelpikPointText>
        </ReusableModal>
      </NaverLoginBg>
    </ThemeProvider>
  );
};

export default FindPassword;
