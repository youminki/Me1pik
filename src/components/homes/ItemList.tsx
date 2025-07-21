import React, { useMemo } from 'react';
import styled from 'styled-components';

import ItemCard from '@/components/homes/ItemCard';
import SkeletonItemCard from '@/components/homes/SkeletonItemList';

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
  const renderedItems = useMemo(() => {
    const handleOpen = onItemClick ?? (() => {});
    const handleDelete = onDelete ?? (() => {});

    if (isLoading) {
      return Array.from({ length: visibleCount }, (_, i) => (
        <SkeletonItemCard key={`skeleton-${i}`} />
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
  }, [isLoading, items, visibleCount, onItemClick, onDelete]);

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
