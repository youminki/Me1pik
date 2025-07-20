// @jest-environment jsdom
import {
  activateUserPage,
  addUserPageLink,
  deleteUserPageLink,
  setUserPageAccount,
  getUserPageAdminInfo,
} from '../adminUserPage';
import { Axios } from '../../../Axios';

jest.mock('../../Axios');
const mockedAxios = Axios as jest.Mocked<typeof Axios>;

describe('adminUserPage API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('activateUserPage: 성공', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { message: '개인 페이지가 생성되었습니다.' },
    });
    const res = await activateUserPage();
    expect(res).toEqual({ message: '개인 페이지가 생성되었습니다.' });
    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/user-page-admin/page/activate'
    );
  });

  it('addUserPageLink: 성공', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { id: 1, title: 'Instagram', url: 'https://instagram.com/me1pik' },
    });
    const res = await addUserPageLink(
      'Instagram',
      'https://instagram.com/me1pik'
    );
    expect(res).toEqual({
      id: 1,
      title: 'Instagram',
      url: 'https://instagram.com/me1pik',
    });
    expect(mockedAxios.post).toHaveBeenCalledWith('/user-page-admin/link', {
      title: 'Instagram',
      url: 'https://instagram.com/me1pik',
    });
  });

  it('deleteUserPageLink: 성공', async () => {
    mockedAxios.delete.mockResolvedValueOnce({
      data: { message: '삭제 성공' },
    });
    const res = await deleteUserPageLink(1);
    expect(res).toEqual({ message: '삭제 성공' });
    expect(mockedAxios.delete).toHaveBeenCalledWith('/user-page-admin/link/1');
  });

  it('setUserPageAccount: 성공', async () => {
    mockedAxios.patch.mockResolvedValueOnce({
      data: {
        accountNumber: '123',
        bankName: '국민은행',
        accountHolder: '홍길동',
      },
    });
    const res = await setUserPageAccount('123', '국민은행', '홍길동');
    expect(res).toEqual({
      accountNumber: '123',
      bankName: '국민은행',
      accountHolder: '홍길동',
    });
    expect(mockedAxios.patch).toHaveBeenCalledWith(
      '/user-page-admin/page/account',
      {
        accountNumber: '123',
        bankName: '국민은행',
        accountHolder: '홍길동',
      }
    );
  });

  it('getUserPageAdminInfo: 성공', async () => {
    const mockData = {
      instagramId: 'abc',
      personalWebpage: '',
      linksCount: 1,
      accountNumber: '1',
      bankName: '국민',
      links: [],
    };
    mockedAxios.get.mockResolvedValueOnce({ data: mockData });
    const res = await getUserPageAdminInfo();
    expect(res).toEqual(mockData);
    expect(mockedAxios.get).toHaveBeenCalledWith('/user-page-admin/page/info');
  });
});
