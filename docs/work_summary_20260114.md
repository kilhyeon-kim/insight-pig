# 2026-01-14 작업 내역 정리 및 개선 계획

## 1. 금일 작업 내역 요약 (inspig)

### [날씨 팝업 UX/UI 개선]
- **KST(한국표준시) 적용**: 서버/클라이언트 환경에 무관하게 일관된 시간 표시를 위해 `date-fns-tz` 기반 유틸리티 추가.
- **시간별 예보 차트화**: 텍스트 위주의 시간별 데이터를 ECharts를 이용한 시각적 차트(기온 + 강수확률)로 변경.
- **UX 최적화**: 팝업 오픈 시 현재 날짜와 시간대를 자동으로 선택하여 즉시 정보 확인 가능하도록 개선.
- **반응형 대응**: 모바일 및 데스크탑 환경에서 레이아웃이 깨지지 않도록 미디어 쿼리 및 Flex/Grid 조정.

### [환경설정 및 산정 방식 구현]
- **설정 페이지 개편**: 단일 페이지 구조에서 탭 방식으로 변경하여 확장성 확보.
- **작업예정 산정 방식 설정**: 주간보고서의 '금주 작업예정' 항목을 산정하는 방식(농장 기본값 vs 모돈별 예정일)을 사용자가 직접 설정할 수 있는 UI 및 API 구현.
- **TS_INS_CONF 연동**: 농장별 설정을 저장하는 `TS_INS_CONF` 테이블 연동 및 백엔드 CRUD 로직 완성.

---

## 2. 내일 작업 예정 사항 (pig3.1)

### [농가 구독 시 TS_INS_CONF 기본 데이터 자동 생성]

#### 2.1 작업 개요
- **목표**: pig3.1 관리자 페이지에서 농가 구독 추가 시, TS_INS_CONF 테이블에 기본 레코드 자동 생성
- **대상 화면**: `FarmInfoMgmtResistrationOfficePanel.jsp` > `easyLayout-inspigSub-div` 영역
- **조건**: 최초 1회만 등록 (TS_INS_CONF에 해당 FARM_NO 데이터가 없을 때만)

#### 2.2 TS_INS_CONF 테이블 구조

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| FARM_NO | NUMBER | 농장번호 (PK) |
| WEEK_TW_GY | VARCHAR2 | 금주작업예정-교배 설정 (JSON) |
| WEEK_TW_BM | VARCHAR2 | 금주작업예정-분만 설정 (JSON) |
| WEEK_TW_IM | VARCHAR2 | 금주작업예정-임신감정 설정 (JSON) |
| WEEK_TW_EU | VARCHAR2 | 금주작업예정-이유 설정 (JSON) |
| WEEK_TW_VC | VARCHAR2 | 금주작업예정-백신 설정 (JSON) |
| LOG_INS_DT | DATE | 등록일시 |
| LOG_UPT_DT | DATE | 수정일시 |

#### 2.3 JSON 데이터 형식

```json
{
  "method": "farm" | "modon",
  "tasks": [1, 2, 3]  // TB_PLAN_MODON.SEQ 배열
}
```

- **method**: 산정 방식
  - `farm`: 농장 기본값 사용 (TC_FARM_CONFIG)
  - `modon`: 모돈 작업설정 사용 (TB_PLAN_MODON)
- **tasks**: modon 선택 시 적용할 작업 SEQ 목록

#### 2.4 기본값 설정 규칙

| 작업 구분 | 컬럼명 | 기본 method | 기본 tasks |
|----------|--------|-------------|------------|
| 교배 | WEEK_TW_GY | `modon` | TB_PLAN_MODON에서 JOB_GUBUN_CD='150005'인 모든 SEQ |
| 분만 | WEEK_TW_BM | `modon` | TB_PLAN_MODON에서 JOB_GUBUN_CD='150002'인 모든 SEQ |
| 임신감정 | WEEK_TW_IM | `farm` | [] (빈 배열) |
| 이유 | WEEK_TW_EU | `modon` | TB_PLAN_MODON에서 JOB_GUBUN_CD='150003'인 모든 SEQ |
| 백신 | WEEK_TW_VC | `modon` | TB_PLAN_MODON에서 JOB_GUBUN_CD='150004'인 모든 SEQ |

> **참고**: TB_PLAN_MODON에 해당 작업이 없으면 tasks는 빈 배열로 저장

#### 2.5 구현 방법

##### SQL 쿼리 (MyBatis XML)

```xml
<!-- TS_INS_CONF 존재 여부 확인 -->
<select id="checkInsConfExists" parameterType="int" resultType="int">
    SELECT COUNT(*) FROM TS_INS_CONF WHERE FARM_NO = #{farmNo}
</select>

<!-- TB_PLAN_MODON에서 작업 SEQ 목록 조회 -->
<select id="getPlanModonSeqList" parameterType="map" resultType="int">
    SELECT SEQ
    FROM TB_PLAN_MODON
    WHERE FARM_NO = #{farmNo}
      AND JOB_GUBUN_CD = #{jobGubunCd}
      AND USE_YN = 'Y'
    ORDER BY SEQ
</select>

<!-- TS_INS_CONF 기본 데이터 삽입 -->
<insert id="insertInsConfDefault" parameterType="map">
    INSERT INTO TS_INS_CONF (
        FARM_NO,
        WEEK_TW_GY,
        WEEK_TW_BM,
        WEEK_TW_IM,
        WEEK_TW_EU,
        WEEK_TW_VC,
        LOG_INS_DT
    ) VALUES (
        #{farmNo},
        #{weekTwGy},
        #{weekTwBm},
        #{weekTwIm},
        #{weekTwEu},
        #{weekTwVc},
        SYSDATE
    )
</insert>
```

