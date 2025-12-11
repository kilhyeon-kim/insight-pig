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
        F.USE_YN
    FROM TA_FARM F
    WHERE F.FARM_NO = :farmNo
  `,

  /**
   * 서비스 정보 조회 (인사이트피그 서비스 여부)
   * @param farmNo - 농장번호
   */
  getService: `
    /* auth.auth.getService : 서비스 권한 조회 */
    SELECT
        S.FARM_NO,
        S.INSPIG_YN,
        S.INSPIG_REG_DT,
        S.INSPIG_FROM_DT,
        S.INSPIG_TO_DT,
        S.INSPIG_STOP_DT,
        S.WEB_PAY_YN,
        S.USE_YN
    FROM TS_INS_SERVICE S
    WHERE S.FARM_NO = :farmNo
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
