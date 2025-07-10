// src/pages/my-ticket/PurchaseOfPasses.tsx
import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { CustomSelect } from '../../../components/CustomSelect';
import FixedBottomBar from '../../../components/FixedBottomBar';
import ReusableModal2 from '../../../components/ReusableModal2';
import { format, addMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useTicketList } from '../../../api/ticket/ticket';
import { useMembershipInfo } from '../../../api/user/userApi';

// 한국 시간 기준 오늘 0시 반환 함수
function getKoreanToday() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const koreaTime = new Date(utc + 9 * 60 * 60 * 1000);
  koreaTime.setHours(0, 0, 0, 0);
  return koreaTime;
}

const PurchaseOfPasses: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const popupRef = useRef<Window | null>(null);

  const searchParams = new URLSearchParams(location.search);
  const initialName = searchParams.get('name') || '';

  // react-query로 데이터 패칭
  const { data: ticketData } = useTicketList();
  const { data: membershipInfo } = useMembershipInfo();

  const [purchaseOption, setPurchaseOption] = useState<string>(initialName);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 템플릿 목록과 할인율 계산
  const templates = useMemo(() => ticketData?.items ?? [], [ticketData?.items]);
  const discountRate = membershipInfo
    ? Math.max(0, parseFloat(membershipInfo.discountRate?.toString() || '0'))
    : 0;

  // 초기 구매 옵션 설정
  React.useEffect(() => {
    if (!initialName && templates.length > 0) {
      setPurchaseOption(templates[0].name);
    }
  }, [initialName, templates]);

  // 한국 시간으로 오늘 날짜 생성 및 한 달 후 날짜 포맷
  const today = getKoreanToday();
  const formattedToday = format(today, 'yyyy.MM.dd', { locale: ko });
  const formattedOneMonthLater = format(addMonths(today, 1), 'yyyy.MM.dd', {
    locale: ko,
  });

  // 선택된 템플릿 객체
  const selectedTemplate = templates.find((t) => t.name === purchaseOption);

  // 가격 계산
  const basePrice = selectedTemplate?.price ?? 0;
  const discountedPrice =
    discountRate > 0 ? basePrice * (1 - discountRate / 100) : basePrice;
  const formattedDiscountedPrice = discountedPrice.toLocaleString();

  // 결제 확인 핸들러
  const handleConfirmPayment = useCallback(() => {
    const params = new URLSearchParams({
      name: selectedTemplate?.name || '',
      discountedPrice: String(discountedPrice),
    }).toString();
    const url = `/my-ticket/PurchaseOfPasses/TicketPayment?${params}`;

    if (window.innerWidth > 768) {
      popupRef.current = window.open(
        url,
        'ticketPaymentPopup',
        `width=360,height=600,left=${(window.screen.availWidth - 360) / 2},top=${(window.screen.availHeight - 600) / 2},resizable,scrollbars`
      );
      const timer = setInterval(() => {
        if (popupRef.current?.closed) {
          clearInterval(timer);
          navigate('/my-ticket');
        }
      }, 500);
    } else {
      window.location.href = url;
    }
    setIsModalOpen(false);
  }, [selectedTemplate, discountedPrice, navigate]);

  return (
    <Container>
      <InputBox>
        <Label>구매할 이용권 *</Label>
        <CustomSelect
          value={purchaseOption}
          onChange={(e) => setPurchaseOption(e.target.value)}
        >
          {templates.map((tpl) => (
            <option key={tpl.id} value={tpl.name}>
              {tpl.name}
            </option>
          ))}
        </CustomSelect>
      </InputBox>

      <InputBox>
        <Label>이용권 사용기간</Label>
        <ContentBox>
          {formattedToday} ~ {formattedOneMonthLater} (1개월)
        </ContentBox>
      </InputBox>

      <InputBox>
        <Label>이용권 결제금액</Label>
        <ContentBox>{formattedDiscountedPrice}원</ContentBox>
      </InputBox>

      <InputBox>
        <Label>진행 중인 시즌 표시</Label>
        <ContentBox>2025 SPRING | 2025.05 ~ 2025.07</ContentBox>
      </InputBox>

      <InputBox>
        <Label>자동결제 일자</Label>
        <ContentBox>{formattedToday}</ContentBox>
      </InputBox>

      <Divider />
      <NoticeArea>
        <NoticeText>
          ※ 이용 중인 구독권은{' '}
          <OrangeBoldText>시즌 중간에 취소가 불가</OrangeBoldText>합니다.
        </NoticeText>
        <NoticeText>
          구독권 설정은 <BlackBoldText>시즌 시작 전에 선택</BlackBoldText>해야
          하며, 다음 시즌에 변경 가능합니다.
        </NoticeText>
      </NoticeArea>

      <FixedBottomBar
        text='이용권 결제하기'
        color='black'
        onClick={() => setIsModalOpen(true)}
      />

      <ReusableModal2
        title='이용권 구매'
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmPayment}
      >
        이용권을 결제하시겠습니까?
      </ReusableModal2>
    </Container>
  );
};

export default PurchaseOfPasses;

// --- Styled Components ---

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  padding: 1rem;
  max-width: 600px;
  background-color: #ffffff;
`;

const InputBox = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 16px;
`;

const Label = styled.label`
  font-size: 10px;
  font-weight: 700;
  color: #333333;
  margin-bottom: 8px;
`;

const ContentBox = styled.div`
  padding: 0 10px;
  height: 51px;
  border: 1px solid #ccc;

  background-color: #fff;
  font-size: 14px;
  color: #666666;
  min-height: 20px;
  display: flex;
  align-items: center;
`;

const Divider = styled.hr`
  border: none;
  width: 100%;
  border: 1px solid #eeeeee;
`;

const NoticeArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  width: 100%;
  margin: 16px 0;
`;

const NoticeText = styled.p`
  font-size: 12px;
  color: #999999;
  line-height: 20px;
  margin: 0;
`;

const OrangeBoldText = styled.span`
  color: #f6ae24;
  font-weight: 700;
`;

const BlackBoldText = styled.span`
  color: #000000;
  font-weight: 700;
`;
