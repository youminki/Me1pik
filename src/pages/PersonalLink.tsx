// src/pages/PersonalLink.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import personalLinkShareIcon from '../assets/personalLink/personalLinkShareIcon.svg';
import personalLinkProfileIcon from '../assets/personalLink/personalLinkProfileIcon.svg';
import personalLinkAlramIcon from '../assets/personalLink/personalLinkAlramIcon.svg';
import LinkArrowIcon from '../assets/personalLink/LinkArrowIcon.svg';

export interface UIItem {
  id: string;
  image: string;
  brand: string;
  description: string;
  price: number;
  discount: number;
  isLiked: boolean;
}

const dummyItems = [
  {
    id: 1,
    image: '이미지경로1.jpg',
    brand: 'SANDRO',
    description: 'SF23SRD07869 / 원피스',
    category: 'onepiece',
    price: 489000,
    discount: 10,
  },
  {
    id: 2,
    image: '이미지경로2.jpg',
    brand: 'SANDRO',
    description: 'SF23SRD05961 / 원피스',
    category: 'onepiece',
    price: 589000,
    discount: 10,
  },
  {
    id: 3,
    image: '이미지경로3.jpg',
    brand: 'MICHAA',
    description: 'MP-Xxxxxx / 원피스',
    category: 'onepiece',
    price: 959000,
    discount: 10,
  },
  {
    id: 4,
    image: '이미지경로4.jpg',
    brand: 'MOX.SPIN',
    description: '1244HSS009 / 원피스',
    category: 'onepiece',
    price: 1259000,
    discount: 10,
  },
  // 추가 아이템이 필요하면 더 넣기
];

const PersonalLink: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'personalLink' | 'productIntro'>(
    'personalLink'
  );

  useEffect(() => {
    document.body.classList.add('PersonalLink');
    return () => {
      document.body.classList.remove('PersonalLink');
    };
  }, []);

  // UIItem 형태로 변환
  const uiDummyItems: UIItem[] = dummyItems.map(
    ({ id, image, brand, description, price, discount }) => ({
      id: id.toString(),
      image,
      brand,
      description,
      price,
      discount,
      isLiked: false,
    })
  );

  // 카드 클릭 시 동작 (예: 모달 열기 or 상세 페이지 네비게이트)
  const handleItemClick = () => {
    // TODO: 상세 페이지로 이동 등 구현
  };

  return (
    <Container>
      <TopSection>
        <TopInner>
          <IconButton>
            <img src={personalLinkShareIcon} alt='share' />
          </IconButton>

          <CenterColumn>
            <UserImageWrapper>
              <img src={personalLinkProfileIcon} alt='user profile' />
            </UserImageWrapper>
            <UserName>bominism71</UserName>
          </CenterColumn>

          <IconButton>
            <img src={personalLinkAlramIcon} alt='alarm' />
          </IconButton>
        </TopInner>
      </TopSection>

      {/* 콘텐츠 영역: flex:1 */}
      <ContentWrapper>
        <TabSection>
          <TabItem
            active={activeTab === 'personalLink'}
            onClick={() => setActiveTab('personalLink')}
          >
            개인링크
          </TabItem>
          <TabItem
            active={activeTab === 'productIntro'}
            onClick={() => setActiveTab('productIntro')}
          >
            제품소개
          </TabItem>
        </TabSection>

        {activeTab === 'personalLink' && (
          <LinkListWrapper>
            <LinkItem>
              <LinkLabelBox>LINK 01</LinkLabelBox>
              <LinkTextWrapper>
                <LinkTitle>업무 및 비지니스 제휴 문의</LinkTitle>
                <LinkDesc>form.naver.com/respon..</LinkDesc>
              </LinkTextWrapper>
              <LinkArrow src={LinkArrowIcon} alt='arrow' />
            </LinkItem>
            {/* ... 기타 LinkItem */}
          </LinkListWrapper>
        )}

        {activeTab === 'productIntro' && (
          <ProductListWrapper>
            <IntroText>
              👉 직접 입어보고 맘에 드는 것만 소개해드려요 👈
            </IntroText>

            {/* 직접 그리드 + 카드 구조 삽입 */}
            <ListContainer>
              <ItemsWrapper>
                {uiDummyItems.map((item) => (
                  <ItemCardWrapper
                    key={item.id}
                    onClick={() => handleItemClick()}
                  >
                    <ImageWrapper>
                      {/* 이미지 URL이 # 뒤에 옵션이 붙을 수 있으므로 split 처리 */}
                      <Image
                        src={item.image.split('#')[0] || '/default.jpg'}
                        alt={item.brand}
                      />
                    </ImageWrapper>
                    <BrandText>{item.brand}</BrandText>
                    <DescriptionText>
                      {item.description.includes('/')
                        ? item.description.split('/')[1]
                        : item.description}
                    </DescriptionText>
                    <PriceWrapper>
                      <PointBar />
                      <OriginalPriceText>
                        {item.price.toLocaleString()}원
                      </OriginalPriceText>
                      <SubPriceWrapper>
                        <NowLabel>NOW</NowLabel>
                        <DiscountLabel>{item.discount}%</DiscountLabel>
                      </SubPriceWrapper>
                    </PriceWrapper>
                  </ItemCardWrapper>
                ))}
              </ItemsWrapper>
            </ListContainer>
          </ProductListWrapper>
        )}
      </ContentWrapper>

      <Footer>© 2024 ME1PIK.</Footer>
    </Container>
  );
};

