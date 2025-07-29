import React, { useState } from 'react';
import styled from 'styled-components';
import { AdminCreateRequest, AdminUpdateRequest } from '@/api/admin';

interface AdminModalProps {
  mode: 'create' | 'edit';
  initialData?: Partial<AdminCreateRequest & AdminUpdateRequest>;
  onSubmit: (data: AdminCreateRequest | AdminUpdateRequest) => void | Promise<void>;
  onClose: () => void;
}

const AdminModal: React.FC<AdminModalProps> = ({ mode, initialData, onSubmit, onClose }) => {
  // 폼 상태 관리
  const [form, setForm] = useState<Partial<AdminCreateRequest & AdminUpdateRequest>>({
    id: initialData?.id || '',
    name: initialData?.name || '',
    email: initialData?.email || '',
    password: '', // 수정 시 비밀번호는 빈값
    role: initialData?.role || '멤버',
    status: initialData?.status || 'active',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: Partial<AdminCreateRequest & AdminUpdateRequest>) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleConfirm = () => {
    if (mode === 'create') {
      // 필수값 체크
      if (!form.id || !form.name || !form.email || !form.password || !form.role || !form.status) {
        alert('모든 필드를 입력해주세요.');
        return;
      }
      onSubmit(form as AdminCreateRequest);
    } else {
      // 수정 시 비밀번호 제외
      if (!form.name || !form.email || !form.role || !form.status) {
        alert('모든 필드를 입력해주세요.');
        return;
      }
      const updateData: AdminUpdateRequest = {
        name: form.name,
        email: form.email,
        role: form.role,
        status: form.status,
      };
      onSubmit(updateData);
    }
  };

  return (
    <StyledModal>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{mode === 'create' ? '관리자 등록' : '관리자 정보 수정'}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <FormRow>
            <Label>아이디</Label>
            <Input
              name="id"
              value={form.id}
              onChange={handleChange}
              disabled={mode === 'edit'}
              placeholder="아이디"
            />
          </FormRow>
          <FormRow>
            <Label>이름</Label>
            <Input name="name" value={form.name} onChange={handleChange} placeholder="이름" />
          </FormRow>
          <FormRow>
            <Label>이메일</Label>
            <Input name="email" value={form.email} onChange={handleChange} placeholder="이메일" />
          </FormRow>
          {mode === 'create' && (
            <FormRow>
              <Label>비밀번호</Label>
              <Input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="비밀번호"
              />
            </FormRow>
          )}
          <FormRow>
            <Label>구분</Label>
            <Select name="role" value={form.role} onChange={handleChange}>
              <option value="멤버">멤버</option>
              <option value="외부">외부</option>
            </Select>
          </FormRow>
          <FormRow>
            <Label>상태</Label>
            <Select name="status" value={form.status} onChange={handleChange}>
              <option value="active">정상</option>
              <option value="blocked">차단</option>
            </Select>
          </FormRow>
        </ModalBody>
        <CloseButtonWrapper>
          <NoButton onClick={onClose}>취소</NoButton>
          <YesButton onClick={handleConfirm}>{mode === 'create' ? '등록' : '수정'}</YesButton>
        </CloseButtonWrapper>
      </ModalContent>
    </StyledModal>
  );
};

export default AdminModal;

// 스타일 컴포넌트
const StyledModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 27px;
  z-index: 9999;
  width: 100vw;
  height: 100vh;
`;

const ModalContent = styled.div`
  background-color: #ffffff;
  padding: 20px;
  width: 350px;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 10px;
`;

const ModalHeader = styled.div`
  display: flex;
  flex-direction: column;
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const ModalBody = styled.div`
  font-size: 14px;
  font-weight: 400;
  text-align: left;
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
`;

const FormRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const Label = styled.label`
  width: 80px;
  font-weight: 600;
  font-size: 15px;
`;

const Input = styled.input`
  flex: 1;
  padding: 8px;
  font-size: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Select = styled.select`
  flex: 1;
  padding: 8px;
  font-size: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const CloseButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
`;

const NoButton = styled.button`
  flex: 1;
  height: 44px;
  background: #cccccc;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
`;

const YesButton = styled.button`
  flex: 1;
  height: 44px;
  background-color: #000000;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
`;
