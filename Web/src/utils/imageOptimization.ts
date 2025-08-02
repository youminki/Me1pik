/**
 * imageOptimization 유틸리티 모음
 *
 * 웹 성능 향상을 위한 이미지 최적화 기능을 제공합니다.
 *
 * @description
 * - WebP/AVIF 포맷 지원 확인
 * - 반응형 이미지 크기 계산
 * - 이미지 프리로딩
 * - LCP 이미지 최적화
 * - 지연 로딩 지원
 * - 이미지 로딩 성능 측정
 * - 이미지 최적화 제안
 */

/**
 * supportsWebP 함수
 *
 * 브라우저가 WebP 이미지 포맷을 지원하는지 확인합니다.
 * Canvas API를 사용하여 지원 여부를 테스트합니다.
 *
 * @returns WebP 지원 여부
 */
export const supportsWebP = (): boolean => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

/**
 * supportsAVIF 함수
 *
 * 브라우저가 AVIF 이미지 포맷을 지원하는지 확인합니다.
 * Canvas API를 사용하여 지원 여부를 테스트합니다.
 *
 * @returns AVIF 지원 여부
 */
export const supportsAVIF = (): boolean => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
};

/**
 * getOptimizedImageUrl 함수
 *
 * 브라우저 지원에 따라 최적의 이미지 포맷을 선택하고,
 * 크기와 품질 파라미터를 추가합니다.
 *
 * @param originalUrl - 원본 이미지 URL
 * @param width - 원하는 이미지 너비 (선택사항)
 * @param quality - 이미지 품질 (1-100, 기본값: 80)
 * @returns 최적화된 이미지 URL
 */
export const getOptimizedImageUrl = (
  originalUrl: string,
  width?: number,
  quality: number = 80
): string => {
  if (!originalUrl) return originalUrl;

  // 외부 이미지인 경우 원본 반환 (최적화 불가)
  if (originalUrl.startsWith('http') && !originalUrl.includes('me1pik.com')) {
    return originalUrl;
  }

  // 브라우저 지원 포맷 확인
  const useWebP = supportsWebP();
  const useAVIF = supportsAVIF();

  let optimizedUrl = originalUrl;

  // 파일 확장자 확인 및 최적 포맷 선택
  const extension = originalUrl.split('.').pop()?.toLowerCase();

  if (extension && ['jpg', 'jpeg', 'png'].includes(extension)) {
    if (useAVIF) {
      // AVIF가 가장 효율적인 포맷
      optimizedUrl = originalUrl.replace(`.${extension}`, '.avif');
    } else if (useWebP) {
      // WebP는 AVIF보다 덜 효율적이지만 널리 지원됨
      optimizedUrl = originalUrl.replace(`.${extension}`, '.webp');
    }
  }

  // 크기 파라미터 추가 (서버에서 지원하는 경우)
  if (width) {
    const separator = optimizedUrl.includes('?') ? '&' : '?';
    optimizedUrl += `${separator}w=${width}&q=${quality}`;
  }

  return optimizedUrl;
};

/**
 * getResponsiveSizes 함수
 *
 * 반응형 이미지 크기를 계산합니다.
 *
 * @param containerWidth - 컨테이너 너비
 * @returns 반응형 이미지 크기 문자열
 */
export const getResponsiveSizes = (containerWidth: number): string => {
  if (containerWidth <= 480) {
    return '(max-width: 480px) 50vw, 25vw';
  } else if (containerWidth <= 768) {
    return '(max-width: 768px) 50vw, 25vw';
  } else {
    return '25vw';
  }
};

/**
 * preloadImage 함수
 *
 * 이미지를 프리로드합니다.
 *
 * @param src - 이미지 URL
 * @returns 로딩 완료 Promise
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    img.src = src;
  });
};

/**
 * preloadImages 함수
 *
 * 여러 이미지를 프리로드합니다.
 *
 * @param urls - 이미지 URL 배열
 * @returns 모든 이미지 로딩 완료 Promise
 */
export const preloadImages = async (urls: string[]): Promise<void> => {
  const promises = urls.map((url) => preloadImage(url));
  await Promise.allSettled(promises);
};

/**
 * optimizeLCPImage 함수
 *
 * LCP 이미지를 식별하고 최적화합니다.
 *
 * @param imageUrl - 이미지 URL
 * @returns 최적화된 이미지 URL
 */
export const optimizeLCPImage = (imageUrl: string): string => {
  // LCP 이미지는 최고 품질로 최적화
  return getOptimizedImageUrl(imageUrl, undefined, 90);
};

/**
 * createImageObserver 함수
 *
 * 이미지 지연 로딩을 위한 Intersection Observer를 생성합니다.
 *
 * @param callback - 교차 감지 콜백 함수
 * @param options - Observer 옵션
 * @returns IntersectionObserver 인스턴스
 */
export const createImageObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    rootMargin: '50px 0px',
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
};

/**
 * measureImageLoadTime 함수
 *
 * 이미지 로딩 성능을 측정합니다.
 *
 * @param imageUrl - 측정할 이미지 URL
 * @returns 로딩 시간 (밀리초, 실패 시 -1)
 */
export const measureImageLoadTime = (imageUrl: string): Promise<number> => {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const img = new Image();

    img.onload = () => {
      const loadTime = performance.now() - startTime;
      resolve(loadTime);
    };

    img.onerror = () => {
      resolve(-1); // 로딩 실패
    };

    img.src = imageUrl;
  });
};

/**
 * getImageOptimizationSuggestions 함수
 *
 * 이미지 최적화 제안사항을 생성합니다.
 *
 * @param imageUrl - 이미지 URL
 * @returns 최적화 제안사항 배열
 */
export const getImageOptimizationSuggestions = (imageUrl: string): string[] => {
  const suggestions: string[] = [];

  if (!imageUrl) return suggestions;

  // 파일 크기 확인 (실제로는 서버에서 확인해야 함)
  if (imageUrl.includes('.jpg') || imageUrl.includes('.jpeg')) {
    suggestions.push('JPEG 이미지를 WebP로 변환 고려');
  }

  if (imageUrl.includes('.png')) {
    suggestions.push('PNG 이미지를 WebP로 변환 고려');
  }

  // 반응형 이미지 제안
  suggestions.push('반응형 이미지 크기 제공 고려');
  suggestions.push('적절한 이미지 압축 적용');

  return suggestions;
};
