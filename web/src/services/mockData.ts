/**
 * Mock Data - 개발/테스트용 빈 데이터 구조
 *
 * ⚠️ 주의: 실제 데이터는 모두 DB에서 조회합니다.
 * 이 파일은 타입 정의 및 빈 데이터 구조만 유지합니다.
 *
 * @see docs/web/06-code-caching.md - 코드 캐싱 지침
 */

import { WeeklyReportData, PopupData, PsyTrendPopupData, AuctionPopupData, WeatherPopupData } from '@/types/weekly';

export interface ReportListItem {
    id: string;
    title: string;
    period: string;
    status: 'completed' | 'pending' | 'draft';
    date: string;
}

// 빈 리포트 목록
export const MOCK_REPORT_LIST: ReportListItem[] = [];

/**
 * 빈 주간 리포트 데이터 구조
 */
export const MOCK_WEEKLY_DATA: WeeklyReportData = {
    header: {
        farmName: '',
        period: '',
        owner: '',
        weekNum: 0
    },
    alertMd: {
        count: 0,
        euMiCnt: 0,
        sgMiCnt: 0,
        bmDelayCnt: 0,
        euDelayCnt: 0,
        items: [],
        list: []
    },
    lastWeek: {
        period: { weekNum: 0, from: '', to: '' },
        modon: { regCnt: 0, sangsiCnt: 0, regCntChange: 0, sangsiCntChange: 0 },
        mating: { cnt: 0, sum: 0 },
        farrowing: {
            cnt: 0, totalCnt: 0, liveCnt: 0, deadCnt: 0, mummyCnt: 0,
            sumCnt: 0, sumTotalCnt: 0, sumLiveCnt: 0,
            avgTotal: 0, avgLive: 0, sumAvgTotal: 0, sumAvgLive: 0,
            changeTotal: 0, changeLive: 0
        },
        weaning: {
            cnt: 0, jdCnt: 0, pigletCnt: 0, avgWeight: 0,
            sumCnt: 0, sumJdCnt: 0, sumAvgWeight: 0, changeWeight: 0
        },
        accident: { cnt: 0, sum: 0, avgGyungil: 0, sumAvgGyungil: 0 },
        culling: { cnt: 0, sum: 0 },
        shipment: { cnt: 0, avg: 0, sum: 0, avgSum: 0 }
    },
    thisWeek: {
        calendar: [],
        summary: { matingGoal: 0, farrowingGoal: 0, weaningGoal: 0 },
        calendarGrid: {
            weekNum: 0, periodFrom: '', periodTo: '', dates: [],
            gbSum: 0, imsinSum: 0, bmSum: 0, euSum: 0, vaccineSum: 0, shipSum: 0,
            gb: [], bm: [], imsin3w: [], imsin4w: [], eu: [], vaccine: [], ship: 0
        }
    },
    kpi: { psy: 0, weaningAge: 0, marketPrice: 0 },
    weather: { forecast: [] },
    todo: { items: [] }
};

// 빈 차트 데이터 구조
export const MOCK_CHART_DATA: Record<string, unknown> = {};

/**
 * 빈 팝업 데이터 구조
 */
export const MOCK_POPUP_DATA: PopupData = {
    alertMd: [],
    modon: {
        table: [],
        chart: { xAxis: [], data: [] }
    },
    accident: {
        table: [],
        chart: { xAxis: [], data: [] }
    },
    culling: {
        stats: { dotae: 0, dead: 0, transfer: 0, sale: 0 },
        table: [],
        chart: { xAxis: [], data: [], items: [] }
    },
    shipment: {
        metrics: {
            totalCount: 0, compareLastWeek: '-', grade1Rate: 0,
            avgCarcass: 0, avgBackfat: 0, farmPrice: 0, nationalPrice: 0
        },
        gradeChart: [],
        table: { days: [], rows: [] },
        analysisChart: { dates: [], shipCount: [], avgWeight: [], avgBackfat: [] },
        carcassChart: { data: [] }
    },
    schedule: { date: '', events: [] }
};

// 빈 부가정보 데이터
export const MOCK_EXTRA_DATA = {
    psy: { zone: '', status: '', value: 0, delay: 0 },
    price: { avg: 0, max: 0, min: 0, source: '' },
    weather: { min: 0, max: 0, region: '' }
};

// 빈 관리포인트 데이터
export const MOCK_MGMT_DATA = {
    highlightList: [] as { text: string; link: string | null }[],
    recommendList: [] as { text: string; link: string | null }[]
};

// 빈 PSY 히트맵 데이터
export const MOCK_PSY_TREND_DATA: PsyTrendPopupData = {
    heatmapData: [],
    myFarmPosition: [0, 0]
};

// 빈 경락가격 데이터
export const MOCK_AUCTION_DATA: AuctionPopupData = {
    xData: [],
    grade1Plus: [],
    grade1: [],
    grade2: [],
    gradeOut: [],
    excludeOut: [],
    average: []
};

// 빈 날씨 데이터
export const MOCK_WEATHER_DATA: WeatherPopupData = {
    xData: [],
    maxTemp: [],
    minTemp: [],
    weatherCode: [],
    rainProb: []
};
