// src/pages/locker-rooms/my-tickets.tsx

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import StatsSection from '@/components/stats-section';
import TicketIllustration from '@/assets/locker-rooms/TicketIllustration.svg';
import AddTicketIllustration from '@/assets/locker-rooms/AddTicketIllustration.svg';
import CardIcon from '@/assets/locker-rooms/AddTicketIllustrations.svg';
import BarcodeImg from '@/assets/locker-rooms/barcodeIcon.svg';
import { useUserTickets } from '@/api-utils/schedule-managements/tickets/ticket';
import EmptyState from '@/components/shared/EmptyState';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import CommonErrorMessage from '@/components/shared/ErrorMessage';

const visitLabel = '사용중인 이용권';
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

const MyTicket: React.FC = () => {
  const navigate = useNavigate();
  // react-query로 티켓 데이터 패칭
  const { data: tickets = [], isLoading, error } = useUserTickets();

  // 예시: 로딩/에러 상태 처리
  if (isLoading) {
    return <LoadingSpinner label='이용권 정보를 불러오는 중...' />;
  }
  if (error) {
    return <CommonErrorMessage message='이용권 정보를 불러오지 못했습니다.' />;
  }

  return (
    <MyTicketContainer>
      <Header>
        <Title>이용권</Title>
        <Subtitle>나에게 맞는 스타일을 찾을 때는 멜픽!</Subtitle>
      </Header>

      <StatsSection
        visits={String(tickets.length)}
        sales={sales}
        dateRange={dateRange}
        visitLabel={visitLabel}
        salesLabel={salesLabel}
      />
      <Divider />

      <TicketWrapper>
        {tickets.length === 0 && (
          <EmptyState message='보유한 이용권이 없습니다.' />
        )}
        {tickets.map((ticket) => {
          const {
            id,
            startDate,
            endDate,
            remainingRentals,
            ticketList: { id: tplId, name, price, isLongTerm, isUlimited },
          } = ticket;

          const subtitle = isLongTerm ? '(매월결제)' : '(일반결제)';
          const formattedPrice = `${price.toLocaleString()}원`;
          const formattedDate = `${startDate.replace(/-/g, '.')} ~ ${endDate.replace(/-/g, '.')}`;

          return (
            <TicketCard
              key={id}
              onClick={() => navigate(`/ticketDetail/${tplId}`)}
            >
              <RemainingBadge>
                {isUlimited ? '무제한' : `잔여횟수 ${remainingRentals}회`}
              </RemainingBadge>
              <Left>
                <SeasonRow>
                  <SeasonText>
                    2025 <YellowText>SPRING</YellowText>
                  </SeasonText>
                  <CardIconImg src={CardIcon} alt='card icon' />
                </SeasonRow>
                <TicketTitle>{name}</TicketTitle>
                <TicketSubtitle>{subtitle}</TicketSubtitle>
                <TicketPrice>{formattedPrice}</TicketPrice>
                <Barcode src={BarcodeImg} alt='barcode' />
              </Left>
              <Right>
                <DateText>{formattedDate}</DateText>
                <Illustration
                  src={TicketIllustration}
                  alt='ticket illustration'
                />
              </Right>
            </TicketCard>
          );
        })}

        {/* 항상 표시되는 "이용권 추가" 카드 */}
        <TicketCardAdd onClick={() => navigate('/my-ticket/PurchaseOfPasses')}>
          <AddLeft>
            <PlusBox>
              <PlusSign>＋</PlusSign>
            </PlusBox>
            <AddText>이용권 추가</AddText>
          </AddLeft>
          <AddRight>
            <Illustration
              src={AddTicketIllustration}
              alt='Add ticket illustration'
            />
          </AddRight>
        </TicketCardAdd>
      </TicketWrapper>
    </MyTicketContainer>
  );
};

export default MyTicket;

// ─── Styled Components ─────────────────────────────────────────────

const MyTicketContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  padding: 1rem;
`;

const Header = styled.div`
  width: 100%;
  margin-bottom: 6px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 800;
  color: #000;
  @media (min-width: 1024px) {
    font-size: 32px;
  }
