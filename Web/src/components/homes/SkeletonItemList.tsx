import React from 'react';
import styled, { keyframes, css } from 'styled-components';

const SkeletonItemCard: React.FC = () => (
  <SkeletonCard>
    <ImageWrapper>
      <ShimmerBlock aria-hidden />
    </ImageWrapper>
    <SkeletonLine width='60%' height='14px' style={{ margin: '10px 0 0 0' }} />
    <SkeletonLine
      width='80%'
      height='11px'
      style={{ margin: '5px 0 0 0', marginBottom: 4 }}
    />
    <SkeletonLine width='40%' height='14px' style={{ marginTop: 5 }} />
  </SkeletonCard>
);

export { SkeletonCard, SkeletonLine };
export default SkeletonItemCard;

/* ---------- animations ---------- */
const shimmer = keyframes`
  0%   { transform: translate3d(-150%, 0, 0); }
  100% { transform: translate3d(250%, 0, 0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.95; }
  50%      { opacity: 0.75; }
`;

/* ---------- shared tokens ---------- */
const skeletonVars = css`
  /* 쉽게 조절 가능한 토큰 (테마와 섞어서 사용) */
  --sk-base: ${({ theme }) => theme.colors?.gray3 ?? '#eee'};
  --sk-highlight: ${({ theme }) => theme.colors?.white ?? '#fff'};
  --sk-radius: ${({ theme }) => theme.radius?.md ?? '8px'};
  --sk-duration: 1.15s; /* 전체 속도 */
  --sk-ease: cubic-bezier(0.22, 1, 0.36, 1);
`;

/* ---------- layout ---------- */
const SkeletonCard = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 100%;
  cursor: default;
  margin-bottom: 12px;
  width: 100%;
  min-width: 0;
`;

const ImageWrapper = styled.div`
  width: 100%;
  aspect-ratio: 2/3;
  min-height: 240px;
  border: 1px solid #ccc;
  border-radius: var(--sk-radius);
  overflow: hidden;
  position: relative;
  background: #f5f5f5;

  @supports not (aspect-ratio: 2/3) {
    min-height: 240px;
    height: 360px;
  }
`;

/* ---------- shimmer block (GPU-friendly) ---------- */
const ShimmerBlock = styled.div`
  ${skeletonVars};

  position: absolute;
  inset: 0;
  background: var(--sk-base);
  /* 가벼운 펄스(깜빡임X, 부드럽게) */
  animation: ${pulse} 1.8s ease-in-out infinite;
  will-change: transform, opacity;
  contain: paint; /* 자체 페인트 상자: 리플로우 최소화 */

  /* 하이라이트 스트라이프 */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;

    /* 스트라이프 자체는 좁게 렌더하고 transform으로 이동 → 부드러움↑ */
    width: 45%;
    left: -60%;

    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.66) 50%,
      transparent 100%
    );
    filter: blur(1px); /* 약간의 블러로 밴딩 줄임 */
    will-change: transform;
    animation: ${shimmer} var(--sk-duration) var(--sk-ease) infinite;

    /* GPU 가속 */
    transform: translate3d(0, 0, 0);
  }

  /* 다크 모드 색상 보정 (선택) */
  @media (prefers-color-scheme: dark) {
    --sk-base: rgba(255, 255, 255, 0.08);
    --sk-highlight: rgba(255, 255, 255, 0.22);
    border-color: rgba(255, 255, 255, 0.12);
  }

  /* 움직임 최소화 설정을 존중 */
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    &::after {
      animation: none;
    }
  }
`;

/* ---------- text lines ---------- */
const SkeletonLine = styled.div<{ width: string; height: string }>`
  ${skeletonVars};
  width: ${({ width }) => width};
  height: ${({ height }) => height};

  border-radius: calc(var(--sk-radius) - 4px);
  background: var(--sk-base);
  position: relative;
  overflow: hidden;
  animation: ${pulse} 1.8s ease-in-out infinite;

  /* Text 라인에도 얇은 하이라이트를 살짝만 */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    width: 55%;
    left: -65%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.55) 50%,
      transparent 100%
    );
    will-change: transform;
    animation: ${shimmer} calc(var(--sk-duration) * 1.1) var(--sk-ease) infinite;
    transform: translate3d(0, 0, 0);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    &::after {
      animation: none;
    }
  }
`;
