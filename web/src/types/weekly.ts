export interface WeeklyReportData {
  header: WeeklyHeader;
  alertMd: AlertMdData;
  lastWeek: LastWeekData;
  thisWeek: ThisWeekData;
  kpi: KPIData;
  weather: WeatherData;
  todo: TodoData;
}

export interface WeeklyHeader {
  farmName: string;
  period: string | { from: string; to: string };
  owner: string;
  weekNum: number;
}

export interface AlertMdData {
  count: number;
  items: any[];
  list?: AlertMdItem[];
  euMiCnt?: number;      // 이유후 미교배
  sgMiCnt?: number;      // 사고후 미교배
  bmDelayCnt?: number;   // 교배후 분만지연
  euDelayCnt?: number;   // 분만후 이유지연
}

export interface AlertMdItem {
  id: string;
  sowId: string;
  issue: string;
  days: number;
  desc: string;
}

export interface LastWeekData {
  period: { weekNum: number; from: string; to: string };
  modon: {
    regCnt: number;
    sangsiCnt: number;
    regCntChange?: number;      // 현재모돈 전주대비 증감
    sangsiCntChange?: number;   // 상시모돈 전주대비 증감
  };
  mating: { cnt: number; sum: number };
  farrowing: {
    cnt: number;
    totalCnt: number;
    liveCnt: number;
    deadCnt: number;
    mummyCnt: number;
    // 누계 데이터
    sumCnt?: number;           // 분만 복수 누계
    sumTotalCnt?: number;      // 총산자수 누계
    sumLiveCnt?: number;       // 실산자수 누계
    avgTotal?: number;         // 총산 평균
    avgLive?: number;          // 실산 평균
    sumAvgTotal?: number;      // 누계 총산 평균
    sumAvgLive?: number;       // 누계 실산 평균
    // 증감 데이터 (1년평균 대비)
    changeTotal?: number;      // 총산 증감
    changeLive?: number;       // 실산 증감
  };
  weaning: {
    cnt: number;
    jdCnt: number;
    pigletCnt: number;
    avgWeight: number;
    avgJdCnt?: number;         // 지난주 평균 이유두수 (jdCnt / cnt)
    // 누계 데이터
    sumCnt?: number;           // 이유 복수 누계
    sumJdCnt?: number;         // 이유자돈수 누계
    sumAvgJdCnt?: number;      // 누계 평균 이유두수
    sumAvgWeight?: number;     // 누계 평균 체중
    // 증감 데이터 (1년평균 대비)
    changeJdCnt?: number;      // 평균 이유두수 증감
    changeWeight?: number;     // 평균체중 증감
  };
  accident: {
    cnt: number;
    sum: number;
    avgGyungil?: number;      // 지난주 평균 경과일
    sumAvgGyungil?: number;   // 당해년도 평균 경과일
  };
  culling: { cnt: number; sum: number };
  shipment: { cnt: number; avg: number; sum: number; avgSum: number };
}

export interface ThisWeekData {
  calendar: CalendarEvent[];
  summary: ThisWeekSummary;
  // 캘린더 그리드 데이터 (프로토타입 _cal 구조)
  calendarGrid?: CalendarGridData;
}

export interface CalendarEvent {
  date: string;
  type: 'mating' | 'farrowing' | 'weaning' | 'other';
  count?: number;
  title?: string;
}

export interface ThisWeekSummary {
  matingGoal: number;
  farrowingGoal: number;
  weaningGoal: number;
}

/**
 * 금주 작업예정 캘린더 그리드 데이터
 * @see data.js secThisWeek._cal
 */
