import { WeeklyReportData, PopupData, PsyTrendPopupData, AuctionPopupData, WeatherPopupData, ScheduleDetailItem } from '@/types/weekly';

export interface ReportListItem {
    id: string;
    title: string;
    period: string;
    status: 'completed' | 'pending' | 'draft';
    date: string;
}

export const MOCK_REPORT_LIST: ReportListItem[] = [
    { id: '48', title: '11월 4주차 주간 보고서', period: '2024.11.18 ~ 2024.11.24', status: 'completed', date: '2024.11.25' },
    { id: '47', title: '11월 3주차 주간 보고서', period: '2024.11.11 ~ 2024.11.17', status: 'completed', date: '2024.11.18' },
    { id: '46', title: '11월 2주차 주간 보고서', period: '2024.11.04 ~ 2024.11.10', status: 'completed', date: '2024.11.11' },
    { id: '45', title: '11월 1주차 주간 보고서', period: '2024.10.28 ~ 2024.11.03', status: 'completed', date: '2024.11.04' },
];

/**
 * WEEKLY_DATA from data.js 기반 Mock 데이터
 */
export const MOCK_WEEKLY_DATA: WeeklyReportData = {
    header: {
        farmName: '행복농장',
        period: '2024.11.18 ~ 2024.11.24',
        owner: '홍길동',
        weekNum: 47
    },
    alertMd: {
        count: 42,  // 전체 합계
        euMiCnt: 14,      // 이유후 미교배 (8+6)
        sgMiCnt: 5,       // 사고후 미교배
        bmDelayCnt: 11,   // 교배후 분만지연 (1+7+0+3)
        euDelayCnt: 12,   // 분만후 이유지연 (1+8+3+0)
        list: [
            { id: '1', sowId: '001', issue: '이유후 미교배', days: 14, desc: '8~14일 초과' },
            { id: '2', sowId: '005', issue: '이유후 미교배', days: 21, desc: '14일 이상 초과' },
            { id: '3', sowId: '012', issue: '사고후 미교배', days: 18, desc: '14일 이상 초과' },
            { id: '4', sowId: '023', issue: '분만지연', days: 7, desc: '4~7일 초과' },
            { id: '5', sowId: '034', issue: '이유지연', days: 5, desc: '4~7일 초과' }
        ]
    },
    lastWeek: {
        period: { weekNum: 47, from: '11.18', to: '11.24' },
        modon: { regCnt: 1000, sangsiCnt: 1004 },  // 현재모돈, 상시모돈
        mating: { cnt: 54, sum: 2592 },
        farrowing: {
            cnt: 46, totalCnt: 644, liveCnt: 598, deadCnt: 28, mummyCnt: 18,
            // 누계 데이터
            sumCnt: 2208,           // 분만 복수 누계
            sumTotalCnt: 30912,     // 총산자수 누계
            sumLiveCnt: 28704,      // 실산자수 누계
            avgTotal: 14.0,         // 총산 평균
            avgLive: 13.0,          // 실산 평균
            sumAvgTotal: 14.0,      // 누계 총산 평균
            sumAvgLive: 13.0,       // 누계 실산 평균
            // 증감 데이터 (1년평균 대비)
            changeTotal: 0.2,       // 총산 증감
            changeLive: 0.1         // 실산 증감
        },
        weaning: {
            cnt: 46, jdCnt: 552, pigletCnt: 552, avgWeight: 12.0,
            // 누계 데이터
            sumCnt: 2208,           // 이유 복수 누계
            sumJdCnt: 26496,        // 이유자돈수 누계
            sumAvgWeight: 12.0,     // 누계 평균체중
            // 증감 데이터 (1년평균 대비)
            changeWeight: -0.3      // 평균체중 증감
        },
        accident: { cnt: 6, sum: 280 },
        culling: { cnt: 8, sum: 384 },
        shipment: { cnt: 500, avg: 86.0, sum: 24000, avgSum: 87.5 }
    },
    thisWeek: {
        calendar: [
            // 교배 예정
            { date: '2024-11-25', type: 'mating', count: 30, title: '교배 30복' },
            { date: '2024-11-26', type: 'mating', count: 25, title: '교배 25복' },
            // 분만 예정
            { date: '2024-11-28', type: 'farrowing', count: 20, title: '분만 20복' },
            { date: '2024-11-29', type: 'farrowing', count: 22, title: '분만 22복' },
            { date: '2024-11-30', type: 'farrowing', count: 4, title: '분만 4복' },
            // 이유 예정
            { date: '2024-11-28', type: 'weaning', count: 46, title: '이유 46복' }
        ],
        summary: {
            matingGoal: 48,  // 주차로 사용됨 (Week 48)
            farrowingGoal: 46,
            weaningGoal: 46
        },
        // 캘린더 그리드 데이터 (프로토타입 _cal 구조)
        calendarGrid: {
            weekNum: 48,
            periodFrom: '11.25',
            periodTo: '12.01',
            dates: [25, 26, 27, 28, 29, 30, '01'],
            // 요약 카드 합계
            gbSum: 55,
            imsinSum: 108,  // 3주(54) + 4주(54)
            bmSum: 46,
            euSum: 46,
            vaccineSum: 805,
            shipSum: 520,
            // 캘린더 셀 데이터 (null = 빈 셀)
            gb: [30, 25, null, null, null, null, null],
            bm: [null, null, null, 20, 22, 4, null],
            imsin3w: [20, 34, null, null, null, null, null],
            imsin4w: [22, 32, null, null, null, null, null],
            eu: [null, null, null, 46, null, null, null],
            vaccine: [null, null, 425, null, 380, null, null],
            ship: 520
        }
    },
    kpi: {
        psy: 26.8,
        weaningAge: 8,  // 입력지연일
        marketPrice: 5170
    },
    weather: {
        forecast: [
            { date: '2024-11-17', temp: 5, condition: 'sunny' },
            { date: '2024-11-18', temp: 6, condition: 'cloudy' },
            { date: '2024-11-19', temp: 4, condition: 'cloudy' },
            { date: '2024-11-20', temp: 3, condition: 'rainy' },
            { date: '2024-11-21', temp: 2, condition: 'cloudy' },
            { date: '2024-11-22', temp: 4, condition: 'sunny' },
            { date: '2024-11-23', temp: 5, condition: 'sunny' }
        ]
    },
    todo: {
        items: []
    }
};

