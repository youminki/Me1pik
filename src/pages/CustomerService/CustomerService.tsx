import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Theme from '../../styles/Theme';
import StatsSection from '../../components/StatsSection';

import CustomerServiceIcon from '../../assets/CustomerServiceIcons.svg';
import FrequentlyAskedQuestionsBox from '../../assets/CustomerService/FrequentlyAskedQuestions.svg';
import NoticeBox from '../../assets/CustomerService/Notice.svg';
import PersonalInformationProcessingPolicyBox from '../../assets/CustomerService/PersonalInformationProcessingPolicy.svg';
import TermsAndConditionsOfUseBox from '../../assets/CustomerService/TermsAndConditionsOfUse.svg';

const menuItems = [
  { icon: NoticeBox, label: '공지사항', path: '/CustomerService/Notice' },
  {
    icon: FrequentlyAskedQuestionsBox,
    label: '자주 묻는 질문',
    path: '/CustomerService/FrequentlyAskedQuestions',
  },
  {
    icon: TermsAndConditionsOfUseBox,
    label: '이용약관',
    path: '/CustomerService/TermsAndConditionsOfUse',
  },
  {
    icon: PersonalInformationProcessingPolicyBox,
    label: '개인정보처리방침',
    path: '/CustomerService/PersonalInformationProcessingPolicy',
  },
];

const CustomerService: React.FC = () => {
  const navigate = useNavigate();
  return (
    <ThemeProvider theme={Theme}>
      <Container>
        <Header>
          <Title>고객센터</Title>
          <Subtitle>새로운 소식 및 서비스 안내를 드립니다.</Subtitle>
        </Header>

        <StatsRow>
          <StatsSection
            visits='999'
            sales='999'
            dateRange='NEW 2025. 03.'
            visitLabel='공지사항'
            salesLabel='자주 묻는 질문'
          />
          <Icon src={CustomerServiceIcon} alt='고객센터 아이콘' />
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

export default CustomerService;

const Container = styled.div`
  width: 100%;
  padding: 1rem;
  background: #fff;
  box-sizing: border-box;
  @media (min-width: 1024px) {
    padding: 3rem;
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
const Icon = styled.img`
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
