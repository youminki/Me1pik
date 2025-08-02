import { useEffect, useRef, useState } from 'react';

/**
 * useAccessibility 훅 모음
 *
 * 웹 접근성을 향상시키는 다양한 기능을 제공하는 커스텀 훅 집합입니다.
 * - useKeyboardNavigation: 키보드 네비게이션
 * - useFocusTrap: 포커스 트랩
 * - useScreenReaderAnnouncement: 스크린 리더 안내
 * - useHighContrastMode: 고대비 모드 감지
 * - useDarkMode: 다크 모드 감지
 */

/**
 * useKeyboardNavigation 훅
 *
 * 리스트 등에서 키보드로 포커스 이동을 제어하는 훅입니다.
 *
 * @template T - 아이템 타입
 * @param items - 아이템 배열
 * @returns { selectedIndex, handleKeyDown, setSelectedIndex }
 */
export const useKeyboardNavigation = <T>(items: T[]) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
        break;
      case 'Home':
        event.preventDefault();
        setSelectedIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setSelectedIndex(items.length - 1);
        break;
    }
  };

  return { selectedIndex, handleKeyDown, setSelectedIndex };
};

/**
 * useFocusTrap 훅
 *
 * 모달 등에서 포커스가 외부로 빠져나가지 않도록 제어하는 훅입니다.
 *
 * @param isActive - 트랩 활성화 여부
 * @returns { ref }
 */
export const useFocusTrap = (isActive: boolean) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !ref.current) return;

    const focusableElements = ref.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);

  return { ref };
};

/**
 * useScreenReaderAnnouncement 훅
 *
 * 스크린 리더 사용자에게 동적으로 메시지를 안내하는 훅입니다.
 *
 * @param message - 안내 메시지
 * @param shouldAnnounce - 발표 여부
 */
export const useScreenReaderAnnouncement = (
  message: string,
  shouldAnnounce: boolean
) => {
  useEffect(() => {
    if (!shouldAnnounce) return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // 메시지 발표 후 요소 제거
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);

    return () => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    };
  }, [message, shouldAnnounce]);
};

/**
 * useHighContrastMode 훅
 *
 * 사용자의 고대비 모드 설정을 감지하는 훅입니다.
 *
 * @returns { isHighContrast }
 */
export const useHighContrastMode = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');

    const handleChange = (event: MediaQueryListEvent) => {
      setIsHighContrast(event.matches);
    };

    setIsHighContrast(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return { isHighContrast };
};

/**
 * useDarkMode 훅
 *
 * 사용자의 다크 모드 설정을 감지하는 훅입니다.
 *
 * @returns { isDarkMode }
 */
export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event: MediaQueryListEvent) => {
      setIsDarkMode(event.matches);
    };

    setIsDarkMode(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return { isDarkMode };
};
