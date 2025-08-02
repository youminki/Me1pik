import styled from 'styled-components';

/**
 * 사용자 정보 라벨(UserInfoLabel)
 *
 * - 사용자 정보 필드의 라벨을 표시하는 컴포넌트
 * - 고정 너비, 폰트 스타일, 정렬 등 기본 스타일링 제공
 * - 재사용 가능한 공통 컴포넌트
 */
export const UserInfoLabel = styled.div`
  font-weight: 900;
  font-size: 12px;
  width: 60px;
  min-width: 60px;
  max-width: 60px;
  text-align: left;
  color: #333;
  padding-right: 2px;
  display: flex;
  align-items: center;

  /**
   * 사용자 정보 라벨 스타일드 컴포넌트
   * - 폰트, 크기, 정렬, 색상 등 스타일링
   */
`;
