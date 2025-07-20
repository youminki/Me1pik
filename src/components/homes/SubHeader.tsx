// src/components/Header/SubHeader.tsx
import React, { useRef, useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import Best from '../../assets/sub-headers/Best.svg';
import Blouse from '../../assets/sub-headers/Blouse.svg';
import Cardigan from '../../assets/sub-headers/Cardigan.svg';
import Coat from '../../assets/sub-headers/Coat.svg';
import All from '../../assets/sub-headers/Entire.svg';
import Jacket from '../../assets/sub-headers/Jacket.svg';
import JumpSuit from '../../assets/sub-headers/JumpSuit.svg';
import KnitTop from '../../assets/sub-headers/KnitTop.svg';
import LongDress from '../../assets/sub-headers/LongDress.svg';
import LongSkirt from '../../assets/sub-headers/LongSkirt.svg';
import MidiDress from '../../assets/sub-headers/MidiDress.svg';
import MidiSkirt from '../../assets/sub-headers/MidiSkirt.svg';
import MiniDress from '../../assets/sub-headers/MiniDress.svg';
import MiniSkirt from '../../assets/sub-headers/MiniSkirt.svg';
import Padding from '../../assets/sub-headers/Padding.svg';
import Pants from '../../assets/sub-headers/Pants.svg';
import ShirtTop from '../../assets/sub-headers/ShirtTop.svg';
import Top from '../../assets/sub-headers/Top.svg';
import Tshirt from '../../assets/sub-headers/Tshirt.svg';
import LoadingSpinner from '../shared/LoadingSpinner';

const homeIcons = [
  { src: All, alt: '전체', category: 'All' },
  { src: MiniDress, alt: '미니원피스', category: 'MiniDress' },
  { src: MidiDress, alt: '미디원피스', category: 'MidiDress' },
  { src: LongDress, alt: '롱 원피스', category: 'LongDress' },
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
          <LoadingSpinner label='로딩 중...' />
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
  bottom: 0px;
  left: ${({ position }) => position}px;
  width: ${INDICATOR_WIDTH}px;
  height: 4px;
  background-color: #000;
  border-radius: 3px;
  transition: left 0.3s ease-in-out;
`;
const Divider = styled.div`
  width: 100%;
  border-bottom: 1px solid #d9d9d9;
`;
