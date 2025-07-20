import React from 'react';
import styled from 'styled-components';
import SearchIcon from '../assets/customer-services/SearchIcon.svg';

type PeriodSectionProps = {
  selectedPeriod: number;
  setSelectedPeriod: (period: number) => void;
};

const PeriodSection: React.FC<PeriodSectionProps> = ({
  selectedPeriod,
  setSelectedPeriod,
}) => {
  return (
    <SettlementHeader>
      <PeriodSelector>
        <PeriodButton
          active={selectedPeriod === 3}
          onClick={() => setSelectedPeriod(3)}
        >
          공지
        </PeriodButton>
        <PeriodButton
          active={selectedPeriod === 6}
          onClick={() => setSelectedPeriod(6)}
        >
          안내
        </PeriodButton>
      </PeriodSelector>

      <SearchBarContainer>
        <SearchInput placeholder='검색' />
        <SearchIconImg src={SearchIcon} alt='search' />
      </SearchBarContainer>
    </SettlementHeader>
  );
};

export default PeriodSection;

const SettlementHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  background: #f3f3f3;
  border: 1px solid #dddddd;
  padding: 10px;
  white-space: nowrap;
`;

const PeriodSelector = styled.div`
  display: flex;
  flex-shrink: 0;
  margin-right: 10px;
`;

const PeriodButton = styled.button<{ active: boolean }>`
  padding: 8px 12px;

  height: 36px;
  margin-right: 8px;
  border-radius: 18px;

  font-weight: 700;
  font-size: 12px;
  line-height: 11px;
  color: ${({ active }) => (active ? '#fff' : '#000')};
  background: ${({ active }) => (active ? '#000' : '#fff')};
  border: 1px solid ${({ active }) => (active ? '#000' : '#ccc')};
  cursor: pointer;
  white-space: nowrap;
`;

const SearchBarContainer = styled.div`
  display: flex;
  align-items: center;

  height: 40px;
  box-sizing: border-box;
  background: #ffffff;
  border: 1px solid #dddddd;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  padding: 0 10px;
`;

const SearchIconImg = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 12px;
  cursor: pointer;
`;
