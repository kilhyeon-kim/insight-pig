import type { NextConfig } from "next";
import { execSync } from "child_process";

// Git commit hash를 빌드 ID로 사용 - 이중화 서버 간 빌드 ID 일치 보장
const getGitCommitHash = (): string => {
  try {
    return execSync("git rev-parse HEAD").toString().trim().slice(0, 12);
  } catch {
    return `build-${Date.now()}`;
  }
};

const nextConfig: NextConfig = {
  output: 'standalone', // Docker 배포를 위한 설정

  // 이중화 서버(38/99)에서 같은 소스면 같은 빌드 ID 생성
  // RSC 캐시 불일치 방지
  generateBuildId: async () => getGitCommitHash(),
};

export default nextConfig;
