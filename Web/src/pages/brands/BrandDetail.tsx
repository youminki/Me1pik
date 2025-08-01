// src/pages/brands/BrandDetail.tsx

import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import {
  Brand as ApiBrand,
  getBrandList,
} from '@/api-utils/product-managements/brands/brandApi';
import {
  getProductsByBrand,
  Product as ApiProduct,
} from '@/api-utils/product-managements/products/product';
import ArrowIconSvg from '@/assets/ArrowIcon.svg';
import CancleIconIcon from '@/assets/headers/CancleIcon.svg';
import HomeIcon from '@/assets/headers/HomeIcon.svg';
import ShareIcon from '@/assets/headers/ShareIcon.svg';
import StatsSection from '@/components/brands/StatsSection';
import ItemList, { UIItem } from '@/components/homes/ItemList';
import SubHeader from '@/components/homes/SubHeader';
import ErrorMessage from '@/components/shared/ErrorMessage';
import FilterChipContainer from '@/components/shared/FilterChipContainer';
import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';
import HomeDetail from '@/pages/homes/HomeDetail';

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

const colorMap: Record<string, string> = {
  화이트: 'WHITE',
  블랙: 'BLACK',
  그레이: 'GRAY',
  네이비: 'NAVY',
  아이보리: 'IVORY',
  베이지: 'BEIGE',
  브라운: 'BROWN',
  카키: 'KHAKI',
  그린: 'GREEN',
  블루: 'BLUE',
  퍼플: 'PURPLE',
  버건디: 'BURGUNDY',
  레드: 'RED',
  핑크: 'PINK',
  옐로우: 'YELLOW',
  오렌지: 'ORANGE',
  마젠타: 'MAGENTA',
  민트: 'MINT',
};

const sizeMap: Record<string, string[]> = {
  '44(S)': ['44'],
  '55(M)': ['55'],
  '66(L)': ['66'],
  '77(XL)': ['77'],
};

