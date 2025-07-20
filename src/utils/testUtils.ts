import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// 테스트용 프로바이더 컴포넌트
interface TestProviderProps {
  children: React.ReactNode;
}

const TestProvider: React.FC<TestProviderProps> = ({ children }) => {
  return React.createElement(BrowserRouter, null, children);
};

// 커스텀 렌더 함수
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withRouter?: boolean;
}

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

// 재내보내기
export * from '@testing-library/react';
export { customRender as render };

/**
 * 모킹 유틸리티
 */
export const createMockFunction = <T extends (...args: unknown[]) => unknown>(
  returnValue?: ReturnType<T>
) => {
  return jest.fn().mockReturnValue(returnValue);
};

/**
 * API 모킹 유틸리티
 */
export const mockApiResponse = <T>(data: T, delay = 0) => {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

/**
 * 에러 API 모킹 유틸리티
 */
export const mockApiError = (error: Error, delay = 0) => {
  return new Promise<never>((_, reject) => {
    setTimeout(() => reject(error), delay);
  });
};

/**
 * 로컬 스토리지 모킹
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
 * 세션 스토리지 모킹
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
 * 쿠키 모킹
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
 * Intersection Observer 모킹
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
 * Resize Observer 모킹
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
 * 네트워크 상태 모킹
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
 * 테스트 데이터 생성기
 */
export const createTestData = {
  user: (overrides = {}) => ({
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    ...overrides,
  }),

  product: (overrides = {}) => ({
    id: 1,
    name: 'Test Product',
    price: 10000,
    description: 'Test description',
    ...overrides,
  }),

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
 * 비동기 작업 대기 유틸리티
 */
export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 컴포넌트 스냅샷 테스트 헬퍼
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
 * 이벤트 시뮬레이션 헬퍼
 */
export const fireEvent = {
  click: (element: Element) => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  },

  change: (element: Element, value: string) => {
    (element as HTMLInputElement).value = value;
    element.dispatchEvent(new Event('change', { bubbles: true }));
  },

  submit: (element: Element) => {
    element.dispatchEvent(new Event('submit', { bubbles: true }));
  },

  keyDown: (element: Element, key: string) => {
    element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  },
};
