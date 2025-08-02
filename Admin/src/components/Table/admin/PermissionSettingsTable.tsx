import React, { useState } from 'react';
import styled from 'styled-components';

/**
 * 권한 설정 테이블(PermissionSettingsTable)
 *
 * - 관리자 권한 설정을 체크박스 형태로 렌더링
 * - 권한 그룹별로 체크박스 그룹화, 상태 관리 등 지원
 * - 실시간 권한 변경 및 상태 업데이트 기능
 * - 재사용 가능한 공통 컴포넌트
 */

interface PermissionItem {
  label: string;
  checked: boolean;
}

/**
 * 권한 아이템 인터페이스
 * - 개별 권한에 대한 라벨과 체크 상태
 */
export interface PermissionGroup {
  category: string;
  permissions: PermissionItem[];
}

/**
 * 권한 설정 테이블 props
 * - 권한 그룹 데이터 등
 */
interface PermissionSettingsTableProps {
  data: PermissionGroup[];
}

/**
 * 권한 설정 테이블 컴포넌트
 * - 권한 설정을 체크박스 형태로 표시
 */
const PermissionSettingsTable: React.FC<PermissionSettingsTableProps> = ({ data }) => {
  const [permissionState, setPermissionState] = useState<PermissionGroup[]>(data);

  /**
   * 체크박스 상태 변경 핸들러
   * - 체크박스 클릭 시 해당 권한의 상태를 토글
   */
  const handleCheckboxChange = (groupIdx: number, permIdx: number) => {
    const newState = [...permissionState];
    newState[groupIdx].permissions[permIdx].checked =
      !newState[groupIdx].permissions[permIdx].checked;
    setPermissionState(newState);
  };

  return (
    <SectionBox>
      <ContentWrapper>
        <SectionHeader>
          <Bullet />
          <SectionTitle>관리자 권한설정</SectionTitle>
        </SectionHeader>
        <VerticalLine />
        <Column>
          {permissionState.map((group, idx) => (
            <CheckGroupRow key={idx}>
              <Label>{group.category}</Label>
              <SizeCheckGroup>
                {group.permissions.map((perm, permIdx) => (
                  <SizeCheckboxLabel key={permIdx}>
                    <SizeCheckbox
                      type="checkbox"
                      checked={perm.checked}
                      onChange={() => handleCheckboxChange(idx, permIdx)}
                    />
                    {perm.label}
                  </SizeCheckboxLabel>
                ))}
              </SizeCheckGroup>
            </CheckGroupRow>
          ))}
        </Column>
      </ContentWrapper>
    </SectionBox>
  );
};

export default PermissionSettingsTable;

/**
 * 섹션 박스 스타일드 컴포넌트
 * - 권한 설정 섹션의 컨테이너 스타일링
 */
const SectionBox = styled.div`
  position: relative;
  width: 100%;
  overflow-x: auto;
  border: 1px solid #dddddd;
  border-radius: 4px;
  min-width: 1000px;

  /* ❌ padding 없음 */
`;

const ContentWrapper = styled.div`
  position: relative;
  padding: 43px 50px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  margin-bottom: 10px;
`;

const Bullet = styled.div`
  position: absolute;
  left: -27px;
  top: 0;
  width: 14px;
  height: 14px;
  border: 1px solid #dddddd;
  border-radius: 50%;
  background: #fff;

  &::after {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    width: 6px;
    height: 6px;
    background: #f6ae24;
    border-radius: 50%;
  }
`;

const SectionTitle = styled.div`
  font-weight: 800;
  font-size: 14px;
  margin-left: 10px;
`;

const VerticalLine = styled.div`
  position: absolute;
  left: 27px;
  top: 43px;
  bottom: 43px;
  width: 1px;
  background: #dddddd;
`;

const Column = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const CheckGroupRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const Label = styled.label`
  position: relative;
  min-width: 60px;

  font-weight: 900;
  font-size: 12px;
  margin-right: 10px;
  padding-left: 10px;

  &::before {
    content: '';
    position: absolute;
    left: -20px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 1px;
    background: #dddddd;
  }
`;

const SizeCheckGroup = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const SizeCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  min-width: 100px;

  font-weight: 700;
  font-size: 12px;
  color: #000;
`;

const SizeCheckbox = styled.input.attrs({ type: 'checkbox' })`
  appearance: none;
  border: 1px solid #ddd;
  width: 20px;
  height: 20px;
  margin-right: 5px;
  margin-bottom: 5px;
  position: relative;
  cursor: pointer;

  &:checked::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 10px;
    height: 5px;
    border-left: 3px solid orange;
    border-bottom: 3px solid orange;
    transform: rotate(-45deg);
  }

  &:focus {
    outline: none;
  }
`;
