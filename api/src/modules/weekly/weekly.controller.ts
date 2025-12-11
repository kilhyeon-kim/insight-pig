import { Controller, Get, Param, Query, NotFoundException, ForbiddenException, Headers } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WeeklyService } from './weekly.service';
import { ChartType } from '../../data/mock/weekly.mock';

/**
 * 주간 리포트 API 컨트롤러
 *
 * @route /api/weekly
 */
@Controller('api/weekly')
export class WeeklyController {
  constructor(
    private readonly weeklyService: WeeklyService,
    private readonly jwtService: JwtService,
  ) { }

  // ─────────────────────────────────────────────────────────────────────────────
  // 보고서 목록/상세/팝업 API (Frontend 연동용)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * 주간 보고서 목록
   * GET /api/weekly/list?farmNo=1001&from=20231001&to=20231031
   */
  @Get('list')
  async getList(
    @Query('farmNo') farmNo: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const farmNoNum = parseInt(farmNo, 10);
    if (!farmNoNum) {
      throw new NotFoundException('farmNo is required');
    }
    return {
      success: true,
      data: await this.weeklyService.getReportList(farmNoNum, from, to),
    };
  }

  /**
   * 주간 보고서 상세
   * GET /api/weekly/detail/:masterSeq/:farmNo
   */
  @Get('detail/:masterSeq/:farmNo')
  async getDetail(
    @Param('masterSeq') masterSeq: string,
    @Param('farmNo') farmNo: string,
  ) {
    const masterSeqNum = parseInt(masterSeq, 10);
    const farmNoNum = parseInt(farmNo, 10);
    const data = await this.weeklyService.getReportDetail(masterSeqNum, farmNoNum);
    if (!data) {
      throw new NotFoundException(
        `Report with masterSeq '${masterSeq}' and farmNo '${farmNo}' not found`,
      );
    }
    return {
      success: true,
      data,
    };
  }

  /**
   * 공유 토큰으로 주간 보고서 조회 (인증 불필요, 만료일 검증 포함)
   * GET /api/weekly/share/:token
   *
   * 응답:
   * - success: true → data에 리포트, sessionToken에 임시 세션 JWT
   * - success: false, expired: true → 만료됨, 로그인 페이지로 이동 필요
   * - success: false, expired: false → 존재하지 않음
   */
  @Get('share/:token')
  async getReportByShareToken(@Param('token') token: string) {
    // 토큰 형식 검증 (64자 hex)
    if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
      throw new NotFoundException('Invalid share token');
    }

    const result = await this.weeklyService.getReportByShareTokenWithExpiry(token);

    // 만료된 경우: ForbiddenException 대신 expired 플래그로 응답
    if (!result.success) {
      return {
        success: false,
        expired: result.expired,
        message: result.message,
        data: null,
      };
    }

    // 성공: 임시 세션 JWT 발급 (해당 리포트만 접근 가능, 1시간 유효)
    const sessionToken = this.jwtService.sign(
      {
        type: 'share_session',
        shareToken: token,
        farmNo: result.data.header.farmNo,
        masterSeq: result.data.header.masterSeq || null,
      },
      { expiresIn: '1h' },
    );

    return {
      success: true,
      data: result.data,
      sessionToken, // 프론트엔드에서 저장하여 후속 API 호출에 사용
    };
  }

  /**
   * 통합 리포트 뷰 (로그인/공유 공용)
   * GET /api/weekly/view/:token
   */
  @Get('view/:token')
  async getView(
    @Param('token') token: string,
    @Headers('authorization') authHeader: string,
  ) {
    // 토큰 형식 검증
    if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
      throw new NotFoundException('Invalid token');
    }

    let skipExpiryCheck = false;

    // 로그인 여부 확인 (Authorization 헤더)
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwtToken = authHeader.split(' ')[1];
        // verify는 실패 시 에러 발생
        const payload = this.jwtService.verify(jwtToken);
        // 로그인 토큰인 경우 (sub가 존재하거나 type이 login 등)
        if (payload) {
          skipExpiryCheck = true;
        }
      } catch (e) {
        // 토큰 검증 실패 시 무시 (공유 링크로 간주)
      }
    }

    const result = await this.weeklyService.getReportByShareTokenWithExpiry(token, skipExpiryCheck);

    if (!result.success) {
      return {
        success: false,
        expired: result.expired,
        message: result.message,
        data: null,
      };
    }

    // 세션 토큰 발급 (공유 접속일 경우 필요, 로그인 접속이어도 팝업 등을 위해 발급 가능)
    const sessionToken = this.jwtService.sign(
      {
        type: 'share_session',
        shareToken: token,
        farmNo: result.data.header.farmNo,
        masterSeq: result.data.header.masterSeq || null,
      },
      { expiresIn: '1h' },
    );

    return {
      success: true,
      data: result.data,
      sessionToken,
      isLoginAccess: skipExpiryCheck
    };
  }

  /**
   * 팝업 데이터
   * GET /api/weekly/popup/:type/:masterSeq/:farmNo
   */
  @Get('popup/:type/:masterSeq/:farmNo')
  async getPopupData(
    @Param('type') type: string,
    @Param('masterSeq') masterSeq: string,
    @Param('farmNo') farmNo: string,
  ) {
    const masterSeqNum = parseInt(masterSeq, 10);
    const farmNoNum = parseInt(farmNo, 10);
    const data = await this.weeklyService.getPopupData(type, masterSeqNum, farmNoNum);
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
