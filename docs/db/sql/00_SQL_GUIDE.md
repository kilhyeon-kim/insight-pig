# inspig SQL 작성 지침서

> **중요**: 모든 SQL 및 프로시저 작성 시 반드시 이 문서의 지침을 준수해야 합니다.

---

## 1. 시간 처리 원칙

### 1.1 저장 vs 비교

| 구분 | 사용 함수 | 설명 |
|------|----------|------|
| **저장** | `SYSDATE` | LOG_INS_DT, START_DT, END_DT 등 (서버시간/UTC) |
| **비교** | `SF_GET_LOCALE_VW_DATE_2022` | WK_DT(CHAR 8)와 비교 시 (다국가 로케일) |
| **조회** | 애플리케이션 | 필요 시 로케일 변환 |

### 1.2 날짜 비교 함수 (다국가 지원)

```sql
-- SF_GET_LOCALE_VW_DATE_2022: 다국가 로케일 지원 함수
-- LOCALE 파라미터: 'KOR' (한국 +09:00), 'VNM' (베트남 +07:00)
SF_GET_LOCALE_VW_DATE_2022(LOCALE, IN_DATE)

-- 예시: 한국 로케일 오늘 날짜
TRUNC(SF_GET_LOCALE_VW_DATE_2022('KOR', SYSDATE))

-- 예시: 베트남 로케일 오늘 날짜
TRUNC(SF_GET_LOCALE_VW_DATE_2022('VNM', SYSDATE))
```

#### SF_GET_LOCALE_VW_DATE_2022 함수 정의

```sql
CREATE OR REPLACE FUNCTION SF_GET_LOCALE_VW_DATE_2022
    (LOCALE IN VARCHAR2, IN_DATE DATE)
    RETURN DATE
IS
    V_RTN DATE;
BEGIN
    SELECT CASE
        WHEN UPPER(LOCALE) = 'KOR' THEN
            from_tz(CAST(NVL(IN_DATE,SYSDATE) as timestamp), 'UTC') at time zone '+09:00'
        WHEN UPPER(LOCALE) = 'VNM' THEN
            from_tz(CAST(NVL(IN_DATE,SYSDATE) as timestamp), 'UTC') at time zone '+07:00'
        ELSE
            from_tz(CAST(NVL(IN_DATE,SYSDATE) as timestamp), 'UTC') at time zone '+09:00'
    END INTO V_RTN
    FROM DUAL;
    RETURN V_RTN;
END;
```

### 1.3 WK_DT 비교 예시

```sql
-- WK_DT는 CHAR(8) 형식 (YYYYMMDD)
-- 비교 시 TO_DATE 변환 필요
-- P_LOCALE: 농장의 로케일 ('KOR', 'VNM')
WHERE (TRUNC(SF_GET_LOCALE_VW_DATE_2022(P_LOCALE, SYSDATE)) - TO_DATE(WK.WK_DT, 'YYYYMMDD')) >= :기준일수
```

### 1.4 로케일 조회

```sql
-- 농장 로케일 조회 (TA_FARM.COUNTRY_CODE 사용)
SELECT NVL(COUNTRY_CODE, 'KOR') AS LOCALE FROM TA_FARM WHERE FARM_NO = :farm_no;
```

### 1.5 보고서 기준일

#### 기간 구분

| 보고서 | 기간 (DT_FROM ~ DT_TO) | 기준일 | 비고 |
|--------|------------------------|--------|------|
| **주간 (WEEK)** | 전주 월요일 ~ 일요일 | 전주 일요일 (DT_TO) | 관리대상 계산 기준 |
| **월간 (MON)** | 전월 1일 ~ 마지막일 | 전월 마지막일 (DT_TO) = 기말 | - |
| **분기 (QT)** | 전분기 시작 ~ 종료 | 전분기 마지막일 (DT_TO) | 예정 |

#### 기간 계산 예시

