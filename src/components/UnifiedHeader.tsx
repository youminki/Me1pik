// src/components/UnifiedHeader.tsx

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import Cookies from 'js-cookie';
import { BiTime } from 'react-icons/bi';
import { FaUserCircle } from 'react-icons/fa';
import { useHeaderInfo } from '../api/user/userApi';

import AlarmIcon from '../assets/Header/AlarmIcon.svg';
import BasketIcon from '../assets/Header/BasketIcon.svg';
import MypageIcon from '../assets/Header/MypageIcon.svg';
import Logo from '../assets/Logo.svg';
import BackButtonIcon from '../assets/Header/BackButton.svg';
import CancleIconIcon from '../assets/Header/CancleIcon.svg';
import ShareIcon from '../assets/Header/ShareIcon.svg';
import HomeIcon from '../assets/Header/HomeIcon.svg';

import MypageModal from '../components/MypageModal';
import ReusableModal from '../components/ReusableModal';

interface HeaderContainerProps {
  variant?: 'default' | 'oneDepth' | 'twoDepth' | 'threeDepth';
}
interface UnifiedHeaderProps {
  variant?: 'default' | 'oneDepth' | 'twoDepth' | 'threeDepth';
  title?: string;
  onBack?: () => void;
  exit?: boolean;
}

const HISTORY_KEY = 'search_history';

const AnimatedHeaderWrapper = styled.div<{ exit?: boolean }>`
  will-change: transform;
`;
const HeaderWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #fff;
  z-index: 1000;
`;
const HeaderContainer = styled.header<HeaderContainerProps>`
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  position: relative;
`;
const LeftSection = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;
const CenterSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
`;

const SearchBox = styled.div<{ open: boolean }>`
  display: flex;
  align-items: center;
  border-radius: 18px;
  padding: 4px;
  padding-right: 0px;
  box-shadow: ${({ open }) => (open ? '0 2px 8px rgba(0,0,0,0.15)' : 'none')};
  transition:
    width 0.3s ease,
    box-shadow 0.25s ease,
    background 0.25s ease;
  will-change: width, box-shadow;
  position: relative;
`;
const SearchInput = styled.input<{ open?: boolean }>`
  flex: 1;
  margin-left: ${({ open }) => (open ? '8px' : '0')};
  border: none;
  outline: none;
  width: ${({ open }) => (open ? '100%' : '0')};
  opacity: ${({ open }) => (open ? 1 : 0)};
  transition:
    width 0.3s ease,
    margin-left 0.3s ease,
    opacity 0.2s ease 0.1s;
`;

const Dropdown = styled.ul`
  position: absolute;
  top: 35px;
  left: 0;
  width: 100%;
  min-width: 240px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
  overflow-y: auto;
  z-index: 9999;
`;
const Item = styled.li`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  &:hover {
    background: #f5f5f5;
  }
`;
const ClearAll = styled.div`
  text-align: center;
  padding: 8px;
  font-size: 0.8rem;
  color: #d00;
  cursor: pointer;
  &:hover {
    background: #fdecea;
  }
`;
const HistoryButton = styled.button`
  all: unset;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 12px;
  cursor: pointer;
  &:hover {
    background: #f5f5f5;
  }
`;

const Icon = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer;
`;
const LogoIcon = styled.img`
  height: 32px;
  cursor: pointer;
`;
const ProfileImage = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  margin-right: 10px;
`;
const Greeting = styled.div`
  display: flex;
  align-items: center;
`;
const GreetingText = styled.div`
  font-size: 12px;
  color: #000;
  margin-left: 4px;
`;
const Nickname = styled.span`
  font-weight: 800;
  font-size: 18px;
  color: #000;
`;
const TitleText = styled.h1`
  font-weight: 700;
  font-size: 20px;
  margin: 0;
`;
const BackButton = styled.img`
  cursor: pointer;
`;
const CancelIcon = styled.img`
  cursor: pointer;
`;

