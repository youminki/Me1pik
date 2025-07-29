// src/pages/CalculateList.tsx

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import CalculateListTable, { User } from '@components/Table/CalculateListTable';
import SubHeader, { TabItem } from '@components/Header/SearchSubHeader';
import Pagination from '@components/Pagination';
import { advancedSearchFilter, normalize } from '@utils/advancedSearch';

/** 탭 목록 */
const tabs: TabItem[] = [
  { label: '전체보기', path: '' },
  { label: '일반회원', path: '일반' },
  { label: '블럭회원', path: '블럭' },
];

/** 더미 데이터 (구매 횟수 제거) */
const dummyData: User[] = [
  {
    no: 13486,
    grade: '일반',
    name: '홍길동',
    nickname: '홍길동',
    instagram: 'styleweex',
    season: '2025 / 1분기',
    sellCount: '8개',
    totalSum: 1840000,
    profit: 184000,
    expectedProfit: 92000,
  },
  {
    no: 13485,
    grade: '일반',
    name: '홍길동',
    nickname: '홍길동',
    instagram: 'Cobrasin',
    season: '2025 / 1분기',
    sellCount: '8개',
    totalSum: 1840000,
    profit: 184000,
    expectedProfit: 92000,
  },
  {
    no: 13484,
    grade: '일반',
    name: '홍길동',
    nickname: '홍길동',
    instagram: 'mert__eunroae',
    season: '2025 / 1분기',
    sellCount: '8개',
    totalSum: 1840000,
    profit: 184000,
    expectedProfit: 92000,
  },
  {
    no: 13483,
    grade: '일반',
    name: '홍길동',
    nickname: '홍길동',
    instagram: 'jimmy.stayagram',
    season: '2025 / 1분기',
    sellCount: '8개',
    totalSum: 1840000,
    profit: 184000,
    expectedProfit: 92000,
  },
  {
    no: 13482,
    grade: '일반',
    name: '홍길동',
    nickname: '홍길동',
    instagram: 'mikyong___k',
    season: '2025 / 1분기',
    sellCount: '8개',
    totalSum: 1840000,
    profit: 184000,
    expectedProfit: 92000,
  },
  {
    no: 13481,
    grade: '일반',
    name: '홍길동',
    nickname: '홍길동',
    instagram: 'diva0629',
    season: '2025 / 1분기',
    sellCount: '8개',
    totalSum: 1840000,
    profit: 184000,
    expectedProfit: 92000,
  },
  {
    no: 13480,
    grade: '블럭',
    name: '홍길동',
    nickname: '홍길동',
    instagram: 'blossom520',
    season: '2025 / 1분기',
    sellCount: '8개',
    totalSum: 1840000,
    profit: 184000,
    expectedProfit: 92000,
  },
  {
    no: 13479,
    grade: '블럭',
    name: '홍길동',
    nickname: '홍길동',
    instagram: 'blossom520',
    season: '2025 / 1분기',
    sellCount: '8개',
    totalSum: 1840000,
    profit: 184000,
    expectedProfit: 92000,
  },
];

// Chip 컴포넌트 (제품 관리에서 복사)
const Chip = ({ label, onDelete }: { label: string; onDelete: () => void }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      background: '#e6f0fa',
      border: '1px solid #90caf9',
      borderRadius: 16,
      padding: '4px 14px',
      marginRight: 8,
      fontSize: 14,
      fontWeight: 500,
      color: '#1976d2',
      marginBottom: 4,
      boxShadow: '0 1px 4px rgba(25, 118, 210, 0.08)',
      transition: 'background 0.2s',
    }}
    onMouseOver={(e) => (e.currentTarget.style.background = '#bbdefb')}
    onMouseOut={(e) => (e.currentTarget.style.background = '#e6f0fa')}
  >
    {label}
    <button
      onClick={onDelete}
      style={{
        background: 'none',
        border: 'none',
        marginLeft: 8,
        cursor: 'pointer',
        fontWeight: 'bold',
        color: '#1976d2',
        fontSize: 16,
        lineHeight: 1,
        padding: 0,
        transition: 'color 0.2s',
      }}
      onMouseOver={(e) => (e.currentTarget.style.color = '#d32f2f')}
      onMouseOut={(e) => (e.currentTarget.style.color = '#1976d2')}
      aria-label="삭제"
    >
      ×
    </button>
  </span>
);

