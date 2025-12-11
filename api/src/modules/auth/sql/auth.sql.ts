/**
 * 인증 관련 SQL 쿼리 모음
 */
export const AUTH_SQL = {
  /** 로그인 (회원 조회) */
  login: `
    SELECT
        MEMBER_ID,
        COMPANY_CD,
        SOLE_CD,
        AGENT_CD,
        FARM_NO,
        MEMBER_TYPE,
        MEMBER_TYPE_D,
        NAME,
        POSITION,
        EMAIL,
        HP_NUM,
        USE_YN
    FROM TA_MEMBER
    WHERE MEMBER_ID = :memberId
      AND PASSWORD = :password
      AND USE_YN = 'Y'
  `,

  /** 농장 정보 조회 */
  getFarm: `
    SELECT
        FARM_NO,
        FARM_NM,
        COMPANY_CD,
        SOLE_CD,
        AGENT_CD,
        USE_YN
    FROM TA_FARM
    WHERE FARM_NO = :farmNo
  `,

  /** 서비스 정보 조회 (인사이트피그 서비스 여부) */
  getService: `
    SELECT
        FARM_NO,
        INSPIG_YN,
        INSPIG_REG_DT,
        INSPIG_FROM_DT,
        INSPIG_TO_DT,
        INSPIG_STOP_DT,
        WEB_PAY_YN,
        USE_YN
    FROM TS_INS_SERVICE
    WHERE FARM_NO = :farmNo
  `,

  /** 마지막 로그인 일시 업데이트 */
  updateLastLogin: `
    UPDATE TA_MEMBER
    SET LAST_DT = TRUNC(SYSDATE)
    WHERE MEMBER_ID = :memberId
  `,
};
