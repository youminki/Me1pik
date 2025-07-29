import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import UserTable, { User } from '@components/Table/UserTable';
import SubHeader, { TabItem } from '@components/Header/SearchSubHeader';
import TableWithRegisterButton from '@components/TableWithRegisterButton';
import BulkMembershipChangeUI from '@components/BulkMembershipChangeUI';
import { getAllUsers } from '@api/adminUser';
import { advancedSearchFilter, normalize } from '@utils/advancedSearch';

const tabs: TabItem[] = [
  { label: '전체보기', path: '' },
  { label: '일반회원', path: '일반' },
  { label: '블럭회원', path: '블럭' },
];

// Chip 컴포넌트 (제품 관리에서 복사)
const Chip = ({ label, onDelete }: { label: string; onDelete: () => void }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      background: '#e6f0fa',
      border: '1px solid #90caf9',
      borderRadius: 16,
      padding: '4px 14px',
      marginRight: 8,
      fontSize: 14,
      fontWeight: 500,
      color: '#1976d2',
      marginBottom: 4,
      boxShadow: '0 1px 4px rgba(25, 118, 210, 0.08)',
      transition: 'background 0.2s',
    }}
    onMouseOver={(e) => (e.currentTarget.style.background = '#bbdefb')}
    onMouseOut={(e) => (e.currentTarget.style.background = '#e6f0fa')}
  >
    {label}
    <button
      onClick={onDelete}
      style={{
        background: 'none',
        border: 'none',
        marginLeft: 8,
        cursor: 'pointer',
        fontWeight: 'bold',
        color: '#1976d2',
        fontSize: 16,
        lineHeight: 1,
        padding: 0,
        transition: 'color 0.2s',
      }}
      onMouseOver={(e) => (e.currentTarget.style.color = '#d32f2f')}
      onMouseOut={(e) => (e.currentTarget.style.color = '#1976d2')}
      aria-label="삭제"
    >
      ×
    </button>
  </span>
);

