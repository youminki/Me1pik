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
export const UserInfoInput = styled.input`
  border: 1px solid #ddd;
  border-radius: 0;
  background: #fff;
  margin-left: 0;
  ${inputBoxCommon}
  flex: 1 1 0;
  min-width: 0;
  position: relative;
  z-index: 1;
  background-clip: padding-box;
`;
