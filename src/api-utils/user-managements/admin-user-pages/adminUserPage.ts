import { Axios } from '@/api-utils/Axios';

// 개인 페이지 활성화
export const activateUserPage = async () => {
  const res = await Axios.post('/user-page-admin/page/activate');
  return res.data;
};

// 사용자 개인 링크 추가
export const addUserPageLink = async (title: string, url: string) => {
  const res = await Axios.post('/user-page-admin/link', { title, url });
  return res.data;
};

// 사용자 개인 링크 삭제
export const deleteUserPageLink = async (linkId: number) => {
  const res = await Axios.delete(`/user-page-admin/link/${linkId}`);
  return res.data;
};

// 정산 관련 등록/수정
export const setUserPageAccount = async (
  accountNumber: string,
  bankName: string,
  accountHolder: string
) => {
  const res = await Axios.patch('/user-page-admin/page/account', {
    accountNumber,
    bankName,
    accountHolder,
  });
  return res.data;
};

// 사용자 페이지 관리자 정보 조회
export const getUserPageAdminInfo = async () => {
  const res = await Axios.get('/user-page-admin/page/info');
  return res.data;
};
