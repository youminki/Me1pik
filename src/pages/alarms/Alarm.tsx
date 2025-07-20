import React, { useState } from 'react';
import styled from 'styled-components';

import AlarmIcon from '../../assets/AlarmIcon.svg';
import PeriodSection from '../../components/period-section';
import EmptyState from '../../components/shared/EmptyState';

const Alarm: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(6);

  const alarmList = [
    {
      id: 1,
      title: '신청내역 안내',
      date: '2025.02.02',
      content:
        '[ MICHAA ] 브랜드 [ 울 혼방 사이드 디테일 원피스 ] 이며, [ 2025.03.01 ~ 2025.03.04 ] 기간에 이용하실 수 있게 준비하여 발송됩니다.',
    },
    {
      id: 2,
      title: '일정취소 안내',
      date: '2025.02.02',
      content:
        '[ MICHAA ] 브랜드 [ 코튼 혼방 트위드 셋업 ] 이며, [ 2025.03.01 ~ 2025.03.04 ] 기간에 예약하신 일정에 대해 취소요청이 처리가 되었습니다.',
    },
    {
      id: 3,
      title: '신청내역 안내',
      date: '2025.02.02',
      content:
        '[ MICHAA ] 브랜드 [ 코튼 혼방 트위드 셋업 ] 이며, [ 2025.03.01 ~ 2025.03.04 ] 기간에 이용하실 수 있게 준비하여 발송됩니다.',
    },
    {
      id: 4,
      title: '제품반납 안내',
      date: '2025.02.02',
      content:
        '내일은 서비스 회수일 입니다. 이용은 잘 하셨나요? 혹시 서비스 이용 중 불편한 점이 있으셨다면 저희에게 알려주세요. 그리고 제품 회수 진행 시 서비스 매니저 또는 택배기사 님이 연락 드린 후 방문드리기 때문에...',
    },
  ];

  // 알림이 없을 때 EmptyState 처리
  if (alarmList.length === 0) {
    return <EmptyState message='알림이 없습니다.' />;
  }

  return (
    <AlarmContainer>
      <PeriodSection
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
      />

      <AlarmList>
        {alarmList.map((item, index) => (
          <AlarmItem key={item.id}>
            <BulletWrapper>
              <BulletIcon src={AlarmIcon} alt='alarm-icon' />

              {index !== alarmList.length - 1 && <VerticalLine />}
            </BulletWrapper>
            <AlarmContent>
              <AlarmTitle>{item.title}</AlarmTitle>
              <AlarmText>{item.content}</AlarmText>
              <AlarmDate>{item.date}</AlarmDate>
            </AlarmContent>
          </AlarmItem>
        ))}
      </AlarmList>
    </AlarmContainer>
  );
};

export default Alarm;

const AlarmContainer = styled.div`
  margin: 0 auto;
  background-color: #ffffff;
  padding: 1rem;
  position: relative;
`;

const AlarmList = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 30px;
  gap: 30px;
`;

const AlarmItem = styled.div`
  display: flex;
  align-items: stretch;
`;

const BulletWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  margin-right: 16px;
`;

const BulletIcon = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #999999;
`;

const VerticalLine = styled.div`
  flex: 1;
  width: 2px;
  background-color: #eeeeee;
`;

const AlarmContent = styled.div`
  background-color: #ffffff;
  border: 1px solid #eeeeee;
  flex: 1;
  padding: 16px;
  box-sizing: border-box;
`;

const AlarmTitle = styled.div`
  font-weight: 800;
  font-size: 16px;
  line-height: 15px;
  color: #000000;
  margin-bottom: 10px;
`;

const AlarmText = styled.div`
  font-weight: 400;
  font-size: 14px;
  line-height: 18px;
  color: #000000;
  margin-bottom: 10px;
`;

const AlarmDate = styled.div`
  font-weight: 900;
  font-size: 12px;
  line-height: 11px;
  color: #000000;
`;
