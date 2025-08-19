import { Axios } from '@/api-utils/Axios';

export const withdrawUser = async (password: string) => {
  const response = await Axios.delete('/user/withdraw', {
    data: { password },
  });
  return response.data;
};
