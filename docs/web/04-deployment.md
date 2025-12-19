# 배포 및 운영 가이드 (Docker 기반)

**대상**: DevOps, 배포 담당자  
**최종 업데이트**: 2025-12-19  
**주요 내용**: Docker Compose를 이용한 이중화 환경 배포 및 운영 가이드

---

## 1. 운영 환경 분석 (Production Environment)

현재 운영 서버는 고가용성을 위해 **이중화(Dual Server)**로 구성되어 있으며, 기존 레거시 서비스와 공존하는 환경입니다.

### 1.1 서버 구성
| 서버 구분 | IP 주소 | 역할 | OS |
| :--- | :--- | :--- | :--- |
| **운영 서버 #1** | 10.4.38.10 | Web/API 서비스 (Active) | CentOS 7 |
| **운영 서버 #2** | 10.4.99.10 | Web/API 서비스 (Active/Active) | CentOS 7 |

### 1.2 기존 서비스 현황 (Port Inventory)
새로운 서비스 배포 시 아래 기존 포트와의 충돌에 주의해야 합니다.
*   **8080 (TCP6)**: Tomcat (Java) 서비스 구동 중
*   **5000 (TCP)**: uWSGI (Python) 서비스 구동 중
*   **8002 (HTTP)**: **신규 서비스용 포트 (Nginx)** - ALB와 연결됨
*   **3000, 3001**: Docker 내부 서비스용 (외부 노출 불필요)

### 1.3 리소스 현황
*   **Memory**: 총 7.5GB (가용 메모리 약 4.2GB)
*   **Disk**: `/data` 파티션 활용 (권장 경로: `/data/insightPig`)

---

## 2. 배포 아키텍처

```
┌─────────────────────────────────────────┐
│       AWS Application Load Balancer     │
│         Domain: ins.pigplan.io          │
│         (Port 80/443 -> 8002)           │
└─────────────┬───────────────────────────┘
              │
      ┌───────┴────────┐
      │  Docker Engine │
      ├────────────────┤
      │ - Web (Next.js)│ (Internal: 3000)
      │ - API (NestJS) │ (Internal: 3001)
      │ - Nginx        │ (External: 8002)
      └───────┬────────┘
              │
      ┌───────▼───────────────┐
      │        Oracle Database        │
      │  - Data Processing (Job)      │
      │  - Data Storage               │
      └───────────────────────────────┘
```

---

## 3. 서버 설정 및 배포 절차

### 3.1 Docker 환경 구축 (최초 1회, 양쪽 서버 공통)
CentOS 7의 라이브러리 제약을 극복하기 위해 Docker를 사용합니다.
```bash
# 1. Docker 엔진 설치
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io
sudo systemctl start docker
sudo systemctl enable docker

# 2. 권한 설정 (pigplan 계정)
sudo usermod -aG docker pigplan
# 즉시 적용을 위해 소켓 권한 변경
sudo chmod 666 /var/run/docker.sock

# 3. Docker Compose 설치 (v2.24.5)
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3.2 소스 코드 배포 (SFTP)
VS Code의 SFTP 확장을 사용하여 이중화 서버에 동시 배포합니다.
*   **설정 파일**: `.vscode/sftp.json`
*   **대상 경로**: `/data/insightPig`
*   **방법**: `Ctrl + Shift + P` -> `SFTP: Upload Project` 실행 (38번, 99번 서버 각각 수행)

### 3.3 환경 변수 설정 (`.env`)
각 서버의 `/data/insightPig/.env` 파일에 실제 DB 접속 정보를 설정합니다.
```env
DB_HOST=10.x.x.x
DB_PORT=1521
DB_USER=username
DB_PASSWORD=password
DB_SERVICE_NAME=xe
```

### 3.4 서비스 실행
```bash
cd /data/insightPig
# 컨테이너 빌드 및 백그라운드 실행
docker-compose up -d --build
```

---

## 4. 데이터 처리 및 모니터링

### 4.1 Oracle Job 운영 (현재 방식)
데이터 수집 및 가공은 현재 Oracle 내부 스케줄러를 통해 수행됩니다.
*   **JOB 명칭**: `JOB_INS_WEEKLY_REPORT`
*   **실행 주기**: 매주 월요일 02:00 (KST)
*   **프로시저**: `SP_INS_WEEK_MAIN` 호출

### 4.2 모니터링 및 유지보수
*   **로그 확인**: `docker-compose logs -f`
*   **상태 확인**: `docker-compose ps`
*   **서비스 재시작**: `docker-compose restart`
*   **완전 삭제 후 재시작**: `docker-compose down && docker-compose up -d --build`

---

## 5. [차후 과제] Python ETL 전환 계획

향후 데이터 처리의 유연성을 위해 Oracle Job을 파이썬 스크립트로 전환할 예정입니다.
*   **실행 환경**: 기존 파이썬 서비스 서버(CentOS 7) 내 독립 가상환경(`venv`)
*   **주요 라이브러리**: `python-oracledb` (Thin mode), `pandas`
*   **배포 방식**: `etl/` 폴더 내 스크립트 배치 및 `crontab` 등록

---

## 6. 주의 사항 및 팁

1.  **이중화 동기화**: 소스 코드 수정 시 반드시 두 서버(38, 99) 모두에 업로드 및 재빌드를 수행해야 합니다.
2.  **AWS 설정**: AWS 보안 그룹에서 **8002 포트**가 인바운드 허용되어야 하며, ALB 리스너 규칙에 `ins.pigplan.io`가 등록되어야 합니다. (상세 내용은 `docs/aws.md` 참조)
3.  **접속 주소**: `http://ins.pigplan.io` (ALB 연동으로 포트 번호 생략 가능)
4.  **권한 문제**: `docker-compose` 실행 시 권한 에러가 발생하면 `sudo chmod 666 /var/run/docker.sock`을 다시 실행하십시오.
