/**
 * 마켓 주문 상세 페이지(MarketOrderDetail)
 *
 * - 마켓 주문의 상세 정보를 조회, 편집, 삭제하는 페이지
 * - 멜픽구매 상세, 배송정보, 결제정보 등 다양한 섹션 지원
 * - 모달, 날짜 선택, 상태 관리 등 다양한 기능 제공
 * - 재사용 가능한 공통 컴포넌트
 */

// src/pages/List/Order/MarketOrderDetail.tsx

import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker, { ReactDatePickerProps } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt } from 'react-icons/fa';
import SettingsDetailSubHeader, {
  DetailSubHeaderProps,
} from '@components/Header/SettingsDetailSubHeader';
import OrderDetailTopBoxes from '@components/OrderDetailTopBoxes';
import ReusableModal2 from '@components/OneButtonModal';
import StatusBadge from '@components/Common/StatusBadge';
import { getStatusBadge } from '@utils/statusUtils';

/**
 * 마켓 주문 상세 props
 * - 생성 모드 여부 등
 */
interface MarketOrderDetailProps {
  isCreate?: boolean;
}

/**
 * 마켓 주문 상세 페이지 컴포넌트
 * - 마켓 주문 상세 정보를 표시하고 관리하는 메인 컴포넌트
 */
