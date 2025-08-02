/**
 * 언어 선택기 컴포넌트 (LanguageSelector.tsx)
 *
 * 다국어 지원을 위한 언어 선택 컴포넌트를 제공합니다.
 * 드롭다운 형태로 다양한 언어 옵션을 제공하며,
 * 현재 선택된 언어를 시각적으로 표시합니다.
 *
 * @description
 * - 다국어 지원
 * - 드롭다운 UI
 * - 현재 언어 표시
 * - 접근성 지원
 * - 반응형 디자인
 */

import React, { useState } from 'react';
import styled from 'styled-components';

import { useLanguageSelector } from '@/hooks/useI18n';
import { Locale } from '@/utils/i18n';

/**
 * 언어 선택기 속성 인터페이스
 *
 * 언어 선택기 컴포넌트의 props를 정의합니다.
 *
 * @property variant - 표시 형태 (기본값: 'dropdown')
 * @property size - 크기 옵션 (기본값: 'medium')
 * @property className - CSS 클래스명 (선택적)
 */
interface LanguageSelectorProps {
  variant?: 'dropdown' | 'buttons'; // 표시 형태 (기본값: 'dropdown')
  size?: 'small' | 'medium' | 'large'; // 크기 옵션 (기본값: 'medium')
  className?: string; // CSS 클래스명 (선택적)
}

/**
 * 언어 선택기 컴포넌트
 *
 * 다국어 지원을 위한 언어 선택 컴포넌트를 렌더링합니다.
 * 드롭다운과 버튼 형태의 두 가지 변형을 지원하며,
 * 국기 아이콘과 언어명을 함께 표시합니다.
 *
 * @param variant - 표시 형태 (기본값: 'dropdown')
 * @param size - 크기 옵션 (기본값: 'medium')
 * @param className - CSS 클래스명 (선택적)
 * @returns 언어 선택기 컴포넌트
 */
const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'dropdown',
  size = 'medium',
  className,
}) => {
  const { currentLanguage, availableLanguages, changeLanguage } =
    useLanguageSelector();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode as Locale);
    setIsOpen(false);
  };

  if (variant === 'buttons') {
    return (
      <ButtonContainer size={size} className={className}>
        {availableLanguages.map((language) => (
          <LanguageButton
            key={language.code}
            isActive={currentLanguage.code === language.code}
            size={size}
            onClick={() => handleLanguageChange(language.code)}
          >
            <Flag>{language.flag}</Flag>
            <LanguageName>{language.name}</LanguageName>
          </LanguageButton>
        ))}
      </ButtonContainer>
    );
  }

  return (
    <DropdownContainer className={className}>
      <DropdownButton
        size={size}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup='listbox'
      >
        <Flag>{currentLanguage.flag}</Flag>
        <LanguageName>{currentLanguage.name}</LanguageName>
        <DropdownArrow isOpen={isOpen}>▼</DropdownArrow>
      </DropdownButton>

      {isOpen && (
        <DropdownMenu size={size}>
          {availableLanguages.map((language) => (
            <DropdownItem
              key={language.code}
              isActive={currentLanguage.code === language.code}
              onClick={() => handleLanguageChange(language.code)}
              role='option'
              aria-selected={currentLanguage.code === language.code}
            >
              <Flag>{language.flag}</Flag>
              <LanguageName>{language.name}</LanguageName>
            </DropdownItem>
          ))}
        </DropdownMenu>
      )}
    </DropdownContainer>
  );
};

export default LanguageSelector;

const ButtonContainer = styled.div<{ size: string }>`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const LanguageButton = styled.button<{ isActive: boolean; size: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: ${({ size }) => {
    switch (size) {
      case 'small':
        return '6px 12px';
      case 'large':
        return '12px 20px';
      default:
        return '8px 16px';
    }
  }};
  border: 1px solid ${({ isActive }) => (isActive ? '#007bff' : '#dee2e6')};
  border-radius: 6px;
  background-color: ${({ isActive }) => (isActive ? '#007bff' : 'white')};
  color: ${({ isActive }) => (isActive ? 'white' : '#212529')};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  font-size: ${({ size }) => {
    switch (size) {
      case 'small':
        return '12px';
      case 'large':
        return '16px';
      default:
        return '14px';
    }
  }};

  &:hover {
    background-color: ${({ isActive }) => (isActive ? '#0056b3' : '#f8f9fa')};
    border-color: ${({ isActive }) => (isActive ? '#0056b3' : '#adb5bd')};
  }

  &:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
  }
`;

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownButton = styled.button<{ size: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: ${({ size }) => {
    switch (size) {
      case 'small':
        return '6px 12px';
      case 'large':
        return '12px 20px';
      default:
        return '8px 16px';
    }
  }};
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background-color: white;
  color: #212529;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  font-size: ${({ size }) => {
    switch (size) {
      case 'small':
        return '12px';
      case 'large':
        return '16px';
      default:
        return '14px';
    }
  }};

  &:hover {
    background-color: #f8f9fa;
    border-color: #adb5bd;
  }

  &:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
  }
`;

const DropdownArrow = styled.span<{ isOpen: boolean }>`
  transition: transform 0.2s ease-in-out;
  transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
`;

const DropdownMenu = styled.div<{ size: string }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
   0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 120px;
  margin-top: 4px;
`;

const DropdownItem = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  background-color: ${({ isActive }) => (isActive ? '#f8f9fa' : 'white')};
  color: ${({ isActive }) => (isActive ? '#007bff' : '#212529')};
  font-weight: ${({ isActive }) => (isActive ? '600' : '400')};

  &:hover {
    background-color: ${({ isActive }) => (isActive ? '#e9ecef' : '#f8f9fa')};
  }

  &:first-child {
    border-radius: 6px 6px 0 0;
  }

  &:last-child {
    border-radius: 0 0 6px 6px;
  }
`;

const Flag = styled.span`
  font-size: 1.2em;
`;

const LanguageName = styled.span`
  white-space: nowrap;
`;
