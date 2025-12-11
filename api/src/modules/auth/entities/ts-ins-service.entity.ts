import { Entity, Column, PrimaryColumn } from 'typeorm';

/**
 * TS_INS_SERVICE: 인사이트피그플랜 서비스 신청 테이블
 * 서비스 사용권한 체크용
 */
@Entity({ name: 'TS_INS_SERVICE' })
export class TsInsService {
  @PrimaryColumn({ name: 'FARM_NO', type: 'number' })
  farmNo: number;

  @Column({ name: 'INSPIG_YN', type: 'varchar2', length: 1, default: 'N' })
  inspigYn: string;

  @Column({ name: 'INSPIG_REG_DT', type: 'date', nullable: true })
  inspigRegDt: Date;

  @Column({ name: 'INSPIG_FROM_DT', type: 'date', nullable: true })
  inspigFromDt: Date;

  @Column({ name: 'INSPIG_TO_DT', type: 'date', nullable: true })
  inspigToDt: Date;

  @Column({ name: 'INSPIG_STOP_DT', type: 'date', nullable: true })
  inspigStopDt: Date;

  @Column({ name: 'WEB_PAY_YN', type: 'varchar2', length: 1, nullable: true })
  webPayYn: string;

  @Column({ name: 'USE_YN', type: 'varchar2', length: 1, default: 'Y' })
  useYn: string;
}
