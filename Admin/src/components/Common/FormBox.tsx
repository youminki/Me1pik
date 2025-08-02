import React from 'react';
import styled from 'styled-components';

/**
 * 폼 박스 공통 컴포넌트(FormBox)
 *
 * - 폼 섹션을 구성하는 컨테이너, 행, 라벨, 입력 요소 등
 * - 일관된 폼 레이아웃과 스타일링 제공
 * - 재사용 가능한 공통 컴포넌트
 */
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

/**
 * 폼 박스 컴포넌트
 * - 제목과 자식 요소를 포함하는 폼 섹션 컨테이너
 */
export const FormRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <InputRow>{children}</InputRow>
);

/**
 * 폼 라벨 컴포넌트
 * - 입력 요소의 라벨을 표시하는 컴포넌트
 */
export const FormLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Label>{children}</Label>
);

/**
 * 폼 입력 컴포넌트
 * - ref를 전달할 수 있는 입력 요소 컴포넌트
 */
export const FormInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => <Input ref={ref} {...props} />);

/**
 * 폼 셀렉트 컴포넌트
 * - 드롭다운 선택 요소 컴포넌트
 */
export const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <Select {...props} />
);

/**
 * 스타일드 컴포넌트들
 * - 섹션 박스, 헤더, 불릿, 수직선, 입력 행, 라벨, 입력, 셀렉트 등
 */
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