const MarketOrderDetail: React.FC<MarketOrderDetailProps> = ({ isCreate = false }) => {
  const navigate = useNavigate();
  const { no } = useParams<{ no: string }>();
  const numericNo = isCreate ? undefined : Number(no);

  /**
   * 멜픽구매 상세 상태 관리
   * - 제품명, 브랜드, 색상, 사이즈, 배송 방법, 운송장, 금액, 예상일, 결제상태 등
   */
  const [productName] = useState('울 더블 버튼 페플럼 원피스');
  const [brand] = useState('MICHAA');
  const [color] = useState('Green');
  const [size] = useState('M (66)');
  const [shippingMethod] = useState('택배');
  const [tracking] = useState('6909-3074-9676');
  const [amount] = useState('55,000');
  const [expectedDate, setExpectedDate] = useState<Date>(new Date('2025-04-10'));
  const [paymentStatus, setPaymentStatus] = useState('결제완료');

  /**
   * 배송정보 상태 관리
   * - 수령인, 전화번호, 메시지, 주소, 배송상태 등
   */
  const [receiver] = useState('홍길동');
  const [phone] = useState('010-1234-5678');
  const [message, setMessage] = useState('문 앞에 전달해주세요.');
  const [address] = useState('(18139) 경기 오산시 대원로 47, 101동 903호');
  const [deliveryStatus, setDeliveryStatus] = useState('배송 준비중');

  /**
   * 공통 상태 관리
   * - 모달, 모달 제목, 모달 메시지 등
   */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  /**
   * 뒤로가기 핸들러
   * - 목록 페이지로 이동하는 핸들러
   */
  const handleBack = () => navigate('/marketorderlist');

  /**
   * 저장 핸들러
   * - 등록/변경 완료 모달을 표시하는 핸들러
   */
  const handleSave = () => {
    setModalTitle(isCreate ? '등록 완료' : '변경 완료');
    setModalMessage(isCreate ? '새 멜픽구매를 등록하시겠습니까?' : '변경 내용을 저장하시겠습니까?');
    setIsModalOpen(true);
  };

  /**
   * 삭제 핸들러
   * - 삭제 완료 모달을 표시하는 핸들러
   */
  const handleDelete = () => {
    setModalTitle('삭제 완료');
    setModalMessage('멜픽구매를 삭제하시겠습니까?');
    setIsModalOpen(true);
  };

  /**
   * 확인 핸들러
   * - 모달 확인 시 이전 페이지로 이동하는 핸들러
   */
  const handleConfirm = () => {
    setIsModalOpen(false);
    navigate(-1);
  };

  /**
   * 날짜 변경 핸들러
   * - 예상 배송일을 변경하는 핸들러
   */
  // onChange 오류 해결: ReactDatePickerProps['onChange'] 사용
  const handleDateChange: ReactDatePickerProps['onChange'] = (date) => {
    if (date instanceof Date) {
      setExpectedDate(date);
    }
  };

  /**
   * 헤더 props 설정
   * - 뒤로가기, 편집, 삭제 등 헤더 버튼 설정
   */
  const detailProps: DetailSubHeaderProps = {
    backLabel: '목록이동',
    onBackClick: handleBack,
    editLabel: isCreate ? '등록하기' : '변경저장',
    onEditClick: handleSave,
    endLabel: isCreate ? '취소' : '삭제',
    onEndClick: isCreate ? handleBack : handleDelete,
  };

  return (
    <Container>
      <HeaderRow>
        <Title>{isCreate ? '멜픽구매 등록' : `멜픽구매 상세 (${numericNo})`}</Title>
      </HeaderRow>

      <SettingsDetailSubHeader {...detailProps} />

      <ProductNumber>
        <strong>번호</strong>
        <span>{numericNo ?? '-'}</span>
      </ProductNumber>

      <OrderDetailTopBoxes />
      <DividerDashed />

      {/* ─── 멜픽구매상세 섹션 ─────────────────────────────────────────────────── */}
      <SessionHeader>멜픽구매 상세</SessionHeader>
      <FormBox>
        <Row>
          <Field>
            <label>제품명</label>
            <input value={productName} readOnly />
          </Field>
          <Field>
            <label>브랜드</label>
            <input value={brand} readOnly />
          </Field>
          <Field>
            <label>색상</label>
            <input value={color} readOnly />
          </Field>
        </Row>

        <Row>
          <Field>
            <label>사이즈</label>
            <input value={size} readOnly />
          </Field>
          <Field>
            <label>배송방법</label>
            <InputGroup>
              <MethodPart>{shippingMethod}</MethodPart>
              <Divider />
              <TrackingPart>{tracking}</TrackingPart>
            </InputGroup>
          </Field>
          <Field>
            <label>금액</label>
            <input value={amount} readOnly />
          </Field>
        </Row>

        <Row>
          <Field>
            <label>발송예정</label>
            <DatePickerContainer>
              <FaCalendarAlt />
              <StyledDatePicker
                selected={expectedDate}
                onChange={handleDateChange}
                dateFormat="yyyy.MM.dd"
              />
            </DatePickerContainer>
            <Hint>(제품 신청일로부터 3일 이내)</Hint>
          </Field>
          <Field>
            <label>결제상태</label>
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
                onChange={(e) => setPaymentStatus(e.target.value)}
                style={{ flex: 1, marginLeft: '8px' }}
              >
                <option>결제완료</option>
                <option>결제대기</option>
                <option>취소요청</option>
              </select>
            </div>
          </Field>
        </Row>
      </FormBox>

      {/* ─── 배송정보 섹션 ─────────────────────────────────────────────────── */}
      <SessionHeader>배송정보</SessionHeader>
      <FormBox>
        <Row>
          <Field>
            <label>수령인</label>
            <input value={receiver} readOnly />
          </Field>
          <Field>
            <label>연락처</label>
            <input value={phone} readOnly />
          </Field>
          <Field>
            <label>메시지</label>
            <input value={message} onChange={(e) => setMessage(e.target.value)} />
          </Field>
        </Row>

        <Row>
          <Field style={{ minWidth: '100%' }}>
            <label>배송지</label>
            <input value={address} readOnly style={{ width: '100%' }} />
          </Field>
        </Row>

        <Row>
          <Field>
            <label>배송상태</label>
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
                onChange={(e) => setDeliveryStatus(e.target.value)}
                style={{ flex: 1, marginLeft: '8px' }}
              >
                <option>배송 준비중</option>
                <option>배송 중</option>
                <option>배송 완료</option>
              </select>
            </div>
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

export default MarketOrderDetail;

/* ===== styled-components ===== */

const Container = styled.div`
  width: 100%;
  height: 100%;
  max-width: 100vw;
  margin: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: #fff;
  overflow: hidden;
  padding: 12px 8px 0 8px;

  @media (max-width: 834px) {
    min-width: 100vw;
    padding: 0 4px;
  }
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

/* ─── SessionHeader 스타일 (MonitoringDetail과 동일) ───────────────────────────────── */
const SessionHeader = styled.div`
  box-sizing: border-box;
  background: #eeeeee;
  border: 1px solid #dddddd;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  padding: 16px 20px;
  font-family: 'NanumSquare Neo OTF';
  font-style: normal;
  font-weight: 700;
  font-size: 12px;
  line-height: 13px;
  text-align: center;
  color: #000000;
  margin-top: 24px;
  margin-bottom: -1px;
  width: fit-content;
`;

/* ─── FormBox, Row, Field 등 기존 스타일 ─────────────────────────────────────────────── */
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

const Field = styled.div`
  width: 100%;
  min-width: 300px;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  box-sizing: border-box;

  &:not(:last-child) {
    border-right: 1px solid #ddd;
  }

  label {
    width: 80px;
    font-size: 12px;
    font-weight: 700;
    margin-right: 8px;
    text-align: center;
  }

  input,
  select {
    flex: 1;
    height: 36px;
    padding: 0 8px;
    font-size: 12px;
    max-width: 300px;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
  }
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  height: 36px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  width: 100%;
`;

const MethodPart = styled.div`
  flex: 0 0 60px;
  text-align: center;
  font-size: 12px;
  font-weight: 400;
`;

const Divider = styled.div`
  width: 1px;
  height: 100%;
  background: #ddd;
`;

const TrackingPart = styled.div`
  flex: 1;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DatePickerContainer = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0 12px;
  height: 36px;
  min-width: 140px;

  svg {
    margin-right: 8px;
    color: #666;
  }

  input {
    border: none;
    outline: none;
    font-size: 12px;
    height: 100%;
    min-width: 80px;
  }
`;

const StyledDatePicker = styled(DatePicker)`
  border: none;
  outline: none;
  font-size: 12px;
  height: 100%;
`;

const Hint = styled.div`
  margin-left: 8px;
  font-size: 10px;
  color: #999;
`;
