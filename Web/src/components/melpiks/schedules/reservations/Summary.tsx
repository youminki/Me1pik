// src/components/melpiks/schedules/reservations/Summary.tsx
import React from 'react';
import styled from 'styled-components';

interface SummaryProps {
  range: [Date, Date] | null;
  seasonProgress: {
    total: number;
    completed: number;
    pending: number;
  };
}

const Summary: React.FC<SummaryProps> = ({ range, seasonProgress }) => {
  const formatRangeText = () => {
    if (!range) return '날짜 선택 필요';
    const [start, end] = range;
    const startMonth = start.getMonth() + 1;
    const startDay = start.getDate();
    const endMonth = end.getMonth() + 1;
    const endDay = end.getDate();
    return `${startMonth}월 ${startDay}일 ~ ${endMonth}월 ${endDay}일`;
  };

  return (
    <SummaryContainer>
      <ScheduleInfo>
        <Label>선택된 스케줄</Label>
        <InfoBox>
          <InfoText>{formatRangeText()}</InfoText>
        </InfoBox>
      </ScheduleInfo>
      <ScheduleInfo>
        <Label>시즌 진행 회차</Label>
        <InfoBox>
          <InfoText>
            총 {seasonProgress.total}회 / 완료 {seasonProgress.completed}회
          </InfoText>
        </InfoBox>
      </ScheduleInfo>
    </SummaryContainer>
  );
};

export default Summary;

const SummaryContainer = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
`;

const ScheduleInfo = styled.div`
  flex: 1;
`;

const Label = styled.label`
  font-weight: 700;
  font-size: 10px;
  line-height: 11px;
  color: #000000;
`;

const InfoBox = styled.div`
  margin-top: 10px;
  padding: 0 10px;
  border: 1px solid #000;

  min-height: 51px;
  display: flex;
  align-items: center;
`;

const InfoText = styled.div`
  font-weight: 800;
  font-size: 13px;
  line-height: 14px;
  color: #000000;
`;
