/**
 * 인증 관련 SQL 쿼리 모음
 * SQL ID 형식: 서비스.SQL파일.쿼리ID : 설명
 * 파라미터: named parameter (:paramName) - dataSource.query()에 객체로 전달
 */
export const AUTH_SQL = {
  /**
   * 로그인 (회원 조회)
   * @param memberId - 회원 ID
   * @param password - 비밀번호 (해시)
   */
  login: `
    /* auth.auth.login : 회원 로그인 조회 */
    SELECT
        M.MEMBER_ID,
        M.COMPANY_CD,
        M.SOLE_CD,
        M.AGENT_CD,
        M.FARM_NO,
        M.MEMBER_TYPE,
        M.MEMBER_TYPE_D,
        M.NAME,
        M.POSITION,
        M.EMAIL,
        M.HP_NUM,
        M.USE_YN
    FROM TA_MEMBER M
    WHERE M.MEMBER_ID = :memberId
      AND M.PASSWORD = :password
      AND M.USE_YN = 'Y'
  `,

  /**
   * 농장 정보 조회
   * @param farmNo - 농장번호
   */
  getFarm: `
    /* auth.auth.getFarm : 농장 정보 조회 */
    SELECT
        F.FARM_NO,
        F.FARM_NM,
        F.COMPANY_CD,
        F.SOLE_CD,
        F.AGENT_CD,
        F.COUNTRY_CODE,
        F.USE_YN
    FROM TA_FARM F
    WHERE F.FARM_NO = :farmNo
  `,

  /**
   * 서비스 정보 조회 (인사이트피그 서비스 여부 - 현재 유효한 최신 건)
   * PK: FARM_NO + INSPIG_REG_DT - 유효한 최신 건만 조회
   * 주의: DB가 UTC이므로 SYSDATE + 9/24로 KST 변환
   * @param farmNo - 농장번호
   */
  getService: `
    /* auth.auth.getService : 서비스 권한 조회 (유효한 최신 건) */
    SELECT
        S1.FARM_NO,
        S1.INSPIG_YN,
        S1.INSPIG_REG_DT,
        S1.INSPIG_FROM_DT,
        S1.INSPIG_TO_DT,
        S1.INSPIG_STOP_DT,
        S1.WEB_PAY_YN,
        S1.USE_YN
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
   * 마지막 로그인 일시 업데이트
   * @param memberId - 회원 ID
   */
  updateLastLogin: `
    /* auth.auth.updateLastLogin : 로그인 일시 갱신 */
    UPDATE TA_MEMBER M
    SET M.LAST_DT = TRUNC(SYSDATE)
    WHERE M.MEMBER_ID = :memberId
  `,

  /**
   * 회원 ID로 조회
   * @param memberId - 회원 ID
   */
  getMemberById: `
    /* auth.auth.getMemberById : 회원ID로 회원 조회 */
    SELECT
        M.MEMBER_ID,
        M.COMPANY_CD,
        M.SOLE_CD,
        M.AGENT_CD,
        M.FARM_NO,
        M.MEMBER_TYPE,
        M.MEMBER_TYPE_D,
        M.NAME,
        M.POSITION,
        M.EMAIL,
        M.HP_NUM,
        M.USE_YN
    FROM TA_MEMBER M
    WHERE M.MEMBER_ID = :memberId
      AND M.USE_YN = 'Y'
  `,

  /**
   * 농장번호로 회원 조회
   * @param farmNo - 농장번호
   */
  getMemberByFarmNo: `
    /* auth.auth.getMemberByFarmNo : 농장번호로 회원 조회 */
    SELECT
        M.MEMBER_ID,
        M.COMPANY_CD,
        M.SOLE_CD,
        M.AGENT_CD,
        M.FARM_NO,
        M.MEMBER_TYPE,
        M.MEMBER_TYPE_D,
        M.NAME,
        M.POSITION,
        M.EMAIL,
        M.HP_NUM,
        M.USE_YN
    FROM TA_MEMBER M
    WHERE M.FARM_NO = :farmNo
      AND M.USE_YN = 'Y'
  `,
};
