import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';

import GridArrowIcon from '@/assets/melpiks/GridArrowIcon.svg';
import MelpikCalculateIcon from '@/assets/melpiks/MelpikCalculateIcon.svg';
import MelpikCreateIcon from '@/assets/melpiks/MelpikCreateIcon.svg';
import MelpikIcon from '@/assets/melpiks/MelpikIcon.svg';
import MelpikOptionIcon from '@/assets/melpiks/MelpikOptionIcon.svg';
import MelpikScheduelerIcon from '@/assets/melpiks/MelpikScheduelerIcon.svg';
import PageHeader from '@/components/shared/headers/PageHeader';
import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';
import StatsRow from '@/components/shared/StatsRow';
import StatsSection from '@/components/stats-section';
import { theme } from '@/styles/Theme';

const menuItems = [
  { icon: MelpikCreateIcon, label: '다이어리 생성', path: '/create-melpik' },
  { icon: MelpikOptionIcon, label: '다이어리설정', path: '/melpik-settings' },
  {
    icon: MelpikCalculateIcon,
    label: '정산 내역',
    path: '/sales-settlement',
  },
  { icon: MelpikScheduelerIcon, label: '판매 스케줄', path: '/sales-schedule' },
];

const disabledMenuIndexes = [0, 2]; // 0: 내 옷장, 2: 포인트

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
        <PageHeader
          title='다이어리'
          subtitle='내 채널을 통해 나는 브랜드가 된다'
        />

        <StatsRow icon={MelpikIcon} iconAlt='메뉴 이미지'>
          <StatsSection
            visits={visits}
            sales={sales}
            dateRange={dateRange}
            visitLabel={visitLabel}
            salesLabel={salesLabel}
          />
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
                <LabelArrowRow>
                  <Label $disabled={disabledMenuIndexes.includes(idx)}>
                    {item.label}
                  </Label>
                  <ArrowIcon src={GridArrowIcon} alt='화살표' />
                </LabelArrowRow>
              </IconLabelRow>{' '}
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
    max-width: 600px;
    margin: 0 auto;
    gap: 40px;
  }
`;

const GridItem = styled.div<{ $disabled?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;

  box-sizing: border-box;
  border: 1px solid #000000;
  border-radius: 4px;
  background: #fff;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  aspect-ratio: 1.5;
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
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

const LabelArrowRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
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

const Label = styled.div<{ $disabled?: boolean }>`
  font-weight: 400;
  font-size: 14px;
  color: ${({ $disabled }) => ($disabled ? '#aaa' : '#000')};
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
