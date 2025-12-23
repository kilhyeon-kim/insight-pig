import { Controller, Post, Body, Logger } from '@nestjs/common';
import { BatchService } from './batch.service';

@Controller('batch')
export class BatchController {
    private readonly logger = new Logger(BatchController.name);

    constructor(private readonly batchService: BatchService) { }

    /**
     * 주간 리포트 배치 수동 실행 (전체 농장 - 정기 스케줄 대상)
     * POST /batch/run
     */
    @Post('run')
    async runBatch(@Body('dayGb') dayGb: string = 'WEEK') {
        this.logger.log(`배치 수동 실행 요청: dayGb=${dayGb}`);

        // 비동기로 실행 (응답은 즉시 반환)
        this.batchService.runWeeklyBatch(dayGb).catch(err => {
            this.logger.error(`배치 실행 중 오류 발생: ${err.message}`);
        });

        return {
            success: true,
            message: `배치 프로세스가 시작되었습니다. (${dayGb})`,
        };
    }

    /**
     * 특정 농장 ETL 수동 실행
     * POST /batch/manual
     *
     * @body farmNo - 농장번호 (필수)
     * @body dtFrom - 시작일 YYYYMMDD (선택, 없으면 자동 계산)
     * @body dtTo - 종료일 YYYYMMDD (선택, 없으면 자동 계산)
     *
     * @example
     * { "farmNo": 12345 }
     * { "farmNo": 12345, "dtFrom": "20251215", "dtTo": "20251221" }
     */
    @Post('manual')
    async runManualEtl(
        @Body('farmNo') farmNo: number,
        @Body('dtFrom') dtFrom?: string,
        @Body('dtTo') dtTo?: string,
    ) {
        this.logger.log(`수동 ETL 요청: 농장=${farmNo}, 기간=${dtFrom || 'auto'}~${dtTo || 'auto'}`);

        if (!farmNo) {
            return {
                success: false,
                message: 'farmNo는 필수입니다.',
            };
        }

        return await this.batchService.runManualEtl(farmNo, dtFrom, dtTo);
    }
}
