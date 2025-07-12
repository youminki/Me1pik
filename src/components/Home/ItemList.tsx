import React from 'react';
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
  lastItemRef?: React.RefObject<HTMLDivElement | null>;
};

const SKELETON_COUNT = 8;

const ItemList: React.FC<ItemListProps> = ({
  items,
  columns = 5,
  onItemClick,
  onDelete,
  isLoading = false,
  lastItemRef,
}) => {
  const handleOpen = onItemClick ?? (() => {});
  const handleDelete = onDelete ?? (() => {});

  return (
    <ListContainer>
      <ItemsWrapper columns={columns}>
        {isLoading
          ? Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
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
            ))
          : items.map((item, idx) => {
              const isLast = idx === items.length - 1;
              return (
                <div
                  key={item.id}
                  ref={isLast && lastItemRef ? lastItemRef : undefined}
                  style={{ height: '100%' }}
                >
                  <ItemCard
                    {...item}
                    onOpenModal={handleOpen}
                    onDelete={handleDelete}
                  />
                </div>
              );
            })}
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
