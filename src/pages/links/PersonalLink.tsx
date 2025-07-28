// src/pages/PersonalLink.tsx
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

import InstagramIconImg from '@/assets/personal-links/InstagramIcon.svg';
import LinkArrowIcon from '@/assets/personal-links/LinkArrowIcon.svg';
import LinkLabelIcon from '@/assets/personal-links/LinkLabelIcon.svg';
import personalLinkAlramIcon from '@/assets/personal-links/personalLinkAlramIcon.svg';
import PersonalLinkBackground from '@/assets/personal-links/PersonalLinkbackground.jpg';
import personalLinkProfileIcon from '@/assets/personal-links/personalLinkProfileIcon.svg';
import personalLinkShareIcon from '@/assets/personal-links/personalLinkShareIcon.svg';
import ScheduleIconImg from '@/assets/personal-links/ScheduleIcon.svg';

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

const TAB_INDICATOR = {
  personalLink: { left: 0, width: 18 },
  productIntro: { left: 18, width: 18 },
};

const PersonalLink: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'personalLink' | 'productIntro'>(
    'personalLink'
  );
  const [sheetHeight, setSheetHeight] = useState('75vh');
  const [readyToShrink, setReadyToShrink] = useState(false);
  const tabSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.classList.add('PersonalLink');
    // html과 body 스크롤 차단
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.classList.remove('PersonalLink');
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  const handleBottomSheetScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (activeTab === 'productIntro') {
      if (tabSectionRef.current) {
        const tabRect = tabSectionRef.current.getBoundingClientRect();
        const sheetRect = e.currentTarget.getBoundingClientRect();
        if (tabRect.top >= sheetRect.top) {
          // 탭이 보이면
          if (!readyToShrink) {
            setReadyToShrink(true); // 플래그만 세팅
          } else {
            // 플래그가 이미 true인 상태에서 한 번 더 스크롤(이벤트 발생) 시 75vh로
            if (sheetHeight !== '75vh') setSheetHeight('75vh');
            setReadyToShrink(false); // 다시 초기화
          }
          return;
        }
      }
      // 탭이 안 보이면 90vh, 플래그 초기화
      if (sheetHeight !== '90vh') setSheetHeight('90vh');
      setReadyToShrink(false);
    }
  };

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

  // 인디케이터 스타일 계산
  const indicatorStyle = {
    left: TAB_INDICATOR[activeTab].left,
    width: TAB_INDICATOR[activeTab].width,
    transition:
      'left 0.3s cubic-bezier(0.4,0,0.2,1), width 0.3s cubic-bezier(0.4,0,0.2,1)',
  };

  return (
    <MainWrapper>
      <TopBar>
        <IconButton>
          <img src={personalLinkShareIcon} alt='share' />
        </IconButton>
        <RightIcons>
          <IconButton>
            <ThreeDot>
              <Dot />
              <Dot />
              <Dot />
            </ThreeDot>
          </IconButton>
          <IconButton>
            <img src={personalLinkAlramIcon} alt='alarm' />
          </IconButton>
        </RightIcons>
      </TopBar>
      <BottomSheet
        style={{ height: sheetHeight }}
        onScroll={handleBottomSheetScroll}
      >
        <TabIndicator>
          <IndicatorBackground />
          <IndicatorBar style={indicatorStyle} />
        </TabIndicator>
        <TabSection ref={tabSectionRef}>
          <TabBtn
            active={activeTab === 'personalLink'}
            onClick={() => setActiveTab('personalLink')}
          >
            개인링크
          </TabBtn>
          <TabBtn
            active={activeTab === 'productIntro'}
            onClick={() => setActiveTab('productIntro')}
          >
            제품소개
          </TabBtn>
        </TabSection>
        {activeTab === 'personalLink' && (
          <ProfileSection>
            <ProfileImgWrap>
              <img src={personalLinkProfileIcon} alt='profile' />
            </ProfileImgWrap>
            <ProfileName>bominism71</ProfileName>
            <ProfileDesc>
              직접 입어보고 맘에 드는 것만 소개해드려요!
            </ProfileDesc>
          </ProfileSection>
        )}

        {/* 탭별 컨텐츠 조건부 렌더링 */}
        {activeTab === 'personalLink' && (
          <LinkList>
            <LinkRow>
              <LinkLabel>
                <img
                  src={LinkLabelIcon}
                  alt='LINK 01'
                  style={{ width: '100%', height: '100%' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: '700',
                  }}
                >
                  LINK 01
                </span>
              </LinkLabel>
              <LinkTextBox>
                <LinkTitle>업무 및 비지니스 제휴 문의</LinkTitle>
                <LinkDesc>form.naver.com/respon..</LinkDesc>
              </LinkTextBox>
              <LinkArrow src={LinkArrowIcon} alt='arrow' />
            </LinkRow>
            <LinkRow>
              <LinkLabel>
                <img
                  src={LinkLabelIcon}
                  alt='LINK 02'
                  style={{ width: '100%', height: '100%' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: '700',
                  }}
                >
                  LINK 02
                </span>
              </LinkLabel>
              <LinkTextBox>
                <LinkTitle>PMC - 대회 홈페이지 안내</LinkTitle>
                <LinkDesc>form.naver.com/respon..</LinkDesc>
              </LinkTextBox>
              <LinkArrow src={LinkArrowIcon} alt='arrow' />
            </LinkRow>
            <LinkRow>
              <LinkLabel>
                <img
                  src={LinkLabelIcon}
                  alt='LINK 03'
                  style={{ width: '100%', height: '100%' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: '700',
                  }}
                >
                  LINK 03
                </span>
              </LinkLabel>
              <LinkTextBox>
                <LinkTitle>업무 및 비지니스 제휴 문의</LinkTitle>
                <LinkDesc>form.naver.com/respon..</LinkDesc>
              </LinkTextBox>
              <LinkArrow src={LinkArrowIcon} alt='arrow' />
            </LinkRow>
            <LinkRow>
              <LinkLabel>
                <img
                  src={LinkLabelIcon}
                  alt='LINK 04'
                  style={{ width: '100%', height: '100%' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: '700',
                  }}
                >
                  LINK 04
                </span>
              </LinkLabel>
              <LinkTextBox>
                <LinkTitle>PMC - 대회 홈페이지 안내</LinkTitle>
                <LinkDesc>form.naver.com/respon..</LinkDesc>
              </LinkTextBox>
              <LinkArrow src={LinkArrowIcon} alt='arrow' />
            </LinkRow>
          </LinkList>
        )}
        {activeTab === 'productIntro' && (
          <ProductListWrapper>
            <ProductIntroNotice>
              👉 직접 입어보고 맘에 드는 것만 소개해드려요
            </ProductIntroNotice>
            <ListContainer>
              {uiDummyItems.map((item) => (
                <ItemCardWrapper key={item.id}>
                  <ImageWrapper>
                    <Image
                      src={item.image.split('#')[0] || '/default.jpg'}
                      alt={item.brand}
                    />
                  </ImageWrapper>
                  <CardTextArea>
                    <BrandText>{item.brand}</BrandText>
                    <DescriptionText>
                      {item.description.includes('/')
                        ? item.description.split('/')[1]
                        : item.description}
                    </DescriptionText>
                    <PriceRow>
                      <OriginalPriceText>
                        {item.price.toLocaleString()}원
                      </OriginalPriceText>
                      <SubPriceWrapper>
                        <NowLabel>NOW</NowLabel>
                        <DiscountLabel>{item.discount}%</DiscountLabel>
                      </SubPriceWrapper>
                    </PriceRow>
                  </CardTextArea>
                </ItemCardWrapper>
              ))}
            </ListContainer>
          </ProductListWrapper>
        )}

        <BottomIcons>
          <ScheduleIcon>
            <img src={ScheduleIconImg} alt='schedule' width={30} height={29} />
          </ScheduleIcon>
          <InstagramIcon>
            <img
              src={InstagramIconImg}
              alt='instagram'
              width={28}
              height={28}
            />
          </InstagramIcon>
        </BottomIcons>
      </BottomSheet>
    </MainWrapper>
  );
};

