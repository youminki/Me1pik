import styled from 'styled-components';

/**
 * 사용자 정보 필드들(UserInfoFields)
 *
 * - 사용자 정보 입력 필드들을 세로로 배치하는 컨테이너
 * - flex 레이아웃, 간격 등 기본 스타일링 제공
 * - 재사용 가능한 공통 컴포넌트
 */
export const UserInfoFields = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

/**
 * 사용자 정보 필드들 스타일드 컴포넌트
 * - 세로 배치, 간격, 전체 너비 등 스타일링
 */