const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  variant = 'default',
  title,
  onBack,
  exit,
}) => {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nickname, setNickname] = useState('멜픽 회원');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isMypageOpen, setMypageOpen] = useState(false);

  const [isFeatureModalOpen, setFeatureModalOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const [openSearch, setOpenSearch] = useState(false);
  // query state 초기화: URL의 search 파라미터가 있으면 반영
  const [query, setQuery] = useState(searchParams.get('search') || '');
  const [historyState, setHistoryState] = useState<string[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  // react-query로 헤더 정보 패칭
  const { data: headerInfo } = useHeaderInfo();

  // 헤더 정보 조회 (로그인/닉네임 등)
  useEffect(() => {
    if (variant === 'default' || variant === 'oneDepth') {
      const token = Cookies.get('accessToken');
      setIsLoggedIn(!!token);

      const imgFromCookie = Cookies.get('profileImageUrl');
      setProfileImageUrl(imgFromCookie || null);

      if (token && headerInfo && typeof headerInfo.nickname === 'string') {
        setNickname(headerInfo.nickname);
      }
    }
  }, [variant, headerInfo]);

  // 로컬스토리지에서 히스토리 불러오기
  useEffect(() => {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) setHistoryState(JSON.parse(stored));
  }, []);

  // 바깥 클릭 시 검색창 닫기
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpenSearch(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const saveHistory = (term: string) => {
    const updated = [term, ...historyState.filter((h) => h !== term)].slice(
      0,
      5
    );
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    setHistoryState(updated);
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const term = query.trim();
    if (!term) return;
    saveHistory(term);
    // URL에 search 파라미터 설정 (기존 다른 쿼리 삭제하고 새로 설정)
    setSearchParams({ search: term });
    setOpenSearch(false);
  };

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  const handleHistoryClick = (term: string) => {
    setQuery(term);
    saveHistory(term);
    setSearchParams({ search: term });
    setOpenSearch(false);
  };

  // 렌더링: variant별로 공통 검색박스 로직 포함
  if (variant === 'default') {
    return (
      <>
        <HeaderWrapper>
          <HeaderContainer>
            <LeftSection onClick={() => isLoggedIn && setMypageOpen(true)}>
              {isLoggedIn ? (
                <Greeting>
                  {profileImageUrl ? (
                    <ProfileImage
                      src={profileImageUrl}
                      alt='프로필'
                      onError={() => setProfileImageUrl(null)}
                    />
                  ) : (
                    <FaUserCircle size={32} style={{ marginRight: 4 }} />
                  )}
                  <GreetingText>
                    <Nickname>{nickname}</Nickname> 님 안녕하세요!
                  </GreetingText>
                </Greeting>
              ) : (
                <LogoIcon src={Logo} alt='Logo' onClick={() => navigate('/')} />
              )}
            </LeftSection>

            <RightSection>
              <SearchBox open={openSearch} ref={boxRef}>
                <form
                  onSubmit={handleSearchSubmit}
                  style={{ display: 'flex', flex: 1 }}
                >
                  <SearchInput
                    open={openSearch}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder='검색어를 입력하세요'
                  />
                </form>

                {openSearch && historyState.length > 0 && (
                  <Dropdown>
                    {historyState.map((item, idx) => (
                      <Item key={idx}>
                        <HistoryButton onClick={() => handleHistoryClick(item)}>
                          <BiTime size={16} style={{ marginRight: 8 }} />
                          <span>{item}</span>
                        </HistoryButton>
                      </Item>
                    ))}
                    <ClearAll
                      onClick={() => {
                        localStorage.removeItem(HISTORY_KEY);
                        setHistoryState([]);
                      }}
                    >
                      전체 삭제
                    </ClearAll>
                  </Dropdown>
                )}
              </SearchBox>

              {isLoggedIn ? (
                <>
                  <Icon
                    src={BasketIcon}
                    alt='장바구니'
                    onClick={() => navigate('/basket')}
                  />
                  <Icon
                    src={AlarmIcon}
                    alt='알림'
                    onClick={() => setFeatureModalOpen(true)}
                  />
                </>
              ) : (
                <>
                  <Icon
                    src={MypageIcon}
                    alt='마이페이지'
                    onClick={() => navigate('/login')}
                  />
                  <Icon
                    src={AlarmIcon}
                    alt='알림'
                    onClick={() => setFeatureModalOpen(true)}
                  />
                </>
              )}
            </RightSection>
          </HeaderContainer>
        </HeaderWrapper>

        <MypageModal
          isOpen={isMypageOpen}
          onClose={() => setMypageOpen(false)}
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
  }

  if (variant === 'oneDepth') {
    return (
      <>
        <HeaderWrapper>
          <HeaderContainer>
            <LeftSection>
              <BackButton
                src={BackButtonIcon}
                alt='뒤로가기'
                onClick={handleBack}
              />
            </LeftSection>
            <RightSection>
              <SearchBox open={openSearch} ref={boxRef}>
                <form
                  onSubmit={handleSearchSubmit}
                  style={{ display: 'flex', flex: 1 }}
                >
                  <SearchInput
                    open={openSearch}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder='검색어를 입력하세요'
                  />
                </form>

                {openSearch && historyState.length > 0 && (
                  <Dropdown>
                    {historyState.map((item, idx) => (
                      <Item key={idx}>
                        <HistoryButton onClick={() => handleHistoryClick(item)}>
                          <BiTime size={16} style={{ marginRight: 8 }} />
                          <span>{item}</span>
                        </HistoryButton>
                      </Item>
                    ))}
                    <ClearAll
                      onClick={() => {
                        localStorage.removeItem(HISTORY_KEY);
                        setHistoryState([]);
                      }}
                    >
                      전체 삭제
                    </ClearAll>
                  </Dropdown>
                )}
              </SearchBox>

              {isLoggedIn ? (
                <>
                  <Icon
                    src={BasketIcon}
                    alt='장바구니'
                    onClick={() => navigate('/basket')}
                  />
                  <Icon
                    src={AlarmIcon}
                    alt='알림'
                    onClick={() => setFeatureModalOpen(true)}
                  />
                </>
              ) : (
                <>
                  <Icon
                    src={MypageIcon}
                    alt='마이페이지'
                    onClick={() => navigate('/login')}
                  />
                  <Icon
                    src={AlarmIcon}
                    alt='알림'
                    onClick={() => setFeatureModalOpen(true)}
                  />
                </>
              )}
            </RightSection>
          </HeaderContainer>
        </HeaderWrapper>

        <ReusableModal
          isOpen={isFeatureModalOpen}
          onClose={() => setFeatureModalOpen(false)}
          title='준비 중입니다'
        >
          아직 구현 전인 기능이에요.
        </ReusableModal>
      </>
    );
  }

  if (variant === 'twoDepth') {
    return (
      <>
        <HeaderWrapper>
          <HeaderContainer variant='twoDepth'>
            <LeftSection>
              <CancelIcon
                src={CancleIconIcon}
                alt='취소'
                onClick={() => navigate(-1)}
              />
            </LeftSection>
            <CenterSection>
              <TitleText>{title}</TitleText>
            </CenterSection>
            <RightSection>
              {/* twoDepth에서는 검색창이 필요 없다면 여기서 제외, 
                  필요하다면 default/oneDepth와 동일하게 SearchBox 코드를 넣으시면 됩니다 */}
              <Icon
                src={ShareIcon}
                alt='공유'
                onClick={() => setFeatureModalOpen(true)}
              />
              <Icon src={HomeIcon} alt='홈' onClick={() => navigate('/home')} />
            </RightSection>
          </HeaderContainer>
        </HeaderWrapper>

        <ReusableModal
          isOpen={isFeatureModalOpen}
          onClose={() => setFeatureModalOpen(false)}
          title='준비 중입니다'
        >
          아직 구현 전인 기능이에요.
        </ReusableModal>
      </>
    );
  }

  if (variant === 'threeDepth') {
    return (
      <AnimatedHeaderWrapper exit={exit}>
        <HeaderWrapper>
          <HeaderContainer>
            <LeftSection>
              <BackButton
                src={BackButtonIcon}
                alt='뒤로가기'
                onClick={handleBack}
              />
            </LeftSection>
            <CenterSection>
              <TitleText>{title}</TitleText>
            </CenterSection>
          </HeaderContainer>
        </HeaderWrapper>
      </AnimatedHeaderWrapper>
    );
  }

  return null;
};

export default UnifiedHeader;
