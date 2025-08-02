/**
 * 검색/필터 컨트롤 컨테이너 컴포넌트 (FilterContainer.tsx)
 *
 * 홈 페이지에서 검색과 필터 기능을 제공하는 컨트롤 UI 컴포넌트입니다.
 * 검색 아이콘과 필터 아이콘을 포함하며, 클릭 시 해당 기능을 실행합니다.
 *
 * @description
 * - 검색 아이콘 버튼
 * - 필터 아이콘 버튼
 * - 호버 효과 및 스타일 적용
 * - 반응형 디자인 지원
 */
// src/components/FilterContainer.tsx
import React from 'react';
import styled from 'styled-components';

import FilterIcon from '@/assets/FilterIcon.svg';
import SearchIconSvg from '@/assets/homes/SearchIcon.svg';
// import ReusableModal from '@/components/ReusableModal';

/**
 * 필터 컨테이너 Props
 *
 * @property onSearchClick - 검색 버튼 클릭 핸들러
 * @property onFilterClick - 필터 버튼 클릭 핸들러
 */
interface FilterContainerProps {
  onSearchClick: () => void;
  onFilterClick: () => void;
}

/**
 * 검색/필터 컨트롤 컨테이너 컴포넌트
 *
 * 검색과 필터 기능을 제공하는 버튼들을 렌더링합니다.
 *
 * @param onSearchClick - 검색 버튼 클릭 핸들러
 * @param onFilterClick - 필터 버튼 클릭 핸들러
 * @returns 검색/필터 컨트롤 JSX 요소
 */
const FilterContainer: React.FC<FilterContainerProps> = ({
  onSearchClick,
  onFilterClick,
}) => {
  // const [isFeatureModalOpen, setFeatureModalOpen] = useState(false);

  return (
    <Container>
      {/* 검색 아이콘 */}
      <IconButton onClick={onSearchClick}>
        <img src={SearchIconSvg} alt='검색' />
      </IconButton>

      {/* 필터 아이콘 */}
      <FilterIconContainer onClick={onFilterClick}>
        <img src={FilterIcon} alt='필터' />
      </FilterIconContainer>
    </Container>
  );
};

export default FilterContainer;

/**
 * 전체 컨테이너
 *

 * 검색과 필터 버튼을 가로로 배치하는 컨테이너입니다.
 */
const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

/**
 * 아이콘 버튼
 *

 * 검색 아이콘을 포함하는 버튼입니다.
 * 호버 효과와 스타일을 제공합니다.
 */
const IconButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 4px;
  border: 1px solid #000;
  background-color: #fff;
  transition: background-color 0.3s ease;

  img {
    width: 16px;
    height: 16px;
    display: block;
  }

  &:hover {
    background-color: #e6e6e6;
  }
`;

/**
 * 필터 아이콘 컨테이너
 *

 * 필터 아이콘을 포함하는 버튼입니다.
 * 호버 효과와 스타일을 제공합니다.
 */
const FilterIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 4px;
  border: 1px solid #000;
  background-color: #fff;
  transition: background-color 0.3s ease;

  img {
    width: 20px;
    height: 16px;
    display: block;
  }

  &:hover {
    background-color: #e6e6e6;
  }
`;
