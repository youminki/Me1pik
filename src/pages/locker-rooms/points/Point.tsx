import React, { useState } from 'react';
import styled from 'styled-components';
import StatsSection from '@/components/stats-section';
import PeriodSection from '@/components/period-section';
import EmptyState from '@/components/shared/EmptyState';

const visitLabel = '포인트';
const salesLabel = '포인트 변동';
const visits = '0';
const sales = '9';
const dateRange = 'COUNT';

const pointHistory = [
  {
    date: '2025-03-10 / 구매사용',
    detail: '포인트 사용',
    detailColor: '#F6AE24',
    change: '- 29,500',
    total: '0',
  },
  {
    date: '2025-03-08 / 제품평가 작성',
    detail: '포인트 적립',
    detailColor: '#EF4523',
    change: '500',
    total: '29,500',
  },
  {
    date: '2025-03-07 / 제품평가 작성',
    detail: '포인트 적립',
    detailColor: '#EF4523',
    change: '500',
    total: '29,000',
  },
  {
    date: '2025-03-06 / 제품평가 작성',
    detail: '포인트 적립',
    detailColor: '#EF4523',
    change: '500',
    total: '28,500',
  },
  {
    date: '2025-03-06 / 제품평가 작성',
    detail: '포인트 적립',
    detailColor: '#EF4523',
    change: '500',
    total: '28,000',
  },
  {
    date: '2025-03-04 / 제품평가 작성',
    detail: '포인트 적립',
    detailColor: '#EF4523',
    change: '500',
    total: '27,500',
  },
  {
    date: '2025-03-03 / 제품평가 작성',
    detail: '포인트 적립',
    detailColor: '#EF4523',
    change: '500',
    total: '27,000',
  },
  {
    date: '2025-03-03 / 제품평가 작성',
    detail: '포인트 적립',
    detailColor: '#EF4523',
    change: '500',
    total: '26,500',
  },
];

const Point: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(6);

  // 예시: 로딩/에러 상태 처리 (API 연동 시)
  // if (isLoading) {
  //   return <LoadingSpinner label="포인트 내역을 불러오는 중..." />;
  // }
  // if (에러상태) {
  //   return <CommonErrorMessage message="포인트 내역을 불러오지 못했습니다." />;
  // }

  if (!pointHistory || pointHistory.length === 0) {
    return <EmptyState message='포인트 내역이 없습니다.' />;
  }

  return (
    <PointContainer>
      <Header>
        <Title>포인트</Title>
        <Subtitle>나에게 맞는 스타일을 찾을 때는 멜픽!</Subtitle>
      </Header>

      <StatsSection
        visits={visits}
        sales={sales}
        dateRange={dateRange}
        visitLabel={visitLabel}
        salesLabel={salesLabel}
      />
      <Divider />

      <Section>
        <PeriodSection
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
        />

        <HistoryContainer>
          <HistoryHeader>
            <LeftHeader>일자 / 내역정보</LeftHeader>
            <RightHeader>변동 / 누적 (포인트)</RightHeader>
          </HistoryHeader>

          {pointHistory.map((item, idx) => {
            const splitted = item.date.split(' / ');
            const datePart = splitted[0];
            const slashPart = splitted[1] || '';

            return (
              <HistoryRow key={idx}>
                <RowLeft>
                  <DateRow>
                    <DatePart>{datePart}</DatePart>
                    {slashPart && <Slash> / </Slash>}
                    {slashPart && <SlashPart>{slashPart}</SlashPart>}
                  </DateRow>

                  <DetailText color={item.detailColor}>
                    {item.detail}
                  </DetailText>
                </RowLeft>

                <RowRight>
                  <ChangeText>{item.change}</ChangeText>
                  <TotalText>{item.total}</TotalText>
                </RowRight>
              </HistoryRow>
            );
          })}
        </HistoryContainer>
      </Section>
    </PointContainer>
  );
};

export default Point;

const PointContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  background-color: #fff;
  padding: 1rem;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 6px;
`;

const Title = styled.h1`
  font-weight: 800;
  font-size: 24px;
  line-height: 27px;
  color: #000000;
  margin-bottom: 0px;
`;

const Subtitle = styled.p`
  font-size: 12px;
  font-weight: 400;
  color: #ccc;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #dddddd;
  margin-top: 30px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-bottom: 80px;
  margin-top: 30px;
`;

const HistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
`;

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(221, 221, 221, 0.96);
  border: 1px solid #dddddd;
  padding: 10px;
`;

const LeftHeader = styled.div`
  font-weight: 800;
  font-size: 12px;
  line-height: 11px;

  color: #000000;
`;

const RightHeader = styled.div`
  font-weight: 800;
  font-size: 12px;
  line-height: 11px;
  color: #000000;
  text-align: right;
`;

const HistoryRow = styled.div`
  display: flex;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #dddddd;
  padding: 20px;
`;

const RowLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 15px;
`;

const DateRow = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const DatePart = styled.span`
  font-weight: 800;
  font-size: 14px;
  line-height: 13px;
  color: #000000;
`;

const Slash = styled.span`
  font-weight: 400;
  font-size: 14px;
  line-height: 13px;
  color: #000000;
`;

const SlashPart = styled.span`
  font-weight: 400;
  font-size: 14px;
  line-height: 13px;
  color: #000000;
`;

const RowRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 15px;
`;

const DetailText = styled.p<{ color?: string }>`
  font-weight: 400;
  font-size: 14px;
  line-height: 13px;
  margin: 0;
  color: ${({ color }) => color || '#000000'};
`;

const ChangeText = styled.p`
  font-weight: 400;
  font-size: 14px;
  line-height: 13px;
  margin: 0;
  color: #000000;
  text-align: right;
`;

const TotalText = styled.p`
  font-weight: 800;
  font-size: 16px;
  line-height: 13px;
  margin: 0;
  color: #000000;
  text-align: right;
`;
