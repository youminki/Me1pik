// src/components/productregister/MaterialInfoSection.tsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ProductDetailResponse } from '@api/adminProduct';
import BulletIcon from '@assets/BulletIcon.svg';

interface MaterialInfoSectionProps {
  product: ProductDetailResponse;
  onChange?: (data: Partial<ProductDetailResponse>) => void;
  editable?: boolean;
  style?: React.CSSProperties;
}

// selectedOptions, onChange의 any 타입을 명확하게 지정
interface SelectedOptions {
  thickness: string;
  elasticity: string;
  lining: string;
  fit: string;
  transparency: string;
}

const materialOptions = [
  {
    key: 'thickness',
    label: '두께감',
    options: ['매우 두꺼움', '두꺼움', '적당', '얇음'],
  },
  {
    key: 'elasticity',
    label: '신축성',
    options: ['좋음', '약간있음', '없음', '허리밴딩'],
  },
  {
    key: 'lining',
    label: '안감',
    options: ['전체안감', '부분안감', '기모안감', '안감없음'],
  },
  {
    key: 'fit',
    label: '촉감',
    options: ['뻣뻣함', '까슬함', '적당', '부드러움'],
  },
  {
    key: 'transparency',
    label: '비침',
    options: ['비침있음', '약간있음', '적당', '비침없음'],
  },
];

const MaterialInfoSection: React.FC<MaterialInfoSectionProps> = ({
  product,
  onChange,
  editable = false,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({
    thickness: product.thickness || '적당',
    elasticity: product.elasticity || '없음',
    lining: product.lining || '기모안감',
    fit: (product as { fit?: string }).fit || '적당',
    transparency: product.transparency || '적당',
  });

  useEffect(() => {
    setSelectedOptions({
      thickness: product.thickness || '적당',
      elasticity: product.elasticity || '없음',
      lining: product.lining || '기모안감',
      fit: (product as { fit?: string }).fit || '적당',
      transparency: product.transparency || '적당',
    });
  }, [product]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editable) return;
    const { name, value } = e.target;
    if (selectedOptions[name as keyof SelectedOptions] === value) return;
    const newOptions = { ...selectedOptions, [name]: value };
    setSelectedOptions(newOptions);
    if (onChange) {
      onChange({ [name]: value });
    }
  };

  return (
    <SectionBox>
      <SectionHeader>
        <BulletIconImage src={BulletIcon} alt="bullet icon" />
        <SectionTitle>제품 소재정보</SectionTitle>
      </SectionHeader>
      <TableBox>
        <StyledTable>
          <tbody>
            {materialOptions.map((row) => (
              <tr key={row.key}>
                <Th>{row.label}</Th>
                {row.options.map((option) => (
                  <Td key={option}>
                    <CheckboxLabel>
                      <StyledCheckbox
                        type="checkbox"
                        name={row.key}
                        value={option}
                        checked={selectedOptions[row.key as keyof SelectedOptions] === option}
                        onChange={handleCheckboxChange}
                        disabled={!editable}
                      />
                      {option}
                    </CheckboxLabel>
                  </Td>
                ))}
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </TableBox>
    </SectionBox>
  );
};

export default MaterialInfoSection;

// styled-components 정의
const SectionBox = styled.div`
  position: relative;
  margin-bottom: 20px;
  max-width: 800px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const BulletIconImage = styled.img`
  width: 14px;
  height: 14px;
  margin-right: 8px;
`;

const SectionTitle = styled.div`
  font-weight: 800;
  font-size: 14px;
  line-height: 15px;
`;

const TableBox = styled.div`
  width: 100%;
  overflow-x: auto;
  margin-top: 10px;
`;

const StyledTable = styled.table`
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  min-width: 600px;
  background: #fff;
  border: 1px solid #ddd;

  overflow: hidden;

  tr:hover {
    background-color: #e3f2fd;
    cursor: pointer;
  }
`;

const Th = styled.th`
  background: #fafafa;
  font-weight: 900;
  font-size: 13px;
  text-align: center;
  padding: 16px 16px 16px 20px;
  border-right: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  min-width: 100px;
  width: 100px;
`;

const Td = styled.td`
  text-align: left;
  padding: 12px 8px 12px 20px;
  border-right: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  min-width: 110px;
  &:last-child {
    border-right: none;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  gap: 4px;
`;

const StyledCheckbox = styled.input.attrs({ type: 'checkbox' })`
  appearance: none;
  border: 1px solid #ddd;
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