const BrandDetail: React.FC = () => {
  const { brandId } = useParams<{ brandId: string }>();
  const idNum = brandId ? parseInt(brandId, 10) : NaN;
  const navigate = useNavigate();
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

  const scrollToTop = useCallback(() => {
    // 모든 스크롤 방법을 시도
    const scrollMethods = [
      () => window.scrollTo(0, 0),
      () => window.scrollTo({ top: 0, behavior: 'instant' }),
      () => {
        if (document.documentElement) {
          document.documentElement.scrollTop = 0;
        }
      },
      () => {
        if (document.body) {
          document.body.scrollTop = 0;
        }
      },
      () => {
        const root = document.getElementById('root');
        if (root) {
          root.scrollTop = 0;
        }
      },
      () => {
        const html = document.querySelector('html');
        if (html) {
          html.scrollTop = 0;
        }
      },
      () => {
        const firstElement = document.querySelector('body > *:first-child');
        if (firstElement) {
          firstElement.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      },
      () => {
        const header =
          document.querySelector('header') ||
          document.querySelector('[data-testid="header"]');
        if (header) {
          header.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      },
    ];

    // 스크롤 가능한 모든 요소에 대해 시도
    const allElements = document.querySelectorAll('*');
    const scrollableElements = Array.from(allElements).filter((el) => {
      const style = window.getComputedStyle(el);
      return (
        style.overflow === 'auto' ||
        style.overflow === 'scroll' ||
        style.overflowY === 'auto' ||
        style.overflowY === 'scroll'
      );
    });

    // 모든 방법을 순차적으로 시도
    scrollMethods.forEach((method) => {
      try {
        method();
      } catch {
        // 에러 무시하고 계속 진행
      }
    });

    // 스크롤 가능한 요소들도 초기화
    scrollableElements.forEach((el) => {
      try {
        el.scrollTop = 0;
      } catch {
        // 에러 무시하고 계속 진행
      }
    });
  }, []);

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

  // 검색/필터된 상품 목록 (useMemo로 연산 최소화)
  const filteredProducts = useMemo(() => {
    if (!currentCategoryProducts) return [];
    const term = searchQuery.trim().toLowerCase();
    // 쉼표로 분리된 여러 검색어 처리
    const terms = term
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    // 색상 매핑: 한글 <-> 영문
    const colorMapEntries = Object.entries(colorMap);
    const allColorKeywords = [
      ...colorMapEntries.map(([kor]) => kor.toLowerCase()),
      ...colorMapEntries.map(([, eng]) => eng.toLowerCase()),
    ];

    // 검색어 중 색상 키워드와 일반 키워드 분리
    const searchColors: string[] = [];
    const searchKeywords: string[] = [];
    terms.forEach((t) => {
      if (allColorKeywords.includes(t)) {
        searchColors.push(t);
      } else if (t) {
        searchKeywords.push(t);
      }
    });

    const filtered = currentCategoryProducts.filter((item) => {
      const name = (item.name || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const color = item.color?.toLowerCase() || '';
      const sizes = item.sizes || [];

      // 이름/설명 검색: 모든 일반 키워드가 이름/설명에 하나라도 포함되면 true
      const matchesNameOrDesc =
        searchKeywords.length === 0 ||
        searchKeywords.some((kw) => name.includes(kw) || desc.includes(kw));

      // 색상 검색: 검색어에 색상 키워드가 있으면, 상품 색상에 하나라도 포함되면 true
      let matchesSearchColors = true;
      if (searchColors.length > 0) {
        matchesSearchColors = searchColors.some((searchColor) => {
          // 한글로 입력한 경우 영문도 체크, 영문으로 입력한 경우 한글도 체크
          const found = colorMapEntries.find(
            ([kor, eng]) =>
              kor.toLowerCase() === searchColor ||
              eng.toLowerCase() === searchColor
          );
          if (found) {
            const [kor, eng] = found;
            return (
              color.includes(kor.toLowerCase()) ||
              color.includes(eng.toLowerCase()) ||
              color.toUpperCase().includes(eng.toUpperCase())
            );
          }
          return color.includes(searchColor);
        });
      }

      // 여러 색상 필터(필터 모달): selectedColors 중 하나라도 포함되면 true
      let matchesSelectedColors = true;
      if (selectedColors.length > 0) {
        matchesSelectedColors = selectedColors.some((selected) => {
          const engColor = colorMap[selected] || selected;
          return (
            color.toUpperCase().includes(engColor) || color.includes(selected)
          );
        });
      }

      // 사이즈 필터: selectedSizes 중 하나라도 상품의 sizes에 포함되면 true
      let matchesSelectedSizes = true;
      if (selectedSizes.length > 0) {
        matchesSelectedSizes = selectedSizes.some((selectedSize) => {
          // 사이즈 매핑 테이블에서 해당하는 숫자 사이즈들 가져오기
          const mappedSizes = sizeMap[selectedSize] || [selectedSize];
          // 상품 사이즈와 매핑된 사이즈들 중 하나라도 일치하는지 확인
          return mappedSizes.some((mappedSize) => {
            return sizes.some((productSize) => {
              // FREE 사이즈 특별 처리
              if (selectedSize === 'FREE') {
                return /free/i.test(productSize);
              }
              // 숫자 사이즈 매칭 - 정확한 숫자 비교
              return productSize === mappedSize;
            });
          });
        });
      }

      return (
        matchesNameOrDesc &&
        matchesSearchColors &&
        matchesSelectedColors &&
        matchesSelectedSizes
      );
    });
    return filtered;
  }, [currentCategoryProducts, searchQuery, selectedColors, selectedSizes]);

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
    setShowNoResult(false); // showNoResult 상태도 초기화
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

  // 무한스크롤 관련 상태
  const [visibleCount, setVisibleCount] = useState(40);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // 무한스크롤 IntersectionObserver
  useEffect(() => {
    if (!observerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 40, uiItems.length));
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [uiItems.length]);

  const visibleItems = uiItems.slice(0, visibleCount);

  // 검색/필터 결과 없음일 때 문구만 표시
  const [showNoResult, setShowNoResult] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // 검색 결과 없음 감지 및 자동 초기화
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    let countdownTimer: NodeJS.Timeout | null = null;

    // 검색어나 필터가 있고, 로딩이 완료되었으며, 결과가 없을 때
    const hasActiveFilters =
      searchQuery.trim() ||
      selectedColors.length > 0 ||
      selectedSizes.length > 0;
    const shouldShowNoResult =
      !loadingProducts && uiItems.length === 0 && hasActiveFilters;

    // 검색어나 필터가 변경되면 즉시 showNoResult를 false로 설정
    if (!hasActiveFilters) {
      setShowNoResult(false);
      setCountdown(3);
      return;
    }

    if (shouldShowNoResult) {
      timer = setTimeout(() => {
        setShowNoResult(true);
        setCountdown(3);

        // 3초 카운트다운 후 자동 초기화
        countdownTimer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              // 카운트다운 완료 시 모든 필터 초기화
              setSearchQuery('');
              setSelectedColors([]);
              setSelectedSizes([]);
              setShowNoResult(false);
              setCountdown(3);

              // URL에서 search 파라미터 제거
              setSearchParams(
                (prev) => {
                  const params = Object.fromEntries(prev.entries());
                  delete params.search;
                  return params;
                },
                { replace: true }
              );

              if (countdownTimer) {
                clearInterval(countdownTimer);
              }
              return 3;
            }
            return prev - 1;
          });
        }, 1000);
      }, 300);
    } else {
      setShowNoResult(false);
      setCountdown(3);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (countdownTimer) clearInterval(countdownTimer);
    };
  }, [
    loadingProducts,
    uiItems.length,
    searchQuery,
    selectedColors,
    selectedSizes,
    setSearchParams,
  ]);

  // 에러 처리
  if (errorProducts) {
    return <ErrorMessage message={errorProducts} />;
  }

  return (
    <>
      <UnifiedHeader variant='oneDepth' />
      <PageWrapper>
        <Container>
          <Header>
            <Title>{brand?.name}</Title>
            <Subtitle>새로운 시즌 제품들을 내 손안에!</Subtitle>
          </Header>

          <StatsSection
            brandCount={1}
            productCount={brand?.productCount || 0}
          />
          <Divider />

          <SubHeader
            selectedCategory={selectedCategory}
            setSelectedCategory={(cat) => {
              setSelectedCategory(cat);
              scrollToTop();
            }}
            onCategoryClick={scrollToTop}
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
                <NoResultMessage>
                  조건에 맞는 상품이 없습니다.
                  <br />
                  <CountdownText>
                    {countdown}초 후 전체 상품으로 이동합니다...
                  </CountdownText>
                </NoResultMessage>
              </ContentWrapper>
            ) : (
              <>
                <ItemList
                  items={visibleItems}
                  columns={viewCols}
                  onItemClick={handleItemClick}
                  observerRef={observerRef as React.RefObject<HTMLDivElement>}
                  visibleCount={visibleCount}
                />
                <div ref={observerRef} style={{ height: 1 }} />
              </>
            )}
          </MainContent>

          {/* 하단 스크롤 탑 버튼(유지) */}
          <ScrollToTopButton onClick={scrollToTop}>
            <ArrowIconImg src={ArrowIconSvg} alt='위로 이동' />
          </ScrollToTopButton>
        </Container>

        {/* 상세 모달 */}
        {isModalOpen && modalId && (
          <ModalOverlay>
            <ModalBox>
              <ModalHeaderWrapper>
                <ModalHeaderContainer>
                  <LeftSection>
                    <CancleIcon
                      src={CancleIconIcon}
                      alt='취소'
                      onClick={handleCloseModal}
                    />
                  </LeftSection>
                  <CenterSection />
                  <RightSection>
                    <Icon src={ShareIcon} alt='공유' onClick={handleShare} />
                    <Icon
                      src={HomeIcon}
                      alt='홈'
                      onClick={() => navigate('/home')}
                    />
                  </RightSection>
                </ModalHeaderContainer>
              </ModalHeaderWrapper>
              <ModalBody>
                <HomeDetail id={modalId} />
              </ModalBody>
            </ModalBox>
          </ModalOverlay>
        )}
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

