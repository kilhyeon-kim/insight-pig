import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BATCH_SQL } from './sql/batch.sql';

/**
 * 배치 오케스트레이션 서비스
 * 1. 외부 API 데이터 수집 (통계, 기상 등)
 * 2. Oracle Job 실행 (SP_INS_WEEK_MAIN)
 */
@Injectable()
export class BatchService {
    private readonly logger = new Logger(BatchService.name);

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
}
