import React from 'react';
import styled from 'styled-components';

const LandingPage2: React.FC = () => {
  return (
    <Container>
      <TopTextWrapper>
        <BulletIcon>/</BulletIcon>

        <IntroLabel>멜픽 서비스를 소개합니다</IntroLabel>
        <MainTitle>
          대여와 구매, 판매
          <span className='blackText'>
            까지 <br /> 모두 멜픽에서 한 번에!
          </span>
        </MainTitle>
        <SubTitle>원하는 브랜드로 다양한 경험을 즐겨보세요</SubTitle>
      </TopTextWrapper>

      <FeaturesWrapper>
        <FeatureBox
          bgColor='#FF8738'
          textColor='#FFFFFF'
          borderRadius='20px 0 0 0'
          style={{ marginLeft: 0 }}
        >
          <Circle borderColor='#E66008'>
            <CircleText>대여</CircleText>
          </Circle>
          <BoxText>
            당신의 <span className='highlight'>스타일을 AI가 분석</span>하여
            <br />
            취향저격 스타일을 추천해드려요
          </BoxText>
        </FeatureBox>

        <PlusSign1 style={{ top: '100px' }}>+</PlusSign1>

        <FeatureBox
          bgColor='#FFFFFF'
          textColor='#000000'
          borderRadius='0'
          border='1px solid #DDDDDD'
          style={{ marginLeft: '15px' }}
        >
          <Circle borderColor='#EEEEEE'>
            <CircleText>구매</CircleText>
          </Circle>
          <BoxText>
            브랜드를 다양하게 즐긴 후
            <br />
            맘에 드는 제품을 <span className='get-highlight'>Get</span> 해보세요
          </BoxText>
        </FeatureBox>

        <PlusSign2 style={{ top: '220px' }}>+</PlusSign2>

        <FeatureBox
          bgColor='#FFD238'
          textColor='#000000'
          borderRadius='0 0 20px 0'
          style={{ marginLeft: 0 }}
        >
          <Circle borderColor='#F1BB02'>
            <CircleText>판매</CircleText>
          </Circle>
          <BoxText>
            나만의 스타일을 <span className='sns-highlight'>내 SNS 채널</span>에
            <br />
            브랜딩 하고 판매 해보세요
          </BoxText>
        </FeatureBox>
      </FeaturesWrapper>
    </Container>
  );
};

export default LandingPage2;

const Container = styled.div`
  background: #ffffff;
  border-radius: 10px;
  margin: 0 auto;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 20px;
`;

const TopTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  text-align: center;
  margin-bottom: 30px;
`;

const BulletIcon = styled.div`
  font-size: 35px;
  margin-top: 22px;
  margin-bottom: 22px;
  transform: rotate(10deg);
`;

const IntroLabel = styled.div`
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 15px;
  color: #000000;
  margin-bottom: 10px;
`;

const MainTitle = styled.h1`
  font-style: normal;
  font-weight: 700;
  font-size: 24px;
  line-height: 30px;
  text-align: center;
  color: #ff8738;
  margin: 0;
  margin-bottom: 10px;

  .blackText {
    color: #000;
  }
`;

const SubTitle = styled.div`
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 30px;
  color: #cccccc;
`;

const FeaturesWrapper = styled.div`
  position: relative;

  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FeatureBox = styled.div<{
  bgColor: string;
  textColor: string;
  borderRadius: string;
  border?: string;
}>`
  height: 120px;

  background: ${({ bgColor }) => bgColor};
  border-radius: ${({ borderRadius }) => borderRadius};
  border: ${({ border }) => border || 'none'};
  margin: 0 auto;

  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
  color: ${({ textColor }) => textColor};
`;

const Circle = styled.div<{ borderColor: string }>`
  width: 59px;
  height: 59px;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid ${({ borderColor }) => borderColor};

  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
`;

const CircleText = styled.div`
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 18px;
  color: #000000;
`;

const BoxText = styled.div`
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;

  .highlight {
    font-weight: 800;
  }
  .get-highlight {
    font-weight: 900;
    color: #ff8738;
  }
  .sns-highlight {
    font-weight: 800;
  }
`;

const PlusSign1 = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-100%);
  width: 30px;
  height: 30px;
  background: #ff8738;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  z-index: 10;
`;

const PlusSign2 = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 30px;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: #ff8738;
  z-index: 10;
`;
