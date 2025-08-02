import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in cache
}

interface UseCacheReturn<T> {
  get: (key: string) => T | null;
  set: (key: string, data: T, ttl?: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  has: (key: string) => boolean;
  size: number;
  cache: Map<string, CacheItem<T>>;
}

/**
 * 메모리 기반 캐시 훅
 * @param options 캐시 옵션
 * @returns 캐시 메서드들
 */
export const useCache = <T>(options: CacheOptions = {}): UseCacheReturn<T> => {
  const { ttl = 5 * 60 * 1000, maxSize = 100 } = options; // 기본 5분, 최대 100개
  const [cache, setCache] = useState<Map<string, CacheItem<T>>>(new Map());
  const cleanupRef = useRef<NodeJS.Timeout | null>(null);

  // 만료된 항목 정리
  const cleanup = useCallback(() => {
    const now = Date.now();
    const newCache = new Map<string, CacheItem<T>>();

    for (const [key, item] of cache.entries()) {
      if (now - item.timestamp < item.ttl) {
        newCache.set(key, item);
      }
    }

    setCache(newCache);
  }, [cache]);

  // 주기적 정리
  useEffect(() => {
    cleanupRef.current = setInterval(cleanup, 60000); // 1분마다 정리

    return () => {
      if (cleanupRef.current) {
        clearInterval(cleanupRef.current);
      }
    };
  }, [cleanup]);

  const get = useCallback(
    (key: string): T | null => {
      const item = cache.get(key);
      if (!item) return null;

      const now = Date.now();
      if (now - item.timestamp > item.ttl) {
        cache.delete(key);
        return null;
      }

      return item.data;
    },
    [cache]
  );

  const set = useCallback(
    (key: string, data: T, customTtl?: number) => {
      const now = Date.now();
      const item: CacheItem<T> = {
        data,
        timestamp: now,
        ttl: customTtl || ttl,
      };

      // 최대 크기 초과 시 가장 오래된 항목 제거
      if (cache.size >= maxSize) {
        const oldestKey = cache.keys().next().value;
        if (oldestKey) {
          cache.delete(oldestKey);
        }
      }

      setCache(new Map(cache.set(key, item)));
    },
    [cache, ttl, maxSize]
  );

  const remove = useCallback(
    (key: string) => {
      const newCache = new Map(cache);
      newCache.delete(key);
      setCache(newCache);
    },
    [cache]
  );

  const clear = useCallback(() => {
    setCache(new Map());
  }, []);

  const has = useCallback(
    (key: string): boolean => {
      return get(key) !== null;
    },
    [get]
  );

  return {
    get,
    set,
    remove,
    clear,
    has,
    size: cache.size,
    cache,
  };
};

/**
 * API 응답 캐싱 훅
 * @param options 캐시 옵션
 * @returns API 캐시 메서드들
 */
export const useApiCache = <T>(options: CacheOptions = {}) => {
  const cache = useCache<T>(options);

  const fetchWithCache = useCallback(
    async (
      key: string,
      fetchFn: () => Promise<T>,
      ttl?: number
    ): Promise<T> => {
      // 캐시에서 먼저 확인
      const cached = cache.get(key);
      if (cached) {
        return cached;
      }

      // API 호출
      const data = await fetchFn();
      cache.set(key, data, ttl);
      return data;
    },
    [cache]
  );

  const invalidateCache = useCallback(
    (pattern?: string) => {
      if (pattern) {
        // 패턴에 맞는 키들만 제거
        const keys = Array.from(cache.cache.keys());
        keys.forEach((key) => {
          if (key.includes(pattern)) {
            cache.remove(key);
          }
        });
      } else {
        cache.clear();
      }
    },
    [cache]
  );

  return {
    fetchWithCache,
    invalidateCache,
    cache,
  };
};

/**
 * 로컬 스토리지 캐시 훅
 * @param prefix 키 접두사
 * @param options 캐시 옵션
 * @returns 로컬 스토리지 캐시 메서드들
 */
export const useLocalStorageCache = <T>(
  prefix: string,
  options: CacheOptions = {}
) => {
  const { ttl = 24 * 60 * 60 * 1000 } = options; // 기본 24시간

  const getKey = useCallback((key: string) => `${prefix}:${key}`, [prefix]);

  const get = useCallback(
    (key: string): T | null => {
      try {
        const storageKey = getKey(key);
        const item = localStorage.getItem(storageKey);

        if (!item) return null;

        const parsed = JSON.parse(item) as CacheItem<T>;
        const now = Date.now();

        if (now - parsed.timestamp > parsed.ttl) {
          localStorage.removeItem(storageKey);
          return null;
        }

        return parsed.data;
      } catch {
        return null;
      }
    },
    [getKey]
  );

  const set = useCallback(
    (key: string, data: T, customTtl?: number) => {
      try {
        const storageKey = getKey(key);
        const item: CacheItem<T> = {
          data,
          timestamp: Date.now(),
          ttl: customTtl || ttl,
        };

        localStorage.setItem(storageKey, JSON.stringify(item));
      } catch (error) {
        console.error('로컬 스토리지 저장 실패:', error);
      }
    },
    [getKey, ttl]
  );

  const remove = useCallback(
    (key: string) => {
      try {
        const storageKey = getKey(key);
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.error('로컬 스토리지 삭제 실패:', error);
      }
    },
    [getKey]
  );

  const clear = useCallback(() => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('로컬 스토리지 정리 실패:', error);
    }
  }, [prefix]);

  const has = useCallback(
    (key: string): boolean => {
      return get(key) !== null;
    },
    [get]
  );

  return {
    get,
    set,
    remove,
    clear,
    has,
  };
};
