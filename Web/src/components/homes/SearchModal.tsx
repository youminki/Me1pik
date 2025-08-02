/**
 * 검색 모달 컴포넌트 (SearchModal.tsx)
 *
 * 상품 검색을 위한 모달 컴포넌트입니다.
 * 검색어 입력, 최근 검색어 히스토리, 로컬 스토리지 연동을 제공합니다.
 *
 * @description
 * - 검색어 입력 및 검색 실행
 * - 최근 검색어 히스토리 표시
 * - 로컬 스토리지 연동
 * - Enter 키 검색 지원
 * - 자동 포커스 및 접근성 지원
 */
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import SearchIconSvg from '@/assets/homes/SearchIcon.svg';
import ReusableModal from '@/components/shared/modals/ReusableModal';

/**
 * 검색 모달 Props
 *
 * @property isOpen - 모달 열림/닫힘 상태
 * @property onClose - 모달 닫기 핸들러
 * @property onSearch - 검색 실행 핸들러
 * @property placeholder - 검색 입력창 플레이스홀더 (선택)
 * @property historyKey - 로컬 스토리지 키 (선택)
 * @property initialValue - 초기 검색어 (선택)
 */
interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  historyKey?: string;
  initialValue?: string;
}

/**
 * 검색 모달 컴포넌트
 *

 * 상품 검색을 위한 모달을 렌더링합니다.
 * 검색어 입력, 히스토리 관리, 로컬 스토리지 연동을 포함합니다.
 *
 * @param isOpen - 모달 열림/닫힘 상태
 * @param onClose - 모달 닫기 핸들러
 * @param onSearch - 검색 실행 핸들러
 * @param placeholder - 검색 입력창 플레이스홀더 (기본값: '브랜드 또는 설명으로 검색...')
 * @param historyKey - 로컬 스토리지 키 (기본값: 'searchHistory')
 * @param initialValue - 초기 검색어 (기본값: '')
 * @returns 검색 모달 JSX 요소
 */
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

/**
 * 모달 검색 바
 *

 * 검색 입력창과 아이콘 버튼을 포함하는 검색 바입니다.
 */
const ModalSearchBar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-top: 18px;
`;

/**
 * 모달 검색 입력창
 *

 * 검색어를 입력하는 input 필드입니다.
 */
const ModalSearchInput = styled.input`
  border: 1.5px solid #ccc;
  border-radius: 6px 0 0 6px;
  font-size: 17px;
  padding: 12px 16px;
  width: 100%;
  outline: none;
  box-sizing: border-box;
  background: #fafafa;
`;

/**
 * 모달 검색 아이콘 버튼
 *

 * 검색 아이콘을 포함하는 버튼입니다.
 * 호버 효과를 제공합니다.
 */
const ModalSearchIconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  width: 48px;
  border: 1.5px solid #ccc;
  border-left: none;
  border-radius: 0 6px 6px 0;
  cursor: pointer;
  transition: background 0.2s;
  padding: 0;
  &:hover {
    background: #ffbe4b;
  }
  img {
    width: 20px;
    height: 20px;
    filter: brightness(0.7);
  }
`;

/**
 * 히스토리 컨테이너
 *

 * 최근 검색어 히스토리를 감싸는 컨테이너입니다.
 */
const HistoryContainer = styled.div`
  margin-top: 24px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

/**
 * 히스토리 제목
 *

 * '최근 검색어' 제목을 표시합니다.
 */
const HistoryTitle = styled.div`
  font-size: 14px;
  color: #888;
  margin-bottom: 8px;
  font-weight: 600;
`;

/**
 * 히스토리 리스트
 *

 * 최근 검색어들을 감싸는 리스트입니다.
 */
const HistoryList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0;
  margin: 0;
`;

/**
 * 히스토리 아이템
 *

 * 개별 최근 검색어를 표시하는 아이템입니다.
 * 클릭 시 해당 검색어로 검색을 실행합니다.
 */
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

/**
 * 검색 버튼
 *

 * 모달 하단의 검색 실행 버튼입니다.
 */
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
