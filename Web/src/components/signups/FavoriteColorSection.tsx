import React from 'react';
import styled from 'styled-components';

interface FavoriteColorSectionProps {
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const FavoriteColorSection: React.FC<FavoriteColorSectionProps> = ({
  onChange,
}) => (
  <>
    <Label htmlFor='favoriteColorSeq'>좋아하는 색상을 선택하세요</Label>
    <Select
      name='favoriteColorSeq'
      id='favoriteColorSeq'
      onChange={onChange}
      required
      defaultValue=''
    >
      <option value='' disabled>
        좋아하는 색상을 선택하세요
      </option>
      {colorOptions.map(({ value, label, backgroundColor, textColor }) => (
        <option
          key={value}
          value={value}
          style={{ backgroundColor, color: textColor }}
        >
          {label}
        </option>
      ))}
    </Select>
  </>
);

const colorOptions = [
  { value: '1', label: 'Black', backgroundColor: 'black', textColor: 'white' },
  { value: '2', label: 'White', backgroundColor: 'white', textColor: 'black' },
  { value: '3', label: 'Pink', backgroundColor: 'pink', textColor: 'black' },
  { value: '4', label: 'Navy', backgroundColor: 'navy', textColor: 'white' },
  { value: '5', label: 'Green', backgroundColor: 'green', textColor: 'white' },
  { value: '6', label: 'Blue', backgroundColor: 'blue', textColor: 'white' },
  { value: '7', label: 'Cream', backgroundColor: 'cream', textColor: 'black' },
  {
    value: '8',
    label: 'Yellow',
    backgroundColor: 'yellow',
    textColor: 'black',
  },
  { value: '9', label: 'Lilac', backgroundColor: 'lilac', textColor: 'black' },
  { value: '10', label: 'Ivory', backgroundColor: 'ivory', textColor: 'black' },
  { value: '11', label: 'Olive', backgroundColor: 'olive', textColor: 'white' },
  {
    value: '12',
    label: 'Orange',
    backgroundColor: 'orange',
    textColor: 'black',
  },
  { value: '13', label: 'Mint', backgroundColor: 'mint', textColor: 'black' },
  { value: '14', label: 'Grey', backgroundColor: 'grey', textColor: 'black' },
  { value: '15', label: 'Camel', backgroundColor: 'camel', textColor: 'black' },
  { value: '16', label: 'Beige', backgroundColor: 'beige', textColor: 'black' },
  { value: '17', label: 'Red', backgroundColor: 'red', textColor: 'white' },
  {
    value: '18',
    label: 'Sky Blue',
    backgroundColor: 'skyblue',
    textColor: 'black',
  },
  {
    value: '19',
    label: 'Purple',
    backgroundColor: 'purple',
    textColor: 'white',
  },
  { value: '20', label: 'Nude', backgroundColor: 'nude', textColor: 'black' },
  { value: '21', label: 'Khaki', backgroundColor: 'khaki', textColor: 'black' },
  { value: '22', label: 'Wine', backgroundColor: 'wine', textColor: 'white' },
  { value: '23', label: 'Brown', backgroundColor: 'brown', textColor: 'white' },
  {
    value: '24',
    label: 'Charcoal',
    backgroundColor: 'charcoal',
    textColor: 'white',
  },
];

export default FavoriteColorSection;

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
  width: 25vw;
  border: 1px solid ${({ theme }) => theme.colors.gray};
  border-radius: 4px;
`;
