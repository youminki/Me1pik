/**
 * 이미지 최적화 유틸리티 함수들
 */

// WebP 지원 확인
export const supportsWebP = (): boolean => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

// AVIF 지원 확인
export const supportsAVIF = (): boolean => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
};

// 최적화된 이미지 URL 생성
export const getOptimizedImageUrl = (
  originalUrl: string,
  width?: number,
  quality: number = 80
): string => {
  if (!originalUrl) return originalUrl;

  // 외부 이미지인 경우 원본 반환
  if (originalUrl.startsWith('http') && !originalUrl.includes('me1pik.com')) {
    return originalUrl;
  }

  // WebP 지원 확인
  const useWebP = supportsWebP();
  const useAVIF = supportsAVIF();

  let optimizedUrl = originalUrl;

  // 파일 확장자 확인
  const extension = originalUrl.split('.').pop()?.toLowerCase();

  if (extension && ['jpg', 'jpeg', 'png'].includes(extension)) {
    if (useAVIF) {
      optimizedUrl = originalUrl.replace(`.${extension}`, '.avif');
    } else if (useWebP) {
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

// 반응형 이미지 크기 계산
export const getResponsiveSizes = (containerWidth: number): string => {
  if (containerWidth <= 480) {
    return '(max-width: 480px) 50vw, 25vw';
  } else if (containerWidth <= 768) {
    return '(max-width: 768px) 50vw, 25vw';
  } else {
    return '25vw';
  }
};

// 이미지 프리로드
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    img.src = src;
  });
};

// 여러 이미지 프리로드
export const preloadImages = async (urls: string[]): Promise<void> => {
  const promises = urls.map((url) => preloadImage(url));
  await Promise.allSettled(promises);
};

// LCP 이미지 식별 및 최적화
export const optimizeLCPImage = (imageUrl: string): string => {
  // LCP 이미지는 최고 품질로 최적화
  return getOptimizedImageUrl(imageUrl, undefined, 90);
};

// 이미지 지연 로딩을 위한 Intersection Observer 설정
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

// 이미지 로딩 성능 측정
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

// 이미지 크기 최적화 제안
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
