-- ============================================================
-- INS 성능 최적화 인덱스 추가 스크립트
-- 대상: 운영 DB 대용량 테이블 (TM_LPD_DATA, TB_EU 등)
-- ============================================================

-- 1. TM_LPD_DATA (도축 출하 데이터 - 약 1,000만 건)
-- 용도: 농장별/기간별 출하 실적 조회 및 육성율 계산 성능 향상
CREATE INDEX IDX_TM_LPD_DATA_INS_01 ON TM_LPD_DATA (FARM_NO, DOCHUK_DT) 
TABLESPACE PIGXE_IDX;

-- 2. TB_EU (이유 기록 - 약 1,100만 건)
-- 용도: 농장별/기간별 이유 실적 조회 및 육성율 계산 성능 향상
CREATE INDEX IDX_TB_EU_INS_01 ON TB_EU (FARM_NO, WK_DT) 
TABLESPACE PIGXE_IDX;

-- 인덱스 생성 확인
SELECT INDEX_NAME, TABLE_NAME, COLUMN_NAME, COLUMN_POSITION
FROM USER_IND_COLUMNS
WHERE INDEX_NAME IN ('IDX_TM_LPD_DATA_INS_01', 'IDX_TB_EU_INS_01')
ORDER BY INDEX_NAME, COLUMN_POSITION;
