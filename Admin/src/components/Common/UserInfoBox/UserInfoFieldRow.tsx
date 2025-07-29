import styled from 'styled-components';
export const UserInfoFieldRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
  gap: 12px;
  flex-wrap: wrap;
  min-width: 0;
`;

export const UserInfoPair = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1 1 0; // 1:1 비율로 늘어남
  min-width: 0;
  gap: 15px;
`;

export const UserInfoLabel = styled.label`
  display: flex; // flex로!
  align-items: center; // 내부 텍스트도 중앙정렬
  justify-content: center; // 여러 열에서 중앙정렬
  width: auto;
  min-width: 50px;
  height: 40px; // input과 동일한 높이
  font-size: 13px;
  font-weight: 700;
  margin: 0;
  padding: 0;
  /* width: 60px; // 필요시 고정 */
`;

export const UserInfoInput = styled.input`
  flex: 1 1 0;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 8px 10px;
  height: 40px; // label과 동일하게!
  border: 1px solid #aaa;
`;
