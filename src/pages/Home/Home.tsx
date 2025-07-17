// src/pages/Home.tsx

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import ItemList, { UIItem } from '../../components/Home/ItemList';
import Footer from '../../components/Home/Footer';
import SubHeader from '../../components/Home/SubHeader';
import { useProducts } from '../../api/upload/productApi';
import HomeDetail from './HomeDetail';
import CancleIconIcon from '../../assets/Header/CancleIcon.svg';
import ShareIcon from '../../assets/Header/ShareIcon.svg';
import HomeIcon from '../../assets/Header/HomeIcon.svg';
import ArrowIconSvg from '../../assets/ArrowIcon.svg';
import ReusableModal from '../../components/ReusableModal';
import FilterContainer from '../../components/Home/FilterContainer';
import SearchModal from '../../components/Home/SearchModal';
import MelpikGuideBanner from '../../components/MelpikGuideBanner';
import SkeletonItemList from '../../components/Home/SkeletonItemList';
import FilterModal from '../../components/FilterModal';

/**
 * Home(상품 리스트) 페이지 - 최적화 버전ㄴ
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

// Chip 스타일 컴포넌트
const ChipList = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-grow: 1;
  flex-wrap: wrap;
  /* 줄바꿈 시 Chip 간격 조정 */
  row-gap: 8px;
  max-width: 100vw;
  /* 모바일에서 Chip이 많아질 때 가로 스크롤 */
  overflow-x: auto;
  white-space: nowrap;
  /* 스크롤바 숨기기 (웹킷 브라우저) */
  &::-webkit-scrollbar {
    display: none;
  }
`;
const Chip = styled.div`
  display: flex;
  align-items: center;
  background: #f6f6f6;
  border-radius: 16px;
  padding: 0 10px;
  font-size: 13px;
  color: #333;
  height: 28px;
  font-weight: 600;
  border: 1px solid #e0e0e0;
`;
const ChipClose = styled.button`
  background: none;
  border: none;
  color: #888;
  font-size: 16px;
  margin-left: 4px;
  cursor: pointer;
  padding: 0;
