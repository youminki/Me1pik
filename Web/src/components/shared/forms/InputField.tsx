/**
 * 입력 필드 컴포넌트 (InputField.tsx)
 *
 * 폼에서 사용하는 고급 입력 필드 컴포넌트를 제공합니다.
 * 라벨, 에러 처리, 버튼, 접두사/접미사, 토글 기능 등을 포함하며,
 * 다양한 입력 타입과 옵션을 지원합니다.
 *
 * @description
 * - 다양한 입력 타입 지원
 * - 라벨 및 에러 처리
 * - 버튼 내장 기능
 * - 접두사/접미사 콘텐츠
 * - 토글 기능
 * - 셀렉트 박스 지원
 * - 접근성 지원
 * - 반응형 디자인
 */

import React, {
  useState,
  useEffect,
  forwardRef,
  InputHTMLAttributes,
} from 'react';
import styled, { css } from 'styled-components';

import type { FieldError } from 'react-hook-form';

import { StyledInput as BaseStyledInput } from '@/auth-utils/AuthCommon';
import Button02 from '@/components/shared/buttons/SecondaryButton';
import { CustomSelect } from '@/components/shared/forms/CustomSelect';

// 공통 readonly 스타일 믹스인
const readonlyStyle = css`
  background-color: #eeeeee !important;
  color: #888 !important;
  opacity: 0.7 !important;
  pointer-events: none !important;
  cursor: not-allowed !important;
`;

const StyledInput = styled(BaseStyledInput)`
  ${({ readOnly, disabled }) => (readOnly || disabled) && readonlyStyle}
`;

/**
 * 입력 필드 속성 인터페이스
 *
 * 입력 필드 컴포넌트의 props를 정의합니다.
 * HTML input 속성을 상속받으며, 추가적인 커스텀 속성들을 제공합니다.
 *
 * @property label - 라벨 텍스트 (선택적)
 * @property id - 필드 ID (선택적)
 * @property type - 입력 타입 (기본값: 'text')
 * @property error - 에러 객체 (선택적)
 * @property buttonLabel - 버튼 라벨 (선택적)
 * @property buttonColor - 버튼 색상 (기본값: 'yellow')
 * @property onButtonClick - 버튼 클릭 핸들러 (선택적)
 * @property prefix - 접두사 텍스트 (선택적)
 * @property prefixcontent - 접두사 콘텐츠 (선택적)
 * @property suffixcontent - 접미사 콘텐츠 (선택적)
 * @property as - 렌더링할 요소 타입 (선택적)
 * @property useToggle - 토글 기능 사용 여부 (기본값: false)
 * @property options - 셀렉트 옵션 목록 (선택적)
 * @property onSelectChange - 셀렉트 변경 핸들러 (선택적)
 * @property readOnly - 읽기전용 여부 (기본값: false)
 * @property disabledOptions - 비활성화된 옵션 목록 (선택적)
 * @property onChange - 변경 핸들러 (선택적)
 */
interface InputFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'onChange'> {
  label?: string; // 라벨 텍스트 (선택적)
  id?: string; // 필드 ID (선택적)
  type?: string; // 입력 타입 (기본값: 'text')
  error?: FieldError | { message: string }; // 에러 객체 (선택적)
  buttonLabel?: string; // 버튼 라벨 (선택적)
  buttonColor?: 'yellow' | 'blue' | 'red' | 'black'; // 버튼 색상 (기본값: 'yellow')
  onButtonClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; // 버튼 클릭 핸들러 (선택적)
  prefix?: string; // 접두사 텍스트 (선택적)
  prefixcontent?: string | React.ReactNode; // 접두사 콘텐츠 (선택적)
  suffixcontent?: string | React.ReactNode; // 접미사 콘텐츠 (선택적)
  as?: React.ElementType; // 렌더링할 요소 타입 (선택적)
  useToggle?: boolean; // 토글 기능 사용 여부 (기본값: false)
  options?: string[]; // 셀렉트 옵션 목록 (선택적)
  onSelectChange?: (value: string) => void; // 셀렉트 변경 핸들러 (선택적)
  readOnly?: boolean; // 읽기전용 여부 (기본값: false)
  disabledOptions?: string[]; // 비활성화된 옵션 목록 (선택적)
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void; // 변경 핸들러 (선택적)
}

function parsePrefixContent(content: string) {
  const tokens = content.split(/(해당없음|\(.*?\)|\|)/g);
  let applyGray = false;
  return tokens.map((token, i) => {
    if (token === '|') {
      applyGray = true;
      return <GraySpan key={i}>{token}</GraySpan>;
    }
    if (applyGray) {
      return <GraySpan key={i}>{token}</GraySpan>;
    }
    if (
      (token.startsWith('(') && token.endsWith(')')) ||
      token === '해당없음'
    ) {
      return <GraySpan key={i}>{token}</GraySpan>;
    }
    return <React.Fragment key={i}>{token}</React.Fragment>;
  });
}

