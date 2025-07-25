import { useState } from 'react';
import styled from 'styled-components';

const AgreementSection = () => {
  const [individualChecks, setIndividualChecks] = useState({
    agree1: false,
    agree2: false,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState('');

  const handleIndividualCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    setIndividualChecks((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  const handleViewDetails = (content: string) => {
    setModalContent(content);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <AgreementWrapper>
      <ContentContainer>
        <CheckboxWrapper>
          <Checkbox
            type='checkbox'
            id='agree1'
            required
            checked={individualChecks.agree1}
            onChange={handleIndividualCheck}
          />
          <Label htmlFor='agree1'>
            정보입력 동의 <RequiredText>(필수)</RequiredText>
          </Label>
        </CheckboxWrapper>
        <InputWrapper>
          <DescriptionWrapper>
            <Description>설정에 필요한 정보입력 동의 안내.</Description>
          </DescriptionWrapper>
          <ViewDetailsButton
            onClick={() =>
              handleViewDetails(`
                본 약관은 주식회사 멜픽(이하 "회사"라 합니다.)가 제공하는 의류 및 잡화(이하 "제품"이라 합니다.) 판매 및 전자상거래에 관한 온/오프라인상의 제반 서비스(이하 "서비스"라 합니다.)를 이용함에 있어서 회사와 회원의 권리와 의무에 대한 책임사항을 규정함을 목적으로 합니다.
              `)
            }
          >
            전체보기
          </ViewDetailsButton>
        </InputWrapper>
      </ContentContainer>

      {modalVisible && (
        <Modal>
          <ModalContent>
            <ContentWrapper>
              <ModalHeader>
                <ModalTitle>이용약관</ModalTitle>
                <GrayLine />
                <SectionTitle>제1장 총칙</SectionTitle>
                <SubTitle>제1조 (목적)</SubTitle>
              </ModalHeader>
              <Text>{modalContent}</Text>
              <GrayLine />
              <CloseButtonWrapper>
                <CloseButton onClick={closeModal}>확인</CloseButton>
              </CloseButtonWrapper>
            </ContentWrapper>
          </ModalContent>
        </Modal>
      )}
    </AgreementWrapper>
  );
};

export default AgreementSection;

const AgreementWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  margin-bottom: 20px;
  z-index: 99999;
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const ContentContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.lightgray};
  border: 1px solid ${({ theme }) => theme.colors.gray0};
  padding: 20px;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray3};
  padding: 10px;
  position: relative;
`;

const Checkbox = styled.input`
  margin-bottom: 5px;
  width: 20px;
  height: 20px;
  margin-right: 10px;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray2};
  border-radius: 3px;
  cursor: pointer;

  &:checked {
    background-color: ${({ theme }) => theme.colors.white};
    border-color: ${({ theme }) => theme.colors.gray1};
  }

  &:checked::before {
    content: '✔';
    color: ${({ theme }) => theme.colors.yellow};
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const Label = styled.label`
  ${({ theme }) => theme.fonts.default};
  color: ${({ theme }) => theme.colors.black};
`;

const RequiredText = styled.span`
  color: ${({ theme }) => theme.colors.gray2};
`;

const ViewDetailsButton = styled.button`
  width: 69px;
  height: 34px;
  background-color: ${({ theme }) => theme.colors.black};

  border: none;
  cursor: pointer;

  border-radius: 5px;

  font-weight: 800;
  font-size: 12px;
  line-height: 13px;
  text-align: center;

  color: #ffffff;
`;

const DescriptionWrapper = styled.div`
  display: flex;
  justify-content: left;
  align-items: center;
  flex-grow: 1;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.gray};
  margin: 0;

  font-weight: 700;
  font-size: 12px;
  line-height: 13px;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 27px;
`;

const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  padding: 20px;
  max-width: 500px;
  width: 100%;
  height: 670px;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ContentWrapper = styled.div`
  flex-grow: 1;
  height: 486px;
`;

const ModalHeader = styled.div`
  display: flex;
  flex-direction: column;
`;

const ModalTitle = styled.p`
  font-weight: 800;
  font-size: 16px;
  line-height: 16px;
  margin-top: 20px;
`;

const SectionTitle = styled.p`
  font-weight: 400;
  font-size: 12px;
  line-height: 13.26px;
  margin-bottom: 20px;
`;

const SubTitle = styled.p`
  font-weight: 400;
  font-size: 12px;
  line-height: 13.26px;
  margin-bottom: 20px;
`;

const Text = styled.p`
  height: 386px;

  font-weight: 400;
  font-size: 12px;
  line-height: 13.26px;
  margin-bottom: 20px;
  color: ${({ theme }) => theme.colors.gray2};
`;

const GrayLine = styled.hr`
  border: none;
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.gray0};
  margin: 20px 0;
`;

const CloseButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const CloseButton = styled.button`
  width: 100%;
  height: 56px;
  background-color: #000000;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
`;
