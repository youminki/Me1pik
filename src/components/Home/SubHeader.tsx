// src/components/Header/SubHeader.tsx
import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Spinner from '../Spinner';

import All from '../../assets/SubHeader/Entire.svg';
import MiniDress from '../../assets/SubHeader/MiniDress.svg';
import MidiDress from '../../assets/SubHeader/MidiDress.svg';
import LongDress from '../../assets/SubHeader/LongDress.svg';
import TwoDress from '../../assets/SubHeader/TwoDress.svg';
import JumpSuit from '../../assets/SubHeader/JumpSuit.svg';
import Blouse from '../../assets/SubHeader/Blouse.svg';
import KnitTop from '../../assets/SubHeader/KnitTop.svg';
import ShirtTop from '../../assets/SubHeader/ShirtTop.svg';
import MiniSkirt from '../../assets/SubHeader/MiniSkirt.svg';
import MidiSkirt from '../../assets/SubHeader/MidiSkirt.svg';
import LongSkirt from '../../assets/SubHeader/LongSkirt.svg';
import Pants from '../../assets/SubHeader/Pants.svg';
import Jacket from '../../assets/SubHeader/Jacket.svg';
import Coat from '../../assets/SubHeader/Coat.svg';
import Top from '../../assets/SubHeader/Top.svg';
import Tshirt from '../../assets/SubHeader/Tshirt.svg';
import Cardigan from '../../assets/SubHeader/Cardigan.svg';
import Best from '../../assets/SubHeader/Best.svg';
import Padding from '../../assets/SubHeader/Padding.svg';

const homeIcons = [
  { src: All, alt: '전체', category: 'All' },
  { src: MiniDress, alt: '미니원피스', category: 'MiniDress' },
  { src: MidiDress, alt: '미디원피스', category: 'MidiDress' },
  { src: LongDress, alt: '롱 원피스', category: 'LongDress' },
  { src: TwoDress, alt: '투피스', category: 'TwoDress' },
  { src: JumpSuit, alt: '점프수트', category: 'JumpSuit' },
  { src: Blouse, alt: '블라우스', category: 'Blouse' },
  { src: KnitTop, alt: '니트 상의', category: 'KnitTop' },
  { src: ShirtTop, alt: '셔츠 상의', category: 'ShirtTop' },
  { src: MiniSkirt, alt: '미니 스커트', category: 'MiniSkirt' },
  { src: MidiSkirt, alt: '미디 스커트', category: 'MidiSkirt' },
  { src: LongSkirt, alt: '롱 스커트', category: 'LongSkirt' },
  { src: Pants, alt: '팬츠', category: 'Pants' },
  { src: Jacket, alt: '자켓', category: 'Jacket' },
  { src: Coat, alt: '코트', category: 'Coat' },
  { src: Top, alt: '탑', category: 'Top' },
  { src: Tshirt, alt: '티셔츠', category: 'Tshirt' },
  { src: Cardigan, alt: '가디건', category: 'Cardigan' },
  { src: Best, alt: '베스트', category: 'Best' },
  { src: Padding, alt: '패딩', category: 'Padding' },
];

interface SubHeaderProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onCategoryClick: () => void;
}

const ICON_WIDTH = 80;
const INDICATOR_WIDTH = 50;

const SubHeader: React.FC<SubHeaderProps> = ({
  selectedCategory,
  setSelectedCategory,
  onCategoryClick,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const iconsRef = useRef<HTMLDivElement>(null);
  const initialPos = (ICON_WIDTH - INDICATOR_WIDTH) / 2;
  const [indicatorPos, setIndicatorPos] = useState(initialPos);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!iconsRef.current) return;
    const container = iconsRef.current;
    const selectedEl = container.querySelector<HTMLElement>(
      `[data-category="${selectedCategory}"]`
    );
    if (selectedEl) {
      const offsetLeft = selectedEl.offsetLeft;
      const centerOffset = (ICON_WIDTH - INDICATOR_WIDTH) / 2;
      setIndicatorPos(offsetLeft + centerOffset);
    }
  }, [selectedCategory]);

  const handleClick = (category: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    // 'All' 선택 시에는 category 파라미터 제거
    if (category === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', category);
    }
    // 검색어는 초기화
    newParams.delete('search');
    setSearchParams(newParams, { replace: true });
    setSelectedCategory(category);
    onCategoryClick();
  };

  const scroll = (dir: 'left' | 'right') => {
    if (!iconsRef.current) return;
    const amount = ICON_WIDTH * 3;
    iconsRef.current.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <SubHeaderWrapper>
      <ContentWrapper>
        {loading ? (
          <Spinner />
        ) : (
          <>
            <ArrowButtonWrapper onClick={() => scroll('left')}>
              <FiChevronLeft size={24} />
            </ArrowButtonWrapper>

            <IconsWrapper ref={iconsRef}>
              {homeIcons.map((icon, idx) => {
                const isSelected = icon.category === selectedCategory;
                return (
                  <IconContainer
                    key={idx}
                    data-category={icon.category}
                    selected={isSelected}
                    onClick={() => handleClick(icon.category)}
                  >
                    <Icon src={icon.src} alt={icon.alt} />
                    <IconText selected={isSelected}>{icon.alt}</IconText>
                  </IconContainer>
                );
              })}
              <Indicator position={indicatorPos} />
            </IconsWrapper>

            <ArrowButtonWrapper onClick={() => scroll('right')}>
              <FiChevronRight size={24} />
            </ArrowButtonWrapper>
          </>
        )}
      </ContentWrapper>
      <Divider />
    </SubHeaderWrapper>
  );
};

export default SubHeader;

// Styled Components
const SubHeaderWrapper = styled.div`
  position: relative;
  width: 100%;
  background: #fff;
`;
const ContentWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
`;
const ArrowButtonWrapper = styled.div`
  display: none;
  @media (min-width: 1024px) {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 0 8px;
  }
`;
const IconsWrapper = styled.div`
  position: relative;
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  &::-webkit-scrollbar {
    display: none;
  }
`;
const IconContainer = styled.div<{ selected: boolean }>`
  flex: 0 0 auto;
  width: ${ICON_WIDTH}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 10px 0;
  opacity: ${({ selected }) => (selected ? 1 : 0.6)};
`;
const Icon = styled.img`
  width: auto;
  height: auto;
  object-fit: contain;
  margin-bottom: 5px;
`;
const IconText = styled.span<{ selected: boolean }>`
  font-size: 11px;
  color: ${({ selected }) => (selected ? '#000' : '#666')};
`;
const Indicator = styled.div<{ position: number }>`
  position: absolute;
  bottom: 0;
  left: ${({ position }) => position}px;
  width: ${INDICATOR_WIDTH}px;
  height: 3px;
  background-color: #000;
  border-radius: 3px;
  transition: left 0.3s ease-in-out;
`;
const Divider = styled.div`
  width: 100%;
  border-bottom: 1px solid #eeeeee;
  margin-top: 4px;
`;
