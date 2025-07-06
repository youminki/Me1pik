import React, { useState } from 'react';
import styled from 'styled-components';
import ReusableModal from '../../ReusableModal';

type AgreementSectionProps = Record<string, never>;

type IndividualChecks = {
  agree1: boolean;
  agree2: boolean;
};

const AgreementSection: React.FC<AgreementSectionProps> = () => {
  const [allChecked, setAllChecked] = useState(false);
  const [individualChecks, setIndividualChecks] = useState<IndividualChecks>({
    agree1: false,
    agree2: false,
  });

  const [modalVisible, setModalVisible] = useState(false);

  const handleAllChecked = () => {
    const newValue = !allChecked;
    setAllChecked(newValue);
    setIndividualChecks({
      agree1: newValue,
      agree2: newValue,
    });
  };

  const handleIndividualCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    setIndividualChecks((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  const handleViewDetails = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <AgreementWrapper>
      <AllAgreeWrapper>
        <Checkbox
          type='checkbox'
          id='agreeAll'
          checked={allChecked}
          onChange={handleAllChecked}
        />
        <Label htmlFor='agreeAll'>전체동의</Label>
      </AllAgreeWrapper>

      <ContentContainer>
        <CheckboxWrapper>
          <Checkbox
            type='checkbox'
            id='agree1'
            checked={individualChecks.agree1}
            onChange={handleIndividualCheck}
          />
          <Label htmlFor='agree1'>
            정산에 따른 동의 <RequiredText>(필수)</RequiredText>
          </Label>
        </CheckboxWrapper>
        <InputWrapper>
          <DescriptionWrapper>
            <Description>이용 전 필수사항 및 주의사항 안내.</Description>
          </DescriptionWrapper>
          <ViewDetailsButton onClick={handleViewDetails}>
            전체보기
          </ViewDetailsButton>
        </InputWrapper>
        <CheckboxWrapper>
          <Checkbox
            type='checkbox'
            id='agree2'
            checked={individualChecks.agree2}
            onChange={handleIndividualCheck}
          />
          <Label htmlFor='agree2'>
            정산계좌 확인 <RequiredText>(필수)</RequiredText>
          </Label>
        </CheckboxWrapper>
        <ReadonlyInput value='234501-04-654122 (국민) - 홍길동' readOnly />
      </ContentContainer>

      <ReusableModal isOpen={modalVisible} onClose={closeModal} title='알림'>
        정산처리가 완료 되었습니다.
      </ReusableModal>
    </AgreementWrapper>
  );
};

export default AgreementSection;

const AgreementWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  margin-bottom: 20px;
  width: 100%;
`;

const AllAgreeWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
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
  position: relative;

  &:checked {
    background-color: ${({ theme }) => theme.colors.white};
    border-color: ${({ theme }) => theme.colors.gray1};
  }

  &:checked::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 10px;
    height: 5px;
    border-left: 3px solid orange;
    border-bottom: 3px solid orange;
    transform: rotate(-45deg);
  }

  &:focus {
    outline: none;
  }
`;

const Label = styled.label`
  font-weight: 700;
  font-size: 12px;
  line-height: 13px;

  color: #000000;
`;

const RequiredText = styled.span`
  color: ${({ theme }) => theme.colors.gray2};
`;

const ViewDetailsButton = styled.button`
  width: 71px;
  height: 34px;
  background-color: ${({ theme }) => theme.colors.black};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  cursor: pointer;
  font-size: 12px;
  border-radius: 5px;

  font-weight: 800;
  text-align: center;
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
const ReadonlyInput = styled.input`
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  background-color: #eee;
  border: 1px solid #ccc;
  font-size: 14px;

  font-weight: 700;
  font-size: 12px;
  line-height: 13px;

  color: #000000;
  cursor: not-allowed;
`;
