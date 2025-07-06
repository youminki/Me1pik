import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { format, addMonths } from 'date-fns';

import InputField from '../../../components/InputField';
import FixedBottomBar from '../../../components/FixedBottomBar';
import {
  postInitPayment,
  getMyCards,
  postRecurringPayment,
} from '../../../api/default/payment';

import PaymentAmountIcon from '../../../assets/LockerRoom/PaymentAmount.svg';
import TicketPaymentSeaSonIcon from '../../../assets/LockerRoom/TicketPaymentSeaSon.svg';
import TicketPaymentRightIcon from '../../../assets/LockerRoom/TicketPaymentRightIcon.svg';

export interface CardItem {
  cardId: number;
  payerId: string;
  cardName: string;
  cardNumber: string;
  createdAt: string;
}

// NativeApp 타입 정의 (global 확장 없이 타입만 선언)
interface NativeApp {
  addCard: () => void;
  requestLogin?: () => void;
  saveLoginInfo?: (data: Record<string, unknown>) => void;
}

// PaypleCpayAuthCheck 타입 선언 (window에 임시 확장)
declare global {
  interface Window {
    PaypleCpayAuthCheck?: (data: unknown) => void;
  }
}

const TicketPayment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // URL 쿼리에서 파라미터 추출
  const searchParams = new URLSearchParams(location.search);
  const name = searchParams.get('name') || '';
  const discountedPriceParam = searchParams.get('discountedPrice') || '0';
  const discountedPrice = parseFloat(discountedPriceParam);
  const roundedPrice = isNaN(discountedPrice) ? 0 : Math.round(discountedPrice);
  const formattedDiscountedPrice = roundedPrice.toLocaleString();

  const [options, setOptions] = useState<string[]>([]);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const today = new Date();
  const formattedToday = format(today, 'yyyy.MM.dd');
  const formattedOneMonthLater = format(addMonths(today, 1), 'MM.dd');

  // 팝업 윈도우에서 결제 결과를 부모 윈도우에 전달 (1회 결제용)
  useEffect(() => {
    interface PayCallbackResult {
      status: string;
      [key: string]: unknown;
    }
    (
      window as unknown as {
        PCD_PAY_CALLBACK: (result: PayCallbackResult) => void;
      }
    ).PCD_PAY_CALLBACK = (result: PayCallbackResult) => {
      if (window.opener) {
        window.opener.postMessage(
          {
            paymentStatus: result?.status === 'success' ? 'success' : 'failure',
          },
          window.location.origin
        );
      }
      window.close();
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await getMyCards();
        const items: CardItem[] = res.items;
        let opts: string[];
        if (items.length === 0) {
          opts = ['등록된 카드가 없습니다', '카드 추가하기'];
        } else {
          opts = items.map((c) => `카드 결제 / ${c.cardName} ${c.cardNumber}`);
          opts.push('카드 추가하기');
        }
        setCards(items);
        setOptions(opts);
        setSelectedPaymentMethod(opts[0]);
      } catch (e) {
        console.error('[🔥] 카드 목록 조회 실패', e);
        setOptions(['등록된 카드가 없습니다', '카드 추가하기']);
        setSelectedPaymentMethod('등록된 카드가 없습니다');
      }
    })();
  }, []);

  const extractPayerId = (val: string) => {
    const card = cards.find(
      (c) => val.includes(c.cardName) && val.includes(c.cardNumber)
    );
    return card?.payerId || '';
  };

  const handleSelectChange = (val: string) => {
    if (val === '카드 추가하기') {
      handleCardAddClick();
      return;
    }
    setSelectedPaymentMethod(val);
  };

  const handleCardAddClick = () => {
    if (typeof window.nativeApp !== 'undefined') {
      // 네이티브 앱에서 카드 추가 화면 표시
      (window.nativeApp as NativeApp)?.addCard();
    } else {
      // 웹 환경에서는 기존 웹 카드 추가 로직 실행
      showWebCardAddForm();
    }
  };

  const handlePaymentClick = async () => {
    if (isProcessing) return; // 중복 클릭 방지
    setIsProcessing(true);

    const payerId = extractPayerId(selectedPaymentMethod);
    if (!payerId) {
      alert('결제할 카드를 선택해주세요.');
      setIsProcessing(false);
      return;
    }

    const requestData = { payerId, amount: roundedPrice, goods: name };

    try {
      if (name === '1회 이용권') {
        const response = await postInitPayment(requestData);
        window.PaypleCpayAuthCheck?.(response.data);
      } else if (
        name === '정기 구독권(4회권)' ||
        name === '정기 구독권(무제한)'
      ) {
        const response = await postRecurringPayment(requestData);
        const payResult = response.data.PCD_PAY_RST;
        if (payResult === 'success') {
          navigate('/payment-complete');
        } else {
          navigate('/payment-fail');
        }
      } else {
        alert('알 수 없는 이용권 유형입니다.');
        setIsProcessing(false);
      }
    } catch (error: unknown) {
      console.error('결제 실패:', error);
      const errMsg = getErrorMessage(error);
      alert(`결제 실패: ${errMsg}`);
      navigate('/payment-fail');
    }
  };

  useEffect(() => {
    // 카드 추가 완료 이벤트
    const onCardAddComplete = (
      event: CustomEvent<{ success: boolean; errorMessage?: string }>
    ) => {
      const { success, errorMessage } = event.detail;
      if (success) {
        // 카드 추가 성공 처리 (예: 카드 목록 새로고침)
        refreshCardList();
      } else {
        // 카드 추가 실패 처리 (예: 에러 메시지 표시)
        showErrorMessage(errorMessage || '카드 추가에 실패했습니다.');
      }
    };

    // 네이티브 로그인 성공 이벤트
    const onNativeLoginSuccess = (
      event: CustomEvent<{
        userId: string;
        userEmail: string;
        userName: string;
        accessToken: string;
      }>
    ) => {
      const { userId, userEmail, userName, accessToken } = event.detail;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userEmail', userEmail);
      localStorage.setItem('userName', userName);
      updateLoginState(true);
    };

    document.addEventListener(
      'cardAddComplete',
      onCardAddComplete as EventListener
    );
    document.addEventListener(
      'nativeLoginSuccess',
      onNativeLoginSuccess as EventListener
    );

    return () => {
      document.removeEventListener(
        'cardAddComplete',
        onCardAddComplete as EventListener
      );
      document.removeEventListener(
        'nativeLoginSuccess',
        onNativeLoginSuccess as EventListener
      );
    };
  }, []);

  return (
    <Container>
      <ProductInfo>
        <Title>결제할 이용권</Title>
        <Divider />

        <ProductHeader>
          <LeftSide>
            <SubscriptionLabel>이용권 결제</SubscriptionLabel>
            <ProductTitle>
              <MainTitle>{name}</MainTitle>
            </ProductTitle>

            <Row>
              <IconImg src={TicketPaymentSeaSonIcon} alt='시즌 아이콘' />
              <RowTextContainer>
                <RowLabel>
                  시즌 -<RowValue> 2025 SPRING</RowValue>
                </RowLabel>
                <RowPeriod>{`${formattedToday} ~ ${formattedOneMonthLater}`}</RowPeriod>
              </RowTextContainer>
            </Row>

            <Row>
              <IconImg src={PaymentAmountIcon} alt='결제금액 아이콘' />
              <RowTextContainer>
                <RowLabel>
                  결제금액 -<RowValue>{formattedDiscountedPrice}원</RowValue>
                </RowLabel>
              </RowTextContainer>
            </Row>
          </LeftSide>

          <RightSideImage>
            <img
              src={TicketPaymentRightIcon}
              alt='정기 구독권 예시 이미지'
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </RightSideImage>
        </ProductHeader>
      </ProductInfo>

      <Divider />

      <Section>
        <InputField
          label='결제방식 *'
          id='paymentMethod'
          options={options}
          value={selectedPaymentMethod}
          onSelectChange={handleSelectChange}
        />
      </Section>

      <Divider />

      <Section>
        <CustomLabel>총 결제금액 (VAT 포함)</CustomLabel>
        <PaymentAmountWrapper>
          <PaymentAmount>{formattedDiscountedPrice}원</PaymentAmount>
        </PaymentAmountWrapper>
      </Section>

      <FixedBottomBar
        text={isProcessing ? '결제중...' : '결제하기'}
        color='yellow'
        onClick={handlePaymentClick}
        disabled={isProcessing}
      />
    </Container>
  );
};

