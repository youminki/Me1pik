/**
 * i18n 유틸리티 모음
 *
 * 국제화(i18n) 유틸리티를 제공합니다.
 * 다국어 지원, 번역 관리, 날짜/숫자/통화 포맷팅 기능을 포함합니다.
 *
 * @description
 * - 다국어 번역 관리
 * - 날짜/숫자/통화 포맷팅
 * - 복수형 처리
 * - 매개변수 보간
 * - 사용자 언어 감지
 */

/**
 * Locale 타입
 *
 * 지원하는 언어 코드를 정의합니다.
 */
export type Locale = 'ko' | 'en' | 'ja' | 'zh';

/**
 * TranslationData 인터페이스
 *
 * 번역 데이터의 구조를 정의합니다.
 *
 * @property key - 번역 키
 * @property value - 번역 값 또는 중첩된 번역 데이터
 */
interface TranslationData {
  [key: string]: string | TranslationData;
}

/**
 * I18nConfig 인터페이스
 *
 * i18n 설정을 정의합니다.
 *
 * @property defaultLocale - 기본 언어
 * @property fallbackLocale - 폴백 언어
 * @property supportedLocales - 지원하는 언어 목록
 */
interface I18nConfig {
  defaultLocale: Locale;
  fallbackLocale: Locale;
  supportedLocales: Locale[];
}

/**
 * I18nManager 클래스
 *
 * 국제화 기능을 관리하는 메인 클래스입니다.
 */
class I18nManager {
  private translations: Map<Locale, TranslationData> = new Map();
  private currentLocale: Locale;
  private config: I18nConfig;

  /**
   * constructor 메서드
   *
   * I18nManager를 초기화합니다.
   *
   * @param config - i18n 설정
   */
  constructor(config: I18nConfig) {
    this.config = config;
    this.currentLocale = config.defaultLocale;
  }

  /**
   * setTranslations 메서드
   *
   * 번역 데이터를 설정합니다.
   *
   * @param locale - 언어 코드
   * @param data - 번역 데이터
   */
  setTranslations(locale: Locale, data: TranslationData): void {
    this.translations.set(locale, data);
  }

  /**
   * setLocale 메서드
   *
   * 현재 로케일을 설정합니다.
   *
   * @param locale - 설정할 언어 코드
   */
  setLocale(locale: Locale): void {
    if (this.config.supportedLocales.includes(locale)) {
      this.currentLocale = locale;
      document.documentElement.lang = locale;
    }
  }

  /**
   * getCurrentLocale 메서드
   *
   * 현재 로케일을 가져옵니다.
   *
   * @returns 현재 언어 코드
   */
  getCurrentLocale(): Locale {
    return this.currentLocale;
  }

  /**
   * t 메서드
   *
   * 번역 텍스트를 가져옵니다.
   *
   * @param key - 번역 키
   * @param params - 매개변수 (선택사항)
   * @returns 번역된 텍스트
   */
  t(key: string, params?: Record<string, string | number>): string {
    const translation = this.getTranslation(key);

    if (!translation) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }

    if (params) {
      return this.interpolate(translation, params);
    }

    return translation;
  }

  /**
   * getTranslation 메서드
   *
   * 번역 키에서 값을 가져옵니다.
   *
   * @param key - 번역 키
   * @returns 번역된 텍스트 또는 null
   */
  private getTranslation(key: string): string | null {
    const keys = key.split('.');
    let data = this.translations.get(this.currentLocale);

    if (!data) {
      data = this.translations.get(this.config.fallbackLocale);
    }

    if (!data) {
      return null;
    }

    for (const k of keys) {
      if (data && typeof data === 'object' && k in data) {
        data = data[k] as TranslationData;
      } else {
        return null;
      }
    }

    return typeof data === 'string' ? data : null;
  }

  /**
   * interpolate 메서드
   *
   * 매개변수를 보간합니다.
   *
   * @param text - 보간할 텍스트
   * @param params - 매개변수 객체
   * @returns 보간된 텍스트
   */
  private interpolate(
    text: string,
    params: Record<string, string | number>
  ): string {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key]?.toString() || match;
    });
  }

  /**
   * formatDate 메서드
   *
   * 날짜를 포맷팅합니다.
   *
   * @param date - 포맷팅할 날짜
   * @param options - DateTimeFormat 옵션 (선택사항)
   * @returns 포맷팅된 날짜 문자열
   */
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.currentLocale, options).format(date);
  }

  /**
   * formatNumber 메서드
   *
   * 숫자를 포맷팅합니다.
   *
   * @param number - 포맷팅할 숫자
   * @param options - NumberFormat 옵션 (선택사항)
   * @returns 포맷팅된 숫자 문자열
   */
  formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.currentLocale, options).format(number);
  }

  /**
   * formatCurrency 메서드
   *
   * 통화를 포맷팅합니다.
   *
   * @param amount - 포맷팅할 금액
   * @param currency - 통화 코드 (기본값: 'KRW')
   * @param options - NumberFormat 옵션 (선택사항)
   * @returns 포맷팅된 통화 문자열
   */
  formatCurrency(
    amount: number,
    currency: string = 'KRW',
    options?: Intl.NumberFormatOptions
  ): string {
    return new Intl.NumberFormat(this.currentLocale, {
      style: 'currency',
      currency,
      ...options,
    }).format(amount);
  }

  /**
   * pluralize 메서드
   *
   * 복수형을 처리합니다.
   *
   * @param count - 개수
   * @param singular - 단수형
   * @param plural - 복수형
   * @returns 적절한 형태의 텍스트
   */
  pluralize(count: number, singular: string, plural: string): string {
    return count === 1 ? singular : plural;
  }
}

