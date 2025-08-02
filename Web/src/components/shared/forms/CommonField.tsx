/**
 * 공통 필드 컴포넌트 (CommonField.tsx)
 *
 * 다양한 입력 필드 타입을 지원하는 공통 컴포넌트를 제공합니다.
 * 텍스트 입력, 셀렉트, 텍스트에어리어 등을 포함하며,
 * 에러 상태, 읽기 전용, 비활성화 상태를 지원합니다.
 *
 * @description
 * - 다양한 입력 타입 지원
 * - 에러 상태 표시
 * - 읽기 전용 및 비활성화 상태
 * - 접근성 지원
 * - 테마 기반 스타일링
 * - 버튼 내장 지원
 */

import React from 'react';
import styled, { css } from 'styled-components';

import { InputLabel } from '@/auth-utils/AuthCommon';

const readonlyStyle = css`
  background-color: #eeeeee !important;
  color: #888 !important;
  opacity: 0.7 !important;
  pointer-events: none !important;
  cursor: not-allowed !important;
`;

const ButtonWrapper = styled.div`
  position: relative;
  width: 100%;
  overflow: visible !important;
`;

const BaseField = styled.input<{ $hasError?: boolean; $hasButton?: boolean }>`
  width: 100%;
  height: 51px;
  border: 1px solid
    ${({ $hasError, theme }) =>
      $hasError ? theme.colors.error : theme.colors.border};
  font-size: 13px;
  padding: 0
    ${({ $hasButton, theme }) => ($hasButton ? '87px' : theme.spacing.lg)} 0
    ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.inputBg};
  box-sizing: border-box;
  color: ${({ theme }) => theme.colors.primary};
  border-radius: 0;
  transition:
    border 0.2s,
    background 0.2s;
  ${({ theme }) => theme.shadow.base};
  z-index: ${({ theme }) => theme.zIndex.header};
  &:focus {
    background: ${({ theme }) => theme.colors.inputBg};
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 1px;
  }
  &::placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
    font-size: 13px;
  }
  ${({ readOnly, disabled }) => (readOnly || disabled) && readonlyStyle}
`;

const ButtonInField = styled.button<{ $colorType?: 'blue' | 'red' | 'yellow' }>`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 71px;
  height: 34px;
  background-color: ${({ $colorType, theme }) =>
    $colorType === 'blue'
      ? '#004DFF'
      : $colorType === 'red'
        ? '#F85959'
        : $colorType === 'yellow'
          ? '#F6AE24'
          : theme.colors.black};
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 800;
  text-align: center;
  cursor: pointer;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto !important;
  opacity: 1 !important;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
  &:hover {
    filter: brightness(0.95);
  }
  &:active {
    filter: brightness(0.9);
    transform: translateY(-50%) scale(0.97);
  }
`;

const BaseSelect = styled.select<{ $hasError?: boolean }>`
  width: 100%;
  height: 51px;
  border: 1.5px solid
    ${({ $hasError, theme }) => ($hasError ? theme.colors.error : '#000000')};
  font-size: 13px;
  padding: 0 ${({ theme }) => theme.spacing.lg} 0
    ${({ theme }) => theme.spacing.md};
  background:
    url('/SelectIcon.svg') no-repeat right 16px center/15px 16px,
    ${({ theme }) => theme.colors.inputBg};
  box-sizing: border-box;
  color: ${({ theme }) => theme.colors.primary};
  border-radius: 0 !important;
  transition: border 0.2s;
  margin-bottom: 0;
  appearance: none;
  ${({ theme }) => theme.shadow.base};
  z-index: ${({ theme }) => theme.zIndex.header};
  &:focus {
    background:
      url('/SelectIcon.svg') no-repeat right 16px center/15px 16px,
      ${({ theme }) => theme.colors.inputBg};
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 1px;
  }
  &::placeholder {
    font-size: 13px;
  }
  ${({ disabled }) => disabled && readonlyStyle}
`;

const BaseTextarea = styled.textarea<{ $hasError?: boolean }>`
  width: 100%;
  min-height: 51px;
  border: 1px solid
    ${({ $hasError, theme }) =>
      $hasError ? theme.colors.error : theme.colors.border};
  font-size: 13px;
  padding: 0 ${({ theme }) => theme.spacing.lg} 0
    ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.inputBg};
  box-sizing: border-box;
  color: ${({ theme }) => theme.colors.primary};
  border-radius: 0;
  transition:
    border 0.2s,
    background 0.2s;
  ${({ theme }) => theme.shadow.base};
  z-index: ${({ theme }) => theme.zIndex.header};
  &:focus {
    background: ${({ theme }) => theme.colors.inputBg};
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 1px;
  }
  &::placeholder {
    color: ${({ theme }) => theme.colors.placeholder};
    font-size: 13px;
  }
  ${({ readOnly, disabled }) => (readOnly || disabled) && readonlyStyle}
`;

