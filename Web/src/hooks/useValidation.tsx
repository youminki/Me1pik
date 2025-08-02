import * as yup from 'yup';

/**
 * useValidation - 비밀번호 유효성 검사 스키마
 *
 * 비밀번호와 비밀번호 확인 입력값의 유효성을 검사하는 yup 스키마입니다.
 *
 * @description
 * - 비밀번호: 문자와 숫자를 조합하여 8~14자, 필수 입력
 * - 비밀번호 확인: 비밀번호와 일치해야 하며, 필수 입력
 *
 * @example
 * import { schema } from './useValidation';
 * // form validation에서 schema로 사용
 */
export const schema = yup
  .object({
    password: yup
      .string()
      .required('비밀번호를 문자와 숫자를 조합하여 8~14자 사이로 입력해주세요.')
      .min(8, '비밀번호는 최소 8자리 이상이어야 합니다.')
      .max(14, '비밀번호는 최대 14자리로 입력해주세요.')
      .matches(
        /^(?=.*\d)[A-Za-z\d@$!%*?&]{8,14}$/,
        '문자와 숫자를 조합하여 8~14자 사이로 입력해주세요.'
      ),
    checkPassword: yup
      .string()
      .oneOf([yup.ref('password')], '비밀번호가 일치하지 않습니다.')
      .required('비밀번호를 한번 더 입력해주세요.'),
  })
  .required();
