/**
 * 주간 보고서 SQL 쿼리 모음
 */
export const WEEKLY_SQL = {
  /** 주간 보고서 목록 조회 */
  getReportList: `
    SELECT
        m.SEQ,
        m.DAY_GB,
        m.INS_DT,
        m.REPORT_YEAR,
        m.REPORT_WEEK_NO,
        m.DT_FROM,
        m.DT_TO,
        m.TARGET_CNT,
        m.COMPLETE_CNT,
        m.ERROR_CNT,
        m.STATUS_CD,
        m.START_DT,
        m.END_DT,
        m.ELAPSED_SEC,
        m.LOG_INS_DT
    FROM TS_INS_MASTER m
    INNER JOIN TS_INS_FARM f ON f.MASTER_SEQ = m.SEQ
    WHERE f.FARM_NO = :farmNo
      AND m.DAY_GB = 'WEEK'
      AND m.STATUS_CD = 'COMPLETE'
      AND m.INS_DT >= :from
      AND m.INS_DT <= :to
    ORDER BY m.REPORT_YEAR DESC, m.REPORT_WEEK_NO DESC
  `,

  /** 주간 보고서 상세 조회 (TS_INS_FARM + TS_INS_MASTER) */
  getReportDetail: `
    SELECT
        f.MASTER_SEQ,
        f.FARM_NO,
        f.FARM_NM,
        f.STATUS_CD,
        f.ERROR_MSG,
        f.START_DT,
        f.END_DT,
        f.ELAPSED_SEC,
        f.SOW_CNT,
        f.GILT_CNT,
        f.BOAR_CNT,
        f.SUCKLING_CNT,
        f.WEANING_CNT,
        f.GROWING_CNT,
        f.FINISH_CNT,
        m.REPORT_YEAR,
        m.REPORT_WEEK_NO,
        m.DT_FROM,
        m.DT_TO,
        m.LOG_INS_DT
    FROM TS_INS_FARM f
    INNER JOIN TS_INS_MASTER m ON m.SEQ = f.MASTER_SEQ
    WHERE f.MASTER_SEQ = :masterSeq
      AND f.FARM_NO = :farmNo
  `,

  /** 주간 보고서 상세 서브 데이터 (TS_INS_FARM_SUB) */
  getReportSub: `
    SELECT
        MASTER_SEQ,
        FARM_NO,
        GUBUN,
        SORT_NO,
        TITLE,
        VAL1, VAL2, VAL3, VAL4, VAL5,
        VAL6, VAL7, VAL8, VAL9, VAL10
    FROM TS_INS_FARM_SUB
    WHERE MASTER_SEQ = :masterSeq
      AND FARM_NO = :farmNo
    ORDER BY GUBUN ASC, SORT_NO ASC
  `,
};
