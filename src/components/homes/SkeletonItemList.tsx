import React from 'react';
import styled, { keyframes } from 'styled-components';

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

// skeletonShimmer keyframes를 SkeletonImage 선언보다 위에 위치
const skeletonShimmer = keyframes`
  0% { background-position: 0px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

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
