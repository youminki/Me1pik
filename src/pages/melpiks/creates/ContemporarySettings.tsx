import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import styled, { ThemeProvider } from 'styled-components';

import BottomBar from '@/components/bottom-navigation-mobile';
import AgreementSection from '@/components/melpiks/create-melpiks/settings/AgreementSection';
import Modal from '@/components/melpiks/create-melpiks/settings/Modal';
import CommonField from '@/components/shared/forms/CommonField';
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
  const brandButtonLabel = '선택하기';

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
          <RowLabel>
            <CommonField
              label='상품 노출수 설정'
              id='productCount'
              as='select'
              value={productCount}
              error={errors.productCount?.message}
              {...register('productCount')}
              required
            >
              <option value='상품 6개'>상품 6개</option>
              <option value='상품 12개'>상품 12개</option>
            </CommonField>
            <CommonField
              label='노출기간 설정'
              id='exposureFrequency'
              as='select'
              value={exposureFrequency}
              error={errors.exposureFrequency?.message}
              {...register('exposureFrequency')}
              required
            >
              <option value='월 1회'>월 1회</option>
              <option value='월 2회'>월 2회</option>
            </CommonField>
          </RowLabel>
          <GrayLine />

          <RowLabel>
            <CommonField
              label='착용스펙 상세입력'
              id='dress'
              as='select'
              error={errors.dress?.message}
              {...register('dress', { required: true })}
            >
              <option value='원피스'>원피스</option>
            </CommonField>
            <CommonField
              label='상의'
              id='top'
              as='select'
              error={errors.top?.message}
              {...register('top', { required: true })}
            >
              <option value='상의'>상의</option>
            </CommonField>
            <CommonField
              label='하의'
              id='bottom'
              as='select'
              error={errors.bottom?.message}
              {...register('bottom', { required: true })}
            >
              <option value='하의'>하의</option>
            </CommonField>
          </RowLabel>
          <GrayLine />

          <RowLabel>
            <CommonField
              label='선호 브랜드 선택*(최대 3가지)'
              id='brand'
              type='text'
              placeholder='브랜드 3가지를 선택하세요'
              error={errors.brand?.message}
              {...register('brand')}
              readOnly
              value={selectedBrands.join(', ') || '브랜드 3가지를 선택하세요'}
              buttonLabel={brandButtonLabel}
              onButtonClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                openModal();
              }}
              onClick={openModal}
            />
          </RowLabel>

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

const GrayLine = styled.hr`
  border: none;
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.gray0};
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
