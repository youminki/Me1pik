import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import { findEmail } from '@/api-utils/user-managements/users/userApi';
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
  StyledSelect,
  ErrorMessage,
  FindBtn,
  MelpikPointText,
} from '@/auth-utils/AuthCommon';
import CommonErrorMessage from '@/components/shared/ErrorMessage';
import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ReusableModal from '@/components/shared/modals/ReusableModal';

// 전화번호 포맷 함수
const formatPhone = (digits: string) => {
  const part1 = digits.slice(0, 3);
  const part2 = digits.length > 3 ? digits.slice(3, 7) : '';
  const part3 = digits.length > 7 ? digits.slice(7, 11) : '';
  return [part1, part2, part3].filter(Boolean).join('-');
};

// Validation schema: 이름, 태어난 해, 전화번호
const schemaFindId = yup.object().shape({
  name: yup
    .string()
    .required('이름을 입력해주세요.')
    .max(10, '이름은 최대 10자까지 입력 가능합니다.')
    .matches(/^[가-힣]+$/, '이름은 한글만 입력 가능합니다.'),
  birthYear: yup
    .string()
    .required('태어난 해를 선택해주세요.')
    .matches(/^\d{4}$/, '태어난 해는 4자리 숫자여야 합니다.'),
  phone: yup
    .string()
    .required('전화번호를 입력해주세요.')
    .matches(
      /^\d{3}-\d{4}-\d{4}$/,
      '유효한 전화번호 형식(010-1234-5678)이어야 합니다.'
    ),
});

type FormValues = yup.InferType<typeof schemaFindId>;

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

const FindId: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: yupResolver(schemaFindId),
    mode: 'onChange',
    defaultValues: { name: '', birthYear: '', phone: '' },
  });

  const name = watch('name');
  const birthYear = watch('birthYear');
  const phone = watch('phone');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('name', e.target.value, { shouldValidate: true });
  };
  const handleBirthYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue('birthYear', e.target.value, { shouldValidate: true });
  };
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
    const formatted = formatPhone(digits);
    setValue('phone', formatted, { shouldValidate: true });
  };
  const handleNameClear = () => setValue('name', '', { shouldValidate: true });
  const handlePhoneClear = () =>
    setValue('phone', '', { shouldValidate: true });

  // 이메일 마스킹 함수
  const maskEmail = (email: string) => {
    const [local, domain] = email.split('@');
    const masked = `${local.slice(0, 2)}*****`;
    return `${masked}@${domain}`;
  };

  // 폼 제출 핸들러
  const handleFindAccount = async (data: FormValues) => {
    setErrorMessage('');
    try {
      const { email } = await findEmail({
        name: data.name,
        birthYear: data.birthYear,
        phoneNumber: data.phone,
      });
      setUserEmail(maskEmail(email));
      setIsModalOpen(true);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : '이메일 찾기에 실패했습니다.'
      );
      setIsModalOpen(true);
    }
  };

  const closeModal = () => setIsModalOpen(false);

  // 예시: 로딩/에러 상태 처리
  if (isSubmitting) {
    return <LoadingSpinner label='아이디(이메일) 찾기 중...' />;
  }
  if (errorMessage) {
    return <CommonErrorMessage message={errorMessage} />;
  }

  return (
    <>
      <UnifiedHeader variant='threeDepth' title='아이디찾기' />
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
          <FormSection onSubmit={handleSubmit(handleFindAccount)}>
            <InputLabel style={{ marginBottom: '8px' }}>아이디 찾기</InputLabel>
            <InputFieldsContainer>
              <InputWrap>
                <StyledInput
                  id='name'
                  type='text'
                  placeholder='이름(한글)'
                  value={name}
                  onChange={handleNameChange}
                  $hasError={!!errors.name}
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
                <StyledSelect
                  id='birthYear'
                  value={birthYear}
                  onChange={handleBirthYearChange}
                  $hasError={!!errors.birthYear}
                >
                  <option value=''>태어난 해 선택</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </StyledSelect>
              </InputWrap>
              {errors.birthYear && (
                <ErrorMessage>{errors.birthYear.message}</ErrorMessage>
              )}
              <InputWrap>
                <StyledInput
                  id='phone'
                  type='text'
                  placeholder='010-1234-5678'
                  value={phone}
                  onChange={handlePhoneChange}
                  $hasError={!!errors.phone}
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
              {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
            </InputFieldsContainer>
            <FindBtn
              type='submit'
              disabled={!isValid || isSubmitting}
              $active={isValid && !isSubmitting}
            >
              {isSubmitting ? '조회 중...' : '아이디 찾기'}
            </FindBtn>
          </FormSection>
        </FormSectionWrapper>
        <ReusableModal isOpen={isModalOpen} onClose={closeModal} title=' 결과'>
          <p>입력하신 정보로 찾은 이메일은 아래와 같습니다.</p>
          <MelpikPointText>{userEmail}</MelpikPointText>
        </ReusableModal>
      </LoginContainer>
    </>
  );
};

export default FindId;
