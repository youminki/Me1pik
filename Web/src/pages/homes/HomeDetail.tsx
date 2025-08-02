/**
 * 상품 상세 페이지 컴포넌트 (HomeDetail.tsx)
 *
 * 개별 상품의 상세 정보를 표시하는 페이지를 제공합니다.
 * 상품 이미지 슬라이더, 상품 정보, 옵션 선택, 장바구니 추가,
 * 구매/대여 서비스 선택 등의 기능을 포함합니다.
 *
 * @description
 * - 상품 이미지 슬라이더 및 갤러리
 * - 상품 정보 및 옵션 선택 (사이즈, 색상)
 * - 구매/대여 서비스 선택
 * - 장바구니 추가 및 수정
 * - 상품 상세 정보 표시 (재질, 사이즈 가이드)
 * - 결제 방법 및 서비스 기간 선택
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

import {
  addCartItem,
  updateCartItem,
} from '@/api-utils/product-managements/carts/cart';
import {
  useProductInfo,
  ProductDetail as APIProductDetail,
} from '@/api-utils/product-managements/uploads/productApi';
import ShoppingBasket from '@/assets/homes/home-details/ShoppingBasket.svg';
import BottomBar from '@/components/homes/home-details/BottomBar';
import ImageSlider from '@/components/homes/home-details/ImageSlider';
import MaterialInfo from '@/components/homes/home-details/MaterialInfo';
import PaymentMethod from '@/components/homes/home-details/PaymentMethod';
import ProductDetails from '@/components/homes/home-details/ProductDetails';
import ProductInfo from '@/components/homes/home-details/ProductInfo';
import ProductOptions from '@/components/homes/home-details/ProductOptions';
import RentalOptions from '@/components/homes/home-details/RentalOptions';
import ServiceSelection from '@/components/homes/home-details/ServiceSelection';
import SizeInfo from '@/components/homes/home-details/SizeInfo';
import ErrorMessage from '@/components/shared/ErrorMessage';
import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';
import ReusableModal from '@/components/shared/modals/ReusableModal';

interface HomeDetailProps {
  id?: string;
  isEditMode?: boolean;
  cartItemId?: number;
  initialData?: {
    serviceType: 'rental' | 'purchase';
    rentalStartDate?: string;
    rentalEndDate?: string;
    size: string;
    color: string;
    quantity: number;
  };
  onUpdateSuccess?: () => void;
}

const HomeDetail: React.FC<HomeDetailProps> = ({
  id: propId,
  isEditMode = false,
  cartItemId,
  initialData,
  onUpdateSuccess,
}) => {
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const id = propId || params.id;
  const { data, isLoading, isError } = useProductInfo(Number(id));
  const product = useMemo(() => {
    if (!data) return null;
    const api = data.product as APIProductDetail;
    const labelGuide = api.size_label_guide as
      | Record<string, string>
      | undefined;
    return {
      ...api,
      size_label_guide: labelGuide,
    } as APIProductDetail;
  }, [data]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedService, setSelectedService] = useState<
    'rental' | 'purchase' | ''
  >('');
  const [warnModalOpen, setWarnModalOpen] = useState(false);
  const [warnMessage, setWarnMessage] = useState('');
  const [servicePeriod, setServicePeriod] = useState<string>('');

  // 초기 데이터 추적을 위한 상태
  const [initialFormData, setInitialFormData] = useState<{
    size: string;
    color: string;
    serviceType: 'rental' | 'purchase' | '';
    servicePeriod: string;
  } | null>(null);

  // 수정 모드일 때 초기 데이터 설정
  useEffect(() => {
    if (isEditMode && initialData) {
      const formattedServicePeriod =
        initialData.rentalStartDate && initialData.rentalEndDate
          ? (() => {
              const startDate = new Date(initialData.rentalStartDate);
              const endDate = new Date(initialData.rentalEndDate);
              const formattedStart = `${startDate.getFullYear()}.${String(startDate.getMonth() + 1).padStart(2, '0')}.${String(startDate.getDate()).padStart(2, '0')}`;
              const formattedEnd = `${endDate.getFullYear()}.${String(endDate.getMonth() + 1).padStart(2, '0')}.${String(endDate.getDate()).padStart(2, '0')}`;
              return `${formattedStart} ~ ${formattedEnd}`;
            })()
          : '';

      setSelectedSize(initialData.size);
      setSelectedColor(initialData.color);
      setSelectedService(initialData.serviceType);
      setServicePeriod(formattedServicePeriod);

      // 초기 데이터 저장
      setInitialFormData({
        size: initialData.size,
        color: initialData.color,
        serviceType: initialData.serviceType,
        servicePeriod: formattedServicePeriod,
      });
    }
  }, [isEditMode, initialData]);

  // 변경사항 감지
  const hasChanges = useMemo(() => {
    if (!isEditMode || !initialFormData) return false;

    return (
      selectedSize !== initialFormData.size ||
      selectedColor !== initialFormData.color ||
      selectedService !== initialFormData.serviceType ||
      servicePeriod !== initialFormData.servicePeriod
    );
  }, [
    isEditMode,
    initialFormData,
    selectedSize,
    selectedColor,
    selectedService,
    servicePeriod,
  ]);

  // 수정완료 버튼 활성화 조건
  const canUpdate = useMemo(() => {
    if (!isEditMode) return true;

    // 필수 필드 검증
    if (!selectedService || !selectedSize || !selectedColor) return false;

    // 대여 서비스인 경우 대여 기간 필수
    if (selectedService === 'rental' && !servicePeriod) return false;

    // 변경사항이 있는 경우에만 활성화
    return hasChanges;
  }, [
    isEditMode,
    selectedService,
    selectedSize,
    selectedColor,
    servicePeriod,
    hasChanges,
  ]);

  // 이미지 슬라이드
  const images = useMemo<string[]>(() => {
    if (!product) return [];
    return product.product_img.length
      ? product.product_img
      : [product.mainImage];
  }, [product]);

  const handleSwipeLeft = useCallback(() => {
    setCurrentImageIndex((i) => (images.length ? (i + 1) % images.length : 0));
  }, [images.length]);

  const handleSwipeRight = useCallback(() => {
    setCurrentImageIndex((i) =>
      images.length ? (i === 0 ? images.length - 1 : i - 1) : 0
    );
  }, [images.length]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const onMove = (ev: MouseEvent) => {
        if (Math.abs(ev.clientX - startX) > 50) {
          if (ev.clientX - startX > 0) {
            handleSwipeRight();
          } else {
            handleSwipeLeft();
          }
          window.removeEventListener('mousemove', onMove);
          window.removeEventListener('mouseup', onUp);
        }
      };
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [handleSwipeLeft, handleSwipeRight]
  );

  // 서비스 변경
  const handleServiceChange = (service: string) => {
    if (service === 'rental' && (!selectedSize || !selectedColor)) {
      setWarnMessage('사이즈와 색상을 먼저 선택해주세요.');
      setWarnModalOpen(true);
      return;
    }
    setSelectedService(service as 'rental' | 'purchase');
  };

  if (isLoading) return <HomeDetailSkeleton />;
  if (isError || !product)
    return <ErrorMessage message='제품을 찾을 수 없습니다.' />;

  const productInfoItem = {
    brand: product.brand,
    product_num: product.product_num,
    name: product.name,
    retailPrice: product.retailPrice,
    discountPercent: product.discountPercent,
    discountPrice: product.discountPrice,
  };

  const handleCartIconClick = async () => {
    if (!selectedService) {
      setWarnMessage('서비스 방식을 선택해주세요.');
      setWarnModalOpen(true);
      return;
    }
    if (!selectedSize || !selectedColor) {
      setWarnMessage('사이즈와 색상을 선택해주세요.');
      setWarnModalOpen(true);
      return;
    }
    if (selectedService === 'rental' && !servicePeriod) {
      setWarnMessage('대여 기간을 선택해주세요.');
      setWarnModalOpen(true);
      return;
    }

    // rental이나 purchase에 따라 요청 객체 생성
    const [start, end] = servicePeriod
      ? servicePeriod.split(' ~ ').map((d) => d.replace(/\./g, '-'))
      : [undefined, undefined];

    if (isEditMode && cartItemId) {
      // 수정 모드: 장바구니 업데이트
      const updateReq = {
        serviceType: selectedService,
        rentalStartDate: selectedService === 'rental' ? start : undefined,
        rentalEndDate: selectedService === 'rental' ? end : undefined,
        size: selectedSize,
        color: selectedColor,
        quantity: 1,
        isSelected: true,
      };
      try {
        await updateCartItem(cartItemId, updateReq);
        onUpdateSuccess?.(); // 성공 시 콜백만 호출
      } catch (err) {
        console.error('장바구니 수정 실패', err);
        setWarnMessage('장바구니 수정에 실패했습니다.');
        setWarnModalOpen(true);
      }
    } else {
      // 일반 모드: 장바구니 추가
      const cartReq = {
        productId: product.id,
        serviceType: selectedService,
        rentalStartDate: selectedService === 'rental' ? start : undefined,
        rentalEndDate: selectedService === 'rental' ? end : undefined,
        size: selectedSize,
        color: selectedColor,
        quantity: 1,
        totalPrice: selectedService === 'purchase' ? product.retailPrice : 0, // 필요 시 다르게 계산
      };
      try {
        await addCartItem(cartReq);
        setCartModalOpen(true);
      } catch (err) {
        console.error('장바구니 추가 실패', err);
        setWarnMessage('장바구니에 추가하는데 실패했습니다.');
        setWarnModalOpen(true);
      }
    }
  };

  // 제품 주문하기
  const handleOrderClick = () => {
    if (!selectedService) {
      setWarnMessage('서비스 방식을 선택해주세요.');
      setWarnModalOpen(true);
      return;
    }
    if (!selectedSize || !selectedColor) {
      setWarnMessage('사이즈와 색상을 선택해주세요.');
      setWarnModalOpen(true);
      return;
    }
    if (selectedService === 'rental' && !servicePeriod) {
      setWarnMessage('대여 기간을 선택해주세요.');
      setWarnModalOpen(true);
      return;
    }

    const itemData = {
      id: product.id,
      brand: product.brand,
      nameCode: product.product_num,
      nameType: product.name,
      type: selectedService as 'rental' | 'purchase',
      servicePeriod,
      size: selectedSize,
      color: selectedColor,
      price: selectedService === 'rental' ? 0 : product.retailPrice,
      imageUrl: product.mainImage,
    };
    navigate(`/payment/${product.id}`, { state: [itemData] });
  };

  return (
    <DetailContainer>
      <UnifiedHeader variant='oneDepth' title='상품 상세' />
      <ImageSlider
        images={images}
        currentImageIndex={currentImageIndex}
        handleSwipeLeft={handleSwipeLeft}
        handleSwipeRight={handleSwipeRight}
        handleMouseDown={handleMouseDown}
      />

      <ContentContainer>
        <ProductInfo item={productInfoItem} productId={product.id} />

        <ProductOptions
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          sizeOptions={product.sizes.map((s) => s.size)}
          colorOptions={product.color.split(',').map((c) => c.trim())}
        />

        <ServiceSelectionWrapper>
          <ServiceSelection
            selectedService={selectedService}
            setSelectedService={handleServiceChange}
          />
        </ServiceSelectionWrapper>

        <ConditionalContainer>
          {selectedService === 'rental' && (
            <RentalOptions
              productId={product.id}
              selectedSize={selectedSize}
              onSelectPeriod={(formatted) => setServicePeriod(formatted)}
            />
          )}
          {selectedService === 'purchase' && <PaymentMethod />}
        </ConditionalContainer>

        <Separator />

        <SizeInfo
          productSizes={product.sizes}
          size_picture={product.size_picture}
          labelGuide={product.size_label_guide}
        />

        <Separator />

        <MaterialInfo
          materialData={{
            두께감: product.thickness,
            신축성: product.elasticity,
            안감: product.lining,
            촉감: product.fit,
            비침: product.transparency,
          }}
        />

        <Separator />

        <ProductDetails
          fabricComposition={{
            겉감: product.fabricComposition[0] || '',
            안감: product.fabricComposition[1] || '',
            배색: product.fabricComposition[2] || '',
            부속: product.fabricComposition[3] || '',
          }}
          detailsData={{
            품번: product.product_num,
            시즌: product.season,
            제조사: product.manufacturer,
          }}
        />
      </ContentContainer>

      {warnModalOpen && (
        <ReusableModal
          isOpen={warnModalOpen}
          onClose={() => setWarnModalOpen(false)}
          title='알림'
          width='80%'
        >
          <ErrorMsg>{warnMessage}</ErrorMsg>
        </ReusableModal>
      )}

      {cartModalOpen && (
        <ReusableModal
          isOpen
          onClose={() => setCartModalOpen(false)}
          title='알림'
          width='80%'
        >
          <div
            style={{ textAlign: 'center', fontSize: '14px', padding: '20px' }}
          >
            장바구니에 추가되었습니다.
          </div>
        </ReusableModal>
      )}

      {/* updateModalOpen 관련 모달 삭제 */}
      {/*
      {updateModalOpen && (
        <ReusableModal
          isOpen
          onClose={() => {
            setUpdateModalOpen(false);
            onUpdateSuccess?.();
          }}
          title='알림'
          width='80%'
        >
          <div
            style={{ textAlign: 'center', fontSize: '14px', padding: '20px' }}
          >
            장바구니 정보가 수정되었습니다.
          </div>
        </ReusableModal>
      )}
      */}

      <BottomBar
        cartIconSrc={ShoppingBasket}
        orderButtonLabel={isEditMode ? '수정 완료' : '제품 주문하기'}
        onOrderClick={isEditMode ? handleCartIconClick : handleOrderClick}
        onCartClick={handleCartIconClick}
        orderButtonDisabled={isEditMode ? !canUpdate : false}
      />
    </DetailContainer>
  );
};

