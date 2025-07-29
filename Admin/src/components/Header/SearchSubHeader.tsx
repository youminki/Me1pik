import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiSearch } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';

export interface TabItem {
  label: string;
  path: string;
}

interface SubHeaderProps {
  tabs: TabItem[];
  onTabChange?: (tab: TabItem) => void;
}

const SubHeader: React.FC<SubHeaderProps> = ({ tabs, onTabChange }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>(tabs[0].label);
  const [inputValue, setInputValue] = useState<string>('');

  // URL(status)에 따라 activeTab 초기 동기화
  useEffect(() => {
    const status = searchParams.get('status');
    const matched = tabs.find((t) => t.path === status);
    setActiveTab(matched ? matched.label : tabs[0].label);
  }, [searchParams, tabs]);

  // URL(search)에 따라 inputValue 동기화
  useEffect(() => {
    setInputValue(searchParams.get('search') ?? '');
  }, [searchParams]);

  // 탭 클릭 시: status 변경 + search 초기화
  const handleTabClick = (tab: TabItem) => {
    setActiveTab(tab.label);
    onTabChange?.(tab);

    // 검색어 초기화
    setInputValue('');

    // status만 갱신, 검색어 파라미터 제거
    setSearchParams({ status: tab.path });
  };

  // 검색 실행: status 유지, search 업데이트
  const handleSearch = () => {
    const trimmed = inputValue.trim();
    const newParams: Record<string, string> = {};
    const currentStatus = searchParams.get('status');
    if (currentStatus) newParams.status = currentStatus;
    if (trimmed) newParams.search = trimmed;
    setSearchParams(newParams);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <HeaderContainer>
      <TabContainer>
        {tabs.map((tab, idx) => (
          <TabButton
            key={idx}
            $active={activeTab === tab.label}
            $isFirst={idx === 0}
            $isLast={idx === tabs.length - 1}
            onClick={() => handleTabClick(tab)}
          >
            {tab.label}
          </TabButton>
        ))}
      </TabContainer>
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="검색"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <SearchIcon onClick={handleSearch} />
      </SearchContainer>
    </HeaderContainer>
  );
};

export default SubHeader;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background: #f9f9f9;
  border: 1px solid #dddddd;
  margin-bottom: 34px;
  min-width: 800px;
`;

const TabContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: auto;
  background: #eeeeee;
  border: 1px solid #dddddd;
  border-radius: 8px;
`;

interface TabButtonProps {
  $active: boolean;
  $isFirst?: boolean;
  $isLast?: boolean;
}

const TabButton = styled.button<TabButtonProps>`
  min-width: 110px;
  position: relative;
  background-color: ${({ $active }) => ($active ? '#f0f0f0' : '#ffffff')};
  color: ${({ $active }) => ($active ? '#007bff' : '#000000')};
  border: none;
  border-right: 1px solid #cccccc;
  padding: 14px 27px;

  font-weight: 700;
  font-size: 12px;
  line-height: 13px;
  text-align: center;
  cursor: pointer;

  ${({ $isFirst, $isLast }) =>
    $isFirst
      ? 'border-top-left-radius: 8px; border-bottom-left-radius: 8px;'
      : $isLast
        ? 'border-top-right-radius: 8px; border-bottom-right-radius: 8px;'
        : ''}

  &:last-child {
    border-right: none;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const SearchInput = styled.input`
  padding: 12px;
  font-size: 14px;
  border: 1px solid #dddddd;
  border-radius: 4px;
  width: 230px;
  padding-right: 30px;
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  right: 10px;
  font-size: 16px;
  color: #6c757d;
  cursor: pointer;
`;
