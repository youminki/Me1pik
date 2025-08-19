// src/pages/Profile/UpdateProfile.tsx

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import styled, { ThemeProvider } from 'styled-components';

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

  // 계정삭제 처리
  const handleAccountDeletion = useCallback(async () => {
    try {
      // TODO: 실제 계정삭제 API 호출
      // await deleteAccount();
      setShowDeleteModal(false);
      setSignupResult('✅ 계정이 성공적으로 삭제되었습니다.');
      setShowResultModal(true);
      // 삭제 후 로그인 페이지로 이동
      setTimeout(() => {
        // navigate('/login');
        // 또는 로그아웃 처리
      }, 2000);
    } catch (err: unknown) {
      console.error('계정삭제 오류:', err);
      const msg = getErrorMessage(err);
      setSignupResult(`❌ 계정삭제 중 오류가 발생했습니다: ${msg}`);
      setShowResultModal(true);
    }
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
              <AccountDeletionSection>
                <AccountDeletionTitle>계정삭제</AccountDeletionTitle>
                <AccountDeletionDescription>
                  계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수
                  없습니다.
                </AccountDeletionDescription>
                <DeleteAccountButton
                  type='button'
                  onClick={() => setShowDeleteModal(true)}
                >
                  계정삭제
                </DeleteAccountButton>
              </AccountDeletionSection>
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

            {/* 계정삭제 확인 모달 */}
            <ReusableModal
              isOpen={showDeleteModal}
              onClose={() => setShowDeleteModal(false)}
              title='계정삭제 확인'
            >
              <DeleteConfirmContent>
                <DeleteWarningText>
                  정말로 계정을 삭제하시겠습니까?
                </DeleteWarningText>
                <DeleteWarningDescription>
                  • 모든 개인정보가 영구적으로 삭제됩니다
                  <br />
                  • 주문 내역, 찜 목록 등 모든 데이터가 사라집니다
                  <br />• 삭제 후에는 복구할 수 없습니다
                </DeleteWarningDescription>
                <DeleteConfirmButtons>
                  <CancelButton onClick={() => setShowDeleteModal(false)}>
                    취소
                  </CancelButton>
                  <ConfirmDeleteButton onClick={handleAccountDeletion}>
                    계정삭제
                  </ConfirmDeleteButton>
                </DeleteConfirmButtons>
              </DeleteConfirmContent>
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

const AccountDeletionSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

const AccountDeletionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #dc3545;
  margin: 0;
`;

const AccountDeletionDescription = styled.p`
  font-size: 14px;
  color: #6c757d;
  line-height: 1.5;
  margin: 0;
`;

const DeleteAccountButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #c82333;
  }

  &:active {
    background: #bd2130;
  }
`;

const DeleteConfirmContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: center;
`;

const DeleteWarningText = styled.h4`
  font-size: 18px;
  font-weight: 600;
  color: #dc3545;
  margin: 0;
`;

const DeleteWarningDescription = styled.div`
  font-size: 14px;
  color: #6c757d;
  line-height: 1.6;
  text-align: left;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #dc3545;
`;

const DeleteConfirmButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const CancelButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #5a6268;
  }
`;

const ConfirmDeleteButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #c82333;
  }
`;
