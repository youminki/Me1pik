// src/pages/Brand/BrandDetail.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import StatsSection from '../../components/Brand/StatsSection';
import SubHeader from '../../components/Home/SubHeader';
import ItemList, { UIItem } from '../../components/Home/ItemList';
import FilterContainer from '../../components/Home/FilterContainer';
import { getBrandList, Brand as ApiBrand } from '../../api/brand/brandApi';
import {
  getProductsByBrand,
  Product as ApiProduct,
} from '../../api/product/product';

import HomeDetail from '../Home/HomeDetail';
import CancleIconIcon from '../../assets/Header/CancleIcon.svg';
import ShareIcon from '../../assets/Header/ShareIcon.svg';
import HomeIcon from '../../assets/Header/HomeIcon.svg';
import ReusableModal from '../../components/ReusableModal';
import SearchIconSvg from '../../assets/Home/SearchIcon.svg';
import ArrowIconSvg from '../../assets/ArrowIcon.svg';
import SkeletonItemList from '../../components/Home/SkeletonItemList';

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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // UnifiedHeader 검색창에서 ?search=... 이 설정되면 여기서 읽어옴
  const searchTerm = searchParams.get('search')?.trim().toLowerCase() || '';

  // 브랜드 정보 상태
  const [brand, setBrand] = useState<LocalBrand | null>(null);

  // 제품 목록 상태
  const [allProducts, setAllProducts] = useState<ApiProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ApiProduct[]>([]);
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
        const data: ApiBrand[] = await getBrandList();
        const found = data.find((b) => b.id === idNum);
        if (found) {
          setBrand({
            id: found.id,
            name: found.brandName,
            category: found.brand_category || '',
            group: found.groupName || '',
            company: '',
            productCount: found.productCount || 0,
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
          selectedCategory === 'All' ? 'All' : selectedCategory;
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

  // 검색어(searchTerm) 또는 allProducts 변경 시 filteredProducts 업데이트
  useEffect(() => {
    if (!searchTerm) {
      setFilteredProducts(allProducts);
    } else {
      const filtered = allProducts.filter((p) => {
        const name = (p.name || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        return name.includes(searchTerm) || desc.includes(searchTerm);
      });
      setFilteredProducts(filtered);
    }
  }, [allProducts, searchTerm]);

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

  // 검색 모달 상태 및 입력값, 히스토리
  const [isSearchModalOpen, setSearchModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('brandSearchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  // 최근 검색어 최대 개수
  const MAX_HISTORY = 8;
  // 검색 히스토리 저장 함수
  const addToHistory = (keyword: string) => {
    if (!keyword.trim()) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item !== keyword);
      const newHistory = [keyword, ...filtered].slice(0, MAX_HISTORY);
      localStorage.setItem('brandSearchHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  };

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

  // 검색 결과 없음 카운트다운
  const [noResultCountdown, setNoResultCountdown] = useState(3);
  const countdownRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!loadingProducts && uiItems.length === 0 && searchTerm) {
      setNoResultCountdown(3);
      if (countdownRef.current) clearInterval(countdownRef.current);
      countdownRef.current = setInterval(() => {
        setNoResultCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!);
            setSearchParams({ category: 'All' }, { replace: true });
            setSelectedCategory('All');
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
  }, [loadingProducts, uiItems.length, searchTerm]);

  // UI 렌더링
  return (
    <PageWrapper>
      <Container>
        <Header>
          <Title>{brand?.name}</Title>
          <Subtitle>새로운 시즌 제품들을 내 손안에!</Subtitle>
        </Header>

        <StatsSection brandCount={1} productCount={brand?.productCount || 0} />
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
                    setSearchParams(
                      { category: 'All', search: searchInput },
                      { replace: true }
                    );
                    setSelectedCategory('All');
                    addToHistory(searchInput);
                    setSearchModalOpen(false);
                  }
                }}
              />
              <ModalSearchIconButton
                onClick={() => {
                  setSearchParams(
                    { category: 'All', search: searchInput },
                    { replace: true }
                  );
                  setSelectedCategory('All');
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
                        setSearchParams(
                          { category: 'All', search: item },
                          { replace: true }
                        );
                        setSelectedCategory('All');
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

        <MainContent>
          {loadingProducts ? (
            <SkeletonItemList
              columns={viewCols}
              count={allProducts.length || 8}
            />
          ) : errorProducts ? (
            <StatText>{errorProducts}</StatText>
          ) : uiItems.length === 0 && searchTerm ? (
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
              onItemClick={handleItemClick}
            />
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
  );
};

export default BrandDetail;

// styled components (기존 그대로)
const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: #fff;
  padding: 1rem;
  margin: auto;
  max-width: 1000px;
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
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin: 12px 0;
  position: relative;
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

const StatText = styled.div`
  font-size: 14px;
  color: #666;
  padding: 15px 20px;
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

// styled-components: Home.tsx에서 검색 관련 컴포넌트 복사
const RowAlignBox = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
`;
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

// styled-components: Home.tsx에서 ContentWrapper, NoResultText, CountdownText 복사 (파일 하단에 위치)
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  margin: auto;
  max-width: 1000px;
  padding: 1rem;
`;
const MainContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CountdownText = styled.div`
  margin-top: 18px;
  font-size: 15px;
  color: #f6ae24;
  font-weight: 600;
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
