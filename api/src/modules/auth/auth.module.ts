import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TaMember, TaFarm, TsInsService } from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaMember, TaFarm, TsInsService]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'inspig-secret-key-2024',
      signOptions: {
        expiresIn: '24h',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
