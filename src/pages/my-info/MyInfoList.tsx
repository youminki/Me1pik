// src/pages/MyinfoList.tsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Cookies from 'js-cookie';
import userInfoIcon from '../../assets/my-info/UserInfoChangeIcon.svg';
import passwordIcon from '../../assets/my-info/PasswordChangeIcon.svg';
import deliveryIcon from '../../assets/my-info/DeliveryAdminIcon.svg';
import { FaPlus, FaUserCircle, FaLongArrowAltRight } from 'react-icons/fa';
import ReusableModal from '../../components/shared/modals/ReusableModal';
import { useNavigate } from 'react-router-dom';

// 추가: API import
import {
  getHeaderInfo,
  HeaderInfoResponse,
} from '../../api-utils/user-managements/users/userApi';

const MENU_ITEMS = [
  {
    key: 'info',
    title: '회원정보 변경',
    desc: '이름, 생년월일, 성별, 휴대전화, 서비스 지역',
    iconSrc: userInfoIcon,
  },
  {
    key: 'password',
    title: '비밀번호 변경',
    desc: '8자리 이상 (문자, 숫자, 특수문자 조합)',
    iconSrc: passwordIcon,
  },
  {
    key: 'address',
    title: '배송지 관리',
    desc: '배송지명, 우편번호, 상세주소',
    iconSrc: deliveryIcon,
  },
];

const MyinfoList: React.FC = () => {
  const navigate = useNavigate();
  const [notifyOn, setNotifyOn] = useState(false);

  // 프로필 관련: API 호출 결과 저장
  const [headerInfo, setHeaderInfo] = useState<HeaderInfoResponse | null>(null);
  const [loadingHeader, setLoadingHeader] = useState<boolean>(true);

  // 프로필 이미지 클릭 시 “미구현” 모달
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
    const token = Cookies.get('accessToken');
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
    }
  };

  return (
    <PageContainer>
      {/* PROFILE */}
      <ProfileSection>
        <AvatarWrapper onClick={() => setProfilePlaceholderOpen(true)}>
          <FaUserCircle size={70} color='#999' />
          <PlusBadge>
            <FaPlus size={12} />
          </PlusBadge>
        </AvatarWrapper>
        <ProfileBox>
          <ProfileText>
            {loadingHeader ? (
              <>
                <Email>로딩 중...</Email>
                <Nickname>닉네임 불러오는 중</Nickname>
              </>
            ) : headerInfo ? (
              <>
                <Email>{headerInfo.email}</Email>
                <Nickname>닉네임: {headerInfo.nickname}</Nickname>
              </>
            ) : (
              <>
                <Email>정보를 가져올 수 없습니다.</Email>
                <Nickname>닉네임: -</Nickname>
              </>
            )}
          </ProfileText>
        </ProfileBox>
      </ProfileSection>

      <ContentDivider />

      {/* MENU LIST */}
      <MenuList>
        {MENU_ITEMS.map(({ key, title, desc, iconSrc }) => (
          <MenuItem key={key} onClick={() => handleMenuClick(key)}>
            <IconBox>
              <IconImg src={iconSrc} alt={title} />
            </IconBox>
            <TextBox>
              <MenuTitle>{title}</MenuTitle>
              <MenuDesc>{desc}</MenuDesc>
            </TextBox>
            <Panel>
              <PickText>PICK</PickText>
              <FaLongArrowAltRight size={24} />
            </Panel>
          </MenuItem>
        ))}
      </MenuList>

      {/* 알림 설정 */}
      <Section>
        <SectionHeader>알림 설정</SectionHeader>
        <SectionBody>
          <StatusText>
            상태 | <StrongText>알림 받기</StrongText>
          </StatusText>
          <ToggleWrapper onClick={() => setNotifyOn((v) => !v)}>
            <ToggleBg on={notifyOn} />
            <ToggleCircle on={notifyOn}>
              <ToggleText>{notifyOn ? 'ON' : 'OFF'}</ToggleText>
            </ToggleCircle>
          </ToggleWrapper>
        </SectionBody>
      </Section>

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
    </PageContainer>
  );
};

