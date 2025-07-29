// src/Layout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import List from '@components/List';
import Header from '@components/Header';

const Layout: React.FC = () => {
  return (
    <Container>
      {/* 왼쪽 사이드바 */}
      <SidebarContainer>
        <List />
      </SidebarContainer>

      {/* 메인 콘텐츠 (스크롤 가능) */}
      <ContentContainer>
        <Outlet />
      </ContentContainer>

      {/* 오른쪽 상단에 고정된 헤더 */}
      <HeaderWrapper>
        <Header />
      </HeaderWrapper>
    </Container>
  );
};

export default Layout;

/* ====================== Styled Components ====================== */

const Container = styled.div`
  position: relative; /* 자식인 HeaderWrapper가 절대 위치를 잡을 수 있도록 */
  display: flex;
  width: 100%;
  height: 100vh; /* 전체 화면 높이를 차지(필요시 조정) */
`;

/** 왼쪽 사이드바 */
const SidebarContainer = styled.div`
  width: 70px;
  padding: 80px 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

/** 메인 콘텐츠 영역 */
const ContentContainer = styled.div`
  flex: 1;
  overflow-x: hidden;
  /* overflow-y: auto; 제거 */
  padding: 90px 2rem;
`;

/** 헤더를 오른쪽 상단에 고정하기 위한 래퍼 */
const HeaderWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  /* 필요하면 z-index 설정 */
`;
