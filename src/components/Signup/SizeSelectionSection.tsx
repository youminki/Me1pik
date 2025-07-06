import React from 'react';
import styled from 'styled-components';

interface SizeSelectionSectionProps {
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const SizeSelectionSection: React.FC<SizeSelectionSectionProps> = ({
  onChange,
}) => (
  <>
    <Label htmlFor='sizeOnePieceSeq'>평소 입는 원피스(사이즈)</Label>
    <Select
      name='sizeOnePieceSeq'
      id='sizeOnePieceSeq'
      onChange={onChange}
      required
      defaultValue=''
    >
      <option value='' disabled>
        사이즈를 선택하세요
      </option>
      <option value='201'>S (44)</option>
      <option value='202'>M (55)</option>
      <option value='203'>L (66)</option>
    </Select>

    <Label htmlFor='sizeJacketSeq'>평소 입는 정장(사이즈)</Label>
    <Select
      name='sizeJacketSeq'
      id='sizeJacketSeq'
      onChange={onChange}
      required
      defaultValue=''
    >
      <option value='' disabled>
        사이즈를 선택하세요
      </option>
      <option value='201'>S (44)</option>
      <option value='202'>M (55)</option>
      <option value='203'>L (66)</option>
    </Select>

    <Label htmlFor='sizeCoatSeq'>평소 입는 아우터(사이즈)</Label>
    <Select
      name='sizeCoatSeq'
      id='sizeCoatSeq'
      onChange={onChange}
      required
      defaultValue=''
    >
      <option value='' disabled>
        사이즈를 선택하세요
      </option>
      <option value='201'>S (44)</option>
      <option value='202'>M (55)</option>
      <option value='203'>L (66)</option>
    </Select>
  </>
);

export default SizeSelectionSection;

const Label = styled.label`
  font-size: 16px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.DarkBrown3};
  margin-bottom: 12px;
  text-align: left;
  letter-spacing: 1px;
`;

const Select = styled.select`
  margin-bottom: 20px;
  padding: 10px;
  font-size: 14px;
  width: 20vw;
  border: 1px solid ${({ theme }) => theme.colors.gray};
  border-radius: 4px;
`;
