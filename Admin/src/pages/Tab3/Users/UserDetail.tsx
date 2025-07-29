// src/pages/Tab3/Users/UserDetail.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams, useParams, useLocation } from 'react-router-dom';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ko } from 'date-fns/locale';
import { format } from 'date-fns';
import Holidays from 'date-holidays';
import 'react-datepicker/dist/react-datepicker.css';
// import UserDetailTopBoxes from '../../../components/UserDetailTopBoxes'; // 제거
import UserInfoIcon1 from '@assets/UserDetail/UserInfoIcon1.svg';
import UserInfoIcon2 from '@assets/UserDetail/UserInfoIcon2.svg';
import UserInfoIcon3 from '@assets/UserDetail/UserInfoIcon3.svg';
import UserInfoIcon4 from '@assets/UserDetail/UserInfoIcon4.svg';
import UserInfoIcon5 from '@assets/UserDetail/UserInfoIcon5.svg';
import UserInfoIcon6 from '@assets/UserDetail/UserInfoIcon6.svg';
import UserInfoIcon7 from '@assets/UserDetail/UserInfoIcon7.svg';

import { IoArrowBackOutline, IoArrowForwardOutline } from 'react-icons/io5';
import { getUserByEmail, UserDetail as UserDetailModel } from '@api/adminUser';
import {
  UserInfoContainer,
  UserInfoGroup,
  UserInfoIconBox,
  UserInfoFields,
  UserInfoFieldRow,
  UserInfoPair,
  UserInfoLabel,
  UserInfoInput,
  UserInfoSelect,
  UserInfoDivider,
} from '@components/Common/UserInfoBox';

// 한글 로케일 등록
registerLocale('ko', ko);
// date-holidays 초기화 (KR 공휴일)
const hd = new Holidays('KR');

// 요일·공휴일 색 지정
const GlobalStyle = createGlobalStyle`
  .day-holiday { color: red !important; }
  .day-sunday  { color: red !important; }
  .day-saturday{ color: blue !important; }
`;

// 스켈레톤 애니메이션
const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

// 스켈레톤 컴포넌트들
const SkeletonBox = styled.div<{ width?: string; height?: string }>`
  width: ${(props) => props.width || '100%'};
  height: ${(props) => props.height || '40px'};
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 4px;
`;

const SkeletonInput = styled(SkeletonBox)`
  border-radius: 0;
`;

const SkeletonSelect = styled(SkeletonBox)`
  border-radius: 0;
`;

const SkeletonLabel = styled(SkeletonBox)`
  width: 60px;
  height: 16px;
  border-radius: 2px;
`;

const SkeletonIcon = styled(SkeletonBox)`
  width: 36px;
  height: 36px;
  border-radius: 50%;
`;

// 실제 필드 구조에 맞는 스켈레톤 컴포넌트들
const SkeletonUserInfoField = ({
  labelWidth = '60px',
  inputWidth = 'flex: 1',
}: {
  labelWidth?: string;
  inputWidth?: string;
}) => (
  <UserInfoFieldRow>
    <SkeletonLabel style={{ width: labelWidth, minWidth: labelWidth, maxWidth: labelWidth }} />
    <SkeletonInput
      style={{
        [inputWidth.includes('flex') ? 'flex' : 'width']: inputWidth,
        marginLeft: 20,
      }}
    />
  </UserInfoFieldRow>
);

const SkeletonUserInfoPair = () => (
  <UserInfoFieldRow>
    <UserInfoPair>
      <SkeletonLabel />
      <SkeletonSelect style={{ flex: 1 }} />
    </UserInfoPair>
    <UserInfoPair>
      <SkeletonLabel />
      <SkeletonSelect style={{ flex: 1 }} />
    </UserInfoPair>
  </UserInfoFieldRow>
);

// 실제 UserInfoBox 구조에 맞는 스켈레톤
const SkeletonUserInfoBox = () => (
  <UserInfoContainer>
    {/* 1. 기본정보 - 실제 구조와 동일 */}
    <UserInfoGroup>
      <UserInfoIconBox>
        <SkeletonIcon />
      </UserInfoIconBox>
      <UserInfoFields>
        <SkeletonUserInfoField labelWidth="60px" inputWidth="flex: 1" />
        <SkeletonUserInfoField labelWidth="60px" inputWidth="flex: 1" />
        <SkeletonUserInfoPair />
      </UserInfoFields>
    </UserInfoGroup>
    <UserInfoDivider />

    {/* 2. 생년/연락처 - 실제 구조와 동일 */}
    <UserInfoGroup>
      <UserInfoIconBox>
        <SkeletonIcon />
      </UserInfoIconBox>
      <UserInfoFields>
        <UserInfoFieldRow>
          <SkeletonLabel />
          <SkeletonInput style={{ width: 120 }} />
          <SkeletonLabel style={{ marginLeft: 16, minWidth: 80, width: '80px' }} />
        </UserInfoFieldRow>
        <SkeletonUserInfoField labelWidth="60px" inputWidth="flex: 1" />
      </UserInfoFields>
    </UserInfoGroup>
    <UserInfoDivider />

    {/* 3. 인스타/팔로워/팔로잉 - 실제 구조와 동일 */}
    <UserInfoGroup>
      <UserInfoIconBox>
        <SkeletonIcon />
      </UserInfoIconBox>
      <UserInfoFields>
        <SkeletonUserInfoField labelWidth="60px" inputWidth="flex: 1" />
        <SkeletonUserInfoPair />
      </UserInfoFields>
    </UserInfoGroup>
    <UserInfoDivider />

    {/* 4. 지역/URL - 실제 구조와 동일 */}
    <UserInfoGroup>
      <UserInfoIconBox>
        <SkeletonIcon />
      </UserInfoIconBox>
      <UserInfoFields>
        <SkeletonUserInfoPair />
        <UserInfoFieldRow>
          <SkeletonLabel />
          <SkeletonBox
            width="90px"
            height="40px"
            style={{
              fontWeight: 800,
              fontSize: 12,
              color: '#aaa',
              display: 'inline-block',
              lineHeight: '40px',
              height: 40,
              background: 'none',
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              paddingLeft: 10,
              paddingRight: 0,
            }}
          />
          <SkeletonInput style={{ width: 180, marginLeft: 0 }} />
        </UserInfoFieldRow>
      </UserInfoFields>
    </UserInfoGroup>
  </UserInfoContainer>
);

// 스켈레톤 탭 옵션 - 실제 UserInfoSelect와 동일한 스타일
const SkeletonTabOption = () => (
  <SkeletonBox
    width="160px"
    height="40px"
    style={{
      borderRadius: 0,
      border: '1px solid #000',
      minWidth: 120,
      maxWidth: 200,
      marginRight: 0,
      marginLeft: 20, // 실제 UserInfoSelect와 동일한 여백
      background: '#fff',
      fontSize: '13px',
      fontWeight: 500,
      padding: '8px 10px',
      lineHeight: '1.5',
      boxSizing: 'border-box',
      verticalAlign: 'middle',
      display: 'flex',
      alignItems: 'center',
    }}
  />
);

// 스켈레톤 카드 아이템
const SkeletonCardItem = () => (
  <div style={COMMON_STYLES.cardItem}>
    <div style={COMMON_STYLES.cardContent}>
      <div style={COMMON_STYLES.dateBox}>
        <SkeletonBox width="40px" height="16px" />
        <SkeletonBox width="40px" height="16px" style={{ marginTop: '4px' }} />
      </div>
      <div style={{ flex: 1 }}>
        <SkeletonUserInfoField />
        <SkeletonUserInfoField />
        <SkeletonUserInfoField />
      </div>
    </div>
  </div>
);

// --- 타입 정의 ---
interface LicenseHistoryItem {
  date: string;
  type: string;
  period: string;
  nextPayment: string;
}

interface UsageHistoryItem {
  date: string;
  status: string;
  period: string;
  product: string;
}

// 나이 계산 함수
const calculateAge = (birthYear: string): { age: number; koreanAge: number } => {
  // 빈 문자열이나 null 체크
  if (!birthYear || birthYear.trim() === '') {
    return { age: 0, koreanAge: 0 };
  }

  const currentYear = new Date().getFullYear();
  let birthYearNum: number;

  // 날짜 형식 (YYYY-MM-DD) 처리
  if (birthYear.includes('-')) {
    const dateParts = birthYear.split('-');
    if (dateParts.length >= 1) {
      birthYearNum = parseInt(dateParts[0], 10);
    } else {
      return { age: 0, koreanAge: 0 };
    }
  } else {
    // 기존 방식: 숫자만 추출 (한글, 특수문자 제거)
    const birthYearStr = birthYear.replace(/[^0-9]/g, '');

    // 4자리 숫자가 아닌 경우 처리
    if (birthYearStr.length !== 4) {
      return { age: 0, koreanAge: 0 };
    }

    birthYearNum = parseInt(birthYearStr, 10);
  }

  if (isNaN(birthYearNum) || birthYearNum < 1900 || birthYearNum > currentYear) {
    return { age: 0, koreanAge: 0 };
  }

  const age = currentYear - birthYearNum;
  const koreanAge = age + 1; // 한국식 나이 (만 나이 + 1)

  return { age, koreanAge };
};

