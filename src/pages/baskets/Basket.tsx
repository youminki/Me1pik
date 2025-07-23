// src/pages/Basket.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import {
  getCartItems,
  CartItemListResponse,
} from '@/api-utils/product-managements/carts/cart';
import PriceIcon from '@/assets/baskets/PriceIcon.svg';
import ProductInfoIcon from '@/assets/baskets/ProductInfoIcon.svg';
import ServiceInfoIcon from '@/assets/baskets/ServiceInfoIcon.svg';
import FixedBottomBar from '@/components/fixed-bottom-bar';
import EmptyState from '@/components/shared/EmptyState';
import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ReusableModal from '@/components/shared/modals/ReusableModal';

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

const Basket: React.FC = () => {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isNoSelectionModalOpen, setIsNoSelectionModalOpen] = useState(false);
  const [pendingPaymentPayloads, setPendingPaymentPayloads] = useState<
    BasketItemForPayment[]
  >([]);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getCartItems()
      .then((data: CartItemListResponse[]) => {
        const withSelectFlag = data.map((item) => ({
          ...item,
          $isSelected: true,
        }));
        setItems(withSelectFlag);
      })
      .catch((err: unknown) => console.error('장바구니 목록 조회 실패', err))
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
    if (toPay.length === 0) {
      setIsNoSelectionModalOpen(true);
      return;
    }
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
    setPendingPaymentPayloads(payloads);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentModalConfirm = () => {
    if (pendingPaymentPayloads.length > 0) {
      const firstId = pendingPaymentPayloads[0].id;
      navigate(`/payment/${firstId}`, { state: pendingPaymentPayloads });
    }
    setIsPaymentModalOpen(false);
  };

  const handleDeleteClick = (id: number) => {
    setSelectedItemId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedItemId != null) {
      // deleteCartItem(selectedItemId).catch((err) =>
      //   console.error('삭제 실패', err)
      // );
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

  return (
    <>
      <UnifiedHeader variant='threeDepth' title='장바구니' />
      <Container>
        {loading ? (
          <LoadingSpinner label='장바구니를 불러오는 중입니다...' />
        ) : !items.length ? (
          <EmptyState message='장바구니에 담긴 상품이 없습니다.' />
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
                            <DetailHighlight>{item.size}</DetailHighlight>{' '}
                            <br />
                            색상 -{' '}
                            <DetailHighlight>{item.color}</DetailHighlight>
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

            {/* 결제할 아이템이 없을 때 모달 */}
            <ReusableModal
              isOpen={isNoSelectionModalOpen}
              onClose={() => setIsNoSelectionModalOpen(false)}
              title='알림'
              actions={
                <button
                  style={{
                    width: '100%',
                    height: '50px',
                    background: '#000',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                  onClick={() => setIsNoSelectionModalOpen(false)}
                >
                  확인
                </button>
              }
            >
              결제할 상품을 선택해주세요.
            </ReusableModal>

            {/* 결제할 아이템 정보 확인 모달 */}
            <ReusableModal
              isOpen={isPaymentModalOpen}
              onClose={() => setIsPaymentModalOpen(false)}
              title='결제 상품 확인'
              showConfirmButton={true}
              onConfirm={handlePaymentModalConfirm}
            >
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                총 {pendingPaymentPayloads.length}개 상품 결제
              </div>
              <ul
                style={{
                  maxHeight: 200,
                  overflowY: 'auto',
                  padding: 0,
                  margin: 0,
                }}
              >
                {pendingPaymentPayloads.map((item, idx) => (
                  <li
                    key={item.id + item.size + item.color + idx}
                    style={{ fontSize: 14, marginBottom: 4, listStyle: 'none' }}
                  >
                    <span style={{ color: '#888', fontWeight: 700 }}>
                      {item.nameCode}
                    </span>
                    <span style={{ marginLeft: 8, color: '#333' }}>
                      ({item.size}, {item.color})
                    </span>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 12, fontSize: 13, color: '#666' }}>
                결제하기를 누르면 선택한 상품이 결제 페이지로 이동합니다.
              </div>
            </ReusableModal>

            <ReusableModal
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              onConfirm={handleConfirmDelete}
              title='알림'
              showConfirmButton={true}
            >
              해당 제품을 삭제하시겠습니까?
            </ReusableModal>

            <ReusableModal
              isOpen={isBuyModalOpen}
              onClose={() => setIsBuyModalOpen(false)}
              onConfirm={handleConfirmBuy}
              title='알림'
              showConfirmButton={true}
            >
              해당 제품을 바로 구매하시겠습니까?
            </ReusableModal>
          </>
        )}
      </Container>
    </>
  );
};

export default Basket;

// --- styled-components 정의 (생략 없이 동일하게 유지) ---

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;

  padding-bottom: 180px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
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
