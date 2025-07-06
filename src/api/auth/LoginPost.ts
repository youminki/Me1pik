import { Axios } from '../Axios.ts';
import Cookies from 'js-cookie';

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

/**
 * ✅ 사용자 로그인 요청 함수
 * @param id - 사용자 ID
 * @param password - 사용자 비밀번호
 * @returns 로그인 성공 시 서버에서 반환된 데이터 (액세스 토큰 등)
 * @throws 로그인 실패 시 에러 메시지
 */
export const LoginPost = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await Axios.post<LoginResponse>('/auth/login', {
      email,
      password,
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
  } catch (error: unknown) {
    console.error('❌ 로그인 실패:', error);

    const err = error as {
      response?: { status?: number; data?: { message?: string } };
    };
    const errorMessage: LoginError = {
      message: '로그인 요청에 실패했습니다.',
      statusCode: err.response?.status,
    };

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

    throw errorMessage;
  }
};
