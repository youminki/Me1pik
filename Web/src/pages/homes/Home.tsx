// src/pages/homes.tsx

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { useProducts } from '@/api-utils/product-managements/uploads/productApi';
import ArrowIconSvg from '@/assets/ArrowIcon.svg';
import CancleIconIcon from '@/assets/headers/CancleIcon.svg';
import HomeIcon from '@/assets/headers/HomeIcon.svg';
import ShareIcon from '@/assets/headers/ShareIcon.svg';
import FilterContainer from '@/components/homes/FilterContainer';
import Footer from '@/components/homes/Footer';
import ItemList, { UIItem } from '@/components/homes/ItemList';
import SubHeader from '@/components/homes/SubHeader';
import MelpikGuideBanner from '@/components/melpik-guide-banner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import FilterChipContainer from '@/components/shared/FilterChipContainer';
import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';
import FilterModal from '@/components/shared/modals/FilterModal';
import ReusableModal from '@/components/shared/modals/ReusableModal';
import HomeDetail from '@/pages/homes/HomeDetail';

/**
 * Home(상품 리스트) 페이지 - 최적화 버전
 * - react-query로 상품 데이터 관리(캐싱/중복방지)
 * - 검색/필터 useMemo 적용
 * - 무한스크롤 IntersectionObserver 적용
 * - 상태 최소화, 타입 보강, 주석 추가
 */

// 컴포넌트 함수 바깥에 위치
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

