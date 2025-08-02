/**
 * stats-section 컴포넌트
 *
 * 통계 섹션 컴포넌트를 제공합니다.
 * 방문자 수, 매출 등의 통계 정보를 표시하는 컴포넌트입니다.
 * 두 개의 통계 박스로 구성되어 있으며, 날짜 범위 정보도 포함합니다.
 *
 * @description
 * - 통계 정보 표시
 * - 방문자 수 및 매출 표시
 * - 날짜 범위 표시
 * - 반응형 디자인
 */

import React from 'react';
import styled from 'styled-components';

/**
 * StatsSectionProps 인터페이스
 *
 * 통계 섹션 컴포넌트의 props를 정의합니다.
 *
 * @property visits - 방문자 수
 * @property sales - 매출
 * @property dateRange - 날짜 범위
 * @property visitLabel - 방문자 라벨
 * @property salesLabel - 매출 라벨
 */
interface StatsSectionProps {
  visits: string | number;
  sales: string | number;
  dateRange: string;
  visitLabel: string;
  salesLabel: string;
}

/**
 * StatsSection 컴포넌트
 *
 * 통계 섹션 컴포넌트입니다.
 *
 * @param visits - 방문자 수
 * @param sales - 매출
 * @param dateRange - 날짜 범위
 * @param visitLabel - 방문자 라벨
 * @param salesLabel - 매출 라벨
 * @returns 통계 섹션 컴포넌트
 */
const StatsSection: React.FC<StatsSectionProps> = ({
  visits,
  sales,
  dateRange,
  visitLabel,
  salesLabel,
}) => (
  <StatsContainer>
    <StatBox $white>
      <Row>
        <StatLabel>{visitLabel}</StatLabel>
        <StatNumber>{visits}</StatNumber>
      </Row>
    </StatBox>
    <StatBox $gray>
      <Row>
        <StatLabel>{salesLabel}</StatLabel>
        <StatNumber>{sales}</StatNumber>
      </Row>
      <DateLabel>{dateRange}</DateLabel>
    </StatBox>
  </StatsContainer>
);

export default StatsSection;

/**
 * StatsContainer 스타일 컴포넌트
 *
 * 통계 컨테이너의 스타일을 정의합니다.
 */
const StatsContainer = styled.div`
  display: flex;
  gap: 0;

  width: 100%;
`;

/**
 * StatBox 스타일 컴포넌트
 *
 * 통계 박스의 스타일을 정의합니다.
 *
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
  margin-right: 0;
  white-space: nowrap;
`;

/**
 * Row 스타일 컴포넌트
 *
 * 행의 스타일을 정의합니다.
 */
const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
`;

/**
 * StatNumber 스타일 컴포넌트
 *
 * 통계 숫자의 스타일을 정의합니다.
 */
const StatNumber = styled.div`
  font-weight: 800;
  font-size: 12px;
  line-height: 13px;
  color: #f6ae24;
  white-space: nowrap;
`;

/**
 * StatLabel 스타일 컴포넌트
 *
 * 통계 라벨의 스타일을 정의합니다.
 */
const StatLabel = styled.div`
  font-weight: 700;
  font-size: 12px;
  line-height: 13px;
  color: #000;
  margin-right: 5px;
  white-space: nowrap;
`;

/**
 * DateLabel 스타일 컴포넌트
 *
 * 날짜 라벨의 스타일을 정의합니다.
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
