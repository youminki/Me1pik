import React, { useState } from 'react';
import styled from 'styled-components';
import StatsSection from '../../../components/StatsSection';

type FaqItem = {
  id: number;
  category: string;
  question: string;
  answer: string;
};

const FAQ_DATA: FaqItem[] = [
  {
    id: 1,
    category: '서비스 - 포인트',
    question: '멜픽서비스의 포인트는 어떻게 사용하나요?',
    answer:
      '포인트는 일반 대여 또는 제품을 구매하는 데 사용하실 수 있고, 결제 페이지 - 포인트 입력란을 통해 사용하시면 됩니다.',
  },
  {
    id: 2,
    category: '서비스 - 이용방법',
    question: '멜픽서비스의 포인트는 어떻게 사용하나요?',
    answer: '서비스 이용 방법에 대한 답변을 여기에 작성하세요.',
  },
  {
    id: 3,
    category: '주문 - 예약변경',
    question: '대여 신청한 제품의 수령 주소지를 변경하는 방법은?',
    answer: '주문/예약 변경 관련 답변을 여기에 작성하세요.',
  },
  {
    id: 4,
    category: '결제 - 카드결제',
    question: '제품구매 시 할부 개월을 변경하는 방법은?',
    answer:
      '카드결제 시 할부 개월 수 변경 방법에 대한 답변을 여기에 작성하세요.',
  },
  {
    id: 5,
    category: '결제 - 무통장 입금',
    question: '무통장 입금으로 선택 후 현금영수증을 요청 하는 방법은?',
    answer:
      '무통장 입금 시 현금영수증 발행 방법에 대한 답변을 여기에 작성하세요.',
  },
];

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
          전체
        </PeriodButton>
        <PeriodButton
          active={selectedPeriod === 2}
          onClick={() => setSelectedPeriod(2)}
        >
          서비스
        </PeriodButton>
        <PeriodButton
          active={selectedPeriod === 3}
          onClick={() => setSelectedPeriod(3)}
        >
          주문/결제
        </PeriodButton>
        <PeriodButton
          active={selectedPeriod === 4}
          onClick={() => setSelectedPeriod(4)}
        >
          배송/반품
        </PeriodButton>
        <PeriodButton
          active={selectedPeriod === 5}
          onClick={() => setSelectedPeriod(5)}
        >
          이용권
        </PeriodButton>
      </PeriodSelector>
    </SettlementHeader>
  );
};

const FrequentlyAskedQuestions: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(1);

  const toggleItem = (index: number) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <FrequentlyAskedQuestionsContainer>
      <Header>
        <Title>자주묻는질문</Title>
        <Subtitle>새로운 소식 및 서비스 안내를 드립니다.</Subtitle>
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

        <FrequentlyAskedQuestionsListContainer>
          {FAQ_DATA.map((faq, index) => (
            <FaqItemContainer key={faq.id}>
              <QuestionWrapper onClick={() => toggleItem(index)}>
                <QuestionText>
                  <Row>
                    <QPrefix>Q.</QPrefix>
                    <QuestionLabel>{faq.question}</QuestionLabel>
                  </Row>

                  <CategoryLabel>{faq.category}</CategoryLabel>
                </QuestionText>

                <ArrowIcon isOpen={openIndex === index} />
              </QuestionWrapper>

              <AnswerWrapper
                isOpen={openIndex === index}
                className='transition-all duration-500 ease-in-out'
              >
                <AnswerInner className='opacity-100'>{faq.answer}</AnswerInner>
              </AnswerWrapper>
            </FaqItemContainer>
          ))}
        </FrequentlyAskedQuestionsListContainer>
      </Section>
    </FrequentlyAskedQuestionsContainer>
  );
};

export default FrequentlyAskedQuestions;

const FrequentlyAskedQuestionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  background-color: #fff;
  padding: 1rem;
`;

const Header = styled.div`
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

const FrequentlyAskedQuestionsListContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  border: 1px solid #dddddd;
`;

const FaqItemContainer = styled.div`
  background-color: #ffffff;
  border-bottom: 1px solid #dddddd;

  &:last-child {
    border-bottom: none;
  }
`;

const QuestionWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px;
  cursor: pointer;
`;

const QuestionText = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Row = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 4px;
`;

const QPrefix = styled.span`
  font-weight: 800;
  margin-right: 6px;
  font-size: 14px;
`;

const QuestionLabel = styled.span`
  font-weight: 700;
  font-size: 14px;
  color: #000;
`;

const CategoryLabel = styled.span`
  margin-top: 2px;
  font-weight: 800;
  font-size: 12px;
  color: #f6ae24;
`;

type ArrowIconProps = {
  isOpen: boolean;
};

const ArrowIcon = styled.div<ArrowIconProps>`
  width: 10px;
  height: 10px;
  border-right: 2px solid #ccc;
  border-bottom: 2px solid #ccc;

  transform: ${({ isOpen }) => (isOpen ? 'rotate(-135deg)' : 'rotate(45deg)')};
  transition: transform 0.3s ease-in-out;
`;

const AnswerWrapper = styled.div<{ isOpen: boolean }>`
  overflow: hidden;
  max-height: ${({ isOpen }) => (isOpen ? '300px' : '0')};
  transition: max-height 0.4s ease-in-out;
  background: #eeeeee;

  border-top: 1px solid #dddddd;
`;

const AnswerInner = styled.div`
  padding: 16px;
  font-size: 14px;
  color: #555;
  line-height: 1.4;
`;
