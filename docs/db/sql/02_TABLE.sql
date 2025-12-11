-- ============================================================
-- inspig 통계 테이블 DDL 스크립트
-- 인사이트피그플랜(inspig) 주간/월간/분기 리포트용 테이블
--
-- 실행 순서: 00_SEQUENCE.sql 실행 후 실행
-- 대상 Oracle: 19c
--
-- 시간 저장 원칙:
--   - 저장: UTC (SYSDATE) - 글로벌 표준시간으로 저장
--   - 계산/비교: SF_GET_LOCALE_VW_DATE_2022(LOCALE, SYSDATE) - 다국가 로케일
--     * KOR: 한국 +09:00
--     * VNM: 베트남 +07:00
--   - 조회: 필요 시 로케일 변환
-- ============================================================

-- ============================================================
-- 1. TA_SYS_CONFIG: 시스템 설정 테이블 (1 row)
-- ============================================================
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE TA_SYS_CONFIG CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

CREATE TABLE TA_SYS_CONFIG (
    SEQ             NUMBER DEFAULT 1,                   -- 일련번호 (항상 1)
    MODON_HIST_YN   VARCHAR2(1) DEFAULT 'N',            -- 모돈이력제 연계여부
    EKAPE_YN        VARCHAR2(1) DEFAULT 'N',            -- 축평원 연계여부
    INS_SCHEDULE_YN VARCHAR2(1) DEFAULT 'Y',            -- 인사이트피그플랜 스케줄 실행여부
    LOG_INS_DT      DATE DEFAULT SYSDATE,              -- 생성일 (UTC)
    LOG_UPT_DT      DATE DEFAULT SYSDATE,              -- 수정일 (UTC)

    CONSTRAINT PK_TA_SYS_CONFIG PRIMARY KEY (SEQ)
)
TABLESPACE PIGXE_DATA;

COMMENT ON TABLE TA_SYS_CONFIG IS '시스템 설정 테이블';
COMMENT ON COLUMN TA_SYS_CONFIG.SEQ IS '일련번호 (항상 1)';
COMMENT ON COLUMN TA_SYS_CONFIG.MODON_HIST_YN IS '모돈이력제 연계여부 (Y/N)';
COMMENT ON COLUMN TA_SYS_CONFIG.EKAPE_YN IS '축평원 연계여부 (Y/N)';
COMMENT ON COLUMN TA_SYS_CONFIG.INS_SCHEDULE_YN IS '인사이트피그플랜 스케줄 실행여부 (Y/N)';
COMMENT ON COLUMN TA_SYS_CONFIG.LOG_INS_DT IS '생성일';
COMMENT ON COLUMN TA_SYS_CONFIG.LOG_UPT_DT IS '수정일';

-- 초기 데이터
INSERT INTO TA_SYS_CONFIG (SEQ, MODON_HIST_YN, EKAPE_YN, INS_SCHEDULE_YN)
VALUES (1, 'N', 'N', 'Y');
COMMIT;

-- ============================================================
-- 2. TS_INS_SERVICE: 서비스 신청 테이블
-- ============================================================
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE TS_INS_SERVICE CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

CREATE TABLE TS_INS_SERVICE (
    FARM_NO         INTEGER NOT NULL,                   -- 농장번호 (PK, FK)
    INSPIG_YN       VARCHAR2(1) DEFAULT 'N',            -- 서비스 신청여부
    INSPIG_REG_DT   VARCHAR2(8),                        -- 서비스 신청일 (YYYYMMDD)
    INSPIG_FROM_DT  VARCHAR2(8),                        -- 서비스 시작일 (YYYYMMDD)
    INSPIG_TO_DT    VARCHAR2(8),                        -- 서비스 종료일 (YYYYMMDD)
    INSPIG_STOP_DT  VARCHAR2(8),                        -- 서비스 중단일 (YYYYMMDD)
    WEB_PAY_YN      VARCHAR2(1) DEFAULT 'N',            -- 웹결재 여부
    USE_YN          VARCHAR2(1) DEFAULT 'Y',            -- 사용여부
    LOG_INS_DT      DATE DEFAULT SYSDATE,              -- 생성일 (UTC)
    LOG_UPT_DT      DATE DEFAULT SYSDATE,              -- 수정일 (UTC)

    CONSTRAINT PK_TS_INS_SERVICE PRIMARY KEY (FARM_NO),
    CONSTRAINT FK_TS_INS_SERVICE_FARM FOREIGN KEY (FARM_NO)
        REFERENCES TA_FARM(FARM_NO) ON DELETE CASCADE
)
TABLESPACE PIGXE_DATA;

