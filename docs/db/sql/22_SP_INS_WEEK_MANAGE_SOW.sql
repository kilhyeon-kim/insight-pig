-- ============================================================
-- SP_INS_WEEK_MANAGE_SOW: 관리대상 모돈 추출 프로시저
--
-- 시간 원칙:
--   - 저장: SYSDATE (서버시간/UTC)
--   - 기준일: P_DT_TO (전주 일요일 = 리포트 종료일)
--     * 관리대상 계산은 기준일(P_DT_TO) 기준으로 지연일 계산
--   - 다국가 로케일: KOR (+09:00), VNM (+07:00)
--
-- 성능 최적화:
--   - VM_LAST_MODON_SEQ_WK 뷰 대신 WITH절 + MAX(SEQ) 직접 쿼리
--   - TB_MODON(소량)을 드라이빙 테이블로 사용
--   - LEADING, USE_NL 힌트로 조인 순서 최적화
--   - GROUP BY 집계로 LOOP 제거
-- ============================================================

CREATE OR REPLACE PROCEDURE SP_INS_WEEK_MANAGE_SOW (
    /*
    ================================================================
    SP_INS_WEEK_MANAGE_SOW: 관리대상 모돈 추출 프로시저
    ================================================================
    - 용도: 미교배, 분만지연, 이유지연 등 관리대상 모돈 추출
    - 호출: SP_INS_WEEK_MAIN에서 농장별 순차 호출
    - 대상 테이블: TS_INS_FARM (요약), TS_INS_FARM_SUB (상세, GUBUN='ALERT')

    추출 대상:
      1. 미교배 후보돈: (기준일-출생일) - 후보돈초교배일령(140007) >= 0
         - 주의: IN_DT(입사일)가 아닌 BIRTH_DT(출생일) 사용
         - 조건: STATUS_CD='010001', 작업이력 없음
      2. 이유후 미교배: (기준일-이유일) + 1 >= 평균재귀일(140008)
         - 조건: WK_GUBUN='E', DAERI_YN='N' (대리돈 제외)
         - UNION: 작업이력 있는 이유돈 + 전입 이유돈(STATUS_CD='010005')
      3. 사고후 미교배: (기준일-사고일) >= 0
         - 조건: WK_GUBUN='F'
         - UNION: 작업이력 있는 사고돈 + 전입 사고돈(STATUS_CD IN '010006','010007')
      4. 분만지연: (기준일-교배일) - 평균임신기간(140002) >= 0
         - 조건: WK_GUBUN='G' (최종 교배)
      5. 이유지연: (기준일-분만일) - 평균포유기간(140003) >= 0
         - 조건: WK_GUBUN='B' (최종 분만)

    필수 조건 (모든 쿼리 공통):
      - OUT_DT = TO_DATE('9999-12-31', 'YYYY-MM-DD')  -- 미도폐사 모돈
      - USE_YN = 'Y'

    기간별 구분:
      - ~3: 지연일 0~3일
      - 4~7: 지연일 4~7일
      - 8~14: 지연일 8~14일
      - 14~: 지연일 14일 초과
    ================================================================
    */
    P_MASTER_SEQ    IN  NUMBER,         -- 마스터 시퀀스 (FK → TS_INS_MASTER)
    P_JOB_NM        IN  VARCHAR2,       -- JOB명
    P_FARM_NO       IN  INTEGER,        -- 농장번호
    P_LOCALE        IN  VARCHAR2,       -- 로케일 (KOR, VNM) - 다국가 지원
    P_DT_FROM       IN  DATE,           -- 리포트 시작일 (전주 월요일)
    P_DT_TO         IN  DATE            -- 리포트 종료일 (전주 일요일) = 기준일
) AS
    V_LOG_SEQ       NUMBER;
    V_PROC_CNT      INTEGER := 0;
    V_BASE_DT       DATE;               -- 기준일 (P_DT_TO = 전주 일요일)

    -- 농장 설정값 (TC_CODE_SYS 코드 정의)
    V_FIRST_GB_DAY  NUMBER := 240;  -- 후보돈초교배일령 (140007)
    V_AVG_RETURN    NUMBER := 7;    -- 평균재귀일 (140008)
    V_PREG_PERIOD   NUMBER := 115;  -- 평균임신기간 (140002)
    V_WEAN_PERIOD   NUMBER := 21;   -- 평균포유기간 (140003)

    -- 집계 변수
    V_TOTAL_HUBO    INTEGER := 0;   -- 미교배 후보돈
    V_TOTAL_EU_MI   INTEGER := 0;   -- 이유후 미교배
    V_TOTAL_SG_MI   INTEGER := 0;   -- 사고후 미교배
    V_TOTAL_BM_DELAY INTEGER := 0;  -- 분만지연
    V_TOTAL_EU_DELAY INTEGER := 0;  -- 이유지연

    -- 기간별 집계
    V_HUBO_3        INTEGER := 0;
    V_HUBO_7        INTEGER := 0;
    V_HUBO_14       INTEGER := 0;
    V_HUBO_OVER     INTEGER := 0;

    V_EU_MI_3       INTEGER := 0;
    V_EU_MI_7       INTEGER := 0;
    V_EU_MI_14      INTEGER := 0;
    V_EU_MI_OVER    INTEGER := 0;

    V_SG_MI_3       INTEGER := 0;
    V_SG_MI_7       INTEGER := 0;
    V_SG_MI_14      INTEGER := 0;
    V_SG_MI_OVER    INTEGER := 0;

    V_BM_DELAY_3    INTEGER := 0;
    V_BM_DELAY_7    INTEGER := 0;
    V_BM_DELAY_14   INTEGER := 0;
    V_BM_DELAY_OVER INTEGER := 0;

    V_EU_DELAY_3    INTEGER := 0;
    V_EU_DELAY_7    INTEGER := 0;
    V_EU_DELAY_14   INTEGER := 0;
    V_EU_DELAY_OVER INTEGER := 0;

