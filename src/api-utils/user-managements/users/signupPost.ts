import { Axios } from '../../Axios';

interface SignupData {
  email: string;
  password: string;
  name: string;
  nickname: string;
  birthdate: string;
  address: string;
  phoneNumber: string;
  gender: string;
  instagramId?: string;
  agreeToTerms: boolean;
  agreeToPrivacyPolicy: boolean;
}

interface ApiError {
  message: string;
  code?: string;
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

export const signupUser = async (data: SignupData) => {
  try {
    const response = await Axios.post('/user', data);

    if (response.status === 201 || response.status === 200) {
      return {
        success: true,
        data: response.data,
      };
    } else {
      throw new Error(response.data?.message || '회원가입에 실패했습니다.');
    }
  } catch (error) {
    // AxiosError 타입 처리
    if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      typeof (error as { response?: unknown }).response === 'object' &&
      (error as { response?: { data?: unknown } }).response?.data
    ) {
      const apiError = (error as { response: { data: ApiError } }).response
        .data;
      if (isApiError(apiError)) {
        throw apiError;
      }
      throw { message: '회원가입에 실패했습니다.' } as ApiError;
    }
    if (isApiError(error)) {
      throw error;
    }
    throw { message: '회원가입에 실패했습니다.' } as ApiError;
  }
};
