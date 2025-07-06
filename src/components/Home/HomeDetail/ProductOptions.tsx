import React from 'react';
import styled from 'styled-components';
import Theme from '../../../styles/Theme';
import { CustomSelect } from '../../CustomSelect';

export interface ProductOptionsProps {
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  sizeOptions: string[];
  colorOptions: string[];
}

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
        <CustomSelect
          value={selectedSize}
          onChange={(e) => setSelectedSize(e.target.value)}
        >
          <option value=''>사이즈 선택</option>
          {sizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </CustomSelect>
        <CustomSelect
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
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
    height: 57px;
    border-radius: 4px;
    border: 1px solid ${Theme.colors.black};
    background-color: ${Theme.colors.white};
    font-size: 16px;
    color: ${Theme.colors.black};
    margin-right: 8px;

    &:last-child {
      margin-right: 0;
    }
  }
`;
