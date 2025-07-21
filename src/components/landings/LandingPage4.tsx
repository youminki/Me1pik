import React from 'react';
import styled, { keyframes } from 'styled-components';

import CC_Collect from '@/assets/landings/CC_Collect.jpg';
import DEW_L from '@/assets/landings/DEW_L.jpg';
import HangerIcon from '@/assets/landings/hangerIcon.svg';
import ITMICHAImage from '@/assets/landings/ItMichaa.jpg';
import LINE from '@/assets/landings/LINE.jpg';
import MAJE from '@/assets/landings/MAJE.jpg';
import MICHAA from '@/assets/landings/MICHAA.jpg';
import MOJO from '@/assets/landings/MOJO.jpg';
import SANDROImage from '@/assets/landings/Sandro.jpg';
import ZOOCImage from '@/assets/landings/Zooc.jpg';

const BRAND_ITEM_WIDTH = 240;
const BRAND_ITEM_GAP = 20;
const BRAND_COUNT = 9;

const totalWidth =
  BRAND_COUNT * BRAND_ITEM_WIDTH + (BRAND_COUNT - 1) * BRAND_ITEM_GAP;

const totalAnimationDistance = totalWidth;

const scroll = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-${totalAnimationDistance}px); }
`;

const LandingPage3: React.FC = () => {
  const brands = [
    { img: ZOOCImage, name: 'ZOOC' },
    { img: SANDROImage, name: 'SANDRO' },
    { img: ITMICHAImage, name: 'it MICHA' },
    { img: CC_Collect, name: 'CC Collect' },
    { img: DEW_L, name: 'DEW L' },
    { img: LINE, name: 'LINE' },
    { img: MAJE, name: 'MAJE' },
    { img: MICHAA, name: 'MICHAA' },
    { img: MOJO, name: 'MOJO' },
  ];

  return (
    <Container>
      <MainContent>
        <Hanger src={HangerIcon} alt='Hanger Icon' />
        <SmallTitle>당신의 취향에 꼭 맞는</SmallTitle>
        <LargeTitle>
          컨템포러리 브랜드들이
          <br />
          <Highlight>멜픽</Highlight>과 함께 합니다
        </LargeTitle>

        <BrandList>
          <ScrollingWrapper>
            {brands.map((brand, idx) => (
              <Brand key={idx}>
                <BrandImage
                  src={brand.img}
                  alt={`brand-${idx}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDragStart={(e) => e.preventDefault()}
                />
                <BrandName>{brand.name}</BrandName>
              </Brand>
            ))}

            {brands.map((brand, idx) => (
              <Brand key={`clone-${idx}`}>
                <BrandImage
                  src={brand.img}
                  alt={`brand-clone-${idx}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDragStart={(e) => e.preventDefault()}
                />
                <BrandName>{brand.name}</BrandName>
              </Brand>
            ))}
          </ScrollingWrapper>
        </BrandList>

        <PremiumBrandText>Premium Brand List</PremiumBrandText>
      </MainContent>
    </Container>
  );
};

export default LandingPage3;

const Container = styled.div`
  height: 660px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
`;

const MainContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 30px;
`;

const Hanger = styled.img`
  width: 45px;
  height: auto;
  margin-bottom: 22px;
`;

const SmallTitle = styled.div`
  font-weight: 400;
  font-size: 17px;
  line-height: 40px;
  text-align: center;
  color: #000000;
  margin-bottom: 10px;
`;

const LargeTitle = styled.h1`
  font-weight: 700;
  font-size: 23px;
  line-height: 30px;
  text-align: center;
  color: #000000;
  margin: 0 0 40px;
`;

const Highlight = styled.span`
  color: #f6ac36;
`;

const BrandList = styled.div`
  width: 100%;
  height: 300px;
  overflow: hidden;
  position: relative;
  margin-bottom: 32px;
`;

const ScrollingWrapper = styled.div`
  display: flex;
  gap: ${BRAND_ITEM_GAP}px;
  width: ${totalWidth * 2}px;
  animation: ${scroll} 30s linear infinite;
`;

const Brand = styled.div`
  flex-shrink: 0;
  position: relative;
  width: ${BRAND_ITEM_WIDTH}px;
  height: 300px;
`;

const BrandImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
`;

const BrandName = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: 900;
  font-size: 20px;
  width: 100%;
  text-align: center;
  color: #000000;
`;

const PremiumBrandText = styled.div`
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 30px;
  text-align: center;
  color: #000000;
`;
