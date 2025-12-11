import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeeklyController } from './weekly.controller';
import { WeeklyService } from './weekly.service';
import { TsInsMaster, TsInsFarm, TsInsFarmSub } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([TsInsMaster, TsInsFarm, TsInsFarmSub])],
  controllers: [WeeklyController],
  providers: [WeeklyService],
  exports: [WeeklyService],
})
export class WeeklyModule {}