const UserList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL 쿼리: search, page, status(tab)
  const searchTerm = searchParams.get('search')?.toLowerCase().trim() ?? '';
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const statusParam = searchParams.get('status') ?? tabs[0].path;
  const matchedTab = tabs.find((t) => t.path === statusParam) || tabs[0];
  const [selectedTab, setSelectedTab] = useState<TabItem>(matchedTab);

  const limit = 10; // 페이지당 항목 수

  // 전체 사용자 데이터 (Raw)
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);

  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // 1) 전체 사용자 목록 한 번에 불러오기
  const fetchAllUsers = async () => {
    setLoadingAll(true);
    try {
      // 1-1) 총 개수 요청: limit=1, page=1으로 total 얻기
      const firstRes = await getAllUsers(1, 1);
      const totalCount = firstRes.total;

      // 1-2) 전체 데이터 요청: limit=totalCount, page=1
      const res = await getAllUsers(totalCount, 1);
      const users: User[] = res.users.map((u: unknown) => ({
        no: (u as { id: number }).id,
        email: (u as { email: string }).email,
        status:
          (u as { status: string }).status === 'active'
            ? '일반회원'
            : (u as { status: string }).status === 'blocked'
              ? '블럭회원'
              : (u as { status: string }).status,
        grade: (u as { membership?: { name: string } }).membership?.name || '',
        name: (u as { name: string }).name,
        nickname: (u as { nickname: string }).nickname,
        instagram: (u as { instagramId?: string }).instagramId || '',
        followingFollower: `${(u as { followersCount: number }).followersCount} / ${(u as { followingCount: number }).followingCount}`,
        serviceArea: (u as { address: string }).address,
        joinDate: new Date((u as { signupDate: string }).signupDate).toLocaleDateString('ko-KR'),
      }));
      setAllUsers(users);
      // 초기 선택행 해제
      setSelectedRows(new Set());
    } catch (err) {
      console.error('전체 사용자 목록을 불러오는데 실패했습니다:', err);
    } finally {
      setLoadingAll(false);
    }
  };

  // 컴포넌트 마운트 시와, 탭/검색어가 바뀔 때 전체 다시 로드
  useEffect(() => {
    fetchAllUsers();
    // statusParam이나 searchTerm이 바뀌어도 전체 재로딩?
    // 현재는 탭 변경 시 전체 다시 불러옴. 검색어는 클라이언트 필터링이므로 전체 재요청 불필요하지만,
    // 신규 사용자가 생겼을 가능성 반영 위해 탭 변경 시만 재요청해도 무방.
    // searchTerm 의존은 생략해도 됨(클라이언트 필터링).
  }, [statusParam]);

  // 탭 변경 시 URL 반영, currentPage 초기화
  const handleTabChange = (tab: TabItem) => {
    setSelectedTab(tab);
    const params = Object.fromEntries(searchParams.entries());
    params.status = tab.path;
    params.page = '1';
    setSearchParams(params);
    // fetchAllUsers(); // useEffect에서 statusParam 의존으로 자동 호출
  };

  // 2) 탭 필터링
  const dataByTab = allUsers.filter((item) =>
    selectedTab.label === '전체보기' ? true : item.status === selectedTab.label,
  );

  // 3) 검색 필터링
  const keywords = normalize(searchTerm).split(/\s+/).filter(Boolean);
  const filteredData = dataByTab.filter((item) =>
    advancedSearchFilter({
      item,
      keywords,
      fields: [
        'no',
        'email',
        'name',
        'nickname',
        'instagram',
        'followingFollower',
        'serviceArea',
        'status',
        'grade',
        'joinDate',
      ],
    }),
  );

  // 4) 페이지네이션 계산
  const totalPages = Math.max(1, Math.ceil(filteredData.length / limit));
  // URL의 page가 범위를 벗어나면 보정
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const paginated = filteredData.slice((currentPage - 1) * limit, currentPage * limit);

  const handleEdit = (no: number) => {
    const user = allUsers.find((u) => u.no === no);
    if (user) {
      navigate(`/userdetail/${encodeURIComponent(user.email)}`, {
        state: { fromQuery: window.location.search },
      });
    }
  };

  // 페이지 변경 시 URL 쿼리 반영
  const onPageChange = (p: number) => {
    const params = Object.fromEntries(searchParams.entries());
    params.page = p.toString();
    setSearchParams(params);
  };

  // 검색어 키워드 분리 (공백 기준)
  const chipKeywords = searchTerm.trim().split(/\s+/).filter(Boolean);

  // Chip 삭제 핸들러
  const handleDeleteChip = (chip: string) => {
    const newKeywords = chipKeywords.filter((k) => k !== chip);
    const newSearch = newKeywords.join(' ');
    const params = Object.fromEntries(searchParams.entries());
    if (newSearch) params.search = newSearch;
    else delete params.search;
    setSearchParams(params);
  };

  return (
    <Content>
      <HeaderTitle>회원 관리</HeaderTitle>
      <SubHeader tabs={tabs} onTabChange={handleTabChange} />

      <InfoBar>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
          <TotalCountText>Total: {filteredData.length}</TotalCountText>
          {/* Chip row: TotalCount 오른쪽에 한 줄로 정렬 */}
          {chipKeywords.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', marginLeft: 12, minWidth: 0 }}>
              {chipKeywords.map((chip) => (
                <Chip key={chip} label={chip} onDelete={() => handleDeleteChip(chip)} />
              ))}
            </div>
          )}
        </div>
        <BulkMembershipChangeUI selectedRows={selectedRows} onSuccess={fetchAllUsers} />
      </InfoBar>

      <TableWithRegisterButton
        registerButtonText="회원 등록"
        onRegisterClick={() => navigate('/user-create')}
        paginationProps={{
          totalPages,
          currentPage,
          onPageChange,
        }}
      >
        <UserTable
          filteredData={paginated}
          handleEdit={handleEdit}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          isLoading={loadingAll}
        />
      </TableWithRegisterButton>
    </Content>
  );
};

export default UserList;

/* Styled Components (생략 없이 그대로 유지) */
const Content = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  flex-grow: 1;
  font-size: 14px;
  padding: 10px;
`;
const HeaderTitle = styled.h1`
  text-align: left;
  font-weight: 700;
  font-size: 16px;
  line-height: 18px;
  color: #000000;
  margin-bottom: 18px;
`;
const InfoBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
`;
const TotalCountText = styled.div`
  font-weight: 900;
  font-size: 12px;
  color: #000000;
`;
