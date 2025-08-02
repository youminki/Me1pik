// 결제 방식 컴포넌트 - 즉시 결제 및 할부 옵션 선택 기능 제공
import React, { useState } from 'react';
import styled from 'styled-components';

import { theme } from '@/styles/Theme';

// 메인 결제 방식 컴포넌트
const PaymentMethod: React.FC = () => {
  // 선택된 결제 옵션 상태 관리
  const [selectedOption, setSelectedOption] = useState<string>('12');

  // 결제 옵션 클릭 핸들러
  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
  };

  return (
    <PaymentMethodContainer>
      <PaymentMethodText>결제방식 (선택)</PaymentMethodText>
      <InstallmentOptions>
        {/* 즉시 결제 옵션 */}
        <NowOptionWrapper onClick={() => handleOptionClick('NOW')}>
          <NowOption active={selectedOption === 'NOW'}>
            {selectedOption === 'NOW' && <Circle />}
            <OptionText>NOW</OptionText>
          </NowOption>
        </NowOptionWrapper>

        {/* 할부 옵션들 */}
        <OptionContainer>
          {['6', '12', '18', '24', '36'].map((option) => (
            <OptionWrapper
              key={option}
              onClick={() => handleOptionClick(option)}
            >
              <Option active={selectedOption === option}>
                {selectedOption === option && <Circle />}
                <OptionText>{option}</OptionText>
              </Option>
            </OptionWrapper>
          ))}
        </OptionContainer>
      </InstallmentOptions>
    </PaymentMethodContainer>
  );
};

export default PaymentMethod;

// 스타일 컴포넌트들
const PaymentMethodContainer = styled.div`
  margin-top: 54px;
  margin-bottom: 24px;
`;

const PaymentMethodText = styled.div`
  font-weight: 700;
  font-size: 12px;
  margin-bottom: 10px;
`;

const InstallmentOptions = styled.div`
  display: flex;
  align-items: center;
`;

const NowOptionWrapper = styled.div`
  margin-right: 10px;
  display: flex;
  align-items: center;
`;

const NowOption = styled.div<{ active: boolean }>`
  padding: 0px 20px;
  background-color: ${theme.colors.gray3};
  border: 1px solid ${theme.colors.gray1};
  font-weight: bold;
  text-align: center;
  cursor: pointer;
  border-radius: 50px;
  height: 30px;
  display: flex;
  align-items: center;
  position: relative;
`;

const OptionContainer = styled.div`
  display: flex;
  flex-grow: 1;
  background-color: ${theme.colors.gray3};
  border: 1px solid ${theme.colors.gray1};
  border-radius: 50px;
  height: 30px;
`;

const OptionWrapper = styled.div`
  flex: 1;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Option = styled.div<{ active: boolean }>`
  padding: 10px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  position: relative;
`;

const OptionText = styled.div`
  font-weight: 800;
  font-size: 14px;
  text-align: center;
  color: ${theme.colors.black};
  z-index: 1;
`;

const Circle = styled.div`
  position: absolute;
  width: 40px;
  height: 40px;
  border: 5px solid ${theme.colors.yellow};
  background-color: white;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;