// 차트 Mock 데이터 (data.js _pop 기반)
export const MOCK_CHART_DATA: Record<string, unknown> = {
    // 모돈 현황 차트
    sowChart: {
        xAxis: ['후보돈', '0산', '1산', '2산', '3산', '4산', '5산', '6산', '7산', '8산', '9산↑'],
        data: [250, 40, 400, 150, 130, 100, 80, 50, 35, 10, 5]
    },
    // 교배 재귀일별 차트
    matingChart: {
        xAxis: ['7', '10', '15', '20', '25', '30', '35', '40', '45', '50↑'],
        data: [9, 6, 13, 8, 6, 3, 2, 1, 1, 0]
    },
    // 임신사고 기간별 차트
    accidentPeriod: {
        xAxis: ['~7', '8~10', '11~15', '16~20', '21~35', '36~40', '41~45', '46~'],
        data: [1, 1, 1, 1, 0, 1, 1, 0]
    },
    // 출하 분석 차트
    shipmentAnalysis: {
        xAxis: ['11.18', '11.19', '11.20', '11.21', '11.22', '11.23', '11.24'],
        shipmentData: [68, 75, 80, 72, 77, 63, 65],
        weightData: [85.5, 86.2, 86.8, 85.8, 86.5, 85.2, 86.0],
        backfatData: [21.2, 22.0, 21.8, 21.5, 21.3, 21.0, 21.7]
    },
    // 등급 분포
    gradeChart: [
        { name: '1+', value: 165, color: '#667eea' },
        { name: '1', value: 240, color: '#28a745' },
        { name: '2', value: 70, color: '#ffc107' },
        { name: '등외', value: 25, color: '#dc3545' }
    ],
    // PSY 히트맵
    psyHeatmap: {
        heatmapData: [
            [0, 0, 15, '1A'], [1, 0, 25, '1B'], [2, 0, 18, '1C'], [3, 0, 8, '1D'],
            [0, 1, 45, '2A'], [1, 1, 68, '2B'], [2, 1, 52, '2C'], [3, 1, 22, '2D'],
            [0, 2, 85, '3A'], [1, 2, 110, '3B'], [2, 2, 75, '3C'], [3, 2, 35, '3D'],
            [0, 3, 42, '4A'], [1, 3, 65, '4B'], [2, 3, 48, '4C'], [3, 3, 18, '4D']
        ],
        myFarmPosition: [1, 2]
    },
    // 경락가격 차트
    auctionChart: {
        xData: ['11.05일', '11.06일', '11.07일', '11.10일', '11.11일', '11.12일', '11.13일'],
        grade1Plus: [5691, 5689, 5453, 5518, 5606, 5800, 5170],
        grade1: [5350, 5300, 5150, 5250, 5320, 5450, 4800],
        grade2: [5250, 5200, 5050, 5150, 5220, 5350, 4600],
        gradeOut: [3900, 4000, 3950, 3900, 3950, 4000, 3900],
        average: [5250, 5200, 5100, 5150, 5220, 5300, 4900]
    },
    // 날씨 차트
    weatherChart: {
        xData: ['11.17일', '11.18일', '11.19일', '11.20일', '11.21일', '11.22일', '11.23일'],
        maxTemp: [15, 16, 14, 13, 12, 14, 15],
        minTemp: [5, 6, 4, 3, 2, 4, 5],
        weatherCode: ['sunny', 'cloudy', 'cloudy', 'rainy', 'cloudy', 'sunny', 'sunny'],
        rainProb: [0, 20, 30, 80, 40, 10, 0]
    }
};

