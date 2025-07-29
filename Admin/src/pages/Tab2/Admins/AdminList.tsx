// src/pages/AdminList.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  getAllAdmins,
  getActiveAdmins,
  getBlockedAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdminCount,
  AdminCreateRequest,
  AdminUpdateRequest,
} from '@/api/admin';
import { IoArrowBackOutline, IoArrowForwardOutline } from 'react-icons/io5';
import { FaSearch } from 'react-icons/fa';
import UserInfoIcon1 from '@/assets/UserDetail/UserInfoIcon1.svg';
import UserInfoIcon2 from '@/assets/UserDetail/UserInfoIcon2.svg';
// import UserInfoIcon2 from '../../../assets/UserDetail/UserInfoIcon2.svg'; // 미사용 제거

// UserDetail.tsx 에서 쓰던 입력/셀렉트 박스 스타일 그대로 가져오기
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
} from '@/components/Common/UserInfoBox';

import AdminModal from '@/components/Modal/AdminModal';
import TwoButtonModal from '@/components/TwoButtonModal';
import SearchSubHeader, { TabItem } from '@/components/Header/SearchSubHeader';
import { advancedSearchFilter, normalize } from '@/utils/advancedSearch';

// (1) 관리자 상세 더미 데이터 및 폼(간단 예시)
// const permissionGroups = [
//   { label: '관리자 관리', checked: true },
//   { label: '분석정보', checked: true },
//   { label: '회원관리', checked: true },
//   { label: '회원등급 관리', checked: false },
//   { label: '회원평가', checked: false },
//   { label: '멜픽 페이지', checked: false },
//   { label: '멜픽 판매내역', checked: false },
//   { label: '멜픽 정산내역', checked: false },
//   { label: '제품관리', checked: false },
//   { label: '브랜드 관리', checked: false },
//   { label: '이용권 내역', checked: false },
//   { label: '대여내역', checked: false },
//   { label: '구매내역', checked: false },
//   { label: '멜픽 구매내역', checked: false },
//   { label: '공지사항', checked: false },
//   { label: '이용약관', checked: false },
//   { label: '개인정보보호', checked: false },
//   { label: 'FAQ', checked: false },
// ];

// AdminRow 타입 선언 (화면 표시용)
type AdminRow = {
  no: number;
  status: string;
  id: string;
  team: string;
  name: string;
  email: string;
  lastLogin: string;
  registeredAt: string;
};

type AdminResponse = {
  no: number;
  status: string;
  id: string;
  role?: string;
  name: string;
  email: string;
  lastLogin?: string;
  signupDate?: string;
  createdAt?: string;
};

import { COMMON_STYLES } from 'src/styles/commonStyles';

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
      disabled={page === 1}
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
      disabled={page === totalPages}
    >
      <IoArrowForwardOutline size={24} />
    </button>
  </div>
);

// Chip 컴포넌트 (다른 페이지와 동일한 스타일)
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

