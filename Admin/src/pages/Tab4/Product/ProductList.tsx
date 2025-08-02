/**
 * 상품 목록(ProductList) 페이지
 *
 * - 상품 상태/카테고리/색상/브랜드 등 다양한 필터 및 일괄변경 지원
 * - react-query 기반 데이터 관리, 검색/정규화/매핑 등 유틸 포함
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import ProductTable from '@components/Table/ProductTable';
import SubHeader, { TabItem } from '@components/Header/SearchSubHeader';
import Pagination from '@components/Pagination';
import BulkChangeUI from '@components/BulkChangeUI';
import { useQuery } from '@tanstack/react-query';
import { getProducts, updateProductsStatus } from '@api/adminProduct';

/**
 * 상품 상태 탭 옵션
 * - 전체/등록완료/등록대기/판매종료 등
 */
const tabs: TabItem[] = [
  { label: '전체보기', path: '전체보기' },
  { label: '등록완료', path: '등록완료' },
  { label: '등록대기', path: '등록대기' },
  { label: '판매종료', path: '판매종료' },
];

/**
 * 상품 상태 옵션
 * - 등록완료/등록대기/판매종료 등 상태 값
 */
const statuses: Array<{ label: string; value: string }> = [
  { label: '등록완료', value: '1' },
  { label: '등록대기', value: '0' },
  { label: '판매종료', value: '2' },
];

/**
 * 색상 옵션
 * - 화이트, 블랙, 그레이 등 다양한 색상 옵션
 */
const colorOptions = [
  { label: '화이트', value: 'WHITE', ko: '화이트' },
  { label: '블랙', value: 'BLACK', ko: '블랙' },
  { label: '그레이', value: 'GRAY', ko: '그레이' },
  { label: '네이비', value: 'NAVY', ko: '네이비' },
  { label: '아이보리', value: 'IVORY', ko: '아이보리' },
  { label: '베이지', value: 'BEIGE', ko: '베이지' },
  { label: '브라운', value: 'BROWN', ko: '브라운' },
  { label: '카키', value: 'KHAKI', ko: '카키' },
  { label: '그린', value: 'GREEN', ko: '그린' },
  { label: '블루', value: 'BLUE', ko: '블루' },
  { label: '퍼플', value: 'PURPLE', ko: '퍼플' },
  { label: '버건디', value: 'BURGUNDY', ko: '버건디' },
  { label: '레드', value: 'RED', ko: '레드' },
  { label: '핑크', value: 'PINK', ko: '핑크' },
  { label: '옐로우', value: 'YELLOW', ko: '옐로우' },
  { label: '오렌지', value: 'ORANGE', ko: '오렌지' },
  { label: '마젠타', value: 'MAGENTA', ko: '마젠타' },
  { label: '민트', value: 'MINT', ko: '민트' },
  // 필요시 추가
];

/**
 * 카테고리 옵션
 * - 미니원피스, 미디원피스, 롱 원피스 등 다양한 카테고리 옵션
 */
const categoryOptions = [
  { label: '미니원피스', value: 'MiniDress', ko: '미니원피스' },
  { label: '미디원피스', value: 'MidiDress', ko: '미디원피스' },
  { label: '롱 원피스', value: 'LongDress', ko: '롱 원피스' },
  { label: '점프수트', value: 'JumpSuit', ko: '점프수트' },
  { label: '블라우스', value: 'Blouse', ko: '블라우스' },
  { label: '니트 상의', value: 'KnitTop', ko: '니트 상의' },
  { label: '셔츠 상의', value: 'ShirtTop', ko: '셔츠 상의' },
  { label: '미니 스커트', value: 'MiniSkirt', ko: '미니 스커트' },
  { label: '미디 스커트', value: 'MidiSkirt', ko: '미디 스커트' },
  { label: '롱 스커트', value: 'LongSkirt', ko: '롱 스커트' },
  { label: '팬츠', value: 'Pants', ko: '팬츠' },
  { label: '자켓', value: 'Jacket', ko: '자켓' },
  { label: '코트', value: 'Coat', ko: '코트' },
  { label: '탑', value: 'Top', ko: '탑' },
  { label: '티셔츠', value: 'Tshirt', ko: '티셔츠' },
  { label: '가디건', value: 'Cardigan', ko: '가디건' },
  { label: '베스트', value: 'Best', ko: '베스트' },
  { label: '패딩', value: 'Padding', ko: '패딩' },
  // 필요시 추가
];

/**
 * 색상/카테고리/브랜드 한영 매핑 및 정규화 유틸
 * - 한글/영문/유사어 모두 검색 가능하도록 지원
 */
const getColorKo = (color: string) => {
  if (!color) return '';
  const found = colorOptions.find((opt) => opt.value.toLowerCase() === color.toLowerCase());
  return found ? found.ko : color;
};

