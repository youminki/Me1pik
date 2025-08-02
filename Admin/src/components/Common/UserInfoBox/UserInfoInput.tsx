import styled from 'styled-components';
/**
 * 사용자 정보 입력 필드(UserInfoInput)
 *
 * - 사용자 정보를 입력받는 텍스트 필드 컴포넌트
 * - 공통 스타일링, 반응형 레이아웃 등 지원
 * - 재사용 가능한 공통 컴포넌트
 */
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
/**
 * 입력 필드 공통 스타일
 * - 크기, 폰트, 패딩, 정렬 등 기본 스타일링
 */
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

/**
 * 사용자 정보 입력 필드 스타일드 컴포넌트
 * - 테두리, 배경, 레이아웃 등 스타일링
 */