export default PersonalLink;

// Styled-components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* 화면 높이 전체를 차지 */
  max-width: 430px;
  width: 100%;
  margin: 0 auto;
  background: #ffffff;
  overflow-x: hidden;
`;

const TopSection = styled.div`
  position: relative;
  width: 100%;
  height: 240px;
  background: #f6ae24;
  clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TopInner = styled.div`
  margin-top: 10px;
  width: 90%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CenterColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  background: #ffffff;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    object-fit: contain;
  }
`;

const UserImageWrapper = styled.div`
  width: 96px;
  height: 96px;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    object-fit: cover;
    background: #d9d9d9;
  }
`;

const UserName = styled.div`
  margin-top: 8px;
  font-weight: 700;
  font-size: 18px;
  line-height: 20px;
  color: #000000;
  text-align: center;
`;

/* 콘텐츠 영역을 감싸서 flex:1 설정 */
const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const TabSection = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
  padding: 1rem;
`;

const TabItem = styled.div<{ active: boolean }>`
  width: 50%;
  height: 50px;
  border: 2px solid transparent;
  background: ${({ active }) => (active ? '#ffffff' : '#eeeeee')};
  color: ${({ active }) => (active ? '#000' : '#999')};
  font-weight: 800;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  &:first-child {
    border-radius: 10px 0 0 10px;
  }
  &:last-child {
    border-radius: 0 10px 10px 0;
  }

  ${({ active }) =>
    active &&
    `
    border-color: #f6ae24;
  `}
`;

const LinkListWrapper = styled.div`
  /* flex: 1; 이미 ContentWrapper가 flex:1이므로 내부는 자연스럽게 차지 */
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 1rem;
`;

const LinkItem = styled.div`
  position: relative;
  width: 100%;
  height: 80px;
  border: 1px solid #dddddd;
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 0 16px;
  box-sizing: border-box;
`;

const LinkLabelBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 25px;
  background: #000000;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 10px;
  line-height: 12px;
  border-radius: 5px 0 0 5px;
  position: relative;
  margin-bottom: 20px;
  /* 오른쪽 뾰족하게 */
  clip-path: polygon(
    0 0,
    calc(100% - 12px) 0,
    100% 50%,
    calc(100% - 12px) 100%,
    0 100%
  );
`;

const LinkTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 12px;
`;

const LinkTitle = styled.div`
  font-weight: 800;
  font-size: 14px;
  color: #000000;
  margin-bottom: 5px;
`;

const LinkDesc = styled.div`
  font-weight: 400;
  font-size: 12px;
  color: #999999;
  text-decoration: underline;
`;

const LinkArrow = styled.img`
  position: absolute;
  right: 16px;
  width: 20px;
  height: 20px;
`;

const ProductListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 1rem;
`;

const IntroText = styled.div`
  font-weight: 400;
  font-size: 14px;
  color: #000;
  margin-bottom: 20px;
  align-items: center;
  text-align: center;
`;

const ListContainer = styled.div`
  background-color: #fff;
  margin: 0 auto;
  box-sizing: border-box;
  width: 100%;
`;

const ItemsWrapper = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;

// 카드 내부 요소 스타일
const ItemCardWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  margin-bottom: 12px;
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 2/3;
  min-height: 240px;
  background: #f5f5f5;
  border: 1px solid #ccc;
  overflow: hidden;
  @supports not (aspect-ratio: 2/3) {
    min-height: 240px;
    height: 360px;
  }
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  min-height: 240px;
  aspect-ratio: 2/3;
  object-fit: cover;
  display: block;
  background: #f5f5f5;
`;

const BrandText = styled.h3`
  margin: 10px 0 0 0;
  font-weight: 900;
  font-size: 10px;
  line-height: 11px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const DescriptionText = styled.p`
  margin: 5px 0 0 0;
  font-size: 12px;
  color: #999;
  font-weight: 700;
  margin-bottom: 4px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const PriceWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 5px;
  position: relative;

  @media (max-width: 768px) {
    margin-top: 5px;
    margin-left: 5px;
  }
`;

const PointBar = styled.div`
  display: block;
  width: 2px;
  height: 16px;
  background: #f6ae24;
  border-radius: 2px;
  margin-right: 5px;
`;

const OriginalPriceText = styled.span`
  font-weight: 900;
  font-size: 14px;
`;

const SubPriceWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 4px;
`;

const NowLabel = styled.span`
  font-size: 9px;
`;

const DiscountLabel = styled.span`
  font-weight: 800;
  font-size: 11px;
  color: #f6ae24;
`;

const Footer = styled.div`
  width: 100%;
  height: 20px;
  text-align: center;
  font-weight: 400;
  font-size: 12px;
  line-height: 20px;
  color: #f6ae24;
  margin-top: auto; /* 남은 공간을 채운 뒤 하단에 위치 */
  padding: 16px 0; /* 높이가 너무 작으면 보이기 어려우니 padding 추가 가능 */
`;
