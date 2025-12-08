# Frontend 개발 가이드

**대상**: Frontend 개발자  
**최종 업데이트**: 2025-12-03

---

## 1. 프로젝트 구조

```
web/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── globals.css             # 전역 스타일
│   │   ├── layout.tsx              # 루트 레이아웃
│   │   ├── login/                  # 로그인 페이지
│   │   │   └── page.tsx
│   │   └── (report)/               # 보고서 그룹 (공통 레이아웃)
│   │       ├── layout.tsx          # Header + Sidebar
│   │       ├── weekly/             # 주간 보고서
│   │       │   ├── page.tsx        # 목록 페이지
│   │       │   ├── [id]/page.tsx   # 상세 페이지
│   │       │   ├── layout.tsx      # Weekly 레이아웃
│   │       │   ├── _components/    # 섹션 컴포넌트
│   │       │   └── _styles/        # 커스텀 CSS
│   │       ├── monthly/            # 월간 보고서
│   │       └── quarterly/          # 분기 보고서
│   ├── components/
│   │   ├── common/                 # 공통 컴포넌트
│   │   │   ├── Header.tsx          # 메인 헤더
│   │   │   ├── Icon.tsx            # 아이콘 래퍼
│   │   │   └── PopupChartButton.tsx
│   │   ├── layout/                 # 레이아웃 컴포넌트
│   │   │   ├── Sidebar.tsx         # 사이드바
│   │   │   └── ThemeToggle.tsx     # 다크모드 토글
│   │   ├── report/                 # 보고서 공통
│   │   │   └── ReportList.tsx      # 목록 컴포넌트
│   │   └── ui/                     # 재사용 UI
│   │       ├── GridTable.tsx       # Grid 테이블
│   │       ├── Calendar.tsx        # 캘린더
│   │       ├── Badge.tsx           # 뱃지
│   │       └── Legend.tsx          # 범례
│   ├── services/
│   │   ├── api.ts                  # API 호출 로직
│   │   └── mockData.ts             # Mock 데이터
│   └── types/
│       └── weekly.ts               # TypeScript 타입
├── public/                         # 정적 파일
├── package.json
├── next.config.ts                  # Next.js 설정
├── tailwind.config.ts              # Tailwind 설정
└── tsconfig.json                   # TypeScript 설정
```

---

## 2. 라우팅 구조

### 2.1 페이지 라우팅
```
/login                    → 로그인 페이지
/weekly                   → 주간 보고서 목록
/weekly/40                → 주간 보고서 상세 (ID: 40)
/monthly                  → 월간 보고서 목록
/quarterly                → 분기 보고서 목록
```

### 2.2 레이아웃 계층
```
RootLayout (app/layout.tsx)
└─ ReportLayout (app/(report)/layout.tsx)  ← Header + Sidebar
   ├─ WeeklyLayout (app/(report)/weekly/layout.tsx)
   │  ├─ WeeklyListPage (page.tsx)
   │  └─ WeeklyDetailPage ([id]/page.tsx)
   ├─ MonthlyListPage
   └─ QuarterlyListPage
```

---

## 3. 주요 컴포넌트

### 3.1 레이아웃 컴포넌트

#### Header (`components/common/Header.tsx`)
```typescript
interface HeaderProps {
  onMenuToggle: () => void;  // 사이드바 토글
}
```
- 햄버거 메뉴 버튼
- 페이지 제목
- 테마 토글 (다크모드)

#### Sidebar (`components/layout/Sidebar.tsx`)
```typescript
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
```
- 메뉴: Weekly, Monthly, Quarterly, Settings
- 로그아웃 버튼
- 모바일: Overlay + Slide-in
- 데스크톱: 고정 사이드바

### 3.2 UI 컴포넌트

#### GridTable (`components/ui/GridTable.tsx`)
```typescript
interface GridTableProps {
  columns: number;        // 컬럼 수
  className?: string;
  children: React.ReactNode;
}

interface GridCellProps {
  colSpan?: number;
  rowSpan?: number;
  header?: boolean;
  className?: string;
  children: React.ReactNode;
}
```

