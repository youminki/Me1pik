// src/components/Link.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import phoneMock from '../assets/links/phone-mock.png';
import melpikLogo from '../assets/links/melpik-logo.svg';
import couponCard from '../assets/links/couponCard.svg';
import CheckIcon from '../assets/links/CheckIcon.svg';

const Link: React.FC = () => {
  const navigate = useNavigate();

  // 복사할 코드(예시)
  const couponCode = 'ABC2QWR345';

  // 복사 상태 관리
  const [isCopied, setIsCopied] = useState(false);

  // 클립보드 복사 함수
  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode).then(() => {
      setIsCopied(true);
      // 2초 후에 원래 상태로 돌려놓고 싶다면 아래 주석 해제
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    });
  };

  return (
    <Container>
      {/* ─── 히어로 섹션 ───────────────────────────────────────────────────────────────────── */}
      <Hero>
        <PhoneContainer>
          <PhoneImage src={phoneMock} alt='phone mock' />
          <Bubble style={{ top: '48%', left: '10%' }}>
            나도 이제 프리미엄 브랜드 셀러!
          </Bubble>
          <Bubble style={{ top: '60%', left: '20%' }}>
            나만의 스타일을 손쉽게 브랜딩
          </Bubble>
        </PhoneContainer>

        <HeroText>
          <Title>
            당신의 스타일을 <br />
            <Highlight>알아서 매칭</Highlight>해 드립니다
          </Title>
          <SubTitle>AI기반 브랜드 매칭 서비스 멜픽</SubTitle>
          <Logo src={melpikLogo} alt='melpik logo' />
        </HeroText>
      </Hero>

      {/* ─── 기능 소개 섹션 ───────────────────────────────────────────────────────────────── */}
      <FeatureSection>
        <FeatureTitle>
          브랜드를{' '}
          <YellowHighlight>
            <DotChar>구</DotChar>
            <DotChar>독</DotChar>
          </YellowHighlight>
          하다
        </FeatureTitle>
        <FeatureSubtitle>
          <PinkHighlight>구매와 판매, 대여</PinkHighlight>까지
          <br /> <MiddleHighlight>모두 멜픽에서 한 번에!</MiddleHighlight>
        </FeatureSubtitle>
        <FeatureList>
          <FeatureItem>
            <CheckIconImage src={CheckIcon} alt='check icon' />
            <SevenHighlight>AI가 분석</SevenHighlight>해주는 나만의 맞춤형
            스타일
          </FeatureItem>
          <FeatureItem>
            <CheckIconImage src={CheckIcon} alt='check icon' />
            컨템포러리 브랜드를 다양하게 즐긴 후
            <SevenHighlight> 구매까지</SevenHighlight>
          </FeatureItem>
          <FeatureItem>
            <CheckIconImage src={CheckIcon} alt='check icon' />
            나만의 스타일을 브랜딩하여
            <SevenHighlight> SNS에 판매</SevenHighlight>
          </FeatureItem>
        </FeatureList>
      </FeatureSection>

      {/* ─── 카드 & 구독 섹션 ───────────────────────────────────────────────────────────────── */}
      <CardSection>
        <CardWrapper>
          <CardText>
            <CardTitle>지금 받을 수 있는</CardTitle>
            <CardHighlight>신규 회원 더블 혜택</CardHighlight>
            <CardDesc>
              지금 멜픽을 구독하면 <br />
              10% 할인 멤버십에서 <PinkHighlight>10% 추가할인</PinkHighlight>
              까지!
            </CardDesc>
          </CardText>
          <CouponImage src={couponCard} alt='membership coupon' />
        </CardWrapper>

        {/* ─── 코드 입력 레이블 + 읽기 전용 인풋 + 복사 버튼 ─────────────────────────────── */}
        <CodeInputRow>
          <CodeLabel>코드 입력</CodeLabel>
          <InputContainer>
            <CodeInput type='text' value={couponCode} readOnly />
            <CopyButton copied={isCopied} onClick={handleCopy}>
              {isCopied ? '복사됨' : '복사'}
            </CopyButton>
          </InputContainer>
        </CodeInputRow>
        {/* ──────────────────────────────────────────────────────────────────────────────── */}

        <SubscribeButton onClick={() => navigate('/landing')}>
          멜픽 구독하러 가기
        </SubscribeButton>
      </CardSection>
    </Container>
  );
};

export default Link;

// ===== Styled Components =====

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 5rem 1rem;
  background-color: #f6efe5;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Hero = styled.section`
  position: relative;
  width: 100%;
  height: 360px;
  margin-bottom: 40px;
`;

const PhoneContainer = styled.div`
  position: absolute;
  left: 50%;
  top: 25%;
  transform: translateX(-50%);
