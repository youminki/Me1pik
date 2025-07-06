import React from 'react';
import styled from 'styled-components';

type PeriodSectionProps = {
  selectedPeriod: number;
  setSelectedPeriod: (period: number) => void;
};

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
          active={selectedPeriod === 3}
          onClick={() => setSelectedPeriod(3)}
        >
          3개월
        </PeriodButton>
        <PeriodButton
          active={selectedPeriod === 6}
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

const PeriodButton = styled.button<{ active: boolean }>`
  padding: 8px 12px;

  height: 36px;
  margin-right: 8px;
  border-radius: 18px;

  font-weight: 700;
  font-size: 12px;
  line-height: 11px;
  color: ${({ active }) => (active ? '#fff' : '#000')};
  background: ${({ active }) => (active ? '#000' : '#fff')};
  border: 1px solid ${({ active }) => (active ? '#000' : '#ccc')};
  cursor: pointer;
  white-space: nowrap;
`;
