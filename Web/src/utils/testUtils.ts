/**
 * testUtils 유틸리티 모음
 *
 * React 컴포넌트 테스트를 위한 유틸리티 함수들을 제공합니다.
 * 모킹, 렌더링, API 시뮬레이션 등의 기능을 포함합니다.
 *
 * @description
 * - 커스텀 렌더링 함수
 * - 모킹 유틸리티 (API, 스토리지, Observer 등)
 * - 테스트 데이터 생성기
 * - 이벤트 시뮬레이션 헬퍼
 * - 비동기 작업 대기 유틸리티
 */

import { render, RenderOptions } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

/**
 * TestProviderProps 인터페이스
 *
 * 테스트용 프로바이더 컴포넌트의 props입니다.
 *
 * @property children - 자식 컴포넌트
 */
interface TestProviderProps {
  children: React.ReactNode; // 자식 컴포넌트
}

/**
 * TestProvider 컴포넌트
 *
 * React Router의 BrowserRouter를 테스트 환경에서 제공합니다.
 *
 * @param props - TestProviderProps
 * @returns BrowserRouter로 감싼 컴포넌트
 */
const TestProvider: React.FC<TestProviderProps> = ({ children }) => {
  return React.createElement(BrowserRouter, null, children);
};

/**
 * CustomRenderOptions 인터페이스
 *
 * 테스트 렌더링 시 추가 옵션을 제공합니다.
 *
 * @property withRouter - Router 프로바이더 포함 여부
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withRouter?: boolean; // Router 프로바이더 포함 여부
}

/**
 * customRender 함수
 *
 * React Testing Library의 render 함수를 확장하여
 * Router 프로바이더를 자동으로 포함시킵니다.
 *
 * @param ui - 렌더할 React 엘리먼트
 * @param options - 렌더링 옵션
 * @returns 렌더링된 컴포넌트와 유틸리티 함수들
 */
const customRender = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { withRouter = true, ...renderOptions } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    if (withRouter) {
      return React.createElement(TestProvider, null, children);
    }
    return React.createElement(React.Fragment, null, children);
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Testing Library 유틸리티 재내보내기
export * from '@testing-library/react';
export { customRender as render };

/**
 * createMockFunction 함수
 *
 * Jest의 mock 함수를 생성하는 헬퍼 함수입니다.
 *
 * @template T - 모킹할 함수의 타입
 * @param returnValue - 반환할 값 (선택사항)
 * @returns Jest mock 함수
 */
export const createMockFunction = <T extends (...args: unknown[]) => unknown>(
  returnValue?: ReturnType<T>
) => {
  return jest.fn().mockReturnValue(returnValue);
};

/**
 * mockApiResponse 함수
 *
 * API 호출을 시뮬레이션하는 Promise를 생성합니다.
 *
 * @template T - 응답 데이터 타입
 * @param data - 반환할 데이터
 * @param delay - 지연 시간 (밀리초, 기본값: 0)
 * @returns Promise<T>
 */
export const mockApiResponse = <T>(data: T, delay = 0) => {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

/**
 * mockApiError 함수
 *
 * API 에러를 시뮬레이션하는 Promise를 생성합니다.
 *
 * @param error - 발생할 에러
 * @param delay - 지연 시간 (밀리초, 기본값: 0)
 * @returns Promise<never>
 */
export const mockApiError = (error: Error, delay = 0) => {
  return new Promise<never>((_, reject) => {
    setTimeout(() => reject(error), delay);
  });
};

/**
 * mockLocalStorage 함수
 *
 * 로컬 스토리지를 모킹합니다.
 *
 * @returns 모킹된 localStorage 객체
 */
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
  };
};

/**
 * mockSessionStorage 함수
 *
 * 세션 스토리지를 모킹합니다.
 *
 * @returns 모킹된 sessionStorage 객체
 */
export const mockSessionStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
  };
};

/**
 * mockCookies 함수
 *
 * 쿠키를 모킹합니다.
 *
 * @returns 모킹된 cookies 객체
 */
export const mockCookies = () => {
  const cookies: Record<string, string> = {};

  return {
    get: jest.fn((name: string) => cookies[name]),
    set: jest.fn((name: string, value: string) => {
      cookies[name] = value;
    }),
    remove: jest.fn((name: string) => {
      delete cookies[name];
    }),
  };
};

/**
 * mockIntersectionObserver 함수
 *
 * Intersection Observer를 모킹합니다.
 *
 * @returns 모킹된 IntersectionObserver 객체
 */
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  const mockDisconnect = jest.fn();

  mockIntersectionObserver.mockReturnValue({
    observe: jest.fn(),
    disconnect: mockDisconnect,
  });

  global.IntersectionObserver = mockIntersectionObserver;

  return {
    mockIntersectionObserver,
    mockDisconnect,
  };
};