/**
 * defaultTranslations 상수
 *
 * 기본 번역 데이터를 정의합니다.
 */
const defaultTranslations: Record<Locale, TranslationData> = {
  ko: {
    common: {
      loading: '로딩 중...',
      error: '오류가 발생했습니다',
      retry: '다시 시도',
      cancel: '취소',
      confirm: '확인',
      save: '저장',
      delete: '삭제',
      edit: '수정',
      add: '추가',
      search: '검색',
      filter: '필터',
      sort: '정렬',
      more: '더보기',
      less: '접기',
    },
    auth: {
      login: '로그인',
      logout: '로그아웃',
      signup: '회원가입',
      email: '이메일',
      password: '비밀번호',
      confirmPassword: '비밀번호 확인',
      forgotPassword: '비밀번호 찾기',
      resetPassword: '비밀번호 재설정',
    },
    validation: {
      required: '필수 입력 항목입니다',
      invalidEmail: '올바른 이메일 형식이 아닙니다',
      invalidPassword: '비밀번호는 8자 이상이어야 합니다',
      passwordMismatch: '비밀번호가 일치하지 않습니다',
      minLength: '최소 {min}자 이상 입력해주세요',
      maxLength: '최대 {max}자까지 입력 가능합니다',
    },
  },
  en: {
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      retry: 'Retry',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      more: 'More',
      less: 'Less',
    },
    auth: {
      login: 'Login',
      logout: 'Logout',
      signup: 'Sign Up',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password',
      resetPassword: 'Reset Password',
    },
    validation: {
      required: 'This field is required',
      invalidEmail: 'Please enter a valid email',
      invalidPassword: 'Password must be at least 8 characters',
      passwordMismatch: 'Passwords do not match',
      minLength: 'Please enter at least {min} characters',
      maxLength: 'Please enter no more than {max} characters',
    },
  },
  ja: {
    common: {
      loading: '読み込み中...',
      error: 'エラーが発生しました',
      retry: '再試行',
      cancel: 'キャンセル',
      confirm: '確認',
      save: '保存',
      delete: '削除',
      edit: '編集',
      add: '追加',
      search: '検索',
      filter: 'フィルター',
      sort: '並び替え',
      more: 'もっと見る',
      less: '折りたたむ',
    },
    auth: {
      login: 'ログイン',
      logout: 'ログアウト',
      signup: 'サインアップ',
      email: 'メールアドレス',
      password: 'パスワード',
      confirmPassword: 'パスワード確認',
      forgotPassword: 'パスワードを忘れた方',
      resetPassword: 'パスワードリセット',
    },
    validation: {
      required: 'この項目は必須です',
      invalidEmail: '有効なメールアドレスを入力してください',
      invalidPassword: 'パスワードは8文字以上で入力してください',
      passwordMismatch: 'パスワードが一致しません',
      minLength: '最低{min}文字以上入力してください',
      maxLength: '最大{max}文字まで入力可能です',
    },
  },
  zh: {
    common: {
      loading: '加载中...',
      error: '发生错误',
      retry: '重试',
      cancel: '取消',
      confirm: '确认',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      add: '添加',
      search: '搜索',
      filter: '筛选',
      sort: '排序',
      more: '更多',
      less: '收起',
    },
    auth: {
      login: '登录',
      logout: '登出',
      signup: '注册',
      email: '邮箱',
      password: '密码',
      confirmPassword: '确认密码',
      forgotPassword: '忘记密码',
      resetPassword: '重置密码',
    },
    validation: {
      required: '此字段为必填项',
      invalidEmail: '请输入有效的邮箱地址',
      invalidPassword: '密码至少需要8个字符',
      passwordMismatch: '密码不匹配',
      minLength: '请至少输入{min}个字符',
      maxLength: '请最多输入{max}个字符',
    },
  },
};

/**
 * i18n 상수
 *
 * 전역 i18n 인스턴스입니다.
 */
export const i18n = new I18nManager({
  defaultLocale: 'ko',
  fallbackLocale: 'ko',
  supportedLocales: ['ko', 'en', 'ja', 'zh'],
});

// 기본 번역 데이터 설정
Object.entries(defaultTranslations).forEach(([locale, data]) => {
  i18n.setTranslations(locale as Locale, data);
});

/**
 * detectUserLanguage 함수
 *
 * 사용자의 언어를 감지합니다.
 *
 * @returns 감지된 언어 코드
 */
const detectUserLanguage = (): Locale => {
  const browserLang = navigator.language.split('-')[0];
  const supportedLocales = ['ko', 'en', 'ja', 'zh'];

  if (supportedLocales.includes(browserLang)) {
    return browserLang as Locale;
  }

  return 'ko';
};

// 초기 로케일 설정
i18n.setLocale(detectUserLanguage());

export default i18n;
