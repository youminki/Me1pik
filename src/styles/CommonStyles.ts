import styled from 'styled-components';

// 공통 컨테이너 스타일
export const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
`;

// 공통 카드 스타일
export const Card = styled.div`
  background: white;
  border-radius: 8px;
   0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin-bottom: 16px;
`;

// 공통 버튼 스타일
export const Button = styled.button<{
  variant?: 'primary' | 'secondary' | 'danger';
}>`
  padding: 12px 24px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ variant = 'primary' }) => {
    switch (variant) {
      case 'primary':
        return `
          background: #007bff;
          color: white;
          &:hover {
            background: #0056b3;
          }
        `;
      case 'secondary':
        return `
          background: #6c757d;
          color: white;
          &:hover {
            background: #545b62;
          }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          &:hover {
            background: #c82333;
          }
        `;
      default:
        return '';
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// 공통 입력 필드 스타일
export const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
  }

  &:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
  }
`;

// 공통 라벨 스타일
export const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

// 공통 헤더 스타일
export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 16px;
`;

// 공통 섹션 스타일
export const Section = styled.div`
  margin-bottom: 24px;
`;

// 공통 섹션 제목 스타일
export const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
`;

// 공통 그리드 스타일
export const Grid = styled.div<{ columns?: number; gap?: string }>`
  display: grid;
  grid-template-columns: repeat(${({ columns = 1 }) => columns}, 1fr);
  gap: ${({ gap = '16px' }) => gap};
`;

// 공통 플렉스 스타일
export const Flex = styled.div<{
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end';
  justify?: 'start' | 'center' | 'end' | 'space-between';
  gap?: string;
}>`
  display: flex;
  flex-direction: ${({ direction = 'row' }) => direction};
  align-items: ${({ align = 'start' }) => align};
  justify-content: ${({ justify = 'start' }) => justify};
  gap: ${({ gap = '0' }) => gap};
`;

// 공통 스피너 스타일
export const Spinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

// 공통 배지 스타일
export const Badge = styled.span<{
  variant?: 'success' | 'warning' | 'danger' | 'info';
}>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;

  ${({ variant = 'info' }) => {
    switch (variant) {
      case 'success':
        return `
          background: #d4edda;
          color: #155724;
        `;
      case 'warning':
        return `
          background: #fff3cd;
          color: #856404;
        `;
      case 'danger':
        return `
          background: #f8d7da;
          color: #721c24;
        `;
      case 'info':
      default:
        return `
          background: #d1ecf1;
          color: #0c5460;
        `;
    }
  }}

  ${({ variant = 'info' }) => {
    switch (variant) {
      case 'success':
        return `
          background: #d4edda;
          color: #155724;
        `;
      case 'warning':
        return `
          background: #fff3cd;
          color: #856404;
        `;
      case 'danger':
        return `
          background: #f8d7da;
          color: #721c24;
        `;
      case 'info':
      default:
        return `
          background: #d1ecf1;
          color: #0c5460;
        `;
    }
  }}
`;
