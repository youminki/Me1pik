import { Axios } from '../../Axios';

import { LoginPost } from './LoginPost';

jest.mock('../../Axios');
const mockedAxios = Axios as jest.Mocked<typeof Axios>;

describe('LoginPost', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('로그인 성공 시 accessToken, refreshToken을 반환한다', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: { id: '1', email: 'test@test.com' },
      },
    });
    const result = await LoginPost('test@test.com', 'pw');
    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(result.user?.email).toBe('test@test.com');
  });

  it('401 에러 시 올바른 메시지를 반환한다', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { status: 401, data: { message: 'Unauthorized' } },
    });
    await expect(LoginPost('test@test.com', 'pw')).rejects.toMatchObject({
      message: '잘못된 사용자 ID 또는 비밀번호입니다.',
      statusCode: 401,
    });
  });

  it('500 에러 시 서버 오류 메시지를 반환한다', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { status: 500, data: { message: 'Server error' } },
    });
    await expect(LoginPost('test@test.com', 'pw')).rejects.toMatchObject({
      message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      statusCode: 500,
    });
  });

  it('기타 에러 시 기본 메시지를 반환한다', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { status: 403, data: { message: 'Forbidden' } },
    });
    await expect(LoginPost('test@test.com', 'pw')).rejects.toMatchObject({
      message: 'Forbidden',
      statusCode: 403,
    });
  });

  it('알 수 없는 에러 시 기본 메시지를 반환한다', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));
    await expect(LoginPost('test@test.com', 'pw')).rejects.toMatchObject({
      message: '로그인 요청에 실패했습니다.',
    });
  });
});
