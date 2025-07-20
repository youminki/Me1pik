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
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      typeof (error as { response?: unknown }).response === 'object' &&
      (error as { response?: { data?: unknown } }).response?.data
    ) {
      throw (error as { response: { data: unknown } }).response.data;
    }
    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof (error as { message?: unknown }).message === 'string'
    ) {
      throw (error as { message: string }).message;
    }
    throw '회원가입에 실패했습니다.';
  }
};