const CalculateList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = (searchParams.get('search') ?? '').toLowerCase();

  // URL 쿼리에서 현재 페이지 가져오기
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const limit = 10;

  const [selectedTab, setSelectedTab] = useState<TabItem>(tabs[0]);
  const [data] = useState<User[]>(dummyData);

  /** 탭 변경 시 URL의 page=1로 리셋 */
  const handleTabChange = (tab: TabItem) => {
    setSelectedTab(tab);
    const params = Object.fromEntries(searchParams.entries());
    params.page = '1';
    setSearchParams(params);
  };

  /** 1차: 탭별 필터링 */
  const dataByTab = data.filter((item) =>
    selectedTab.label === '전체보기' ? true : item.grade === selectedTab.path,
  );

  /** 2차: URL 검색어 필터링 */
  const keywords = normalize(searchTerm).split(/\s+/).filter(Boolean);
  const filteredData = dataByTab.filter((item) =>
    advancedSearchFilter({
      item,
      keywords,
      fields: [
        'no',
        'grade',
        'name',
        'nickname',
        'instagram',
        'season',
        'sellCount',
        'totalSum',
        'profit',
        'expectedProfit',
      ],
    }),
  );

  /** 페이지네이션 계산 및 슬라이스 */
  const totalCount = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const offset = (page - 1) * limit;
  const currentPageData = filteredData.slice(offset, offset + limit);

  // 검색어 키워드 분리 (공백 기준)
  const chipKeywords = searchTerm.trim().split(/\s+/).filter(Boolean);

  // Chip 삭제 핸들러
  const handleDeleteChip = (chip: string) => {
    const newKeywords = chipKeywords.filter((k) => k !== chip);
    const newSearch = newKeywords.join(' ');
    const params = Object.fromEntries(searchParams.entries());
    if (newSearch) params.search = newSearch;
    else delete params.search;
    setSearchParams(params);
  };

  const handleEdit = (no: number) => {
    navigate(`/calculatedetail/${no}`);
  };

  return (
    <Content>
      <HeaderTitle>정산내역</HeaderTitle>

      <SubHeader tabs={tabs} onTabChange={handleTabChange} />

      <InfoBar>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
          <TotalCountText>Total: {totalCount}</TotalCountText>
          {/* Chip row: TotalCount 오른쪽에 한 줄로 정렬 */}
          {chipKeywords.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', marginLeft: 12, minWidth: 0 }}>
              {chipKeywords.map((chip) => (
                <Chip key={chip} label={chip} onDelete={() => handleDeleteChip(chip)} />
              ))}
            </div>
          )}
        </div>
      </InfoBar>

      <TableContainer>
        <CalculateListTable filteredData={currentPageData} handleEdit={handleEdit} />
      </TableContainer>

      <FooterRow>
        <Pagination totalPages={totalPages} />
      </FooterRow>
    </Content>
  );
};

export default CalculateList;

/* ====================== Styled Components ====================== */

const Content = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  flex-grow: 1;
  font-size: 14px;
  padding: 10px;
`;

const HeaderTitle = styled.h1`
  text-align: left;

  font-weight: 700;
  font-size: 16px;
  margin-bottom: 18px;
`;

const InfoBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const TotalCountText = styled.div`
  font-weight: 900;
  font-size: 12px;
`;

const TableContainer = styled.div`
  min-width: 834px;
  max-width: 100vw;
  height: 600px;
  min-height: 600px;
  max-height: 600px;
  overflow-x: auto;
  overflow-y: auto;
  @media (max-width: 834px) {
    min-width: 100vw;
    padding: 0 8px;
  }
  @media (max-height: 1194px) {
    height: 400px;
    min-height: 400px;
    max-height: 400px;
  }
`;

const FooterRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40px;
`;
