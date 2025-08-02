/**
 * 사용자 정보 아이콘 박스(UserInfoIconBox)
 *
 * - 사용자 프로필 이미지나 아이콘을 표시하는 원형 컨테이너
 * - 고정 크기(80px), 중앙 정렬, 테두리 등 스타일링 제공
 * - 재사용 가능한 공통 컴포넌트
 */
import styled from 'styled-components';
export const UserInfoIconBox = styled.div`
  width: 80px;
  height: 80px;
  min-width: 80px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 50%;
  border: 1px solid #ddd;
  margin-top: 4px;
  margin-right: 10px;
`;
