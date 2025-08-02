// src/components/productregister/PriceSection.tsx
import React from 'react';
import styled from 'styled-components';

const PriceSection: React.FC = () => {
  return (
    <SectionBox>
      <SectionHeader>
        <Bullet />
        <SectionTitle>제품 가격</SectionTitle>
      </SectionHeader>
      <VerticalLine />
      <InputRow>
        <Label>리테일</Label>
        <Input />
      </InputRow>
      <InputRow>
        <Label>판매</Label>
        <Input />
      </InputRow>
      <InputRow>
        <Label>대여</Label>
        <Input />
      </InputRow>
    </SectionBox>
  );
};

export default PriceSection;

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