```sql
-- 주간: 전주 월요일 ~ 일요일 (스케줄 실행일 기준)
V_DT_TO := TRUNC(V_BASE_DT, 'IW') - 1;  -- 지난주 일요일
V_DT_FROM := V_DT_TO - 6;                -- 지난주 월요일

-- 월간: 전월 1일 ~ 마지막일
V_DT_FROM := TRUNC(ADD_MONTHS(V_BASE_DT, -1), 'MM');  -- 전월 1일
V_DT_TO := TRUNC(V_BASE_DT, 'MM') - 1;                 -- 전월 마지막일 (기말)
```

#### 기준일 사용처

- **관리대상 모돈**: 기준일(DT_TO) 시점 기준으로 지연일 계산
- **실적 집계**: DT_FROM ~ DT_TO 기간 내 작업 집계
- **현황 조회**: 기준일(DT_TO) 시점의 상태

---

## 2. 기준 테이블 및 뷰

### 2.1 필수 참조 테이블

| 테이블/뷰 | 용도 | 비고 |
|-----------|------|------|
| `TB_MODON` | 모돈 마스터 | 기본 모돈 정보 |
| `TB_MODON_WK` | 모돈 작업 이력 | 모든 작업 로그 |
| `VM_LAST_MODON_SEQ_WK` | 최종 작업 조회 | 뷰 또는 동일 로직 사용 |
| `TC_FARM_CONFIG` | 농장별 설정 | 기준일수 등 |
| `TA_FARM` | 농장 마스터 | 농장 기본정보 |

### 2.2 VM_LAST_MODON_SEQ_WK (최종 작업 뷰)

최종 작업 조회 시 **뷰 사용 또는 동일한 MAX(SEQ) 로직**을 사용합니다.

#### 뷰 구조
```sql
-- VM_LAST_MODON_SEQ_WK 핵심 로직
SELECT WKM.FARM_NO, WKM.PIG_NO, TB1.*
FROM (
    -- 최종 작업 시퀀스 추출 (MAX(SEQ) 사용)
    SELECT FARM_NO, PIG_NO, MAX(SEQ) AS MSEQ
    FROM TB_MODON_WK
    WHERE USE_YN = 'Y'
    GROUP BY FARM_NO, PIG_NO
) WKM
INNER JOIN TB_MODON_WK TB1
    ON TB1.FARM_NO = WKM.FARM_NO
   AND TB1.PIG_NO = WKM.PIG_NO
   AND TB1.SEQ = WKM.MSEQ
```

#### 뷰 컬럼
| 컬럼 | 설명 |
|------|------|
| `FARM_NO` | 농장번호 |
| `PIG_NO` | 모돈번호 |
| `WK_DT` | 작업일자 (CHAR 8) |
| `WK_DATE` | 작업일자 (DATE) |
| `SANCHA` | 산차 |
| `GYOBAE_CNT` | 교배차수 |
| `WK_GUBUN` | 작업구분 (G/B/E/F 등) |
| `DAERI_YN` | 대리돈여부 |
| `SAGO_GUBUN_CD` | 사고구분코드 |
| `LOC_CD` | 위치코드 |
| `SEQ` | 시퀀스 |

#### 사용 방법

```sql
-- 방법 1: 뷰 직접 사용
SELECT WK.*, MD.*
FROM VM_LAST_MODON_SEQ_WK WK
INNER JOIN TB_MODON MD
    ON MD.FARM_NO = WK.FARM_NO AND MD.PIG_NO = WK.PIG_NO
WHERE WK.FARM_NO = :farm_no
  AND WK.WK_GUBUN = 'E'  -- 이유

-- 방법 2: WITH 절로 동일 로직 구현 (필요 컬럼만 추출)
WITH LAST_WK AS (
    SELECT FARM_NO, PIG_NO, MAX(SEQ) AS MSEQ
    FROM TB_MODON_WK
    WHERE FARM_NO = :farm_no
      AND USE_YN = 'Y'
    GROUP BY FARM_NO, PIG_NO
)
SELECT WK.WK_DT, WK.WK_GUBUN, WK.DAERI_YN
FROM LAST_WK LW
INNER JOIN TB_MODON_WK WK
    ON WK.FARM_NO = LW.FARM_NO
   AND WK.PIG_NO = LW.PIG_NO
   AND WK.SEQ = LW.MSEQ
WHERE WK.WK_GUBUN = 'E'
```