COMMENT ON TABLE TS_INS_SERVICE IS '인사이트피그플랜 서비스 신청 테이블';
COMMENT ON COLUMN TS_INS_SERVICE.FARM_NO IS '농장번호';
COMMENT ON COLUMN TS_INS_SERVICE.INSPIG_YN IS '서비스 신청여부 (Y/N)';
COMMENT ON COLUMN TS_INS_SERVICE.INSPIG_REG_DT IS '서비스 신청일 (YYYYMMDD)';
COMMENT ON COLUMN TS_INS_SERVICE.INSPIG_FROM_DT IS '서비스 시작일 (YYYYMMDD)';
COMMENT ON COLUMN TS_INS_SERVICE.INSPIG_TO_DT IS '서비스 종료일 (YYYYMMDD)';
COMMENT ON COLUMN TS_INS_SERVICE.INSPIG_STOP_DT IS '서비스 중단일 (YYYYMMDD)';
COMMENT ON COLUMN TS_INS_SERVICE.WEB_PAY_YN IS '웹결재 여부 (Y/N)';
COMMENT ON COLUMN TS_INS_SERVICE.USE_YN IS '사용여부 (Y/N)';
COMMENT ON COLUMN TS_INS_SERVICE.LOG_INS_DT IS '생성일';
COMMENT ON COLUMN TS_INS_SERVICE.LOG_UPT_DT IS '수정일';

-- ============================================================
-- 3. TS_INS_MASTER: 리포트 생성 마스터 테이블
-- ============================================================
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE TS_INS_MASTER CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

CREATE TABLE TS_INS_MASTER (
    SEQ             NUMBER NOT NULL,                    -- 일련번호 (시퀀스, PK)
    DAY_GB          VARCHAR2(10) NOT NULL,              -- 기간구분: WEEK, MON, QT
    INS_DT          CHAR(8) NOT NULL,                   -- 생성기준일 (YYYYMMDD)

    -- 기간 정보
    REPORT_YEAR     NUMBER(4) NOT NULL,                 -- 년도
    REPORT_WEEK_NO  NUMBER(2) NOT NULL,                 -- 주차 (1~53) / 월 (1~12)
    DT_FROM         VARCHAR2(8) NOT NULL,               -- 리포트 시작일 (YYYYMMDD)
    DT_TO           VARCHAR2(8) NOT NULL,               -- 리포트 종료일 (YYYYMMDD)

    -- 대상 및 실행 현황
    TARGET_CNT      INTEGER DEFAULT 0,                  -- 대상 농장수
    COMPLETE_CNT    INTEGER DEFAULT 0,                  -- 실행완료 농장수
    ERROR_CNT       INTEGER DEFAULT 0,                  -- 오류 농장수

    -- 생성 상태
    STATUS_CD       VARCHAR2(10) DEFAULT 'READY',       -- READY, RUNNING, COMPLETE, ERROR
    START_DT        DATE,                               -- 실행 시작일시
    END_DT          DATE,                               -- 실행 종료일시
    ELAPSED_SEC     INTEGER DEFAULT 0,                  -- 실행 소요시간(초)

    -- 관리 컬럼
    LOG_INS_DT      DATE DEFAULT SYSDATE,              -- 생성일 (UTC)

    CONSTRAINT PK_TS_INS_MASTER PRIMARY KEY (SEQ)
)
TABLESPACE PIGXE_DATA;

-- 인덱스: 중복 체크용 (DAY_GB + 년도 + 주차)
CREATE UNIQUE INDEX UK_TS_INS_MASTER_01 ON TS_INS_MASTER(DAY_GB, REPORT_YEAR, REPORT_WEEK_NO) TABLESPACE PIGXE_IDX;
CREATE INDEX IDX_TS_INS_MASTER_01 ON TS_INS_MASTER(DAY_GB, INS_DT) TABLESPACE PIGXE_IDX;
CREATE INDEX IDX_TS_INS_MASTER_02 ON TS_INS_MASTER(STATUS_CD) TABLESPACE PIGXE_IDX;

COMMENT ON TABLE TS_INS_MASTER IS '리포트 생성 마스터 테이블';
COMMENT ON COLUMN TS_INS_MASTER.SEQ IS '일련번호';
COMMENT ON COLUMN TS_INS_MASTER.DAY_GB IS '기간구분 (WEEK:주간, MON:월간, QT:분기)';
COMMENT ON COLUMN TS_INS_MASTER.INS_DT IS '생성기준일 (YYYYMMDD)';
COMMENT ON COLUMN TS_INS_MASTER.REPORT_YEAR IS '년도';
COMMENT ON COLUMN TS_INS_MASTER.REPORT_WEEK_NO IS '주차 (1~53) 또는 월 (1~12)';
COMMENT ON COLUMN TS_INS_MASTER.DT_FROM IS '리포트 시작일 (YYYYMMDD)';
COMMENT ON COLUMN TS_INS_MASTER.DT_TO IS '리포트 종료일 (YYYYMMDD)';
COMMENT ON COLUMN TS_INS_MASTER.TARGET_CNT IS '대상 농장수';
COMMENT ON COLUMN TS_INS_MASTER.COMPLETE_CNT IS '실행완료 농장수';
COMMENT ON COLUMN TS_INS_MASTER.ERROR_CNT IS '오류 농장수';
COMMENT ON COLUMN TS_INS_MASTER.STATUS_CD IS '상태 (READY:대기, RUNNING:실행중, COMPLETE:완료, ERROR:오류)';
COMMENT ON COLUMN TS_INS_MASTER.START_DT IS '실행 시작일시';
COMMENT ON COLUMN TS_INS_MASTER.END_DT IS '실행 종료일시';
COMMENT ON COLUMN TS_INS_MASTER.ELAPSED_SEC IS '실행 소요시간(초)';

