import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Docker 배포를 위한 설정
  /* config options here */
};

export default nextConfig;
