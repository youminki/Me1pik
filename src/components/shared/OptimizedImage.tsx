import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  priority?: boolean;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const ImageContainer = styled.div<{
  $isLoaded: boolean;
  $width?: number | string;
  $height?: number | string;
}>`
  position: relative;
  width: ${({ $width }) =>
    typeof $width === 'number' ? `${$width}px` : $width || 'auto'};
  height: ${({ $height }) =>
    typeof $height === 'number' ? `${$height}px` : $height || 'auto'};
  overflow: hidden;
  background-color: #f5f5f5;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: ${({ $isLoaded }) =>
      !$isLoaded ? 'shimmer 1.5s infinite' : 'none'};
    z-index: 1;
  }

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

const StyledImage = styled.img<{ $isLoaded: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: ${({ $isLoaded }) => ($isLoaded ? 1 : 0)};
  transition: opacity 0.3s ease-in-out;
  z-index: 2;
  position: relative;
`;

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  placeholder,
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) {
      // 우선순위가 높은 이미지는 즉시 로드
      setIsLoaded(true);
    }
  }, [priority]);

  useEffect(() => {
    const currentImgRef = imgRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && imgRef.current) {
            imgRef.current.src = src;
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // 50px 전에 미리 로드
        threshold: 0.1,
      }
    );

    if (currentImgRef) {
      observer.observe(currentImgRef);
    }

    return () => {
      if (currentImgRef) {
        observer.unobserve(currentImgRef);
      }
    };
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // WebP 지원 확인
  const supportsWebP = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  };

  // 적응형 이미지 소스 생성
  const getOptimizedSrc = (originalSrc: string) => {
    if (hasError || !originalSrc) return placeholder || '';

    // WebP 지원 시 WebP 버전 사용
    if (supportsWebP() && originalSrc.includes('.')) {
      const baseName = originalSrc.substring(0, originalSrc.lastIndexOf('.'));
      return `${baseName}.webp`;
    }

    return originalSrc;
  };

  return (
    <ImageContainer
      $isLoaded={isLoaded}
      $width={width}
      $height={height}
      className={className}
    >
      <StyledImage
        ref={imgRef}
        src={priority ? getOptimizedSrc(src) : ''}
        alt={alt}
        $isLoaded={isLoaded}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding='async'
      />
    </ImageContainer>
  );
};

export default OptimizedImage;
