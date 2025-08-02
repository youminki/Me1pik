import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import LandingBackground from '@/assets/landings/7X5A9526.jpg';
import Footer from '@/components/landings/Footer';
import Header from '@/components/landings/Header';
import LandingPage1 from '@/components/landings/LandingPage1';
import LandingPage2 from '@/components/landings/LandingPage2';
import LandingPage3 from '@/components/landings/LandingPage3';
import LandingPage4 from '@/components/landings/LandingPage4';
import LandingPage5 from '@/components/landings/LandingPage5';
import LandingPage6 from '@/components/landings/LandingPage6';
import LandingPage7 from '@/components/landings/LandingPage7';

/**
 * 랜딩 페이지 컴포넌트 (Landing.tsx)
 *
 * 애플리케이션의 메인 랜딩 페이지를 제공합니다.
 * 스크롤 기반 애니메이션, 페이드인 효과, 반응형 디자인을 포함하며,
 * 사용자에게 서비스 소개와 가입 유도를 제공합니다.
 *
 * @description
 * - 메인 랜딩 페이지
 * - 스크롤 기반 애니메이션
 * - 페이드인 효과
 * - 이미지 프리로드
 * - 반응형 디자인
 * - 서비스 소개 섹션
 */

/**
 * 스크롤 페이드인 컴포넌트 속성 인터페이스
 *
 * 스크롤 페이드인 효과를 적용할 컴포넌트의 속성을 정의합니다.
 *
 * @property children - 페이드인 효과를 적용할 자식 컴포넌트
 */
interface ScrollFadeInProps {
  children: React.ReactNode; // 페이드인 효과를 적용할 자식 컴포넌트
}

/**
 * 스크롤 방향 감지 훅
 *
 * 사용자의 스크롤 방향(위/아래)을 감지하는 커스텀 훅입니다.
 * 스크롤 애니메이션과 페이드인 효과에 활용됩니다.
 *
 * @returns 현재 스크롤 방향 ('up' | 'down')
 */
const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const lastScrollY = useRef(window.scrollY);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollDirection(currentScrollY > lastScrollY.current ? 'down' : 'up');
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollDirection;
};

/**
 * 스크롤 페이드인 컴포넌트
 *
 * 스크롤 시 요소가 화면에 나타날 때 페이드인 효과를 적용하는 컴포넌트입니다.
 * Intersection Observer API를 사용하여 성능을 최적화합니다.
 *
 * @param children - 페이드인 효과를 적용할 자식 컴포넌트
 * @returns 페이드인 효과가 적용된 컴포넌트
 */
const ScrollFadeIn: React.FC<ScrollFadeInProps> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const scrollDirection = useScrollDirection();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <FadeInWrapper
      ref={ref}
      scrollDirection={scrollDirection}
      className={visible ? 'visible' : ''}
    >
      {children}
    </FadeInWrapper>
  );
};

const Landing: React.FC = () => {
  /**
   * 이미지 프리로드
   *
   * 랜딩 페이지 배경 이미지를 미리 로드하여
   * 사용자 경험을 개선합니다.
   */
  useEffect(() => {
    const img = new Image();
    img.src = LandingBackground;
  }, []);

  return (
    <LandingContainer>
      <BackgroundWrapper>
        <BackgroundStripe2 />
        <BackgroundStripe1 />
      </BackgroundWrapper>
      <Header />
      <ContentWrapper>
        <LandingPage1 />
        <ScrollFadeIn>
          <LandingPage2 />
        </ScrollFadeIn>
        <ScrollFadeIn>
          <LandingPage3 />
        </ScrollFadeIn>
        <ScrollFadeIn>
          <LandingPage4 />
        </ScrollFadeIn>
        <ScrollFadeIn>
          <LandingPage5 />
        </ScrollFadeIn>
        <ScrollFadeIn>
          <LandingPage6 />
        </ScrollFadeIn>
        <ScrollFadeIn>
          <LandingPage7 />
        </ScrollFadeIn>
      </ContentWrapper>
      <ScrollFadeIn>
        <Footer />
      </ScrollFadeIn>
    </LandingContainer>
  );
};

export default Landing;

const LandingContainer = styled.div`
  position: relative;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 600px;
  padding: 0 20px;
  margin: 0 auto;
  overflow: hidden;
`;

const BackgroundWrapper = styled.div`
  position: absolute;
  width: 930.88px;
  height: 1299.04px;
  left: -296px;
  top: 34.09px;
`;

const BackgroundStripe2 = styled.div`
  position: absolute;
  width: 1086px;
  height: 170px;
  left: -13.03px;
  top: 777px;
  background: #f6ac36;
  transform: rotate(30deg);
`;

const BackgroundStripe1 = styled.div`
  position: absolute;
  width: 1086px;
  height: 230px;
  left: -6px;
  top: 304px;
  background: #f1bb02;
  transform: rotate(-45deg);
`;

const ContentWrapper = styled.div`
  margin-top: 50px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FadeInWrapper = styled.div<{ scrollDirection: 'up' | 'down' }>`
  width: 100%;
  max-width: 700px;
  margin-bottom: 20px;

  overflow: hidden;

  opacity: 0;
  transform: ${({ scrollDirection }) =>
    scrollDirection === 'down'
      ? 'translateY(20px) scale(0.95)'
      : 'translateY(-20px) scale(0.95)'};

  transition:
    opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);

  &.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;