const AdminList: React.FC = () => {
  const [adminData, setAdminData] = useState<AdminRow[]>([]);
  const [allAdminData, setAllAdminData] = useState<AdminRow[]>([]); // 전체 데이터 저장
  const [totalCount, setTotalCount] = useState(0);
  const [selectedAdminNo, setSelectedAdminNo] = useState<number | null>(null);
  const [selectedAdminDetail, setSelectedAdminDetail] = useState<AdminResponse | null>(null);
  const [editFields, setEditFields] = useState<AdminResponse | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false); // 스켈레톤용
  const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태 추가
  const [currentTab, setCurrentTab] = useState('all'); // 현재 탭 상태 추가
  const limit = 10;

  type ModalState =
    | { mode: null }
    | { mode: 'create' }
    | {
        mode: 'edit';
        data: Partial<AdminCreateRequest & { password?: string }>;
      };

  const [modal, setModal] = useState<ModalState>({ mode: null });

  // 공통 헤더용 탭 설정
  const TABS: TabItem[] = [
    { label: '전체보기', path: 'all' },
    { label: '정상', path: 'active' },
    { label: '블럭', path: 'blocked' },
  ];

  // 검색어 키워드 분리 (공백 기준)
  const chipKeywords = useMemo(() => searchTerm.trim().split(/\s+/).filter(Boolean), [searchTerm]);

  const handlePageChange = (p: number) => {
    if (p < 1 || p > Math.max(1, Math.ceil(totalCount / limit))) return;
    setPage(p);
  };

  const fetchAdmins = useCallback(async () => {
    setIsLoading(true);
    try {
      let res;
      if (currentTab === 'all') {
        res = await getAllAdmins(limit, page, searchTerm);
      } else if (currentTab === 'active') {
        res = await getActiveAdmins(limit, page, searchTerm);
      } else if (currentTab === 'blocked') {
        res = await getBlockedAdmins(limit, page, searchTerm);
      } else {
        res = await getAllAdmins(limit, page, searchTerm);
      }

      const mappedData = res.admins.map((admin: AdminResponse) => ({
        no: admin.no,
        status: admin.status,
        id: admin.id,
        team: admin.role || '',
        name: admin.name,
        email: admin.email,
        lastLogin: admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString('ko-KR') : '-',
        registeredAt: admin.signupDate
          ? new Date(admin.signupDate).toLocaleDateString('ko-KR')
          : admin.createdAt
            ? new Date(admin.createdAt).toLocaleDateString('ko-KR')
            : '-',
      }));

      setAllAdminData(mappedData);
      setTotalCount(res.total);
      setAdminData(mappedData);
    } catch (err) {
      console.error('관리자 데이터 로드 실패', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, currentTab, searchTerm]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // 클라이언트 사이드 필터링
  const filteredAdminData = useMemo(() => {
    if (!searchTerm.trim()) {
      return allAdminData;
    }

    const keywords = normalize(searchTerm).split(/\s+/).filter(Boolean);

    return allAdminData.filter((admin) =>
      advancedSearchFilter({
        item: admin,
        keywords,
        fields: ['no', 'name', 'email', 'team', 'status'],
      }),
    );
  }, [allAdminData, searchTerm]);

  // 필터링된 데이터의 총 개수
  const filteredTotalCount = useMemo(() => filteredAdminData.length, [filteredAdminData]);

  // 페이지네이션을 위한 데이터
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredAdminData.slice(startIndex, startIndex + limit);
  }, [filteredAdminData, page, limit]);

  const handleEdit = (email: string) => {
    const admin = paginatedData.find((a) => a.email === email);
    if (admin) setSelectedAdminNo(admin.no);
  };

  const selectedAdmin = paginatedData.find((a) => a.no === selectedAdminNo);
  // 상세정보 fetch
  useEffect(() => {
    if (selectedAdmin && selectedAdmin.id) {
      getAdminById(selectedAdmin.id)
        .then((data) => {
          setSelectedAdminDetail(data);
          setEditFields(data); // 상세 조회시 수정필드도 동기화
        })
        .catch(() => {
          setSelectedAdminDetail(null);
          setEditFields(null);
        });
    } else {
      setSelectedAdminDetail(null);
      setEditFields(null);
    }
  }, [selectedAdmin]);

  // 수정 입력 핸들러
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editFields) return;
    const { name, value } = e.target;
    setEditFields({ ...editFields, [name]: value });
  };

  // 수정 저장
  const handleSaveEdit = async () => {
    if (!editFields) return;
    await updateAdmin(editFields.id, {
      name: editFields.name,
      email: editFields.email,
      role: editFields.role || '',
      status: editFields.status || '',
    });
    fetchAdmins();
    getAdminById(editFields.id).then(setSelectedAdminDetail);
    alert('수정되었습니다.');
  };

  // 삭제 모달 핸들러
  const handleDeleteClick = () => setShowDeleteModal(true);
  const handleDeleteConfirm = async () => {
    if (!selectedAdminDetail) return;
    await deleteAdmin(selectedAdminDetail.id);
    setSelectedAdminNo(null);
    setSelectedAdminDetail(null);
    setEditFields(null);
    fetchAdmins();
    setShowDeleteModal(false);
  };

  const totalPages = Math.max(1, Math.ceil(filteredTotalCount / limit));

  // 탭 변경 핸들러
  const handleTabChange = async (tab: TabItem) => {
    setCurrentTab(tab.path);
    setSearchTerm(''); // 탭 변경 시 검색어 초기화
    setPage(1); // 페이지 초기화
  };

  // 검색 핸들러 추가
  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
    setPage(1); // 검색 시 페이지 초기화
  };

  // Chip 삭제 핸들러
  const handleDeleteChip = (chip: string) => {
    const newKeywords = chipKeywords.filter((k) => k !== chip);
    const newSearch = newKeywords.join(' ');
    setSearchTerm(newSearch);
    setPage(1); // 페이지 초기화
  };

  // 전체 관리자 수 조회
  useEffect(() => {
    getAdminCount().then((res) => setTotalCount(res.total));
  }, []);

  // 관리자 등록 핸들러
  const handleRegisterAdmin = () => setModal({ mode: 'create' });

  const handleModalSubmit = async (data: AdminCreateRequest | AdminUpdateRequest) => {
    try {
      if (modal.mode === 'create') {
        await createAdmin(data as AdminCreateRequest);
        alert('관리자가 등록되었습니다.');
      } else if (modal.mode === 'edit' && selectedAdminDetail) {
        await updateAdmin(selectedAdminDetail.id, data as AdminUpdateRequest);
        alert('수정되었습니다.');
      }
      setModal({ mode: null });
      fetchAdmins();
      if (selectedAdminDetail) getAdminById(selectedAdminDetail.id).then(setSelectedAdminDetail);
    } catch (err: unknown) {
      if (isAxiosError409(err) || isNestError409(err) || isAlreadyExistsMessage(err)) {
        alert('이미 존재하는 아이디 또는 이메일입니다.');
      } else {
        alert('등록에 실패했습니다.');
      }
      console.error('관리자 등록/수정 실패', err);
    }
  };

  // 타입 가드 함수 내부에 위치
  function isAxiosError409(err: unknown): boolean {
    return (
      typeof err === 'object' &&
      err !== null &&
      'response' in err &&
      typeof (err as { response?: { status?: number } }).response === 'object' &&
      (err as { response?: { status?: number } }).response?.status === 409
    );
  }
  function isNestError409(err: unknown): boolean {
    return (
      typeof err === 'object' &&
      err !== null &&
      'statusCode' in err &&
      (err as { statusCode?: number }).statusCode === 409
    );
  }
  function isAlreadyExistsMessage(err: unknown): boolean {
    if (
      typeof err === 'object' &&
      err !== null &&
      'message' in err &&
      typeof (err as { message?: string }).message === 'string'
    ) {
      const message = (err as { message?: string }).message;
      return !!message && message.includes('already exists');
    }
    return false;
  }

  return (
    <Container>
      <SearchSubHeader tabs={TABS} onTabChange={handleTabChange} onSearch={handleSearch} />

      <ProductRowHeader>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 900, fontSize: 14, margin: '10px 0' }}>
            총 {filteredTotalCount}
          </div>
          {/* Chip row: TotalCount 오른쪽에 한 줄로 정렬 */}
          {chipKeywords.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', marginLeft: 12, minWidth: 0 }}>
              {chipKeywords.map((chip) => (
                <Chip key={chip} label={chip} onDelete={() => handleDeleteChip(chip)} />
              ))}
            </div>
          )}
        </div>
        <div />
      </ProductRowHeader>

      <MainFlexRow>
        <LeftBox>
          <TableWrapper>
            <Table>
              <colgroup>
                <col style={{ width: '10%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '35%' }} />
                <col style={{ width: '20%' }} />
              </colgroup>
              <thead>
                <tr>
                  <Th>번호</Th>
                  <Th>관리자</Th>
                  <Th>구분</Th>
                  <Th>아이디</Th>
                  <Th>상태</Th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 10 }).map((_, idx) => (
                      <Tr key={`skeleton-${idx}`}>
                        <Td colSpan={5}>
                          <SkeletonRow />
                        </Td>
                      </Tr>
                    ))
                  : paginatedData.map((row) => (
                      <Tr key={row.no} onClick={() => handleEdit(row.email)}>
                        <Td>{row.no}</Td>
                        <Td>{row.name}</Td>
                        <Td>{row.team}</Td>
                        <Td>{row.email}</Td>
                        <Td>{row.status === 'active' ? '활성' : '비활성'}</Td>
                      </Tr>
                    ))}
              </tbody>
            </Table>
          </TableWrapper>
          <FooterRow>
            <RegisterButton onClick={handleRegisterAdmin}>관리자 등록</RegisterButton>
            <PaginationControls
              page={page}
              totalPages={totalPages}
              onPrev={() => handlePageChange(page - 1)}
              onNext={() => handlePageChange(page + 1)}
            />
          </FooterRow>
        </LeftBox>

        <RightBox>
          <ContentCard>
            {selectedAdminDetail && editFields ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: 12 }}>
                    번호 <b>{selectedAdminDetail.no}</b>
                  </span>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      style={{
                        width: 100,
                        height: 40,
                        border: '1px solid #222',
                        background: '#fff',
                        color: '#222',
                        fontWeight: 500,
                        fontSize: 16,
                        padding: 0,
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                      onClick={handleDeleteClick}
                    >
                      삭제
                    </button>
                    <button
                      style={{
                        width: 100,
                        height: 40,
                        border: 'none',
                        background: '#000',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 16,
                        padding: 0,
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                      onClick={handleSaveEdit}
                      disabled={!editFields}
                    >
                      정보수정
                    </button>
                  </div>
                </div>
                <UserInfoContainer>
                  <UserInfoGroup>
                    <UserInfoIconBox>
                      <img src={UserInfoIcon1} alt="아이콘" style={{ width: 36, height: 36 }} />
                    </UserInfoIconBox>
                    <UserInfoFields>
                      <UserInfoFieldRow>
                        <UserInfoLabel>아이디</UserInfoLabel>
                        <UserInfoInput name="id" value={editFields.id} disabled />
                      </UserInfoFieldRow>
                      <UserInfoFieldRow>
                        <UserInfoLabel>이름</UserInfoLabel>
                        <UserInfoInput
                          name="name"
                          value={editFields.name}
                          onChange={handleFieldChange}
                          disabled={!editFields}
                        />
                      </UserInfoFieldRow>
                      <UserInfoFieldRow>
                        <UserInfoLabel>이메일</UserInfoLabel>
                        <UserInfoInput
                          name="email"
                          value={editFields.email}
                          onChange={handleFieldChange}
                          disabled={!editFields}
                        />
                      </UserInfoFieldRow>
                      <UserInfoFieldRow>
                        <UserInfoPair>
                          <UserInfoLabel>구분설정</UserInfoLabel>
                          <UserInfoSelect
                            name="role"
                            value={editFields.role || ''}
                            onChange={handleFieldChange}
                            disabled={!editFields}
                          >
                            <option value="멤버">멤버</option>
                            <option value="외부">외부</option>
                          </UserInfoSelect>
                        </UserInfoPair>
                      </UserInfoFieldRow>
                    </UserInfoFields>
                  </UserInfoGroup>
                  <UserInfoDivider />
                  {/* 회색 비활성화된 상태표시/설정, 권한 체크박스 등 복구 */}
                  <UserInfoGroup>
                    <UserInfoIconBox>
                      <img src={UserInfoIcon2} alt="아이콘" style={{ width: 36, height: 36 }} />
                    </UserInfoIconBox>
                    <UserInfoFields>
                      <UserInfoFieldRow>
                        <UserInfoLabel>상태표시</UserInfoLabel>
                        <UserInfoSelect
                          value={editFields.status || ''}
                          disabled
                          style={{ background: '#f5f5f5', color: '#aaa' }}
                        >
                          <option value="active">정상</option>
                          <option value="blocked">차단</option>
                        </UserInfoSelect>
                      </UserInfoFieldRow>
                      <UserInfoFieldRow>
                        <UserInfoLabel>설정</UserInfoLabel>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16,
                            height: 40,
                          }}
                        >
                          <label
                            style={{
                              color: '#aaa',
                              display: 'flex',
                              alignItems: 'center',
                              margin: 0,
                            }}
                          >
                            <input type="checkbox" checked disabled style={{ marginRight: 4 }} />{' '}
                            관리자
                          </label>
                          <label
                            style={{
                              color: '#aaa',
                              display: 'flex',
                              alignItems: 'center',
                              margin: 0,
                            }}
                          >
                            <input type="checkbox" checked disabled style={{ marginRight: 4 }} />{' '}
                            회원
                          </label>
                          <label
                            style={{
                              color: '#aaa',
                              display: 'flex',
                              alignItems: 'center',
                              margin: 0,
                            }}
                          >
                            <input type="checkbox" disabled style={{ marginRight: 4 }} /> 서비스
                          </label>
                          <label
                            style={{
                              color: '#aaa',
                              display: 'flex',
                              alignItems: 'center',
                              margin: 0,
                            }}
                          >
                            <input type="checkbox" disabled style={{ marginRight: 4 }} /> 고객센터
                          </label>
                        </div>
                      </UserInfoFieldRow>
                    </UserInfoFields>
                  </UserInfoGroup>
                  <UserInfoDivider />
                  <UserInfoGroup>
                    <UserInfoFields>
                      <div
                        style={{
                          border: '1px solid #ccc',

                          padding: 0,
                          marginTop: 12,
                          background: '#fff',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0,
                        }}
                      >
                        {/* 1번째 줄: 2개 그룹 */}
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 32,
                            borderBottom: '1px solid #eee',
                            padding: '1rem',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              flex: 1,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked
                              disabled
                              style={{
                                accentColor: '#FFB300',
                                width: 24,
                                height: 24,
                                marginRight: 16,
                              }}
                            />
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: 12,
                                color: '#222',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              관리자 관리
                            </span>
                            <span
                              style={{
                                color: '#ccc',
                                margin: '0 8px',
                                fontWeight: 700,
                                fontSize: 12,
                              }}
                            >
                              /
                            </span>
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: 12,
                                color: '#222',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              분석정보
                            </span>
                          </div>
                          <div style={{ flex: 1 }}></div>
                        </div>
                        {/* 2번째 줄: 2개 그룹 */}
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 32,
                            borderBottom: '1px solid #eee',
                            padding: '1rem',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              flex: 1,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked
                              disabled
                              style={{
                                accentColor: '#FFB300',
                                width: 24,
                                height: 24,
                                marginRight: 16,
                              }}
                            />
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: 12,
                                color: '#222',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              회원관리
                            </span>
                            <span
                              style={{
                                color: '#ccc',
                                margin: '0 8px',
                                fontWeight: 700,
                                fontSize: 12,
                              }}
                            >
                              /
                            </span>
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: 12,
                                color: '#222',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              회원등급 관리
                            </span>
                            <span
                              style={{
                                color: '#ccc',
                                margin: '0 8px',
                                fontWeight: 700,
                                fontSize: 12,
                              }}
                            >
                              /
                            </span>
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: 12,
                                color: '#222',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              회원평가
                            </span>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              flex: 1,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked
                              disabled
                              style={{
                                accentColor: '#FFB300',
                                width: 24,
                                height: 24,
                                marginRight: 16,
                              }}
                            />
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: 12,
                                color: '#222',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              멜픽 페이지
                            </span>
                            <span
                              style={{
                                color: '#ccc',
                                margin: '0 8px',
                                fontWeight: 700,
                                fontSize: 12,
                              }}
                            >
                              /
                            </span>
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: 12,
                                color: '#222',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              멜픽 판매내역
                            </span>
                            <span
                              style={{
                                color: '#ccc',
                                margin: '0 8px',
                                fontWeight: 700,
                                fontSize: 12,
                              }}
                            >
                              /
                            </span>
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: 12,
                                color: '#222',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              멜픽 정산내역
                            </span>
                          </div>
                        </div>
                        {/* 3번째 줄: 2개 그룹 */}
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 32,
                            borderBottom: '1px solid #eee',
                            padding: '1rem',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              flex: 1,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked
                              disabled
                              style={{
                                accentColor: '#FFB300',
                                width: 24,
                                height: 24,
                                marginRight: 16,
                              }}
                            />
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: 12,
                                color: '#222',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              제품관리
                            </span>
                            <span
                              style={{
                                color: '#ccc',
                                margin: '0 8px',
                                fontWeight: 700,
                                fontSize: 12,
                              }}
                            >
                              /
                            </span>
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: 12,
                                color: '#222',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              브랜드 관리
                            </span>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              flex: 1,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked
                              disabled
                              style={{
                                accentColor: '#FFB300',
                                width: 24,
                                height: 24,
                                marginRight: 16,
                              }}
                            />
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: 12,
                                color: '#222',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              이용권 내역
                            </span>
                            <span
                              style={{
                                color: '#ccc',
                                margin: '0 8px',
                                fontWeight: 700,
                                fontSize: 12,
                              }}
                            >
                              /
                            </span>
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: 12,
                                color: '#222',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              대여내역
                            </span>
                            <span
                              style={{
                                color: '#ccc',
                                margin: '0 8px',
                                fontWeight: 700,
                                fontSize: 12,
                              }}
                            >
                              /
                            </span>
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: 12,
                                color: '#222',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              구매내역
                            </span>
                            <span
                              style={{
                                color: '#ccc',
                                margin: '0 8px',
                                fontWeight: 700,
                                fontSize: 12,
                              }}
                            >
                              /
                            </span>
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: 12,
                                color: '#222',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              멜픽 구매내역
                            </span>
                          </div>
                        </div>
                        {/* 4번째 줄: 한 줄 전체 */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '1rem',
                          }}
                        >
                          <input
                            type="checkbox"
                            disabled
                            style={{
                              accentColor: '#FFB300',
                              width: 24,
                              height: 24,
                              marginRight: 16,
                            }}
                          />
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: 12,
                              color: '#222',
                            }}
                          >
                            공지사항
                          </span>
                          <span
                            style={{
                              color: '#ccc',
                              margin: '0 8px',
                              fontWeight: 700,
                              fontSize: 12,
                            }}
                          >
                            /
                          </span>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: 12,
                              color: '#222',
                            }}
                          >
                            이용약관
                          </span>
                          <span
                            style={{
                              color: '#ccc',
                              margin: '0 8px',
                              fontWeight: 700,
                              fontSize: 12,
                            }}
                          >
                            /
                          </span>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: 12,
                              color: '#222',
                            }}
                          >
                            개인정보보호
                          </span>
                          <span
                            style={{
                              color: '#ccc',
                              margin: '0 8px',
                              fontWeight: 700,
                              fontSize: 12,
                            }}
                          >
                            /
                          </span>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: 12,
                              color: '#222',
                            }}
                          >
                            FAQ
                          </span>
                        </div>
                      </div>
                    </UserInfoFields>
                  </UserInfoGroup>
                </UserInfoContainer>
                <TwoButtonModal
                  isOpen={showDeleteModal}
                  onClose={() => setShowDeleteModal(false)}
                  onConfirm={handleDeleteConfirm}
                  title="관리자 삭제"
                >
                  정말 삭제하시겠습니까?
                </TwoButtonModal>
              </>
            ) : (
              <Placeholder>관리자를 선택하세요</Placeholder>
            )}
          </ContentCard>
        </RightBox>
      </MainFlexRow>

      {modal.mode && (
        <AdminModal
          mode={modal.mode}
          initialData={
            modal.mode === 'edit' && selectedAdminDetail ? selectedAdminDetail : undefined
          }
          onSubmit={handleModalSubmit}
          onClose={() => setModal({ mode: null })}
        />
      )}
    </Container>
  );
};

