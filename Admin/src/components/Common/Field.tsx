import React from 'react';
import styled from 'styled-components';

interface FieldProps {
  label: string;
  children: React.ReactNode;
  optional?: boolean;
  description?: string;
  error?: string;
  style?: React.CSSProperties;
}

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
