import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { FaUserCircle, FaPlus } from 'react-icons/fa';
import styled, { ThemeProvider } from 'styled-components';

import {
  useUserStyle,
  updateUserStyle,
} from '@/api-utils/user-managements/users/userApi';
import MyInfoListBackgroundimage from '@/assets/my-info/MyInfoListBackgroundimage.png';
import FixedBottomBar from '@/components/fixed-bottom-bar';
import CommonField from '@/components/shared/forms/CommonField';
import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';
import ReusableModal from '@/components/shared/modals/ReusableModal';
import { schemaMyStyle } from '@/hooks/useValidationYup';
import { theme } from '@/styles/Theme';

interface FormData {
  height: string;
  size: string;
  dress: string;
  top: string;
  bottom: string;
  brand: string;
  shoulder?: string;
  chest?: string;
  waist?: string;
  sleeve?: string;
}

const HEIGHT_OPTIONS = Array.from(
  { length: 190 - 140 + 1 },
  (_, i) => `${140 + i}`
);
const WEIGHT_RANGE = Array.from({ length: 90 - 30 + 1 }, (_, i) => `${30 + i}`);
const SIZE_OPTIONS = ['44', '55', '66', '77'] as const;

const SIZE_LABELS: Record<(typeof SIZE_OPTIONS)[number], string> = {
  '44': 'S',
  '55': 'M',
  '66': 'L',
  '77': 'XL',
};

const BRAND_OPTIONS = [
  '모조 (MOJO)',
  '듀엘 (DEW L)',
  '쥬크 (ZOOC)',
  '씨씨콜렉트 (CC Collect)',
  '미샤 (MICHAA)',
  '잇미샤 (it MICHAA)',
  '마쥬 (MAJE)',
  '산드로 (SANDRO)',
  '이로 (IRO)',
  '시슬리 (SISLEY)',
  '사틴 (SATIN)',
  '에스블랑 (S Blanc)',
  '올리브 데 올리브 (OLIVE DES OLIVE)',
  '클럽 모나코 (CLUB Monaco)',
  '데코 (DECO)',
  '에고이스트 (EGOIST)',
  '지고트 (JIGOTT)',
  '케네스 레이디 (KENNETH LADY)',
  '라인 (LINE)',
  '지컷 (G-cut)',
];

