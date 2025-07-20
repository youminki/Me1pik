import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getTermsPolicyList } from '../api-utils/user-management/terms/termsApi';

interface TermsPolicyListProps {
  type: string;
  category?: string;
  onItemClick: (id: number) => void;
}

interface TermsPolicyItem {
  id: number;
  title: string;
  type: string;
  category: string;
  content: string;
  author: string;
  createdAt: string;
}

const TermsPolicyList: React.FC<TermsPolicyListProps> = ({
  type,
  category,
  onItemClick,
}) => {
  const [list, setList] = useState<TermsPolicyItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getTermsPolicyList({ type, category })
      .then(setList)
      .finally(() => setLoading(false));
  }, [type, category]);

  if (loading) return <ListContainer>로딩 중...</ListContainer>;
  if (!list.length) return <ListContainer>데이터가 없습니다.</ListContainer>;

  return (
    <ListContainer>
      {list.map((item) => (
        <ListItem key={item.id} onClick={() => onItemClick(item.id)}>
          <ItemTitle>{item.title}</ItemTitle>
          <ItemMeta>
            <span>{item.category}</span>
            <span>{item.author}</span>
            <span>{item.createdAt.slice(0, 10)}</span>
          </ItemMeta>
        </ListItem>
      ))}
    </ListContainer>
  );
};

export default TermsPolicyList;

const ListContainer = styled.div`
  width: 100%;
  background: #fff;
  border: 1px solid #dddddd;
  border-radius: 8px;
  box-sizing: border-box;
  margin-top: 8px;
  margin-bottom: 24px;
  padding: 0;
  overflow: hidden;
`;

const ListItem = styled.div`
  padding: 20px 16px 16px 16px;
  border-bottom: 1px solid #eeeeee;
  cursor: pointer;
  background: #fff;
  transition: background 0.2s;
  &:hover {
    background: #f8f8f8;
  }
  &:last-child {
    border-bottom: none;
  }
`;

const ItemTitle = styled.div`
  font-weight: 700;
  font-size: 16px;
  color: #222;
  margin-bottom: 8px;
`;

const ItemMeta = styled.div`
  font-size: 12px;
  color: #888;
  display: flex;
  gap: 12px;
`;
