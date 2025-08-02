/**
 * 정산 동의 섹션 컴포넌트 (SettlementAgreementSection.tsx)
 *
 * 정산 처리에 대한 동의를 받는 UI 컴포넌트입니다.
 * 전체 동의, 개별 동의 체크박스, 정산계좌 확인, 상세 모달을 포함합니다.
 *
 * @description
 * - 전체 동의/해제 기능
 * - 개별 동의 체크박스 관리
 * - 정산계좌 정보 표시
 * - 상세 내용 모달 연동
 * - 필수 항목 표시
 */
import React, { useState } from 'react';
import styled from 'styled-components';

import ReusableModal from '@/components/shared/modals/ReusableModal';

/**
 * 정산 동의 섹션 Props
 *
 * 현재는 빈 객체이지만 향후 확장 가능
 */
type AgreementSectionProps = Record<string, never>;

/**
 * 개별 동의 체크박스 상태 인터페이스
 *
 * @property agree1 - 정산에 따른 동의 체크 상태
 * @property agree2 - 정산계좌 확인 체크 상태
 */
interface IndividualChecks {
  agree1: boolean;
  agree2: boolean;
}

/**
 * 정산 동의 섹션 컴포넌트
 *

 * 정산 처리에 대한 동의를 받는 UI를 렌더링합니다.
 * 전체 동의, 개별 동의, 정산계좌 확인 기능을 제공합니다.
 *
 * @returns 정산 동의 섹션 JSX 요소
 */
const AgreementSection: React.FC<AgreementSectionProps> = () => {
  const [allChecked, setAllChecked] = useState(false);
  const [individualChecks, setIndividualChecks] = useState<IndividualChecks>({
    agree1: false,
    agree2: false,
  });

  const [modalVisible, setModalVisible] = useState(false);

  /**
   * 전체 동의/해제 핸들러
   *
   * 전체 동의 체크박스 클릭 시 모든 개별 체크박스를 동일하게 설정합니다.
   */
  const handleAllChecked = () => {
    const newValue = !allChecked;
    setAllChecked(newValue);
    setIndividualChecks({
      agree1: newValue,
      agree2: newValue,
    });
  };

  /**
   * 개별 체크박스 핸들러
   *
   * 개별 체크박스 클릭 시 해당 항목의 상태를 변경합니다.
   */
  const handleIndividualCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    setIndividualChecks((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  /**
   * 상세 내용 보기 핸들러
   *

   * '전체보기' 버튼 클릭 시 모달을 엽니다.
   */
  const handleViewDetails = () => {
    setModalVisible(true);
  };

  /**
   * 모달 닫기 핸들러
   *

   * 모달을 닫습니다.
   */
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

/**
 * 동의 섹션 전체 래퍼
 *

 * 정산 동의 섹션 전체를 감싸는 컨테이너입니다.
 */
const AgreementWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  margin-bottom: 20px;
  width: 100%;
`;

/**
 * 전체 동의 래퍼
 *

 * 전체 동의 체크박스와 라벨을 감싸는 컨테이너입니다.
 */
const AllAgreeWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

/**
 * 체크박스 래퍼
 *

 * 개별 체크박스와 라벨을 감싸는 컨테이너입니다.
 */
const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

/**
 * 콘텐츠 컨테이너
 *

 * 개별 동의 항목들을 감싸는 컨테이너입니다.
 * 배경색과 테두리를 적용합니다.
 */
const ContentContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.lightgray};
  border: 1px solid ${({ theme }) => theme.colors.gray0};
  padding: 20px;
`;

/**
 * 입력 래퍼
 *

 * 설명 텍스트와 '전체보기' 버튼을 감싸는 컨테이너입니다.
 */
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

/**
 * 체크박스 스타일
 *

 * 커스텀 스타일이 적용된 체크박스입니다.
 * 체크 시 오렌지색 체크마크를 표시합니다.
 */
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

/**
 * 라벨 텍스트
 *

 * 체크박스와 연결된 라벨 텍스트입니다.
 */
const Label = styled.label`
  font-weight: 700;
  font-size: 12px;
  line-height: 13px;

  color: #000000;
`;

/**
 * 필수 표시 텍스트
 *

 * 필수 항목임을 나타내는 텍스트입니다.
 */
const RequiredText = styled.span`
  color: ${({ theme }) => theme.colors.gray2};
`;

/**
 * 상세보기 버튼
 *

 * '전체보기' 버튼입니다.
 * 클릭 시 상세 내용 모달을 엽니다.
 */
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

/**
 * 설명 래퍼
 *

 * 설명 텍스트를 감싸는 컨테이너입니다.
 */
const DescriptionWrapper = styled.div`
  display: flex;
  justify-content: left;
  align-items: center;
  flex-grow: 1;
`;

/**
 * 설명 텍스트
 *

 * 동의 항목에 대한 설명 텍스트입니다.
 */
const Description = styled.p`
  color: ${({ theme }) => theme.colors.gray};
  margin: 0;

  font-weight: 700;
  font-size: 12px;
  line-height: 13px;
`;

/**
 * 읽기 전용 입력창
 *

 * 정산계좌 정보를 표시하는 읽기 전용 입력창입니다.
 */
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
