# HTML 프로토타입 → Next.js 전환 참조

**대상**: Frontend 개발자 (참조용)  
**최종 업데이트**: 2025-12-04  
**상태**: 참조 문서 (전환 완료)

---

## 1. 개요

이 문서는 HTML 프로토타입을 Next.js로 전환한 과정을 기록한 참조 자료입니다.  
실제 전환 작업은 완료되었으며, 향후 유사한 작업 시 참고용으로 사용합니다.

---

## 2. 프로토타입 구조 분석

### 2.1 HTML 파일 구조
```
References/ (또는 기존 프로토타입 위치)
├── weekly.html         # 메인 HTML
├── style.css           # 라이트 모드 스타일
├── style-dark.css      # 다크 모드 스타일
├── popup.js            # 팝업 로직
└── data.js             # Mock 데이터
```

### 2.2 섹션 구조 (`weekly.html`)
```html
<div class="page-wrapper">
  <div class="container">
    <section id="secHeader">헤더</section>
    <section id="secAlertMd">관리대상모돈 알림</section>
    <section id="secLastWeek">지난주 실적</section>
    <section id="secThisWeek">금주 계획</section>
    <section id="secKPI">운영 스냅샷</section>
    <section id="secWeather">날씨</section>
    <section id="secTodo">할일</section>
    <footer>푸터</footer>
  </div>
</div>
```

---

## 3. 전환 매핑

### 3.1 HTML → Next.js 컴포넌트

| HTML 섹션 | Next.js 컴포넌트 | 위치 |
|-----------|------------------|------|
| `#secHeader` | `WeeklyHeader.tsx` | `app/(report)/weekly/_components/` |
| `#secAlertMd` | `AlertCard.tsx` | `app/(report)/weekly/_components/` |
| `#secLastWeek` | `LastWeekSection.tsx` | `app/(report)/weekly/_components/` |
| `#secThisWeek` | `ThisWeekSection.tsx` | `app/(report)/weekly/_components/` |
| `#secKPI` | `KPISection.tsx` | `app/(report)/weekly/_components/` |
| `#secWeather` | `WeatherSection.tsx` | `app/(report)/weekly/_components/` |
| `#secTodo` | `TodoSection.tsx` | `app/(report)/weekly/_components/` |

### 3.2 CSS → Tailwind + Custom CSS

| 기존 CSS 클래스 | 전환된 클래스명 | 비고 |
|----------------|---------------|------|
| `.wr-card` | `.report-card` | 범용적 명명 규칙 적용 |
| `.wr-grid-table` | `.result-grid` | CSS Grid (`weekly.css`) |
| `.wr-calendar` | `.calendar-grid` | Custom CSS (`weekly.css`) |
| `.weekly-summary-*` | `.summary-*` | 페이지 접두어 제거 |
| `.wr-scroll-to-top` | `.scroll-to-top` | 범용적 명명 |
| `--wr-*` (CSS 변수) | `--rp-*` | report 접두어로 통일 |

### 3.3 JavaScript → React Hooks

| 기존 JS 기능 | React 구현 |
|-------------|-----------|
| `popup.js` | `PopupContainer.tsx` + 개별 팝업 컴포넌트 |
| `data.js` | `mockData.ts` + TypeScript 타입 |
| DOM 조작 | React State (`useState`) |
| 이벤트 리스너 | React Event Handlers (`onClick`, `onChange`) |

---

## 4. 주요 전환 사항

### 4.1 Grid Table
**HTML (기존)**:
```html
<div class="wr-grid-table" style="grid-template-columns: repeat(4, 1fr);">
  <div class="cell header">항목</div>
  <div class="cell header">값</div>
  <div class="cell">모돈</div>
  <div class="cell">450두</div>
</div>
```

**React (전환 후)**:
```tsx
<GridTable columns={4}>
  <GridCell header>항목</GridCell>
  <GridCell header>값</GridCell>
  <GridCell>모돈</GridCell>
  <GridCell>450두</GridCell>
</GridTable>
```

### 4.2 팝업
**HTML (기존)**:
```javascript
// popup.js
function openPopup(type) {
  const popup = document.getElementById('popup-' + type);
  popup.style.display = 'block';
}
```

**React (전환 후)**:
```tsx
const [activePopup, setActivePopup] = useState<string | null>(null);

<AlertMdPopup 
  isOpen={activePopup === 'alertMd'} 
  onClose={() => setActivePopup(null)} 
  data={popupData.alertMd} 
/>
```

