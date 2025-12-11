import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TsInsMaster, TsInsFarm, TsInsFarmSub } from './entities';
import * as mockData from '../../data/mock/weekly.mock';

/**
 * 주간 리포트 서비스
 * - 실제 DB 연동 (Oracle)
 * - DB 연결 실패 시 Mock 데이터 fallback
 */
@Injectable()
export class WeeklyService {
  private readonly logger = new Logger(WeeklyService.name);

  constructor(
    @InjectRepository(TsInsMaster)
    private readonly masterRepository: Repository<TsInsMaster>,
    @InjectRepository(TsInsFarm)
    private readonly farmRepository: Repository<TsInsFarm>,
    @InjectRepository(TsInsFarmSub)
    private readonly farmSubRepository: Repository<TsInsFarmSub>,
  ) {}

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
      const query = this.masterRepository
        .createQueryBuilder('m')
        .innerJoin('m.farms', 'f')
        .where('f.farmNo = :farmNo', { farmNo })
        .andWhere('m.dayGb = :dayGb', { dayGb: 'WEEK' })
        .andWhere('m.statusCd = :status', { status: 'COMPLETE' });

      if (from) {
        query.andWhere('m.insDt >= :from', { from });
      }
      if (to) {
        query.andWhere('m.insDt <= :to', { to });
      }

      const masters = await query
        .orderBy('m.reportYear', 'DESC')
        .addOrderBy('m.reportWeekNo', 'DESC')
        .getMany();

