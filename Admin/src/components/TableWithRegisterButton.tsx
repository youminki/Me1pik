// src/components/TableWithRegisterButton.tsx
import React from 'react';
import styled from 'styled-components';
import RegisterButton from '@components/RegisterButton';
import Pagination from '@components/Pagination';

interface TableWithRegisterButtonProps {
  /** 테이블 컴포넌트 */
  children: React.ReactNode;
  /** 등록 버튼 텍스트 */
  registerButtonText: string;
  /** 등록 버튼 클릭 핸들러 */
  onRegisterClick: () => void;
  /** 페이지네이션 관련 props */
  paginationProps?: {
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
  };
  /** 등록 버튼 비활성화 여부 */
  registerButtonDisabled?: boolean;
  /** 추가 액션 버튼들 (삭제, 일괄변경 등) */
  actionButtons?: React.ReactNode;
}

const TableWithRegisterButton: React.FC<TableWithRegisterButtonProps> = ({
  children,
  registerButtonText,
  onRegisterClick,
  paginationProps,
  registerButtonDisabled = false,
  actionButtons,
}) => {
  return (
    <Container>
      {/* 테이블 영역 - 고정된 크기와 위치 */}
      <TableContainer>{children}</TableContainer>

      {/* 하단 액션 영역 - 등록 버튼, 액션 버튼들, 페이지네이션 */}
      <FooterRow>
        <LeftSection>
          <RegisterButton
            text={registerButtonText}
            onClick={onRegisterClick}
            disabled={registerButtonDisabled}
          />
          {actionButtons && <ActionButtonsContainer>{actionButtons}</ActionButtonsContainer>}
        </LeftSection>

        {paginationProps && (
          <Pagination
            totalPages={paginationProps.totalPages}
            currentPage={paginationProps.currentPage}
            onPageChange={paginationProps.onPageChange}
          />
        )}
      </FooterRow>
    </Container>
  );
};

export default TableWithRegisterButton;

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const TableContainer = styled.div`
  flex: 1;
  min-width: 834px;
  min-height: 600px;
  max-width: 100vw;
  overflow-x: auto;

  @media (max-width: 834px) {
    min-width: 100vw;
    padding: 0 8px;
  }

  @media (max-height: 1194px) {
    min-height: 400px;
  }
`;

const FooterRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 0 10px;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
