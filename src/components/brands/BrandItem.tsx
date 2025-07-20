// src/components/brands/BrandItem.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

/**
 * BrandType: BrandList에서 내려주는 로컬 브랜드 타입
 * 반드시 id, name, category, group 등을 포함해야 합니다.
 */
export interface Brand {
  id: number;
  name: string; // 예: brandName
  category: string; // 예: brand_category
  group: string; // 예: groupName
  // 필요시 company 등 추가 필드
}

interface BrandItemProps {
  brand: Brand;
}

const BrandItem: React.FC<BrandItemProps> = ({ brand }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/brand/${brand.id}`);
  };

  return (
    <Container onClick={handleClick}>
      <BrandDetails>
        <BrandName>{brand.name}</BrandName>
        {brand.group && <GroupName>{brand.group}</GroupName>}
      </BrandDetails>
      {brand.category ? (
        <BrandCategoryWrapper>
          <BrandCategory>{brand.category}</BrandCategory>
        </BrandCategoryWrapper>
      ) : null}
    </Container>
  );
};

export default BrandItem;

const Container = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f9f9f9;
  }
`;

const BrandDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const BrandName = styled.span`
  font-weight: 900;
  font-size: 15px;
  color: #000;
  margin-bottom: 4px;
`;

const GroupName = styled.span`
  font-weight: 400;
  font-size: 12px;
  color: #666;
`;

const BrandCategoryWrapper = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
`;

const BrandCategory = styled.span`
  font-weight: 400;
  font-size: 13px;
  color: #999;
  white-space: nowrap;
`;
