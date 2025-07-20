import React from 'react';
import styled, { keyframes } from 'styled-components';

import Ion1Src from '../../assets/landings/LandingPage3_ion1.svg';
import Ion2Src from '../../assets/landings/LandingPage3_ion2.svg';
import SampleJacket from '../../assets/landings/SampleJacket.jpg';

const cycleDuration = '8s';

const LandingPage3: React.FC = () => {
  return (
    <Container>
      <TopSection>
        <BulletIcon>/</BulletIcon>
        <MatchingTitle>AI Matching System </MatchingTitle>
        <MainTitle>
          당신의 스타일을
          <br />
          알아서 매칭해드립니다
        </MainTitle>
      </TopSection>

      <MiddleSection>
        <ImageWrapper>
          <Ion1 src={Ion1Src} alt='아이온1' />
          <Ion2 src={Ion2Src} alt='아이온2' />
          <StyledImage src={SampleJacket} alt='Sample Jacket' />

          <SmallBoxesContainer>
            <SmallBox style={{ top: '200px', right: '110px' }}>
              <SmallBoxText1>당신은 스포티한 스타일입니다</SmallBoxText1>
            </SmallBox>
            <SmallBox2 style={{ top: '245px', right: '135px' }}>
              <SmallBoxText2>활동적인 옷을 좋아하네요</SmallBoxText2>
            </SmallBox2>
            <SmallBox3 style={{ bottom: '50px', left: '120px' }}>
              <SmallBoxText3>블랙&화이트 컬러가 많아요</SmallBoxText3>
            </SmallBox3>
          </SmallBoxesContainer>
        </ImageWrapper>
      </MiddleSection>

      <BottomComment>
        멜픽은 이용자와 브랜드 제품을
        <br />
        분석하는 AI 기반 매칭 서비스 입니다.
      </BottomComment>
    </Container>
  );
};

export default LandingPage3;

const Container = styled.div`
  height: 760px;
  margin: 0 auto;
  background: #fbe5e1;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
`;

const BulletIcon = styled.div`
  font-size: 35px;
  margin-bottom: 10px;
  color: #fff;
  transform: rotate(10deg);
`;

const TopSection = styled.div`
  width: 100%;
  text-align: center;
  margin-top: 30px;
`;

const MatchingTitle = styled.div`
  font-weight: 700;
  font-size: 15px;
  line-height: 40px;
  text-align: center;
  color: #f5ab35;
  margin-bottom: 10px;
`;

const MainTitle = styled.h1`
  font-weight: 700;
  font-size: 23px;
  line-height: 30px;
  text-align: center;
  color: #000000;
`;

const MiddleSection = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 228px;
  height: 400px;
  background: #ececec;
  border: 5px solid #ffffff;
  border-radius: 20px;
`;

const StyledImage = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
`;

const SmallBox = styled.div`
  position: absolute;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  background: #ffffff;
  border-radius: 10px;
  padding: 5px 10px;
`;

const box2Anim = keyframes`
  0%, 25% { opacity: 0; }
  25.1%, 100% { opacity: 1; }
`;

const SmallBox2 = styled(SmallBox)`
  opacity: 0;
  animation: ${box2Anim} ${cycleDuration} steps(1, end) infinite;
`;

const box3Anim = keyframes`
  0%, 50% { opacity: 0; }
  50.1%, 100% { opacity: 1; }
`;

const SmallBox3 = styled(SmallBox)`
  opacity: 0;
  animation: ${box3Anim} ${cycleDuration} steps(1, end) infinite;
`;

const BottomComment = styled.div`
  font-weight: 400;
  font-size: 17px;
  line-height: 23px;
  text-align: center;
  color: #040404;
  margin-top: auto;
  margin-bottom: 43px;
`;

const fadeInLeft = keyframes`
  0% {
    opacity: 0;
    transform: translateX(-30px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
`;

const fadeInRight = keyframes`
  0% {
    opacity: 0;
    transform: translateX(30px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
`;

const Ion1 = styled.img`
  position: absolute;
  top: 30px;
  left: -50px;
  width: 47px;
  height: 36px;
  animation: ${fadeInLeft} 0.8s ease-out forwards;
`;

const Ion2 = styled.img`
  position: absolute;
  bottom: 230px;
  right: -35px;
  width: 47px;
  height: 36px;
  z-index: 1;
  animation: ${fadeInRight} 0.8s ease-out 0.2s forwards;
`;

const blinkCaret = keyframes`
  from, to { border-color: transparent; }
  50% { border-color: #040404; }
`;

const text1Anim = keyframes`
  0% { width: 0; }
  25% { width: 100%; }
  100% { width: 100%; }
`;

const text2Anim = keyframes`
  0%, 25% { width: 0; }
  50% { width: 100%; }
  100% { width: 100%; }
`;

const text3Anim = keyframes`
  0%, 50% { width: 0; }
  75% { width: 100%; }
  100% { width: 100%; }
`;

const SmallBoxText1 = styled.span`
  font-weight: 400;
  font-size: 13px;
  line-height: 23px;
  color: #040404;
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid #040404;
  animation:
    ${text1Anim} ${cycleDuration} steps(30, end) infinite,
    ${blinkCaret} 0.75s step-end infinite;
`;

const SmallBoxText2 = styled.span`
  font-weight: 400;
  font-size: 13px;
  line-height: 23px;
  color: #040404;
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid #040404;
  animation:
    ${text2Anim} ${cycleDuration} steps(30, end) infinite,
    ${blinkCaret} 0.75s step-end infinite;
`;

const SmallBoxText3 = styled.span`
  font-weight: 400;
  font-size: 13px;
  line-height: 23px;
  color: #040404;
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid #040404;
  animation:
    ${text3Anim} ${cycleDuration} steps(30, end) infinite,
    ${blinkCaret} 0.75s step-end infinite;
`;

const SmallBoxesContainer = styled.div`
  position: absolute;
  inset: 0;
`;
