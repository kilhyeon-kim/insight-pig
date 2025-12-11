import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaMember, TaFarm, TsInsService } from './entities';
import { JwtPayload, LoginResponseDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(TaMember)
    private readonly memberRepository: Repository<TaMember>,
    @InjectRepository(TaFarm)
    private readonly farmRepository: Repository<TaFarm>,
    @InjectRepository(TsInsService)
    private readonly serviceRepository: Repository<TsInsService>,
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
    const member = await this.memberRepository.findOne({
      where: { memberId, password, useYn: 'Y' },
    });

    if (!member) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 올바르지 않습니다.');
    }

    // 2단계: 농장코드 부여 여부 체크
    if (!member.farmNo || member.farmNo === 0) {
      throw new ForbiddenException('농장이 등록되지 않은 계정입니다. 관리자에게 문의하세요.');
    }

    // 3단계: 서비스 사용권한 체크
    const service = await this.serviceRepository.findOne({
      where: { farmNo: member.farmNo },
    });

    if (!service) {
      throw new ForbiddenException('인사이트피그플랜 서비스가 신청되지 않았습니다.');
    }

    // 서비스 활성화 조건 체크
    if (service.inspigYn !== 'Y') {
      throw new ForbiddenException('인사이트피그플랜 서비스가 활성화되지 않았습니다.');
    }
    if (service.useYn !== 'Y') {
      throw new ForbiddenException('인사이트피그플랜 서비스가 비활성화 상태입니다.');
    }
    if (service.inspigStopDt) {
      throw new ForbiddenException('인사이트피그플랜 서비스가 중단되었습니다.');
    }
    if (service.inspigToDt && new Date(service.inspigToDt) < new Date()) {
      throw new ForbiddenException('인사이트피그플랜 서비스 기간이 만료되었습니다.');
    }

    // 4단계: 농장명 조회
    const farm = await this.farmRepository.findOne({
      where: { farmNo: member.farmNo },
    });
    const farmNm = farm?.farmNm || '';

    // JWT 페이로드 생성
    const payload: JwtPayload = {
      memberId: member.memberId,
      farmNo: member.farmNo,
      farmNm,
      name: member.name,
      memberType: member.memberType,
    };

    // 마지막 접속일 업데이트
    await this.memberRepository.update(
      { memberId: member.memberId },
      { lastDt: new Date() },
    );

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        memberId: member.memberId,
        name: member.name,
        farmNo: member.farmNo,
        farmNm,
        memberType: member.memberType,
        email: member.email,
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
    return this.memberRepository.findOne({
      where: { farmNo, useYn: 'Y' },
    });
  }

  /**
   * 회원 ID로 조회
   */
  async getMemberById(memberId: string): Promise<TaMember | null> {
    return this.memberRepository.findOne({
      where: { memberId, useYn: 'Y' },
    });
  }

  /**
   * 서비스 권한 조회
   */
  async getServiceByFarmNo(farmNo: number): Promise<TsInsService | null> {
    return this.serviceRepository.findOne({
      where: { farmNo },
    });
  }
}
