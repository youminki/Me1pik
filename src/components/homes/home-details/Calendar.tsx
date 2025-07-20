import Holidays from 'date-holidays';
import React, { useState } from 'react';
import styled from 'styled-components';

const hd = new Holidays('KR');

interface CalendarProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (range: [Date | null, Date | null]) => void;
  reservedDates?: Date[];
  minDate?: Date;
  monthsShown?: number;
}

const getMonthMatrix = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const matrix: (Date | null)[][] = [];
  let week: (Date | null)[] = [];
  let day = 1 - firstDay.getDay();
  while (day <= lastDay.getDate()) {
    week = [];
    for (let i = 0; i < 7; i++) {
      if (day < 1 || day > lastDay.getDate()) {
        week.push(null);
      } else {
        week.push(new Date(year, month, day));
      }
      day++;
    }
    matrix.push(week);
  }
  return matrix;
};

const isSameDay = (a: Date | null, b: Date | null) => {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const isBetween = (date: Date, start: Date | null, end: Date | null) => {
  if (!start || !end) return false;
  return date > start && date < end;
};

const Calendar: React.FC<CalendarProps> = ({
  startDate,
  endDate,
  onChange,
  reservedDates = [],
  minDate,
  monthsShown = 2,
}) => {
  const today = new Date();
  const [baseMonth, setBaseMonth] = useState(
    startDate ? new Date(startDate) : new Date()
  );

  // 공휴일/일요일 체크
  const isHoliday = (date: Date) => {
    // 2025년 7월 17일은 예외로 일반 날짜 처리
    if (
      date.getFullYear() === 2025 &&
      date.getMonth() === 6 &&
      date.getDate() === 17
    )
      return false;
    return !!hd.isHoliday(date);
  };
  const isSunday = (date: Date) => date.getDay() === 0;

  const handleDayClick = (date: Date) => {
    if (!startDate || (startDate && endDate)) {
      onChange([date, null]);
    } else if (startDate && !endDate) {
      if (date < startDate) {
        onChange([date, null]);
      } else {
        onChange([startDate, date]);
      }
    }
  };

  const isReserved = (date: Date) =>
    reservedDates.some((d) => isSameDay(d, date));

  const isPast = (date: Date) => {
    if (minDate && date < minDate) return true;
    return date < today;
  };

  const handlePrev = () => {
    setBaseMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };
  const handleNext = () => {
    setBaseMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const renderMonth = (year: number, month: number, showNav: boolean) => {
    const matrix = getMonthMatrix(year, month);
    return (
      <MonthContainer key={`${year}-${month}`}>
        <MonthHeader>
          {showNav && (
            <NavButton onClick={handlePrev} aria-label='이전달'>
              ◀
            </NavButton>
          )}
          <MonthTitle>
            {year}년 / {month + 1}월
          </MonthTitle>
          {showNav && (
            <NavButton onClick={handleNext} aria-label='다음달'>
              ▶
            </NavButton>
          )}
        </MonthHeader>
        <WeekHeader>
          {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
            <WeekDay key={d}>{d}</WeekDay>
          ))}
        </WeekHeader>
        <DaysGrid>
          {matrix.map((week, i) =>
            week.map((date, j) => {
              if (!date) return <DayCell key={i + '-' + j} $empty />;
              const reserved = isReserved(date);
              const past = isPast(date);
              const selectedStart = isSameDay(date, startDate);
              const selectedEnd = isSameDay(date, endDate);
              const selected = selectedStart || selectedEnd;
              const between = isBetween(date, startDate, endDate);
              const todayCell = isSameDay(date, today);
              const holiday = isHoliday(date);
              const sunday = isSunday(date);
              return (
                <DayCell
                  key={date.toISOString()}
                  $reserved={reserved}
                  $past={past}
                  $selected={selected}
                  $between={between}
                  $today={todayCell}
                  $holiday={holiday}
                  $sunday={sunday}
                  $start={selectedStart}
                  $end={selectedEnd}
                  $empty={false}
                  onClick={() =>
                    !reserved && !past ? handleDayClick(date) : undefined
                  }
                >
                  {date.getDate()}
                </DayCell>
              );
            })
          )}
        </DaysGrid>
      </MonthContainer>
    );
  };

  return (
    <CalendarWrapper>
      <MonthsRow>
        {Array.from({ length: monthsShown }).map((_, i) => {
          const d = new Date(
            baseMonth.getFullYear(),
            baseMonth.getMonth() + i,
            1
          );
          return renderMonth(d.getFullYear(), d.getMonth(), i === 0);
        })}
      </MonthsRow>
    </CalendarWrapper>
  );
};

