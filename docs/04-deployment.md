# Docker 배포 가이드

**대상**: DevOps, 배포 담당자  
**최종 업데이트**: 2025-12-03

---

## 1. 배포 아키텍처

```
┌─────────────────────────────────────────┐
│         Nginx (Reverse Proxy)           │
│         Port: 80, 443 (SSL)             │
└─────────────┬───────────────────────────┘
              │
      ┌───────┴────────┐
      │                │
┌─────▼─────┐    ┌────▼─────┐
│  Next.js  │    │  NestJS  │
│  Frontend │    │  Backend │
│  Port:3000│    │  Port:3001│
└───────────┘    └─────┬────┘
                       │
                 ┌─────▼─────┐
                 │  Oracle   │
                 │  Database │
                 └───────────┘
```

---

## 2. Docker 파일 구성

### 2.1 Frontend Dockerfile
**파일**: `web/Dockerfile`

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build Next.js app
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
```

### 2.2 Backend Dockerfile
**파일**: `api/Dockerfile`

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build NestJS app
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/main"]
```

### 2.3 Nginx Dockerfile
**파일**: `nginx/Dockerfile`

```dockerfile
FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
```

---

## 3. Nginx 설정

**파일**: `nginx/nginx.conf`

```nginx
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server web:3000;
    }

    upstream backend {
        server api:3001;
    }

    server {
        listen 80;
        server_name localhost;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # Backend API
        location /api {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
}
```

---

## 4. Docker Compose

**파일**: `docker-compose.yml`

```yaml
version: '3.8'

services:
  # Frontend (Next.js)
  web:
    build:
      context: ./web
      dockerfile: Dockerfile
    container_name: inspig-web
    environment:
      - NEXT_PUBLIC_API_URL=http://api:3001
      - NEXT_PUBLIC_USE_MOCK=false
    ports:
      - "3000:3000"
    depends_on:
      - api
    restart: unless-stopped

  # Backend (NestJS)
  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    container_name: inspig-api
    environment:
      - NODE_ENV=production
      - USE_MOCK_DATA=false
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_SERVICE_NAME=${DB_SERVICE_NAME}
    ports:
      - "3001:3001"
    restart: unless-stopped

  # Nginx (Reverse Proxy)
  nginx:
    build:
      context: ./nginx
      dockerfile: Dockerfile
    container_name: inspig-nginx
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - web
      - api
    restart: unless-stopped
```

---

## 5. 환경 변수 설정

**파일**: `.env` (루트 디렉토리)

```env
# Database Configuration
DB_HOST=your-oracle-host
DB_PORT=1521
DB_USER=your-username
DB_PASSWORD=your-password
DB_SERVICE_NAME=your-service-name

# Application
NODE_ENV=production
```

---

## 6. 배포 명령어

### 6.1 로컬 개발 환경
```bash
# Frontend
cd web && npm run dev

# Backend
cd api && npm run start:dev
```

### 6.2 Docker 배포
```bash
# 1. 환경 변수 설정
cp .env.example .env
# .env 파일 수정

# 2. Docker 이미지 빌드 및 실행
docker-compose up -d --build

# 3. 로그 확인
docker-compose logs -f

# 4. 특정 서비스 로그
docker-compose logs -f web
docker-compose logs -f api

# 5. 중지
docker-compose down

# 6. 완전 삭제 (볼륨 포함)
docker-compose down -v
```

### 6.3 개별 서비스 재시작
```bash
# Frontend 재시작
docker-compose restart web

# Backend 재시작
docker-compose restart api

# Nginx 재시작
docker-compose restart nginx
```

---

## 7. Next.js 설정 수정

### 7.1 Standalone 모드 활성화
**파일**: `web/next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Docker 배포를 위한 설정
  // ... 기타 설정
};

export default nextConfig;
```

---

## 8. .dockerignore 파일

### 8.1 Frontend
**파일**: `web/.dockerignore`

```
node_modules
.next
.git
.env.local
*.log
```

### 8.2 Backend
**파일**: `api/.dockerignore`

```
node_modules
dist
.git
.env
*.log
```

---

## 9. 프로덕션 배포 (클라우드)

### 9.1 Docker Hub에 이미지 푸시
```bash
# 로그인
docker login

# 이미지 태그
docker tag inspig-web:latest your-registry/inspig-web:latest
docker tag inspig-api:latest your-registry/inspig-api:latest

# 푸시
docker push your-registry/inspig-web:latest
docker push your-registry/inspig-api:latest
```

### 9.2 서버에서 Pull & Run
```bash
# 이미지 Pull
docker pull your-registry/inspig-web:latest
docker pull your-registry/inspig-api:latest

# 실행
docker-compose up -d
```

---

## 10. SSL 인증서 (HTTPS)

### 10.1 Let's Encrypt 사용
```bash
# Certbot 설치
sudo apt-get install certbot python3-certbot-nginx

# 인증서 발급
sudo certbot --nginx -d yourdomain.com
```

### 10.2 Nginx 설정 업데이트
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # ... 기존 설정
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 11. 모니터링 (선택사항)

### 11.1 Portainer 추가
**docker-compose.yml에 추가**:

```yaml
  portainer:
    image: portainer/portainer-ce
    container_name: inspig-portainer
    ports:
      - "9000:9000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer-data:/data
    restart: unless-stopped

volumes:
  portainer-data:
```

접속: `http://localhost:9000`

---

## 12. 배포 체크리스트

- [ ] `.env` 파일 설정 (DB 접속 정보)
- [ ] `next.config.ts`에 `output: 'standalone'` 추가
- [ ] Dockerfile 생성 (web, api, nginx)
- [ ] `docker-compose.yml` 생성
- [ ] `.dockerignore` 파일 생성
- [ ] Docker 이미지 빌드 테스트
- [ ] 로컬에서 Docker Compose 실행 테스트
- [ ] 환경 변수 검증
- [ ] 프로덕션 서버 배포
- [ ] SSL 인증서 설정 (HTTPS)
- [ ] 방화벽 설정 (80, 443 포트)

---

## 13. 트러블슈팅

### 13.1 포트 충돌
```bash
# 사용 중인 포트 확인
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# 프로세스 종료 (Windows)
taskkill /PID <PID> /F
```

### 13.2 Docker 빌드 실패
```bash
# 캐시 없이 빌드
docker-compose build --no-cache

# 로그 확인
docker-compose logs
```

### 13.3 컨테이너 접속
```bash
# 컨테이너 내부 접속
docker exec -it inspig-web sh
docker exec -it inspig-api sh
```

---

## 14. 참고 사항

- **포트**: 80, 443, 3000, 3001 포트가 사용 중이 아닌지 확인
- **방화벽**: 클라우드 환경에서는 보안 그룹/방화벽 설정 필요
- **메모리**: Next.js 빌드 시 최소 2GB RAM 권장
- **Oracle DB**: 외부 DB 사용 시 네트워크 연결 확인
- **환경 변수**: `.env` 파일은 Git에 커밋하지 않음 (`.gitignore` 추가)
