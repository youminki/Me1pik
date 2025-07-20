import { Axios } from '../api-utils/Axios';

interface LoginUser {
  id: string;
  email: string;
  [key: string]: unknown;
}

interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user?: LoginUser;
}

interface LoginError {
  message: string;
  statusCode?: number;
  [key: string]: unknown;
}

/**
 * 사용자 로그인 요청 함수
 * @param email - 사용자 이메일
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
    return response.data;
  } catch (error: unknown) {
    console.error('Login failed:', error);
    let message = '알 수 없는 에러가 발생했습니다.';
    let statusCode: number | undefined = undefined;
    if (error && typeof error === 'object' && 'response' in error) {
      const errObj = error as {
        response?: { data?: { message?: string }; status?: number };
      };
      message = errObj.response?.data?.message || message;
      statusCode = errObj.response?.status;
    } else if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof (error as { message?: unknown }).message === 'string'
    ) {
      message = (error as { message: string }).message;
    }
    const errorMessage: LoginError = {
      message,
      statusCode,
    };
    throw errorMessage;
  }
};
