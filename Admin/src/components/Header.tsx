// src/components/Header.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/utils/auth';
import { getAdminProfile, AdminProfile } from '@/api/adminAuth';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 관리자 프로필 정보 가져오기
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        setIsLoading(true);
        const profile = await getAdminProfile();
        setAdminProfile(profile);
      } catch (error) {
        console.error('관리자 프로필 조회 실패:', error);
        // 에러 발생 시 기본값 설정
        setAdminProfile({
          id: 'admin',
          name: '관리자',
          email: 'admin@example.com',
          role: 'admin',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  // 로그아웃 처리: 새로운 auth.ts 파일의 logout 함수 사용
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <HeaderContainer>
      <GreetingContainer>
        {isLoading ? (
          <LoadingText>로딩 중...</LoadingText>
        ) : (
          <>
            <UnderlinedName>{adminProfile?.name || '관리자'}</UnderlinedName>
            <GreetingText> 님! 안녕하세요.</GreetingText>
          </>
        )}
      </GreetingContainer>
      <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
    </HeaderContainer>
  );
};

export default Header;

/* ====================== Styled Components ====================== */

const HeaderContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 60px; /* 헤더 높이 축소 */

  width: 100vw;
  background-color: #ffffff;
  padding: 0 50px; /* 좌우 패딩 최소화 */
  border-bottom: 1px solid #e0e0e0; /* 아래 회색선 추가 */
`;

const GreetingContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 12px; /* 여백 축소 */
`;

const UnderlinedName = styled.span`
  font-weight: 800;
  font-size: 14px;
  color: #000000;
  text-decoration: underline;
  text-underline-offset: 5px;
`;

const GreetingText = styled.span`
  font-weight: 400;
  font-size: 14px;
  color: #aaaaaa;
`;

const LoadingText = styled.span`
  font-weight: 400;
  font-size: 14px;
  color: #aaaaaa;
`;

const LogoutButton = styled.button`
  width: 80px; /* 너비 축소 */
  height: 32px; /* 높이 축소 */
  background: #ffffff;
  border: 1px solid #dddddd;
  font-weight: 800;
  font-size: 13px; /* 폰트 크기 축소 */
  color: #000000;
  cursor: pointer;
  border-radius: 4px; /* 모서리 둥글게 */

  &:hover {
    background-color: #f8f8f8;
    border-color: #cccccc;
  }
`;
