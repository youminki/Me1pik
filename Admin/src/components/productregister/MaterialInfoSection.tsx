/**
 * 제품 소재정보 섹션(MaterialInfoSection)
 *
 * - 제품의 두께감, 신축성, 안감, 촉감, 비침 등 소재 정보 관리
 * - 체크박스 기반 옵션 선택, 편집 가능/읽기 전용 모드 지원
 * - 부모 컴포넌트와 데이터 동기화 및 변경 콜백 제공
 */
// src/components/productregister/MaterialInfoSection.tsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ProductDetailResponse } from '@api/adminProduct';
import BulletIcon from '@assets/BulletIcon.svg';

/**
 * 제품 소재정보 섹션 props
 * - 제품 데이터, 변경 콜백, 편집 가능 여부 등
 */
interface MaterialInfoSectionProps {
  product: ProductDetailResponse;
  onChange?: (data: Partial<ProductDetailResponse>) => void;
  editable?: boolean;
  style?: React.CSSProperties;
}

/**
 * 선택된 옵션 인터페이스
 * - 두께감, 신축성, 안감, 촉감, 비침 등 소재 속성
 */
interface SelectedOptions {
  thickness: string;
  elasticity: string;
  lining: string;
  fit: string;
  transparency: string;
}

/**
 * 소재 옵션 정의
 * - 각 속성별 라벨과 옵션 값들
 */
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

/**
 * 제품 소재정보 섹션 컴포넌트
 * - 제품의 소재 정보를 체크박스 형태로 표시하고 관리
 * - 편집 가능/읽기 전용 모드 지원, 부모와 데이터 동기화
 */
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

  /**
   * 체크박스 변경 핸들러
   * - 옵션 선택 시 상태 업데이트 및 부모에게 변경 알림
   */
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
