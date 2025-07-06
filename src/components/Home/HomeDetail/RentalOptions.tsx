// src/page/RentalOptions.tsx
import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ko } from 'date-fns/locale';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { isSameDay, isAfter, isBefore, addDays as _addDays } from 'date-fns';
import Holidays from 'date-holidays';
import ReusableModal2 from '../../../components/Home/HomeDetail/HomeDetailModal';
import ReusableModal from '../../../components/ReusableModal';
import RentalSelectDateIcon from '../../../assets/Home/HomeDetail/RentalSelectDateIcon.svg';
import { getUnavailableDates } from '../../../api/scedule/scedule';
import 'react-datepicker/dist/react-datepicker.css';
import { CustomSelect } from '../../CustomSelect';

interface SquareIconProps {
  disabled?: boolean;
}
registerLocale('ko', ko);
const hd = new Holidays('KR');

const GlobalStyle = createGlobalStyle`
  /* 달력 외곽일 숨김 */
  .react-datepicker__day--outside-month {
    visibility: hidden !important;
  }

  /* 오늘 표시 */
  .day-today {
    background-color: #FFA726 !important;
    color: #000 !important;
  }

  /* 일요일·공휴일 */
  .day-holiday,
  .day-sunday {
    color: red !important;
  }

  /* 선택 불가(예약·과거) */
  .day-reserved,
  .react-datepicker__day--disabled,
  .day-past {
    color: #ccc !important;
    pointer-events: none !important;
  }

  /* 선택 범위 시작/종료 */
  .react-datepicker__day.day-start,
  .react-datepicker__day.day-end {
    background: #fff !important;
    color: #000 !important;
    border: 1px solid #F6AE24 !important;
    border-radius: .25rem !important;
  }

  /* 선택 범위 내부 */
  .day-between {
    background: #F6AE24 !important;
    color: #000 !important;
  }

  /* Override 기본 파란색 선택박스 컬러 (#3d91ff → #FFA726) */
  .react-datepicker__day--selected,
  .react-datepicker__day--in-range,
  .react-datepicker__day--keyboard-selected,
  .react-datepicker__day--selecting-range-start,
  .react-datepicker__day--selecting-range-end {
    background-color: #FFA726 !important;
    border-color: #FFA726 !important;
    color: #000 !important;
  }

  /* 선택박스 hover 덮어쓰기 */
  .react-datepicker__day--selected:hover,
  .react-datepicker__day--in-range:hover {
    background-color: #FFA726 !important;
    border-color: #FFA726 !important;
  }
`;

interface RentalOptionsProps {
  productId: number;
  selectedSize: string;
  onSelectPeriod?: (formatted: string) => void;
}

