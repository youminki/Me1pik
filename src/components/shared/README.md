# 공통 컴포넌트 & 접근성 가이드

이 디렉토리에는 프로젝트 전역에서 사용하는 공통 UI 컴포넌트가 포함되어 있습니다.

## 주요 컴포넌트

- **ErrorMessage**: 에러 메시지 표시, role="alert" 자동 적용
- **LoadingSpinner**: 로딩 상태 표시, role="status" 자동 적용
- **EmptyState**: 빈 상태 안내, 아이콘/버튼/메시지 지원
- **PrimaryButton/SecondaryButton**: 일관된 버튼 스타일, 포커스/호버/접근성 강화
- **InputField/StyledInput/StyledSelect**: 입력 필드, 셀렉트 박스, 포커스 outline 및 색상 대비 강화
- **LanguageSelector**: 다국어 지원 언어 선택
- **LazyImage**: alt 필수, 이미지 대체 텍스트 접근성 보장

## 접근성(A11y) 가이드

- **버튼/링크**:
  - 반드시 시맨틱 요소(`<button>`, `<a>`) 사용
  - aria-label 등으로 의미 명확히 전달
  - 포커스 outline(2px solid #222) 적용

- **입력/셀렉트**:
  - 포커스 outline(2px solid #222) 적용
  - label과 id 연결 필수

- **아이콘/이미지**:
  - 의미 전달: alt/aria-label/role="img" 적용
  - 장식용: alt="" 또는 aria-hidden="true"

- **모달/다이얼로그**:
  - role="dialog", aria-modal="true", aria-labelledby 적용
  - 포커스 트랩(Tab/Shift+Tab 순환), Escape로 닫기 지원

## 예시 코드

```tsx
// 에러 메시지
<ErrorMessage message="에러가 발생했습니다." />

// 로딩 스피너
<LoadingSpinner label="불러오는 중..." />

// 빈 상태 안내
<EmptyState message="데이터가 없습니다." icon={<SomeIcon />} />

// 버튼 (접근성: aria-label 등 전달 가능)
<PrimaryButton aria-label="제출">제출</PrimaryButton>

// 입력 필드 (label, id 연결)
<InputField label="이메일" id="email" />

// 아이콘 (장식용)
<img src={iconSrc} alt="" aria-hidden="true" />

// 아이콘 (의미 전달)
<svg aria-label="좋아요" role="img">...</svg>

// 모달
<ReusableModal isOpen={open} onClose={close} title="안내">
  내용
</ReusableModal>
```

## 참고

- [WCAG 색상 대비 가이드](https://www.w3.org/WAI/WCAG21/quickref/#contrast-minimum)
- [MDN ARIA 가이드](https://developer.mozilla.org/ko/docs/Web/Accessibility/ARIA)
