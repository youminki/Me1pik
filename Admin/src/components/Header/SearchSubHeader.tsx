import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiSearch } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';

/**
 * 검색 서브 헤더(SearchSubHeader)
 *
 * - 탭 기반 필터링과 검색 기능을 통합 제공
 * - URL 파라미터와 상태 동기화, 검색어 초기화 등 지원
 * - 재사용 가능한 공통 컴포넌트
 */

export interface TabItem {
  label: string;
  path: string;
}

/**
 * 탭 아이템 인터페이스
 * - 라벨과 경로 정보 포함
 */
interface SubHeaderProps {
  tabs: TabItem[];
  onTabChange?: (tab: TabItem) => void;
  onSearch?: (searchTerm: string) => void;
}

/**
 * 서브 헤더 props
 * - 탭 목록, 탭 변경/검색 콜백 등
 */
const SubHeader: React.FC<SubHeaderProps> = ({ tabs, onTabChange, onSearch }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>(tabs[0].label);
  const [inputValue, setInputValue] = useState<string>('');

  /**
   * URL(status)에 따라 activeTab 초기 동기화
   *
   * URL 파라미터의 status 값에 따라 활성 탭을 설정합니다.
   * 매칭되는 탭이 없으면 첫 번째 탭을 기본값으로 사용합니다.
   */
  useEffect(() => {
    const status = searchParams.get('status');
    const matched = tabs.find((t) => t.path === status);
    setActiveTab(matched ? matched.label : tabs[0].label);
  }, [searchParams, tabs]);

  /**
   * URL(search)에 따라 inputValue 동기화
   *
   * URL 파라미터의 search 값에 따라 검색 입력 필드를 동기화합니다.
   */
  useEffect(() => {
    setInputValue(searchParams.get('search') ?? '');
  }, [searchParams]);

  /**
   * 탭 클릭 시: status 변경 + search 초기화
   *
   * 탭을 클릭하면 해당 탭의 status로 URL을 업데이트하고
   * 검색어를 초기화하여 깨끗한 상태로 만듭니다.
   */
  const handleTabClick = (tab: TabItem) => {
    setActiveTab(tab.label);
    onTabChange?.(tab);

    // 검색어 초기화
    setInputValue('');

    /**
     * status만 갱신, 검색어 파라미터 제거
     *
     * 탭 변경 시에는 검색어를 제거하여 새로운 탭에서
     * 이전 검색 결과가 남아있지 않도록 합니다.
     */
    setSearchParams({ status: tab.path });
  };

  /**
   * 검색 실행 핸들러
   * - 현재 상태 유지하면서 검색어만 업데이트
   */
  const handleSearch = () => {
    const trimmed = inputValue.trim();
    const newParams: Record<string, string> = {};
    const currentStatus = searchParams.get('status');
    if (currentStatus) newParams.status = currentStatus;
    if (trimmed) newParams.search = trimmed;
    setSearchParams(newParams);

    // 검색 콜백 호출
    onSearch?.(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <HeaderContainer>
      <HeaderTabRow>
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
      </HeaderTabRow>
    </HeaderContainer>
  );
};

export default SubHeader;

const HeaderContainer = styled.div`
  background: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 20px 0px 0px 0px;
  padding: 1rem;
  margin-bottom: 10px;
  width: 100%;
  min-width: 834px;
  max-width: 100vw;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const HeaderTabRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TabContainer = styled.div`
  display: flex;
  align-items: center;
  background: #eeeeee;
  border: 1px solid #dddddd;
  border-radius: 8px;
  overflow: hidden;
  height: 40px;
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
