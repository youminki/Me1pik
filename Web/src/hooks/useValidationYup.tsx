import * as yup from 'yup';

/**
 * useValidationYup - Yup 기반의 폼 유효성 검사 스키마 모음
 *
 * 회원가입, 마이페이지, 비밀번호 변경 등 다양한 폼에 사용할 수 있는 yup 스키마를 제공합니다.
 *
 * @description
 * - schemaPassword: 비밀번호 변경 폼
 * - schemaMyStyle: 내 스타일 설정 폼
 * - schemaSignupContemporary: 컨템포러리 회원가입 폼
 * - schemaInfo: 내 정보 수정 폼
 * - schemaSignup: 일반 회원가입 폼
 * - schemaLogin: 로그인 폼
 * - schemaFindPassword: 비밀번호 찾기 폼
 * - schemaFindId: 아이디 찾기 폼
 * - schemaCardRegistration: 카드 등록 폼
 *
 * @example
 * import { schemaSignup } from './useValidationYup';
 * const schema = schemaSignup;
 */

/**
 * schemaPassword - 비밀번호 변경 폼 스키마
 *
 * 현재 비밀번호, 새 비밀번호, 비밀번호 확인을 검증합니다.
 */
export const schemaPassword = yup.object({
  currentPassword: yup.string().required('현재 비밀번호를 입력하세요.'),
  newPassword: yup
    .string()
    .required('새 비밀번호를 입력하세요.')
    .min(8, '8자 이상 작성해야 합니다.'),
  confirmNewPassword: yup
    .string()
    .required('확인을 위해 비밀번호를 다시 입력하세요.')
    .oneOf([yup.ref('newPassword')], '비밀번호가 일치하지 않습니다.'),
});

/**
 * schemaMyStyle - 내 스타일 설정 폼 스키마
 *
 * 키, 몸무게, 사이즈, 선호 브랜드 정보를 검증합니다.
 */
export const schemaMyStyle = yup.object({
  height: yup.string().required('키를 선택해주세요.'),
  size: yup.string().required('몸무게를 선택해주세요.'),
  dress: yup.string().required('원피스 사이즈를 선택해주세요.'),
  top: yup.string().required('상의 사이즈를 선택해주세요.'),
  bottom: yup.string().required('하의 사이즈를 선택해주세요.'),
  brand: yup.string().required('선호 브랜드를 선택해주세요.'),
});

/**
 * schemaSignupContemporary - 컨템포러리 회원가입 폼 스키마
 *
 * 컨템포러리 회원가입에 필요한 모든 정보를 검증합니다.
 */
export const schemaSignupContemporary = yup.object({
  height: yup.string().required('키를 선택해주세요.'),
  size: yup.string().required('사이즈를 선택해주세요.'),
  dress: yup.string().required('착용 스펙을 선택해주세요.'),
  top: yup.string().required('상의 사이즈를 선택해주세요.'),
  bottom: yup.string().required('하의 사이즈를 선택해주세요.'),
  brand: yup.string().required('선호 브랜드를 선택해주세요.'),
  productCount: yup.string().required('상품 노출 수를 선택해주세요.'),
  exposureFrequency: yup.string().required('노출 빈도를 선택해주세요.'),
});

/**
 * schemaInfo - 내 정보 수정 폼 스키마
 *
 * 이메일, 비밀번호, 개인정보 수정을 검증합니다.
 */