export const MOCK_POPUP_DATA: PopupData = {
    // 관리대상모돈 팝업 (초과일수 × 구분별 교차표)
    // @see data.js _pop.alertMd
    alertMd: [
        { period: '~3', hubo: 0, euMi: 0, sgMi: 0, bmDelay: 1, euDelay: 1 },
        { period: '4~7', hubo: 0, euMi: 0, sgMi: 0, bmDelay: 7, euDelay: 8 },
        { period: '8~14', hubo: 0, euMi: 8, sgMi: 0, bmDelay: 0, euDelay: 3 },
        { period: '14~', hubo: 0, euMi: 6, sgMi: 5, bmDelay: 3, euDelay: 0 }
    ],
    // 모돈 현황 팝업 (탭: 모돈구성비율 테이블 + 산차별현황 차트)
    // @see data.js _pop.modon
    // ★ 보유모돈 1250 = 후보돈 250 + 현재모돈 1000
    modon: {
        table: [
            // 후보돈 섹션 (250)
            { parity: '후보돈', hubo: 250, imsin: 0, poyu: 0, eumo: 0, sago: 0, change: 5, group: 'hubo' },
            // 현재모돈 섹션 (1000)
            { parity: '0산', hubo: 0, imsin: 38, poyu: 0, eumo: 0, sago: 2, change: -2, group: 'current' },   // 40
            { parity: '1산', hubo: 0, imsin: 300, poyu: 80, eumo: 17, sago: 3, change: 10, group: 'current' }, // 400
            { parity: '2산', hubo: 0, imsin: 85, poyu: 52, eumo: 10, sago: 3, change: -3, group: 'current' },  // 150
            { parity: '3산', hubo: 0, imsin: 75, poyu: 45, eumo: 8, sago: 2, change: 4, group: 'current' },    // 130
            { parity: '4산', hubo: 0, imsin: 58, poyu: 35, eumo: 6, sago: 1, change: -1, group: 'current' },   // 100
            { parity: '5산', hubo: 0, imsin: 46, poyu: 28, eumo: 5, sago: 1, change: 2, group: 'current' },    // 80
            { parity: '6산', hubo: 0, imsin: 30, poyu: 15, eumo: 4, sago: 1, change: -2, group: 'current' },   // 50
            { parity: '7산', hubo: 0, imsin: 20, poyu: 12, eumo: 3, sago: 0, change: 1, group: 'current' },    // 35
            { parity: '8산', hubo: 0, imsin: 5, poyu: 4, eumo: 1, sago: 0, change: 0, group: 'current' },      // 10
            { parity: '9산↑', hubo: 0, imsin: 2, poyu: 2, eumo: 1, sago: 0, change: -1, group: 'current' }     // 5
        ],
        chart: {
            xAxis: ['후보돈', '0산', '1산', '2산', '3산', '4산', '5산', '6산', '7산', '8산', '9산↑'],
            // 후보돈=250, 현재모돈(0산~9산↑)=1000, 총합=1250
            data: [250, 40, 400, 150, 130, 100, 80, 50, 35, 10, 5]
        }
    },
    // 교배 실적 팝업 (탭: 유형별 교배복수 테이블 + 재귀일별 차트)
    // @see data.js _pop.mating
    mating: {
        table: [
            { type: '이유후(경산)', planned: 36, actual: 34, rate: '94%' },
            { type: '이유후(초산)', planned: 10, actual: 10, rate: '100%' },
            { type: '사고후(재발)', planned: 5, actual: 4, rate: '80%' },
            { type: '사고후(공태)', planned: 2, actual: 2, rate: '100%' },
            { type: '사고후(기타)', planned: 0, actual: 0, rate: '-' },
            { type: '후보교배', planned: 6, actual: 4, rate: '67%' }
        ],
        total: { planned: 59, actual: 54, rate: '92%' },
        chart: {
            xAxis: ['7', '10', '15', '20', '25', '30', '35', '40', '45', '50↑'],
            data: [9, 6, 13, 8, 6, 3, 2, 1, 1, 0]
        }
    },
    // 분만 실적 팝업 (작업예정대비 + 분만성적 테이블)
    // @see data.js _pop.farrowing
    farrowing: {
        planned: 48,
        actual: 46,
        rate: '96%',
        stats: {
            totalBorn: { sum: 644, avg: 14.0 },
            bornAlive: { sum: 598, avg: 13.0, rate: '92.9%' },
            stillborn: { sum: 28, avg: 0.6, rate: '4.3%' },
            mummy: { sum: 18, avg: 0.4, rate: '2.8%' },
            culling: { sum: 46, avg: 1.0, rate: '7.1%' },
            nursingStart: { sum: 552, avg: 12.0, rate: '92.3%' }
        }
    },
    // 이유 실적 팝업 (작업예정대비 + 이유성적 테이블)
    // @see data.js _pop.weaning
    weaning: {
        planned: 48,
        actual: 46,
        rate: '96%',
        stats: {
            weanPigs: { sum: 552, avg: 12.0 },
            partialWean: { sum: 15, avg: 0.3 },
            avgWeight: { avg: 6.8 },
            survivalRate: { rate: '92.3%' }
        }
    },
    // 임신사고 팝업 (탭: 원인별 테이블 + 임신일별 차트)
    // @see data.js _pop.accident
    accident: {
        table: [
            { type: '재발', lastWeek: 2, lastMonth: 8 },
            { type: '공태', lastWeek: 1, lastMonth: 5 },
            { type: '유산', lastWeek: 1, lastMonth: 3 },
            { type: '도태', lastWeek: 1, lastMonth: 4 },
            { type: '폐사', lastWeek: 1, lastMonth: 2 }
        ],
        chart: {
            xAxis: ['~7', '8~10', '11~15', '16~20', '21~35', '36~40', '41~45', '46~'],
            data: [1, 1, 1, 1, 0, 1, 1, 0]
        }
    },
    // 도태폐사 팝업 (유형별 스탯바 + 원인별 테이블)
    // @see data.js _pop.culling
    culling: {
        stats: {
            dotae: 4,
            dead: 2,
            transfer: 1,
            sale: 1
        },
        table: [
            { reason: '번식장애', lastWeek: 2, lastMonth: 8 },
            { reason: '지제불량', lastWeek: 1, lastMonth: 4 },
            { reason: '저성적', lastWeek: 1, lastMonth: 3 },
            { reason: '호흡기', lastWeek: 1, lastMonth: 5 },
            { reason: '소화기', lastWeek: 1, lastMonth: 2 },
            { reason: '노산도태', lastWeek: 1, lastMonth: 6 },
            { reason: '기타', lastWeek: 1, lastMonth: 4 }
        ]
    },
    // 출하 실적 팝업 (3탭: 출하현황 + 출하분석차트 + 도체분포차트)
    // @see data.js _pop.shipment
    shipment: {
        metrics: {
            totalCount: 500,
            compareLastWeek: '+8.7%',
            grade1Rate: 81,
            avgCarcass: 86.0,
            avgBackfat: 21.5,
            farmPrice: 5170,
            nationalPrice: 4950
        },
        gradeDistribution: [
            { grade: '1+', count: 165, rate: 33 },
            { grade: '1', count: 240, rate: 48 },
            { grade: '2', count: 70, rate: 14 },
            { grade: '등외', count: 25, rate: 5 }
        ],
        dailyTable: [
            { date: '11.18', count: 68, avgWeight: 85.5, avgBackfat: 21.2, grade1Rate: 79 },
            { date: '11.19', count: 75, avgWeight: 86.2, avgBackfat: 22.0, grade1Rate: 82 },
            { date: '11.20', count: 80, avgWeight: 86.8, avgBackfat: 21.8, grade1Rate: 84 },
            { date: '11.21', count: 72, avgWeight: 85.8, avgBackfat: 21.5, grade1Rate: 80 },
            { date: '11.22', count: 77, avgWeight: 86.5, avgBackfat: 21.3, grade1Rate: 83 },
            { date: '11.23', count: 63, avgWeight: 85.2, avgBackfat: 21.0, grade1Rate: 78 },
            { date: '11.24', count: 65, avgWeight: 86.0, avgBackfat: 21.7, grade1Rate: 81 }
        ],
        analysisChart: {
            dates: ['11.18', '11.19', '11.20', '11.21', '11.22', '11.23', '11.24'],
            shipCount: [68, 75, 80, 72, 77, 63, 65],
            avgWeight: [85.5, 86.2, 86.8, 85.8, 86.5, 85.2, 86.0],
            avgBackfat: [21.2, 22.0, 21.8, 21.5, 21.3, 21.0, 21.7]
        },
        carcassChart: {
            data: [
                { weight: 82, backfat: 19 }, { weight: 84, backfat: 20 }, { weight: 85, backfat: 21 },
                { weight: 86, backfat: 22 }, { weight: 87, backfat: 21 }, { weight: 88, backfat: 23 },
                { weight: 85, backfat: 20 }, { weight: 86, backfat: 21 }, { weight: 87, backfat: 22 },
                { weight: 84, backfat: 19 }, { weight: 86, backfat: 20 }, { weight: 88, backfat: 22 }
            ]
        }
    },
    // 예정 작업 팝업
    schedule: {
        date: '2024-11-25',
        events: [
            { date: '2024-11-25', type: 'mating', count: 30, title: '교배 30복' },
            { date: '2024-11-26', type: 'mating', count: 25, title: '교배 25복' }
        ]
    }
};