-- ============================================================
-- 4. TS_INS_JOB_LOG: 스케줄러 실행 로그 테이블
--    주의: 당일 로그만 유지 (매일 전일 로그 삭제)
-- ============================================================
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE TS_INS_JOB_LOG CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

CREATE TABLE TS_INS_JOB_LOG (
    SEQ             NUMBER NOT NULL,                    -- 일련번호 (PK)
    MASTER_SEQ      NUMBER,                             -- 마스터 일련번호 (FK, NULL 허용)
    JOB_NM          VARCHAR2(50) NOT NULL,              -- JOB 이름
    PROC_NM         VARCHAR2(50) NOT NULL,              -- 프로시저명
    FARM_NO         INTEGER,                            -- 농장번호 (NULL=전체)

    -- 리포트 기준 정보 (조회/모니터링 편의용)
    DAY_GB          VARCHAR2(10),                       -- 기간구분 (WEEK, MON, QT)
    REPORT_YEAR     NUMBER(4),                          -- 리포트 년도
    REPORT_WEEK_NO  NUMBER(2),                          -- 리포트 주차/월/분기

    -- 실행 상태
    STATUS_CD       VARCHAR2(10) DEFAULT 'RUNNING',     -- RUNNING, SUCCESS, ERROR
    START_DT        DATE NOT NULL,                      -- 시작일시
    END_DT          DATE,                               -- 종료일시
    ELAPSED_MS      INTEGER DEFAULT 0,                  -- 소요시간(ms)

    -- 처리 결과
    PROC_CNT        INTEGER DEFAULT 0,                  -- 처리 건수
    ERROR_CD        VARCHAR2(20),                       -- 오류 코드
    ERROR_MSG       VARCHAR2(4000),                     -- 오류 메시지

    -- 관리 컬럼
    LOG_INS_DT      DATE DEFAULT SYSDATE,              -- 생성일 (UTC)

    CONSTRAINT PK_TS_INS_JOB_LOG PRIMARY KEY (SEQ)
)
TABLESPACE PIGXE_DATA;

-- 인덱스
CREATE INDEX IDX_TS_INS_JOB_LOG_01 ON TS_INS_JOB_LOG(MASTER_SEQ) TABLESPACE PIGXE_IDX;
CREATE INDEX IDX_TS_INS_JOB_LOG_02 ON TS_INS_JOB_LOG(JOB_NM, START_DT) TABLESPACE PIGXE_IDX;
CREATE INDEX IDX_TS_INS_JOB_LOG_03 ON TS_INS_JOB_LOG(STATUS_CD, START_DT) TABLESPACE PIGXE_IDX;
CREATE INDEX IDX_TS_INS_JOB_LOG_04 ON TS_INS_JOB_LOG(MASTER_SEQ, FARM_NO, STATUS_CD) TABLESPACE PIGXE_IDX;
CREATE INDEX IDX_TS_INS_JOB_LOG_05 ON TS_INS_JOB_LOG(DAY_GB, REPORT_YEAR, REPORT_WEEK_NO) TABLESPACE PIGXE_IDX;  -- 대시보드 모니터링용

COMMENT ON TABLE TS_INS_JOB_LOG IS '스케줄러 실행 로그 테이블 (6개월 보관)';
COMMENT ON COLUMN TS_INS_JOB_LOG.SEQ IS '일련번호';
COMMENT ON COLUMN TS_INS_JOB_LOG.MASTER_SEQ IS '마스터 일련번호';
COMMENT ON COLUMN TS_INS_JOB_LOG.JOB_NM IS 'JOB 이름';
COMMENT ON COLUMN TS_INS_JOB_LOG.PROC_NM IS '프로시저명';
COMMENT ON COLUMN TS_INS_JOB_LOG.FARM_NO IS '농장번호 (NULL=전체)';
COMMENT ON COLUMN TS_INS_JOB_LOG.DAY_GB IS '기간구분 (WEEK:주간, MON:월간, QT:분기)';
COMMENT ON COLUMN TS_INS_JOB_LOG.REPORT_YEAR IS '리포트 년도';
COMMENT ON COLUMN TS_INS_JOB_LOG.REPORT_WEEK_NO IS '리포트 주차/월/분기';
COMMENT ON COLUMN TS_INS_JOB_LOG.STATUS_CD IS '상태 (RUNNING:실행중, SUCCESS:성공, ERROR:오류)';
COMMENT ON COLUMN TS_INS_JOB_LOG.START_DT IS '시작일시';
COMMENT ON COLUMN TS_INS_JOB_LOG.END_DT IS '종료일시';
COMMENT ON COLUMN TS_INS_JOB_LOG.ELAPSED_MS IS '소요시간(ms)';
COMMENT ON COLUMN TS_INS_JOB_LOG.PROC_CNT IS '처리 건수';
COMMENT ON COLUMN TS_INS_JOB_LOG.ERROR_CD IS '오류 코드';
COMMENT ON COLUMN TS_INS_JOB_LOG.ERROR_MSG IS '오류 메시지';

