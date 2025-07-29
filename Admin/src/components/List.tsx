import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import HomeIcon from 'src/assets/Home.svg';
import MemberIcon from 'src/assets/Member.svg';
import AdminIcon from 'src/assets/Admin.svg';
import PaymentIcon from 'src/assets/Payment.svg';
import SettingIcon from 'src/assets/Setting.svg';
import ListLogo from 'src/assets/ListLogo.svg';

/**
 * 2개의 가로 막대를 쌓은 TopBar
 */
const DoubleTopBar: React.FC = () => {
  return (
    <DoubleBarContainer>
      <Bar />
      <Bar />
    </DoubleBarContainer>
  );
};

const List: React.FC = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMenuClick = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const location = useLocation();
  useEffect(() => {
    setActiveMenu(null);
  }, [location.pathname]);

  // 메뉴 영역 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Container ref={containerRef}>
      {/* 상단 블랙 바 */}
      <BlackBar>
        {/* 두 줄로 된 탑바 */}
        <DoubleTopBar />
        <NavIcons>
          {/* 대시보드 아이콘 */}
          <NavIcon onClick={() => navigate('/dashboard')} $isActive={activeMenu === 'dashboard'}>
            <Icon src={HomeIcon} alt="Home" $isActive={activeMenu === 'dashboard'} />
          </NavIcon>

          {/* 관리자 아이콘 */}
          <NavIcon onClick={() => handleMenuClick('admin')} $isActive={activeMenu === 'admin'}>
            <Icon src={AdminIcon} alt="Admin" $isActive={activeMenu === 'admin'} />
            {activeMenu === 'admin' && (
              <SubMenu>
                <SubMenuItem onClick={() => navigate('/adminlist')}>관리자 관리</SubMenuItem>
                <SubMenuItem onClick={() => navigate('/analysisinfo')}>분석정보</SubMenuItem>
              </SubMenu>
            )}
          </NavIcon>

          {/* 회원 아이콘 */}
          <NavIcon onClick={() => handleMenuClick('member')} $isActive={activeMenu === 'member'}>
            <Icon src={MemberIcon} alt="Member" $isActive={activeMenu === 'member'} />
            {activeMenu === 'member' && (
              <SubMenu>
                <SubMenuItem onClick={() => navigate('/userlist')}>회원 관리</SubMenuItem>
                <SubMenuItem $disabled style={{ color: '#aaa', cursor: 'default' }}>
                  회원등급 관리
                </SubMenuItem>
                <SubMenuItem onClick={() => navigate('/product-evaluation')}>회원 평가</SubMenuItem>

                {/* Divider 추가 */}
                <SubMenuDivider />

                <SubMenuItem onClick={() => navigate('/pagelist')}>멜픽 페이지</SubMenuItem>
                <SubMenuItem onClick={() => navigate('/saleslist')}>멜픽 판매내역</SubMenuItem>
                <SubMenuItem onClick={() => navigate('/calculatelist')}>멜픽 정산내역</SubMenuItem>
              </SubMenu>
            )}
          </NavIcon>

          {/* 결제 아이콘 */}
          <NavIcon onClick={() => handleMenuClick('payment')} $isActive={activeMenu === 'payment'}>
            <Icon src={PaymentIcon} alt="Payment" $isActive={activeMenu === 'payment'} />
            {activeMenu === 'payment' && (
              <SubMenu>
                <SubMenuItem onClick={() => navigate('/productlist')}>제품 관리</SubMenuItem>
                <SubMenuItem onClick={() => navigate('/brandlist')}>브랜드 관리</SubMenuItem>
                <SubMenuDivider />
                <SubMenuItem onClick={() => navigate('/Ticketlist')}>이용권 내역</SubMenuItem>
                <SubMenuItem onClick={() => navigate('/monitoringlist')}>대여 내역</SubMenuItem>
                <SubMenuItem onClick={() => navigate('/GeneralOrderList')}>구매 내역</SubMenuItem>
                <SubMenuItem onClick={() => navigate('/marketorderlist')}>
                  멜픽 구매내역
                </SubMenuItem>
              </SubMenu>
            )}
          </NavIcon>

          {/* 설정 아이콘 */}
          <NavIcon
            onClick={() => handleMenuClick('settings')}
            $isActive={activeMenu === 'settings'}
          >
            <Icon src={SettingIcon} alt="Settings" $isActive={activeMenu === 'settings'} />
            {activeMenu === 'settings' && (
              <SubMenu>
                <SubMenuItem
                  onClick={() => {
                    setActiveMenu(null); // 메뉴 닫기
                    navigate('/document/notice');
                  }}
                >
                  공지사항
                </SubMenuItem>
                <SubMenuItem onClick={() => navigate('/document/terms')}>이용약관</SubMenuItem>
                <SubMenuItem onClick={() => navigate('/document/privacy')}>
                  개인정보보호
                </SubMenuItem>
                <SubMenuItem onClick={() => navigate('/document/faq')}>FAQ</SubMenuItem>
              </SubMenu>
            )}
          </NavIcon>
        </NavIcons>
      </BlackBar>

      {/* 하단 화이트 바 */}
      <WhiteBar>
        <LogoContainer>
          <Logo src={ListLogo} alt="Logo" />
        </LogoContainer>

        {/* 두 줄로 된 탑바를 화이트 바 하단에도 표시 */}
        <BottomBar>
          <DoubleTopBar />
        </BottomBar>
      </WhiteBar>
    </Container>
  );
};
export default List;

