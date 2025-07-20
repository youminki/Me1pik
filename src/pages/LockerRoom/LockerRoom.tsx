// src/pages/LockerRoom.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import StatsSection from '../../components/LockerRoom/StatsSection';

import LockerRoomIcons from '../../assets/LockerRoomIcons.svg';
import ClosetIcon from '../../assets/LockerRoom/ClosetIcon.svg';
import HistoryIcon from '../../assets/LockerRoom/HistoryIcon.svg';
import PointsIcon from '../../assets/LockerRoom/PointsIcon.svg';
import TicketIcon from '../../assets/LockerRoom/TicketIcon.svg';
import PaymentIcon from '../../assets/LockerRoom/PaymentIcon.svg';
import ReviewIcon from '../../assets/LockerRoom/ReviewIcon.svg';

import {
  getMembershipInfo,
  MembershipInfo,
} from '../../api-utils/user-management/user/userApi';

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
      .catch((err: Error) => {
        console.error('멤버십 정보 조회 실패', err);
      });
  }, []);

  return (
    <Container>
      <Header>
        <Title>락커룸</Title>
        <Subtitle>나에게 맞는 스타일을 찾을 때는 멜픽!</Subtitle>
      </Header>

      <StatsRow>
        <StatsSection
          visits={membership?.name ?? '—'}
          sales='0'
          dateRange='요약정보'
          visitLabel='그룹'
          salesLabel='보유 포인트'
        />
        <MenuIcon src={LockerRoomIcons} alt='메뉴 이미지' />
      </StatsRow>

      <Divider />

      <GridMenu>
        {menuItems.map((item, idx) => (
          <GridItem
            key={idx}
            disabled={item.disabled}
            onClick={() => {
              if (!item.disabled) navigate(item.path);
            }}
          >
            <IconLabelRow>
              <IconImage src={item.icon} alt={item.label} />
              <Label disabled={item.disabled}>{item.label}</Label>
            </IconLabelRow>
            <PickButton disabled={item.disabled}>
              PICK <Arrow>→</Arrow>
            </PickButton>
          </GridItem>
        ))}
      </GridMenu>
    </Container>
  );
};

export default LockerRoom;

// --- Styled Components ---

const Container = styled.div`
  width: 100%;
  padding: 1rem;
  background: #fff;
  box-sizing: border-box;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 6px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 800;
  margin: 0;
  color: #000;
  @media (min-width: 1024px) {
    font-size: 32px;
    margin-bottom: 10px;
  }
`;

const Subtitle = styled.p`
  font-size: 12px;
  line-height: 28px;
  margin: 0;
  color: #cccccc;
  @media (min-width: 1024px) {
    font-size: 16px;
  }
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MenuIcon = styled.img`
  width: 64px;
  height: 58px;
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
  width: 100%;
  margin: auto;

  @media (min-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const GridItem = styled.div<{ disabled?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
  box-sizing: border-box;
  border: 1px solid #ddd;
  background: #fff;
  width: 100%;
  height: 100%;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;

const IconLabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
`;

const IconImage = styled.img`
  object-fit: contain;
`;

const Label = styled.div<{ disabled?: boolean }>`
  font-weight: 700;
  font-size: 14px;
  color: ${({ disabled }) => (disabled ? '#999' : '#000')};
  @media (min-width: 1024px) {
    font-size: 18px;
    margin-left: 1rem;
  }
`;

const PickButton = styled.div<{ disabled?: boolean }>`
  align-self: flex-end;
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border: 1px solid #ccc;
  background: #fafafa;
  font-size: 12px;
  font-weight: 600;
  color: ${({ disabled }) => (disabled ? '#aaa' : '#000')};
  @media (min-width: 1024px) {
    padding: 10px 16px;
    font-size: 14px;
  }
`;

const Arrow = styled.span`
  margin-left: 4px;
`;
