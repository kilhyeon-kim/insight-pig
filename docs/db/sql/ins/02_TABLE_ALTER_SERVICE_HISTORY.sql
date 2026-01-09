-- ============================================================
-- TS_INS_SERVICE 테이블 이력 관리 구조 변경
-- 기존: FARM_NO가 PK (농장당 1건)
-- 변경: FARM_NO + INSPIG_REG_DT 복합키 (농장당 N건 이력 관리)
--
-- 운영 중 최소 변경 방식:
--   0. 기존 데이터 백업
--   1. 기존 PK 제거
--   2. 새 복합 PK 생성 (FARM_NO + INSPIG_REG_DT)
--   3. BIGO 컬럼 추가
--
-- 실행 순서:
--   1. 백업 테이블 생성 (0단계)
--   2. DDL 실행 (1~6단계)
--   3. 문제 발생 시 롤백 스크립트 실행 (맨 하단)
-- ============================================================

-- ============================================================
-- 0. 기존 데이터 백업 (DDL 실행 전 필수!)
-- ============================================================
-- 백업 테이블 생성
CREATE TABLE TS_INS_SERVICE_BK AS SELECT * FROM TS_INS_SERVICE;

-- 백업 확인
SELECT COUNT(*) AS BACKUP_CNT FROM TS_INS_SERVICE_BK;
SELECT COUNT(*) AS ORIGINAL_CNT FROM TS_INS_SERVICE;

-- ============================================================
-- 1. BIGO 컬럼 추가 (없으면)
-- ============================================================
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE TS_INS_SERVICE ADD BIGO VARCHAR2(500)';
    EXECUTE IMMEDIATE 'COMMENT ON COLUMN TS_INS_SERVICE.BIGO IS ''비고''';
EXCEPTION
    WHEN OTHERS THEN NULL;  -- 이미 존재하면 무시
END;
/

-- ============================================================
-- 2. 기존 PK 제거
-- ============================================================
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE TS_INS_WEEK DROP CONSTRAINT FK_TS_INS_WEEK_SERVICE';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE TS_INS_SERVICE DROP CONSTRAINT PK_TS_INS_SERVICE';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

-- ============================================================
-- 3. 새 복합 PK 생성 (FARM_NO + INSPIG_REG_DT)
-- ============================================================
ALTER TABLE TS_INS_SERVICE ADD CONSTRAINT PK_TS_INS_SERVICE
    PRIMARY KEY (FARM_NO, INSPIG_REG_DT);

-- ============================================================
-- 4. 인덱스 추가 (조회 성능용)
-- ============================================================
BEGIN
    EXECUTE IMMEDIATE 'CREATE INDEX IDX_TS_INS_SERVICE_01 ON TS_INS_SERVICE(FARM_NO, INSPIG_REG_DT DESC) TABLESPACE PIGXE_IDX';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'CREATE INDEX IDX_TS_INS_SERVICE_02 ON TS_INS_SERVICE(FARM_NO, INSPIG_FROM_DT, INSPIG_TO_DT) TABLESPACE PIGXE_IDX';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

-- ============================================================
-- 5. 기간 중복 체크 함수 생성
-- ============================================================
CREATE OR REPLACE FUNCTION FN_CHECK_SERVICE_DATE_OVERLAP(
    p_farm_no        IN INTEGER,
    p_from_dt        IN VARCHAR2,
    p_to_dt          IN VARCHAR2,
    p_exclude_reg_dt IN VARCHAR2 DEFAULT NULL  -- 수정시 자기 자신 제외 (INSPIG_REG_DT)
) RETURN VARCHAR2
IS
    v_count NUMBER;
BEGIN
    -- 유효 종료일 = LEAST(INSPIG_TO_DT, NVL(INSPIG_STOP_DT, '99991231'))
    SELECT COUNT(*)
    INTO v_count
    FROM TS_INS_SERVICE
    WHERE FARM_NO = p_farm_no
      AND USE_YN = 'Y'
      AND (p_exclude_reg_dt IS NULL OR INSPIG_REG_DT != p_exclude_reg_dt)
      AND (
          -- 기존 유효기간과 새 기간이 겹치는지 확인
          p_from_dt <= LEAST(INSPIG_TO_DT, NVL(INSPIG_STOP_DT, '99991231'))
          AND p_to_dt >= INSPIG_FROM_DT
      );

    IF v_count > 0 THEN
        RETURN 'Y';  -- 중복 있음
    ELSE
        RETURN 'N';  -- 중복 없음
    END IF;