export default Calendar;

// 스타일 컴포넌트
const CalendarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100vw;
  max-width: 100vw;
  box-sizing: border-box;
`;

const MonthsRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 600px; /* 원하는 최대 너비로 조정 */
`;

const MonthContainer = styled.div`
  flex: 1;
  background: #fff;
  border-radius: 0;
  border: 1px solid #000;
  box-shadow: none;
  padding: 32px 24px 28px 24px;
  margin-bottom: 8px;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  @media (max-width: 767px) {
    padding: 1rem;
    border-radius: 0;
  }
`;
const MonthHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;
`;
const MonthTitle = styled.div`
  flex: none;
  font-weight: 800;
  font-size: 20px;
  text-align: center;
  @media (max-width: 767px) {
    font-size: 16px;
  }
`;
const NavButton = styled.button`
  background: none;
  border: none;
  color: #222;
  font-size: 22px;
  font-weight: bold;
  cursor: pointer;
  padding: 0 8px;
  transition: color 0.15s;
  &:hover {
    color: #ffa726;
  }
`;
const WeekHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 4px;
  text-align: center;
`;
const WeekDay = styled.div`
  padding: 4px 0;
`;
const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  column-gap: 4px;
  row-gap: 8px;
  @media (max-width: 767px) {
    column-gap: 2px;
    row-gap: 6px;
  }
`;
const DayCell = styled.div<{
  $empty?: boolean;
  $reserved?: boolean;
  $past?: boolean;
  $selected?: boolean;
  $between?: boolean;
  $today?: boolean;
  $holiday?: boolean;
  $sunday?: boolean;
  $start?: boolean;
  $end?: boolean;
}>`
  aspect-ratio: 1 / 1;
  width: 100%;
  min-width: 0;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  background: ${({ $selected, $between, $today }) =>
    $today ? '#FFF8E1' : $selected ? '#fff' : $between ? '#F6AE24' : '#fff'};
  color: ${({ $reserved, $past, $selected, $holiday, $sunday }) => {
    if ($reserved || $past) return '#ddd';
    if ($selected) return '#000';
    if ($holiday || $sunday) return 'red';
    return '#000';
  }};
  border: ${({ $selected, $start, $end, $today }) => {
    if ($start || $end) return '2px solid #F6AE24';
    if ($selected) return '2px solid #F6AE24';
    if ($today) return 'none';
    return '1px solid #ddd';
  }};
  cursor: ${({ $reserved, $past }) =>
    $reserved || $past ? 'not-allowed' : 'pointer'};
  opacity: ${({ $empty }) => ($empty ? 0.2 : 1)};
  transition:
    background 0.15s,
    color 0.15s,
    border 0.15s;
  font-weight: ${({ $start, $end, $today, $between }) =>
    $start || $end || $today || $between ? 'bold' : 600};
  font-size: ${({ $start, $end, $today }) =>
    $start || $end || $today ? '20px' : '18px'};
  box-sizing: border-box;
  &:hover {
    background: ${({ $reserved, $past, $selected, $between, $today }) =>
      $today
        ? '#FFF8E1'
        : $reserved || $past || $selected || $between
          ? undefined
          : '#f8f9fa'};
  }
  @media (max-width: 767px) {
    font-size: ${({ $start, $end, $today }) =>
      $start || $end || $today ? '16px' : '15px'};
    min-height: 38px;
    border-radius: 0;
  }
  @media (min-width: 768px) {
    min-height: 56px;
  }
`;