BEGIN
    -- 로그 시작
    SP_INS_COM_LOG_START(P_MASTER_SEQ, P_JOB_NM, 'SP_INS_WEEK_MANAGE_SOW', P_FARM_NO, V_LOG_SEQ);

    -- 기준일 설정: P_DT_TO (전주 일요일) 사용
    V_BASE_DT := TRUNC(P_DT_TO);

    -- 농장 설정값 조회
    BEGIN
        SELECT NVL(MAX(CASE WHEN CODE = '140007' THEN TO_NUMBER(CVALUE) END), 240),
               NVL(MAX(CASE WHEN CODE = '140008' THEN TO_NUMBER(CVALUE) END), 7),
               NVL(MAX(CASE WHEN CODE = '140002' THEN TO_NUMBER(CVALUE) END), 115),
               NVL(MAX(CASE WHEN CODE = '140003' THEN TO_NUMBER(CVALUE) END), 21)
        INTO V_FIRST_GB_DAY, V_AVG_RETURN, V_PREG_PERIOD, V_WEAN_PERIOD
        FROM TC_FARM_CONFIG
        WHERE FARM_NO = P_FARM_NO
          AND CODE IN ('140007', '140008', '140002', '140003');
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            NULL; -- 기본값 사용
    END;

    -- ================================================
    -- 1. 미교배 후보돈 집계 (NOT_GY_HUBO)
    --    조건: STATUS_CD='010001', 작업이력 없음
    --    지연일: (기준일 - 출생일) - 초교배일령
    --    최적화: TB_MODON 드라이빙, DISTINCT 서브쿼리로 작업이력 체크
    -- ================================================
    SELECT NVL(SUM(CASE WHEN DELAY_DAYS <= 3 THEN 1 ELSE 0 END), 0),
           NVL(SUM(CASE WHEN DELAY_DAYS > 3 AND DELAY_DAYS <= 7 THEN 1 ELSE 0 END), 0),
           NVL(SUM(CASE WHEN DELAY_DAYS > 7 AND DELAY_DAYS <= 14 THEN 1 ELSE 0 END), 0),
           NVL(SUM(CASE WHEN DELAY_DAYS > 14 THEN 1 ELSE 0 END), 0),
           NVL(COUNT(*), 0)
    INTO V_HUBO_3, V_HUBO_7, V_HUBO_14, V_HUBO_OVER, V_TOTAL_HUBO
    FROM (
        SELECT /*+ LEADING(MD) */
               (V_BASE_DT - MD.BIRTH_DT) - V_FIRST_GB_DAY AS DELAY_DAYS
        FROM TB_MODON MD
        WHERE MD.FARM_NO = P_FARM_NO
          AND MD.STATUS_CD = '010001'  -- 후보돈
          AND MD.OUT_DT = TO_DATE('9999-12-31', 'YYYY-MM-DD')
          AND MD.USE_YN = 'Y'
          AND MD.IN_DT < V_BASE_DT + 1
          AND (V_BASE_DT - MD.BIRTH_DT) - V_FIRST_GB_DAY >= 0
          AND NOT EXISTS (
              SELECT 1 FROM TB_MODON_WK WK
              WHERE WK.FARM_NO = P_FARM_NO
                AND WK.PIG_NO = MD.PIG_NO
                AND WK.USE_YN = 'Y'
          )
    );

    -- ================================================
    -- 2. 이유후 미교배 집계 (NOT_GY_EU)
    --    조건: WK_GUBUN='E', DAERI_YN='N'
    --    지연일: (기준일 - 이유일) - 평균재귀일 + 1
    --    UNION: 작업이력 있음 + 전입 이유돈
    --    최적화: WITH절로 최종 작업 SEQ 조회 후 조인
    -- ================================================
    SELECT NVL(SUM(OVER3), 0), NVL(SUM(OVER4_7), 0),
           NVL(SUM(OVER8_14), 0), NVL(SUM(OVER14), 0), NVL(SUM(TOT), 0)
    INTO V_EU_MI_3, V_EU_MI_7, V_EU_MI_14, V_EU_MI_OVER, V_TOTAL_EU_MI
    FROM (
        -- 2-1) 작업 정보에서 추출 (WITH절 + MAX(SEQ))
        WITH LAST_WK AS (
            SELECT /*+ INDEX(WK IX_TB_MODON_WK_01) */
                   FARM_NO, PIG_NO, MAX(SEQ) AS MSEQ
            FROM TB_MODON_WK WK
            WHERE WK.FARM_NO = P_FARM_NO
              AND WK.USE_YN = 'Y'
            GROUP BY FARM_NO, PIG_NO
        )
        SELECT /*+ LEADING(MD LW WK) USE_NL(LW WK) */
               SUM(CASE WHEN (V_BASE_DT - TO_DATE(WK.WK_DT, 'YYYYMMDD')) - V_AVG_RETURN + 1 <= 3 THEN 1 ELSE 0 END) AS OVER3,
               SUM(CASE WHEN (V_BASE_DT - TO_DATE(WK.WK_DT, 'YYYYMMDD')) - V_AVG_RETURN + 1 > 3
                         AND (V_BASE_DT - TO_DATE(WK.WK_DT, 'YYYYMMDD')) - V_AVG_RETURN + 1 <= 7 THEN 1 ELSE 0 END) AS OVER4_7,
               SUM(CASE WHEN (V_BASE_DT - TO_DATE(WK.WK_DT, 'YYYYMMDD')) - V_AVG_RETURN + 1 > 7
                         AND (V_BASE_DT - TO_DATE(WK.WK_DT, 'YYYYMMDD')) - V_AVG_RETURN + 1 <= 14 THEN 1 ELSE 0 END) AS OVER8_14,
               SUM(CASE WHEN (V_BASE_DT - TO_DATE(WK.WK_DT, 'YYYYMMDD')) - V_AVG_RETURN + 1 > 14 THEN 1 ELSE 0 END) AS OVER14,
               COUNT(*) AS TOT
        FROM TB_MODON MD
        INNER JOIN LAST_WK LW
            ON LW.FARM_NO = MD.FARM_NO
           AND LW.PIG_NO = MD.PIG_NO
        INNER JOIN TB_MODON_WK WK
            ON WK.FARM_NO = LW.FARM_NO
           AND WK.PIG_NO = LW.PIG_NO
           AND WK.SEQ = LW.MSEQ
        WHERE MD.FARM_NO = P_FARM_NO
          AND MD.OUT_DT = TO_DATE('9999-12-31', 'YYYY-MM-DD')
          AND MD.USE_YN = 'Y'
          AND WK.WK_GUBUN = 'E'
          AND WK.DAERI_YN = 'N'
          AND (V_BASE_DT - TO_DATE(WK.WK_DT, 'YYYYMMDD')) + 1 >= V_AVG_RETURN

        UNION ALL

        -- 2-2) 작업정보 없는 전입된 이유모돈에서 추출
        SELECT /*+ LEADING(MD) */
               SUM(CASE WHEN (V_BASE_DT - MD.LAST_WK_DT) - V_AVG_RETURN <= 3 THEN 1 ELSE 0 END) AS OVER3,
               SUM(CASE WHEN (V_BASE_DT - MD.LAST_WK_DT) - V_AVG_RETURN > 3
                         AND (V_BASE_DT - MD.LAST_WK_DT) - V_AVG_RETURN <= 7 THEN 1 ELSE 0 END) AS OVER4_7,
               SUM(CASE WHEN (V_BASE_DT - MD.LAST_WK_DT) - V_AVG_RETURN > 7
                         AND (V_BASE_DT - MD.LAST_WK_DT) - V_AVG_RETURN <= 14 THEN 1 ELSE 0 END) AS OVER8_14,
               SUM(CASE WHEN (V_BASE_DT - MD.LAST_WK_DT) - V_AVG_RETURN > 14 THEN 1 ELSE 0 END) AS OVER14,
               COUNT(*) AS TOT
        FROM TB_MODON MD
        WHERE MD.FARM_NO = P_FARM_NO
          AND MD.STATUS_CD = '010005'  -- 이유돈
          AND MD.OUT_DT = TO_DATE('9999-12-31', 'YYYY-MM-DD')
          AND MD.USE_YN = 'Y'
          AND MD.IN_DT < V_BASE_DT + 1
          AND (V_BASE_DT - MD.LAST_WK_DT) - V_AVG_RETURN >= 0
          AND NOT EXISTS (
              SELECT 1 FROM TB_MODON_WK WK
              WHERE WK.FARM_NO = P_FARM_NO
                AND WK.PIG_NO = MD.PIG_NO
                AND WK.USE_YN = 'Y'
          )
    );

    -- ================================================
    -- 3. 사고후 미교배 집계 (NOT_GY_SG)
    --    조건: WK_GUBUN='F'
    --    지연일: (기준일 - 사고일)
    --    UNION: 작업이력 있음 + 전입 사고돈
    -- ================================================
    SELECT NVL(SUM(OVER3), 0), NVL(SUM(OVER4_7), 0),
           NVL(SUM(OVER8_14), 0), NVL(SUM(OVER14), 0), NVL(SUM(TOT), 0)
    INTO V_SG_MI_3, V_SG_MI_7, V_SG_MI_14, V_SG_MI_OVER, V_TOTAL_SG_MI
    FROM (
        -- 3-1) 작업 정보에서 추출 (WITH절 + MAX(SEQ))
        WITH LAST_WK AS (
            SELECT /*+ INDEX(WK IX_TB_MODON_WK_01) */
                   FARM_NO, PIG_NO, MAX(SEQ) AS MSEQ
            FROM TB_MODON_WK WK
            WHERE WK.FARM_NO = P_FARM_NO
              AND WK.USE_YN = 'Y'
            GROUP BY FARM_NO, PIG_NO
        )
        SELECT /*+ LEADING(MD LW WK) USE_NL(LW WK) */
               SUM(CASE WHEN (V_BASE_DT - TO_DATE(WK.WK_DT, 'YYYYMMDD')) <= 3 THEN 1 ELSE 0 END) AS OVER3,
               SUM(CASE WHEN (V_BASE_DT - TO_DATE(WK.WK_DT, 'YYYYMMDD')) > 3
                         AND (V_BASE_DT - TO_DATE(WK.WK_DT, 'YYYYMMDD')) <= 7 THEN 1 ELSE 0 END) AS OVER4_7,
               SUM(CASE WHEN (V_BASE_DT - TO_DATE(WK.WK_DT, 'YYYYMMDD')) > 7
                         AND (V_BASE_DT - TO_DATE(WK.WK_DT, 'YYYYMMDD')) <= 14 THEN 1 ELSE 0 END) AS OVER8_14,
               SUM(CASE WHEN (V_BASE_DT - TO_DATE(WK.WK_DT, 'YYYYMMDD')) > 14 THEN 1 ELSE 0 END) AS OVER14,
               COUNT(*) AS TOT
        FROM TB_MODON MD
        INNER JOIN LAST_WK LW
            ON LW.FARM_NO = MD.FARM_NO
           AND LW.PIG_NO = MD.PIG_NO
        INNER JOIN TB_MODON_WK WK
            ON WK.FARM_NO = LW.FARM_NO
           AND WK.PIG_NO = LW.PIG_NO
           AND WK.SEQ = LW.MSEQ
        WHERE MD.FARM_NO = P_FARM_NO
          AND MD.OUT_DT = TO_DATE('9999-12-31', 'YYYY-MM-DD')
          AND MD.USE_YN = 'Y'
          AND WK.WK_GUBUN = 'F'
          AND (V_BASE_DT - TO_DATE(WK.WK_DT, 'YYYYMMDD')) >= 0

        UNION ALL

        -- 3-2) 작업정보 없는 전입된 사고돈에서 추출
        SELECT /*+ LEADING(MD) */
               SUM(CASE WHEN (V_BASE_DT - MD.LAST_WK_DT) <= 3 THEN 1 ELSE 0 END) AS OVER3,
               SUM(CASE WHEN (V_BASE_DT - MD.LAST_WK_DT) > 3
                         AND (V_BASE_DT - MD.LAST_WK_DT) <= 7 THEN 1 ELSE 0 END) AS OVER4_7,
               SUM(CASE WHEN (V_BASE_DT - MD.LAST_WK_DT) > 7
                         AND (V_BASE_DT - MD.LAST_WK_DT) <= 14 THEN 1 ELSE 0 END) AS OVER8_14,
               SUM(CASE WHEN (V_BASE_DT - MD.LAST_WK_DT) > 14 THEN 1 ELSE 0 END) AS OVER14,
               COUNT(*) AS TOT
        FROM TB_MODON MD
        WHERE MD.FARM_NO = P_FARM_NO
          AND MD.STATUS_CD IN ('010006', '010007')  -- 재발돈, 공태돈
          AND MD.OUT_DT = TO_DATE('9999-12-31', 'YYYY-MM-DD')
          AND MD.USE_YN = 'Y'
          AND MD.IN_DT < V_BASE_DT + 1
          AND (V_BASE_DT - MD.LAST_WK_DT) >= 0
          AND NOT EXISTS (
              SELECT 1 FROM TB_MODON_WK WK
              WHERE WK.FARM_NO = P_FARM_NO
                AND WK.PIG_NO = MD.PIG_NO
                AND WK.USE_YN = 'Y'
          )
    );

    -- ================================================
    -- 4. 분만지연 집계 (NOT_BM_GY)
    --    조건: WK_GUBUN='G' (최종 교배)
    --    지연일: (기준일 - 교배일) - 평균임신기간
    --    주의: 원본 SQL에 STATUS_CD 조건 없음 (WK_GUBUN으로만 판단)
    -- ================================================
    SELECT NVL(SUM(CASE WHEN DELAY_DAYS <= 3 THEN 1 ELSE 0 END), 0),
           NVL(SUM(CASE WHEN DELAY_DAYS > 3 AND DELAY_DAYS <= 7 THEN 1 ELSE 0 END), 0),
           NVL(SUM(CASE WHEN DELAY_DAYS > 7 AND DELAY_DAYS <= 14 THEN 1 ELSE 0 END), 0),
           NVL(SUM(CASE WHEN DELAY_DAYS > 14 THEN 1 ELSE 0 END), 0),
           NVL(COUNT(*), 0)
    INTO V_BM_DELAY_3, V_BM_DELAY_7, V_BM_DELAY_14, V_BM_DELAY_OVER, V_TOTAL_BM_DELAY
    FROM (
        WITH LAST_WK AS (
            SELECT /*+ INDEX(WK IX_TB_MODON_WK_01) */
                   FARM_NO, PIG_NO, MAX(SEQ) AS MSEQ
            FROM TB_MODON_WK WK
            WHERE WK.FARM_NO = P_FARM_NO
              AND WK.USE_YN = 'Y'
            GROUP BY FARM_NO, PIG_NO
        )
        SELECT /*+ LEADING(MD LW WK) USE_NL(LW WK) */
               (V_BASE_DT - TO_DATE(WK.WK_DT, 'YYYYMMDD')) - V_PREG_PERIOD AS DELAY_DAYS
        FROM TB_MODON MD
        INNER JOIN LAST_WK LW
            ON LW.FARM_NO = MD.FARM_NO
           AND LW.PIG_NO = MD.PIG_NO
        INNER JOIN TB_MODON_WK WK
            ON WK.FARM_NO = LW.FARM_NO
           AND WK.PIG_NO = LW.PIG_NO
           AND WK.SEQ = LW.MSEQ
        WHERE MD.FARM_NO = P_FARM_NO
          AND MD.OUT_DT = TO_DATE('9999-12-31', 'YYYY-MM-DD')
          AND MD.USE_YN = 'Y'
          AND WK.WK_GUBUN = 'G'  -- 최종 교배
          AND (V_BASE_DT - TO_DATE(WK.WK_DT, 'YYYYMMDD')) - V_PREG_PERIOD >= 0
    );

    -- ================================================
    -- 5. 이유지연 집계 (NOT_EU_BM)
    --    조건: WK_GUBUN='B' (최종 분만)
    --    지연일: (기준일 - 분만일) - 평균포유기간
    --    주의: 원본 SQL에 STATUS_CD 조건 없음 (WK_GUBUN으로만 판단)
    -- ================================================
    SELECT NVL(SUM(CASE WHEN DELAY_DAYS <= 3 THEN 1 ELSE 0 END), 0),
           NVL(SUM(CASE WHEN DELAY_DAYS > 3 AND DELAY_DAYS <= 7 THEN 1 ELSE 0 END), 0),
           NVL(SUM(CASE WHEN DELAY_DAYS > 7 AND DELAY_DAYS <= 14 THEN 1 ELSE 0 END), 0),
           NVL(SUM(CASE WHEN DELAY_DAYS > 14 THEN 1 ELSE 0 END), 0),
           NVL(COUNT(*), 0)
    INTO V_EU_DELAY_3, V_EU_DELAY_7, V_EU_DELAY_14, V_EU_DELAY_OVER, V_TOTAL_EU_DELAY
    FROM (
        WITH LAST_WK AS (
            SELECT /*+ INDEX(WK IX_TB_MODON_WK_01) */
                   FARM_NO, PIG_NO, MAX(SEQ) AS MSEQ
            FROM TB_MODON_WK WK
            WHERE WK.FARM_NO = P_FARM_NO
              AND WK.USE_YN = 'Y'
            GROUP BY FARM_NO, PIG_NO
        )
        SELECT /*+ LEADING(MD LW WK) USE_NL(LW WK) */
               (V_BASE_DT - TO_DATE(WK.WK_DT, 'YYYYMMDD')) - V_WEAN_PERIOD AS DELAY_DAYS
        FROM TB_MODON MD
        INNER JOIN LAST_WK LW
            ON LW.FARM_NO = MD.FARM_NO
           AND LW.PIG_NO = MD.PIG_NO
        INNER JOIN TB_MODON_WK WK
            ON WK.FARM_NO = LW.FARM_NO
           AND WK.PIG_NO = LW.PIG_NO
           AND WK.SEQ = LW.MSEQ
        WHERE MD.FARM_NO = P_FARM_NO
          AND MD.OUT_DT = TO_DATE('9999-12-31', 'YYYY-MM-DD')
          AND MD.USE_YN = 'Y'
          AND WK.WK_GUBUN = 'B'  -- 최종 분만
          AND (V_BASE_DT - TO_DATE(WK.WK_DT, 'YYYYMMDD')) - V_WEAN_PERIOD >= 0
    );

    -- ================================================
    -- 6. TS_INS_FARM 요약 업데이트
    -- ================================================
    UPDATE TS_INS_FARM
    SET ALERT_TOTAL = V_TOTAL_HUBO + V_TOTAL_EU_MI + V_TOTAL_SG_MI + V_TOTAL_BM_DELAY + V_TOTAL_EU_DELAY,
        ALERT_HUBO = V_TOTAL_HUBO,
        ALERT_EU_MI = V_TOTAL_EU_MI,
        ALERT_SG_MI = V_TOTAL_SG_MI,
        ALERT_BM_DELAY = V_TOTAL_BM_DELAY,
        ALERT_EU_DELAY = V_TOTAL_EU_DELAY
    WHERE MASTER_SEQ = P_MASTER_SEQ
      AND FARM_NO = P_FARM_NO;

    -- ================================================
    -- 7. TS_INS_FARM_SUB 상세 데이터 INSERT (GUBUN='ALERT')
    -- ================================================

    -- ~3일 구간
    INSERT INTO TS_INS_FARM_SUB (
        MASTER_SEQ, FARM_NO, GUBUN, SORT_NO, CODE_1,
        CNT_1, CNT_2, CNT_3, CNT_4, CNT_5
    ) VALUES (
        P_MASTER_SEQ, P_FARM_NO, 'ALERT', 1, '~3',
        V_HUBO_3, V_EU_MI_3, V_SG_MI_3, V_BM_DELAY_3, V_EU_DELAY_3
    );
    V_PROC_CNT := V_PROC_CNT + 1;

    -- 4~7일 구간
    INSERT INTO TS_INS_FARM_SUB (
        MASTER_SEQ, FARM_NO, GUBUN, SORT_NO, CODE_1,
        CNT_1, CNT_2, CNT_3, CNT_4, CNT_5
    ) VALUES (
        P_MASTER_SEQ, P_FARM_NO, 'ALERT', 2, '4~7',
        V_HUBO_7, V_EU_MI_7, V_SG_MI_7, V_BM_DELAY_7, V_EU_DELAY_7
    );
    V_PROC_CNT := V_PROC_CNT + 1;

    -- 8~14일 구간
    INSERT INTO TS_INS_FARM_SUB (
        MASTER_SEQ, FARM_NO, GUBUN, SORT_NO, CODE_1,
        CNT_1, CNT_2, CNT_3, CNT_4, CNT_5
    ) VALUES (
        P_MASTER_SEQ, P_FARM_NO, 'ALERT', 3, '8~14',
        V_HUBO_14, V_EU_MI_14, V_SG_MI_14, V_BM_DELAY_14, V_EU_DELAY_14
    );
    V_PROC_CNT := V_PROC_CNT + 1;

    -- 14일~ 구간
    INSERT INTO TS_INS_FARM_SUB (
        MASTER_SEQ, FARM_NO, GUBUN, SORT_NO, CODE_1,
        CNT_1, CNT_2, CNT_3, CNT_4, CNT_5
    ) VALUES (
        P_MASTER_SEQ, P_FARM_NO, 'ALERT', 4, '14~',
        V_HUBO_OVER, V_EU_MI_OVER, V_SG_MI_OVER, V_BM_DELAY_OVER, V_EU_DELAY_OVER
    );
    V_PROC_CNT := V_PROC_CNT + 1;

    COMMIT;

    -- 로그 종료 (성공)
    SP_INS_COM_LOG_END(V_LOG_SEQ, V_PROC_CNT);

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        SP_INS_COM_LOG_ERROR(V_LOG_SEQ, SQLCODE, SQLERRM);
        RAISE;
END SP_INS_WEEK_MANAGE_SOW;
/

-- 프로시저 확인
SELECT OBJECT_NAME, STATUS FROM USER_OBJECTS WHERE OBJECT_NAME = 'SP_INS_WEEK_MANAGE_SOW';