// === styled-components ===

const Container = styled.div`
  width: 100%;
  min-width: 834px;
  max-width: 100vw;
  /* min-height: 1194px; */
  /* max-height: 100vh; */
  margin: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: #fff;
  /* overflow: hidden; */

  @media (max-width: 834px) {
    min-width: 100vw;
    padding: 0 8px;
  }
  @media (max-height: 1194px) {
    /* min-height: 100vh; */
  }
`;

const MainFlexRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 24px;
  width: 100%;
  background: #fff;
`;

const LeftBox = styled.div`
  flex: 1 1 0;
  width: 100%;

  background: #fff;
  border: 1px solid #eee;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  min-width: 0;
  box-sizing: border-box;
`;

const RightBox = styled.div`
  flex: 1 1 0;
  width: 100%;
  background: #fff;
  border: 1px solid #eee;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  min-width: 0;
  padding: 1rem;
  box-sizing: border-box;
`;

const ContentCard = styled.div`
  width: 100%;
  background: #fff;
  min-width: 400px;
  max-width: 900px;
`;

const ProductRowHeader = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: flex-start;
`;

const TableWrapper = styled.div`
  width: 100%;
  background: #fff;
  overflow-x: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
`;

const Th = styled.th`
  background: #fafafa;
  font-weight: 700;
  font-size: 14px;
  color: #222;
  padding: 4px 0;
  border-bottom: 1px solid #eee;
  text-align: center;
  height: 51px;
`;

const Td = styled.td`
  font-size: 14px;
  color: #222;
  padding: 4px 0;
  border-bottom: 1px solid #eee;
  text-align: center;
  height: 51px;
`;

const Tr = styled.tr`
  background: #fff;
  cursor: pointer;
  &:hover {
    background: #f8f9fa;
  }
`;

const FooterRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;

  min-width: 0;
`;

const RegisterButton = styled.button`
  width: 120px;
  height: 40px;
  background: #000;
  color: #fff;
  border: none;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
`;

const Placeholder = styled.div`
  padding: 24px;
  color: #aaa;
  text-align: center;
`;

const SkeletonRow = styled.div`
  width: 100%;
  height: 40px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.2s infinite linear;
  border-radius: 8px;
  @keyframes skeleton-loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

export default AdminList;