`;

const Subtitle = styled.p`
  font-size: 12px;
  color: #ccc;
  @media (min-width: 1024px) {
    font-size: 14px;
  }
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #ddd;
  margin: 30px 0;
`;

const TicketWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  min-height: 200px;
`;

const TicketCard = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  height: 160px;
  border: 1px solid #ddd;
  overflow: hidden;
  cursor: pointer;
  animation: ${fadeInUp} 0.3s ease-out;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: scale(1.03);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  }

  &::before,
  &::after {
    content: '';
    position: absolute;
    left: calc(50% - 15px);
    width: 30px;
    height: 30px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 50%;
    z-index: 1;
  }
  &::before {
    top: -15px;
  }
  &::after {
    bottom: -15px;
  }

  @media (min-width: 1024px) {
    height: 200px;
  }
`;

const TicketCardAdd = styled(TicketCard)`
  justify-content: center;
  position: relative;
  display: flex;
  width: 100%;
  height: 160px;
  border: 1px solid #ddd;
  overflow: hidden;
  cursor: pointer;
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
`;

const RemainingBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 12px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 6px;
  border-radius: 12px;
  z-index: 2;

  @media (min-width: 1024px) {
    font-size: 12px;
    padding: 6px 8px;
  }
`;

const Left = styled.div`
  width: 50%;
  padding: 16px;
  box-sizing: border-box;
  background: #fff;
  display: flex;
  flex-direction: column;

  @media (min-width: 1024px) {
    padding: 24px;
  }
`;

const SeasonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
`;

const SeasonText = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #000;

  @media (min-width: 1024px) {
    font-size: 14px;
  }
`;

const YellowText = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #f6ae24;

  @media (min-width: 1024px) {
    font-size: 14px;
  }
`;

const CardIconImg = styled.img`
  width: 12px;
  height: 12px;
`;

const TicketTitle = styled.h3`
  font-size: 16px;
  font-weight: 800;
  color: #000;
  margin: 0;

  @media (min-width: 1024px) {
    font-size: 20px;
  }
`;

const TicketSubtitle = styled.p`
  font-size: 8px;
  line-height: 9px;
  color: #666;
  margin: 8px 0;

  @media (min-width: 1024px) {
    font-size: 10px;
    margin: 10px 0;
  }
`;

const TicketPrice = styled.p`
  font-size: 24px;
  font-weight: 900;
  color: #000;
  margin: 0;

  @media (min-width: 1024px) {
    font-size: 28px;
  }
`;

const Barcode = styled.img`
  width: 70px;
  height: auto;
  margin-top: auto;

  @media (min-width: 1024px) {
    width: 90px;
  }
`;

const Right = styled.div`
  width: 50%;
  padding: 16px;
  box-sizing: border-box;
  background: #f6ae24;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  border-left: 1px dashed #fff;

  @media (min-width: 1024px) {
    padding: 24px;
  }
`;

const DateText = styled.p`
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  color: #fff;
  margin: 20px 0;

  @media (min-width: 1024px) {
    font-size: 14px;
    margin: 24px 0;
  }
`;

const Illustration = styled.img`
  position: absolute;
  bottom: 16px;
  right: 16px;

  @media (min-width: 1024px) {
    bottom: 24px;
    right: 24px;
  }
`;

const AddLeft = styled.div`
  display: flex;
  align-items: center;

  @media (min-width: 1024px) {
    gap: 12px;
  }
`;

const PlusBox = styled.div`
  width: 24px;
  height: 24px;
  border: 2px dashed #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 8px;

  @media (min-width: 1024px) {
    width: 32px;
    height: 32px;
    margin-right: 12px;
  }
`;

const PlusSign = styled.span`
  font-size: 24px;
  color: #ccc;

  @media (min-width: 1024px) {
    font-size: 32px;
  }
`;

const AddText = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #999;

  @media (min-width: 1024px) {
    font-size: 20px;
  }
`;

const AddRight = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;

  @media (min-width: 1024px) {
    bottom: 16px;
    right: 16px;
  }
`;