export interface CalendarGridData {
  weekNum: number;           // 주차
  periodFrom: string;        // 시작일 (MM.DD)
  periodTo: string;          // 종료일 (MM.DD)
  dates: (number | string)[]; // 날짜 배열 [25, 26, 27, 28, 29, 30, '01']
  // 요약 카드 합계
  gbSum: number;             // 교배 합계
  imsinSum: number;          // 재발확인 합계 (3주+4주)
  bmSum: number;             // 분만 합계
  euSum: number;             // 이유 합계
  vaccineSum: number;        // 모돈백신 합계
  shipSum: number;           // 출하 합계
  // 캘린더 셀 데이터 (null = 빈 셀)
  gb: (number | null)[];           // 교배 [월,화,수,목,금,토,일]
  bm: (number | null)[];           // 분만
  imsin3w: (number | null)[];      // 재발확인 3주
  imsin4w: (number | null)[];      // 재발확인 4주
  eu: (number | null)[];           // 이유
  vaccine: (number | null)[];      // 모돈백신
  ship: number;                    // 출하 (병합 셀)
  // 산출기준 도움말 (TB_PLAN_MODON 기반)
  help?: ScheduleHelpData;
}

/**
 * 작업예정 산출기준 도움말 데이터
 * @see SP_INS_WEEK_SCHEDULE_POPUP (GUBUN='SCHEDULE', SUB_GUBUN='HELP')
 */
export interface ScheduleHelpData {
  mating: string;        // 교배 산출기준 (예: "이유후교배(7일),사고후교배(0일)")
  farrowing: string;     // 분만 산출기준 (예: "분만예정(115일)")
  weaning: string;       // 이유 산출기준 (예: "이유예정(21일)")
  vaccine: string;       // 백신 산출기준 (예: "분만전백신(-7일)")
  shipment: string;      // 출하 산출기준 (예: "이유일+(180-21)=159일")
  checking: string;      // 재발확인 산출기준 (고정: "교배일+21일/28일")
}

export interface KPIData {
  psy: number;
  weaningAge: number;
  marketPrice: number;
}

export interface WeatherData {
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  date: string;
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  icon?: string;
}

export interface TodoData {
  items: TodoItem[];
}

export interface TodoItem {
  id: string;
  content: string;
  completed: boolean;
}

// Popup Data Interfaces
// mating, farrowing, weaning은 DB에서 직접 조회 (popup API 사용)
export interface PopupData {
  alertMd: AlertMdPopupData[];
  modon: ModonPopupData;
  accident: AccidentPopupData;
  culling: CullingPopupData;
  shipment: ShipmentPopupData;
  schedule: SchedulePopupData;
}

/**
 * 관리대상모돈 팝업 데이터 (초과일수 × 구분별 교차표)
 * @see data.js _pop.alertMd
 */
export interface AlertMdPopupData {
  period: string;      // 초과일수 구간 (~3, 4~7, 8~14, 14~)
  hubo: number;        // 미교배 후보돈
  euMi: number;        // 이유후 미교배돈
  sgMi: number;        // 사고후 미교배돈
  bmDelay: number;     // 교배후 분만지연돈
  euDelay: number;     // 분만후 이유지연돈
}

/**
 * 모돈현황 팝업 데이터 (탭: 모돈구성비율 테이블 + 산차별현황 차트)
 * @see data.js _pop.modon
 */
export interface ModonPopupData {
  table: ModonTableRow[];
  chart: {
    xAxis: string[];
    data: number[];
  };
}

export interface ModonTableRow {
  parity: string;
  hubo: number | null;
  imsin: number | null;
  poyu: number | null;
  eumo: number | null;
  sago: number | null;
  change: number | null;
  group: 'hubo' | 'current';
}

/**
 * 교배 실적 팝업 데이터 (탭: 유형별 교배복수 테이블 + 재귀일별 차트)
 * @see data.js _pop.mating
 */
export interface MatingPopupData {
  table: MatingTableRow[];
  total: { planned: number; actual: number; rate: string };
  chart: {
    xAxis: string[];
    data: number[];
  };
  // 요약 정보 (GB_STAT)
  summary?: {
    totalActual: number;       // 합계 실적
    totalPlanned: number;      // 합계 예정
    accidentCnt: number;       // 교배도중 사고복수
    farrowingCnt: number;      // 교배도중 분만복수
    avgReturnDay: number;      // 평균 재귀발정일
    avgFirstGbDay: number;     // 평균 초교배일
    firstGbCnt: number;        // 초교배복수 (실적)
    firstGbPlanned: number;    // 초교배복수 (예정)
    jsGbCnt: number;           // 정상교배복수 (실적)
    jsGbPlanned: number;       // 정상교배복수 (예정)
    sagoGbCnt: number;         // 재발교배복수 (실적) - 예정 없음
  };
}

