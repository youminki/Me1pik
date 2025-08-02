/**
 * 최적화된 이미지 컴포넌트 (OptimizedImage.tsx)
 *
 * 웹 성능 최적화를 위한 고급 이미지 컴포넌트를 제공합니다.
 * WebP 자동 변환, 지연 로딩, 로딩 상태 관리, 에러 처리,
 * 반응형 이미지 지원 등 다양한 최적화 기능을 포함합니다.
 *
 * @description
 * - WebP 지원 자동 변환 (성능 최적화)
 * - Intersection Observer 기반 지연 로딩
 * - 로딩/에러/플레이스홀더 상태 관리
 * - 반응형 이미지 지원 (sizes 속성)
 * - 이미지 품질 최적화
 * - 접근성 지원 (alt 텍스트)
 * - 다양한 object-fit 옵션
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';

import LoadingSpinner from './LoadingSpinner';

/**
 * 최적화된 이미지 컴포넌트 속성 인터페이스
 *
 * 최적화된 이미지 컴포넌트의 props를 정의합니다.
 *
 * @property src - 이미지 소스 URL
 * @property alt - 이미지 대체 텍스트 (접근성)
 * @property width - 이미지 너비 (숫자 또는 문자열)
 * @property height - 이미지 높이 (숫자 또는 문자열)
 * @property className - CSS 클래스명 (선택적)
 * @property priority - 우선 로딩 여부 (기본값: false)
 * @property sizes - 반응형 이미지 크기 정의 (기본값: '100vw')
 * @property quality - 이미지 품질 (1-100, 기본값: 80)
 * @property placeholder - 로딩 중 표시할 플레이스홀더 이미지 (선택적)
 * @property onLoad - 이미지 로드 완료 핸들러 (선택적)
 * @property onError - 이미지 로드 실패 핸들러 (선택적)
 * @property lazy - 지연 로딩 사용 여부 (기본값: true)
 * @property aspectRatio - 이미지 종횡비 (선택적)
 * @property objectFit - 이미지 맞춤 방식 (기본값: 'cover')
 */
interface OptimizedImageProps {
  src: string; // 이미지 소스 URL
  alt: string; // 이미지 대체 텍스트 (접근성)
  width?: number | string; // 이미지 너비 (숫자 또는 문자열)
  height?: number | string; // 이미지 높이 (숫자 또는 문자열)
  className?: string; // CSS 클래스명 (선택적)
  priority?: boolean; // 우선 로딩 여부 (기본값: false)
  sizes?: string; // 반응형 이미지 크기 정의 (기본값: '100vw')
  quality?: number; // 이미지 품질 (1-100, 기본값: 80)
  placeholder?: string; // 로딩 중 표시할 플레이스홀더 이미지 (선택적)
  onLoad?: () => void; // 이미지 로드 완료 핸들러 (선택적)
  onError?: () => void; // 이미지 로드 실패 핸들러 (선택적)
  lazy?: boolean; // 지연 로딩 사용 여부 (기본값: true)
  aspectRatio?: number; // 이미지 종횡비 (선택적)
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'; // 이미지 맞춤 방식 (기본값: 'cover')
}

/**
 * 최적화된 이미지 컴포넌트
 *
 * - WebP 지원 자동 변환
 * - Intersection Observer를 통한 지연 로딩
 * - 로딩/에러/플레이스홀더 처리
 */
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

  /**
   * WebP 지원 확인 및 최적화된 이미지 URL 생성
   *
   * 브라우저가 WebP를 지원하면 jpg/png를 webp로 변환하여 반환합니다.
   */
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

  /**
   * Intersection Observer를 사용한 지연 로딩
   *
   * priority/lazy 옵션에 따라 이미지가 뷰포트에 들어올 때만 로딩합니다.
   */
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

  /**
   * 이미지 로딩 처리
   *
   * isInView, src가 변경될 때 실제 이미지를 비동기로 로딩합니다.
   */
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
