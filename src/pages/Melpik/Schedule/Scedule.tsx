// src/pages/Melpik/Schedule/Schedule.tsx

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Theme from '../../../styles/Theme';
import ScheduleIcon from '../../../assets/Melpik/schedule.svg';
import BletIcon from '../../../assets/Melpik/blet.svg';
import StatsSection from '../../../components/StatsSection';
import {
  getMySaleScheduleSummaries,
  SaleScheduleSummaryItem,
} from '../../../api/sale/SaleSchedule';

const Schedule: React.FC = () => {
  const navigate = useNavigate();

  // API로부터 받아올 스케줄 요약 리스트
  const [schedules, setSchedules] = useState<SaleScheduleSummaryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 마운트 시 API 호출
  useEffect(() => {
    const fetchSummaries = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMySaleScheduleSummaries();
        setSchedules(data);
      } catch (err: any) {
        console.error('스케줄 요약 조회 실패', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            '스케줄 조회 중 오류가 발생했습니다.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchSummaries();
  }, []);

  // 통계: 총 스케줄 수
  const totalCount = schedules.length;
  const inProgressCount = schedules.filter(
    (item) => item.status === 'scheduled'
  ).length;
  const currentDateRange = schedules.length > 0 ? schedules[0].dateRange : '';

  const visitLabel = '총 스케줄';
  const salesLabel = '진행중인 스케줄';

  const handleBottomClick = (): void => {
    navigate('/schedule/reservation1');
  };

  // 각 스케줄 클릭 시 상세 페이지로 이동
  const handleItemClick = (id: number): void => {
    navigate(`/schedule/confirmation/${id}`);
  };

  const mapStatusToUI = (
    status: string
  ): 'reserved' | 'inProgress' | 'notStarted' => {
    if (status === 'scheduled') return 'reserved';
    if (status === 'scheduling' || status === 'inProgress') return 'inProgress';
    return 'notStarted';
  };

  const formatDateRange = (dateRange: string): string =>
    dateRange
      .split('~')
      .map((part) => part.trim().replace(/-/g, '.'))
      .join(' ~ ');

  return (
    <ScheduleContainer>
      <Header>
        <Title>판매 스케줄</Title>
        <Subtitle>내 채널을 통해 나는 브랜드가 된다</Subtitle>
      </Header>

      {loading ? (
        <LoadingMessage>로딩 중...</LoadingMessage>
      ) : error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : (
        <>
          <StatsRow>
            <StatsSection
              visits={totalCount}
              sales={inProgressCount}
              dateRange={currentDateRange}
              visitLabel={visitLabel}
              salesLabel={salesLabel}
            />
          </StatsRow>
          <Divider />

          <ScheduleContent>
            <ScheduleList>
              {schedules.map((item) => {
                const uiStatus = mapStatusToUI(item.status);
                return (
                  <ScheduleItemContainer
                    key={item.id}
                    scheduleStatus={uiStatus}
                    onClick={() => handleItemClick(item.id)}
                  >
                    <IconContainer>
                      <IconWrapper scheduleStatus={uiStatus}>
                        <Icon src={ScheduleIcon} alt={`${item.title} Icon`} />
                      </IconWrapper>
                      <ConnectorLine />
                    </IconContainer>
                    <ItemContainer>
                      <MiniTitle>
                        {uiStatus === 'reserved'
                          ? '예약된 스케줄'
                          : uiStatus === 'inProgress'
                            ? '진행된 스케줄'
                            : '미진행 스케줄'}
                      </MiniTitle>
                      <ScheduleItem>
                        <Details>
                          <SeasonWrapper>
                            <Season>
                              {item.title} 시즌 {item.id}
                            </Season>
                            <BletIconWrapper
                              onClick={() => handleItemClick(item.id)}
                            >
                              <BletIconImg src={BletIcon} alt='Blet Icon' />
                            </BletIconWrapper>
                          </SeasonWrapper>
                          <DateWrapper>
                            <DateTitle>스케줄 일정</DateTitle>
                            <DateText>
                              {formatDateRange(item.dateRange)}
                            </DateText>
                          </DateWrapper>
                          <ConnectorLine1 />
                          <InfoRow>
                            <InfoColumn>
                              <DateTitle>선택한 작품</DateTitle>
                              <DateText>{item.productCount}가지</DateText>
                            </InfoColumn>
                          </InfoRow>
                        </Details>
                      </ScheduleItem>
                    </ItemContainer>
                  </ScheduleItemContainer>
                );
              })}
            </ScheduleList>
          </ScheduleContent>
        </>
      )}

      <BottomBarContainer>
        <OrderButton onClick={handleBottomClick}>스케줄 예약하기</OrderButton>
      </BottomBarContainer>
      <BeenContainer />
    </ScheduleContainer>
  );
};

export default Schedule;

// Styled Components
const ScheduleContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #fff;
  padding: 1rem;
  max-width: 600px;
  margin: auto;
`;
const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 6px;
`;
const Title = styled.h1`
  font-size: 24px;
  font-weight: 800;
  color: #000;
  margin-bottom: 0px;
`;
const Subtitle = styled.p`
  font-size: 12px;
  font-weight: 400;
  color: #ccc;
`;
const LoadingMessage = styled.div`
  padding: 20px;
  text-align: center;
`;
const ErrorMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: red;
`;
const ItemContainer = styled.div`
  min-width: 290px;
  width: 100%;
  height: auto;
`;
const ScheduleContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;
const ScheduleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
`;
const IconContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  margin: 30px 20px 0 0;
`;
interface ScheduleItemProps {
  scheduleStatus: 'reserved' | 'inProgress' | 'notStarted';
}
const ScheduleItemContainer = styled.div<ScheduleItemProps>`
  display: flex;
  align-items: flex-start;
  cursor: pointer;
`;
const IconWrapper = styled.div<ScheduleItemProps>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: ${({ scheduleStatus }) =>
    scheduleStatus === 'reserved'
      ? Theme.colors.gray
      : scheduleStatus === 'inProgress'
        ? Theme.colors.yellow
        : Theme.colors.gray4};
  display: flex;
  align-items: center;
  justify-content: center;
`;
const Icon = styled.img`
  width: 24px;
  height: 24px;
`;
const ConnectorLine1 = styled.div`
  border: 1px solid ${Theme.colors.gray4};
  margin: 4px 0;
`;
const ConnectorLine = styled.div`
  border: 2px solid ${Theme.colors.gray4};
  height: 212px;
`;
const ScheduleItem = styled.div`
  background-color: white;
  border: 1px solid ${Theme.colors.gray4};
  flex-grow: 1;
`;
const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 31px 21px 34px 21px;
`;
const SeasonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const Season = styled.span`
  font-weight: 900;
  font-size: 16px;
  line-height: 18px;
`;
const BletIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid ${Theme.colors.gray1};
  margin-left: 10px;
  border-radius: 4px;
`;
const BletIconImg = styled.img`
  width: 20px;
  height: 22px;
`;
const DateWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
const DateTitle = styled.span`
  color: ${Theme.colors.gray2};
  font-weight: 400;
  font-size: 12px;
  line-height: 13px;
  margin-bottom: 10px;
`;
const DateText = styled.span`
  font-weight: 800;
  font-size: 14px;
  line-height: 15px;
`;
const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
`;
const InfoColumn = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 50px;
`;
const MiniTitle = styled.div`
  display: flex;
  font-weight: 700;
  font-size: 10px;
  line-height: 11px;
  padding: 9px 10px;
`;
const BottomBarContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 10px 34px;
  background-color: #eeeeee;
  z-index: 9999;
`;
const OrderButton = styled.button`
  width: 100%;
  height: 56px;
  background-color: black;
  border: none;
  border-radius: 6px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  margin: 0 21px;
`;
const BeenContainer = styled.div`
  height: 100px;
`;
const StatsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;
const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #dddddd;
  margin: 30px 0;
`;
