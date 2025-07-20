import { Axios } from '../../Axios';
import { useQuery } from '@tanstack/react-query';

export interface ClosetItem {
  productId: number;
  mainImage: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  description: string;
  discountRate: number;
}

export interface ClosetListResponse {
  count: number;
  items: ClosetItem[];
}

export const addToCloset = async (productId: number): Promise<void> => {
  const resp = await Axios.post(`/closet/${productId}`);
  if (resp.status !== 201) {
    throw new Error('찜 추가 실패');
  }
};

export const removeFromCloset = async (productId: number): Promise<void> => {
  const resp = await Axios.delete(`/closet/${productId}`);
  if (resp.status !== 200) {
    throw new Error('찜 삭제 실패');
  }
};

export const getMyCloset = async (): Promise<ClosetListResponse> => {
  const resp = await Axios.get<ClosetListResponse>('/closet/me');
  return resp.data;
};

/**
 * 내 옷장 목록을 react-query로 가져오는 커스텀 훅
 */
export function useMyCloset() {
  return useQuery<ClosetListResponse>({
    queryKey: ['myCloset'],
    queryFn: getMyCloset,
    staleTime: 1000 * 60 * 5,
  });
}