export default PersonalLink;

// =====================
// styled-components
// =====================

const MainWrapper = styled.div`
  position: relative;
  width: 100vw;
  max-width: 600px;
  min-height: 100vh;
  background: #fcf8f5 url(${PersonalLinkBackground}) center/cover no-repeat;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
`;

const TopBar = styled.div`
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 8px 20px;
  box-sizing: border-box;
  background: transparent;
  z-index: 20;
`;
const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 8px;
  margin-bottom: 18px;
`;
const ProfileImgWrap = styled.div`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  overflow: hidden;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  img {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    object-fit: cover;
    background: #d9d9d9;
  }
`;
const ProfileName = styled.div`
  font-weight: 700;
  font-size: 20px;
  line-height: 24px;
  color: #000;
  text-align: center;
  margin-bottom: 4px;
`;
const ProfileDesc = styled.div`
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: #000;
  text-align: center;
`;
const TabSection = styled.div`
  width: 70%;
  height: 46px;
  margin: 10px auto 24px auto;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 24px;
`;

const TabBtn = styled.button<{ active: boolean }>`
  width: 100%;
  height: 40px;
  border-radius: 100px;
  border: ${({ active }) => (active ? '2px solid #fff' : 'none')};
  background: ${({ active }) => (active ? '#F6AE24' : '#F2F2F2')};
  font-family: 'NanumSquare Neo OTF', sans-serif;
  font-style: normal;
  font-weight: 800;
  font-size: 12px;
  line-height: 13px;
  color: ${({ active }) => (active ? '#fff' : '#8E8E8E')};
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.2s,
    color 0.2s,
    border 0.2s,
    box-shadow 0.2s;
  box-shadow: ${({ active }) => (active ? '0 0 0 1px #F6AE24' : 'none')};
