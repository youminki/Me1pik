import { renderHook, act } from '@testing-library/react';

import { useApi } from '../useApi';

describe('useApi', () => {
  it('비동기 함수가 성공하면 data가 세팅되고 loading이 false가 된다', async () => {
    const apiFn = jest.fn().mockResolvedValue('ok');
    const { result } = renderHook(() => useApi(apiFn));
    await act(async () => {
      await result.current.execute();
    });
    expect(result.current.data).toBe('ok');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('비동기 함수가 실패하면 error가 세팅되고 loading이 false가 된다', async () => {
    const apiFn = jest.fn().mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useApi(apiFn));
    await act(async () => {
      await result.current.execute();
    });
    expect(result.current.data).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('fail');
  });
});
