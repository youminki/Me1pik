import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import StatsSection from '../../../components/StatsSection';

type PeriodSectionProps = {
  selectedPeriod: number;
  setSelectedPeriod: (period: number) => void;
};

const PeriodSection: React.FC<PeriodSectionProps> = ({
  selectedPeriod,
  setSelectedPeriod,
}) => {
  return (
    <SettlementHeader>
      <PeriodSelector>
        <PeriodButton
          active={selectedPeriod === 1}
          onClick={() => setSelectedPeriod(1)}
        >
          공지
        </PeriodButton>
        <PeriodButton
          active={selectedPeriod === 2}
          onClick={() => setSelectedPeriod(2)}
        >
          개인정보방침
        </PeriodButton>
        <PeriodButton
          active={selectedPeriod === 3}
          onClick={() => setSelectedPeriod(3)}
        >
          파기절차
        </PeriodButton>
        <PeriodButton
          active={selectedPeriod === 4}
          onClick={() => setSelectedPeriod(4)}
        >
          기타
        </PeriodButton>
      </PeriodSelector>
    </SettlementHeader>
  );
};

const PersonalInformationProcessingPolicy: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const navigate = useNavigate();

  const handleItemClick = () => {
    navigate('/customerService/PersonalInformationProcessingPolicyDetail');
  };

  return (
    <PersonalInformationProcessingPolicyContainer>
      <Header>
        <Title>개인정보처리방침</Title>
        <Subtitle>서비스 이용에 따른 정책을 안내 드립니다.</Subtitle>
      </Header>

      <StatsSection
        visits='999'
        sales='999'
        dateRange='NEW 2025. 03.'
        visitLabel='전체'
        salesLabel='최근 업데이트'
      />
      <Divider />

      <Section>
        <PeriodSection
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
        />

        <PersonalInformationProcessingPolicyListContainer>
          <PersonalInformationProcessingPolicyItem onClick={handleItemClick}>
            <TextWrapper>
              <ItemTitle>
                <BoldText>개인정보방침</BoldText> / 개인정보의 항목 및 수집방법
              </ItemTitle>
              <ItemDate>2025.02.01</ItemDate>
            </TextWrapper>
            <Bullet />
          </PersonalInformationProcessingPolicyItem>

          <PersonalInformationProcessingPolicyItem onClick={handleItemClick}>
            <TextWrapper>
              <ItemTitle>
                <BoldText>개인정보방침</BoldText> / 개인정보의 이용목적
              </ItemTitle>
              <ItemDate>2025.02.01</ItemDate>
            </TextWrapper>
            <Bullet />
          </PersonalInformationProcessingPolicyItem>

          <PersonalInformationProcessingPolicyItem onClick={handleItemClick}>
            <TextWrapper>
              <ItemTitle>
                <BoldText>개인정보방침</BoldText> / 개인정보의 보유 및 이용기간
              </ItemTitle>
              <ItemDate>2025.02.01</ItemDate>
            </TextWrapper>
            <Bullet />
          </PersonalInformationProcessingPolicyItem>

          <PersonalInformationProcessingPolicyItem onClick={handleItemClick}>
            <TextWrapper>
              <ItemTitle>
                <BoldText>개인정보방침</BoldText> / 동의의 거부권 및 거부시
                고지사항
              </ItemTitle>
              <ItemDate>2025.02.01</ItemDate>
            </TextWrapper>
            <Bullet />
          </PersonalInformationProcessingPolicyItem>

          <PersonalInformationProcessingPolicyItem onClick={handleItemClick}>
            <TextWrapper>
              <ItemTitle>
                <BoldText>파기절차</BoldText> / 개인정보의 파기절차 및 방법
              </ItemTitle>
              <ItemDate>2025.02.01</ItemDate>
            </TextWrapper>
            <Bullet />
          </PersonalInformationProcessingPolicyItem>

          <PersonalInformationProcessingPolicyItem onClick={handleItemClick}>
            <TextWrapper>
              <ItemTitle>
                <BoldText>기타</BoldText> / 고지 의무에 따른 안내사항
              </ItemTitle>
              <ItemDate>2025.02.01</ItemDate>
            </TextWrapper>
            <Bullet />
          </PersonalInformationProcessingPolicyItem>
        </PersonalInformationProcessingPolicyListContainer>
      </Section>
    </PersonalInformationProcessingPolicyContainer>
  );
};

export default PersonalInformationProcessingPolicy;

const PersonalInformationProcessingPolicyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  background-color: #fff;
  padding: 1rem;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 6px;
`;

const Title = styled.h1`
  font-weight: 800;
  font-size: 24px;
  line-height: 27px;
  color: #000000;
  margin-bottom: 0px;
`;

const Subtitle = styled.p`
  font-size: 12px;
  font-weight: 400;
  color: #ccc;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #dddddd;
  margin-top: 30px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-bottom: 80px;
  margin-top: 30px;
`;

const SettlementHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f3f3f3;
  border: 1px solid #dddddd;
  padding: 10px;
  white-space: nowrap;
`;

const PeriodSelector = styled.div`
  display: flex;
  flex-shrink: 0;
  margin-right: 10px;
`;

const PeriodButton = styled.button<{ active: boolean }>`
  padding: 8px 12px;

  height: 36px;
  margin-right: 8px;
  border-radius: 18px;

  font-weight: 700;
  font-size: 12px;
  line-height: 11px;
  color: ${({ active }) => (active ? '#fff' : '#000')};
  background: ${({ active }) => (active ? '#000' : '#fff')};
  border: 1px solid ${({ active }) => (active ? '#000' : '#ccc')};
  cursor: pointer;
  white-space: nowrap;
`;

const PersonalInformationProcessingPolicyListContainer = styled.div`
  max-height: 932px;
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  width: 100%;

  margin-top: 10px;

  border: 1px solid #dddddd;
  background: #ffffff;
`;

const PersonalInformationProcessingPolicyItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  min-height: 76px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.96);

  border-bottom: 1px solid #dddddd;
  cursor: pointer;
  &:last-child {
    border-bottom: none;
  }
`;

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;

  white-space: pre-wrap;
  word-break: break-all;
`;

const ItemTitle = styled.div`
  font-weight: 400;
  font-size: 14px;
  line-height: 13px;
  color: #000000;
`;

const ItemDate = styled.div`
  margin-top: 10px;

  font-weight: 400;
  font-size: 12px;
  line-height: 13px;
  color: #aaaaaa;
`;

const BoldText = styled.span`
  font-weight: 800;
  font-size: 14px;
  line-height: 13px;
  color: #000000;
`;

const Bullet = styled.div`
  font-size: 20px;
  color: #cccccc;
  margin: auto 19px auto 0;
  &::before {
    content: '>';
  }
`;
