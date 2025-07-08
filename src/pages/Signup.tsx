// Signup.tsx
import React, { useState, useRef, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { schemaSignup } from '../hooks/ValidationYup';
import InputField from '../components/InputField';
import AgreementSection from '../components/Signup/AgreementSection';
import Theme from '../styles/Theme';
import FixedBottomBar from '../components/FixedBottomBar';
import { useNavigate } from 'react-router-dom';
import { CustomSelect } from '../components/CustomSelect';
import ReusableModal from '../components/ReusableModal';
import {
  signUpUser,
  checkEmail,
  verifyPhone,
  verifyCode,
  checkWebpage,
  checkNickname,
} from '../api/user/userApi';
import { regionDistrictData } from '../components/Signup/regionDistrictData';
import Modal from '../components/Melpik/CreateMelpik/Settings/Modal';
import SimpleHeader from '../components/SimpleHeader';

export type SignupFormData = {
  email: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
  name: string;
  birthYear: string;
  phoneNumber: string;
  region: string;
  district: string;
  melpickAddress: string;
  height: string;
  size: string;
  dress: string;
  top: string;
  bottom: string;
  brand: string;
  instar: string;
  shoulder?: string | null;
  chest?: string | null;
  waist?: string | null;
  sleeve?: string | null;
  mebershipCode?: string | null;
};

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const methods = useForm<SignupFormData>({
    resolver: yupResolver(schemaSignup),
    mode: 'all',
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: '',
      nickname: '',
      name: '',
      birthYear: '',
      phoneNumber: '',
      region: '',
      district: '',
      melpickAddress: '',
      height: '',
      size: '',
      dress: '',
      top: '',
      bottom: '',
      brand: '',
      instar: '',
      shoulder: '',
      chest: '',
      waist: '',
      sleeve: '',
      mebershipCode: '',
    },
  });

  const {
    register,
    setValue,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
    getValues,
    watch,
  } = methods;

  const initialHeight = window.visualViewport
    ? window.visualViewport.height
    : window.innerHeight;
  const [isKeyboardOpen, setIsKeyboardOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      const viewportHeight = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;
      if (viewportHeight < initialHeight - 50) {
        setIsKeyboardOpen(true);
      } else {
        setIsKeyboardOpen(false);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    } else {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [initialHeight]);

  const [isPhoneVerificationSent, setIsPhoneVerificationSent] =
    useState<boolean>(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [timer, setTimer] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const startTimer = () => {
    setTimer(180);
    if (timerRef.current !== null) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimer((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
  }, []);

  const [isEmailChecked, setIsEmailChecked] = useState<boolean>(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState<boolean>(false);
  const [isMelpickAddressChecked, setIsMelpickAddressChecked] =
    useState<boolean>(false);

  const [emailButtonText, setEmailButtonText] = useState<string>('중복확인');
  const [nicknameButtonText, setNicknameButtonText] =
    useState<string>('중복확인');
  const [phoneVerificationButtonText, setPhoneVerificationButtonText] =
    useState<string>('인증');
  const [melpickAddressButtonText, setMelpickAddressButtonText] =
    useState<string>('체크');

  const [emailButtonColor, setEmailButtonColor] = useState<
    'yellow' | 'blue' | 'red'
  >('yellow');
  const [nicknameButtonColor, setNicknameButtonColor] = useState<
    'yellow' | 'blue' | 'red'
  >('yellow');
  const [phoneVerificationButtonColor, setPhoneVerificationButtonColor] =
    useState<'yellow' | 'blue' | 'red'>('yellow');
  const [melpickAddressButtonColor, setMelpickAddressButtonColor] = useState<
    'yellow' | 'blue' | 'red'
  >('yellow');

  const [emailApiError, setEmailApiError] = useState<string>('');
  const [nicknameApiError, setNicknameApiError] = useState<string>('');
  const [phoneApiError, setPhoneApiError] = useState<string>('');
  const [melpickApiError, setMelpickApiError] = useState<string>('');

  const [gender, setGender] = useState<string>('여성');
  const [selectedGenderButton, setSelectedGenderButton] =
    useState<string>('여성');
  const [melpickAddress, setMelpickAddress] = useState<string>('');

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const handleBrandSelect = (brands: string[]) => {
    setSelectedBrands(brands);
    setValue('brand', brands.join(', '));
  };
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const [signupResult, setSignupResult] = useState<React.ReactNode>('');
  const [isSignupSuccess, setIsSignupSuccess] = useState<boolean>(false);
  const [showSignupResultModal, setShowSignupResultModal] =
    useState<boolean>(false);

  const resetVerificationState = (
    field: 'email' | 'nickname' | 'phoneNumber' | 'melpickAddress'
  ) => {
    if (field === 'email') {
      setIsEmailChecked(false);
      setEmailButtonText('중복확인');
      setEmailApiError('');
      setEmailButtonColor('yellow');
    }
    if (field === 'nickname') {
      setIsNicknameChecked(false);
      setNicknameButtonText('중복확인');
      setNicknameApiError('');
      setNicknameButtonColor('yellow');
    }
    if (field === 'phoneNumber') {
      setIsPhoneVerified(false);
      setPhoneVerificationButtonText('인증');
      setPhoneApiError('');
      setPhoneVerificationButtonColor('yellow');
      setIsPhoneVerificationSent(false);
    }
    if (field === 'melpickAddress') {
      setIsMelpickAddressChecked(false);
      setMelpickAddressButtonText('체크');
      setMelpickApiError('');
      setMelpickAddressButtonColor('yellow');
    }
  };

  const handleEmailCheck = async (): Promise<void> => {
    const valid = await trigger('email');
    if (!valid) return;
    const email = getValues('email');
    try {
      const result = await checkEmail(email);
      if (result.isAvailable) {
        setEmailButtonText('인증 완료');
        setIsEmailChecked(true);
        setEmailApiError('');
        setEmailButtonColor('blue');
      } else {
        setEmailButtonText('인증 실패');
        setIsEmailChecked(false);
        setEmailApiError('이메일 인증 실패');
        setEmailButtonColor('red');
      }
    } catch (err: unknown) {
      setEmailButtonText('인증 실패');
      setIsEmailChecked(false);
      setEmailApiError(err instanceof Error ? err.message : '이메일 인증 실패');
      setEmailButtonColor('red');
    }
  };

  const handleNicknameCheck = async (): Promise<void> => {
    const valid = await trigger('nickname');
    if (!valid) return;
    const nickname = getValues('nickname');
    try {
      const result = await checkNickname(nickname);
      if (result.isAvailable) {
        setNicknameButtonText('인증 완료');
        setIsNicknameChecked(true);
        setNicknameApiError('');
        setNicknameButtonColor('blue');
      } else {
        setNicknameButtonText('인증 실패');
        setIsNicknameChecked(false);
        setNicknameApiError('닉네임 인증 실패');
        setNicknameButtonColor('red');
      }
    } catch (err: unknown) {
      setNicknameButtonText('인증 실패');
      setIsNicknameChecked(false);
      setNicknameApiError(
        err instanceof Error ? err.message : '닉네임 인증 실패'
      );
      setNicknameButtonColor('red');
    }
  };

  const brandButtonLabel = selectedBrands.length > 0 ? '선택완료' : '선택하기';
  const brandButtonColor = selectedBrands.length > 0 ? 'blue' : 'yellow';

  const handleSendVerification = async (): Promise<void> => {
    const valid = await trigger('phoneNumber');
    if (!valid) return;
    const phoneNumber = getValues('phoneNumber');
    try {
      const result = await verifyPhone({ phoneNumber });
      if (result.message && result.message.includes('성공')) {
        startTimer();
        setPhoneApiError('');
        setIsPhoneVerificationSent(true);
      } else {
        setPhoneVerificationButtonText('인증 실패');
        setPhoneApiError(result.message || '전화번호 인증 실패');
        setPhoneVerificationButtonColor('red');
      }
    } catch (err: unknown) {
      setPhoneVerificationButtonText('인증 실패');
      setPhoneApiError(
        err instanceof Error ? err.message : '전화번호 인증 실패'
      );
      setPhoneVerificationButtonColor('red');
    }
  };

  const handleVerifyCode = async (): Promise<void> => {
    if (!verificationCode) return;
    const phoneNumber = getValues('phoneNumber');
    try {
      const result = await verifyCode({ phoneNumber, code: verificationCode });
      if (result.message && result.message.includes('성공')) {
        setIsPhoneVerified(true);
        setPhoneVerificationButtonText('인증 완료');
        setPhoneApiError('');
        setPhoneVerificationButtonColor('blue');
        if (timerRef.current !== null) clearInterval(timerRef.current);
      } else {
        setPhoneVerificationButtonText('인증 실패');
        setIsPhoneVerified(false);
        setPhoneApiError(result.message || '전화번호 인증 실패');
        setPhoneVerificationButtonColor('red');
      }
    } catch (err: unknown) {
      setPhoneVerificationButtonText('인증 실패');
      setIsPhoneVerified(false);
      setPhoneApiError(
        err instanceof Error ? err.message : '전화번호 인증 실패'
      );
      setPhoneVerificationButtonColor('red');
    }
  };

  const handleMelpickAddressCheck = async (): Promise<void> => {
    const valid = await trigger('melpickAddress');
    if (!valid) return;
    try {
      const result = await checkWebpage(melpickAddress);
      if (result.isAvailable) {
        setMelpickAddressButtonText('인증 완료');
        setIsMelpickAddressChecked(true);
        setMelpickApiError('');
        setMelpickAddressButtonColor('blue');
      } else {
        setMelpickAddressButtonText('인증 실패');
        setIsMelpickAddressChecked(false);
        setMelpickApiError('멜픽 주소 인증 실패');
        setMelpickAddressButtonColor('red');
      }
    } catch (err: unknown) {
      setMelpickAddressButtonText('인증 실패');
      setIsMelpickAddressChecked(false);
      setMelpickApiError(
        err instanceof Error ? err.message : '멜픽 주소 인증 실패'
      );
      setMelpickAddressButtonColor('red');
    }
  };

  const onSubmit: SubmitHandler<SignupFormData> = async (data) => {
    const missing: string[] = [];
    if (!isEmailChecked) missing.push('이메일 인증을 완료하세요.');
    if (!isNicknameChecked) missing.push('닉네임 인증을 완료하세요.');
    if (!isPhoneVerified) missing.push('전화번호 인증을 완료하세요.');
    if (!isMelpickAddressChecked) missing.push('멜픽 주소 인증을 완료하세요.');
    if (missing.length > 0) {
      setSignupResult(
        missing.map((msg, idx) => (
          <React.Fragment key={idx}>
            {msg}
            <br />
          </React.Fragment>
        ))
      );
      setIsSignupSuccess(false);
      setShowSignupResultModal(true);
      return;
    }

    if (data.password !== data.passwordConfirm) {
      setSignupResult(
        <>
          비밀번호가 일치하지 않습니다.
          <br />
          다시 확인해주세요.
        </>
      );
      setIsSignupSuccess(false);
      setShowSignupResultModal(true);
      return;
    }

    let verifiedPhoneNumber =
      sessionStorage.getItem('verifiedPhoneNumber') || data.phoneNumber;
    const formatPhoneNumber = (phone: string) => {
      const cleaned = phone.replace(/[^0-9]/g, '');
      return cleaned.length === 11
        ? cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
        : phone;
    };
    verifiedPhoneNumber = formatPhoneNumber(verifiedPhoneNumber);

    const formattedData = {
      email: data.email,
      password: data.password,
      name: data.name,
      nickname: data.nickname,
      birthdate: `${data.birthYear}-01-01`,
      address: `${data.region} ${data.district}`,
      phoneNumber: verifiedPhoneNumber,
      gender: gender === '여성' ? 'female' : 'male',
      instagramId: data.instar,
      agreeToTerms: true,
      agreeToPrivacyPolicy: true,
      personalWebpage: data.melpickAddress,
      height: Number(data.height),
      weight: Number(data.size),
      topSize: data.top,
      dressSize: data.dress,
      bottomSize: data.bottom,
      preferredBrands: selectedBrands,
      shoulderWidth: data.shoulder ? Number(data.shoulder) : undefined,
      chestCircumference: data.chest ? Number(data.chest) : undefined,
      waistCircumference: data.waist ? Number(data.waist) : undefined,
      sleeveLength: data.sleeve ? Number(data.sleeve) : undefined,
    };

    try {
      // 중복 제출 방지를 위해 isSubmitting 체크
      if (isSubmitting) return;
      const response = await signUpUser(formattedData);
      setSignupResult(`🎉 ${response.nickname}님, 회원가입이 완료되었습니다!`);
      setIsSignupSuccess(true);
      setShowSignupResultModal(true);
    } catch (err: unknown) {
      console.error('회원가입 오류:', err);
      setSignupResult(
        err instanceof Error
          ? `회원가입 중 오류가 발생했습니다: ${err.message}`
          : '회원가입 중 오류가 발생했습니다.'
      );
      setIsSignupSuccess(false);
      setShowSignupResultModal(true);
    }
  };

  const onSignupButtonClick = async () => {
    if (isSubmitting) return;
    const valid = await trigger();
    const errorMessages = Object.values(methods.formState.errors)
      .map((err) => err?.message)
      .filter(Boolean)
      .join('\n');

    if (!valid || errorMessages) {
      setSignupResult(
        errorMessages.split('\n').map((line, idx) => (
          <React.Fragment key={idx}>
            {line}
            <br />
          </React.Fragment>
        ))
      );
      setIsSignupSuccess(false);
      setShowSignupResultModal(true);
      return;
    }

    await handleSubmit(onSubmit)();
  };

  const handleSignupResultModalClose = () => {
    setShowSignupResultModal(false);
    if (isSignupSuccess) {
      navigate('/landing');
    }
  };

  const handleGenderChange = (selected: string): void => {
    setGender(selected);
    setSelectedGenderButton(selected);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .replace(/[^0-9]/g, '')
      .replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    e.target.value = value;
    resetVerificationState('phoneNumber');
  };

  const handleInputChange =
    (field: 'email' | 'nickname' | 'melpickAddress') =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      resetVerificationState(field);
      if (field === 'melpickAddress') {
        setMelpickAddress((e.target as HTMLInputElement).value);
      }
    };

  return (
    <>
      <SimpleHeader title='회원가입' />
      <ThemeProvider theme={Theme}>
        <FormProvider {...methods}>
          {/* 폼의 onSubmit은 preventDefault 처리 */}
          <Container onSubmit={(e) => e.preventDefault()}>
            <Form>
              <AgreementSection />
              <InputField
                label='계정*(이메일)'
                id='email'
                type='text'
                error={
                  emailApiError ? { message: emailApiError } : errors.email
                }
                placeholder='계정을 입력하세요'
                buttonLabel={emailButtonText}
                buttonColor={emailButtonColor}
                {...register('email')}
                onChange={(e) => handleInputChange('email')(e)}
                required
                maxLength={50}
                onButtonClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  handleEmailCheck();
                }}
              />
              <InputField
                label='비밀번호*(숫자, 문자를 조합하여 8자리 이상 입력하세요)'
                id='password'
                type='password'
                placeholder='비밀번호를 입력하세요'
                error={errors.password}
                {...register('password')}
                required
                maxLength={20}
                autoComplete='current-password'
              />
              <InputField
                label='비밀번호 확인*'
                id='passwordConfirm'
                type='password'
                placeholder='비밀번호를 한번 더 입력하세요'
                error={errors.passwordConfirm}
                {...register('passwordConfirm')}
                required
                maxLength={20}
              />
              <InputField
                label='닉네임*(8글자 이내)'
                id='nickname'
                type='text'
                placeholder='닉네임을 입력하세요'
                error={
                  nicknameApiError
                    ? { message: nicknameApiError }
                    : errors.nickname
                }
                {...register('nickname')}
                onChange={(e) => handleInputChange('nickname')(e)}
                required
                maxLength={8}
                buttonLabel={nicknameButtonText}
                buttonColor={nicknameButtonColor}
                onButtonClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  handleNicknameCheck();
                }}
              />
              <RowLabel>
                <InputField
                  label='이름*'
                  id='name'
                  type='text'
                  placeholder='이름을 입력하세요'
                  error={errors.name}
                  {...register('name')}
                  required
                  maxLength={5}
                />
                <InputField
                  label='태어난 해*'
                  id='birthYear'
                  as={CustomSelect}
                  error={errors.birthYear}
                  required
                  {...register('birthYear')}
                >
                  <option value='' disabled>
                    태어난 해를 선택하세요
                  </option>
                  {Array.from({ length: 100 }, (_, i) => 2023 - i).map(
                    (year) => (
                      <option key={year} value={year}>
                        {year}년
                      </option>
                    )
                  )}
                </InputField>
              </RowLabel>
              <GenderField>
                <InputFieldLabel>성별*</InputFieldLabel>
                <GenderRow>
                  <GenderButton
                    type='button'
                    selected={gender === '여성'}
                    onClick={() => handleGenderChange('여성')}
                    $isSelected={selectedGenderButton === '여성'}
                  >
                    여성
                  </GenderButton>
                  <GenderButton
                    type='button'
                    selected={gender === '남성'}
                    onClick={() => handleGenderChange('남성')}
                    $isSelected={selectedGenderButton === '남성'}
                  >
                    남성
                  </GenderButton>
                </GenderRow>
              </GenderField>
              <PhoneField>
                <InputField
                  label='본인인증*(11자를 입력하세요)'
                  id='phoneNumber'
                  type='text'
                  placeholder='전화번호를 입력하세요'
                  error={
                    phoneApiError
                      ? { message: phoneApiError }
                      : errors.phoneNumber
                  }
                  {...register('phoneNumber')}
                  required
                  maxLength={11}
                  onInput={handlePhoneNumberChange}
                  buttonLabel='본인인증'
                  buttonColor={phoneVerificationButtonColor}
                  onButtonClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    handleSendVerification();
                  }}
                />
              </PhoneField>
              {isPhoneVerificationSent && !isPhoneVerified && (
                <VerificationWrapper>
                  <InputField
                    label='인증번호 입력'
                    id='verificationCode'
                    type='text'
                    placeholder='인증번호를 입력하세요'
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    buttonLabel={phoneVerificationButtonText}
                    buttonColor={phoneVerificationButtonColor}
                    onButtonClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault();
                      handleVerifyCode();
                    }}
                  />
                  <TimerDisplay>{formatTime(timer)}</TimerDisplay>
                </VerificationWrapper>
              )}
              <RowLabel>
                <InputField
                  label='서비스 지역*'
                  id='region'
                  as={CustomSelect}
                  error={errors.region}
                  required
                  {...register('region')}
                >
                  <option value='' disabled>
                    지역을 선택하세요
                  </option>
                  {Object.keys(regionDistrictData).map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </InputField>
                <InputField
                  label=''
                  id='district'
                  as={CustomSelect}
                  error={errors.district}
                  required
                  {...register('district')}
                >
                  <option value='' disabled>
                    구를 선택하세요
                  </option>
                  {watch('region') && regionDistrictData[watch('region')] ? (
                    regionDistrictData[watch('region')].map(
                      (district: string) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      )
                    )
                  ) : (
                    <option value=''>지역을 먼저 선택하세요</option>
                  )}
                </InputField>
              </RowLabel>
              <InputField
                label='인스타 아이디*'
                id='instar'
                type='text'
                placeholder='인스타 아이디를 입력하세요'
                required
                maxLength={50}
                {...register('instar')}
                prefix='instagram.com/'
              />
              <InputField
                label='멜픽 주소설정*(멜픽에서 제공되는 개인페이지)'
                id='melpickAddress'
                type='text'
                placeholder='멜픽 주소를 입력하세요'
                error={
                  melpickApiError
                    ? { message: melpickApiError }
                    : errors.melpickAddress
                }
                {...register('melpickAddress')}
                onChange={(e) => handleInputChange('melpickAddress')(e)}
                value={melpickAddress}
                buttonLabel={melpickAddressButtonText}
                buttonColor={melpickAddressButtonColor}
                required
                maxLength={12}
                onButtonClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  handleMelpickAddressCheck();
                }}
                prefix='melpick.com/'
              />
              <RowLabel>
                <InputField
                  label='기본정보*'
                  id='height'
                  as={CustomSelect}
                  error={errors.height}
                  {...register('height', { required: true })}
                >
                  <option value='' disabled hidden>
                    키 선택
                  </option>
                  {[...Array(200 - 130 + 1)].map((_, i) => (
                    <option key={i + 130} value={i + 130}>
                      {i + 130} cm
                    </option>
                  ))}
                </InputField>
                <InputField
                  label=''
                  id='size'
                  as={CustomSelect}
                  error={errors.size}
                  {...register('size', { required: true })}
                >
                  <option value='' disabled hidden>
                    몸무게 선택
                  </option>
                  {Array.from({ length: 90 - 30 + 1 }, (_, i) => (
                    <option key={i + 30} value={i + 30}>
                      {i + 30} kg
                    </option>
                  ))}
                </InputField>
              </RowLabel>
              <RowLabel>
                <InputField
                  label='사이즈*(원피스,상의,하의)'
                  id='dress'
                  as={CustomSelect}
                  error={errors.dress}
                  {...register('dress', { required: true })}
                >
                  <option value='' disabled hidden>
                    원피스
                  </option>
                  <option value='44'>44 (XS)</option>
                  <option value='55'>55 (S)</option>
                  <option value='66'>66 (M)</option>
                  <option value='77'>77 (L)</option>
                </InputField>
                <InputField
                  label=''
                  id='top'
                  as={CustomSelect}
                  error={errors.top}
                  {...register('top', { required: true })}
                >
                  <option value='' disabled hidden>
                    상의
                  </option>
                  <option value='44'>44 (XS)</option>
                  <option value='55'>55 (S)</option>
                  <option value='66'>66 (M)</option>
                  <option value='77'>77 (L)</option>
                </InputField>
                <InputField
                  label=''
                  id='bottom'
                  as={CustomSelect}
                  error={errors.bottom}
                  {...register('bottom', { required: true })}
                >
                  <option value='' disabled hidden>
                    하의
                  </option>
                  <option value='44'>44 (XS)</option>
                  <option value='55'>55 (S)</option>
                  <option value='66'>66 (M)</option>
                  <option value='77'>77 (L)</option>
                </InputField>
              </RowLabel>
              <RowLabel>
                <InputField
                  label='선호 브랜드 선택*(최대 3가지)'
                  id='brand'
                  type='text'
                  placeholder='브랜드 3가지를 선택하세요'
                  error={errors.brand}
                  {...register('brand')}
                  value={
                    selectedBrands.join(', ') || '브랜드 3가지를 선택하세요'
                  }
                  buttonLabel={brandButtonLabel}
                  buttonColor={brandButtonColor}
                  onButtonClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    openModal();
                  }}
                />
              </RowLabel>
              <Divider />
              <RowLabel>
                <InputField
                  label='어깨너비 cm (선택)'
                  id='shoulder'
                  type='text'
                  placeholder='어깨너비를 입력하세요'
                  error={errors.shoulder}
                  {...register('shoulder')}
                />
                <InputField
                  label='가슴둘레 cm (선택)'
                  id='chest'
                  type='text'
                  placeholder='가슴둘레를 입력하세요'
                  error={errors.chest}
                  {...register('chest')}
                />
              </RowLabel>
              <RowLabel>
                <InputField
                  label='허리둘레 cm (선택)'
                  id='waist'
                  type='text'
                  placeholder='허리둘레를 입력하세요'
                  error={errors.waist}
                  {...register('waist')}
                />
                <InputField
                  label='소매길이 cm (선택)'
                  id='sleeve'
                  type='text'
                  placeholder='소매길이를 입력하세요'
                  error={errors.sleeve}
                  {...register('sleeve')}
                />
              </RowLabel>
              <InputField
                label='맴버십 코드 (선택)'
                id='mebershipCode'
                type='mebershipCode'
                placeholder='맴버쉽 코드를 입력하세요'
                error={errors.mebershipCode}
                {...register('mebershipCode')}
                required
                maxLength={20}
                autoComplete='current-mebershipCode'
              />

              {!isKeyboardOpen && (
                <FixedBottomBar
                  type='button'
                  text={isSubmitting ? '가입 중...' : '회원가입'}
                  color='black'
                  onClick={onSignupButtonClick}
                  disabled={isSubmitting}
                />
              )}
            </Form>
            <BlackContainer />
          </Container>
        </FormProvider>

        {showSignupResultModal && (
          <ReusableModal
            isOpen={showSignupResultModal}
            onClose={handleSignupResultModalClose}
            title='회원가입 결과'
          >
            {signupResult}
          </ReusableModal>
        )}

        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            onSelect={handleBrandSelect}
            selectedBrands={selectedBrands}
          />
        )}
      </ThemeProvider>
    </>
  );
};

