import React, { useMemo, useCallback, useState, useEffect } from 'react';
import styled from 'styled-components';

import ItemCard from '@/components/homes/ItemCard';
import { UIItem } from '@/components/homes/ItemList';
import VirtualList from '@/components/shared/VirtualList';

interface OptimizedItemListProps {
  items: UIItem[];
  columns?: number;
  onItemClick?: (id: string) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
  observerRef?: React.RefObject<HTMLDivElement>;
  visibleCount?: number;
  useVirtualization?: boolean;
}

interface VirtualItemData {
  item: UIItem;
  index: number;
  isFirstItem: boolean;
}

const OptimizedItemList: React.FC<OptimizedItemListProps> = ({
  items,
  columns = 4,
  onItemClick,
  onDelete,
  isLoading = false,
  observerRef,
  visibleCount = 40,
  useVirtualization = true,
}) => {
  const [containerHeight, setContainerHeight] = useState(600);
  const [itemHeight, setItemHeight] = useState(300);

  // 컨테이너 크기에 따른 아이템 높이 계산
  useEffect(() => {
    const calculateItemHeight = () => {
      const containerWidth = window.innerWidth;
      const isMobile = containerWidth < 768;
      const cols = isMobile ? 2 : columns;
      const aspectRatio = 1.2; // 이미지 비율
      const gap = 16;
      const padding = 32;

      const itemWidth = (containerWidth - padding - (cols - 1) * gap) / cols;
      const calculatedHeight = itemWidth * aspectRatio + 120; // 텍스트 영역 추가

      setItemHeight(calculatedHeight);
      setContainerHeight(window.innerHeight * 0.7); // 화면 높이의 70%
    };

    calculateItemHeight();
    window.addEventListener('resize', calculateItemHeight);

    return () => window.removeEventListener('resize', calculateItemHeight);
  }, [columns]);

  // 가상화된 아이템 데이터 생성
  const virtualItems = useMemo(() => {
    if (isLoading) {
      return Array.from({ length: visibleCount }, (_, i) => ({
        item: {
          id: `skeleton-${i}`,
          image: '',
          brand: '',
          description: '',
          price: 0,
          discount: 0,
          isLiked: false,
        } as UIItem,
        index: i,
        isFirstItem: i === 0,
        isLoading: true,
      }));
    }

    return items.map((item, index) => ({
      item,
      index,
      isFirstItem: index === 0,
      isLoading: false,
    }));
  }, [items, isLoading, visibleCount]);

  // 아이템 렌더링 함수
  const renderItem = useCallback(
    (virtualItem: VirtualItemData & { isLoading?: boolean }) => {
      if (virtualItem.isLoading) {
        return <div style={{ height: itemHeight, background: '#f0f0f0' }} />;
      }

      return (
        <ItemCard
          key={virtualItem.item.id}
          {...virtualItem.item}
          onOpenModal={onItemClick || (() => {})}
          onDelete={onDelete || (() => {})}
          isFirstItem={virtualItem.isFirstItem}
        />
      );
    },
    [onItemClick, onDelete, itemHeight]
  );

  // 키 추출 함수
  const keyExtractor = useCallback(
    (virtualItem: VirtualItemData & { isLoading?: boolean }) => {
      return virtualItem.isLoading
        ? `skeleton-${virtualItem.index}`
        : virtualItem.item.id;
    },
    []
  );

  // 일반 렌더링 (가상화 비활성화)
  const renderedItems = useMemo(() => {
    if (isLoading) {
      return Array.from({ length: visibleCount }, (_, i) => (
        <div
          key={`skeleton-${i}`}
          style={{ height: itemHeight, background: '#f0f0f0' }}
        />
      ));
    }

    return items.map((item, index) => (
      <ItemCard
        key={item.id}
        {...item}
        onOpenModal={onItemClick || (() => {})}
        onDelete={onDelete || (() => {})}
        isFirstItem={index === 0}
      />
    ));
  }, [isLoading, items, visibleCount, onItemClick, onDelete, itemHeight]);

  if (!useVirtualization) {
    return (
      <ListContainer>
        <ItemsWrapper $columns={columns}>
          {renderedItems}
          {observerRef && <div ref={observerRef} style={{ height: 1 }} />}
        </ItemsWrapper>
      </ListContainer>
    );
  }

  // 가상화 렌더링
  return (
    <VirtualListContainer>
      <VirtualList
        items={virtualItems}
        itemHeight={itemHeight}
        containerHeight={containerHeight}
        overscan={3}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onScroll={(scrollTop) => {
          // 스크롤 위치에 따른 추가 로딩 트리거
          const scrollPercentage =
            scrollTop / (virtualItems.length * itemHeight - containerHeight);
          if (scrollPercentage > 0.8 && !isLoading) {
            // 80% 스크롤 시 추가 로딩
            console.log('추가 로딩 트리거');
          }
        }}
      />
      {observerRef && <div ref={observerRef} style={{ height: 1 }} />}
    </VirtualListContainer>
  );
};

const ListContainer = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 16px;
`;

const ItemsWrapper = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns}, 1fr);
  gap: 16px;
  width: 100%;
`;

const VirtualListContainer = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 16px;

  /* 가상 리스트 내부 그리드 스타일링 */
  > div > div > div {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    padding: 16px;
  }
`;

export default OptimizedItemList;
