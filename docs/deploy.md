---
description: 이중화 서버(38, 99)에 소스 전송 및 Docker 빌드 통합 배포
---

이 워크플로우는 로컬 소스를 두 대의 운영 서버에 배포하고 Docker 컨테이너를 재빌드합니다.

// turbo-all
1. **운영 서버 #1 (10.4.38.10) 배포**
   - 소스 동기화 및 Docker 빌드 실행
   ```powershell
   ssh -i "E:/ssh key/sshkey/aws/ProdPigplanKey.pem" pigplan@10.4.38.10 "cd /data/insightPig && docker-compose up -d --build"
   ```

2. **운영 서버 #2 (10.4.99.10) 배포**
   - 소스 동기화 및 Docker 빌드 실행
   ```powershell
   ssh -i "E:/ssh key/sshkey/aws/ProdPigplanKey.pem" pigplan@10.4.99.10 "cd /data/insightPig && docker-compose up -d --build"
   ```

3. **배포 상태 확인**
   - 각 서버의 컨테이너 구동 상태 확인
   ```powershell
   ssh -i "E:/ssh key/sshkey/aws/ProdPigplanKey.pem" pigplan@10.4.38.10 "docker-compose ps"
   ssh -i "E:/ssh key/sshkey/aws/ProdPigplanKey.pem" pigplan@10.4.99.10 "docker-compose ps"
   ```
