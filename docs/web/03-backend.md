# Backend API 및 데이터베이스 가이드

**대상**: Backend 개발자  
**최종 업데이트**: 2025-12-03

---

## 1. 프로젝트 구조

```
api/
├── src/
│   ├── app.module.ts           # 메인 모듈 (TypeORM 설정)
│   ├── main.ts                 # 진입점
│   ├── config/                 # 설정 파일 (예정)
│   ├── entities/               # TypeORM Entities (예정)
│   ├── common/                 # 공통 모듈 (예정)
│   └── modules/
│       ├── auth/               # 인증 모듈 (예정)
│       └── weekly/             # 주간 보고서 모듈
│           ├── weekly.controller.ts
│           ├── weekly.service.ts
│           ├── weekly.module.ts
│           ├── dto/            # Data Transfer Objects
│           └── mock-data.ts    # Mock 데이터
├── .env                        # 환경 변수
├── package.json
├── nest-cli.json
└── tsconfig.json
```

---

## 2. 현재 상태

### 2.1 완료된 작업
- ✅ NestJS 프로젝트 초기화
- ✅ TypeORM 설정 (Oracle 연결)
- ✅ 환경 변수 설정 (`.env`)
- ✅ Weekly 모듈 구조 생성

### 2.2 개발 모드
**현재**: Mock 데이터 사용 중  
**목표**: Oracle DB 연동

---

## 3. API 엔드포인트 설계

### 3.1 주간 보고서 API

#### 목록 조회
```
GET /api/weekly/list?from=2023-09-01&to=2023-10-31
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "40",
      "title": "10월 1주차 주간 보고서",
      "period": "2023.10.01 ~ 2023.10.07",
      "date": "2023.10.08"
    }
  ]
}
```

#### 상세 조회
```
GET /api/weekly/detail/:id
```

**Response**:
```json
{
  "success": true,
  "data": {
    "header": { "farmName": "행복한 농장", ... },
    "alertMd": { "count": 3, ... },
    "lastWeek": { ... },
    "thisWeek": { ... },
    "kpi": { ... },
    "weather": { ... },
    "todo": { ... }
  }
}
```

#### 팝업 데이터
```
GET /api/weekly/popup/:type/:id
```

**type**: `alertMd`, `modon`, `mating`, `farrowing`, `weaning`, `accident`, `culling`, `shipment`, `schedule`

#### 차트 데이터
```
GET /api/weekly/chart/:type
```

**type**: `sowChart`, `matingChart`, `parityReturn`, `accidentPeriod`, 등

---

## 4. 구현 단계

### Phase 1: Mock 데이터 기반 API (현재)

#### 4.1 Controller 구현
**파일**: `src/modules/weekly/weekly.controller.ts`

```typescript
import { Controller, Get, Param, Query } from '@nestjs/common';
import { WeeklyService } from './weekly.service';

@Controller('api/weekly')
export class WeeklyController {
  constructor(private readonly weeklyService: WeeklyService) {}

  @Get('list')
  getList(@Query('from') from?: string, @Query('to') to?: string) {
    return this.weeklyService.getList(from, to);
  }

  @Get('detail/:id')
  getDetail(@Param('id') id: string) {
    return this.weeklyService.getDetail(id);
  }

  @Get('popup/:type/:id')
  getPopupData(@Param('type') type: string, @Param('id') id: string) {
    return this.weeklyService.getPopupData(type, id);
  }

  @Get('chart/:type')
  getChartData(@Param('type') type: string) {
    return this.weeklyService.getChartData(type);
  }
}
```

#### 4.2 Service 구현
**파일**: `src/modules/weekly/weekly.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { MOCK_DATA } from './mock-data';

@Injectable()
export class WeeklyService {
  private useMockData = process.env.USE_MOCK_DATA === 'true';

  async getList(from?: string, to?: string) {
    if (this.useMockData) {
      return {
        success: true,
        data: MOCK_DATA.reportList,
      };
    }

    // TODO: Oracle DB 쿼리
    // const reports = await this.weeklyRepository.find({ ... });
    // return { success: true, data: reports };
  }

  async getDetail(id: string) {
    if (this.useMockData) {
      return {
        success: true,
        data: MOCK_DATA.weeklyDetail,
      };
    }

    // TODO: Oracle DB 쿼리
  }

  async getPopupData(type: string, id: string) {
    if (this.useMockData) {
      return {
        success: true,
        data: MOCK_DATA.popupData[type],
      };
    }

    // TODO: Oracle DB 쿼리
  }

  async getChartData(type: string) {
    if (this.useMockData) {
      return {
        success: true,
        data: MOCK_DATA.chartData[type],
      };
    }

    // TODO: Oracle DB 쿼리
  }
}
```

#### 4.3 Mock 데이터
**파일**: `src/modules/weekly/mock-data.ts`

```typescript
export const MOCK_DATA = {
  reportList: [
    { id: '40', title: '10월 1주차 주간 보고서', period: '2023.10.01 ~ 2023.10.07', date: '2023.10.08' },
    // ... 나머지 데이터
  ],
  weeklyDetail: {
    header: { farmName: '행복한 농장', period: '2023.10.01 ~ 2023.10.07', owner: '홍길동', weekNum: 40 },
    alertMd: { count: 3, list: [ /* ... */ ] },
    lastWeek: { /* ... */ },
    thisWeek: { /* ... */ },
    kpi: { psy: 25.5, weaningAge: 24.5, marketPrice: 5800 },
    weather: { forecast: [] },
    todo: { items: [] },
  },
  popupData: {
    alertMd: [ /* ... */ ],
    modon: { /* ... */ },
    // ... 나머지 팝업
  },
  chartData: {
    sowChart: [ /* ... */ ],
    // ... 나머지 차트
  },
};
```

