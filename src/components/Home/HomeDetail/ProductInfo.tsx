import React, { useState } from 'react';
import styled from 'styled-components';
import AddTekImage from '../../../assets/ClosetIcon.svg';
import { addToCloset } from '../../../api/closet/closetApi';
import ReusableModal from '../../ReusableModal';

export interface ProductInfoProps {
  item: {
    brand: string;
    product_num: string;
    name: string;
    retailPrice: number;
    discountPercent: number;
    discountPrice: number;
  };
  productId: number;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ item, productId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  const handleAddTekClick = async () => {
    try {
      await addToCloset(productId);
      setModalTitle('성공');
      setModalMessage('찜 목록에 추가되었습니다!');
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      const status = error?.response?.status;
      if (status === 409) setModalMessage('이미 찜한 상품입니다.');
      else if (status === 401) setModalMessage('로그인이 필요합니다.');
      else setModalMessage('에러가 발생했습니다.');
      setModalTitle('알림');
      console.error(err);
    } finally {
      setIsModalOpen(true);
    }
  };

  return (
    <InfoContainer>
      <CategoryText>
        브랜드 <span className='gt'>&gt;</span>{' '}
        <span className='brand'>{item.brand}</span>
      </CategoryText>
      <ProductTitle>
        {item.product_num} / {item.name}
      </ProductTitle>

      <ContentContainer>
        <PriceContainer>
          <OriginalPrice>{item.retailPrice.toLocaleString()}원</OriginalPrice>
          <DiscountRow>
            <DiscountPercent>{item.discountPercent}%</DiscountPercent>
            <DiscountPrice>
              {item.discountPrice.toLocaleString()}원
            </DiscountPrice>
          </DiscountRow>
        </PriceContainer>

        <TekImageContainer onClick={handleAddTekClick}>
          <TekImage src={AddTekImage} alt='찜 추가' />
        </TekImageContainer>
      </ContentContainer>

      <ReusableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      >
        {modalMessage}
      </ReusableModal>
    </InfoContainer>
  );
};

export default ProductInfo;

const InfoContainer = styled.div`
  width: 100%;
  margin-bottom: 30px;
`;
const CategoryText = styled.p`
  font-size: 11px;
  font-weight: 400;

  color: #000;
  & > span.gt {
    color: #ddd;
    padding: 0 4px;
  }
  & > span.brand {
    font-weight: 800;
  }
`;
const ProductTitle = styled.h2`
  font-weight: 700;
  font-size: 16px;
  margin: 8px 0;
`;
const ContentContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const PriceContainer = styled.div`
  display: flex;
  flex-direction: column;
`;
const OriginalPrice = styled.span`
  font-weight: 700;
  font-size: 12px;
  line-height: 13px;
  text-decoration-line: line-through;

  color: #999999;
`;
const DiscountRow = styled.div`
  display: flex;
  align-items: baseline;
  margin-top: 10px;
`;

const DiscountPercent = styled.span`
  color: #f6ae24;
  margin-right: 10px;
  font-weight: 900;
  font-size: 18px;
`;

const DiscountPrice = styled.span`
  font-weight: 900;
  font-size: 18px;
  line-height: 20px;
`;

const TekImageContainer = styled.div`
  cursor: pointer;
`;
const TekImage = styled.img`
  width: 80px;
  height: 80px;
`;
