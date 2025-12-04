import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { WeeklyService } from './weekly.service';
import { ChartType } from '../../data/mock/weekly.mock';

/**
 * 주간 리포트 API 컨트롤러
 *
 * @route /api/weekly
 */
@Controller('api/weekly')
export class WeeklyController {
  constructor(private readonly weeklyService: WeeklyService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // 보고서 목록/상세/팝업 API (Frontend 연동용)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * 주간 보고서 목록
   * GET /api/weekly/list?from=2023-10-01&to=2023-10-31
   */
  @Get('list')
  getList(@Query('from') from?: string, @Query('to') to?: string) {
    return {
      success: true,
      data: this.weeklyService.getReportList(from, to),
    };
  }

  /**
   * 주간 보고서 상세
   * GET /api/weekly/detail/:id
   */
  @Get('detail/:id')
  getDetail(@Param('id') id: string) {
    const data = this.weeklyService.getReportDetail(id);
    if (!data) {
      throw new NotFoundException(`Report with id '${id}' not found`);
    }
    return {
      success: true,
      data,
    };
  }

  /**
   * 팝업 데이터
   * GET /api/weekly/popup/:type/:id
   */
  @Get('popup/:type/:id')
  getPopupData(@Param('type') type: string, @Param('id') id: string) {
    const data = this.weeklyService.getPopupData(type, id);
    if (!data) {
      throw new NotFoundException(`Popup data for type '${type}' not found`);
    }
    return {
      success: true,
      data,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 기존 API
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * 전체 주간 리포트 데이터
   * GET /api/weekly
   */
  @Get()
  getAllData() {
    return {
      success: true,
      data: this.weeklyService.getAllWeeklyData(),
    };
  }

  /**
   * 차트 타입별 데이터 조회
   * GET /api/weekly/chart/:type
   */
  @Get('chart/:type')
  getChartData(@Param('type') type: string) {
    const data = this.weeklyService.getChartData(type as ChartType);
    if (!data) {
      throw new NotFoundException(`Chart type '${type}' not found`);
    }
    return {
      success: true,
      data,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 차트 개별 엔드포인트 (하위 호환성)
  // ─────────────────────────────────────────────────────────────────────────────

  /** GET /api/weekly/parity-distribution */
  @Get('parity-distribution')
  getParityDistribution() {
    return { success: true, data: this.weeklyService.getParityDistribution() };
  }

  /** GET /api/weekly/mating-return */
  @Get('mating-return')
  getMatingByReturnDay() {
    return { success: true, data: this.weeklyService.getMatingByReturnDay() };
  }

  /** GET /api/weekly/parity-return */
  @Get('parity-return')
  getParityReturn() {
    return { success: true, data: this.weeklyService.getParityReturn() };
  }

  /** GET /api/weekly/accident-period */
  @Get('accident-period')
  getAccidentByPeriod() {
    return { success: true, data: this.weeklyService.getAccidentByPeriod() };
  }

  /** GET /api/weekly/parity-accident */
  @Get('parity-accident')
  getParityAccident() {
    return { success: true, data: this.weeklyService.getParityAccident() };
  }

  /** GET /api/weekly/parity-birth */
  @Get('parity-birth')
  getParityBirth() {
    return { success: true, data: this.weeklyService.getParityBirth() };
  }

  /** GET /api/weekly/parity-wean */
  @Get('parity-wean')
  getParityWean() {
    return { success: true, data: this.weeklyService.getParityWean() };
  }

  /** GET /api/weekly/culling */
  @Get('culling')
  getCullingDistribution() {
    return { success: true, data: this.weeklyService.getCullingDistribution() };
  }

  /** GET /api/weekly/shipment */
  @Get('shipment')
  getShipmentAnalysis() {
    return { success: true, data: this.weeklyService.getShipmentAnalysis() };
  }

  /** GET /api/weekly/carcass */
  @Get('carcass')
  getCarcassDistribution() {
    return { success: true, data: this.weeklyService.getCarcassDistribution() };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 지난주 실적 데이터 엔드포인트
  // ─────────────────────────────────────────────────────────────────────────────

  /** GET /api/weekly/lastweek */
  @Get('lastweek')
  getLastweekData() {
    return { success: true, data: this.weeklyService.getLastweekData() };
  }

  /** GET /api/weekly/lastweek/summary */
  @Get('lastweek/summary')
  getLastweekSummary() {
    return { success: true, data: this.weeklyService.getLastweekSummary() };
  }

  /** GET /api/weekly/lastweek/sow-status */
  @Get('lastweek/sow-status')
  getSowStatus() {
    return { success: true, data: this.weeklyService.getSowStatus() };
  }

  /** GET /api/weekly/lastweek/mating */
  @Get('lastweek/mating')
  getMatingData() {
    return { success: true, data: this.weeklyService.getMatingData() };
  }

  /** GET /api/weekly/lastweek/accident-type */
  @Get('lastweek/accident-type')
  getAccidentType() {
    return { success: true, data: this.weeklyService.getAccidentType() };
  }

  /** GET /api/weekly/lastweek/farrowing */
  @Get('lastweek/farrowing')
  getFarrowingData() {
    return { success: true, data: this.weeklyService.getFarrowingData() };
  }

  /** GET /api/weekly/lastweek/weaning */
  @Get('lastweek/weaning')
  getWeaningData() {
    return { success: true, data: this.weeklyService.getWeaningData() };
  }

  /** GET /api/weekly/lastweek/culling */
  @Get('lastweek/culling')
  getCullingData() {
    return { success: true, data: this.weeklyService.getCullingData() };
  }

  /** GET /api/weekly/lastweek/shipment */
  @Get('lastweek/shipment')
  getShipmentData() {
    return { success: true, data: this.weeklyService.getShipmentData() };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 금주 계획 데이터 엔드포인트
  // ─────────────────────────────────────────────────────────────────────────────

  /** GET /api/weekly/thisweek */
  @Get('thisweek')
  getThisweekData() {
    return { success: true, data: this.weeklyService.getThisweekData() };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 운영 스냅샷 데이터 엔드포인트
  // ─────────────────────────────────────────────────────────────────────────────

  /** GET /api/weekly/operation-summary */
  @Get('operation-summary')
  getOperationSummary() {
    return { success: true, data: this.weeklyService.getOperationSummary() };
  }

  /** GET /api/weekly/psy */
  @Get('psy')
  getPsyData() {
    return { success: true, data: this.weeklyService.getPsyData() };
  }

  /** GET /api/weekly/psy-trend */
  @Get('psy-trend')
  getPsyTrend() {
    return { success: true, data: this.weeklyService.getPsyTrend() };
  }

  /** GET /api/weekly/auction-price */
  @Get('auction-price')
  getAuctionPrice() {
    return { success: true, data: this.weeklyService.getAuctionPrice() };
  }

  /** GET /api/weekly/weather */
  @Get('weather')
  getWeather() {
    return { success: true, data: this.weeklyService.getWeather() };
  }

  /** GET /api/weekly/insights */
  @Get('insights')
  getInsights() {
    return { success: true, data: this.weeklyService.getInsights() };
  }
}
