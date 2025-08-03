import React from 'react';
import styled from 'styled-components';

import GroupButtonIcon from '@/assets/bottom-navigations/GroupButtonIcon.svg';
import SearchIcon from '@/assets/homes/SearchIcon.svg';

interface ControlSectionProps {
  toggleSort: () => void;
  sortBy: 'group' | 'category';
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  onSearchClick: () => void;
}

export const ControlSection: React.FC<ControlSectionProps> = ({
  toggleSort,
  sortBy,
  searchTerm,
  setSearchTerm,
  onSearchClick,
}) => {
  const handleChipDelete = () => {
    setSearchTerm('');
  };

  return (
    <Container>
      <LeftRow>
        <ControlButton onClick={toggleSort}>
          <Icon src={GroupButtonIcon} alt='그룹별 아이콘' />
          {sortBy === 'group' ? '그룹별' : '카테고리별'}
        </ControlButton>
        <ControlText>정렬</ControlText>
        {searchTerm && (
          <SearchChip>
            <SearchChipText>{searchTerm}</SearchChipText>
            <SearchChipDelete onClick={handleChipDelete}>×</SearchChipDelete>
          </SearchChip>
        )}
      </LeftRow>
      <SearchButton onClick={onSearchClick}>
        <SearchIconImage src={SearchIcon} alt='검색' />
      </SearchButton>
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
  border: 1px solid #000000;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background: #f6ae24;
    color: #fff;
  }
`;

const ControlText = styled.p`
  font-weight: 700;
  font-size: 12px;
  color: #000;
`;

const Icon = styled.img`
  width: 13px;
  height: 16px;
`;

const SearchChip = styled.div`
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  padding: 6px 12px;
  margin-left: 8px;
  gap: 6px;
`;

const SearchChipText = styled.span`
  font-size: 13px;
  color: #333;
`;

const SearchChipDelete = styled.button`
  background: none;
  border: none;
  color: #999;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #666;
  }
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid #000000;
  border-radius: 5px;
  background: #fff;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #f5f5f5;
  }
`;

const SearchIconImage = styled.img`
  width: 18px;
  height: 18px;
`;

const LeftRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;
