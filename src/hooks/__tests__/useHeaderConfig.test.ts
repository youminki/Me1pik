import { renderHook } from '@testing-library/react';
import useHeaderConfig from '../useHeaderConfig';

describe('useHeaderConfig', () => {
  it('returns correct variant and title for /home', () => {
    const { result } = renderHook(() => useHeaderConfig('/home'));
    expect(result.current.includeHeader1).toBe(true);
    expect(result.current.headerTitle).toBe('');
  });

  it('returns correct variant and title for /brand/123', () => {
    const { result } = renderHook(() => useHeaderConfig('/brand/123'));
    expect(result.current.includeHeader2).toBe(true);
  });

  it('returns correct variant and title for /payment/123', () => {
    const { result } = renderHook(() => useHeaderConfig('/payment/123'));
    expect(result.current.includeHeader3 || result.current.includeHeader4).toBe(
      true
    );
  });
});
