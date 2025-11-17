const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fast Refresh / Hot Reload 최적화
  reactStrictMode: true,
  
  // Standalone 모드 (Docker 배포용)
  output: 'standalone',
  
  // 개발 모드 최적화
  ...(process.env.NODE_ENV === 'development' && {
    // 개발 모드에서 빠른 리로드를 위한 설정
    onDemandEntries: {
      // 페이지를 메모리에 유지하는 시간 (초)
      maxInactiveAge: 25 * 1000,
      // 동시에 유지할 페이지 수
      pagesBufferLength: 2,
    },
  }),

  // 이미지 최적화
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // 기본 Next.js 설정
  trailingSlash: false,
  compress: true,
};

// Bundle Analyzer 설정
module.exports = withBundleAnalyzer(nextConfig);
