/**
 * 브랜드/상품 통계 섹션 컴포넌트 (StatsSection.tsx)
 *
 * 브랜드/상품 개수 등 주요 통계를 표시하는 UI 컴포넌트입니다.
 *
 * @description
 * - 브랜드/상품 개수 및 라벨 표시
 * - Now 라벨 등 부가 정보 표시
 * - 반응형 스타일 적용
 */
import React from 'react';
import styled from 'styled-components';

/**
 * 통계 섹션 Props
 *
 * @property brandCount - 브랜드 개수
 * @property productCount - 상품 개수
 * @property brandLabel - 브랜드 라벨(선택)
 * @property productLabel - 상품 라벨(선택)
 */
interface Props {
  brandCount: number;
  productCount: number;
  brandLabel?: string;
  productLabel?: string;
}

/**
 * 브랜드/상품 통계 섹션 컴포넌트
 *
 * 브랜드/상품 개수와 라벨, 부가 정보를 표시합니다.
 *
 * @param brandCount - 브랜드 개수
 * @param productCount - 상품 개수
 * @param brandLabel - 브랜드 라벨(선택)
 * @param productLabel - 상품 라벨(선택)
 * @returns 통계 섹션 JSX 요소
 */
const StatsSection: React.FC<Props> = ({
  brandCount,
  productCount,
  brandLabel = '브랜드',
  productLabel = '상품',
}) => (
  <StatsContainer>
    <StatBox $white>
      <Row>
        <StatLabel>{brandLabel}</StatLabel>
        <StatNumber>{brandCount}</StatNumber>
      </Row>
    </StatBox>
    <StatBox $gray>
      <Row>
        <StatLabel>{productLabel}</StatLabel>
        <StatNumber>{productCount}</StatNumber>
      </Row>
      <DateLabel>Now</DateLabel>
    </StatBox>
  </StatsContainer>
);

export default StatsSection;

/**
 * 통계 전체 컨테이너
 *
 * 통계 박스들을 가로로 배치하는 컨테이너입니다.
 */
const StatsContainer = styled.div`
  display: flex;
  gap: 0;
  width: 100%;
`;

/**
 * 통계 박스
 *
 * 브랜드/상품 개수와 라벨을 표시하는 박스입니다.
 * @property $white - 흰색 배경 여부
 * @property $gray - 회색 배경 여부
 */
const StatBox = styled.div<{
  $white?: boolean;
  $gray?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ $white, $gray }) =>
    $white ? '#fff' : $gray ? '#f6f6f6' : '#fff'};
  border: 1px solid #ddd;
  border-radius: ${({ $white, $gray }) =>
    $white ? '10px 0 0 0' : $gray ? '0 0 10px 0' : '0'};
  text-align: center;
  padding: 15px 20px;
  position: relative;
  margin-right: 0px;
  white-space: nowrap;
`;

/**
 * 통계 행
 *
 * 라벨과 숫자를 가로로 배치하는 행입니다.
 */
const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
`;

/**
 * 통계 숫자
 *
 * 브랜드/상품 개수를 강조하여 표시합니다.
 */
const StatNumber = styled.div`
  font-weight: 800;
  font-size: 12px;
  line-height: 13px;
  color: #f6ae24;
  white-space: nowrap;
`;

/**
 * 통계 라벨
 *
 * 브랜드/상품 라벨을 표시합니다.
 */
const StatLabel = styled.div`
  font-weight: 700;
  font-size: 12px;
  line-height: 13px;
  color: #000000;
  margin-right: 5px;
  white-space: nowrap;
`;

/**
 * 날짜 라벨
 *
 * 부가 정보(예: Now)를 표시하는 라벨입니다.
 */
const DateLabel = styled.div`
  position: absolute;
  top: -10px;
  right: 10px;
  padding: 4px 8px;

  font-weight: 900;
  font-size: 8px;
  line-height: 1.2;
  color: #fff;
  background: #f6ae24;
  white-space: nowrap;
`;