/**
 * 부가정보 데이터 (secExtra)
 */
export const MOCK_EXTRA_DATA = {
    // PSY
    psy: {
        zone: '2B구간',
        status: '우수',
        value: 26.8,
        delay: 8
    },
    // 경락가격
    price: {
        avg: 5170,
        max: 5300,
        min: 5020,
        source: '축산물품질평가원'
    },
    // 날씨
    weather: {
        min: 5,
        max: 15,
        region: '안양시 관양동 (11.13)'
    }
};

/**
 * 관리포인트 데이터 (secMgmt)
 */
export const MOCK_MGMT_DATA = {
    highlightList: [
        { text: '겨울철 돈사 온도관리 (자돈사 28~30℃)', link: null },
        { text: 'PED 예방 차단방역 강화', link: null },
        { text: '환기와 보온의 균형 유지', link: null },
        { text: '연말 사료 재고 충분히 확보', link: null },
        { text: '2024년 결산 및 2025년 목표 준비', link: null }
    ],
    recommendList: [
        { text: '겨울철 돈사 환경 관리 매뉴얼', link: 'https://example.com/manual1' },
        { text: 'PED 예방 및 대응 가이드', link: 'https://example.com/ped-guide' },
        { text: '초산돈 포유기 관리 노하우', link: null },
        { text: '농장 경영 분석 웨비나 (12/5)', link: 'https://example.com/webinar' }
    ]
};

