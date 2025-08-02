/**
 * 통계 섹션 컴포넌트 (StatsSection.tsx)
 *
 * 방문자 수, 매출 등의 통계 정보를 표시하는 컴포넌트를 제공합니다.
 * 두 개의 통계 박스로 구성되어 있으며, 날짜 범위 정보도 포함합니다.
 * 반응형 디자인으로 다양한 화면 크기에 대응합니다.
 *
 * @description
 * - 통계 정보 표시 (방문자 수, 매출)
 * - 날짜 범위 표시 (선택적)
 * - 반응형 디자인
 * - 커스터마이징 가능한 라벨
 * - 시각적 구분을 위한 색상 테마
 */

import React from 'react';
import styled from 'styled-components';

/**
 * 통계 섹션 속성 인터페이스
 *
 * 통계 섹션 컴포넌트의 props를 정의합니다.
 *
 * @property visits - 방문자 수
 * @property sales - 매출
 * @property dateRange - 날짜 범위 (선택적)
 * @property visitLabel - 방문자 라벨
 * @property salesLabel - 매출 라벨
 * @property showDateLabel - 날짜 라벨 표시 여부 (기본값: true)
 */
interface StatsSectionProps {
  visits: string | number; // 방문자 수
  sales: string | number; // 매출
  dateRange?: string; // 날짜 범위 (선택적)
  visitLabel: string; // 방문자 라벨
  salesLabel: string; // 매출 라벨
  showDateLabel?: boolean; // 날짜 라벨 표시 여부 (기본값: true)
}

/**
 * 통계 섹션 컴포넌트
 *
 * 통계 정보를 표시하는 섹션을 렌더링하는 컴포넌트입니다.
 * 방문자 수와 매출을 두 개의 박스로 나누어 표시하며,
 * 날짜 범위 정보도 포함할 수 있습니다.
 *
 * @param visits - 방문자 수
 * @param sales - 매출
 * @param dateRange - 날짜 범위 (선택적)
 * @param visitLabel - 방문자 라벨
 * @param salesLabel - 매출 라벨
 * @param showDateLabel - 날짜 라벨 표시 여부 (기본값: true)
 * @returns 통계 섹션 컴포넌트
 */
const StatsSection: React.FC<StatsSectionProps> = ({
  visits,
  sales,
  dateRange,
  visitLabel,
  salesLabel,
  showDateLabel = true,
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
      {showDateLabel && dateRange && <DateLabel>{dateRange}</DateLabel>}
    </StatBox>
  </StatsContainer>
);

export default StatsSection;

const StatsContainer = styled.div`
  display: flex;
  gap: 0;
  width: 100%;
`;

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
  flex: 1;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
`;

const StatNumber = styled.div`
  font-weight: 800;
  font-size: 12px;
  line-height: 13px;
  color: #f6ae24;
  white-space: nowrap;
`;

const StatLabel = styled.div`
  font-weight: 700;
  font-size: 12px;
  line-height: 13px;
  color: #000000;
  margin-right: 5px;
  white-space: nowrap;
`;

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
