// src/components/productregister/SizeSettingSection.tsx
import React from 'react';
import styled from 'styled-components';

const SizeSettingSection: React.FC = () => {
  return (
    <SectionBox>
      <SectionHeader>
        <Bullet />
        <SectionTitle>종류 및 사이즈 설정</SectionTitle>
      </SectionHeader>
      <VerticalLine />
      <InputRow>
        <Label>종류</Label>
        <Select defaultValue="원피스">
          <option value="원피스">원피스</option>
          <option value="블라우스">블라우스</option>
          <option value="팬츠">팬츠</option>
          <option value="스커트">스커트</option>
        </Select>
      </InputRow>
      <InputRow>
        <Label>사이즈</Label>
        <SizeCheckGroup>
          <SizeCheckboxLabel>
            <SizeCheckbox type="checkbox" value="44" />
            44
          </SizeCheckboxLabel>
          <SizeCheckboxLabel>
            <SizeCheckbox type="checkbox" value="55" />
            55
          </SizeCheckboxLabel>
          <SizeCheckboxLabel>
            <SizeCheckbox type="checkbox" value="66" />
            66
          </SizeCheckboxLabel>
          <SizeCheckboxLabel>
            <SizeCheckbox type="checkbox" value="77" />
            77
          </SizeCheckboxLabel>
          <SizeCheckboxLabel>
            <SizeCheckbox type="checkbox" value="FREE" />
            FREE
          </SizeCheckboxLabel>
        </SizeCheckGroup>
      </InputRow>
      <InputRow>
        <Label>색상</Label>
        <Select defaultValue="CREAM">
          <option value="BLACK">BLACK</option>
          <option value="PINK">PINK</option>
          <option value="CREAM">CREAM</option>
          <option value="GRAY">GRAY</option>
        </Select>
      </InputRow>
    </SectionBox>
  );
};

export default SizeSettingSection;

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
  bottom: 50px;
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

const SizeCheckGroup = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const SizeCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;

  font-weight: 700;
  font-size: 12px;
  line-height: 13px;
  color: #000000;
`;

const SizeCheckbox = styled.input.attrs({ type: 'checkbox' })`
  appearance: none;
  border: 1px solid #ddd;
  margin-bottom: 5px;
  width: 20px;
  height: 20px;
  margin-right: 5px;
  cursor: pointer;
  position: relative;
  &:checked::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 10px;
    height: 5px;
    border-left: 3px solid orange;
    border-bottom: 3px solid orange;
    transform: rotate(-45deg);
  }
  &:focus {
    outline: none;
  }
`;