`;

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
  useEffect(() => {
    const onResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // viewCols 상태 및 관련 로직 제거, 아래처럼 고정값으로 대체
  const viewCols = isMobileView ? 2 : 4;

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
  // 필터모달 임시 색상 상태
  const [tempSelectedColors, setTempSelectedColors] = useState<string[]>([]);

  // react-query 상품 데이터
  const {
    data: products = [],
    isLoading,
    isError,
    error,
  } = useProducts(selectedCategory === 'All' ? 'all' : selectedCategory);

  // 검색/필터된 상품 목록 (useMemo로 연산 최소화)
  const filteredProducts = useMemo(() => {
    console.time('filteredProducts');
    if (!products) return [];
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

    const filtered = products.filter((item) => {
      const brand = item.brand?.toLowerCase() || '';
      const desc = item.description?.toLowerCase() || '';
      const color = item.color?.toLowerCase() || '';

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

      return matchesBrandOrDesc && matchesSearchColors && matchesSelectedColors;
    });
    console.timeEnd('filteredProducts');
    return filtered;
  }, [products, searchQuery, selectedColors]);

  // UIItem 변환 (모든 상품을 한 번에 불러옴)
  const uiItems: UIItem[] = useMemo(() => {
    console.time('uiItems');
    const result = filteredProducts.map((p) => ({
      id: p.id.toString(),
      image: p.image,
      brand: p.brand,
      description: p.description,
      price: p.price,
      discount: p.discount,
      isLiked: p.isLiked,
    }));
    console.timeEnd('uiItems');
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
    if (showNotice) {
      setLoginNoticeOpen(true);
    }
  }, [showNotice]);

  // 스크롤 맨 위로 이동
  const scrollToTop = useCallback(
    () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    []
  );

  // 검색 결과 없음 카운트다운
  const [noResultCountdown, setNoResultCountdown] = useState(3);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (
      !isLoading &&
      uiItems.length === 0 &&
      (searchQuery || selectedColors.length > 0)
    ) {
      setNoResultCountdown(3);
      if (countdownRef.current) clearInterval(countdownRef.current);
      countdownRef.current = setInterval(() => {
        setNoResultCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!);
            setSearchQuery('');
            setSelectedCategory('All');
            setSelectedColors([]);
            setSearchParams({ category: 'All' }, { replace: true });
            return 3;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
    // eslint-disable-next-line
  }, [isLoading, uiItems.length, searchQuery, selectedColors]);

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

  // 필터 모달이 열릴 때 tempSelectedColors를 selectedColors로 동기화
  useEffect(() => {
    if (isFilterModalOpen) {
      setTempSelectedColors(selectedColors);
    }
  }, [isFilterModalOpen, selectedColors]);

  const [visibleCount, setVisibleCount] = useState(40); // 최초 40개로 다시 낮춤
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
  console.log(
    'visibleCount:',
    visibleCount,
    'visibleItems:',
    visibleItems.length,
    'uiItems:',
    uiItems.length
  );

  if (isError)
    return <div>상품을 불러오는 데 실패했습니다: {String(error)}</div>;

  return (
    <MainContainer>
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
        selectedColors={tempSelectedColors}
        setSelectedColors={setTempSelectedColors}
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
      <ControlsContainer>
        {/* 필터/검색 Chip 리스트 */}
        <ChipList>
          {/* 검색어 Chip */}
          {searchQuery.trim() &&
            searchQuery.split(',').map((kw, idx) => (
              <Chip key={kw + idx}>
                {kw.trim()}
                <ChipClose
                  aria-label='검색어 삭제'
                  onClick={() => {
                    // 해당 검색어만 제거
                    const terms = searchQuery
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean);
                    const newTerms = terms.filter((_, i) => i !== idx);
                    setSearchQuery(newTerms.join(', '));
                    // URL 동기화
                    setSearchParams(
                      (prev) => {
                        const params = Object.fromEntries(prev.entries());
                        if (newTerms.length > 0) {
                          params.search = newTerms.join(', ');
                        } else {
                          delete params.search;
                        }
                        return params;
                      },
                      { replace: true }
                    );
                  }}
                >
                  ×
                </ChipClose>
              </Chip>
            ))}
          {/* 색상 Chip (필터 모달 선택) */}
          {selectedColors.map((color, idx) => (
            <Chip key={color + idx}>
              {color}
              <ChipClose
                aria-label='색상 삭제'
                onClick={() => {
                  const newColors = selectedColors.filter((_, i) => i !== idx);
                  setSelectedColors(newColors);
                }}
              >
                ×
              </ChipClose>
            </Chip>
          ))}
        </ChipList>
        <RowAlignBox>
          {/* 검색 및 필터 아이콘 */}
          <FilterContainer
            onSearchClick={() => setSearchModalOpen(true)}
            onFilterClick={() => setFilterModalOpen(true)}
          />
        </RowAlignBox>
        {/* 검색 모달 */}
        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          onSearch={(searchTerm) => {
            setSearchQuery(searchTerm);
            setSelectedCategory('All');
            setSearchParams(
              { category: 'All', search: searchTerm },
              { replace: true }
            );
          }}
          historyKey='searchHistory'
          initialValue={searchQuery}
        />
      </ControlsContainer>

      {/* 제품 리스트 or 로딩 스피너 */}
      <ContentWrapper>
        {isLoading ? (
          <SkeletonItemList columns={viewCols} count={products.length || 8} />
        ) : uiItems.length === 0 &&
          (searchQuery || selectedColors.length > 0) ? (
          <OverlayWrapper>
            <OverlayMessage>
              검색 결과가 없습니다
              <br />
              <CountdownText>
                {noResultCountdown}초 후 전체 카테고리로 돌아갑니다
              </CountdownText>
            </OverlayMessage>
          </OverlayWrapper>
        ) : (
          <>
            <ItemList
              items={visibleItems}
              columns={viewCols}
              onItemClick={handleOpenModal}
              isLoading={isLoading}
              observerRef={observerRef}
            />
            <div ref={observerRef} style={{ height: 1 }} />
          </>
        )}
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
    </MainContainer>
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
  padding: 1rem;
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

// row 정렬을 위한 래퍼
const RowAlignBox = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  /* margin-top: 20px; 삭제하여 위로 치우치지 않게 함 */
`;

// 오버레이 스타일 추가
const OverlayWrapper = styled.div`
  position: relative;
  width: 100%;
  min-height: 400px;
`;
const OverlayMessage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.85);
  padding: 40px 32px;
  border-radius: 18px;

  font-size: 2rem;
  font-weight: 800;
  color: #222;
  text-align: center;
  z-index: 2;
`;

// 검색 결과 없음 텍스트
const CountdownText = styled.div`
  margin-top: 18px;
  font-size: 15px;
  color: #f6ae24;
  font-weight: 600;
  width: 100%;
  text-align: center;
`;