### Phase 2: Oracle DB Entity 정의 (준비 중)

#### 5.1 Entity 예시
**파일**: `src/entities/sow.entity.ts`

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('TB_SOW') // Oracle 테이블명
export class Sow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'SOW_ID' })
  sowId: string;

  @Column({ name: 'PARITY' })
  parity: number;

  @Column({ name: 'STATUS' })
  status: string;

  @Column({ name: 'LAST_EVENT_DATE', type: 'date' })
  lastEventDate: Date;

  // ... 기타 컬럼
}
```

**파일**: `src/entities/mating.entity.ts`

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('TB_MATING')
export class Mating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'SOW_ID' })
  sowId: string;

  @Column({ name: 'MATING_DATE', type: 'date' })
  matingDate: Date;

  @Column({ name: 'BOAR_ID' })
  boarId: string;

  // ... 기타 컬럼
}
```

### Phase 3: Oracle DB 연동 (대기 중)

#### 6.1 TypeORM 설정
**파일**: `src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'oracle',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT') || 1521,
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        serviceName: configService.get<string>('DB_SERVICE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // 프로덕션에서는 false
        logging: true,
      }),
    }),
    // ... 모듈
  ],
})
export class AppModule {}
```

#### 6.2 Repository 주입
**파일**: `src/modules/weekly/weekly.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeeklyController } from './weekly.controller';
import { WeeklyService } from './weekly.service';
import { Sow } from '../../entities/sow.entity';
import { Mating } from '../../entities/mating.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sow, Mating, /* ... */]),
  ],
  controllers: [WeeklyController],
  providers: [WeeklyService],
})
export class WeeklyModule {}
```

#### 6.3 Service 수정 (DB 쿼리)
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sow } from '../../entities/sow.entity';

@Injectable()
export class WeeklyService {
  constructor(
    @InjectRepository(Sow)
    private sowRepository: Repository<Sow>,
  ) {}

  async getList(from?: string, to?: string) {
    if (process.env.USE_MOCK_DATA === 'true') {
      return { success: true, data: MOCK_DATA.reportList };
    }

    // 실제 Oracle DB 쿼리
    const reports = await this.sowRepository
      .createQueryBuilder('sow')
      .select([/* ... */])
      .where('sow.date BETWEEN :from AND :to', { from, to })
      .getMany();

    return { success: true, data: reports };
  }
}
```

---

## 7. 환경 변수

**파일**: `api/.env`

```env
# 개발 모드
NODE_ENV=development
USE_MOCK_DATA=true          # Mock 데이터 사용

# Oracle Database - 로컬
DB_DRIVER=net.sf.log4jdbc.sql.jdbcapi.DriverSpy
DB_HOST=192.168.3.244
DB_PORT=1521
DB_SID=ORCLCDB
DB_USER=pksu
DB_PASSWORD=pksu

# Oracle Database - 운영 (추가 설정)
# DB_IDLE_TIMEOUT=60
# DB_MAX_POOL_SIZE=50
# DB_MIN_IDLE=10
# DB_TEST_QUERY=SELECT 1 FROM DUAL

# JWT (인증 구현 시)
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
```

**TypeORM 설정 예시** (`app.module.ts`):
```typescript
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'oracle',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT') || 1521,
    sid: configService.get<string>('DB_SID'),
    username: configService.get<string>('DB_USER'),
    password: configService.get<string>('DB_PASSWORD'),
    synchronize: false, // 프로덕션에서는 false
    logging: true,
    // 운영 환경 추가 설정
    extra: {
      connectionTimeout: configService.get<number>('DB_IDLE_TIMEOUT') || 60,
      maxPoolSize: configService.get<number>('DB_MAX_POOL_SIZE') || 50,
      minPoolSize: configService.get<number>('DB_MIN_IDLE') || 10,
    },
  }),
}),
```

---

## 8. 개발 워크플로우

### 8.1 로컬 실행
```bash
cd api
npm install
npm run start:dev
# http://localhost:3001
```

### 8.2 API 테스트
```bash
# 목록 조회
curl http://localhost:3001/api/weekly/list

# 상세 조회
curl http://localhost:3001/api/weekly/detail/40

# 팝업 데이터
curl http://localhost:3001/api/weekly/popup/modon/40

# 차트 데이터
curl http://localhost:3001/api/weekly/chart/sowChart
```

---

## 9. 에러 처리

### 9.1 공통 응답 형식
**성공**:
```json
{
  "success": true,
  "data": { /* ... */ }
}
```

**실패**:
```json
{
  "success": false,
  "message": "Error message",
  "error": "ERROR_CODE"
}
```

### 9.2 Exception Filter (예정)
```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    response.status(status).json({
      success: false,
      message: exception.message,
      error: exception.name,
    });
  }
}
```

---

## 10. 다음 단계

1. **Mock API 완성**: 모든 엔드포인트 Mock 데이터 구현
2. **DB 스키마 분석**: Oracle DB 테이블 구조 파악
3. **Entity 정의**: TypeORM Entity 생성
4. **Repository 구현**: 실제 DB 쿼리 작성
5. **Mock → DB 전환**: `USE_MOCK_DATA=false`로 테스트

---

## 11. 참고 자료

- [NestJS 공식 문서](https://docs.nestjs.com)
- [TypeORM 공식 문서](https://typeorm.io)
- [Oracle Node.js Driver](https://oracle.github.io/node-oracledb/)
