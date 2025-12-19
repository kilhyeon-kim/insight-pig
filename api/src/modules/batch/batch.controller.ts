import { Controller, Post, Body, Logger } from '@nestjs/common';
import { BatchService } from './batch.service';

@Controller('batch')
export class BatchController {
    private readonly logger = new Logger(BatchController.name);

    constructor(private readonly batchService: BatchService) { }

    /**
     * 주간 리포트 배치 수동 실행
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
}
