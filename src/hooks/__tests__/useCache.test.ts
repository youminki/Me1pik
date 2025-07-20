import { renderHook, act } from '@testing-library/react';
import { useCache, useApiCache, useLocalStorageCache } from '@/hooks/useCache';

describe('useCache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty cache', () => {
    const { result } = renderHook(() => useCache());

    expect(result.current.size).toBe(0);
    expect(result.current.get('test')).toBeNull();
  });

  it('should set and get cache items', () => {
    const { result } = renderHook(() => useCache());

    act(() => {
      result.current.set('key1', 'value1');
      result.current.set('key2', { data: 'value2' });
    });

    expect(result.current.get('key1')).toBe('value1');
    expect(result.current.get('key2')).toEqual({ data: 'value2' });
    expect(result.current.size).toBe(2);
  });

  it('should handle cache expiration', () => {
    jest.useFakeTimers();

    const { result } = renderHook(() => useCache({ ttl: 1000 }));

    act(() => {
      result.current.set('key', 'value');
    });

    expect(result.current.get('key')).toBe('value');

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(result.current.get('key')).toBeNull();
    expect(result.current.size).toBe(0);

    jest.useRealTimers();
  });

  it('should respect max size limit', () => {
    const { result } = renderHook(() => useCache({ maxSize: 2 }));

    act(() => {
      result.current.set('key1', 'value1');
      result.current.set('key2', 'value2');
      result.current.set('key3', 'value3');
    });

    expect(result.current.size).toBe(2);
    expect(result.current.get('key1')).toBeNull(); // 가장 오래된 항목이 제거됨
    expect(result.current.get('key2')).toBe('value2');
    expect(result.current.get('key3')).toBe('value3');
  });

  it('should remove specific items', () => {
    const { result } = renderHook(() => useCache());

    act(() => {
      result.current.set('key1', 'value1');
      result.current.set('key2', 'value2');
      result.current.remove('key1');
    });

    expect(result.current.get('key1')).toBeNull();
    expect(result.current.get('key2')).toBe('value2');
    expect(result.current.size).toBe(1);
  });

  it('should clear all items', () => {
    const { result } = renderHook(() => useCache());

    act(() => {
      result.current.set('key1', 'value1');
      result.current.set('key2', 'value2');
      result.current.clear();
    });

    expect(result.current.size).toBe(0);
    expect(result.current.get('key1')).toBeNull();
    expect(result.current.get('key2')).toBeNull();
  });

  it('should check if item exists', () => {
    const { result } = renderHook(() => useCache());

    expect(result.current.has('key')).toBe(false);

    act(() => {
      result.current.set('key', 'value');
    });

    expect(result.current.has('key')).toBe(true);
  });
});

describe('useApiCache', () => {
  it('should cache API responses', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ data: 'test' });
    const { result } = renderHook(() => useApiCache());

    const response1 = await result.current.fetchWithCache(
      'test-key',
      mockFetch
    );
    const response2 = await result.current.fetchWithCache(
      'test-key',
      mockFetch
    );

    expect(response1).toEqual({ data: 'test' });
    expect(response2).toEqual({ data: 'test' });
    expect(mockFetch).toHaveBeenCalledTimes(1); // 캐시된 결과 사용
  });

  it('should invalidate cache by pattern', () => {
    const { result } = renderHook(() => useApiCache());

    act(() => {
      result.current.cache.set('user:1', 'user1');
      result.current.cache.set('user:2', 'user2');
      result.current.cache.set('product:1', 'product1');
      result.current.invalidateCache('user');
    });

    expect(result.current.cache.get('user:1')).toBeNull();
    expect(result.current.cache.get('user:2')).toBeNull();
    expect(result.current.cache.get('product:1')).toBe('product1');
  });

  it('should clear all cache', () => {
    const { result } = renderHook(() => useApiCache());

    act(() => {
      result.current.cache.set('key1', 'value1');
      result.current.cache.set('key2', 'value2');
      result.current.invalidateCache();
    });

    expect(result.current.cache.size).toBe(0);
  });
});

describe('useLocalStorageCache', () => {
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
    jest.clearAllMocks();
  });

  it('should store and retrieve from localStorage', () => {
    const { result } = renderHook(() => useLocalStorageCache('test-prefix'));

    act(() => {
      result.current.set('key', 'value');
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'test-prefix:key',
      expect.stringContaining('"data":"value"')
    );
  });

  it('should retrieve cached data from localStorage', () => {
    const cachedData = {
      data: 'value',
      timestamp: Date.now(),
      ttl: 24 * 60 * 60 * 1000,
    };

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(cachedData));

    const { result } = renderHook(() => useLocalStorageCache('test-prefix'));

    expect(result.current.get('key')).toBe('value');
  });

  it('should handle expired localStorage data', () => {
    const expiredData = {
      data: 'value',
      timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25시간 전
      ttl: 24 * 60 * 60 * 1000,
    };

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(expiredData));

    const { result } = renderHook(() => useLocalStorageCache('test-prefix'));

    expect(result.current.get('key')).toBeNull();
  });

  it('should handle localStorage errors gracefully', () => {
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useLocalStorageCache('test-prefix'));

    act(() => {
      result.current.set('key', 'value');
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      '로컬 스토리지 저장 실패:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('should clear localStorage cache', () => {
    const { result } = renderHook(() => useLocalStorageCache('test-prefix'));

    act(() => {
      result.current.clear();
    });

    expect(mockLocalStorage.clear).toHaveBeenCalled();
  });
});
