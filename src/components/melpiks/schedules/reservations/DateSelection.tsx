import React from 'react';
import styled from 'styled-components';

import { CustomSelect } from '@/components/shared/forms/CustomSelect';

interface DateSelectionProps {
  year: number;
  month: number;
  onYearChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onMonthChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const DateSelection: React.FC<DateSelectionProps> = ({
  year,
  month,
  onYearChange,
  onMonthChange,
}) => {
  return (
    <DateSelectionContainer>
      <Label>예약일자 (선택)</Label>
      <DateRow>
        <DateInput as={CustomSelect} value={year} onChange={onYearChange}>
          <option value={2024}>2024년</option>
          <option value={2025}>2025년</option>
        </DateInput>
        <DateDropdown as={CustomSelect} value={month} onChange={onMonthChange}>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {`${i + 1}월`}
            </option>
          ))}
        </DateDropdown>
      </DateRow>
    </DateSelectionContainer>
  );
};

export default DateSelection;

const DateSelectionContainer = styled.div`
  gap: 10px;
  width: 100%;
`;

const Label = styled.label`
  font-weight: 700;
  font-size: 10px;
  line-height: 11px;
  color: #000000;
`;

const DateRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
`;

const DateInput = styled.select`
  height: 51px;
  border: 1px solid #000;

  flex: 1;

  font-weight: 800;
  font-size: 13px;
  line-height: 14px;
  color: #000000;
`;

const DateDropdown = styled.select`
  height: 51px;
  border: 1px solid #000;

  flex: 1;
  margin-left: 10px;

  font-weight: 800;
  font-size: 13px;
  line-height: 14px;
  color: #000000;
`;
