// 이미지 슬라이더 컴포넌트 - 제품 이미지 갤러리 및 스와이프 기능 제공
import React, { memo } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useSwipeable, SwipeableHandlers } from 'react-swipeable';
import styled from 'styled-components';

// 이미지 슬라이더 Props 인터페이스
export interface ImageSliderProps {
  images: string[];
  currentImageIndex: number;
  handleSwipeLeft: () => void;
  handleSwipeRight: () => void;
  handleMouseDown: (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void;
}

// 메인 이미지 슬라이더 컴포넌트 (메모이제이션 적용)
const ImageSlider: React.FC<ImageSliderProps> = memo(
  ({
    images,
    currentImageIndex,
    handleSwipeLeft,
    handleSwipeRight,
    handleMouseDown,
  }) => {
    // 스와이프 핸들러 설정
    const handlers: SwipeableHandlers = useSwipeable({
      onSwipedLeft: handleSwipeLeft,
      onSwipedRight: handleSwipeRight,
      preventScrollOnSwipe: true,
      trackMouse: true,
    });

    return (
      <Container {...handlers} onMouseDown={handleMouseDown}>
        {/* 왼쪽 화살표 (이전 이미지) */}
        <ArrowLeft onClick={handleSwipeRight}>
          <FiChevronLeft />
        </ArrowLeft>

        {/* 이미지 슬라이드 컨테이너 */}
        <SlidesWrapper $currentIndex={currentImageIndex}>
          {images.map((src, idx) => (
            <Slide key={idx}>
              <Image src={src} alt={`Slide ${idx + 1}`} loading='lazy' />
            </Slide>
          ))}
        </SlidesWrapper>

        {/* 오른쪽 화살표 (다음 이미지) */}
        <ArrowRight onClick={handleSwipeLeft}>
          <FiChevronRight />
        </ArrowRight>

        {/* 인디케이터 점들 */}
        <Indicators>
          {images.map((_, idx) => (
            <Dot key={idx} $active={idx === currentImageIndex} />
          ))}
        </Indicators>
      </Container>
    );
  }
);

export default ImageSlider;

// 스타일 컴포넌트들
const Container = styled.div`
  position: relative;
  overflow: hidden;
  background-color: #f5f5f5;
`;

// 화살표 공통 스타일
const arrowStyles = `
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  cursor: pointer;
  opacity: 0.7;
  font-size: 48px;
  &:hover { opacity: 1; }

  @media (max-width: 768px) {
    display: none;
  }
`;

const ArrowLeft = styled.div`
  ${arrowStyles}
  left: 8px;
`;

const ArrowRight = styled.div`
  ${arrowStyles}
  right: 8px;
`;

// 슬라이드 래퍼 (현재 인덱스에 따른 위치 조정)
const SlidesWrapper = styled.div<{ $currentIndex: number }>`
  display: flex;
  transform: translateX(-${(p) => p.$currentIndex * 100}%);
  transition: transform 0.4s ease;
`;

const Slide = styled.div`
  flex: 0 0 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: grab;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Indicators = styled.div`
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
`;

const Dot = styled.div<{ $active: boolean }>`
  width: 12px;
  height: 12px;
  margin: 0 4px;

  background-color: ${(p) => (p.$active ? '#F6AE24' : '#FFF')};
  border: 1px solid #ccc;
`;
