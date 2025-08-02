/**
 * 단계 진행 표시기 컴포넌트 (Stepper.tsx)
 *
 * 예약 스케줄에서 현재 진행 단계를 시각적으로 표시하는 컴포넌트입니다.
 * 3단계 진행 과정을 원형 아이콘과 연결선으로 표현합니다.
 *
 * @description
 * - 3단계 진행 표시
 * - 완료된 단계 하이라이트
 * - 단계 간 연결선
 * - 반응형 디자인
 */
import React from 'react';
import styled from 'styled-components';

/**
 * 단계 진행 표시기 컴포넌트
 *

 * 예약 스케줄에서 현재 진행 단계를 시각적으로 표시합니다.
 * 3단계 진행 과정을 원형 아이콘과 연결선으로 표현합니다.
 *
 * @param currentStep - 현재 진행 단계 (1-3)
 * @returns 단계 진행 표시기 JSX 요소
 */
const Stepper: React.FC<{ currentStep: number }> = ({ currentStep }) => {
  return (
    <StepperContainer>
      <Step $completed={currentStep >= 1}>1</Step>
      <StepLine />
      <Step $completed={currentStep >= 2}>2</Step>
      <StepLine />
      <Step $completed={currentStep >= 3}>3</Step>
    </StepperContainer>
  );
};

export default Stepper;

/**
 * 스테퍼 컨테이너
 *

 * 단계 진행 표시기 전체를 감싸는 컨테이너입니다.
 * 중앙 정렬과 하단 마진을 제공합니다.
 */
const StepperContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

/**
 * 단계 아이콘
 *

 * 개별 단계를 나타내는 원형 아이콘입니다.
 * 완료된 단계는 노란색, 미완료 단계는 회색으로 표시됩니다.
 *
 * @param $completed - 완료 여부
 */
const Step = styled.div<{ $completed: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${(props) =>
    props.$completed ? props.theme.colors.yellow : props.theme.colors.gray2};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: bold;
  margin: 0 5px;
`;

/**
 * 단계 연결선
 *

 * 단계 간을 연결하는 수평선입니다.
 * 회색으로 표시되어 단계 간 구분을 제공합니다.
 */
const StepLine = styled.div`
  width: 30px;
  height: 2px;
  background-color: ${(props) => props.theme.colors.gray3};
  align-self: center;
`;
