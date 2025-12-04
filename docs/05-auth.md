# 인증 및 권한 시스템

**대상**: Full-stack 개발자  
**최종 업데이트**: 2025-12-03  
**상태**: 계획 단계

---

## 1. 현재 상태

### 1.1 구현된 기능
- ✅ 로그인 페이지 UI (`/login`)
- ✅ 로그아웃 버튼 (Sidebar)

### 1.2 미구현 기능
- ⏳ JWT 기반 인증
- ⏳ 세션 관리
- ⏳ Protected Route
- ⏳ 권한 관리 (Role-based)
- ⏳ Direct Link 인증 (모바일 URL 접근)

---

## 2. 인증 방식

### 2.1 일반 로그인 (ID/Password)
사용자가 로그인 페이지에서 ID/PW를 입력하여 인증

### 2.2 Direct Link 접근 (모바일 URL)
모바일로 전송된 URL을 클릭하여 특정 보고서로 직접 접근
- URL에 토큰 또는 인증 정보 포함
- 예: `https://inspig.com/weekly/40?token=abc123`
- 토큰 검증 후 해당 보고서 표시
- 유효하지 않은 토큰은 로그인 페이지로 리다이렉트

## 3. 인증 플로우

### 3.1 일반 로그인 플로우

```
┌─────────┐
│ 로그인   │
│ 페이지   │
└────┬────┘
     │ ID/PW 입력
     ▼
┌─────────────┐
│ Backend API │
│ /api/auth/  │
│ login       │
└────┬────────┘
     │ 검증
     ▼
┌─────────────┐
│ JWT 토큰    │
│ 발급        │
└────┬────────┘
     │
     ▼
┌─────────────┐
│ Frontend    │
│ 토큰 저장   │
│ (localStorage)│
└────┬────────┘
     │
     ▼
┌─────────────┐
│ 보고서 페이지│
│ 접근        │
└─────────────┘
```

### 3.2 Direct Link 접근 플로우

```
┌─────────────┐
│ 모바일 알림 │
│ URL 클릭    │
└────┬────────┘
     │ /weekly/40?token=abc123
     ▼
┌─────────────┐
│ Frontend    │
│ 토큰 추출   │
└────┬────────┘
     │
     ▼
┌─────────────┐
│ Backend API │
│ /api/auth/  │
│ verify-token│
└────┬────────┘
     │ 검증
     ▼
  유효?  ──No──> 로그인 페이지
     │
    Yes
     │
     ▼
┌─────────────┐
│ 보고서 페이지│
│ 표시        │
└─────────────┘
```

---

## 3. Backend 구현 (NestJS)

### 3.1 Auth 모듈 구조
```
api/src/modules/auth/
├── auth.controller.ts
├── auth.service.ts
├── auth.module.ts
├── dto/
│   ├── login.dto.ts
│   └── user.dto.ts
├── guards/
│   └── jwt-auth.guard.ts
└── strategies/
    └── jwt.strategy.ts
```

### 3.2 의존성 설치
```bash
cd api
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install -D @types/passport-jwt
```

### 3.3 Auth Controller
**파일**: `src/modules/auth/auth.controller.ts`

```typescript
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() {
    return { success: true, message: 'Logged out successfully' };
  }
}
```

### 3.4 Auth Service
**파일**: `src/modules/auth/auth.service.ts`

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(loginDto: LoginDto) {
    // TODO: 실제 DB에서 사용자 검증
    const { username, password } = loginDto;

    // Mock 검증 (개발용)
    if (username === 'admin' && password === 'admin') {
      const payload = { username, sub: 1, role: 'admin' };
      const accessToken = this.jwtService.sign(payload);

      return {
        success: true,
        data: {
          accessToken,
          user: { username, role: 'admin' },
        },
      };
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  async validateUser(userId: number) {
    // TODO: DB에서 사용자 조회
    return { id: userId, username: 'admin', role: 'admin' };
  }
}
```

### 3.5 JWT Strategy
**파일**: `src/modules/auth/strategies/jwt.strategy.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username, role: payload.role };
  }
}
```

### 3.6 JWT Guard
**파일**: `src/modules/auth/guards/jwt-auth.guard.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### 3.7 Auth Module
**파일**: `src/modules/auth/auth.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

### 3.8 Protected Route 예시
```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/weekly')
export class WeeklyController {
  @Get('list')
  @UseGuards(JwtAuthGuard)  // 인증 필요
  getList() {
    return { success: true, data: [] };
  }
}
```

---

## 4. Frontend 구현 (Next.js)

### 4.1 Auth Context
**파일**: `web/src/contexts/AuthContext.tsx`

```typescript
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 페이지 로드 시 토큰 확인
    const token = localStorage.getItem('accessToken');
    if (token) {
      // TODO: 토큰 검증 API 호출
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
  }, []);

  const login = async (username: string, password: string) => {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();

    if (result.success) {
      localStorage.setItem('accessToken', result.data.accessToken);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      setUser(result.data.user);
      router.push('/weekly');
    } else {
      throw new Error('Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### 4.2 Login Page 수정
**파일**: `web/src/app/login/page.tsx`

```typescript
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch (err) {
      setError('로그인 실패: 아이디 또는 비밀번호를 확인하세요.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="space-y-6">
        {error && <div className="text-red-500">{error}</div>}
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="아이디"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
        />
        <button type="submit">로그인</button>
      </form>
    </div>
  );
}
```

### 4.3 Protected Route HOC
**파일**: `web/src/components/auth/ProtectedRoute.tsx`

```typescript
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
```

### 4.4 API 호출 시 토큰 추가
**파일**: `web/src/services/api.ts` (수정)

```typescript
async function fetchApi<T>(endpoint: string): Promise<T> {
  const token = localStorage.getItem('accessToken');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });

  if (response.status === 401) {
    // 토큰 만료 시 로그인 페이지로
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  // ... 나머지 로직
}
```

---

## 5. 환경 변수

### Backend (`api/.env`)
```env
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=1d
```

---

## 6. 구현 순서

1. **Backend**:
   - [ ] Auth 모듈 생성
   - [ ] JWT 설정
   - [ ] Login API 구현
   - [ ] JWT Guard 적용

2. **Frontend**:
   - [ ] AuthContext 생성
   - [ ] Login 페이지 수정
   - [ ] Protected Route 적용
   - [ ] API 호출 시 토큰 추가

3. **테스트**:
   - [ ] 로그인 성공/실패 테스트
   - [ ] 토큰 검증 테스트
   - [ ] Protected Route 테스트
   - [ ] 로그아웃 테스트

---

## 7. 보안 고려사항

- **JWT Secret**: 환경 변수로 관리, 프로덕션에서 강력한 키 사용
- **HTTPS**: 프로덕션에서 반드시 HTTPS 사용
- **토큰 만료**: 적절한 만료 시간 설정 (1일 권장)
- **Refresh Token**: 장기 세션을 위한 Refresh Token 구현 고려
- **비밀번호 암호화**: bcrypt 사용 (DB 저장 시)

---

## 8. 참고 자료

- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [JWT 공식 문서](https://jwt.io/)
- [Passport.js](http://www.passportjs.org/)
