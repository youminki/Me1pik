/**
 * 생년월일 섹션 컴포넌트 (BirthdateSection.tsx)
 *
 * 회원가입 시 사용자의 생년월일을 선택할 수 있는 섹션 컴포넌트입니다.
 * 년, 월, 일을 각각 드롭다운으로 선택할 수 있으며, 실시간으로 선택된 값을 콜백으로 전달합니다.
 *
 * @description
 * - 생년월일 선택 기능
 * - 년/월/일 드롭다운
 * - 실시간 값 업데이트
 * - 콜백 함수 지원
 * - 접근성 지원
 * - 반응형 디자인
 */

import React, { useState } from 'react';
import styled from 'styled-components';

/**
 * 생년월일 섹션 속성 인터페이스
 *
 * 생년월일 섹션 컴포넌트의 props를 정의합니다.
 *
 * @property onChange - 생년월일 선택 시 호출되는 콜백 (선택적)
 * @property label - 라벨 텍스트 (선택적)
 */
interface BirthdateSectionProps {
  onChange?: (birthdate: { year: string; month: string; day: string }) => void; // 생년월일 선택 시 호출되는 콜백 (선택적)
  label?: string; // 라벨 텍스트 (선택적)
}

/**
 * 생년월일 섹션 컴포넌트
 *
 * 회원가입 시 사용자의 생년월일을 선택할 수 있는 섹션을 렌더링합니다.
 * 년, 월, 일을 각각 드롭다운으로 선택할 수 있으며, 실시간으로 선택된 값을 콜백으로 전달합니다.
 *
 * @param onChange - 생년월일 선택 시 호출되는 콜백 (선택적)
 * @returns 생년월일 섹션 컴포넌트
 */
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
