/**
 * 주간 보고서 SQL 쿼리 모음
 * SQL ID 형식: 서비스.SQL파일.쿼리ID : 설명
 * 파라미터: named parameter (:paramName) - dataSource.query()에 객체로 전달
 */
export const WEEKLY_SQL = {
  /**
   * 주간 보고서 목록 조회 (기본)
   * @param farmNo - 농장번호
   */
  getReportList: `
    /* weekly.weekly.getReportList : 보고서 목록 조회 */
    SELECT
        M.SEQ,
        M.REPORT_YEAR,
        M.REPORT_WEEK_NO,
        TO_CHAR(TO_DATE(M.DT_FROM, 'YYYYMMDD'), 'YYYY.MM.DD') AS DT_FROM,
        TO_CHAR(TO_DATE(M.DT_TO, 'YYYYMMDD'), 'YYYY.MM.DD') AS DT_TO,
        M.STATUS_CD,
        TO_CHAR(SF_GET_LOCALE_VW_DATE_2022('KOR', M.LOG_INS_DT), 'YYYY.MM.DD') AS LOG_INS_DT,
        W.SHARE_TOKEN,
        W.FARM_NM
    FROM TS_INS_MASTER M
    INNER JOIN TS_INS_WEEK W ON W.MASTER_SEQ = M.SEQ
    WHERE W.FARM_NO = :farmNo
      AND M.DAY_GB = 'WEEK'
      AND M.STATUS_CD = 'COMPLETE'
    ORDER BY M.REPORT_YEAR DESC, M.REPORT_WEEK_NO DESC
  `,

  /**
   * 주간 보고서 목록 조회 (기간 필터)
   * @param farmNo - 농장번호
   * @param dtFrom - 시작일 (YYYYMMDD)
   * @param dtTo - 종료일 (YYYYMMDD)
   */
  getReportListWithPeriod: `
    /* weekly.weekly.getReportListWithPeriod : 보고서 목록 조회 (기간) */
    SELECT
        M.SEQ,
        M.REPORT_YEAR,
        M.REPORT_WEEK_NO,
        TO_CHAR(TO_DATE(M.DT_FROM, 'YYYYMMDD'), 'YYYY.MM.DD') AS DT_FROM,
        TO_CHAR(TO_DATE(M.DT_TO, 'YYYYMMDD'), 'YYYY.MM.DD') AS DT_TO,
        M.STATUS_CD,
        TO_CHAR(SF_GET_LOCALE_VW_DATE_2022('KOR', M.LOG_INS_DT), 'YYYY.MM.DD') AS LOG_INS_DT,
        W.SHARE_TOKEN,
        W.FARM_NM
    FROM TS_INS_MASTER M
    INNER JOIN TS_INS_WEEK W ON W.MASTER_SEQ = M.SEQ
    WHERE W.FARM_NO = :farmNo
      AND M.DAY_GB = 'WEEK'
      AND M.STATUS_CD = 'COMPLETE'
      AND TO_CHAR(SF_GET_LOCALE_DATE_2020('KOR', M.INS_DT), 'YYYYMMDD') >= :dtFrom
      AND TO_CHAR(SF_GET_LOCALE_DATE_2020('KOR', M.INS_DT), 'YYYYMMDD') <= :dtTo
    ORDER BY M.REPORT_YEAR DESC, M.REPORT_WEEK_NO DESC
  `,

  /**
   * 주간 보고서 상세 조회
   * @param masterSeq - 마스터 SEQ
   * @param farmNo - 농장번호
   */
  getReportDetail: `
    /* weekly.weekly.getReportDetail : 보고서 상세 조회 */
    SELECT
        W.MASTER_SEQ,
        W.FARM_NO,
        W.FARM_NM,
        W.OWNER_NM,
        W.STATUS_CD,
        W.SHARE_TOKEN,
        TO_CHAR(TO_DATE(W.TOKEN_EXPIRE_DT, 'YYYYMMDD'), 'YYYY.MM.DD') AS TOKEN_EXPIRE_DT,
        W.REPORT_YEAR,
        W.REPORT_WEEK_NO,
        TO_CHAR(TO_DATE(W.DT_FROM, 'YYYYMMDD'), 'YYYY.MM.DD') AS DT_FROM,
        TO_CHAR(TO_DATE(W.DT_TO, 'YYYYMMDD'), 'YYYY.MM.DD') AS DT_TO,
        W.ALERT_TOTAL,
        W.ALERT_HUBO,
        W.ALERT_EU_MI,
        W.ALERT_SG_MI,
        W.ALERT_BM_DELAY,
        W.ALERT_EU_DELAY,
        W.MODON_REG_CNT,
        W.MODON_SANGSI_CNT,
        W.LAST_GB_CNT,
        W.LAST_GB_SUM,
        W.LAST_BM_CNT,
        W.LAST_BM_TOTAL,
        W.LAST_BM_LIVE,
        W.LAST_BM_DEAD,
        W.LAST_BM_MUMMY,
        W.LAST_BM_SUM_CNT,
        W.LAST_BM_SUM_TOTAL,
        W.LAST_BM_SUM_LIVE,
        W.LAST_BM_AVG_TOTAL,
        W.LAST_BM_AVG_LIVE,
        W.LAST_BM_CHG_TOTAL,
        W.LAST_BM_CHG_LIVE,
        W.LAST_EU_CNT,
        W.LAST_EU_JD_CNT,
        W.LAST_EU_AVG_KG,
        W.LAST_EU_SUM_CNT,
        W.LAST_EU_SUM_JD,
        W.LAST_EU_CHG_KG,
        W.LAST_SG_CNT,
        W.LAST_SG_SUM,
        W.LAST_CL_CNT,
        W.LAST_CL_SUM,
        W.LAST_SH_CNT,
        W.LAST_SH_AVG_KG,
        W.LAST_SH_SUM,
        W.LAST_SH_AVG_SUM,
        W.THIS_GB_SUM,
        W.THIS_IMSIN_SUM,
        W.THIS_BM_SUM,
        W.THIS_EU_SUM,
        W.THIS_VACCINE_SUM,
        W.THIS_SHIP_SUM,
        W.KPI_PSY,
        W.KPI_DELAY_DAY,
        W.PSY_X,
        W.PSY_Y,
        W.PSY_ZONE,
        TO_CHAR(SF_GET_LOCALE_VW_DATE_2022('KOR', M.LOG_INS_DT), 'YYYY.MM.DD') AS LOG_INS_DT
    FROM TS_INS_WEEK W
    INNER JOIN TS_INS_MASTER M ON M.SEQ = W.MASTER_SEQ
    WHERE W.MASTER_SEQ = :masterSeq
      AND W.FARM_NO = :farmNo
  `,

  /**
   * 주간 보고서 상세 서브 데이터
   * @param masterSeq - 마스터 SEQ
   * @param farmNo - 농장번호
   */
  getReportSub: `
    /* weekly.weekly.getReportSub : 보고서 서브 데이터 조회 */
    SELECT
        S.MASTER_SEQ,
        S.FARM_NO,
        S.GUBUN,
        S.SORT_NO,
        S.CODE_1 AS CODE1, S.CODE_2 AS CODE2,
        S.CNT_1 AS CNT1, S.CNT_2 AS CNT2, S.CNT_3 AS CNT3,
        S.CNT_4 AS CNT4, S.CNT_5 AS CNT5, S.CNT_6 AS CNT6,
        S.VAL_1 AS VAL1, S.VAL_2 AS VAL2, S.VAL_3 AS VAL3, S.VAL_4 AS VAL4,
        S.STR_1 AS STR1, S.STR_2 AS STR2
    FROM TS_INS_WEEK_SUB S
    WHERE S.MASTER_SEQ = :masterSeq
      AND S.FARM_NO = :farmNo
    ORDER BY S.GUBUN ASC, S.SORT_NO ASC
  `,

  /**
   * 팝업 서브 데이터 조회 (단일 GUBUN)
   * @param masterSeq - 마스터 SEQ
   * @param farmNo - 농장번호
   * @param gubun - GUBUN 값
   */
  getPopupSub: `
    /* weekly.weekly.getPopupSub : 팝업 서브 데이터 조회 */
    SELECT
        S.MASTER_SEQ,
        S.FARM_NO,
        S.GUBUN,
        S.SORT_NO,
        S.CODE_1 AS CODE1, S.CODE_2 AS CODE2,
        S.CNT_1 AS CNT1, S.CNT_2 AS CNT2, S.CNT_3 AS CNT3,
        S.CNT_4 AS CNT4, S.CNT_5 AS CNT5, S.CNT_6 AS CNT6,
        S.VAL_1 AS VAL1, S.VAL_2 AS VAL2, S.VAL_3 AS VAL3, S.VAL_4 AS VAL4,
        S.STR_1 AS STR1, S.STR_2 AS STR2
    FROM TS_INS_WEEK_SUB S
    WHERE S.MASTER_SEQ = :masterSeq
      AND S.FARM_NO = :farmNo
      AND S.GUBUN = :gubun
    ORDER BY S.SORT_NO ASC
  `,

  /**
   * 팝업 서브 데이터 조회 (LIKE 검색 - 스케줄용)
   * @param masterSeq - 마스터 SEQ
   * @param farmNo - 농장번호
   * @param gubun - GUBUN 패턴 (예: 'SCHEDULE_%')
   */
  getPopupSubLike: `
    /* weekly.weekly.getPopupSubLike : 팝업 서브 데이터 LIKE 조회 */
    SELECT
        S.MASTER_SEQ,
        S.FARM_NO,
        S.GUBUN,
        S.SORT_NO,
        S.CODE_1 AS CODE1, S.CODE_2 AS CODE2,
        S.CNT_1 AS CNT1, S.CNT_2 AS CNT2, S.CNT_3 AS CNT3,
        S.CNT_4 AS CNT4, S.CNT_5 AS CNT5, S.CNT_6 AS CNT6,
        S.VAL_1 AS VAL1, S.VAL_2 AS VAL2, S.VAL_3 AS VAL3, S.VAL_4 AS VAL4,
        S.STR_1 AS STR1, S.STR_2 AS STR2
    FROM TS_INS_WEEK_SUB S
    WHERE S.MASTER_SEQ = :masterSeq
      AND S.FARM_NO = :farmNo
      AND S.GUBUN LIKE :gubun
    ORDER BY S.GUBUN ASC, S.SORT_NO ASC
  `,
};