`;
const LinkList = styled.div`
  width: 90%;
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 0 auto 32px auto;
`;
const LinkRow = styled.div`
  width: 100%;
  min-height: 56px;
  display: flex;
  align-items: center;
  border-bottom: 0.5px solid #000;
  padding: 18px 0 10px 0;
`;
const LinkLabel = styled.div`
  min-width: 64px;
  height: 25px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;

  svg {
    width: 100%;
    height: 100%;
  }
`;
const LinkTextBox = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
const LinkTitle = styled.div`
  font-weight: 800;
  font-size: 15px;
  line-height: 18px;
  color: #000;
  margin-bottom: 2px;
`;
const LinkDesc = styled.div`
  font-weight: 400;
  font-size: 12px;
  line-height: 13px;
  color: #999;
`;
const LinkArrow = styled.img`
  width: 20px;
  height: 20px;
  margin-left: 10px;
`;
const BottomIcons = styled.div`
  width: 100%;
  max-width: 600px;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
  margin-top: auto;
`;
const ScheduleIcon = styled.div`
  width: 30px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const InstagramIcon = styled.div`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// styled-components: IconButton, ThreeDot, Dot를 상단에 선언
const IconButton = styled.button`
  width: 40px;
  height: 40px;
  background: #fff;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  transition: background 0.2s;
  &:active {
    background: #f6ae24;
  }
  img,
  svg {
    object-fit: contain;
  }
`;
const ThreeDot = styled.div`
  display: flex;
  flex-direction: row;
  gap: 3px;
`;
const Dot = styled.div`
  width: 5px;
  height: 5px;
  background: #f6ae24;
  border-radius: 50%;
`;

const RightIcons = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

// Styled-components
const BottomSheet = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 600px;
  background: #fff;
  border-radius: 35px 35px 0 0;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
  box-sizing: border-box;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  transition: height 0.2s ease-out;

  @media (min-width: 768px) {
    /* height는 state로 관리 */
  }
`;

const TabIndicator = styled.div`
  position: relative;
  width: 36px; /* 18(탭1) + 18(탭2) = 36 */
  height: 5px;
  margin: 0 auto 16px auto;
  margin-top: 10px;
`;

const IndicatorBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 36px;
  height: 5px;
  border-radius: 100px;
  background: #d9d9d9;
  opacity: 0.4;
`;

const IndicatorBar = styled.div`
  position: absolute;
  top: 0;
  height: 5px;
  border-radius: 100px;
  background: #f6ae24;
`;

const ProductListWrapper = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto 0 auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
`;

const ListContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  padding: 1rem;
  gap: 20px;
  box-sizing: border-box;
`;

const ItemCardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  overflow: hidden;
  box-sizing: border-box;
  min-height: 260px;
`;

const ImageWrapper = styled.div`
  width: 100%;
  aspect-ratio: 2/3;
  background: #f7f7f7;
  border: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 10px;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const CardTextArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
`;

const BrandText = styled.h3`
  margin: 0 0 2px 0;
  font-weight: 900;
  font-size: 10px;
  line-height: 11px;
  color: #222;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const DescriptionText = styled.p`
  margin: 0 0 4px 0;
  font-size: 12px;
  color: #999;
  font-weight: 700;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const PriceRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  margin-top: 5px;
`;

const OriginalPriceText = styled.span`
  font-weight: 900;
  font-size: 14px;
  color: #222;
`;

const SubPriceWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 4px;
`;

const NowLabel = styled.span`
  font-size: 9px;
  color: #888;
`;

const DiscountLabel = styled.span`
  font-weight: 800;
  font-size: 11px;
  color: #f6ae24;
`;

const ProductIntroNotice = styled.div`
  width: 100%;
  font-size: 14px;
  color: #222;
  font-weight: 400;
  margin-bottom: 18px;
  text-align: center;
`;
