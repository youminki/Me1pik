import { renderHook, act } from '@testing-library/react';

import { useDebounce } from '../useDebounce';

jest.useFakeTimers();

describe('useDebounce', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('updates value after delay', () => {
    let value = 'a';
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), {
      initialProps: { v: value },
    });
    expect(result.current).toBe('a');
    value = 'b';
    rerender({ v: value });
    expect(result.current).toBe('a');
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe('b');
  });
});