/**
 * 카테고리 한글 매핑 함수
 * - 영문 카테고리 값을 한글로 변환하는 함수
 */
const getCategoryKo = (category: string) => {
  if (!category) return '';
  const found = categoryOptions.find((opt) => opt.value.toLowerCase() === category.toLowerCase());
  return found ? found.ko : category;
};

/**
 * 문자열 정규화 함수
 * - 공백, 특수문자 제거 및 소문자 변환
 */
function normalize(str: string) {
  return (str || '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^\w가-힣]/g, '');
}

// 색상 한영 매핑 테이블
const colorMap: Record<string, string[]> = {};
colorOptions.forEach((opt) => {
  colorMap[normalize(opt.ko)] = [normalize(opt.ko), normalize(opt.value)];
  colorMap[normalize(opt.value)] = [normalize(opt.ko), normalize(opt.value)];
});

// 브랜드 유사어/한영 매핑 (예시)
const brandMap: Record<string, string[]> = {
  [normalize('대현')]: [
    normalize('대현'),
    normalize('(주)대현'),
    normalize('㈜대현'),
    normalize('daehyun'),
  ],
  // 필요시 추가
};

// 카테고리 한영 매핑 테이블 및 전체 키워드 배열
const categoryMap: Record<string, string[]> = {};
const allCategoryKeywords: string[] = [];
categoryOptions.forEach((opt) => {
  const arr = [normalize(opt.ko), normalize(opt.value), normalize(opt.label)];
  arr.forEach((key) => {
    categoryMap[key] = arr;
    if (!allCategoryKeywords.includes(key)) allCategoryKeywords.push(key);
  });
});

/**
 * 칩 컴포넌트
 * - 필터 표시를 위한 칩 컴포넌트
 */
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

/**
 * 상품 목록 페이지 컴포넌트
 * - 상품 목록을 표시하고 관리하는 메인 컴포넌트
 */
const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL 파라미터
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const searchTerm = (searchParams.get('search') ?? '').toLowerCase();
  const statusParam = searchParams.get('status') ?? tabs[0].path;

  const matchedTab = tabs.find((t) => t.path === statusParam) || tabs[0];
  const [selectedTab, setSelectedTab] = useState<TabItem>(matchedTab);

  // 전체 데이터
  const [newStatus, setNewStatus] = useState<string>('');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const limit = 10;

  // React Query로 상품 목록 불러오기
  const { data: allData = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      // 1. 전체 개수 먼저 조회
      const first = await getProducts({ status: undefined, search: undefined, page: 1, limit: 1 });
      const total = first.totalCount;
      // 2. 전체 데이터 한 번에 조회
      const res = await getProducts({
        status: undefined,
        search: undefined,
        page: 1,
        limit: total,
      });
      return res.items.map((item) => ({
        no: item.no,
        styleCode: item.styleCode,
        brand: item.brand,
        category: item.category,
        color: item.color,
        size: item.size,
        price: item.retailPrice,
        registerDate: item.registerDate,
        status: item.status,
      }));
    },
    staleTime: 1000 * 60 * 5, // 5분 캐싱
  });

  // 탭 URL 동기화
  useEffect(() => {
    setSelectedTab(matchedTab);
  }, [matchedTab]);

  /**
   * 탭 변경 핸들러
   * - 탭 클릭 시 URL 파라미터와 상태를 업데이트하는 핸들러
   */
  const handleTabChange = (tab: TabItem) => {
    setSelectedTab(tab);
    const params = Object.fromEntries(searchParams.entries());
    params.status = tab.path;
    params.page = '1';
    delete params.search;
    setSearchParams(params);
  };

  // 2) 탭 필터링
  const dataByTab = allData.filter((item) =>
    selectedTab.path === '전체보기' ? true : item.status === selectedTab.path,
  );

  // 3) 검색 고도화 (복수 키워드 AND, 색상/카테고리/브랜드 한영/유사어/부분일치)
  const txt = normalize(searchTerm);
  const keywords = txt.split(/\s+/).filter(Boolean);
  const filtered = dataByTab.filter((item) => {
    return keywords.every((word) => {
      // 색상 한영 동시 매칭
      if (
        Object.keys(colorMap).some(
          (key) => key.includes(word) && colorMap[key].includes(normalize(item.color ?? '')),
        )
      )
        return true;
      // 카테고리 한영/라벨/부분일치(포함)
      if (
        Object.keys(categoryMap).some(
          (key) => key.includes(word) && categoryMap[key].includes(normalize(item.category ?? '')),
        )
      )
        return true;
      // 브랜드 유사어/한영/부분일치(포함)
      if (
        Object.keys(brandMap).some(
          (key) => key.includes(word) && brandMap[key].includes(normalize(item.brand ?? '')),
        )
      )
        return true;
      // 기존 검색(부분 포함)
      return (
        normalize(String(item.no)).includes(word) ||
        normalize(item.styleCode ?? '').includes(word) ||
        normalize(item.brand ?? '').includes(word) ||
        normalize(item.category ?? '').includes(word) ||
        normalize(item.color ?? '').includes(word) ||
        normalize(String(item.price)).includes(word) ||
        normalize(item.status ?? '').includes(word)
      );
    });
  });

  // 4) 클라이언트 페이지네이션
  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  /**
   * 일괄 변경 핸들러
   * - 선택된 상품들의 상태를 일괄적으로 변경하는 핸들러
   */
  const handleBulkChange = async () => {
    if (!newStatus) {
      alert('변경할 상태를 선택해주세요.');
      return;
    }
    if (selectedRows.size === 0) {
      alert('변경할 상품을 선택해주세요.');
      return;
    }
    try {
      await updateProductsStatus({
        ids: Array.from(selectedRows),
        registration: parseInt(newStatus, 10),
      });

      const label = statuses.find((s) => s.value === newStatus)?.label || '';
      // 데이터가 캐시되어 있으므로 직접 업데이트
      // setAllData((prev) =>
      //   prev.map((item) => (selectedRows.has(item.no) ? { ...item, status: label } : item)),
      // );
      alert(`선택된 ${selectedRows.size}개 상품을 "${label}" 상태로 변경했습니다.`);
      setSelectedRows(new Set());
      setNewStatus('');
    } catch (err) {
      console.error('일괄 변경 실패', err);
      alert('일괄 변경 중 오류가 발생했습니다.');
    }
  };

  /**
   * 행 토글 핸들러
   * - 개별 행의 선택 상태를 토글하는 핸들러
   */
  const toggleRow = (no: number) => {
    const copy = new Set(selectedRows);
    if (copy.has(no)) {
      copy.delete(no);
    } else {
      copy.add(no);
    }
    setSelectedRows(copy);
  };
  /**
   * 전체 토글 핸들러
   * - 모든 행의 선택 상태를 토글하는 핸들러
   */
  const toggleAll = () => {
    if (selectedRows.size === paginated.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginated.map((i) => i.no)));
    }
  };

  /**
   * 편집 핸들러
   * - 상품 편집 페이지로 이동하는 핸들러
   */
  const handleEdit = (_styleCode: string, no: number) => {
    navigate(`/productdetail/${no}${window.location.search}`);
  };

  // 검색어 키워드 분리 (공백 기준)
  const chipKeywords = useMemo(() => searchTerm.trim().split(/\s+/).filter(Boolean), [searchTerm]);

  /**
   * 칩 삭제 핸들러
   * - 필터 칩을 삭제하는 핸들러
   */
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
      <HeaderTitle>제품 관리</HeaderTitle>
      <SubHeader tabs={tabs} onTabChange={handleTabChange} />

      <InfoBar>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
          <TotalCount>Total: {filtered.length}건</TotalCount>
          {/* Chip row: TotalCount 오른쪽에 한 줄로 정렬 */}
          {chipKeywords.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', marginLeft: 12, minWidth: 0 }}>
              {chipKeywords.map((chip) => (
                <Chip key={chip} label={chip} onDelete={() => handleDeleteChip(chip)} />
              ))}
            </div>
          )}
        </div>
        <div style={{ marginLeft: 16, whiteSpace: 'nowrap', flexShrink: 0 }}>
          <BulkChangeUI
            newStatus={newStatus}
            onStatusChange={setNewStatus}
            onBulkChange={handleBulkChange}
            statusOptions={statuses}
            selectedCount={selectedRows.size}
            isLoading={isLoading}
          />
        </div>
      </InfoBar>

      <TableContainer>
        <ProductTable
          filteredData={paginated.map((item) => ({
            ...item,
            color: getColorKo(item.color),
            category: getCategoryKo(item.category),
          }))}
          handleEdit={handleEdit}
          startNo={(page - 1) * limit}
          selectedRows={selectedRows}
          toggleRow={toggleRow}
          toggleAll={toggleAll}
          isLoading={isLoading}
        />
      </TableContainer>

      <FooterRow>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => {
            const params = Object.fromEntries(searchParams.entries());
            params.page = p.toString();
            setSearchParams(params);
          }}
        />
      </FooterRow>
    </Content>
  );
};

export default ProductList;

/* Styled Components */
const Content = styled.div`
  display: flex;
  flex-direction: column;
  background: #fff;
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
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
`;
const TotalCount = styled.div`
  font-weight: 900;
  font-size: 12px;
`;
const TableContainer = styled.div`
  min-width: 834px;
  max-width: 100vw;
  min-height: 500px;
  overflow-x: auto;
  @media (max-width: 834px) {
    min-width: 100vw;
    padding: 0 8px;
  }
`;
const FooterRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40px;
`;
