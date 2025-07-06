// src/components/LockerRoom/StatsSection.tsx
import React from 'react';
import styled from 'styled-components';

interface StatsSectionProps {
  visits: string | number;
  sales: string | number;
  dateRange: string;
  visitLabel: string;
  salesLabel: string;
}

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
