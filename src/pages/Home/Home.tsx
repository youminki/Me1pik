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
import SearchIconSvg from '../../assets/Home/SearchIcon.svg';
import MelpikGuideBanner from '../../components/MelpikGuideBanner';
import SkeletonItemList from '../../components/Home/SkeletonItemList';

/**
 * Home(상품 리스트) 페이지 - 최적화 버전
 * - react-query로 상품 데이터 관리(캐싱/중복방지)
 * - 검색/필터 useMemo 적용
 * - 무한스크롤 IntersectionObserver 적용
 * - 상태 최소화, 타입 보강, 주석 추가
 */
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
  // 검색 입력 임시 상태
  const [searchInput, setSearchInput] = useState(searchQuery);
  // 검색 히스토리(최근 검색어)
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // react-query 상품 데이터
  const {
    data: products = [],
    isLoading,
    isError,
    error,
  } = useProducts(selectedCategory === 'All' ? 'all' : selectedCategory);

  // 검색/필터된 상품 목록 (useMemo로 연산 최소화)
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    const term = searchQuery.trim().toLowerCase();
    return products.filter(
      (item) =>
        item.brand.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term)
    );
  }, [products, searchQuery]);

  // UIItem 변환 (모든 상품을 한 번에 불러옴)
  const uiItems: UIItem[] = useMemo(
    () =>
      filteredProducts.map((p) => ({
        id: p.id.toString(),
        image: p.image,
        brand: p.brand,
        description: p.description,
        price: p.price,
        discount: p.discount,
        isLiked: p.isLiked,
      })),
    [filteredProducts]
  );

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
    if (!isLoading && uiItems.length === 0 && searchQuery) {
      setNoResultCountdown(3);
      if (countdownRef.current) clearInterval(countdownRef.current);
      countdownRef.current = setInterval(() => {
        setNoResultCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!);
            setSearchQuery('');
            setSelectedCategory('All');
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
  }, [isLoading, uiItems.length, searchQuery]);

  if (isError)
    return <div>상품을 불러오는 데 실패했습니다: {String(error)}</div>;

  // 상세 모달 핸들러
  const handleOpenModal = (id: string) => {
    const params: Record<string, string> = {};
    if (searchParams.get('category')) params.category = selectedCategory;
    if (searchParams.get('search')) params.search = searchQuery;
    params.id = id;
    setSearchParams(params, { replace: true });
  };
  const handleCloseModal = () => {
    const params = Object.fromEntries(searchParams.entries());
    delete params.id;
    setSearchParams(params, { replace: true });
    setFeatureModalOpen(false);
  };

  // 공유하기 핸들러
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
        setShareModalOpen(true);
      } catch (err) {
        console.error('클립보드 복사 실패', err);
      }
    }
  };

  // 히스토리 저장 함수
  const addToHistory = (keyword: string) => {
    if (!keyword.trim()) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item !== keyword);
      const newHistory = [keyword, ...filtered].slice(0, MAX_HISTORY);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  };

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
        <RowAlignBox>
          {/* 검색 아이콘 */}
          <IconButton onClick={() => setSearchModalOpen(true)}>
            <img src={SearchIconSvg} alt='검색' />
          </IconButton>
          {/* 필터 아이콘 */}
          <FilterContainer />
        </RowAlignBox>
        {/* 검색 모달 */}
        <ReusableModal
          isOpen={isSearchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          title='제품 검색'
        >
          <ModalSearchBar>
            <ModalSearchInput
              type='text'
              placeholder='브랜드 또는 설명으로 검색...'
              value={searchInput}
              autoFocus
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSearchQuery(searchInput);
                  setSelectedCategory('All');
                  setSearchParams(
                    { category: 'All', search: searchInput },
                    { replace: true }
                  );
                  addToHistory(searchInput);
                  setSearchModalOpen(false);
                }
              }}
            />
            <ModalSearchIconButton
              onClick={() => {
                setSearchQuery(searchInput);
                setSelectedCategory('All');
                setSearchParams(
                  { category: 'All', search: searchInput },
                  { replace: true }
                );
                addToHistory(searchInput);
                setSearchModalOpen(false);
              }}
              aria-label='검색'
            >
              <img src={SearchIconSvg} alt='검색' />
            </ModalSearchIconButton>
          </ModalSearchBar>
          {/* 최근 검색어 히스토리 */}
          {searchHistory.length > 0 && (
            <HistoryContainer>
              <HistoryTitle>최근 검색어</HistoryTitle>
              <HistoryList>
                {searchHistory.map((item, idx) => (
                  <HistoryItem
                    key={item + idx}
                    onClick={() => {
                      setSearchInput(item);
                      setSearchQuery(item);
                      setSelectedCategory('All');
                      setSearchParams(
                        { category: 'All', search: item },
                        { replace: true }
                      );
                      addToHistory(item);
                      setSearchModalOpen(false);
                    }}
                  >
                    {item}
                  </HistoryItem>
                ))}
              </HistoryList>
            </HistoryContainer>
          )}
        </ReusableModal>
      </ControlsContainer>

      {/* 제품 리스트 or 로딩 스피너 */}
      <ContentWrapper>
        {isLoading ? (
          <SkeletonItemList columns={viewCols} count={products.length || 8} />
        ) : uiItems.length === 0 && searchQuery ? (
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
          <ItemList
            items={uiItems}
            columns={viewCols}
            onItemClick={handleOpenModal}
            isLoading={isLoading}
          />
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
  margin: 8px 0;
  position: relative;
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
  right: 20px;
  width: 50px;
  height: 50px;
  border: none;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  background: #f6ae24;
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
  margin-top: 20px;
`;

// 필터 아이콘과 동일한 스타일의 검색 아이콘 버튼
const IconButton = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  img {
    width: 16px;
    height: 16px;
    padding: 10px;
    border-radius: 4px;
    border: 1px solid #ccc;
    background-color: #f9f9f9;
    transition: background-color 0.3s ease;
  }
  &:hover img {
    background-color: #e6e6e6;
  }
`;

// 모달 내 검색 바(가로 배치, 버튼이 인풋 오른쪽)
const ModalSearchBar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-top: 18px;
`;

const ModalSearchInput = styled.input`
  border: 1.5px solid #ccc;
  border-radius: 6px 0 0 6px;
  font-size: 17px;
  padding: 12px 16px;
  width: 260px;
  outline: none;
  box-sizing: border-box;
  background: #fafafa;
`;

// 모달 내 검색 아이콘 버튼
const ModalSearchIconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  width: 48px;

  border: 1.5px solid #ccc;
  border-left: none;
  border-radius: 0 6px 6px 0;
  cursor: pointer;
  transition: background 0.2s;
  padding: 0;
  &:hover {
    background: #ffbe4b;
  }
  img {
    width: 20px;
    height: 20px;
    filter: brightness(0.7);
  }
`;

// 최근 검색어 히스토리 스타일
const HistoryContainer = styled.div`
  margin-top: 24px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const HistoryTitle = styled.div`
  font-size: 14px;
  color: #888;
  margin-bottom: 8px;
  font-weight: 600;
`;

const HistoryList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0;
  margin: 0;
`;

const HistoryItem = styled.li`
  list-style: none;
  background: #f5f5f5;
  color: #333;
  border-radius: 16px;
  padding: 6px 16px;
  font-size: 15px;
  cursor: pointer;
  border: 1px solid #e0e0e0;
  transition:
    background 0.2s,
    color 0.2s;
  &:hover {
    background: #ffe6b8;
    color: #f6ae24;
  }
`;

// 최근 검색어 최대 개수
const MAX_HISTORY = 8;

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
`;