`;

const PhoneImage = styled.img`
  width: 100vw;
  max-width: 500px;
`;

const Bubble = styled.div`
  position: absolute;
  padding: 8px 12px;
  background: #ffffff;
  border-radius: 10px;
  font-size: 0.875rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const HeroText = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  text-align: right;
  max-width: calc(100% - 100px);
  padding-right: 20px;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 400;
  margin: 0 0 8px;
  color: #333;
  line-height: 1.2;
`;

const Highlight = styled.span`
  color: #000;
  font-weight: 800;
`;

const DotChar = styled.span`
  position: relative;
  display: inline-block;
  &::before {
    content: '';
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 12px;
    height: 12px;
    background: #f6ac36;
    border-radius: 50%;
  }
`;

const YellowHighlight = styled.span`
  color: #f6ac36;
  font-weight: 800;
  font-size: 2.5rem;
`;

const PinkHighlight = styled.span`
  color: #fd7f61;
  font-weight: 800;
`;

const SevenHighlight = styled.span`
  color: #000;
  font-weight: 700;
  margin-left: 2px;
`;

const MiddleHighlight = styled.span`
  color: #000000;
  font-weight: 400;
  font-size: 1.7rem;
  line-height: 1.5;
`;

const SubTitle = styled.h2`
  font-size: 0.8rem;
  font-weight: 500;
  color: #555;
`;

const Logo = styled.img`
  width: 120px;
  @media (min-width: 600px) {
    width: 180px;
  }
`;

const FeatureSection = styled.section`
  width: 100%;
  text-align: center;
  margin-bottom: 40px;
`;

const FeatureTitle = styled.h3`
  font-size: 1.7rem;
  font-weight: 400;
  margin-bottom: 40px;
`;

const FeatureSubtitle = styled.p`
  font-size: 1.5rem;
  color: #666;
  margin-bottom: 24px;
  font-weight: 400;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 auto;
  max-width: 360px;
  text-align: left;
  letter-spacing: normal;
  line-height: 1.5;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 0.95rem;
  color: #444;
`;

const CheckIconImage = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 8px;
`;

const CardSection = styled.section`
  background: #fff;
  border-top-right-radius: 30px;
  margin: auto;
  padding: 40px;

  @media (min-width: 600px) {
    padding: 60px;
  }
`;

const CardWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  text-align: center;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
`;

const CardText = styled.div`
  display: flex;
  flex-direction: column;
`;

const CardTitle = styled.span`
  font-size: 1.3rem;
  color: #000;
`;

const CardHighlight = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 4px 0 8px;
  color: #333;
`;

const CardDesc = styled.p`
  font-size: 1rem;
  color: #000;
  line-height: 1.4;

  strong {
    color: #f36;
  }
`;

const CouponImage = styled.img`
  width: 100%;
  max-width: 300px;
`;

/* ─── 멜픽 구독 코드 입력란 레이블 + 인풋 + 복사 버튼 ───────────────────────────── */
const CodeInputRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const CodeLabel = styled.label`
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  width: 80px;
  text-align: left;
`;

const InputContainer = styled.div`
  position: relative;
  max-width: 400px;
`;

const CodeInput = styled.input`
  height: 48px;
  padding: 0 48px 0 12px; /* 오른쪽에 복사 버튼 공간 확보 */
  font-size: 1.3rem;
  border: 1px solid #000000;
  border-radius: 4px;
  outline: none;
  background-color: #fdfdfd;
  font-weight: 400;
  line-height: 45px;
  letter-spacing: -0.5px;
  color: #282828;

  &::placeholder {
    color: #999;
  }

  &:focus {
    border-color: #f6ac36;
    box-shadow: 0 0 0 2px rgba(246, 172, 54, 0.2);
  }

  @media (max-width: 600px) {
    font-size: 1rem;
  }
`;

/**
 * CopyButton에 `copied`라는 boolean prop을 받아서
 * 복사 완료 시 배경색을 바꿔줍니다.
 */
const CopyButton = styled.button<{ copied: boolean }>`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  height: 32px;
  padding: 0 12px;
  font-size: 0.875rem;
  font-weight: 700;
  background-color: ${({ copied }) => (copied ? '#4caf50' : '#282828')};
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background-color 0.2s,
    opacity 0.1s;

  &:hover {
    opacity: 0.8;
  }
  &:active {
    opacity: 0.6;
  }
`;
/* ────────────────────────────────────────────────────────────────────────── */

const SubscribeButton = styled.button`
  width: 100%;
  height: 48px;
  background: #282828;
  color: #fff;
  font-weight: 800;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  transition: transform 0.1s;

  &:hover {
    transform: scale(1.03);
  }
  &:active {
    transform: scale(0.97);
  }
`;
