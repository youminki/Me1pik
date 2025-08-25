import React, { useState } from 'react';
import styled from 'styled-components';

import { useLanguageSelector } from '@/hooks/useI18n';
import { Locale } from '@/utils/i18n';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'buttons';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

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

const LanguageButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['isActive'].includes(prop as string),
})<{ isActive: boolean; size: string }>`
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

const DropdownArrow = styled.span.withConfig({
  shouldForwardProp: (prop) => !['isOpen'].includes(prop as string),
})<{ isOpen: boolean }>`
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

const DropdownItem = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isActive'].includes(prop as string),
})<{ isActive: boolean }>`
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
