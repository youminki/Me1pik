import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import styled from 'styled-components';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  onScroll?: (scrollTop: number) => void;
  className?: string;
}

interface VirtualListState {
  scrollTop: number;
  containerHeight: number;
}

const VirtualList = <T,>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
  renderItem,
  keyExtractor,
  onScroll,
  className,
}: VirtualListProps<T>) => {
  const [state, setState] = useState<VirtualListState>({
    scrollTop: 0,
    containerHeight,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const totalHeight = items.length * itemHeight;

  // 가시 영역 계산
  const visibleRange = useMemo(() => {
    const start = Math.floor(state.scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(state.containerHeight / itemHeight) + overscan,
      items.length
    );
    const visibleStart = Math.max(0, start - overscan);

    return {
      start: visibleStart,
      end,
      offsetY: visibleStart * itemHeight,
    };
  }, [
    state.scrollTop,
    state.containerHeight,
    itemHeight,
    overscan,
    items.length,
  ]);

  // 스크롤 핸들러
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const scrollTop = event.currentTarget.scrollTop;
      setState((prev) => ({ ...prev, scrollTop }));
      onScroll?.(scrollTop);
    },
    [onScroll]
  );

  // 컨테이너 크기 변경 감지
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setState((prev) => ({
          ...prev,
          containerHeight: entry.contentRect.height,
        }));
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // 가시 영역의 아이템들만 렌더링
  const visibleItems = useMemo(() => {
    return items
      .slice(visibleRange.start, visibleRange.end)
      .map((item, index) => {
        const actualIndex = visibleRange.start + index;
        return (
          <VirtualItem
            key={keyExtractor(item, actualIndex)}
            style={{
              height: itemHeight,
              transform: `translateY(${actualIndex * itemHeight}px)`,
            }}
          >
            {renderItem(item, actualIndex)}
          </VirtualItem>
        );
      });
  }, [items, visibleRange, itemHeight, renderItem, keyExtractor]);

  return (
    <Container
      ref={containerRef}
      className={className}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <ContentWrapper style={{ height: totalHeight }}>
        <VisibleItemsWrapper
          style={{ transform: `translateY(${visibleRange.offsetY}px)` }}
        >
          {visibleItems}
        </VisibleItemsWrapper>
      </ContentWrapper>
    </Container>
  );
};

const Container = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  will-change: scroll-position;

  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const VisibleItemsWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  will-change: transform;
`;

const VirtualItem = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  will-change: transform;
`;

export default VirtualList;
