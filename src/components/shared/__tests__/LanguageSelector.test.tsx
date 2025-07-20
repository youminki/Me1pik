import { render, screen, fireEvent } from '@/utils/testUtils';
import LanguageSelector from '@/components/shared/LanguageSelector';

// i18n 모킹
const mockUseLanguageSelector = jest.fn();
jest.mock('@/hooks/useI18n', () => ({
  useLanguageSelector: () => mockUseLanguageSelector(),
}));

describe('LanguageSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLanguageSelector.mockReturnValue({
      currentLanguage: { code: 'ko', name: '한국어', flag: '🇰🇷' },
      availableLanguages: [
        { code: 'ko', name: '한국어', flag: '🇰🇷' },
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'ja', name: '日本語', flag: '🇯🇵' },
        { code: 'zh', name: '中文', flag: '🇨🇳' },
      ],
      changeLanguage: jest.fn(),
    });
  });

  describe('Dropdown variant', () => {
    it('should render dropdown by default', () => {
      render(<LanguageSelector />);

      expect(screen.getByText('한국어')).toBeInTheDocument();
      expect(screen.getByText('🇰🇷')).toBeInTheDocument();
    });

    it('should open dropdown when clicked', () => {
      render(<LanguageSelector />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('日本語')).toBeInTheDocument();
      expect(screen.getByText('中文')).toBeInTheDocument();
    });

    it('should close dropdown when language is selected', () => {
      render(<LanguageSelector />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const englishOption = screen.getByText('English');
      fireEvent.click(englishOption);

      expect(screen.queryByText('English')).not.toBeInTheDocument();
    });

    it('should have correct ARIA attributes', () => {
      render(<LanguageSelector />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('should update ARIA attributes when opened', () => {
      render(<LanguageSelector />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should handle keyboard navigation', () => {
      render(<LanguageSelector />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Enter 키로 옵션 선택
      const englishOption = screen.getByText('English');
      fireEvent.keyDown(englishOption, 'Enter');

      expect(screen.queryByText('English')).not.toBeInTheDocument();
    });
  });

  describe('Buttons variant', () => {
    it('should render all language buttons', () => {
      render(<LanguageSelector variant='buttons' />);

      expect(screen.getByText('한국어')).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('日本語')).toBeInTheDocument();
      expect(screen.getByText('中文')).toBeInTheDocument();
    });

    it('should highlight current language', () => {
      render(<LanguageSelector variant='buttons' />);

      const koreanButton = screen.getByText('한국어').closest('button');
      expect(koreanButton).toHaveClass(expect.stringContaining('active'));
    });

    it('should call changeLanguage when button is clicked', () => {
      const mockChangeLanguage = jest.fn();
      mockUseLanguageSelector.mockReturnValue({
        currentLanguage: { code: 'ko', name: '한국어', flag: '🇰🇷' },
        availableLanguages: [
          { code: 'ko', name: '한국어', flag: '🇰🇷' },
          { code: 'en', name: 'English', flag: '🇺🇸' },
        ],
        changeLanguage: mockChangeLanguage,
      });

      render(<LanguageSelector variant='buttons' />);

      const englishButton = screen.getByText('English').closest('button');
      fireEvent.click(englishButton!);

      expect(mockChangeLanguage).toHaveBeenCalledWith('en');
    });
  });

  describe('Size variants', () => {
    it('should apply small size styles', () => {
      render(<LanguageSelector size='small' />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(expect.stringContaining('small'));
    });

    it('should apply large size styles', () => {
      render(<LanguageSelector size='large' />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(expect.stringContaining('large'));
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      render(<LanguageSelector />);

      const button = screen.getByRole('button');

      // Tab으로 포커스 가능
      button.focus();
      expect(button).toHaveFocus();

      // Enter로 드롭다운 열기
      fireEvent.keyDown(button, 'Enter');
      expect(screen.getByText('English')).toBeInTheDocument();
    });

    it('should close dropdown on Escape key', () => {
      render(<LanguageSelector />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByText('English')).toBeInTheDocument();

      fireEvent.keyDown(button, 'Escape');

      expect(screen.queryByText('English')).not.toBeInTheDocument();
    });

    it('should have proper focus management', () => {
      render(<LanguageSelector />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const englishOption = screen.getByText('English');
      expect(englishOption).toHaveAttribute('role', 'option');
      expect(englishOption).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Error handling', () => {
    it('should handle missing language data gracefully', () => {
      mockUseLanguageSelector.mockReturnValue({
        currentLanguage: null,
        availableLanguages: [],
        changeLanguage: jest.fn(),
      });

      render(<LanguageSelector />);

      // 에러 없이 렌더링되어야 함
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<LanguageSelector />);

      const button = screen.getByRole('button');
      const initialText = button.textContent;

      rerender(<LanguageSelector />);

      expect(button.textContent).toBe(initialText);
    });
  });
});
