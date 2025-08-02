// 제품 옵션 컴포넌트 - 사이즈 및 색상 선택 기능 제공
import React from 'react';
import styled from 'styled-components';

import { CustomSelect } from '@/components/shared/forms/CustomSelect';
import { theme } from '@/styles/Theme';

// 제품 옵션 Props 인터페이스
export interface ProductOptionsProps {
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  sizeOptions: string[];
  colorOptions: string[];
}

// 메인 제품 옵션 컴포넌트
const ProductOptions: React.FC<ProductOptionsProps> = ({
  selectedSize,
  setSelectedSize,
  selectedColor,
  setSelectedColor,
  sizeOptions,
  colorOptions,
}) => {
  return (
    <OptionsContainer>
      <label>제품옵션 (선택)</label>
      <OptionsWrapper>
        {/* 사이즈 선택 드롭다운 */}
        <CustomSelect
          value={selectedSize}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setSelectedSize(e.target.value)
          }
        >
          <option value=''>사이즈 선택</option>
          {sizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </CustomSelect>

        {/* 색상 선택 드롭다운 */}
        <CustomSelect
          value={selectedColor}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setSelectedColor(e.target.value)
          }
        >
          <option value=''>색상 선택</option>
          {colorOptions.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </CustomSelect>
      </OptionsWrapper>
    </OptionsContainer>
  );
};

export default ProductOptions;

// 스타일 컴포넌트들
const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;

  label {
    font-weight: 700;
    font-size: 12px;
    margin-bottom: 10px;
    display: block;
  }
`;

const OptionsWrapper = styled.div`
  display: flex;
  justify-content: space-between;

  select {
    flex: 1;
    padding: 8px;
    box-sizing: border-box;
    width: 100%;
    height: 51px;

    border: 1px solid ${theme.colors.black};
    background-color: ${theme.colors.white};
    font-size: 14px;
    padding: 0 15px;
    font-weight: 700;
    color: ${theme.colors.black};
    margin-right: 8px;

    &:last-child {
      margin-right: 0;
    }
  }
`;
