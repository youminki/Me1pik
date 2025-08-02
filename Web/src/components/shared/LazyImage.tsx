/**
 * 지연 로딩 이미지 컴포넌트 (LazyImage.tsx)
 *
 * 성능 최적화를 위한 지연 로딩 이미지 컴포넌트를 제공합니다.
 * Intersection Observer를 사용하여 뷰포트에 들어올 때만 이미지를 로드하며,
 * WebP 자동 변환, 반응형 이미지, 프리로드 등의 최적화 기능을 포함합니다.
 *
 * @description
 * - Intersection Observer 기반 지연 로딩
 * - WebP 자동 변환 지원
 * - 반응형 이미지 지원 (srcset)
 * - 우선순위 이미지 프리로드
 * - 로딩/에러 상태 관리
 * - 플레이스홀더 이미지 지원
 * - 접근성 지원 (alt 텍스트)
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useLazyLoad } from '@/hooks/useIntersectionObserver';

/**
 * 지연 로딩 이미지 속성 인터페이스
 *
 * 지연 로딩 이미지 컴포넌트의 props를 정의합니다.
 *
 * @property src - 이미지 소스 URL
 * @property alt - 이미지 대체 텍스트 (접근성)
 * @property placeholder - 로딩 중 표시할 플레이스홀더 이미지 (선택적)
 * @property className - CSS 클래스명 (선택적)
 * @property width - 이미지 너비 (선택적)
 * @property height - 이미지 높이 (선택적)
 * @property onLoad - 이미지 로드 완료 핸들러 (선택적)
 * @property onError - 이미지 로드 실패 핸들러 (선택적)
 * @property priority - 우선 로딩 여부 (기본값: false)
 * @property sizes - 반응형 이미지 크기 정의 (기본값: '100vw')
 * @property quality - 이미지 품질 (1-100, 기본값: 80)
 */
interface LazyImageProps {
  src: string; // 이미지 소스 URL
  alt: string; // 이미지 대체 텍스트 (접근성)
  placeholder?: string; // 로딩 중 표시할 플레이스홀더 이미지 (선택적)
  className?: string; // CSS 클래스명 (선택적)
  width?: string; // 이미지 너비 (선택적)
  height?: string; // 이미지 높이 (선택적)
  onLoad?: () => void; // 이미지 로드 완료 핸들러 (선택적)
  onError?: () => void; // 이미지 로드 실패 핸들러 (선택적)
  priority?: boolean; // 우선 로딩 여부 (기본값: false)
  sizes?: string; // 반응형 이미지 크기 정의 (기본값: '100vw')
  quality?: number; // 이미지 품질 (1-100, 기본값: 80)
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
  quality = 80,
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
      link.href = getOptimizedSrc(src);
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

  // 적응형 이미지 srcset 생성
  const generateSrcSet = (baseSrc: string) => {
    const optimizedSrc = getOptimizedSrc(baseSrc);
    const sizes = [320, 640, 768, 1024, 1280];

    return sizes
      .map((size) => `${optimizedSrc}?w=${size}&q=${quality} ${size}w`)
      .join(', ');
  };

  const optimizedSrc = getOptimizedSrc(src);
  const srcSet = generateSrcSet(src);

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
            srcSet={srcSet}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className={isLoaded ? 'loaded' : ''}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
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
