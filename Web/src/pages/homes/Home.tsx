// src/pages/homes.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import { useProducts } from '@/api-utils/product-managements/uploads/productApi';
import Footer from '@/components/homes/Footer';
import ItemList, { UIItem } from '@/components/homes/ItemList';
import SubHeader from '@/components/homes/SubHeader';
import MelpikGuideBanner from '@/components/melpik-guide-banner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import FilterChipContainer from '@/components/shared/FilterChipContainer';
import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';
import ReusableModal from '@/components/shared/modals/ReusableModal';
import NoResultMessageComponent from '@/components/shared/NoResultMessage';
import ProductDetailModal from '@/components/shared/ProductDetailModal';
import ScrollToTopButtonComponent from '@/components/shared/ScrollToTopButton';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useNoResultHandler } from '@/hooks/useNoResultHandler';
import { useProductFilter } from '@/hooks/useProductFilter';
import { useScrollToTop } from '@/hooks/useScrollToTop';
/**
 * Home(상품 리스트) 페이지 - 최적화 버전
 * - react-query로 상품 데이터 관리(캐싱/중복방지)
 * - 검색/필터 useMemo 적용
 * - 무한스크롤 IntersectionObserver 적용
 * - 상태 최소화, 타입 보강, 주석 추가
 * - 모든 카테고리 상품을 미리 로드하여 카테고리 전환 시 즉시 표시
 */

