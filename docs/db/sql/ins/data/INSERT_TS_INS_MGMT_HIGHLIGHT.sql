-- TS_INS_MGMT 안박사 채널(HIGHLIGHT) 데이터 INSERT
-- 2024.12

-- 동기화 레규메이트 급여(민근농장밴드)
INSERT INTO TS_INS_MGMT (
    SEQ, MGMT_TYPE, SORT_NO, TITLE, CONTENT, LINK_URL, LINK_TARGET, POST_FROM, POST_TO, USE_YN
) VALUES (
    SEQ_TS_INS_MGMT.NEXTVAL,
    'HIGHLIGHT',
    1,
    '동기화 레규메이트 급여(민근농장밴드)',
    '후보돈 동기화 레규메이트 급여
- 급여방법 : 사료에 혼합급여(18일간 연속)
- 급여량 : 후보돈 두당 사료 2kg/일 기준 20mg/두/일
- 1포(80g) 8두분량
- 급여시작 : 후보돈 선발직후부터 급여 또는 격리사로 이동후 바로 급여

* 레규메이트 급여 종료 3~7일 사이 발정유도를 위해 PG600 투여
  (가능하면 교배 예정일의 5~6일 이전에 투여를 권장합니다)',
    NULL,
    NULL,
    NULL,
    NULL,
    'Y'
);

COMMIT;