> **주의**: MAX(WK_DT)가 아닌 **MAX(SEQ)**로 최종 작업을 판단합니다.

---

## 3. 모돈 상태 코드 (STATUS_CD)

### 3.1 TB_MODON.STATUS_CD

| 코드 | 명칭 | 설명 |
|------|------|------|
| `010001` | 후보돈 | 미교배 상태 , SANCHA=0, GYOBAE_CNT=0 |
| `010002` | 교배돈 | 교배 완료, 임신확인 전  |
| `010003` | 임신돈 | 임신확인 완료 |
| `010004` | 포유돈 | 분만 완료, 이유 전 |
| `010005` | 이유돈 | 이유 완료, 재교배 대기 |
| `010006` | 재발돈 | 임신사고 (재발정) |
| `010007` | 공태돈 | 임신사고 (공태) |
| `010008` | 도폐사돈 | 죽거나 타농장으로 전출/판매 (TB_MODON테이블 OUT_DT <> 9999/12/31 ) |

### 3.2 상태별 조회 조건

```sql
-- 미교배 후보돈
WHERE STATUS_CD = '010001'

-- 이유후 미교배
WHERE STATUS_CD = '010005'

-- 사고후 미교배 (재발 + 공태)
WHERE STATUS_CD IN ('010006', '010007')

-- 분만지연 (임신돈)
WHERE STATUS_CD = '010003'

-- 이유지연 (포유돈)
WHERE STATUS_CD = '010004'
```

---

## 4. 작업 구분 코드 (WK_GUBUN)

### 4.1 TB_MODON_WK.WK_GUBUN

| 코드 | 명칭 | 설명 |
|------|------|------|
| `A` | 후보돈 |  |
| `G` | 교배 | 교배 작업 |
| `B` | 분만 | 분만 작업 |
| `E` | 이유 | 이유 작업 |
| `F` | 사고 | 임신사고 (재발/공태) |
| `Z` | 도태폐사 | 도태, 폐사, 전출 |

### 4.2 작업구분별 조회

```sql
-- 최종 교배 작업
WHERE WK_GUBUN = 'G'

-- 최종 분만 작업
WHERE WK_GUBUN = 'B'

-- 최종 이유 작업
WHERE WK_GUBUN = 'E'

-- 최종 사고 작업
WHERE WK_GUBUN = 'F'
```

---

## 5. 농장 설정값 (TC_FARM_CONFIG)

> **참고**: 코드 정의는 TC_CODE_SYS 테이블에서 관리

### 5.1 주요 설정 코드

| CODE | 명칭 | 기본값 | 설명 |
|------|------|--------|------|
| `140002` | 평균임신기간 | 115 | 교배~분만 기준일수 |
| `140003` | 평균포유기간 | 21 | 분만~이유 기준일수 |
| `140007` | 후보돈초교배일령 | 240 | 출생~초교배 기준일수 |
| `140008` | 평균재귀일 | 7 | 이유~재교배 기준일수 |

### 5.2 설정값 조회 방법

```sql
-- 권장: WITH 절 사용
WITH FARM_CONF AS (
    SELECT CODE, CVALUE
    FROM TC_FARM_CONFIG
    WHERE FARM_NO = :farm_no
      AND CODE IN ('140002', '140003', '140007', '140008')
)
SELECT NVL(MAX(CASE WHEN CODE = '140007' THEN TO_NUMBER(CVALUE) END), 240) AS FIRST_GB_DAY,
       NVL(MAX(CASE WHEN CODE = '140008' THEN TO_NUMBER(CVALUE) END), 7) AS AVG_RETURN,
       NVL(MAX(CASE WHEN CODE = '140002' THEN TO_NUMBER(CVALUE) END), 115) AS PREG_PERIOD,
       NVL(MAX(CASE WHEN CODE = '140003' THEN TO_NUMBER(CVALUE) END), 21) AS WEAN_PERIOD
FROM FARM_CONF;
```

---

