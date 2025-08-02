import React from 'react';
import styled from 'styled-components';

/**
 * 필드 공통 컴포넌트(Field)
 *
 * - 라벨, 입력 요소, 설명, 에러 메시지 등을 포함하는 필드 컨테이너
 * - 선택적 필드 표시, 에러 상태, 설명 텍스트 등 다양한 기능 지원
 * - 재사용 가능한 공통 컴포넌트
 */

interface FieldProps {
  label: string;
  children: React.ReactNode;
  optional?: boolean;
  description?: string;
  error?: string;
  style?: React.CSSProperties;
}

/**
 * 필드 props
 * - 라벨, 자식 요소, 선택적 여부, 설명, 에러 메시지 등
 */
const Field: React.FC<FieldProps> = ({ label, children, optional, description, error, style }) => (
  <FieldWrapper style={style}>
    <Label>
      {label}
      {optional && <Optional>(선택)</Optional>}
    </Label>
    <FieldContent>{children}</FieldContent>
    {description && <Description>{description}</Description>}
    {error && <ErrorText>{error}</ErrorText>}
  </FieldWrapper>
);

export default Field;

/**
 * 필드 컴포넌트
 * - 라벨, 입력 요소, 설명, 에러 메시지를 포함하는 필드 컨테이너
 */
const FieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`;
const Label = styled.label`
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 4px;
  color: #222;
`;
const Optional = styled.span`
  font-size: 11px;
  font-weight: 400;
  color: #aaa;
  margin-left: 6px;
`;
const FieldContent = styled.div`
  display: flex;
  align-items: center;
  min-height: 36px;
`;
const Description = styled.div`
  font-size: 11px;
  color: #888;
  margin-top: 2px;
`;
const ErrorText = styled.div`
  font-size: 11px;
  color: #e74c3c;
  margin-top: 2px;
`;

/**
 * 스타일드 컴포넌트들
 * - 필드 래퍼, 라벨, 선택 표시, 필드 내용, 설명, 에러 텍스트 등
 */