**사용 예시**:
```tsx
<GridTable columns={4}>
  <GridCell header>항목</GridCell>
  <GridCell header>값</GridCell>
  <GridCell>모돈</GridCell>
  <GridCell>450두</GridCell>
</GridTable>
```

#### Calendar (`components/ui/Calendar.tsx`)
```typescript
interface CalendarEvent {
  date: string;
  type: 'mating' | 'farrowing' | 'weaning';
  count: number;
  title: string;
}

interface CalendarProps {
  startDate: Date;
  endDate: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}
```

---

## 4. 유틸리티 및 공통 스크립트 가이드

### 4.1 유틸리티 함수 관리 원칙
- **위치**: `src/utils/` 디렉토리 내에 기능별로 그룹화하여 관리
- **문서화**: 각 파일 상단에 해당 모듈의 목적과 포함된 주요 함수들을 주석으로 명시
- **순수 함수 지향**: 가능한 사이드 이펙트가 없는 순수 함수로 작성하여 테스트 용이성 확보

### 4.2 그룹핑 전략 (Grouping Strategy)
유틸리티 함수는 성격에 따라 파일을 분리합니다.

**1. 포맷팅 (Formatters)**
- 파일명: `format.ts`
- 용도: 날짜, 숫자, 통화 등 데이터 표시 형식 변환
- 예시: `formatDate`, `formatNumber`, `formatCurrency`

**2. 유효성 검사 (Validators)**
- 파일명: `validate.ts`
- 용도: 입력값 검증, 이메일/비밀번호 패턴 확인
- 예시: `isValidEmail`, `isValidPassword`, `isEmpty`

**3. 계산 및 로직 (Calculations)**
- 파일명: `calc.ts` 또는 `math.ts`
- 용도: 복잡한 수식 계산, 비즈니스 로직 연산
- 예시: `calculatePSY`, `calculateGrowthRate`

**4. 데이터 변환 (Transformers)**
- 파일명: `transform.ts`
- 용도: API 응답 데이터를 UI용 데이터로 변환
- 예시: `transformChartData`, `mapReportStatus`

### 4.3 작성 예시
```typescript
/**
 * @file format.ts
 * @description 데이터 표시 형식을 변환하는 공통 유틸리티 함수 모음
 * @functions
 * - formatNumber: 숫자에 천 단위 콤마 추가
 * - formatDate: 날짜 객체를 YYYY-MM-DD 문자열로 변환
 */

/**
 * 숫자에 천 단위 콤마를 추가합니다.
 * @param num - 포맷팅할 숫자
 * @returns 콤마가 포함된 문자열 (예: "1,234")
 */
export const formatNumber = (num: number | undefined): string => {
  if (num === undefined || num === null) return '-';
  return num.toLocaleString('ko-KR');
};
```

```

### 4.4 차트 개발 가이드 (Chart Utilities)
차트 라이브러리(ECharts 등) 사용 시 반복되는 설정을 줄이고 일관된 디자인을 유지하기 위해 공통 옵션을 정의하고 병합(Merge)하여 사용합니다.

**1. 공통 옵션 정의 (Base Options)**
- 파일명: `src/utils/chart/baseOptions.ts`
- 내용: 폰트, 색상 팔레트, 툴팁 스타일, 그리드 설정 등 모든 차트에 공통으로 적용되는 속성
```typescript
export const commonChartOptions = {
  textStyle: { fontFamily: 'Pretendard, sans-serif' },
  color: ['#0071e3', '#34a853', '#ff9500', '#ff3b30'],
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#ccc',
    textStyle: { color: '#333' }
  },
  // ...
};
```

**2. 옵션 병합 패턴 (Merge Pattern)**
- 개별 차트에서는 변경되거나 추가되는 속성만 정의하고, 유틸리티 함수를 통해 공통 옵션과 병합합니다.
- `lodash/merge` 또는 전용 merge 함수 사용 권장

```typescript
import { merge } from 'lodash'; // 또는 커스텀 merge 함수
import { commonChartOptions } from '@/utils/chart/baseOptions';