### 4.3 다크모드
**HTML (기존)**:
```javascript
// theme toggle
document.body.classList.toggle('dark-mode');
```

**React (전환 후)**:
```tsx
// ThemeToggle.tsx
const toggleTheme = () => {
  const newTheme = theme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', newTheme);
};
```

---

---

## 5. 스타일 전환

> **Note**: CSS 생성 및 명명 규칙은 `02-frontend.md`의 **4.2 CSS 작성 규칙**을 따릅니다.
> - 범용적인 클래스명 사용 (`.report-card` 등)
> - BEM 변형 및 상태 클래스 활용
> - `wr-` 접두어 대신 의미 있는 이름 사용 권장

### 5.1 Tailwind CSS 적용
**기존 CSS**:
```css
.wr-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 20px;
}
```

**Tailwind (전환 후)**:
```tsx
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
```

### 5.2 Custom CSS 유지
복잡한 Grid 레이아웃은 Custom CSS로 유지하되, 새로운 명명 규칙 적용:
```css
/* weekly.css */
.data-grid {  /* 기존 .wr-grid-table 대체 */
  display: grid;
  gap: 1px;
  background: var(--border-color);
}
```

### 5.3 스타일 및 폰트 유지
기존 CSS에서 정의된 스타일과 폰트는 가능한 유지하여 디자인 일관성을 확보합니다.
- **폰트**: `Pretendard` 등 기존 폰트 설정을 `globals.css` 또는 `layout.tsx`에 적용
- **커스텀 스타일**: Tailwind 유틸리티로 대체하기 어려운 복잡한 스타일은 `_styles` 폴더 내 CSS 파일로 이관하여 유지
- **변수**: 기존 CSS 변수(`--wr-*`)를 새로운 네이밍 규칙(`--rp-*`)에 맞춰 마이그레이션하되 값은 유지

---

## 6. 데이터 구조 전환

### 6.1 JavaScript → TypeScript
**기존 (data.js)**:
```javascript
const weeklyData = {
  header: {
    farmName: '행복한 농장',
    period: '2023.10.01 ~ 2023.10.07'
  }
};
```

**전환 후 (weekly.ts)**:
```typescript
interface WeeklyHeader {
  farmName: string;
  period: string;
  owner: string;
  weekNum: number;
}

interface WeeklyReportData {
  header: WeeklyHeader;
  alertMd: AlertMdData;
  // ...
}
```

---

## 7. 라우팅 전환

### 7.1 단일 HTML → 다중 페이지
**기존**: `weekly.html` (단일 파일)

**전환 후**:
```
/weekly           → 목록 페이지
/weekly/40        → 상세 페이지 (ID: 40)
```

---

## 8. 전환 시 주의사항

### 8.1 CSS 클래스명 규칙
프로토타입 전환 후 `02-frontend.md`의 CSS 명명 규칙을 따릅니다:
- 페이지 접두어 제거 (`.wr-*`, `.weekly-*` → `.report-*`, `.summary-*`)
- 범용적이고 재사용 가능한 이름 사용
- CSS 변수 접두어: `--rp-*` (report)

### 8.2 Grid 레이아웃
CSS Grid는 Tailwind로 완전히 대체하기 어려우므로 Custom CSS 유지

### 8.3 차트 라이브러리
ECharts 사용 시 `"use client"` 지시어 필수 (클라이언트 컴포넌트)

---

## 9. 전환 완료 체크리스트

- [x] HTML 구조 분석
- [x] 섹션별 컴포넌트 생성
- [x] CSS → Tailwind + Custom CSS 전환
- [x] JavaScript → React Hooks 전환
- [x] 데이터 구조 TypeScript 타입 정의
- [x] 팝업 시스템 구현
- [x] 다크모드 지원
- [x] 반응형 디자인 적용
- [x] 라우팅 구조 설계
- [x] Mock 데이터 연동

---

## 10. 참고 사항

- 이 문서는 **참조용**이며, 실제 전환 작업은 부분완료.
- 향후 Monthly/Quarterly 보고서 구현 시 유사한 패턴 적용 가능
- HTML 프로토타입은 `References/` 폴더에 보관 (필요 시 참조)
- 전환시 css, js 등 기능 누락없이 모두 전환

---

## 11. 관련 문서

- `02-frontend.md`: Frontend 구조 및 개발 가이드
- `01-overview.md`: 프로젝트 전체 개요
