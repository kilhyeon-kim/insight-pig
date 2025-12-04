# 주간 리포트 마이그레이션 가이드

## 개요
- **소스**: `C:\Projects\pig3.1\pigplan\pigplanxe\src\main\webapp\inspigplan_1\week\`
- **타겟**: `C:\Projects\inspig\web\src\app\(report)\weekly\`
- **작업**: 기존 inspig weekly 컴포넌트 전체 삭제 후 프로토타입 기반 재구현

---

## 1. 프로토타입 HTML 구조 분석

### 1.1 파일 구성
| 파일명 | 설명 |
|--------|------|
| `weekly.html` | 메인 레이아웃 (섹션 구조) |
| `style.css` | 라이트모드 스타일 (~1900 lines) |
| `style-dark.css` | 다크모드 스타일 |
| `popup.js` | 팝업 템플릿 정의 |
| `popup.css` | 팝업 스타일 |
| `popup-dark.css` | 팝업 다크모드 스타일 |
| `com.js` | 공통 함수 (데이터바인딩, 팝업열기 등) |
| `data.js` | 샘플 데이터 |
| `echartsApi.js` | 차트 설정 |

### 1.2 섹션 구조 (weekly.html)
```
page-wrapper
└─ container
   ├─ secHeader        : 헤더 (농장명, 기간, 테마토글)
   ├─ secAlertMd       : 관리대상모돈 알림카드
   ├─ secLastWeek      : 지난주 주요실적 (그리드 테이블)
   ├─ secThisWeek      : 금주 작업예정 (캘린더 + 요약카드)
   ├─ secKPI           : KPI 지표 (PSY, 이유일령, 경락가격)
   ├─ secWeather       : 주간 날씨
   ├─ secTodo          : 중점관리사항
   └─ footer           : 푸터
```

### 1.3 주요 CSS 클래스 체계
```css
/* 카드 시스템 */
.wr-card              /* 기본 카드 */
.alert-card           /* 알림 카드 */
.card-header          /* 카드 헤더 */
.card-body            /* 카드 바디 */

/* 그리드 테이블 (secLastWeek) */
.result-grid          /* 6컬럼 그리드 */
.cell                 /* 기본 셀 */
.cell.header          /* 헤더 셀 */
.cell.label           /* 레이블 셀 (좌측) */
.cell.count           /* 수치 셀 */
.cell.avg             /* 평균 셀 */
.cell.lastweek        /* 지난주 강조 */

/* 캘린더 (secThisWeek) */
.schedule-calendar    /* 캘린더 컨테이너 */
.cal-grid             /* 7일 그리드 */
.cal-day              /* 일별 셀 */
.cal-values           /* 값 표시 영역 */

/* 범례 */
.legend               /* 범례 컨테이너 */
.legend-item          /* 범례 아이템 */
.legend-dot           /* 색상 점 */

/* 팝업 */
.wr-layer-popup       /* 팝업 오버레이 */
.wr-popup-content     /* 팝업 컨텐츠 */
.wr-popup-tabs        /* 탭 헤더 */
.wr-table             /* 팝업 내 테이블 */
```

### 1.4 팝업 타입 (popup.js)
| 템플릿 ID | 설명 | 탭 구조 |
|-----------|------|---------|
| `tpl-alertMd` | 관리대상모돈 | 단일 테이블 |
| `tpl-modon` | 모돈 현황 | 2탭 (테이블/차트) |
| `tpl-mating` | 교배 실적 | 2탭 (테이블/차트) |
| `tpl-farrowing` | 분만 실적 | 단일 (2섹션) |
| `tpl-weaning` | 이유 실적 | 단일 (2섹션) |
| `tpl-accident` | 임신사고 | 2탭 (테이블/차트) |
| `tpl-culling` | 도태폐사 | 단일 (스탯바+테이블) |
| `tpl-shipment` | 출하 실적 | 3탭 |
| `tpl-scheduleGb` | 교배 예정 | 단일 테이블 |
| `tpl-scheduleBm` | 분만 예정 | 단일 테이블 |
| `tpl-scheduleEu` | 이유 예정 | 단일 테이블 |

---

## 2. 기존 inspig 구조 (삭제 대상)

### 2.1 삭제 대상 파일
```
web/src/app/(report)/weekly/
├─ layout.tsx           # 삭제
├─ page.tsx             # 삭제 (목록 페이지)
├─ [tab]/page.tsx       # 삭제
└─ _components/
   ├─ SummaryContent.tsx    # 삭제
   ├─ ThisweekContent.tsx   # 삭제
   └─ LastweekContent.tsx   # 삭제 (757 lines)
