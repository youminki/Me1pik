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
  showNoResult?: boolean; // NoResult 표시 여부 추가
};

const ItemList: React.FC<ItemListProps> = ({
  items,
  columns = 4,
  onItemClick,
  onDelete,
  isLoading = false,
  observerRef,
  visibleCount = 40,
  showNoResult = false, // 기본값 false
}) => {
  const renderedItems = useMemo(() => {
    const handleOpen = onItemClick ?? (() => {});
    const handleDelete = onDelete ?? (() => {});

    if (isLoading) {
      return Array.from({ length: visibleCount }, (_, i) => (
        <SkeletonItemCard key={`skeleton-${i}`} />
      ));
    }

    return items.map((item, index) => (
      <ItemCard
        key={item.id}
        {...item}
        onOpenModal={handleOpen}
        onDelete={handleDelete}
        isFirstItem={index === 0} // 첫 번째 아이템에 우선순위 적용
      />
    ));
  }, [isLoading, items, visibleCount, onItemClick, onDelete]);

  return (
    <ListContainer>
      <ItemsWrapper $columns={columns}>
        {showNoResult ? (
          <NoResultMessage>조건에 맞는 상품이 없습니다.</NoResultMessage>
        ) : (
          <>
            {renderedItems}
            {observerRef && <div ref={observerRef} style={{ height: 1 }} />}
          </>
        )}
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

const ItemsWrapper = styled.div<{ $columns: number }>`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(${({ $columns }) => $columns}, minmax(0, 1fr));
`;

const NoResultMessage = styled.div`
  font-size: 18px;
  color: #666;
  font-weight: 600;
  text-align: center;
  grid-column: 1 / -1;
  padding: 40px 20px;
  background: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
`;
