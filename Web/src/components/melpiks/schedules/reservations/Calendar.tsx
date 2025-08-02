/**
 * 예약 스케줄 캘린더 컴포넌트 (Calendar.tsx)
 *
 * 예약 스케줄에서 날짜 선택을 위한 캘린더 컴포넌트입니다.
 * 날짜 범위 선택, 과거 날짜 비활성화, 월 이동 기능을 제공합니다.
 *
 * @description
 * - 월별 캘린더 표시
 * - 날짜 범위 선택 기능
 * - 과거 날짜 비활성화
 * - 월 이동 버튼
 * - 반응형 디자인 지원
 */
// src/components/melpiks/schedules/reservations/Calendar.tsx
import React from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';
import styled from 'styled-components';

/**
 * 캘린더 Props
 *
 * @property year - 표시할 년도
 * @property month - 표시할 월
 * @property startDate - 선택된 시작 날짜 (선택)
 * @property endDate - 선택된 종료 날짜 (선택)
 * @property onDateClick - 날짜 클릭 핸들러
 * @property onIncrease - 월 증가 핸들러
 * @property onDecrease - 월 감소 핸들러
 * @property today - 오늘 날짜
 */
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

/**
 * 해당 월의 일수 반환
 *
 * @param y - 년도
 * @param m - 월
 * @returns 해당 월의 일수
 */
const getDaysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();

/**
 * 해당 월의 첫 번째 날의 요일 반환
 *
 * @param y - 년도
 * @param m - 월
 * @returns 첫 번째 날의 요일 (0: 일요일, 6: 토요일)
 */
const getFirstDayOfMonth = (y: number, m: number) =>
  new Date(y, m - 1, 1).getDay();

/**
 * 예약 스케줄 캘린더 컴포넌트
 *

 * 예약 스케줄에서 날짜 선택을 위한 캘린더를 렌더링합니다.
 * 날짜 범위 선택, 과거 날짜 비활성화, 월 이동 기능을 제공합니다.
 *
 * @param year - 표시할 년도
 * @param month - 표시할 월
 * @param startDate - 선택된 시작 날짜 (선택)
 * @param endDate - 선택된 종료 날짜 (선택)
 * @param onDateClick - 날짜 클릭 핸들러
 * @param onIncrease - 월 증가 핸들러
 * @param onDecrease - 월 감소 핸들러
 * @param today - 오늘 날짜
 * @returns 캘린더 JSX 요소
 */
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

  /**
   * 날짜 비활성화 여부 확인
   *
   * @param day - 확인할 일
   * @returns 비활성화 여부
   */
  const isDisabled = (day: number) => {
    const d = new Date(year, month - 1, day).getTime();
    return d < todayZero;
  };

  /**
   * 선택된 범위 내 날짜 여부 확인
   *
   * @param day - 확인할 일
   * @returns 선택된 범위 내 여부
   */
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

/**
 * 캘린더 전체 래퍼
 *

 * 캘린더 전체를 감싸는 컨테이너입니다.
 */
const CalendarWrapper = styled.div`
  position: relative;

  border-radius: 4px;
`;

/**
 * 캘린더 헤더
 *

 * 년월 표시와 월 이동 버튼을 포함하는 헤더입니다.
 */
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

/**
 * 헤더 텍스트
 *

 * 년월을 표시하는 텍스트입니다.
 * 반응형 폰트 크기를 지원합니다.
 */
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

/**
 * 아이콘 그룹
 *

 * 월 이동 버튼들을 감싸는 컨테이너입니다.
 */
const IconGroup = styled.div`
  display: flex;
  gap: 8px; /* 아이콘 간격 확대 */
`;

/**
 * 아이콘 버튼
 *

 * 월 이동을 위한 플러스/마이너스 버튼입니다.
 * 반응형 크기를 지원합니다.
 */
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

/**
 * 캘린더 컨테이너
 *

 * 요일 헤더와 날짜들을 포함하는 그리드 컨테이너입니다.
 */
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

/**
 * 요일 이름
 *

 * 요일을 표시하는 헤더 셀입니다.
 * 주말은 다른 색상으로 표시됩니다.
 *
 * @param $isWeekend - 주말 여부
 */
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

/**
 * 빈 박스
 *

 * 월의 첫 번째 주에서 이전 달의 날짜를 위한 빈 셀입니다.
 */
const EmptyBox = styled.div`
  aspect-ratio: 1;
`;

/**
 * 날짜 박스
 *

 * 개별 날짜를 표시하는 셀입니다.
 * 선택, 비활성화, 호버 상태를 지원합니다.
 *
 * @param disabled - 비활성화 여부
 * @param selected - 선택 여부
 */
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

/**
 * 날짜 숫자
 *

 * 날짜를 표시하는 텍스트입니다.
 * 반응형 폰트 크기를 지원합니다.
 */
const DayNumber = styled.span`
  font-size: 12px;
  @media (min-width: 768px) {
    font-size: 14px;
  }
  @media (min-width: 1024px) {
    font-size: 16px;
  }
`;