export interface MatingTableRow {
  type: string;
  planned: number;
  actual: number;
  rate: string;
}

/**
 * 분만 실적 팝업 데이터 (작업예정대비 + 분만성적 테이블)
 * @see data.js _pop.farrowing
 */
export interface FarrowingPopupData {
  planned: number;
  actual: number;
  rate: string;
  stats: {
    totalBorn: { sum: number; avg: number };
    bornAlive: { sum: number; avg: number; rate: string };
    stillborn: { sum: number; avg: number; rate: string };
    mummy: { sum: number; avg: number; rate: string };
    culling: { sum: number; avg: number; rate: string };
    foster: { sum: number; avg: number; rate: string };  // 양자 (전입-전출)
    nursingStart: { sum: number; avg: number; rate: string };
  };
}

/**
 * 이유 실적 팝업 데이터 (작업예정대비 + 이유성적 테이블)
 * @see data.js _pop.weaning
 */
export interface WeaningPopupData {
  planned: number;
  actual: number;
  rate: string;
  // 분만 기준 카드 (이유 대상 모돈의 분만 정보)
  farrowingBased: {
    totalBirth: number;   // 총산 합계 (실산+사산+미라)
    liveBirth: number;    // 실산 합계
    nursingStart: number; // 포유개시 합계 (실산-폐사+전입-전출)
  };
  stats: {
    weanPigs: { sum: number; avg: number };
    nursingDays: { sum: number; avg: number };
    avgWeight: { avg: number };
    survivalRate: { rate: string };
    nursingStart: { sum: number };  // 포유개시 합계 (실산-폐사+전입-전출)
  };
  pigletChanges: {
    dead: number;         // 포유자돈폐사 (160001)
    partialWean: number;  // 부분이유 (160002)
    fosterIn: number;     // 양자전입 (160003)
    fosterOut: number;    // 양자전출 (160004)
  };
}

/**
 * 임신사고 팝업 데이터 (탭: 원인별 테이블 + 임신일별 차트)
 * @see data.js _pop.accident
 */
export interface AccidentPopupData {
  table: AccidentTableRow[];
  chart: {
    xAxis: string[];
    data: number[];
  };
}

export interface AccidentTableRow {
  type: string;
  lastWeek: number;
  lastWeekPct: number;
  lastMonth: number;
  lastMonthPct: number;
}

/**
 * 도태폐사 팝업 데이터 (유형별 스탯바 + 원인별 테이블 + 상태별 차트)
 * @see data.js _pop.culling
 * @see docs/db/ins/week/32.culling-popup.md
 */
export interface CullingPopupData {
  stats: {
    dotae: number;
    dead: number;
    transfer: number;
    sale: number;
  };
  table: CullingTableRow[];
  // 상태별 차트 (DOPE_CHART) - 두 번째 탭
  chart: {
    xAxis: string[];    // ['후보돈', '임신돈', '포유돈', '대리모돈', '이유모돈', '재발돈', '유산돈']
    data: number[];     // CNT_1~CNT_7
    items?: CullingChartItem[];  // 상세 데이터 (상태코드 포함)
  };
}

export interface CullingChartItem {
  status: string;     // 상태명 (TC_CODE_SYS PCODE='01' 코드명)
  statusCd: string;   // 상태코드 (010001~010007)
  count: number;      // 두수
}

export interface CullingTableRow {
  reason: string;
  lastWeek: number;
  lastMonth: number;
}

/**
 * 출하 실적 팝업 데이터 (3탭: 출하현황 + 출하분석차트 + 도체분포차트)
 * @see docs/db/ins/week/41.shipment-popup.md
 * GUBUN='SHIP', SUB_GUBUN='STAT/ROW/CHART/SCATTER'
 */