const Header = styled.div`
  width: 100%;
  margin-bottom: 6px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 800;
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 12px;
  color: #ccc;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #ddd;
  margin: 30px 0 0;
`;

const ScrollToTopButton = styled.button`
  position: fixed;
  bottom: 100px;
  right: 14px;
  width: 48px;
  height: 48px;
  border: none;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  background: #555555;
  border-radius: 6px;
  transition:
    transform 0.3s,
    box-shadow 0.3s,
    opacity 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;

  &:hover {
    transform: scale(1.1);
    background: #666666;
  }

  &:active {
    transform: scale(0.95);
  }

  @media (min-width: 1000px) {
    right: calc((100vw - 1000px) / 2 + 20px);
  }
`;

const ArrowIconImg = styled.img`
  width: 24px;
  height: 24px;
  display: block;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  overscroll-behavior: contain;
`;

const ModalBox = styled.div`
  background: #fff;
  width: 100%;
  max-width: 1000px;
  height: 100%;
  overflow-y: auto;
  position: relative;
  overscroll-behavior: contain;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ModalHeaderWrapper = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  background: #fff;
  z-index: 2100;
`;

const ModalHeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
`;

const ModalBody = styled.div`
  padding-top: 70px;
`;

const LeftSection = styled.div`
  cursor: pointer;
`;
const CenterSection = styled.div`
  flex: 1;
`;
const RightSection = styled.div`
  display: flex;
  gap: 19px;
`;

const CancleIcon = styled.img`
  cursor: pointer;
`;
const Icon = styled.img`
  cursor: pointer;
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
  align-items: center;
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

const NoResultMessage = styled.div`
  min-width: 220px;
  max-width: 90vw;
  margin: 0 auto;
  text-align: center;
  font-size: 18px;
  color: #888;
  font-weight: 600;
  padding: 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 12px;
`;

const CountdownText = styled.div`
  font-size: 14px;
  color: #999;
  font-weight: 400;
  margin-top: 8px;
`;
