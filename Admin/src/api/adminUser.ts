import { Axios } from 'src/api/Axios';

/**
 * 사용자 상세 정보 인터페이스 (GET /admin/user/{email})
 */
export interface UserDetail {
  email: string;
  nickname: string;
  birthdate: string;
  address: string;
  phoneNumber: string;
  gender: string;
  instagramId: string;
  personalWebpage: string;
  followersCount: number;
  followingCount: number;
  name: string;
  membership: {
    id: number;
    name: string;
  };
}

/**
 * 사용자 삭제 응답 인터페이스 (DELETE /admin/user/{email})
 */
export interface DeleteUserResponse {
  message: string;
}

/**
 * 모든 사용자 조회 시 개별 사용자 정보 인터페이스 (GET /admin/user)
 */
export interface UserSummary {
  id: number;
  status: string;
  name: string;
  nickname: string;
  instagramId: string;
  followersCount: number;
  followingCount: number;
  address: string;
  signupDate: string;
  membership: string;
}

/**
 * 모든 사용자 조회 응답 인터페이스
 */
export interface GetUsersResponse {
  users: UserSummary[];
  total: number;
}

/**
 * 차단된 사용자 조회 시 개별 사용자 정보 인터페이스 (GET /admin/user/blocked)
 */
export interface BlockedUser {
  email: string;
  nickname: string;
  phoneNumber: string;
  gender: string;
  status: string;
}

/**
 * 차단된 사용자 조회 응답 인터페이스
 */
export interface GetBlockedUsersResponse {
  users: BlockedUser[];
  total: number;
}

/**
 * 유저 찜 목록 아이템 인터페이스 (GET /admin/user/{email}/closet)
 */
export interface ClosetItem {
  productId: number;
  registration_date: string;
  name: string;
  brand: string;
  category: string;
  color: string;
  price: number;
}

/**
 * 유저 찜 목록 조회 응답 인터페이스
 */
export interface GetUserClosetResponse {
  items: ClosetItem[];
}

/**
 * 유저 멤버십 변경 요청 인터페이스 (PATCH /admin/user/{id}/membership)
 */
export interface MembershipChangeRequest {
  membershipId: number;
}

/**
 * 유저 멤버십 변경 응답 인터페이스
 */
export interface MembershipChangeResponse {
  message: string;
  user: {
    id: number;
    email: string;
    membership: {
      id: number;
      name: string;
      discount_rate: number;
    };
  };
}

/**
 * 전체 멤버십 조회 시 개별 멤버십 정보 인터페이스 (GET /admin/user/membership/all)
 */
export interface Membership {
  id: number;
  name: string;
  discount_rate: number;
}

/**
 * 전체 멤버십 조회 응답 인터페이스
 */
export type GetAllMembershipsResponse = Membership[];

/**
 * 이메일을 이용하여 사용자 정보를 조회합니다.
 * GET /admin/user/{email}
 */
export const getUserByEmail = async (email: string): Promise<UserDetail> => {
  const response = await Axios.get(`/admin/user/${encodeURIComponent(email)}`);
  return response.data;
};

/**
 * 이메일을 이용하여 사용자를 삭제합니다. (관리자용)
 * DELETE /admin/user/{email}
 */
export const deleteUserByEmail = async (email: string): Promise<DeleteUserResponse> => {
  const response = await Axios.delete(`/admin/user/${encodeURIComponent(email)}`);
  return response.data;
};

/**
 * 모든 사용자를 조회합니다. (관리자용)
 * GET /admin/user
 */
export const getAllUsers = async (limit = 10, page = 1): Promise<GetUsersResponse> => {
  const response = await Axios.get(`/admin/user`, {
    params: { limit, page },
  });
  return response.data;
};

/**
 * 차단된 사용자를 조회합니다. (관리자용)
 * GET /admin/user/blocked
 */
export const getBlockedUsers = async (limit = 10, page = 1): Promise<GetBlockedUsersResponse> => {
  const response = await Axios.get(`/admin/user/blocked`, {
    params: { limit, page },
  });
  return response.data;
};

/**
 * 이메일을 이용하여 사용자의 찜 목록을 조회합니다. (관리자용)
 * GET /admin/user/{email}/closet
 */
export const getUserClosetByEmail = async (email: string): Promise<GetUserClosetResponse> => {
  const response = await Axios.get(`/admin/user/${encodeURIComponent(email)}/closet`);
  return response.data;
};

/**
 * 특정 유저의 멤버십을 변경합니다. (관리자용)
 * PATCH /admin/user/{id}/membership
 */
export const changeUserMembership = async (
  id: number,
  membershipId: number,
): Promise<MembershipChangeResponse> => {
  const requestBody: MembershipChangeRequest = { membershipId };
  const response = await Axios.patch(`/admin/user/${id}/membership`, requestBody);
  return response.data;
};

/**
 * 모든 멤버십을 조회합니다. (관리자용)
 * GET /admin/user/membership/all
 */
export const getAllMemberships = async (): Promise<GetAllMembershipsResponse> => {
  const response = await Axios.get(`/admin/user/membership/all`);
  return response.data;
};
