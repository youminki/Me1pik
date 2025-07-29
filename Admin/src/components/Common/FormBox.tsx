import React from 'react';
import styled from 'styled-components';

export const FormBox: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <SectionBox>
    <SectionHeader>
      <Bullet />
      <SectionTitle>{title}</SectionTitle>
    </SectionHeader>
    <VerticalLine />
    {children}
  </SectionBox>
);

export const FormRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <InputRow>{children}</InputRow>
);

export const FormLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Label>{children}</Label>
);

export const FormInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => <Input ref={ref} {...props} />);

export const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <Select {...props} />
);

// 스타일 컴포넌트
const SectionBox = styled.div`
  position: relative;
  margin-bottom: 20px;
  padding-left: 20px;
`;
const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  margin-bottom: 10px;
`;
const Bullet = styled.div`
  position: absolute;
  left: -27px;
  top: 0;
  width: 14px;
  height: 14px;
  border: 1px solid #dddddd;
  border-radius: 50%;
  background: #fff;
  &::after {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    width: 6px;
    height: 6px;
    background: #f6ae24;
    border-radius: 50%;
  }
`;
const SectionTitle = styled.div`
  font-weight: 800;
  font-size: 14px;
  line-height: 15px;
  margin-left: 10px;
`;
const VerticalLine = styled.div`
  position: absolute;
  left: 0;
  top: 14px;
  bottom: 30px;
  width: 1px;
  background: #dddddd;
`;
const InputRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;
const Label = styled.label`
  position: relative;
  min-width: 40px;
  font-weight: 900;
  font-size: 12px;
  line-height: 13px;
  margin-right: 10px;
  padding-left: 10px;
  &::before {
    content: '';
    position: absolute;
    left: -20px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 1px;
    background: #dddddd;
  }
`;
const Select = styled.select`
  flex: 1;
  height: 40px;
  border: 1px solid #000;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 800;
  max-width: 180px;
`;
const Input = styled.input`
  flex: 1;
  height: 40px;
  max-width: 120px;
  border: 1px solid #ddd;
  padding: 0 8px;
  font-weight: 700;
  font-size: 12px;
  text-align: center;
`;
