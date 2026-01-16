# Next.js 이중화 서버 RSC 상태 불일치 이슈

> 작성일: 2026-01-16
> 상태: **진행 중** (임시 조치 적용됨)

---

## 1. 문제 현상

### 증상
- 운영 서버(https://ins.pigplan.io/)에서 버튼 클릭 시 페이지 이동 불가
- RSC(React Server Components) 페이로드가 HTML 대신 화면에 텍스트로 표시됨
- **한 번 문제 발생 시 모든 버튼이 동작하지 않음**
- F5(새로고침) 시 정상으로 복구됨
- 로컬 개발 환경에서는 재현되지 않음

### 재현 조건
- 이중화 서버 환경 (38번: 10.4.38.10, 99번: 10.4.99.10)
- 로드밸런서를 통한 접속
- 정확한 재현 조건 불명확 (간헐적 발생)

### 네트워크 탭 분석
문제 발생 시 RSC 요청에서 URL 불일치 확인:
- 현재 페이지: `/quarterly`
- 요청 URL: `/monthly?_rsc=xxx`
- Next-Url 헤더: `/weekly`

→ Next.js 클라이언트 라우터 상태가 corruption된 것으로 추정

---

## 2. 근본 원인 분석

### 이중화 서버 환경에서의 Next.js 문제점

| 문제 | 설명 |
|------|------|
| **BUILD_ID 불일치** | 각 서버에서 개별 빌드 시 서로 다른 BUILD_ID 생성 |
| **RSC 페이로드 캐시** | CDN/브라우저가 RSC 페이로드를 잘못 캐싱 |
| **라우터 상태 불일치** | 서로 다른 서버로 라우팅될 때 클라이언트 라우터 상태와 서버 상태 불일치 |

### 알려진 Next.js 이슈
- [GitHub #786: mismatch BUILD_ID in multi server](https://github.com/vercel/next.js/issues/786)
- [GitHub Discussion #59167: RSC and CDN cache problems](https://github.com/vercel/next.js/discussions/59167)
- [Contentstack: Handling Next.js RSC Issues](https://www.contentstack.com/docs/developers/launch/handling-nextjs-rsc-issues-on-launch)

---

## 3. 적용된 조치

### 3.1 BUILD_ID 일치 (next.config.ts)
```typescript
// Git commit hash를 빌드 ID로 사용 - 이중화 서버 간 빌드 ID 일치 보장
const getGitCommitHash = (): string => {
  try {
    return execSync("git rev-parse HEAD").toString().trim().slice(0, 12);
  } catch {
    return `build-${Date.now()}`;
  }
};

const nextConfig: NextConfig = {
  generateBuildId: async () => getGitCommitHash(),
  // ...
};
```

**결과**: 두 서버의 BUILD_ID 일치 확인됨 (`Am9OfjkQrYMNeDVZeLB1u`)

### 3.2 캐시 비활성화 (next.config.ts)
```typescript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store, must-revalidate',
        },
      ],
    },
  ];
},
```

### 3.3 동적 렌더링 강제 (layout.tsx)
```typescript
// Server Component에서만 유효
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

### 3.4 Hard Navigation 적용 (임시 조치) ⭐
Next.js 클라이언트 라우터를 우회하여 전체 페이지 새로고침 방식으로 변경

**변경된 파일:**
| 파일 | 변경 내용 |
|------|----------|
| `Header.tsx` | `<Link>` → `<a>` + `window.location.href` |
| `Footer.tsx` | `<Link>` → `<a>` + `window.location.href` |
| `Sidebar.tsx` | `<Link>` → `<a>` + `window.location.href` |
| `ReportList.tsx` | `<Link>` → `<a>` + `window.location.href` |
| `weekly/page.tsx` | `router.push()` → `window.location.href` |

**적용 코드 패턴:**
```typescript
// Hard navigation 함수 - Next.js 클라이언트 라우터 우회
const navigateTo = (path: string) => {
  window.location.href = path;
};

// 사용 예시
<a
  href="/weekly"
  onClick={(e) => {
    e.preventDefault();
    navigateTo('/weekly');
  }}
>
```

---

## 4. 미적용 권장 조치

### 4.1 Sticky Session 설정 (강력 권장)
로드밸런서에서 세션 고정을 설정하면 동일 사용자가 항상 같은 서버로 라우팅됨

**Nginx 설정 예시:**
```nginx
upstream nextjs_servers {
    ip_hash;  # IP 기반 sticky session
    server 10.4.38.10:3000;
    server 10.4.99.10:3000;
}
```

**AWS ALB 설정:**
```
Target Group → Attributes → Stickiness → Enable
- Type: Load balancer generated cookie (AWSALB)
- Duration: 1 day
```

### 4.2 빌드 산출물 공유 (권장)
각 서버에서 개별 빌드하지 않고, 한 번 빌드 후 동일한 `.next` 폴더를 모든 서버에 배포

**현재 방식:**
```
서버 38: git pull → npm run build
서버 99: git pull → npm run build  (별도 빌드)
```

**권장 방식:**
```
빌드 서버: npm run build → .next 폴더 생성
서버 38: .next 폴더 복사 → npm start
서버 99: .next 폴더 복사 → npm start
```

### 4.3 CDN 캐시 전략 검토
배포 후 CDN 캐시 무효화 또는 RSC 요청에 대한 캐시 예외 설정

---

## 5. 현재 상태 요약

| 항목 | 상태 | 비고 |
|------|------|------|
| BUILD_ID 일치 | ✅ 완료 | git commit hash 사용 |
| Cache-Control 헤더 | ✅ 완료 | no-store 설정 |
| 동적 렌더링 강제 | ✅ 완료 | force-dynamic |
| Hard Navigation | ✅ 임시 적용 | `<Link>` 대신 `window.location.href` |
| Sticky Session | ❌ 미적용 | 인프라 설정 필요 |
| 빌드 산출물 공유 | ❌ 미적용 | 배포 프로세스 변경 필요 |

---

## 6. 다음 작업 사항

### 즉시 필요
1. [ ] 배포 후 운영 서버에서 hard navigation 동작 테스트
2. [ ] 문제 재발 여부 모니터링

### 근본적 해결을 위해
3. [ ] Nginx/로드밸런서 Sticky Session 설정 검토
4. [ ] 빌드 프로세스 개선 (한 번 빌드 → 여러 서버 배포)
5. [ ] Sticky Session 적용 후 `<Link>` 컴포넌트 복원 검토

### 참고 문서
- [AWS ALB Sticky Sessions](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/sticky-sessions.html)
- [Next.js Caching Guide](https://nextjs.org/docs/app/guides/caching)
- [The dark side of Next.js](https://dev.to/fullctxdev/the-dark-side-of-nextjs-39ae)

---

## 7. 관련 커밋

```
dfebbc1 fix: Next.js 라우터 대신 hard navigation 사용
3f9adf5 fix: RSC 캐시 완전 비활성화로 이중화 서버 문제 해결
4b86a4e fix: Git commit hash를 빌드 ID로 사용하여 이중화 서버 동기화
0654086 fix: 이중화 서버 RSC 캐시 불일치 문제 해결
```

---

## 8. 부록: 왜 뒤로가기는 문제없는가?

`window.history.back()`은 브라우저 네이티브 API로:
- 서버에 새로운 RSC 요청을 보내지 않음
- bfcache(Back-Forward Cache)에서 복원
- Next.js 클라이언트 라우터를 거치지 않음

반면 `<Link>` 컴포넌트나 `router.push()`는:
- RSC 페이로드 요청 (`?_rsc=xxx`)
- 클라이언트 라우터 상태 업데이트
- 이중화 서버 간 상태 불일치 가능성
