import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import FixedBottomBar from '../../components/FixedBottomBar';
import AddressSearchModal from '../../components/AddressSearchModal';
import {
  useAddresses,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
  Address,
  UpdateAddressRequest,
} from '../../api/address/address';

const DeliveryManagement: React.FC = () => {
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAddress, setEditAddress] = useState<string>('');
  const [editDetail, setEditDetail] = useState<string>('');
  const [editMessage, setEditMessage] = useState<string>('');

  // 주소 검색 모달 state
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // react-query로 주소 데이터 패칭
  const { data: addresses = [], isLoading } = useAddresses();
  const updateAddressMutation = useUpdateAddress();
  const deleteAddressMutation = useDeleteAddress();
  const setDefaultAddressMutation = useSetDefaultAddress();

  // 인라인 수정 시작
  const handleStartEdit = (item: Address) => {
    setEditingId(item.id);
    setEditAddress(item.address);
    setEditDetail(item.addressDetail);
    setEditMessage(item.deliveryMessage || '');
  };

  // 수정 취소
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditAddress('');
    setEditDetail('');
    setEditMessage('');
  };

  // 수정 저장
  const handleSaveEdit = async (id: number) => {
    if (!editAddress.trim() || !editDetail.trim()) {
      alert('주소와 상세주소를 모두 입력해주세요.');
      return;
    }

    const payload: UpdateAddressRequest = {
      address: editAddress,
      addressDetail: editDetail,
      deliveryMessage: editMessage,
    };

    try {
      await updateAddressMutation.mutateAsync({ id, data: payload });
      alert('배송지가 업데이트 되었습니다.');
      setEditingId(null);
      setEditAddress('');
      setEditDetail('');
      setEditMessage('');
    } catch (err) {
      console.error('주소 수정 실패:', err);
      alert('배송지 수정 중 오류가 발생했습니다.');
    }
  };

  // 주소 삭제
  const handleDelete = async (id: number) => {
    if (!window.confirm('정말 이 배송지를 삭제하시겠습니까?')) return;

    try {
      await deleteAddressMutation.mutateAsync(id);
      alert('배송지가 삭제되었습니다.');
    } catch (err) {
      console.error('주소 삭제 실패:', err);
      alert('배송지 삭제 중 오류가 발생했습니다.');
    }
  };

  // 기본 주소 설정
  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultAddressMutation.mutateAsync(id);
      alert('기본 주소로 설정되었습니다.');
    } catch (err: unknown) {
      console.error('기본 주소 설정 실패:', err);
      if (
        err instanceof Error &&
        'response' in err &&
        typeof err.response === 'object' &&
        err.response &&
        'status' in err.response &&
        err.response.status === 404
      ) {
        alert('해당 주소를 찾을 수 없습니다.');
      } else {
        alert('기본 주소 설정 중 오류가 발생했습니다.');
      }
    }
  };

  // 신규 등록 페이지로 이동
  const handleRegister = () => {
    navigate('/EditAddress');
  };

  // 모바일 키보드 열림 감지 (기존 코드 유지)
  const initialHeight = window.visualViewport
    ? window.visualViewport.height
    : window.innerHeight;
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      const vh = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;
      setIsKeyboardOpen(vh < initialHeight - 50);
    };
    const viewport = window.visualViewport ?? window;
    viewport.addEventListener('resize', handleResize);
    return () => viewport.removeEventListener('resize', handleResize);
  }, [initialHeight]);

  // 주소 검색 실행
  const handleSearch = () => {
    setSearchModalOpen(true);
  };

  return (
    <>
      <Container>
        {isLoading ? (
          <p>주소를 불러오는 중...</p>
        ) : addresses.length === 0 ? (
          <p>등록된 배송지가 없습니다.</p>
        ) : (
          addresses.map((item, idx) => {
            const isEditing = editingId === item.id;
            return (
              <Block key={item.id}>
                <Title>
                  {item.isDefault ? '배송지 (기본)' : `배송지 ${idx + 1}`}
                </Title>

                <InputGroup>
                  {isEditing ? (
                    <>
                      <SearchWrapper>
                        <SearchInput
                          value={editAddress}
                          readOnly
                          onClick={handleSearch}
                        />
                        <SearchButton onClick={handleSearch}>검색</SearchButton>
                      </SearchWrapper>
                      <DetailInput
                        value={editDetail}
                        onChange={(e) => setEditDetail(e.target.value)}
                        placeholder='상세주소를 입력하세요'
                      />
                      <MessageTitle>배송 메시지 (선택)</MessageTitle>
                      <MessageInput
                        value={editMessage}
                        placeholder='문 앞에 두고 벨 눌러주세요.'
                        onChange={(e) => setEditMessage(e.target.value)}
                      />
                    </>
                  ) : (
                    <>
                      <ReadOnlyInput readOnly value={item.address} />
                      <ReadOnlyInput readOnly value={item.addressDetail} />
                      <ReadOnlyInput
                        readOnly
                        value={item.deliveryMessage || ''}
                        placeholder='배송 메시지가 없습니다.'
                      />
                    </>
                  )}
                </InputGroup>

                <ButtonRow>
                  {/* 왼쪽: 기본주소설정 혹은 현재 기본주소 표시 */}
                  {isEditing ? (
                    <div /> /* 편집중에는 왼쪽 공간 비워둡니다 */
                  ) : item.isDefault ? (
                    <DefaultLabel>기본주소</DefaultLabel>
                  ) : (
                    <DefaultButton onClick={() => handleSetDefault(item.id)}>
                      기본주소로 설정
                    </DefaultButton>
                  )}

                  {/* 오른쪽: 편집/삭제 버튼 */}
                  <ActionButtons>
                    {isEditing ? (
                      <>
                        <ActionButton
                          onClick={() => handleSaveEdit(item.id)}
                          disabled={updateAddressMutation.isPending}
                        >
                          {updateAddressMutation.isPending
                            ? '저장 중...'
                            : '저장'}
                        </ActionButton>
                        <ActionButton onClick={handleCancelEdit}>
                          취소
                        </ActionButton>
                      </>
                    ) : (
                      <>
                        <ActionButton onClick={() => handleStartEdit(item)}>
                          편집
                        </ActionButton>
                        <ActionButton
                          onClick={() => handleDelete(item.id)}
                          disabled={deleteAddressMutation.isPending}
                        >
                          {deleteAddressMutation.isPending
                            ? '삭제 중...'
                            : '삭제'}
                        </ActionButton>
                      </>
                    )}
                  </ActionButtons>
                </ButtonRow>
              </Block>
            );
          })
        )}

        {/* 주소 검색 모달 */}
        <AddressSearchModal
          isOpen={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          onSelect={(addr: string) => {
            setEditAddress(addr);
            setSearchModalOpen(false);
          }}
        />

        {/* 하단 고정 바: 신규 등록 버튼 */}
        {!isKeyboardOpen && (
          <FixedBottomBar
            type='button'
            text='신규 등록'
            color='yellow'
            onClick={handleRegister}
          />
        )}
      </Container>
    </>
  );
};

