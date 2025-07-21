import Cookies from 'js-cookie';

import { Axios } from '@/api-utils/Axios';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user?: {
    id: string;
    email: string;
    [key: string]: unknown;
  };
}

interface LoginError {
  message: string;
  statusCode?: number;
  [key: string]: unknown;
}

function isLoginError(error: unknown): error is LoginError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

/**
 * ✅ 사용자 로그인 요청 함수
 * @param id - 사용자 ID
 * @param password - 사용자 비밀번호
 * @param autoLogin - 자동로그인 여부
 * @returns 로그인 성공 시 서버에서 반환된 데이터 (액세스 토큰 등)
 * @throws 로그인 실패 시 에러 메시지
 */
export const LoginPost = async (
  email: string,
  password: string,
  autoLogin: boolean = false
): Promise<LoginResponse> => {
  try {
    const response = await Axios.post<LoginResponse>('/auth/login', {
      email,
      password,
      autoLogin, // 자동로그인 여부를 서버에 전달
    });

    console.log('✅ 로그인 성공:', response.data);

    const isHttps = window.location.protocol === 'https:';
    Cookies.set('accessToken', response.data.accessToken, {
      secure: isHttps,
      httpOnly: false,
      sameSite: 'strict',
      path: '/',
    });
    Cookies.set('refreshToken', response.data.refreshToken, {
      secure: isHttps,
      httpOnly: false,
      sameSite: 'strict',
      path: '/',
    });

    Axios.defaults.headers.Authorization = `Bearer ${response.data.accessToken}`;

    return response.data;
  } catch (error) {
    console.error('❌ 로그인 실패:', error);

    let errorMessage: LoginError = { message: '로그인 요청에 실패했습니다.' };
    if (isLoginError(error)) {
      errorMessage = error;
    } else if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      typeof (error as { response?: unknown }).response === 'object'
    ) {
      const err = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      errorMessage.statusCode = err.response?.status;
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage.message = '잘못된 사용자 ID 또는 비밀번호입니다.';
        } else if (err.response.status === 500) {
          errorMessage.message =
            '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        } else {
          errorMessage.message =
            err.response.data?.message || '알 수 없는 오류가 발생했습니다.';
        }
      }
    }
    throw {
      ...errorMessage,
      message: /[가-힣]/.test(errorMessage.message)
        ? errorMessage.message
        : '로그인에 실패했습니다. 아이디 또는 비밀번호를 다시 확인해 주세요.',
    };
  }
};
