import React, { useMemo, useCallback } from 'react';
import styled from 'styled-components';

import ItemCard from './ItemCard';
import SkeletonItemList from './SkeletonItemList';

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
  observerRef,
  visibleCount = 40,
}) => {
  const handleOpen = useCallback(onItemClick ?? (() => {}), [onItemClick]);
  const handleDelete = useCallback(onDelete ?? (() => {}), [onDelete]);

  // 아이템별로 준비된 것부터 바로 렌더링, 나머지는 스켈레톤
  const renderedItems = useMemo(() => {
    const cards = [];
    for (let i = 0; i < visibleCount; i++) {
      if (items[i]) {
        cards.push(
          <ItemCard
            key={items[i].id}
            {...items[i]}
            onOpenModal={handleOpen}
            onDelete={handleDelete}
          />
        );
      } else {
        // 스켈레톤 카드: SkeletonItemList의 내부 스켈레톤 카드 스타일을 그대로 사용
        cards.push(
          <SkeletonItemList key={`skeleton-${i}`} columns={columns} count={1} />
        );
      }
    }
    return cards;
  }, [items, visibleCount, columns, handleOpen, handleDelete]);

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
