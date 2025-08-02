/**
 * 락커룸 페이지 컴포넌트 (LockerRoom.tsx)
 *
 * 사용자의 개인 저장소 및 관리 기능을 제공하는 페이지입니다.
 * 내 옷장, 이용내역, 포인트, 이용권, 결제수단, 상품리뷰 등의
 * 개인 관리 기능에 접근할 수 있는 메뉴를 제공합니다.
 *
 * @description
 * - 락커룸 메인 화면
 * - 개인 통계 정보 표시
 * - 개인 관리 기능 메뉴
 * - 멤버십 정보 표시
 * - 비활성화된 메뉴 처리
 * - 반응형 디자인
 */
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
import StatsSection from '@/components/locker-rooms/StatsSection';
import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';

/**
 * 락커룸 메뉴 아이템 배열
 *
 * 락커룸에서 제공하는 개인 관리 기능들의 메뉴 정보를 정의합니다.
 * 각 메뉴는 아이콘, 라벨, 경로, 비활성화 상태를 포함합니다.
 */
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
        <Header>
          <Title>락커룸</Title>
          <Subtitle>나에게 맞는 스타일을 찾을 때는 멜픽!</Subtitle>
        </Header>

        <StatsRow>
          <StatsSection {...statsData} />
          <MenuIcon src={LockerRoomIcons} alt='메뉴 이미지' />
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
                <Label disabled={item.disabled}>{item.label}</Label>
              </IconLabelRow>
              <PickButton disabled={item.disabled}>
                PICK <Arrow>→</Arrow>
              </PickButton>
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
  padding: 1rem;
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
  border-top: 1px solid #ddd;
  border-left: 1px solid #ddd;
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