```

### 2.2 관련 컴포넌트 (검토 후 수정/삭제)
```
web/src/components/
├─ charts/
│  ├─ ChartModal.tsx    # 수정 필요
│  ├─ BarChart.tsx      # 유지
│  ├─ LineChart.tsx     # 유지
│  └─ PieChart.tsx      # 유지
├─ ui/
│  ├─ Modal.tsx         # 유지
│  ├─ DataTable.tsx     # 수정 필요
│  └─ StatCard.tsx      # 삭제 (새 디자인)
└─ common/
   └─ PopupChartButton.tsx  # 수정 필요
```

### 2.3 타입/서비스 (수정 필요)
```
web/src/types/weekly.ts      # 전면 수정
web/src/services/api.ts      # weekly API 수정
```

---

## 3. 신규 구조 설계

### 3.1 디렉토리 구조
```
web/src/app/(report)/weekly/
├─ layout.tsx                 # 주간 리포트 레이아웃
├─ page.tsx                   # 메인 페이지 (단일 페이지)
├─ _components/
│  ├─ WeeklyHeader.tsx        # secHeader
│  ├─ AlertCard.tsx           # secAlertMd
│  ├─ LastWeekSection.tsx     # secLastWeek (그리드 테이블)
│  ├─ ThisWeekSection.tsx     # secThisWeek (캘린더)
│  ├─ KPISection.tsx          # secKPI
│  ├─ WeatherSection.tsx      # secWeather
│  ├─ TodoSection.tsx         # secTodo
│  └─ popups/
│     ├─ PopupContainer.tsx   # 팝업 컨테이너
│     ├─ AlertMdPopup.tsx
│     ├─ ModonPopup.tsx
│     ├─ MatingPopup.tsx
│     ├─ FarrowingPopup.tsx
│     ├─ WeaningPopup.tsx
│     ├─ AccidentPopup.tsx
│     ├─ CullingPopup.tsx
│     ├─ ShipmentPopup.tsx
│     └─ SchedulePopup.tsx
└─ _styles/
   └─ weekly.css              # 전용 스타일 (Tailwind 보완)
```

### 3.2 공통 컴포넌트 추가
```
web/src/components/
├─ ui/
│  ├─ GridTable.tsx           # 그리드 기반 테이블 (신규)
│  ├─ Calendar.tsx            # 작업 캘린더 (신규)
│  ├─ Legend.tsx              # 범례 (신규)
│  └─ Badge.tsx               # 뱃지 (신규)
└─ layout/
   └─ ThemeToggle.tsx         # 테마 토글 (신규)
```

---

## 4. 스타일 마이그레이션

### 4.1 CSS 변수 매핑
```css
/* 프로토타입 → Tailwind/CSS변수 */
--wr-text-primary: #1a1a2e    → text-gray-900
--wr-text-secondary: #4a5568  → text-gray-600
--wr-accent-primary: #667eea  → var(--primary)
--wr-accent-secondary: #48bb78 → var(--success)
--wr-accent-red: #f56565      → var(--danger)
--wr-accent-orange: #ed8936   → var(--warning)
```

### 4.2 반응형 브레이크포인트
```css
/* 프로토타입 기준 */
@media (max-width: 768px)   /* 모바일 */
@media (max-width: 480px)   /* 소형 모바일 */

