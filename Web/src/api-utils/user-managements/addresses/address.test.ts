import { Axios } from '@/api-utils/Axios';
import { AddressApi } from '@/api-utils/user-managements/addresses/address';

jest.mock('../../Axios');
const mockedAxios = Axios as jest.Mocked<typeof Axios>;

describe('AddressApi', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getAddresses: 주소 목록을 반환한다', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          address: '서울',
          addressDetail: '',
          isDefault: true,
          createdAt: '',
          updatedAt: '',
          deliveryMessage: '',
        },
      ],
    });
    const result = await AddressApi.getAddresses();
    expect(result[0].address).toBe('서울');
  });

  it('createAddress: 주소를 생성하고 반환한다', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        id: 2,
        address: '부산',
        addressDetail: '',
        isDefault: false,
        createdAt: '',
        updatedAt: '',
        deliveryMessage: '',
      },
    });
    const result = await AddressApi.createAddress({
      address: '부산',
      addressDetail: '',
      deliveryMessage: '',
    });
    expect(result.address).toBe('부산');
  });

  it('updateAddress: 주소를 수정하고 반환한다', async () => {
    mockedAxios.patch.mockResolvedValueOnce({
      data: {
        id: 1,
        address: '대구',
        addressDetail: '',
        isDefault: false,
        createdAt: '',
        updatedAt: '',
        deliveryMessage: '',
      },
    });
    const result = await AddressApi.updateAddress(1, { address: '대구' });
    expect(result.address).toBe('대구');
  });

  it('deleteAddress: 주소를 삭제한다', async () => {
    mockedAxios.delete.mockResolvedValueOnce({});
    await expect(AddressApi.deleteAddress(1)).resolves.toBeUndefined();
  });

  it('setDefaultAddress: 기본 주소로 설정한다', async () => {
    mockedAxios.patch.mockResolvedValueOnce({});
    await expect(AddressApi.setDefaultAddress(1)).resolves.toBeUndefined();
  });

  it('getAddresses: 에러 발생 시 throw', async () => {
    mockedAxios.get.mockRejectedValueOnce({
      response: { data: { message: '에러', code: 'ERR' } },
    });
    await expect(AddressApi.getAddresses()).rejects.toMatchObject({
      message: '에러',
      code: 'ERR',
    });
  });
});
