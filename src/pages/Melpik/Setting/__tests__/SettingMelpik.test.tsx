import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SettingMelpik from '../SettingMelpik';

describe('SettingMelpik 컴포넌트', () => {
  it('기본 렌더링 및 주요 UI 요소 표시', () => {
    render(<SettingMelpik />);
    // 타이틀
    expect(screen.getByText('멜픽 설정')).toBeInTheDocument();
    // 서브타이틀
    expect(
      screen.getByText('내 채널을 통해 나는 브랜드가 된다')
    ).toBeInTheDocument();
    // 멜픽 주소
    expect(screen.getByText(/me1pik.com\//)).toBeInTheDocument();
    // 링크복사 버튼
    expect(
      screen.getByRole('button', { name: /링크복사/ })
    ).toBeInTheDocument();
    // 정산 계좌정보 등록/변경 버튼
    expect(
      screen.getByRole('button', { name: /등록\/변경/ })
    ).toBeInTheDocument();
    // 링크등록 버튼
    expect(
      screen.getByRole('button', { name: /링크등록/ })
    ).toBeInTheDocument();
  });
});
