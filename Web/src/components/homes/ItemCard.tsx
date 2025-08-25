// src/components/ItemCard.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import {
  addToCloset,
  removeFromCloset,
} from '@/api-utils/product-managements/closets/closetApi';
import PickIconOff from '@/assets/homes/PickIconOff.svg';
import PickIconOn from '@/assets/homes/PickIconOn.svg';
import { SkeletonLine } from '@/components/homes/SkeletonItemList';
import ReusableModal from '@/components/shared/modals/ReusableModal';

interface ItemCardProps {
  id: string;
  image: string;
  brand: string;
  description: string;
  price: number;
  discount: number;
  isLiked: boolean;
  onOpenModal: (id: string) => void;
  onDelete?: (id: string) => void;
  isFirstItem?: boolean; // 첫 번째 아이템 여부 추가
}

type ConfirmAction = 'add' | 'remove' | null;

// 기존 함수형 컴포넌트 → React.memo로 감싸기
const ItemCard = React.memo(function ItemCard({
  id,
  image,
  brand,
  description,
  price,
  discount,
  isLiked: initialLiked,
  onOpenModal,
  onDelete,
  isFirstItem = false, // 첫 번째 아이템 여부 추가
}: ItemCardProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [animating, setAnimating] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  // 첫 번째 이미지 프리로드
  useEffect(() => {
    if (isFirstItem && image) {
      const img = new window.Image();
      img.src = image.split('#')[0] || '/default.jpg';
    }
  }, [isFirstItem, image]);

  const displayDescription = description.includes('/')
    ? description.split('/')[1]
    : description;

  const handleCardClick = () => onOpenModal(id);
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (animating) return;
    setConfirmAction(liked ? 'remove' : 'add');
  };

  const doAdd = async () => {
    setLiked(true);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);
    try {
      await addToCloset(+id);
    } catch (err: unknown) {
      setLiked(false);
      showError(err);
    }
  };

  const doRemove = async () => {
    setLiked(false);
    try {
      await removeFromCloset(+id);
      onDelete?.(id);
    } catch (err: unknown) {
      setLiked(true);
      showError(err);
    }
  };

  const showError = (err: unknown) => {
    let status: number | undefined;
    if (
      typeof err === 'object' &&
      err !== null &&
      'response' in err &&
      typeof (err as Record<string, unknown>).response === 'object' &&
      (err as { response?: { status?: number } }).response?.status
    ) {
      status = (err as { response: { status: number } }).response.status;
    }
    const msg =
      status === 409
        ? '이미 찜한 상품입니다.'
        : status === 401
          ? '로그인이 필요합니다.'
          : '찜 처리 중 오류가 발생했습니다.';
    setErrorMsg(msg);
    setErrorModalOpen(true);
  };

  const closeConfirm = () => setConfirmAction(null);
  const handleConfirm = () => {
    closeConfirm();
    if (confirmAction === 'add') {
      doAdd();
    } else {
      doRemove();
    }
  };

  const modalTitle = confirmAction === 'add' ? '찜 등록 확인' : '삭제 확인';
  const modalMessage =
    confirmAction === 'add'
      ? '정말 이 상품을 내 옷장에 추가하시겠습니까?'
      : '정말 이 상품을 내 옷장에 삭제하시겠습니까?';

  return (
    <>
      <Card onClick={handleCardClick} data-item-card data-item-id={id}>
        <ImageWrapper>
          <Image
            src={image.split('#')[0] || '/default.jpg'}
            alt={brand}
            loading={isFirstItem ? 'eager' : 'lazy'}
            width={'100%'}
            height={'100%'}
            className={imgLoaded ? 'loaded' : ''}
            onLoad={() => setImgLoaded(true)}
            decoding={isFirstItem ? 'sync' : 'async'}
          />
          <HookButton
            $isLiked={liked}
            $animating={animating}
            onClick={handleLikeClick}
          >
            <img
              src={liked ? PickIconOn : PickIconOff}
              alt={liked ? '찜됨' : '찜하기'}
              style={{ width: 20, height: 16 }}
            />
          </HookButton>
        </ImageWrapper>
        {!imgLoaded ? (
          <>
            <SkeletonLine
              width='60%'
              height='14px'
              style={{ margin: '10px 0 0 0' }}
            />
            <SkeletonLine
              width='80%'
              height='11px'
              style={{ margin: '5px 0 0 0', marginBottom: '4px' }}
            />
            <SkeletonLine
              width='40%'
              height='14px'
              style={{ marginTop: '5px' }}
            />
          </>
        ) : (
          <>
            <Brand data-testid='brand'>{brand}</Brand>
            <Description>{displayDescription}</Description>
            <PriceWrapper>
              <PointBar />
              <OriginalPrice>{price.toLocaleString()}원</OriginalPrice>
              <SubPrice>
                <NowLabel>NOW</NowLabel>
                <DiscountLabel>{discount}%</DiscountLabel>
              </SubPrice>
            </PriceWrapper>
          </>
        )}
      </Card>

      <ReusableModal
        isOpen={confirmAction !== null}
        onClose={closeConfirm}
        onConfirm={handleConfirm}
        title={modalTitle}
        showConfirmButton={true}
      >
        <p>{modalMessage}</p>
      </ReusableModal>

      <ReusableModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        title='오류'
      >
        <p>{errorMsg}</p>
      </ReusableModal>
    </>
  );
});

