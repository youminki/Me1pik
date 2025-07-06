// src/pages/Basket.tsx
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import BasketIcon from '../assets/Basket/BasketIcon.svg';
import PriceIcon from '../assets/Basket/PriceIcon.svg';
import ProductInfoIcon from '../assets/Basket/ProductInfoIcon.svg';
import ServiceInfoIcon from '../assets/Basket/ServiceInfoIcon.svg';
import FixedBottomBar from '../components/FixedBottomBar';
import ReusableModal2 from '../components/ReusableModal2';
import { getCartItems, deleteCartItem } from '../api/cart/cart';
import { useNavigate } from 'react-router-dom';

interface BasketItemForPayment {
  id: number;
  brand: string;
  nameCode: string;
  nameType: string;
  type: 'rental' | 'purchase';
  servicePeriod?: string;
  size: string;
  color: string;
  price: number;
  imageUrl: string;
  $isSelected: boolean;
}

interface BasketItem {
  id: number;
  productId: number;
  product_num: string;
  name: string;
  productBrand: string;
  productThumbnail: string;
  serviceType: 'rental' | 'purchase';
  rentalStartDate?: string;
  rentalEndDate?: string;
  size: string;
  color: string;
  totalPrice: number;
  $isSelected: boolean;
}

const getServiceLabel = (type: string) => {
  if (type === 'rental') return '대여';
  if (type === 'purchase') return '구매';
  return type;
};

