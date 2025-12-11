import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { TsInsFarm } from './ts-ins-farm.entity';

/**
 * TS_INS_MASTER: 리포트 생성 마스터 테이블
 * 주간/월간/분기 리포트 생성 단위별 마스터 정보
 */
@Entity({ name: 'TS_INS_MASTER' })
export class TsInsMaster {
  @PrimaryColumn({ name: 'SEQ', type: 'number' })
  seq: number;

  @Column({ name: 'DAY_GB', type: 'varchar2', length: 10 })
  dayGb: string; // WEEK, MON, QT

  @Column({ name: 'INS_DT', type: 'char', length: 8 })
  insDt: string; // YYYYMMDD

  @Column({ name: 'REPORT_YEAR', type: 'number', precision: 4 })
  reportYear: number;

  @Column({ name: 'REPORT_WEEK_NO', type: 'number', precision: 2 })
  reportWeekNo: number;

  @Column({ name: 'DT_FROM', type: 'date' })
  dtFrom: Date;

  @Column({ name: 'DT_TO', type: 'date' })
  dtTo: Date;

  @Column({ name: 'TARGET_CNT', type: 'number', default: 0 })
  targetCnt: number;

  @Column({ name: 'COMPLETE_CNT', type: 'number', default: 0 })
  completeCnt: number;

  @Column({ name: 'ERROR_CNT', type: 'number', default: 0 })
  errorCnt: number;

  @Column({ name: 'STATUS_CD', type: 'varchar2', length: 10, default: 'READY' })
  statusCd: string;

  @Column({ name: 'START_DT', type: 'date', nullable: true })
  startDt: Date;

  @Column({ name: 'END_DT', type: 'date', nullable: true })
  endDt: Date;

  @Column({ name: 'ELAPSED_SEC', type: 'number', default: 0 })
  elapsedSec: number;

  @Column({ name: 'LOG_INS_DT', type: 'date', default: () => 'SYSDATE' })
  logInsDt: Date;

  @OneToMany(() => TsInsFarm, (farm) => farm.master)
  farms: TsInsFarm[];
}
