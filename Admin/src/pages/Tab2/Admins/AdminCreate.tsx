// src/pages/Tab2/Admins/AdminCreate.tsx

import React, { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import SettingsDetailSubHeader, {
  DetailSubHeaderProps,
} from '@components/Header/SettingsDetailSubHeader';
import ShippingTabBar from '@components/TabBar'; // 탭바 컴포넌트 임포트
import { createAdmin, AdminCreateRequest } from '@api/admin';

const AdminCreate: React.FC = () => {
  const navigate = useNavigate();

  // 탭 인덱스 상태
  const [activeTab, setActiveTab] = useState<number>(0);

  // 폼 입력값 상태 관리
  const [formData, setFormData] = useState<AdminCreateRequest>({
    id: '',
    name: '',
    password: '',
    email: '',
    role: 'admin',
    status: 'active',
  });

  const [, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 입력 필드 변경 핸들러
  const handleChange =
    (key: keyof AdminCreateRequest) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData((prev) => ({
        ...prev,
        [key]: e.target.value,
      }));
    };

  // 저장 버튼 클릭 시 모달 없이 바로 API 호출
  const handleSave = async () => {
    setErrorMessage(null);

    // 간단한 유효성 검사
    if (
      !formData.id.trim() ||
      !formData.name.trim() ||
      !formData.password.trim() ||
      !formData.email.trim()
    ) {
      setErrorMessage('모든 필드를 빠짐없이 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createAdmin(formData); // POST /admin 호출
      // 생성 완료 후 목록 페이지로 이동
      navigate('/adminlist');
    } catch (err: any) {
      console.error('관리자 생성 오류', err);
      setErrorMessage(err?.response?.data?.message || '관리자 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 취소 버튼 클릭 시 목록으로 돌아가기
  const handleCancel = () => {
    navigate('/adminlist');
  };

  // SettingsDetailSubHeader에 내려줄 props
  const detailProps: DetailSubHeaderProps = {
    backLabel: '목록이동',
    onBackClick: handleCancel,
    editLabel: '등록하기',
    onEditClick: handleSave,
    endLabel: '취소',
    onEndClick: handleCancel,
  };

  return (
    <Container>
      {/* === 헤더 영역 === */}
      <HeaderRow>
        <Title>관리자 등록</Title>
      </HeaderRow>

      {/* === 상단 서브헤더: 뒤로가기 / 등록하기 / 취소 버튼 === */}
      <SettingsDetailSubHeader {...detailProps} />

      {/* === 대시형 구분선 === */}
      <DividerDashed />

      {/* === 탭바: 관리자 정보 탭 === */}
      <ShippingTabBar tabs={['관리자 정보']} activeIndex={activeTab} onTabClick={setActiveTab} />

      {/* === 탭 콘텐츠: activeTab === 0 일 때 폼 표시 === */}
      {activeTab === 0 && (
        <FormBox>
          {errorMessage && <ErrorText>{errorMessage}</ErrorText>}

          <Row>
            <Field>
              <label htmlFor="id">아이디</label>
              <input
                type="text"
                id="id"
                value={formData.id}
                onChange={handleChange('id')}
                placeholder="예: admin1"
              />
            </Field>
          </Row>

          <Row>
            <Field>
              <label htmlFor="name">이름</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange('name')}
                placeholder="예: 김철수"
              />
            </Field>
          </Row>

          <Row>
            <Field>
              <label htmlFor="password">비밀번호</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange('password')}
                placeholder="비밀번호를 입력하세요"
              />
            </Field>
          </Row>

          <Row>
            <Field>
              <label htmlFor="email">이메일</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange('email')}
                placeholder="예: admin1@example.com"
              />
            </Field>
          </Row>

          <Row>
            <Field>
              <label htmlFor="role">역할(Role)</label>
              <select id="role" value={formData.role} onChange={handleChange('role')}>
                <option value="admin">admin</option>
                {/* 필요에 따라 옵션 추가 */}
              </select>
            </Field>
          </Row>

          <Row>
            <Field>
              <label htmlFor="status">상태(Status)</label>
              <select id="status" value={formData.status} onChange={handleChange('status')}>
                <option value="active">active</option>
                <option value="blocked">blocked</option>
                {/* 필요에 따라 옵션 추가 */}
              </select>
            </Field>
          </Row>

          {/* 숨겨진 submit 버튼 (엔터 입력 시에도 동작하도록) */}
          <button type="submit" style={{ display: 'none' }} />
        </FormBox>
      )}
    </Container>
  );
};

export default AdminCreate;

/* ====================== Styled Components ====================== */

const Container = styled.div`
  width: 100%;
  height: 100%;
  max-width: 100vw;
  margin: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: #fff;
  overflow: hidden;
  padding: 12px 8px 0 8px;

  @media (max-width: 834px) {
    min-width: 100vw;
    padding: 0 4px;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const Title = styled.h1`
  font-weight: 700;
  font-size: 16px;
`;

const DividerDashed = styled.hr`
  border-top: 1px dashed #ddd;
  margin: 24px 0;
`;

const FormBox = styled.div`
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 0 4px 4px 4px;
`;

const Row = styled.div`
  display: flex;

  & + & {
    border-top: 1px solid #ddd;
  }
`;

const Field = styled.div`
  width: 100%;
  min-width: 300px;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  box-sizing: border-box;

  &:not(:last-child) {
    border-right: 1px solid #ddd;
  }

  label {
    width: 80px;
    font-size: 12px;
    font-weight: 700;
    margin-right: 8px;
    text-align: center;
  }

  input {
    width: 200px;
    height: 36px;
    padding: 0 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
  }

  select {
    width: 200px;
    height: 36px;
    padding: 0 8px;
    border: 1px solid #000;
    border-radius: 4px;
    box-sizing: border-box;
    background: #fff;
  }
`;

const ErrorText = styled.div`
  color: #e74c3c;
  font-size: 13px;
  margin-bottom: 18px;
  text-align: center;
`;
