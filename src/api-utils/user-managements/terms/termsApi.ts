import { Axios } from '../../Axios';

// 문서 목록 조회 (필터 가능)
export const getTermsPolicyList = async (params?: {
  type?: string;
  category?: string;
}) => {
  const response = await Axios.get('/terms-policy', { params });
  return response.data;
};

// 문서 상세 조회
export const getTermsPolicyDetail = async (id: number) => {
  const response = await Axios.get(`/terms-policy/${id}`);
  return response.data;
};
