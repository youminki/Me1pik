import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Calendar from '../../../components/melpiks/schedules/reservations/Calendar';
import Stepper from '../../../components/melpiks/schedules/reservations/Stepper';
import Summary from '../../../components/melpiks/schedules/reservations/Summary';
import DateSelection from '../../../components/melpiks/schedules/reservations/DateSelection';
import BottomBar from '../../../components/melpiks/schedules/reservations/BottomBar';

const ScheduleReservation1: React.FC = () => {
  const navigate = useNavigate();

  // 오늘 날짜 기준
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDate = today.getDate();

  // 연/월 상태: 초기값 오늘 기준
  const [year, setYear] = useState<number>(todayYear);
  const [month, setMonth] = useState<number>(todayMonth);

  // 선택 범위: [start, end], start 고정, end만 증감
  const [range, setRange] = useState<[Date, Date] | null>(null);

  useEffect(() => {
    // 마운트 시 초기범위: 오늘 ~ 한 달後 같은 날짜
    const start = new Date(todayYear, todayMonth - 1, todayDate);
    const end = new Date(start);
    end.setMonth(start.getMonth() + 1);
    setRange([start, end]);
    // 캘린더 view는 start 월로 유지
    setYear(start.getFullYear());
    setMonth(start.getMonth() + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 연/월 변경 시 range 유지
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = Number(e.target.value);
    setYear(newYear);
  };
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = Number(e.target.value);
    setMonth(newMonth);
  };

  // 날짜 클릭: 오늘 이후만, start 고정, end = start + 1달
  const handleDateClick = (day: number) => {
    const clicked = new Date(year, month - 1, day);
    const todayZero = new Date(todayYear, todayMonth - 1, todayDate).getTime();
    if (clicked.getTime() < todayZero) return;

    const newStart = clicked;
    const newEnd = new Date(newStart);
    newEnd.setMonth(newStart.getMonth() + 1);
    setRange([newStart, newEnd]);

    // 캘린더 view 이동: start 월
    setYear(newStart.getFullYear());
    setMonth(newStart.getMonth() + 1);
  };

  // '+' / '-' 클릭: 마지막 날짜(end)만 증감, 그리고 캘린더 view를 end가 속한 달로 이동
  const adjustEnd = (offsetDays: number) => {
    if (!range) return;
    const [start, end] = range;
    const newEnd = new Date(end);
    newEnd.setDate(end.getDate() + offsetDays);

    // newEnd가 start 이전이면 무시
    if (newEnd.getTime() <= start.getTime()) return;

    setRange([start, newEnd]);

    // 마지막 날짜가 속한 달로 캘린더 view 이동
    const neYear = newEnd.getFullYear();
    const neMonth = newEnd.getMonth() + 1;
    setYear(neYear);
    setMonth(neMonth);
  };

  const handleBottomClick = () => {
    navigate('/schedule/reservation2', { state: { range } });
  };

  const seasonProgress = { total: 6, completed: 2, pending: 0 };

  return (
    <Container>
      <Stepper currentStep={1} />

      <DateSelection
        year={year}
        month={month}
        onYearChange={handleYearChange}
        onMonthChange={handleMonthChange}
      />

      <Calendar
        year={year}
        month={month}
        startDate={range?.[0]}
        endDate={range?.[1]}
        onDateClick={handleDateClick}
        onIncrease={() => adjustEnd(1)}
        onDecrease={() => adjustEnd(-1)}
        today={today}
      />

      <Summary range={range} seasonProgress={seasonProgress} />

      <BottomBar onNext={handleBottomClick} />
    </Container>
  );
};

export default ScheduleReservation1;

const Container = styled.div`
  padding: 1rem;
  max-width: 400px;
  margin: auto;
`;
