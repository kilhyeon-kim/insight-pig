import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TsInsWeekSub } from './entities';
import { WEEKLY_SQL } from './sql';
import { SHARE_TOKEN_SQL } from '../auth/sql/share-token.sql';
import * as mockData from '../../data/mock/weekly.mock';

/**
 * Named parameter를 TypeORM query에 전달하기 위한 헬퍼
 * TypeORM Oracle 드라이버는 named parameter 객체를 지원하지만
 * TypeScript 타입 정의가 any[]로 되어 있어 캐스팅 필요
 */
const params = (obj: Record<string, any>): any => obj;

/**
 * 주간 리포트 서비스
 * - 실제 DB 연동 (Oracle)
 * - DB 연결 실패 시 Mock 데이터 fallback
 */
@Injectable()
export class WeeklyService {
  private readonly logger = new Logger(WeeklyService.name);

  constructor(private readonly dataSource: DataSource) { }

  // ─────────────────────────────────────────────────────────────────────────────
  // 보고서 목록/상세 (실제 DB 연동)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * 주간 보고서 목록 조회
   * @param farmNo 농장번호 (필수)
   * @param from 시작일 (YYYYMMDD)
   * @param to 종료일 (YYYYMMDD)
   */
  async getReportList(farmNo: number, from?: string, to?: string) {
    try {
      let results: any[];

      if (from && to) {
        results = await this.dataSource.query(
          WEEKLY_SQL.getReportListWithPeriod,
          params({ farmNo, dtFrom: from, dtTo: to }),
        );
      } else {
        results = await this.dataSource.query(WEEKLY_SQL.getReportList, params({ farmNo }));
      }

      return results.map((row: any) => ({
        id: `${row.SEQ}`,
        masterSeq: row.SEQ,
        year: row.REPORT_YEAR,
        weekNo: row.REPORT_WEEK_NO,
        period: {
          from: row.DT_FROM,
          to: row.DT_TO,
        },
        statusCd: row.STATUS_CD,
        createdAt: row.LOG_INS_DT,
        shareToken: row.SHARE_TOKEN || null,
        farmNm: row.FARM_NM,
      }));
    } catch (error) {
      this.logger.error('리포트 목록 조회 실패', error.message);
      // Mock 데이터 대신 빈 배열 반환 (에러 상황을 명확히 표시)
      return [];
    }
  }

