import styled from 'styled-components';
const inputBoxCommon = `
  width: 100%;
  height: 40px;
  font-size: 13px;
  font-weight: 500;
  padding: 8px 10px;
  line-height: 1.5;
  box-sizing: border-box;
  vertical-align: middle;
`;
export const UserInfoSelect = styled.select`
  border: 1px solid #000;
  border-radius: 0;
  background: #fff;
  margin-left: 0;
  flex: 1;
  padding-left: 0;
  color: #000;
  ${inputBoxCommon}

  option {
    color: #000;
    background: #fff;
  }
`;