// --- 상수 및 공통 스타일 ---
const COMMON_STYLES = {
  button: {
    border: '1px solid #000',
    background: '#fff',
    width: 40,
    height: 40,
    borderRadius: 4,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNumber: {
    fontWeight: 800,
    fontSize: 20,
    lineHeight: '22px',
    textAlign: 'center' as const,
    color: '#000',
  },
  pageDivider: {
    fontWeight: 400,
    fontSize: 12,
    color: '#DDDDDD',
    margin: '0 2px 2px 2px',
  },
  pageTotal: {
    fontWeight: 400,
    fontSize: 12,
    color: '#000',
    marginBottom: 2,
  },
  cardItem: {
    border: '1px solid #eee',
    borderRadius: 8,
    padding: '1rem',
    marginBottom: 16,
    background: '#fff',
  },
  cardContent: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 24,
  },
  dateBox: {
    minWidth: 60,
    textAlign: 'center' as const,
    color: '#222',
  },
  dateYear: {
    display: 'block',
    fontWeight: 900,
    fontSize: 16,
  },
  dateMonth: {
    display: 'block',
    fontWeight: 700,
    fontSize: 16,
  },
  infoLabel: {
    fontWeight: 700,
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontFamily: 'NanumSquare Neo OTF',
    fontWeight: 700,
    fontStyle: 'bold',
    fontSize: 12,
    lineHeight: '24px',
    letterSpacing: 0,
    color: '#000',
    marginLeft: 8,
  },
};

// --- 더미 데이터 ---
const dummyProducts = [{ no: 5 }];

// 더미 데이터 (11개)
const usageHistoryDummyList: UsageHistoryItem[] = [
  {
    date: '2025.06.10',
    status: '대여 (배송중)',
    period: '2025-06-16 ~ 2025-06-19',
    product: 'CC Collect / C224MSE231 / 미니 원피스 / 55(M) / 블랙',
  },
  {
    date: '2025.06.02',
    status: '대여 (반납완료)',
    period: '2025-06-09 ~ 2025-06-12',
    product: 'CC Collect / C224MSE231 / 팬츠 / 55(M) / 블랙',
  },
  {
    date: '2025.06.02',
    status: '대여 (반납완료)',
    period: '2025-06-09 ~ 2025-06-12',
    product: 'CC Collect / C224MSE231 / 블라우스 / 55(M) / 블랙',
  },
  {
    date: '2025.05.28',
    status: '구매 (배송완료)',
    period: '2025-05-30',
    product: 'CC Collect / C224MSE231 / 미니 원피스 / 55(M) / 블랙',
  },
  {
    date: '2025.05.20',
    status: '대여 (배송중)',
    period: '2025-05-25 ~ 2025-05-28',
    product: 'CC Collect / C224MSE231 / 미니 원피스 / 55(M) / 블랙',
  },
  {
    date: '2025.05.15',
    status: '대여 (반납완료)',
    period: '2025-05-18 ~ 2025-05-21',
    product: 'CC Collect / C224MSE231 / 팬츠 / 55(M) / 블랙',
  },
  {
    date: '2025.05.10',
    status: '대여 (반납완료)',
    period: '2025-05-12 ~ 2025-05-15',
    product: 'CC Collect / C224MSE231 / 블라우스 / 55(M) / 블랙',
  },
  {
    date: '2025.05.05',
    status: '구매 (배송완료)',
    period: '2025-05-07',
    product: 'CC Collect / C224MSE231 / 미니 원피스 / 55(M) / 블랙',
  },
  {
    date: '2025.04.28',
    status: '대여 (배송중)',
    period: '2025-05-01 ~ 2025-05-04',
    product: 'CC Collect / C224MSE231 / 미니 원피스 / 55(M) / 블랙',
  },
  {
    date: '2025.04.20',
    status: '대여 (반납완료)',
    period: '2025-04-22 ~ 2025-04-25',
    product: 'CC Collect / C224MSE231 / 팬츠 / 55(M) / 블랙',
  },
  {
    date: '2025.04.10',
    status: '대여 (반납완료)',
    period: '2025-04-12 ~ 2025-04-15',
    product: 'CC Collect / C224MSE231 / 블라우스 / 55(M) / 블랙',
  },
];

// 1. 더미 데이터 사용
const licenseHistoryDummyList: LicenseHistoryItem[] = [
  {
    date: '2025.06.10',
    type: '정기 구독권 (4회권)',
    period: '2025-06-10 ~ 2025-07-09',
    nextPayment: '2025-07-10',
  },
  {
    date: '2025.05.10',
    type: '정기 구독권 (4회권)',
    period: '2025-05-10 ~ 2025-06-09',
    nextPayment: '2025-06-10',
  },
  {
    date: '2025.05.01',
    type: '1회 이용권',
    period: '2025-05-01 ~ 2025-05-31',
    nextPayment: '-',
  },
  // ...더미 데이터 추가
];

