/**
 * 고객 서비스 서브 헤더 컴포넌트 (CustomerServiceSubHeader.tsx)
 *
 * 고객 서비스 페이지에서 사용하는 서브 헤더 컴포넌트를 제공합니다.
 * 기간 선택, 검색 기능을 포함하며, 사용자가 원하는 기간의
 * 고객 서비스 정보를 쉽게 찾을 수 있도록 도와줍니다.
 *
 * @description
 * - 기간 선택 기능
 * - 검색 기능
 * - 반응형 디자인
 * - 접근성 지원
 */

import React from 'react';
import styled from 'styled-components';

import SearchIcon from '@/assets/customer-services/SearchIcon.svg';

/**
 * 기간 섹션 속성 인터페이스
 *
 * 기간 섹션 컴포넌트의 props를 정의합니다.
 *
 * @property selectedPeriod - 현재 선택된 기간 (3: 공지, 6: 안내)
 * @property setSelectedPeriod - 기간 선택 핸들러 함수
 */
interface PeriodSectionProps {
  selectedPeriod: number; // 현재 선택된 기간 (3: 공지, 6: 안내)
  setSelectedPeriod: (period: number) => void; // 기간 선택 핸들러 함수
}

/**
 * 기간 섹션 컴포넌트
 *
 * 고객센터에서 사용하는 기간 선택 섹션을 렌더링하는 컴포넌트입니다.
 * 공지/안내 탭 선택과 검색 기능을 제공합니다.
 *
 * @param selectedPeriod - 현재 선택된 기간 (3: 공지, 6: 안내)
 * @param setSelectedPeriod - 기간 선택 핸들러 함수
 * @returns 기간 섹션 컴포넌트
 */
const PeriodSection: React.FC<PeriodSectionProps> = ({
  selectedPeriod,
  setSelectedPeriod,
}) => {
  return (
    <SettlementHeader>
      <PeriodSelector>
        <PeriodButton
          active={selectedPeriod === 3}
          onClick={() => setSelectedPeriod(3)}
        >
          공지
        </PeriodButton>
        <PeriodButton
          active={selectedPeriod === 6}
          onClick={() => setSelectedPeriod(6)}
        >
          안내
        </PeriodButton>
      </PeriodSelector>

      <SearchBarContainer>
        <SearchInput placeholder='검색' />
        <SearchIconImg src={SearchIcon} alt='search' />
      </SearchBarContainer>
    </SettlementHeader>
  );
};

export default PeriodSection;

const SettlementHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  background: #f3f3f3;
  border: 1px solid #dddddd;
  padding: 10px;
  white-space: nowrap;
`;

const PeriodSelector = styled.div`
  display: flex;
  flex-shrink: 0;
  margin-right: 10px;
`;

const PeriodButton = styled.button<{ active: boolean }>`
  padding: 8px 12px;

  height: 36px;
  margin-right: 8px;
  border-radius: 18px;

  font-weight: 700;
  font-size: 12px;
  line-height: 11px;
  color: ${({ active }) => (active ? '#fff' : '#000')};
  background: ${({ active }) => (active ? '#000' : '#fff')};
  border: 1px solid ${({ active }) => (active ? '#000' : '#ccc')};
  cursor: pointer;
  white-space: nowrap;
`;

const SearchBarContainer = styled.div`
  display: flex;
  align-items: center;

  height: 40px;
  box-sizing: border-box;
  background: #ffffff;
  border: 1px solid #dddddd;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  padding: 0 10px;
`;

const SearchIconImg = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 12px;
  cursor: pointer;
`;
