// 필터 칩 컨테이너 컴포넌트 - 검색 및 필터링 기능을 제공하는 칩 컨테이너
import React, { memo } from 'react';
import styled from 'styled-components';

import FilterContainer from '@/components/homes/FilterContainer';
import SearchModal from '@/components/homes/SearchModal';
import FilterModal from '@/components/shared/modals/FilterModal';

// 스타일 컴포넌트들
const RowAlignBox = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 0;
`;

const ChipList = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-grow: 1;
  flex-shrink: 1;
  min-width: 0;
  flex-wrap: wrap;
  row-gap: 8px;
  max-width: 100vw;
  overflow-x: auto;
  white-space: nowrap;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const IconBox = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-left: 12px;
`;

const ClearAllButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  margin-right: 8px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const Chip = styled.div`
  display: flex;
  align-items: center;
  background: #f6f6f6;
  border-radius: 16px;
  padding: 0 10px;
  font-size: 13px;
  color: #333;
  height: 28px;
  font-weight: 600;
  border: 1px solid #e0e0e0;
`;

const ChipClose = styled.button`
  background: none;
  border: none;
  color: #888;
  font-size: 16px;
  margin-left: 4px;
  cursor: pointer;
  padding: 0;
`;

// 메모이제이션된 칩 컴포넌트
const MemoizedChip = memo<{
  label: string;
  onRemove: () => void;
}>(({ label, onRemove }) => (
  <Chip>
    {label}
    <ChipClose onClick={onRemove}>&times;</ChipClose>
  </Chip>
));

// 필터 칩 컨테이너 Props 인터페이스
interface FilterChipContainerProps {
  searchQuery: string; // 현재 검색어
  onSearchQueryChange: (query: string) => void; // 검색어 변경 핸들러
  onSearchSubmit: (searchTerm: string) => void; // 검색 제출 핸들러
  selectedColors: string[]; // 선택된 색상 목록
  selectedSizes: string[]; // 선택된 사이즈 목록
  onColorsChange: (colors: string[]) => void; // 색상 변경 핸들러
  onSizesChange: (sizes: string[]) => void; // 사이즈 변경 핸들러
  isSearchModalOpen: boolean; // 검색 모달 열림 상태
  isFilterModalOpen: boolean; // 필터 모달 열림 상태
  onSearchModalToggle: (isOpen: boolean) => void; // 검색 모달 토글 핸들러
  onFilterModalToggle: (isOpen: boolean) => void; // 필터 모달 토글 핸들러
  tempSelectedColors: string[]; // 임시 선택된 색상 목록
  tempSelectedSizes: string[]; // 임시 선택된 사이즈 목록
  onTempColorsChange: React.Dispatch<React.SetStateAction<string[]>>; // 임시 색상 변경 핸들러
  onTempSizesChange: React.Dispatch<React.SetStateAction<string[]>>; // 임시 사이즈 변경 핸들러
  historyKey?: string; // 검색 히스토리 키 (기본값: 'searchHistory')
  searchPlaceholder?: string; // 검색 플레이스홀더 (기본값: '브랜드 또는 설명으로 검색...')
  onClearAll?: () => void; // 전체 삭제 핸들러 (선택적)
}

// 메인 필터 칩 컨테이너 컴포넌트
const FilterChipContainer: React.FC<FilterChipContainerProps> = ({
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  selectedColors,
  selectedSizes,
  onColorsChange,
  onSizesChange,
  isSearchModalOpen,
  isFilterModalOpen,
  onSearchModalToggle,
  onFilterModalToggle,
  tempSelectedColors,
  tempSelectedSizes,
  onTempColorsChange,
  onTempSizesChange,
  historyKey = 'searchHistory',
  searchPlaceholder = '브랜드 또는 설명으로 검색...',
  onClearAll,
}) => {
  // 검색어 칩 삭제 핸들러
  const handleSearchChipDelete = (idx: number) => {
    const words = searchQuery.split(' ').filter(Boolean);
    words.splice(idx, 1);
    onSearchQueryChange(words.join(' '));
  };

  // 색상 칩 삭제 핸들러
  const handleColorChipDelete = (idx: number) => {
    const newColors = selectedColors.filter((_, i) => i !== idx);
    onColorsChange(newColors);
  };

  // 사이즈 칩 삭제 핸들러
  const handleSizeChipDelete = (idx: number) => {
    const newSizes = selectedSizes.filter((_, i) => i !== idx);
    onSizesChange(newSizes);
  };

  // 검색어를 단어별로 분리
  const searchWords = searchQuery.split(' ').filter(Boolean);
  const hasFilters =
    searchWords.length > 0 ||
    selectedColors.length > 0 ||
    selectedSizes.length > 0;

  return (
    <>
      {/* 필터 칩 컨테이너 */}
      {hasFilters && (
        <RowAlignBox>
          <ChipList>
            {/* 검색어 칩들 */}
            {searchWords.map((word, idx) => (
              <MemoizedChip
                key={`search-${idx}`}
                label={word}
                onRemove={() => handleSearchChipDelete(idx)}
              />
            ))}

            {/* 색상 칩들 */}
            {selectedColors.map((color, idx) => (
              <MemoizedChip
                key={`color-${idx}`}
                label={color}
                onRemove={() => handleColorChipDelete(idx)}
              />
            ))}

            {/* 사이즈 칩들 */}
            {selectedSizes.map((size, idx) => (
              <MemoizedChip
                key={`size-${idx}`}
                label={size}
                onRemove={() => handleSizeChipDelete(idx)}
              />
            ))}
          </ChipList>

          {/* 전체 삭제 버튼 */}
          {onClearAll && (
            <IconBox>
              <ClearAllButton onClick={onClearAll}>전체 삭제</ClearAllButton>
            </IconBox>
          )}
        </RowAlignBox>
      )}

      {/* 검색 및 필터 컨테이너 */}
      <FilterContainer
        onSearchClick={() => onSearchModalToggle(true)}
        onFilterClick={() => onFilterModalToggle(true)}
      />

      {/* 검색 모달 */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => onSearchModalToggle(false)}
        onSearch={onSearchSubmit}
        historyKey={historyKey}
        initialValue={searchQuery}
        placeholder={searchPlaceholder}
      />

      {/* 필터 모달 */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => onFilterModalToggle(false)}
        selectedColors={tempSelectedColors}
        setSelectedColors={onTempColorsChange}
        selectedSizes={tempSelectedSizes}
        setSelectedSizes={onTempSizesChange}
        onColorSelect={(colors) => {
          onColorsChange(colors);
          onFilterModalToggle(false);
        }}
        onSizeSelect={(sizes) => {
          onSizesChange(sizes);
          onFilterModalToggle(false);
        }}
      />
    </>
  );
};

export default FilterChipContainer;
