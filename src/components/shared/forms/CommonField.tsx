import React from 'react';
import styled, { css } from 'styled-components';

import { InputLabel } from '../../../auth-utils/AuthCommon';

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

type CommonFieldProps = React.InputHTMLAttributes<HTMLInputElement> &
  React.SelectHTMLAttributes<HTMLSelectElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    as?: 'input' | 'select' | 'textarea';
    options?: string[];
    error?: string;
    label?: string | React.ReactNode;
    buttonLabel?: string;
    buttonColorType?: 'blue' | 'red' | 'yellow';
    onButtonClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    prefix?: string;
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
