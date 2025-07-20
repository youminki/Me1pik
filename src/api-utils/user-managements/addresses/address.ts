// src/api/address.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Axios } from '../../Axios';

export interface Address {
  id: number;
  address: string;
  addressDetail: string;
  isDefault: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  deliveryMessage: string; // 배송 메시지
}

/**
 * 새 주소 등록 요청 타입
 */
export interface CreateAddressRequest {
  address: string;
  addressDetail: string;
  deliveryMessage: string;
}

/**
 * 주소 수정 요청 타입
 * address, addressDetail, deliveryMessage 중 하나 또는 여러 개 보낼 수 있습니다.
 */
export interface UpdateAddressRequest {
  address?: string;
  addressDetail?: string;
  deliveryMessage?: string;
}

export interface ApiError {
  message: string;
  code?: string;
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;
  return { message: '알 수 없는 오류', code: 'UNKNOWN' };
}

export const AddressApi = {
  /**
   * 내 주소 목록 조회
   * GET /user-address
   */
  async getAddresses(): Promise<Address[]> {
    const response = await Axios.get<Address[]>('/user-address');
    return response.data;
  },

  /**
   * 새 주소 추가
   * POST /user-address
   */
  async createAddress(data: CreateAddressRequest): Promise<Address> {
    const response = await Axios.post<Address>('/user-address', data);
    return response.data;
  },

  /**
   * 주소 수정
   * PATCH /user-address/{id}
   */
  async updateAddress(
    id: number,
    data: UpdateAddressRequest
  ): Promise<Address> {
    const response = await Axios.patch<Address>(`/user-address/${id}`, data);
    return response.data;
  },

  /**
   * 주소 삭제
   * DELETE /user-address/{id}
   */
  async deleteAddress(id: number): Promise<void> {
    await Axios.delete(`/user-address/${id}`);
  },

  /**
   * 기본 주소로 설정
   * PATCH /user-address/{id}/set-default
   * - 200: 기본 주소 설정 완료
   * - 404: 해당 주소가 없을 때
   */
  async setDefaultAddress(id: number): Promise<void> {
    await Axios.patch(`/user-address/${id}/set-default`);
  },
};

/**
 * 내 주소 목록을 react-query로 가져오는 커스텀 훅
 */
export function useAddresses() {
  return useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: AddressApi.getAddresses,
    staleTime: 1000 * 60 * 5, // 5분 캐싱
  });
}

/**
 * 주소 생성을 react-query useMutation으로 처리하는 커스텀 훅
 */
export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation<Address, ApiError, CreateAddressRequest>({
    mutationFn: AddressApi.createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

/**
 * 주소 수정을 react-query useMutation으로 처리하는 커스텀 훅
 */
export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation<
    Address,
    ApiError,
    { id: number; data: UpdateAddressRequest }
  >({
    mutationFn: ({ id, data }) => AddressApi.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

/**
 * 주소 삭제를 react-query useMutation으로 처리하는 커스텀 훅
 */
export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: AddressApi.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

/**
 * 기본 주소 설정을 react-query useMutation으로 처리하는 커스텀 훅
 */
export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: AddressApi.setDefaultAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}
