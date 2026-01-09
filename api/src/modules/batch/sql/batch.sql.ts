/**
 * Batch Job SQL 쿼리 모음
 * TS_INS_SERVICE PK: FARM_NO + INSPIG_REG_DT (이력 관리)
 * 주의: DB가 UTC이므로 SYSDATE + 9/24로 KST 변환
 */
export const BATCH_SQL = {
  /**
   * 서비스 이용 중인 농장 목록 및 좌표 조회 (정기 스케줄 대상: REG_TYPE='AUTO')
   * PK: FARM_NO + INSPIG_REG_DT - 유효한 최신 건만 조인
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
    INNER JOIN (
        SELECT S1.FARM_NO
        FROM TS_INS_SERVICE S1
        WHERE S1.INSPIG_YN = 'Y'
          AND S1.USE_YN = 'Y'
          AND NVL(S1.REG_TYPE, 'AUTO') = 'AUTO'
          AND S1.INSPIG_FROM_DT IS NOT NULL
          AND S1.INSPIG_TO_DT IS NOT NULL
          AND TO_CHAR(SYSDATE + 9/24, 'YYYYMMDD') >= S1.INSPIG_FROM_DT
          AND TO_CHAR(SYSDATE + 9/24, 'YYYYMMDD') <= LEAST(
              S1.INSPIG_TO_DT,
              NVL(S1.INSPIG_STOP_DT, '99991231')
          )
          AND S1.INSPIG_REG_DT = (
              SELECT MAX(S2.INSPIG_REG_DT)
              FROM TS_INS_SERVICE S2
              WHERE S2.FARM_NO = S1.FARM_NO
                AND S2.INSPIG_YN = 'Y'
                AND S2.USE_YN = 'Y'
                AND S2.INSPIG_FROM_DT IS NOT NULL
                AND S2.INSPIG_TO_DT IS NOT NULL
                AND TO_CHAR(SYSDATE + 9/24, 'YYYYMMDD') >= S2.INSPIG_FROM_DT
                AND TO_CHAR(SYSDATE + 9/24, 'YYYYMMDD') <= LEAST(
                    S2.INSPIG_TO_DT,
                    NVL(S2.INSPIG_STOP_DT, '99991231')
                )
          )
    ) S ON F.FARM_NO = S.FARM_NO
    WHERE F.USE_YN = 'Y'
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
   * TS_INS_SERVICE 조회 (현재 유효한 최신 건)
   * PK: FARM_NO + INSPIG_REG_DT - 유효한 최신 건만 조회
   */
  getServiceInfo: `
    /* batch.batch.getServiceInfo : 서비스 정보 조회 (유효한 최신 건) */
    SELECT S1.FARM_NO, S1.INSPIG_YN, S1.REG_TYPE, S1.USE_YN, S1.INSPIG_REG_DT,
           S1.INSPIG_FROM_DT, S1.INSPIG_TO_DT, S1.INSPIG_STOP_DT
    FROM TS_INS_SERVICE S1
    WHERE S1.FARM_NO = :farmNo
      AND S1.INSPIG_YN = 'Y'
      AND S1.USE_YN = 'Y'
      AND S1.INSPIG_FROM_DT IS NOT NULL
      AND S1.INSPIG_TO_DT IS NOT NULL
      AND TO_CHAR(SYSDATE + 9/24, 'YYYYMMDD') >= S1.INSPIG_FROM_DT
      AND TO_CHAR(SYSDATE + 9/24, 'YYYYMMDD') <= LEAST(
          S1.INSPIG_TO_DT,
          NVL(S1.INSPIG_STOP_DT, '99991231')
      )
      AND S1.INSPIG_REG_DT = (
          SELECT MAX(S2.INSPIG_REG_DT)
          FROM TS_INS_SERVICE S2
          WHERE S2.FARM_NO = S1.FARM_NO
            AND S2.INSPIG_YN = 'Y'
            AND S2.USE_YN = 'Y'
            AND S2.INSPIG_FROM_DT IS NOT NULL
            AND S2.INSPIG_TO_DT IS NOT NULL
            AND TO_CHAR(SYSDATE + 9/24, 'YYYYMMDD') >= S2.INSPIG_FROM_DT
            AND TO_CHAR(SYSDATE + 9/24, 'YYYYMMDD') <= LEAST(
                S2.INSPIG_TO_DT,
                NVL(S2.INSPIG_STOP_DT, '99991231')
            )
      )
  `,

  /**
   * TS_INS_SERVICE MANUAL 등록 (신규 INSERT)
   * PK: FARM_NO + INSPIG_REG_DT - 항상 새로운 이력 생성
   * MANUAL 등록은 항상 신규 레코드로 INSERT (오늘 KST 날짜로 INSPIG_REG_DT 생성)
   */
  upsertManualService: `
    /* batch.batch.upsertManualService : 수동 서비스 등록 (신규 이력) */
    MERGE INTO TS_INS_SERVICE S
    USING (SELECT :farmNo AS FARM_NO, TO_CHAR(SYSDATE + 9/24, 'YYYYMMDD') AS INSPIG_REG_DT FROM DUAL) D
    ON (S.FARM_NO = D.FARM_NO AND S.INSPIG_REG_DT = D.INSPIG_REG_DT)
    WHEN MATCHED THEN
        UPDATE SET INSPIG_YN = 'Y', REG_TYPE = 'MANUAL', USE_YN = 'Y', LOG_UPT_DT = SYSDATE
    WHEN NOT MATCHED THEN
        INSERT (FARM_NO, INSPIG_YN, INSPIG_REG_DT, REG_TYPE, USE_YN, LOG_INS_DT)
        VALUES (:farmNo, 'Y', TO_CHAR(SYSDATE + 9/24, 'YYYYMMDD'), 'MANUAL', 'Y', SYSDATE)
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
