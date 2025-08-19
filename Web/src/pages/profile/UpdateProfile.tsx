// src/pages/Profile/UpdateProfile.tsx

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';

import { withdrawUser } from '@/api-utils/user-managements/userApi';
import {
  useMyInfo,
  updateMyInfo,
} from '@/api-utils/user-managements/users/userApi';
import FixedBottomBar from '@/components/fixed-bottom-bar';
import CommonField from '@/components/shared/forms/CommonField';
import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';
import ReusableModal from '@/components/shared/modals/ReusableModal';
import { regionDistrictData } from '@/components/signups/regionDistrictData';
import { theme } from '@/styles/Theme';
import { getErrorMessage } from '@/utils/auth';

// userApi에서 가져올 함수들

export type UpdateProfileFormData = {
  emailId: string;
  emailDomain: string;
  nickname: string;
  name: string;
  birthYear: string;
  phoneNumber: string;
  region: string;
  district: string;
  gender: '여성' | '남성';
};

const UpdateProfile: React.FC = () => {
  const navigate = useNavigate();
  const methods = useForm<UpdateProfileFormData>({
    mode: 'all',
    defaultValues: {
      emailId: '',
      emailDomain: '',
      nickname: '',
      name: '',
      birthYear: '',
      phoneNumber: '',
      region: '',
      district: '',
      gender: '여성',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    watch,
    reset,
    setValue,
  } = methods;

  // react-query로 내 정보 패칭
  const { data: myInfo, isLoading } = useMyInfo();

  // 1. region, district 분리
  const [regionPart, setRegionPart] = useState('');
  const [districtPart, setDistrictPart] = useState('');

  // 2. myInfo가 바뀔 때 region, district 분리해서 state에 저장
  useEffect(() => {
    if (!myInfo) return;
    const normalized = myInfo.address.replace(/\u00A0/g, ' ').trim();
    const regionKeys = Object.keys(regionDistrictData);
    const foundRegion = regionKeys.find((region) =>
      normalized.startsWith(region)
    );
    let region = '';
    let district = '';
    if (foundRegion) {
      region = foundRegion;
      district = normalized.slice(foundRegion.length).trim();
    }
    setRegionPart(region);
    setDistrictPart(district);
    // 나머지 값은 바로 reset
    const [idPart, domainPart] = myInfo.email.split('@');
    const rawPhone = myInfo.phoneNumber.replace(/-/g, '');
    const birthYearStr = String(myInfo.birthYear);
    const genderKor = myInfo.gender === 'female' ? '여성' : '남성';
    reset({
      emailId: idPart,
      emailDomain: domainPart,
      nickname: myInfo.nickname,
      name: myInfo.name,
      birthYear: birthYearStr,
      phoneNumber: rawPhone,
      region: region, // region만 먼저 세팅
      district: '', // district는 일단 비워둠
      gender: genderKor,
    });
  }, [myInfo, reset]);

  // 3. regionPart가 바뀌면 district를 setValue로 세팅
  useEffect(() => {
    if (regionPart && districtPart) {
      setValue('district', districtPart);
    }
  }, [regionPart, districtPart, setValue]);

  // 모바일 키보드 열림 감지 (원래 로직 그대로 유지)
  const initialHeight = window.visualViewport
    ? window.visualViewport.height
    : window.innerHeight;
  useEffect(() => {
    const handleResize = () => {
      // 키보드 열림 상태는 사용하지 않으므로 제거
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

  // 제출 핸들러: 닉네임과 주소만 PATCH 요청
  const [signupResult, setSignupResult] = useState<React.ReactNode>('');
  const [showResultModal, setShowResultModal] = useState<boolean>(false);

  const onSubmit = useCallback<SubmitHandler<UpdateProfileFormData>>(
    async (data) => {
      try {
        const payload = {
          nickname: data.nickname,
          address: `${data.region} ${data.district}`,
        };
        await updateMyInfo(payload);
        setSignupResult('✅ 회원정보가 성공적으로 업데이트되었습니다.');
        setShowResultModal(true);
      } catch (err: unknown) {
        console.error('회원정보 수정 오류:', err);
        const msg = getErrorMessage(err);
        setSignupResult(`❌ 업데이트 중 오류가 발생했습니다: ${msg}`);
        setShowResultModal(true);
      }
    },
    []
  );

  // 시/도 & 구/군 옵션 useMemo로 최적화
  const regionOptions = useMemo(
    () =>
      Object.keys(regionDistrictData).map((region) => (
        <option key={region} value={region}>
          {region}
        </option>
      )),
    []
  );
  const region = watch('region');
  const districtOptions = useMemo(() => {
    if (!region)
      return [
        <option key='' value=''>
          구/군을 선택하세요
        </option>,
      ];
    const districts =
      regionDistrictData[region as keyof typeof regionDistrictData] || [];
    return [
      <option key='' value=''>
        구/군을 선택하세요
      </option>,
      ...districts.map((district) => (
        <option key={district} value={district}>
          {district}
        </option>
      )),
    ];
  }, [region]);

  const onSaveClick = useCallback(() => {
    handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  const handleResultModalClose = useCallback(() => {
    setShowResultModal(false);
    // 필요 시, 성공 후 다른 동작(ex: 뒤로 이동 등)을 이곳에 추가 가능
  }, []);

  // 계정삭제 모달 상태
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [withdrawPassword, setWithdrawPassword] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // 계정삭제 처리
  const handleAccountDeletion = useCallback(async () => {
    if (!withdrawPassword.trim()) {
      setPasswordError('비밀번호를 입력해주세요.');
      return;
    }

    setPasswordError('');
    setIsWithdrawing(true);
    try {
      await withdrawUser(withdrawPassword);
      alert('회원탈퇴가 완료되었습니다.');
      setShowDeleteModal(false);
      setWithdrawPassword('');
      setPasswordError('');
      // 삭제 후 로그인 페이지로 이동
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as {
          response?: {
            status?: number;
            data?: {
              message?: string;
              error?: string;
            };
          };
        };

        const status = apiError.response?.status;
        const errorData = apiError.response?.data;

        if (status === 400) {
          // API에서 받은 메시지가 있으면 사용, 없으면 기본 메시지
          const errorMessage =
            errorData?.message || '비밀번호가 일치하지 않습니다.';
          setPasswordError(errorMessage);
        } else if (status === 404) {
          const errorMessage =
            errorData?.message || '사용자 정보를 찾을 수 없습니다.';
          alert(errorMessage);
        } else if (status === 401) {
          const errorMessage =
            errorData?.message || '인증이 만료되었습니다. 다시 로그인해주세요.';
          alert(errorMessage);
        } else if (status === 403) {
          const errorMessage = errorData?.message || '접근 권한이 없습니다.';
          alert(errorMessage);
        } else if (status === 500) {
          const errorMessage =
            errorData?.message ||
            '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
          alert(errorMessage);
        } else if (status && status >= 500) {
          const errorMessage =
            errorData?.message ||
            '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
          alert(errorMessage);
        } else {
          const errorMessage =
            errorData?.message || '회원탈퇴 처리 중 오류가 발생했습니다.';
          alert(errorMessage);
        }
      } else if (error instanceof Error) {
        // 네트워크 오류 등
        if (
          error.message.includes('Network Error') ||
          error.message.includes('timeout')
        ) {
          alert(
            '네트워크 연결을 확인해주세요. 인터넷 연결 상태를 점검해주세요.'
          );
        } else if (error.message.includes('Request failed')) {
          alert('요청 처리에 실패했습니다. 잠시 후 다시 시도해주세요.');
        } else {
          alert(`오류가 발생했습니다: ${error.message}`);
        }
      } else {
        alert('알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsWithdrawing(false);
    }
  }, [withdrawPassword, navigate]);

  // 모달 닫기 시 상태 초기화
  const handleModalClose = useCallback(() => {
    setShowDeleteModal(false);
    setWithdrawPassword('');
    setPasswordError('');
  }, []);

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <PageContainer>
          <div>프로필 정보를 불러오는 중...</div>
        </PageContainer>
      </ThemeProvider>
    );
  }

  return (
    <>
      <UnifiedHeader variant='threeDepth' title='내 정보 - 회원정보 변경' />
      <ThemeProvider theme={theme}>
        <FormProvider {...methods}>
          <PageContainer>
            <Form onSubmit={(e) => e.preventDefault()}>
              {/* 이메일 아이디 (읽기 전용) */}
              <RowLabel>
                <CommonField
                  label='이메일 아이디'
                  id='emailId'
                  type='text'
                  readOnly
                  {...register('emailId')}
                />
                <span>@</span>
                <CommonField
                  label='이메일 도메인'
                  id='emailDomain'
                  type='text'
                  readOnly
                  {...register('emailDomain')}
                />
              </RowLabel>

              {/* 닉네임 (편집 가능) */}
              <CommonField
                label='닉네임'
                id='nickname'
                type='text'
                placeholder='닉네임을 입력하세요'
                {...register('nickname')}
                maxLength={8}
              />

              {/* 이름 & 태어난 해 (읽기 전용) */}
              <RowLabel>
                <CommonField
                  label='이름'
                  id='name'
                  type='text'
                  readOnly
                  {...register('name')}
                />

                <CommonField
                  label='태어난 해'
                  id='birthYear'
                  type='text'
                  readOnly
                  {...register('birthYear')}
                />
              </RowLabel>

              {/* 전화번호 (읽기 전용) */}
              <CommonField
                label='전화번호'
                id='phoneNumber'
                type='text'
                readOnly
                {...register('phoneNumber')}
              />

              {/* 성별 (읽기 전용) */}
              <CommonField
                label='성별'
                id='gender'
                as='select'
                readOnly
                {...register('gender')}
              >
                <option value='여성'>여성</option>
                <option value='남성'>남성</option>
              </CommonField>

              {/* 시/도 & 구/군 */}
              <RowLabel>
                <CommonField
                  label='시/도'
                  id='region'
                  as='select'
                  {...register('region', { required: '시/도를 선택하세요' })}
                >
                  <option value=''>시/도를 선택하세요</option>
                  {regionOptions}
                </CommonField>

                <CommonField
                  label='구/군'
                  id='district'
                  as='select'
                  {...register('district', { required: '구/군을 선택하세요' })}
                  disabled={!watch('region')}
                >
                  {districtOptions}
                </CommonField>
              </RowLabel>

              {errors.region && (
                <span style={{ color: 'red', fontSize: '0.9em' }}>
                  {errors.region.message}
                </span>
              )}
              {errors.district && (
                <span style={{ color: 'red', fontSize: '0.9em' }}>
                  {errors.district.message}
                </span>
              )}

              {/* 계정삭제 섹션 */}
              <Divider />
              <CommonField
                label='회원탈퇴'
                type='text'
                value='회원을 탈퇴하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.'
                readOnly
                buttonLabel='회원탈퇴'
                buttonColorType='red'
                onButtonClick={() => setShowDeleteModal(true)}
              />
            </Form>

            <FixedBottomBar
              text='저장'
              color='black'
              onClick={onSaveClick}
              disabled={isSubmitting}
            />

            <ReusableModal
              isOpen={showResultModal}
              onClose={handleResultModalClose}
              title='회원정보 수정'
            >
              {signupResult}
            </ReusableModal>

            {/* 회원탈퇴 확인 모달 */}
            <ReusableModal
              isOpen={showDeleteModal}
              onClose={handleModalClose}
              title='회원탈퇴 확인'
              actions={
                <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                  <button
                    onClick={handleModalClose}
                    style={{
                      flex: 1,
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}
                  >
                    취소
                  </button>
                  <button
                    onClick={handleAccountDeletion}
                    style={{
                      flex: 1,
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}
                    disabled={isWithdrawing}
                  >
                    {isWithdrawing ? '탈퇴 중...' : '회원탈퇴'}
                  </button>
                </div>
              }
            >
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <h4
                  style={{
                    color: '#dc3545',
                    marginBottom: '20px',
                    fontSize: '18px',
                    fontWeight: '600',
                  }}
                >
                  정말로 회원을 탈퇴하시겠습니까?
                </h4>
                <div
                  style={{
                    textAlign: 'left',
                    background: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '6px',
                    borderLeft: '4px solid #dc3545',
                    marginBottom: '20px',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#6c757d',
                  }}
                >
                  • 모든 개인정보가 영구적으로 삭제됩니다
                  <br />
                  • 주문 내역, 찜 목록 등 모든 데이터가 사라집니다
                  <br />• 삭제 후에는 복구할 수 없습니다
                </div>
                <div style={{ marginTop: '20px' }}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      textAlign: 'left',
                    }}
                  >
                    <label
                      htmlFor='withdrawPassword'
                      style={{
                        fontSize: '11px',
                        fontWeight: '500',
                        color: '#333',
                        marginBottom: '4px',
                      }}
                    >
                      비밀번호 확인
                    </label>
                    <input
                      id='withdrawPassword'
                      type='password'
                      placeholder='회원탈퇴를 위해 비밀번호를 입력하세요'
                      value={withdrawPassword}
                      onChange={(e) => {
                        setWithdrawPassword(e.target.value);
                        if (passwordError) setPasswordError('');
                      }}
                      minLength={6}
                      maxLength={20}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: passwordError
                          ? '1px solid #dc3545'
                          : '1px solid #ddd',

                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s ease',
                      }}
                    />
                    {passwordError && (
                      <div
                        style={{
                          color: '#dc3545',
                          fontSize: '12px',
                          marginTop: '4px',
                          textAlign: 'left',
                        }}
                      >
                        {passwordError}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ReusableModal>
          </PageContainer>
        </FormProvider>
      </ThemeProvider>
    </>
  );
};

export default UpdateProfile;

/* ========== Styled Components ========== */

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;

  max-width: 600px;
  margin: 0 auto;
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
  gap: 10px;
  width: 100%;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #e0e0e0;
  margin: 20px 0;
`;
