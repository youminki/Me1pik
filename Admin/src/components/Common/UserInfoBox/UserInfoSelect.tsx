import styled from 'styled-components';
/**
 * 사용자 정보 선택 필드(UserInfoSelect)
 *
 * - 사용자 정보를 선택할 수 있는 드롭다운 컴포넌트
 * - 공통 스타일링, 옵션 스타일링 등 지원
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

/**
 * 사용자 정보 선택 필드 스타일드 컴포넌트
 * - 테두리, 배경, 옵션 스타일링 등
 */