export default MyinfoList;

/* ─────────────────── Styled Components for MyinfoList ─────────────────── */
const PageContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
  background: #fff;
`;

const ProfileSection = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;
const AvatarWrapper = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
`;
const PlusBadge = styled.div`
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
`;

const ProfileBox = styled.div`
  flex: 1;
  margin-left: 12px;
  border: 1px solid #ddd;
  border-radius: 10px 0 10px 0;
  padding: 20px 12px;
  position: relative;
`;
const ProfileText = styled.div`
  display: flex;
  flex-direction: column;
`;
const Email = styled.div`
  font-size: 12px;
  font-weight: 800;
  color: #999;
`;
const Nickname = styled.div`
  font-size: 12px;
  line-height: 22px;
  font-weight: 700;
  color: #000;
  margin-top: 4px;
`;

const ContentDivider = styled.div`
  width: 100%;
  height: 1px;
  background: #ddd;
  margin: 30px 0;
`;

const MenuList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MenuItem = styled.div<{ disabled?: boolean }>`
  display: grid;
  grid-template-columns: 70px 1fr 124px;
  align-items: center;
  border: 1px solid ${({ disabled }) => (disabled ? '#eee' : '#ccc')};
  border-radius: 0 0 30px 0;
  overflow: hidden;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;

const IconBox = styled.div`
  width: 70px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const IconImg = styled.img`
  width: 50px;
  height: 60px;
`;
const TextBox = styled.div`
  padding: 16px;
`;

const MenuTitle = styled.div<{ disabled?: boolean }>`
  font-size: 14px;
  font-weight: 700;
  color: ${({ disabled }) => (disabled ? '#aaa' : '#000')};
`;
const MenuDesc = styled.div<{ disabled?: boolean }>`
  font-size: 9px;
  color: ${({ disabled }) => (disabled ? '#ccc' : '#ccc')};
  margin-top: 4px;
`;

const Panel = styled.div<{ disabled?: boolean }>`
  width: 124px;
  height: 100px;
  background: ${({ disabled }) => (disabled ? '#f0f0f0' : '#f6ae24')};
  border-radius: 0 0 30px 0;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 12px;
  color: ${({ disabled }) => (disabled ? '#999' : '#fff')};
  letter-spacing: 1px;
`;
const PickText = styled.div<{ disabled?: boolean }>`
  font-weight: 900;
  font-size: 10px;
  line-height: 11px;
  margin-left: 40px;
  margin-bottom: 6px;
  color: ${({ disabled }) => (disabled ? '#999' : '#fff')};
`;

const Section = styled.section`
  margin-top: 50px;
`;
const SectionHeader = styled.div`
  font-size: 10px;
  font-weight: 700;
  color: #000;
  margin-bottom: 8px;
`;
const SectionBody = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 20px 12px;
`;

const StatusText = styled.div`
  flex: 1;
  font-size: 13px;
  color: #000;
`;
const StrongText = styled.span`
  font-weight: 800;
`;

const ToggleWrapper = styled.div`
  position: relative;
  width: 60px;
  height: 30px;
  cursor: pointer;
`;
const ToggleBg = styled.div<{ on: boolean }>`
  position: absolute;
  width: 60px;
  height: 30px;
  background: ${({ on }) => (on ? '#222' : '#ccc')};
  border-radius: 15px;
`;
const ToggleCircle = styled.div<{ on: boolean }>`
  position: absolute;
  top: 1px;
  left: ${({ on }) => (on ? '30px' : '2px')};
  width: 28px;
  height: 28px;
  background: #fff;
  border-radius: 50%;
`;
const ToggleText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 10px;
  font-weight: 700;
  color: #000;
`;
