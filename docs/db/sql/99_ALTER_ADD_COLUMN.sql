-- ============================================================
-- 컬럼 추가 ALTER 스크립트
-- 기존 테이블에 신규 컬럼 추가 (운영 DB 반영용)
--
-- 실행 순서: 기존 테이블 존재 시에만 실행
-- 대상 Oracle: 19c
-- ============================================================

-- ============================================================
-- 1. TS_INS_JOB_LOG: DAY_GB, REPORT_YEAR, REPORT_WEEK_NO 컬럼 추가
--    대시보드 모니터링 및 주간/월간/분기별 조회 편의를 위해 추가
-- ============================================================

-- 컬럼 존재 여부 확인 후 추가
DECLARE
    V_CNT NUMBER;
BEGIN
    -- DAY_GB 컬럼 존재 여부 확인
    SELECT COUNT(*) INTO V_CNT
    FROM USER_TAB_COLUMNS
    WHERE TABLE_NAME = 'TS_INS_JOB_LOG'
      AND COLUMN_NAME = 'DAY_GB';

    IF V_CNT = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE TS_INS_JOB_LOG ADD (
            DAY_GB          VARCHAR2(10),
            REPORT_YEAR     NUMBER(4),
            REPORT_WEEK_NO  NUMBER(2)
        )';
        DBMS_OUTPUT.PUT_LINE('TS_INS_JOB_LOG: DAY_GB, REPORT_YEAR, REPORT_WEEK_NO 컬럼 추가 완료');
    ELSE
        DBMS_OUTPUT.PUT_LINE('TS_INS_JOB_LOG: DAY_GB 컬럼 이미 존재');
    END IF;
END;
/

-- 컬럼 코멘트 추가
COMMENT ON COLUMN TS_INS_JOB_LOG.DAY_GB IS '기간구분 (WEEK:주간, MON:월간, QT:분기)';
COMMENT ON COLUMN TS_INS_JOB_LOG.REPORT_YEAR IS '리포트 년도';
COMMENT ON COLUMN TS_INS_JOB_LOG.REPORT_WEEK_NO IS '리포트 주차/월/분기';

-- 대시보드 모니터링용 인덱스 추가
DECLARE
    V_CNT NUMBER;
BEGIN
    SELECT COUNT(*) INTO V_CNT
    FROM USER_INDEXES
    WHERE INDEX_NAME = 'IDX_TS_INS_JOB_LOG_05';

    IF V_CNT = 0 THEN
        EXECUTE IMMEDIATE 'CREATE INDEX IDX_TS_INS_JOB_LOG_05 ON TS_INS_JOB_LOG(DAY_GB, REPORT_YEAR, REPORT_WEEK_NO) TABLESPACE PIGXE_IDX';
        DBMS_OUTPUT.PUT_LINE('IDX_TS_INS_JOB_LOG_05 인덱스 생성 완료');
    ELSE
        DBMS_OUTPUT.PUT_LINE('IDX_TS_INS_JOB_LOG_05 인덱스 이미 존재');
    END IF;
END;
/

-- 확인
SELECT COLUMN_NAME, DATA_TYPE, DATA_LENGTH
FROM USER_TAB_COLUMNS
WHERE TABLE_NAME = 'TS_INS_JOB_LOG'
ORDER BY COLUMN_ID;
