import React, { useState, useEffect, useMemo } from 'react';
import styled, { ThemeProvider, css } from 'styled-components';

import {
  getUserPageAdminInfo,
  setUserPageAccount,
  addUserPageLink,
  deleteUserPageLink,
} from '../../../api-utils/user-managements/admin-user-pages/AdminUserPage';
import InputField from '../../../components/shared/forms/InputField';
import CustomModal from '../../../components/shared/modals/CustomModal';
import StatsSection from '../../../components/stats-section';

import { theme } from '@/styles/theme';

// 링크 리스트 스타일 요소 const로 분리
const LinkListWrapper = styled.div`
  width: 100%;
  max-width: 430px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 16px auto;
`;
const LinkRow = styled.div`
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #000;

  min-height: 50px;
  padding: 0 12px;
`;
const LinkLabel = styled.div`
  min-width: 55px;

  font-weight: 900;
  font-size: 13px;
  color: #000;
`;
const LinkText = styled.div`
  flex: 1;
  display: flex;
  align-items: center;

  font-size: 13px;
  color: #000;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  gap: 4px;
`;
const LinkTitle = styled.span`
  font-weight: 400;
  font-size: 13px;
  color: #000;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const LinkSeparator = styled.span`
  margin: 0 2px;
  color: #000;
`;
const LinkUrl = styled.span`
  font-weight: 800;
  font-size: 13px;
  color: #000;
  margin-left: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const LinkDeleteButton = styled.button`
  width: 34px;
  height: 34px;
  min-width: 34px;
  min-height: 34px;
  background: #fff;
  border: 1px solid #000;
  color: #000;
  margin-left: 8px;
  font-size: 20px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
  &:hover {
    background: #f5f5f5;
  }
`;

type UserLink = {
  id: number;
  label: string;
  url: string;
  title: string;
};

