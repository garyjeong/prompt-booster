const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack 설정 (최신 Next.js 15 방식)
  turbopack: {
    // Turbopack 전용 설정 (필요시 추가)
  },

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

  // 이미지 최적화 (Turbopack 호환)
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // 기본 Next.js 설정
  trailingSlash: false,
  compress: true,
  
  // 번들 분석기는 프로덕션 빌드에서만 사용 (Webpack 모드)
  ...(process.env.ANALYZE === 'true' && {
    // Bundle analyzer는 Webpack 모드에서만 동작
  }),
};

// 개발 모드에서 Turbopack 사용 시 Bundle Analyzer 비활성화
const isDev = process.env.NODE_ENV === 'development';
const useTurbopack = process.argv.includes('--turbopack');

if (isDev && useTurbopack) {
  // Turbopack 모드에서는 Bundle Analyzer 제외
  module.exports = nextConfig;
} else {
  // 프로덕션 빌드나 Webpack 모드에서는 Bundle Analyzer 포함
  module.exports = withBundleAnalyzer(nextConfig);
}