const MyStyle: React.FC = () => {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schemaMyStyle),
    mode: 'all',
    defaultValues: {
      height: '',
      size: '',
      dress: '',
      top: '',
      bottom: '',
      brand: '',
      shoulder: '',
      chest: '',
      waist: '',
      sleeve: '',
    },
  });

  const watched = {
    height: watch('height'),
    size: watch('size'),
    dress: watch('dress'),
    top: watch('top'),
    bottom: watch('bottom'),
  };

  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  const { data } = useUserStyle();

  // react-query로 스타일 데이터 패칭
  useEffect(() => {
    // 데이터가 없으면 반환
    if (!data) return;
    setValue('height', data.height != null ? data.height.toString() : '');
    setValue('size', data.weight != null ? data.weight.toString() : '');
    setValue('dress', data.dressSize ?? '');
    setValue('top', data.topSize ?? '');
    setValue('bottom', data.bottomSize ?? '');
    setSelectedBrands(data.preferredBrands ?? []);
    setValue('brand', (data.preferredBrands ?? []).join(', '));
    setValue(
      'shoulder',
      data.shoulderWidth != null ? data.shoulderWidth.toString() : ''
    );
    setValue(
      'chest',
      data.chestCircumference != null ? data.chestCircumference.toString() : ''
    );
    setValue(
      'waist',
      data.waistCircumference != null ? data.waistCircumference.toString() : ''
    );
    setValue(
      'sleeve',
      data.sleeveLength != null ? data.sleeveLength.toString() : ''
    );
  }, [data, setValue]);

  const onSubmit: SubmitHandler<FormData> = async (formData) => {
    try {
      // 폼 데이터를 API 형식으로 변환
      const updateData = {
        height: formData.height ? parseInt(formData.height) : undefined,
        weight: formData.size ? parseInt(formData.size) : undefined,
        topSize: formData.top || undefined,
        dressSize: formData.dress || undefined,
        bottomSize: formData.bottom || undefined,
        preferredBrands: selectedBrands,
        shoulderWidth: formData.shoulder
          ? parseInt(formData.shoulder.replace('cm', ''))
          : undefined,
        chestCircumference: formData.chest
          ? parseInt(formData.chest.replace('cm', ''))
          : undefined,
        waistCircumference: formData.waist
          ? parseInt(formData.waist.replace('cm', ''))
          : undefined,
        sleeveLength: formData.sleeve
          ? parseInt(formData.sleeve.replace('cm', ''))
          : undefined,
      };

      // API 호출
      await updateUserStyle(updateData);

      // 성공 처리
      // 스타일 정보가 업데이트되었습니다.
      alert('스타일 정보가 성공적으로 업데이트되었습니다.');
    } catch (e) {
      console.error(e);
      console.error('업데이트 중 오류가 발생했습니다.');
      alert('스타일 정보 업데이트 중 오류가 발생했습니다.');
    }
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const handleBrandSelect = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter((b) => b !== brand));
    } else if (selectedBrands.length < 3) {
      setSelectedBrands([...selectedBrands, brand]);
    }
    setValue('brand', selectedBrands.join(', '));
  };

  const handleCompleteSelection = () => {
    if (selectedBrands.length < 3) {
      // 경고 메시지 표시
      alert('3가지 브랜드를 선택해주세요.');
    } else {
      closeModal();
    }
  };

  const renderSelectOption = (
    value: string,
    display: string | React.ReactNode
  ) => (
    <option key={value} value={value}>
      {display}
    </option>
  );

  return (
    <ThemeProvider theme={theme}>
      <UnifiedHeader variant='threeDepth' title='내 스타일' />
      <Container>
        {/* Profile Section */}
        <ProfileSection>
          <ProfileImageWrapper>
            <ProfileImage>
              <ProfileIcon>
                <FaUserCircle size={80} />
              </ProfileIcon>
              <PlusButton>
                <FaPlus size={12} />
              </PlusButton>
            </ProfileImage>
          </ProfileImageWrapper>
        </ProfileSection>

        {/* Content Section */}
        <ContentSection>
          <FormWrapper>
            {/* 키, 몸무게 */}
            <Row>
              <CommonField
                as='select'
                label='키'
                id='height'
                error={errors.height?.message}
                {...register('height')}
              >
                <option value='' disabled hidden>
                  선택해주세요
                </option>
                {watched.height &&
                  !HEIGHT_OPTIONS.includes(watched.height) &&
                  renderSelectOption(watched.height, `${watched.height} cm`)}
                {HEIGHT_OPTIONS.map((h) => renderSelectOption(h, `${h} cm`))}
              </CommonField>

              <CommonField
                as='select'
                label='몸무게'
                id='size'
                error={errors.size?.message}
                {...register('size')}
              >
                <option value='' disabled hidden>
                  선택해주세요
                </option>
                {watched.size &&
                  !WEIGHT_RANGE.includes(watched.size) &&
                  renderSelectOption(watched.size, `${watched.size} kg`)}
                {WEIGHT_RANGE.map((w) => renderSelectOption(w, `${w} kg`))}
              </CommonField>
            </Row>

            <Divider />

            {/* 원피스·상의·하의 */}
            <Row>
              {(['dress', 'top', 'bottom'] as const).map((field) => {
                const labels = {
                  dress: '원피스 사이즈',
                  top: '상의 사이즈',
                  bottom: '하의 사이즈',
                } as const;
                return (
                  <Controller
                    key={field}
                    name={field}
                    control={control}
                    defaultValue=''
                    render={({ field: { value, onChange } }) => (
                      <CommonField
                        as='select'
                        label={labels[field]}
                        id={field}
                        error={errors[field]?.message}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                      >
                        <option value='' disabled hidden>
                          선택해주세요
                        </option>
                        {SIZE_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {`${s} (${SIZE_LABELS[s]})`}
                          </option>
                        ))}
                      </CommonField>
                    )}
                  />
                );
              })}
            </Row>

            <Divider />

            {/* 선호 브랜드 */}
            <Row>
              <CommonField
                label='선호 브랜드 선택 (최대 3가지)'
                id='brand'
                type='text'
                placeholder='브랜드 3가지를 선택하세요'
                error={errors.brand?.message}
                {...register('brand')}
                value={selectedBrands.join(', ')}
                buttonLabel='선택하기'
                onButtonClick={openModal}
              />
            </Row>

            <Divider />

            {/* 선택적 치수 */}
            <Row>
              <Controller
                name='shoulder'
                control={control}
                render={({ field }) => (
                  <CommonField
                    label='어깨너비 (선택)'
                    id='shoulder'
                    placeholder='선택해주세요'
                    error={errors.shoulder?.message}
                    {...field}
                    onChange={(e) => {
                      const num = e.target.value.replace(/\D/g, '');
                      field.onChange(num ? `${num}cm` : '');
                    }}
                  />
                )}
              />
              <Controller
                name='chest'
                control={control}
                render={({ field }) => (
                  <CommonField
                    label='가슴둘레 (선택)'
                    id='chest'
                    placeholder='선택해주세요'
                    error={errors.chest?.message}
                    {...field}
                    onChange={(e) => {
                      const num = e.target.value.replace(/\D/g, '');
                      field.onChange(num ? `${num}cm` : '');
                    }}
                  />
                )}
              />
            </Row>
            <Row style={{ marginTop: '10px' }}>
              <Controller
                name='waist'
                control={control}
                render={({ field }) => (
                  <CommonField
                    label='허리둘레 (선택)'
                    id='waist'
                    placeholder='선택해주세요'
                    error={errors.waist?.message}
                    {...field}
                    onChange={(e) => {
                      const num = e.target.value.replace(/\D/g, '');
                      field.onChange(num ? `${num}cm` : '');
                    }}
                  />
                )}
              />
              <Controller
                name='sleeve'
                control={control}
                render={({ field }) => (
                  <CommonField
                    label='소매길이 (선택)'
                    id='sleeve'
                    placeholder='선택해주세요'
                    error={errors.sleeve?.message}
                    {...field}
                    onChange={(e) => {
                      const num = e.target.value.replace(/\D/g, '');
                      field.onChange(num ? `${num}cm` : '');
                    }}
                  />
                )}
              />
            </Row>
          </FormWrapper>

          <ReusableModal
            isOpen={isModalOpen}
            onClose={closeModal}
            title='브랜드 선택 (3가지 선택)'
            width='500px'
            showConfirmButton={false}
            actions={
              <ButtonRow>
                <CancelButton onClick={closeModal}>취소</CancelButton>
                <CompleteButton onClick={handleCompleteSelection}>
                  선택완료
                </CompleteButton>
              </ButtonRow>
            }
          >
            <BrandSelectionContainer>
              <BrandSelectionGrid>
                {BRAND_OPTIONS.map((brand) => (
                  <BrandOption
                    key={brand}
                    selected={selectedBrands.includes(brand)}
                    onClick={() => handleBrandSelect(brand)}
                  >
                    {brand}
                  </BrandOption>
                ))}
              </BrandSelectionGrid>
            </BrandSelectionContainer>
          </ReusableModal>

          <FixedBottomBar
            text='정보 변경'
            color='yellow'
            onClick={() => handleSubmit(onSubmit)()}
          />
        </ContentSection>
      </Container>
    </ThemeProvider>
  );
};

