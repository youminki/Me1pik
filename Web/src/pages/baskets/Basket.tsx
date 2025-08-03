// src/pages/Basket.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import {
  getCartItems,
  CartItemListResponse,
  deleteCartItem,
} from '@/api-utils/product-managements/carts/cart';
import PriceIcon from '@/assets/baskets/PriceIcon.svg';
import ProductInfoIcon from '@/assets/baskets/ProductInfoIcon.svg';
import ServiceInfoIcon from '@/assets/baskets/ServiceInfoIcon.svg';
import CancleIconIcon from '@/assets/headers/CancleIcon.svg';
import HomeIcon from '@/assets/headers/HomeIcon.svg';
import ShareIcon from '@/assets/headers/ShareIcon.svg';
import FixedBottomBar from '@/components/fixed-bottom-bar';
import EmptyState from '@/components/shared/EmptyState';
import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ReusableModal from '@/components/shared/modals/ReusableModal';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import HomeDetail from '@/pages/homes/HomeDetail';

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
  const { requireAuth } = useRequireAuth();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isNoSelectionModalOpen, setIsNoSelectionModalOpen] = useState(false);
  const [pendingPaymentPayloads, setPendingPaymentPayloads] = useState<
    BasketItemForPayment[]
  >([]);
  // 수정 모달 관련 상태 추가
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BasketItem | null>(null);
  const [isUpdateSuccessModalOpen, setIsUpdateSuccessModalOpen] =
    useState(false);
  // 전체 삭제 모달 관련 상태 추가
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
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

  // 컴포넌트 언마운트 시 body 스크롤 해제
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
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

  const handleEditClick = (item: BasketItem) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
    // 모달이 열릴 때 body 스크롤 잠금
    document.body.style.overflow = 'hidden';
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingItem(null);
    // 모달이 닫힐 때 body 스크롤 해제
    document.body.style.overflow = '';
  };

  const handleUpdateSuccess = () => {
    setIsUpdateSuccessModalOpen(false);
    // 모달이 닫힐 때 body 스크롤 해제
    document.body.style.overflow = '';
    // 장바구니 목록 새로고침
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
  };

  const handleDeleteAllClick = () => {
    setIsDeleteAllModalOpen(true);
  };

  const handleConfirmDeleteAll = async () => {
    // 선택된 모든 아이템 삭제
    const selectedItems = items.filter((item) => item.$isSelected);
    if (selectedItems.length === 0) {
      setIsDeleteAllModalOpen(false);
      return;
    }

    setIsDeletingAll(true);
    try {
      // 선택된 아이템들을 각각 삭제
      await Promise.all(selectedItems.map((item) => deleteCartItem(item.id)));

      // 삭제 성공 시 선택된 아이템들을 목록에서 제거
      setItems(items.filter((item) => !item.$isSelected));
      setIsDeleteAllModalOpen(false);
    } catch (err) {
      console.error('전체 삭제 실패', err);
      // 에러 발생 시에도 모달은 닫기
      setIsDeleteAllModalOpen(false);
    } finally {
      setIsDeletingAll(false);
    }
  };

  // 로그인이 필요한 기능들
  const handleSaveForLater = () => {
    requireAuth(() => {
      console.log('나중에 구매 기능 실행');
      // 실제 나중에 구매 로직
    }, '나중에 구매 기능을 사용하려면 로그인이 필요합니다.');
  };

  const handleShareBasket = () => {
    requireAuth(() => {
      console.log('장바구니 공유 기능 실행');
      // 실제 공유 로직
    }, '장바구니 공유 기능을 사용하려면 로그인이 필요합니다.');
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
              <HeaderLeftSection>
                <Checkbox
                  type='checkbox'
                  checked={items.every((item) => item.$isSelected)}
                  onChange={handleSelectAll}
                />
                <span>전체선택</span>
              </HeaderLeftSection>
              <HeaderRightSection>
                <DeleteAllButton
                  onClick={handleDeleteAllClick}
                  disabled={
                    items.filter((item) => item.$isSelected).length === 0
                  }
                >
                  전체 삭제
                </DeleteAllButton>
              </HeaderRightSection>
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
                        <img src={ServiceInfoIcon} alt='Service' />
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
                        <img src={ProductInfoIcon} alt='Product' />
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
                        <img src={PriceIcon} alt='Price' />
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

                  <ItemRightSection>
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
                  </ItemRightSection>
                </ContentWrapper>

                <ButtonContainer>
                  <DeleteButton onClick={() => handleDeleteClick(item.id)}>
                    삭제
                  </DeleteButton>
                  <EditButton onClick={() => handleEditClick(item)}>
                    수정하기
                  </EditButton>
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

            {/* 수정 모달 */}
            {isEditModalOpen && editingItem && (
              <ModalOverlay>
                <ModalBox>
                  <ModalHeaderWrapper>
                    <ModalHeaderContainer>
                      <LeftSection>
                        <CancleIcon
                          src={CancleIconIcon}
                          alt='취소'
                          onClick={handleEditModalClose}
                        />
                      </LeftSection>
                      <CenterSection />
                      <RightSection>
                        <ModalIcon src={ShareIcon} alt='공유' />
                        <ModalIcon
                          src={HomeIcon}
                          alt='홈'
                          onClick={() => navigate('/home')}
                        />
                      </RightSection>
                    </ModalHeaderContainer>
                  </ModalHeaderWrapper>
                  <ModalBody>
                    <HomeDetail
                      id={String(editingItem.productId)}
                      isEditMode={true}
                      cartItemId={editingItem.id}
                      initialData={{
                        serviceType: editingItem.serviceType,
                        rentalStartDate: editingItem.rentalStartDate,
                        rentalEndDate: editingItem.rentalEndDate,
                        size: editingItem.size,
                        color: editingItem.color,
                        quantity: 1,
                      }}
                      onUpdateSuccess={() => {
                        setIsEditModalOpen(false);
                        setIsUpdateSuccessModalOpen(true);
                      }}
                    />
                  </ModalBody>
                </ModalBox>
              </ModalOverlay>
            )}

            {/* 전체 삭제 확인 모달 */}
            <ReusableModal
              isOpen={isDeleteAllModalOpen}
              onClose={() => !isDeletingAll && setIsDeleteAllModalOpen(false)}
              title='전체 삭제'
              showConfirmButton={true}
              onConfirm={handleConfirmDeleteAll}
            >
              <div style={{ marginBottom: 16 }}>
                선택된 상품 {items.filter((item) => item.$isSelected).length}
                개를 장바구니에서 삭제하시겠습니까?
              </div>
              <div style={{ fontSize: 14, color: '#666' }}>
                삭제된 상품은 복구할 수 없습니다.
              </div>
              {isDeletingAll && (
                <div
                  style={{ marginTop: 16, textAlign: 'center', color: '#666' }}
                >
                  삭제 중...
                </div>
              )}
            </ReusableModal>

            {/* 수정 성공 모달 */}
            <ReusableModal
              isOpen={isUpdateSuccessModalOpen}
              onClose={handleUpdateSuccess}
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
                  onClick={handleUpdateSuccess}
                >
                  확인
                </button>
              }
            >
              장바구니 정보가 수정되었습니다.
            </ReusableModal>

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
                {pendingPaymentPayloads.map((item, idx) => {
                  const name =
                    item.nameCode.split('/')[1]?.trim() || item.nameCode;
                  const sizeNumber = item.size.match(/\d+/)?.[0] || item.size;
                  return (
                    <li
                      key={item.id + item.size + item.color + idx}
                      style={{
                        fontSize: 15,
                        marginBottom: 8,
                        listStyle: 'none',
                        fontWeight: 600,
                        color: '#222',
                      }}
                    >
                      {name}(SIZE {sizeNumber}, {item.color})
                    </li>
                  );
                })}
              </ul>
              <div
                style={{
                  position: 'sticky',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  background: '#fff',
                  padding: '18px 0 0 0',
                  marginTop: 18,
                  textAlign: 'center',
                  fontSize: 15,
                  color: '#444',
                  fontWeight: 500,
                  lineHeight: 1.6,
                  letterSpacing: '-0.01em',
                  borderTop: '1px solid #eee',
                  zIndex: 2,
                  boxSizing: 'border-box',
                }}
              >
                결제하기 버튼을 누르면
                <br />
                선택한 상품이 결제 페이지로 이동합니다.
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

            {/* 로그인이 필요한 기능 버튼들 */}
            <AuthButtonsContainer>
              <AuthButton onClick={handleSaveForLater}>
                💾 나중에 구매 (로그인 필요)
              </AuthButton>
              <AuthButton onClick={handleShareBasket}>
                📤 장바구니 공유 (로그인 필요)
              </AuthButton>
            </AuthButtonsContainer>
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
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const HeaderLeftSection = styled.div`
  display: flex;
  align-items: center;
`;