-- ============================================================
-- 5. TS_INS_WEEK: 주간 리포트 테이블
--    - 주간 리포트 전용 (월간: TS_INS_MON, 분기: TS_INS_QT 별도)
-- ============================================================
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE TS_INS_WEEK CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

CREATE TABLE TS_INS_WEEK (
    MASTER_SEQ      NUMBER NOT NULL,                    -- FK → TS_INS_MASTER.SEQ
    FARM_NO         INTEGER NOT NULL,                   -- FK → TS_INS_SERVICE.FARM_NO

    -- 기간 정보
    REPORT_YEAR     NUMBER(4),                          -- 년도
    REPORT_WEEK_NO  NUMBER(2),                          -- 주차 (1~53) / 월 (1~12)
    DT_FROM         VARCHAR2(8),                        -- 시작일 (YYYYMMDD)
    DT_TO           VARCHAR2(8),                        -- 종료일 (YYYYMMDD)

    -- 헤더 정보
    FARM_NM         VARCHAR2(100),                      -- 농장명
    OWNER_NM        VARCHAR2(50),                       -- 대표자명

    -- 위치 정보 (날씨 조회용)
    SIGUNGU_CD      VARCHAR2(10),                       -- 시군구코드 (TM_WEATHER 조인용)

    -- 모돈 현황 (lastWeek.modon)
    MODON_REG_CNT   INTEGER DEFAULT 0,                  -- 현재모돈(등록모돈수)
    MODON_SANGSI_CNT INTEGER DEFAULT 0,                 -- 상시모돈수

    -- 관리대상 모돈 요약 (alertMd)
    ALERT_TOTAL     INTEGER DEFAULT 0,                  -- 관리대상 합계
    ALERT_HUBO      INTEGER DEFAULT 0,                  -- 미교배 후보돈
    ALERT_EU_MI     INTEGER DEFAULT 0,                  -- 이유후 미교배
    ALERT_SG_MI     INTEGER DEFAULT 0,                  -- 사고후 미교배
    ALERT_BM_DELAY  INTEGER DEFAULT 0,                  -- 교배후 분만지연
    ALERT_EU_DELAY  INTEGER DEFAULT 0,                  -- 분만후 이유지연

    -- 지난주 교배 실적 (lastWeek.mating)
    LAST_GB_CNT     INTEGER DEFAULT 0,                  -- 교배 복수
    LAST_GB_SUM     INTEGER DEFAULT 0,                  -- 교배 누계

    -- 지난주 분만 실적 (lastWeek.farrowing)
    LAST_BM_CNT     INTEGER DEFAULT 0,                  -- 분만 복수
    LAST_BM_TOTAL   INTEGER DEFAULT 0,                  -- 총산자수
    LAST_BM_LIVE    INTEGER DEFAULT 0,                  -- 실산자수
    LAST_BM_DEAD    INTEGER DEFAULT 0,                  -- 사산
    LAST_BM_MUMMY   INTEGER DEFAULT 0,                  -- 미라
    LAST_BM_SUM_CNT INTEGER DEFAULT 0,                  -- 분만 누계 복수
    LAST_BM_SUM_TOTAL INTEGER DEFAULT 0,                -- 총산 누계
    LAST_BM_SUM_LIVE INTEGER DEFAULT 0,                 -- 실산 누계
    LAST_BM_AVG_TOTAL NUMBER(5,1) DEFAULT 0,            -- 총산 평균
    LAST_BM_AVG_LIVE NUMBER(5,1) DEFAULT 0,             -- 실산 평균
    LAST_BM_CHG_TOTAL NUMBER(5,1) DEFAULT 0,            -- 총산 증감 (1년평균 대비)
    LAST_BM_CHG_LIVE NUMBER(5,1) DEFAULT 0,             -- 실산 증감

    -- 지난주 이유 실적 (lastWeek.weaning)
    LAST_EU_CNT     INTEGER DEFAULT 0,                  -- 이유 복수
    LAST_EU_JD_CNT  INTEGER DEFAULT 0,                  -- 이유자돈수
    LAST_EU_AVG_KG  NUMBER(5,1) DEFAULT 0,              -- 평균체중
    LAST_EU_SUM_CNT INTEGER DEFAULT 0,                  -- 이유 누계 복수
    LAST_EU_SUM_JD  INTEGER DEFAULT 0,                  -- 이유자돈 누계
    LAST_EU_CHG_KG  NUMBER(5,1) DEFAULT 0,              -- 평균체중 증감

    -- 지난주 임신사고 (lastWeek.accident)
    LAST_SG_CNT     INTEGER DEFAULT 0,                  -- 사고 두수
    LAST_SG_SUM     INTEGER DEFAULT 0,                  -- 사고 누계

    -- 지난주 도태폐사 (lastWeek.culling)
    LAST_CL_CNT     INTEGER DEFAULT 0,                  -- 도폐 두수
    LAST_CL_SUM     INTEGER DEFAULT 0,                  -- 도폐 누계

    -- 지난주 출하 실적 (lastWeek.shipment)
    LAST_SH_CNT     INTEGER DEFAULT 0,                  -- 출하 두수
    LAST_SH_AVG_KG  NUMBER(5,1) DEFAULT 0,              -- 평균 도체중
    LAST_SH_SUM     INTEGER DEFAULT 0,                  -- 출하 누계
    LAST_SH_AVG_SUM NUMBER(5,1) DEFAULT 0,              -- 평균 도체중 누계

    -- 금주 예정 요약 (thisWeek.calendarGrid)
    THIS_GB_SUM     INTEGER DEFAULT 0,                  -- 교배 예정 합계
    THIS_IMSIN_SUM  INTEGER DEFAULT 0,                  -- 임신확인 예정 합계
    THIS_BM_SUM     INTEGER DEFAULT 0,                  -- 분만 예정 합계
    THIS_EU_SUM     INTEGER DEFAULT 0,                  -- 이유 예정 합계
    THIS_VACCINE_SUM INTEGER DEFAULT 0,                 -- 백신 예정 합계
    THIS_SHIP_SUM   INTEGER DEFAULT 0,                  -- 출하 예정 합계

    -- KPI 요약
    KPI_PSY         NUMBER(5,1) DEFAULT 0,              -- PSY
    KPI_DELAY_DAY   INTEGER DEFAULT 0,                  -- 입력지연일

    -- PSY 히트맵 위치 (TS_PSY_DELAY_HEATMAP 참조)
    PSY_X           INTEGER DEFAULT 0,                  -- 히트맵 X좌표 (0~3: 입력지연일 구간)
    PSY_Y           INTEGER DEFAULT 0,                  -- 히트맵 Y좌표 (0~3: PSY 구간)
    PSY_ZONE        VARCHAR2(10),                       -- 구간코드 (1A~4D)

    -- 생성 상태
    STATUS_CD       VARCHAR2(10) DEFAULT 'READY',       -- READY, RUNNING, COMPLETE, ERROR

    -- 공유 토큰 (외부 URL 공유용)
    SHARE_TOKEN     VARCHAR2(64),                       -- SHA256 해시 토큰 (64자)
    TOKEN_EXPIRE_DT VARCHAR2(8),                        -- 토큰 만료일 (YYYYMMDD, 생성일 + 7일)

    -- 관리 컬럼
    LOG_INS_DT      DATE DEFAULT SYSDATE,              -- 생성일 (UTC)

    CONSTRAINT PK_TS_INS_WEEK PRIMARY KEY (MASTER_SEQ, FARM_NO),
    CONSTRAINT FK_TS_INS_WEEK_MASTER FOREIGN KEY (MASTER_SEQ)
        REFERENCES TS_INS_MASTER(SEQ) ON DELETE CASCADE,
    CONSTRAINT FK_TS_INS_WEEK_SERVICE FOREIGN KEY (FARM_NO)
        REFERENCES TS_INS_SERVICE(FARM_NO)
)
TABLESPACE PIGXE_DATA;

