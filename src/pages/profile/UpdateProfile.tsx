// src/pages/Profile/UpdateProfile.tsx

import React, { useEffect, useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';

import InputField from '../../components/InputField';
import { CustomSelect } from '../../components/CustomSelect';
import Theme from '../../styles/Theme';
import FixedBottomBar from '../../components/FixedBottomBar';
import ReusableModal from '../../components/ReusableModal';
import { regionDistrictData } from '../../components/Signup/regionDistrictData';

// userApi에서 가져올 함수들
import { useMyInfo, updateMyInfo } from '../../api/user/userApi';

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

  const onSubmit: SubmitHandler<UpdateProfileFormData> = async (data) => {
    try {
      // PATCH /user/my-info 에 요청: nickname, address(시/도 + " " + 구/군)
      const payload = {
        nickname: data.nickname,
        address: `${data.region} ${data.district}`,
      };
      await updateMyInfo(payload);
      setSignupResult('✅ 회원정보가 성공적으로 업데이트되었습니다.');
      setShowResultModal(true);
    } catch (err: unknown) {
      console.error('회원정보 수정 오류:', err);
      const msg =
        err instanceof Error &&
        'response' in err &&
        (err as any).response?.data?.message
          ? (err as any).response.data.message
          : err instanceof Error
            ? err.message
            : '알 수 없는 오류';
      setSignupResult(`❌ 업데이트 중 오류가 발생했습니다: ${msg}`);
      setShowResultModal(true);
    }
  };

  const onSaveClick = () => {
    handleSubmit(onSubmit)();
  };

  const handleResultModalClose = () => {
    setShowResultModal(false);
    // 필요 시, 성공 후 다른 동작(ex: 뒤로 이동 등)을 이곳에 추가 가능
  };

  if (isLoading) {
    return (
      <ThemeProvider theme={Theme}>
        <Container>
          <div>프로필 정보를 불러오는 중...</div>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={Theme}>
      <FormProvider {...methods}>
        <Container>
          <Form onSubmit={(e) => e.preventDefault()}>
            {/* 이메일 아이디 (읽기 전용) */}
            <RowLabel>
              <InputField
                label='이메일 아이디'
                id='emailId'
                type='text'
                readOnly
                {...register('emailId')}
              />
              <span>@</span>
              <InputField
                label='이메일 도메인'
                id='emailDomain'
                type='text'
                readOnly
                {...register('emailDomain')}
              />
            </RowLabel>

            {/* 닉네임 (편집 가능) */}
            <InputField
              label='닉네임'
              id='nickname'
              type='text'
              placeholder='닉네임을 입력하세요'
              {...register('nickname')}
              maxLength={8}
            />

            {/* 이름 & 태어난 해 (읽기 전용) */}
            <RowLabel>
              <InputField
                label='이름'
                id='name'
                type='text'
                readOnly
                {...register('name')}
              />

              <InputField
                label='태어난 해'
                id='birthYear'
                type='text'
                readOnly
                {...register('birthYear')}
              />
            </RowLabel>

            {/* 전화번호 (읽기 전용) */}
            <InputField
              label='전화번호'
              id='phoneNumber'
              type='text'
              readOnly
              {...register('phoneNumber')}
            />

            {/* 성별 (읽기 전용) */}
            <InputField
              label='성별'
              id='gender'
              as={CustomSelect}
              readOnly
              {...register('gender')}
            >
              <option value='여성'>여성</option>
              <option value='남성'>남성</option>
            </InputField>

            {/* 시/도 & 구/군 */}
            <RowLabel>
              <InputField
                label='시/도'
                id='region'
                as={CustomSelect}
                {...register('region', { required: '시/도를 선택하세요' })}
              >
                <option value=''>시/도를 선택하세요</option>
                {Object.keys(regionDistrictData).map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </InputField>

              <InputField
                label='구/군'
                id='district'
                as={CustomSelect}
                {...register('district', { required: '구/군을 선택하세요' })}
                disabled={!watch('region')}
              >
                <option value=''>구/군을 선택하세요</option>
                {watch('region') &&
                  regionDistrictData[
                    watch('region') as keyof typeof regionDistrictData
                  ]?.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
              </InputField>
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
        </Container>
      </FormProvider>
    </ThemeProvider>
  );
};

export default UpdateProfile;

/* ========== Styled Components ========== */

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  padding: 1rem;
  max-width: 600px;
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
