// src/components/FilterContainer.tsx
import React from 'react';
import styled from 'styled-components';

import FilterIcon from '../../assets/FilterIcon.svg';
import SearchIconSvg from '../../assets/homes/SearchIcon.svg';
// import ReusableModal from '../../components/ReusableModal';

interface FilterContainerProps {
  onSearchClick: () => void;
  onFilterClick: () => void;
}

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

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const IconButton = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  img {
    width: 16px;
    height: 16px;
    padding: 10px;
    border-radius: 4px;
    border: 1px solid #000;
    background-color: #fff;
    transition: background-color 0.3s ease;
  }
  &:hover img {
    background-color: #e6e6e6;
  }
`;

const FilterIconContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;

  img {
    width: 20px;
    height: 16px;
    padding: 10px 8px;
    border-radius: 4px;
    border: 1px solid #000;
    background-color: #fff;
    transition: background-color 0.3s ease;
  }

  &:hover img {
    background-color: #e6e6e6;
  }
`;
