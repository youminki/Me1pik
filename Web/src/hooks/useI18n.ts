import { useState, useEffect, useCallback } from 'react';

import { i18n, Locale } from '@/utils/i18n';

/**
 * useI18n 훅 모음
 *
 * 다국어 지원을 위한 다양한 기능을 제공하는 커스텀 훅 집합입니다.
 * - useI18n: 기본 i18n 기능
 * - useLanguageSelector: 언어 선택 기능
 * - useTranslation: 타입 안전한 번역
 */

/**
 * useI18n 훅
 *
 * 다국어 번역, 날짜/숫자/통화 포맷, 언어 변경 기능을 제공하는 훅입니다.
 *
 * @returns { t, locale, setLocale, formatDate, formatNumber, formatCurrency, pluralize }
 */
export const useI18n = () => {
  const [locale, setLocaleState] = useState<Locale>(i18n.getCurrentLocale());

  const setLocale = useCallback((newLocale: Locale) => {
    i18n.setLocale(newLocale);
    setLocaleState(newLocale);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return i18n.t(key, params);
    },
    []
  );

  const formatDate = useCallback(
    (date: Date, options?: Intl.DateTimeFormatOptions) => {
      return i18n.formatDate(date, options);
    },
    []
  );

  const formatNumber = useCallback(
    (number: number, options?: Intl.NumberFormatOptions) => {
      return i18n.formatNumber(number, options);
    },
    []
  );

  const formatCurrency = useCallback(
    (
      amount: number,
      currency: string = 'KRW',
      options?: Intl.NumberFormatOptions
    ) => {
      return i18n.formatCurrency(amount, currency, options);
    },
    []
  );

  const pluralize = useCallback(
    (count: number, singular: string, plural: string) => {
      return i18n.pluralize(count, singular, plural);
    },
    []
  );

  // 로케일 변경 감지
  useEffect(() => {
    const handleLocaleChange = () => {
      setLocaleState(i18n.getCurrentLocale());
    };

    // 커스텀 이벤트 리스너 (필요시 구현)
    window.addEventListener('localechange', handleLocaleChange);

    return () => {
      window.removeEventListener('localechange', handleLocaleChange);
    };
  }, []);

  return {
    t,
    locale,
    setLocale,
    formatDate,
    formatNumber,
    formatCurrency,
    pluralize,
  };
};

/**
 * useLanguageSelector 훅
 *
 * 현재 언어, 지원 언어 목록, 언어 변경 함수를 제공하는 훅입니다.
 *
 * @returns { currentLanguage, availableLanguages, changeLanguage }
 */
export const useLanguageSelector = () => {
  const { locale, setLocale } = useI18n();

  const availableLanguages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
  ] as const;

  const currentLanguage =
    availableLanguages.find((lang) => lang.code === locale) ||
    availableLanguages[0];

  const changeLanguage = useCallback(
    (languageCode: Locale) => {
      setLocale(languageCode);
    },
    [setLocale]
  );

  return {
    currentLanguage,
    availableLanguages,
    changeLanguage,
  };
};

/**
 * useTranslation 훅
 *
 * 타입 안전한 번역 기능을 제공하는 훅입니다.
 *
 * @param key - 번역 키
 * @param params - 번역 매개변수
 * @returns 번역된 텍스트
 */
export const useTranslation = (
  key: string,
  params?: Record<string, string | number>
) => {
  const { t } = useI18n();

  return t(key, params);
};