## 6. 모돈 날짜 필드 및 필터링

### 6.1 주요 날짜 필드

| 필드 | 설명 | 비고 |
|------|------|------|
| `IN_DT` | 전입일 | 시스템에 전입시킨 일자 |
| `OUT_DT` | 도폐사일 | 도태/폐사/전출 일자 |
| `BIRTH_DT` | 출생일 | 후보돈 초교배일 계산에 사용 |
| `LAST_WK_DT` | 최종작업일 | 전입 시 설정된 최종 작업일이며 금주 작업예정 추출시 사용 |

### 6.2 OUT_DT 값 해석

| OUT_DT 값 | 의미 |
|-----------|------|
| `'9999-12-31'` | 미도폐사 모돈 (도폐사일 미도래, 현재 존재) |
| `실제 날짜` | 해당 일자에 도태/폐사/전출됨 |

> **주의**: OUT_DT가 기준일보다 같거나 과거인 경우 기준일기준으로 도폐사된 모돈입니다.

### 6.3 필수 조건 (미도폐사 모돈 조회)

**모든 모돈 조회 시 반드시 아래 조건을 포함해야 합니다.**

```sql
WHERE MD.OUT_DT = TO_DATE('9999-12-31', 'YYYY-MM-DD')  -- 미도폐사 모돈 (도폐사일 미도래)
  AND MD.USE_YN = 'Y'                                   -- 사용중
```

### 6.4 대리돈 제외

```sql
-- 이유후 미교배 조회 시
WHERE WK_GUBUN='E' AND WK.DAERI_YN = 'N'  -- 이유가 끝난 모돈(교배대기돈)
```

---

## 7. 관리대상 모돈 추출 로직

> **기준일**: 관리대상 계산은 리포트 종료일(P_DT_TO)을 기준일로 사용
> - 주간: 전주 일요일
> - 월간: 전월 마지막일 (기말)


---

## 9. SQL 파일 실행 순서

### 9.1 파일 번호 체계

| 그룹 | 번호 | 설명 |
|------|------|------|
| **기초** | 01~10 | 시퀀스, 테이블 |
| **공통** | 11~20 | 공통 함수, 프로시저 |
| **주간 리포트** | 21~30 | SP_INS_WEEK_* 프로시저 |
| **스케줄러** | 31~40 | DBMS_SCHEDULER JOB |

### 9.2 현재 파일 목록

| 순번 | 파일명 | 설명 |
|------|--------|------|
| 01 | 01_SEQUENCE.sql | 시퀀스 생성 |
| 02 | 02_TABLE.sql | 테이블 DDL |
| 11 | 11_SP_INS_COM_LOG.sql | 공통 함수/프로시저 |
| 21 | 21_SP_INS_WEEK_MAIN.sql | 메인 프로시저 |
| 22 | 22_SP_INS_WEEK_MANAGE_SOW.sql | 관리대상 모돈 |
| 31 | 31_JOB_INS_WEEKLY.sql | 스케줄러 JOB |

---

## 10. 통계 테이블 구조

### 10.1 3-tier 구조

```
TS_INS_MASTER (리포트 마스터)
    │
    ├── TS_INS_FARM (농장별 요약)
    │       │
    │       └── TS_INS_FARM_SUB (상세 데이터, GUBUN별)
    │
    └── TS_INS_JOB_LOG (실행 로그)
```

### 10.2 TS_INS_FARM_SUB GUBUN 코드

| GUBUN | 용도 | CNT_1~5 매핑 |
|-------|------|-------------|
| `ALERT` | 관리대상 모돈 | 후보,이유미,사고미,분만지연,이유지연 |
| `MODON` | 모돈 현황 | 후보,임신,포유,이유모,사고,증감 |
| `MATING_T` | 교배 유형별 | 계획,실적 |
| `FARROWING` | 분만 성적 | 항목별 |
| `WEANING` | 이유 성적 | 항목별 |
| `SCHEDULE` | 작업예정 | 유형별 두수 |

---

## 11. 프로시저 작성 규칙

### 11.1 로그 기록