export const schemaInfo = yup.object({
  email: yup
    .string()
    .required('이메일을 입력해주세요.')
    .min(5, '이메일은 최소 5자 이상이어야 합니다.')
    .max(50, '이메일은 최대 50자까지 입력 가능합니다.')
    .matches(
      /^(?=.*@)(?=.*(\.com|\.net)).+$/,
      '이메일은 "@"와 ".com" 또는 ".net"을 포함해야 합니다.'
    ),
  currentPassword: yup
    .string()
    .required('현재 비밀번호를 입력해주세요.')
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
    .max(20, '비밀번호는 최대 20자까지 입력 가능합니다.')
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,20}$/,
      '비밀번호는 영문과 숫자를 포함해야 합니다.'
    ),
  newPassword: yup
    .string()
    .required('새 비밀번호를 입력해주세요.')
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
    .max(20, '비밀번호는 최대 20자까지 입력 가능합니다.')
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,20}$/,
      '비밀번호는 영문과 숫자를 포함해야 합니다.'
    ),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], '비밀번호가 일치하지 않습니다.')
    .required('비밀번호 확인을 위해 다시 입력해주세요.'),
  nickname: yup
    .string()
    .required('닉네임을 입력해주세요.')
    .max(8, '닉네임은 최대 8자까지 입력 가능합니다.')
    .matches(/^[가-힣a-zA-Z0-9]{1,8}$/, '올바른 닉네임 형식을 입력해주세요.'),
  name: yup
    .string()
    .required('이름을 입력해주세요.')
    .max(6, '이름은 최대 6자까지 입력 가능합니다.')
    .matches(/^[가-힣]+$/, '이름은 한글만 입력 가능합니다.'),
  birthYear: yup
    .string()
    .required('태어난 해를 선택해주세요.')
    .matches(/^\d{4}$/, '태어난 해는 4자리 숫자로 입력해주세요.'),
  phoneNumber: yup
    .string()
    .transform((value) => value.replace(/[-\s]/g, ''))
    .required('전화번호를 입력해주세요.')
    .matches(
      /^010\d{8}$/,
      '전화번호는 010으로 시작하는 11자리 숫자여야 합니다.'
    ),
  region: yup.string().required('지역을 선택해주세요.'),
  district: yup.string().required('구를 선택해주세요.'),
  melpickAddress: yup
    .string()
    .required('멜픽 주소를 입력해주세요.')
    .matches(
      /^[a-zA-Z0-9]{1,12}$/,
      '영문과 숫자로 이루어진 1~12자 이내로 입력해주세요.'
    ),
});

/**
 * schemaSignup - 일반 회원가입 폼 스키마
 *
 * 회원가입에 필요한 모든 정보를 검증합니다.
 */
export const schemaSignup = yup
  .object({
    email: yup
      .string()
      .required('이메일을 입력해주세요.')
      .min(5, '이메일은 최소 5자 이상이어야 합니다.')
      .max(50, '이메일은 최대 50자까지 입력 가능합니다.')
      .matches(
        /^(?=.*@)(?=.*(\.com|\.net)).+$/,
        '이메일은 "@"와 ".com" 또는 ".net"을 포함해야 합니다.'
      ),
    password: yup
      .string()
      .required('비밀번호를 입력해주세요.')
      .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
      .max(20, '비밀번호는 최대 20자까지 입력 가능합니다.')
      .matches(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,20}$/,
        '비밀번호는 영문과 숫자를 포함해야 합니다.'
      ),
    passwordConfirm: yup
      .string()
      .oneOf([yup.ref('password')], '비밀번호가 일치하지 않습니다.')
      .required('비밀번호 확인을 위해 다시 입력해주세요.'),
    nickname: yup
      .string()
      .required('닉네임을 입력해주세요.')
      .max(8, '닉네임은 최대 8자까지 입력 가능합니다.')
      .matches(/^[가-힣a-zA-Z0-9]{1,8}$/, '올바른 닉네임 형식을 입력해주세요.'),
    name: yup
      .string()
      .required('이름을 입력해주세요.')
      .max(6, '이름은 최대 6자까지 입력 가능합니다.')
      .matches(/^[가-힣]+$/, '이름은 한글만 입력 가능합니다.'),
    birthYear: yup
      .string()
      .required('태어난 해를 선택해주세요.')
      .matches(/^\d{4}$/, '태어난 해는 4자리 숫자로 입력해주세요.'),
    phoneNumber: yup
      .string()
      .transform((value) => value.replace(/[-\s]/g, ''))
      .required('전화번호를 입력해주세요.')
      .matches(
        /^010\d{8}$/,
        '전화번호는 010으로 시작하는 11자리 숫자여야 합니다.'
      ),
    region: yup.string().required('지역을 선택해주세요.'),
    district: yup.string().required('구를 선택해주세요.'),
    melpickAddress: yup
      .string()
      .required('멜픽 주소를 입력해주세요.')
      .matches(
        /^[a-zA-Z0-9]{1,12}$/,
        '영문과 숫자로 이루어진 1~12자 이내로 입력해주세요.'
      ),
    height: yup.string().required('키를 선택해주세요.'),
    size: yup.string().required('몸무게를 선택해주세요.'),
    dress: yup.string().required('사이즈를 선택해주세요.'),
    top: yup.string().required('사이즈 선택.'),
    bottom: yup.string().required('사이즈 선택.'),
    brand: yup.string().required('선호 브랜드를 선택해주세요.'),
    instar: yup
      .string()
      .required('인스타 아이디를 입력해주세요.')
      .max(50, '인스타 아이디는 최대 50자까지 입력 가능합니다.'),
    shoulder: yup
      .string()
      .notRequired()
      .default('')
      .transform((value, originalValue) =>
        originalValue === null ? undefined : value
      ),
    chest: yup
      .string()
      .notRequired()
      .default('')
      .transform((value, originalValue) =>
        originalValue === null ? undefined : value
      ),
    waist: yup
      .string()
      .notRequired()
      .default('')
      .transform((value, originalValue) =>
        originalValue === null ? undefined : value
      ),
    sleeve: yup
      .string()
      .notRequired()
      .default('')
      .transform((value, originalValue) =>
        originalValue === null ? undefined : value
      ),
    mebershipCode: yup
      .string()
      .notRequired()
      .default('')
      .max(20, '맴버쉽 코드는 최대 20자까지 입력 가능합니다.'),
  })
  .required();

