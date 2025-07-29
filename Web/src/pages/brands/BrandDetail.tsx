// src/pages/brands/BrandDetail.tsx

import React, { useEffect, useState, useMemo } from 'react';
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

  // 제품 목록 상태
  const [allProducts, setAllProducts] = useState<ApiProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [errorProducts, setErrorProducts] = useState<string>('');

  // 카테고리 필터: 초기값은 URL의 category 파라미터 or 'All'
  const initialCat = searchParams.get('category') || 'All';
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);

  // 열 선택 관련 상태
  const [viewCols, setViewCols] = useState<number>(4);

  // 모바일 뷰 여부
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  useEffect(() => {
    setViewCols(isMobileView ? 2 : 4);
  }, [isMobileView]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

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

  // 제품 목록 로드 (selectedCategory 및 searchTerm 반영은 이후 useEffect에서)
  useEffect(() => {
    if (!brand) return;
    setLoadingProducts(true);
    setErrorProducts('');
    (async () => {
      try {
        const categoryKey =
          selectedCategory === 'All' ? undefined : selectedCategory;
        const data = await getProductsByBrand(brand.id, categoryKey);
        setAllProducts(data);
      } catch (err) {
        console.error('제품 목록 조회 실패:', err);
        setErrorProducts('제품 목록을 불러오는 중 오류가 발생했습니다.');
        setAllProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    })();
  }, [brand, selectedCategory]);

  // 검색어(searchTerm) 또는 allProducts 변경 시 filteredProducts 업데이트 useEffect 전체 삭제

  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
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

    const filtered = allProducts.filter((item) => {
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
  }, [allProducts, searchQuery, selectedColors, selectedSizes]);

  // 상품 필터링 (홈과 동일하게) useEffect 전체 삭제

  // 상세 모달 ID
  const modalId = searchParams.get('id');
  const isModalOpen = Boolean(modalId);

  // 제품 클릭: 모달 열기 (URL에 id 설정). 기존 category/search 유지
  const handleItemClick = (prodId: string) => {
    const params = new URLSearchParams(searchParams);
    if (selectedCategory && selectedCategory !== 'All') {
      params.set('category', selectedCategory);
    }
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    params.set('id', prodId);
    setSearchParams(params, { replace: true });
  };

  // 모달 닫기: query에서 id 제거, category/search 유지
  const handleCloseModal = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('id');
    setSearchParams(params, { replace: true });
  };

  // 공유 핸들러
  const handleShare = async () => {
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
  };

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

  // UIItem 매핑 (filteredProducts 기준)
  const uiItems: UIItem[] = filteredProducts.map((it) => ({
    id: it.id.toString(),
    image: it.image || '',
    brand: brand?.name || '',
    description: it.description || '',
    price: it.price || 0,
    discount: it.discount || 0,
    isLiked: false,
  }));

  // 안내 문구 딜레이 상태
  const [showNoResult, setShowNoResult] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (!loadingProducts && filteredProducts.length === 0) {
      timer = setTimeout(() => setShowNoResult(true), 300);
    } else {
      setShowNoResult(false);
      if (timer) clearTimeout(timer);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loadingProducts, filteredProducts]);

  if (errorProducts) {
    return <ErrorMessage message={errorProducts} />;
  }

  // 로딩 중에는 스켈레톤만 렌더링
  if (loadingProducts) {
    return (
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
          />
          <FilterChipContainer
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
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
          />
          <MainContent>
            <ItemList items={[]} columns={viewCols} isLoading={true} />
          </MainContent>
          <ScrollToTopButton onClick={scrollToTop}>
            <ArrowIconImg src={ArrowIconSvg} alt='위로 이동' />
          </ScrollToTopButton>
        </Container>
      </PageWrapper>
    );
  }

  // 로딩이 끝났고 데이터가 없을 때: 300ms 동안은 스켈레톤, 그 후 안내 문구
  if (!loadingProducts && filteredProducts.length === 0 && !showNoResult) {
    return (
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
          />
          <FilterChipContainer
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
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
          />
          <MainContent>
            <ItemList items={[]} columns={viewCols} isLoading={true} />
          </MainContent>
          <ScrollToTopButton onClick={scrollToTop}>
            <ArrowIconImg src={ArrowIconSvg} alt='위로 이동' />
          </ScrollToTopButton>
        </Container>
      </PageWrapper>
    );
  }

  // 안내 문구만 렌더링
  if (showNoResult) {
    return (
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
          />
          <FilterChipContainer
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
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
          />
          <ContentWrapper>
            <NoResultMessage>조건에 맞는 상품이 없습니다.</NoResultMessage>
          </ContentWrapper>
          <ScrollToTopButton onClick={scrollToTop}>
            <ArrowIconImg src={ArrowIconSvg} alt='위로 이동' />
          </ScrollToTopButton>
        </Container>
      </PageWrapper>
    );
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
          />

          {/* 필터 및 검색 아이콘 */}
          <ControlsContainer>
            {/* Chip 리스트 */}
            <FilterChipContainer
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
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
            />
          </ControlsContainer>

          <MainContent>
            <ItemList
              items={uiItems}
              columns={viewCols}
              onItemClick={handleItemClick}
              isLoading={loadingProducts}
            />
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

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
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

  background: #555555;
  border-radius: 6px;
  transition:
    transform 0.3s,
    box-shadow 0.3s,
    opacity 0.3s;

  &:hover {
    transform: scale(1.1);
  }
  @media (min-width: 1000px) {
    right: calc((100vw - 1000px) / 2 + 20px);
  }
`;

const ArrowIconImg = styled.img``;

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
`;
const MainContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

// styled-components: Home.tsx에서 ContentWrapper, NoResultMessage 복사
const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
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
