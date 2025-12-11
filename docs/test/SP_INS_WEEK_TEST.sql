-- ============================================================
-- SP_INS_WEEK 프로시저 테스트 스크립트
-- 주간 리포트 프로시저를 당일 테스트용으로 실행하는 방법
-- ============================================================

-- ============================================================
-- 방법 1: SP_INS_WEEK_MAIN 테스트 모드 사용 (권장)
-- ============================================================
-- P_TEST_MODE = 'Y' 로 설정하면 오늘 날짜도 포함하여 실행
-- 파라미터: P_DAY_GB, P_BASE_DT, P_PARALLEL_DEGREE, P_TEST_MODE

-- 금주 데이터, 오늘 포함 (병렬도 4)
EXEC SP_INS_WEEK_MAIN('WEEK', NULL, 4, 'Y');

-- 특정 기준일로 테스트 (2024-12-09 기준)
EXEC SP_INS_WEEK_MAIN('WEEK', TO_DATE('2024-12-09', 'YYYY-MM-DD'), 4, 'Y');

-- 현재 날짜 기준 테스트
EXEC SP_INS_WEEK_MAIN('WEEK', SYSDATE, 4, 'Y');


-- ============================================================
-- 방법 2: SP_INS_WEEK_FARM_PROCESS 직접 호출
-- ============================================================
-- 먼저 MASTER 레코드를 수동으로 생성해야 함

DECLARE
    V_MASTER_SEQ NUMBER;
    V_START_DT DATE := TRUNC(SYSDATE, 'IW');  -- 금주 월요일
    V_END_DT DATE := TRUNC(SYSDATE, 'IW') + 6; -- 금주 일요일
    V_FARM_NO VARCHAR2(10) := 'F001';  -- 테스트할 농장 번호
BEGIN
    -- 1. MASTER 레코드 생성 (또는 기존 SEQ 사용)
    INSERT INTO TS_INS_MASTER (
        DAY_GB, ISO_YEAR, ISO_WEEK, START_DT, END_DT,
        STATUS, REG_DT, UPD_DT
    ) VALUES (
        'WEEK',
        TO_NUMBER(TO_CHAR(V_START_DT, 'IYYY')),
        TO_NUMBER(TO_CHAR(V_START_DT, 'IW')),
        V_START_DT,
        V_END_DT,
        'PROCESSING',
        SYSDATE,
        SYSDATE
    ) RETURNING MASTER_SEQ INTO V_MASTER_SEQ;

    DBMS_OUTPUT.PUT_LINE('MASTER_SEQ: ' || V_MASTER_SEQ);

    -- 2. 특정 농장에 대해 SP_INS_WEEK_FARM_PROCESS 직접 호출
    SP_INS_WEEK_FARM_PROCESS(
        P_MASTER_SEQ => V_MASTER_SEQ,
        P_FARM_NO    => V_FARM_NO,
        P_START_DT   => V_START_DT,
        P_END_DT     => V_END_DT
    );

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('SP_INS_WEEK_FARM_PROCESS 완료');
END;
/


-- ============================================================
-- 방법 3: 여러 농장 순차 테스트
-- ============================================================

DECLARE
    V_MASTER_SEQ NUMBER;
    V_START_DT DATE := TRUNC(SYSDATE, 'IW');
    V_END_DT DATE := TRUNC(SYSDATE, 'IW') + 6;
BEGIN
    -- MASTER 레코드 생성
    INSERT INTO TS_INS_MASTER (
        DAY_GB, ISO_YEAR, ISO_WEEK, START_DT, END_DT,
        STATUS, REG_DT, UPD_DT
    ) VALUES (
        'WEEK',
        TO_NUMBER(TO_CHAR(V_START_DT, 'IYYY')),
        TO_NUMBER(TO_CHAR(V_START_DT, 'IW')),
        V_START_DT, V_END_DT,
        'PROCESSING', SYSDATE, SYSDATE
    ) RETURNING MASTER_SEQ INTO V_MASTER_SEQ;

    -- 여러 농장 순차 처리
    FOR REC IN (
        SELECT FARM_NO
        FROM TM_FARM
        WHERE USE_YN = 'Y'
        AND ROWNUM <= 5  -- 테스트용: 5개 농장만
    ) LOOP
        BEGIN
            SP_INS_WEEK_FARM_PROCESS(
                P_MASTER_SEQ => V_MASTER_SEQ,
                P_FARM_NO    => REC.FARM_NO,
                P_START_DT   => V_START_DT,
                P_END_DT     => V_END_DT
            );
            DBMS_OUTPUT.PUT_LINE('완료: ' || REC.FARM_NO);
        EXCEPTION
            WHEN OTHERS THEN
                DBMS_OUTPUT.PUT_LINE('오류 (' || REC.FARM_NO || '): ' || SQLERRM);
        END;
    END LOOP;

    COMMIT;
END;
/


-- ============================================================
-- 결과 확인 쿼리
-- ============================================================

-- MASTER 테이블 확인
SELECT MASTER_SEQ, DAY_GB, ISO_YEAR, ISO_WEEK,
       START_DT, END_DT, STATUS,
       TOTAL_CNT, SUCCESS_CNT, ERROR_CNT,
       REG_DT, UPD_DT
FROM TS_INS_MASTER
WHERE DAY_GB = 'WEEK'
ORDER BY MASTER_SEQ DESC
FETCH FIRST 10 ROWS ONLY;

