/**
 * 첫 번째 랜딩 페이지 컴포넌트 (LandingPage1.tsx)
 *
 * 멜픽 서비스의 첫 번째 랜딩 페이지를 제공합니다.
 * 브랜드 옷을 사고, 팔고, 빌리는 서비스를 소개하며, 로그인 페이지로의 이동을 제공합니다.
 *
 * @description
 * - 브랜드 옷 거래 서비스 소개
 * - 로그인 페이지 이동 기능
 * - 반응형 디자인 지원
 * - 배경 이미지와 오버레이 텍스트
 * - 호버 및 클릭 애니메이션 효과
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import LandingBackground from '@/assets/landings/LandingBackground.jpg';
import LeftLabel from '@/assets/landings/LeftLabel.svg';

/**
 * 첫 번째 랜딩 페이지 컴포넌트
 *
 * 멜픽 서비스의 메인 랜딩 페이지로, 서비스 소개와 로그인 유도를 제공합니다.
 * 배경 이미지 위에 텍스트와 버튼을 오버레이하여 시각적 임팩트를 줍니다.
 *
 * @returns 첫 번째 랜딩 페이지 JSX 요소
 */
const LandingPage1: React.FC = () => {
  const navigate = useNavigate();

  /**
   * 로그인 버튼 클릭 핸들러
   *
   * 로그인 페이지로 이동합니다.
   */
  const handleRegisterClick = () => {
    navigate('/login');
  };

  return (
    <Wrapper>
      <LeftLabelImage src={LeftLabel} alt='Left Label' />

      <Container>
        <ContentBox>
          <BigTitle>
            이젠 <BrandSpan>브랜드 옷</BrandSpan>을
            <br />
            사고, 팔고, 빌리는
          </BigTitle>
          <SubTitle>멜픽에서 새롭게 경험하세요</SubTitle>
          <RegisterButton onClick={handleRegisterClick}>
            로그인 하러가기
          </RegisterButton>
        </ContentBox>
      </Container>
    </Wrapper>
  );
};

export default LandingPage1;

/**
 * 전체 랜딩 페이지 래퍼
 *
 * 랜딩 페이지의 전체 레이아웃을 감싸는 컨테이너입니다.
 * 마진과 오버플로우를 설정합니다.
 */
const Wrapper = styled.div`
  position: relative;
  width: 100%;

  margin: 20px 10px;
  overflow: visible;
`;

/**
 * 왼쪽 라벨 이미지
 *

 * 랜딩 페이지의 왼쪽 상단에 배치되는 라벨 이미지입니다.
 * 절대 위치로 배치되어 다른 요소들과 겹치지 않습니다.
 */
const LeftLabelImage = styled.img`
  position: absolute;
  top: -35px;
  left: -35px;
  z-index: 2;
  width: auto;
  height: auto;
`;

/**
 * 메인 컨테이너
 *

 * 랜딩 페이지의 메인 컨테이너로, 배경 이미지와 콘텐츠를 포함합니다.
 * 반응형 높이 조정과 중앙 정렬을 제공합니다.
 */
const Container = styled.div`
  position: relative;
  width: 100%;
  max-width: 1000px;
  min-height: 440px;

  aspect-ratio: 16 / 9;
  border-radius: 10px;
  box-sizing: border-box;
  overflow: hidden;
  background: url(${LandingBackground}) no-repeat center/cover;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  margin: 0 auto;

  @media (min-width: 1000px) {
    height: 700px;
    aspect-ratio: unset;
  }
`;

/**
 * 콘텐츠 박스
 *

 * 텍스트와 버튼을 포함하는 콘텐츠 영역입니다.
 * 하단에 배치되어 배경 이미지 위에 오버레이됩니다.
 */
const ContentBox = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

/**
 * 메인 제목
 *

 * 랜딩 페이지의 메인 제목을 표시합니다.
 * 큰 폰트 크기와 굵은 폰트 웨이트를 사용합니다.
 */
const BigTitle = styled.h1`
  font-weight: 800;
  font-size: 2rem;
  line-height: 1.1;
  text-align: center;
  color: #ffffff;
  margin: 0 0 20px 0;
`;

/**
 * 브랜드 강조 스팬
 *

 * "브랜드 옷" 텍스트를 강조하는 스팬 요소입니다.
 * 주황색으로 강조하여 시각적 임팩트를 줍니다.
 */
const BrandSpan = styled.span`
  color: #f6ac36;
`;

/**
 * 부제목
 *

 * 랜딩 페이지의 부제목을 표시합니다.
 * 중간 크기의 폰트와 굵은 폰트 웨이트를 사용합니다.
 */
const SubTitle = styled.h2`
  font-weight: 700;
  font-size: 1rem;
  line-height: 1.1;
  text-align: center;
  color: #ffffff;
  margin: 0 0 47px 0;
`;

/**
 * 로그인 버튼
 *

 * 로그인 페이지로 이동하는 메인 액션 버튼입니다.
 * 호버와 클릭 시 스케일 애니메이션을 제공합니다.
 */
const RegisterButton = styled.button`
  width: 100%;
  max-width: 320px;
  height: 56px;
  background: rgba(34, 34, 34, 0.9);
  border: none;
  border-radius: 6px;
  cursor: pointer;

  font-weight: 800;
  font-size: 1rem;
  line-height: 1.1;
  color: #ffffff;
  transition: transform 0.1s;
  margin-bottom: 60px;

  &:hover {
    transform: scale(1.05);
  }
  &:active {
    transform: scale(0.95);
  }
`;
