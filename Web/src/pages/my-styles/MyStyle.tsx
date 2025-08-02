import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import styled, { ThemeProvider } from 'styled-components';

import { useUserStyle } from '@/api-utils/user-managements/users/userApi';
import FixedBottomBar from '@/components/fixed-bottom-bar';
import Modal from '@/components/melpiks/create-melpiks/settings/Modal';
import CommonField from '@/components/shared/forms/CommonField';
import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';
import ReusableModal from '@/components/shared/modals/ReusableModal';
import { schemaMyStyle } from '@/hooks/useValidationYup';
import { theme } from '@/styles/Theme';

/**
 * 내 스타일 페이지 컴포넌트 (MyStyle.tsx)
 *
 * 사용자의 신체 정보와 선호 스타일을 관리하는 페이지를 제공합니다.
 * 키, 사이즈, 선호 브랜드, 신체 치수 등을 입력하고 저장할 수 있습니다.
 *
 * @description
 * - 신체 정보 입력 (키, 사이즈)
 * - 의류 사이즈 설정 (드레스, 상의, 하의)
 * - 선호 브랜드 선택
 * - 신체 치수 입력 (어깨, 가슴, 허리, 소매)
 * - 실시간 유효성 검사
 * - 기존 데이터 불러오기 및 수정
 */

/**
 * 내 스타일 폼 데이터 인터페이스
 *
 * 내 스타일 페이지에서 사용되는 폼 데이터의 구조를 정의합니다.
 * React Hook Form과 연동하여 타입 안전성을 보장합니다.
 *
 * @property height - 키 (cm)
 * @property size - 사이즈 (S/M/L/XL)
 * @property dress - 드레스 사이즈
 * @property top - 상의 사이즈
 * @property bottom - 하의 사이즈
 * @property brand - 선호 브랜드
 * @property shoulder - 어깨 너비 (선택적)
 * @property chest - 가슴 둘레 (선택적)
 * @property waist - 허리 둘레 (선택적)
 * @property sleeve - 소매 길이 (선택적)
 */
interface FormData {
  height: string; // 키 (cm)
  size: string; // 사이즈 (S/M/L/XL)
  dress: string; // 드레스 사이즈
  top: string; // 상의 사이즈
  bottom: string; // 하의 사이즈
  brand: string; // 선호 브랜드
  shoulder?: string; // 어깨 너비 (선택적)
  chest?: string; // 가슴 둘레 (선택적)
  waist?: string; // 허리 둘레 (선택적)
  sleeve?: string; // 소매 길이 (선택적)
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

  // ReusableModal 상태
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState<string>();
  const [feedbackMessage, setFeedbackMessage] = useState<string>();

  const { data } = useUserStyle();

  /**
   * React Query를 사용한 스타일 데이터 조회
   *
   * 서버에서 사용자의 현재 스타일 정보를 가져와서 폼에 표시합니다.
   */
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

  const onSubmit: SubmitHandler<FormData> = async () => {
    try {
      // 성공 메시지
      setFeedbackTitle('성공');
      setFeedbackMessage('스타일 정보가 업데이트되었습니다.');
      setFeedbackOpen(true);
    } catch (e) {
      console.error(e);

      // 에러 메시지
      setFeedbackTitle('오류');
      setFeedbackMessage('업데이트 중 오류가 발생했습니다.');
      setFeedbackOpen(true);
    }
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const handleBrandSelect = (brands: string[]) => {
    setSelectedBrands(brands);
    setValue('brand', brands.join(', '));
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
      <PageContainer>
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

        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSelect={handleBrandSelect}
          selectedBrands={selectedBrands}
        />

        <FixedBottomBar
          text='정보 변경'
          color='yellow'
          onClick={() => handleSubmit(onSubmit)()}
        />

        {/* 성공/오류 피드백 모달 */}
        <ReusableModal
          isOpen={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          title={feedbackTitle}
          width='260px'
        >
          <p>{feedbackMessage}</p>
        </ReusableModal>
      </PageContainer>
    </ThemeProvider>
  );
};

export default MyStyle;

// Form 대신 div로 감싸기
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  padding: 1rem;
  max-width: 600px;
  margin: 0 auto;
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
