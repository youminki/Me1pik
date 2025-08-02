// src/pages/brands/BrandDetail.tsx

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import {
  Brand as ApiBrand,
  getBrandList,
} from '@/api-utils/product-managements/brands/brandApi';
import {
  getProductsByBrand,
  Product as ApiProduct,
} from '@/api-utils/product-managements/products/product';
import StatsSection from '@/components/brands/StatsSection';
import ItemList, { UIItem } from '@/components/homes/ItemList';
import SubHeader from '@/components/homes/SubHeader';
import ErrorMessage from '@/components/shared/ErrorMessage';
import FilterChipContainer from '@/components/shared/FilterChipContainer';
import PageHeader from '@/components/shared/headers/PageHeader';
import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';
import NoResultMessageComponent from '@/components/shared/NoResultMessage';
import ProductDetailModal from '@/components/shared/ProductDetailModal';
import ScrollToTopButtonComponent from '@/components/shared/ScrollToTopButton';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useNoResultHandler } from '@/hooks/useNoResultHandler';
import { useProductFilter } from '@/hooks/useProductFilter';
import { useScrollToTop } from '@/hooks/useScrollToTop';

/**
 * BrandDetail 페이지 - 최적화 버전
 * - 모든 카테고리 상품을 미리 로드하여 카테고리 전환 시 즉시 표시
 * - 검색/필터 useMemo 적용
 * - 무한스크롤 IntersectionObserver 적용
 * - 상태 최소화, 타입 보강, 주석 추가
 */

interface LocalBrand {
  id: number;
  name: string;
  category: string;
  group: string;
  company?: string;
  productCount: number;
}

