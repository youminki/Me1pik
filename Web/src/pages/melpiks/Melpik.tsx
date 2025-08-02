import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';

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
  { icon: MelpikCreateIcon, label: '멜픽 생성', path: '/create-melpik' },
  { icon: MelpikScheduelerIcon, label: '판매 스케줄', path: '/sales-schedule' },
  { icon: MelpikCalculateIcon, label: '판매 정산', path: '/sales-settlement' },
  { icon: MelpikOptionIcon, label: '멜픽설정', path: '/melpik-settings' },
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
