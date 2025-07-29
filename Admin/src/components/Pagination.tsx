// src/components/Pagination.tsx
import React from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';

// 활성화 아이콘
import FirstPageIcon from 'src/assets/PageNationIcon1.svg';
import PrevPageIcon from 'src/assets/PageNationIcon2.svg';
import NextPageIcon from 'src/assets/PageNationIcon3.svg';
import LastPageIcon from 'src/assets/PageNationIcon4.svg';

// 비활성화 아이콘
import FirstPageIconDisabled from 'src/assets/PageNationIcon1none.svg';
import PrevPageIconDisabled from 'src/assets/PageNationIcon2none.svg';
import NextPageIconDisabled from 'src/assets/PageNationIcon3none.svg';
import LastPageIconDisabled from 'src/assets/PageNationIcon4none.svg';

interface PaginationProps {
  /** 전체 페이지 수 */
  totalPages: number;
  /** 현재 페이지 (URL 쿼리가 기본, prop 주입 우선) */
  currentPage?: number;
  /** 페이지 변경 시 호출 (없으면 URL 쿼리 자동 변경) */
  onPageChange?: (newPage: number) => void;
  /** 좌측에 렌더링할 React 노드 (예: 등록 버튼) */
  leftComponent?: React.ReactNode;
}

const Pagination: React.FC<PaginationProps> = ({
  totalPages,
  currentPage,
  onPageChange,
  leftComponent,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const parsed = parseInt(searchParams.get('page') ?? '1', 10);
  const correctedTotal = totalPages < 1 ? 1 : totalPages;
  const page = Math.min(Math.max(currentPage ?? parsed, 1), correctedTotal);

  const changePage = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    } else {
      const params = Object.fromEntries(searchParams.entries());
      params['page'] = String(newPage);
      setSearchParams(params);
    }
  };

  const formatted = (n: number) => String(n).padStart(2, '0');

  return (
    <Wrapper>
      {leftComponent && <LeftSlot>{leftComponent}</LeftSlot>}
      <CenterSlot>
        <PageArrow disabled={page === 1} onClick={() => changePage(1)} aria-label="첫 페이지">
          <Icon src={page === 1 ? FirstPageIconDisabled : FirstPageIcon} alt="" />
        </PageArrow>
        <PageArrow
          disabled={page === 1}
          onClick={() => changePage(page - 1)}
          aria-label="이전 페이지"
        >
          <Icon src={page === 1 ? PrevPageIconDisabled : PrevPageIcon} alt="" />
        </PageArrow>

        <PageInfo>
          <CurrentPage>{formatted(page)}</CurrentPage>
          <Slash>/</Slash>
          <TotalPage>{formatted(correctedTotal)}</TotalPage>
        </PageInfo>

        <PageArrow
          disabled={page === correctedTotal}
          onClick={() => changePage(page + 1)}
          aria-label="다음 페이지"
        >
          <Icon src={page === correctedTotal ? NextPageIconDisabled : NextPageIcon} alt="" />
        </PageArrow>
        <PageArrow
          disabled={page === correctedTotal}
          onClick={() => changePage(correctedTotal)}
          aria-label="마지막 페이지"
        >
          <Icon src={page === correctedTotal ? LastPageIconDisabled : LastPageIcon} alt="" />
        </PageArrow>
      </CenterSlot>
    </Wrapper>
  );
};

export default Pagination;

/* ================= Styled Components ================= */

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: 40px;
`;

const LeftSlot = styled.div`
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
`;

const CenterSlot = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 27px;
`;

interface PageArrowProps {
  disabled: boolean;
}

const PageArrow = styled.button<PageArrowProps>`
  border: none;
  background: transparent;
  padding: 0;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
`;

const Icon = styled.img`
  width: 20px;
  height: 20px;
`;

const PageInfo = styled.div`
  display: flex;
  align-items: center;
`;

const CurrentPage = styled.span`
  font-size: 20px;
  font-weight: 800;
  color: #000;
`;

const Slash = styled.span`
  margin: 0 4px;
  font-size: 12px;
  font-weight: 400;
  color: #000;
`;

const TotalPage = styled.span`
  font-size: 12px;
  font-weight: 400;
  color: #000;
`;