/**
 * mockResizeObserver 함수
 *
 * Resize Observer를 모킹합니다.
 *
 * @returns 모킹된 ResizeObserver 객체
 */
export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn();
  const mockDisconnect = jest.fn();

  mockResizeObserver.mockReturnValue({
    observe: jest.fn(),
    disconnect: mockDisconnect,
  });

  global.ResizeObserver = mockResizeObserver;

  return {
    mockResizeObserver,
    mockDisconnect,
  };
};

/**
 * mockNetworkState 함수
 *
 * 네트워크 상태를 모킹합니다.
 *
 * @param online - 온라인 상태 여부 (기본값: true)
 * @returns 네트워크 상태 제어 객체
 */
export const mockNetworkState = (online = true) => {
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: online,
  });

  return {
    setOnline: (isOnline: boolean) => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: isOnline,
      });
    },
  };
};

/**
 * createTestData 객체
 *
 * 테스트 데이터를 생성하는 유틸리티입니다.
 *
 * @property user - 사용자 테스트 데이터 생성
 * @property product - 제품 테스트 데이터 생성
 * @property order - 주문 테스트 데이터 생성
 */
export const createTestData = {
  /**
   * user 함수
   *
   * 사용자 테스트 데이터를 생성합니다.
   *
   * @param overrides - 덮어쓸 속성들
   * @returns 사용자 테스트 데이터
   */
  user: (overrides = {}) => ({
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    ...overrides,
  }),

  /**
   * product 함수
   *
   * 제품 테스트 데이터를 생성합니다.
   *
   * @param overrides - 덮어쓸 속성들
   * @returns 제품 테스트 데이터
   */
  product: (overrides = {}) => ({
    id: 1,
    name: 'Test Product',
    price: 10000,
    description: 'Test description',
    ...overrides,
  }),

  /**
   * order 함수
   *
   * 주문 테스트 데이터를 생성합니다.
   *
   * @param overrides - 덮어쓸 속성들
   * @returns 주문 테스트 데이터
   */
  order: (overrides = {}) => ({
    id: 1,
    userId: 1,
    products: [],
    totalAmount: 10000,
    status: 'pending',
    createdAt: new Date().toISOString(),
    ...overrides,
  }),
};

/**
 * waitFor 함수
 *
 * 비동기 작업을 대기하는 유틸리티입니다.
 *
 * @param ms - 대기할 시간 (밀리초)
 * @returns Promise
 */
export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * testSnapshot 함수
 *
 * 컴포넌트 스냅샷 테스트를 수행하는 헬퍼 함수입니다.
 *
 * @param Component - 테스트할 컴포넌트
 * @param props - 컴포넌트 props
 */
export const testSnapshot = (
  Component: React.ComponentType<unknown>,
  props = {}
) => {
  it('should match snapshot', () => {
    const { container } = render(React.createElement(Component, props));
    expect(container).toMatchSnapshot();
  });
};

/**
 * fireEvent 객체
 *
 * 이벤트 시뮬레이션을 위한 헬퍼 함수들입니다.
 *
 * @property click - 클릭 이벤트 시뮬레이션
 * @property change - 변경 이벤트 시뮬레이션
 * @property submit - 제출 이벤트 시뮬레이션
 * @property keyDown - 키다운 이벤트 시뮬레이션
 */
export const fireEvent = {
  /**
   * click 함수
   *
   * 클릭 이벤트를 시뮬레이션합니다.
   *
   * @param element - 클릭할 요소
   */
  click: (element: Element) => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  },

  /**
   * change 함수
   *
   * 변경 이벤트를 시뮬레이션합니다.
   *
   * @param element - 변경할 요소
   * @param value - 설정할 값
   */
  change: (element: Element, value: string) => {
    (element as HTMLInputElement).value = value;
    element.dispatchEvent(new Event('change', { bubbles: true }));
  },

  /**
   * submit 함수
   *
   * 제출 이벤트를 시뮬레이션합니다.
   *
   * @param element - 제출할 요소
   */
  submit: (element: Element) => {
    element.dispatchEvent(new Event('submit', { bubbles: true }));
  },

  /**
   * keyDown 함수
   *
   * 키다운 이벤트를 시뮬레이션합니다.
   *
   * @param element - 키 이벤트를 발생시킬 요소
   * @param key - 누를 키
   */
  keyDown: (element: Element, key: string) => {
    element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  },
};
