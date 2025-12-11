import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TsInsWeek } from './ts-ins-week.entity';

/**
 * TS_INS_WEEK_SUB: 리포트 상세 테이블 (팝업 데이터)
 *
 * GUBUN 코드별 데이터 용도:
 * - ALERT_MD: 관리대상 모돈 상세 (모돈번호, 상태, 일수 등)
 * - PARITY_DIST: 산차별 모돈분포
 * - MATING_RETURN: 재귀일별 교배복수
 * - PARITY_RETURN: 산차별 재귀일
 * - ACCIDENT_PERIOD: 임신일별 사고복수
 * - PARITY_ACCIDENT: 산차별 사고원인
 * - PARITY_BIRTH: 산차별 분만성적
 * - PARITY_WEAN: 산차별 이유성적
 * - CULLING_DIST: 도폐사원인분포
 * - SHIPMENT: 출하자료분석
 * - CARCASS: 도체중/등지방분포
 * - SCHEDULE_*: 예정 작업 (GB, IMSIN, BM, EU, VACCINE, SHIP)
 */
@Entity({ name: 'TS_INS_WEEK_SUB' })
export class TsInsWeekSub {
  @PrimaryColumn({ name: 'MASTER_SEQ', type: 'number' })
  masterSeq: number;

  @PrimaryColumn({ name: 'FARM_NO', type: 'number' })
  farmNo: number;

  @PrimaryColumn({ name: 'GUBUN', type: 'varchar2', length: 20 })
  gubun: string;

  @PrimaryColumn({ name: 'SORT_NO', type: 'number' })
  sortNo: number;

  // 공통 코드 컬럼
  @Column({ name: 'CODE_1', type: 'varchar2', length: 30, nullable: true })
  code1: string;

  @Column({ name: 'CODE_2', type: 'varchar2', length: 30, nullable: true })
  code2: string;

  // 숫자형 데이터
  @Column({ name: 'CNT_1', type: 'number', default: 0 })
  cnt1: number;

  @Column({ name: 'CNT_2', type: 'number', default: 0 })
  cnt2: number;

  @Column({ name: 'CNT_3', type: 'number', default: 0 })
  cnt3: number;

  @Column({ name: 'CNT_4', type: 'number', default: 0 })
  cnt4: number;

  @Column({ name: 'CNT_5', type: 'number', default: 0 })
  cnt5: number;

  @Column({ name: 'CNT_6', type: 'number', default: 0 })
  cnt6: number;

  // 수치형 데이터
  @Column({ name: 'VAL_1', type: 'number', precision: 10, scale: 2, default: 0 })
  val1: number;

  @Column({ name: 'VAL_2', type: 'number', precision: 10, scale: 2, default: 0 })
  val2: number;

  @Column({ name: 'VAL_3', type: 'number', precision: 10, scale: 2, default: 0 })
  val3: number;

  @Column({ name: 'VAL_4', type: 'number', precision: 10, scale: 2, default: 0 })
  val4: number;

  // 문자형 데이터
  @Column({ name: 'STR_1', type: 'varchar2', length: 100, nullable: true })
  str1: string;

  @Column({ name: 'STR_2', type: 'varchar2', length: 100, nullable: true })
  str2: string;

  @Column({ name: 'LOG_INS_DT', type: 'date', default: () => 'SYSDATE' })
  logInsDt: Date;

  // Relations
  @ManyToOne(() => TsInsWeek, (week) => week.subs)
  @JoinColumn([
    { name: 'MASTER_SEQ', referencedColumnName: 'masterSeq' },
    { name: 'FARM_NO', referencedColumnName: 'farmNo' },
  ])
  week: TsInsWeek;
}
