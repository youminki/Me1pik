import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';

import {
  Brand as ApiBrand,
  getBrandList,
} from '@/api-utils/product-managements/brands/brandApi';
import { BrandList } from '@/components/brands/BrandList';
import { ControlSection } from '@/components/brands/ControlSection';
import BrandSearchModal from '@/components/brands/BrandSearchModal';
import StatsSection from '@/components/brands/StatsSection';
import PageHeader from '@/components/shared/headers/PageHeader';
import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { theme } from '@/styles/Theme';

interface LocalBrand {
  id: number;
  name: string;
  category: string; // API의 brand_category
  group: string; // API의 groupName
  company: string; // 필요 시 매핑
}

const Brand: React.FC = () => {
  const [apiBrands, setApiBrands] = useState<ApiBrand[]>([]);
  const [brands, setBrands] = useState<LocalBrand[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'group' | 'category'>('group');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

  // API 호출
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await getBrandList();
        setApiBrands(data);
      } catch (err) {
        console.error('브랜드 리스트 조회 실패:', err);
      }
    };
    fetchBrands();
  }, []);

  // 매핑: ApiBrand → LocalBrand
  useEffect(() => {
    const mapped: LocalBrand[] = apiBrands.map((b) => ({
      id: b.id,
      name: b.brandName,
      category: b.brand_category || '',
      group: b.groupName || '',
      company: '', // 필요 시 실제 필드 사용
    }));
    setBrands(mapped);
  }, [apiBrands]);

  // 검색: name, group, category 포함 여부로 필터링
  const filteredBrands = brands.filter((brand) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      brand.name.toLowerCase().includes(term) ||
      brand.group.toLowerCase().includes(term) ||
      brand.category.toLowerCase().includes(term)
    );
  });

  // 그룹핑: sortBy에 따라 groupName별 또는 category별로 묶기
  const groupedBrands: Record<string, LocalBrand[]> = filteredBrands.reduce(
    (acc: Record<string, LocalBrand[]>, brand) => {
      const key =
        sortBy === 'group' ? brand.group || '기타' : brand.category || '기타';
      if (!acc[key]) acc[key] = [];
      acc[key].push(brand);
      return acc;
    },
    {}
  );

  // 정렬: 그룹 키와 그룹 내 브랜드 정렬
  const sortedGroupedBrands: Record<string, LocalBrand[]> = {};
  Object.keys(groupedBrands)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
    .forEach((key) => {
      const arr = groupedBrands[key]
        .slice()
        .sort((x, y) =>
          x.name.localeCompare(y.name, undefined, { sensitivity: 'base' })
        );
      sortedGroupedBrands[key] = arr;
    });

  // 정렬 토글 함수
  const toggleSort = () => {
    setSortBy((prev) => (prev === 'group' ? 'category' : 'group'));
  };

  // 검색 모달 토글 함수
  const handleSearchModalToggle = (isOpen: boolean) => {
    setIsSearchModalOpen(isOpen);
  };

  // 검색 실행 함수
  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };

  // 검색어가 없을 때 3초 후 전체로 돌아가기
  useEffect(() => {
    if (!searchTerm) return;

    const timer = setTimeout(() => {
      setSearchTerm('');
    }, 3000);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 로딩 상태 처리
  if (!apiBrands.length && !brands.length) {
    return <LoadingSpinner label='브랜드 목록을 불러오는 중입니다...' />;
  }

  return (
    <ThemeProvider theme={theme}>
      <UnifiedHeader variant='default' />
      <Container>
        <PageHeader title='브랜드' subtitle='새로운 시즌 제품들을 내 손안에!' />

        {/* StatsSection: 전체 통계 */}
        <StatsSection
          brandCount={brands.length}
          productCount={apiBrands.reduce(
            (sum, b) => sum + (b.productCount || 0),
            0
          )}
        />

        <Divider />

        {/* ControlSection: 검색어와 정렬 토글 */}
        <ControlSection
          toggleSort={toggleSort}
          sortBy={sortBy}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSearchClick={() => handleSearchModalToggle(true)}
        />

        {/* BrandList: 그룹핑된 결과 */}
        <BrandList groupedBrands={sortedGroupedBrands} />

        {/* SearchModal: 브랜드 검색 모달 */}
        <BrandSearchModal
          isOpen={isSearchModalOpen}
          onClose={() => handleSearchModalToggle(false)}
          onSearch={handleSearch}
          placeholder='브랜드명을 입력하세요'
          initialValue={searchTerm}
        />
      </Container>
    </ThemeProvider>
  );
};

export default Brand;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fff;
  padding-bottom: 200px;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #dddddd;
  margin: 30px 0;
`;
