/**
 * 가상 리스트 컴포넌트 (VirtualList.tsx)
 *
 * 대용량 데이터를 효율적으로 렌더링하기 위한 가상 리스트 컴포넌트를 제공합니다.
 * 화면에 보이는 아이템만 렌더링하여 성능을 최적화하며,
 * 스크롤 위치에 따라 동적으로 아이템을 생성/제거합니다.
 *
 * @description
 * - 가시 영역 계산 및 최적화
 * - 스크롤 기반 동적 렌더링
 * - ResizeObserver를 통한 크기 변경 감지
 * - 오버스캔을 통한 부드러운 스크롤
 * - 메모리 효율적인 아이템 관리
 * - 커스터마이징 가능한 렌더링 함수
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styled from 'styled-components';

/**
 * 가상 리스트 속성 인터페이스
 *
 * 가상 리스트 컴포넌트의 props를 정의합니다.
 *
 * @property items - 렌더링할 아이템 배열
 * @property itemHeight - 각 아이템의 높이 (픽셀)
 * @property containerHeight - 컨테이너 높이 (픽셀)
 * @property overscan - 가시 영역 외 추가 렌더링 아이템 수 (기본값: 5)
 * @property renderItem - 아이템 렌더링 함수
 * @property keyExtractor - 아이템 고유 키 추출 함수
 * @property onScroll - 스크롤 이벤트 핸들러 (선택적)
 * @property className - CSS 클래스명 (선택적)
 */
interface VirtualListProps<T> {
  items: T[]; // 렌더링할 아이템 배열
  itemHeight: number; // 각 아이템의 높이 (픽셀)
  containerHeight: number; // 컨테이너 높이 (픽셀)
  overscan?: number; // 가시 영역 외 추가 렌더링 아이템 수 (기본값: 5)
  renderItem: (item: T, index: number) => React.ReactNode; // 아이템 렌더링 함수
  keyExtractor: (item: T, index: number) => string | number; // 아이템 고유 키 추출 함수
  onScroll?: (scrollTop: number) => void; // 스크롤 이벤트 핸들러 (선택적)
  className?: string; // CSS 클래스명 (선택적)
}

/**
 * 가상 리스트 상태 인터페이스
 *
 * 가상 리스트 컴포넌트의 내부 상태를 정의합니다.
 *
 * @property scrollTop - 현재 스크롤 위치
 * @property containerHeight - 컨테이너 높이
 */
interface VirtualListState {
  scrollTop: number; // 현재 스크롤 위치
  containerHeight: number; // 컨테이너 높이
}

/**
 * 가상 리스트 컴포넌트
 *
 * 대용량 데이터를 효율적으로 렌더링하는 가상 리스트를 구현합니다.
 * 화면에 보이는 아이템만 렌더링하여 성능을 최적화하며,
 * 스크롤 위치에 따라 동적으로 아이템을 관리합니다.
 *
 * @param items - 렌더링할 아이템 배열
 * @param itemHeight - 각 아이템의 높이 (픽셀)
 * @param containerHeight - 컨테이너 높이 (픽셀)
 * @param overscan - 가시 영역 외 추가 렌더링 아이템 수 (기본값: 5)
 * @param renderItem - 아이템 렌더링 함수
 * @param keyExtractor - 아이템 고유 키 추출 함수
 * @param onScroll - 스크롤 이벤트 핸들러 (선택적)
 * @param className - CSS 클래스명 (선택적)
 * @returns 가상 리스트 컴포넌트
 */
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