```sql
-- 시작
SP_INS_COM_LOG_START(P_MASTER_SEQ, P_JOB_NM, 'SP_프로시저명', P_FARM_NO, V_LOG_SEQ);

-- 정상 종료
SP_INS_COM_LOG_END(V_LOG_SEQ, V_PROC_CNT);

-- 오류 종료
SP_INS_COM_LOG_ERROR(V_LOG_SEQ, SQLCODE, SQLERRM);
```

### 11.2 EXCEPTION 처리

```sql
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        SP_INS_COM_LOG_ERROR(V_LOG_SEQ, SQLCODE, SQLERRM);
        RAISE;
```

### 11.3 COMMIT 정책

- 각 논리적 단위 완료 시 COMMIT
- EXCEPTION 발생 시 ROLLBACK 후 로그 기록

---

## 12. 체크리스트

### SQL 작성 전 확인사항

- [ ] `VM_LAST_MODON_SEQ_WK` 뷰 사용 (직접 MAX 조회 금지)
- [ ] `OUT_DT = '9999-12-31'` 조건 포함 (미도폐사 모돈)
- [ ] `USE_YN = 'Y'` 조건 포함
- [ ] `DAERI_YN = 'N'` 조건 확인 (이유 관련)
- [ ] WK_DT 비교 시 `TO_DATE(WK_DT, 'YYYY-MM-DD')` 변환
- [ ] 농장 설정값 `TC_FARM_CONFIG` 참조
- [ ] 기본값 `NVL` 처리

### 프로시저 작성 전 확인사항

- [ ] 로그 시작/종료 호출
- [ ] EXCEPTION 처리
- [ ] COMMIT/ROLLBACK 정책 준수
- [ ] 파라미터 검증

---

## 13. 운영 데이터 규모

### 13.1 주요 테이블 건수 (2025년 기준)

| 테이블 | 건수 | 비고 |
|--------|------|------|
| `TB_MODON_WK` | **~41,000,000** | 모돈 작업 이력 (최대) |
| `TB_GYOBAE` | ~15,000,000 | 교배 |
| `TB_EU` | ~12,000,000 | 이유 |
| `TB_BUNMAN` | ~12,000,000 | 분만 |
| `TB_MODON_JADON_TRANS` | ~10,000,000 | 자돈 전입 |
| `TB_MODON` | **~3,500,000** | 모돈 마스터 |
| `TB_SAGO` | ~3,000,000 | 임신사고 |
| `TB_MD_LOC_TRANS` | ~1,000,000 | 위치이동 |
| `TB_WT_BCS` | ~900,000 | 체중/BCS |

### 13.2 성능 고려사항

#### TB_MODON_WK (4천만건)
```sql
-- 금지: WK_DT 기준 MAX 조회 (동일 날짜 복수 작업 시 오류)
SELECT * FROM TB_MODON_WK
WHERE WK_DT = (SELECT MAX(WK_DT) FROM TB_MODON_WK WHERE ...)  -- 잘못된 방식

-- 권장: SEQ 기준 MAX 조회 (뷰 또는 동일 로직)
SELECT * FROM VM_LAST_MODON_SEQ_WK WHERE ...
-- 또는
WITH LAST_WK AS (
    SELECT FARM_NO, PIG_NO, MAX(SEQ) AS MSEQ
    FROM TB_MODON_WK WHERE FARM_NO = :farm_no AND USE_YN = 'Y'
    GROUP BY FARM_NO, PIG_NO
)
SELECT ... FROM LAST_WK ...
```

#### TB_MODON (350만건)
```sql
-- 권장: 농장번호 + 상태코드 조건 필수
WHERE FARM_NO = :farm_no      -- 파티션/인덱스 활용
  AND STATUS_CD = '010001'    -- 추가 필터링
  AND OUT_DT = TO_DATE('9999-12-31', 'YYYY-MM-DD')
  AND USE_YN = 'Y'
```


### 13.3 인덱스 활용

