import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';

import FrequentlyAskedQuestionsBox from '@/assets/customer-services/FrequentlyAskedQuestions.svg';
import NoticeBox from '@/assets/customer-services/Notice.svg';
import PersonalInformationProcessingPolicyBox from '@/assets/customer-services/PersonalInformationProcessingPolicy.svg';
import TermsAndConditionsOfUseBox from '@/assets/customer-services/TermsAndConditionsOfUse.svg';
import CustomerServiceIcon from '@/assets/CustomerServiceIcons.svg';
import GridArrowIcon from '@/assets/melpiks/GridArrowIcon.svg';
import PageHeader from '@/components/shared/headers/PageHeader';
import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';
import StatsRow from '@/components/shared/StatsRow';
import StatsSection from '@/components/stats-section';
import { theme } from '@/styles/Theme';

const menuItems = [
  { icon: NoticeBox, label: '공지사항', path: '/customerService/notice' },
  {
    icon: FrequentlyAskedQuestionsBox,
    label: '자주 묻는 질문',
    path: '/customerService/faq',
  },
  {
    icon: TermsAndConditionsOfUseBox,
    label: '이용약관',
    path: '/customerService/terms',
  },
  {
    icon: PersonalInformationProcessingPolicyBox,
    label: '개인정보처리방침',
    path: '/customerService/privacy',
  },
];

const CustomerService: React.FC = () => {
  const navigate = useNavigate();
  return (
    <ThemeProvider theme={theme}>
      <UnifiedHeader variant='default' />
      <Container>
        <PageHeader
          title='고객센터'
          subtitle='새로운 소식 및 서비스 안내를 드립니다.'
        />

        <StatsRow icon={CustomerServiceIcon} iconAlt='고객센터 아이콘'>
          <StatsSection
            visits='999'
            sales='999'
            dateRange='NEW 2025. 03.'
            visitLabel='공지사항'
            salesLabel='자주 묻는 질문'
          />
        </StatsRow>

        <Divider />

        <GridMenu>
          {menuItems.map((item, idx) => (
            <GridItem key={idx} onClick={() => navigate(item.path)}>
              <IconLabelRow>
                <IconImage src={item.icon} alt={item.label} />
                <LabelArrowRow>
                  <Label>{item.label}</Label>
                  <ArrowIcon src={GridArrowIcon} alt='화살표' />
                </LabelArrowRow>
              </IconLabelRow>
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
  width: 100%;
  @media (min-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    max-width: 600px;
    margin: 0 auto;
    gap: 40px;
  }
`;

const GridItem = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;

  box-sizing: border-box;
  border: 1px solid #000000;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  width: 100%;
  aspect-ratio: 1.5;
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

const Label = styled.div`
  font-weight: 400;
  font-size: 14px;
  color: #000;
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
