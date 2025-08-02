/**
 * 회원가입 페이지 컴포넌트 (Signup.tsx)
 *
 * 새로운 사용자의 회원가입을 처리하는 페이지를 제공합니다.
 * 이메일, 비밀번호, 개인정보, 신체 정보, 선호 브랜드 등 다양한 정보를 수집하며,
 * 실시간 유효성 검사, 중복 확인, 인증 코드 검증 등의 기능을 포함합니다.
 *
 * @description
 * - 다단계 회원가입 폼
 * - 실시간 유효성 검사 및 중복 확인
 * - 이메일/전화번호 인증 코드 검증
 * - 신체 정보 및 선호 브랜드 수집
 * - 키보드 상태 감지 및 UI 최적화
 * - 약관 동의 및 개인정보 처리
 */
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState, useRef, useEffect } from 'react';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { InferType } from 'yup';

import type { AxiosError } from 'axios';

import {
  signUpUser,
  checkEmail,
  verifyPhone,
  verifyCode,
  checkWebpage,
  checkNickname,
} from '@/api-utils/user-managements/users/userApi';
import FixedBottomBar from '@/components/fixed-bottom-bar';
import Modal from '@/components/melpiks/create-melpiks/settings/Modal';
import CommonField from '@/components/shared/forms/CommonField';
import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ReusableModal from '@/components/shared/modals/ReusableModal';
import AgreementSection from '@/components/signups/AgreementSection';
import { regionDistrictData } from '@/components/signups/regionDistrictData';
import { schemaSignup } from '@/hooks/useValidationYup';

