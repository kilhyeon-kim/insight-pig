import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { spawn } from 'child_process';
import * as path from 'path';
import { BATCH_SQL } from './sql/batch.sql';

/**
 * 배치 오케스트레이션 서비스
 * 1. 외부 API 데이터 수집 (통계, 기상 등)
 * 2. Oracle Job 실행 (SP_INS_WEEK_MAIN)
 * 3. Python ETL 수동 실행 (특정 농장)
 */
@Injectable()
export class BatchService {
    private readonly logger = new Logger(BatchService.name);
    private readonly ETL_PROJECT_PATH = process.env.ETL_PROJECT_PATH || 'C:\\Projects\\inspig-etl';

    constructor(private readonly dataSource: DataSource) { }

    /**
     * 주간 리포트 생성 배치 프로세스 실행
     * @param dayGb 기간구분 (WEEK, MON, QT)
     */
    async runWeeklyBatch(dayGb: string = 'WEEK') {
        const startTime = Date.now();
        this.logger.log(`[${dayGb}] 배치 프로세스 시작...`);

        try {
            // 1. 별도 API를 통한 통계 데이터 조회 후 테이블에 insert
            await this.collectStatsData();

            // 2. 각 농장의 좌표정보를 이용해서 기상데이터 api를 통해서 데이터 수집
            await this.collectWeatherData();

            // 3. 1/2번 완료 후 Oracle Job 실행
            await this.executeOracleJob(dayGb);

            const elapsed = Date.now() - startTime;
            this.logger.log(`[${dayGb}] 배치 프로세스 완료 (${elapsed}ms)`);
        } catch (error) {
            this.logger.error(`[${dayGb}] 배치 프로세스 실패`, error.stack);
            throw error;
        }
    }

    /**
     * 1. 통계 데이터 수집 및 저장
     */
    private async collectStatsData() {
        this.logger.log('Step 1: 통계 데이터 수집 시작...');
        // TODO: 실제 통계 API 호출 및 DB Insert 로직 구현
        // const statsData = await this.httpService.get('STATS_API_URL').toPromise();
        // await this.dataSource.query('INSERT INTO ...', [statsData]);

        // 임시 로그
        await new Promise(resolve => setTimeout(resolve, 500));
        this.logger.log('Step 1: 통계 데이터 수집 완료');
    }

    /**
     * 2. 농장별 기상 데이터 수집 및 저장
     */
    private async collectWeatherData() {
        this.logger.log('Step 2: 기상 데이터 수집 시작...');

        // 대상 농장 및 좌표 조회
        const farms = await this.dataSource.query(BATCH_SQL.getTargetFarms);
        this.logger.log(`대상 농장 수: ${farms.length}개`);

        // 농장별 기상 데이터 수집 (병렬 처리)
        const weatherPromises = farms.map(async (farm) => {
            try {
                if (farm.LATITUDE && farm.LONGITUDE) {
                    // TODO: 실제 기상 API 호출 및 DB Insert 로직 구현
                    // const weather = await this.httpService.get(`WEATHER_API?lat=${farm.LATITUDE}&lon=${farm.LONGITUDE}`).toPromise();
                    // await this.dataSource.query('INSERT INTO ...', [weather]);
                }
            } catch (err) {
                this.logger.warn(`농장 ${farm.FARM_NO} 기상 데이터 수집 실패: ${err.message}`);
            }
        });

        await Promise.all(weatherPromises);
        this.logger.log('Step 2: 기상 데이터 수집 완료');
    }

    /**
     * 3. Oracle Job 실행
     */
    private async executeOracleJob(dayGb: string) {
        this.logger.log('Step 3: Oracle Job (SP_INS_WEEK_MAIN) 실행 시작...');

        await this.dataSource.query(BATCH_SQL.runWeeklyReportMain, [
            dayGb,
            4,
        ]);

        this.logger.log('Step 3: Oracle Job 실행 완료');
    }

    // ========================================
    // 수동 ETL 실행 관련 메소드
    // ========================================

    /**
     * 특정 농장 수동 ETL 실행
     * @param farmNo 농장번호
     * @param dtFrom 시작일 (YYYYMMDD, 선택)
     * @param dtTo 종료일 (YYYYMMDD, 선택)
     */
    async runManualEtl(farmNo: number, dtFrom?: string, dtTo?: string): Promise<{ success: boolean; message: string; taskId?: string }> {
        this.logger.log(`[수동 ETL] 요청: 농장=${farmNo}, 기간=${dtFrom || 'auto'}~${dtTo || 'auto'}`);

        // 1. 농장 존재 여부 확인
        const farm = await this.dataSource.query(BATCH_SQL.checkFarmExists, { farmNo });
        if (!farm || farm.length === 0) {
            throw new BadRequestException(`농장번호 ${farmNo}를 찾을 수 없습니다.`);
        }

        // 2. TS_INS_SERVICE MANUAL 등록 (없으면 생성, 있으면 MANUAL로 업데이트)
        await this.dataSource.query(BATCH_SQL.upsertManualService, { farmNo });
        this.logger.log(`[수동 ETL] 서비스 등록 완료: 농장=${farmNo}, REG_TYPE=MANUAL`);

        // 3. Python ETL 비동기 실행
        const taskId = `manual_${farmNo}_${Date.now()}`;
        this.executePythonEtl(farmNo, dtFrom, dtTo, taskId);

        return {
            success: true,
            message: `ETL 작업이 시작되었습니다. 농장=${farmNo}`,
            taskId,
        };
    }

    /**
     * Python ETL 스크립트 실행 (비동기)
     */
    private executePythonEtl(farmNo: number, dtFrom?: string, dtTo?: string, taskId?: string): void {
        const pythonPath = process.env.PYTHON_PATH || 'python';
        const scriptPath = path.join(this.ETL_PROJECT_PATH, 'src', 'weekly', 'cli.py');

        // CLI 인자 구성
        const args = [scriptPath, '--farm-no', farmNo.toString(), '--manual'];
        if (dtFrom) args.push('--dt-from', dtFrom);
        if (dtTo) args.push('--dt-to', dtTo);

        this.logger.log(`[수동 ETL] Python 실행: ${pythonPath} ${args.join(' ')}`);

        const child = spawn(pythonPath, args, {
            cwd: this.ETL_PROJECT_PATH,
            env: { ...process.env },
            stdio: ['ignore', 'pipe', 'pipe'],
        });

        child.stdout.on('data', (data) => {
            this.logger.log(`[ETL:${taskId}] ${data.toString().trim()}`);
        });

        child.stderr.on('data', (data) => {
            this.logger.warn(`[ETL:${taskId}] ${data.toString().trim()}`);
        });

        child.on('close', (code) => {
            if (code === 0) {
                this.logger.log(`[ETL:${taskId}] 완료 (exit code: ${code})`);
            } else {
                this.logger.error(`[ETL:${taskId}] 실패 (exit code: ${code})`);
            }
        });

        child.on('error', (err) => {
            this.logger.error(`[ETL:${taskId}] 프로세스 오류: ${err.message}`);
        });
    }
}
