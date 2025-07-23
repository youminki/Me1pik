import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import styled, { ThemeProvider } from 'styled-components';

import BottomBar from '@/components/bottom-navigation-mobile';
import AgreementSection from '@/components/melpiks/create-melpiks/settings/AgreementSection';
import Modal from '@/components/melpiks/create-melpiks/settings/Modal';
import { CustomSelect } from '@/components/shared/forms/CustomSelect';
import InputField from '@/components/shared/forms/InputField';
import { schemaSignupContemporary } from '@/hooks/useValidationYup';
import { theme } from '@/styles/Theme';

interface FormData {
  height: string;
  size: string;
  dress: string;
  top: string;
  bottom: string;
  brand: string;
  productCount: string;
  exposureFrequency: string;
}

const ContemporarySettings: React.FC = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schemaSignupContemporary),
    mode: 'all',
  });

  const [productCount] = useState<string>('상품 6개');
  const [exposureFrequency] = useState<string>('월 2회');
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  const onSubmit: SubmitHandler<FormData> = (data) => {
    console.log('Form Data: ', data);
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const handleBrandSelect = (brands: string[]) => {
    setSelectedBrands(brands);
    setValue('brand', brands.join(', '));
  };

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <AgreementSection />

          <Row>
            <InputField
              label='기본정보'
              id='height'
              as={CustomSelect}
              error={errors.height}
              {...register('height', { required: true })}
            >
              <option value='160'>160 cm</option>
              <option value='165'>165 cm</option>
              <option value='170'>170 cm</option>
              <option value='175'>175 cm</option>
            </InputField>
            <InputField
              label='사이즈'
              id='size'
              as={CustomSelect}
              error={errors.size}
              {...register('size', { required: true })}
            >
              <option value='S'>S</option>
              <option value='M'>M</option>
              <option value='L'>L</option>
            </InputField>
          </Row>
          <GrayLine />

          <Row>
            <InputField
              label='착용스펙 상세입력'
              id='dress'
              as={CustomSelect}
              error={errors.dress}
              {...register('dress', { required: true })}
            >
              <option value='원피스'>원피스</option>
            </InputField>
            <InputField
              label='상의'
              id='top'
              as={CustomSelect}
              error={errors.top}
              {...register('top', { required: true })}
            >
              <option value='상의'>상의</option>
            </InputField>
            <InputField
              label='하의'
              id='bottom'
              as={CustomSelect}
              error={errors.bottom}
              {...register('bottom', { required: true })}
            >
              <option value='하의'>하의</option>
            </InputField>
          </Row>
          <GrayLine />

          <Row>
            <InputField
              label='선호 브랜드 선택(최대 3가지)'
              id='brand'
              type='text'
              placeholder='브랜드 3가지를 선택하세요'
              error={errors.brand}
              {...register('brand')}
              readOnly
              value={selectedBrands.join(', ') || '브랜드 3가지를 선택하세요'}
              buttonLabel='선택하기'
              onButtonClick={openModal}
            />
          </Row>
          <GrayLine />
          <Row>
            <InputField
              label='상품 노출수 설정'
              id='productCount'
              as={CustomSelect}
              value={productCount}
              error={errors.productCount}
              {...register('productCount')}
              required
            >
              <option value='상품 6개'>상품 6개</option>
              <option value='상품 12개'>상품 12개</option>
            </InputField>

            <InputField
              label='노출기간 설정'
              id='exposureFrequency'
              as={CustomSelect}
              value={exposureFrequency}
              error={errors.exposureFrequency}
              {...register('exposureFrequency')}
              required
            >
              <option value='월 1회'>월 1회</option>
              <option value='월 2회'>월 2회</option>
            </InputField>
          </Row>

          <BottomBar buttonText='설정완료' onClick={handleSubmit(onSubmit)} />
        </Form>

        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSelect={handleBrandSelect}
          selectedBrands={selectedBrands}
        />
      </Container>
    </ThemeProvider>
  );
};

export default ContemporarySettings;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  margin: 0 auto;
  background-color: #fff;
  margin-bottom: 50px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
`;

const Row = styled.div`
  display: flex;
  gap: 15px;
`;

const GrayLine = styled.hr`
  border: none;
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.gray0};
`;
