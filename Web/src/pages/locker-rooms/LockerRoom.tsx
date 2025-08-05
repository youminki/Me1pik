// src/pages/locker-rooms.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import {
  getMembershipInfo,
  MembershipInfo,
} from '@/api-utils/user-managements/users/userApi';
import ClosetIcon from '@/assets/locker-rooms/ClosetIcon.svg';
import HistoryIcon from '@/assets/locker-rooms/HistoryIcon.svg';
import PaymentIcon from '@/assets/locker-rooms/PaymentIcon.svg';
import PointsIcon from '@/assets/locker-rooms/PointsIcon.svg';
import ReviewIcon from '@/assets/locker-rooms/ReviewIcon.svg';
import TicketIcon from '@/assets/locker-rooms/TicketIcon.svg';
import LockerRoomIcons from '@/assets/LockerRoomIcons.svg';
import GridArrowIcon from '@/assets/melpiks/GridArrowIcon.svg';
import StatsSection from '@/components/locker-rooms/StatsSection';
import PageHeader from '@/components/shared/headers/PageHeader';
import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';
import StatsRow from '@/components/shared/StatsRow';

const menuItems = [
  { icon: ClosetIcon, label: '내 옷장', path: '/my-closet', disabled: false },
  {
    icon: HistoryIcon,
    label: '이용내역',
    path: '/usage-history',
    disabled: false,
  },
  { icon: PointsIcon, label: '포인트', path: '/point', disabled: true },
  { icon: TicketIcon, label: '이용권', path: '/my-ticket', disabled: false },
  {
    icon: PaymentIcon,
    label: '결제수단',
    path: '/payment-method',
    disabled: false,
  },
  {
    icon: ReviewIcon,
    label: '상품리뷰',
    path: '/product-review',
    disabled: true,
  },
];

const LockerRoom: React.FC = () => {
  const navigate = useNavigate();
  const [membership, setMembership] = useState<MembershipInfo | null>(null);

  useEffect(() => {
    getMembershipInfo()
      .then((res: MembershipInfo) => {
        setMembership(res);
      })
      .catch(() => {
        // console.error('멤버십 정보 조회 실패', err);
      });
  }, []);

  const handleMenuClick = useCallback(
    (path: string, disabled: boolean) => {
      if (!disabled) {
        navigate(path);
      }
    },
    [navigate]
  );

  const statsData = useMemo(
    () => ({
      visits: membership?.name ?? '—',
      sales: '0',
      dateRange: '요약정보',
      visitLabel: '그룹',
      salesLabel: '보유 포인트',
    }),
    [membership?.name]
  );

  return (
    <>
      <UnifiedHeader variant='default' />
      <Container>
        <PageHeader
          title='락커룸'
          subtitle='나에게 맞는 스타일을 찾을 때는 멜픽!'
        />

        <StatsRow icon={LockerRoomIcons} iconAlt='메뉴 이미지'>
          <StatsSection {...statsData} />
        </StatsRow>

        <Divider />

        <GridMenu>
          {menuItems.map((item, idx) => (
            <GridItem
              key={idx}
              disabled={item.disabled}
              onClick={() => handleMenuClick(item.path, item.disabled)}
            >
              <IconLabelRow>
                <IconImage src={item.icon} alt={item.label} />
                <LabelArrowRow>
                  <Label disabled={item.disabled}>{item.label}</Label>
                  <ArrowIcon src={GridArrowIcon} alt='화살표' />
                </LabelArrowRow>
              </IconLabelRow>
            </GridItem>
          ))}
        </GridMenu>
      </Container>
    </>
  );
};

export default LockerRoom;

// --- Styled Components ---

const Container = styled.div`
  width: 100%;

  background: #fff;
  box-sizing: border-box;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #ddd;
  margin: 20px 0;
`;

const GridMenu = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  box-sizing: border-box;
  @media (min-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    max-width: 600px;
    margin: 0 auto;
    gap: 40px;
    padding: 0 24px;
  }
`;

const GridItem = styled.div<{ disabled?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;

  box-sizing: border-box;
  border: 1px solid #000000;
  border-radius: 4px;
  background: #fff;
  aspect-ratio: 1.5;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
  padding: 1rem;
  @media (min-width: 1024px) {
    aspect-ratio: 1.8;
    padding: 1.5rem;
  }
`;

const IconLabelRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  flex: 1;
`;

const IconImage = styled.img`
  object-fit: contain;
  width: 48px;
  height: 48px;
  @media (min-width: 1024px) {
    width: 64px;
    height: 64px;
  }
`;

const LabelArrowRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const Label = styled.div<{ disabled?: boolean }>`
  font-weight: 400;
  font-size: 14px;
  color: ${({ disabled }) => (disabled ? '#999' : '#000')};
  @media (min-width: 1024px) {
    font-size: 18px;
  }
`;

const ArrowIcon = styled.img`
  width: 16px;
  height: 15px;
  @media (min-width: 1024px) {
    width: 20px;
    height: 19px;
  }
`;
