// 제품 정보 컴포넌트 - 제품 기본 정보 표시 및 찜 기능 제공
import React, { useState } from 'react';
import styled from 'styled-components';

import { addToCloset } from '@/api-utils/product-managements/closets/closetApi';
import AddTekIcon from '@/assets/homes/home-details/AddTek.svg';
import ReusableModal from '@/components/shared/modals/ReusableModal';

// 제품 정보 Props 인터페이스
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

// 메인 제품 정보 컴포넌트
const ProductInfo: React.FC<ProductInfoProps> = ({ item, productId }) => {
  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  // 찜 추가 클릭 핸들러
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
      {/* 브랜드 정보 */}
      <CategoryText>
        브랜드 <span className='gt'>&gt;</span>{' '}
        <span className='brand'>{item.brand}</span>
      </CategoryText>

      {/* 제품명 */}
      <ProductTitle>
        {item.product_num} / {item.name}
      </ProductTitle>

      <ContentContainer>
        {/* 가격 정보 */}
        <PriceContainer>
          <OriginalPrice>{item.retailPrice.toLocaleString()}원</OriginalPrice>
          <DiscountRow>
            <DiscountPercent>{item.discountPercent}%</DiscountPercent>
            <DiscountPrice>
              {item.discountPrice.toLocaleString()}원
            </DiscountPrice>
          </DiscountRow>
        </PriceContainer>

        {/* 찜 버튼 */}
        <TekImageContainer onClick={handleAddTekClick}>
          <img src={AddTekIcon} alt='찜 추가' width={80} height={80} />
        </TekImageContainer>
      </ContentContainer>

      {/* 결과 모달 */}
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

// 스타일 컴포넌트들
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
