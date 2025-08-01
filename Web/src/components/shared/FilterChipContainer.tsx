import React, { memo } from 'react';
import styled from 'styled-components';

import FilterContainer from '@/components/homes/FilterContainer';
import SearchModal from '@/components/homes/SearchModal';
import FilterModal from '@/components/shared/modals/FilterModal';

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

const MemoizedChip = memo<{
  label: string;
  onRemove: () => void;
}>(({ label, onRemove }) => (
  <Chip>
    {label}
    <ChipClose onClick={onRemove}>&times;</ChipClose>
  </Chip>
));
MemoizedChip.displayName = 'MemoizedChip';

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  margin: 20px 0;
`;

interface FilterChipContainerProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearchSubmit: (searchTerm: string) => void;
  selectedColors: string[];
  selectedSizes: string[];
  onColorsChange: (colors: string[]) => void;
  onSizesChange: (sizes: string[]) => void;
  isSearchModalOpen: boolean;
  isFilterModalOpen: boolean;
  onSearchModalToggle: (isOpen: boolean) => void;
  onFilterModalToggle: (isOpen: boolean) => void;
  tempSelectedColors: string[];
  tempSelectedSizes: string[];
  onTempColorsChange: React.Dispatch<React.SetStateAction<string[]>>;
  onTempSizesChange: React.Dispatch<React.SetStateAction<string[]>>;
  historyKey?: string;
  searchPlaceholder?: string;
  onClearAll?: () => void;
}

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
  const handleSearchChipDelete = (idx: number) => {
    const terms = searchQuery
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const newTerms = terms.filter((_, i) => i !== idx);
    onSearchQueryChange(newTerms.join(', '));
  };
  const handleColorChipDelete = (idx: number) => {
    const newColors = selectedColors.filter((_, i) => i !== idx);
    onColorsChange(newColors);
  };
  const handleSizeChipDelete = (idx: number) => {
    const newSizes = selectedSizes.filter((_, i) => i !== idx);
    onSizesChange(newSizes);
  };

  // 필터가 있는지 확인
  const hasFilters =
    searchQuery.trim() || selectedColors.length > 0 || selectedSizes.length > 0;

  return (
    <ControlsContainer>
      <RowAlignBox>
        <ChipList>
          {searchQuery.trim() &&
            searchQuery
              .split(',')
              .map((kw) => kw.trim())
              .filter(Boolean)
              .map((kw, idx) => (
                <MemoizedChip
                  key={kw + idx}
                  label={kw}
                  onRemove={() => handleSearchChipDelete(idx)}
                />
              ))}
          {selectedColors.map((color, idx) => (
            <MemoizedChip
              key={color + idx}
              label={color}
              onRemove={() => handleColorChipDelete(idx)}
            />
          ))}
          {selectedSizes.map((size, idx) => (
            <MemoizedChip
              key={size + idx}
              label={size}
              onRemove={() => handleSizeChipDelete(idx)}
            />
          ))}
        </ChipList>
        <IconBox>
          {hasFilters && onClearAll && (
            <ClearAllButton onClick={onClearAll}>모두 지우기</ClearAllButton>
          )}
          <FilterContainer
            onSearchClick={() => onSearchModalToggle(true)}
            onFilterClick={() => onFilterModalToggle(true)}
          />
        </IconBox>
      </RowAlignBox>
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => onSearchModalToggle(false)}
        onSearch={onSearchSubmit}
        historyKey={historyKey}
        initialValue={searchQuery}
        placeholder={searchPlaceholder}
      />
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => onFilterModalToggle(false)}
        onColorSelect={(colors) => {
          onColorsChange(colors);
          onFilterModalToggle(false);
        }}
        onSizeSelect={(sizes) => {
          onSizesChange(sizes);
          onFilterModalToggle(false);
        }}
        selectedColors={tempSelectedColors}
        setSelectedColors={onTempColorsChange}
        selectedSizes={tempSelectedSizes}
        setSelectedSizes={onTempSizesChange}
      />
    </ControlsContainer>
  );
};

export default FilterChipContainer;
