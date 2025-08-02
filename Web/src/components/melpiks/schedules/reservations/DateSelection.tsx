/**
 * 날짜 선택 컴포넌트 (DateSelection.tsx)
 *
 * 예약 스케줄에서 년도와 월을 선택하는 UI 컴포넌트입니다.
 * 드롭다운을 통해 년도와 월을 선택할 수 있습니다.
 *
 * @description
 * - 년도 선택 드롭다운
 * - 월 선택 드롭다운
 * - 반응형 레이아웃
 * - 커스텀 셀렉트 컴포넌트 사용
 */
import React from 'react';
import styled from 'styled-components';

import { CustomSelect } from '@/components/shared/forms/CustomSelect';

/**
 * 날짜 선택 Props
 *
 * @property year - 선택된 년도
 * @property month - 선택된 월
 * @property onYearChange - 년도 변경 핸들러
 * @property onMonthChange - 월 변경 핸들러
 */
interface DateSelectionProps {
  year: number;
  month: number;
  onYearChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onMonthChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * 날짜 선택 컴포넌트
 *

 * 예약 스케줄에서 년도와 월을 선택하는 UI를 렌더링합니다.
 * 드롭다운을 통해 년도와 월을 선택할 수 있습니다.
 *
 * @param year - 선택된 년도
 * @param month - 선택된 월
 * @param onYearChange - 년도 변경 핸들러
 * @param onMonthChange - 월 변경 핸들러
 * @returns 날짜 선택 UI JSX 요소
 */
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

/**
 * 날짜 선택 컨테이너
 *

 * 날짜 선택 UI 전체를 감싸는 컨테이너입니다.
 */
const DateSelectionContainer = styled.div`
  gap: 10px;
  width: 100%;
`;

/**
 * 라벨 텍스트
 *

 * '예약일자 (선택)' 라벨을 표시합니다.
 */
const Label = styled.label`
  font-weight: 700;
  font-size: 10px;
  line-height: 11px;
  color: #000000;
`;

/**
 * 날짜 행
 *

 * 년도와 월 선택 드롭다운을 가로로 배치하는 컨테이너입니다.
 */
const DateRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
`;

/**
 * 년도 입력 드롭다운
 *

 * 년도를 선택하는 드롭다운입니다.
 * CustomSelect 컴포넌트를 사용합니다.
 */
const DateInput = styled.select`
  height: 51px;
  border: 1px solid #000;

  flex: 1;

  font-weight: 800;
  font-size: 13px;
  line-height: 14px;
  color: #000000;
`;

/**
 * 월 선택 드롭다운
 *

 * 월을 선택하는 드롭다운입니다.
 * CustomSelect 컴포넌트를 사용합니다.
 */
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
