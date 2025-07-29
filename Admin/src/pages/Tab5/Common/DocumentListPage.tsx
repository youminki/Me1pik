import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import CommonSettingTable from '@components/Table/Setting/CommonSettingTable';
import SubHeader, { TabItem } from '@components/Header/SearchSubHeader';
import Pagination from '@components/Pagination';
import RegisterButton from '@components/RegisterButton';
import { advancedSearchFilter, normalize } from '@utils/advancedSearch';
// getTermsPolicyList, TermsPolicy import 삭제

// TableColumn 타입 정의 (제네릭)
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface DocumentListPageProps<T> {
  docType: string;
  tabList: TabItem[];
  columns: TableColumn<T>[];
  registerPath: string;
  detailPath: (id: number) => string;
  mapToRow: (item: T) => DocumentRow;
  fetchData: (params: { type: string; category?: string }) => Promise<T[]>;
}

// DocumentRow에 content, createdAt 필드 추가
interface DocumentRow {
  id: number;
  no: number;
  title: string;
  category: string;
  content: string;
  createdAt: string;
}

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

function DocumentListPageCore<T>({
  docType,
  tabList,
  columns,
  registerPath,
  detailPath,
  mapToRow,
  fetchData,
}: DocumentListPageProps<T>) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = (searchParams.get('search') ?? '').toLowerCase();
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const limit = 10;

  const [selectedTab, setSelectedTab] = useState<TabItem>(tabList[0]);
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. 최초 마운트 시 page 쿼리가 없으면 1로 세팅
  useEffect(() => {
    if (!searchParams.get('page')) {
      setSearchParams((prev) => {
        const entries = Object.fromEntries(prev.entries());
        entries.page = '1';
        return entries;
      });
    }
  }, []);

  // 2. fetchData useEffect에서는 setSearchParams를 절대 호출하지 않음
  useEffect(() => {
    let isMounted = true;
    const fetchDataInternal = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params: { type: string; category?: string } = { type: docType };
        if (selectedTab.label && selectedTab.label !== '전체보기') {
          params.category = selectedTab.label;
        }
        const items = await fetchData(params);
        if (isMounted) {
          setData(items);
        }
      } catch {
        if (isMounted) {
          setError(`${docType} 목록을 불러오는 중 오류가 발생했습니다.`);
          setData([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchDataInternal();
    return () => {
      isMounted = false;
    };
  }, [docType, selectedTab, fetchData]);

  // filtered에서 T의 속성 접근 대신 mapToRow를 먼저 적용
  const keywords = normalize(searchTerm).split(/\s+/).filter(Boolean);
  const filtered = useMemo(() => {
    return data.map(mapToRow).filter((item) =>
      advancedSearchFilter({
        item,
        keywords,
        fields: ['id', 'category', 'content', 'title', 'createdAt'],
      }),
    );
  }, [data, searchTerm, mapToRow]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const pageData = useMemo(
    () => filtered.slice((page - 1) * limit, (page - 1) * limit + limit),
    [filtered, page],
  );

  const onTabChange = useCallback((tab: TabItem) => {
    setSelectedTab(tab);
  }, []);

  const onRowClick = useCallback(
    (row: DocumentRow) => {
      console.log('row:', row); // row 전체 출력
      console.log('row.id:', row.id); // id 값 출력
      console.log('row.no:', row.no); // no 값 출력
      navigate(detailPath(row.no)); // row.id → row.no
    },
    [navigate, detailPath],
  );

  const onCreateClick = useCallback(() => {
    navigate(registerPath);
  }, [navigate, registerPath]);

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

  return (
    <Content>
      <SubHeader tabs={tabList} onTabChange={onTabChange} />
      <InfoBar>
        {isLoading ? (
          <TotalCountText>로딩 중...</TotalCountText>
        ) : error ? (
          <TotalCountText style={{ color: 'red' }}>{error}</TotalCountText>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
            <TotalCountText>Total: {filtered.length}</TotalCountText>
            {/* Chip row: TotalCount 오른쪽에 한 줄로 정렬 */}
            {chipKeywords.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', marginLeft: 12, minWidth: 0 }}>
                {chipKeywords.map((chip) => (
                  <Chip key={chip} label={chip} onDelete={() => handleDeleteChip(chip)} />
                ))}
              </div>
            )}
          </div>
        )}
      </InfoBar>
      <TableContainer>
        {error ? (
          <div>{error}</div>
        ) : (
          <CommonSettingTable
            columns={columns as TableColumn<DocumentRow>[]}
            data={pageData}
            onRowClick={onRowClick}
            minRows={10}
            isLoading={isLoading}
          />
        )}
      </TableContainer>
      <FooterRow>
        <Pagination
          totalPages={totalPages}
          currentPage={page}
          onPageChange={(newPage) => {
            setSearchParams((prev) => {
              const entries = Object.fromEntries(prev.entries());
              entries.page = String(newPage);
              return entries;
            });
          }}
          leftComponent={<RegisterButton text="등록하기" onClick={onCreateClick} />}
        />
      </FooterRow>
    </Content>
  );
}

export default DocumentListPageCore;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #fff;
  flex-grow: 1;
  padding: 10px;
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
  width: 100%;
  margin-top: 40px;
`;

// 스켈레톤 애니메이션 추가
const skeletonKeyframes = `
@keyframes skeleton {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}`;
if (typeof window !== 'undefined' && !document.getElementById('skeleton-keyframes')) {
  const style = document.createElement('style');
  style.id = 'skeleton-keyframes';
  style.innerHTML = skeletonKeyframes;
  document.head.appendChild(style);
}
