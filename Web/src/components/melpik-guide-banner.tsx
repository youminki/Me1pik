import { useState, useEffect } from 'react';
import styled from 'styled-components';

import homeIcon1 from '@/assets/homes/homeIcon1.svg';
import homeIcon2 from '@/assets/homes/homeIcon2.svg';
import homeIcon3 from '@/assets/homes/homeIcon3.svg';
import homeIcon4 from '@/assets/homes/homeIcon4.svg';
import ReusableModal from '@/components/shared/modals/ReusableModal';

interface MelpikGuideBannerProps {
  onSearchSubmit?: (searchTerm: string) => void;
  onColorSelect?: (colors: string[]) => void;
  onSizeSelect?: (sizes: string[]) => void;
  selectedColors?: string[];
  selectedSizes?: string[];
}

const BannerWrapper = styled.div`
  width: 251px;
  height: 56px;
  background: #fff;
  border: 0.5px solid #ccc;
  border-radius: 6px;
  display: flex;
  align-items: center;
  position: relative;
  margin: 20px auto;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const IconBox = styled.div<{ isActive: boolean; disabled?: boolean }>`
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  position: relative;
  border-radius: 6px;
  background: ${(props) => {
    if (props.disabled) return '#f5f5f5';
    return props.isActive ? '#000' : 'transparent';
  }};
  transition: all 0.2s ease;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};

  &:hover {
    background: ${(props) => {
      if (props.disabled) return '#f5f5f5';
      return props.isActive ? '#000' : '#f5f5f5';
    }};
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 30px;
  background: #ddd;
`;

const IconImage = styled.img<{ isActive: boolean; disabled?: boolean }>`
  width: 22px;
  height: 22px;

  transition: all 0.2s ease;
  filter: ${(props) => {
    if (props.disabled) return 'grayscale(100%)';
    return props.isActive ? 'brightness(0) invert(1)' : 'none';
  }};

  &:hover {
    transform: ${(props) => (props.disabled ? 'none' : 'scale(1.05)')};
  }
`;

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

// 필터 모달 스타일
const FilterContainer = styled.div`
  width: 100%;
  max-width: 600px;
  max-height: 70vh;
  overflow-y: auto;
`;

const FilterSection = styled.div`
  margin: 20px 0;
`;

const FilterSectionTitle = styled.div`
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 10px;
  color: #000;
`;

const FilterButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const FilterButton = styled.button<{ selected: boolean }>`
  min-width: 55px;
  height: 36px;
  border-radius: 18px;
  border: 1px solid #000;
  background: ${({ selected }) => (selected ? '#000' : '#fff')};
  color: ${({ selected }) => (selected ? '#fff' : '#000')};
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ selected }) => (selected ? '#000' : '#f5f5f5')};
  }
`;

const ColorButton = styled(FilterButton)<{ $colorName: string }>`
  &:hover {
    background: ${({ selected, $colorName }) => {
      if (selected) return '#000';
      return colorMap[$colorName] || '#f5f5f5';
    }};
  }
`;

const FilterDivider = styled.hr`
  border: none;
  border-top: 1px dashed #ddd;
  margin: 20px 0;
`;

const FilterActionButton = styled.button<{ primary?: boolean }>`
  flex: 1;
  height: 50px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  background: ${({ primary }) => (primary ? '#000' : '#ccc')};
  color: #fff;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${({ primary }) => (primary ? '#333' : '#bbb')};
  }
`;

const InfoList = styled.ol`
  margin: 12px 0 0 16px;
  padding: 0;
  list-style: decimal;
  font-size: 14px;
  & li {
    margin-bottom: 8px;
  }
