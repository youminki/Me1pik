/**
 * 브랜드 그룹 리스트 컴포넌트 (BrandList.tsx)
 *
 * 브랜드를 그룹별로 묶어 리스트로 표시하는 컴포넌트입니다.
 * 각 그룹별로 BrandItem을 렌더링합니다.
 *
 * @description
 * - 그룹별 브랜드 리스트 렌더링
 * - 그룹명(섹션 타이틀) 표시
 * - 반응형 스타일 적용
 */
// src/components/brands/BrandList.tsx

import React from 'react';
import styled from 'styled-components';

import BrandItem, { Brand as BrandType } from '@/components/brands/BrandItem';

/**
 * BrandList 컴포넌트 Props
 *
 * @property groupedBrands - 그룹명별 브랜드 배열 객체
 */
interface BrandListProps {
  groupedBrands: Record<string, BrandType[]>;
}

/**
 * 브랜드 그룹 리스트 컴포넌트
 *
 * 그룹별로 브랜드 리스트를 렌더링합니다.
 *
 * @param groupedBrands - 그룹명별 브랜드 배열 객체
 * @returns 브랜드 그룹 리스트 JSX 요소
 */
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

/**
 * 전체 컨테이너
 *
 * 그룹별 브랜드 리스트 전체를 감싸는 컨테이너입니다.
 */
const Container = styled.div`
  width: 100%;
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
`;

/**
 * 그룹 섹션
 *
 * 각 그룹별 브랜드 리스트를 감싸는 섹션입니다.
 */
const GroupSection = styled.section`
  margin-bottom: 0px;
`;

/**
 * 그룹 타이틀
 *
 * 그룹명을 표시하는 섹션 타이틀입니다.
 */
const GroupTitle = styled.h2`
  font-weight: 900;
  font-size: 16px;
  background-color: #555;
  padding: 12px 20px;
  color: white;
  margin: 0px;
`;
