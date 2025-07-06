import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import Theme from '../../styles/Theme';
import { BrandList } from '../../components/Brand/BrandList';
import { ControlSection } from '../../components/Brand/ControlSection';
import StatsSection from '../../components/Brand/StatsSection';
import { getBrandList, Brand as ApiBrand } from '../../api/brand/brandApi';

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

  return (
    <ThemeProvider theme={Theme}>
      <Container>
        <Header>
          <Title>브랜드</Title>
          <Subtitle>새로운 시즌 제품들을 내 손안에!</Subtitle>
        </Header>

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
        />

        {/* BrandList: 그룹핑된 결과 */}
        <BrandList groupedBrands={sortedGroupedBrands} />
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
  padding: 1rem;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 6px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 800;
  color: #000;
  margin-bottom: 0px;
`;

const Subtitle = styled.p`
  font-size: 12px;
  font-weight: 400;
  color: #ccc;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #dddddd;
  margin: 30px 0;
`;