export interface ShipmentPopupData {
  // 상단 메트릭스 (2x2 그리드)
  metrics: {
    totalCount: number; // 지난주 출하두수
    compareLastWeek: string; // 전주대비 (현재 미지원)
    grade1Rate: number; // 1등급↑ 합격율(%)
    avgCarcass: number; // 평균 도체중(kg)
    avgBackfat: number; // 평균 등지방(mm)
    farmPrice: number; // 내농장가 (별도 소스)
    nationalPrice: number; // 전국평균가 (별도 소스)
  };
  // 육성율 산출기준 설정값 (툴팁용)
  rearingConfig?: {
    shipDay: number;     // 기준출하일령 (기본 180일)
    weanPeriod: number;  // 평균포유기간 (기본 21일)
    euDays: number;      // 역산일 (shipDay - weanPeriod)
    euDateFrom: string;  // 이유일 FROM (MM.DD)
    euDateTo: string;    // 이유일 TO (MM.DD)
  };
  // 등급 분포 차트 (가로 막대)
  gradeChart: ShipmentGradeChartItem[];
  // 크로스탭 테이블 (15행 × 7일)
  table: {
    days: string[]; // 날짜 배열 ['11.18', '11.19', ...]
    rows: ShipmentTableRow[];
  };
  // 출하분석 차트 (막대+라인 복합)
  analysisChart: {
    dates: string[];
    shipCount: number[]; // 출하두수 (막대)
    avgWeight: number[]; // 평균 체중 (라인)
    avgBackfat: number[]; // 평균 등지방 (라인)
  };
  // 도체분포 산점도
  carcassChart: {
    data: number[][]; // [[도체중, 등지방, 두수], ...]
  };
}

/**
 * 출하 등급 차트 아이템
 */
export interface ShipmentGradeChartItem {
  name: string; // 1+, 1, 2, 등외
  value: number; // 두수
  color: string; // 시작 색상
  colorEnd: string; // 그라데이션 끝 색상
}

/**
 * 출하 크로스탭 테이블 행
 * 15개 항목: 출하두수, 과거이유두수, 육성율, 박피, 탕박, 1등급↑, 1+등급, 1등급, 2등급,
 *           암, 수, 거세, 총지육, 평균체중, 평균등지방
 */
export interface ShipmentTableRow {
  category: string; // 대분류 (출하두수, 도축, 등급, 성별, 지육, 등지방)
  sub: string; // 소분류 (두, 박피, 탕박 등)
  colspan?: boolean; // category+sub 병합 여부
  data: number[]; // 일별 데이터 (CNT_1~7)
  sum?: number; // 합계 (VAL_1)
  rate?: number; // 비율(%) (VAL_2) - 등급/성별 행
  avg?: number; // 평균 (VAL_3)
  unit?: string; // 단위 (%, kg, mm)
  highlight?: 'primary' | 'success'; // 하이라이트 스타일
  gradeRow?: boolean; // 등급 행 여부 (비율 표시)
}

export interface SchedulePopupData {
  date: string;
  events: CalendarEvent[];
}

/**
 * 예정작업 상세 팝업 데이터 (교배/분만/이유/백신)
 */
export interface ScheduleDetailItem {
  taskNm: string;
  baseTask: string;
  targetGroup: string;
  elapsedDays: string;
  count: number;
  daily?: number[];      // 요일별 분포 [월,화,수,목,금,토,일]
  vaccineName?: string;  // 백신 예정 팝업에서만 사용
}

/**
 * PSY 히트맵 팝업 데이터
 * @see data.js _pop.psytrend
 */
export interface PsyTrendPopupData {
  heatmapData: [number, number, number, string][];  // [x, y, value, zoneName]
  myFarmPosition: [number, number];
}

/**
 * 경락가격 팝업 데이터 (차트용)
 * @see data.js _pop.auction
 */
export interface AuctionPopupData {
  xData: string[];
  grade1Plus: number[];
  grade1: number[];
  grade2: number[];
  gradeOut: number[];
  excludeOut: number[];
  average: number[];
}

/**
 * 주간 날씨 팝업 데이터
 * @see data.js _pop.weather
 */
export interface WeatherPopupData {
  xData: string[];
  maxTemp: number[];
  minTemp: number[];
  weatherCode: string[];
  rainProb: number[];
}
