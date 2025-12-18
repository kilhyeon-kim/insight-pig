# DB 문서 구조

> inspig 주간/월간 리포트 DB 설계 문서

---

## 폴더 구조

```
docs/db/
├── README.md                         # 이 문서
├── ref/                              # 운영 DB 참조 (문서만)
│   ├── 01.table.md                   # 테이블 구조/코드 참조
│   ├── 02.view.md                    # 뷰 참조
│   └── 03.function.md                # 함수 참조
├── ins/                              # INS 리포트 시스템 (신규)
│   ├── 01.overview.md                # 시스템 개요, 스케줄러 구조
│   ├── 02.table.md                   # 테이블 구조/설계 사항
│   └── week/                         # 주간 리포트
│       ├── 00.process.md             # 주간 프로세스 흐름
│       └── 01.modon-popup.md         # 모돈현황 팝업 상세
└── sql/                              # SQL 파일
    ├── 00_SQL_GUIDE.md               # SQL 작성 가이드
    └── ins/                          # INS SQL (DB 적용 대상)
        ├── 01_SEQUENCE.sql           # 시퀀스
        ├── 02_TABLE.sql              # INS 테이블 DDL
        ├── 03_TABLE_ETC.sql          # 공통/ETC 테이블 DDL
        ├── 11_SP_INS_COM_LOG.sql     # 로그 프로시저
        ├── week/                     # 주간 리포트
        │   ├── 01_SP_INS_WEEK_MAIN.sql
        │   ├── 02_SP_INS_WEEK_MANAGE_SOW.sql
        │   ├── 11_SP_INS_WEEK_MODON_POPUP.sql
        │   └── 99_JOB_INS_WEEKLY.sql
        ├── month/                    # 월간 리포트 (예정)
        └── quarter/                  # 분기 리포트 (예정)
```

---

## DB 적용 순서

### 1. 공통 객체

```bash
# 1. 시퀀스
sql/ins/01_SEQUENCE.sql

# 2. INS 테이블
sql/ins/02_TABLE.sql

# 3. 공통/ETC 테이블 (날씨, PSY 히트맵)
sql/ins/03_TABLE_ETC.sql

# 4. 로그 프로시저
sql/ins/11_SP_INS_COM_LOG.sql
```

### 2. 주간 리포트

```bash
# 1. 메인 프로시저
sql/ins/week/01_SP_INS_WEEK_MAIN.sql

# 2. 서브 프로시저
sql/ins/week/02_SP_INS_WEEK_MANAGE_SOW.sql
sql/ins/week/11_SP_INS_WEEK_MODON_POPUP.sql
# ... 팝업 프로시저 추가

# 3. 스케줄러 JOB (마지막)
sql/ins/week/99_JOB_INS_WEEKLY.sql
```

---

## SQL 파일 번호 규칙

### ins/ 공통

| 번호 | 용도 |
|------|------|
| 01 | 시퀀스 |
| 02 | INS 테이블 |
| 03 | 공통/ETC 테이블 |
| 11~19 | 공통 프로시저 |

### ins/week/ 주간 리포트

| 번호 | 용도 |
|------|------|
| 01~09 | 메인/핵심 프로시저 |
| 11~89 | 팝업 프로시저 (계속 추가) |
| 99 | 스케줄러 JOB |

---

## 적용 확인

```sql
-- 프로시저 상태 확인
SELECT OBJECT_NAME, OBJECT_TYPE, STATUS
FROM USER_OBJECTS
WHERE OBJECT_NAME LIKE 'SP_INS_WEEK%'
ORDER BY OBJECT_NAME;

-- JOB 상태 확인
SELECT JOB_NAME, STATE, ENABLED, NEXT_RUN_DATE
FROM USER_SCHEDULER_JOBS
WHERE JOB_NAME = 'JOB_INS_WEEKLY_REPORT';

-- 테스트 실행
EXEC SP_INS_WEEK_MAIN('WEEK', NULL, 4, 'Y');
```

---

## 참조 vs 적용

| 폴더 | 용도 | DB 적용 | 비고 |
|------|------|---------|------|
| ref/ | 운영 DB 참조 문서 | X | md 문서만 |
| sql/ins/ | INS 신규 객체 | O | SQL 파일 |
