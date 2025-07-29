import { Axios } from 'src/api/Axios';

export interface TermsPolicy {
  id: number;
  title: string;
  type: string; // 이용약관 | 개인정보보호 | FAQ | 공지사항
  category?: string; // FAQ, 이용약관, 개인정보보호 등에서 사용
  content: string;
  createdAt: string;
}

// 문서 목록 조회 (필터 가능)
export function getTermsPolicyList(params?: {
  type?: string;
  category?: string;
}): Promise<TermsPolicy[]> {
  return Axios.get('/admin/terms-policy/list', { params }).then((res) => res.data);
}

// 단일 문서 조회
export function getTermsPolicy(id: number): Promise<TermsPolicy> {
  return Axios.get(`/admin/terms-policy/${id}`).then((res) => res.data);
}

// 문서 생성
export function createTermsPolicy(body: {
  title: string;
  type: string;
  category?: string;
  content: string;
}): Promise<TermsPolicy> {
  return Axios.post('/admin/terms-policy', body).then((res) => res.data);
}

// 문서 수정
export function updateTermsPolicy(
  id: number,
  body: {
    title?: string;
    type?: string;
    category?: string;
    content?: string;
  },
): Promise<TermsPolicy> {
  return Axios.put(`/admin/terms-policy/${id}`, body).then((res) => res.data);
}

// 문서 삭제
export function deleteTermsPolicy(id: number): Promise<{ message: string }> {
  return Axios.delete(`/admin/terms-policy/${id}`).then((res) => res.data);
}
