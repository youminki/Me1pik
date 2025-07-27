import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useLazyLoad } from '@/hooks/useIntersectionObserver';

interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  width?: string;
  height?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean; // LCP 최적화를 위한 우선순위 플래그
  sizes?: string; // 반응형 이미지 크기
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = '',
  className,
  width,
  height,
  onLoad,
  onError,
  priority = false,
  sizes = '100vw',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { ref, shouldLoad } = useLazyLoad();

  // 우선순위 이미지는 즉시 로딩
  const shouldLoadImage = priority || shouldLoad;

  // 이미지 프리로드 (우선순위가 높은 경우)
  useEffect(() => {
    if (priority && src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);

      return () => {
        document.head.removeChild(link);
      };
    }
  }, [priority, src]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // 이미지 URL 최적화 (WebP 지원 확인 후 적용)
  const getOptimizedSrc = (originalSrc: string) => {
    // WebP 지원 확인
    const supportsWebP =
      document
        .createElement('canvas')
        .toDataURL('image/webp')
        .indexOf('data:image/webp') === 0;

    if (supportsWebP && originalSrc.includes('.')) {
      const extension = originalSrc.split('.').pop();
      if (
        extension &&
        ['jpg', 'jpeg', 'png'].includes(extension.toLowerCase())
      ) {
        return originalSrc.replace(`.${extension}`, '.webp');
      }
    }
    return originalSrc;
  };

  const optimizedSrc = getOptimizedSrc(src);

  return (
    <ImageContainer
      ref={ref}
      className={className}
      width={width}
      height={height}
    >
      {shouldLoadImage && !hasError ? (
        <>
          {!isLoaded && (
            <SpinnerWrapper>
              <LoadingSpinner size={28} color='#f7c600' label={undefined} />
            </SpinnerWrapper>
          )}
          <StyledImage
            src={optimizedSrc}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className={isLoaded ? 'loaded' : ''}
            loading={priority ? 'eager' : 'lazy'}
            sizes={sizes}
            style={{ position: 'absolute', top: 0, left: 0 }}
            fetchPriority={priority ? 'high' : 'auto'}
          />
        </>
      ) : hasError && placeholder ? (
        <FallbackImage src={placeholder} alt={alt} />
      ) : (
        <SpinnerWrapper>
          <LoadingSpinner size={28} color='#f7c600' label={undefined} />
        </SpinnerWrapper>
      )}
    </ImageContainer>
  );
};

export default LazyImage;

const ImageContainer = styled.div<{ width?: string; height?: string }>`
  position: relative;
  width: ${({ width }) => width || '100%'};
  height: ${({ height }) => height || 'auto'};
  overflow: hidden;
  background-color: #f6f6f6;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  position: absolute;
  top: 0;
  left: 0;

  &.loaded {
    opacity: 1;
  }
`;

const SpinnerWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
`;

const FallbackImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
