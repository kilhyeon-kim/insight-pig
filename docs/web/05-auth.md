# 인증 및 권한 시스템

**대상**: Full-stack 개발자
**최종 업데이트**: 2025-12-11

---

## 1. 인증 방식 개요

| 방식 | 대상 | 토큰 유형 | 유효기간 |
|------|------|----------|---------|
| 일반 로그인 | 내부 사용자 | JWT Access Token | 24시간 |
| 공유 링크 | 외부 사용자 | SHA256 Share Token | 7일 |
| 공유 세션 | 공유 링크 접속자 | 임시 JWT | 1시간 |

---

## 2. 모듈 책임 분리 (중요)

| 모듈 | 책임 | 비고 |
|------|------|------|
| `auth` | 로그인, JWT, **모든 공유 토큰** | 토큰 관련 로직 전담 |
| `weekly` | 주간 보고서 데이터 조회 | 토큰 처리 X |
| `monthly` | 월간 보고서 데이터 조회 | 토큰 처리 X (예정) |
| `quarterly` | 분기 보고서 데이터 조회 | 토큰 처리 X (예정) |

---

## 3. 일반 로그인 플로우

```
[로그인 페이지] → [/api/auth/login] → [JWT 발급] → [localStorage 저장] → [보고서 접근]
```

**저장 위치**: `localStorage.accessToken`
**API 헤더**: `Authorization: Bearer {token}`

---

## 4. 공유 토큰 시스템

### 4.1 토큰 사양

| 항목 | 값 |
|------|-----|
| 알고리즘 | SHA256 (Oracle `STANDARD_HASH`) |
| 길이 | 64자 (hex) |
| 유효기간 | 7일 (설정 가능) |
| 생성 규칙 | `HASH(FARM_NO + MASTER_SEQ + TIMESTAMP)` |

### 4.2 적용 대상

| 보고서 | 테이블 | URL 형식 | 상태 |
|--------|--------|----------|------|
| 주간 | `TS_INS_WEEK` | `/weekly/s/{token}` | 완료 |
| 월간 | `TS_INS_MONTH` | `/monthly/s/{token}` | 예정 |
| 분기 | `TS_INS_QUARTER` | `/quarterly/s/{token}` | 예정 |

### 4.3 DB 컬럼 (공통)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `SHARE_TOKEN` | VARCHAR2(64) | SHA256 토큰 |
| `TOKEN_EXPIRE_DT` | DATE | 만료일시 |

### 4.4 인증 흐름

```
[공유 링크 클릭] → [ShareTokenService.validateShareToken]
                           │
                           ├─ 토큰 없음 → 404 Not Found
                           │
                           ├─ 토큰 만료 → 만료 안내 + 로그인 유도
                           │
                           └─ 토큰 유효 → 임시 JWT 발급 (1시간) → 보고서 표시
```

---

## 5. 파일 구조

### Backend (NestJS)
```
api/src/modules/auth/
├── auth.controller.ts      # 로그인/로그아웃 API
├── auth.service.ts         # JWT 발급/검증
├── share-token.service.ts  # 공유 토큰 전담 (validate/generate/get)
├── dto/                    # LoginDto, UserDto
├── entities/               # TaMember, TaFarm
├── guards/                 # JwtAuthGuard
├── strategies/             # JwtStrategy
└── sql/
    ├── auth.sql.ts         # 로그인 SQL
    └── share-token.sql.ts  # 토큰 SQL
```

### Frontend (Next.js)
```
web/src/
├── app/
│   ├── login/page.tsx           # 로그인 페이지
│   └── (report)/weekly/s/[token]/page.tsx  # 공유 링크 페이지
├── contexts/AuthContext.tsx     # 인증 상태 관리
├── components/auth/ProtectedRoute.tsx  # 인증 필요 라우트
└── services/api.ts              # API 호출 (토큰 헤더 추가)
```

---

## 6. API 엔드포인트

### 인증 API
| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| POST | `/api/auth/login` | 로그인 | 불필요 |
| POST | `/api/auth/logout` | 로그아웃 | JWT |

### 공유 토큰 API
| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| GET | `/api/weekly/share/:token` | 토큰으로 주간 보고서 조회 | 불필요 |
| POST | `/api/auth/share-token` | 토큰 생성 | JWT |
| GET | `/api/auth/share-token/:type/:masterSeq/:farmNo` | 기존 토큰 조회 | JWT |

---

## 7. 응답 형식

### 로그인 성공
```json
{ "success": true, "data": { "accessToken": "...", "user": {...} } }
```

### 공유 토큰 유효
```json
{ "success": true, "data": {...}, "sessionToken": "임시JWT" }
```

### 공유 토큰 만료
```json
{ "success": false, "expired": true, "message": "공유 링크가 만료되었습니다." }
```

---

## 8. 핵심 서비스

### AuthService
- `login()`: ID/PW 검증 후 JWT 발급
- `validateUser()`: JWT payload로 사용자 조회

### ShareTokenService
- `validateShareToken(token, reportType)`: 토큰 검증 + 만료 체크
- `generateShareToken(masterSeq, farmNo, reportType, expireDays)`: 토큰 생성
- `getShareToken(masterSeq, farmNo, reportType)`: 기존 토큰 조회

**ReportType**: `'weekly' | 'monthly' | 'quarterly'`

---

## 9. 보안 고려사항

- JWT Secret: 환경 변수 관리 (`JWT_SECRET`)
- HTTPS: 프로덕션 필수
- 비밀번호: bcrypt 암호화
- 토큰 만료: Access Token 24시간, Share Token 7일
