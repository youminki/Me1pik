import React from 'react';
import styled from 'styled-components';

import CheckButtonIcon from '../../assets/Landing/CheckButton.svg';
import SampleImage from '../../assets/Landing/SampleImage5.png';

const LandingPage5: React.FC = () => {
  return (
    <Container>
      <TopSection>
        <BulletIcon>/</BulletIcon>
        <SmallTitle>오직 나만의, 나를 위한 상품</SmallTitle>
        <BigTitle>
          나만의 스타일을
          <br />
          <Highlight>손쉽게 브랜딩</Highlight> 해보세요
        </BigTitle>
      </TopSection>

      <CardWrapper>
        <CardImage src={SampleImage} alt='Sample' />
      </CardWrapper>

      <BulletList>
        <BulletItem>
          <CheckIcon src={CheckButtonIcon} alt='Check' />
          <BulletText>누구라도 판매를 시작할 수 있어요</BulletText>
        </BulletItem>
        <BulletItem>
          <CheckIcon src={CheckButtonIcon} alt='Check' />
          <BulletText>
            프리미엄 <BoldSpan>브랜드의 셀러</BoldSpan>가 되어보세요
          </BulletText>
        </BulletItem>
        <BulletItem>
          <CheckIcon src={CheckButtonIcon} alt='Check' />
          <BulletText>나만의 스타일로 판매 채널을 꾸며보세요</BulletText>
        </BulletItem>
        <BulletItem>
          <CheckIcon src={CheckButtonIcon} alt='Check' />
          <BulletText>판매 스케줄을 간편하게 관리해 보세요</BulletText>
        </BulletItem>
        <BulletItem>
          <CheckIcon src={CheckButtonIcon} alt='Check' />
          <BulletText>매출과 수익을 언제든 확인하세요</BulletText>
        </BulletItem>
      </BulletList>

      <BottomBackground />
    </Container>
  );
};

export default LandingPage5;

const Container = styled.div`
  height: 750px;
  margin: 0 auto;
  background: #fffbf5;
  border-radius: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: -1;
`;

const BulletIcon = styled.div`
  font-size: 35px;
  margin-bottom: 10px;
  color: #ffe8c7;
  transform: rotate(10deg);
`;

const TopSection = styled.div`
  width: 100%;
  text-align: center;
  margin-top: 30px;
  margin-bottom: 20px;
`;

const SmallTitle = styled.div`
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 40px;
  text-align: center;
  color: #000;
  margin-bottom: 8px;
`;

const BigTitle = styled.h1`
  font-weight: 700;
  font-size: 23px;
  line-height: 30px;
  color: #000;
  margin: 0;
`;

const Highlight = styled.span`
  color: #ff7e61;
`;

const CardWrapper = styled.div`
  width: auto;
  display: flex;
  justify-content: center;
  margin-bottom: 18px;
`;

const CardImage = styled.img`
  width: 100%;
  height: auto;
  object-fit: cover;
`;

const BulletList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 auto;
  width: 80%;

  display: flex;
  flex-direction: column;
  margin-right: 20px;
`;

const BulletItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const CheckIcon = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 10px;
`;

const BoldSpan = styled.span`
  font-weight: 800;
`;

const BulletText = styled.span`
  font-style: normal;
  font-weight: 400;
  font-size: 15px;
  line-height: 40px;
  color: #000;
  text-align: left;
`;

const BottomBackground = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 500.5px;
  background: #fff6d4;
  z-index: -1;
  clip-path: path('M0,160 Q360,40 600,110 L600,500.5 L0,500.5 Z');
`;
