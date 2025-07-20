import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { theme } from '../../../styles/theme';
import CreateMelpik1 from '../../../assets/melpiks/Inventory1.svg';
import CreateMelpik2 from '../../../assets/melpiks/Inventory1.svg';
import SettingIcon from '../../../assets/melpiks/Setting.svg';

interface ContentItem {
  image: string;
  imgtitle: string;
  title: string;
  dressSize: string;
  topSize: string;
  bottomSize: string;
  brand: string;
  exposure: number;
  period: string;
}

const Content: React.FC<{ item: ContentItem }> = ({ item }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (item.imgtitle === '컨템포러리') {
      navigate('/createMelpik/settings');
    }
  };

  return (
    <ContentContainer onClick={handleClick}>
      <ImageWrapper>
        <ImageContainer>
          <Image src={item.image} alt='Item' />
          <TextOverlay>
            <SmallText>Fashion Brand</SmallText>
            <LargeText>{item.imgtitle}</LargeText>
          </TextOverlay>
          <SettingsIcon src={SettingIcon} alt='Settings' />
        </ImageContainer>
        <DescriptionBox>
          <Title>{item.title}</Title>
          <Details>
            <Container>
              <DescriptionLine>
                <Label>원피스</Label>
                <Data>{item.dressSize}</Data>
              </DescriptionLine>
              <Separator>|</Separator>
              <DescriptionLine>
                <Label>상의</Label>
                <Data>{item.topSize}</Data>
              </DescriptionLine>
              <Separator>|</Separator>
              <DescriptionLine>
                <Label>하의</Label>
                <Data>{item.bottomSize}</Data>
              </DescriptionLine>
            </Container>
            <Container>
              <DescriptionLine>
                <Label>브랜드</Label>
                <Data>{item.brand}</Data>
              </DescriptionLine>
            </Container>
            <Container>
              <DescriptionLine>
                <Label>상품 노출수</Label>
                <Data>{item.exposure}회</Data>
              </DescriptionLine>
              <Separator>|</Separator>
              <DescriptionLine>
                <Label>노출기간</Label>
                <Data>월 {item.period}회</Data>
              </DescriptionLine>
            </Container>
          </Details>
        </DescriptionBox>
      </ImageWrapper>
    </ContentContainer>
  );
};

const ContentList: React.FC = () => {
  const data: ContentItem[] = [
    {
      image: CreateMelpik1,
      imgtitle: '컨템포러리',
      title: '컨템포러리 ',
      dressSize: 'M (55)',
      topSize: 'M (55)',
      bottomSize: 'M (55)',
      brand: 'MICHA, MAJE, SANDRO',
      exposure: 6,
      period: '2',
    },
    {
      image: CreateMelpik2,
      imgtitle: '골프웨어',
      title: '골프웨어 ',
      dressSize: 'M (55)',
      topSize: 'M (55)',
      bottomSize: 'M (55)',
      brand: 'MICHA, MAJE, SANDRO',
      exposure: 6,
      period: '2',
    },
  ];

  return (
    <ScrollableContent>
      {data.map((item, index) => (
        <Content key={index} item={item} />
      ))}
    </ScrollableContent>
  );
};

export default ContentList;

const ScrollableContent = styled.div`
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 300px;
  max-width: 300px;
  height: 100%;
  margin-right: 20px;
  box-sizing: border-box;
  overflow: hidden;
`;

const ImageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const TextOverlay = styled.div`
  position: absolute;
  bottom: 150px;
  left: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
`;

const SmallText = styled.div`
  font-weight: 900;
  font-size: 10px;
  color: #000000;
`;

const LargeText = styled.div`
  font-weight: 350;
  font-size: 30px;
  line-height: 33px;

  color: #ffffff;
`;

const SettingsIcon = styled.img`
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  cursor: pointer;
`;
const DescriptionLine = styled.div`
  display: flex;
  align-items: center;
`;

const Label = styled.span`
  font-weight: 400;
  color: #000;
`;

const Data = styled.span`
  font-weight: 900;
  font-size: 12px;
  line-height: 13px;

  color: #000000;
  margin-left: 5px;
`;

const Separator = styled.span`
  margin: 0 10px;
  color: ${theme.colors.gray1};
`;

const DescriptionBox = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  width: 100%;
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 12px;
  border-left: 1px solid ${theme.colors.gray1};
  border-right: 1px solid ${theme.colors.gray1};
  border-top: 1px solid ${theme.colors.gray1};
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  padding: 13px;
  border-bottom: 1px solid ${theme.colors.gray1};
`;

const Title = styled.h1`
  font-weight: 800;
  font-size: 14px;
  line-height: 15px;
  color: #000000;

  margin-bottom: 10px;
`;