-- 인덱스
CREATE INDEX IDX_TS_INS_WEEK_01 ON TS_INS_WEEK(FARM_NO, MASTER_SEQ) TABLESPACE PIGXE_IDX;
CREATE INDEX IDX_TS_INS_WEEK_02 ON TS_INS_WEEK(FARM_NO, REPORT_YEAR, REPORT_WEEK_NO) TABLESPACE PIGXE_IDX;
CREATE UNIQUE INDEX UK_TS_INS_WEEK_TOKEN ON TS_INS_WEEK(SHARE_TOKEN) TABLESPACE PIGXE_IDX;

COMMENT ON TABLE TS_INS_WEEK IS '주간 리포트 테이블';
COMMENT ON COLUMN TS_INS_WEEK.MASTER_SEQ IS '마스터 일련번호 (FK → TS_INS_MASTER)';
COMMENT ON COLUMN TS_INS_WEEK.FARM_NO IS '농장번호 (FK → TS_INS_SERVICE)';
COMMENT ON COLUMN TS_INS_WEEK.STATUS_CD IS '상태 (READY:대기, RUNNING:실행중, COMPLETE:완료, ERROR:오류)';
COMMENT ON COLUMN TS_INS_WEEK.SHARE_TOKEN IS '공유용 토큰 (SHA256 해시, 64자)';
COMMENT ON COLUMN TS_INS_WEEK.TOKEN_EXPIRE_DT IS '토큰 만료일 (YYYYMMDD, 생성일 + 7일)';