// 공통 페이지네이션 컴포넌트
const PaginationControls = ({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <button
      onClick={onPrev}
      style={{
        ...COMMON_STYLES.button,
        marginRight: 32,
        cursor: page === 1 ? 'not-allowed' : 'pointer',
        opacity: page === 1 ? 0.5 : 1,
      }}
    >
      <IoArrowBackOutline size={24} />
    </button>
    <span style={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
      <span style={COMMON_STYLES.pageNumber}>{page}</span>
      <span style={COMMON_STYLES.pageDivider}>/</span>
      <span style={COMMON_STYLES.pageTotal}>{totalPages}</span>
    </span>
    <button
      onClick={onNext}
      style={{
        ...COMMON_STYLES.button,
        marginLeft: 32,
        cursor: page === totalPages ? 'not-allowed' : 'pointer',
        opacity: page === totalPages ? 0.5 : 1,
      }}
    >
      <IoArrowForwardOutline size={24} />
    </button>
  </div>
);

// 공통 카드 아이템 컴포넌트 (성능 최적화)
const CardItem = React.memo(({ date, children }: { date: string; children: React.ReactNode }) => (
  <div style={COMMON_STYLES.cardItem}>
    <div style={COMMON_STYLES.cardContent}>
      <div style={COMMON_STYLES.dateBox}>
        <span style={COMMON_STYLES.dateYear}>{date.split('.')[0]}</span>
        <span style={COMMON_STYLES.dateMonth}>
          {date.split('.')[1]}.{date.split('.')[2]}
        </span>
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  </div>
));

// 공통 페이지네이션 훅
const usePagination = <T extends { date: string }>(data: T[], pageSize: number) => {
  const [page, setPage] = useState(1);
  const total = data.length;
  const totalPages = Math.ceil(total / pageSize);
  const pagedList = data.slice((page - 1) * pageSize, page * pageSize);

  const handlePrev = () => setPage((p) => (p > 1 ? p - 1 : p));
  const handleNext = () => setPage((p) => (p < totalPages ? p + 1 : p));

  return {
    page,
    totalPages,
    pagedList,
    handlePrev,
    handleNext,
  };
};

// 에러 처리 훅
const useErrorHandler = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((error: Error) => {
    setError(error.message);
    console.error('Error occurred:', error);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { error, isLoading, setIsLoading, handleError, clearError };
};

// LicenseHistoryCardList 컴포넌트 내에서 AddButton 클릭 시 모달 오픈
const LicenseHistoryCardList = ({
  openModal,
  isLoading = false,
}: {
  openModal: () => void;
  isLoading?: boolean;
}) => {
  const { page, totalPages, pagedList, handlePrev, handleNext } = usePagination(
    licenseHistoryDummyList,
    3,
  );
  const total = licenseHistoryDummyList.length;

  if (isLoading) {
    return (
      <div style={{ width: '100%' }}>
        <UsageHistoryHeaderRow>
          <StyledTitleBox>
            이용권 내역{' '}
            <span style={{ fontWeight: 400, fontSize: 13, marginLeft: 8 }}>
              (0) - 최근 3개월 내
            </span>
          </StyledTitleBox>
          <PaginationControls page={1} totalPages={1} onPrev={() => {}} onNext={() => {}} />
        </UsageHistoryHeaderRow>
        {[1, 2, 3].map((idx) => (
          <SkeletonCardItem key={idx} />
        ))}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <SkeletonBox width="100px" height="40px" style={{ borderRadius: '4px' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <UsageHistoryHeaderRow>
        <StyledTitleBox>
          이용권 내역{' '}
          <span style={{ fontWeight: 400, fontSize: 13, marginLeft: 8 }}>
            ({total}) - 최근 3개월 내
          </span>
        </StyledTitleBox>
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </UsageHistoryHeaderRow>
      {pagedList.map((item, idx) => (
        <CardItem key={idx} date={item.date}>
          <div style={COMMON_STYLES.infoLabel}>
            종류
            <span style={COMMON_STYLES.infoValue}>{item.type}</span>
          </div>
          <div style={COMMON_STYLES.infoLabel}>
            이용기간
            <span style={COMMON_STYLES.infoValue}>{item.period}</span>
          </div>
          <div style={COMMON_STYLES.infoLabel}>
            다음결제
            <span style={COMMON_STYLES.infoValue}>{item.nextPayment}</span>
          </div>
        </CardItem>
      ))}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
        <AddButton onClick={openModal}>이용권 추가</AddButton>
      </div>
    </div>
  );
};

// 이용내역 카드형 리스트
const UsageHistoryCardList = ({ isLoading = false }: { isLoading?: boolean }) => {
  const { page, totalPages, pagedList, handlePrev, handleNext } = usePagination(
    usageHistoryDummyList,
    4,
  );
  const total = usageHistoryDummyList.length;

  if (isLoading) {
    return (
      <div style={{ width: '100%' }}>
        <UsageHistoryHeaderRow>
          <StyledTitleBox>
            이용내역{' '}
            <span style={{ fontWeight: 400, fontSize: 13, marginLeft: 8 }}>
              (0) - 최근 3개월 내
            </span>
          </StyledTitleBox>
          <PaginationControls page={1} totalPages={1} onPrev={() => {}} onNext={() => {}} />
        </UsageHistoryHeaderRow>
        {[1, 2, 3, 4].map((idx) => (
          <SkeletonCardItem key={idx} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <UsageHistoryHeaderRow>
        <StyledTitleBox>
          이용내역{' '}
          <span style={{ fontWeight: 400, fontSize: 13, marginLeft: 8 }}>
            ({total}) - 최근 3개월 내
          </span>
        </StyledTitleBox>
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </UsageHistoryHeaderRow>
      {pagedList.map((item: UsageHistoryItem, idx) => (
        <CardItem key={idx} date={item.date}>
          <div style={COMMON_STYLES.infoLabel}>
            구분(상태)
            <span style={COMMON_STYLES.infoValue}>{item.status}</span>
          </div>
          <div style={COMMON_STYLES.infoLabel}>
            이용일자
            <span style={COMMON_STYLES.infoValue}>{item.period}</span>
          </div>
          <div style={COMMON_STYLES.infoLabel}>
            제품정보
            <span style={COMMON_STYLES.infoValue}>{item.product}</span>
          </div>
        </CardItem>
      ))}
    </div>
  );
};

// 포인트 내역 카드형 리스트
const PointHistoryCardList = ({ isLoading = false }: { isLoading?: boolean }) => {
  const [page, setPage] = useState(1);
  const pageSize = 4;
  // 더미 데이터 (컴포넌트 내부로 이동)
  const dummyPointHistory: Array<{
    no: number;
    date: string;
    kind: string;
    history: string;
    changedPoints: string;
    remainingPoints: string;
  }> = [
    {
      no: 42,
      date: '2025-03-10',
      kind: '적립',
      history: '[23044123980AUMU] 구매 - 포인트 적립',
      changedPoints: '500',
      remainingPoints: '2,500',
    },
    // ... 이하 생략 ...
  ];
  const total = dummyPointHistory.length;
  const totalPages = Math.ceil(total / pageSize);
  const pagedList = dummyPointHistory.slice((page - 1) * pageSize, page * pageSize);

  const handlePrev = () => setPage((p) => (p > 1 ? p - 1 : p));
  const handleNext = () => setPage((p) => (p < totalPages ? p + 1 : p));

  if (isLoading) {
    return (
      <div style={{ width: '100%' }}>
        <UsageHistoryHeaderRow>
          <StyledTitleBox>
            포인트 내역{' '}
            <span style={{ fontWeight: 400, fontSize: 13, marginLeft: 8 }}>
              (0) - 최근 3개월 내
            </span>
          </StyledTitleBox>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <SkeletonBox width="40px" height="40px" style={{ marginRight: 32 }} />
            <span style={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
              <SkeletonBox width="20px" height="22px" />
              <SkeletonBox width="12px" height="12px" style={{ margin: '0 2px 2px 2px' }} />
              <SkeletonBox width="12px" height="12px" style={{ marginBottom: 2 }} />
            </span>
            <SkeletonBox width="40px" height="40px" style={{ marginLeft: 32 }} />
          </div>
        </UsageHistoryHeaderRow>
        {[1, 2, 3, 4].map((idx) => (
          <SkeletonCardItem key={idx} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <UsageHistoryHeaderRow>
        <StyledTitleBox>
          포인트 내역{' '}
          <span style={{ fontWeight: 400, fontSize: 13, marginLeft: 8 }}>
            ({total}) - 최근 3개월 내
          </span>
        </StyledTitleBox>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={handlePrev}
            style={{
              border: '1px solid #000',
              background: '#fff',
              width: 40,
              height: 40,
              borderRadius: 4,
              marginRight: 32,
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              opacity: page === 1 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IoArrowBackOutline size={24} />
          </button>
          <span style={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
            <span
              style={{
                fontWeight: 800,
                fontSize: 20,
                lineHeight: '22px',
                textAlign: 'center',
                color: '#000',
              }}
            >
              {page}
            </span>
            <span
              style={{
                fontWeight: 400,
                fontSize: 12,
                color: '#DDDDDD',
                margin: '0 2px 2px 2px',
              }}
            >
              /
            </span>
            <span
              style={{
                fontWeight: 400,
                fontSize: 12,
                color: '#000',
                marginBottom: 2,
              }}
            >
              {totalPages}
            </span>
          </span>
          <button
            onClick={handleNext}
            style={{
              border: '1px solid #000',
              background: '#fff',
              width: 40,
              height: 40,
              borderRadius: 4,
              marginLeft: 32,
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
              opacity: page === totalPages ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IoArrowForwardOutline size={24} />
          </button>
        </div>
      </UsageHistoryHeaderRow>
      {pagedList.map((item, idx) => (
        <div
          key={idx}
          style={{
            border: '1px solid #eee',
            borderRadius: 8,
            padding: '1rem',
            marginBottom: 16,
            background: '#fff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
            <div style={{ minWidth: 60, textAlign: 'center', color: '#222' }}>
              <span style={{ display: 'block', fontWeight: 900, fontSize: 16 }}>
                {item.date.split('-')[0]}
              </span>
              <span style={{ display: 'block', fontWeight: 700, fontSize: 16 }}>
                {item.date.split('-')[1]}.{item.date.split('-')[2]}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 12,
                  color: '#999',
                  marginBottom: 4,
                }}
              >
                종류
                <span
                  style={{
                    fontFamily: 'NanumSquare Neo OTF',
                    fontWeight: 700,
                    fontStyle: 'bold',
                    fontSize: 12,
                    lineHeight: '24px',
                    letterSpacing: 0,
                    color: '#000',
                    marginLeft: 8,
                  }}
                >
                  {item.kind}
                </span>
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 12,
                  color: '#999',
                  marginBottom: 4,
                }}
              >
                변동사항
                <span
                  style={{
                    fontFamily: 'NanumSquare Neo OTF',
                    fontWeight: 700,
                    fontStyle: 'bold',
                    fontSize: 12,
                    lineHeight: '24px',
                    letterSpacing: 0,
                    color: '#000',
                    marginLeft: 8,
                  }}
                >
                  {item.history}
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#999' }}>
                포인트
                <span
                  style={{
                    fontFamily: 'NanumSquare Neo OTF',
                    fontWeight: 700,
                    fontStyle: 'bold',
                    fontSize: 12,
                    lineHeight: '24px',
                    letterSpacing: 0,
                    color: '#000',
                    marginLeft: 8,
                  }}
                >
                  {item.changedPoints} / {item.remainingPoints}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// 제품평가 카드형 리스트
const EvaluationCardList = ({ isLoading = false }: { isLoading?: boolean }) => {
  const [page, setPage] = useState(1);
  const pageSize = 4;
  // 더미 데이터 (실제 데이터 구조에 맞게 수정)
  const dummyEvaluationList = [
    {
      date: '2025-06-10',
      info: '대여 / CC Collect - C224MSE231 (55) - 베이지',
      score: '제품상태 5 / 서비스 품질 5',
      review: '예쁜건 하나 66사이즈인 저에게는 좀 작아요. 다음에 또 이용하겠습니다.',
    },
    {
      date: '2025-05-02',
      info: '대여 / CC Collect - C224MSE231 (55) - 베이지',
      score: '제품상태 5 / 서비스 품질 5',
      review: '예쁜건 하나 66사이즈인 저에게는 좀 작아요. 다음에 또 이용하겠습니다.',
    },
    {
      date: '2025-05-16',
      info: '대여 / CC Collect - C224MSE231 (55) - 베이지',
      score: '제품상태 5 / 서비스 품질 5',
      review: '예쁜건 하나 66사이즈인 저에게는 좀 작아요. 다음에 또 이용하겠습니다.',
    },
    {
      date: '2025-05-14',
      info: '구매 / CC Collect - C224MSE231 (55) - 베이지',
      score: '제품상태 5 / 서비스 품질 5',
      review: '예쁜건 하나 66사이즈인 저에게는 좀 작아요. 다음에 또 이용하겠습니다.',
    },
    // ...더미 데이터 추가
  ];
  const total = dummyEvaluationList.length;
  const totalPages = Math.ceil(total / pageSize);
  const pagedList = dummyEvaluationList.slice((page - 1) * pageSize, page * pageSize);

  const handlePrev = () => setPage((p) => (p > 1 ? p - 1 : p));
  const handleNext = () => setPage((p) => (p < totalPages ? p + 1 : p));

  if (isLoading) {
    return (
      <div style={{ width: '100%' }}>
        <UsageHistoryHeaderRow>
          <StyledTitleBox>
            제품평가{' '}
            <span style={{ fontWeight: 400, fontSize: 13, marginLeft: 8 }}>
              (0) - 최근 3개월 내
            </span>
          </StyledTitleBox>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <SkeletonBox width="40px" height="40px" style={{ marginRight: 32 }} />
            <span style={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
              <SkeletonBox width="20px" height="22px" />
              <SkeletonBox width="12px" height="12px" style={{ margin: '0 2px 2px 2px' }} />
              <SkeletonBox width="12px" height="12px" style={{ marginBottom: 2 }} />
            </span>
            <SkeletonBox width="40px" height="40px" style={{ marginLeft: 32 }} />
          </div>
        </UsageHistoryHeaderRow>
        {[1, 2, 3, 4].map((idx) => (
          <SkeletonCardItem key={idx} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <UsageHistoryHeaderRow>
        <StyledTitleBox>
          제품평가{' '}
          <span style={{ fontWeight: 400, fontSize: 13, marginLeft: 8 }}>
            ({total}) - 최근 3개월 내
          </span>
        </StyledTitleBox>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={handlePrev}
            style={{
              border: '1px solid #000',
              background: '#fff',
              width: 40,
              height: 40,
              borderRadius: 4,
              marginRight: 32,
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              opacity: page === 1 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IoArrowBackOutline size={24} />
          </button>
          <span style={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
            <span
              style={{
                fontWeight: 800,
                fontSize: 20,
                lineHeight: '22px',
                textAlign: 'center',
                color: '#000',
              }}
            >
              {page}
            </span>
            <span
              style={{
                fontWeight: 400,
                fontSize: 12,
                color: '#DDDDDD',
                margin: '0 2px 2px 2px',
              }}
            >
              /
            </span>
            <span
              style={{
                fontWeight: 400,
                fontSize: 12,
                color: '#000',
                marginBottom: 2,
              }}
            >
              {totalPages}
            </span>
          </span>
          <button
            onClick={handleNext}
            style={{
              border: '1px solid #000',
              background: '#fff',
              width: 40,
              height: 40,
              borderRadius: 4,
              marginLeft: 32,
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
              opacity: page === totalPages ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IoArrowForwardOutline size={24} />
          </button>
        </div>
      </UsageHistoryHeaderRow>
      {pagedList.map((item, idx) => (
        <div
          key={idx}
          style={{
            border: '1px solid #eee',
            borderRadius: 8,
            padding: '1rem',
            marginBottom: 16,
            background: '#fff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
            <div style={{ minWidth: 60, textAlign: 'center', color: '#222' }}>
              <span style={{ display: 'block', fontWeight: 900, fontSize: 16 }}>
                {item.date.split('-')[0]}
              </span>
              <span style={{ display: 'block', fontWeight: 700, fontSize: 16 }}>
                {item.date.split('-')[1]}.{item.date.split('-')[2]}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 12,
                  color: '#999',
                  marginBottom: 4,
                }}
              >
                이용정보
                <span
                  style={{
                    fontFamily: 'NanumSquare Neo OTF',
                    fontWeight: 700,
                    fontStyle: 'bold',
                    fontSize: 12,
                    lineHeight: '24px',
                    letterSpacing: 0,
                    color: '#000',
                    marginLeft: 8,
                  }}
                >
                  {item.info}
                </span>
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 12,
                  color: '#999',
                  marginBottom: 4,
                }}
              >
                평가점수
                <span
                  style={{
                    fontFamily: 'NanumSquare Neo OTF',
                    fontWeight: 700,
                    fontStyle: 'bold',
                    fontSize: 12,
                    lineHeight: '24px',
                    letterSpacing: 0,
                    color: '#000',
                    marginLeft: 8,
                  }}
                >
                  {item.score}
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#999' }}>
                제품후기
                <span
                  style={{
                    fontFamily: 'NanumSquare Neo OTF',
                    fontWeight: 700,
                    fontStyle: 'bold',
                    fontSize: 12,
                    lineHeight: '24px',
                    letterSpacing: 0,
                    color: '#000',
                    marginLeft: 8,
                  }}
                >
                  {item.review}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// 결제수단 카드형 리스트
const PaymentMethodCardList = ({ isLoading = false }: { isLoading?: boolean }) => {
  const [page, setPage] = useState(1);
  const pageSize = 2;
  // 더미 데이터: 카드 2개, 빈 카드 2개
  const dummyPaymentList = [
    {
      registeredDate: '2025-06-01',
      cardNumber: '2025 - ○○○○ - ○○○○ - 1234 (신한카드)',
    },
    {
      registeredDate: '2025-06-01',
      cardNumber: '2025 - ○○○○ - ○○○○ - 1234 (삼성카드)',
    },
    { registeredDate: '', cardNumber: '' },
    { registeredDate: '', cardNumber: '' },
  ];
  const total = dummyPaymentList.length;
  const totalPages = Math.ceil(total / pageSize);
  const pagedList = dummyPaymentList.slice((page - 1) * pageSize, page * pageSize);

  const handlePrev = () => setPage((p) => (p > 1 ? p - 1 : p));
  const handleNext = () => setPage((p) => (p < totalPages ? p + 1 : p));

  if (isLoading) {
    return (
      <div style={{ width: '100%' }}>
        <UsageHistoryHeaderRow>
          <StyledTitleBox>
            결제수단 <span style={{ fontWeight: 400, fontSize: 13, marginLeft: 8 }}>(0)</span>
          </StyledTitleBox>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <SkeletonBox width="40px" height="40px" style={{ marginRight: 32 }} />
            <span style={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
              <SkeletonBox width="20px" height="22px" />
              <SkeletonBox width="12px" height="12px" style={{ margin: '0 2px 2px 2px' }} />
              <SkeletonBox width="12px" height="12px" style={{ marginBottom: 2 }} />
            </span>
            <SkeletonBox width="40px" height="40px" style={{ marginLeft: 32 }} />
          </div>
        </UsageHistoryHeaderRow>
        <UserInfoContainer style={{ maxWidth: 600, margin: '0 auto' }}>
          {[1, 2].map((idx) => (
            <div key={idx}>
              <SkeletonUserInfoField />
              <SkeletonUserInfoField />
              {idx !== 2 && <UserInfoDivider style={{ margin: '18px 0' }} />}
            </div>
          ))}
        </UserInfoContainer>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <UsageHistoryHeaderRow>
        <StyledTitleBox>
          결제수단 <span style={{ fontWeight: 400, fontSize: 13, marginLeft: 8 }}>({2})</span>
        </StyledTitleBox>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={handlePrev}
            style={{
              border: '1px solid #000',
              background: '#fff',
              width: 40,
              height: 40,
              borderRadius: 4,
              marginRight: 32,
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              opacity: page === 1 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IoArrowBackOutline size={24} />
          </button>
          <span style={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
            <span
              style={{
                fontWeight: 800,
                fontSize: 20,
                lineHeight: '22px',
                textAlign: 'center',
                color: '#000',
              }}
            >
              {page}
            </span>
            <span
              style={{
                fontWeight: 400,
                fontSize: 12,
                color: '#DDDDDD',
                margin: '0 2px 2px 2px',
              }}
            >
              /
            </span>
            <span
              style={{
                fontWeight: 400,
                fontSize: 12,
                color: '#000',
                marginBottom: 2,
              }}
            >
              {totalPages}
            </span>
          </span>
          <button
            onClick={handleNext}
            style={{
              border: '1px solid #000',
              background: '#fff',
              width: 40,
              height: 40,
              borderRadius: 4,
              marginLeft: 32,
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
              opacity: page === totalPages ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IoArrowForwardOutline size={24} />
          </button>
        </div>
      </UsageHistoryHeaderRow>
      <UserInfoContainer style={{ maxWidth: 600, margin: '0 auto' }}>
        {pagedList.map((item, idx) => (
          <div key={idx}>
            <UserInfoFieldRow style={{ marginBottom: 8 }}>
              <UserInfoLabel style={{ minWidth: 90, maxWidth: 90, fontWeight: 900 }}>
                등록일자
              </UserInfoLabel>
              <UserInfoInput
                readOnly
                value={item.registeredDate || '-'}
                style={{ fontWeight: 500 }}
              />
            </UserInfoFieldRow>
            <UserInfoFieldRow>
              <UserInfoLabel style={{ minWidth: 90, maxWidth: 90 }}>카드번호</UserInfoLabel>
              <UserInfoInput readOnly value={item.cardNumber || '-'} style={{ fontWeight: 400 }} />
            </UserInfoFieldRow>
            {idx !== pagedList.length - 1 && <UserInfoDivider style={{ margin: '18px 0' }} />}
          </div>
        ))}
      </UserInfoContainer>
    </div>
  );
};

// 내 옷장 목록 테이블형 리스트
const ClosetTableList = ({ isLoading = false }: { isLoading?: boolean }) => {
  const [page, setPage] = useState(1);
  const pageSize = 7;
  // 더미 데이터
  const dummyClosetList = [
    {
      date: '2025-06-01',
      type: '미디 원피스',
      style: '24AWSE231',
      size: '44 / 55 / 66',
      color: '베이지',
    },
    {
      date: '2025-06-01',
      type: '미디 원피스',
      style: '24AWSE231',
      size: '44 / 55 / 66',
      color: '베이지',
    },
    {
      date: '2025-06-01',
      type: '미디 원피스',
      style: '24AWSE231',
      size: '55 / 66',
      color: '베이지',
    },
    {
      date: '2025-06-01',
      type: '미디 원피스',
      style: '24AWSE231',
      size: '55 / 66',
      color: '베이지',
    },
    {
      date: '2025-06-01',
      type: '미디 원피스',
      style: '24AWSE231',
      size: '44 / 55 / 66',
      color: '베이지',
    },
    {
      date: '2025-06-01',
      type: '미디 원피스',
      style: '24AWSE231',
      size: '44 / 55 / 66',
      color: '베이지',
    },
    {
      date: '2025-06-01',
      type: '미디 원피스',
      style: '24AWSE231',
      size: '44 / 55 / 66',
      color: '베이지',
    },
    {
      date: '2025-06-01',
      type: '미디 원피스',
      style: '24AWSE231',
      size: '44 / 55 / 66',
      color: '베이지',
    },
    {
      date: '2025-06-01',
      type: '미디 원피스',
      style: '24AWSE231',
      size: '44 / 55 / 66',
      color: '베이지',
    },
    {
      date: '2025-06-01',
      type: '미디 원피스',
      style: '24AWSE231',
      size: '44 / 55 / 66',
      color: '베이지',
    },
    {
      date: '2025-06-01',
      type: '미디 원피스',
      style: '24AWSE231',
      size: '44 / 55 / 66',
      color: '베이지',
    },
    {
      date: '2025-06-01',
      type: '미디 원피스',
      style: '24AWSE231',
      size: '44 / 55 / 66',
      color: '베이지',
    },
  ];
  const total = dummyClosetList.length;
  const totalPages = Math.ceil(total / pageSize);
  const pagedList = dummyClosetList.slice((page - 1) * pageSize, page * pageSize);

  const handlePrev = () => setPage((p) => (p > 1 ? p - 1 : p));
  const handleNext = () => setPage((p) => (p < totalPages ? p + 1 : p));

  if (isLoading) {
    return (
      <div style={{ width: '100%' }}>
        <UsageHistoryHeaderRow>
          <StyledTitleBox>
            내 옷장 목록 <span style={{ fontWeight: 400, fontSize: 13, marginLeft: 8 }}>(0)</span>
          </StyledTitleBox>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <SkeletonBox width="40px" height="40px" style={{ marginRight: 32 }} />
            <span style={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
              <SkeletonBox width="20px" height="22px" />
              <SkeletonBox width="12px" height="12px" style={{ margin: '0 2px 2px 2px' }} />
              <SkeletonBox width="12px" height="12px" style={{ marginBottom: 2 }} />
            </span>
            <SkeletonBox width="40px" height="40px" style={{ marginLeft: 32 }} />
          </div>
        </UsageHistoryHeaderRow>
        <div
          style={{
            width: '100%',
            background: '#fff',
            border: '1px solid #eee',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontWeight: 900,
              fontSize: 13,
              background: '#fafafa',
              borderBottom: '1px solid #eee',
              textAlign: 'center',
            }}
          >
            {[1, 2, 3, 4, 5].map((idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRight: idx !== 5 ? '1px solid #eee' : 'none',
                }}
              >
                <SkeletonBox width="60px" height="16px" style={{ margin: '0 auto' }} />
              </div>
            ))}
          </div>
          {[1, 2, 3, 4, 5, 6, 7].map((rowIdx) => (
            <div
              key={rowIdx}
              style={{
                display: 'flex',
                fontSize: 13,
                borderBottom: rowIdx !== 7 ? '1px solid #eee' : 'none',
                textAlign: 'center',
              }}
            >
              {[1, 2, 3, 4, 5].map((colIdx) => (
                <div
                  key={colIdx}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    borderRight: colIdx !== 5 ? '1px solid #eee' : 'none',
                  }}
                >
                  <SkeletonBox width="80px" height="16px" style={{ margin: '0 auto' }} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <UsageHistoryHeaderRow>
        <StyledTitleBox>
          내 옷장 목록{' '}
          <span style={{ fontWeight: 400, fontSize: 13, marginLeft: 8 }}>({total})</span>
        </StyledTitleBox>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={handlePrev}
            style={{
              border: '1px solid #000',
              background: '#fff',
              width: 40,
              height: 40,
              borderRadius: 4,
              marginRight: 32,
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              opacity: page === 1 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IoArrowBackOutline size={24} />
          </button>
          <span style={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
            <span
              style={{
                fontWeight: 800,
                fontSize: 20,
                lineHeight: '22px',
                textAlign: 'center',
                color: '#000',
              }}
            >
              {page}
            </span>
            <span
              style={{
                fontWeight: 400,
                fontSize: 12,
                color: '#DDDDDD',
                margin: '0 2px 2px 2px',
              }}
            >
              /
            </span>
            <span
              style={{
                fontWeight: 400,
                fontSize: 12,
                color: '#000',
                marginBottom: 2,
              }}
            >
              {totalPages}
            </span>
          </span>
          <button
            onClick={handleNext}
            style={{
              border: '1px solid #000',
              background: '#fff',
              width: 40,
              height: 40,
              borderRadius: 4,
              marginLeft: 32,
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
              opacity: page === totalPages ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IoArrowForwardOutline size={24} />
          </button>
        </div>
      </UsageHistoryHeaderRow>
      <div
        style={{
          width: '100%',
          background: '#fff',
          border: '1px solid #eee',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontWeight: 900,
            fontSize: 13,
            background: '#fafafa',
            borderBottom: '1px solid #eee',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              flex: 1,
              padding: '10px 0',
              borderRight: '1px solid #eee',
            }}
          >
            등록일자
          </div>
          <div
            style={{
              flex: 1,
              padding: '10px 0',
              borderRight: '1px solid #eee',
            }}
          >
            종류
          </div>
          <div
            style={{
              flex: 1,
              padding: '10px 0',
              borderRight: '1px solid #eee',
            }}
          >
            스타일 품번
          </div>
          <div
            style={{
              flex: 1,
              padding: '10px 0',
              borderRight: '1px solid #eee',
            }}
          >
            사이즈
          </div>
          <div style={{ flex: 1, padding: '10px 0' }}>색상</div>
        </div>
        {pagedList.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              fontSize: 13,
              borderBottom: idx !== pagedList.length - 1 ? '1px solid #eee' : 'none',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                flex: 1,
                padding: '10px 0',
                borderRight: '1px solid #eee',
              }}
            >
              {item.date}
            </div>
            <div
              style={{
                flex: 1,
                padding: '10px 0',
                borderRight: '1px solid #eee',
              }}
            >
              {item.type}
            </div>
            <div
              style={{
                flex: 1,
                padding: '10px 0',
                borderRight: '1px solid #eee',
              }}
            >
              {item.style}
            </div>
            <div
              style={{
                flex: 1,
                padding: '10px 0',
                borderRight: '1px solid #eee',
              }}
            >
              {item.size}
            </div>
            <div style={{ flex: 1, padding: '10px 0' }}>{item.color}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const UserDetail: React.FC = () => {
  const { email } = useParams<{ email: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // 사용자 상세 정보
  const [userDetail, setUserDetail] = useState<UserDetailModel | null>(null);
  // 탭
  const [activeTab, setActiveTab] = useState<number>(0);

  // 에러 처리
  const { error, isLoading, setIsLoading, handleError, clearError } = useErrorHandler();

  // 각 탭별 로딩 상태 관리
  const [tabLoadingStates, setTabLoadingStates] = useState<{
    [key: number]: boolean;
  }>({
    0: false, // 내 스타일
    1: false, // 배송지 설정
    2: false, // 이용내역
    3: false, // 이용권 내역
    4: false, // 포인트 내역
    5: false, // 제품평가
    6: false, // 결제수단
    7: false, // 내 옷장 목록
  });

  // 특정 탭의 로딩 상태 설정
  const setTabLoading = (tabIndex: number, loading: boolean) => {
    setTabLoadingStates((prev) => ({
      ...prev,
      [tabIndex]: loading,
    }));
  };

  // 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [licenseType, setLicenseType] = useState<string>('1회 이용권');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setIsCalendarOpen(false);
  };
  const handleAddLicense = () => {
    // 실제 추가 로직 (예: 서버 전송 등)
    closeModal();
  };

  // 사용자 정보 조회 (에러 처리 포함)
  useEffect(() => {
    if (!email) return;

    const fetchUserDetail = async () => {
      try {
        setIsLoading(true);
        clearError();
        const data = await getUserByEmail(decodeURIComponent(email));
        setUserDetail(data);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('사용자 정보 조회 실패');
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetail();
  }, [email, clearError, handleError, setIsLoading]);

  // 드롭다운 핸들러
  const handleTabSelect: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const newTab = Number(e.target.value);
    setActiveTab(newTab);

    // 탭 변경 시 해당 탭의 로딩 상태를 true로 설정 (실제 구현에서는 API 호출 시 사용)
    if (newTab >= 2 && newTab <= 7) {
      setTabLoading(newTab, true);
      // 실제 구현에서는 여기서 해당 탭의 데이터를 로드하고 완료 후 false로 설정
      setTimeout(() => setTabLoading(newTab, false), 1000); // 예시용
    }

    const params = Object.fromEntries(searchParams.entries());
    params.page = '1';
    setSearchParams(params);
  };

  // 오른쪽 박스 내용 렌더링 (상단 타이틀 포함)
  const renderRightBox = () => {
    switch (activeTab) {
      case 0:
        return (
          <>
            <StyledTitleBox>내 스타일</StyledTitleBox>
            <MyStyleBox />
          </>
        );
      case 1:
        return (
          <>
            <StyledTitleBox>배송지 설정</StyledTitleBox>
            <ShippingSettingBox />
          </>
        );
      case 2:
        return <UsageHistoryCardList isLoading={tabLoadingStates[2] || isLoading} />;
      case 3:
        return (
          <LicenseHistoryCardList
            openModal={openModal}
            isLoading={tabLoadingStates[3] || isLoading}
          />
        );
      case 4:
        return <PointHistoryCardList isLoading={tabLoadingStates[4] || isLoading} />;
      case 5:
        return <EvaluationCardList isLoading={tabLoadingStates[5] || isLoading} />;
      case 6:
        return <PaymentMethodCardList isLoading={tabLoadingStates[6] || isLoading} />;
      case 7:
        return <ClosetTableList isLoading={tabLoadingStates[7] || isLoading} />;
      default:
        return null;
    }
  };

  // 목록이동 시 이전 쿼리스트링 복원
  const handleBackToList = () => {
    // location.state?.fromQuery가 있으면 그대로, 없으면 기본 /userlist
    const fromQuery = (location.state && location.state.fromQuery) || '';
    navigate(`/userlist${fromQuery}`);
  };

  // 에러 또는 로딩 상태 처리
  if (isLoading) {
    return (
      <Container>
        <GlobalStyle />
        {/* 타이틀과 버튼을 감싸는 컨테이너 */}
        <HeaderContainer>
          {/* 타이틀 상단 고정 */}
          <TitleRow>
            <PageTitle>회원 관리</PageTitle>
          </TitleRow>
          {/* 버튼 row: 좌측 목록이동, 우측 변경저장/삭제 */}
          <ButtonRow>
            <BackButtonBox>
              <BackButton onClick={handleBackToList}>
                <span style={{ color: '#FFB300', fontSize: 16, marginRight: 2 }}>❮</span>
                목록이동
              </BackButton>
            </BackButtonBox>
            <SaveDeleteButtonBox>
              <SaveButton onClick={() => alert('변경저장!')}>변경저장</SaveButton>
              <DeleteButton onClick={() => alert('삭제!')}>삭제</DeleteButton>
            </SaveDeleteButtonBox>
          </ButtonRow>
        </HeaderContainer>
        {/* 내 스타일 옵션을 오른쪽 상단에 배치 */}
        <ProductRowHeader>
          <ProductNumberWrapper>
            <ProductNumberLabel>번호</ProductNumberLabel>
            <ProductNumberValue>{dummyProducts[0].no}</ProductNumberValue>
          </ProductNumberWrapper>
          <RowFlexBox>
            <SkeletonTabOption />
          </RowFlexBox>
        </ProductRowHeader>
        {/* 1:1 row 정렬 */}
        <MainFlexRow>
          {/* 왼쪽: 회원정보 박스 */}
          <LeftBox>
            <UserInfoBox userDetail={null} isLoading={true} />
          </LeftBox>
          {/* 오른쪽: 셀렉트 + 테이블/내스타일 박스 */}
          <RightBox>
            <ContentCard>
              <StyledTitleBox>내 스타일</StyledTitleBox>
              <UserInfoContainer>
                {/* 실제 MyStyleBox 구조에 맞는 스켈레톤 */}
                <UserInfoGroup>
                  <UserInfoIconBox>
                    <SkeletonIcon />
                  </UserInfoIconBox>
                  <UserInfoFields>
                    <SkeletonUserInfoField labelWidth="60px" inputWidth="flex: 1" />
                    <SkeletonUserInfoField labelWidth="60px" inputWidth="flex: 1" />
                  </UserInfoFields>
                </UserInfoGroup>
                <UserInfoDivider />
                <UserInfoGroup>
                  <UserInfoIconBox>
                    <SkeletonIcon />
                  </UserInfoIconBox>
                  <UserInfoFields>
                    <SkeletonUserInfoField labelWidth="60px" inputWidth="flex: 1" />
                    <SkeletonUserInfoField labelWidth="60px" inputWidth="flex: 1" />
                  </UserInfoFields>
                </UserInfoGroup>
                <UserInfoDivider />
                <UserInfoGroup>
                  <UserInfoIconBox>
                    <SkeletonIcon />
                  </UserInfoIconBox>
                  <UserInfoFields>
                    <SkeletonUserInfoField labelWidth="60px" inputWidth="flex: 1" />
                    <SkeletonUserInfoField labelWidth="60px" inputWidth="flex: 1" />
                  </UserInfoFields>
                </UserInfoGroup>
              </UserInfoContainer>
            </ContentCard>
          </RightBox>
        </MainFlexRow>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <div style={{ color: 'red', marginBottom: '1rem' }}>에러: {error}</div>
          <button onClick={clearError}>다시 시도</button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <GlobalStyle />
      {/* 타이틀과 버튼을 감싸는 컨테이너 */}
      <HeaderContainer>
        {/* 타이틀 상단 고정 */}
        <TitleRow>
          <PageTitle>회원 관리</PageTitle>
        </TitleRow>
        {/* 버튼 row: 좌측 목록이동, 우측 변경저장/삭제 */}
        <ButtonRow>
          <BackButtonBox>
            <BackButton onClick={handleBackToList}>
              <span style={{ color: '#FFB300', fontSize: 16, marginRight: 2 }}>❮</span>
              목록이동
            </BackButton>
          </BackButtonBox>
          <SaveDeleteButtonBox>
            <SaveButton onClick={() => alert('변경저장!')}>변경저장</SaveButton>
            <DeleteButton onClick={() => alert('삭제!')}>삭제</DeleteButton>
          </SaveDeleteButtonBox>
        </ButtonRow>
      </HeaderContainer>
      {/* 내 스타일 옵션을 오른쪽 상단에 배치 (헤더 아래, ListButtonDetailSubHeader 위 X) */}
      <ProductRowHeader>
        <ProductNumberWrapper>
          <ProductNumberLabel>번호</ProductNumberLabel>
          <ProductNumberValue>{dummyProducts[0].no}</ProductNumberValue>
        </ProductNumberWrapper>
        <RowFlexBox>
          {isLoading ? (
            <SkeletonTabOption />
          ) : (
            <UserInfoSelect
              value={activeTab}
              onChange={handleTabSelect}
              style={{
                width: 160,
                minWidth: 120,
                maxWidth: 200,
                marginRight: 0,
              }}
            >
              {tabOptions.map((opt: { value: number; label: string }) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </UserInfoSelect>
          )}
        </RowFlexBox>
      </ProductRowHeader>
      {/* 1:1 row 정렬 */}
      <MainFlexRow>
        {/* 왼쪽: 회원정보 박스 */}
        <LeftBox>
          <UserInfoBox userDetail={userDetail} isLoading={isLoading} />
        </LeftBox>
        {/* 오른쪽: 셀렉트 + 테이블/내스타일 박스 */}
        <RightBox>
          <ContentCard>{renderRightBox()}</ContentCard>
        </RightBox>
      </MainFlexRow>
      {/* 모달 등 기존 코드 유지 */}
      {isModalOpen && (
        <ModalOverlay onClick={closeModal}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>이용권 추가</ModalTitle>
              <CloseButton onClick={closeModal}>×</CloseButton>
            </ModalHeader>
            <Divider />
            <FieldGroup>
              <FieldLabel>이용권 종류 설정</FieldLabel>
              <StyledSelect value={licenseType} onChange={(e) => setLicenseType(e.target.value)}>
                <option>1회 이용권</option>
                <option>정기 구독권</option>
              </StyledSelect>
            </FieldGroup>
            <Divider />
            <FieldGroup>
              <FieldLabel>이용기간 설정</FieldLabel>
              <DatePreviewContainer>
                <DatePreviewText>
                  {startDate ? format(startDate, 'yyyy.MM.dd') : '시작일 선택'} ~{' '}
                  {endDate ? format(endDate, 'yyyy.MM.dd') : '종료일 선택'}
                </DatePreviewText>
                <ChangeButton onClick={() => setIsCalendarOpen((prev) => !prev)}>
                  설정변경
                </ChangeButton>
              </DatePreviewContainer>
              {isCalendarOpen && (
                <CalendarContainer>
                  <DatePicker
                    locale="ko"
                    inline
                    monthsShown={2}
                    selectsRange
                    startDate={startDate}
                    endDate={endDate}
                    selected={startDate}
                    onChange={(d) => {
                      if (Array.isArray(d)) {
                        const [newStart, newEnd] = d;
                        setStartDate(newStart ?? undefined);
                        setEndDate(newEnd ?? undefined);
                        if (newEnd) setIsCalendarOpen(false);
                      }
                    }}
                    dayClassName={(date) => {
                      if (hd.isHoliday(date)) return 'day-holiday';
                      if (date.getDay() === 0) return 'day-sunday';
                      if (date.getDay() === 6) return 'day-saturday';
                      return '';
                    }}
                  />
                </CalendarContainer>
              )}
            </FieldGroup>
            <SubmitButton onClick={handleAddLicense}>추가하기</SubmitButton>
          </ModalBox>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default UserDetail;

/* Styled Components */
const Container = styled.div`
  width: 100%;

  height: 100%;
  margin: 0;

  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: #fff;
`;
const ProductNumberWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  margin: 10px 0 34px;
  min-width: 80px;
  flex-shrink: 0;
`;
const ProductNumberLabel = styled.div`
  font-weight: 700;
  font-size: 12x;
`;
const ProductNumberValue = styled.div`
  font-weight: 900;
  font-size: 12px;
`;
const AddButton = styled.button`
  width: 100px;
  height: 40px;
  font-size: 14px;
  font-weight: 700;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    opacity: 0.9;
  }
`;
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;
const ModalBox = styled.div`
  max-width: 600px;
  width: 100%;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
`;
const ModalHeader = styled.div`
  position: relative;
  padding: 16px 24px;
`;
const ModalTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #000;
`;
const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 24px;
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
`;
const Divider = styled.hr`
  margin: 0;
  border: none;
  border-top: 1px solid #ddd;
`;
const FieldGroup = styled.div`
  padding: 16px 24px;
`;
const FieldLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  margin-bottom: 8px;
`;
const StyledSelect = styled.select`
  width: 100%;
  height: 57px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 800;
  border: 1px solid #000;
  border-radius: 4px;
  appearance: none;
  background: url("data:image/svg+xml;utf8,<svg fill='black' height='10' viewBox='0 0 10 10'><path d='M0 0 L5 5 L10 0 Z'/></svg>")
    no-repeat right 12px center #fff;
`;
const DatePreviewContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #000;
  border-radius: 4px;
  padding: 0 12px;
  height: 57px;
  margin-bottom: 12px;
`;
const DatePreviewText = styled.div`
  font-size: 13px;
  font-weight: 800;
`;
const ChangeButton = styled.button`
  background: #000;
  color: #fff;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 700;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;
// 기존 CalendarContainer를 아래처럼 교체

const CalendarContainer = styled.div`
  display: flex;
  flex-direction: column; /* 세로 스택 */
  align-items: center;
  background: #fff;
  border-radius: 8px;
  margin: 30px 0;

  /* react-datepicker가 monthsShown={2}일 때 기본 float 스타일을 없애고, 블록으로 세로 배치 */
  .react-datepicker__month-container {
    float: none !important;
    display: block !important;
    margin: 0 auto 16px; /* 아래 월과의 간격 */
  }

  /* 마지막 달에는 아래 마진 제거 */
  .react-datepicker__month-container:last-child {
    margin-bottom: 0;
  }

  /* 필요시, 월별 헤더 가운데 정렬 추가 */
  .react-datepicker__current-month {
    text-align: center;
    width: 100%;
  }
`;

const SubmitButton = styled.button`
  display: block;
  width: calc(100% - 48px); /* 좌우 24px 여백 제외 */
  height: 56px;
  background: #000;
  color: #fff;
  font-size: 16px;
  font-weight: 800;
  border: none;
  cursor: pointer;
  margin: 24px auto; /* 상하 24px, 자동 가운데 정렬 */
  border-radius: 4px;
`;

const MainFlexRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 24px;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;

  min-height: 600px;

  margin: 0;
  padding: 0;
  background: #fff;
`;

const LeftBox = styled.div`
  background: #fff;
  border: 1px solid #eee;

  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  /* min-width: 620px; */

  width: 100%;
  height: 100%;
  padding: 1rem;
  box-sizing: border-box;
  overflow: hidden;
`;

const RightBox = styled.div`
  background: #fff;
  border: 1px solid #eee;

  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  /* min-width: 620px; */

  width: 100%;
  height: 100%;
  padding: 1rem;
  box-sizing: border-box;
  overflow: hidden;
`;

const ContentCard = styled.div`
  background: #fff;

  min-width: 500px;
  max-width: 900px;

  margin-top: 0;
`;

// 상단 옵션을 오른쪽에 배치할 RowFlexBox
const RowFlexBox = styled.div`
  display: flex;
  width: auto;
  flex: 1;
  justify-content: flex-end;
  align-items: center;
  max-width: 220px;
  padding-right: 0;
`;

// 번호와 옵션을 양쪽 끝에 배치하는 flex row
const ProductRowHeader = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0;
  margin-top: 10px;
`;

// 탭별 상단 타이틀 스타일
const StyledTitleBox = styled.div`
  font-size: 14px;
  font-weight: 900;

  padding: 1rem;
`;

// 이용내역 상단 타이틀+페이지네이션 row
const UsageHistoryHeaderRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
  margin-bottom: 32px;
`;

// 3. MyStyleBox 대체 (예시)
const MyStyleBox = () => {
  // 더미 데이터
  const height = '164 cm';
  const weight = '64 kg';
  const topSize = '55 (M)';
  const bottomSize = '55 (M)';
  const onePiece = '55 (M)';
  const brand1 = '모조 (MOJO)';
  const brand2 = '쥬크 (ZOOC)';
  const brand3 = '올리브 데 올리브 (OLIVE D OLIVE)';
  const shoulder = '36 cm';
  const chest = '76 cm';
  const waist = '78 cm';
  const sleeve = '32 cm';

  return (
    <UserInfoContainer>
      {/* 1. 신체/사이즈 */}
      <UserInfoGroup>
        <UserInfoIconBox>
          <img src={UserInfoIcon5} alt="신체" width={36} height={36} />
        </UserInfoIconBox>
        <UserInfoFields>
          <UserInfoFieldRow>
            <UserInfoLabel>키(신장)</UserInfoLabel>
            <UserInfoInput readOnly value={height} />
            <UserInfoLabel style={{ marginLeft: 20 }}>몸무게</UserInfoLabel>
            <UserInfoInput readOnly value={weight} />
          </UserInfoFieldRow>
          <UserInfoFieldRow>
            <UserInfoLabel>원피스</UserInfoLabel>
            <UserInfoInput readOnly value={onePiece} />
            <UserInfoLabel>상의</UserInfoLabel>
            <UserInfoInput readOnly value={topSize} />
            <UserInfoLabel>하의</UserInfoLabel>
            <UserInfoInput readOnly value={bottomSize} />
          </UserInfoFieldRow>
        </UserInfoFields>
      </UserInfoGroup>
      <UserInfoDivider />
      {/* 2. 브랜드 */}
      <UserInfoGroup>
        <UserInfoIconBox>
          <img src={UserInfoIcon6} alt="브랜드" width={36} height={36} />
        </UserInfoIconBox>
        <UserInfoFields>
          <UserInfoFieldRow>
            <UserInfoLabel>브랜드1</UserInfoLabel>
            <UserInfoInput readOnly value={brand1} />
            <UserInfoLabel style={{ marginLeft: 20 }}>브랜드2</UserInfoLabel>
            <UserInfoInput readOnly value={brand2} />
          </UserInfoFieldRow>
          <UserInfoFieldRow>
            <UserInfoLabel>브랜드3</UserInfoLabel>
            <UserInfoInput readOnly value={brand3} style={{ width: 220 }} />
          </UserInfoFieldRow>
        </UserInfoFields>
      </UserInfoGroup>
      <UserInfoDivider />
      {/* 3. 신체치수 */}
      <UserInfoGroup>
        <UserInfoIconBox>
          <img src={UserInfoIcon7} alt="치수" width={36} height={36} />
        </UserInfoIconBox>
        <UserInfoFields>
          <UserInfoFieldRow>
            <UserInfoLabel>어깨너비</UserInfoLabel>
            <UserInfoInput readOnly value={shoulder} />
            <UserInfoLabel style={{ marginLeft: 20 }}>가슴둘레</UserInfoLabel>
            <UserInfoInput readOnly value={chest} />
          </UserInfoFieldRow>
          <UserInfoFieldRow>
            <UserInfoLabel>허리둘레</UserInfoLabel>
            <UserInfoInput readOnly value={waist} />
            <UserInfoLabel style={{ marginLeft: 20 }}>소매길이</UserInfoLabel>
            <UserInfoInput readOnly value={sleeve} />
          </UserInfoFieldRow>
        </UserInfoFields>
      </UserInfoGroup>
    </UserInfoContainer>
  );
};

// 배송지 설정 박스 (이미지 스타일)
const ShippingSettingBox = () => {
  // 더미 데이터 사용
  const shippingList = [
    {
      label: '기본 배송지',
      address: '서울 금천구 디지털로9길 41, 1008호',
      message: '배송 시 문앞에 놓아주세요',
    },
    {
      label: '배송지 1',
      address: '경기 부천시 부천로57번길 11, 303호',
      message: '배송 시 문앞에 놓아주세요',
    },
    { label: '배송지 2', address: '-', message: '-' },
    { label: '배송지 3', address: '-', message: '-' },
  ];
  return (
    <UserInfoContainer style={{ maxWidth: 600, margin: '0 auto' }}>
      {shippingList.map((item, idx) => (
        <div key={idx} style={{ marginBottom: idx === shippingList.length - 1 ? 0 : 24 }}>
          <UserInfoFieldRow style={{ marginBottom: 8 }}>
            <UserInfoLabel style={{ minWidth: 90, maxWidth: 90, fontWeight: 900 }}>
              {item.label}
            </UserInfoLabel>
            <UserInfoInput readOnly value={item.address} style={{ fontWeight: 500 }} />
          </UserInfoFieldRow>
          <UserInfoFieldRow>
            <UserInfoLabel style={{ minWidth: 90, maxWidth: 90 }}>배송 메시지</UserInfoLabel>
            <UserInfoInput readOnly value={item.message} style={{ fontWeight: 400 }} />
          </UserInfoFieldRow>
          {idx !== shippingList.length - 1 && <UserInfoDivider style={{ margin: '18px 0' }} />}
        </div>
      ))}
    </UserInfoContainer>
  );
};

// --- 회원정보 박스 컴포넌트 ---
const UserInfoBox = ({
  userDetail,
  isLoading,
}: {
  userDetail: UserDetailModel | null;
  isLoading: boolean;
}) => {
  // 로딩 중일 때 스켈레톤 UI 표시
  if (isLoading) {
    return <SkeletonUserInfoBox />;
  }

  // 더미/임시 데이터
  const birthYear = userDetail?.birthdate || '1992년';
  const membership = userDetail?.membership?.name || '단골';
  const membershipType = '정상';
  const melpikUrl = 'me1pik.com/';
  const melpikId = userDetail?.instagramId || 'y_buencamino';

  // address에서 시/도와 시/군/구 추출
  const parseAddress = (address: string) => {
    if (!address) return { region: '-', city: '-' };

    // "경기도 하남시" 형태의 주소를 파싱
    const parts = address.split(' ');
    if (parts.length >= 2) {
      return {
        region: parts[0], // "경기도"
        city: parts[1], // "하남시"
      };
    } else if (parts.length === 1) {
      return {
        region: parts[0], // "서울특별시" 등
        city: '-',
      };
    }
    return { region: '-', city: '-' };
  };

  const { region, city } = parseAddress(userDetail?.address || '');

  // 나이 계산
  const ageInfo = calculateAge(birthYear);
  return (
    <UserInfoContainer>
      {/* 1. 기본정보 */}
      <UserInfoGroup>
        <UserInfoIconBox>
          <img src={UserInfoIcon1} alt="회원" width={36} height={36} />
        </UserInfoIconBox>
        <UserInfoFields>
          <UserInfoFieldRow>
            <UserInfoLabel>회원명</UserInfoLabel>
            <UserInfoInput
              readOnly
              value={userDetail?.name || '홍길동 (퍼시몬)'}
              style={{ flex: 1 }}
            />
          </UserInfoFieldRow>
          <UserInfoFieldRow>
            <UserInfoLabel>계정</UserInfoLabel>
            <UserInfoInput
              readOnly
              value={userDetail?.email || 'goodxx21 @ naver.com'}
              style={{ flex: 1 }}
            />
          </UserInfoFieldRow>
          {/* 등급/구분설정 */}
          <UserInfoFieldRow>
            <UserInfoPair>
              <UserInfoLabel>등급</UserInfoLabel>
              <UserInfoSelect value={membership} disabled>
                <option>{membership}</option>
              </UserInfoSelect>
            </UserInfoPair>
            <UserInfoPair>
              <UserInfoLabel>구분설정</UserInfoLabel>
              <UserInfoSelect value={membershipType} disabled>
                <option>{membershipType}</option>
              </UserInfoSelect>
            </UserInfoPair>
          </UserInfoFieldRow>
        </UserInfoFields>
      </UserInfoGroup>
      <UserInfoDivider />
      {/* 2. 생년/연락처 */}
      <UserInfoGroup>
        <UserInfoIconBox>
          <img src={UserInfoIcon2} alt="생년" width={36} height={36} />
        </UserInfoIconBox>
        <UserInfoFields>
          <UserInfoFieldRow>
            <UserInfoLabel>생년</UserInfoLabel>
            <UserInfoInput readOnly value={birthYear} style={{ width: 120 }} />
            <UserInfoLabel
              style={{
                marginLeft: 16,
                minWidth: 80,
                textAlign: 'left',
                color: '#888',
                fontWeight: 400,
                fontSize: 12,
                whiteSpace: 'nowrap',
              }}
            >
              {ageInfo.age > 0 ? `${ageInfo.koreanAge}세 (만 ${ageInfo.age}세)` : '-'}
            </UserInfoLabel>
          </UserInfoFieldRow>
          <UserInfoFieldRow>
            <UserInfoLabel>연락처</UserInfoLabel>
            <UserInfoInput
              readOnly
              value={userDetail?.phoneNumber || '010-1234-5678'}
              style={{ flex: 1 }}
            />
          </UserInfoFieldRow>
        </UserInfoFields>
      </UserInfoGroup>
      <UserInfoDivider />
      {/* 3. 인스타/팔로워/팔로잉 */}
      <UserInfoGroup>
        <UserInfoIconBox>
          <img src={UserInfoIcon3} alt="인스타" width={36} height={36} />
        </UserInfoIconBox>
        <UserInfoFields>
          <UserInfoFieldRow>
            <UserInfoLabel>인스타</UserInfoLabel>
            <UserInfoInput
              readOnly
              value={userDetail?.instagramId || 'y_buencamino'}
              style={{ flex: 1 }}
            />
          </UserInfoFieldRow>
          {/* 팔로워/팔로잉 */}
          <UserInfoFieldRow>
            <UserInfoPair>
              <UserInfoLabel>팔로워</UserInfoLabel>
              <UserInfoInput
                readOnly
                value={userDetail?.followersCount?.toLocaleString() || '9,999'}
              />
            </UserInfoPair>
            <UserInfoPair>
              <UserInfoLabel>팔로잉</UserInfoLabel>
              <UserInfoInput
                readOnly
                value={userDetail?.followingCount?.toLocaleString() || '9,999'}
              />
            </UserInfoPair>
          </UserInfoFieldRow>
        </UserInfoFields>
      </UserInfoGroup>
      <UserInfoDivider />
      {/* 4. 지역/URL */}
      <UserInfoGroup>
        <UserInfoIconBox>
          <img src={UserInfoIcon4} alt="지역" width={36} height={36} />
        </UserInfoIconBox>
        <UserInfoFields>
          {/* 지역설정/시도 */}
          <UserInfoFieldRow>
            <UserInfoPair>
              <UserInfoLabel>지역설정</UserInfoLabel>
              <UserInfoSelect value={region} disabled>
                <option>{region}</option>
              </UserInfoSelect>
            </UserInfoPair>
            <UserInfoPair>
              <UserInfoLabel>시/도</UserInfoLabel>
              <UserInfoSelect value={city} disabled>
                <option>{city}</option>
              </UserInfoSelect>
            </UserInfoPair>
          </UserInfoFieldRow>
          <UserInfoFieldRow>
            <UserInfoLabel>멜픽 URL</UserInfoLabel>
            <span
              style={{
                width: 90,
                fontWeight: 800,
                fontSize: 12,
                color: '#aaa',
                display: 'inline-block',
                lineHeight: '40px',
                height: 40,
                background: 'none',
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                paddingLeft: 10,
                paddingRight: 0,
              }}
            >
              {melpikUrl}
            </span>
            <UserInfoInput readOnly value={melpikId} style={{ width: 180, marginLeft: 0 }} />
          </UserInfoFieldRow>
        </UserInfoFields>
      </UserInfoGroup>
    </UserInfoContainer>
  );
};

const tabOptions = [
  { value: 0, label: '0 - 내 스타일' },
  { value: 1, label: '1 - 배송지 설정' },
  { value: 2, label: '2 - 이용내역' },
  { value: 3, label: '3 - 이용권 내역' },
  { value: 4, label: '4 - 포인트 내역' },
  { value: 5, label: '5 - 제품평가' },
  { value: 6, label: '6 - 결제수단' },
  { value: 7, label: '7 - 내 옷장 목록' },
];

// 헤더 컨테이너 (타이틀과 버튼을 감싸는 박스)
const HeaderContainer = styled.div`
  background: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 20px 0px 0px 0px;
  padding: 1rem;
  margin-bottom: 24px;
  width: 100%;

  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

// 상단 타이틀 row
const TitleRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  margin-bottom: 0;
  margin-top: 0;
`;
const PageTitle = styled.h1`
  font-style: normal;
  font-weight: 800;
  font-size: 16px;
  line-height: 28px;
  color: #222;
  margin: 0 0 18px 0;
`;
// 버튼 row (목록이동/변경저장/삭제)
const ButtonRow = styled.div`
  width: 100%;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;
const BackButtonBox = styled.div`
  display: flex;
  align-items: center;
`;
const BackButton = styled.button`
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  background: #fff;

  color: #222;

  font-weight: 700;
  font-size: 13px;
  border-radius: 8px 0px 0px 8px;
  padding: 8px 18px;
  cursor: pointer;
  gap: 6px;
`;
const SaveDeleteButtonBox = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;
const SaveButton = styled.button`
  box-sizing: border-box;
  width: 100px;
  height: 40px;
  background: #000;
  color: #fff;
  border: 1px solid #000;
  border-radius: 8px 0 0 8px;

  font-style: normal;
  font-weight: 700;
  font-size: 12px;
  line-height: 13px;
  text-align: center;
  cursor: pointer;
  position: relative;
  z-index: 1;
`;
const DeleteButton = styled.button`
  box-sizing: border-box;
  width: 100px;
  height: 40px;
  background: #fff;
  color: #000;
  border: 1px solid #000;
  border-left: none;
  border-radius: 0 8px 8px 0;

  font-style: normal;
  font-weight: 700;
  font-size: 12px;
  line-height: 13px;
  text-align: center;
  cursor: pointer;
  position: relative;
  z-index: 1;
`;
