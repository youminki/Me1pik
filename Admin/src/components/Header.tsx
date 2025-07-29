// src/components/Header.tsx
import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Header: React.FC = () => {
  const navigate = useNavigate();

  // 로그아웃 처리: 토큰 삭제 후 이동
  const handleLogout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    navigate('/login');
  };

  return (
    <HeaderContainer>
      <GreetingContainer>
        <UnderlinedName>홍길동</UnderlinedName>
        <GreetingText> 님! 안녕하세요.</GreetingText>
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
  height: 80px; /* 헤더 높이 */
  margin-right: 60px;
  width: 100vw;
  background-color: #ffffff;
`;

const GreetingContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 16px;
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

const LogoutButton = styled.button`
  width: 92px;
  height: 34px;
  background: #ffffff;
  border: 1px solid #dddddd;
  font-weight: 800;
  font-size: 14px;
  color: #000000;
  cursor: pointer;

  &:hover {
    background-color: #f8f8f8;
  }
`;