export const getSowChartOption = (data: any) => {
  const specificOptions = {
    xAxis: { data: data.categories },
    series: [{ type: 'bar', data: data.values }]
  };

  // 공통 옵션 + 개별 옵션 병합
  return merge({}, commonChartOptions, specificOptions);
};
```

**3. 차트 유틸리티 그룹핑**
- `src/utils/chart/` 디렉토리 하위에 관리
  - `baseOptions.ts`: 공통 설정
  - `formatters.ts`: 툴팁/축 라벨 포맷터
  - `colors.ts`: 차트 전용 색상 팔레트

---

## 5. 스타일링 및 CSS 가이드

### 5.1 Tailwind CSS v4
- **설정 파일**: `tailwind.config.ts`
- **전역 스타일**: `app/globals.css`
- **원칙**: 가능한 Tailwind 유틸리티 클래스 사용, 복잡한 컴포넌트는 Custom CSS로 분리

### 5.2 CSS 파일 구조 (Mobile First)

> **⚠️ 중요**: 프로젝트는 **Mobile First** 접근 방식을 사용합니다.
> - 기본 스타일은 모바일(480px 이하)용으로 작성
> - 태블릿과 데스크톱 스타일은 `min-width` 미디어 쿼리로 확장

**📁 CSS 파일 구조**:
```
web/src/css/
├── style.css      # 기본 베이스 스타일 (CSS 변수, 레이아웃, 타이포그래피)
├── common.css     # 공통 컴포넌트 스타일 (카드, 테이블, 그리드, 버튼 등)
└── popup.css      # 팝업 전용 스타일 (팝업 테이블, 탭, 배지 등)
```

### 5.3 CSS 파일별 역할 및 우선순위

| 파일 | 역할 | @layer 사용 | 우선순위 | 종속성 |
|------|------|-------------|----------|--------|
| `style.css` | CSS 변수, 기본 레이아웃, 타이포그래피 | `@layer base` | 낮음 | 없음 (베이스) |
| `common.css` | 재사용 컴포넌트 (카드, 테이블, 그리드) | `@layer components` | 중간 | 없음 (독립) |
| `popup.css` | 팝업 전용 스타일 | **없음** | 높음 | 없음 (독립) |

> **⚠️ CSS 우선순위 주의사항**:
> - `@layer` 내부 스타일은 `@layer` 외부 스타일보다 우선순위가 **낮습니다**
> - 팝업처럼 확실히 적용되어야 하는 스타일은 `@layer` 밖에 정의
> - 각 CSS 파일은 **독립적**으로 동작해야 함 (다른 파일에 종속되지 않음)

**Import 예시**:
```typescript
// 필요한 CSS만 선택적으로 import
import '@/css/style.css';      // 기본 베이스 (필수)
import '@/css/common.css';     // 컴포넌트 사용 시
import '@/css/popup.css';      // 팝업 사용 시
```

### 5.4 CSS 파일 분리 원칙

**1. 종속성 없는 독립 설계**
- 각 CSS 파일은 다른 파일에 의존하지 않고 독립적으로 동작
- 공통으로 필요한 CSS 변수는 각 파일에서 `:root`로 재정의 가능

**2. 우선순위 기반 분리**
- 기본값(오버라이드 가능): `@layer base` 또는 `@layer components`
- 확정값(반드시 적용): `@layer` 밖에 정의

**3. 기능별 분리**
- 베이스: 변수, 리셋, 타이포그래피
- 컴포넌트: 재사용 UI 요소
- 특수 기능: 팝업, 모달 등 특정 기능 전용

**브레이크포인트**:
| 구분 | 범위 | 미디어 쿼리 |
|------|------|-------------|
| 모바일 | ~480px | 기본 스타일 (쿼리 없음) |
| 태블릿 | 481px~768px | `@media (min-width: 481px)` |
| 데스크탑 | 769px~ | `@media (min-width: 769px)` |

**구조 예시 (`style.css`)**:

```css
/* ============================================
   [Mobile First 구조]
   - 기본 스타일: 모바일 (480px 이하)
   - @media (min-width: 481px): 태블릿
   - @media (min-width: 769px): 데스크탑
   ============================================ */

