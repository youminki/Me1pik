// src/pages/MyinfoList.tsx

import React, { useState, useEffect } from 'react';
import { FaPlus, FaUserCircle } from 'react-icons/fa';
import { HiArrowLongRight } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import {
  getHeaderInfo,
  HeaderInfoResponse,
} from '@/api-utils/user-managements/users/userApi';
import alarmIcon from '@/assets/my-info/alarmIcon.svg';
import deliveryIcon from '@/assets/my-info/deliveryIcon.svg';
import MyInfoListBackgroundimage from '@/assets/my-info/MyInfoListBackgroundimage.png';
import passwordIcon from '@/assets/my-info/PasswordChangeIcon.svg';
import styleIcon from '@/assets/my-info/styleIcon.svg';
import userInfoIcon from '@/assets/my-info/UserInfoChangeIcon.svg';
import ErrorMessage from '@/components/shared/ErrorMessage';
import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ReusableModal from '@/components/shared/modals/ReusableModal';
import { getCurrentToken } from '@/utils/auth';

const MENU_ITEMS = [
  {
    key: 'info',
    title: '회원정보',
    desc: '계정, 닉네임, 성별, 서비스 지역',
    iconSrc: userInfoIcon,
  },
  {
    key: 'style',
    title: '스타일 정보',
    desc: '사이즈 설정, 브랜드 선택, 실측정보',
    iconSrc: styleIcon,
  },
  {
    key: 'password',
    title: '비밀번호 설정',
    desc: '8자리 이상 (문자, 숫자 조합)',
    iconSrc: passwordIcon,
  },
  {
    key: 'address',
    title: '배송지 설정',
    desc: '주소지, 배송 메시지',
    iconSrc: deliveryIcon,
  },
];

const MyinfoList: React.FC = () => {
  const navigate = useNavigate();
  const [notifyOn, setNotifyOn] = useState(true);

  // 프로필 관련: API 호출 결과 저장
  const [headerInfo, setHeaderInfo] = useState<HeaderInfoResponse | null>(null);
  const [loadingHeader, setLoadingHeader] = useState<boolean>(true);

  // 프로필 이미지 클릭 시 "미구현" 모달
  const [isProfilePlaceholderOpen, setProfilePlaceholderOpen] = useState(false);

  // 마운트 시 헤더 정보 조회
  useEffect(() => {
    const fetchHeader = async () => {
      try {
        setLoadingHeader(true);
        const data = await getHeaderInfo();
        setHeaderInfo(data);
      } catch (err: unknown) {
        console.error('헤더 정보 조회 실패:', err);

        // 401 오류인 경우 로그인 페이지로 이동
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { response?: { status?: number } };
          if (axiosError.response?.status === 401) {
            navigate('/login');
            return;
          }
        }

        // 다른 오류는 사용자에게 알림
        setHeaderInfo(null);
      } finally {
        setLoadingHeader(false);
      }
    };

    // 토큰이 있는 경우에만 API 호출
    const token = getCurrentToken();
    if (token && token.trim() !== '') {
      fetchHeader();
    } else {
      setLoadingHeader(false);
      navigate('/login');
    }
  }, [navigate]);

  const handleMenuClick = (key: string) => {
    if (key === 'info') {
      navigate('/updateprofile');
    } else if (key === 'password') {
      navigate('/ChangePassword');
    } else if (key === 'address') {
      navigate('/deliveryManagement');
    } else if (key === 'style') {
      navigate('/MyStyle'); // 내스타일 페이지로 이동
    }
  };

  // 프로필 정보 렌더링 분기 처리
  if (loadingHeader) {
    return <LoadingSpinner label='내 정보를 불러오는 중입니다...' />;
  }
  if (!headerInfo) {
    return <ErrorMessage message='내 정보를 불러오지 못했습니다.' />;
  }

  return (
    <>
      <UnifiedHeader
        variant='threeDepth'
        title='내 정보'
        backgroundImage={MyInfoListBackgroundimage}
        centerTitle
        showLogoutButton
      />
      <Container>
        {/* Profile Section */}
        <ProfileSection>
          <ProfileImageWrapper onClick={() => setProfilePlaceholderOpen(true)}>
            <ProfileImage>
              <ProfileIcon>
                <FaUserCircle size={80} />
              </ProfileIcon>
              <PlusButton>
                <FaPlus size={12} />
              </PlusButton>
            </ProfileImage>
          </ProfileImageWrapper>
        </ProfileSection>

        {/* Content Section */}
        <ContentSection>
          {/* User Info Box */}
          <UserInfoBox>
            <UserInfoLeft>
              <UserInfoText>
                닉네임{' '}
                <span style={{ marginLeft: '8px' }}>
                  <strong>{headerInfo.nickname}</strong>
                </span>
              </UserInfoText>
            </UserInfoLeft>
            <UserInfoDivider />
            <UserInfoRight>
              <UserInfoText>
                가입{' '}
                <span style={{ marginLeft: '8px' }}>
                  <strong>2025-07-01</strong>
                </span>
              </UserInfoText>
            </UserInfoRight>
          </UserInfoBox>

          {/* Menu Items */}
          <MenuContainer>
            {MENU_ITEMS.map(({ key, title, desc, iconSrc }) => (
              <MenuItem key={key} onClick={() => handleMenuClick(key)}>
                <MenuIcon>
                  <IconImg src={iconSrc} alt={title} />
                </MenuIcon>
                <MenuContent>
                  <MenuTitle>{title}</MenuTitle>
                  <MenuDesc>{desc}</MenuDesc>
                </MenuContent>
                <MenuArrow>
                  <ArrowIcon>
                    <HiArrowLongRight size={30} />
                  </ArrowIcon>
                </MenuArrow>
              </MenuItem>
            ))}
          </MenuContainer>

          {/* Notification Settings */}
          <NotificationSection>
            <NotificationItem>
              <NotificationIcon>
                <IconImg src={alarmIcon} alt='알림 설정' />
              </NotificationIcon>
              <NotificationContent>
                <NotificationTitle>알림 설정</NotificationTitle>
                <NotificationDesc>
                  주문내역, 제품발송, 회수안내
                </NotificationDesc>
              </NotificationContent>
              <ToggleSwitch onClick={() => setNotifyOn(!notifyOn)}>
                <ToggleBackground $on={notifyOn} />
                <ToggleHandle $on={notifyOn}>
                  <ToggleText>{notifyOn ? '켜짐' : '꺼짐'}</ToggleText>
                </ToggleHandle>
              </ToggleSwitch>
            </NotificationItem>
          </NotificationSection>
        </ContentSection>

        {/* 프로필 이미지 클릭 시 미구현 모달 */}
        {isProfilePlaceholderOpen && (
          <ReusableModal
            isOpen={isProfilePlaceholderOpen}
            onClose={() => setProfilePlaceholderOpen(false)}
            title='준비 중입니다'
          >
            아직 구현 전인 기능이에요.
          </ReusableModal>
        )}
      </Container>
    </>
  );
};

