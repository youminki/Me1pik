import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';

import LoadingSpinner from './LoadingSpinner';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  lazy?: boolean;
  aspectRatio?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes = '100vw',
  quality = 80,
  placeholder,
  onLoad,
  onError,
  lazy = true,
  aspectRatio,
  objectFit = 'cover',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // WebP 지원 확인 및 최적화된 이미지 URL 생성
  const getOptimizedSrc = useCallback((originalSrc: string) => {
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
  }, []);

  // Intersection Observer를 사용한 지연 로딩
  useEffect(() => {
    if (priority || !lazy) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, lazy]);

  // 이미지 로딩 처리
  useEffect(() => {
    if (!isInView || !src) return;

    const img = new Image();

    img.onload = () => {
      setIsLoaded(true);
      onLoad?.();
    };

    img.onerror = () => {
      setHasError(true);
      onError?.();
    };

    img.src = getOptimizedSrc(src);
  }, [isInView, src, onLoad, onError, getOptimizedSrc]);

  // 반응형 이미지 srcset 생성
  const generateSrcSet = useCallback(
    (baseSrc: string) => {
      const optimizedSrc = getOptimizedSrc(baseSrc);
      const sizes = [320, 640, 768, 1024, 1280, 1920];

      return sizes
        .map((size) => `${optimizedSrc}?w=${size}&q=${quality} ${size}w`)
        .join(', ');
    },
    [getOptimizedSrc, quality]
  );

  // 적응형 이미지 크기 계산
  const getResponsiveSizes = useCallback(() => {
    if (typeof width === 'number') {
      return `(max-width: ${width}px) 100vw, ${width}px`;
    }
    return sizes;
  }, [width, sizes]);

  // 우선순위 이미지 프리로드
  useEffect(() => {
    if (priority && src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = getOptimizedSrc(src);
      document.head.appendChild(link);

      return () => {
        document.head.removeChild(link);
      };
    }
  }, [priority, src, getOptimizedSrc]);

  const optimizedSrc = getOptimizedSrc(src);
  const srcSet = generateSrcSet(src);
  const responsiveSizes = getResponsiveSizes();

  return (
    <ImageContainer
      ref={containerRef}
      className={className}
      width={width}
      height={height}
      aspectRatio={aspectRatio}
      objectFit={objectFit}
    >
      {isInView && !hasError ? (
        <>
          {!isLoaded && (
            <SpinnerWrapper>
              <LoadingSpinner size={28} color='#f7c600' label={undefined} />
            </SpinnerWrapper>
          )}
          <StyledImage
            ref={imgRef}
            src={optimizedSrc}
            srcSet={srcSet}
            sizes={responsiveSizes}
            alt={alt}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className={isLoaded ? 'loaded' : ''}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            fetchPriority={priority ? 'high' : 'auto'}
            objectFit={objectFit}
          />
        </>
      ) : hasError && placeholder ? (
        <FallbackImage src={placeholder} alt={alt} objectFit={objectFit} />
      ) : (
        <SpinnerWrapper>
          <LoadingSpinner size={28} color='#f7c600' label={undefined} />
        </SpinnerWrapper>
      )}
    </ImageContainer>
  );
};

const ImageContainer = styled.div<{
  width?: number | string;
  height?: number | string;
  aspectRatio?: number;
  objectFit?: string;
}>`
  position: relative;
  width: ${({ width }) =>
    typeof width === 'number' ? `${width}px` : width || '100%'};
  height: ${({ height, aspectRatio }) => {
    if (height) return typeof height === 'number' ? `${height}px` : height;
    if (aspectRatio) return 'auto';
    return 'auto';
  }};
  ${({ aspectRatio }) =>
    aspectRatio &&
    `
    &::before {
      content: '';
      display: block;
      padding-top: ${(1 / aspectRatio) * 100}%;
    }
  `}
  overflow: hidden;
  border-radius: 8px;
  background-color: #f8f9fa;
`;

const StyledImage = styled.img<{ objectFit?: string }>`
  width: 100%;
  height: 100%;
  object-fit: ${({ objectFit }) => objectFit || 'cover'};
  transition: opacity 0.3s ease-in-out;
  opacity: 0;

  &.loaded {
    opacity: 1;
  }
`;

const FallbackImage = styled.img<{ objectFit?: string }>`
  width: 100%;
  height: 100%;
  object-fit: ${({ objectFit }) => objectFit || 'cover'};
`;

const SpinnerWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default OptimizedImage;
