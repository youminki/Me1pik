import React from 'react';
import styled from 'styled-components';
import SearchIconImage from '/src/assets/BottomNav/SearchIcon.svg';
import GroupButtonIcon from '/src/assets/BottomNav/GroupButtonIcon.svg';

interface ControlSectionProps {
  toggleSort: () => void;
  sortBy: 'group' | 'category';
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

export const ControlSection: React.FC<ControlSectionProps> = ({
  toggleSort,
  sortBy,
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <Container>
      <ButtonContainer>
        <ControlButton onClick={toggleSort}>
          <Icon src={GroupButtonIcon} alt='그룹별 아이콘' />
          {sortBy === 'group' ? '그룹별' : '카테고리별'}
        </ControlButton>
        <ControlText>정렬</ControlText>
      </ButtonContainer>
      <SearchBar>
        <SearchInput
          placeholder='검색'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SearchIcon src={SearchIconImage} alt='검색 아이콘' />
      </SearchBar>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const ControlButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background: #f6ae24;
    color: #fff;
  }
`;

const ControlText = styled.p`
  font-weight: 700;
  font-size: 14px;
  color: #000;
`;

const Icon = styled.img`
  width: 13px;
  height: 16px;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  background: #fff;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  padding: 10px;
`;

const SearchIcon = styled.img`
  width: 16px;
  height: 16px;
  padding: 10px;
`;
