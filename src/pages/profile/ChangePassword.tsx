// src/pages/Profile/ChangePassword.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';

import InputField from '../../common-components/forms/input-field';
import Theme from '../../styles/Theme';
import FixedBottomBar from '../../components/fixed-bottom-bar';
import ReusableModal from '../../common-components/modals/reusable-modal';

import { changePassword } from '../../api-utils/user-managements/users/userApi';

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
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
      setModalMessage(`❌ 비밀번호 변경 중 오류가 발생했습니다: ${msg}`);
      setShowModal(true);
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
    <ThemeProvider theme={Theme}>
      <FormProvider {...methods}>
        <Container>
          <Form onSubmit={(e) => e.preventDefault()}>
            {/* 현재 비밀번호 */}
            <InputField
              label='현재 비밀번호*'
              id='currentPassword'
              type='password'
              placeholder='현재 비밀번호를 입력하세요'
              error={errors.currentPassword}
              {...register('currentPassword', {
                required: '현재 비밀번호를 입력하세요.',
              })}
            />

            {/* 새 비밀번호 (8자리 이상) */}
            <InputField
              label='새 비밀번호* (영문, 숫자, 특수문자 조합 8자리 이상)'
              id='newPassword'
              type='password'
              placeholder='새 비밀번호를 입력하세요'
              error={errors.newPassword}
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
            <InputField
              label='새 비밀번호 확인*'
              id='confirmPassword'
              type='password'
              placeholder='새 비밀번호를 다시 입력하세요'
              error={errors.confirmPassword}
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
    </ThemeProvider>
  );
};

export default ChangePassword;

/* ========== Styled Components ========== */

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;