/* 1. 모바일 기본 스타일 (Default) */
.popup-tab {
    font-size: 14px;
    padding: 8px 10px;
}

/* 2. 태블릿 스타일 (481px 이상) */
@media (min-width: 481px) {
    .popup-tab {
        font-size: 14px;
        padding: 10px 12px;
    }
}

/* 3. 데스크탑 스타일 (769px 이상) */
@media (min-width: 769px) {
    .popup-tab {
        font-size: 17px;
        padding: 12px 16px;
    }
}
```

**크기 값 규칙 (Mobile < Tablet < Desktop)**:
```css
/* ✅ 올바른 예시: 작은 화면 → 큰 화면 순으로 증가 */
.summary-card .icon {
    font-size: 16px;  /* 모바일 */
}
@media (min-width: 481px) {
    .summary-card .icon { font-size: 18px; }  /* 태블릿 */
}
@media (min-width: 769px) {
    .summary-card .icon { font-size: 20px; }  /* 데스크탑 */
}

/* ❌ 잘못된 예시: 값이 반대로 설정됨 */
.summary-card .icon {
    font-size: 24px;  /* 모바일인데 가장 큼 - 잘못됨! */
}
```

### 5.5 CSS 작성 규칙 (Naming Convention)

**1. 범용적인 클래스명 사용**
- 특정 페이지나 기간(week, month)이 포함된 접두어 지양
- 재사용 가능한 컴포넌트 단위로 작명
- **Bad**: `.weekly-card`, `.monthly-grid`, `.wr-header`
- **Good**: `.report-card`, `.data-grid`, `.page-header`

**2. BEM (Block Element Modifier) 변형 사용**
- 구조: `.block-name__element--modifier` 또는 간소화된 `.block-element-modifier`
- 예시:
  - `.card` (Block)
  - `.card-header` (Element)
  - `.card-title` (Element)
  - `.card--active` (Modifier)

**3. 상태(State) 클래스**
- `is-`, `has-` 접두어 사용
- 예: `.is-active`, `.has-error`, `.is-open`

### 5.6 CSS 파일 구조 및 조직화

**1. 파일 상단 요약 (Summary)**
- 파일의 목적, 주요 섹션, 변수 정의 등을 주석으로 명시
```css
/* ============================================
   REPORT COMMON STYLES
   - Variables
   - Card Component
   - Grid Layout
   ============================================ */
```

**2. CSS 변수 활용 (:root)**
- 색상, 여백, 폰트 크기 등을 변수로 관리하여 테마 대응 용이하게 함
```css
:root {
  --card-bg: #ffffff;
  --text-primary: #111111;
}
.dark {
  --card-bg: #1a1a1a;
  --text-primary: #ffffff;
}
```

**3. 그룹화 (Grouping)**
- 관련 스타일끼리 주석으로 구분하여 그룹화
```css
/* ====================
   Card Component
   ==================== */
.card { ... }
.card-header { ... }

/* ====================
   Grid Layout
   ==================== */
.data-grid { ... }
```

### 5.7 Custom CSS (app/**/*.css)
- **위치**: 해당 컴포넌트 또는 페이지 디렉토리 내 `_styles` 폴더
- **용도**: Tailwind로 표현하기 복잡한 그리드, 애니메이션, 레거시 스타일 포팅

**작성 예시**:
```css
@reference "tailwindcss";