-- 주간 리포트 데이터 확인 (TS_INS_WEEK)
SELECT w.MASTER_SEQ, w.FARM_NO, w.FARM_NM,
       w.ISO_YEAR, w.ISO_WEEK,
       w.START_DT, w.END_DT,
       w.TOTAL_HEAD, w.AVG_WEIGHT,
       w.FEED_AMOUNT, w.WATER_AMOUNT,
       w.STATUS, w.REG_DT
FROM TS_INS_WEEK w
WHERE w.MASTER_SEQ = (
    SELECT MAX(MASTER_SEQ) FROM TS_INS_MASTER WHERE DAY_GB = 'WEEK'
)
ORDER BY w.FARM_NO;

-- 상세 데이터 확인 (TS_INS_WEEK_SUB)
SELECT s.MASTER_SEQ, s.FARM_NO, s.SUB_SEQ,
       s.DATA_DT, s.HEAD_CNT, s.WEIGHT,
       s.FEED_AMT, s.WATER_AMT,
       s.REG_DT
FROM TS_INS_WEEK_SUB s
WHERE s.MASTER_SEQ = (
    SELECT MAX(MASTER_SEQ) FROM TS_INS_MASTER WHERE DAY_GB = 'WEEK'
)
ORDER BY s.FARM_NO, s.DATA_DT;

-- 에러 로그 확인
SELECT MASTER_SEQ, FARM_NO, ERROR_MSG, ERROR_DT, RETRY_CNT
FROM TS_INS_ERROR_LOG
WHERE MASTER_SEQ = (
    SELECT MAX(MASTER_SEQ) FROM TS_INS_MASTER WHERE DAY_GB = 'WEEK'
)
ORDER BY ERROR_DT DESC;


-- ============================================================
-- 테스트 데이터 정리 (주의: 운영환경에서 실행 금지!)
-- ============================================================

/*
-- 특정 MASTER_SEQ 데이터 삭제
DECLARE
    V_MASTER_SEQ NUMBER := 123;  -- 삭제할 MASTER_SEQ
BEGIN
    DELETE FROM TS_INS_ERROR_LOG WHERE MASTER_SEQ = V_MASTER_SEQ;
    DELETE FROM TS_INS_WEEK_SUB WHERE MASTER_SEQ = V_MASTER_SEQ;
    DELETE FROM TS_INS_WEEK WHERE MASTER_SEQ = V_MASTER_SEQ;
    DELETE FROM TS_INS_MASTER WHERE MASTER_SEQ = V_MASTER_SEQ;
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('삭제 완료: MASTER_SEQ = ' || V_MASTER_SEQ);
END;
/

-- 금주 테스트 데이터 전체 삭제
DELETE FROM TS_INS_ERROR_LOG
WHERE MASTER_SEQ IN (
    SELECT MASTER_SEQ FROM TS_INS_MASTER
    WHERE DAY_GB = 'WEEK'
    AND ISO_YEAR = TO_NUMBER(TO_CHAR(SYSDATE, 'IYYY'))
    AND ISO_WEEK = TO_NUMBER(TO_CHAR(SYSDATE, 'IW'))
);

DELETE FROM TS_INS_WEEK_SUB
WHERE MASTER_SEQ IN (
    SELECT MASTER_SEQ FROM TS_INS_MASTER
    WHERE DAY_GB = 'WEEK'
    AND ISO_YEAR = TO_NUMBER(TO_CHAR(SYSDATE, 'IYYY'))
    AND ISO_WEEK = TO_NUMBER(TO_CHAR(SYSDATE, 'IW'))
);

DELETE FROM TS_INS_WEEK
WHERE MASTER_SEQ IN (
    SELECT MASTER_SEQ FROM TS_INS_MASTER
    WHERE DAY_GB = 'WEEK'
    AND ISO_YEAR = TO_NUMBER(TO_CHAR(SYSDATE, 'IYYY'))
    AND ISO_WEEK = TO_NUMBER(TO_CHAR(SYSDATE, 'IW'))
);

DELETE FROM TS_INS_MASTER
WHERE DAY_GB = 'WEEK'
AND ISO_YEAR = TO_NUMBER(TO_CHAR(SYSDATE, 'IYYY'))
AND ISO_WEEK = TO_NUMBER(TO_CHAR(SYSDATE, 'IW'));

COMMIT;
*/


-- ============================================================
-- SP_INS_WEEK_RETRY_ERROR 테스트
-- ============================================================
-- 에러가 발생한 농장을 재처리

-- 특정 MASTER_SEQ의 에러 농장 재처리
EXEC SP_INS_WEEK_RETRY_ERROR(123);  -- MASTER_SEQ 입력

-- 가장 최근 MASTER의 에러 농장 재처리
DECLARE
    V_MASTER_SEQ NUMBER;
BEGIN
    SELECT MAX(MASTER_SEQ) INTO V_MASTER_SEQ
    FROM TS_INS_MASTER
    WHERE DAY_GB = 'WEEK';

    IF V_MASTER_SEQ IS NOT NULL THEN
        SP_INS_WEEK_RETRY_ERROR(V_MASTER_SEQ);
        DBMS_OUTPUT.PUT_LINE('재처리 완료: MASTER_SEQ = ' || V_MASTER_SEQ);
    END IF;
END;
/
