import { Injectable } from '@nestjs/common';
import * as mockData from '../../data/mock/weekly.mock';

/**
 * 주간 리포트 서비스
 * 현재: Mock 데이터 반환
 * 추후: Oracle DB Repository 연동
 */
@Injectable()
export class WeeklyService {
  // ─────────────────────────────────────────────────────────────────────────────
  // 보고서 목록/상세/팝업 (Frontend 연동용)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * 주간 보고서 목록 조회
   */
  getReportList(from?: string, to?: string) {
    // TODO: 실제 DB 연동 시 날짜 범위로 필터링
    return mockData.reportList;
  }

  /**
   * 주간 보고서 상세 조회
   */
  getReportDetail(id: string) {
    // TODO: 실제 DB 연동 시 ID로 조회
    // 현재는 동일한 Mock 데이터 반환 (ID 무관)
    return mockData.reportDetail;
  }

  /**
   * 팝업 데이터 조회
   */
  getPopupData(type: string, id: string) {
    // TODO: 실제 DB 연동 시 type과 id로 조회
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

  // ─────────────────────────────────────────────────────────────────────────────
  // 차트 데이터
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * 차트 타입별 데이터 조회
   */
  getChartData(chartType: mockData.ChartType) {
    const data = mockData.chartDataMap[chartType];
    if (!data) {
      return null;
    }
    return data;
  }

  /**
   * 산차별 모돈현황
   */
  getParityDistribution() {
    return mockData.parityDistribution;
  }

  /**
   * 재귀일별 교배복수
   */
  getMatingByReturnDay() {
    return mockData.matingByReturnDay;
  }

  /**
   * 산차별 재귀일
   */
  getParityReturn() {
    return mockData.parityReturn;
  }

  /**
   * 임신일별 사고복수
   */
  getAccidentByPeriod() {
    return mockData.accidentByPeriod;
  }

  /**
   * 산차별 사고원인
   */
  getParityAccident() {
    return mockData.parityAccident;
  }

  /**
   * 산차별 분만성적
   */
  getParityBirth() {
    return mockData.parityBirth;
  }

  /**
   * 산차별 이유성적
   */
  getParityWean() {
    return mockData.parityWean;
  }

  /**
   * 도폐사원인분포
   */
  getCullingDistribution() {
    return mockData.cullingDistribution;
  }

  /**
   * 출하자료분석
   */
  getShipmentAnalysis() {
    return mockData.shipmentAnalysis;
  }

  /**
   * 도체중/등지방분포
   */
  getCarcassDistribution() {
    return mockData.carcassDistribution;
  }

  /**
   * 전체 주간 리포트 데이터 (한번에 조회)
   */
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
  // 지난주 실적 데이터
  // ─────────────────────────────────────────────────────────────────────────────

  /** 지난주 실적 전체 데이터 */
  getLastweekData() {
    return mockData.lastweekData;
  }

  /** 지난주 요약 데이터 */
  getLastweekSummary() {
    return mockData.lastweekData.summary;
  }

  /** 모돈 현황 (경산돈/후보돈) */
  getSowStatus() {
    return mockData.lastweekData.sowStatus;
  }

  /** 교배 실적 */
  getMatingData() {
    return mockData.lastweekData.mating;
  }

  /** 사고 유형별 데이터 */
  getAccidentType() {
    return mockData.lastweekData.accidentType;
  }

  /** 분만 실적 */
  getFarrowingData() {
    return mockData.lastweekData.farrowing;
  }

  /** 이유 실적 */
  getWeaningData() {
    return mockData.lastweekData.weaning;
  }

  /** 도폐사 데이터 */
  getCullingData() {
    return mockData.lastweekData.culling;
  }

  /** 출하 실적 */
  getShipmentData() {
    return mockData.lastweekData.shipment;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 금주 계획 데이터
  // ─────────────────────────────────────────────────────────────────────────────

  /** 금주 계획 전체 데이터 */
  getThisweekData() {
    return mockData.thisweekData;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 운영 스냅샷 데이터
  // ─────────────────────────────────────────────────────────────────────────────

  /** 운영 스냅샷 전체 데이터 */
  getOperationSummary() {
    return mockData.operationSummaryData;
  }

  /** PSY 데이터 */
  getPsyData() {
    return mockData.operationSummaryData.psy;
  }

  /** PSY 트렌드 데이터 */
  getPsyTrend() {
    return mockData.operationSummaryData.psyTrend;
  }

  /** 경락가격 데이터 */
  getAuctionPrice() {
    return mockData.operationSummaryData.auctionPrice;
  }

  /** 날씨 데이터 */
  getWeather() {
    return mockData.operationSummaryData.weather;
  }

  /** 인사이트 데이터 */
  getInsights() {
    return mockData.operationSummaryData.insights;
  }
}
