import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { TaMember } from './entities';
import { JwtPayload, LoginResponseDto } from './dto';
import { AUTH_SQL } from './sql';

/**
 * Named parameter를 TypeORM query에 전달하기 위한 헬퍼
 */
const params = (obj: Record<string, any>): any => obj;

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 로그인 처리
   * 1. 아이디/비밀번호 체크
   * 2. FARM_NO가 부여된 회원인지 체크
   * 3. TS_INS_SERVICE에서 서비스 사용권한 체크
   */
  async login(memberId: string, password: string): Promise<LoginResponseDto> {
    // 1단계: 아이디/비밀번호 체크
    const members = await this.dataSource.query(AUTH_SQL.login, params({ memberId, password }));
    const member = members[0];

    if (!member) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 올바르지 않습니다.');
    }

    // 2단계: 농장코드 부여 여부 체크
    if (!member.FARM_NO || member.FARM_NO === 0) {
      throw new ForbiddenException('농장이 등록되지 않은 계정입니다. 관리자에게 문의하세요.');
    }

    // 3단계: 서비스 사용권한 체크
    const services = await this.dataSource.query(AUTH_SQL.getService, params({ farmNo: member.FARM_NO }));
    const service = services[0];

    if (!service) {
      throw new ForbiddenException('인사이트피그플랜 서비스가 신청되지 않았습니다.');
    }

    // 서비스 활성화 조건 체크
    if (service.INSPIG_YN !== 'Y') {
      throw new ForbiddenException('인사이트피그플랜 서비스가 활성화되지 않았습니다.');
    }
    if (service.USE_YN !== 'Y') {
      throw new ForbiddenException('인사이트피그플랜 서비스가 비활성화 상태입니다.');
    }
    if (service.INSPIG_STOP_DT) {
      throw new ForbiddenException('인사이트피그플랜 서비스가 중단되었습니다.');
    }
    // INSPIG_TO_DT는 VARCHAR(8) YYYYMMDD 형식
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    if (service.INSPIG_TO_DT && service.INSPIG_TO_DT < today) {
      throw new ForbiddenException('인사이트피그플랜 서비스 기간이 만료되었습니다.');
    }

    // 4단계: 농장명 조회
    const farms = await this.dataSource.query(AUTH_SQL.getFarm, params({ farmNo: member.FARM_NO }));
    const farm = farms[0];
    const farmNm = farm?.FARM_NM || '';

    // JWT 페이로드 생성
    const payload: JwtPayload = {
      memberId: member.MEMBER_ID,
      farmNo: member.FARM_NO,
      farmNm,
      name: member.NAME,
      memberType: member.MEMBER_TYPE,
    };

    // 마지막 접속일 업데이트
    await this.dataSource.query(AUTH_SQL.updateLastLogin, params({ memberId }));

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        memberId: member.MEMBER_ID,
        name: member.NAME,
        farmNo: member.FARM_NO,
        farmNm,
        memberType: member.MEMBER_TYPE,
        email: member.EMAIL,
      },
    };
  }

  /**
   * 토큰 검증 및 사용자 정보 반환
   */
  async validateToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }

  /**
   * 회원 정보 조회 (farmNo 기준)
   */
  async getMemberByFarmNo(farmNo: number): Promise<TaMember | null> {
    const members = await this.dataSource.query(AUTH_SQL.getMemberByFarmNo, params({ farmNo }));
    return members[0] ? this.mapToMember(members[0]) : null;
  }

  /**
   * 회원 ID로 조회
   */
  async getMemberById(memberId: string): Promise<TaMember | null> {
    const members = await this.dataSource.query(AUTH_SQL.getMemberById, params({ memberId }));
    return members[0] ? this.mapToMember(members[0]) : null;
  }

  /**
   * 서비스 권한 조회
   */
  async getServiceByFarmNo(farmNo: number): Promise<any | null> {
    const services = await this.dataSource.query(AUTH_SQL.getService, params({ farmNo }));
    return services[0] || null;
  }

  /**
   * Raw SQL 결과를 TaMember 형식으로 매핑
   */
  private mapToMember(row: any): TaMember {
    const member = new TaMember();
    member.memberId = row.MEMBER_ID;
    member.companyCd = row.COMPANY_CD;
    member.soleCd = row.SOLE_CD;
    member.agentCd = row.AGENT_CD;
    member.farmNo = row.FARM_NO;
    member.memberType = row.MEMBER_TYPE;
    member.memberTypeD = row.MEMBER_TYPE_D;
    member.name = row.NAME;
    member.position = row.POSITION;
    member.email = row.EMAIL;
    member.hpNum = row.HP_NUM;
    member.useYn = row.USE_YN;
    return member;
  }
}