export default TicketPayment;

// styled-components 정의
const Container = styled.div`
  position: relative;
  background: #ffffff;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  max-width: 600px;
  min-height: 100vh;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #dddddd;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px 0;
`;

const CustomLabel = styled.div`
  font-weight: 700;
  font-size: 12px;
  line-height: 11px;
  color: #000000;
  margin-bottom: 8px;
`;

const PaymentAmountWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  height: 57px;
  box-sizing: border-box;
  background: #ffffff;
  border: 1px solid #eeeeee;
  border-radius: 4px;
  padding: 0 16px;
`;

const PaymentAmount = styled.span`
  font-weight: 900;
  font-size: 16px;
  line-height: 18px;
  text-align: right;
  color: #000000;
`;

const ProductInfo = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding-bottom: 20px;
`;

const Title = styled.div`
  font-weight: 700;
  font-size: 12px;
  line-height: 11px;
  color: #000000;
  margin-bottom: 10px;
`;

const ProductHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-top: 20px;
`;

const LeftSide = styled.div`
  display: flex;
  flex-direction: column;
`;

const SubscriptionLabel = styled.div`
  font-weight: 900;
  font-size: 12px;
  line-height: 11px;
  color: #000000;
  margin-bottom: 10px;
`;

const ProductTitle = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 20px;
`;