END;
/

-- ============================================================
-- 6. 현재 유효한 서비스 조회 뷰 (ETL 조회용)
-- ============================================================
CREATE OR REPLACE VIEW VW_INS_SERVICE_ACTIVE AS
SELECT
    S.FARM_NO,
    S.INSPIG_YN,
    S.INSPIG_REG_DT,
    S.INSPIG_FROM_DT,
    S.INSPIG_TO_DT,
    S.INSPIG_STOP_DT,
    S.WEB_PAY_YN,
    S.REG_TYPE,
    S.USE_YN,
    S.BIGO,
    S.LOG_INS_DT,
    S.LOG_UPT_DT,
    -- 유효 종료일 계산
    LEAST(S.INSPIG_TO_DT, NVL(S.INSPIG_STOP_DT, '99991231')) AS EFFECTIVE_TO_DT
FROM TS_INS_SERVICE S
WHERE S.USE_YN = 'Y'
  AND S.INSPIG_YN = 'Y'
  AND S.INSPIG_FROM_DT <= TO_CHAR(SYSDATE, 'YYYYMMDD')
  AND LEAST(S.INSPIG_TO_DT, NVL(S.INSPIG_STOP_DT, '99991231')) >= TO_CHAR(SYSDATE, 'YYYYMMDD')
  -- 같은 농장에 여러 유효 기간이 있을 경우 가장 최근 등록건만 조회
  AND S.INSPIG_REG_DT = (
      SELECT MAX(S2.INSPIG_REG_DT)
      FROM TS_INS_SERVICE S2
      WHERE S2.FARM_NO = S.FARM_NO
        AND S2.USE_YN = 'Y'
        AND S2.INSPIG_YN = 'Y'
        AND S2.INSPIG_FROM_DT <= TO_CHAR(SYSDATE, 'YYYYMMDD')
        AND LEAST(S2.INSPIG_TO_DT, NVL(S2.INSPIG_STOP_DT, '99991231')) >= TO_CHAR(SYSDATE, 'YYYYMMDD')
  );

COMMENT ON TABLE VW_INS_SERVICE_ACTIVE IS '현재 유효한 인사이트피그플랜 서비스 목록 (ETL 조회용)';

-- ============================================================
-- 테이블 변경 확인
-- ============================================================
SELECT COLUMN_NAME, DATA_TYPE, DATA_LENGTH, NULLABLE
FROM USER_TAB_COLUMNS
WHERE TABLE_NAME = 'TS_INS_SERVICE'
ORDER BY COLUMN_ID;

SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE, STATUS
FROM USER_CONSTRAINTS
WHERE TABLE_NAME = 'TS_INS_SERVICE';

-- ============================================================
-- 롤백 스크립트 (문제 발생 시 실행)
-- ============================================================
/*
-- 1. 뷰 삭제
DROP VIEW VW_INS_SERVICE_ACTIVE;

-- 2. 함수 삭제
DROP FUNCTION FN_CHECK_SERVICE_DATE_OVERLAP;

-- 3. 인덱스 삭제
DROP INDEX IDX_TS_INS_SERVICE_01;
DROP INDEX IDX_TS_INS_SERVICE_02;

-- 4. 새 PK 제거
ALTER TABLE TS_INS_SERVICE DROP CONSTRAINT PK_TS_INS_SERVICE;

-- 5. 테이블 TRUNCATE 후 백업 데이터 복원
TRUNCATE TABLE TS_INS_SERVICE;
INSERT INTO TS_INS_SERVICE SELECT * FROM TS_INS_SERVICE_BK;
COMMIT;

-- 6. 원래 PK 복원 (FARM_NO만)
ALTER TABLE TS_INS_SERVICE ADD CONSTRAINT PK_TS_INS_SERVICE PRIMARY KEY (FARM_NO);

-- 7. BIGO 컬럼 삭제 (필요시)
ALTER TABLE TS_INS_SERVICE DROP COLUMN BIGO;

-- 8. 복원 확인
SELECT COUNT(*) FROM TS_INS_SERVICE;

-- 9. 백업 테이블 삭제 (복원 완료 후)
-- DROP TABLE TS_INS_SERVICE_BK;
*/

-- ============================================================
-- 백업 테이블 삭제 (DDL 적용 완료 후 검증 완료 시)
-- ============================================================
-- DROP TABLE TS_INS_SERVICE_BK;