const shimmer = keyframes`
  0% { background-position: 0px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const SkeletonBox = styled.div<{ width: string; height: string }>`
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  background: #eee;
  background-image: linear-gradient(90deg, #eee 0px, #f5f5f5 20px, #eee 40px);
  background-size: 80px 100%;
  background-repeat: no-repeat;
  animation: ${shimmer} 1.2s infinite linear;
  border-radius: 4px;
`;

const SkeletonText = styled(SkeletonBox)``;

const SkeletonButton = styled(SkeletonBox)`
  border-radius: 8px;
`;

const SkeletonImage = styled.div`
  width: 100%;
  height: 210px;
  background: #eee;
  background-image: linear-gradient(90deg, #eee 0px, #f5f5f5 40px, #eee 80px);
  background-size: 200px 100%;
  background-repeat: no-repeat;
  border-radius: 8px;
  animation: ${shimmer} 1.2s infinite linear;
`;

const BasketSkeleton: React.FC = () => (
  <Container>
    <Header>
      <SkeletonBox width='20px' height='20px' style={{ marginRight: 8 }} />
      <SkeletonText width='80px' height='18px' />
    </Header>
    {Array.from({ length: 2 }).map((_, idx) => (
      <Item key={idx}>
        <ContentWrapper>
          <ItemDetails>
            <SkeletonText
              width='40%'
              height='14px'
              style={{ marginBottom: 8 }}
            />
            <SkeletonText
              width='60%'
              height='16px'
              style={{ marginBottom: 18 }}
            />
            <SkeletonText
              width='30%'
              height='13px'
              style={{ marginBottom: 18 }}
            />
            <SkeletonText
              width='80%'
              height='13px'
              style={{ marginBottom: 10 }}
            />
            <SkeletonText
              width='60%'
              height='13px'
              style={{ marginBottom: 10 }}
            />
            <SkeletonText
              width='50%'
              height='13px'
              style={{ marginBottom: 10 }}
            />
          </ItemDetails>
          <RightSection>
            <ItemImageContainer>
              <SkeletonBox
                width='20px'
                height='20px'
                style={{ position: 'absolute', left: 0, top: 0 }}
              />
              <SkeletonImage />
            </ItemImageContainer>
          </RightSection>
        </ContentWrapper>
        <ButtonContainer>
          <SkeletonButton
            width='91px'
            height='46px'
            style={{ marginRight: 10 }}
          />
          <SkeletonButton width='91px' height='46px' />
        </ButtonContainer>
      </Item>
    ))}
    <SkeletonButton width='100%' height='56px' style={{ marginTop: 20 }} />
  </Container>
);

const Basket: React.FC = () => {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getCartItems()
      .then((data) => {
        const withSelectFlag = data.map((item) => ({
          id: item.id,
          productId: item.productId,
          product_num: item.product_num,
          name: item.name,
          productBrand: item.productBrand,
          productThumbnail: item.productThumbnail,
          serviceType: item.serviceType,
          rentalStartDate: item.rentalStartDate,
          rentalEndDate: item.rentalEndDate,
          size: item.size,
          color: item.color,
          totalPrice: item.totalPrice ?? 0,
          $isSelected: true,
        }));
        setItems(withSelectFlag);
      })
      .catch((err) => console.error('장바구니 목록 조회 실패', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectAll = () => {
    const allSelected = items.every((i) => i.$isSelected);
    setItems(items.map((item) => ({ ...item, $isSelected: !allSelected })));
  };

  const handleSelectItem = (id: number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, $isSelected: !item.$isSelected } : item
      )
    );
  };

  const navigateToPayment = (item: BasketItem) => {
    const servicePeriod =
      item.rentalStartDate && item.rentalEndDate
        ? `${item.rentalStartDate} ~ ${item.rentalEndDate}`
        : undefined;
    const payload: BasketItemForPayment = {
      id: item.productId,
      brand: item.productBrand,
      nameCode: `${item.product_num} / ${item.name}`,
      nameType: '',
      type: item.serviceType,
      servicePeriod,
      size: item.size,
      color: item.color,
      price: item.totalPrice,
      imageUrl: item.productThumbnail,
      $isSelected: true,
    };
    navigate(`/payment/${item.productId}`, { state: [payload] });
  };

  // 수정된 부분: 선택된 모든 아이템을 payment로 보내도록 함
  const handleConfirmPayment = () => {
    const toPay = items.filter((item) => item.$isSelected);
    if (toPay.length === 0) return;

    const payloads: BasketItemForPayment[] = toPay.map((item) => ({
      id: item.productId,
      brand: item.productBrand,
      nameCode: `${item.product_num} / ${item.name}`,
      nameType: '',
      type: item.serviceType,
      servicePeriod:
        item.rentalStartDate && item.rentalEndDate
          ? `${item.rentalStartDate} ~ ${item.rentalEndDate}`
          : undefined,
      size: item.size,
      color: item.color,
      price: item.totalPrice,
      imageUrl: item.productThumbnail,
      $isSelected: true,
    }));
    const firstId = payloads[0].id;
    navigate(`/payment/${firstId}`, { state: payloads });
  };

  const handleDeleteClick = (id: number) => {
    setSelectedItemId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedItemId != null) {
      deleteCartItem(selectedItemId).catch((err) =>
        console.error('삭제 실패', err)
      );
      setItems(items.filter((item) => item.id !== selectedItemId));
      setSelectedItemId(null);
    }
    setIsDeleteModalOpen(false);
  };

  const handleBuyClick = (id: number) => {
    setSelectedItemId(id);
    setIsBuyModalOpen(true);
  };

  const handleConfirmBuy = () => {
    setIsBuyModalOpen(false);
    const item = items.find((i) => i.id === selectedItemId);
    if (item) navigateToPayment(item);
  };

  if (loading) {
    return <BasketSkeleton />;
  }

  return (
    <Container>
      {items.length === 0 ? (
        <EmptyContainer>
          <Icon src={BasketIcon} alt='장바구니 아이콘' />
          <EmptyText>장바구니가 비어있습니다</EmptyText>
        </EmptyContainer>
      ) : (
        <>
          <Header>
            <Checkbox
              type='checkbox'
              checked={items.every((item) => item.$isSelected)}
              onChange={handleSelectAll}
            />
            <span>전체선택</span>
          </Header>

          {items.map((item) => (
            <Item key={item.id}>
              <ContentWrapper>
                <ItemDetails>
                  <Brand>{item.productBrand}</Brand>
                  <ItemName>
                    <Code>{item.product_num}</Code>
                    <Slash>/</Slash>
                    <Name>{item.name}</Name>
                  </ItemName>

                  <InfoRowFlex>
                    <IconArea>
                      <Icon src={ServiceInfoIcon} alt='Service' />
                    </IconArea>
                    <TextContainer>
                      <RowText>
                        <LabelDetailText>진행 서비스 - </LabelDetailText>
                        <DetailHighlight>
                          {getServiceLabel(item.serviceType)}
                        </DetailHighlight>
                      </RowText>
                      {item.rentalStartDate && item.rentalEndDate && (
                        <AdditionalText>
                          <DetailText>
                            {item.rentalStartDate} ~ {item.rentalEndDate}
                          </DetailText>
                        </AdditionalText>
                      )}
                    </TextContainer>
                  </InfoRowFlex>

                  <InfoRowFlex>
                    <IconArea>
                      <Icon src={ProductInfoIcon} alt='Product' />
                    </IconArea>
                    <TextContainer>
                      <RowText>
                        <LabelDetailText>제품정보</LabelDetailText>
                      </RowText>
                      <AdditionalText>
                        <DetailText>
                          사이즈 -{' '}
                          <DetailHighlight>{item.size}</DetailHighlight> <br />
                          색상 - <DetailHighlight>{item.color}</DetailHighlight>
                        </DetailText>
                      </AdditionalText>
                    </TextContainer>
                  </InfoRowFlex>

                  <InfoRowFlex>
                    <IconArea>
                      <Icon src={PriceIcon} alt='Price' />
                    </IconArea>
                    <TextContainer>
                      <RowText>
                        <LabelDetailText>결제금액 - </LabelDetailText>
                        <DetailHighlight>
                          {item.totalPrice.toLocaleString()}원
                        </DetailHighlight>
                      </RowText>
                    </TextContainer>
                  </InfoRowFlex>
                </ItemDetails>

                <RightSection>
                  <ItemImageContainer>
                    <CheckboxOverlay>
                      <Checkbox
                        type='checkbox'
                        checked={item.$isSelected}
                        onChange={() => handleSelectItem(item.id)}
                      />
                    </CheckboxOverlay>
                    <ItemImage src={item.productThumbnail} alt={item.name} />
                  </ItemImageContainer>
                </RightSection>
              </ContentWrapper>

              <ButtonContainer>
                <DeleteButton onClick={() => handleDeleteClick(item.id)}>
                  삭제
                </DeleteButton>
                <PurchaseButton onClick={() => handleBuyClick(item.id)}>
                  바로구매
                </PurchaseButton>
              </ButtonContainer>
            </Item>
          ))}

          <FixedBottomBar
            onClick={handleConfirmPayment}
            text='결제하기'
            color='yellow'
          />

          <ReusableModal2
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleConfirmDelete}
            title='알림'
          >
            해당 제품을 삭제하시겠습니까?
          </ReusableModal2>

          <ReusableModal2
            isOpen={isBuyModalOpen}
            onClose={() => setIsBuyModalOpen(false)}
            onConfirm={handleConfirmBuy}
            title='알림'
          >
            해당 제품을 바로 구매하시겠습니까?
          </ReusableModal2>
        </>
      )}
    </Container>
  );
};

export default Basket;

// --- styled-components 정의 (생략 없이 동일하게 유지) ---

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  padding: 1rem;
  max-width: 600px;
`;

const EmptyContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #888;
  pointer-events: none;
`;

const EmptyText = styled.p`
  margin-top: 16px;
  font-weight: 400;
  font-size: 14px;
  line-height: 15px;
  text-align: center;

  color: #aaaaaa;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  margin-right: 8px;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: #ffffff;
  border: 1px solid #cccccc;

  cursor: pointer;
  position: relative;

  &:checked {
    background-color: #ffffff;
    border-color: #999999;
  }

  &:checked::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 10px;
    height: 5px;
    border-left: 3px solid orange;
    border-bottom: 3px solid orange;
    transform: rotate(-45deg);
  }

  &:focus {
    outline: none;
  }
`;

const Item = styled.div`
  display: flex;
  flex-direction: column;
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  padding: 30px 0;
  margin-bottom: 15px;
  background-color: #fff;
`;

const ContentWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const ItemDetails = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Brand = styled.div`
  font-weight: 900;
  font-size: 12px;
  line-height: 11px;
  color: #000000;

  @media (max-width: 480px) {
    margin: 0;
    font-size: 11px;
  }
`;

const ItemName = styled.div`
  display: flex;
  align-items: center;
  margin-top: 6px;
  margin-bottom: 28px;

  @media (max-width: 480px) {
    /* 모바일에선 세로 정렬 */
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 16px;
  }
`;

const LabelDetailText = styled.span`
  font-weight: 700;
  font-size: 14px;
  line-height: 22px;
  color: #000000;
  white-space: nowrap;
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const DetailText = styled.span`
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: #000000;
  white-space: nowrap;
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const DetailHighlight = styled.span`
  font-weight: 900;
  font-size: 14px;
  line-height: 22px;
  color: #000000;
  white-space: nowrap;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const InfoRowFlex = styled.div`
  display: flex;
  align-items: stretch;
  gap: 5px;
  width: 100%;
`;

const IconArea = styled.div`
  flex: 0 0 auto;
  display: flex;
  align-items: flex-start;
  justify-content: center;
`;

const TextContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 20px;
  @media (max-width: 480px) {
    margin-bottom: 10px;
  }
`;

const RowText = styled.div`
  display: flex;
  gap: 5px;
  white-space: nowrap;
`;

const AdditionalText = styled.div`
  display: flex;
  gap: 5px;
  white-space: nowrap;
`;

const RightSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-left: 10px;
`;

const ItemImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 210px;
  @media (min-width: 600px) {
    width: 200px;
    height: auto;
  }
`;

const CheckboxOverlay = styled.div`
  position: absolute;
`;

const ItemImage = styled.img`
  width: 100%;
  height: 100%;
  border: 1px solid #ddd;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
  align-self: flex-end;
  @media (max-width: 600px) {
    margin-top: 10px;
  }
`;

const DeleteButton = styled.button`
  background-color: #fff;
  color: #888;
  width: 91px;
  height: 46px;
  white-space: nowrap;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid #ddd;
  font-weight: 800;
  font-size: 14px;
  line-height: 15px;
  text-align: center;
  color: #999999;
  @media (max-width: 600px) {
    width: 60px;
    height: 40px;
  }
`;

const PurchaseButton = styled.button`
  background-color: black;
  color: white;
  border: none;
  width: 91px;
  height: 46px;
  white-space: nowrap;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid #ddd;
  font-weight: 800;
  font-size: 14px;
  line-height: 15px;
  text-align: center;
  @media (max-width: 600px) {
    width: 60px;
    height: 40px;
  }
`;

const Code = styled.span`
  font-weight: 700;
  font-size: 13px;
  color: #999;
  margin-right: 4px;
  @media (max-width: 480px) {
    margin: 0;
    font-size: 13px;
  }
`;

const Slash = styled.span`
  font-weight: 700;
  font-size: 15px;
  color: #000;
  margin: 0 4px;
  @media (max-width: 480px) {
    display: none;
  }
`;

const Name = styled.span`
  font-weight: 700;
  font-size: 15px;
  color: #000;
  @media (max-width: 480px) {
    margin-top: 4px;
    font-size: 14px;
  }
`;

const Icon = styled.img`
  width: auto;
  height: auto;
`;
