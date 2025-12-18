-- ============================================================
-- 공통/ETC 테이블 DDL 스크립트
-- INS 및 공통으로 사용되는 부가 테이블
--
-- 실행 순서: 02_TABLE.sql 실행 후 실행
-- 대상 Oracle: 19c
-- ============================================================

-- ============================================================
-- 1. TM_WEATHER: 날씨 테이블
--    - 기상청 API 데이터 저장
--    - TS_INS_WEEK.SIGUNGU_CD 와 조인하여 농장별 날씨 표시
-- ============================================================
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE TM_WEATHER CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

CREATE TABLE TM_WEATHER (
    SEQ             NUMBER NOT NULL,                    -- 일련번호 (PK)
    WK_DATE         VARCHAR2(8) NOT NULL,               -- 날짜 (YYYYMMDD)

    -- 지역 정보
    SIGUNGU_CD      VARCHAR2(10) NOT NULL,              -- 시군구코드 (행정표준코드)
    SIGUNGU_NM      VARCHAR2(100),                      -- 시군구명
    NX              INTEGER NOT NULL,                   -- 기상청 격자 X좌표
    NY              INTEGER NOT NULL,                   -- 기상청 격자 Y좌표

    -- 날씨 데이터
    WEATHER_CD      VARCHAR2(20),                       -- 날씨코드 (sunny, cloudy, rainy, snow 등)
    TEMP_HIGH       NUMBER(4,1),                        -- 최고기온(℃)
    TEMP_LOW        NUMBER(4,1),                        -- 최저기온(℃)
    RAIN_PROB       INTEGER DEFAULT 0,                  -- 강수확률(%)
    HUMIDITY        INTEGER,                            -- 습도(%)
    WIND_SPEED      NUMBER(4,1),                        -- 풍속(m/s)

    -- 관리 컬럼
    LOG_INS_DT      DATE DEFAULT SYSDATE,              -- 생성일 (UTC)

    CONSTRAINT PK_TM_WEATHER PRIMARY KEY (SEQ)
)
TABLESPACE PIGXE_DATA;

-- 인덱스 (시군구코드 + 날짜 기준 조회)
CREATE UNIQUE INDEX UK_TM_WEATHER_01 ON TM_WEATHER(SIGUNGU_CD, WK_DATE) TABLESPACE PIGXE_IDX;
CREATE INDEX IDX_TM_WEATHER_01 ON TM_WEATHER(WK_DATE) TABLESPACE PIGXE_IDX;
CREATE INDEX IDX_TM_WEATHER_02 ON TM_WEATHER(NX, NY, WK_DATE) TABLESPACE PIGXE_IDX;

COMMENT ON TABLE TM_WEATHER IS '기상청 날씨 정보 테이블';
COMMENT ON COLUMN TM_WEATHER.SEQ IS '일련번호';
COMMENT ON COLUMN TM_WEATHER.WK_DATE IS '날짜 (YYYYMMDD)';
COMMENT ON COLUMN TM_WEATHER.SIGUNGU_CD IS '시군구코드 (행정표준코드)';
COMMENT ON COLUMN TM_WEATHER.SIGUNGU_NM IS '시군구명';
COMMENT ON COLUMN TM_WEATHER.NX IS '기상청 격자 X좌표';
COMMENT ON COLUMN TM_WEATHER.NY IS '기상청 격자 Y좌표';
COMMENT ON COLUMN TM_WEATHER.WEATHER_CD IS '날씨코드 (sunny, cloudy, rainy, snow)';
COMMENT ON COLUMN TM_WEATHER.TEMP_HIGH IS '최고기온(℃)';
COMMENT ON COLUMN TM_WEATHER.TEMP_LOW IS '최저기온(℃)';
COMMENT ON COLUMN TM_WEATHER.RAIN_PROB IS '강수확률(%)';
COMMENT ON COLUMN TM_WEATHER.HUMIDITY IS '습도(%)';
COMMENT ON COLUMN TM_WEATHER.WIND_SPEED IS '풍속(m/s)';

-- ============================================================
-- 2. TS_PSY_DELAY_HEATMAP: PSY 히트맵 테이블
--    - 농장별 PSY/입력지연일 분포 히트맵
--    - 전체 농장 대시보드 및 비교 분석용
-- ============================================================
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE TS_PSY_DELAY_HEATMAP CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

CREATE TABLE TS_PSY_DELAY_HEATMAP (
    MASTER_SEQ      NUMBER NOT NULL,                    -- FK → TS_INS_MASTER.SEQ
    X_POS           INTEGER NOT NULL,                   -- X좌표 (0~3: 입력지연일 구간)
    Y_POS           INTEGER NOT NULL,                   -- Y좌표 (0~3: PSY 구간)
    ZONE_CD         VARCHAR2(10),                       -- 구간코드 (1A~4D)
    FARM_CNT        INTEGER DEFAULT 0,                  -- 해당 구간 농장수
    LOG_INS_DT      DATE DEFAULT SYSDATE,              -- 생성일 (UTC)

    CONSTRAINT PK_TS_PSY_DELAY_HEATMAP PRIMARY KEY (MASTER_SEQ, X_POS, Y_POS),
    CONSTRAINT FK_TS_PSY_DELAY_HEATMAP FOREIGN KEY (MASTER_SEQ)
        REFERENCES TS_INS_MASTER(SEQ) ON DELETE CASCADE
)
TABLESPACE PIGXE_DATA;

COMMENT ON TABLE TS_PSY_DELAY_HEATMAP IS 'PSY 히트맵 테이블';
COMMENT ON COLUMN TS_PSY_DELAY_HEATMAP.MASTER_SEQ IS '마스터 일련번호 (FK)';
COMMENT ON COLUMN TS_PSY_DELAY_HEATMAP.X_POS IS 'X좌표 (0~3: 입력지연일 구간)';
COMMENT ON COLUMN TS_PSY_DELAY_HEATMAP.Y_POS IS 'Y좌표 (0~3: PSY 구간)';
COMMENT ON COLUMN TS_PSY_DELAY_HEATMAP.ZONE_CD IS '구간코드 (1A~4D)';
COMMENT ON COLUMN TS_PSY_DELAY_HEATMAP.FARM_CNT IS '해당 구간 농장수';

-- ============================================================
-- 테이블 생성 확인
-- ============================================================
SELECT TABLE_NAME, NUM_ROWS, LAST_ANALYZED
FROM USER_TABLES
WHERE TABLE_NAME IN (
    'TM_WEATHER',
    'TS_PSY_DELAY_HEATMAP'
)
ORDER BY TABLE_NAME;