// 사이즈 매핑 테이블
const sizeMap: Record<string, string[]> = {
  '44(S)': ['44'],
  '55(M)': ['55'],
  '66(L)': ['66'],
  '77(XL)': ['77'],
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // 로그인 후 안내 모달
  const [isLoginNoticeOpen, setLoginNoticeOpen] = useState(false);
  const showNotice = location.state?.showNotice;

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

  // 검색 모달 노출 상태
  const [isSearchModalOpen, setSearchModalOpen] = useState(false);

  // 필터 모달 상태
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  // 필터모달 임시 상태
  const [tempSelectedColors, setTempSelectedColors] = useState<string[]>([]);
  const [tempSelectedSizes, setTempSelectedSizes] = useState<string[]>([]);

  // react-query 상품 데이터
  const {
    data: products = [],
    isLoading,
    isError,
    error,
  } = useProducts(selectedCategory === 'All' ? 'all' : selectedCategory);

  // 실제 API 데이터 사용 (sizes 필드가 포함되어 있음)
  const productsWithSizes = useMemo(() => {
    if (!products) return [];
    return products;
  }, [products]);

  // 검색/필터된 상품 목록 (useMemo로 연산 최소화)
  const filteredProducts = useMemo(() => {
    if (!productsWithSizes) return [];
    const term = searchQuery.trim().toLowerCase();
    // 쉼표로 분리된 여러 검색어 처리
    const terms = term
      .split(',')
      .map((t: string) => t.trim())
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
    terms.forEach((t: string) => {
      if (allColorKeywords.includes(t)) {
        searchColors.push(t);
      } else if (t) {
        searchKeywords.push(t);
      }
    });

    const filtered = productsWithSizes.filter(
      (item: {
        id: number;
        brand?: string;
        description?: string;
        color?: string;
        sizes?: string[];
      }) => {
        const brand = item.brand?.toLowerCase() || '';
        const desc = item.description?.toLowerCase() || '';
        const color = item.color?.toLowerCase() || '';
        const sizes = item.sizes || [];

        // 브랜드/설명 검색: 모든 일반 키워드가 브랜드/설명에 하나라도 포함되면 true
        const matchesBrandOrDesc =
          searchKeywords.length === 0 ||
          searchKeywords.some((kw) => brand.includes(kw) || desc.includes(kw));

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
          matchesBrandOrDesc &&
          matchesSearchColors &&
          matchesSelectedColors &&
          matchesSelectedSizes
        );
      }
    );
    return filtered;
  }, [productsWithSizes, searchQuery, selectedColors, selectedSizes]);

  // UIItem 변환 (모든 상품을 한 번에 불러옴)
  const uiItems: UIItem[] = useMemo(() => {
    const result = filteredProducts.map(
      (p: {
        id: number;
        image: string;
        brand: string;
        description: string;
        price: number;
        discount?: number;
        isLiked?: boolean;
      }) => ({
        id: p.id.toString(),
        image: p.image,
        brand: p.brand,
        description: p.description,
        price: p.price,
        discount: p.discount || 0,
        isLiked: p.isLiked || false,
      })
    );

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

  // 홈 진입 시 로그인 안내 모달 열기
  useEffect(() => {
    // if (showNotice) {
    //   setLoginNoticeOpen(true);
    // }
  }, [showNotice]);

  // 스크롤 맨 위로 이동
  const scrollToTop = useCallback(
    () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    []
  );

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

  // 필터 모달이 열릴 때 임시 상태를 실제 상태로 동기화
  useEffect(() => {
    if (isFilterModalOpen) {
      setTempSelectedColors(selectedColors);
      setTempSelectedSizes(selectedSizes);
    }
  }, [isFilterModalOpen, selectedColors, selectedSizes]);

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

  // 검색 결과 없음 감지
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (
      !isLoading &&
      uiItems.length === 0 &&
      (searchQuery || selectedColors.length > 0 || selectedSizes.length > 0)
    ) {
      timer = setTimeout(() => setShowNoResult(true), 300);
    } else {
      setShowNoResult(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, uiItems.length, searchQuery, selectedColors, selectedSizes]);

  // 에러 처리
  if (isError) {
    return (
      <ErrorMessage message={error?.message || '상품을 불러오지 못했습니다.'} />
    );
  }

  // 로딩 중에는 스켈레톤만 렌더링
  if (isLoading) {
    return (
      <MainContainer>
        <MelpikGuideBanner />
        <SubHeader
          selectedCategory={selectedCategory}
          setSelectedCategory={(cat) => {
            setSearchQuery('');
            setSearchParams({ category: cat }, { replace: true });
          }}
          onCategoryClick={() => setSearchQuery('')}
        />
        <ControlsContainer>
          <FilterContainer
            onSearchClick={() => setSearchModalOpen(true)}
            onFilterClick={() => setFilterModalOpen(true)}
          />
        </ControlsContainer>
        <ContentWrapper>
          <ItemList items={[]} columns={viewCols} isLoading={true} />
        </ContentWrapper>
        <Footer />
        <ScrollToTopButton onClick={scrollToTop}>
          <ArrowIconImg src={ArrowIconSvg} alt='위로 이동' />
        </ScrollToTopButton>
      </MainContainer>
    );
  }
  if (showNoResult) {
    return (
      <MainContainer>
        <MelpikGuideBanner />
        <SubHeader
          selectedCategory={selectedCategory}
          setSelectedCategory={(cat) => {
            setSearchQuery('');
            setSearchParams({ category: cat }, { replace: true });
          }}
          onCategoryClick={() => setSearchQuery('')}
        />
        <ControlsContainer>
          <FilterContainer
            onSearchClick={() => setSearchModalOpen(true)}
            onFilterClick={() => setFilterModalOpen(true)}
          />
        </ControlsContainer>
        <ContentWrapper>
          <NoResultMessage>조건에 맞는 상품이 없습니다.</NoResultMessage>
        </ContentWrapper>
        <Footer />
        <ScrollToTopButton onClick={scrollToTop}>
          <ArrowIconImg src={ArrowIconSvg} alt='위로 이동' />
        </ScrollToTopButton>
      </MainContainer>
    );
  }

  return (
    <>
      <UnifiedHeader variant='default' />
      {/* 로그인 안내 모달 */}
      <ReusableModal
        isOpen={isLoginNoticeOpen}
        onClose={() => setLoginNoticeOpen(false)}
        title='멜픽 - 이용안내'
      >
        <p>멜픽 서비스에서 대여 이용 시 아래 순서로 진행하세요:</p>
        <InfoList>
          <li>결제카드 등록</li>
          <li>이용권 결제</li>
          <li>대여제품 신청</li>
        </InfoList>
      </ReusableModal>

      {/* 공유 링크 복사 안내 모달 */}
      <ReusableModal
        isOpen={isShareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title='링크 복사됨'
      >
        현재 페이지 URL이 클립보드에 복사되었습니다.
      </ReusableModal>

      {/* 필터 모달 */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => {
          setFilterModalOpen(false);
        }}
        onColorSelect={(colors: string[]) => {
          setSelectedColors(colors);
          setFilterModalOpen(false);
        }}
        onSizeSelect={(sizes: string[]) => {
          setSelectedSizes(sizes);
          setFilterModalOpen(false);
        }}
        selectedColors={tempSelectedColors}
        setSelectedColors={setTempSelectedColors}
        selectedSizes={tempSelectedSizes}
        setSelectedSizes={setTempSelectedSizes}
      />

      {/* 서브헤더 */}
      <MelpikGuideBanner />
      <SubHeader
        selectedCategory={selectedCategory}
        setSelectedCategory={(cat) => {
          setSearchQuery('');
          setSearchParams({ category: cat }, { replace: true });
        }}
        onCategoryClick={() => setSearchQuery('')}
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
        historyKey='searchHistory'
      />

      {/* 제품 리스트 or 로딩 스피너 */}
      <ContentWrapper>
        <>
          <ItemList
            items={visibleItems}
            columns={viewCols}
            onItemClick={handleOpenModal}
            observerRef={observerRef as React.RefObject<HTMLDivElement>}
            visibleCount={visibleCount}
          />
          <div ref={observerRef} style={{ height: 1 }} />
        </>
      </ContentWrapper>

      {/* 푸터 */}
      <Footer />

      {/* 스크롤 탑 버튼 */}
      <ScrollToTopButton onClick={scrollToTop}>
        <ArrowIconImg src={ArrowIconSvg} alt='위로 이동' />
      </ScrollToTopButton>

      {/* 상세 모달 */}
      {isModalOpen && modalId && (
        <>
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
          <ReusableModal
            isOpen={isFeatureModalOpen}
            onClose={() => setFeatureModalOpen(false)}
            title='준비 중입니다'
          >
            아직 구현 전인 기능이에요.
          </ReusableModal>
        </>
      )}
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
`;

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin: 12px 0;
  position: relative;
  min-height: 48px; /* Chip, FilterContainer 높이에 맞게 조정 */
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
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
  /* 모달 바깥으로 스크롤 전파되지 않도록 */
  overscroll-behavior: contain;
`;

const ModalBox = styled.div`
  background: #fff;
  width: 100%;
  max-width: 1000px;
  height: 100%;
  overflow-y: auto;
  position: relative;
  /* 모달 내 스크롤이 바깥으로 전파되지 않도록 막음 */
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

const InfoList = styled.ol`
  margin: 12px 0 0 16px;
  padding: 0;
  list-style: decimal;
  font-size: 14px;
  & li {
    margin-bottom: 8px;
  }
`;

// 안내 문구 스타일
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;
