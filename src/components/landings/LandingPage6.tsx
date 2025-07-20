import React from 'react';
import styled, { keyframes } from 'styled-components';

import backgroundImage from '../../assets/Landing/7X5A9526.jpg';
import IconLeft from '../../assets/Landing/LandingPage6_icon1.svg';
import IconRight from '../../assets/Landing/LandingPage6_icon2.svg';

const LandingPage6: React.FC = () => {
  return (
    <Container>
      <IconLeftImg src={IconLeft} alt='왼쪽 아이콘' />

      <IconRightImg src={IconRight} alt='오른쪽 아이콘' />

      <TextWrapper>
        <SmallTitle>이제는 일일이 찾지 마세요</SmallTitle>
        <BigTitle>
          브랜드는 멜픽이 <br />
          <PickText>PICK!</PickText> 해줄게요
        </BigTitle>
      </TextWrapper>
    </Container>
  );
};

export default LandingPage6;

const flickerLeft = keyframes`
  0%   { opacity: 1;   transform: scale(1) rotate(0deg);   }
  5%   { opacity: 0.6; transform: scale(1.02) rotate(-1deg); }
  10%  { opacity: 1;   transform: scale(1) rotate(0deg);   }
  25%  { opacity: 0.3; transform: scale(0.95) rotate(2deg); }
  30%  { opacity: 0.9; transform: scale(1) rotate(0deg);   }
  40%  { opacity: 0.5; transform: scale(1.03) rotate(-2deg);}
  50%  { opacity: 1;   transform: scale(1) rotate(0deg);   }
  60%  { opacity: 0.7; transform: scale(1.05) rotate(1deg); }
  70%  { opacity: 1;   transform: scale(1) rotate(0deg);   }
  85%  { opacity: 0.2; transform: scale(0.98) rotate(-1deg);}
  90%  { opacity: 0.8; transform: scale(1) rotate(0deg);   }
  100% { opacity: 1;   transform: scale(1) rotate(0deg);   }
`;

const flickerRight = keyframes`
  0%   { opacity: 1;   transform: scale(1) rotate(0deg);   }
  10%  { opacity: 0.4; transform: scale(0.98) rotate(1deg); }
  15%  { opacity: 1;   transform: scale(1) rotate(0deg);   }
  25%  { opacity: 0.5; transform: scale(1.04) rotate(-2deg);}
  35%  { opacity: 1;   transform: scale(1) rotate(0deg);   }
  50%  { opacity: 0.3; transform: scale(0.95) rotate(2deg); }
  55%  { opacity: 1;   transform: scale(1) rotate(0deg);   }
  65%  { opacity: 0.6; transform: scale(1.03) rotate(-1deg);}
  75%  { opacity: 1;   transform: scale(1) rotate(0deg);   }
  85%  { opacity: 0.4; transform: scale(1.02) rotate(1deg); }
  90%  { opacity: 1;   transform: scale(1) rotate(0deg);   }
  100% { opacity: 1;   transform: scale(1) rotate(0deg);   }
`;

const Container = styled.div`
  height: 700px;
  margin: 0 auto;

  background: url(${backgroundImage}) no-repeat center center;
  background-size: cover;

  border-radius: 20px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  padding-top: 59px;

  position: relative;
`;

const IconLeftImg = styled.img`
  position: absolute;
  top: 30%;
  left: 60px;
  transform: translateY(-50%);

  animation: ${flickerLeft} 5s infinite ease-in-out 1s;
`;

const IconRightImg = styled.img`
  position: absolute;
  top: 40%;
  right: 55px;
  transform: translateY(-50%);

  animation: ${flickerRight} 6s infinite ease-in-out 0.5s;
`;

const TextWrapper = styled.div`
  width: 100%;
  text-align: center;
`;

const SmallTitle = styled.div`
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 15px;
  text-align: center;

  color: #000000;
  margin-bottom: 20px;
`;

const BigTitle = styled.h1`
  font-style: normal;
  font-weight: 700;
  font-size: 24px;
  line-height: 30px;
  text-align: center;

  color: #000000;
  margin: 0;
`;

const PickText = styled.span`
  font-style: normal;
  font-weight: 900;
  font-size: 24px;
  line-height: 30px;
  text-align: center;

  color: #fd8a2f;
`;
