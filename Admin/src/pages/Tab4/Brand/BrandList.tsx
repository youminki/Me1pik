// src/pages/Tab4/Brand/BrandList.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import BrandTable, { BrandItem } from '@components/Table/BrandTable';
import SubHeader, { TabItem } from '@components/Header/SearchSubHeader';
import TableWithRegisterButton from '@components/TableWithRegisterButton';
// API 불러오기
import { getAdminBrandList, AdminBrand } from '@api/brand/brandApi';
import { advancedSearchFilter, normalize } from '@utils/advancedSearch';

const mapAdminBrandToBrandItem = (b: AdminBrand): BrandItem => {
  const bWithExtra = b as AdminBrand & {
    productCount?: number;
    discount?: number;
    manager?: string;
    contact?: string;
    registerDate?: string;
    status?: string;
  };
  const quantity = typeof bWithExtra.productCount === 'number' ? bWithExtra.productCount : 0;

  let registerDateStr = '';
  if (bWithExtra.registerDate) {
    try {
      const date = new Date(bWithExtra.registerDate);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      registerDateStr = `${yyyy}-${mm}-${dd}`;
    } catch {
      registerDateStr = String(bWithExtra.registerDate);
    }
  }

  return {
    no: b.id,
    group: b.groupName,
    brand: b.brandName,
    quantity,
    discount: b.discount_rate,
    manager: b.contactPerson,
    contact: b.contactNumber,
    registerDate: registerDateStr,
    status: b.isActive ? '등록완료' : '계약종료',
  };
};

const tabs: TabItem[] = [
  { label: '전체보기', path: '' },
  { label: '등록완료', path: '등록완료' },
  { label: '등록대기', path: '등록대기' },
  { label: '계약종료', path: '계약종료' },
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

const BrandList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [brandData, setBrandData] = useState<BrandItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const searchTerm = (searchParams.get('search') ?? '').toLowerCase();
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const limit = 10;

  // 현재 선택된 탭 라벨은 status 파라미터로부터 유추
  const statusParam = searchParams.get('status');
  const activeTabLabel = tabs.find((tab) => tab.path === statusParam)?.label ?? '전체보기';

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

  useEffect(() => {
    const fetchAdminBrands = async () => {
      setIsLoading(true);
      try {
        const data = await getAdminBrandList();
        const mapped = data.map(mapAdminBrandToBrandItem);
        setBrandData(mapped);
      } catch (err) {
        console.error('관리자용 브랜드 목록 조회 실패:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminBrands();
  }, []);

  const handleTabChange = (tab: TabItem) => {
    const params = Object.fromEntries(searchParams.entries());
    params.page = '1';
    params.status = tab.path;
    setSearchParams(params);
  };

  // 필터링
  const dataByTab = brandData.filter((item) =>
    activeTabLabel === '전체보기' ? true : item.status === activeTabLabel,
  );
  const keywords = normalize(searchTerm).split(/\s+/).filter(Boolean);
  const filteredData = dataByTab.filter((item) =>
    advancedSearchFilter({
      item,
      keywords,
      fields: [
        'no',
        'group',
        'brand',
        'quantity',
        'discount',
        'manager',
        'contact',
        'registerDate',
        'status',
      ],
    }),
  );

  const totalCount = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const offset = (page - 1) * limit;
  const currentPageData = filteredData.slice(offset, offset + limit);

  const handleEdit = (no: number) => {
    navigate(`/branddetail/${no}`);
  };

  const handleRegisterClick = () => {
    navigate(`/branddetail/create`);
  };

  return (
    <Content>
      <HeaderTitle>브랜드 관리</HeaderTitle>
      <SubHeader tabs={tabs} onTabChange={handleTabChange} />
      <InfoBar>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
          <TotalCount>Total: {totalCount}</TotalCount>
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
      <TableWithRegisterButton
        registerButtonText="브랜드등록"
        onRegisterClick={handleRegisterClick}
        paginationProps={{
          totalPages,
          currentPage: page,
          onPageChange: (newPage) => {
            const params = Object.fromEntries(searchParams.entries());
            params.page = String(newPage);
            setSearchParams(params);
          },
        }}
      >
        <BrandTable filteredData={currentPageData} handleEdit={handleEdit} isLoading={isLoading} />
      </TableWithRegisterButton>
    </Content>
  );
};

export default BrandList;

/* styled-components */

const Content = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  flex-grow: 1;
  font-size: 14px;
  padding: 10px;
`;
const HeaderTitle = styled.h1`
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 18px;
`;
const InfoBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
`;
const TotalCount = styled.div`
  font-weight: 900;
  font-size: 12px;
`;