const MainTitle = styled.span`
  font-weight: 900;
  font-size: 18px;
  line-height: 22px;
  color: #000000;
`;

const RightSideImage = styled.div`
  width: 169px;
  height: 210px;
  background: #d9d9d9;
  overflow: hidden;
  border-radius: 4px;
`;

const Row = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const IconImg = styled.img`
  width: 20px;
  height: 20px;
  margin-right: 8px;
`;

const RowTextContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const RowLabel = styled.span`
  font-weight: 700;
  font-size: 14px;
  line-height: 22px;
  color: #000000;
`;

const RowValue = styled.span`
  font-weight: 900;
  font-size: 14px;
  line-height: 22px;
  color: #000000;
`;

const RowPeriod = styled.span`
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: #000000;
`;

// 2. showWebCardAddForm 함수 정의
function showWebCardAddForm() {
  alert('웹 카드 추가 폼을 여는 로직을 구현하세요.');
}

// refreshCardList, showErrorMessage, updateLoginState 함수 간단 정의 추가
function refreshCardList() {
  // 카드 목록 새로고침 로직 구현
  console.log('카드 목록 새로고침');
}
function showErrorMessage(message: string) {
  // 에러 메시지 표시 로직 구현
  alert(message);
}
function updateLoginState(isLoggedIn: boolean) {
  // 로그인 상태 UI 업데이트 로직 구현
  console.log('로그인 상태:', isLoggedIn);
}

// error에서 메시지를 추출하는 타입 가드 함수
function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    if (
      'response' in error &&
      typeof (error as { response?: { data?: { message?: string } } }).response
        ?.data?.message === 'string'
    ) {
      return (error as { response: { data: { message: string } } }).response
        .data.message;
    }
    if (
      'message' in error &&
      typeof (error as { message?: string }).message === 'string'
    ) {
      return (error as { message: string }).message;
    }
  }
  return '알 수 없는 오류';
}
