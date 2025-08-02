/**
 * 비밀번호 변경 페이지 컴포넌트 (ChangePassword.tsx)
 *
 * 사용자의 비밀번호를 안전하게 변경할 수 있는 페이지를 제공합니다.
 * 현재 비밀번호 확인, 새 비밀번호 입력, 비밀번호 확인을 통해
 * 보안성을 강화한 비밀번호 변경 기능을 제공합니다.
 *
 * @description
 * - 현재 비밀번호 확인
 * - 새 비밀번호 입력 및 유효성 검사
 * - 비밀번호 확인 및 일치 검증
 * - 실시간 유효성 검사
 * - 보안 강화된 비밀번호 변경
 * - 성공/실패 메시지 표시
 */

import React, { useState } from 'react';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { changePassword } from '@/api-utils/user-managements/users/userApi';
import FixedBottomBar from '@/components/fixed-bottom-bar';
import CommonField from '@/components/shared/forms/CommonField';
import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';
import ReusableModal from '@/components/shared/modals/ReusableModal';

/**
 * 비밀번호 변경 폼 데이터 인터페이스
 *
 * 비밀번호 변경 페이지에서 사용되는 폼 데이터의 구조를 정의합니다.
 * React Hook Form과 연동하여 타입 안전성을 보장합니다.
 *
 * @property currentPassword - 현재 비밀번호
 * @property newPassword - 새 비밀번호
 * @property confirmPassword - 새 비밀번호 확인
 */
export interface ChangePasswordFormData {
  currentPassword: string; // 현재 비밀번호
  newPassword: string; // 새 비밀번호
  confirmPassword: string; // 새 비밀번호 확인
}

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const methods = useForm<ChangePasswordFormData>({
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isValid, isSubmitting },
  } = methods;

  const [modalMessage, setModalMessage] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);

  const onSubmit: SubmitHandler<ChangePasswordFormData> = async (data) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setModalMessage('✅ 비밀번호가 성공적으로 변경되었습니다.');
      setShowModal(true);
    } catch (err: unknown) {
      console.error('비밀번호 변경 오류:', err);
      const msg =
        err instanceof Error &&
        'response' in err &&
        typeof err.response === 'object' &&
        err.response &&
        'data' in err.response &&
        typeof err.response.data === 'object' &&
        err.response.data &&
        'message' in err.response.data
          ? String(err.response.data.message)
          : err instanceof Error
            ? err.message
            : '알 수 없는 오류';
      setError('currentPassword', { message: msg });
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    // 성공 시 MyInfoList 또는 원하는 경로로 이동
    navigate('/MyInfoList');
  };

  // 새 비밀번호와 확인 비밀번호 일치 여부
  const newPasswordValue = watch('newPassword');

  return (
    <>
      <UnifiedHeader variant='threeDepth' title='내 정보 - 비밀번호 변경' />
      <FormProvider {...methods}>
        <Container>
          <Form onSubmit={(e) => e.preventDefault()}>
            {/* 접근성을 위한 숨겨진 사용자명 필드 */}
            <input
              type='text'
              name='username'
              autoComplete='username'
              style={{ display: 'none' }}
              aria-hidden='true'
            />

            {/* 현재 비밀번호 */}
            <CommonField
              label='현재 비밀번호*'
              id='currentPassword'
              type='password'
              placeholder='현재 비밀번호를 입력하세요'
              error={errors.currentPassword?.message}
              autoComplete='current-password'
              {...register('currentPassword', {
                required: '현재 비밀번호를 입력하세요.',
              })}
            />

            {/* 새 비밀번호 (8자리 이상) */}
            <CommonField
              label='새 비밀번호* (영문, 숫자, 특수문자 조합 8자리 이상)'
              id='newPassword'
              type='password'
              placeholder='새 비밀번호를 입력하세요'
              error={errors.newPassword?.message}
              autoComplete='new-password'
              {...register('newPassword', {
                required: '새 비밀번호를 입력하세요.',
                minLength: { value: 8, message: '8자리 이상 입력하세요.' },
                validate: (value) => {
                  // 영문, 숫자, 특수문자 조합 체크 (예시 정규식)
                  const regex =
                    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?]).{8,}$/;
                  return (
                    regex.test(value) ||
                    '영문, 숫자, 특수문자를 조합하여 8자리 이상 입력하세요.'
                  );
                },
              })}
            />

            {/* 새 비밀번호 확인 */}
            <CommonField
              label='새 비밀번호 확인*'
              id='confirmPassword'
              type='password'
              placeholder='새 비밀번호를 다시 입력하세요'
              error={errors.confirmPassword?.message}
              autoComplete='new-password'
              {...register('confirmPassword', {
                required: '비밀번호 확인을 입력하세요.',
                validate: (value) =>
                  value === newPasswordValue || '비밀번호가 일치하지 않습니다.',
              })}
            />
          </Form>

          {/* BottomBar: 키보드 열렸을 때 숨김 */}
          <FixedBottomBar
            type='button'
            text={isSubmitting ? '변경 중...' : '비밀번호 변경'}
            color='black'
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || isSubmitting}
          />

          {/* 결과 모달 */}
          {showModal && (
            <ReusableModal
              isOpen={showModal}
              onClose={handleModalClose}
              title='비밀번호 변경 결과'
            >
              {modalMessage}
            </ReusableModal>
          )}
        </Container>
      </FormProvider>
    </>
  );
};

export default ChangePassword;

/* ========== Styled Components ========== */

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;
