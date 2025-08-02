import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import SearchIconSvg from '@/assets/homes/SearchIcon.svg';
import ReusableModal from '@/components/shared/modals/ReusableModal';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  historyKey?: string;
  initialValue?: string;
}

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  placeholder = '브랜드 또는 설명으로 검색...',
  historyKey = 'searchHistory',
  initialValue = '',
}) => {
  const [searchInput, setSearchInput] = useState(initialValue);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem(historyKey);
    return saved ? JSON.parse(saved) : [];
  });

  // 모달이 열릴 때 초기값 설정
  useEffect(() => {
    if (isOpen) {
      setSearchInput(initialValue);
    }
  }, [isOpen, initialValue]);

  // 최근 검색어 최대 개수
  const MAX_HISTORY = 8;

  // 검색 히스토리 저장 함수
  const addToHistory = (keyword: string) => {
    if (!keyword.trim()) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item !== keyword);
      const newHistory = [keyword, ...filtered].slice(0, MAX_HISTORY);
      localStorage.setItem(historyKey, JSON.stringify(newHistory));
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
      <ModalSearchBar>
        <ModalSearchInput
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
        <ModalSearchIconButton onClick={handleSearch} aria-label='검색'>
          <img src={SearchIconSvg} alt='검색' />
        </ModalSearchIconButton>
      </ModalSearchBar>

      {/* 최근 검색어 히스토리 */}
      {searchHistory.length > 0 && (
        <HistoryContainer>
          <HistoryTitle>최근 검색어</HistoryTitle>
          <HistoryList>
            {searchHistory.map((item, idx) => (
              <HistoryItem
                key={item + idx}
                onClick={() => handleHistoryClick(item)}
              >
                {item}
              </HistoryItem>
            ))}
          </HistoryList>
        </HistoryContainer>
      )}
    </ReusableModal>
  );
};

export default SearchModal;

// Styled Components
const ModalSearchBar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-top: 18px;
  border-radius: 6px;
  overflow: hidden;
  border: 1.5px solid #ccc;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: #ffbe4b;
    box-shadow: 0 0 0 2px rgba(255, 190, 75, 0.2);
  }
`;

const ModalSearchInput = styled.input`
  border: none;
  border-radius: 0;
  font-size: 17px;
  padding: 12px 16px;
  width: 100%;
  outline: none;
  box-sizing: border-box;
  background: #fafafa;
  position: relative;

  &:focus {
    background: #ffffff;
  }
`;

const ModalSearchIconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  width: 48px;
  border: none;
  border-radius: 0;
  cursor: pointer;
  transition: background 0.2s;
  padding: 0;
  outline: none;
  background: #fafafa;

  &:hover {
    background: #ffbe4b;
  }

  &:focus {
    background: #ffbe4b;
  }

  img {
    width: 20px;
    height: 20px;
    filter: brightness(0.7);
  }
`;

const HistoryContainer = styled.div`
  margin-top: 24px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const HistoryTitle = styled.div`
  font-size: 14px;
  color: #888;
  margin-bottom: 8px;
  font-weight: 600;
`;

const HistoryList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0;
  margin: 0;
`;

const HistoryItem = styled.li`
  list-style: none;
  background: #f5f5f5;
  color: #333;
  border-radius: 16px;
  padding: 6px 16px;
  font-size: 15px;
  cursor: pointer;
  border: 1px solid #e0e0e0;
  transition:
    background 0.2s,
    color 0.2s;
  &:hover {
    background: #ffe6b8;
    color: #f6ae24;
  }
`;

const SearchButton = styled.button`
  flex: 1;
  height: 50px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background 0.2s;
  background-color: #ffbe4b;
  color: white;

  &:hover {
    background-color: #f6ae24;
  }
`;
