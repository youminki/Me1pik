import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';

import MelpikCalculateIcon from '@/assets/melpiks/MelpikCalculateIcon.svg';
import MelpikCreateIcon from '@/assets/melpiks/MelpikCreateIcon.svg';
import MelpikIcon from '@/assets/melpiks/MelpikIcon.svg';
import MelpikOptionIcon from '@/assets/melpiks/MelpikOptionIcon.svg';
import MelpikScheduelerIcon from '@/assets/melpiks/MelpikScheduelerIcon.svg';
import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';
import StatsSection from '@/components/stats-section';
import { theme } from '@/styles/Theme';

/**
 * 멜픽 다이어리 페이지 컴포넌트 (Melpik.tsx)
 *
 * 사용자의 멜픽 다이어리 메인 페이지를 제공합니다.
 * 멜픽 생성, 판매 스케줄, 판매 정산, 멜픽 설정 등의
 * 기능에 접근할 수 있는 메뉴를 제공합니다.
 *
 * @description
 * - 멜픽 다이어리 메인 화면
 * - 통계 정보 표시 (방문수, 판매수)
 * - 멜픽 관련 기능 메뉴
 * - 비활성화된 메뉴 처리
 * - 반응형 디자인
 */

/**
 * 멜픽 메뉴 아이템 배열
 *
 * 멜픽 다이어리에서 제공하는 주요 기능들의 메뉴 정보를 정의합니다.
 * 각 메뉴는 아이콘, 라벨, 경로를 포함합니다.
 */
const menuItems = [
  { icon: MelpikCreateIcon, label: '멜픽 생성', path: '/create-melpik' },
  { icon: MelpikScheduelerIcon, label: '판매 스케줄', path: '/sales-schedule' },
  { icon: MelpikCalculateIcon, label: '판매 정산', path: '/sales-settlement' },
  { icon: MelpikOptionIcon, label: '멜픽설정', path: '/melpik-settings' },
];

/**
 * 비활성화된 메뉴 인덱스 배열
 *
 * 현재 개발 중이거나 사용할 수 없는 메뉴들의 인덱스를 정의합니다.
 * 0: 멜픽 생성, 2: 판매 정산
 */
const disabledMenuIndexes = [0, 2]; // 0: 멜픽 생성, 2: 판매 정산

const MelpikPage: React.FC = () => {
  const navigate = useNavigate();

  const visits = 174;
  const sales = 26;
  const dateRange = '2025.01.06 ~ 01.10';
  const visitLabel = '방문수';
  const salesLabel = '판매된 제품수';

  return (
    <ThemeProvider theme={theme}>
      <UnifiedHeader variant='default' />
      <Container>
        <Header>
          <Title>다이어리</Title>
          <Subtitle>내 채널을 통해 나는 브랜드가 된다</Subtitle>
        </Header>

        <StatsRow>
          <StatsSection
            visits={visits}
            sales={sales}
            dateRange={dateRange}
            visitLabel={visitLabel}
            salesLabel={salesLabel}
          />
          <MenuImageWrapper>
            <MenuImage src={MelpikIcon} alt='메뉴 이미지' />
          </MenuImageWrapper>
        </StatsRow>

        <Divider />

        <GridMenu>
          {menuItems.map((item, idx) => (
            <GridItem
              key={idx}
              onClick={
                disabledMenuIndexes.includes(idx)
                  ? undefined
                  : () => navigate(item.path)
              }
              $disabled={disabledMenuIndexes.includes(idx)}
            >
              <IconLabelRow>
                <IconImage src={item.icon} alt={item.label} />
                <Label $disabled={disabledMenuIndexes.includes(idx)}>
                  {item.label}
                </Label>
              </IconLabelRow>
              <PickButton $disabled={disabledMenuIndexes.includes(idx)}>
                PICK <Arrow>→</Arrow>
              </PickButton>
            </GridItem>
          ))}
        </GridMenu>
      </Container>
    </ThemeProvider>
  );
};

export default MelpikPage;

const Container = styled.div`
  width: 100%;

  box-sizing: border-box;
  background: #fff;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 6px;

  @media (min-width: 1024px) {
    margin-bottom: 24px;
  }
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

const MenuImageWrapper = styled.div`
  flex-shrink: 0;
`;

const MenuImage = styled.img`
  width: 64px;
  height: auto;
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
  @media (min-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const GridItem = styled.div<{ $disabled?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  box-sizing: border-box;
  border: 1px solid #ddd;
  background: #fff;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  width: 100%;
  height: 100%;
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
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

const Label = styled.div<{ $disabled?: boolean }>`
  font-weight: 700;
  font-size: 14px;
  color: ${({ $disabled }) => ($disabled ? '#aaa' : '#000')};
  @media (min-width: 1024px) {
    font-size: 18px;
    margin-left: 1rem;
  }
`;

const PickButton = styled.div<{ $disabled?: boolean }>`
  align-self: flex-end;
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-top: 1px solid #ddd;
  border-left: 1px solid #ddd;
  background: #fafafa;
  font-size: 12px;
  font-weight: 600;
  color: ${({ $disabled }) => ($disabled ? '#aaa' : '#222')};
  @media (min-width: 1024px) {
    padding: 10px 16px;
    font-size: 14px;
  }
`;

const Arrow = styled.span`
  margin-left: 4px;
`;