export default ItemCard;

const Card = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ImageWrapper = styled.div`
  width: 100%;
  aspect-ratio: 2/3;
  min-height: 240px;
  height: auto;
  display: flex;
  align-items: stretch;
  position: relative;
  background: ${({ theme }) => theme.colors.gray3};
  border: 1px solid ${({ theme }) => theme.colors.gray1};
  overflow: hidden;
  @supports not (aspect-ratio: 2/3) {
    min-height: 240px;
    height: 360px;
  }
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  min-height: 240px;
  aspect-ratio: 2/3;
  object-fit: cover;
  display: block;
  background: ${({ theme }) => theme.colors.gray0};
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;

  &.loaded {
    opacity: 1;
  }
`;

const HookButton = styled.button<{ $isLiked: boolean; $animating: boolean }>`
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.colors.gray1};
  border-right: none;
  border-bottom: none;
  background: ${({ $isLiked, theme }) =>
    $isLiked ? theme.colors.yellow : theme.colors.white};
  transition:
    background ${({ theme }) => theme.transition.base},
    border-color ${({ theme }) => theme.transition.base},
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  padding: 0;
  z-index: 2;
  box-sizing: border-box;
  overflow: hidden;
  transform: ${({ $animating }) => ($animating ? 'scale(1.18)' : 'scale(1)')};
  opacity: ${({ $animating }) => ($animating ? 0.8 : 1)};
  img {
    width: 20px;
    height: 16px;
    display: block;
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
    transform: ${({ $animating }) => ($animating ? 'scale(1.18)' : 'scale(1)')};
  }
  &::after {
    content: '';
    position: absolute;
    right: 0;
    bottom: 0;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 0 10px 10px;
    border-color: transparent transparent
      ${({ $isLiked, theme }) =>
        $isLiked ? theme.colors.white : theme.colors.yellow}
      transparent;
    background: none;
    z-index: 3;
  }
`;

const Brand = styled.h3`
  margin: ${({ theme }) => theme.spacing.sm} 0 0 0;
  font-weight: 900;
  font-size: 10px;
  line-height: 11px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Description = styled.p`
  margin: 5px 0 0 0;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray2};
  font-weight: 700;
  margin-bottom: 4px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const PriceWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 5px;

  position: relative;

  @media (max-width: 768px) {
    margin-top: 5px;
    margin-left: 5px;
  }
`;

const PointBar = styled.div`
  display: block;
  width: 2px;
  height: 16px;
  background: ${({ theme }) => theme.colors.yellow};
  border-radius: 2px;
  margin-right: 5px;
`;

const OriginalPrice = styled.span`
  font-weight: 900;
  font-size: 14px;
`;

const SubPrice = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 4px;
`;

const NowLabel = styled.span`
  font-size: 9px;
`;

const DiscountLabel = styled.span`
  font-weight: 800;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.yellow};
`;
