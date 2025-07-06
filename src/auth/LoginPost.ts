import { Axios } from '../api/Axios.ts';

interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    [key: string]: any;
  };
}

interface LoginError {
  message: string;
  statusCode?: number;
  [key: string]: any;
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
  } catch (error: any) {
    console.error('Login failed:', error);
    const errorMessage: LoginError = {
      message:
        error.response?.data?.message || '알 수 없는 에러가 발생했습니다.',
      statusCode: error.response?.status,
    };
    throw errorMessage;
  }
};