export type SignupFormData = InferType<typeof schemaSignup>;

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

  const [emailApiError, setEmailApiError] = useState<string>('');
  const [nicknameApiError, setNicknameApiError] = useState<string>('');
  const [phoneApiError, setPhoneApiError] = useState<string>('');

  const [gender, setGender] = useState<string>('여성');
  const [selectedGenderButton, setSelectedGenderButton] =
    useState<string>('여성');

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
    }
    if (field === 'nickname') {
      setIsNicknameChecked(false);
      setNicknameButtonText('중복확인');
      setNicknameApiError('');
    }
    if (field === 'phoneNumber') {
      setIsPhoneVerified(false);
      setPhoneVerificationButtonText('인증');
      setPhoneApiError('');
      setIsPhoneVerificationSent(false);
    }
    if (field === 'melpickAddress') {
      setIsMelpickAddressChecked(false);
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
      } else {
        setEmailButtonText('인증 실패');
        setIsEmailChecked(false);
        setEmailApiError('이메일 인증 실패');
      }
    } catch (err: unknown) {
      setEmailButtonText('인증 실패');
      setIsEmailChecked(false);
      setEmailApiError(err instanceof Error ? err.message : '이메일 인증 실패');
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
      } else {
        setNicknameButtonText('인증 실패');
        setIsNicknameChecked(false);
        setNicknameApiError('닉네임 인증 실패');
      }
    } catch (err: unknown) {
      setNicknameButtonText('인증 실패');
      setIsNicknameChecked(false);
      setNicknameApiError(
        err instanceof Error ? err.message : '닉네임 인증 실패'
      );
    }
  };

  const brandButtonLabel = selectedBrands.length > 0 ? '선택완료' : '선택하기';

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
      }
    } catch (err) {
      setPhoneVerificationButtonText('인증 실패');
      const axiosErr = err as AxiosError<{ message?: string }>;
      const serverMsg = axiosErr.response?.data?.message;
      setPhoneApiError(serverMsg || (axiosErr.message ?? '전화번호 인증 실패'));
    }
  };

  const [verificationCode, setVerificationCode] = useState<string>('');

  const handleVerifyCode = async (): Promise<void> => {
    if (!verificationCode) return;
    const phoneNumber = getValues('phoneNumber');
    try {
      const result = await verifyCode({ phoneNumber, code: verificationCode });
      if (result.message && result.message.includes('성공')) {
        setIsPhoneVerified(true);
        setPhoneVerificationButtonText('인증 완료');
        if (timerRef.current !== null) clearInterval(timerRef.current);
      } else {
        setPhoneVerificationButtonText('인증 실패');
        setIsPhoneVerified(false);
        setPhoneApiError(result.message || '전화번호 인증 실패');
      }
    } catch (err: unknown) {
      setPhoneVerificationButtonText('인증 실패');
      setIsPhoneVerified(false);
      setPhoneApiError(
        err instanceof Error ? err.message : '전화번호 인증 실패'
      );
    }
  };

  const handleMelpickAddressCheck = async (): Promise<void> => {
    const valid = await trigger('melpickAddress');
    if (!valid) return;
    const melpickAddress = getValues('melpickAddress');
    try {
      const result = await checkWebpage(melpickAddress);
      if (result.isAvailable) {
        setIsMelpickAddressChecked(true);
      } else {
        setIsMelpickAddressChecked(false);
      }
    } catch {
      setIsMelpickAddressChecked(false);
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

  return (
    <>
      <UnifiedHeader variant='threeDepth' title='회원가입' />
      <Container>
        <FormProvider {...methods}>
          <Form
            onSubmit={(e: React.FormEvent<HTMLFormElement>) =>
              e.preventDefault()
            }
          >
            {/* 접근성을 위한 숨겨진 사용자명 필드 */}
            <input
              type='text'
              name='username'
              autoComplete='username'
              style={{ display: 'none' }}
              aria-hidden='true'
            />

            <AgreementSection />
            <CommonField
              label={
                <span style={{ fontSize: 11, fontWeight: 700 }}>
                  계정*(이메일)
                </span>
              }
              id='email'
              type='text'
              error={emailApiError || errors.email?.message}
              placeholder='계정을 입력하세요'
              buttonLabel={emailButtonText}
              buttonColorType={
                emailButtonText === '인증 완료'
                  ? 'blue'
                  : emailButtonText === '인증 실패'
                    ? 'red'
                    : 'yellow'
              }
              autoComplete='username'
              {...register('email', {
                onChange: (e) => {
                  resetVerificationState('email');
                  setValue('email', e.target.value);
                },
              })}
              required
              maxLength={50}
              onButtonClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                handleEmailCheck();
              }}
            />
            <CommonField
              label={
                <span style={{ fontSize: 11, fontWeight: 700 }}>
                  비밀번호*(숫자, 문자를 조합하여 8자리 이상 입력하세요)
                </span>
              }
              id='password'
              type='password'
              placeholder='비밀번호를 입력하세요'
              error={errors.password?.message}
              {...register('password')}
              required
              maxLength={20}
              autoComplete='new-password'
            />
            <CommonField
              label={
                <span style={{ fontSize: 11, fontWeight: 700 }}>
                  비밀번호 확인*
                </span>
              }
              id='passwordConfirm'
              type='password'
              placeholder='비밀번호를 한번 더 입력하세요'
              error={errors.passwordConfirm?.message}
              autoComplete='new-password'
              {...register('passwordConfirm')}
              required
              maxLength={20}
            />
            <CommonField
              label={
                <span style={{ fontSize: 11, fontWeight: 700 }}>
                  닉네임*(8글자 이내)
                </span>
              }
              id='nickname'
              type='text'
              placeholder='닉네임을 입력하세요'
              error={nicknameApiError || errors.nickname?.message}
              {...register('nickname', {
                onChange: (e) => {
                  resetVerificationState('nickname');
                  setValue('nickname', e.target.value);
                },
              })}
              required
              maxLength={8}
              buttonLabel={nicknameButtonText}
              buttonColorType={
                nicknameButtonText === '인증 완료'
                  ? 'blue'
                  : nicknameButtonText === '인증 실패'
                    ? 'red'
                    : 'yellow'
              }
              onButtonClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                handleNicknameCheck();
              }}
            />
            <RowLabel>
              <CommonField
                label={
                  <span style={{ fontSize: 11, fontWeight: 700 }}>이름*</span>
                }
                id='name'
                type='text'
                placeholder='이름을 입력하세요'
                error={errors.name?.message}
                {...register('name')}
                required
                maxLength={5}
              />
              <CommonField
                label={
                  <span style={{ fontSize: 11, fontWeight: 700 }}>
                    태어난 해*
                  </span>
                }
                id='birthYear'
                as='select'
                error={errors.birthYear?.message}
                required
                {...register('birthYear')}
                placeholder='태어난 해 선택'
                children={[
                  <option value='' disabled key='default'>
                    태어난 해를 선택하세요
                  </option>,
                  ...Array.from({ length: 100 }, (_, i) => 2023 - i).map(
                    (year) => (
                      <option key={year} value={year}>
                        {year}년
                      </option>
                    )
                  ),
                ]}
              />
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
              <CommonField
                label={
                  <span style={{ fontSize: 11, fontWeight: 700 }}>
                    본인인증*(11자를 입력하세요)
                  </span>
                }
                id='phoneNumber'
                type='text'
                placeholder='전화번호를 입력하세요'
                error={phoneApiError || errors.phoneNumber?.message}
                {...register('phoneNumber')}
                required
                maxLength={11}
                buttonLabel={phoneVerificationButtonText}
                buttonColorType={
                  phoneVerificationButtonText === '인증 완료'
                    ? 'blue'
                    : phoneVerificationButtonText === '인증 실패'
                      ? 'red'
                      : 'yellow'
                }
                onButtonClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  handleSendVerification();
                }}
              />
            </PhoneField>
            {isPhoneVerificationSent && !isPhoneVerified && (
              <VerificationWrapper>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <label
                    htmlFor='verificationCode'
                    style={{ marginRight: 8, fontWeight: 700, fontSize: 12 }}
                  >
                    인증번호 입력
                  </label>
                  <input
                    id='verificationCode'
                    type='text'
                    placeholder='인증번호를 입력하세요'
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: 4,
                      fontSize: 14,
                    }}
                  />
                  <button
                    type='button'
                    style={{
                      marginLeft: 8,
                      padding: '8px 16px',
                      background: '#f6ae24',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      handleVerifyCode();
                    }}
                  >
                    {phoneVerificationButtonText}
                  </button>
                </div>
                <TimerDisplay>{formatTime(timer)}</TimerDisplay>
              </VerificationWrapper>
            )}
            <RowLabel>
              <CommonField
                label={
                  <span style={{ fontSize: 11, fontWeight: 700 }}>
                    서비스 지역*
                  </span>
                }
                id='region'
                as='select'
                error={errors.region?.message}
                required
                {...register('region')}
                placeholder='지역 선택'
                children={[
                  <option value='' disabled key='default'>
                    지역을 선택하세요
                  </option>,
                  ...Object.keys(regionDistrictData).map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  )),
                ]}
              />
              <CommonField
                label={
                  <span style={{ fontSize: 11, fontWeight: 700 }}>구*</span>
                }
                id='district'
                as='select'
                error={errors.district?.message}
                required
                {...register('district')}
                placeholder='구 선택'
                children={[
                  <option value='' disabled key='default'>
                    구를 선택하세요
                  </option>,
                  ...(watch('region') && regionDistrictData[watch('region')]
                    ? regionDistrictData[watch('region')].map(
                        (district: string) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        )
                      )
                    : [
                        <option value='' key='empty'>
                          지역을 먼저 선택하세요
                        </option>,
                      ]),
                ]}
              />
            </RowLabel>
            <RowLabel>
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <span style={{ fontWeight: 700, fontSize: 13, minWidth: 100 }}>
                  instagram.com/
                </span>
                <CommonField
                  id='instar'
                  type='text'
                  placeholder='인스타 아이디를 입력하세요'
                  error={errors.instar?.message}
                  required
                  maxLength={50}
                  style={{
                    flex: 1,
                    fontSize: 16,
                    marginLeft: 3,
                  }}
                  {...register('instar')}
                />
              </div>
            </RowLabel>

            <RowLabel>
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <span style={{ fontWeight: 700, fontSize: 13, minWidth: 100 }}>
                  me1pik.com/
                </span>
                <CommonField
                  id='melpickAddress'
                  type='text'
                  placeholder='멜픽 주소를 입력하세요'
                  error={errors.melpickAddress?.message}
                  required
                  maxLength={12}
                  style={{
                    flex: 1,
                    fontSize: 16,
                    marginLeft: 3,
                  }}
                  {...register('melpickAddress', {
                    onChange: (e) => {
                      resetVerificationState('melpickAddress');
                      setValue('melpickAddress', e.target.value);
                    },
                  })}
                  buttonLabel='체크'
                  buttonColorType='yellow'
                  onButtonClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    handleMelpickAddressCheck();
                  }}
                />
              </div>
            </RowLabel>
            <RowLabel>
              <CommonField
                label={
                  <span style={{ fontSize: 11, fontWeight: 700 }}>키*</span>
                }
                id='height'
                as='select'
                error={errors.height?.message}
                {...register('height')}
                placeholder='키 선택'
                children={[
                  <option value='' disabled hidden key='default'>
                    키 선택
                  </option>,
                  ...[...Array(200 - 130 + 1)].map((_, i) => (
                    <option key={i + 130} value={i + 130}>
                      {i + 130} cm
                    </option>
                  )),
                ]}
              />
              <CommonField
                label={
                  <span style={{ fontSize: 11, fontWeight: 700 }}>몸무게*</span>
                }
                id='size'
                as='select'
                error={errors.size?.message}
                {...register('size')}
                placeholder='몸무게 선택'
                children={[
                  <option value='' disabled hidden key='default'>
                    몸무게 선택
                  </option>,
                  ...Array.from({ length: 90 - 30 + 1 }, (_, i) => (
                    <option key={i + 30} value={i + 30}>
                      {i + 30} kg
                    </option>
                  )),
                ]}
              />
            </RowLabel>
            <RowLabel>
              <CommonField
                label={
                  <span style={{ fontSize: 11, fontWeight: 700 }}>원피스*</span>
                }
                id='dress'
                as='select'
                error={errors.dress?.message}
                {...register('dress')}
                placeholder='원피스'
                children={[
                  <option value='' disabled hidden key='default'>
                    원피스
                  </option>,
                  <option key='44' value='44'>
                    44 (XS)
                  </option>,
                  <option key='55' value='55'>
                    55 (S)
                  </option>,
                  <option key='66' value='66'>
                    66 (M)
                  </option>,
                  <option key='77' value='77'>
                    77 (L)
                  </option>,
                ]}
              />
              <CommonField
                label={
                  <span style={{ fontSize: 11, fontWeight: 700 }}>상의*</span>
                }
                id='top'
                as='select'
                error={errors.top?.message}
                {...register('top')}
                placeholder='상의'
                children={[
                  <option value='' disabled hidden key='default'>
                    상의
                  </option>,
                  <option key='44' value='44'>
                    44 (XS)
                  </option>,
                  <option key='55' value='55'>
                    55 (S)
                  </option>,
                  <option key='66' value='66'>
                    66 (M)
                  </option>,
                  <option key='77' value='77'>
                    77 (L)
                  </option>,
                ]}
              />
              <CommonField
                label={
                  <span style={{ fontSize: 11, fontWeight: 700 }}>하의*</span>
                }
                id='bottom'
                as='select'
                error={errors.bottom?.message}
                {...register('bottom')}
                placeholder='하의'
                children={[
                  <option value='' disabled hidden key='default'>
                    하의
                  </option>,
                  <option key='44' value='44'>
                    44 (XS)
                  </option>,
                  <option key='55' value='55'>
                    55 (S)
                  </option>,
                  <option key='66' value='66'>
                    66 (M)
                  </option>,
                  <option key='77' value='77'>
                    77 (L)
                  </option>,
                ]}
              />
            </RowLabel>
            <RowLabel>
              <CommonField
                label={
                  <span style={{ fontSize: 11, fontWeight: 700 }}>
                    선호 브랜드 선택*(최대 3가지)
                  </span>
                }
                id='brand'
                type='text'
                placeholder='브랜드 3가지를 선택하세요'
                error={errors.brand?.message}
                {...register('brand')}
                buttonLabel={brandButtonLabel}
                onButtonClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  openModal();
                }}
              />
            </RowLabel>
            <Divider />
            <RowLabel>
              <CommonField
                label={
                  <span style={{ fontSize: 11, fontWeight: 700 }}>
                    신체 치수 (선택)
                  </span>
                }
                id='shoulder'
                type='text'
                placeholder='어깨너비(cm)'
                error={errors.shoulder?.message}
                {...register('shoulder')}
              />
              <CommonField
                label={
                  <span style={{ fontSize: 11, fontWeight: 700 }}>
                    가슴둘레(cm)
                  </span>
                }
                id='chest'
                type='text'
                placeholder='가슴둘레(cm)'
                error={errors.chest?.message}
                {...register('chest')}
              />
            </RowLabel>
            <RowLabel>
              <CommonField
                label={
                  <span style={{ fontSize: 11, fontWeight: 700 }}>
                    허리둘레(cm)
                  </span>
                }
                id='waist'
                type='text'
                placeholder='허리둘레(cm)'
                error={errors.waist?.message}
                {...register('waist')}
              />
              <CommonField
                label={
                  <span style={{ fontSize: 11, fontWeight: 700 }}>
                    소매길이(cm)
                  </span>
                }
                id='sleeve'
                type='text'
                placeholder='소매길이(cm)'
                error={errors.sleeve?.message}
                {...register('sleeve')}
              />
            </RowLabel>
            <RowLabel>
              <CommonField
                label={
                  <span style={{ fontSize: 11, fontWeight: 700 }}>
                    맴버십 코드 (선택)
                  </span>
                }
                id='mebershipCode'
                type='mebershipCode'
                placeholder='맴버쉽 코드를 입력하세요'
                error={errors.mebershipCode?.message}
                {...register('mebershipCode')}
                required
                maxLength={20}
                autoComplete='current-mebershipCode'
              />
            </RowLabel>
          </Form>
          {!isKeyboardOpen && (
            <FixedBottomBar
              type='button'
              text={isSubmitting ? '가입 중...' : '회원가입'}
              color='black'
              onClick={onSignupButtonClick}
              disabled={isSubmitting}
            />
          )}
          <BlackContainer>
            {isSubmitting && <LoadingSpinner label='회원가입 처리 중...' />}
          </BlackContainer>
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
      </Container>
    </>
  );
};

export default Signup;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  padding-top: 70px;
  padding-bottom: 70px;
  margin: 0 auto;

  max-width: 600px;
`;

const Form = styled.form`
  width: 90%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const RowLabel = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: stretch;
  gap: 0;
  width: 100%;
  margin-top: -2px;
  & > * {
    flex: 1;
    min-width: 0;
    font-size: 13px;
  }
  & > *:not(:last-child) {
    margin-right: 12px;
  }
`;

const Divider = styled.hr`
  border: none;
  width: 100%;
  border: 1px solid #eeeeee;
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
`;
