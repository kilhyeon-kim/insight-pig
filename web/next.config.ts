import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Docker 배포를 위한 설정
  /* config options here */
  // rewrites 제거 - 운영에서는 Nginx가 /api 라우팅 처리
  // 로컬 개발 시에는 api 서버를 직접 호출하거나 Nginx 사용
};

export default nextConfig;