@layer components {
  /* 범용 카드 스타일 */
  .report-card {
    @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700;
    transition: all 0.3s ease;
  }

  /* 범용 그리드 테이블 */
  .data-grid {
    display: grid;
    /* ... */
  }
}
```

### 5.8 테마 모드 (Light/Dark)

#### 다크모드 색상 체계 가이드라인 (필수 준수)

> **⚠️ 중요**: 다크모드 구현 시 아래 색상 체계를 반드시 준수해야 합니다.
> 영역별로 서로 다른 색상 계열을 사용하여 시각적 구분을 명확히 합니다.

**1. 영역별 색상 계열**

| 영역 | 색상 계열 | 팝업 배경 | 테이블 래퍼 | 데이터 행 | 헤더 텍스트 | 강조 색상 |
|------|----------|-----------|-------------|-----------|-------------|-----------|
| 페이지 기본 | 순수 그레이 (Neutral Gray) | `#1f1f23` | `#28282e` | `#35353c` | `#9ca3af` | `#60a5fa` |
| 지난주 주요실적 | 그린 틴트 (Green Tinted) | `#1a211e` | `#232b28` | `#2d3835` | `#8bb9a3` | `#6ee7b7` |
| 금주 실적 | 웜 그레이 (Warm Gray) | `#211f1d` | `#2a2826` | `#38342f` | `#b8a99a` | `#fbbf24` |
| 관리대상 모돈 등 | 현행 유지 | - | - | - | - | - |
| 팝업 | 블루 틴트 (Blue Tinted) | `#1a1d24` | `#232830` | `#2d3340` | `#8b9dc3` | `#6ea8fe` |

**2. 색상 계열 특징**

- **순수 그레이 (Neutral Gray)**: 무채색 기반, 깔끔하고 모던한 느낌
- **그린 틴트 (Green Tinted)**: 자연스러운 그린 톤, 편안하고 안정적인 느낌 (지난주 실적에 적합)
- **웜 그레이 (Warm Gray)**: 따뜻한 브라운 톤, 친근하고 부드러운 느낌 (금주 실적에 적합)
- **블루 틴트 (Blue Tinted)**: 차가운 블루 톤, 전문적이고 신뢰감 있는 느낌 (팝업에 적합)

**3. CSS 변수 적용 예시**

```css
/* 페이지 기본 - 순수 그레이 */
.dark .page-base {
    --bg-primary: #1f1f23;
    --bg-secondary: #28282e;
    --bg-tertiary: #35353c;
    --text-header: #9ca3af;
    --accent: #60a5fa;
}

/* 지난주 섹션 - 그린 틴트 */
.dark #sec-lastweek {
    --bg-primary: #1a211e;
    --bg-secondary: #232b28;
    --bg-tertiary: #2d3835;
    --text-header: #8bb9a3;
    --accent: #6ee7b7;
}

/* 금주 섹션 - 웜 그레이 */
.dark #sec-thisweek {
    --bg-primary: #211f1d;
    --bg-secondary: #2a2826;
    --bg-tertiary: #38342f;
    --text-header: #b8a99a;
    --accent: #fbbf24;
}

/* 팝업 - 블루 틴트 */
.dark .wr-popup-content {
    --bg-primary: #1a1d24;
    --bg-secondary: #232830;
    --bg-tertiary: #2d3340;
    --text-header: #8b9dc3;
    --accent: #6ea8fe;
}
```

**4. 색상 계층 구조 원칙**

각 영역 내에서 배경색은 다음 계층 순서를 따릅니다:
```
가장 어두움 ← 컨테이너 배경 < 래퍼 배경 < 데이터 행 배경 → 가장 밝음
```

예시 (팝업 블루 틴트):
- 팝업 배경: `#1a1d24` (가장 어두움)
- 테이블 래퍼: `#232830` (중간)
- 데이터 행: `#2d3340` (가장 밝음)

**5. 샘플 파일 참조**

색상 샘플은 `/sample/dark-popup-table-samples.html` 파일에서 시각적으로 확인할 수 있습니다.

