import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

class LoginDto {
  memberId: string;
  password: string;
}

/**
 * 인증 API 컨트롤러
 * @route /api/auth
 */
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 로그인
   * POST /api/auth/login
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(
      loginDto.memberId,
      loginDto.password,
    );
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 토큰 검증 및 사용자 정보 조회
   * GET /api/auth/me
   */
  @Get('me')
  async getMe(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('인증 토큰이 필요합니다.');
    }

    const token = authHeader.substring(7);
    const payload = await this.authService.validateToken(token);

    return {
      success: true,
      data: {
        memberId: payload.memberId,
        name: payload.name,
        farmNo: payload.farmNo,
        memberType: payload.memberType,
      },
    };
  }

  /**
   * 토큰 갱신 (선택적)
   * POST /api/auth/refresh
   */
  @Post('refresh')
  async refresh(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('인증 토큰이 필요합니다.');
    }

    const token = authHeader.substring(7);
    const payload = await this.authService.validateToken(token);

    // 사용자 정보를 다시 조회하여 최신 정보로 토큰 재발급
    const member = await this.authService.getMemberById(payload.memberId);
    if (!member) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    const result = await this.authService.login(member.memberId, member.password);
    return {
      success: true,
      data: result,
    };
  }
}