export default MyStyle;

// Form 대신 div로 감싸기
const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: #fff;
  margin: -1rem;
  padding: 0;
  max-width: 600px;

  @media (min-width: 768px) {
    margin: 0 auto;
  }
`;

const ProfileSection = styled.div`
  position: relative;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: url(${MyInfoListBackgroundimage}) no-repeat center center;
  background-size: cover;
`;

const ProfileImageWrapper = styled.div`
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  z-index: 1;
`;

const ProfileImage = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const ProfileIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #ccc;
`;

const PlusButton = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 24px;
  height: 24px;
  background: #f6ae24;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border: 2px solid #fff;
`;

const ContentSection = styled.div`
  flex: 1;
  padding: 60px 20px 20px;
  background: #fff;
  border-radius: 20px 20px 0 0;
  margin-top: -20px;
  position: relative;
`;

const FormWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;
const Row = styled.div`
  display: flex;
  gap: 1rem;
`;
const Divider = styled.hr`
  border: none;
  width: 100%;
  border-top: 1px solid #eee;
  margin: 20px 0;
`;

const BrandSelectionContainer = styled.div`
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;

  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

const BrandSelectionGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
`;

const BrandOption = styled.div<{ selected: boolean }>`
  padding: 12px 8px;
  border: 1px solid ${({ selected }) => (selected ? '#000' : '#000000')};

  background: ${({ selected }) => (selected ? '#f0f0f0' : '#fff')};
  color: #000;
  text-align: center;
  cursor: pointer;
  font-size: 12px;
  font-weight: ${({ selected }) => (selected ? '600' : '400')};
  transition: all 0.2s ease;
  border-width: ${({ selected }) => (selected ? '2px' : '1px')};
  user-select: none;

  &:hover {
    border-color: #000;
    background: ${({ selected }) => (selected ? '#f0f0f0' : '#f9f9f9')};
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
  width: 100%;
`;

const CancelButton = styled.button`
  flex: 1;
  height: 50px;
  background-color: #cccccc;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: all 0.2s ease;
`;

const CompleteButton = styled(CancelButton)`
  background-color: #000;
`;