      return masters.map((m) => ({
        id: `${m.seq}`,
        masterSeq: m.seq,
        year: m.reportYear,
        weekNo: m.reportWeekNo,
        period: {
          from: m.dtFrom,
          to: m.dtTo,
        },
        statusCd: m.statusCd,
        createdAt: m.logInsDt,
      }));
    } catch (error) {
      this.logger.warn('DB 연결 실패, Mock 데이터 반환', error.message);
      return mockData.reportList;
    }
  }

  /**
   * 주간 보고서 상세 조회
   * @param masterSeq 마스터 SEQ
   * @param farmNo 농장번호
   */
  async getReportDetail(masterSeq: number, farmNo: number) {
    try {
      // 1. TS_INS_FARM 조회
      const farm = await this.farmRepository.findOne({
        where: { masterSeq, farmNo },
        relations: ['master'],
      });

      if (!farm) {
        this.logger.warn(`Farm not found: masterSeq=${masterSeq}, farmNo=${farmNo}`);
        return null;
      }

      // 2. TS_INS_FARM_SUB 조회 (팝업 상세 데이터)
      const subs = await this.farmSubRepository.find({
        where: { masterSeq, farmNo },
        order: { gubun: 'ASC', sortNo: 'ASC' },
      });

      // 3. 데이터 변환 (프론트엔드 형식)
      return this.transformToReportDetail(farm, subs);
    } catch (error) {
      this.logger.warn('DB 조회 실패, Mock 데이터 반환', error.message);
      return mockData.reportDetail;
    }
  }

  /**
   * DB 데이터를 프론트엔드 형식으로 변환
   */
  private transformToReportDetail(farm: TsInsFarm, subs: TsInsFarmSub[]) {
    const master = farm.master;

    return {
      header: {
        farmNo: farm.farmNo,
        farmNm: farm.farmNm,
        ownerNm: farm.ownerNm,
        year: farm.reportYear,
        weekNo: farm.reportWeekNo,
        period: {
          from: this.formatDate(farm.dtFrom),
          to: this.formatDate(farm.dtTo),
        },
      },
      alertMd: {
        total: farm.alertTotal,
        hubo: farm.alertHubo,
        euMi: farm.alertEuMi,
        sgMi: farm.alertSgMi,
        bmDelay: farm.alertBmDelay,
        euDelay: farm.alertEuDelay,
        items: this.extractSubData(subs, 'ALERT_MD'),
      },
      lastWeek: {
        period: {
          weekNum: farm.reportWeekNo,
          from: this.formatDate(farm.dtFrom),
          to: this.formatDate(farm.dtTo),
        },
        modon: {
          regCnt: farm.modonRegCnt,
          sangsiCnt: farm.modonSangsiCnt,
        },
        mating: {
          cnt: farm.lastGbCnt,
          sum: farm.lastGbSum,
        },
        farrowing: {
          cnt: farm.lastBmCnt,
          total: farm.lastBmTotal,
          live: farm.lastBmLive,
          dead: farm.lastBmDead,
          mummy: farm.lastBmMummy,
          sumCnt: farm.lastBmSumCnt,
          sumTotal: farm.lastBmSumTotal,
          sumLive: farm.lastBmSumLive,
          avgTotal: farm.lastBmAvgTotal,
          avgLive: farm.lastBmAvgLive,
          chgTotal: farm.lastBmChgTotal,
          chgLive: farm.lastBmChgLive,
        },
        weaning: {
          cnt: farm.lastEuCnt,
          jdCnt: farm.lastEuJdCnt,
          avgKg: farm.lastEuAvgKg,
          sumCnt: farm.lastEuSumCnt,
          sumJd: farm.lastEuSumJd,
          chgKg: farm.lastEuChgKg,
        },
        accident: {
          cnt: farm.lastSgCnt,
          sum: farm.lastSgSum,
        },
        culling: {
          cnt: farm.lastClCnt,
          sum: farm.lastClSum,
        },
        shipment: {
          cnt: farm.lastShCnt,
          avgKg: farm.lastShAvgKg,
          sum: farm.lastShSum,
          avgSum: farm.lastShAvgSum,
        },
      },
      thisWeek: {
        gbSum: farm.thisGbSum,
        imsinSum: farm.thisImsinSum,
        bmSum: farm.thisBmSum,
        euSum: farm.thisEuSum,
        vaccineSum: farm.thisVaccineSum,
        shipSum: farm.thisShipSum,
        schedules: this.extractScheduleData(subs),
      },
      kpi: {
        psy: farm.kpiPsy,
        delayDay: farm.kpiDelayDay,
        psyX: farm.psyX,
        psyY: farm.psyY,
        psyZone: farm.psyZone,
      },
    };
  }

  /**
   * SUB 데이터에서 특정 GUBUN 추출
   */
  private extractSubData(subs: TsInsFarmSub[], gubun: string) {
    return subs
      .filter((s) => s.gubun === gubun)
      .map((s) => ({
        code1: s.code1,
        code2: s.code2,
        cnt1: s.cnt1,
        cnt2: s.cnt2,
        cnt3: s.cnt3,
        val1: s.val1,
        val2: s.val2,
        str1: s.str1,
        str2: s.str2,
        wkDate: s.wkDate,
      }));
  }

  /**
   * 예정 작업 데이터 추출
   */
  private extractScheduleData(subs: TsInsFarmSub[]) {
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
   * Oracle에서 반환되는 날짜는 Date 객체 또는 문자열일 수 있음
   */
  private formatDate(date: Date | string): string {
    if (!date) return '';
    if (typeof date === 'string') {
      // 이미 문자열인 경우
      return date.substring(0, 10);
    }
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    // 기타 형식 (Oracle 날짜 객체 등)
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

      let subs: TsInsFarmSub[];

      if (gubun.includes('%')) {
        // LIKE 검색 (SCHEDULE_%)
        subs = await this.farmSubRepository
          .createQueryBuilder('s')
          .where('s.masterSeq = :masterSeq', { masterSeq })
          .andWhere('s.farmNo = :farmNo', { farmNo })
          .andWhere('s.gubun LIKE :gubun', { gubun })
          .orderBy('s.gubun', 'ASC')
          .addOrderBy('s.sortNo', 'ASC')
          .getMany();
      } else {
        subs = await this.farmSubRepository.find({
          where: { masterSeq, farmNo, gubun },
          order: { sortNo: 'ASC' },
        });
      }

      return this.transformPopupData(type, subs);
    } catch (error) {
      this.logger.warn(`팝업 데이터 조회 실패: ${type}`, error.message);
      // Mock fallback
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
   * 팝업 데이터 변환
   */
  private transformPopupData(type: string, subs: TsInsFarmSub[]) {
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

  private transformAlertMdPopup(subs: TsInsFarmSub[]) {
    return subs.map((s) => ({
      category: s.code1, // 카테고리 (hubo, euMi, sgMi, bmDelay, euDelay)
      modonNo: s.str1, // 모돈번호
      status: s.str2, // 상태
      days: s.cnt1, // 경과일수
      parity: s.cnt2, // 산차
      lastDate: this.formatDate(s.wkDate), // 마지막 작업일
    }));
  }

  private transformParityDistPopup(subs: TsInsFarmSub[]) {
    return subs.map((s) => ({
      parity: s.code1, // 산차 (0, 1, 2, ...)
      count: s.cnt1, // 두수
      ratio: s.val1, // 비율 (%)
    }));
  }

  private transformMatingPopup(subs: TsInsFarmSub[]) {
    return subs.map((s) => ({
      returnDay: s.code1, // 재귀일 구간
      count: s.cnt1, // 두수
      ratio: s.val1, // 비율 (%)
    }));
  }

  private transformFarrowingPopup(subs: TsInsFarmSub[]) {
    return subs.map((s) => ({
      parity: s.code1, // 산차
      count: s.cnt1, // 두수
      total: s.cnt2, // 총산자
      live: s.cnt3, // 실산자
      avgTotal: s.val1, // 평균 총산
      avgLive: s.val2, // 평균 실산
    }));
  }

  private transformWeaningPopup(subs: TsInsFarmSub[]) {
    return subs.map((s) => ({
      parity: s.code1, // 산차
      count: s.cnt1, // 복수
      piglets: s.cnt2, // 이유두수
      avgWeight: s.val1, // 평균체중
    }));
  }

  private transformAccidentPopup(subs: TsInsFarmSub[]) {
    return subs.map((s) => ({
      type: s.code1, // 사고유형 (유산, 재발, 불임 등)
      period: s.code2, // 임신기간 구간
      count: s.cnt1, // 두수
      ratio: s.val1, // 비율
    }));
  }

  private transformCullingPopup(subs: TsInsFarmSub[]) {
    return subs.map((s) => ({
      reason: s.code1, // 도태사유
      count: s.cnt1, // 두수
      ratio: s.val1, // 비율
    }));
  }

  private transformShipmentPopup(subs: TsInsFarmSub[]) {
    return subs.map((s) => ({
      date: this.formatDate(s.wkDate), // 출하일
      count: s.cnt1, // 두수
      avgWeight: s.val1, // 평균 도체중
      avgBackfat: s.val2, // 평균 등지방
    }));
  }

  private transformSchedulePopup(subs: TsInsFarmSub[]) {
    const grouped: Record<string, any[]> = {};

    subs.forEach((s) => {
      const type = s.gubun.replace('SCHEDULE_', '').toLowerCase();
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push({
        date: this.formatDate(s.wkDate),
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
