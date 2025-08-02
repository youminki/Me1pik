import { useCallback } from 'react';

export const useScrollToTop = () => {
  const scrollToTop = useCallback(() => {
    // 모든 스크롤 방법을 시도
    const scrollMethods = [
      () => window.scrollTo(0, 0),
      () => window.scrollTo({ top: 0, behavior: 'instant' }),
      () => {
        if (document.documentElement) {
          document.documentElement.scrollTop = 0;
        }
      },
      () => {
        if (document.body) {
          document.body.scrollTop = 0;
        }
      },
      () => {
        const root = document.getElementById('root');
        if (root) {
          root.scrollTop = 0;
        }
      },
      () => {
        const html = document.querySelector('html');
        if (html) {
          html.scrollTop = 0;
        }
      },
      () => {
        const firstElement = document.querySelector('body > *:first-child');
        if (firstElement) {
          firstElement.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      },
      () => {
        const header =
          document.querySelector('header') ||
          document.querySelector('[data-testid="header"]');
        if (header) {
          header.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      },
    ];

    // 스크롤 가능한 모든 요소에 대해 시도
    const allElements = document.querySelectorAll('*');
    const scrollableElements = Array.from(allElements).filter((el) => {
      const style = window.getComputedStyle(el);
      return (
        style.overflow === 'auto' ||
        style.overflow === 'scroll' ||
        style.overflowY === 'auto' ||
        style.overflowY === 'scroll'
      );
    });

    // 모든 방법을 순차적으로 시도
    scrollMethods.forEach((method) => {
      try {
        method();
      } catch {
        // 에러 무시하고 계속 진행
      }
    });

    // 스크롤 가능한 요소들도 초기화
    scrollableElements.forEach((el) => {
      try {
        el.scrollTop = 0;
      } catch {
        // 에러 무시하고 계속 진행
      }
    });
  }, []);

  return { scrollToTop };
};