export default HomeDetail;

// — Styled Components (생략 없이 유지) —
// ... (위에 있던 모든 styled-components 정의를 그대로 붙여 넣으시면 됩니다) ...

// — Styled Components
const DetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  max-width: 600px;
  margin: 0 auto 100px;
  box-sizing: border-box;
`;

const ContentContainer = styled.div`
  padding: 1rem;
`;

const ServiceSelectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
`;

const ConditionalContainer = styled.div`
  margin-top: 20px;
`;

const Separator = styled.div`
  border: 1px solid #ccc;
  margin: 30px 0;
`;

const ErrorMsg = styled.div`
  font-size: 14px;
  font-weight: 700;
  text-align: center;
`;

// 상세페이지용 스켈레톤 UI
const HomeDetailSkeleton: React.FC = () => (
  <DetailContainer>
    {/* 이미지 슬라이더 영역 */}
    <ImageSliderSkeleton>
      <SkeletonImage />
    </ImageSliderSkeleton>
    <ContentContainer>
      {/* 상품 정보 */}
      <SkeletonText width='40%' height='22px' style={{ marginBottom: 12 }} />
      <SkeletonText width='60%' height='16px' style={{ marginBottom: 18 }} />
      <SkeletonText width='30%' height='18px' style={{ marginBottom: 24 }} />

      {/* 옵션 선택 영역 */}
      <SkeletonText width='80%' height='18px' style={{ marginBottom: 16 }} />
      <SkeletonText width='60%' height='18px' style={{ marginBottom: 16 }} />
      <SkeletonText width='50%' height='18px' style={{ marginBottom: 24 }} />

      {/* 서비스 선택/버튼 영역 */}
      <SkeletonButton width='100%' height='48px' style={{ marginBottom: 18 }} />
      <SkeletonButton width='100%' height='48px' />

      {/* 구분선 */}
      <SkeletonDivider />

      {/* 사이즈/소재/상세정보 등 */}
      <SkeletonText width='30%' height='16px' style={{ marginBottom: 10 }} />
      <SkeletonText width='90%' height='12px' style={{ marginBottom: 8 }} />
      <SkeletonText width='80%' height='12px' style={{ marginBottom: 8 }} />
      <SkeletonText width='70%' height='12px' style={{ marginBottom: 8 }} />
      <SkeletonText width='60%' height='12px' style={{ marginBottom: 8 }} />
      <SkeletonText width='50%' height='12px' style={{ marginBottom: 8 }} />
    </ContentContainer>
    {/* 하단 바(버튼) */}
    <BottomBarSkeleton>
      <SkeletonButton width='48%' height='44px' style={{ marginRight: '4%' }} />
      <SkeletonButton width='48%' height='44px' />
    </BottomBarSkeleton>
  </DetailContainer>
);