  /**
   * 공유 토큰 검증 (만료일 체크 포함)
   * 역할: 토큰 검증 및 PK 추출만 수행
   * @param shareToken 공유 토큰 (64자 SHA256 해시)
   * @param skipExpiryCheck 만료일 검증 건너뛰기 여부 (로그인 사용자용)
   */
  async validateShareToken(shareToken: string, skipExpiryCheck: boolean = false): Promise<{
    valid: boolean;
    expired: boolean;
    masterSeq: number | null;
    farmNo: number | null;
    message?: string;
  }> {
    try {
      // SHARE_TOKEN_SQL 사용 (토큰 검증 및 PK 추출만)
      const results = await this.dataSource.query(SHARE_TOKEN_SQL.validateToken, params({ shareToken }));
      const tokenData = results[0];

      if (!tokenData) {
        return {
          valid: false,
          expired: false,
          masterSeq: null,
          farmNo: null,
          message: '해당 공유 토큰에 대한 리포트를 찾을 수 없습니다. 리포트가 삭제되었거나 토큰이 잘못되었을 수 있습니다.'
        };
      }

      // 만료일 체크 (skipExpiryCheck가 true면 건너뜀)
      if (!skipExpiryCheck && tokenData.TOKEN_EXPIRE_DT) {
        const now = new Date();
        // TOKEN_EXPIRE_DT가 문자열(YYYYMMDD)인 경우 처리
        let expireDate: Date;
        if (typeof tokenData.TOKEN_EXPIRE_DT === 'string' && tokenData.TOKEN_EXPIRE_DT.length === 8) {
          const year = parseInt(tokenData.TOKEN_EXPIRE_DT.substring(0, 4));
          const month = parseInt(tokenData.TOKEN_EXPIRE_DT.substring(4, 6)) - 1;
          const day = parseInt(tokenData.TOKEN_EXPIRE_DT.substring(6, 8));
          expireDate = new Date(year, month, day, 23, 59, 59);
        } else {
          expireDate = new Date(tokenData.TOKEN_EXPIRE_DT);
        }

        if (now > expireDate) {
          return {
            valid: false,
            expired: true,
            masterSeq: tokenData.MASTER_SEQ,
            farmNo: tokenData.FARM_NO,
            message: '공유 링크가 만료되었습니다. 이 링크는 유효기간(7일)이 지났습니다.'
          };
        }
      }

      return {
        valid: true,
        expired: false,
        masterSeq: tokenData.MASTER_SEQ,
        farmNo: tokenData.FARM_NO
      };
    } catch (error) {
      this.logger.error('토큰 검증 실패', error.message);
      return {
        valid: false,
        expired: false,
        masterSeq: null,
        farmNo: null,
        message: '토큰 검증 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      };
    }
  }

  /**
   * 공유 토큰으로 주간 보고서 조회 (만료일 검증 없음 - 로그인 사용자용)
   * 역할: 토큰 검증 후 getReportDetail 재사용
   * @param shareToken 공유 토큰 (64자 SHA256 해시)
   */
  async getReportByShareToken(shareToken: string) {
    try {
      // 1. 토큰 검증 및 PK 추출 (SHARE_TOKEN_SQL 사용)
      const results = await this.dataSource.query(SHARE_TOKEN_SQL.validateToken, params({ shareToken }));
      const tokenData = results[0];

      if (!tokenData) {
        this.logger.warn(`Report not found for token: ${shareToken.substring(0, 8)}...`);
        return null;
      }

      // 2. PK로 리포트 상세 조회 (getReportDetail 재사용)
      return this.getReportDetail(tokenData.MASTER_SEQ, tokenData.FARM_NO);
    } catch (error) {
      this.logger.error('공유 토큰 조회 실패', error.message);
      return null;
    }
  }

  /**
   * 공유 토큰으로 주간 보고서 조회 (만료일 검증 포함 - 외부 공유 링크용)
   * 역할: 토큰 검증 후 getReportDetail 재사용
   * @param skipExpiryCheck 만료일 검증 건너뛰기 여부 (로그인 사용자용)
   */
  async getReportByShareTokenWithExpiry(shareToken: string, skipExpiryCheck: boolean = false): Promise<{
    success: boolean;
    expired: boolean;
    data: any;
    message?: string;
  }> {
    // 1. 토큰 검증 (만료일 체크 포함)
    const validation = await this.validateShareToken(shareToken, skipExpiryCheck);

    if (!validation.valid || !validation.masterSeq || !validation.farmNo) {
      return {
        success: false,
        expired: validation.expired,
        data: null,
        message: validation.message,
      };
    }

    // 2. PK로 리포트 상세 조회 (getReportDetail 재사용)
    const reportData = await this.getReportDetail(validation.masterSeq, validation.farmNo);

    if (!reportData) {
      return {
        success: false,
        expired: false,
        data: null,
        message: '리포트 데이터를 불러올 수 없습니다.',
      };
    }

    return {
      success: true,
      expired: false,
      data: reportData,
    };
  }

  /**
   * 주간 보고서 상세 조회
   * @param masterSeq 마스터 SEQ
   * @param farmNo 농장번호
   */
  async getReportDetail(masterSeq: number, farmNo: number) {
    try {
      // 1. WEEK 조회
      const weekResults = await this.dataSource.query(
        WEEKLY_SQL.getReportDetail,
        params({ masterSeq, farmNo }),
      );
      const week = weekResults[0];

      if (!week) {
        this.logger.warn(`Week not found: masterSeq=${masterSeq}, farmNo=${farmNo}`);
        return null;
      }

      // 2. SUB 데이터 조회
      const subs = await this.dataSource.query(WEEKLY_SQL.getReportSub, params({ masterSeq, farmNo }));

      // 3. 데이터 변환
      return this.transformToReportDetailFromRow(week, subs);
    } catch (error) {
      this.logger.warn('DB 조회 실패, Mock 데이터 반환', error.message);
      return mockData.reportDetail;
    }
  }

  /**
   * Raw SQL 결과를 프론트엔드 형식으로 변환
   */
  private transformToReportDetailFromRow(week: any, subRows: any[]) {
    const subs = subRows.map((row) => this.mapRowToWeekSub(row));

    return {
      header: {
        farmNo: week.FARM_NO,
        farmNm: week.FARM_NM,
        ownerNm: week.OWNER_NM,
        year: week.REPORT_YEAR,
        weekNo: week.REPORT_WEEK_NO,
        period: {
          from: this.formatDate(week.DT_FROM),
          to: this.formatDate(week.DT_TO),
        },
      },
      alertMd: {
        count: week.ALERT_TOTAL || 0,
        euMiCnt: week.ALERT_EU_MI || 0,
        sgMiCnt: week.ALERT_SG_MI || 0,
        bmDelayCnt: week.ALERT_BM_DELAY || 0,
        euDelayCnt: week.ALERT_EU_DELAY || 0,
        items: this.extractSubData(subs, 'ALERT').map((item) => ({
          period: item.code1,
          hubo: item.cnt1,
          euMi: item.cnt2,
          sgMi: item.cnt3,
          bmDelay: item.cnt4,
          euDelay: item.cnt5,
        })),
      },
      lastWeek: {
        period: {
          weekNum: week.REPORT_WEEK_NO,
          from: this.formatDate(week.DT_FROM),
          to: this.formatDate(week.DT_TO),
        },
        modon: {
          regCnt: week.MODON_REG_CNT,
          sangsiCnt: week.MODON_SANGSI_CNT,
        },
        mating: {
          cnt: week.LAST_GB_CNT,
          sum: week.LAST_GB_SUM,
        },
        farrowing: {
          cnt: week.LAST_BM_CNT,
          total: week.LAST_BM_TOTAL,
          live: week.LAST_BM_LIVE,
          dead: week.LAST_BM_DEAD,
          mummy: week.LAST_BM_MUMMY,
          sumCnt: week.LAST_BM_SUM_CNT,
          sumTotal: week.LAST_BM_SUM_TOTAL,
          sumLive: week.LAST_BM_SUM_LIVE,
          avgTotal: week.LAST_BM_AVG_TOTAL,
          avgLive: week.LAST_BM_AVG_LIVE,
          chgTotal: week.LAST_BM_CHG_TOTAL,
          chgLive: week.LAST_BM_CHG_LIVE,
        },
        weaning: {
          cnt: week.LAST_EU_CNT,
          jdCnt: week.LAST_EU_JD_CNT,
          avgKg: week.LAST_EU_AVG_KG,
          sumCnt: week.LAST_EU_SUM_CNT,
          sumJd: week.LAST_EU_SUM_JD,
          chgKg: week.LAST_EU_CHG_KG,
        },
        accident: {
          cnt: week.LAST_SG_CNT,
          sum: week.LAST_SG_SUM,
        },
        culling: {
          cnt: week.LAST_CL_CNT,
          sum: week.LAST_CL_SUM,
        },
        shipment: {
          cnt: week.LAST_SH_CNT,
          avgKg: week.LAST_SH_AVG_KG,
          sum: week.LAST_SH_SUM,
          avgSum: week.LAST_SH_AVG_SUM,
        },
      },
      thisWeek: {
        gbSum: week.THIS_GB_SUM,
        imsinSum: week.THIS_IMSIN_SUM,
        bmSum: week.THIS_BM_SUM,
        euSum: week.THIS_EU_SUM,
        vaccineSum: week.THIS_VACCINE_SUM,
        shipSum: week.THIS_SHIP_SUM,
        schedules: this.extractScheduleData(subs),
      },
      kpi: {
        psy: week.KPI_PSY,
        delayDay: week.KPI_DELAY_DAY,
        psyX: week.PSY_X,
        psyY: week.PSY_Y,
        psyZone: week.PSY_ZONE,
      },
    };
  }

  /**
   * SUB 데이터에서 특정 GUBUN 추출
   */
  private extractSubData(subs: TsInsWeekSub[], gubun: string) {
    return subs
      .filter((s) => s.gubun === gubun)
      .map((s) => ({
        code1: s.code1,
        code2: s.code2,
        cnt1: s.cnt1,
        cnt2: s.cnt2,
        cnt3: s.cnt3,
        cnt4: s.cnt4,
        cnt5: s.cnt5,
        val1: s.val1,
        val2: s.val2,
        str1: s.str1,
        str2: s.str2,
      }));
  }

  /**
   * 예정 작업 데이터 추출
   */
  private extractScheduleData(subs: TsInsWeekSub[]) {
    const scheduleGubuns = [
      'SCHEDULE_GB',
      'SCHEDULE_IMSIN',
      'SCHEDULE_BM',
      'SCHEDULE_EU',
      'SCHEDULE_VACCINE',
      'SCHEDULE_SHIP',
    ];

    const result: Record<string, any[]> = {};
    scheduleGubuns.forEach((gubun) => {
      const key = gubun.replace('SCHEDULE_', '').toLowerCase();
      result[key] = this.extractSubData(subs, gubun);
    });

    return result;
  }

  /**
   * 날짜 포맷 (YYYY-MM-DD)
   */
  private formatDate(date: Date | string): string {
    if (!date) return '';
    if (typeof date === 'string') {
      return date.substring(0, 10);
    }
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    try {
      return new Date(date).toISOString().split('T')[0];
    } catch {
      return String(date);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 팝업 데이터 조회
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * 팝업 데이터 조회
   * @param type 팝업 타입 (alertMd, modon, mating 등)
   * @param masterSeq 마스터 SEQ
   * @param farmNo 농장번호
   */
  async getPopupData(type: string, masterSeq: number, farmNo: number) {
    try {
      const gubunMap: Record<string, string> = {
        alertMd: 'ALERT_MD',
        modon: 'PARITY_DIST',
        mating: 'MATING_RETURN',
        farrowing: 'PARITY_BIRTH',
        weaning: 'PARITY_WEAN',
        accident: 'PARITY_ACCIDENT',
        culling: 'CULLING_DIST',
        shipment: 'SHIPMENT',
        schedule: 'SCHEDULE_%',
      };

      const gubun = gubunMap[type];
      if (!gubun) {
        return null;
      }

      let results: any[];

      if (gubun.includes('%')) {
        results = await this.dataSource.query(WEEKLY_SQL.getPopupSubLike, params({
          masterSeq,
          farmNo,
          gubun,
        }));
      } else {
        results = await this.dataSource.query(WEEKLY_SQL.getPopupSub, params({
          masterSeq,
          farmNo,
          gubun,
        }));
      }

      const subs = results.map((row: any) => this.mapRowToWeekSub(row));
      return this.transformPopupData(type, subs);
    } catch (error) {
      this.logger.warn(`팝업 데이터 조회 실패: ${type}`, error.message);
      const popupDataMap: Record<string, any> = {
        alertMd: mockData.popupData.alertMd,
        modon: mockData.popupData.modon,
        mating: mockData.popupData.mating,
        farrowing: mockData.popupData.farrowing,
        weaning: mockData.popupData.weaning,
        accident: mockData.popupData.accident,
        culling: mockData.popupData.culling,
        shipment: mockData.popupData.shipment,
        schedule: mockData.popupData.schedule,
      };
      return popupDataMap[type] || null;
    }
  }

  /**
   * Raw SQL 결과 Row를 TsInsWeekSub 형식으로 매핑
   */
  private mapRowToWeekSub(row: any): TsInsWeekSub {
    const sub = new TsInsWeekSub();
    sub.masterSeq = row.MASTER_SEQ;
    sub.farmNo = row.FARM_NO;
    sub.gubun = row.GUBUN;
    sub.sortNo = row.SORT_NO;
    sub.code1 = row.CODE1;
    sub.code2 = row.CODE2;
    sub.cnt1 = row.CNT1;
    sub.cnt2 = row.CNT2;
    sub.cnt3 = row.CNT3;
    sub.cnt4 = row.CNT4;
    sub.cnt5 = row.CNT5;
    sub.cnt6 = row.CNT6;
    sub.val1 = row.VAL1;
    sub.val2 = row.VAL2;
    sub.val3 = row.VAL3;
    sub.val4 = row.VAL4;
    sub.str1 = row.STR1;
    sub.str2 = row.STR2;
    return sub;
  }

  /**
   * 팝업 데이터 변환
   */
  private transformPopupData(type: string, subs: TsInsWeekSub[]) {
    switch (type) {
      case 'alertMd':
        return this.transformAlertMdPopup(subs);
      case 'modon':
        return this.transformParityDistPopup(subs);
      case 'mating':
        return this.transformMatingPopup(subs);
      case 'farrowing':
        return this.transformFarrowingPopup(subs);
      case 'weaning':
        return this.transformWeaningPopup(subs);
      case 'accident':
        return this.transformAccidentPopup(subs);
      case 'culling':
        return this.transformCullingPopup(subs);
      case 'shipment':
        return this.transformShipmentPopup(subs);
      case 'schedule':
        return this.transformSchedulePopup(subs);
      default:
        return subs;
    }
  }

  private transformAlertMdPopup(subs: TsInsWeekSub[]) {
    return subs.map((s) => ({
      category: s.code1,
      modonNo: s.str1,
      status: s.str2,
      days: s.cnt1,
      parity: s.cnt2,
    }));
  }

  private transformParityDistPopup(subs: TsInsWeekSub[]) {
    return subs.map((s) => ({
      parity: s.code1,
      count: s.cnt1,
      ratio: s.val1,
    }));
  }

  private transformMatingPopup(subs: TsInsWeekSub[]) {
    return subs.map((s) => ({
      returnDay: s.code1,
      count: s.cnt1,
      ratio: s.val1,
    }));
  }

  private transformFarrowingPopup(subs: TsInsWeekSub[]) {
    return subs.map((s) => ({
      parity: s.code1,
      count: s.cnt1,
      total: s.cnt2,
      live: s.cnt3,
      avgTotal: s.val1,
      avgLive: s.val2,
    }));
  }

  private transformWeaningPopup(subs: TsInsWeekSub[]) {
    return subs.map((s) => ({
      parity: s.code1,
      count: s.cnt1,
      piglets: s.cnt2,
      avgWeight: s.val1,
    }));
  }

  private transformAccidentPopup(subs: TsInsWeekSub[]) {
    return subs.map((s) => ({
      type: s.code1,
      period: s.code2,
      count: s.cnt1,
      ratio: s.val1,
    }));
  }

  private transformCullingPopup(subs: TsInsWeekSub[]) {
    return subs.map((s) => ({
      reason: s.code1,
      count: s.cnt1,
      ratio: s.val1,
    }));
  }

  private transformShipmentPopup(subs: TsInsWeekSub[]) {
    return subs.map((s) => ({
      date: s.str1, // 일자는 str1에 저장
      count: s.cnt1,
      avgWeight: s.val1,
      avgBackfat: s.val2,
    }));
  }

  private transformSchedulePopup(subs: TsInsWeekSub[]) {
    const grouped: Record<string, any[]> = {};

    subs.forEach((s) => {
      const type = s.gubun.replace('SCHEDULE_', '').toLowerCase();
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push({
        modonNo: s.str1,
        parity: s.cnt1,
        memo: s.str2,
      });
    });

    return grouped;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 차트 데이터 (기존 Mock 유지 - 추후 DB 연동)
  // ─────────────────────────────────────────────────────────────────────────────

  getChartData(chartType: mockData.ChartType) {
    const data = mockData.chartDataMap[chartType];
    if (!data) {
      return null;
    }
    return data;
  }

  getParityDistribution() {
    return mockData.parityDistribution;
  }

  getMatingByReturnDay() {
    return mockData.matingByReturnDay;
  }

  getParityReturn() {
    return mockData.parityReturn;
  }

  getAccidentByPeriod() {
    return mockData.accidentByPeriod;
  }

  getParityAccident() {
    return mockData.parityAccident;
  }

  getParityBirth() {
    return mockData.parityBirth;
  }

  getParityWean() {
    return mockData.parityWean;
  }

  getCullingDistribution() {
    return mockData.cullingDistribution;
  }

  getShipmentAnalysis() {
    return mockData.shipmentAnalysis;
  }

  getCarcassDistribution() {
    return mockData.carcassDistribution;
  }

  getAllWeeklyData() {
    return {
      parityDistribution: mockData.parityDistribution,
      matingByReturnDay: mockData.matingByReturnDay,
      parityReturn: mockData.parityReturn,
      accidentByPeriod: mockData.accidentByPeriod,
      parityAccident: mockData.parityAccident,
      parityBirth: mockData.parityBirth,
      parityWean: mockData.parityWean,
      cullingDistribution: mockData.cullingDistribution,
      shipmentAnalysis: mockData.shipmentAnalysis,
      carcassDistribution: mockData.carcassDistribution,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 지난주/금주/운영스냅샷 (기존 Mock 유지 - 추후 DB 연동)
  // ─────────────────────────────────────────────────────────────────────────────

  getLastweekData() {
    return mockData.lastweekData;
  }

  getLastweekSummary() {
    return mockData.lastweekData.summary;
  }

  getSowStatus() {
    return mockData.lastweekData.sowStatus;
  }

  getMatingData() {
    return mockData.lastweekData.mating;
  }

  getAccidentType() {
    return mockData.lastweekData.accidentType;
  }

  getFarrowingData() {
    return mockData.lastweekData.farrowing;
  }

  getWeaningData() {
    return mockData.lastweekData.weaning;
  }

  getCullingData() {
    return mockData.lastweekData.culling;
  }

  getShipmentData() {
    return mockData.lastweekData.shipment;
  }

  getThisweekData() {
    return mockData.thisweekData;
  }

  getOperationSummary() {
    return mockData.operationSummaryData;
  }

  getPsyData() {
    return mockData.operationSummaryData.psy;
  }

  getPsyTrend() {
    return mockData.operationSummaryData.psyTrend;
  }

  getAuctionPrice() {
    return mockData.operationSummaryData.auctionPrice;
  }

  getWeather() {
    return mockData.operationSummaryData.weather;
  }

  getInsights() {
    return mockData.operationSummaryData.insights;
  }
}