const RentalOptions: React.FC<RentalOptionsProps> = ({
  productId,
  selectedSize,
  onSelectPeriod,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });
  const [reservedDates, setReservedDates] = useState<Date[]>([]);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const minDays =
    selectedPeriod === '3박4일' ? 4 : selectedPeriod === '5박6일' ? 6 : 0;
  const maxDays = 10;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // ← 여기만 4로 변경
  const minSelectableDate = _addDays(today, 4);

  const getTotalDays = (s: Date, e: Date) =>
    Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const formatDate = (d: Date) =>
    `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
      d.getDate()
    ).padStart(2, '0')}`;

  useEffect(() => {
    if (!productId || !selectedSize) return;
    getUnavailableDates({ productId, sizeLabel: selectedSize })
      .then((ranges) => {
        const allTime: number[] = [];
        ranges.forEach(([startStr, endStr]) => {
          const start = new Date(startStr);
          const end = new Date(endStr);
          for (let d = new Date(start); d <= end; d = _addDays(d, 1)) {
            allTime.push(d.getTime());
          }
          for (let i = 1; i <= 3; i++) {
            allTime.push(_addDays(end, i).getTime());
          }
          for (let i = 1; i <= 3; i++) {
            allTime.push(_addDays(start, -i).getTime());
          }
        });
        const unique = Array.from(new Set(allTime)).map((t) => new Date(t));
        setReservedDates(unique);
      })
      .catch(console.error);
  }, [productId, selectedSize]);

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    if (start) {
      if (isBefore(start, minSelectableDate)) {
        // ← 안내 문구도 4일로 변경
        setErrorMessage(
          '대여 시작일은 오늘 기준 4일 이후부터 선택 가능합니다.'
        );
        return setErrorModalOpen(true);
      }
      if (start.getDay() === 0 || hd.isHoliday(start)) {
        setErrorMessage('시작일로 일요일·공휴일은 선택할 수 없습니다!');
        return setErrorModalOpen(true);
      }
      if (reservedDates.some((d) => isSameDay(d, start))) {
        setErrorMessage('이미 예약된 날짜입니다.');
        return setErrorModalOpen(true);
      }
    }
    if (start && !end && minDays > 0) {
      const autoEnd = _addDays(start, minDays - 1);
      if (reservedDates.some((d) => isSameDay(d, autoEnd))) {
        setErrorMessage('자동 설정된 종료일이 예약된 날짜와 겹칩니다.');
        return setErrorModalOpen(true);
      }
      return setSelectedRange({ start, end: autoEnd });
    }
    if (start && end) {
      let newEnd = end;
      while (reservedDates.some((d) => isSameDay(d, newEnd))) {
        newEnd = _addDays(newEnd, 1);
      }
      const total = getTotalDays(start, newEnd);
      if (minDays && total < minDays) {
        setErrorMessage(`최소 일정은 ${selectedPeriod} 입니다.`);
        return setErrorModalOpen(true);
      }
      if (total > maxDays) {
        setErrorMessage('최대 10일까지 추가 가능합니다.');
        return setErrorModalOpen(true);
      }
      setSelectedRange({ start, end: newEnd });
    }
  };

  const handleDayClick = (e: React.MouseEvent) => {
    const t = e.target as HTMLElement;
    if (
      t.classList.contains('day-reserved') ||
      t.classList.contains('day-past')
    ) {
      setErrorMessage('선택할 수 없는 날짜입니다.');
      setErrorModalOpen(true);
    }
  };

  const adjustEnd = (delta: number) => {
    const { start, end } = selectedRange;
    if (!start || !end) return;
    const total = getTotalDays(start, end);
    if (total + delta < minDays || total + delta > maxDays) return;
    setSelectedRange({ start, end: _addDays(end, delta) });
  };

  const handleConfirm = () => {
    const { start, end } = selectedRange;
    if (!start || !end) {
      setErrorMessage('날짜를 모두 선택해주세요.');
      return setErrorModalOpen(true);
    }
    const total = getTotalDays(start, end);
    if (minDays && total < minDays) {
      setErrorMessage(`최소 일정은 ${selectedPeriod} 입니다.`);
      return setErrorModalOpen(true);
    }
    if (total > maxDays) {
      setErrorMessage('최대 10일까지 추가 가능합니다.');
      return setErrorModalOpen(true);
    }

    if (onSelectPeriod) {
      const formatted = `${formatDate(start)} ~ ${formatDate(end)}`;
      onSelectPeriod(formatted);
    }
    setIsModalOpen(false);
  };

  const currentTotal =
    selectedRange.start && selectedRange.end
      ? getTotalDays(selectedRange.start, selectedRange.end)
      : 0;

  return (
    <>
      <GlobalStyle />
      <Container>
        <Label>대여옵션 (선택)</Label>
        <Wrapper>
          <CustomSelect
            value={selectedPeriod}
            onChange={(e) => {
              setSelectedPeriod(e.target.value);
              setSelectedRange({ start: null, end: null });
            }}
          >
            <option value=''>대여기간 선택</option>
            <option value='3박4일'>3박4일</option>
            <option value='5박6일'>5박6일</option>
          </CustomSelect>
          <Button
            disabled={!selectedPeriod}
            onClick={() => setIsModalOpen(true)}
          >
            <span>
              {selectedRange.start && selectedRange.end
                ? `${formatDate(selectedRange.start)} ~ ${formatDate(
                    selectedRange.end
                  )}`
                : '대여일정 선택'}
            </span>
            <Icon src={RentalSelectDateIcon} alt='달력 아이콘' />
          </Button>
        </Wrapper>

        {isModalOpen && (
          <ReusableModal2
            isOpen
            onClose={() => setIsModalOpen(false)}
            width='100%'
            height='auto'
          >
            <ModalWrapper>
              <ModalHeader>
                <ModalTitle>
                  대여일정 -{' '}
                  {selectedRange.start && selectedRange.end
                    ? `${currentTotal}일`
                    : '선택해주세요'}
                </ModalTitle>
              </ModalHeader>
              <ModalContent onClick={handleDayClick}>
                <SelectedBlock>
                  <RangeBox>
                    {selectedRange.start && selectedRange.end ? (
                      <RangeText>{`${formatDate(
                        selectedRange.start
                      )} ~ ${formatDate(selectedRange.end)}`}</RangeText>
                    ) : (
                      <Placeholder>날짜를 선택해주세요</Placeholder>
                    )}
                    <IconWrapper>
                      <SquareIcon
                        disabled={currentTotal <= minDays}
                        onClick={() => adjustEnd(-1)}
                      >
                        <FaMinus />
                      </SquareIcon>
                      <SquareIcon
                        disabled={currentTotal >= maxDays}
                        onClick={() => adjustEnd(1)}
                      >
                        <FaPlus />
                      </SquareIcon>
                    </IconWrapper>
                  </RangeBox>
                </SelectedBlock>
                <CalendarContainer>
                  <DatePicker
                    locale='ko'
                    inline
                    monthsShown={2}
                    selectsRange
                    startDate={selectedRange.start}
                    endDate={selectedRange.end}
                    onChange={handleDateChange}
                    excludeDates={reservedDates}
                    dayClassName={(date) => {
                      if (
                        date.getFullYear() === 2025 &&
                        date.getMonth() === 5 &&
                        date.getDate() === 3
                      )
                        return 'day-past';
                      if (isBefore(date, today)) return 'day-past';
                      if (
                        isAfter(date, today) &&
                        isBefore(date, minSelectableDate)
                      )
                        return 'day-past';
                      if (isSameDay(date, today)) return 'day-today';
                      if (reservedDates.some((d) => isSameDay(d, date)))
                        return 'day-reserved';
                      if (hd.isHoliday(date)) return 'day-holiday';
                      if (date.getDay() === 0) return 'day-sunday';
                      if (
                        selectedRange.start &&
                        isSameDay(date, selectedRange.start)
                      )
                        return 'day-start';
                      if (
                        selectedRange.end &&
                        isSameDay(date, selectedRange.end)
                      )
                        return 'day-end';
                      if (
                        selectedRange.start &&
                        selectedRange.end &&
                        isAfter(date, selectedRange.start) &&
                        isBefore(date, selectedRange.end)
                      )
                        return 'day-between';
                      return '';
                    }}
                  />
                </CalendarContainer>
                <Legend>
                  <LegendItem>
                    <Dot color='red' /> 일요일·공휴일
                  </LegendItem>
                  <LegendItem>
                    <Dot color='#ccc' /> 예약 불가 날짜 / 오늘 이전 & 오늘 이후
                    4일
                  </LegendItem>
                  <LegendItem>
                    <Dot color='#FFA726' /> 오늘 기준 4일 이후부터 선택 가능
                  </LegendItem>
                </Legend>
                <Notice>
                  ※ 서비스 시작일 전에 받아보실 수 있게 발송해 드립니다.
                </Notice>
                <Notice>
                  ※ 일정 선택 시 하루 정도 여유 있게 신청을 권장드립니다.
                </Notice>
              </ModalContent>

              <ButtonRow>
                <CancelButton onClick={() => setIsModalOpen(false)}>
                  취소
                </CancelButton>
                <ConfirmButton onClick={handleConfirm}>선택완료</ConfirmButton>
              </ButtonRow>

              {errorModalOpen && (
                <ReusableModal
                  isOpen
                  onClose={() => setErrorModalOpen(false)}
                  title='알림'
                  width='80%'
                  height='200px'
                >
                  <ErrorMsg>{errorMessage}</ErrorMsg>
                </ReusableModal>
              )}
            </ModalWrapper>
          </ReusableModal2>
        )}
      </Container>
    </>
  );
};