/**
 * 금주 작업예정 캘린더 데이터 (secThisWeek._cal)
 */
export const MOCK_CALENDAR_DATA = {
    // 요약
    gbSum: 55,
    imsinSum: 54,
    bmSum: 46,
    euSum: 46,
    vaccineSum: 805,
    shipSum: 520,
    // 캘린더 날짜
    dates: [25, 26, 27, 28, 29, 30, '01'],
    // 캘린더 데이터
    gb: [30, 25, null, null, null, null, null],
    bm: [null, null, null, 20, 22, 4, null],
    imsin3w: [20, 34, null, null, null, null, null],
    imsin4w: [22, 32, null, null, null, null, null],
    eu: [null, null, null, 46, null, null, null],
    vaccine: [null, null, 425, null, 380, null, null],
    ship: 520
};

/**
 * 예정작업 팝업 상세 데이터
 */
export const MOCK_SCHEDULE_POPUP_DATA: {
    scheduleGb: ScheduleDetailItem[];
    scheduleBm: ScheduleDetailItem[];
    scheduleEu: ScheduleDetailItem[];
    scheduleVaccine: ScheduleDetailItem[];
} = {
    // 교배 예정
    scheduleGb: [
        { taskNm: '교배', baseTask: '이유', targetGroup: '경산돈', elapsedDays: '5~7일', count: 34 },
        { taskNm: '교배', baseTask: '이유', targetGroup: '초산돈', elapsedDays: '5~7일', count: 15 },
        { taskNm: '교배', baseTask: '후보입식', targetGroup: '후보돈', elapsedDays: '210일↑', count: 6 }
    ],
    // 분만 예정
    scheduleBm: [
        { taskNm: '분만', baseTask: '교배', targetGroup: '경산돈', elapsedDays: '114일', count: 36 },
        { taskNm: '분만', baseTask: '교배', targetGroup: '초산돈', elapsedDays: '114일', count: 10 }
    ],
    // 이유 예정
    scheduleEu: [
        { taskNm: '이유', baseTask: '분만', targetGroup: '경산돈', elapsedDays: '21~28일', count: 36 },
        { taskNm: '이유', baseTask: '분만', targetGroup: '초산돈', elapsedDays: '21~28일', count: 10 }
    ],
    // 모돈백신 예정
    scheduleVaccine: [
        { taskNm: '파보', baseTask: '교배', targetGroup: '임신돈', elapsedDays: '70~84일', count: 285 },
        { taskNm: 'PED', baseTask: '분만', targetGroup: '분만돈', elapsedDays: '7일', count: 268 },
        { taskNm: '대장균', baseTask: '분만', targetGroup: '분만돈', elapsedDays: '7일', count: 252 }
    ]
};

