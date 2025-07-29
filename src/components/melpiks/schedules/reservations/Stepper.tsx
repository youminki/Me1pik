import React from 'react';
import styled from 'styled-components';

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

const StepperContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

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

const StepLine = styled.div`
  width: 30px;
  height: 2px;
  background-color: ${(props) => props.theme.colors.gray3};
  align-self: center;
`;