export default RentalOptions;

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  width: 100%;
`;
const Label = styled.label`
  font-weight: 700;
  font-size: 12px;
  margin-bottom: 10px;
`;
const Wrapper = styled.div`
  display: flex;
  gap: 10px;
`;
const Button = styled.button<{ disabled?: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  font-size: 16px;
  background: #fff;
  border: 1px solid #000;
  border-radius: 4px;
  cursor: ${(p) => (p.disabled ? 'not-allowed' : 'pointer')};
  color: ${(p) => (p.disabled ? '#aaa' : '#000')};
`;
const Icon = styled.img`
  width: 24px;
  height: 24px;
`;
const ModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 80vh;
`;
const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #ddd;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 10;
`;
const ModalTitle = styled.h2`
  margin: 0;
  font-weight: 800;
  font-size: 18px;
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;
const ModalContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;
const SelectedBlock = styled.div`
  padding: 0 20px;
  margin: 20px 0;
`;
const RangeBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #000;
  border-radius: 8px;
  padding: 16px;
`;
const RangeText = styled.span`
  font-size: 16px;
  font-weight: 700;
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;
const Placeholder = styled.span`
  font-size: 16px;
  color: #aaa;
`;
const IconWrapper = styled.div`
  display: flex;
  gap: 8px;
`;
const SquareIcon = styled.div<SquareIconProps>`
  width: 32px;
  height: 32px;
  background: ${(p) => (p.disabled ? '#ccc' : '#000')};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: ${(p) => (p.disabled ? 'not-allowed' : 'pointer')};
  pointer-events: ${(p) => (p.disabled ? 'none' : 'auto')};
`;
const CalendarContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  @media (min-width: 768px) {
    .react-datepicker__month-container {
      display: inline-block !important;
      float: none !important;
      vertical-align: top;
    }
  }
  @media (max-width: 480px) {
    .react-datepicker__month-container {
      display: block !important;
      float: none !important;
    }
  }
  .react-datepicker__current-month {
    text-align: center;
    font-weight: 700;
    margin-bottom: 8px;
  }
`;
const Legend = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 10px 20px;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;
const LegendItem = styled.div`
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`;
const Dot = styled.span<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${(p) => p.color};
  display: inline-block;
`;
const Notice = styled.p`
  margin: 0 20px 8px;
  font-size: 12px;
  color: #666;
`;
const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  padding: 20px;
  position: sticky;
  bottom: 0;
  background: #fff;
  z-index: 10;
`;
const CancelButton = styled.button`
  flex: 1;
  height: 48px;
  background: #ccc;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 16px;
`;
const ConfirmButton = styled.button`
  flex: 1;
  height: 48px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 16px;
`;
const ErrorMsg = styled.div`
  font-size: 14px;
  font-weight: 700;
  text-align: center;
`;
