import React, { useState } from 'react';
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
      {shouldLoad && !hasError ? (
        <>
          {!isLoaded && (
            <SpinnerWrapper>
              <LoadingSpinner size={28} color='#f7c600' label={undefined} />
            </SpinnerWrapper>
          )}
          <StyledImage
            src={src}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className={isLoaded ? 'loaded' : ''}
            loading='lazy'
            style={{ position: 'absolute', top: 0, left: 0 }}
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
