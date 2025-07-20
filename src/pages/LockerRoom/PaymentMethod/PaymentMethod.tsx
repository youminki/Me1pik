// src/pages/LockerRoom/PaymentMethod/PaymentMethod.tsx

import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import StatsSection from '../../../components/stats-section';
import Spinner from '../../../components/spinner';
import { useMyCards } from '../../../api-utils/payment/default/payment';
import { CardItem } from '../../../api-utils/payment/default/payment';

interface UserInfo {
  userId: string;
  userName: string;
  userEmail: string;
}

interface CardData {
  registerDate: string;
  brand: string;
  cardNumber: string;
}

const visitLabel = '결제등록 카드';
const salesLabel = '시즌';
const sales = '2025 1분기';
const dateRange = 'SPRING';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const PaymentMethod: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // react-query로 카드 데이터 패칭
  const { data: cardsData, isLoading } = useMyCards();

  const cards: CardData[] =
    cardsData?.items.map((item: CardItem) => ({
      registerDate: item.createdAt
        ? `등록일 ${new Date(item.createdAt).toISOString().slice(0, 10)}`
        : '등록일 알 수 없음',
      brand: item.cardName || '알 수 없음',
      cardNumber: item.cardNumber || '**** **** **** ****',
    })) ?? [];

  const count = cards.length;

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) throw new Error('로그인 필요');
        const res = await fetch('https://api.stylewh.com/user/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('유저 정보 요청 실패');
        const data = await res.json();
        setUserInfo({
          userId: String(data.id),
          userName: data.name,
          userEmail: data.email,
        });
      } catch (e: unknown) {
        console.error('유저 정보 로딩 실패', e);
        setError(e instanceof Error ? e.message : '알 수 없는 오류');
      }
    })();
  }, []);

  const registerCard = useCallback(() => {
    if (!userInfo) {
      setError('로그인 정보를 불러올 수 없습니다.');
      return;
    }
    setError(null);
    const params = new URLSearchParams({
      userId: userInfo.userId,
      userName: userInfo.userName,
      userEmail: userInfo.userEmail,
    }).toString();
    const url = `/test/AddCardPayple?${params}`;
    const isMobile = window.innerWidth <= 768;
    if (isMobile) window.location.href = url;
    else {
      const w = 360,
        h = 600;
      const left = (window.screen.availWidth - w) / 2;
      const top = (window.screen.availHeight - h) / 2;
      const popup = window.open(
        url,
        'cardAddPopup',
        `width=${w},height=${h},left=${left},top=${top},resizable,scrollbars`
      );
      if (popup) {
        const timer = setInterval(() => {
          if (popup.closed) {
            clearInterval(timer);
            window.location.reload();
          }
        }, 500);
      }
    }
  }, [userInfo]);

  return (
    <Container>
      <Header>
        <Title>결제수단</Title>
        <Subtitle>나에게 맞는 스타일을 찾을 때는 멜픽!</Subtitle>
      </Header>

      <StatsSection
        visits={count}
        sales={sales}
        dateRange={dateRange}
        visitLabel={visitLabel}
        salesLabel={salesLabel}
      />

      <Divider />

      {isLoading ? (
        <SpinnerWrapper>
          <Spinner />
        </SpinnerWrapper>
      ) : (
        <>
          <CardsList>
            {cards.map((card, idx) => (
              <CardItemBox key={idx}>
                <Chip />
                <Content>
                  <BrandLogo>{card.brand}</BrandLogo>
                  <CardNumber>{card.cardNumber}</CardNumber>
                </Content>
                <DateLabel>{card.registerDate}</DateLabel>
              </CardItemBox>
            ))}
            <AddCardBox onClick={registerCard}>
              <PlusWrapper>
                <PlusBox>
                  <PlusLineVert />
                  <PlusLineHorz />
                </PlusBox>
                <AddText>카드 추가</AddText>
              </PlusWrapper>
            </AddCardBox>
          </CardsList>

          {error && <ErrorMsg>{error}</ErrorMsg>}

          <DotsWrapper>
            {Array(cards.length + 1)
              .fill(0)
              .map((_, idx) => (
                <Dot key={idx} $active={idx === 0} />
              ))}
          </DotsWrapper>
        </>
      )}
    </Container>
  );
};

export default PaymentMethod;

// Styled Components

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 1rem;
  min-height: 100vh;
`;

const Header = styled.div`
  width: 100%;
  margin-bottom: 12px;
`;

const Title = styled.h1`
  font-size: 26px;
  font-weight: 900;
  color: #333;
`;

const Subtitle = styled.p`
  font-size: 14px;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #e0e0e0;
  margin: 30px 0;
`;

const CardsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
  width: 100%;
  max-width: 800px;
`;

const SpinnerWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 60px 0;
  animation: ${fadeIn} 0.5s ease-out;
`;

const CardItemBox = styled.div`
  position: relative;
  width: 300px;
  height: 180px;
  border-radius: 16px;
  background: #f6ae24;
  color: #fff;
  padding: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: ${fadeInUp} 0.5s ease-out;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  }
`;

const Chip = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  width: 40px;
  height: 30px;
  border-radius: 4px;
  background: linear-gradient(135deg, #eee 0%, #ccc 100%);
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: left;
  margin-top: 100px;
  margin-right: 40px;
  gap: 8px;
`;

const BrandLogo = styled.div`
  font-weight: 700;
  font-size: 14px;
  line-height: 9px;
  color: #ffffff;
`;

const CardNumber = styled.div`
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 2px;
`;

const DateLabel = styled.span`
  position: absolute;
  top: 12px;
  right: 16px;
  font-size: 12px;
  opacity: 0.8;
`;

const AddCardBox = styled(CardItemBox)`
  background: #fff;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 24px;

  max-width: 800px;
`;

const PlusWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const PlusBox = styled.div`
  position: relative;
  width: 32px;
  height: 32px;
  border: 2px dashed #ccc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PlusLineVert = styled.div`
  position: absolute;
  width: 2px;
  height: 14px;
  background: #ccc;
`;

const PlusLineHorz = styled.div`
  position: absolute;
  width: 14px;
  height: 2px;
  background: #ccc;
`;

const AddText = styled.span`
  font-size: 16px;
  font-weight: 700;
`;

const DotsWrapper = styled.div`
  display: flex;
  gap: 8px;
  margin: 24px 0;
`;

const Dot = styled.div<{ $active: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $active }) => ($active ? '#F6AE24' : '#ccc')};
 _animation: ${fadeIn} 0.5s ease-out;_
`;

const ErrorMsg = styled.p`
  color: #d32f2f;
  margin-top: 12px;
`;