const BrandDetail: React.FC = () => {
  const { brandId } = useParams<{ brandId: string }>();
  const idNum = brandId ? parseInt(brandId, 10) : NaN;
  const [searchParams, setSearchParams] = useSearchParams();

  // UnifiedHeader 검색창에서 ?search=... 이 설정되면 여기서 읽어옴
  const searchTerm = searchParams.get('search')?.trim().toLowerCase() || '';

  // 검색어 상태 (searchTerm → searchQuery로 네이밍 통일)
  const [searchQuery, setSearchQuery] = useState(searchTerm || '');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  // 브랜드 정보 상태
  const [brand, setBrand] = useState<LocalBrand | null>(null);

  // 모든 카테고리의 상품을 미리 로드
  const [allProducts, setAllProducts] = useState<ApiProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [errorProducts, setErrorProducts] = useState<string>('');

  // 카테고리 필터: 초기값은 URL의 category 파라미터 or 'All'
  const initialCat = searchParams.get('category') || 'All';
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);

  // 모바일 뷰 여부
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const handleResize = useCallback(() => {
    setIsMobileView(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // viewCols 상태 및 관련 로직 제거, 아래처럼 고정값으로 대체
  const viewCols = useMemo(() => (isMobileView ? 2 : 4), [isMobileView]);

  // 스크롤 맨 위로 이동 (재사용 가능한 훅 사용)
  const { scrollToTop } = useScrollToTop();

  // URL 쿼리 'category' 변경 시 selectedCategory에 반영
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    } else {
      setSelectedCategory('All');
    }
  }, [searchParams]);

  // selectedCategory 변경 시 URL 동기화 (search 파라미터는 유지)
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (selectedCategory && selectedCategory !== 'All') {
      params.set('category', selectedCategory);
    } else {
      params.delete('category');
    }
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  // 브랜드 정보 로드
  useEffect(() => {
    if (isNaN(idNum)) {
      return;
    }
    setLoadingProducts(true);
    setErrorProducts('');
    (async () => {
      try {
        const list: ApiBrand[] = await getBrandList();
        const data = list.find((b) => b.id === idNum) || null;
        if (data) {
          setBrand({
            id: data.id,
            name: data.brandName,
            category: data.brand_category || '',
            group: data.groupName || '',
            company: '',
            productCount: data.productCount || 0,
          });
        } else {
          setErrorProducts('해당 브랜드를 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('브랜드 정보 조회 실패:', err);
        setErrorProducts('브랜드 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoadingProducts(false);
      }
    })();
  }, [idNum]);

  // 모든 카테고리의 제품을 한 번에 로드
  useEffect(() => {
    if (!brand) return;
    setLoadingProducts(true);
    setErrorProducts('');
    (async () => {
      try {
        // 모든 카테고리의 제품을 한 번에 가져오기
        const data = await getProductsByBrand(brand.id);
        setAllProducts(data);
      } catch (err) {
        console.error('제품 목록 조회 실패:', err);
        setErrorProducts('제품 목록을 불러오는 중 오류가 발생했습니다.');
        setAllProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    })();
  }, [brand]);

  // 카테고리별로 상품을 분류하여 캐시
  const categorizedProducts = useMemo(() => {
    if (!allProducts) return {};

    const categorized: Record<string, ApiProduct[]> = {};

    // 모든 상품을 카테고리별로 분류
    allProducts.forEach((product) => {
      const category = product.category || 'All';
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(product);
    });

    // 'All' 카테고리는 모든 상품을 포함
    categorized['All'] = allProducts;

    return categorized;
  }, [allProducts]);

  // 현재 선택된 카테고리의 상품들
  const currentCategoryProducts = useMemo(() => {
    return categorizedProducts[selectedCategory] || [];
  }, [categorizedProducts, selectedCategory]);

  // 검색/필터된 상품 목록 (재사용 가능한 훅 사용)
  const { filteredProducts } = useProductFilter({
    products: currentCategoryProducts,
    searchQuery,
    selectedColors,
    selectedSizes,
  });

  // 상세 모달 ID
  const modalId = searchParams.get('id');
  const isModalOpen = Boolean(modalId);

  // 제품 클릭: 모달 열기 (URL에 id 설정). 기존 category/search 유지
  const handleItemClick = useCallback(
    (prodId: string) => {
      const params = new URLSearchParams(searchParams);
      if (selectedCategory && selectedCategory !== 'All') {
        params.set('category', selectedCategory);
      }
      if (searchQuery) {
        params.set('search', searchQuery);
      }
      params.set('id', prodId);
      setSearchParams(params, { replace: true });
    },
    [searchParams, selectedCategory, searchQuery, setSearchParams]
  );

  // 모달 닫기: query에서 id 제거, category/search 유지
  const handleCloseModal = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete('id');
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  // 공유 핸들러
  const handleShare = useCallback(async () => {
    const shareData = {
      title: document.title,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('공유 실패', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
      } catch (err) {
        console.error('클립보드 복사 실패', err);
      }
    }
  }, []);

  // 검색 모달 상태
  const [isSearchModalOpen, setSearchModalOpen] = useState(false);
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [tempSelectedColors, setTempSelectedColors] = useState<string[]>([]);
  const [tempSelectedSizes, setTempSelectedSizes] = useState<string[]>([]);

  // 필터/검색 chip 삭제 핸들러
  useEffect(() => {
    if (isFilterModalOpen) {
      setTempSelectedColors(selectedColors);
      setTempSelectedSizes(selectedSizes);
    }
  }, [isFilterModalOpen, selectedColors, selectedSizes]);

  // 필터 칩 제거 시 검색어와 필터 초기화
  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedColors([]);
    setSelectedSizes([]);
    // URL에서 search 파라미터 제거
    setSearchParams(
      (prev) => {
        const params = Object.fromEntries(prev.entries());
        delete params.search;
        return params;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  // UIItem 매핑 (filteredProducts 기준)
  const uiItems: UIItem[] = useMemo(() => {
    return filteredProducts.map((it) => ({
      id: it.id.toString(),
      image: it.image || '',
      brand: brand?.name || '',
      description: it.description || '',
      price: it.price || 0,
      discount: it.discount || 0,
      isLiked: false,
    }));
  }, [filteredProducts, brand?.name]);

  // 무한스크롤 (재사용 가능한 훅 사용)
  const { visibleItems, observerRef } = useInfiniteScroll({
    items: uiItems,
    resetKey: selectedCategory, // 카테고리 변경 시 초기화
  });

  // 검색 결과 없음 처리 (재사용 가능한 훅 사용)
  const { showNoResult, countdown } = useNoResultHandler({
    items: uiItems,
    searchQuery,
    selectedColors,
    selectedSizes,
    isLoading: loadingProducts,
    selectedCategory,
    onClearFilters: handleClearFilters,
    setSearchParams,
  });

  // 에러 처리
  if (errorProducts) {
    return <ErrorMessage message={errorProducts} />;
  }

  return (
    <>
      <UnifiedHeader variant='oneDepth' />
      <PageWrapper>
        <Container>
          <PageHeader
            title={brand?.name || '브랜드'}
            subtitle='새로운 시즌 제품들을 내 손안에!'
          />

          <StatsSection
            brandCount={1}
            productCount={brand?.productCount || 0}
          />
          <Divider />

          <SubHeader
            selectedCategory={selectedCategory}
            setSelectedCategory={(cat) => {
              setSelectedCategory(cat);
              // 카테고리 변경 시 스크롤을 맨 위로 이동
              setTimeout(() => {
                scrollToTop();
              }, 100);
            }}
            onCategoryClick={() => {
              // 카테고리 클릭 시 스크롤을 맨 위로 이동
              setTimeout(() => {
                scrollToTop();
              }, 100);
            }}
            isLoading={loadingProducts}
          />

          {/* 필터 및 열 선택 */}
          <FilterChipContainer
            searchQuery={searchQuery}
            onSearchQueryChange={(query) => {
              setSearchQuery(query);
              // URL 동기화
              setSearchParams(
                (prev) => {
                  const params = Object.fromEntries(prev.entries());
                  if (query.trim()) {
                    params.search = query;
                  } else {
                    delete params.search;
                  }
                  return params;
                },
                { replace: true }
              );
            }}
            onSearchSubmit={(searchTerm) => {
              setSearchQuery(searchTerm);
              setSelectedCategory('All');
              setSearchParams(
                { category: 'All', search: searchTerm },
                { replace: true }
              );
            }}
            selectedColors={selectedColors}
            selectedSizes={selectedSizes}
            onColorsChange={setSelectedColors}
            onSizesChange={setSelectedSizes}
            isSearchModalOpen={isSearchModalOpen}
            isFilterModalOpen={isFilterModalOpen}
            onSearchModalToggle={setSearchModalOpen}
            onFilterModalToggle={setFilterModalOpen}
            tempSelectedColors={tempSelectedColors}
            tempSelectedSizes={tempSelectedSizes}
            onTempColorsChange={setTempSelectedColors}
            onTempSizesChange={setTempSelectedSizes}
            historyKey='brandSearchHistory'
            onClearAll={handleClearFilters}
          />

          {/* 제품 리스트 or 로딩 스피너 */}
          <MainContent>
            {loadingProducts ? (
              <ItemList items={[]} columns={viewCols} isLoading={true} />
            ) : showNoResult ? (
              <ContentWrapper>
                <NoResultMessageComponent countdown={countdown} />
              </ContentWrapper>
            ) : (
              <>
                <ItemList
                  items={visibleItems}
                  columns={viewCols}
                  onItemClick={handleItemClick}
                  observerRef={observerRef as React.RefObject<HTMLDivElement>}
                />
                <div ref={observerRef} style={{ height: 1 }} />
              </>
            )}
          </MainContent>

          {/* 하단 스크롤 탑 버튼(유지) */}
          <ScrollToTopButtonComponent onClick={scrollToTop} />
        </Container>

        {/* 상세 모달 */}
        <ProductDetailModal
          isOpen={isModalOpen}
          modalId={modalId}
          onClose={handleCloseModal}
          onShare={handleShare}
        />
      </PageWrapper>
    </>
  );
};

export default BrandDetail;

// styled components (기존 그대로)
const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: #fff;
  margin: auto;
  width: 100%;
  position: relative;
  min-height: 100vh; /* CLS 개선을 위한 최소 높이 설정 */
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #ddd;
  margin: 30px 0 0;
`;

// styled-components: Home.tsx에서 ContentWrapper, NoResultText, CountdownText 복사 (파일 하단에 위치)
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  margin: auto;
  min-height: 100vh; /* CLS 개선을 위한 최소 높이 설정 */
`;
const MainContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;

  width: 100%;
  min-height: 400px; /* CLS 개선을 위한 최소 높이 설정 */
`;

// styled-components: Home.tsx에서 ContentWrapper, NoResultMessage 복사
const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px; /* CLS 개선을 위한 최소 높이 설정 */
`;
