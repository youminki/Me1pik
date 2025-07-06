import { Axios } from '../Axios';
import { useQuery } from '@tanstack/react-query';

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  nickname: string;
  birthdate: string;
  address: string;
  phoneNumber: string;
  gender: string;
  instagramId: string;
  agreeToTerms: boolean;
  agreeToPrivacyPolicy: boolean;
  personalWebpage: string;
  height: number;
  weight: number;
  topSize: string;
  dressSize: string;
  bottomSize: string;
  preferredBrands: string[];
  shoulderWidth?: number;
  chestCircumference?: number;
  waistCircumference?: number;
  sleeveLength?: number;
  membershipCode?: string;
}

export interface SignupResponse {
  email: string;
  name: string;
  nickname: string;
  phoneNumber: string;
  gender: string;
  isComplete: boolean;
}

export interface UserListItem {
  email: string;
  nickname: string;
  phoneNumber: string;
  gender: string;
}

export interface GetUsersResponse {
  users: UserListItem[];
  total: number;
}

export interface UserDetail {
  email: string;
  nickname: string;
  birthdate: string;
  address: string;
  phoneNumber: string;
  gender: string;
  instagramId: string;
}

export interface MessageResponse {
  message: string;
}

export interface BlockedUser extends UserListItem {
  status: string;
}

export interface GetBlockedUsersResponse {
  users: BlockedUser[];
  total: number;
}

export interface AvailabilityResponse {
  isAvailable: boolean;
}

export interface VerifyPhoneRequest {
  phoneNumber: string;
}

export interface VerifyPhoneResponse {
  message: string;
}

export interface VerifyCodeRequest {
  phoneNumber: string;
  code: string;
}

export interface VerifyCodeResponse {
  message: string;
}

export const signUpUser = async (
  data: SignupRequest
): Promise<SignupResponse> => {
  const response = await Axios.post('/user', data);
  return response.data;
};

export const getUsers = async (
  limit?: number,
  page?: number
): Promise<GetUsersResponse> => {
  const response = await Axios.get('/user', {
    params: { limit, page },
  });
  return response.data;
};

export const getUserByEmail = async (email: string): Promise<UserDetail> => {
  const response = await Axios.get(`/user/${email}`);
  return response.data;
};

export const deleteUser = async (email: string): Promise<MessageResponse> => {
  const response = await Axios.delete(`/user/${email}`);
  return response.data;
};

export const getBlockedUsers = async (
  limit?: number,
  page?: number
): Promise<GetBlockedUsersResponse> => {
  const response = await Axios.get('/user/blocked', {
    params: { limit, page },
  });
  return response.data;
};

export const checkWebpage = async (
  personalWebpage: string
): Promise<AvailabilityResponse> => {
  const response = await Axios.get('/user/check-webpage', {
    params: { personalWebpage },
  });
  return response.data;
};

export const checkNickname = async (
  nickname: string
): Promise<AvailabilityResponse> => {
  const response = await Axios.get('/user/check-nickname', {
    params: { nickname },
  });
  return response.data;
};

export const verifyPhone = async (
  data: VerifyPhoneRequest
): Promise<VerifyPhoneResponse> => {
  const response = await Axios.post('/user/verify-phone', data);
  return response.data;
};

export const verifyCode = async (
  data: VerifyCodeRequest
): Promise<VerifyCodeResponse> => {
  const response = await Axios.post('/user/verify-code', data);
  return response.data;
};

export const checkEmail = async (
  email: string
): Promise<AvailabilityResponse> => {
  const response = await Axios.get('/user/check-email', {
    params: { email },
  });
  return response.data;
};

export interface HeaderInfoResponse {
  nickname: string;
}

export const logoutUser = async (email: string): Promise<MessageResponse> => {
  const response = await Axios.post<MessageResponse>('/auth/logout', { email });
  return response.data;
};

// 추가: 내 스타일 조회 및 수정 API
export interface UserStyle {
  height: number;
  weight: number;
  topSize: string;
  dressSize: string;
  bottomSize: string;
  preferredBrands: string[];
  shoulderWidth: number;
  chestCircumference: number;
  waistCircumference: number;
  sleeveLength: number;
}

/**
 * 내 스타일 조회
 */
export const getUserStyle = async (): Promise<UserStyle> => {
  const response = await Axios.get<UserStyle>('/user/style');
  return response.data;
};

/**
 * 내 스타일 수정
 * @param data 수정할 스타일 정보
 */
export const updateUserStyle = async (
  data: Partial<UserStyle>
): Promise<UserStyle> => {
  const response = await Axios.patch<UserStyle>('/user/style', data);
  return response.data;
};

