// src/pages/Tab4/Monitoring/MonitoringDetail.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import DatePicker, { ReactDatePickerProps } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale } from 'react-datepicker';
import { ko } from 'date-fns/locale/ko';
import { FaCalendarAlt } from 'react-icons/fa';
import SettingsDetailSubHeader, {
  DetailSubHeaderProps,
} from '@components/Header/SettingsDetailSubHeader';
import OrderDetailTopBoxes from '@components/OrderDetailTopBoxes';
import ReusableModal2 from '@components/OneButtonModal';
import StatusBadge from '@components/Common/StatusBadge';
import { getStatusBadge } from '@utils/statusUtils';

import {
  getRentalScheduleDetail,
  updateRentalScheduleStatus,
  RentalScheduleAdminDetailResponse,
  UpdateRentalStatusRequest,
  changeRentalSchedulePeriod,
  changeRentalScheduleProduct,
  ChangeRentalProductRequest,
} from '@api/RentalSchedule/RentalScheduleApi';

import {
  getRentalScheduleByRentalId,
  RentalScheduleAdminByRentalIdResponse,
} from '@api/RentalSchedule/RentalScheduleApi';

// 한국어 로케일 등록
registerLocale('ko', ko);

// 한국 시간대로 날짜 포맷팅 함수 추가
const formatDateToKoreanTime = (date: Date): string => {
  // 날짜를 한국 시간대로 조정 (시간을 12시로 설정하여 날짜만 고려)
  const koreanDate = new Date(date);
  koreanDate.setHours(12, 0, 0, 0);
  const year = koreanDate.getFullYear();
  const month = String(koreanDate.getMonth() + 1).padStart(2, '0');
  const day = String(koreanDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 한국 시간대로 날짜 파싱 함수 추가
const parseKoreanDate = (dateStr: string): Date => {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);
  const day = parseInt(dayStr);
  // 한국 시간대로 Date 객체 생성 (시간을 12시로 설정)
  const date = new Date(year, month - 1, day);
  date.setHours(12, 0, 0, 0);
  return date;
};

interface MonitoringDetailProps {
  isCreate?: boolean;
}

const MonitoringDetail: React.FC<MonitoringDetailProps> = ({ isCreate = false }) => {
  const navigate = useNavigate();
  const { no } = useParams<{ no: string }>();
  const [searchParams] = useSearchParams();
  const page = searchParams.get('page') ?? '1';
  const numericNo = isCreate ? undefined : Number(no);

  // ─── 헤더 정보 state ───
  const [headerInfo, setHeaderInfo] = useState<RentalScheduleAdminByRentalIdResponse | null>(null);

  // ─── 대여상세 state ───
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [shippingMethod, setShippingMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'결제완료' | '취소요청' | '취소완료'>(
    '결제완료',
  );

  // ─── 제품정보 편집 state ───
  const [editingProductName, setEditingProductName] = useState('');
  const [editingColor, setEditingColor] = useState('');
  const [editingSize, setEditingSize] = useState('');

  // ─── 대여일자 범위 state ───
  const [rentalDates, setRentalDates] = useState<[Date | undefined, Date | undefined]>([
    undefined,
    undefined,
  ]);
  const [originalDates, setOriginalDates] = useState<[Date | undefined, Date | undefined]>([
    undefined,
    undefined,
  ]);

  // ─── 배송정보 state ───
  const [recipient, setRecipient] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingDetail, setShippingDetail] = useState('');
  const [message, setMessage] = useState('');

  // ─── 회수정보 state ───
  const [returnAddress, setReturnAddress] = useState('');
  const [returnDetail, setReturnDetail] = useState('');
  const [returnPhone, setReturnPhone] = useState('');

  // ─── 기타 state ───
  const [deliveryStatus, setDeliveryStatus] = useState<
    '신청완료' | '배송준비' | '배송중' | '배송완료' | '배송취소' | '반납중' | '반납완료'
  >('신청완료');
  const [isCleaned, setIsCleaned] = useState(false);
  const [isRepaired, setIsRepaired] = useState(false);

  // ─── 공통 state ───
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // 상세 조회
  useEffect(() => {
    if (!isCreate && numericNo) {
      setLoading(true);
      // 헤더 정보 조회
      getRentalScheduleByRentalId(numericNo)
        .then((hdr) => setHeaderInfo(hdr))
        .catch((err) => {
          console.error('헤더 정보 조회 실패', err);
        });

      // 상세 조회
      getRentalScheduleDetail(numericNo)
        .then((data: RentalScheduleAdminDetailResponse) => {
          setBrand(data.brand);
          setAmount(data.ticketName);
          setProductName(data.productNum);
          setColor(data.color);
          setSize(data.size);
          setPaymentStatus(data.paymentStatus ?? '결제완료');
          setShippingMethod(data.deliveryInfo.shipping.deliveryMethod);

          // 제품정보 편집 state 초기화
          setEditingProductName(data.productNum);
          setEditingColor(data.color);
          setEditingSize(data.size || ''); // 빈 값일 경우 빈 문자열로 설정

          const [startStr, endStr] = data.rentalPeriod.split(' ~ ');
          const startDate = parseKoreanDate(startStr);
          const endDate = parseKoreanDate(endStr);
          setRentalDates([startDate, endDate]);
          setOriginalDates([startDate, endDate]);

          setRecipient(data.deliveryInfo.shipping.receiver);
          setRecipientPhone(data.deliveryInfo.shipping.phone);
          setShippingAddress(data.deliveryInfo.shipping.address);
          setShippingDetail(data.deliveryInfo.shipping.detailAddress);
          setMessage(data.deliveryInfo.shipping.message);

          setReturnAddress(data.deliveryInfo.return.address);
          setReturnDetail(data.deliveryInfo.return.detailAddress);
          setReturnPhone(data.deliveryInfo.return.phone);

          setDeliveryStatus(data.deliveryStatus!);
          setIsCleaned(data.isCleaned);
          setIsRepaired(data.isRepaired);
        })
        .catch((err) => {
          console.error('상세 조회 실패', err);
          setModalTitle('오류');
          setModalMessage('상세 정보를 불러오지 못했습니다.');
          setIsModalOpen(true);
        })
        .finally(() => setLoading(false));
    }
  }, [isCreate, numericNo]);

  // 뒤로가기 핸들러
  const handleBack = () => {
    navigate(`/monitoringlist?page=${page}`);
  };

  // 저장 처리
  const handleSave = async () => {
    if (!isCreate && numericNo) {
      setLoading(true);
      try {
        // 날짜 변경 확인
        const [origStart, origEnd] = originalDates;
        const [newStart, newEnd] = rentalDates;
        let dateChanged = false;
        let formattedStart = '';
        let formattedEnd = '';

        if (
          newStart instanceof Date &&
          newEnd instanceof Date &&
          origStart instanceof Date &&
          origEnd instanceof Date &&
          (formatDateToKoreanTime(newStart) !== formatDateToKoreanTime(origStart) ||
            formatDateToKoreanTime(newEnd) !== formatDateToKoreanTime(origEnd))
        ) {
          dateChanged = true;
          formattedStart = formatDateToKoreanTime(newStart);
          formattedEnd = formatDateToKoreanTime(newEnd);
        } else if (
          newStart instanceof Date &&
          newEnd instanceof Date &&
          (origStart === undefined || origEnd === undefined)
        ) {
          dateChanged = true;
          formattedStart = formatDateToKoreanTime(newStart);
          formattedEnd = formatDateToKoreanTime(newEnd);
        }

        if (dateChanged) {
          await changeRentalSchedulePeriod(numericNo, {
            startDate: formattedStart,
            endDate: formattedEnd,
          });
          setOriginalDates([newStart!, newEnd!]);
        }

        // 제품정보 변경 확인
        let productChanged = false;
        if (editingProductName !== productName || editingColor !== color || editingSize !== size) {
          // 유효성 검사
          if (!editingProductName.trim()) {
            setModalTitle('입력 오류');
            setModalMessage('제품명(품번)을 입력해주세요.');
            setIsModalOpen(true);
            setLoading(false);
            return;
          }

          if (!editingColor) {
            setModalTitle('입력 오류');
            setModalMessage('색상을 선택해주세요.');
            setIsModalOpen(true);
            setLoading(false);
            return;
          }

          if (!editingSize) {
            setModalTitle('입력 오류');
            setModalMessage('사이즈를 선택해주세요.');
            setIsModalOpen(true);
            setLoading(false);
            return;
          }

          productChanged = true;

          // 디버깅 로그 추가
          console.log('🔍 제품정보 변경 요청:', {
            rentalId: numericNo,
            currentProduct: { productName, color, size },
            newProduct: { editingProductName, editingColor, editingSize },
          });

          const requestPayload = {
            productNum: editingProductName,
            sizeLabel: editingSize,
            color: editingColor,
          };

          console.log('📤 API 요청 데이터:', requestPayload);

          await changeRentalScheduleProduct(numericNo, requestPayload);

          console.log('✅ 제품정보 변경 성공');

          // 로컬 상태 업데이트
          setProductName(editingProductName);
          setColor(editingColor);
          setSize(editingSize);
        }

        const payload: UpdateRentalStatusRequest = {
          paymentStatus,
          deliveryStatus,
          isCleaned,
          isRepaired,
        };
        await updateRentalScheduleStatus(numericNo, payload);

        setModalTitle('변경 완료');
        let message = '변경 내용을 성공적으로 저장했습니다.';
        if (dateChanged && productChanged) {
          message = '대여 기간, 제품정보 및 기타 변경 내용을 성공적으로 저장했습니다.';
        } else if (dateChanged) {
          message = '대여 기간 및 기타 변경 내용을 성공적으로 저장했습니다.';
        } else if (productChanged) {
          message = '제품정보 및 기타 변경 내용을 성공적으로 저장했습니다.';
        }
        setModalMessage(message);
        setIsModalOpen(true);
      } catch (err: any) {
        console.error('저장 실패', err);
        setModalTitle('오류');

        // 404 에러에 대한 구체적인 메시지
        if (err?.response?.status === 404) {
          setModalMessage('해당 제품을 찾을 수 없습니다. 품번, 색상, 사이즈를 확인해주세요.');
        } else {
          setModalMessage('변경 내용 저장에 실패했습니다.');
        }

        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
  };

  // 삭제 핸들러
  const handleDelete = () => {
    setModalTitle('삭제');
    setModalMessage('대여를 정말 삭제하시겠습니까?');
    setIsModalOpen(true);
  };

  // 모달 확인
  const handleConfirm = () => {
    setIsModalOpen(false);
    navigate(-1);
  };

  // DatePicker 변경 핸들러
  const handleDateChange: ReactDatePickerProps['onChange'] = (dates) => {
    if (!Array.isArray(dates)) {
      setRentalDates([undefined, undefined]);
      return;
    }
    const [start, end] = dates as [Date | null, Date | null];
    setRentalDates([start ?? undefined, end ?? undefined]);
  };

  const detailProps: DetailSubHeaderProps = {
    backLabel: '목록으로',
    onBackClick: handleBack,
    editLabel: isCreate ? '등록하기' : '변경저장',
    onEditClick: handleSave,
    endLabel: isCreate ? '취소' : '삭제',
    onEndClick: isCreate ? handleBack : handleDelete,
  };

  if (loading) return <SkeletonBox style={{ height: '200px' }} />;

  return (
    <Container>
      <HeaderRow>
        <Title>{isCreate ? '대여 등록' : `대여 상세 (${numericNo})`}</Title>
      </HeaderRow>

      <SettingsDetailSubHeader {...detailProps} />

      <ProductNumber>
        <strong>번호</strong>
        <span>{numericNo ?? '-'}</span>
      </ProductNumber>

      {headerInfo && (
        <OrderDetailTopBoxes
          userName={headerInfo.userName}
          nickname={headerInfo.nickname}
          userEmail={headerInfo.userEmail}
          userMembership={headerInfo.userMembership}
          createAt={headerInfo.createAt}
          orderNum={headerInfo.orderNum}
          cancelAt={headerInfo.cancelAt}
          pointUsed={headerInfo.pointUsed}
          extraCharge={headerInfo.extraCharge}
        />
      )}

      <DividerDashed />

      {/* 주문상세 */}
      <SessionHeader>주문상세</SessionHeader>
      <FormBox>
        <Row>
          <Field label="제품명">
            <input
              value={editingProductName}
              onChange={(e) => setEditingProductName(e.target.value)}
              placeholder="품번을 입력하세요"
            />
          </Field>
          <Field label="브랜드" value={brand} readOnly />
          <Field label="색상">
            <select value={editingColor} onChange={(e) => setEditingColor(e.target.value)}>
              <option value="">색상을 선택하세요</option>
              <option value="BLACK">BLACK</option>
              <option value="WHITE">WHITE</option>
              <option value="BLUE">BLUE</option>
              <option value="RED">RED</option>
              <option value="GREEN">GREEN</option>
              <option value="YELLOW">YELLOW</option>
              <option value="PURPLE">PURPLE</option>
              <option value="PINK">PINK</option>
              <option value="GRAY">GRAY</option>
              <option value="BROWN">BROWN</option>
              <option value="NAVY">NAVY</option>
              <option value="BEIGE">BEIGE</option>
              <option value="ORANGE">ORANGE</option>
              <option value="MINT">MINT</option>
              <option value="KHAKI">KHAKI</option>
              <option value="IVORY">IVORY</option>
              <option value="SILVER">SILVER</option>
              <option value="GOLD">GOLD</option>
              <option value="MAROON">MAROON</option>
              <option value="OLIVE">OLIVE</option>
              <option value="TEAL">TEAL</option>
              <option value="AQUA">AQUA</option>
              <option value="FUCHSIA">FUCHSIA</option>
              <option value="LIME">LIME</option>
            </select>
          </Field>
        </Row>
        <Row>
          <Field label="사이즈">
            <select value={editingSize} onChange={(e) => setEditingSize(e.target.value)}>
              <option value="SIZE 44">SIZE 44</option>
              <option value="SIZE 55">SIZE 55</option>
              <option value="SIZE 66">SIZE 66</option>
              <option value="SIZE FREE">SIZE FREE</option>
            </select>
          </Field>
          <Field label="배송방법" value={shippingMethod} readOnly />
          <Field label="이용권" value={amount} readOnly />
        </Row>
        <Row>
          <Field label="대여일자">
            <DatePickerContainer>
              <FaCalendarAlt />
              <StyledDatePicker
                selectsRange
                startDate={rentalDates[0]}
                endDate={rentalDates[1]}
                onChange={handleDateChange}
                dateFormat="yyyy.MM.dd"
                placeholderText="YYYY.MM.DD ~ YYYY.MM.DD"
                locale="ko"
              />
            </DatePickerContainer>
          </Field>
          <Field label="결제상태">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StatusBadge
                style={{
                  backgroundColor: getStatusBadge(paymentStatus).background,
                }}
              >
                {getStatusBadge(paymentStatus).label}
              </StatusBadge>
              <select
                value={paymentStatus}
                onChange={(e) =>
                  setPaymentStatus(e.target.value as '결제완료' | '취소요청' | '취소완료')
                }
                disabled={paymentStatus === '취소완료'}
                style={{ flex: 1, marginLeft: '8px' }}
              >
                <option value="결제완료">결제완료</option>
                <option value="취소요청">취소요청</option>
                <option value="취소완료">취소완료</option>
              </select>
            </div>
          </Field>
        </Row>
      </FormBox>

      {/* 배송/회수 */}
      <SessionHeader>배송/회수</SessionHeader>
      <FormBox>
        <Row>
          <Field label="수령인" value={recipient} readOnly />
          <Field label="연락처" value={recipientPhone} readOnly />
          <Field label="메시지" value={message} readOnly />
        </Row>
        <Row>
          <Field label="배송지" value={shippingAddress} readOnly />
          <Field label="배송상세" value={shippingDetail} readOnly />
        </Row>
        <Row>
          <Field label="배송상태">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StatusBadge
                style={{
                  backgroundColor: getStatusBadge(deliveryStatus).background,
                }}
              >
                {getStatusBadge(deliveryStatus).label}
              </StatusBadge>
              <select
                value={deliveryStatus}
                onChange={(e) =>
                  setDeliveryStatus(
                    e.target.value as
                      | '신청완료'
                      | '배송준비'
                      | '배송중'
                      | '배송완료'
                      | '배송취소'
                      | '반납중'
                      | '반납완료',
                  )
                }
                style={{ flex: 1, marginLeft: '8px' }}
              >
                <option value="신청완료">신청완료</option>
                <option value="배송준비">배송준비</option>
                <option value="배송중">배송중</option>
                <option value="배송완료">배송완료</option>
                <option value="배송취소">배송취소</option>
                <option value="반납중">반납중</option>
                <option value="반납완료">반납완료</option>
              </select>
            </div>
          </Field>
          <Field label="연락처" value={returnPhone} readOnly />
        </Row>
        <Row>
          <Field label="회수지" value={returnAddress} readOnly />
          <Field label="회수상세" value={returnDetail} readOnly />
        </Row>
        <Row>
          <Field label="세탁여부">
            <select
              value={isCleaned ? '있음' : '없음'}
              onChange={(e) => setIsCleaned(e.target.value === '있음')}
            >
              <option value="있음">있음</option>
              <option value="없음">없음</option>
            </select>
          </Field>
          <Field label="수선여부">
            <select
              value={isRepaired ? '있음' : '없음'}
              onChange={(e) => setIsRepaired(e.target.value === '있음')}
            >
              <option value="있음">있음</option>
              <option value="없음">없음</option>
            </select>
          </Field>
        </Row>
      </FormBox>

      <ReusableModal2
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title={modalTitle}
      >
        {modalMessage}
      </ReusableModal2>
    </Container>
  );
};

export default MonitoringDetail;

/* ===== styled-components ===== */
const Container = styled.div`
  width: 100%;
  min-width: 1000px;
  padding: 20px;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const Title = styled.h1`
  font-weight: 700;
  font-size: 16px;
`;

const ProductNumber = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin: 10px 0 24px;
  strong {
    font-size: 12px;
    font-weight: 700;
  }
  span {
    font-size: 12px;
    font-weight: 900;
  }
`;

const DividerDashed = styled.hr`
  border-top: 1px dashed #ddd;
  margin: 24px 0;
`;

interface FieldProps {
  label: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  readOnly?: boolean;
  selectOptions?: string[];
  flex?: number;
  type?: 'input' | 'select';
  children?: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({
  label,
  value,
  onChange,
  readOnly,
  selectOptions,
  flex,
  type = 'input',
  children,
}) => (
  <FieldWrapper flex={flex}>
    <label>{label}</label>
    {children ? (
      children
    ) : type === 'select' && selectOptions ? (
      <select value={value} onChange={onChange} disabled={readOnly}>
        {selectOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    ) : (
      <input value={value} onChange={onChange} readOnly={readOnly} />
    )}
  </FieldWrapper>
);

const FieldWrapper = styled.div<{ flex?: number }>`
  flex: ${(p) => p.flex ?? 1};
  min-width: 0;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  box-sizing: border-box;
  &:not(:last-child) {
    border-right: 1px solid #ddd;
  }
  label {
    width: 80px;
    text-align: center;
    font-size: 12px;
    font-weight: 700;
    margin-right: 8px;
  }
  input[readonly],
  select:disabled,
  input:disabled {
    background: #f5f5f5;
    color: #666;
  }
  input,
  select {
    flex: 1;
    height: 36px;
    max-width: 300px;
    padding: 0 8px;
    font-size: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
`;

/* ─── SessionHeader 스타일 ─────────────────────────────────────────────────────────────── */
const SessionHeader = styled.div`
  box-sizing: border-box;
  background: #eeeeee;
  border: 1px solid #dddddd;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  padding: 16px 20px;
  font-family: 'NanumSquare Neo OTF';
  font-weight: 700;
  font-size: 12px;
  text-align: center;
  color: #000;
  margin-top: 24px;
  margin-bottom: -1px;
  width: fit-content;
`;

const FormBox = styled.div`
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 0 4px 4px 4px;
  margin-bottom: 40px;
`;

const Row = styled.div`
  display: flex;
  & + & {
    border-top: 1px solid #ddd;
  }
`;

const DatePickerContainer = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0 12px;
  height: 36px;
  width: 300px;
  svg {
    margin-right: 8px;
    color: #666;
  }
  input {
    border: none;
    outline: none;
    font-size: 12px;
    width: 100%;
  }
`;

const StyledDatePicker = styled(DatePicker)`
  border: none;
  outline: none;
  font-size: 12px;
  width: 100%;

  /* 한국어 캘린더 스타일 개선 */
  .react-datepicker {
    font-family: 'NanumSquare Neo OTF', sans-serif;
    font-size: 14px;
  }

  .react-datepicker__header {
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
  }

  .react-datepicker__current-month {
    font-weight: 700;
    color: #333;
  }

  .react-datepicker__day-name {
    color: #666;
    font-weight: 600;
  }

  .react-datepicker__day {
    color: #333;
    font-weight: 500;
  }

  .react-datepicker__day:hover {
    background-color: #e9ecef;
  }

  .react-datepicker__day--selected {
    background-color: #007bff;
    color: white;
  }

  .react-datepicker__day--in-range {
    background-color: #e3f2fd;
    color: #1976d2;
  }

  .react-datepicker__day--keyboard-selected {
    background-color: #007bff;
    color: white;
  }
`;

const SkeletonBox = styled.div`
  width: 100%;
  height: 32px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  border-radius: 4px;
  margin-bottom: 12px;
  animation: skeleton-loading 1.2s infinite linear;
  @keyframes skeleton-loading {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }
`;