/**
 * schemaLogin - 로그인 폼 스키마
 *
 * 이메일과 비밀번호 로그인을 검증합니다.
 */
export const schemaLogin = yup.object({
  email: yup
    .string()
    .required('이메일을 입력해주세요.')
    .min(5, '이메일은 최소 5자 이상이어야 합니다.')
    .max(50, '이메일은 최대 50자까지 입력 가능합니다.')
    .matches(
      /^(?=.*@)(?=.*(\.com|\.net)).+$/,
      '이메일은 "@"와 ".com" 또는 ".net"을 포함해야 합니다.'
    ),
  password: yup
    .string()
    .required('비밀번호를 입력해주세요.')
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
    .max(20, '비밀번호는 최대 20자까지 입력 가능합니다.')
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,20}$/,
      '비밀번호는 영문과 숫자를 포함해야 합니다.'
    ),
});

/**
 * schemaFindPassword - 비밀번호 찾기 폼 스키마
 *
 * 이메일과 닉네임을 통한 비밀번호 찾기를 검증합니다.
 */
export const schemaFindPassword = yup.object({
  email: yup
    .string()
    .required('이메일을 입력해주세요.')
    .email('유효한 이메일 형식이 아닙니다.'),
  nickname: yup
    .string()
    .required('닉네임을 입력해주세요.')
    .matches(
      /^[가-힣a-zA-Z0-9]{2,16}$/,
      '닉네임은 2~16자 사이로 입력해주세요.'
    ),
});

/**
 * schemaFindId - 아이디 찾기 폼 스키마
 *
 * 닉네임과 생년월일을 통한 아이디 찾기를 검증합니다.
 */
export const schemaFindId = yup.object({
  nickname: yup
    .string()
    .required('닉네임을 입력해주세요.')
    .matches(
      /^[가-힣a-zA-Z0-9]{2,16}$/,
      '닉네임은 2~16자 사이로 입력해주세요.'
    ),
  birthYear: yup
    .string()
    .required('태어난 해를 선택해주세요.')
    .matches(/^\d{4}$/, '태어난 해는 4자리 숫자로 입력해주세요.'),
});

/**
 * schemaCardRegistration - 카드 등록 폼 스키마
 *
 * 카드번호, 유효기간, 비밀번호, 생년월일/사업자번호를 검증합니다.
 */
export const schemaCardRegistration = yup.object({
  cardNumber: yup
    .string()
    .transform((value) => value.replace(/-/g, ''))
    .required('카드번호를 입력해주세요.')
    .matches(/^\d{16}$/, '카드번호는 16자리 숫자여야 합니다.'),
  cardExpiration: yup
    .string()
    .transform((value) => value.replace(/\s/g, ''))
    .required('유효기간을 입력해주세요.')
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, '유효기간은 MM/YY 형식이어야 합니다.'),
  cardPassword: yup
    .string()
    .required('비밀번호를 입력해주세요.')
    .matches(/^\d{2}$/, '비밀번호는 정확히 2자리 숫자여야 합니다.'),
  birthOrBusiness: yup
    .string()
    .required('생년월일 또는 사업자번호를 입력해주세요.')
    .test(
      'lengthCheck',
      '생년월일은 6자리, 사업자번호는 10자리 숫자여야 합니다.',
      (value) => {
        if (!value) return false;
        return value.length === 6 || value.length === 10;
      }
    ),
});
