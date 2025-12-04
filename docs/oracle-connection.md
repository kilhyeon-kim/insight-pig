# Oracle Database 접속 정보

**최종 업데이트**: 2025-12-03

---

## 로컬 환경

```properties
oracle.jdbc.driverClassName=net.sf.log4jdbc.sql.jdbcapi.DriverSpy
oracle.jdbc.jdbcUrl=jdbc:log4jdbc:oracle:thin:@192.168.3.244:1521:ORCLCDB
oracle.jdbc.username=pksu
oracle.jdbc.password=pksu
```

---

## 운영 환경

```properties
oracle.jdbc.driverClassName=net.sf.log4jdbc.sql.jdbcapi.DriverSpy
oracle.jdbc.jdbcUrl=jdbc:log4jdbc:oracle:thin:@192.168.3.244:1521:ORCLCDB
oracle.jdbc.username=pksu
oracle.jdbc.password=pksu
oracle.jdbc.idleTimeout=60
oracle.jdbc.maximumPoolSize=50
oracle.jdbc.minimumIdle=10
oracle.jdbc.connectionTestQuery=SELECT 1 FROM DUAL
```

---

## NestJS 환경 변수 변환

**파일**: `api/.env`

### 로컬
```env
NODE_ENV=development
USE_MOCK_DATA=false  # 실제 DB 사용

# Oracle Database
DB_DRIVER=net.sf.log4jdbc.sql.jdbcapi.DriverSpy
DB_HOST=192.168.3.244
DB_PORT=1521
DB_SID=ORCLCDB
DB_USER=pksu
DB_PASSWORD=pksu
```

### 운영
```env
NODE_ENV=production
USE_MOCK_DATA=false

# Oracle Database
DB_DRIVER=net.sf.log4jdbc.sql.jdbcapi.DriverSpy
DB_HOST=192.168.3.244
DB_PORT=1521
DB_SID=ORCLCDB
DB_USER=pksu
DB_PASSWORD=pksu

# Connection Pool 설정
DB_IDLE_TIMEOUT=60
DB_MAX_POOL_SIZE=50
DB_MIN_IDLE=10
DB_TEST_QUERY=SELECT 1 FROM DUAL
```

---

## TypeORM 설정

**파일**: `api/src/app.module.ts`

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
        sid: configService.get<string>('DB_SID'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        synchronize: false,
        logging: configService.get('NODE_ENV') === 'development',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        
        // Connection Pool 설정 (운영)
        extra: {
          connectionTimeout: configService.get<number>('DB_IDLE_TIMEOUT') || 60,
          maxPoolSize: configService.get<number>('DB_MAX_POOL_SIZE') || 50,
          minPoolSize: configService.get<number>('DB_MIN_IDLE') || 10,
        },
      }),
    }),
  ],
})
export class AppModule {}
```

---

## 주의사항

1. **보안**: `.env` 파일은 `.gitignore`에 추가하여 Git에 커밋하지 않음
2. **로컬/운영 분리**: 환경별로 다른 `.env` 파일 사용 (`.env.local`, `.env.production`)
3. **Connection Pool**: 운영 환경에서는 Pool 설정 필수
4. **Test Query**: `SELECT 1 FROM DUAL`로 연결 상태 확인
5. **SID vs Service Name**: 현재는 SID 방식 사용 (`ORCLCDB`)