##### Java 서비스 로직 (의사 코드)

```java
/**
 * 농가 구독 저장 후 TS_INS_CONF 기본 데이터 생성
 * @param farmNo 농장번호
 */
public void createInsConfDefaultIfNotExists(int farmNo) {
    // 1. 존재 여부 확인
    int count = mapper.checkInsConfExists(farmNo);
    if (count > 0) {
        return; // 이미 존재하면 종료
    }

    // 2. TB_PLAN_MODON에서 각 작업별 SEQ 목록 조회
    List<Integer> matingSeqs = mapper.getPlanModonSeqList(farmNo, "150005");    // 교배
    List<Integer> farrowingSeqs = mapper.getPlanModonSeqList(farmNo, "150002"); // 분만
    List<Integer> weaningSeqs = mapper.getPlanModonSeqList(farmNo, "150003");   // 이유
    List<Integer> vaccineSeqs = mapper.getPlanModonSeqList(farmNo, "150004");   // 백신

    // 3. JSON 형식으로 변환
    String weekTwGy = toJson("modon", matingSeqs);      // 교배: modon + 전체 선택
    String weekTwBm = toJson("modon", farrowingSeqs);   // 분만: modon + 전체 선택
    String weekTwIm = toJson("farm", new ArrayList<>()); // 임신감정: farm (빈 배열)
    String weekTwEu = toJson("modon", weaningSeqs);     // 이유: modon + 전체 선택
    String weekTwVc = toJson("modon", vaccineSeqs);     // 백신: modon + 전체 선택

    // 4. INSERT
    Map<String, Object> params = new HashMap<>();
    params.put("farmNo", farmNo);
    params.put("weekTwGy", weekTwGy);
    params.put("weekTwBm", weekTwBm);
    params.put("weekTwIm", weekTwIm);
    params.put("weekTwEu", weekTwEu);
    params.put("weekTwVc", weekTwVc);

    mapper.insertInsConfDefault(params);
}

private String toJson(String method, List<Integer> tasks) {
    // {"method":"modon","tasks":[1,2,3]} 형식
    JSONObject json = new JSONObject();
    json.put("method", method);
    json.put("tasks", tasks);
    return json.toString();
}
```

#### 2.6 호출 위치

`FarmInfoMgmtResistrationOfficePanel.jsp`의 `easyLayout-inspigSub-div` 저장 처리 시:
1. 기존 구독 저장 로직 수행
2. 저장 성공 후 `createInsConfDefaultIfNotExists(farmNo)` 호출

#### 2.7 JOB_GUBUN_CD 참조

| 코드 | 작업 구분 |
|------|----------|
| 150001 | 임신감정(진단) |
| 150002 | 분만 |
| 150003 | 이유 |
| 150005 | 교배 |
| 150004 | 백신 |

---

## 3. inspig 참조 코드

### 3.1 API 엔드포인트

| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/config/farm/:farmNo` | 농장 기본값 + 모돈 작업설정 + TS_INS_CONF 조회 |
| POST | `/api/config/farm/:farmNo/weekly` | 주간보고서 설정 저장 |

### 3.2 inspig에서 사용하는 기본값 로직

```typescript
// com.service.ts - getFarmConfig()

// 기본값: 교배/분만/이유/백신은 modon, 임신감정은 farm
const insConf = {
  mating: { method: 'modon', tasks: getDefaultTasks('mating') },
  farrowing: { method: 'modon', tasks: getDefaultTasks('farrowing') },
  pregnancy: { method: 'farm', tasks: [] },  // 임신감정만 농장 기본값
  weaning: { method: 'modon', tasks: getDefaultTasks('weaning') },
  vaccine: { method: 'modon', tasks: getDefaultTasks('vaccine') },
};

// getDefaultTasks: TB_PLAN_MODON에서 해당 작업의 모든 SEQ 반환
```

### 3.3 Validation 규칙

- **modon 선택 시**: tasks가 빈 배열이어도 저장 허용
  - TB_PLAN_MODON에 해당 작업이 없는 농장도 있음
- **저장 시점**: 설정 변경은 차주 보고서부터 반영

---

## 4. 비고

- pig3.1 작업 시 트랜잭션 처리 필요 (구독 저장 실패 시 TS_INS_CONF도 롤백)
- 기존 농장 중 TS_INS_CONF 데이터가 없는 경우, inspig에서는 조회 시 기본값을 동적으로 계산하여 반환
- pig3.1에서 한 번 INSERT 해두면 이후에는 inspig 설정 화면에서 사용자가 직접 수정 가능