// 스켈레톤 스타일
const shimmer = keyframes`
  0% { background-position: 0px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;
const SkeletonImage = styled.div`
  width: 100%;
  height: 360px;
  background: #eee;
  background-image: linear-gradient(90deg, #eee 0px, #f5f5f5 40px, #eee 80px);
  background-size: 200px 100%;
  background-repeat: no-repeat;
  border-radius: 8px;
  animation: ${shimmer} 1.2s infinite linear;
`;
const SkeletonText = styled.div<{ width: string; height: string }>`
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  background: #eee;
  background-image: linear-gradient(90deg, #eee 0px, #f5f5f5 40px, #eee 80px);
  background-size: 200px 100%;
  background-repeat: no-repeat;
  border-radius: 4px;
  animation: ${shimmer} 1.2s infinite linear;
  margin-bottom: 6px;
`;
const SkeletonButton = styled.div<{ width: string; height: string }>`
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  background: #f6ae24;
  opacity: 0.2;
  border-radius: 8px;
  margin-bottom: 6px;
`;
const SkeletonDivider = styled.div`
  width: 100%;
  height: 1px;
  background: #eee;
  margin: 30px 0;
`;
const ImageSliderSkeleton = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;
const BottomBarSkeleton = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto 20px;
  padding: 0 1rem;
`;

// SubHeader 스켈레톤
export const SubHeaderSkeleton: React.FC = () => (
  <SubHeaderWrapper>
    <ContentWrapper>
      {/* 좌측 화살표 (데스크탑) */}
      <ArrowButtonSkeleton />
      {/* 카테고리 아이콘들 */}
      <IconsWrapper>
        {Array.from({ length: 8 }).map((_, i) => (
          <IconContainer key={i} selected={false}>
            <SkeletonCircle />
            <SkeletonText width='60%' height='12px' />
          </IconContainer>
        ))}
        <IndicatorSkeleton />
      </IconsWrapper>
      {/* 우측 화살표 (데스크탑) */}
      <ArrowButtonSkeleton />
    </ContentWrapper>
    <SubHeaderSkeletonDivider />
  </SubHeaderWrapper>
);

const SkeletonCircle = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #eee;
  background-image: linear-gradient(90deg, #eee 0px, #f5f5f5 20px, #eee 40px);
  background-size: 80px 100%;
  background-repeat: no-repeat;
  animation: ${shimmer} 1.2s infinite linear;
  margin-bottom: 6px;
`;
const ArrowButtonSkeleton = styled.div`
  display: none;
  @media (min-width: 1024px) {
    display: flex;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #eee;
    background-image: linear-gradient(90deg, #eee 0px, #f5f5f5 10px, #eee 20px);
    background-size: 40px 100%;
    background-repeat: no-repeat;
    animation: ${shimmer} 1.2s infinite linear;
    margin: 0 8px;
  }
`;
const IndicatorSkeleton = styled.div`
  position: absolute;
  left: 20px;
  bottom: 0;
  width: 50px;
  height: 4px;
  border-radius: 2px;
  background: #f6ae24;
  opacity: 0.2;
`;

// SubHeaderSkeleton에서 사용하는 스타일 컴포넌트 복사
const SubHeaderWrapper = styled.div`
  position: relative;
  width: 100%;
  background: #fff;
`;
const ContentWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
`;
const IconsWrapper = styled.div`
  position: relative;
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  &::-webkit-scrollbar {
    display: none;
  }
`;
const IconContainer = styled.div<{ selected: boolean }>`
  flex: 0 0 auto;
  width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 10px 0;
  opacity: ${({ selected }) => (selected ? 1 : 0.6)};
`;
const SubHeaderSkeletonDivider = styled.div`
  width: 100%;
  border-bottom: 1px solid #eeeeee;
  margin-top: 4px;
`;