---

**테마 전환 버튼 위치**:
1. **사이드바**: 하단 또는 상단에 테마 토글 버튼
2. **보고서 상단**: 각 주간/월간 보고서 헤더에 테마 토글 버튼

**구현 방법**:
```tsx
// ThemeToggle 컴포넌트 사용
import { ThemeToggle } from '@/components/layout/ThemeToggle';

<ThemeToggle /> // 어디서든 사용 가능
```

**주의사항**:
- 모든 컴포넌트는 `dark:` 클래스를 사용하여 다크모드 스타일 정의
- 테마 변경 시 `localStorage`에 저장하여 새로고침 시에도 유지

### 5.9 반응형 디자인 (Responsive Design)

> **⚠️ 필수 규칙**: CSS 변경 및 추가 시 **반드시 반응형으로 처리**해야 합니다.
> - 모바일, 태블릿, 데스크톱 모든 화면 크기에서 정상 작동 확인
> - 폰트 크기, 여백, 레이아웃 등 모든 스타일 속성에 적용

**1. 브레이크포인트 (Breakpoints)**

| 구분 | Custom CSS | Tailwind | 용도 |
|------|------------|----------|------|
| 모바일 | 기본 (쿼리 없음) | 기본 | 스마트폰 |
| 태블릿 | `@media (min-width: 481px)` | `sm:` | 태블릿, 소형 노트북 |
| 데스크탑 | `@media (min-width: 769px)` | `md:`, `lg:` | 데스크탑, A4 인쇄 |

**2. 전략 (Strategy)**

> **현재 프로젝트는 Mobile First 방식**으로 구현되어 있습니다.

- **Mobile First** (현재 사용): 기본 스타일을 모바일로 작성하고, `min-width` 미디어 쿼리로 큰 화면 대응
- 모바일 기기가 주요 타겟이므로 Mobile First가 적합

**3. 주요 대응 패턴**
- **레이아웃**: `grid-cols-1` (모바일) → `sm:grid-cols-2` (태블릿) → `md:grid-cols-4` (데스크톱)
- **폰트 크기**: 모바일 < 태블릿 < 데스크탑 순으로 증가
- **숨김 처리**: 공간 부족 시 덜 중요한 요소 숨김 (`hidden sm:block`)
- **A4 레이아웃**: 데스크탑에서만 `max-width: 210mm` 적용

**4. 반응형 CSS 작성 예시 (Mobile First)**
```css
/* 모바일 기본 (480px 이하) */
.card-title {
    font-size: 20px;
}

/* 태블릿 (481px 이상) */
@media (min-width: 481px) {
    .card-title {
        font-size: 22px;
    }
}

/* 데스크탑 (769px 이상) */
@media (min-width: 769px) {
    .card-title {
        font-size: 28px;
    }
}
```

**5. 모바일 전용 유틸리티**
```css
/* 모바일에서만 줄바꿈 표시 */
.mobile-br {
    display: inline;  /* 모바일: 표시 */
}

@media (min-width: 481px) {
    .mobile-br {
        display: none;  /* 태블릿 이상: 숨김 */
    }
}
```

---

## 5.10 요소 ID 명명 규칙 (Element ID Naming Convention)

> **목적**: 페이지 내 섹션, 테이블, 차트 등에 고유 ID를 부여하여 디버깅, 스타일링, 자동화 테스트, 앵커 링크 등에 활용

### ID 접두어 규칙

| 요소 유형 | 접두어 | 예시 | 설명 |
|----------|--------|------|------|
| 섹션(Section) | `sec-` | `sec-lastweek`, `sec-thisweek` | 페이지의 주요 영역 구분 |
| 테이블(Table) | `tbl-` | `tbl-mating-type`, `tbl-farrowing-detail` | 데이터 테이블 |
| 차트(ECharts) | `cht-` | `cht-mating-bar`, `cht-psy-trend` | ECharts 차트 컨테이너 |
| 팝업(Popup) | `pop-` | `pop-mating`, `pop-accident` | 팝업/모달 컨테이너 |
| 그리드(Grid) | `grd-` | `grd-result`, `grd-schedule` | CSS Grid 기반 데이터 표시 |
| 폼(Form) | `frm-` | `frm-search`, `frm-filter` | 입력 폼 |
| 탭(Tab) | `tab-` | `tab-mating-table`, `tab-mating-chart` | 탭 패널 |

