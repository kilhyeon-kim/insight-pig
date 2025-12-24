/**
 * Batch Job SQL 쿼리 모음
 */
export const BATCH_SQL = {
  /**
   * 서비스 이용 중인 농장 목록 및 좌표 조회 (정기 스케줄 대상: REG_TYPE='AUTO')
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
      AND NVL(S.REG_TYPE, 'AUTO') = 'AUTO'
      AND (S.INSPIG_TO_DT IS NULL OR S.INSPIG_TO_DT >= TO_CHAR(SYSDATE, 'YYYYMMDD'))
      AND S.INSPIG_STOP_DT IS NULL
    ORDER BY F.FARM_NO
  `,

  /**
   * 농장 존재 여부 확인
   */
  checkFarmExists: `
    /* batch.batch.checkFarmExists : 농장 존재 여부 확인 */
    SELECT FARM_NO, FARM_NM FROM TA_FARM WHERE FARM_NO = :farmNo AND USE_YN = 'Y'
  `,

  /**
   * TS_INS_SERVICE 조회
   */
  getServiceInfo: `
    /* batch.batch.getServiceInfo : 서비스 정보 조회 */
    SELECT FARM_NO, INSPIG_YN, REG_TYPE, USE_YN
    FROM TS_INS_SERVICE WHERE FARM_NO = :farmNo
  `,

  /**
   * TS_INS_SERVICE MANUAL 등록 (UPSERT)
   */
  upsertManualService: `
    /* batch.batch.upsertManualService : 수동 서비스 등록 */
    MERGE INTO TS_INS_SERVICE S
    USING (SELECT :farmNo AS FARM_NO FROM DUAL) D
    ON (S.FARM_NO = D.FARM_NO)
    WHEN MATCHED THEN
        UPDATE SET INSPIG_YN = 'Y', REG_TYPE = 'MANUAL', USE_YN = 'Y', LOG_UPT_DT = SYSDATE
    WHEN NOT MATCHED THEN
        INSERT (FARM_NO, INSPIG_YN, INSPIG_REG_DT, REG_TYPE, USE_YN, LOG_INS_DT)
        VALUES (:farmNo, 'Y', TO_CHAR(SYSDATE, 'YYYYMMDD'), 'MANUAL', 'Y', SYSDATE)
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