/* ====================== Styled Components ====================== */

const Container = styled.div`
  width: 70px;
  height: 100vh;
`;

const BlackBar = styled.div`
  flex: 1;
  background-color: #2c2c2c;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  height: 50vh;
  border: 1px solid #dddddd;
  border-left: none;
  border-radius: 0 8px 0 0;
`;

const WhiteBar = styled.div`
  height: 270px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  position: relative;
  border: 1px solid #dddddd;
  border-radius: 0 0 8px 0;
  padding: 10px 0;
`;

const BottomBar = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const DoubleBarContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px; /* 막대 사이 간격 */
  margin: 20px 0; /* 상하 여백 */
`;

/* 실제 막대 */
const Bar = styled.div`
  width: 30px;
  height: 3px;
  background: rgba(153, 153, 153, 0.52);
`;

const NavIcons = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  justify-content: center;
`;

interface NavIconProps {
  $isActive: boolean;
}

const NavIcon = styled.div<NavIconProps>`
  width: 50px;
  height: 50px;
  background-color: ${({ $isActive }) => ($isActive ? '#F6AE24' : '#2c2c2c')};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  border-radius: ${({ $isActive }) => ($isActive ? '10px' : '0px')};

  &:hover {
    background-color: #f6ac36;
    border-radius: 10px;
  }
`;

interface IconProps {
  $isActive: boolean;
}

const Icon = styled.img<IconProps>`
  width: 24px;
  height: 24px;
  filter: ${({ $isActive }) => ($isActive ? 'brightness(0) invert(1)' : 'none')};
`;

const slideFade = keyframes`
  0% {
    opacity: 0;
    transform: translateX(-20px) scale(0.8);
  }
  60% {
    opacity: 1;
    transform: translateX(10px) scale(1.05);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
`;

const SubMenu = styled.div`
  position: absolute;
  left: 60px;
  top: 0;
  width: 100%;
  min-width: 100px;
  display: flex;
  flex-direction: column;
  background: #333;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #444;
  z-index: 9999;
  animation: ${slideFade} 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
`;

// 멜픽 페이지 위에 들어갈 구분선
const SubMenuDivider = styled.div`
  width: 100%;
  height: 1px;
  background: #666;
  margin: 6px 0;
`;

const SubMenuItem = styled.div<{ $disabled?: boolean }>`
  font-weight: 700;
  font-size: 12px;
  line-height: 13px;
  text-align: center;
  color: ${({ $disabled }) => ($disabled ? '#aaa' : '#fff')};
  padding: 8px 12px;
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
  border-radius: 4px;

  &:hover {
    background-color: ${({ $disabled }) => ($disabled ? 'none' : '#f6ac36')};
  }
`;

const LogoContainer = styled.div`
  width: 70px;
  height: 270px;
  display: flex;
  justify-content: center;
  padding: 20px 0;
`;

const Logo = styled.img`
  width: 26px;
  height: 200px;
`;