-- ============================================================
-- 6. TS_INS_WEEK_SUB: 리포트 상세 테이블 (팝업 데이터)
-- ============================================================
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE TS_INS_WEEK_SUB CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

CREATE TABLE TS_INS_WEEK_SUB (
    MASTER_SEQ      NUMBER NOT NULL,                    -- FK → TS_INS_MASTER.SEQ
    FARM_NO         INTEGER NOT NULL,                   -- 농장번호
    GUBUN           VARCHAR2(20) NOT NULL,              -- 데이터 구분
    SORT_NO         INTEGER DEFAULT 0,                  -- 정렬순서

    -- 공통 코드 컬럼 (용도에 따라 다르게 사용)
    CODE_1          VARCHAR2(30),                       -- 1차 구분코드 (산차, 기간, 유형 등)
    CODE_2          VARCHAR2(30),                       -- 2차 구분코드 (그룹, 상세유형 등)

    -- 숫자형 데이터 (용도에 따라 다르게 사용)
    CNT_1           INTEGER DEFAULT 0,                  -- 카운트1 (두수, 합계 등)
    CNT_2           INTEGER DEFAULT 0,                  -- 카운트2
    CNT_3           INTEGER DEFAULT 0,                  -- 카운트3
    CNT_4           INTEGER DEFAULT 0,                  -- 카운트4
    CNT_5           INTEGER DEFAULT 0,                  -- 카운트5
    CNT_6           INTEGER DEFAULT 0,                  -- 카운트6

    -- 수치형 데이터
    VAL_1           NUMBER(10,2) DEFAULT 0,             -- 값1 (평균, 비율 등)
    VAL_2           NUMBER(10,2) DEFAULT 0,             -- 값2
    VAL_3           NUMBER(10,2) DEFAULT 0,             -- 값3
    VAL_4           NUMBER(10,2) DEFAULT 0,             -- 값4

    -- 문자형 데이터
    STR_1           VARCHAR2(100),                      -- 문자열1 (명칭, 색상 등)
    STR_2           VARCHAR2(100),                      -- 문자열2

    -- 관리 컬럼
    LOG_INS_DT      DATE DEFAULT SYSDATE,              -- 생성일 (UTC)

    CONSTRAINT PK_TS_INS_WEEK_SUB PRIMARY KEY (MASTER_SEQ, FARM_NO, GUBUN, SORT_NO),
    CONSTRAINT FK_TS_INS_WEEK_SUB FOREIGN KEY (MASTER_SEQ, FARM_NO)
        REFERENCES TS_INS_WEEK(MASTER_SEQ, FARM_NO) ON DELETE CASCADE
)
TABLESPACE PIGXE_DATA;

-- 인덱스
CREATE INDEX IDX_TS_INS_WEEK_SUB_01 ON TS_INS_WEEK_SUB(MASTER_SEQ, FARM_NO, GUBUN) TABLESPACE PIGXE_IDX;

COMMENT ON TABLE TS_INS_WEEK_SUB IS '리포트 상세 테이블 (팝업 데이터)';
COMMENT ON COLUMN TS_INS_WEEK_SUB.MASTER_SEQ IS '마스터 일련번호 (FK)';
COMMENT ON COLUMN TS_INS_WEEK_SUB.FARM_NO IS '농장번호';
COMMENT ON COLUMN TS_INS_WEEK_SUB.GUBUN IS '데이터 구분코드';
COMMENT ON COLUMN TS_INS_WEEK_SUB.SORT_NO IS '정렬순서';
COMMENT ON COLUMN TS_INS_WEEK_SUB.CODE_1 IS '1차 구분코드';
COMMENT ON COLUMN TS_INS_WEEK_SUB.CODE_2 IS '2차 구분코드';

-- ============================================================
-- 7. TS_PSY_DELAY_HEATMAP: PSY 히트맵 테이블
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
-- 8. TM_WEATHER: 날씨 테이블
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
-- 9. TS_INS_MGMT: 관리포인트 테이블
-- ============================================================
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE TS_INS_MGMT CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