### ID 작성 규칙

**1. 구조**: `{접두어}-{컨텍스트}-{세부사항}`
```
sec-lastweek              # 지난주 섹션
tbl-mating-type           # 교배 유형별 테이블
cht-farrowing-trend       # 분만 추이 차트
pop-accident              # 사고 팝업
```

**2. 명명 규칙**
- **소문자 + 케밥케이스**: `sec-last-week` (O), `secLastWeek` (X)
- **영문 약어 사용**: 한글 로마자 변환 허용 (mating, farrowing, weaning 등)
- **고유성 보장**: 페이지 내에서 중복 ID 금지
- **의미있는 이름**: 요소의 목적을 명확히 표현

**3. 컨텍스트 약어 표준**

| 한글 | 영문 약어 | 사용 예시 |
|------|-----------|-----------|
| 모돈 | modon | `sec-modon`, `tbl-modon-status` |
| 교배 | mating | `cht-mating-bar`, `pop-mating` |
| 분만 | farrowing | `tbl-farrowing-detail` |
| 이유 | weaning | `cht-weaning-trend` |
| 사고 | accident | `pop-accident`, `tbl-accident-cause` |
| 도태폐사 | culling | `pop-culling`, `cht-culling-bar` |
| 출하 | shipment | `pop-shipment`, `tbl-shipment-grade` |
| 지난주 | lastweek | `sec-lastweek` |
| 금주 | thisweek | `sec-thisweek` |
| 부가정보 | extra | `sec-extra` |
| PSY | psy | `cht-psy-trend` |
| 경매 | auction | `pop-auction` |
| 날씨 | weather | `sec-weather`, `pop-weather` |

### 적용 예시

**섹션 컴포넌트**:
```tsx
// LastWeekSection.tsx
<div className="report-card" id="sec-lastweek">
    <div className="result-grid" id="grd-lastweek-result">
        {/* 그리드 내용 */}
    </div>
</div>
```

**팝업 컴포넌트**:
```tsx
// MatingPopup.tsx
<PopupContainer id="pop-mating">
    {/* 탭1: 테이블 */}
    <div id="tab-mating-table">
        <table id="tbl-mating-type">...</table>
    </div>

    {/* 탭2: 차트 */}
    <div id="tab-mating-chart">
        <ReactECharts id="cht-mating-recur" />
    </div>
</PopupContainer>
```

**차트 컴포넌트**:
```tsx
// ReactECharts에 ID 전달
<ReactECharts
    option={chartOption}
    style={{ width: '100%', height: '300px' }}
    opts={{ renderer: 'svg' }}
    // ECharts는 wrapper div에 id 적용
/>

// 또는 wrapper div 사용
<div id="cht-mating-recur">
    <ReactECharts option={chartOption} />
</div>
```

### ID 활용 사례

1. **CSS 타겟팅**: 특정 요소에 고유 스타일 적용
   ```css
   #tbl-mating-type .sum-row { background: #f0f0f0; }
   ```

2. **앵커 링크**: 페이지 내 특정 섹션으로 이동
   ```html
   <a href="#sec-lastweek">지난주 실적으로 이동</a>
   ```

3. **자동화 테스트**: Selenium, Playwright 등에서 요소 선택
   ```javascript
   await page.locator('#tbl-mating-type').click();
   ```

4. **디버깅**: 개발자 도구에서 요소 식별 용이

---

## 6. 데이터 관리

### 6.1 API 호출 (`services/api.ts`)

