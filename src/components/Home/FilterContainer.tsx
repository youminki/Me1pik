// src/components/FilterContainer.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import FilterIcon from '../../assets/FilterIcon.svg';
import ReusableModal from '../../components/ReusableModal';

const FilterContainer: React.FC = () => {
  const [isFeatureModalOpen, setFeatureModalOpen] = useState(false);

  return (
    <Container>
      <FilterIconContainer onClick={() => setFeatureModalOpen(true)}>
        <img src={FilterIcon} alt='필터' />
      </FilterIconContainer>

      <ReusableModal
        isOpen={isFeatureModalOpen}
        onClose={() => setFeatureModalOpen(false)}
        title='준비 중입니다'
      >
        아직 구현 전인 기능이에요.
      </ReusableModal>
    </Container>
  );
};

export default FilterContainer;

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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
    border: 1px solid #ccc;
    background-color: #f9f9f9;
    transition: background-color 0.3s ease;
  }

  &:hover img {
    background-color: #e6e6e6;
  }
`;