CREATE TABLE TS_INS_MGMT (
    MASTER_SEQ      NUMBER NOT NULL,                    -- FK → TS_INS_MASTER.SEQ
    MGMT_TYPE       VARCHAR2(20) NOT NULL,              -- 유형: HIGHLIGHT, RECOMMEND
    SORT_NO         INTEGER DEFAULT 0,                  -- 정렬순서
    CONTENT         VARCHAR2(500) NOT NULL,             -- 내용
    LINK_URL        VARCHAR2(500),                      -- 링크 URL (선택)
    LOG_INS_DT      DATE DEFAULT SYSDATE,              -- 생성일 (UTC)

    CONSTRAINT PK_TS_INS_MGMT PRIMARY KEY (MASTER_SEQ, MGMT_TYPE, SORT_NO),
    CONSTRAINT FK_TS_INS_MGMT FOREIGN KEY (MASTER_SEQ)
        REFERENCES TS_INS_MASTER(SEQ) ON DELETE CASCADE
)
TABLESPACE PIGXE_DATA;

-- 인덱스
CREATE INDEX IDX_TS_INS_MGMT_01 ON TS_INS_MGMT(MASTER_SEQ, MGMT_TYPE) TABLESPACE PIGXE_IDX;

COMMENT ON TABLE TS_INS_MGMT IS '주간 관리포인트 테이블';
COMMENT ON COLUMN TS_INS_MGMT.MASTER_SEQ IS '마스터 일련번호 (FK)';
COMMENT ON COLUMN TS_INS_MGMT.MGMT_TYPE IS '유형 (HIGHLIGHT: 주요포인트, RECOMMEND: 추천콘텐츠)';
COMMENT ON COLUMN TS_INS_MGMT.SORT_NO IS '정렬순서';
COMMENT ON COLUMN TS_INS_MGMT.CONTENT IS '내용';
COMMENT ON COLUMN TS_INS_MGMT.LINK_URL IS '링크 URL';

-- ============================================================
-- 10. TS_INS_ACCESS_LOG: 접속 로그 테이블
--     - 로그인, 메뉴, 보고서 접속 로그 통합 관리
--     - 보관기간: 1년 (파티션 권장)
-- ============================================================
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE TS_INS_ACCESS_LOG CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

CREATE TABLE TS_INS_ACCESS_LOG (
    SEQ             NUMBER NOT NULL,                    -- 일련번호 (PK)

    -- 사용자 정보 (필수)
    MEMBER_ID       VARCHAR2(40) NOT NULL,              -- 회원ID
    FARM_NO         INTEGER NOT NULL,                   -- 농장번호

    -- 접속 유형 구분
    LOG_TYPE        VARCHAR2(20) NOT NULL,              -- 로그유형: LOGIN, LOGOUT, MENU, REPORT

    -- LOG_TYPE 코드:
    --   - LOGIN: 로그인
    --   - LOGOUT: 로그아웃
    --   - MENU: 메뉴 접속 (MENU_CD 사용)
    --   - REPORT: 보고서 접속 (REPORT_GB, REPORT_SEQ, ACCESS_GB 사용)

    -- 메뉴 코드 (MENU_CD) - 8자리 체계:
    --   1-2자리: 메뉴구분 (WY:주간, MY:월간, QY:분기, ST:설정)
    --   3-4자리: 1차 메뉴 (01~99)
    --   5-6자리: 2차 메뉴 (01~99)
    --   7-8자리: 3차 메뉴 (01~99)
    --   예: WY000000(주간메인), WY010000(1차), WY010100(2차), ST000000(설정메인)

    -- 상세 정보
    MENU_CD         VARCHAR2(50),                       -- 메뉴코드: 8자리 (WY000000, MY000000, QY000000, ST000000)
    REPORT_GB       VARCHAR2(10),                       -- 보고서구분: WEEK, MON, QT
    REPORT_SEQ      NUMBER,                             -- 보고서 일련번호
    ACCESS_GB       VARCHAR2(10),                       -- 접속경로: LIST, LINK, DIRECT

    -- 접속 환경 정보
    IP_ADDRESS      VARCHAR2(45),                       -- IP 주소 (IPv6 지원)
    USER_AGENT      VARCHAR2(500),                      -- User Agent
    DEVICE_TYPE     VARCHAR2(20),                       -- 디바이스: PC, MOBILE, TABLET
    BROWSER         VARCHAR2(50),                       -- 브라우저
    OS              VARCHAR2(50),                       -- 운영체제
    REFERER         VARCHAR2(500),                      -- 이전 페이지 URL

    -- 시간 정보
    ACCESS_DT       TIMESTAMP DEFAULT SYSTIMESTAMP,     -- 접속일시
    YEAR            VARCHAR2(4) AS (TO_CHAR(ACCESS_DT, 'YYYY')) VIRTUAL,  -- 년도 (가상컬럼)
    MONTH           VARCHAR2(2) AS (TO_CHAR(ACCESS_DT, 'MM')) VIRTUAL,    -- 월 (가상컬럼)

    -- 관리 컬럼
    LOG_INS_DT      DATE DEFAULT SYSDATE,              -- 생성일 (UTC)

    CONSTRAINT PK_TS_INS_ACCESS_LOG PRIMARY KEY (SEQ)
)
TABLESPACE PIGXE_DATA;