`;

// 색상 데이터
const sizeData = ['FREE', '44(S)', '55(M)', '66(L)', '77(XL)'];
const colorMap: Record<string, string> = {
  화이트: '#FFFFFF',
  블랙: '#000000',
  그레이: '#808080',
  네이비: '#001F5B',
  아이보리: '#ECEBE4',
  베이지: '#C8AD7F',
  브라운: '#7B4A2F',
  카키: '#4B5320',
  그린: '#2E8B57',
  블루: '#0000FF',
  퍼플: '#800080',
  버건디: '#800020',
  레드: '#FF0000',
  핑크: '#FFC0CB',
  옐로우: '#FFFF00',
  오렌지: '#FFA500',
};

const MelpikGuideBanner: React.FC<MelpikGuideBannerProps> = ({
  onSearchSubmit,
  onColorSelect,
  onSizeSelect,
  selectedColors = [],
  selectedSizes = [],
}) => {
  const [open, setOpen] = useState(false);
  const [modalType, setModalType] = useState<
    'guide' | 'temp1' | 'filter' | 'search'
  >('guide');
  const [activeIcon, setActiveIcon] = useState<
    'guide' | 'temp1' | 'filter' | 'search'
  >('guide');
  const [searchInput, setSearchInput] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // 필터 상태 (로컬 상태로 관리)
  const [localSelectedColors, setLocalSelectedColors] =
    useState<string[]>(selectedColors);
  const [localSelectedSizes, setLocalSelectedSizes] =
    useState<string[]>(selectedSizes);

  // 모달이 열릴 때 초기값 설정
  useEffect(() => {
    if (open && modalType === 'search') {
      setSearchInput('');
    }
    if (open && modalType === 'filter') {
      setLocalSelectedColors(selectedColors);
      setLocalSelectedSizes(selectedSizes);
    }
  }, [open, modalType, selectedColors, selectedSizes]);

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

  const handleIconClick = (type: 'guide' | 'temp1' | 'filter' | 'search') => {
    // 서비스1은 미구현이므로 클릭 무시
    if (type === 'temp1') {
      return;
    }

    setModalType(type);
    setActiveIcon(type);
    setOpen(true);
  };

  const handleSearch = () => {
    if (!searchInput.trim()) return;

    // 부모 컴포넌트에 검색어 전달
    if (onSearchSubmit) {
      onSearchSubmit(searchInput.trim());
    }

    // 검색 히스토리에 추가
    addToHistory(searchInput.trim());

    // 모달 닫기
    setOpen(false);
    setSearchInput('');
  };

  // 히스토리 아이템 클릭 처리
  const handleHistoryClick = (item: string) => {
    setSearchInput(item);
    if (onSearchSubmit) {
      onSearchSubmit(item);
    }
    addToHistory(item);
    setOpen(false);
  };

  // 필터 관련 함수들
  const toggleSelected = (
    list: string[],
    value: string,
    setFn: (l: string[]) => void
  ) => {
    setFn(
      list.includes(value) ? list.filter((i) => i !== value) : [...list, value]
    );
  };

  const handleColorClick = (color: string) => {
    toggleSelected(localSelectedColors, color, setLocalSelectedColors);
  };

  const handleSizeClick = (size: string) => {
    toggleSelected(localSelectedSizes, size, setLocalSelectedSizes);
  };

  const handleFilterApply = () => {
    if (onColorSelect) {
      onColorSelect(localSelectedColors);
    }
    if (onSizeSelect) {
      onSizeSelect(localSelectedSizes);
    }
    setOpen(false);
  };

  const handleFilterCancel = () => {
    setLocalSelectedColors(selectedColors);
    setLocalSelectedSizes(selectedSizes);
    setOpen(false);
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'guide':
        return '멜픽 - 이용안내';
      case 'temp1':
        return '서비스 1';
      case 'filter':
        return '필터';
      case 'search':
        return '제품 검색';
      default:
        return '멜픽 - 이용안내';
    }
  };

  const getModalActions = () => {
    if (modalType === 'search') {
      return <SearchButton onClick={handleSearch}>검색</SearchButton>;
    }
    if (modalType === 'filter') {
      return (
        <>
          <FilterActionButton onClick={handleFilterCancel}>
            취소
          </FilterActionButton>
          <FilterActionButton primary onClick={handleFilterApply}>
            설정 적용
          </FilterActionButton>
        </>
      );
    }
    return undefined;
  };

  const getModalContent = () => {
    switch (modalType) {
      case 'guide':
        return (
          <>
            <p>멜픽 서비스에서 대여 이용 시 아래 순서로 진행하세요:</p>
            <InfoList>
              <li>결제카드 등록</li>
              <li>이용권 결제</li>
              <li>대여제품 신청</li>
            </InfoList>
          </>
        );
      case 'temp1':
        return <p>서비스 1 - 구현 예정입니다.</p>;
      case 'filter':
        return (
          <FilterContainer>
            <FilterSection>
              <FilterSectionTitle>
                사이즈 (셋팅 :{' '}
                {localSelectedSizes.length > 0
                  ? localSelectedSizes.join(', ')
                  : '없음'}
                )
              </FilterSectionTitle>
              <FilterButtonRow>
                {sizeData.map((size) => (
                  <FilterButton
                    key={size}
                    selected={localSelectedSizes.includes(size)}
                    onClick={() => handleSizeClick(size)}
                  >
                    {size}
                  </FilterButton>
                ))}
              </FilterButtonRow>
            </FilterSection>

            <FilterDivider />

            <FilterSection>
              <FilterSectionTitle>
                색상 (셋팅 :{' '}
                {localSelectedColors.length > 0
                  ? localSelectedColors.join(', ')
                  : '없음'}
                )
              </FilterSectionTitle>
              <FilterButtonRow>
                {Object.keys(colorMap).map((color) => (
                  <ColorButton
                    key={color}
                    selected={localSelectedColors.includes(color)}
                    $colorName={color}
                    onClick={() => handleColorClick(color)}
                  >
                    {color}
                  </ColorButton>
                ))}
              </FilterButtonRow>
            </FilterSection>
          </FilterContainer>
        );
      case 'search':
        return (
          <>
            <SearchInputContainer>
              <SearchInput
                type='text'
                placeholder='브랜드 또는 설명으로 검색...'
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
              검색을 원하는 <strong>제품명</strong> 또는{' '}
              <strong>스타일 품번</strong>을 입력하세요.
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
          </>
        );
      default:
        return <p>서비스 가이드</p>;
    }
  };

  return (
    <>
      <BannerWrapper>
        <IconContainer>
          <IconBox
            isActive={activeIcon === 'guide'}
            onClick={() => handleIconClick('guide')}
          >
            <IconImage
              src={homeIcon1}
              alt='서비스 가이드'
              isActive={activeIcon === 'guide'}
            />
          </IconBox>
          <Divider />
          <IconBox
            isActive={activeIcon === 'temp1'}
            onClick={() => handleIconClick('temp1')}
            disabled={true}
          >
            <IconImage
              src={homeIcon2}
              alt='서비스 1'
              isActive={activeIcon === 'temp1'}
              disabled={true}
            />
          </IconBox>
          <Divider />
          <IconBox
            isActive={activeIcon === 'filter'}
            onClick={() => handleIconClick('filter')}
          >
            <IconImage
              src={homeIcon3}
              alt='필터'
              isActive={activeIcon === 'filter'}
            />
          </IconBox>
          <Divider />
          <IconBox
            isActive={activeIcon === 'search'}
            onClick={() => handleIconClick('search')}
          >
            <IconImage
              src={homeIcon4}
              alt='제품 검색'
              isActive={activeIcon === 'search'}
            />
          </IconBox>
        </IconContainer>
      </BannerWrapper>
      <ReusableModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={getModalTitle()}
        actions={getModalActions()}
      >
        {getModalContent()}
      </ReusableModal>
    </>
  );
};

export default MelpikGuideBanner;
