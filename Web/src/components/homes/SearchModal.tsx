import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import ReusableModal from '@/components/shared/modals/ReusableModal';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  initialValue?: string;
}

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  placeholder = '검색하실 내용을 입력하세요',
  initialValue = '',
}) => {
  const [searchInput, setSearchInput] = useState(initialValue);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // 모달이 열릴 때 초기값 설정
  useEffect(() => {
    if (isOpen) {
      setSearchInput(initialValue);
    }
  }, [isOpen, initialValue]);

  // 최근 검색어 최대 개수
  const MAX_HISTORY = 5;

  // 검색 히스토리 저장 함수
  const addToHistory = (keyword: string) => {
    if (!keyword.trim()) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item !== keyword);
      const newHistory = [keyword, ...filtered].slice(0, MAX_HISTORY);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  // 검색 실행 함수
  const handleSearch = () => {
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
      addToHistory(searchInput.trim());
      onClose();
    }
  };

  // 히스토리 아이템 클릭 처리
  const handleHistoryClick = (item: string) => {
    setSearchInput(item);
    onSearch(item);
    addToHistory(item);
    onClose();
  };

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title='제품 검색'
      actions={
        <SearchButton onClick={handleSearch} aria-label='검색'>
          검색
        </SearchButton>
      }
    >
      <SearchInputContainer>
        <SearchInput
          type='text'
          placeholder={placeholder}
          value={searchInput}
          autoFocus
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
      </SearchInputContainer>

      <GuidanceText>
        검색을 원하는 <strong>제품명</strong> 또는 <strong>스타일 품번</strong>
        을 입력하세요.
      </GuidanceText>

      <RecentSearchContainer>
        <RecentSearchTitle>최근 검색어</RecentSearchTitle>
        {searchHistory.length > 0 ? (
          <RecentSearchList>
            {searchHistory.map((item, index) => (
              <RecentSearchItem
                key={index}
                onClick={() => handleHistoryClick(item)}
              >
                {item}
              </RecentSearchItem>
            ))}
          </RecentSearchList>
        ) : (
          <NoRecentSearch>최근 검색어가 없습니다</NoRecentSearch>
        )}
      </RecentSearchContainer>
    </ReusableModal>
  );
};

export default SearchModal;

// Styled Components
const SearchInputContainer = styled.div`
  margin-top: 20px;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 16px;
  min-width: 200px;
  border: 1px solid #000000;
  font-size: 16px;
  outline: none;
  box-sizing: border-box;
  background: #fff;

  &:focus {
    border-color: #000;
  }

  &::placeholder {
    color: #999;
  }
`;

const GuidanceText = styled.div`
  margin-top: 12px;
  font-weight: 400;
  font-size: 12px;
  color: #000000;
  line-height: 1.4;
`;

const RecentSearchContainer = styled.div`
  margin-top: 20px;
  width: 100%;
`;

const RecentSearchTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
`;

const RecentSearchList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const RecentSearchItem = styled.div`
  background: #f5f5f5;
  color: #333;
  border-radius: 16px;
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid #e0e0e0;
  transition: background 0.2s;

  &:hover {
    background: #e8e8e8;
  }
`;

const NoRecentSearch = styled.div`
  font-size: 13px;
  color: #999;
  text-align: center;
  padding: 20px 0;
`;

const SearchButton = styled.button`
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  background-color: #000;
  color: white;
  margin-top: 20px;

  &:hover {
    background-color: #333;
  }
`;
