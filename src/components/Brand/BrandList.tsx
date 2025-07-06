// src/components/Brand/BrandList.tsx

import React from 'react';
import styled from 'styled-components';
import BrandItem, { Brand as BrandType } from './BrandItem';

interface BrandListProps {
  groupedBrands: Record<string, BrandType[]>;
}

export const BrandList: React.FC<BrandListProps> = ({ groupedBrands }) => {
  const keys = Object.keys(groupedBrands);
  return (
    <Container>
      {keys.map((groupKey) => (
        <GroupSection key={groupKey}>
          <GroupTitle>{groupKey}</GroupTitle>
          {groupedBrands[groupKey].map((brand) => (
            // brand.id가 고유하므로 key로 사용
            <BrandItem key={brand.id} brand={brand} />
          ))}
        </GroupSection>
      ))}
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
`;

const GroupSection = styled.section`
  margin-bottom: 0px;
`;

const GroupTitle = styled.h2`
  font-weight: 900;
  font-size: 16px;
  background-color: #555;
  padding: 12px 20px;
  color: white;
  margin: 0px;
`;