// 추가: 이메일 찾기 API
export interface FindEmailResponse {
  email: string;
}

/**
 * 이름, 출생년도, 전화번호로 이메일을 찾습니다.
 * @param params 검색할 사용자 정보
 */
export const findEmail = async (params: {
  name: string;
  birthYear: string;
  phoneNumber: string;
}): Promise<FindEmailResponse> => {
  const response = await Axios.get<FindEmailResponse>('/user/find-email', {
    params,
  });
  return response.data;
};

// 추가: 비밀번호 재설정 API
export interface ResetPasswordRequest {
  email: string;
  name: string;
  phoneNumber: string;
  newPassword: string;
}

/**
 * 이메일, 이름, 전화번호로 사용자를 확인한 후 비밀번호를 재설정합니다.
 * @param data 재설정할 비밀번호 정보
 */
export const resetPassword = async (
  data: ResetPasswordRequest
): Promise<MessageResponse> => {
  const response = await Axios.patch<MessageResponse>(
    '/user/reset-password',
    data
  );
  return response.data;
};

// 추가: 로그인 유저의 멤버십 정보 조회 API
export interface MembershipInfo {
  name: string; //유저 등급
  discountRate: number; //할인율
}

/**
 * 현재 로그인한 사용자의 멤버십 정보를 조회합니다.
 */
export const getMembershipInfo = async (): Promise<MembershipInfo> => {
  const response = await Axios.get<MembershipInfo>('/user/me/membership');
  return response.data;
};

/** ────────────────────────────────────────────────────────────────────────── */
/** 신규 추가: /user/my-info 조회 · 수정, 비밀번호 변경 API 적용 */
/** ────────────────────────────────────────────────────────────────────────── */

/**
 * 내 개인정보 조회 응답 타입
 */
export interface MyInfoResponse {
  email: string;
  nickname: string;
  birthYear: number;
  address: string;
  phoneNumber: string;
  gender: 'male' | 'female';
  instagramId: string;
  name: string;
  personalWebpage: string;
}

/**
 * 내 개인정보 조회
 * GET /user/my-info
 */
export const getMyInfo = async (): Promise<MyInfoResponse> => {
  const response = await Axios.get<MyInfoResponse>('/user/my-info');
  return response.data;
};

/**
 * 내 개인정보 수정 요청 타입
 * PATCH /user/my-info
 * - 수정 가능한 필드: nickname, address, password
 */
export interface UpdateMyInfoRequest {
  nickname?: string;
  address?: string;
  password?: string;
}

/**
 * 내 개인정보 수정
 * PATCH /user/my-info
 */
export const updateMyInfo = async (
  data: UpdateMyInfoRequest
): Promise<MessageResponse> => {
  const response = await Axios.patch<MessageResponse>('/user/my-info', data);
  return response.data;
};

/**
 * 비밀번호 변경 요청 타입
 * PATCH /user/change-password
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * 비밀번호 변경
 * PATCH /user/change-password
 */
export const changePassword = async (
  data: ChangePasswordRequest
): Promise<MessageResponse> => {
  const response = await Axios.patch<MessageResponse>(
    '/user/change-password',
    data
  );
  return response.data;
};

/**
 * 헤더용 유저 정보 조회 응답 타입
 * GET /user/my-info/header
 * 반환: { nickname: string; email: string; }
 */
export interface HeaderInfoResponse {
  nickname: string;
  email: string;
}

/**
 * 로그인한 유저의 닉네임과 이메일 조회
 * GET /user/my-info/header
 */
export const getHeaderInfo = async (): Promise<HeaderInfoResponse> => {
  const response = await Axios.get<HeaderInfoResponse>('/user/my-info/header');
  return response.data;
};

/**
 * 내 스타일 정보를 react-query로 가져오는 커스텀 훅
 */
export function useUserStyle() {
  return useQuery<UserStyle>({
    queryKey: ['userStyle'],
    queryFn: getUserStyle,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * 내 멤버십 정보를 react-query로 가져오는 커스텀 훅
 */
export function useMembershipInfo() {
  return useQuery<MembershipInfo>({
    queryKey: ['membershipInfo'],
    queryFn: getMembershipInfo,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * 내 정보(프로필 등)를 react-query로 가져오는 커스텀 훅
 */
export function useMyInfo() {
  return useQuery<MyInfoResponse>({
    queryKey: ['myInfo'],
    queryFn: getMyInfo,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * 헤더 정보(닉네임, 이메일)를 react-query로 가져오는 커스텀 훅
 */
export function useHeaderInfo() {
  return useQuery<HeaderInfoResponse>({
    queryKey: ['headerInfo'],
    queryFn: getHeaderInfo,
    staleTime: 1000 * 60 * 5,
  });
}
