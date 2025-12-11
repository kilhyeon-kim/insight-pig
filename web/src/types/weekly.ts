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
  modon: { regCnt: number; sangsiCnt: number };
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
    // 누계 데이터
    sumCnt?: number;           // 이유 복수 누계
    sumJdCnt?: number;         // 이유자돈수 누계
    sumAvgWeight?: number;     // 누계 평균체중
    // 증감 데이터 (1년평균 대비)
    changeWeight?: number;     // 평균체중 증감
  };
  accident: { cnt: number; sum: number };
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
export interface PopupData {
  alertMd: AlertMdPopupData[];
  modon: ModonPopupData;
  mating: MatingPopupData;
  farrowing: FarrowingPopupData;
  weaning: WeaningPopupData;
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
  hubo: number;
  imsin: number;
  poyu: number;
  eumo: number;
  sago: number;
  change: number;
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
  stats: {
    weanPigs: { sum: number; avg: number };
    partialWean: { sum: number; avg: number };
    avgWeight: { avg: number };
    survivalRate: { rate: string };
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
  lastMonth: number;
}

/**
 * 도태폐사 팝업 데이터 (유형별 스탯바 + 원인별 테이블)
 * @see data.js _pop.culling
 */
export interface CullingPopupData {
  stats: {
    dotae: number;
    dead: number;
    transfer: number;
    sale: number;
  };
  table: CullingTableRow[];
}

export interface CullingTableRow {
  reason: string;
  lastWeek: number;
  lastMonth: number;
}

/**
 * 출하 실적 팝업 데이터 (3탭: 출하현황 + 출하분석차트 + 도체분포차트)
 * @see data.js _pop.shipment
 */
export interface ShipmentPopupData {
  metrics: {
    totalCount: number;
    compareLastWeek: string;
    grade1Rate: number;
    avgCarcass: number;
    avgBackfat: number;
    farmPrice: number;
    nationalPrice: number;
  };
  gradeDistribution: { grade: string; count: number; rate: number }[];
  dailyTable: ShipmentDailyRow[];
  analysisChart: {
    dates: string[];
    shipCount: number[];
    avgWeight: number[];
    avgBackfat: number[];
  };
  carcassChart: {
    data: { weight: number; backfat: number }[];
  };
}

export interface ShipmentDailyRow {
  date: string;
  count: number;
  avgWeight: number;
  avgBackfat: number;
  grade1Rate: number;
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
 * 경락가격 팝업 데이터
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