const HeaderRightSection = styled.div`
  display: flex;
  align-items: center;
`;

const DeleteAllButton = styled.button`
  background-color: #ff4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #cc3333;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const Checkbox = styled.input`
  width: 28px;
  height: 28px;
  margin-right: 8px;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: #ffffff;
  border: 1.5px solid #cccccc;
  cursor: pointer;
  position: relative;
  transition: border-color 0.2s;

  &:checked {
    background-color: #ffffff;
    border-color: #999999;
  }

  &:checked::after {
    content: '';
    position: absolute;
    top: 6px;
    left: 6px;
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

const ItemRightSection = styled.div`
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
  gap: 12px;
  margin-top: 24px;
  align-self: flex-end;
  @media (max-width: 600px) {
    gap: 8px;
    margin-top: 16px;
  }
`;

const DeleteButton = styled.button`
  background-color: #fff;
  color: #ff4444;
  width: 80px;
  height: 44px;
  white-space: nowrap;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid #ff4444;
  font-weight: 700;
  font-size: 13px;
  line-height: 1.2;
  text-align: center;
  transition: all 0.2s ease;

  &:hover {
    background-color: #ff4444;
    color: white;
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 600px) {
    width: 70px;
    height: 40px;
    font-size: 12px;
  }
`;

const EditButton = styled.button`
  background-color: #fff;
  color: #666;
  width: 80px;
  height: 44px;
  white-space: nowrap;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid #666;
  font-weight: 700;
  font-size: 13px;
  line-height: 1.2;
  text-align: center;
  transition: all 0.2s ease;

  &:hover {
    background-color: #666;
    color: white;
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 600px) {
    width: 70px;
    height: 40px;
    font-size: 12px;
  }
`;

const PurchaseButton = styled.button`
  background-color: #000;
  color: white;
  border: none;
  width: 100px;
  height: 44px;
  white-space: nowrap;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  font-size: 13px;
  line-height: 1.2;
  text-align: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #333;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 600px) {
    width: 85px;
    height: 40px;
    font-size: 12px;
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

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  /* 모달 바깥으로 스크롤 전파되지 않도록 */
  overscroll-behavior: contain;
`;

const ModalBox = styled.div`
  background: #fff;
  width: 100%;
  max-width: 1000px;
  height: 100%;
  overflow-y: auto;
  position: relative;
  /* 모달 내 스크롤이 바깥으로 전파되지 않도록 막음 */
  overscroll-behavior: contain;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ModalHeaderWrapper = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  background: #fff;
  z-index: 2100;
`;

const ModalHeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
`;

const ModalBody = styled.div`
  padding-top: 70px;
`;

const LeftSection = styled.div`
  cursor: pointer;
`;

const CenterSection = styled.div`
  flex: 1;
`;

const RightSection = styled.div`
  display: flex;
  gap: 19px;
`;

const CancleIcon = styled.img`
  cursor: pointer;
`;

const ModalIcon = styled.img`
  cursor: pointer;
`;

const AuthButtonsContainer = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  padding: 20px;
  margin-top: 20px;
`;

const AuthButton = styled.button`
  padding: 10px 20px;
  border: 2px solid #f7c600;
  background: white;
  color: #333;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f7c600;
    color: white;
  }
`;
