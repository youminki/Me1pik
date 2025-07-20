import { Axios } from '../../Axios';

import { signupUser } from './signupPost';

jest.mock('../../Axios');
const mockedAxios = Axios as jest.Mocked<typeof Axios>;

describe('signupUser', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const signupData = {
    email: 'test@test.com',
    password: 'pw',
    name: '홍길동',
    nickname: '길동',
    birthdate: '1990-01-01',
    address: '서울',
    phoneNumber: '01012345678',
    gender: '남성',
    agreeToTerms: true,
    agreeToPrivacyPolicy: true,
  };

  it('회원가입 성공 시 success: true와 data를 반환한다', async () => {
    mockedAxios.post.mockResolvedValueOnce({ status: 201, data: { id: 1 } });
    const result = await signupUser(signupData);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ id: 1 });
  });

  it('API 에러 발생 시 ApiError를 throw한다', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        data: { message: '중복된 이메일입니다.', code: 'DUPLICATE' },
      },
    });
    await expect(signupUser(signupData)).rejects.toMatchObject({
      message: '중복된 이메일입니다.',
      code: 'DUPLICATE',
    });
  });

  it('알 수 없는 에러 발생 시 기본 메시지를 throw한다', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));
    await expect(signupUser(signupData)).rejects.toMatchObject({
      message: '회원가입에 실패했습니다.',
    });
  });
});
