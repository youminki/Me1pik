// src/pages/PasswordChange.tsx

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { schemaPassword } from '../hooks/ValidationYup'; // 비밀번호 검증 스키마
import InputField from '../common-components/forms/input-field';
import BottomBar from '../components/bottom-navigation-mobile';
import ResetButtonIcon from '../assets/ResetButton.png';

type FormData = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export default function PasswordChange() {
  const {
    handleSubmit,
    control,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schemaPassword),
    mode: 'onBlur',
  });

  const [isVerified, setIsVerified] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifyButtonColor, setVerifyButtonColor] = useState<'yellow' | 'blue'>(
    'yellow'
  );

  // 1단계: 현재 비밀번호 인증 (임시 처리)
  const onVerify: SubmitHandler<FormData> = async () => {
    setVerifyError(null);
    // TODO: 실제 API 호출 시 여기에 로직 넣기
    // 임시로 성공 처리
    setTimeout(() => {
      setIsVerified(true);
      setVerifyButtonColor('blue');
    }, 500);
  };

  // 2단계: 새 비밀번호 변경 (임시 처리)
  const onSubmit: SubmitHandler<FormData> = async () => {
    // TODO: 실제 API 호출 시 여기에 로직 넣기
    alert('비밀번호가 성공적으로 변경되었습니다. (임시)');
  };

  const newPwd = watch('newPassword');
  const confirmPwd = watch('confirmNewPassword');

  // 비밀번호 일치 여부 검증
  useEffect(() => {
    if (confirmPwd && newPwd !== confirmPwd) {
      setError('confirmNewPassword', {
        message: '비밀번호가 일치하지 않습니다.',
      });
    } else {
      clearErrors('confirmNewPassword');
    }
  }, [newPwd, confirmPwd, setError, clearErrors]);

  return (
    <Container>
      <Header>비밀번호 변경</Header>

      {/* 1단계: 현재 비밀번호 인증 */}
      {!isVerified ? (
        <form onSubmit={handleSubmit(onVerify)}>
          <Field>
            <Controller
              name='currentPassword'
              control={control}
              render={({ field }) => (
                <InputField
                  {...field}
                  type='password'
                  label='현재 비밀번호'
                  placeholder='현재 비밀번호를 입력하세요'
                  error={errors.currentPassword}
                  buttonLabel='인증'
                  buttonColor={verifyButtonColor}
                  onButtonClick={handleSubmit(onVerify)}
                />
              )}
            />
          </Field>
          {verifyError && <ErrorMessage>{verifyError}</ErrorMessage>}
        </form>
      ) : (
        /* 2단계: 새 비밀번호 입력 폼 */
        <form onSubmit={handleSubmit(onSubmit)}>
          <Field>
            <Controller
              name='newPassword'
              control={control}
              render={({ field }) => (
                <InputField
                  {...field}
                  type='password'
                  label='새 비밀번호'
                  placeholder='새 비밀번호를 입력하세요'
                  error={errors.newPassword}
                />
              )}
            />
          </Field>

          <Field>
            <Controller
              name='confirmNewPassword'
              control={control}
              render={({ field }) => (
                <InputField
                  {...field}
                  type='password'
                  label='새 비밀번호 확인'
                  placeholder='새 비밀번호를 다시 입력하세요'
                  error={errors.confirmNewPassword}
                />
              )}
            />
          </Field>

          <Footer>
            <BottomBar
              imageSrc={ResetButtonIcon}
              buttonText={isSubmitting ? '변경 중...' : '비밀번호 변경'}
              type='submit'
              disabled={isSubmitting || !!errors.confirmNewPassword}
            />
          </Footer>
        </form>
      )}
    </Container>
  );
}

// Styled Components

const Container = styled.div`
  max-width: 480px;
  margin: 0 auto;
  padding: 16px;
`;
const Header = styled.h1`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 24px;
`;
const Field = styled.div`
  margin-bottom: 16px;
`;
const ErrorMessage = styled.div`
  color: #e74c3c;
  text-align: center;
  margin-bottom: 16px;
`;
const Footer = styled.div`
  margin-top: 32px;
  text-align: center;
`;
