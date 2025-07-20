import React, { useState } from 'react';
import styled from 'styled-components';

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
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjZGRkZGIi8+CjxwYXRoIGQ9Ik01MCAyNUMyOC4wNyAyNSA5IDQ0LjA3IDkgNjVDOSA4NS45MyAyOC4wNyAxMDUgNTAgMTA1QzcxLjkzIDEwNSA5MSA4NS45MyA5MSA2NUM5MSA0NC4wNyA3MS45MyAyNSA1MCAyNVoiIGZpbGw9IiNGRkZGRkYiLz4KPC9zdmc+',
  className,
  width,
  height,
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { ref, shouldLoad } = useLazyLoad();

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <ImageContainer
      ref={ref}
      className={className}
      width={width}
      height={height}
    >
      {shouldLoad && !hasError && (
        <StyledImage
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          isLoaded={isLoaded}
          loading='lazy'
        />
      )}
      {(!shouldLoad || hasError) && (
        <PlaceholderImage
          src={placeholder}
          alt='로딩 중...'
          isLoaded={false}
          loading='lazy'
        />
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

const StyledImage = styled.img<{ isLoaded: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: ${({ isLoaded }) => (isLoaded ? 1 : 0)};
  transition: opacity 0.3s ease-in-out;
`;

const PlaceholderImage = styled.img<{ isLoaded: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: ${({ isLoaded }) => (isLoaded ? 0 : 1)};
  transition: opacity 0.3s ease-in-out;
`;
