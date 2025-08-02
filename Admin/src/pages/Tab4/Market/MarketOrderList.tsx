// src/pages/MarketOrderList.tsx

import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import MarketOrderListTable, { MarketOrderListItem } from '@components/Table/MarketOrderTable';
import SubHeader, { TabItem } from '@components/Header/SearchSubHeader';
import Pagination from '@components/Pagination';
import { advancedSearchFilter, normalize } from '@utils/advancedSearch';

/** 더미 데이터 (배송 관련 필드 제거, 결제 필드 추가) */
const dummyMarketOrderList: MarketOrderListItem[] = [
  {
    no: 13486,
    orderDate: '2024-12-12',
    buyerAccount: 'styleweex',
    brand: 'CC Collect',
    styleCode: '24AWSE231',
    size: '55 (M)',
    color: 'BLACK',
    paymentMethod: '일시불',
    paymentStatus: '결제완료',
  },
  {
    no: 13487,
    orderDate: '2024-12-12',
    buyerAccount: 'jmerr_sunwoo',
    brand: 'M.IO.DES.PHINE',
    styleCode: '20MEE090',
    size: '55 (M)',
    color: 'PINK',
    paymentMethod: '카드결제',
    paymentStatus: '결제대기',
  },
  {
    no: 13488,
    orderDate: '2024-12-12',
    buyerAccount: 'jimmyInstagram',
    brand: 'M.IO.DES.PHINE',
    styleCode: '20MEE090',
    size: '55 (M)',
    color: 'PINK',
    paymentMethod: '24개월 할부',
    paymentStatus: '결제완료',
  },
  {
    no: 13489,
    orderDate: '2024-12-12',
    buyerAccount: 'mikeyoons_k',
    brand: 'SATIN',
    styleCode: '24AGT603',
    size: '55 (M)',
    color: 'BLACK',
    paymentMethod: '계좌이체',
    paymentStatus: '결제완료',
  },
  {
    no: 13490,
    orderDate: '2024-12-12',
    buyerAccount: 'olive3625',
    brand: 'ZZOC',
    styleCode: 'Z24AW5609',
    size: '55 (M)',
    color: 'BLACK',
    paymentMethod: '카드결제',
    paymentStatus: '취소요청',
  },
  {
    no: 13491,
    orderDate: '2024-12-12',
    buyerAccount: 'blossomy529',
    brand: 'MOMOA',
    styleCode: '23APY010',
    size: '55 (M)',
    color: 'LIGHT BEIGE',
    paymentMethod: '카드결제',
    paymentStatus: '환불 진행중',
  },
  {
    no: 13492,
    orderDate: '2024-12-12',
    buyerAccount: 'blossomy529',
    brand: 'MICHAA',
    styleCode: 'MOAWPD010',
    size: '55 (M)',
    color: 'GRAY',
    paymentMethod: '24개월 할부',
    paymentStatus: '결제완료',
  },
  {
    no: 13493,
    orderDate: '2024-12-12',
    buyerAccount: 'blossomy529',
    brand: 'MICHAA',
    styleCode: 'MOAWPD210',
    size: '55 (M)',
    color: 'LIGHT BLUE',
    paymentMethod: '카드결제',
    paymentStatus: '환불완료',
  },
];

/** 서브헤더 탭 */
const tabs: TabItem[] = [
  { label: '전체보기', path: '' },
  { label: '진행내역', path: '진행내역' },
  { label: '취소내역', path: '취소' },
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

const MarketOrderList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = (searchParams.get('search') ?? '').toLowerCase();

  // 페이지 & 페이징 설정
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const limit = 10;

  const [selectedTab, setSelectedTab] = useState<TabItem>(tabs[0]);
  const [data] = useState<MarketOrderListItem[]>(dummyMarketOrderList);

  // 탭 변경 핸들러 (페이지 리셋)
  const handleTabChange = (tab: TabItem) => {
    setSelectedTab(tab);
    const params = Object.fromEntries(searchParams.entries());
    params.page = '1';
    setSearchParams(params);
  };

  // 탭별 필터링
  const dataByTab = data.filter((item) => {
    if (selectedTab.label === '전체보기') return true;
    if (selectedTab.label === '진행내역') {
      return !['취소요청', '환불 진행중', '결제실패'].includes(item.paymentStatus);
    }
    return ['취소요청', '환불 진행중', '결제실패'].includes(item.paymentStatus);
  });

  // 검색어 필터링
  const keywords = normalize(searchTerm).split(/\s+/).filter(Boolean);
  const filteredData = dataByTab.filter((item) =>
    advancedSearchFilter({
      item,
      keywords,
      fields: [
        'no',
        'orderDate',
        'buyerAccount',
        'brand',
        'styleCode',
        'size',
        'color',
        'paymentMethod',
        'paymentStatus',
      ],
    }),
  );

  // 페이징 로직
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

  // 상세 페이지로 이동
  const handleEdit = (no: number) => {
    navigate(`/Marketorderdetail/${no}`, {
      state: { selectOptions: tabs },
    });
  };

  return (
    <Content>
      <HeaderTitle>마켓 주문 내역</HeaderTitle>
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
        <MarketOrderListTable filteredData={currentPageData} handleEdit={handleEdit} />
      </TableContainer>

      <FooterRow>
        <Pagination totalPages={totalPages} />
      </FooterRow>
    </Content>
  );
};

export default MarketOrderList;

/* Styled Components */

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
  min-height: 600px;
  max-width: 100vw;
  overflow-x: auto;
  @media (max-width: 834px) {
    min-width: 100vw;
    padding: 0 8px;
  }
  @media (max-height: 1194px) {
    min-height: 400px;
  }
`;

const FooterRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40px;
`;