/* Tailwind 매핑 */
sm: 640px, md: 768px, lg: 1024px
```

### 4.3 다크모드
- Tailwind `dark:` 클래스 활용
- CSS 변수 오버라이드 방식 유지

---

## 5. 데이터 타입 정의

### 5.1 주요 타입 (types/weekly.ts)
```typescript
// 주간 리포트 전체 데이터
interface WeeklyReportData {
  header: WeeklyHeader;
  alertMd: AlertMdData;
  lastWeek: LastWeekData;
  thisWeek: ThisWeekData;
  kpi: KPIData;
  weather: WeatherData;
  todo: TodoData;
}

// 지난주 실적
interface LastWeekData {
  period: { weekNum: number; from: string; to: string };
  modon: { regCnt: number; sangsiCnt: number };
  mating: { cnt: number; sum: number };
  farrowing: { cnt: number; totalCnt: number; liveCnt: number; /* ... */ };
  weaning: { cnt: number; jdCnt: number; /* ... */ };
  accident: { cnt: number; sum: number };
  culling: { cnt: number; sum: number };
  shipment: { cnt: number; avg: number; sum: number; avgSum: number };
}

// 팝업 데이터
interface PopupData {
  alertMd: AlertMdPopupData[];
  modon: ModonPopupData;
  mating: MatingPopupData;
  // ...
}
```

---

## 6. 마이그레이션 순서

### Phase 1: 기반 작업
1. [ ] 기존 weekly 컴포넌트 전체 삭제
2. [ ] types/weekly.ts 재정의
3. [ ] 공통 UI 컴포넌트 생성 (GridTable, Calendar, Legend)
4. [ ] weekly.css 스타일 마이그레이션

### Phase 2: 메인 섹션
5. [ ] WeeklyHeader 구현
6. [ ] AlertCard 구현
7. [ ] LastWeekSection 구현 (그리드 테이블)
8. [ ] ThisWeekSection 구현 (캘린더)

### Phase 3: 부가 섹션
9. [ ] KPISection 구현
10. [ ] WeatherSection 구현
11. [ ] TodoSection 구현

### Phase 4: 팝업
12. [ ] PopupContainer 구현
13. [ ] 각 팝업 컴포넌트 구현 (11개)

### Phase 5: 통합 및 테스트
14. [ ] API 연동
15. [ ] 다크모드 테스트
16. [ ] 반응형 테스트

---

## 7. 주의사항

### 7.1 프로토타입 준수
- CSS 클래스명 및 구조는 프로토타입 기준
- Tailwind는 보조적 사용 (간단한 마진/패딩 등)
- 복잡한 레이아웃은 전용 CSS 클래스 사용

### 7.2 그리드 테이블 (secLastWeek)
- CSS Grid 6컬럼 구조 유지
- `row-span`, `span-2` 등 셀 병합 지원
- 클릭 이벤트로 팝업 연동

### 7.3 팝업 시스템
- 템플릿 기반 → React 컴포넌트 전환
- 탭 구조 유지 (탭 인디케이터 애니메이션)
- ECharts 차트 lazy loading

### 7.4 다크모드
- `dark-mode` 클래스 → Tailwind `dark:` 또는 CSS 변수
- 차트 색상도 다크모드 대응 필요

---

## 8. 참고 리소스

### 프로토타입 파일
- 메인: `inspigplan_1/week/weekly.html`
- 스타일: `inspigplan_1/week/style.css`
- 팝업: `inspigplan_1/week/popup.js`, `popup.css`
- 데이터: `inspigplan_1/week/data.js`

### 샘플 파일
- `inspigplan_1/sample/legend-samples.html`
- `inspigplan_1/sample/모돈구성비율.png`