const InputFieldBase = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      id,
      type = 'text',
      error,
      buttonLabel,
      buttonColor = 'yellow',
      onButtonClick,
      prefix,
      prefixcontent,
      suffixcontent,
      as,
      useToggle = false,
      options,
      onSelectChange,
      readOnly = false,
      disabledOptions = [],
      onChange,
      ...rest
    },
    ref
  ) => {
    const [selectedOption, setSelectedOption] = useState<string>(
      options && options.length > 0 ? options[0] : ''
    );

    // value/selectedOption 동기화
    useEffect(() => {
      if (options && rest.value !== undefined) {
        setSelectedOption(rest.value as string);
      }
    }, [options, rest.value]);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      setSelectedOption(val);
      onSelectChange?.(val);
      // select도 onChange가 있으면 외부로 전달
      if (onChange) {
        onChange(e);
      }
    };

    const renderPrefixContent = () => {
      if (!prefixcontent) return null;
      if (typeof prefixcontent === 'string') {
        return (
          <PrefixContentText>
            {parsePrefixContent(prefixcontent)}
          </PrefixContentText>
        );
      }
      return <PrefixContentText>{prefixcontent}</PrefixContentText>;
    };

    const renderSuffixContent = () => {
      if (!suffixcontent) return null;
      return <SuffixContentText>{suffixcontent}</SuffixContentText>;
    };

    // as와 options가 동시에 전달되는 경우 경고
    if (as && options) {
      // as와 options가 동시에 오면 as를 무시합니다.
      // 실제 렌더링은 options가 있으면 select, 없으면 input
    }

    // 접근성 속성 준비
    let ariaLabel: string | undefined = undefined;
    if (label) {
      ariaLabel = String(label).split('(')[0];
    } else if (rest.placeholder) {
      ariaLabel = rest.placeholder as string;
    } else if (id) {
      ariaLabel = id as string;
    }
    const ariaProps = {
      'aria-readonly': !!readOnly || undefined,
      'aria-disabled': !!readOnly || undefined,
      'aria-label': ariaLabel,
    };

    return (
      <InputContainer>
        <Label htmlFor={id as string} $isEmpty={!label}>
          {label ? String(label).split('(')[0] : '\u200b'}
          {label && label.includes('(') && (
            <GrayText>{`(${String(label).split('(')[1]}`}</GrayText>
          )}
        </Label>

        <InputRow>
          {prefix && <PrefixText>{prefix}</PrefixText>}
          <InputWrapper $readOnly={!!readOnly}>
            {prefixcontent && renderPrefixContent()}

            {options ? (
              <CustomSelect
                id={id as string}
                value={selectedOption}
                onChange={handleSelectChange}
                disabled={readOnly}
                style={{ borderRadius: 0 }}
                {...ariaProps}
              >
                {options.map((option: string) => (
                  <option
                    key={option}
                    value={option}
                    disabled={disabledOptions?.includes(option)}
                  >
                    {option}
                  </option>
                ))}
              </CustomSelect>
            ) : (
              <StyledInput
                as={as}
                type={type}
                id={id as string}
                ref={ref}
                readOnly={readOnly}
                onChange={onChange}
                $hasError={!!error}
                {...ariaProps}
                {...rest}
              />
            )}

            {suffixcontent && renderSuffixContent()}

            {buttonLabel && !readOnly && (
              <ButtonWrapper>
                <Button02
                  onClick={
                    onButtonClick
                      ? (e: React.MouseEvent<HTMLButtonElement>) =>
                          onButtonClick(e)
                      : undefined
                  }
                  color={buttonColor}
                >
                  {buttonLabel}
                </Button02>
              </ButtonWrapper>
            )}

            {useToggle && <ToggleWrapper />}
          </InputWrapper>
        </InputRow>

        <ErrorContainer>
          {error && error.message && (
            <ErrorMessage>{error.message}</ErrorMessage>
          )}
        </ErrorContainer>
      </InputContainer>
    );
  }
);

InputFieldBase.displayName = 'InputField';
const InputField = React.memo(InputFieldBase);

export default InputField;

// Styled Components

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Label = styled.label<{ $isEmpty: boolean }>`
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 700;
  min-height: 18px;
  color: #222;
  visibility: visible;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: ${({ $isEmpty }) => ($isEmpty ? 0 : 1)};
`;

const GrayText = styled.span`
  padding-left: 3px;
  color: #888888;
  font-size: 12px;
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
`;

const PrefixText = styled.span`
  margin-right: 10px;
  font-size: 16px;
  font-weight: 700;
  color: #000000;
`;

const PrefixContentText = styled.span`
  margin-left: 10px;
  font-weight: 800;
  font-size: 13px;
  color: #000000;
`;

const SuffixContentText = styled.span`
  margin-left: auto; /* 우측 정렬 */
  margin-right: 10px;
  font-size: 13px;
  color: #999999; /* 회색 */
`;

const GraySpan = styled.span`
  color: #999999;
`;

const InputWrapper = styled.div<{ $readOnly: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  min-height: 57px;
  flex: 1;
`;

const ButtonWrapper = styled.div`
  position: absolute;
  right: 0;
  display: flex;
  align-items: center;
  height: 100%;
`;

const ToggleWrapper = styled.div`
  position: absolute;
  right: 40px;
  display: flex;
  align-items: center;
  height: 100%;
`;

const ErrorContainer = styled.div`
  min-height: 18px;
  margin: 4px 0 0 4px;
  display: flex;
  align-items: flex-start;
`;

const ErrorMessage = styled.span`
  color: #ff4d4f;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
`;
