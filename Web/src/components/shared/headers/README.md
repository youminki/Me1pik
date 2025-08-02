# Header Components

이 디렉토리는 웹 애플리케이션에서 사용되는 다양한 헤더 컴포넌트들을 포함합니다.

## PageHeader

재사용 가능한 페이지 헤더 컴포넌트입니다. 제목과 부제목을 포함하는 일관된 스타일의 헤더를 제공합니다.

### 사용법

```tsx
import PageHeader from '@/components/shared/headers/PageHeader';

// 기본 사용법
<PageHeader
  title="페이지 제목"
  subtitle="페이지 부제목"
/>

// 부제목이 없는 경우
<PageHeader title="페이지 제목" />
```

### Props

- `title` (string, required): 페이지의 메인 제목
- `subtitle` (string, optional): 페이지의 부제목

### 스타일 특징

- 반응형 디자인: 데스크톱과 모바일에서 다른 크기 적용
- 일관된 타이포그래피: 제목은 24px/32px, 부제목은 12px/16px
- 색상: 제목은 검정색, 부제목은 회색 (#ccc)
- 간격: 타이틀과 서브타이틀 간격 8px/12px, 헤더와 StatsSection 간격 20px/24px

### 적용된 페이지들

**PageHeader 컴포넌트:**

- `/locker-room` - 락커룸
- `/brands` - 브랜드
- `/my-closet` - 내 옷장
- `/melpik` - 멜픽
- `/customer-service/documents` - 고객센터 문서
- `/melpik-settings` - 멜픽 설정
- `/create-melpik` - 멜픽 생성
- `/sales-schedule` - 판매 스케줄
- `/sales-settlement` - 판매정산
- `/point` - 포인트
- `/customer-service` - 고객센터
- `/payment-method` - 결제수단
- `/my-ticket` - 이용권
- `/usage-history` - 이용내역
- `/product-review` - 제품평가

**StatsRow 컴포넌트:**

- `/locker-room` - 락커룸 (아이콘 포함)
- `/melpik` - 멜픽 (아이콘 포함)
- `/customer-service/documents` - 고객센터 문서 (아이콘 포함)
- `/customer-service` - 고객센터 (아이콘 포함)

**StatsSection만 사용하는 페이지:**

- `/melpik-settings` - 멜픽 설정
- `/create-melpik` - 멜픽 생성
- `/sales-schedule` - 판매 스케줄
- `/sales-settlement` - 판매정산
- `/point` - 포인트

### 마이그레이션 가이드

기존에 개별적으로 정의된 Header, Title, Subtitle styled components를 PageHeader로 교체:

```tsx
// 이전
<Header>
  <Title>페이지 제목</Title>
  <Subtitle>페이지 부제목</Subtitle>
</Header>

// 이후
<PageHeader
  title="페이지 제목"
  subtitle="페이지 부제목"
/>
```

## StatsRow

재사용 가능한 통계 행 컴포넌트입니다. StatsSection과 아이콘을 함께 배치하는 일관된 레이아웃을 제공합니다.

### 사용법

```tsx
import StatsRow from '@/components/shared/StatsRow';

// 아이콘이 있는 경우
<StatsRow icon={iconPath} iconAlt="아이콘 설명">
  <StatsSection {...statsData} />
</StatsRow>

// 아이콘이 없는 경우
<StatsRow>
  <StatsSection {...statsData} />
</StatsRow>
```

### Props

- `children` (ReactNode, required): StatsSection 컴포넌트
- `icon` (string, optional): 우측에 표시할 아이콘 이미지 경로
- `iconAlt` (string, optional): 아이콘의 alt 텍스트

### 적용된 페이지들

- `/locker-room` - 락커룸
- `/melpik` - 멜픽
- `/customer-service/documents` - 고객센터 문서
