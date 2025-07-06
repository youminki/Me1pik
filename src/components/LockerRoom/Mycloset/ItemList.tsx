import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ItemCard from './ItemCard';

type Item = {
  id: string;
  image: string;
  brand: string;
  description: string;
  price: number;
  discount: number;
};

type ItemListProps = {
  items: Item[];
  onDelete: (id: string) => void;
};

const ItemList: React.FC<ItemListProps> = ({ items, onDelete }) => {
  const [itemList, setItemList] = useState<Item[]>([]);

  useEffect(() => {
    setItemList(items);
  }, [items]);

  const handleDelete = (id: string) => {
    onDelete(id);
  };

  return (
    <ListContainer>
      <ItemsWrapper>
        {itemList.map((item) => (
          <ItemCard
            key={item.id}
            id={item.id}
            image={item.image}
            brand={item.brand}
            description={item.description}
            price={item.price}
            discount={item.discount}
            onDelete={handleDelete}
          />
        ))}
      </ItemsWrapper>
    </ListContainer>
  );
};

export default ItemList;

const ListContainer = styled.div`
  background-color: #fff;
  overflow: hidden;
`;

const ItemsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  justify-items: center;
`;
