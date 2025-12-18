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
};
