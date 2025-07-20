import React, { useMemo, useCallback } from 'react';
import styled from 'styled-components';

import ItemCard from './ItemCard';

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
};

const SKELETON_COUNT = 8;

const ItemList: React.FC<ItemListProps> = ({
  items,
  columns = 4,
  onItemClick,
  onDelete,
  isLoading = false,
  observerRef,
}) => {
  const handleOpen = useCallback(onItemClick ?? (() => {}), [onItemClick]);
  const handleDelete = useCallback(onDelete ?? (() => {}), [onDelete]);

  const renderedItems = useMemo(() => {
    if (isLoading) {
      return Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
        <ItemCard
          key={`skeleton-${idx}`}
          id={'' + idx}
          image={''}
          brand={''}
          description={''}
          price={0}
          discount={0}
          isLiked={false}
          onOpenModal={() => {}}
        />
      ));
    }
    return items.map((item) => (
      <ItemCard
        key={item.id}
        {...item}
        onOpenModal={handleOpen}
        onDelete={handleDelete}
      />
    ));
  }, [isLoading, items, handleOpen, handleDelete]);

  return (
    <ListContainer>
      <ItemsWrapper columns={columns}>
        {renderedItems}
        {/* 무한스크롤 observer div를 리스트 마지막에 추가 */}
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
