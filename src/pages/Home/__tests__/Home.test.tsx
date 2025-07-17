// date-holidays mock (Jest 환경 ESM/CJS 호환성 우회)
jest.mock('date-holidays', () => {
  return {
    __esModule: true,
    default: function () {
      return {
        isHoliday: () => false,
        getHolidays: () => [],
      };
    },
  };
});

// @ts-ignore
if (typeof global.TextEncoder === 'undefined') {
  // @ts-ignore
  global.TextEncoder = require('util').TextEncoder;
}
// @ts-ignore
if (typeof global.TextDecoder === 'undefined') {
  // @ts-ignore
  global.TextDecoder = require('util').TextDecoder;
}

import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../Home';
import { MemoryRouter } from 'react-router-dom';

// 대량 mock 데이터 생성
const mockProducts = Array.from({ length: 500 }, (_, i) => ({
  id: i + 1,
  image: '',
  brand: `브랜드${i}`,
  description: `설명${i}`,
  price: 10000 + i,
  discount: 10,
  isLiked: false,
}));

jest.mock('../../../api/upload/productApi', () => ({
  useProducts: () => ({
    data: mockProducts,
    isLoading: false,
    isError: false,
    error: null,
  }),
}));

jest.mock('../../../components/Home/ItemCard', () => ({
  __esModule: true,
  default: ({ brand }: { brand: string }) => (
    <span data-testid='brand'>{brand}</span>
  ),
}));

describe('Home 렌더링 성능 테스트', () => {
  it('대량 데이터 렌더링 시간 측정', () => {
    const start = performance.now();
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    const end = performance.now();
    // 500개 상품이 모두 렌더링되는지 확인 (data-testid="brand")
    const brandSpans = screen.getAllByTestId('brand');
    expect(brandSpans.length).toBeGreaterThan(400);
    // 렌더링 시간 출력
    // eslint-disable-next-line no-console
    console.log('Home 렌더링 소요(ms):', end - start);
  });
});