-- 인덱스
CREATE INDEX IDX_TS_INS_ACCESS_LOG_01 ON TS_INS_ACCESS_LOG(MEMBER_ID, ACCESS_DT) TABLESPACE PIGXE_IDX;
CREATE INDEX IDX_TS_INS_ACCESS_LOG_02 ON TS_INS_ACCESS_LOG(FARM_NO, ACCESS_DT) TABLESPACE PIGXE_IDX;
CREATE INDEX IDX_TS_INS_ACCESS_LOG_03 ON TS_INS_ACCESS_LOG(LOG_TYPE, ACCESS_DT) TABLESPACE PIGXE_IDX;
CREATE INDEX IDX_TS_INS_ACCESS_LOG_04 ON TS_INS_ACCESS_LOG(YEAR, MONTH) TABLESPACE PIGXE_IDX;
CREATE INDEX IDX_TS_INS_ACCESS_LOG_05 ON TS_INS_ACCESS_LOG(REPORT_GB, REPORT_SEQ) TABLESPACE PIGXE_IDX;
CREATE INDEX IDX_TS_INS_ACCESS_LOG_06 ON TS_INS_ACCESS_LOG(ACCESS_DT) TABLESPACE PIGXE_IDX;

COMMENT ON TABLE TS_INS_ACCESS_LOG IS '인사이트피그플랜 접속 로그 테이블 (1년 보관)';
COMMENT ON COLUMN TS_INS_ACCESS_LOG.SEQ IS '일련번호';
COMMENT ON COLUMN TS_INS_ACCESS_LOG.MEMBER_ID IS '회원ID';
COMMENT ON COLUMN TS_INS_ACCESS_LOG.FARM_NO IS '농장번호';
COMMENT ON COLUMN TS_INS_ACCESS_LOG.LOG_TYPE IS '로그유형 (LOGIN:로그인, LOGOUT:로그아웃, MENU:메뉴, REPORT:보고서)';
COMMENT ON COLUMN TS_INS_ACCESS_LOG.MENU_CD IS '메뉴코드 8자리 (WY:주간, MY:월간, QY:분기, ST:설정)';
COMMENT ON COLUMN TS_INS_ACCESS_LOG.REPORT_GB IS '보고서구분 (WEEK:주간, MON:월간, QT:분기)';
COMMENT ON COLUMN TS_INS_ACCESS_LOG.REPORT_SEQ IS '보고서 일련번호 (TS_INS_MASTER.SEQ)';
COMMENT ON COLUMN TS_INS_ACCESS_LOG.ACCESS_GB IS '접속경로 (LIST:리스트, LINK:링크, DIRECT:직접URL)';
COMMENT ON COLUMN TS_INS_ACCESS_LOG.IP_ADDRESS IS 'IP 주소 (IPv6 지원)';
COMMENT ON COLUMN TS_INS_ACCESS_LOG.USER_AGENT IS 'User Agent';
COMMENT ON COLUMN TS_INS_ACCESS_LOG.DEVICE_TYPE IS '디바이스 유형 (PC, MOBILE, TABLET)';
COMMENT ON COLUMN TS_INS_ACCESS_LOG.BROWSER IS '브라우저';
COMMENT ON COLUMN TS_INS_ACCESS_LOG.OS IS '운영체제';
COMMENT ON COLUMN TS_INS_ACCESS_LOG.REFERER IS '이전 페이지 URL';
COMMENT ON COLUMN TS_INS_ACCESS_LOG.ACCESS_DT IS '접속일시';
COMMENT ON COLUMN TS_INS_ACCESS_LOG.YEAR IS '년도 (가상컬럼)';
COMMENT ON COLUMN TS_INS_ACCESS_LOG.MONTH IS '월 (가상컬럼)';

-- ============================================================
-- 시퀀스: TS_INS_ACCESS_LOG용
-- ============================================================
BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE SQ_TS_INS_ACCESS_LOG';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

CREATE SEQUENCE SQ_TS_INS_ACCESS_LOG
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

-- ============================================================
-- 테이블 생성 확인
-- ============================================================
SELECT TABLE_NAME, NUM_ROWS, LAST_ANALYZED
FROM USER_TABLES
WHERE TABLE_NAME IN (
    'TA_SYS_CONFIG',
    'TS_INS_SERVICE',
    'TS_INS_MASTER',
    'TS_INS_JOB_LOG',
    'TS_INS_WEEK',
    'TS_INS_WEEK_SUB',
    'TS_PSY_DELAY_HEATMAP',
    'TM_WEATHER',
    'TS_INS_MGMT',
    'TS_INS_ACCESS_LOG'
)
ORDER BY TABLE_NAME;