export default Signup;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  padding: 2rem;
  max-width: 400px;
  margin-top: 30px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
`;

const RowLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
`;

const GenderField = styled.div`
  width: 100%;
  height: 67px;
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;
`;

const InputFieldLabel = styled.label`
  margin-bottom: 10px;
  color: ${({ theme }) => theme.colors.black};
  font-weight: 700;
  font-size: 11px;
  line-height: 11px;
`;

const GenderRow = styled.div`
  display: flex;
  height: 100%;
  justify-content: space-between;
`;

const GenderButton = styled.button<{ selected: boolean; $isSelected: boolean }>`
  flex: 1;
  font-size: 12px;
  font-weight: 700;
  line-height: 11.05px;
  border: ${({ $isSelected }) => ($isSelected ? '2px solid #f6ae24' : 'none')};
  border-radius: 10px;
  background-color: ${({ selected }) => (selected ? '#FFFFFF' : '#EEEEEE')};
  color: ${({ selected }) => (selected ? '#000000' : '#999999')};
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    border 0.3s ease,
    color 0.3s ease;
  &:hover {
    border: 2px solid #f6ae24;
  }
  &:first-child {
    border-radius: 10px 0 0 10px;
  }
  &:last-child {
    border-radius: 0 10px 10px 0;
  }
`;

const PhoneField = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  input {
    flex: 1;
    padding-right: 120px;
  }
`;

const BlackContainer = styled.div`
  margin-bottom: 100px;
`;

const VerificationWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
`;

const TimerDisplay = styled.div`
  margin-left: auto;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 20px;
`;

const Divider = styled.hr`
  border: none;
  width: 100%;
  border: 1px solid #eeeeee;
`;
