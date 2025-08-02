/**
 * 제품 기본정보 섹션(BasicInfoSection)
 *
 * - 브랜드, 품번, 시즌 등 제품의 기본 정보 입력 폼
 * - 스타일드 컴포넌트로 일관된 UI 제공
 * - 재사용 가능한 공통 컴포넌트
 */

// src/components/productregister/BasicInfoSection.tsx
import React from 'react';
import styled from 'styled-components';

/**
 * 제품 기본정보 섹션 컴포넌트
 * - 브랜드, 품번, 시즌 등 기본 정보 입력 필드 제공
 */
const BasicInfoSection: React.FC = () => {
  return (
    <SectionBox>
      <SectionHeader>
        <Bullet />
        <SectionTitle>제품 기본정보</SectionTitle>
      </SectionHeader>
      <VerticalLine />
      <InputRow>
        <Label>브랜드</Label>
        <Select defaultValue="MICHAA">
          <option value="MICHAA">MICHAA</option>
          <option value="CC Collect">CC Collect</option>
          <option value="SATIN">SATIN</option>
          <option value="ZZOC">ZZOC</option>
        </Select>
      </InputRow>
      <InputRow>
        <Label>품번</Label>
        <Input placeholder="예) MIOCWOP011" />
      </InputRow>
      <InputRow>
        <Label>시즌</Label>
        <Select defaultValue="2025년 봄 시즌">
          <option value="2025년 봄 시즌">2025년 봄 시즌</option>
          <option value="2024년 가을 시즌">2024년 가을 시즌</option>
        </Select>
      </InputRow>
    </SectionBox>
  );
};

export default BasicInfoSection;

/**
 * 스타일드 컴포넌트들
 * - 섹션 박스, 헤더, 불릿, 수직선, 입력 행, 라벨 등
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