export default MyinfoList;

/* ─────────────────── Styled Components ─────────────────── */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: #fff;
  margin: -1rem;
  padding: 0;
  max-width: 600px;

  @media (min-width: 768px) {
    margin: 0 auto;
  }
`;

const ProfileSection = styled.div`
  position: relative;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: url(${MyInfoListBackgroundimage}) no-repeat center center;
  background-size: cover;
`;

const ProfileImageWrapper = styled.div`
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  z-index: 10;
`;

const ProfileImage = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const ProfileIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #ccc;
`;

const PlusButton = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 24px;
  height: 24px;
  background: #f6ae24;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border: 2px solid #fff;
`;

const ContentSection = styled.div`
  flex: 1;
  padding: 60px 20px 20px;
  background: #fff;
  border-radius: 20px 20px 0 0;
  margin-top: -20px;
  position: relative;
  z-index: 1;
`;

const UserInfoBox = styled.div`
  display: flex;
  align-items: center;
  background: #fff;
  border: 2px solid #000;
  height: 64px;

  margin-bottom: 30px;
  overflow: hidden;
`;

const UserInfoLeft = styled.div`
  flex: 1;

  text-align: center;
`;

const UserInfoRight = styled.div`
  flex: 1;

  text-align: center;
`;

const UserInfoDivider = styled.div`
  width: 1px;
  height: 64px;
  background: #000;
`;

const UserInfoText = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: #000;
`;

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 30px;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 20px 0;
  border: 1px solid #ccc;
  border-radius: 0 0 8px 0;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  margin-bottom: 10px;

  &:hover {
    background: #f9f9f9;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const MenuIcon = styled.div`
  width: 60px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  margin-left: 20px;
  flex-shrink: 0;
`;

const IconImg = styled.img`
  width: 50px;
  height: 50px;
  object-fit: contain;
`;

const MenuContent = styled.div`
  flex: 1;
`;

const MenuTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #000;
  margin-bottom: 4px;
`;

const MenuDesc = styled.div`
  font-size: 12px;
  color: #666;
`;

const MenuArrow = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 50px;
  height: 50px;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px 0 8px 0;
`;

const ArrowIcon = styled.div`
  color: #fff;
  font-size: 20px;
  font-weight: bold;
`;

const NotificationSection = styled.div`
  margin-top: 96px;
  background: #f5f5f5;

  padding: 20px;
  position: relative;
  overflow: hidden;
  border: 1px solid #ccc;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 110px;
    height: 100%;

    background: linear-gradient(135deg, #fff 0%, #fff 60%, transparent 100%);
    clip-path: polygon(0 0, 100% 0, 60% 100%, 0% 100%);
  }
`;

const NotificationItem = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
`;

const NotificationIcon = styled.div`
  width: 60px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 35px;
  flex-shrink: 0;
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #000;
  margin-bottom: 4px;
`;

const NotificationDesc = styled.div`
  font-size: 12px;
  color: #666;
`;

const ToggleSwitch = styled.div`
  position: relative;
  width: 60px;
  height: 30px;
  cursor: pointer;
`;

const ToggleBackground = styled.div<{ $on: boolean }>`
  position: absolute;
  width: 100%;
  height: 100%;
  background: ${({ $on }) => ($on ? '#333' : '#ccc')};
  border-radius: 15px;
  transition: background 0.3s ease;
`;

const ToggleHandle = styled.div<{ $on: boolean }>`
  position: absolute;
  top: 2px;
  left: ${({ $on }) => ($on ? '32px' : '2px')};
  width: 26px;
  height: 26px;
  background: #fff;
  border-radius: 50%;
  transition: left 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ToggleText = styled.div`
  font-size: 8px;
  font-weight: 600;
  color: #000;
`;
