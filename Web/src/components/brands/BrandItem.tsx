/**
 * 브랜드 리스트 아이템 컴포넌트 (BrandItem.tsx)
 *
 * 브랜드 목록에서 개별 브랜드 정보를 표시하는 컴포넌트입니다.
 * 클릭 시 해당 브랜드 상세 페이지로 이동합니다.
 *
 * @description
 * - 브랜드명, 그룹, 카테고리 표시
 * - 클릭 시 라우팅
 * - 반응형 스타일 및 호버 효과
 */
// src/components/brands/BrandItem.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

/**
 * BrandType: BrandList에서 내려주는 로컬 브랜드 타입
 * 반드시 id, name, category, group 등을 포함해야 합니다.
 *
 * @property id - 브랜드 고유 ID
 * @property name - 브랜드명
 * @property category - 브랜드 카테고리
 * @property group - 그룹명
 */
export interface Brand {
  id: number;
  name: string; // 예: brandName
  category: string; // 예: brand_category
  group: string; // 예: groupName
  // 필요시 company 등 추가 필드
}

/**
 * BrandItem 컴포넌트 Props
 *
 * @property brand - 브랜드 정보 객체
 */
interface BrandItemProps {
  brand: Brand;
}

/**
 * 브랜드 리스트 아이템 컴포넌트
 *
 * 브랜드명, 그룹, 카테고리 정보를 표시하고 클릭 시 상세 페이지로 이동합니다.
 *
 * @param brand - 브랜드 정보 객체
 * @returns 브랜드 리스트 아이템 JSX 요소
 */
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

/**
 * 전체 컨테이너
 *
 * 브랜드 아이템 전체를 감싸는 컨테이너입니다.
 * 클릭 시 배경색 변경 및 호버 효과를 제공합니다.
 */
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

/**
 * 브랜드 정보 영역
 *
 * 브랜드명과 그룹명을 세로로 배치합니다.
 */
const BrandDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

/**
 * 브랜드명 텍스트
 *
 * 굵고 큰 폰트로 브랜드명을 표시합니다.
 */
const BrandName = styled.span`
  font-weight: 900;
  font-size: 15px;
  color: #000;
  margin-bottom: 4px;
`;

/**
 * 그룹명 텍스트
 *
 * 브랜드의 그룹명을 표시합니다.
 */
const GroupName = styled.span`
  font-weight: 400;
  font-size: 12px;
  color: #666;
`;

/**
 * 카테고리 래퍼
 *
 * 카테고리 텍스트를 오른쪽에 배치합니다.
 */
const BrandCategoryWrapper = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
`;

/**
 * 카테고리 텍스트
 *
 * 브랜드의 카테고리명을 표시합니다.
 */
const BrandCategory = styled.span`
  font-weight: 400;
  font-size: 13px;
  color: #999;
  white-space: nowrap;
`;
