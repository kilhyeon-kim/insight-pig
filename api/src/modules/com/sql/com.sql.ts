/**
 * 공통 SQL 쿼리
 * - 시스템 전반에서 공유되는 코드성 데이터 조회
 * - 특정 도메인에 종속되지 않는 공통 조회
 */
export const COM_SQL = {
  /**
   * 공통코드 조회
   * @param grpCd 그룹코드
   */
  getCodeList: `
    /* com.com.getCodeList : 공통코드 조회 */
    SELECT
        C.CD,
        C.CD_NM,
        C.CD_DESC,
        C.SORT_NO
    FROM TS_CODE C
    WHERE C.GRP_CD = :grpCd
      AND C.USE_YN = 'Y'
    ORDER BY C.SORT_NO
  `,

  /**
   * TC_CODE_JOHAP 전체 조회 (캐싱용)
   * - 농장별 코드성 데이터 (품종, 도폐사원인 등)
   * @returns PCODE, CODE, CNAME, LANGUAGE_CD
   */
  getAllCodeJohap: `
    /* com.com.getAllCodeJohap : 조합코드 전체 조회 */
    SELECT
        PCODE,
        CODE,
        CNAME,
        LANGUAGE_CD
    FROM TC_CODE_JOHAP
    WHERE USE_YN = 'Y'
    ORDER BY PCODE, SORT_NO
  `,

  /**
   * TC_CODE_SYS 전체 조회 (캐싱용)
   * - 시스템 코드성 데이터 (모돈상태, 작업구분 등)
   * @returns PCODE, CODE, CNAME, CVALUE, LANGUAGE_CD
   */
  getAllCodeSys: `
    /* com.com.getAllCodeSys : 시스템코드 전체 조회 */
    SELECT
        PCODE,
        CODE,
        CNAME,
        CVALUE,
        LANGUAGE_CD
    FROM TC_CODE_SYS
    WHERE USE_YN = 'Y'
    ORDER BY PCODE, SORT_NO
  `,

  /**
   * 농장 언어코드 조회
   * TA_FARM.COUNTRY_CODE → 941 → 942 → 언어코드
   * @param farmNo - 농장번호
   * @returns LANG_CD (ko/en/vi)
   */
  getFarmLangCode: `
    /* com.com.getFarmLangCode : 농장 언어코드 조회 */
    SELECT C2.CVALUE AS LANG_CD
    FROM TA_FARM F
    INNER JOIN TC_CODE_SYS C1
        ON C1.PCODE = '941'
        AND C1.CODE = NVL(F.COUNTRY_CODE, 'KOR')
        AND C1.LANGUAGE_CD = 'ko'
    INNER JOIN TC_CODE_SYS C2
        ON C2.PCODE = '942'
        AND C2.CODE = C1.CVALUE
        AND C2.LANGUAGE_CD = 'ko'
    WHERE F.FARM_NO = :farmNo
  `,

  // ─────────────────────────────────────────────────────────────────────────────
  // 경락가격 실시간 조회 (TM_SISAE_DETAIL)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * 경락가격 통계 조회 (평균/최고/최저)
   * - 전국 탕박 등외제외 평균단가
   * @param dtFrom - 시작일 (YY.MM.DD)
   * @param dtTo - 종료일 (YY.MM.DD)
   */
  getAuctionPriceStats: `
    /* com.com.getAuctionPriceStats : 경락가격 통계 (평균/최고/최저) */
    SELECT
        NVL(ROUND(SUM(AUCTCNT * AUCTAMT) / NULLIF(SUM(AUCTCNT), 0)), 0) AS AVG_PRICE,
        NVL(MAX(AUCTAMT), 0) AS MAX_PRICE,
        NVL(MIN(CASE WHEN AUCTAMT > 0 THEN AUCTAMT END), 0) AS MIN_PRICE,
        :dtFrom || ' ~ ' || :dtTo AS PERIOD
    FROM TM_SISAE_DETAIL
    WHERE ABATTCD = '057016'
      AND START_DT BETWEEN TO_CHAR(TO_DATE(:dtFrom, 'YY.MM.DD'), 'YYYYMMDD')
                       AND TO_CHAR(TO_DATE(:dtTo, 'YY.MM.DD'), 'YYYYMMDD')
      AND GRADE_CD = 'ST'
      AND SKIN_YN = 'Y'
      AND JUDGESEX_CD IS NULL
      AND TO_NUMBER(NVL(AUCTAMT, '0')) > 0
  `,

  /**
   * 경락가격 등급별 일별 조회 (팝업 차트용)
   * - 전국 탕박 (제주제외)
   * - 등급별: 1+, 1, 2, 등외, 등외제외(ST), 평균(T)
   * @param dtFrom - 시작일 (YY.MM.DD)
   * @param dtTo - 종료일 (YY.MM.DD)
   */
  getAuctionPriceByGrade: `
    /* com.com.getAuctionPriceByGrade : 경락가격 등급별 일별 조회 */
    SELECT
        START_DT,
        TO_CHAR(TO_DATE(START_DT, 'YYYYMMDD'), 'MM.DD') AS DT_DISPLAY,
        GRADE_CD,
        ROUND(AUCTAMT) AS PRICE
    FROM TM_SISAE_DETAIL
    WHERE ABATTCD = '057016'
      AND START_DT BETWEEN TO_CHAR(TO_DATE(:dtFrom, 'YY.MM.DD'), 'YYYYMMDD')
                       AND TO_CHAR(TO_DATE(:dtTo, 'YY.MM.DD'), 'YYYYMMDD')
      AND GRADE_CD IN ('029068', '029069', '029070', '029076', 'ST', 'T')
      AND SKIN_YN = 'Y'
      AND JUDGESEX_CD IS NULL
      AND TO_NUMBER(NVL(AUCTAMT, '0')) > 0
    ORDER BY START_DT,
             CASE WHEN GRADE_CD = '029068' THEN 1000
                  WHEN GRADE_CD = '029069' THEN 2000
                  WHEN GRADE_CD = '029070' THEN 3000
                  WHEN GRADE_CD = '029076' THEN 4000
                  WHEN GRADE_CD = 'ST' THEN 5000
                  WHEN GRADE_CD = 'T' THEN 9100
                  ELSE 10
             END
  `,
};
