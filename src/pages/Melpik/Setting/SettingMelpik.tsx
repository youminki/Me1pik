import React, { useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import Theme from '../../../styles/Theme';
import StatsSection from '../../../components/StatsSection';
import InputField from '../../../components/InputField';
import ReusableModal from '../../../components/ReusableModal';
import DeleteIcon from '../../../assets/Melpik/DeleteIcon.svg';

const SettingMelpik: React.FC = () => {
  const visits = '@styleweex';
  const sales = '4개';
  const dateRange = '개인 등록 링크';

  const visitLabel = '인스타 계정';
  const salesLabel = '등록된 링크';

  const [melpickAddress] = useState('styleweex');

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

  const handleImageChangeClick = () => {
    document.getElementById('profile-image-input')?.click();
  };

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

  const [links, setLinks] = useState([
    {
      id: 1,
      label: '링크 1',
      url: 'https://youtu.be/Kw482drmWqw',
      title: '밍또의 세상',
    },
    {
      id: 2,
      label: '링크 2',
      url: 'https://youtu.be/UfLf_60xa2a',
      title: '서비스 소개 링크',
    },
    {
      id: 3,
      label: '링크 3',
      url: 'https://myteatime.kr/conm',
      title: '2024 티타임지 인터뷰',
    },
    {
      id: 4,
      label: '링크 4',
      url: 'https://myteatime.kr/cont1m',
      title: '2024 네이버 인터뷰',
    },
  ]);

  const handleDelete = (linkId: number) => {
    setLinks(links.filter((link) => link.id !== linkId));
  };

  const handleCopyLink = () => {
    const linkToCopy = `melpick.com/${melpickAddress}`;

    navigator.clipboard
      .writeText(linkToCopy)
      .then(() => {})
      .catch(() => {});
  };

  return (
    <ThemeProvider theme={Theme}>
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

        <Section>
          <InputField
            label='멜픽 주소 (변경불가)'
            id='melpickAddress'
            type='text'
            placeholder='주소를 입력하세요'
            required
            maxLength={12}
            prefix='melpick.com/'
            readOnly
            value={melpickAddress}
            buttonLabel='링크복사'
            buttonColor='black'
            onButtonClick={handleCopyLink}
          />

          <InputField
            prefixcontent='이용상태 | 구독자'
            label='멜픽 자동생성 설정'
            id='auto-create-toggle'
            type='text'
            useToggle={true}
          />

          <InputField
            label='정산 계좌정보 (필수)'
            id='account-info'
            type='text'
            placeholder={
              accountInfo.accountNumber
                ? `${maskAccountNumber(accountInfo.accountNumber)} (${accountInfo.bank})`
                : '등록하실 계좌 정보를 입력하세요'
            }
            buttonLabel='등록/변경'
            buttonColor='yellow'
            onButtonClick={() => setAccountModalOpen(true)}
          />

          <InputField
            label='개인 링크 설정 (선택)'
            id='personal-link'
            type='text'
            placeholder={
              linkInfo.linkName
                ? `${linkInfo.linkName} (${linkInfo.linkUrl})`
                : '등록하실 링크를 추가하세요'
            }
            buttonLabel='링크등록'
            buttonColor='black'
            onButtonClick={() => setLinkModalOpen(true)}
          />
        </Section>

        <Section>
          <LinkList>
            {links.map((link) => (
              <LinkItem key={link.id}>
                <Label $isEmpty={links.length === 0}>{link.label}</Label>
                <LinkContent>
                  <LinkTitle>{link.title}</LinkTitle>
                  <Separator>|</Separator>
                  <LinkUrl
                    href={link.url}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {link.url}
                  </LinkUrl>
                  <DeleteButton onClick={() => handleDelete(link.id)}>
                    <img src={DeleteIcon} alt='Delete' />
                  </DeleteButton>
                </LinkContent>
              </LinkItem>
            ))}
          </LinkList>
        </Section>

        <ReusableModal
          isOpen={isAccountModalOpen}
          onClose={() => setAccountModalOpen(false)}
          title='정산 계좌등록'
        >
          <ModalContent>
            <InputField
              label='계좌번호 *'
              id='account-number'
              type='text'
              placeholder='계좌번호를 입력하세요'
              value={accountInfo.accountNumber}
              onChange={(e) =>
                setAccountInfo({
                  ...accountInfo,
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
                  setAccountInfo({ ...accountInfo, bank: value })
                }
                defaultValue={accountInfo.bank}
              />
              <InputField
                label='예금주 입력 *'
                id='account-owner'
                type='text'
                placeholder='예금주를 입력하세요'
                value={accountInfo.accountOwner}
                onChange={(e) =>
                  setAccountInfo({
                    ...accountInfo,
                    accountOwner: e.target.value,
                  })
                }
              />
            </FlexRow>
          </ModalContent>
        </ReusableModal>

        <ReusableModal
          isOpen={isLinkModalOpen}
          onClose={() => setLinkModalOpen(false)}
          title='개인 링크등록'
        >
          <ModalContent>
            <InputField
              label='링크명 *'
              id='link-name'
              type='text'
              placeholder='등록할 링크명을 입력하세요'
              value={linkInfo.linkName}
              onChange={(e) =>
                setLinkInfo({ ...linkInfo, linkName: e.target.value })
              }
            />
            <InputField
              label='URL 입력 *'
              id='link-url'
              type='text'
              placeholder='등록할 URL을 입력하세요'
              value={linkInfo.linkUrl}
              onChange={(e) =>
                setLinkInfo({ ...linkInfo, linkUrl: e.target.value })
              }
            />
          </ModalContent>
        </ReusableModal>

        <Section>
          <ProfileImageLabel>프로필 이미지 수정</ProfileImageLabel>
          <ProfileImageField>
            {profileImage ? (
              <ProfileImageDisplay src={profileImage} alt='프로필 이미지' />
            ) : (
              <PlaceholderText>이미지를 추가해 주세요</PlaceholderText>
            )}
            <ChangeImageButton type='button' onClick={handleImageChangeClick}>
              이미지 수정
            </ChangeImageButton>
            <HiddenFileInput
              id='profile-image-input'
              type='file'
              accept='image/*'
              onChange={handleImageFileChange}
            />
          </ProfileImageField>
        </Section>
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

const Section = styled.div`
  width: 100%;
  padding: 10px 0;
`;

const FlexRow = styled.div`
  display: flex;
  gap: 10px;
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

const LinkList = styled.ul`
  margin-top: 10px;
  list-style: none;
  padding: 0;
`;

const LinkItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 10px;
`;

const Label = styled.label<{ $isEmpty: boolean }>`
  margin-bottom: 10px;

  font-weight: 900;
  font-size: 12px;
  line-height: 16px;
  color: #000000;
  text-align: left;
  flex-shrink: 0;
`;

const LinkContent = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  margin-left: 11px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  padding: 10px;
  border: 1px solid ${Theme.colors.gray1};
`;

const LinkTitle = styled.span`
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: #000000;
`;

const Separator = styled.span`
  color: #aaa;
  margin: 0 5px;
`;

const LinkUrl = styled.a`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  text-decoration: none;

  font-weight: 800;
  font-size: 12px;
  line-height: 16px;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding-left: 10px;
  display: flex;
  align-items: center;
  margin-left: auto;
`;

/* 프로필 이미지 관련 스타일 */
const ProfileImageLabel = styled.div`
  font-size: 12px;
  font-weight: bold;
  margin-top: 30px;
  text-align: left;

  margin-bottom: 10px;
`;

const ProfileImageField = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 20px;
  gap: 30px;
  border: 1px solid #ccc;
  justify-content: center;
`;

const ProfileImageDisplay = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #ccc;
`;

const PlaceholderText = styled.div`
  width: 60px;
  height: 60px;
  border: 1px dashed #ccc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 10px;
  text-align: center;
`;

const ChangeImageButton = styled.button`
  padding: 8px 12px;
  font-size: 12px;
  background-color: #000;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const HiddenFileInput = styled.input`
  display: none;
`;
