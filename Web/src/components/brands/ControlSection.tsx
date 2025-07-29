import React from 'react';
import styled from 'styled-components';
import SearchIconImage from '@/assets/homes/SearchIcon.svg';
import GroupButtonIcon from '@/assets/bottom-navigations/GroupButtonIcon.svg';

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
      <LeftRow>
        <ControlButton onClick={toggleSort}>
          <Icon src={GroupButtonIcon} alt='그룹별 아이콘' />
          {sortBy === 'group' ? '그룹별' : '카테고리별'}
        </ControlButton>
        <ControlText>정렬</ControlText>
      </LeftRow>
      <SearchBar>
        <SearchInput
          placeholder='검색'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <img
          src={SearchIconImage}
          alt='검색'
          style={{ width: 18, height: 18, padding: 8 }}
        />
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

const LeftRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;
