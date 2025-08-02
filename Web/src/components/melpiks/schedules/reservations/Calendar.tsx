// src/components/melpiks/schedules/reservations/Calendar.tsx
import React from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';
import styled from 'styled-components';

interface CalendarProps {
  year: number;
  month: number;
  startDate?: Date;
  endDate?: Date;
  onDateClick: (day: number) => void;
  onIncrease: () => void;
  onDecrease: () => void;
  today: Date;
}

const getDaysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
const getFirstDayOfMonth = (y: number, m: number) =>
  new Date(y, m - 1, 1).getDay();

const Calendar: React.FC<CalendarProps> = ({
  year,
  month,
  startDate,
  endDate,
  onDateClick,
  onIncrease,
  onDecrease,
  today,
}) => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const todayZero = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).getTime();

  const isDisabled = (day: number) => {
    const d = new Date(year, month - 1, day).getTime();
    return d < todayZero;
  };

  const isInSelectedRange = (day: number) => {
    if (!startDate || !endDate) return false;
    const s = startDate.getTime();
    const e = endDate.getTime();
    const d = new Date(year, month - 1, day).getTime();
    return d >= Math.min(s, e) && d <= Math.max(s, e);
  };

  return (
    <CalendarWrapper>
      <Header>
        <HeaderText>
          {year}년 {month}월
        </HeaderText>
        <IconGroup>
          <IconButton onClick={onDecrease} title='종료일 -1일'>
            <FaMinus />
          </IconButton>
          <IconButton onClick={onIncrease} title='종료일 +1일'>
            <FaPlus />
          </IconButton>
        </IconGroup>
      </Header>

      <CalendarContainer>
        {['일', '월', '화', '수', '목', '금', '토'].map((name, idx) => (
          <DayName key={idx} $isWeekend={idx === 0 || idx === 6}>
            {name}
          </DayName>
        ))}

        {Array.from({ length: firstDay }).map((_, i) => (
          <EmptyBox key={i} />
        ))}

        {Array.from({ length: daysInMonth }, (_, idx) => {
          const day = idx + 1;
          const disabled = isDisabled(day);
          const inSelectedRange = isInSelectedRange(day);
          const selected = inSelectedRange;
          return (
            <DayBox
              key={day}
              disabled={disabled}
              selected={selected}
              onClick={() => {
                if (!disabled) onDateClick(day);
              }}
            >
              <DayNumber>{day}</DayNumber>
            </DayBox>
          );
        })}
      </CalendarContainer>
    </CalendarWrapper>
  );
};

export default Calendar;

const CalendarWrapper = styled.div`
  position: relative;

  border-radius: 4px;
`;

const Header = styled.div`
  position: relative;
  height: 3rem; /* 높이 약간 늘림 */
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 1rem; /* 좌우 여백 확대 */
  background: #ffffff;
  border-bottom: 1px solid #cccccc;
`;

const HeaderText = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 16px; /* 기본 사이즈 증가 */
  font-weight: bold;

  @media (min-width: 768px) {
    font-size: 18px;
  }
  @media (min-width: 1024px) {
    font-size: 20px; /* 데스크탑에서 더 키움 */
  }
`;

const IconGroup = styled.div`
  display: flex;
  gap: 8px; /* 아이콘 간격 확대 */
`;

const IconButton = styled.button`
  background: #f6ae24;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  width: 28px; /* 기본 크기 키움 */
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px; /* 아이콘 크기 키움 */
  transition: background 0.2s;
  &:hover {
    background: #d8921e;
  }

  @media (min-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
  @media (min-width: 1024px) {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }
`;

const CalendarContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  padding: 0.5rem;

  @media (min-width: 1024px) {
    gap: 6px;
    padding: 1rem;
  }
`;

const DayName = styled.div<{ $isWeekend: boolean }>`
  text-align: center;
  font-weight: bold;
  color: ${(p) => (p.$isWeekend ? '#888888' : '#000000')};
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;

  @media (min-width: 768px) {
    font-size: 14px;
  }
  @media (min-width: 1024px) {
    font-size: 16px;
  }
`;

const EmptyBox = styled.div`
  aspect-ratio: 1;
`;

const DayBox = styled.div<{ disabled: boolean; selected: boolean }>`
  cursor: ${(p) => (p.disabled ? 'default' : 'pointer')};
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(p) =>
    p.selected ? '#F6AE24' : p.disabled ? '#EEEEEE' : '#FFFFFF'};
  color: ${(p) =>
    p.selected ? '#FFFFFF' : p.disabled ? '#AAAAAA' : '#000000'};
  border: 1px solid
    ${(p) => (p.selected ? '#F6AE24' : p.disabled ? '#DDDDDD' : '#CCCCCC')};
  transition: background 0.2s;

  &:hover {
    background: ${(p) =>
      p.selected ? '#F6AE24' : p.disabled ? '#EEEEEE' : '#EEEEEE'};
  }
`;

const DayNumber = styled.span`
  font-size: 12px;
  @media (min-width: 768px) {
    font-size: 14px;
  }
  @media (min-width: 1024px) {
    font-size: 16px;
  }
`;
