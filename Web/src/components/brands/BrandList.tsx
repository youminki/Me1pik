// src/components/brands/BrandList.tsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import BrandItem, { Brand as BrandType } from '@/components/brands/BrandItem';

interface BrandListProps {
  groupedBrands: Record<string, BrandType[]>;
}

export const BrandList: React.FC<BrandListProps> = ({ groupedBrands }) => {
  const keys = Object.keys(groupedBrands);
  const totalBrands = keys.reduce(
    (sum, key) => sum + groupedBrands[key].length,
    0
  );
  const [countdown, setCountdown] = useState(3);

  // 검색 결과가 없을 때 3초 카운트다운
  useEffect(() => {
    if (keys.length === 0 || totalBrands === 0) {
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [keys.length, totalBrands]);

  return (
    <Container>
      {keys.length > 0 && totalBrands > 0 ? (
        keys.map((groupKey) => (
          <GroupSection key={groupKey}>
            <GroupTitle>{groupKey}</GroupTitle>
            {groupedBrands[groupKey].map((brand) => (
              // brand.id가 고유하므로 key로 사용
              <BrandItem key={brand.id} brand={brand} />
            ))}
          </GroupSection>
        ))
      ) : (
        <NoResultsContainer>
          <NoResultsText>검색 결과가 없습니다</NoResultsText>
          <NoResultsSubText>다른 검색어를 입력해보세요</NoResultsSubText>
          <CountdownText>
            {countdown}초 후 전체 목록으로 돌아갑니다
          </CountdownText>
        </NoResultsContainer>
      )}
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  border: 1px solid #ccc;
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

const NoResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const NoResultsText = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const NoResultsSubText = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
`;

const CountdownText = styled.div`
  font-size: 12px;
  color: #999;
`;
