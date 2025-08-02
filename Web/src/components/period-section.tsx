/**
 * 기간 선택 섹션 컴포넌트 (period-section.tsx)
 *
 * 기간을 선택할 수 있는 섹션 컴포넌트를 제공합니다.
 * 3개월, 6개월 등의 기간을 선택할 수 있으며,
 * 선택된 기간에 따라 날짜 범위를 표시합니다.
 *
 * @description
 * - 기간 선택 버튼 (3개월, 6개월)
 * - 선택된 기간에 따른 날짜 범위 표시
 * - 활성/비활성 상태 스타일링
 * - 반응형 디자인
 */

import React from 'react';
import styled from 'styled-components';

/**
 * 기간 선택 섹션 속성 인터페이스
 *
 * 기간 선택 섹션 컴포넌트의 props를 정의합니다.
 *
 * @property selectedPeriod - 현재 선택된 기간 (개월 수)
 * @property setSelectedPeriod - 기간 선택 핸들러 함수
 */
interface PeriodSectionProps {
  selectedPeriod: number; // 현재 선택된 기간 (개월 수)
  setSelectedPeriod: (period: number) => void; // 기간 선택 핸들러 함수
}

/**
 * 기간 선택 섹션 컴포넌트
 *
 * 기간을 선택할 수 있는 섹션을 렌더링하는 컴포넌트입니다.
 * 선택된 기간에 따라 날짜 범위를 동적으로 표시합니다.
 *
 * @param selectedPeriod - 현재 선택된 기간 (개월 수)
 * @param setSelectedPeriod - 기간 선택 핸들러 함수
 * @returns 기간 선택 섹션 컴포넌트
 */
const PeriodSection: React.FC<PeriodSectionProps> = ({
  selectedPeriod,
  setSelectedPeriod,
}) => {
  const dateRangeText =
    selectedPeriod === 3
      ? '2025.03.01 ~ 2025.05.31'
      : '2025.03.01 ~ 2025.08.31';

  return (
    <SettlementHeader>
      <DateRange>{dateRangeText}</DateRange>
      <PeriodSelector>
        <PeriodButton
          $active={selectedPeriod === 3}
          onClick={() => setSelectedPeriod(3)}
        >
          3개월
        </PeriodButton>
        <PeriodButton
          $active={selectedPeriod === 6}
          onClick={() => setSelectedPeriod(6)}
        >
          6개월
        </PeriodButton>
      </PeriodSelector>
    </SettlementHeader>
  );
};

export default PeriodSection;

const SettlementHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f3f3f3;
  border: 1px solid #dddddd;
  padding: 10px;
  white-space: nowrap;
`;

const DateRange = styled.p`
  font-weight: 700;
  font-size: 14px;
  line-height: 13px;
  color: #000;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PeriodSelector = styled.div`
  display: flex;
  flex-shrink: 0;
`;

const PeriodButton = styled.button<{ $active: boolean }>`
  padding: 8px 12px;

  height: 36px;
  margin-right: 8px;
  border-radius: 18px;

  font-weight: 700;
  font-size: 12px;
  line-height: 11px;
  color: ${({ $active }) => ($active ? '#fff' : '#000')};
  background: ${({ $active }) => ($active ? '#000' : '#fff')};
  border: 1px solid ${({ $active }) => ($active ? '#000' : '#ccc')};
  cursor: pointer;
  white-space: nowrap;
`;
