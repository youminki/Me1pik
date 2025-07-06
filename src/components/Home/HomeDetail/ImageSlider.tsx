import React, { memo } from 'react';
import { useSwipeable, SwipeableHandlers } from 'react-swipeable';
import styled from 'styled-components';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export interface ImageSliderProps {
  images: string[];
  currentImageIndex: number;
  handleSwipeLeft: () => void;
  handleSwipeRight: () => void;
  handleMouseDown: (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void;
}

const ImageSlider: React.FC<ImageSliderProps> = memo(
  ({
    images,
    currentImageIndex,
    handleSwipeLeft,
    handleSwipeRight,
    handleMouseDown,
  }) => {
    const handlers: SwipeableHandlers = useSwipeable({
      onSwipedLeft: handleSwipeLeft,
      onSwipedRight: handleSwipeRight,
      preventScrollOnSwipe: true,
      trackMouse: true,
    });

    return (
      <Container {...handlers} onMouseDown={handleMouseDown}>
        <ArrowLeft onClick={handleSwipeRight}>
          <FiChevronLeft />
        </ArrowLeft>

        <SlidesWrapper $currentIndex={currentImageIndex}>
          {images.map((src, idx) => (
            <Slide key={idx}>
              <Image src={src} alt={`Slide ${idx + 1}`} loading='lazy' />
            </Slide>
          ))}
        </SlidesWrapper>

        <ArrowRight onClick={handleSwipeLeft}>
          <FiChevronRight />
        </ArrowRight>

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

const Container = styled.div`
  position: relative;
  overflow: hidden;
  background-color: #f5f5f5;
`;

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