/**
 * 공통 필드 속성 타입
 *
 * 공통 필드 컴포넌트의 props를 정의합니다.
 * HTML input, select, textarea 속성을 모두 상속받으며,
 * 추가적인 커스텀 속성들을 제공합니다.
 *
 * @property as - 필드 타입 (기본값: 'input')
 * @property options - select 옵션 목록 (선택적)
 * @property error - 에러 메시지 (선택적)
 * @property label - 라벨 텍스트 또는 컴포넌트 (선택적)
 * @property buttonLabel - 버튼 라벨 (선택적)
 * @property buttonColorType - 버튼 색상 타입 (선택적)
 * @property onButtonClick - 버튼 클릭 핸들러 (선택적)
 * @property prefix - 접두사 텍스트 (선택적)
 */
type CommonFieldProps = React.InputHTMLAttributes<HTMLInputElement> &
  React.SelectHTMLAttributes<HTMLSelectElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    as?: 'input' | 'select' | 'textarea'; // 필드 타입 (기본값: 'input')
    options?: string[]; // select 옵션 목록 (선택적)
    error?: string; // 에러 메시지 (선택적)
    label?: string | React.ReactNode; // 라벨 텍스트 또는 컴포넌트 (선택적)
    buttonLabel?: string; // 버튼 라벨 (선택적)
    buttonColorType?: 'blue' | 'red' | 'yellow'; // 버튼 색상 타입 (선택적)
    onButtonClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; // 버튼 클릭 핸들러 (선택적)
    prefix?: string; // 접두사 텍스트 (선택적)
    // ...suffix 등 확장 가능
  };

const InputRow = styled.div`
  display: flex;
  align-items: stretch;
  width: 100%;
`;

const PrefixBox = styled.div`
  display: flex;
  align-items: center;
  background: #f5f5f5;
  color: #888;
  font-size: 13px;
  height: 51px;
  padding: 0 14px;
  border: 1px solid #dadada;
  border-right: none;
  border-radius: 0;
  pointer-events: none;
  user-select: text;
  min-width: max-content;
`;

const InputFieldWrapper = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  align-items: stretch;
`;

/**
 * 공통 필드 컴포넌트
 *
 * 폼에서 사용하는 공통 입력 필드를 렌더링하는 컴포넌트입니다.
 * input, select, textarea 타입을 지원하며, 버튼, 라벨, 에러 처리 등을 포함합니다.
 *
 * @param as - 필드 타입 (기본값: 'input')
 * @param options - select 옵션 목록 (선택적)
 * @param error - 에러 메시지 (선택적)
 * @param label - 라벨 텍스트 또는 컴포넌트 (선택적)
 * @param buttonLabel - 버튼 라벨 (선택적)
 * @param buttonColorType - 버튼 색상 타입 (선택적)
 * @param onButtonClick - 버튼 클릭 핸들러 (선택적)
 * @param prefix - 접두사 텍스트 (선택적)
 * @param rest - 기타 HTML 속성들
 * @returns 공통 필드 컴포넌트
 */
const CommonField: React.FC<CommonFieldProps> = ({
  as = 'input',
  options,
  error,
  label,
  buttonLabel,
  buttonColorType,
  onButtonClick,
  prefix,
  ...rest
}) => {
  return (
    <div
      style={{
        width: '100%',
        position: 'relative',
        overflow: 'visible',
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
      }}
    >
      {label && <InputLabel>{label}</InputLabel>}
      <ButtonWrapper>
        {prefix ? (
          <InputRow>
            <PrefixBox>{prefix}</PrefixBox>
            <InputFieldWrapper>
              <BaseField
                {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
                style={{
                  paddingRight: buttonLabel ? '87px' : undefined,
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                }}
                $hasButton={!!buttonLabel}
              />
              {buttonLabel && (
                <ButtonInField
                  type='button'
                  $colorType={buttonColorType}
                  onClick={onButtonClick}
                  style={{ right: 8, zIndex: 10 }}
                >
                  {buttonLabel}
                </ButtonInField>
              )}
            </InputFieldWrapper>
          </InputRow>
        ) : as === 'select' ? (
          <BaseSelect
            {...(rest as React.SelectHTMLAttributes<HTMLSelectElement>)}
          >
            {options
              ? options.map((option, idx) => (
                  <option
                    key={typeof option === 'string' ? option : idx}
                    value={option}
                  >
                    {option}
                  </option>
                ))
              : React.Children.map(rest.children, (child, idx) =>
                  React.isValidElement(child)
                    ? React.cloneElement(child, { key: child.key ?? idx })
                    : child
                )}
          </BaseSelect>
        ) : as === 'textarea' ? (
          <BaseTextarea
            {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <BaseField
            {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
            $hasButton={!!buttonLabel}
          />
        )}
        {!prefix && buttonLabel && (
          <ButtonInField
            type='button'
            $colorType={buttonColorType}
            onClick={onButtonClick}
          >
            {buttonLabel}
          </ButtonInField>
        )}
      </ButtonWrapper>
      {error && <div style={{ color: 'red', fontSize: 12 }}>{error}</div>}
    </div>
  );
};

export default CommonField;