/**
 * PSY 히트맵 팝업 데이터
 * @see data.js _pop.psytrend
 */
export const MOCK_PSY_TREND_DATA: PsyTrendPopupData = {
    heatmapData: [
        // PSY<20 행 (y=0)
        [0, 0, 15, '1A'], [1, 0, 25, '1B'], [2, 0, 18, '1C'], [3, 0, 8, '1D'],
        // 20≤PSY<24 행 (y=1)
        [0, 1, 45, '2A'], [1, 1, 68, '2B'], [2, 1, 52, '2C'], [3, 1, 22, '2D'],
        // 24≤PSY<28 행 (y=2)
        [0, 2, 85, '3A'], [1, 2, 110, '3B'], [2, 2, 75, '3C'], [3, 2, 35, '3D'],
        // PSY≥28 행 (y=3)
        [0, 3, 42, '4A'], [1, 3, 65, '4B'], [2, 3, 48, '4C'], [3, 3, 18, '4D']
    ],
    myFarmPosition: [1, 2]  // 내 농장 위치 (4일~14일, 24≤PSY<28 = 3B구간)
};

/**
 * 경락가격 팝업 데이터
 * @see data.js _pop.auction
 */
export const MOCK_AUCTION_DATA: AuctionPopupData = {
    xData: ['11.05일', '11.06일', '11.07일', '11.10일', '11.11일', '11.12일', '11.13일'],
    grade1Plus: [5691, 5689, 5453, 5518, 5606, 5800, 5170],
    grade1: [5350, 5300, 5150, 5250, 5320, 5450, 4800],
    grade2: [5250, 5200, 5050, 5150, 5220, 5350, 4600],
    gradeOut: [3900, 4000, 3950, 3900, 3950, 4000, 3900],
    excludeOut: [5691, 5689, 5453, 5518, 5606, 5800, 5170],
    average: [5250, 5200, 5100, 5150, 5220, 5300, 4900]
};

/**
 * 주간 날씨 팝업 데이터
 * @see data.js _pop.weather
 */
export const MOCK_WEATHER_DATA: WeatherPopupData = {
    xData: ['11.17일', '11.18일', '11.19일', '11.20일', '11.21일', '11.22일', '11.23일'],
    maxTemp: [15, 16, 14, 13, 12, 14, 15],
    minTemp: [5, 6, 4, 3, 2, 4, 5],
    weatherCode: ['sunny', 'cloudy', 'cloudy', 'rainy', 'cloudy', 'sunny', 'sunny'],
    rainProb: [0, 20, 30, 80, 40, 10, 0]
};