export default DeliveryManagement;

/* Styled Components */
const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  margin-bottom: 50px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
`;

const Block = styled.div`
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
`;

const Title = styled.div`
  font-weight: 700;
  font-size: 16px;
  line-height: 18px;
  color: #000;
  margin-bottom: 16px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
`;

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 57px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const SearchInput = styled.input`
  flex: 1;
  height: 100%;
  padding-left: 16px;
  box-sizing: border-box;
  background: transparent;
  border: none;
  font-family: 'NanumSquare Neo OTF', sans-serif;
  font-weight: 400;
  font-size: 13px;
  line-height: 14px;
  color: #000;

  &::placeholder {
    color: #ddd;
  }

  &:focus {
    outline: none;
  }
`;

const SearchButton = styled.button`
  width: 69px;
  height: 34px;
  margin-right: 20px;
  background: #f6ae24;
  border: none;
  border-radius: 4px;
  font-weight: 800;
  font-size: 12px;
  line-height: 13px;
  color: #fff;
  cursor: pointer;

  &:hover {
    background: #e69e1e;
  }
`;

const DetailInput = styled.input`
  width: 100%;
  height: 57px;
  padding-left: 16px;
  box-sizing: border-box;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-weight: 400;
  font-size: 13px;
  line-height: 14px;
  color: #000;

  &::placeholder {
    color: #ddd;
  }

  &:focus {
    outline: none;
  }
`;

const MessageTitle = styled.div`
  font-weight: 700;
  font-size: 10px;
  line-height: 11px;
  color: #000;
  margin-top: 8px;
`;

const MessageInput = styled.input`
  width: 100%;
  height: 57px;
  padding-left: 16px;
  box-sizing: border-box;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-weight: 400;
  font-size: 13px;
  line-height: 14px;
  color: #000;

  &::placeholder {
    color: #ddd;
  }

  &:focus {
    outline: none;
  }
`;

const ReadOnlyInput = styled.input`
  width: 100%;
  height: 57px;
  padding-left: 16px;
  box-sizing: border-box;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-weight: 400;
  font-size: 13px;
  line-height: 14px;
  color: #666;
  cursor: not-allowed;

  &::placeholder {
    color: #999;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DefaultLabel = styled.div`
  padding: 8px 16px;
  background: #f6ae24;
  color: #fff;
  border-radius: 4px;
  font-weight: 700;
  font-size: 12px;
`;

const DefaultButton = styled.button`
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #f6ae24;
  color: #f6ae24;
  border-radius: 4px;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background: #f6ae24;
    color: #fff;
  }
`;

// 오른쪽 버튼 그룹: margin-left: auto 로 오른쪽 끝으로 밀기
const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const buttonHover = css`
  &:hover {
    opacity: 0.8;
  }
`;

const ActionButton = styled.button`
  width: 91px;
  height: 46px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  ${buttonHover}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