```typescript
import { weeklyApi } from '@/services/api';

// 목록 조회
const reports = await weeklyApi.getList(from, to);

// 상세 조회
const detail = await weeklyApi.getDetail(id);

// 팝업 데이터
const popupData = await weeklyApi.getPopupData(type, id);

// 차트 데이터
const chartData = await weeklyApi.getChartData(chartType);
```

### 6.2 Mock vs 실제 API
환경 변수로 제어:
```env
# .env.local
NEXT_PUBLIC_USE_MOCK=true   # Mock 데이터 사용
NEXT_PUBLIC_USE_MOCK=false  # 실제 API 호출
```

---

## 7. 타입 정의 (`types/weekly.ts`)

### 7.1 주요 인터페이스
```typescript
// 주간 보고서 전체 데이터
interface WeeklyReportData {
  header: WeeklyHeader;
  alertMd: AlertMdData;
  lastWeek: LastWeekData;
  thisWeek: ThisWeekData;
  kpi: KPIData;
  weather: WeatherData;
  todo: TodoData;
}

// 헤더 정보
interface WeeklyHeader {
  farmName: string;
  period: string;
  owner: string;
  weekNum: number;
}

// 지난주 실적
interface LastWeekData {
  period: { weekNum: number; from: string; to: string };
  modon: { regCnt: number; sangsiCnt: number };
  mating: { cnt: number; sum: number };
  // ...
}
```

---

## 8. 개발 워크플로우

### 8.1 새 페이지 추가
1. `app/(report)/[name]/page.tsx` 생성
2. `components/[name]/` 폴더에 컴포넌트 작성
3. `types/[name].ts`에 타입 정의
4. `services/mockData.ts`에 Mock 데이터 추가
5. `services/api.ts`에 API 메서드 추가

### 8.2 새 컴포넌트 추가
1. 용도에 따라 폴더 선택:
   - `components/common/`: 전역 공통
   - `components/ui/`: 재사용 UI
   - `app/(report)/[name]/_components/`: 페이지 전용
2. TypeScript 인터페이스 정의
3. Props 타입 명시
4. Export

---

## 9. 코딩 컨벤션

### 9.1 파일명
- 컴포넌트: `PascalCase.tsx` (예: `Header.tsx`)
- 유틸리티: `camelCase.ts` (예: `api.ts`)
- 스타일: `kebab-case.css` (예: `weekly.css`)

### 9.2 컴포넌트 구조
```typescript
"use client"; // 클라이언트 컴포넌트인 경우

import React from 'react';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={onAction}>Action</button>
    </div>
  );
};
```

### 9.3 Import 순서
1. React 관련
2. Next.js 관련
3. 외부 라이브러리
4. 내부 컴포넌트
5. 타입
6. 스타일

```typescript
import React, { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Header } from '@/components/common/Header';
import { WeeklyReportData } from '@/types/weekly';
import './styles.css';
```

---

## 10. 빌드 & 배포

### 10.1 개발 서버
```bash
npm run dev
```

### 10.2 프로덕션 빌드
```bash
npm run build
npm start
```

### 10.3 타입 체크
```bash
npm run type-check
```

---

## 11. 주의사항

### 11.1 Next.js App Router
- `"use client"` 지시어: 클라이언트 컴포넌트에 필수
- `params`는 Promise: `await params` 사용
- 동적 라우트: `[id]` 폴더명 사용

### 11.2 Tailwind CSS v4
- `@tailwind` 대신 `@reference "tailwindcss"` 사용
- `@apply` 사용 시 주의 (v4에서 제한적)

### 11.3 TypeScript
- `any` 타입 지양
- Props 인터페이스 명시
- Null 체크: `value ?? undefined` 사용

---

## 12. 유용한 명령어

```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 린트 검사
npm run lint

# 타입 체크
npx tsc --noEmit

# 의존성 업데이트
npm update
```

---

## 13. 참고 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [React 공식 문서](https://react.dev/)
