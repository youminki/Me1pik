import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { theme } from '../../styles/theme';
import StatsSection from '../../components/stats-section';

import MelpikIcon from '../../assets/melpiks/MelpikIcon.svg';
import MelpikCreateIcon from '../../assets/melpiks/MelpikCreateIcon.svg';
import MelpikScheduelerIcon from '../../assets/melpiks/MelpikScheduelerIcon.svg';
import MelpikCalculateIcon from '../../assets/melpiks/MelpikCalculateIcon.svg';
import MelpikOptionIcon from '../../assets/melpiks/MelpikOptionIcon.svg';

const menuItems = [
  { icon: MelpikCreateIcon, label: '내 옷장', path: '/create-melpik' },
  { icon: MelpikScheduelerIcon, label: '이용 내역', path: '/sales-schedule' },
  { icon: MelpikCalculateIcon, label: '포인트', path: '/sales-settlement' },
  { icon: MelpikOptionIcon, label: '티켓', path: '/melpik-settings' },
];

const MelpikPage: React.FC = () => {
  const navigate = useNavigate();

  const visits = 174;
  const sales = 26;
  const dateRange = '2025.01.06 ~ 01.10';
  const visitLabel = '방문수';
  const salesLabel = '판매된 제품수';

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Header>
          <Title>멜픽</Title>
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
            <GridItem key={idx} onClick={() => navigate(item.path)}>
              <IconLabelRow>
                <IconImage src={item.icon} alt={item.label} />
                <Label>{item.label}</Label>
              </IconLabelRow>
              <PickButton>
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
  padding: 1rem;
  box-sizing: border-box;
  background: #fff;

  @media (min-width: 1024px) {
    padding: 3rem;
    max-width: 1000px;
    margin: 0 auto;
  }
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
  /* 데스크탑: 3열, 셀 높이는 콘텐츠 기준으로 늘어남 */
  @media (min-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const GridItem = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  padding: 1rem;
  box-sizing: border-box;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;

  /* 셀을 꽉 채우기 위해 높이를 자동으로 늘림 */
  width: 100%;
  height: 100%;
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

const Label = styled.div`
  font-weight: 700;
  font-size: 14px;

  color: #000;
  @media (min-width: 1024px) {
    font-size: 18px;
    margin-left: 1rem;
  }
`;

const PickButton = styled.div`
  align-self: flex-end;
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border: 1px solid #ccc;
  background: #fafafa;
  font-size: 12px;
  font-weight: 600;
  @media (min-width: 1024px) {
    padding: 10px 16px;
    font-size: 14px;
  }
`;

const Arrow = styled.span`
  margin-left: 4px;
`;
