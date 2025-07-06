import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import styled from 'styled-components';
import Button from '../components/Button01';
import InputField from '../components/InputField';
import ReusableModal from '../components/ReusableModal';
import { CustomSelect } from '../components/CustomSelect';
import { findEmail } from '../api/user/userApi';
import SimpleHeader from '../components/SimpleHeader';

// 전화번호 포맷 함수
const formatPhone = (digits: string) => {
  const part1 = digits.slice(0, 3);
  const part2 = digits.length > 3 ? digits.slice(3, 7) : '';
  const part3 = digits.length > 7 ? digits.slice(7, 11) : '';
  return [part1, part2, part3].filter(Boolean).join('-');
};

// Validation schema: 이름, 태어난 해, 전화번호
const schemaFindId = yup.object().shape({
  name: yup
    .string()
    .required('이름을 입력해주세요.')
    .max(10, '이름은 최대 10자까지 입력 가능합니다.')
    .matches(/^[가-힣]+$/, '이름은 한글만 입력 가능합니다.'),
  birthYear: yup
    .string()
    .required('태어난 해를 선택해주세요.')
    .matches(/^\d{4}$/, '태어난 해는 4자리 숫자여야 합니다.'),
  phone: yup
    .string()
    .required('전화번호를 입력해주세요.')
    .matches(
      /^\d{3}-\d{4}-\d{4}$/,
      '유효한 전화번호 형식(010-1234-5678)이어야 합니다.'
    ),
});

type FormValues = yup.InferType<typeof schemaFindId>;

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

const FindId: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schemaFindId),
    mode: 'onChange',
    defaultValues: { name: '', birthYear: '', phone: '' },
  });

  // 이메일 마스킹 함수
  const maskEmail = (email: string) => {
    const [local, domain] = email.split('@');
    const masked = local.slice(0, 2) + '*****';
    return `${masked}@${domain}`;
  };

  // 폼 제출 핸들러
  const handleFindAccount = async (data: FormValues) => {
    setErrorMessage('');
    try {
      const { email } = await findEmail({
        name: data.name,
        birthYear: data.birthYear,
        phoneNumber: data.phone,
      });
      setUserEmail(maskEmail(email));
      setIsModalOpen(true);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : '이메일 찾기에 실패했습니다.'
      );
      setIsModalOpen(true);
    }
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <SimpleHeader title='아이디 찾기' />
      <Container>
        <Form onSubmit={handleSubmit(handleFindAccount)}>
          <Row>
            <Controller
              name='name'
              control={control}
              render={({ field }) => (
                <InputField
                  label='이름'
                  placeholder='홍길동'
                  error={errors.name}
                  {...field}
                  // 키 입력 시 한글 이외 입력 자동 필터링
                  onInput={(e: React.FormEvent<HTMLInputElement>) => {
                    const onlyKorean = e.currentTarget.value.replace(
                      /[^가-힣]/g,
                      ''
                    );
                    field.onChange(onlyKorean);
                  }}
                />
              )}
            />
            <Controller
              name='birthYear'
              control={control}
              render={({ field }) => (
                <InputField
                  label='태어난 해'
                  as={CustomSelect}
                  error={errors.birthYear}
                  {...field}
                >
                  <option value=''>선택하세요</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </InputField>
              )}
            />
          </Row>

          <Controller
            name='phone'
            control={control}
            render={({ field }) => (
              <InputField
                label='전화번호'
                placeholder='010-1234-5678'
                error={errors.phone}
                value={field.value}
                onChange={(e) => {
                  // 숫자만 취득, 최대 11자리
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                  const formatted = formatPhone(digits);
                  field.onChange(formatted);
                }}
              />
            )}
          />

          {errorMessage && <ErrorText>{errorMessage}</ErrorText>}

          <Button type='submit' disabled={!isValid || isSubmitting}>
            {isSubmitting ? '조회 중...' : '아이디 찾기'}
          </Button>
        </Form>

        <ReusableModal isOpen={isModalOpen} onClose={closeModal} title=' 결과'>
          <p>입력하신 정보로 찾은 이메일은 아래와 같습니다.</p>
          <EmailText>{userEmail}</EmailText>
        </ReusableModal>
      </Container>
    </>
  );
};

export default FindId;

// 스타일 정의
const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 72px 1rem 1rem 1rem; /* 헤더 높이(56px) + 여유 */
  background: #ffffff;
  border-radius: 8px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  gap: 1rem;
`;

const ErrorText = styled.div`
  color: #e74c3c;
  font-size: 0.875rem;
`;

const EmailText = styled.strong`
  display: block;
  margin-top: 0.5rem;
  font-size: 1.125rem;
  color: #2ecc71;
`;
