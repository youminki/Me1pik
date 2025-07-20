import React, { useMemo } from 'react';
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

type MyclosetItemListProps = {
  items: UIItem[];
  /** PC columns count (>=768px) */
  columns?: number;
  onItemClick?: (id: string) => void;
  onDelete?: (id: string) => void;
};

const MyclosetItemList: React.FC<MyclosetItemListProps> = ({
  items,
  columns = 5,
  onItemClick,
  onDelete,
}) => {
  const renderedItems = useMemo(() => {
    const handleOpen = onItemClick ?? (() => {});
    const handleDelete = onDelete ?? (() => {});
    return items.map((item) => (
      <ItemCard
        key={item.id}
        {...item}
        onOpenModal={handleOpen}
        onDelete={handleDelete}
      />
    ));
  }, [items, onItemClick, onDelete]);

  return (
    <ListContainer>
      <ItemsWrapper columns={columns}>{renderedItems}</ItemsWrapper>
    </ListContainer>
  );
};

export default MyclosetItemList;

const ListContainer = styled.div`
  background-color: #fff;
  margin: 0 auto;
  box-sizing: border-box;
`;

const ItemsWrapper = styled.div<{ columns: number }>`
  display: grid;
  gap: 16px;
  /* 모바일(폭 < 768px) 고정 2열 */
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (min-width: 768px) {
    /* PC에서는 지정된 columns */
    grid-template-columns: repeat(${({ columns }) => columns}, minmax(0, 1fr));
  }
`;
