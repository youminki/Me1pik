/**
 * 국제화(i18n) 유틸리티
 */

export type Locale = 'ko' | 'en' | 'ja' | 'zh';

interface TranslationData {
  [key: string]: string | TranslationData;
}

interface I18nConfig {
  defaultLocale: Locale;
  fallbackLocale: Locale;
  supportedLocales: Locale[];
}

class I18nManager {
  private translations: Map<Locale, TranslationData> = new Map();
  private currentLocale: Locale;
  private config: I18nConfig;

  constructor(config: I18nConfig) {
    this.config = config;
    this.currentLocale = config.defaultLocale;
  }

  /**
   * 번역 데이터 설정
   */
  setTranslations(locale: Locale, data: TranslationData): void {
    this.translations.set(locale, data);
  }

  /**
   * 현재 로케일 설정
   */
  setLocale(locale: Locale): void {
    if (this.config.supportedLocales.includes(locale)) {
      this.currentLocale = locale;
      document.documentElement.lang = locale;
    }
  }

  /**
   * 현재 로케일 가져오기
   */
  getCurrentLocale(): Locale {
    return this.currentLocale;
  }

  /**
   * 번역 텍스트 가져오기
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
   * 번역 키에서 값 가져오기
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
   * 매개변수 보간
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
   * 날짜 포맷팅
   */
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.currentLocale, options).format(date);
  }

  /**
   * 숫자 포맷팅
   */
  formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.currentLocale, options).format(number);
  }

  /**
   * 통화 포맷팅
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
   * 복수형 처리
   */
  pluralize(count: number, singular: string, plural: string): string {
    return count === 1 ? singular : plural;
  }
}

// 기본 번역 데이터
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

// 전역 i18n 인스턴스
export const i18n = new I18nManager({
  defaultLocale: 'ko',
  fallbackLocale: 'ko',
  supportedLocales: ['ko', 'en', 'ja', 'zh'],
});

// 기본 번역 데이터 설정
Object.entries(defaultTranslations).forEach(([locale, data]) => {
  i18n.setTranslations(locale as Locale, data);
});

// 사용자 언어 감지
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
