// src/pages/LockerRoom/TicketDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import Spinner from '../../../components/spinner';
import {
  getUserTickets,
  TicketItem,
} from '../../../api-utils/schedule-management/ticket/ticket';

const TicketDetail: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<TicketItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const items = await getUserTickets();
        const tplId = Number(ticketId);
        const found =
          items.find(
            (t: { ticketList: { id: number } }) => t.ticketList.id === tplId
          ) ?? null;
        setTicket(found);
      } catch (err) {
        console.error('티켓 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [ticketId]);

  const formatDate = (iso: string) => iso.slice(0, 10).replace(/-/g, '.');
  const formatTime = (iso: string) => new Date(iso).toTimeString().slice(0, 8);

  if (loading) {
    return (
      <SpinnerWrapper>
        <Spinner />
      </SpinnerWrapper>
    );
  }

  if (!ticket) {
    return (
      <Container>
        <ContentArea>
          <ErrorText>해당하는 이용권을 찾을 수 없습니다.</ErrorText>
        </ContentArea>
      </Container>
    );
  }

  const {
    ticketList: { name, durationMonths, price, isUlimited },
    startDate,
    endDate,
    purchasedAt,
    remainingRentals,
    autoRenewal,
    nextBillingDate,
  } = ticket;

  return (
    <Container>
      <ContentArea>
        {/* 이용권 이름 */}
        <Section>
          <SectionTitle>이용권 이름</SectionTitle>
          <ReadOnlyBox>{name}</ReadOnlyBox>
        </Section>

        {/* 사용기간 */}
        <Section>
          <SectionTitle>사용기간</SectionTitle>
          <ReadOnlyBox>
            {formatDate(startDate)} ~ {formatDate(endDate)}{' '}
            <GrayText>(유효기간)</GrayText>
          </ReadOnlyBox>
        </Section>

        {/* 결제일시 */}
        <Section>
          <SectionTitle>결제일시</SectionTitle>
          <ReadOnlyBox>
            {formatDate(purchasedAt)}{' '}
            <GrayText>({formatTime(purchasedAt)})</GrayText>
          </ReadOnlyBox>
        </Section>

        {/* 사용 가능 개월 수 */}
        <Section>
          <SectionTitle>사용 가능 개월 수</SectionTitle>
          <ReadOnlyBox>{durationMonths}개월</ReadOnlyBox>
        </Section>

        {/* 가격 */}
        <Section>
          <SectionTitle>가격 (원)</SectionTitle>
          <ReadOnlyBox>{price.toLocaleString()}원</ReadOnlyBox>
        </Section>

        {/* 잔여횟수: isUlimited가 false일 때만 */}
        {!isUlimited && (
          <Section>
            <SectionTitle>잔여횟수</SectionTitle>
            <ReadOnlyBoxGray>
              <SeasonValue>{remainingRentals}회</SeasonValue>
            </ReadOnlyBoxGray>
          </Section>
        )}

        {/* 다음 결제일 & 자동연장 */}
        <Section>
          <Row>
            <HalfSection>
              <SectionTitle>다음 결제일</SectionTitle>
              <ReadOnlyBox>
                {nextBillingDate ? formatDate(nextBillingDate) : '—'}
              </ReadOnlyBox>
            </HalfSection>
            <HalfSection>
              <SectionTitle>자동연장</SectionTitle>
              <ReadOnlyBox>{autoRenewal ? '사용 중' : '해제됨'}</ReadOnlyBox>
            </HalfSection>
          </Row>
        </Section>

        <Divider />

        {/* 안내문 */}
        <NoticeArea>
          <NoticeText>
            ※ 이용 중인 구독권은 시즌 중간에는{' '}
            <OrangeBold>취소가 불가</OrangeBold>합니다.
          </NoticeText>
          <NoticeText>
            만약, 취소가 필요할 경우는 서비스팀에 문의해 주시기 바랍니다.
          </NoticeText>
        </NoticeArea>
      </ContentArea>
    </Container>
  );
};

export default TicketDetail;

// ─── Styled Components ─────────────────────────────────────────────

const SpinnerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px; /* 스피너 위치 조정용 높이 */
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 1rem;
  max-width: 600px;
  margin: 0 auto;
  background-color: #ffffff;
`;

const ContentArea = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #333;
  margin-bottom: 5px;
`;

const ReadOnlyBox = styled.div`
  height: 50px;
  border: 1px solid #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 600;
`;

const ReadOnlyBoxGray = styled(ReadOnlyBox)`
  justify-content: space-between;
`;

const Row = styled.div`
  display: flex;
  gap: 20px;
`;

const HalfSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: #eee;
`;

const NoticeArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const NoticeText = styled.p`
  font-size: 12px;
  color: #888;
  margin: 0;
`;

const ErrorText = styled.p`
  font-size: 14px;
  color: #f00;
  text-align: center;
`;

const GrayText = styled.span`
  font-size: 12px;
  color: #999;
  margin-left: 4px;
`;

const OrangeBold = styled.span`
  color: #f6ae24;
  font-weight: 700;
`;

const SeasonValue = styled.span`
  font-size: 14px;
  font-weight: 700;
`;
