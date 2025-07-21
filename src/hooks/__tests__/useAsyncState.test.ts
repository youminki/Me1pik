import { renderHook, act } from '@testing-library/react';

import { useAsyncState } from '@/hooks/useAsyncState';

describe('useAsyncState', () => {
  it('비동기 함수가 성공하면 data가 세팅되고 loading이 false가 된다', async () => {
    const asyncFn = jest.fn().mockResolvedValue('result');
    const { result } = renderHook(() => useAsyncState(asyncFn));
    await act(async () => {
      await result.current.execute();
    });
    expect(result.current.data).toBe('result');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('비동기 함수가 실패하면 error가 세팅되고 loading이 false가 된다', async () => {
    const asyncFn = jest.fn().mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useAsyncState(asyncFn));
    await act(async () => {
      await result.current.execute();
    });
    expect(result.current.data).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('fail');
  });

  it('reset을 호출하면 data, error, loading이 초기화된다', async () => {
    const asyncFn = jest.fn().mockResolvedValue('ok');
    const { result } = renderHook(() => useAsyncState(asyncFn));
    await act(async () => {
      await result.current.execute();
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
    expect(result.current.loading).toBe(false);
  });
});
