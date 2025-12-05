# INSPIG 프로젝트 개요

**프로젝트명**: INSPIG (양돈 농장 관리 시스템)  
**최종 업데이트**: 2025-12-05

---

## 1. 프로젝트 구조

```
inspig/
├── web/                    # Frontend (Next.js 16, TypeScript, Tailwind CSS)
│   ├── src/
│   │   ├── app/            # App Router (Pages & Layouts)
│   │   ├── components/     # UI Components (Common, Layout, Report, UI)
│   │   ├── contexts/       # React Contexts (Theme, etc.)
│   │   ├── css/            # Global & Module CSS
│   │   ├── data/           # Static/Test Data
│   │   ├── services/       # API Services & Mock Data
│   │   ├── types/          # TypeScript Definitions
│   │   └── utils/          # Helper Functions
├── api/                    # Backend (NestJS, TypeORM, Oracle)
├── References/             # HTML Prototypes
└── docs/                   # Documentation
```

## 2. 주요 기능

*   **인증**: 로그인/로그아웃 (JWT 예정)
*   **보고서**: 주간/월간/분기 보고서 조회 및 시각화
*   **데이터 시각화**: ECharts 기반 차트 (모돈, 교배, 분만, 이유 등)
*   **UI/UX**: 다크 모드, 반응형 디자인, 인터랙티브 차트

## 3. 개발 환경

*   **Frontend**: Node.js 20+, Next.js, Tailwind CSS
*   **Backend**: NestJS, Oracle DB
*   **DevOps**: Docker, Nginx

## 4. 문서 가이드

*   `01-overview.md`: 프로젝트 개요
*   `02-frontend.md`: Frontend 상세 가이드
*   `03-backend.md`: Backend 상세 가이드
*   `04-deployment.md`: 배포 가이드
*   `05-auth.md`: 인증 가이드
*   `99-migration.md`: 마이그레이션 가이드
