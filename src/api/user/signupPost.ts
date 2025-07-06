import { Axios } from '../Axios';

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
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};
