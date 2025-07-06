import styled from 'styled-components';

export const CustomSelect = styled.select`
  font-size: 16px;
  border: 1px solid #000000;
  border-radius: 4px;
  height: 57px;
  width: 100%;
  padding: 0 40px 0 16px;

  font-weight: 800;
  font-size: 13px;
  line-height: 14px;
  color: #000000;
  appearance: none;
  background: url('/SelectIcon.svg') no-repeat right 16px center/15px 16px;
  &:focus {
    outline: none;
    border-color: #000000;
  }
`;
