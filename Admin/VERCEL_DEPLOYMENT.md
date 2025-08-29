# Admin 폴더 Vercel 배포 가이드

## 배포 설정 완료 ✅

Admin 폴더가 Vercel로 배포되도록 설정이 완료되었습니다.

### 주요 변경사항

1. **`vercel.json` 설정 완성**
   - 빌드 명령어: `yarn install && yarn build`
   - 출력 디렉토리: `dist`
   - 프레임워크: `vite`
   - SPA 라우팅을 위한 rewrites 설정
   - Node.js 20.x 런타임 설정

2. **`netlify.toml` 제거**
   - Netlify 설정 파일을 제거하여 Vercel 전용으로 변경

3. **`.gitignore` 업데이트**
   - Vercel 관련 파일 (`.vercel`) 제외 설정 추가

### Vercel 배포 방법

#### 1. Vercel CLI 설치 (선택사항)

```bash
npm i -g vercel
```

#### 2. Vercel 프로젝트 연결

```bash
cd Admin
vercel
```

#### 3. GitHub 연동 배포 (권장)

1. [Vercel Dashboard](https://vercel.com/dashboard)에서 새 프로젝트 생성
2. GitHub 저장소 연결
3. 프로젝트 설정에서:
   - Framework Preset: `Vite`
   - Root Directory: `Admin`
   - Build Command: `yarn build`
   - Output Directory: `dist`
   - Install Command: `yarn install`

#### 4. 환경 변수 설정

필요한 환경 변수가 있다면 Vercel Dashboard의 프로젝트 설정에서 추가

### 빌드 및 배포 확인

- **로컬 빌드 테스트**: `yarn build`
- **빌드 결과**: `dist/` 폴더에 생성
- **배포 URL**: Vercel Dashboard에서 확인 가능

### 주의사항

- Admin 폴더는 독립적인 Vercel 프로젝트로 배포됩니다
- Web 폴더와 별도로 관리되며, 각각 고유한 도메인을 가집니다
- 환경 변수는 각 프로젝트별로 개별 설정해야 합니다

### 문제 해결

빌드 오류가 발생하는 경우:

1. `yarn install`로 의존성 재설치
2. Node.js 버전이 20.x인지 확인
3. Vercel 로그에서 구체적인 오류 메시지 확인
