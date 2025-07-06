// src/components/ItemCard.tsx
import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import PickIconOn from '../../assets/Home/PickIconOn.svg';
import PickIconOff from '../../assets/Home/PickIconOff.svg';
import { addToCloset, removeFromCloset } from '../../api/closet/closetApi';
import ReusableModal from '../ReusableModal2';

type ItemCardProps = {
  id: string;
  image: string;
  brand: string;
  description: string;
  price: number;
  discount: number;
  isLiked: boolean;
  onOpenModal: (id: string) => void;
  onDelete?: (id: string) => void;
};

type ConfirmAction = 'add' | 'remove' | null;

function ItemCard({
  id,
  image,
  brand,
  description,
  price,
  discount,
  isLiked: initialLiked,
  onOpenModal,
  onDelete,
}: ItemCardProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [animating, setAnimating] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

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
    let status;
    if (typeof err === 'object' && err !== null && 'response' in err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status = (err as any).response?.status;
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
    confirmAction === 'add' ? doAdd() : doRemove();
  };

  const modalTitle = confirmAction === 'add' ? '찜 등록 확인' : '삭제 확인';
  const modalMessage =
    confirmAction === 'add'
      ? '정말 이 상품을 내 옷장에 추가하시겠습니까?'
      : '정말 이 상품을 내 옷장에 삭제하시겠습니까?';

  return (
    <>
      <Card onClick={handleCardClick}>
        <ImageWrapper>
          {!imgLoaded && <SkeletonImage data-testid='skeleton-image' />}
          <Image
            src={image.split('#')[0] || '/default.jpg'}
            alt={brand}
            style={{
              display: imgLoaded ? 'block' : 'none',
              opacity: imgLoaded ? 1 : 0,
            }}
            onLoad={() => setImgLoaded(true)}
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
            <SkeletonText
              width='60%'
              height='14px'
              style={{ margin: '10px 0 0 0' }}
            />
            <SkeletonText
              width='80%'
              height='11px'
              style={{ margin: '5px 0 0 0', marginBottom: '4px' }}
            />
            <SkeletonText
              width='40%'
              height='14px'
              style={{ marginTop: '5px' }}
            />
          </>
        ) : (
          <>
            <Brand>{brand}</Brand>
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
}

export default ItemCard;

const Card = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  margin-bottom: 12px;
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 2/3;
  min-height: 240px;
  background: #f5f5f5;
  border: 1px solid #ccc;

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
  background: #f5f5f5;
  opacity: 0;
  transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
`;

const HookButton = styled.button<{ $isLiked: boolean; $animating: boolean }>`
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1.5px solid;
  border-color: ${({ $isLiked }) => ($isLiked ? '#fff' : '#F6AE24')};
  background: ${({ $isLiked }) => ($isLiked ? '#F6AE24' : '#fff')};
  transition:
    background 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  padding: 0;
  z-index: 2;
  box-sizing: border-box;
  overflow: hidden;
  transform: ${({ $animating }) => ($animating ? 'scale(1.18)' : 'scale(1)')};
  opacity: ${({ $animating }) => ($animating ? 0.8 : 1)};
  box-shadow: ${({ $animating }) =>
    $animating ? '0 0 12px #f6ae2444' : 'none'};
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
    border-width: 0 0 12px 12px;
    border-color: transparent transparent
      ${({ $isLiked }) => ($isLiked ? '#fff' : '#F6AE24')} transparent;
    background: none;
    z-index: 3;
  }
`;

const Brand = styled.h3`
  margin: 10px 0 0 0;
  font-weight: 900;
  font-size: 10px;
  line-height: 11px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Description = styled.p`
  margin: 5px 0 0 0;
  font-size: 11px;
  color: #999;
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
  background: #f6ae24;
  border-radius: 2px;
  margin-right: 5px;
`;

const OriginalPrice = styled.span`
  font-weight: 900;
  font-size: 14px;
`;

const SubPrice = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const NowLabel = styled.span`
  font-size: 9px;
`;

const DiscountLabel = styled.span`
  font-weight: 800;
  font-size: 11px;
  color: #f6ae24;
`;

// Skeleton UI 스타일 추가
const skeletonShimmer = keyframes`
  0% {
    background-position: 0px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;
const SkeletonImage = styled.div`
  width: 100%;
  height: 240px;
  background: #eee;
  background-image: linear-gradient(90deg, #eee 0px, #f5f5f5 40px, #eee 80px);
  background-size: 200px 100%;
  background-repeat: no-repeat;
  border-radius: 8px;
  animation: ${skeletonShimmer} 1.2s infinite linear;
  position: absolute;
  top: 0;
  left: 0;
`;
const SkeletonText = styled.div<{ width: string; height: string }>`
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  background: #eee;
  background-image: linear-gradient(90deg, #eee 0px, #f5f5f5 40px, #eee 80px);
  background-size: 200px 100%;
  background-repeat: no-repeat;
  border-radius: 4px;
  animation: ${skeletonShimmer} 1.2s infinite linear;
  margin-bottom: 6px;
`;
