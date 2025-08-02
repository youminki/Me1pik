/**
 * 스켈레톤 아이템 카드 컴포넌트 (SkeletonItemList.tsx)
 *
 * 상품 로딩 중에 표시되는 스켈레톤 UI 컴포넌트입니다.
 * 실제 상품 카드와 동일한 레이아웃을 가지며, 애니메이션 효과를 제공합니다.
 *
 * @description
 * - 상품 카드와 동일한 레이아웃 구조
 * - shimmer 애니메이션 효과
 * - 이미지, 텍스트 스켈레톤 요소
 * - 반응형 디자인 지원
 */
import React from 'react';
import styled, { keyframes } from 'styled-components';

/**
 * 스켈레톤 아이템 카드 컴포넌트
 *
 * 로딩 중에 표시되는 스켈레톤 UI입니다.
 * 실제 상품 카드와 동일한 구조를 가지며 shimmer 애니메이션을 제공합니다.
 *
 * @returns 스켈레톤 아이템 카드 JSX 요소
 */
const SkeletonItemCard: React.FC = () => (
  <SkeletonCard>
    <ImageWrapper>
      <SkeletonImage />
    </ImageWrapper>
    <SkeletonText width='60%' height='14px' style={{ margin: '10px 0 0 0' }} />
    <SkeletonText
      width='80%'
      height='11px'
      style={{ margin: '5px 0 0 0', marginBottom: '4px' }}
    />
    <SkeletonText width='40%' height='14px' style={{ marginTop: '5px' }} />
  </SkeletonCard>
);

export default SkeletonItemCard;

/**
 * shimmer 애니메이션
 *
 * 스켈레톤 요소에 적용되는 shimmer 효과 애니메이션입니다.
 */
const skeletonShimmer = keyframes`
  0% { background-position: 0px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

/**
 * 스켈레톤 카드 컨테이너
 *

 * 스켈레톤 아이템 카드 전체를 감싸는 컨테이너입니다.
 * 실제 상품 카드와 동일한 레이아웃을 제공합니다.
 */
const SkeletonCard = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 100%;
  cursor: pointer;
  margin-bottom: 12px;
  width: 100%;
  min-width: 0;
`;

/**
 * 이미지 래퍼
 *

 * 스켈레톤 이미지를 감싸는 컨테이너입니다.
 * 실제 상품 이미지와 동일한 비율을 유지합니다.
 */
const ImageWrapper = styled.div`
  width: 100%;
  aspect-ratio: 2/3;
  min-height: 240px;
  background: #f5f5f5;
  border: 1px solid #ccc;
  overflow: hidden;
  flex-grow: 1;
  display: flex;
  align-items: stretch;
  @supports not (aspect-ratio: 2/3) {
    min-height: 240px;
    height: 360px;
  }
`;

/**
 * 스켈레톤 이미지
 *

 * 로딩 중에 표시되는 이미지 스켈레톤 요소입니다.
 * shimmer 애니메이션을 적용하여 로딩 상태를 시각적으로 표현합니다.
 */
const SkeletonImage = styled.div`
  width: 100%;
  height: 100%;
  min-height: 240px;
  aspect-ratio: 2/3;
  background: ${({ theme }) => theme.colors.gray3};
  background-image: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.gray3} 0px,
    ${({ theme }) => theme.colors.gray0} 40px,
    ${({ theme }) => theme.colors.gray3} 80px
  );
  background-size: 200px 100%;
  background-repeat: no-repeat;
  border-radius: ${({ theme }) => theme.radius.md};
  animation: ${skeletonShimmer} 0.5s infinite linear;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  transition: opacity 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
  pointer-events: none;
`;

/**
 * 스켈레톤 텍스트
 *

 * 로딩 중에 표시되는 텍스트 스켈레톤 요소입니다.
 * 다양한 크기와 위치로 실제 텍스트를 모방합니다.
 *
 * @param width - 텍스트 너비
 * @param height - 텍스트 높이
 */
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
