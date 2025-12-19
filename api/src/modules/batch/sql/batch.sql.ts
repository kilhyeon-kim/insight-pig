/**
 * Batch Job SQL 쿼리 모음
 */
export const BATCH_SQL = {
    /**
     * 서비스 이용 중인 농장 목록 및 좌표 조회
     */
    getTargetFarms: `
    /* batch.batch.getTargetFarms : 대상 농장 및 좌표 조회 */
    SELECT 
        F.FARM_NO,
        F.FARM_NM,
        F.SIGUN_CD,
        F.LATITUDE,
        F.LONGITUDE,
        NVL(F.COUNTRY_CODE, 'KOR') AS COUNTRY_CODE
    FROM TA_FARM F
    INNER JOIN TS_INS_SERVICE S ON F.FARM_NO = S.FARM_NO
    WHERE F.USE_YN = 'Y'
      AND S.INSPIG_YN = 'Y'
      AND S.USE_YN = 'Y'
      AND (S.INSPIG_TO_DT IS NULL OR S.INSPIG_TO_DT >= TO_CHAR(SYSDATE, 'YYYYMMDD'))
      AND S.INSPIG_STOP_DT IS NULL
    ORDER BY F.FARM_NO
  `,

    /**
     * 주간 리포트 메인 프로시저 실행
     * @param dayGb - 기간구분 (WEEK, MON, QT)
     * @param parallelLevel - 병렬 수준 (기본 4)
     */
    runWeeklyReportMain: `
    /* batch.batch.runWeeklyReportMain : 주간 리포트 메인 프로시저 실행 */
    BEGIN
        SP_INS_WEEK_MAIN(
            P_DAY_GB => :dayGb,
            P_PARALLEL_LEVEL => :parallelLevel
        );
    END;
  `,
};
