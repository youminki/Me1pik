import * as yup from 'yup';

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