const SettingMelpik: React.FC = () => {
  const visits = '@styleweex';
  const sales = '4개';
  const dateRange = '개인 등록 링크';

  const visitLabel = '인스타 계정';
  const salesLabel = '등록된 링크';

  const [melpickAddress, setMelpickAddress] = useState('');
  const [isSubscriber, setIsSubscriber] = useState(true);

  const [accountInfo, setAccountInfo] = useState({
    bank: '국민은행',
    accountNumber: '',
    accountOwner: '',
  });

  const [linkInfo, setLinkInfo] = useState({
    linkName: '',
    linkUrl: '',
  });

  const [isAccountModalOpen, setAccountModalOpen] = useState(false);
  const [isLinkModalOpen, setLinkModalOpen] = useState(false);

  const [profileImage, setProfileImage] = useState<string>('');

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const maskAccountNumber = (number: string) => {
    if (number.length > 5) {
      return `${number.slice(0, 5)} ****`;
    }
    return number;
  };

  const [links, setLinks] = useState<UserLink[]>([]);
  const [loading, setLoading] = useState(false);

  // 정보 불러오기
  useEffect(() => {
    setLoading(true);
    getUserPageAdminInfo()
      .then(
        (data: {
          personalWebpage?: string;
          links?: Array<{ id: number; linkTitle: string; linkUrl: string }>;
          bankName?: string;
          accountNumber?: string;
          accountHolder?: string;
        }) => {
          setMelpickAddress(data.personalWebpage || '');
          setLinks(
            (data.links || []).map(
              (
                l: { id: number; linkTitle: string; linkUrl: string },
                idx: number
              ) => ({
                id: l.id,
                label: `링크 ${idx + 1}`,
                title: l.linkTitle,
                url: l.linkUrl,
              })
            )
          );
          setAccountInfo({
            bank: data.bankName || '국민은행',
            accountNumber: data.accountNumber || '',
            accountOwner: data.accountHolder || '',
          });
          // 기타 필요한 정보 세팅
        }
      )
      .catch(async (err: { response?: { status?: number } }) => {
        if (err?.response?.status === 404) {
          try {
            await import(
              '../../../api-utils/user-managements/admin-user-pages/AdminUserPage'
            ).then((m) => m.activateUserPage());
            // 활성화 후 재조회
            const data = await getUserPageAdminInfo();
            setMelpickAddress(data.personalWebpage || '');
            setLinks(
              (data.links || []).map(
                (
                  l: { id: number; linkTitle: string; linkUrl: string },
                  idx: number
                ) => ({
                  id: l.id,
                  label: `링크 ${idx + 1}`,
                  title: l.linkTitle,
                  url: l.linkUrl,
                })
              )
            );
            setAccountInfo({
              bank: data.bankName || '국민은행',
              accountNumber: data.accountNumber || '',
              accountOwner: data.accountHolder || '',
            });
          } catch {
            // 활성화 실패 시 별도 처리(알림 등)
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // 링크 삭제
  const handleDelete = async (linkId: number) => {
    await deleteUserPageLink(linkId);
    setLinks((prev) => prev.filter((link) => link.id !== linkId));
  };

  const handleCopyLink = () => {
    const linkToCopy = `melpick.com/${melpickAddress}`;

    navigator.clipboard
      .writeText(linkToCopy)
      .then(() => {})
      .catch(() => {});
  };

  // 토글 UI
  const ToggleSwitch = styled.div<{ $on: boolean }>`
    width: 60px;
    height: 30px;
    background: ${({ $on }) => ($on ? '#222' : '#D9D9D9')};
    border-radius: 15px;
    position: relative;
    cursor: pointer;
    transition: background 0.2s;
    display: inline-block;
    vertical-align: middle;
    margin-left: 8px;
  `;
  const ToggleCircle = styled.div<{ $on: boolean }>`
    width: 28px;
    height: 28px;
    background: #fff;
    border-radius: 50%;
    position: absolute;
    top: 1px;
    left: ${({ $on }) => ($on ? '31px' : '1px')};
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    transition: left 0.2s;
  `;
  const ToggleText = styled.span<{ $on: boolean }>`
    position: absolute;
    top: 9px;
    left: ${({ $on }) => ($on ? '12px' : '35px')};
    font-size: 10px;
    font-weight: 700;
    color: ${({ $on }) => ($on ? '#fff' : '#222')};
    z-index: 2;
    user-select: none;
    pointer-events: none;
  `;

  // 커스텀 InputField Wrapper
  const CustomInputField = styled.div<{
    $yellow?: boolean;
    $readonly?: boolean;
  }>`
    width: 100%;
    max-width: 430px;
    min-height: 50px;
    background: ${({ $readonly }) => ($readonly ? '#f5f5f5' : '#fff')};
    border: 1px solid ${({ $yellow }) => ($yellow ? '#F6AE24' : '#000')};

    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding: 0 16px;

    margin-bottom: 16px;
    ${(props) =>
      props.$yellow &&
      css`
        border: 1px solid #f6ae24;
      `}
  `;
  const CustomLabel = styled.div`
    width: 100%;
    max-width: 430px;

    font-size: 10px;
    font-weight: 700;
    color: #000;
    margin-bottom: 6px;
    margin-left: 2px;
    display: flex;
    align-items: center;
    gap: 4px;
  `;
  const CustomPrefix = styled.div`
    font-size: 14px;
    font-weight: 800;
    color: #000;

    min-width: 94px;
  `;

  const CustomButton = styled.button<{ $gray?: boolean; $yellow?: boolean }>`
    width: 69px;
    height: 34px;
    background: ${({ $gray, $yellow }) =>
      $yellow ? '#F6AE24' : $gray ? '#999' : '#000'};
    border-radius: 5px;
    border: none;
    color: #fff;

    font-size: 12px;
    font-weight: 800;
    line-height: 13px;
    text-align: center;
    margin-left: auto;
    cursor: pointer;
    transition: background 0.2s;
    &:active {
      opacity: 0.8;
    }
  `;
  const CustomInput = styled.input<{ readOnly?: boolean }>`
    flex: 1;
    border: none;
    outline: none;
    font-size: 13px;
    font-weight: 800;
    color: #000;
    background: ${({ readOnly }) => (readOnly ? '#f5f5f5' : 'transparent')};
    &::placeholder {
      color: #ccc;
      font-weight: 400;
    }
  `;

  const ProfileImageSection = styled.div`
    width: 100%;
    max-width: 430px;
    background: #fafafa;
    border: 1px solid #000;

    padding: 24px 0 28px 0;

    display: flex;
    flex-direction: column;
    align-items: center;

    margin-bottom: 20px;
  `;
  const ProfileImageLabelRow = styled.div`
    font-size: 13px;
    font-weight: 700;
    color: #222;
    margin-bottom: 18px;
  `;
  const ProfileImageUploadBox = styled.label`
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    position: relative;
  `;
  const ProfileImageDisplay = styled.img`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 1.5px solid #ccc;
    background: #fff;
    transition: filter 0.2s;
    &:hover {
      filter: brightness(0.85);
    }
  `;
  const PlaceholderText = styled.div`
    width: 80px;
    height: 80px;
    border: 1.5px dashed #ccc;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 13px;
    text-align: center;
    background: #fff;
  `;
  const Overlay = styled.div`
    position: absolute;
    left: 0;
    top: 0;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.35);
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
    z-index: 2;
    user-select: none;
    ${ProfileImageUploadBox}:hover & {
      opacity: 1;
      pointer-events: auto;
    }
  `;
  const HiddenFileInput = styled.input`
    display: none;
  `;
  const ImageGuide = styled.div`
    font-size: 11px;
    color: #888;
    margin-top: 10px;
    text-align: center;
  `;

  const [tempAccountInfo, setTempAccountInfo] = useState(accountInfo);
  const [tempLinkInfo, setTempLinkInfo] = useState(linkInfo);

  // 모달 열릴 때 임시 state 초기화
  const openAccountModal = () => {
    setTempAccountInfo(accountInfo);
    setAccountModalOpen(true);
  };
  const openLinkModal = () => {
    setTempLinkInfo(linkInfo);
    setLinkModalOpen(true);
  };

  // InputField 최적화를 위한 메모이제이션
  const memoizedAccountInputs = useMemo(
    () => (
      <>
        <InputField
          label='계좌번호 *'
          id='account-number'
          type='text'
          placeholder='계좌번호를 입력하세요'
          value={tempAccountInfo.accountNumber}
          onChange={(
            e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
          ) =>
            setTempAccountInfo({
              ...tempAccountInfo,
              accountNumber: e.target.value,
            })
          }
        />
        <FlexRow>
          <InputField
            label='은행 선택 *'
            id='bank-select'
            options={[
              '국민은행',
              '신한은행',
              '하나은행',
              '우리은행',
              '카카오뱅크',
            ]}
            onSelectChange={(value: string) =>
              setTempAccountInfo({ ...tempAccountInfo, bank: value })
            }
            defaultValue={tempAccountInfo.bank}
          />
          <InputField
            label='예금주 입력 *'
            id='account-owner'
            type='text'
            placeholder='예금주를 입력하세요'
            value={tempAccountInfo.accountOwner}
            onChange={(
              e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
            ) =>
              setTempAccountInfo({
                ...tempAccountInfo,
                accountOwner: e.target.value,
              })
            }
          />
        </FlexRow>
      </>
    ),
    [tempAccountInfo]
  );

  const memoizedLinkInputs = useMemo(
    () => (
      <>
        <InputField
          label='링크명 *'
          id='link-name'
          type='text'
          placeholder='등록할 링크명을 입력하세요'
          value={tempLinkInfo.linkName}
          onChange={(
            e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
          ) => setTempLinkInfo({ ...tempLinkInfo, linkName: e.target.value })}
        />
        <InputField
          label='URL 입력 *'
          id='link-url'
          type='text'
          placeholder='등록할 URL을 입력하세요'
          value={tempLinkInfo.linkUrl}
          onChange={(
            e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
          ) => setTempLinkInfo({ ...tempLinkInfo, linkUrl: e.target.value })}
        />
      </>
    ),
    [tempLinkInfo]
  );

  // 모달 확인 시 반영
  const handleAccountModalConfirm = async () => {
    await setUserPageAccount(
      tempAccountInfo.accountNumber,
      tempAccountInfo.bank,
      tempAccountInfo.accountOwner
    );
    setAccountInfo(tempAccountInfo);
    setAccountModalOpen(false);
  };
  const handleLinkModalConfirm = async () => {
    const res = await addUserPageLink(
      tempLinkInfo.linkName,
      tempLinkInfo.linkUrl
    );
    setLinks((prev) => [
      ...prev,
      {
        id: res.id,
        label: `링크 ${prev.length + 1}`,
        title: res.linkTitle,
        url: res.linkUrl,
      },
    ]);
    setLinkInfo(tempLinkInfo);
    setLinkModalOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Header>
          <Title>멜픽 설정</Title>
          <Subtitle>내 채널을 통해 나는 브랜드가 된다</Subtitle>
        </Header>

        <StatsRow>
          <StatsSection
            visits={visits}
            sales={sales}
            dateRange={dateRange}
            visitLabel={visitLabel}
            salesLabel={salesLabel}
          />
        </StatsRow>
        <Divider />
        {/* 프로필 이미지 수정 영역 */}
        <ProfileImageSection>
          <ProfileImageLabelRow>프로필 이미지 수정</ProfileImageLabelRow>
          <ProfileImageUploadBox htmlFor='profile-image-input'>
            {profileImage ? (
              <>
                <ProfileImageDisplay src={profileImage} alt='프로필 이미지' />
                <Overlay>수정</Overlay>
              </>
            ) : (
              <>
                <PlaceholderText>이미지 추가</PlaceholderText>
                <Overlay>추가</Overlay>
              </>
            )}
            <HiddenFileInput
              id='profile-image-input'
              type='file'
              accept='image/*'
              onChange={handleImageFileChange}
            />
          </ProfileImageUploadBox>
          <ImageGuide>이미지를 클릭해 프로필을 변경하세요</ImageGuide>
        </ProfileImageSection>
        {/* 멜픽 주소 */}
        <CustomLabel>
          멜픽 주소{' '}
          <span style={{ fontWeight: 400, color: '#888', fontSize: 10 }}>
            (변경불가)
          </span>
        </CustomLabel>
        <CustomInputField $readonly>
          <CustomPrefix>me1pik.com/</CustomPrefix>
          <CustomInput
            readOnly
            value={melpickAddress}
            style={{ maxWidth: 120 }}
          />
          <CustomButton $gray onClick={handleCopyLink}>
            링크복사
          </CustomButton>
        </CustomInputField>

        {/* 멜픽 자동생성 설정 */}
        <CustomLabel>
          멜픽 자동생성 설정{' '}
          <span style={{ fontWeight: 400, color: '#888', fontSize: 10 }}>
            (구독 이용자 선택가능)
          </span>
        </CustomLabel>
        <CustomInputField>
          <div
            style={{
              fontSize: 13,
              fontWeight: 400,
              color: '#000',
              minWidth: 103,
              marginRight: 8,
            }}
          >
            이용상태 |{' '}
            <b style={{ fontWeight: 900 }}>
              {isSubscriber ? '구독자' : '일반 이용자'}
            </b>
          </div>
          <div style={{ marginLeft: 'auto', position: 'relative' }}>
            <ToggleSwitch
              $on={isSubscriber}
              onClick={() => setIsSubscriber((v) => !v)}
            >
              <ToggleCircle $on={isSubscriber} />
              <ToggleText $on={isSubscriber}>
                {isSubscriber ? '켜짐' : '꺼짐'}
              </ToggleText>
            </ToggleSwitch>
          </div>
        </CustomInputField>

        {/* 정산 계좌정보 */}
        <CustomLabel>정산 계좌정보 (필수) *</CustomLabel>
        <CustomInputField $yellow $readonly>
          <CustomInput
            readOnly
            value={
              accountInfo.accountNumber
                ? `${maskAccountNumber(accountInfo.accountNumber)} (${accountInfo.bank})`
                : ''
            }
            style={{ fontWeight: 800, fontSize: 13 }}
          />
          <CustomButton $yellow onClick={openAccountModal}>
            등록/변경
          </CustomButton>
        </CustomInputField>

        {/* 개인 링크 설정 */}
        <CustomLabel>개인 링크 설정 (선택)</CustomLabel>
        <CustomInputField $readonly style={{ marginBottom: 8 }}>
          <CustomInput
            readOnly
            placeholder='등록하실 링크를 추가하세요'
            value={
              linkInfo.linkName
                ? `${linkInfo.linkName} (${linkInfo.linkUrl})`
                : ''
            }
            style={{ fontWeight: 400, fontSize: 13, color: '#ccc' }}
          />
          <CustomButton onClick={openLinkModal}>링크등록</CustomButton>
        </CustomInputField>

        {/* 링크 리스트 */}
        <LinkListWrapper>
          {loading ? (
            <div>Loading...</div>
          ) : links.length === 0 ? (
            <div>등록된 링크가 없습니다.</div>
          ) : (
            links.map((link, idx) => (
              <LinkRow key={link.id}>
                <LinkLabel>{`링크 ${idx + 1}`}</LinkLabel>
                <LinkText>
                  <LinkTitle>{link.title}</LinkTitle>
                  <LinkSeparator>|</LinkSeparator>
                  <LinkUrl>{link.url}</LinkUrl>
                </LinkText>
                <LinkDeleteButton onClick={() => handleDelete(link.id)}>
                  ×
                </LinkDeleteButton>
              </LinkRow>
            ))
          )}
        </LinkListWrapper>

        <CustomModal
          isOpen={isAccountModalOpen}
          onClose={() => setAccountModalOpen(false)}
          onConfirm={handleAccountModalConfirm}
          title='정산 계좌등록'
        >
          <ModalContent>{memoizedAccountInputs}</ModalContent>
        </CustomModal>

        <CustomModal
          isOpen={isLinkModalOpen}
          onClose={() => setLinkModalOpen(false)}
          onConfirm={handleLinkModalConfirm}
          title='개인 링크등록'
        >
          <ModalContent>{memoizedLinkInputs}</ModalContent>
        </CustomModal>
      </Container>
    </ThemeProvider>
  );
};

export default SettingMelpik;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  background-color: #fff;
  padding: 1rem;
`;

const Header = styled.div`
  width: 100%;
  margin-bottom: 10px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #000;
`;

const Subtitle = styled.p`
  font-size: 12px;
  color: #aaa;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #ddd;
  margin: 20px 0;
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StatsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 20px;
`;

// 스타일 컴포넌트 FlexRow도 다시 추가
const FlexRow = styled.div`
  display: flex;
  gap: 10px;
`;