const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // 공유 모달 상태
  const [isShareModalOpen, setShareModalOpen] = useState(false);

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

  // 카테고리/검색
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'All'
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );

  // 필터 상태
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  // 모든 카테고리의 상품을 미리 로드
  const allProductsQuery = useProducts('all');

  // 카테고리별로 상품을 분류하여 캐시
  const categorizedProducts = useMemo(() => {
    if (!allProductsQuery.data) return {};

    const categorized: Record<string, typeof allProductsQuery.data> = {};

    // 모든 상품을 카테고리별로 분류
    allProductsQuery.data.forEach((product) => {
      const category = product.category || 'All';
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(product);
    });

    // 'All' 카테고리는 모든 상품을 포함
    categorized['All'] = allProductsQuery.data;

    return categorized;
  }, [allProductsQuery.data]);

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

  // UIItem 변환 (모든 상품을 한 번에 불러옴)
  const uiItems: UIItem[] = useMemo(() => {
    const result = filteredProducts.map((p) => ({
      id: p.id.toString(),
      image: p.image || '',
      brand: p.brand || '',
      description: p.description || '',
      price: p.price || 0,
      discount: p.discount || 0,
      isLiked: p.isLiked || false,
    }));

    // 첫 번째 이미지 프리로드 (간단하게)
    if (result.length > 0) {
      const firstImage = result[0].image.split('#')[0];
      if (firstImage && !document.querySelector(`link[href="${firstImage}"]`)) {
        const img = new window.Image();
        img.src = firstImage;
      }
    }

    return result;
  }, [filteredProducts]);

  // URL 동기화
  useEffect(() => {
    const c = searchParams.get('category') || 'All';
    const s = searchParams.get('search') || '';
    setSelectedCategory(c);
    setSearchQuery(s);
  }, [searchParams]);

  // 상세 모달
  const modalId = searchParams.get('id');
  const isModalOpen = Boolean(modalId);
  const [isFeatureModalOpen, setFeatureModalOpen] = useState(false);

  // 모달이 열릴 때 body 스크롤 잠금, 닫힐 때 해제
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  // 스크롤 맨 위로 이동 (재사용 가능한 훅 사용)
  const { scrollToTop } = useScrollToTop();

  // 상세 모달 핸들러
  const handleOpenModal = useCallback(
    (id: string) => {
      const params: Record<string, string> = {};
      if (searchParams.get('category')) params.category = selectedCategory;
      if (searchParams.get('search')) params.search = searchQuery;
      params.id = id;
      setSearchParams(params, { replace: true });
    },
    [searchParams, selectedCategory, searchQuery, setSearchParams]
  );

  const handleCloseModal = useCallback(() => {
    const params = Object.fromEntries(searchParams.entries());
    delete params.id;
    setSearchParams(params, { replace: true });
    setFeatureModalOpen(false);
  }, [searchParams, setSearchParams]);

  // 공유하기 핸들러도 useCallback 적용
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
        setShareModalOpen(true);
      } catch (err) {
        console.error('클립보드 복사 실패', err);
      }
    }
  }, []);

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
    isLoading: allProductsQuery.isLoading,
    selectedCategory,
    onClearFilters: useCallback(() => {
      // 모든 필터 상태를 한 번에 초기화
      setSearchQuery('');
      setSelectedColors([]);
      setSelectedSizes([]);
      setSelectedCategory('All');

      // URL 파라미터 정리 (setTimeout으로 상태 업데이트 후 실행)
      setTimeout(() => {
        setSearchParams(
          (prev) => {
            const params = Object.fromEntries(prev.entries());
            delete params.search;
            delete params.category;
            return params;
          },
          { replace: true }
        );
      }, 0);
    }, [setSearchParams]),
    setSearchParams,
  });

  // 에러 처리
  if (allProductsQuery.isError) {
    return (
      <ErrorMessage
        message={
          allProductsQuery.error?.message || '상품을 불러오지 못했습니다.'
        }
      />
    );
  }

  // 로딩 중에는 스켈레톤만 렌더링
  if (allProductsQuery.isLoading) {
    return (
      <MainContainer>
        <MelpikGuideBanner
          onSearchSubmit={(searchTerm) => {
            setSearchQuery(searchTerm);
            setSelectedCategory('All');
            setSearchParams(
              { category: 'All', search: searchTerm },
              { replace: true }
            );
          }}
          onColorSelect={(colors) => {
            setSelectedColors(colors);
          }}
          onSizeSelect={(sizes) => {
            setSelectedSizes(sizes);
          }}
          selectedColors={selectedColors}
          selectedSizes={selectedSizes}
        />
        <SubHeader
          selectedCategory={selectedCategory}
          setSelectedCategory={(cat) => {
            setSearchQuery('');
            setSearchParams({ category: cat }, { replace: true });
          }}
          onCategoryClick={() => setSearchQuery('')}
          isLoading={allProductsQuery.isLoading}
        />

        {/* 필터 칩 표시 */}
        <FilterChipContainer
          searchQuery={searchQuery}
          onSearchQueryChange={(query) => {
            setSearchQuery(query);
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
          isSearchModalOpen={false}
          isFilterModalOpen={false}
          onSearchModalToggle={() => {}}
          onFilterModalToggle={() => {}}
          tempSelectedColors={selectedColors}
          tempSelectedSizes={selectedSizes}
          onTempColorsChange={setSelectedColors}
          onTempSizesChange={setSelectedSizes}
          searchPlaceholder='브랜드 또는 설명으로 검색...'
        />

        <ContentWrapper>
          <ItemList items={[]} columns={viewCols} isLoading={true} />
        </ContentWrapper>
        <Footer />
        <ScrollToTopButtonComponent onClick={scrollToTop} />
      </MainContainer>
    );
  }
  if (showNoResult) {
    return (
      <MainContainer>
        <MelpikGuideBanner
          onSearchSubmit={(searchTerm) => {
            setSearchQuery(searchTerm);
            setSelectedCategory('All');
            setSearchParams(
              { category: 'All', search: searchTerm },
              { replace: true }
            );
          }}
          onColorSelect={(colors) => {
            setSelectedColors(colors);
          }}
          onSizeSelect={(sizes) => {
            setSelectedSizes(sizes);
          }}
          selectedColors={selectedColors}
          selectedSizes={selectedSizes}
        />
        <SubHeader
          selectedCategory={selectedCategory}
          setSelectedCategory={(cat) => {
            setSearchQuery('');
            setSearchParams({ category: cat }, { replace: true });
          }}
          onCategoryClick={() => setSearchQuery('')}
          isLoading={allProductsQuery.isLoading}
        />

        {/* 필터 칩 표시 */}
        <FilterChipContainer
          searchQuery={searchQuery}
          onSearchQueryChange={(query) => {
            setSearchQuery(query);
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
          isSearchModalOpen={false}
          isFilterModalOpen={false}
          onSearchModalToggle={() => {}}
          onFilterModalToggle={() => {}}
          tempSelectedColors={selectedColors}
          tempSelectedSizes={selectedSizes}
          onTempColorsChange={setSelectedColors}
          onTempSizesChange={setSelectedSizes}
          searchPlaceholder='브랜드 또는 설명으로 검색...'
        />

        <ContentWrapper>
          <NoResultMessageComponent countdown={countdown} />
        </ContentWrapper>
        <Footer />
        <ScrollToTopButtonComponent onClick={scrollToTop} />
      </MainContainer>
    );
  }

  return (
    <>
      <UnifiedHeader variant='default' />

      {/* 공유 링크 복사 안내 모달 */}
      <ReusableModal
        isOpen={isShareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title='링크 복사됨'
      >
        현재 페이지 URL이 클립보드에 복사되었습니다.
      </ReusableModal>

      {/* 서브헤더 */}
      <MelpikGuideBanner
        onSearchSubmit={(searchTerm) => {
          setSearchQuery(searchTerm);
          setSelectedCategory('All');
          setSearchParams(
            { category: 'All', search: searchTerm },
            { replace: true }
          );
        }}
        onColorSelect={(colors) => {
          setSelectedColors(colors);
        }}
        onSizeSelect={(sizes) => {
          setSelectedSizes(sizes);
        }}
        selectedColors={selectedColors}
        selectedSizes={selectedSizes}
      />
      <SubHeader
        selectedCategory={selectedCategory}
        setSelectedCategory={(cat) => {
          setSearchQuery('');
          setSearchParams({ category: cat }, { replace: true });
          // 카테고리 변경 시 스크롤을 맨 위로 이동
          setTimeout(() => {
            scrollToTop();
          }, 100);
        }}
        onCategoryClick={() => {
          setSearchQuery('');
          // 카테고리 클릭 시 스크롤을 맨 위로 이동
          setTimeout(() => {
            scrollToTop();
          }, 100);
        }}
        isLoading={allProductsQuery.isLoading}
      />

      {/* 필터 칩 표시 */}
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
        isSearchModalOpen={false}
        isFilterModalOpen={false}
        onSearchModalToggle={() => {}}
        onFilterModalToggle={() => {}}
        tempSelectedColors={selectedColors}
        tempSelectedSizes={selectedSizes}
        onTempColorsChange={setSelectedColors}
        onTempSizesChange={setSelectedSizes}
        searchPlaceholder='브랜드 또는 설명으로 검색...'
      />

      {/* 제품 리스트 or 로딩 스피너 */}
      <ContentWrapper>
        <>
          <ItemList
            items={visibleItems}
            columns={viewCols}
            onItemClick={handleOpenModal}
            observerRef={observerRef as React.RefObject<HTMLDivElement>}
          />
          <div ref={observerRef} style={{ height: 1 }} />
        </>
      </ContentWrapper>

      {/* 푸터 */}
      <Footer />

      {/* 스크롤 탑 버튼 */}
      <ScrollToTopButtonComponent onClick={scrollToTop} />

      {/* 상세 모달 */}
      <ProductDetailModal
        isOpen={isModalOpen}
        modalId={modalId}
        onClose={handleCloseModal}
        onShare={handleShare}
      />
      <ReusableModal
        isOpen={isFeatureModalOpen}
        onClose={() => setFeatureModalOpen(false)}
        title='준비 중입니다'
      >
        아직 구현 전인 기능이에요.
      </ReusableModal>
    </>
  );
};

export default Home;

// styled components 전체

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  margin: auto;
  max-width: 1000px;
  padding: 0;
  min-height: 100vh; /* CLS 개선을 위한 최소 높이 설정 */
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px; /* CLS 개선을 위한 최소 높이 설정 */
`;
