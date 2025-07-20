import React, { useMemo, useCallback } from 'react';
import styled from 'styled-components';

import ItemCard from './ItemCard';
import SkeletonItemCard from './SkeletonItemList';

export interface UIItem {
  id: string;
  image: string;
  brand: string;
  description: string;
  price: number;
  discount: number;
  isLiked: boolean;
}

type ItemListProps = {
  items: UIItem[];
  columns?: number;
  onItemClick?: (id: string) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
  observerRef?: React.RefObject<HTMLDivElement>;
  visibleCount?: number;
};

const ItemList: React.FC<ItemListProps> = ({
  items,
  columns = 4,
  onItemClick,
  onDelete,
  isLoading = false,
  observerRef,
  visibleCount = 40,
}) => {
  const handleOpen = useCallback(onItemClick ?? (() => {}), [onItemClick]);
  const handleDelete = useCallback(onDelete ?? (() => {}), [onDelete]);

  // 아이템별로 준비된 것부터 바로 렌더링, 나머지는 스켈레톤 (isLoading일 때만)
  const renderedItems = useMemo(() => {
    if (isLoading) {
      // 로딩 중일 때만 스켈레톤을 visibleCount만큼 렌더링
      return Array.from({ length: visibleCount }, (_, i) => (
        <SkeletonItemCard key={`skeleton-${i}`} />
      ));
    }
    // 로딩이 아니면 실제 아이템만 렌더링
    return items.map((item) => (
      <ItemCard
        key={item.id}
        {...item}
        onOpenModal={handleOpen}
        onDelete={handleDelete}
      />
    ));
  }, [isLoading, items, visibleCount, columns, handleOpen, handleDelete]);

  return (
    <ListContainer>
      <ItemsWrapper columns={columns}>
        {renderedItems}
        {observerRef && <div ref={observerRef} style={{ height: 1 }} />}
      </ItemsWrapper>
    </ListContainer>
  );
};

export default ItemList;

const ListContainer = styled.div`
  background-color: #fff;
  margin: 0 auto;
  box-sizing: border-box;
  width: 100%;
`;

const ItemsWrapper = styled.div<{ columns: number }>`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(${({ columns }) => columns}, minmax(0, 1fr));
`;
