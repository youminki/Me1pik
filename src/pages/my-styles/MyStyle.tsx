import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import styled, { ThemeProvider } from 'styled-components';

import {
  useUserStyle,
  updateUserStyle,
  UserStyle,
} from '../../api-utils/user-managements/users/userApi';
import FixedBottomBar from '../../components/fixed-bottom-bar';
import Modal from '../../components/melpiks/create-melpiks/settings/Modal';
import { CustomSelect } from '../../components/shared/forms/CustomSelect';
import InputField from '../../components/shared/forms/InputField';
import ReusableModal from '../../components/shared/modals/ReusableModal';
import { schemaMyStyle } from '../../hooks/useValidationYup';
import { theme } from '../../styles/theme';

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

  // react-query로 스타일 데이터 패칭
  const { data } = useUserStyle();
  useEffect(() => {
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

  const onSubmit: SubmitHandler<FormData> = async (form) => {
    try {
      const payload: Partial<UserStyle> = {
        height: form.height ? parseFloat(form.height) : undefined,
        weight: form.size ? parseFloat(form.size) : undefined,
        dressSize: form.dress,
        topSize: form.top,
        bottomSize: form.bottom,
        preferredBrands: selectedBrands,
        shoulderWidth: form.shoulder ? parseFloat(form.shoulder) : undefined,
        chestCircumference: form.chest ? parseFloat(form.chest) : undefined,
        waistCircumference: form.waist ? parseFloat(form.waist) : undefined,
        sleeveLength: form.sleeve ? parseFloat(form.sleeve) : undefined,
      };
      await updateUserStyle(payload);

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
      <Container>
        <FormWrapper>
          {/* 키, 몸무게 */}
          <Row>
            <InputField
              label='키'
              id='height'
              as={CustomSelect}
              error={errors.height}
              {...register('height')}
            >
              <option value='' disabled hidden>
                선택해주세요
              </option>
              {watched.height &&
                !HEIGHT_OPTIONS.includes(watched.height) &&
                renderSelectOption(watched.height, `${watched.height} cm`)}
              {HEIGHT_OPTIONS.map((h) => renderSelectOption(h, `${h} cm`))}
            </InputField>

            <InputField
              label='몸무게'
              id='size'
              as={CustomSelect}
              error={errors.size}
              {...register('size')}
            >
              <option value='' disabled hidden>
                선택해주세요
              </option>
              {watched.size &&
                !WEIGHT_RANGE.includes(watched.size) &&
                renderSelectOption(watched.size, `${watched.size} kg`)}
              {WEIGHT_RANGE.map((w) => renderSelectOption(w, `${w} kg`))}
            </InputField>
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
                    <InputField
                      label={labels[field]}
                      id={field}
                      as={CustomSelect}
                      error={errors[field]}
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
                    </InputField>
                  )}
                />
              );
            })}
          </Row>

          <Divider />

          {/* 선호 브랜드 */}
          <Row>
            <InputField
              label='선호 브랜드 선택 (최대 3가지)'
              id='brand'
              type='text'
              placeholder='브랜드 3가지를 선택하세요'
              error={errors.brand}
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
                <InputField
                  label='어깨너비 (선택)'
                  id='shoulder'
                  placeholder='선택해주세요'
                  error={errors.shoulder}
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
                <InputField
                  label='가슴둘레 (선택)'
                  id='chest'
                  placeholder='선택해주세요'
                  error={errors.chest}
                  {...field}
                  onChange={(e) => {
                    const num = e.target.value.replace(/\D/g, '');
                    field.onChange(num ? `${num}cm` : '');
                  }}
                />
              )}
            />
          </Row>
          <Row>
            <Controller
              name='waist'
              control={control}
              render={({ field }) => (
                <InputField
                  label='허리둘레 (선택)'
                  id='waist'
                  placeholder='선택해주세요'
                  error={errors.waist}
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
                <InputField
                  label='소매길이 (선택)'
                  id='sleeve'
                  placeholder='선택해주세요'
                  error={errors.sleeve}
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
          height='200px'
        >
          <p>{feedbackMessage}</p>
        </ReusableModal>
      </Container>
    </ThemeProvider>
  );
};

export default MyStyle;

// Form 대신 div로 감싸기
const Container = styled.div`
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