| 테이블 | 주요 인덱스 컬럼 | 용도 |
|--------|-----------------|------|
| `TB_MODON` | FARM_NO, STATUS_CD, OUT_DT | 재적 모돈 조회 |
| `TB_MODON_WK` | FARM_NO, PIG_NO, WK_DT | 작업 이력 조회 |
| `TB_GYOBAE` | FARM_NO, PIG_NO, WK_DT | 교배 이력 |
| `TB_BUNMAN` | FARM_NO, PIG_NO, WK_DT | 분만 이력 |

### 13.4 OUTER JOIN 최적화

> **원칙**: 데이터 건수가 적은 테이블을 드라이빙 테이블로 사용

```sql
-- 권장: 소량 테이블(TB_MODON) 기준으로 대량 테이블(TB_MODON_WK) OUTER JOIN
SELECT MD.*, WK.WK_DT
FROM TB_MODON MD                              -- 소량 (농장별 수백~수천 건)
LEFT OUTER JOIN (
    SELECT /*+ INDEX(TB_MODON_WK IX_TB_MODON_WK_01) */
           DISTINCT FARM_NO, PIG_NO
    FROM TB_MODON_WK
    WHERE FARM_NO = :farm_no
      AND USE_YN = 'Y'
) WK ON WK.FARM_NO = MD.FARM_NO AND WK.PIG_NO = MD.PIG_NO
WHERE MD.FARM_NO = :farm_no
  AND MD.OUT_DT = TO_DATE('9999-12-31', 'YYYY-MM-DD')
  AND MD.USE_YN = 'Y'
  AND WK.FARM_NO IS NULL;  -- 작업이력 없는 모돈
```

### 13.5 힌트 사용 가이드

#### 자주 사용하는 힌트

| 힌트 | 용도 | 예시 |
|------|------|------|
| `/*+ INDEX(table idx) */` | 특정 인덱스 강제 사용 | 대용량 테이블 조회 |
| `/*+ LEADING(t1 t2) */` | 조인 순서 지정 | 소량 → 대량 순서 |
| `/*+ USE_NL(t2) */` | Nested Loop 조인 | 소량 결과 예상 시 |
| `/*+ USE_HASH(t2) */` | Hash 조인 | 대량 결과 예상 시 |
| `/*+ PARALLEL(table n) */` | 병렬 처리 | 배치 작업 시 |

#### 힌트 사용 예시

```sql
-- 예시 1: 대용량 TB_MODON_WK 조회 시 인덱스 힌트
SELECT /*+ INDEX(WK IX_TB_MODON_WK_01) */
       WK.*
FROM TB_MODON_WK WK
WHERE WK.FARM_NO = :farm_no
  AND WK.USE_YN = 'Y';

-- 예시 2: 조인 순서 지정 (TB_MODON 먼저 → TB_MODON_WK)
SELECT /*+ LEADING(MD WK) USE_NL(WK) */
       MD.PIG_NO, WK.WK_DT
FROM TB_MODON MD
INNER JOIN TB_MODON_WK WK
    ON WK.FARM_NO = MD.FARM_NO AND WK.PIG_NO = MD.PIG_NO
WHERE MD.FARM_NO = :farm_no
  AND MD.STATUS_CD = '010003';

-- 예시 3: 배치 프로시저에서 병렬 처리
SELECT /*+ PARALLEL(WK 4) */
       COUNT(*)
FROM TB_MODON_WK WK
WHERE WK.FARM_NO = :farm_no;
```

### 13.6 성능 최적화 체크리스트

- [ ] 대용량 테이블 조회 시 FARM_NO 조건 필수
- [ ] OUTER JOIN 시 소량 테이블을 드라이빙 테이블로 사용
- [ ] TB_MODON_WK 조회 시 인덱스 힌트 검토
- [ ] 집계 쿼리 시 WITH 절로 대상 축소 후 처리
- [ ] 조인 순서가 비효율적이면 LEADING 힌트 사용
- [ ] 실행 계획(EXPLAIN PLAN) 확인 후 튜닝

---

## 변경 이력

| 버전 | 일자 | 작성자 | 내용 |
|------|------|--------|------|
| 1.0 | 2025-12-09 | - | 최초 작성 |
