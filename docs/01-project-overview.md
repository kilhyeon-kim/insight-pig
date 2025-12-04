# INSPIG 프로젝트 개요

**프로젝트명**: INSPIG (양돈 농장 관리 시스템)  
**최종 업데이트**: 2025-12-03

---

## 1. 프로젝트 구조

```
inspig/
├── web/                    # Frontend (Next.js)
├── api/                    # Backend (NestJS)
├── References/             # HTML 프로토타입 (참조용)
└── docs/                   # 프로젝트 문서
    ├── 01-overview.md              # 📄 본 문서
    ├── 02-frontend.md              # Frontend 구조 및 개발 가이드
    ├── 03-backend.md               # Backend API 및 DB 연동
    ├── 04-deployment.md            # Docker 배포 가이드
    ├── 05-auth.md                  # 인증/권한 시스템
    └── 99-prototype-migration.md   # HTML → Next.js 전환 참조
```

---

## 2. 기술 스택

### Frontend
- **Framework**: Next.js 16.0.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Custom CSS
- **UI Libraries**: 
  - FontAwesome (아이콘)
  - ECharts (차트)
  - react-datepicker (날짜 선택)
- **State Management**: React Hooks (useState, useEffect)

### Backend
- **Framework**: NestJS
- **ORM**: TypeORM
- **Database**: Oracle
- **Language**: TypeScript

### DevOps
- **Containerization**: Docker, Docker Compose
- **Reverse Proxy**: Nginx
- **Version Control**: Git

---

## 3. 주요 기능

### 3.1 인증
- 로그인/로그아웃
- JWT 기반 세션 관리 (예정)

### 3.2 보고서 관리
- **주간 보고서**: 농장 주간 실적 및 계획
  - DB에서 농장코드 + week 기준으로 데이터 조회
  - 리스트는 조회만 가능 (별도 추가 기능 없음)
- **월간 보고서**: 월별 종합 분석 (예정)
  - DB에서 농장코드 + month 기준으로 데이터 조회
- **분기 보고서**: 컨설팅 보고서 (예정)

### 3.3 데이터 시각화
- 모돈 현황 차트
- 교배/분만/이유 실적 그래프
- KPI 대시보드

### 3.4 테마 모드
- **Light Mode / Dark Mode** 지원
- 사이드바에 테마 전환 버튼
- 각 보고서 상단에도 테마 전환 버튼 제공(Light/Dark switch)

---

## 4. 개발 환경 설정

### 4.1 필수 요구사항
- Node.js 20+
- npm 또는 yarn
- Docker (배포 시)

### 4.2 로컬 실행

#### Frontend
```bash
cd web
npm install
npm run dev
# http://localhost:3000
```

#### Backend
```bash
cd api
npm install
npm run start:dev
# http://localhost:3001
```

---

## 5. 환경 변수

### Frontend (`web/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_USE_MOCK=true  # Mock 데이터 사용 (개발용)
```

### Backend (`api/.env`)
```env
NODE_ENV=development
USE_MOCK_DATA=true         # Mock 데이터 사용 (개발용)

# Oracle DB (실제 연동 시)
DB_HOST=your-oracle-host
DB_PORT=1521
DB_USER=your-username
DB_PASSWORD=your-password
DB_SERVICE_NAME=your-service-name
```

---

## 6. 개발 현황

### ✅ 완료
- [x] Next.js 프로젝트 구조 설정
- [x] 주간 보고서 UI 구현 (HTML 프로토타입 → Next.js)
- [x] 레이아웃 시스템 (Header, Sidebar)
- [x] 목록/상세 페이지 라우팅
- [x] Mock 데이터 기반 개발 환경
- [x] 다크모드 지원
- [x] 반응형 디자인

### 🔄 진행 중
- [ ] Backend API 구현 (Mock → 실제 DB)
- [ ] 인증 시스템 (JWT)
- [ ] 월간/분기 보고서 구현

### ⏳ 예정
- [ ] 실제 Oracle DB 연동
- [ ] 프로덕션 배포
- [ ] 성능 최적화
- [ ] 테스트 작성

---

## 7. 문서 가이드

각 문서의 목적과 내용:

| 문서 | 목적 | 대상 독자 |
|------|------|-----------|
| `01-overview.md` | 프로젝트 전체 개요 | 전체 팀 |
| `02-frontend.md` | Frontend 구조 및 개발 | Frontend 개발자 |
| `03-backend.md` | Backend API 및 DB | Backend 개발자 |
| `04-deployment.md` | Docker 배포 방법 | DevOps |
| `05-auth.md` | 인증/권한 시스템 | Full-stack 개발자 |
| `99-prototype-migration.md` | HTML 전환 참조 | Frontend 개발자 (참조용) |

---

## 8. 주요 디렉토리 설명

### Frontend (`web/`)
```
src/
├── app/
│   ├── login/              # 로그인 페이지
│   └── (report)/           # 보고서 그룹
│       ├── layout.tsx      # 공통 레이아웃 (Header, Sidebar)
│       ├── weekly/         # 주간 보고서
│       ├── monthly/        # 월간 보고서
│       └── quarterly/      # 분기 보고서
├── components/
│   ├── common/             # Header 등 공통 컴포넌트
│   ├── layout/             # Sidebar, ThemeToggle
│   ├── report/             # ReportList
│   └── ui/                 # GridTable, Calendar, Badge 등
├── services/
│   ├── api.ts              # API 호출 로직
│   └── mockData.ts         # Mock 데이터
└── types/
    └── weekly.ts           # TypeScript 타입 정의
```

### Backend (`api/`)
```
src/
├── app.module.ts           # 메인 모듈 (TypeORM 설정)
├── main.ts                 # 진입점
└── modules/
    └── weekly/             # 주간 보고서 모듈
        ├── weekly.controller.ts
        ├── weekly.service.ts
        └── weekly.module.ts
```

---

## 9. 다음 단계

1. **Backend API 구현**: Mock 데이터 → 실제 DB 쿼리
2. **인증 시스템**: JWT 기반 로그인/로그아웃
3. **월간/분기 보고서**: 상세 페이지 구현
4. **프로덕션 배포**: Docker Compose로 배포
5. **성능 최적화**: 이미지 최적화, Code Splitting

---

## 10. 참고 링크

- [Next.js 공식 문서](https://nextjs.org/docs)
- [NestJS 공식 문서](https://docs.nestjs.com)
- [TypeORM 공식 문서](https://typeorm.io)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)
