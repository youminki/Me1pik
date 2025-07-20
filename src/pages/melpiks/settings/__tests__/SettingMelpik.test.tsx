import { render, screen, fireEvent, within } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

// @ts-expect-error: 절대경로 import에 대한 타입스크립트 모듈 해석 문제로 인한 무시
import * as adminUserPageApi from 'src/api/adminUserPage/adminUserPage';

jest.mock('src/api/Axios', () => ({
  Axios: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}));

jest.mock('src/api/adminUserPage/adminUserPage', () => ({
  getUserPageAdminInfo: jest.fn().mockResolvedValue({
    instagramId: '',
    personalWebpage: '',
    linksCount: 0,
    accountNumber: '',
    bankName: '',
    links: [],
  }),
  setUserPageAccount: jest.fn().mockResolvedValue({}),
  addUserPageLink: jest.fn().mockResolvedValue({}),
  deleteUserPageLink: jest.fn().mockResolvedValue({}),
  activateUserPage: jest.fn().mockResolvedValue({}),
}));

jest.mock('s../../components/CustomModal', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import SettingMelpik from '@/pages/melpiks/settings/SettingMelpik';

/**
 * ⚠️ 테스트 환경에서는 CustomModal의 children이 실제로 렌더링되지 않거나,
 * 포털 구조/조건부 렌더링 등으로 인해 '확인' 버튼이 노출되지 않을 수 있습니다.
 * 따라서 mock에서 '확인' 버튼을 직접 추가하여 통합 시나리오 테스트의 신뢰성을 확보합니다.
 * 실제 서비스 코드에는 영향이 없으며, E2E 테스트에서는 실제 모달 동작까지 검증할 수 있습니다.
 */

describe('SettingMelpik 컴포넌트', () => {
  it('기본 렌더링 및 주요 UI 요소 표시', () => {
    render(<SettingMelpik />);
    // 타이틀
    expect(screen.getByText('멜픽 설정')).toBeInTheDocument();
    // 서브타이틀
    expect(
      screen.getByText('내 채널을 통해 나는 브랜드가 된다')
    ).toBeInTheDocument();
    // 멜픽 주소
    expect(screen.getByText(/me1pik.com\//)).toBeInTheDocument();
    // 링크복사 버튼
    expect(
      screen.getByRole('button', { name: /링크복사/ })
    ).toBeInTheDocument();
    // 정산 계좌정보 등록/변경 버튼
    expect(
      screen.getByRole('button', { name: /등록\/변경/ })
    ).toBeInTheDocument();
    // 링크등록 버튼
    expect(
      screen.getByRole('button', { name: /링크등록/ })
    ).toBeInTheDocument();
  });
});

describe('SettingMelpik 통합 사용자 시나리오', () => {
  const mockedApi = adminUserPageApi as jest.Mocked<typeof adminUserPageApi>;
  const mockGetInfo = mockedApi.getUserPageAdminInfo;
  const mockActivate = mockedApi.activateUserPage;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('페이지 진입 시 정보 조회 및 UI 반영', async () => {
    mockGetInfo.mockResolvedValueOnce({
      instagramId: 'test_insta',
      personalWebpage: 'https://test.com',
      linksCount: 1,
      accountNumber: '123-456',
      bankName: '테스트은행',
      links: [{ id: 1, linkTitle: '테스트링크', linkUrl: 'https://test.com' }],
    });
    render(<SettingMelpik />);
    // 비동기 데이터 반영 대기
    expect(await screen.findByText('@styleweex')).toBeInTheDocument();
    // 계좌정보는 input value로 렌더링됨
    expect(
      screen.getByDisplayValue('123-4 **** (테스트은행)')
    ).toBeInTheDocument();
    // 링크명과 URL이 각각 별도의 엘리먼트로 렌더링되는지 검사
    expect(screen.getByText('테스트링크')).toBeInTheDocument();
    expect(screen.getByText('https://test.com')).toBeInTheDocument();
  });

  it('계좌 등록/변경 성공 시 UI 반영', async () => {
    mockGetInfo.mockResolvedValueOnce({
      instagramId: 'test_insta',
      personalWebpage: 'https://test.com',
      linksCount: 1,
      accountNumber: '123-456',
      bankName: '테스트은행',
      links: [],
    });
    render(<SettingMelpik />);
    // 계좌정보 등록/변경 버튼 클릭
    const changeBtn = await screen.findByRole('button', { name: /등록\/변경/ });
    fireEvent.click(changeBtn);
    // 모달 내 계좌번호 input이 나타날 때까지 waitFor로 대기
    const input = await within(document.body).getByPlaceholderText(
      '계좌번호를 입력하세요'
    );
    fireEvent.change(input, { target: { value: '987654321' } });
    // 모달 확인 버튼 클릭
    const confirmBtns = within(document.body).getAllByRole('button', {
      name: /확인/,
    });
    fireEvent.click(confirmBtns[0]);
    // UI에 반영됐는지 확인
    expect(
      await screen.findByDisplayValue('98765 **** (테스트은행)')
    ).toBeInTheDocument();
  });

  it('링크 등록/삭제 시 UI 반영', async () => {
    mockGetInfo.mockResolvedValueOnce({
      instagramId: 'test_insta',
      personalWebpage: 'https://test.com',
      linksCount: 0,
      accountNumber: '123-456',
      bankName: '테스트은행',
      links: [],
    });
    render(<SettingMelpik />);
    // 링크등록 버튼 클릭
    const addBtn = await screen.findByRole('button', { name: /링크등록/ });
    fireEvent.click(addBtn);
    // 모달 내 링크명/URL input이 나타날 때까지 waitFor로 대기
    const linkNameInput = await within(document.body).getByPlaceholderText(
      '등록할 링크명을 입력하세요'
    );
    const linkUrlInput = await within(document.body).getByPlaceholderText(
      '등록할 URL을 입력하세요'
    );
    fireEvent.change(linkNameInput, { target: { value: '블로그' } });
    fireEvent.change(linkUrlInput, { target: { value: 'https://blog.com' } });
    // 모달 확인 버튼 클릭
    const confirmBtns = within(document.body).getAllByRole('button', {
      name: /확인/,
    });
    fireEvent.click(confirmBtns[0]);
    // UI에 반영됐는지 확인
    expect(await screen.findByText('블로그')).toBeInTheDocument();
    expect(screen.getByText('https://blog.com')).toBeInTheDocument();
    // 삭제 버튼 클릭
    const deleteBtn = screen.getByText('×');
    fireEvent.click(deleteBtn);
    // 삭제 후 UI에서 사라졌는지 확인
    expect(screen.queryByText('블로그')).not.toBeInTheDocument();
    expect(screen.queryByText('https://blog.com')).not.toBeInTheDocument();
  });

  it('404(개인 페이지 미생성) → 자동 활성화 후 재조회', async () => {
    // 첫 조회에서 404, activateUserPage 호출 후 재조회 성공
    mockGetInfo.mockRejectedValueOnce({ response: { status: 404 } });
    mockActivate.mockResolvedValueOnce({});
    mockGetInfo.mockResolvedValueOnce({
      instagramId: 'new_insta',
      personalWebpage: '',
      linksCount: 0,
      accountNumber: '',
      bankName: '',
      links: [],
    });
    render(<SettingMelpik />);
    expect(await screen.findByText('@styleweex')).toBeInTheDocument();
    expect(mockActivate).toHaveBeenCalled();
  });
});
