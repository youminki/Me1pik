import React, { useState } from 'react';
import styled from 'styled-components';

interface PermissionItem {
  label: string;
  checked: boolean;
}

export interface PermissionGroup {
  category: string;
  permissions: PermissionItem[];
}

interface PermissionSettingsTableProps {
  data: PermissionGroup[];
}

const PermissionSettingsTable: React.FC<PermissionSettingsTableProps> = ({ data }) => {
  const [permissionState, setPermissionState] = useState<PermissionGroup[]>(data);

  // 체크박스 상태 변경 핸들러
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
