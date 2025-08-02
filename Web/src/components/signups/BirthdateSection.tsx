import React, { useState } from 'react';
import styled from 'styled-components';

interface BirthdateSectionProps {
  onChange?: (birthdate: { year: string; month: string; day: string }) => void; // 생년월일 선택 시 호출되는 콜백
  label?: string;
}

const BirthdateSection: React.FC<BirthdateSectionProps> = ({ onChange }) => {
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setBirthYear(value);
    if (onChange) onChange({ year: value, month: birthMonth, day: birthDay });
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setBirthMonth(value);
    if (onChange) onChange({ year: birthYear, month: value, day: birthDay });
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setBirthDay(value);
    if (onChange) onChange({ year: birthYear, month: birthMonth, day: value });
  };

  return (
    <BirthdateWrapper>
      <Label htmlFor='birthYear'>생년월일</Label>
      <BirthdateContainer>
        <StyledSelect
          name='birthYear'
          id='birthYear'
          value={birthYear}
          onChange={handleYearChange}
          required
        >
          <option value='' disabled>
            년도를 선택하세요
          </option>
          {Array.from({ length: 100 }, (_, i) => {
            const year = new Date().getFullYear() - i;
            return (
              <option key={year} value={year}>
                {year}년
              </option>
            );
          })}
        </StyledSelect>
        <StyledSelect
          name='birthMonth'
          id='birthMonth'
          value={birthMonth}
          onChange={handleMonthChange}
          required
        >
          <option value='' disabled>
            월을 선택하세요
          </option>
          {Array.from({ length: 12 }, (_, i) => {
            const month = i + 1;
            return (
              <option key={month} value={month}>
                {month}월
              </option>
            );
          })}
        </StyledSelect>
        <StyledSelect
          name='birthDay'
          id='birthDay'
          value={birthDay}
          onChange={handleDayChange}
          required
        >
          <option value='' disabled>
            일을 선택하세요
          </option>
          {Array.from({ length: 31 }, (_, i) => {
            const day = i + 1;
            return (
              <option key={day} value={day}>
                {day}일
              </option>
            );
          })}
        </StyledSelect>
      </BirthdateContainer>
    </BirthdateWrapper>
  );
};

export default BirthdateSection;

const BirthdateWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 20px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
  text-align: left;
  margin-bottom: 12px;
`;

const BirthdateContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 10px;

  select {
    flex: 1;
  }
`;

const StyledSelect = styled.select`
  padding: 12px;
  font-size: 14px;
  width: 100%;
  border: 1px solid #dddddd;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
  }

  option {
    padding: 10px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 12px;
    padding: 10px;
  }
`;
