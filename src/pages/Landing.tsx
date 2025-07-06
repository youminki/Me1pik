import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Header from '../components/Landing/Header';
import LandingPage1 from '../components/Landing/LandingPage1';
import LandingPage2 from '../components/Landing/LandingPage2';
import LandingPage3 from '../components/Landing/LandingPage3';
import LandingPage4 from '../components/Landing/LandingPage4';
import LandingPage5 from '../components/Landing/LandingPage5';
import LandingPage6 from '../components/Landing/LandingPage6';
import LandingPage7 from '../components/Landing/LandingPage7';

import Footer from '../components/Landing/Footer';

interface ScrollFadeInProps {
  children: React.ReactNode;
}

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
